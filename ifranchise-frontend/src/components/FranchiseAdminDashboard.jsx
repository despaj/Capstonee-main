
//apply here the whole dashboard logic and content
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from "html2canvas";
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
  Activity, TrendingDown, Target, ShoppingCart, Brain, Zap, Printer,
  ArrowUp, ArrowDown, LineChart, ShieldCheck
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
const fmtAmt   = (n) => "₱" + Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtShort = (n) => { if (n >= 1_000_000) return "₱" + (n / 1_000_000).toFixed(1) + "M"; if (n >= 1_000) return "₱" + (n / 1_000).toFixed(0) + "k"; return "₱" + Number(n).toFixed(0); };
const fmtPeso1 = (n) => "₱" + Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmt8     = (d) => d.toISOString().slice(0, 10);


const fmtAmt_d   = (n) => "\u20B1" + Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtShort_d = (n) => { if (n >= 1_000_000) return "\u20B1" + (n / 1_000_000).toFixed(1) + "M"; if (n >= 1_000) return "\u20B1" + (n / 1_000).toFixed(0) + "k"; return "\u20B1" + Number(n).toFixed(0); };function PanelCard({ children, style: s }) {
  return (
    <div style={{
      background:"#fff", border:`1px solid ${C.border}`, borderRadius:20,
      overflow:"hidden", boxShadow:"0 2px 10px rgba(50,109,32,0.05)",
      transition:"box-shadow .25s ease, transform .25s ease",
      ...s,
    }}>
      {children}
    </div>
  );
}function CardHeader({ icon: Icon, title, sub, gradient, action }) {
  if (gradient) {
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
  return (
    <div style={{
      padding:"16px 20px", display:"flex", justifyContent:"space-between",
      alignItems:"center", borderBottom:`1px solid ${C.border}`, background:"#fff",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{
          width:34, height:34, borderRadius:10, background:C.ink,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <Icon size={16} color={C.lime} />
        </div>
        <div>
          <div style={{ fontFamily:FONT, fontWeight:800, fontSize:14, color:C.ink, letterSpacing:"-0.01em" }}>{title}</div>
          {sub && <div style={{ fontSize:10.5, color:C.muted, marginTop:1 }}>{sub}</div>}
        </div>
      </div>
      {action}
    </div>
  );
}function ChartLabel({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 800, color: "#5a7a65", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10, display: "flex", alignItems: "center", gap: 5, fontFamily: FONT }}>
      {children}
    </div>
  );
}function BulletItem({ text, color = "#00897b", size = "normal" }) {
  const fs = size === "small" ? 11 : 12.5;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0, marginTop: fs === 11 ? 4 : 5 }} />
      <span style={{ fontSize: fs, color: "#0d2b1e", lineHeight: 1.6, fontFamily: FONT }}>{text}</span>
    </div>
  );
}function SparkBar({ values = [], color = "#00c853", height = 30 }) {
  if (!values.length) return null;
  const maxV = Math.max(...values, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height }}>
      {values.map((v, i) => (
        <div key={i} style={{ flex: 1, background: color, opacity: 0.4 + 0.6 * (i / values.length), borderRadius: 2, height: `${Math.max(4, (v / maxV) * height)}px` }} />
      ))}
    </div>
  );
}function ComboChart({ barData = [], lineData = [], labels = [], height = 200 }) {
  const [tip, setTip] = useState(null);
  const ref = useRef(null);
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
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({ y: PT + pH * (1 - t), label: fmtShort(t * maxBar) }));

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
            <linearGradient key={si} id={`cbg${si}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PAL[si]} stopOpacity="0.92" />
              <stop offset="100%" stopColor={PAL[si]} stopOpacity="0.55" />
            </linearGradient>
          ))}
          <linearGradient id="clgLine" x1="0" y1="0" x2="1" y2="0">
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
                fill={`url(#cbg${si})`} opacity={tip?.i === i ? 1 : 0.82} />
            );
          });
        })}
        {labels.map((lbl, i) => (
          <text key={i} x={PL + (i / Math.max(n - 1, 1)) * pW} y={H - 4} textAnchor="middle" fontSize="10" fill="#6b9070" fontFamily={FONT}>{lbl}</text>
        ))}
        {linePath && <path d={linePath} fill="none" stroke="url(#clgLine)" strokeWidth="2.5" strokeLinecap="round" />}
        {linepts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={tip?.i === i ? 5 : 3} fill="#1d4ed8" stroke="#fff" strokeWidth="2" />
        ))}
        {tip && <line x1={tip.x} y1={PT} x2={tip.x} y2={PT + pH} stroke="#00c853" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />}
      </svg>
      {tip && (
        <div style={{ position: "absolute", bottom: 36, left: `${(tip.x / W) * 100}%`, transform: "translateX(-50%)", background: "#0d2b1e", color: "#fff", borderRadius: 10, padding: "8px 12px", pointerEvents: "none", whiteSpace: "nowrap", fontSize: 11, fontFamily: FONT, boxShadow: "0 4px 16px rgba(0,0,0,0.22)", zIndex: 10 }}>
          <div style={{ fontWeight: 800, marginBottom: 3, color: "#a7f3d0" }}>{tip.label}</div>
          {barSeries.map((s, si) => <div key={si} style={{ color: PAL[si] }}>{fmtShort(s[tip.i] || 0)}</div>)}
          {lineData?.[tip.i] != null && <div style={{ color: "#93c5fd" }}>GP%: {lineData[tip.i].toFixed(1)}%</div>}
        </div>
      )}
    </div>
  );
}function HBarChart({ data = [] }) {
  const maxV = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map((d, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0d2b1e", fontFamily: FONT }}>{d.label}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: PAL[i % PAL.length], fontFamily: FONT }}>{fmtShort(d.value)}</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: "#f0fdf5", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 4, background: `linear-gradient(90deg,${PAL[i % PAL.length]},${PAL[(i + 2) % PAL.length]})`, width: `${(d.value / maxV) * 100}%`, transition: "width .6s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}function DonutChartSVG({ segments = [], size = 140, innerRadius = 0.6, centerLabel = "", centerSub = "", showLegend = true }) {
  const [hover, setHover] = useState(null);
  const R = size / 2, cx = R, cy = R;
  const outerR = R - 4, innerR = outerR * innerRadius;
  const total  = segments.reduce((s, d) => s + (d.value || 0), 0) || 1;
let cum = 0;
  const slices = segments.map((seg, i) => {
    let pct = (seg.value || 0) / total;
    const sa  = cum * 2 * Math.PI - Math.PI / 2;
    cum += pct;
    let ea  = cum * 2 * Math.PI - Math.PI / 2;

   
    if (pct >= 0.9999) ea -= 0.0001;

    const x1  = cx + outerR * Math.cos(sa), y1 = cy + outerR * Math.sin(sa);
    const x2  = cx + outerR * Math.cos(ea), y2 = cy + outerR * Math.sin(ea);
    const ix1 = cx + innerR * Math.cos(ea), iy1 = cy + innerR * Math.sin(ea);
    const ix2 = cx + innerR * Math.cos(sa), iy2 = cy + innerR * Math.sin(sa);
    const large = (ea - sa) > Math.PI ? 1 : 0;
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
    { id: 'inventory',      label: 'Product Catalogue',        icon: <Box size={20} />,         section: 'main' },
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
          {activeModule === 'dashboard'      && <FADashboardContent transactions={transactions} brands={brands} user={user} />}
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
  function SalesTrendSection({
    values, labels, kpiData, total, avg, peak, low, peakLabel, pctChange, trending,
    getRangeLabel, filterLabel, filterBrand, filterBranch, brands = [],
    transactionCount = 0, averageTransaction = 0, branchPerformance = [], brandPerformance = [],
    branchProfitability = [],
  }) {
    const panelRef = useRef(null);
    const [pdfBusy, setPdfBusy] = useState(false);

    const isFiltered = !!(filterBrand || filterBranch);

  const selectedBrandObj = useMemo(
      () => brands.find(b => String(b.id) === String(filterBrand)),
      [brands, filterBrand]
    );

    const catData = useMemo(() => {
      return Array.isArray(kpiData?.categoryBreakdown) ? kpiData.categoryBreakdown : [];
    }, [kpiData]);

    const brandBreakdownData = useMemo(() => {
      if (Array.isArray(kpiData?.brandBreakdown) && kpiData.brandBreakdown.length) {
        return kpiData.brandBreakdown;
      }
      return brandPerformance;
    }, [kpiData, brandPerformance]);
    

    const categoryPanelData  = isFiltered ? catData : brandBreakdownData;
    const categoryPanelTitle = isFiltered ? "Sales by Category" : "Sales by Brand";
  const CategoryPanelIcon  = isFiltered ? PieChart : Globe;

    const branchData = useMemo(() => {
      if (Array.isArray(kpiData?.branchBreakdown) && kpiData.branchBreakdown.length) return kpiData.branchBreakdown.slice(0, 6);
      return branchPerformance.slice(0, 6);
    }, [kpiData, branchPerformance]);

    const branchAttentionItems = useMemo(() => {
      const rows = Array.isArray(branchProfitability)
        ? branchProfitability.filter(row => Number(row?.revenue || 0) > 0)
        : [];

      if (!rows.length) return [];

      const items = [];
      const usedBranches = new Set();

      const addItem = (row, config) => {
        if (!row?.branch || usedBranches.has(row.branch) || items.length >= 5) return;
        usedBranches.add(row.branch);
        items.push({
          branch: row.branch,
          ...config,
        });
      };

      // 1. Data quality comes first. A 100% margin caused by zero COGS should
      //    never be presented as a genuine high-margin success.
      rows
        .filter(row => Number(row.cogs || 0) <= 0)
        .sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0))
        .forEach(row => {
          addItem(row, {
            status: "DATA CHECK",
            tone: "info",
            title: "Verify cost data",
            detail: `${Number(row.margin || 0).toFixed(1)}% margin with no recorded COGS.`,
            action: "Confirm transaction cost-of-goods data before interpreting profitability.",
          });
        });

      // 2. Low-margin branches need management attention.
      rows
        .filter(row => Number(row.cogs || 0) > 0 && Number(row.margin || 0) < 25)
        .sort((a, b) => Number(a.margin || 0) - Number(b.margin || 0))
        .forEach(row => {
          addItem(row, {
            status: "MARGIN WATCH",
            tone: "warning",
            title: "Margin requires review",
            detail: `${Number(row.margin || 0).toFixed(1)}% margin on ${fmtAmt(row.revenue)} revenue.`,
            action: "Review product costs, pricing, discounts and sales mix.",
          });
        });

      // 3. High-margin branches may be good candidates for controlled growth.
      rows
        .filter(row => Number(row.cogs || 0) > 0 && Number(row.margin || 0) >= 40)
        .sort((a, b) => Number(b.margin || 0) - Number(a.margin || 0))
        .forEach(row => {
          addItem(row, {
            status: "GROWTH OPPORTUNITY",
            tone: "success",
            title: "Strong margin performance",
            detail: `${Number(row.margin || 0).toFixed(1)}% margin · ${fmtAmt(row.avgOrder)} average order.`,
            action: "Assess whether sales volume can be increased while preserving current margins.",
          });
        });

      // 4. Flag branches whose transaction volume is materially below the group.
      const avgTransactions =
        rows.reduce((sum, row) => sum + Number(row.transactions || 0), 0) /
        Math.max(rows.length, 1);

      rows
        .filter(row =>
          Number(row.transactions || 0) > 0 &&
          Number(row.transactions || 0) < Math.max(2, avgTransactions * 0.5)
        )
        .sort((a, b) => Number(a.transactions || 0) - Number(b.transactions || 0))
        .forEach(row => {
          addItem(row, {
            status: "LOW VOLUME",
            tone: "neutral",
            title: "Low transaction activity",
            detail: `${Number(row.transactions || 0).toLocaleString()} transaction${Number(row.transactions || 0) === 1 ? "" : "s"} · ${fmtAmt(row.avgOrder)} average order.`,
            action: "Review traffic, local demand and branch-level selling activity.",
          });
        });

      // 5. If space remains, surface one stable branch as a positive benchmark.
      rows
        .filter(row =>
          Number(row.cogs || 0) > 0 &&
          Number(row.margin || 0) >= 25 &&
          Number(row.margin || 0) < 40
        )
        .sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0))
        .forEach(row => {
          addItem(row, {
            status: "STABLE",
            tone: "healthy",
            title: "Healthy operating range",
            detail: `${Number(row.margin || 0).toFixed(1)}% margin · ${fmtAmt(row.revenue)} revenue.`,
            action: "Maintain performance and monitor for changes in cost or transaction volume.",
          });
        });

      return items.slice(0, 5);
    }, [branchProfitability]);

    const hasData = total > 0;
    const grossProfit = kpiData?.salesProfit ?? null;
    const txCount     = kpiData?.txCount ?? transactionCount ?? 0;
    const avgOrder    = kpiData?.avgOrder ?? averageTransaction ?? 0;

    const analysisBullets = useMemo(() => {
      if (!hasData) return [];
      const bullets = [];
      bullets.push(`Total revenue for ${getRangeLabel()} is ${fmtAmt(kpiData?.totalSales ?? total)} across ${filterLabel}.`);
      if (grossProfit != null) bullets.push(`Recorded gross profit is ${fmtAmt(grossProfit)}, a ${Math.round((grossProfit / Math.max((kpiData?.totalSales ?? total), 1)) * 100)}% margin.`);
      bullets.push(`${txCount.toLocaleString()} transactions processed with an average order of ${fmtAmt(avgOrder)}.`);
      bullets.push(`Revenue is ${trending ? "trending upward" : "trending downward"} at ${trending ? "+" : ""}${pctChange}% from start to end of period.`);
      bullets.push(`Peak revenue of ${fmtAmt(peak)} was recorded on ${peakLabel}, outperforming the period average by ${fmtAmt(peak - avg)}.`);
      if (low < avg * 0.5) bullets.push(`Lowest period at ${fmtAmt(low)} — significantly below average, consider investigating that interval.`);
      if (categoryPanelData.length) {
        const top = categoryPanelData[0];
        bullets.push(`${top.label} is the top-performing ${isFiltered ? "category" : "brand"} at ${fmtShort(top.value)} (${Math.round((top.value / total) * 100)}% of revenue).`);
      }
      if (branchData.length) {
        const topBranch = branchData[0];
        bullets.push(`${topBranch.label} leads branch revenue at ${fmtShort(topBranch.value)}.`);
      }
      return bullets;
    }, [hasData, total, grossProfit, txCount, avgOrder, trending, pctChange, peak, peakLabel, avg, low, categoryPanelData, branchData, kpiData, getRangeLabel, filterLabel, isFiltered]);

    // ── Print ──
    const handlePrint = () => {
      if (!panelRef.current) return;
      const printContents = panelRef.current.innerHTML;
      const win = window.open("", "_blank");
      if (!win) { alert("Please allow pop-ups to print this report."); return; }
      win.document.write(`
        <html>
          <head>
            <title>Sales_Trend_Analysis_${filterLabel.replace(/\s+/g, "_")}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
              * { box-sizing: border-box; font-family: 'Montserrat', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              html, body { margin: 0; background: #ffffff !important; }
              @media print { @page { margin: 14mm; } button { display: none !important; } }
            </style>
          </head>
          <body>${printContents}</body>
        </html>
      `);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); win.close(); }, 400);
    };

    // ── Download PDF ──
    const handleDownloadPDF = async () => {
      if (!panelRef.current) return;
      setPdfBusy(true);
      try {
        const margin = 30;
        const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
        const pageWidth    = pdf.internal.pageSize.getWidth();
        const pageHeight   = pdf.internal.pageSize.getHeight();
        const contentWidth = pageWidth - margin * 2;

        const canvas = await html2canvas(panelRef.current, {
          scale: 2, backgroundColor: "#ffffff", useCORS: true, windowWidth: panelRef.current.scrollWidth,
        });
        const imgData      = canvas.toDataURL("image/png");
        const imgHeight     = (canvas.height * contentWidth) / canvas.width;
        const pageContentH  = pageHeight - margin * 2 - 20;
        const totalPages    = Math.max(1, Math.ceil(imgHeight / pageContentH));

        for (let page = 0; page < totalPages; page++) {
          if (page > 0) pdf.addPage();
          const yOffset = margin - page * pageContentH;
          pdf.addImage(imgData, "PNG", margin, yOffset, contentWidth, imgHeight, undefined, "FAST");
          pdf.setDrawColor(224, 242, 241);
          pdf.line(margin, pageHeight - 26, pageWidth - margin, pageHeight - 26);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
          pdf.setTextColor(148, 163, 184);
          pdf.text(`Page ${page + 1} of ${totalPages}`, pageWidth - margin, pageHeight - 14, { align: "right" });
        }
        pdf.save(`Sales_Trend_Analysis_${filterLabel.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
      } catch (err) {
        console.error("PDF export failed:", err);
        alert("Could not generate PDF. Please try again.");
      } finally {
        setPdfBusy(false);
      }
    };

    return (
      <PanelCard style={{ marginBottom: 22 }}>
        <CardHeader
          icon={TrendingUp} title="Sales Trend Analysis" sub={`${getRangeLabel()} · ${filterLabel}`}
          action={
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handlePrint}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 9, border: "1.5px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.14)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
                <Printer size={13} /> Print
              </button>
              <button onClick={handleDownloadPDF} disabled={pdfBusy}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 9, border: "1.5px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.14)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: pdfBusy ? "not-allowed" : "pointer", fontFamily: FONT, opacity: pdfBusy ? 0.7 : 1 }}>
                <Download size={13} style={{ animation: pdfBusy ? "spin 0.8s linear infinite" : "none" }} />
                {pdfBusy ? "Preparing…" : "Download PDF"}
              </button>
            </div>
          }
        />
        <div ref={panelRef} style={{ padding: "18px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18, marginBottom: 14, alignItems: "stretch" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <ChartLabel><LineChart size={11} color="#00897b" /> Sales revenue over time · {getRangeLabel()}</ChartLabel>
              {hasData ? (
                <>
                  <DashboardLineGraph labels={labels} values={values} height={280} />
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, marginBottom: 14 }}>
                    <svg width={24} height={10}><line x1="0" y1="5" x2="24" y2="5" stroke="#3b791e" strokeWidth="3" /><circle cx="12" cy="5" r="3" fill="#fff" stroke="#3b791e" strokeWidth="2" /></svg>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: "#5a7a65", fontFamily: FONT }}>Actual sales revenue</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                    {[
                      { label: "Total Revenue", text: `Total revenue for ${getRangeLabel()} is ${fmtAmt(kpiData?.totalSales ?? total)} across ${filterLabel}.`, icon: TrendingUp, color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
                      ...(grossProfit != null ? [{ label: "Gross Profit", text: `Recorded gross profit is ${fmtAmt(grossProfit)}, a ${Math.round((grossProfit / Math.max((kpiData?.totalSales ?? total), 1)) * 100)}% margin.`, icon: BarChart2, color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" }] : []),
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
                  <div style={{ fontWeight: 700, fontSize: 13, marginTop: 8, color: "#5a7a65", fontFamily: FONT, textAlign: "center", padding: "0 20px" }}>
                    No data found for {getRangeLabel()}
                  </div>
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
                      { label: "Peak",    value: fmtAmt(peak),                        sub: `on ${peakLabel}`,            color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
                      { label: "Low",     value: fmtAmt(low),                         sub: "Period min",                 color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
                      { label: "Average", value: fmtAmt(avg),                         sub: `${labels.length} pts`,       color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
                      { label: "Trend",   value: `${trending?"+":""}${pctChange}%`,   sub: trending?"Upward":"Downward", color: trending?"#059669":"#dc2626", bg: trending?"#ecfdf5":"#fef2f2", border: trending?"#a7f3d0":"#fecaca" },
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

          {/* Period Summary column removed — 2-column spaced layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "#f8fffe", border: "1px solid #e0f2f1", borderRadius: 14, padding: "18px 20px" }}>
            <ChartLabel><CategoryPanelIcon size={11} color="#00897b" /> {categoryPanelTitle}</ChartLabel>
              {categoryPanelData.length > 0
                ? <DonutChartSVG segments={categoryPanelData.map((d, i) => ({ label: d.label, value: d.value, color: PAL[i % PAL.length] }))} size={150} centerLabel={hasData ? fmtShort(total) : "—"} centerSub="total" />
                : <div style={{ height: 130, display: "flex", alignItems: "center", justifyContent: "center", color: "#b2dfdb", fontFamily: FONT, fontSize: 12 }}>No data</div>
              }
            </div>
            <div style={{
              background: "#f8fffe",
              border: "1px solid #e0f2f1",
              borderRadius: 14,
              padding: "18px 20px"
            }}>
              <ChartLabel>
                <Target size={11} color="#00897b" />
                Branch Attention & Opportunities
              </ChartLabel>

              <div style={{
                fontSize: 10.5,
                color: "#789086",
                lineHeight: 1.5,
                marginTop: -3,
                marginBottom: 12,
                fontFamily: FONT
              }}>
                Priority observations from branch profitability and transaction data
              </div>

              {branchAttentionItems.length > 0 ? (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8
                }}>
                  {branchAttentionItems.map((item, index) => {
                    const tone = {
                      info: {
                        bg: "#eff6ff",
                        border: "#bfdbfe",
                        accent: "#2563eb",
                        badgeBg: "#dbeafe",
                        badgeText: "#1e40af",
                      },
                      warning: {
                        bg: "#fffbeb",
                        border: "#fde68a",
                        accent: "#d97706",
                        badgeBg: "#fef3c7",
                        badgeText: "#92400e",
                      },
                      success: {
                        bg: "#ecfdf5",
                        border: "#a7f3d0",
                        accent: "#059669",
                        badgeBg: "#d1fae5",
                        badgeText: "#047857",
                      },
                      neutral: {
                        bg: "#f8fafc",
                        border: "#e2e8f0",
                        accent: "#64748b",
                        badgeBg: "#f1f5f9",
                        badgeText: "#475569",
                      },
                      healthy: {
                        bg: "#f0f5e8",
                        border: "#c9dba0",
                        accent: "#3b791e",
                        badgeBg: "#e8f0dd",
                        badgeText: "#2c5c16",
                      },
                    }[item.tone] || {
                      bg: "#f8fafc",
                      border: "#e2e8f0",
                      accent: "#64748b",
                      badgeBg: "#f1f5f9",
                      badgeText: "#475569",
                    };

                    return (
                      <div
                        key={`${item.branch}-${index}`}
                        style={{
                          background: tone.bg,
                          border: `1px solid ${tone.border}`,
                          borderLeft: `3px solid ${tone.accent}`,
                          borderRadius: 10,
                          padding: "9px 10px"
                        }}
                      >
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                          marginBottom: 5
                        }}>
                          <div style={{
                            fontSize: 11.5,
                            fontWeight: 800,
                            color: "#102a1c",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontFamily: FONT
                          }}>
                            {item.branch}
                          </div>

                          <span style={{
                            flexShrink: 0,
                            fontSize: 8.5,
                            fontWeight: 800,
                            letterSpacing: ".05em",
                            textTransform: "uppercase",
                            padding: "2px 6px",
                            borderRadius: 20,
                            background: tone.badgeBg,
                            color: tone.badgeText,
                            fontFamily: FONT
                          }}>
                            {item.status}
                          </span>
                        </div>

                        <div style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: "#334155",
                          lineHeight: 1.45,
                          fontFamily: FONT
                        }}>
                          {item.title}
                        </div>

                        <div style={{
                          fontSize: 10,
                          color: "#64748b",
                          lineHeight: 1.5,
                          marginTop: 2,
                          fontFamily: FONT
                        }}>
                          {item.detail}
                        </div>

                        <div style={{
                          fontSize: 9.7,
                          fontWeight: 700,
                          color: tone.accent,
                          lineHeight: 1.45,
                          marginTop: 4,
                          fontFamily: FONT
                        }}>
                          {item.action}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  height: 130,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  fontFamily: FONT,
                  fontSize: 11.5,
                  textAlign: "center",
                  lineHeight: 1.6,
                  padding: 16
                }}>
                  No branch profitability observations are available for this filter.
                </div>
              )}
            </div>
          </div>
        </div>
      </PanelCard>
    );
  }

  function PrescriptiveSection({ transactions, filterLabel, preset, total, values, labels = [], kpiData, showStockAnomalies = true }) {
    const [analysis, setAnalysis] = useState(null);
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState(null);
    const [lastRun,  setLastRun]  = useState(null);
    const [pdfBusy,  setPdfBusy]  = useState(false);

    const exportRef = useRef(null); // offscreen report layout used for Print + PDF

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

    const projRev = analysis?.projectedRevenue ?? null;
    const projChg = analysis?.projectedChange ?? null;
    const peakDay = analysis?.peakDay ?? null;
    const slowDay = analysis?.slowestDay ?? null;
    const conf = analysis?.confidence ?? null;

    // Prescriptive anomaly groups.
    // "ghost_sales" is the backend's existing anomalyType for a branch that
    // recorded sales while one or more inventory items are already at zero stock.
    const ghostStockAnomalies = useMemo(() => {
      const rows = Array.isArray(analysis?.stockAnomalies)
        ? analysis.stockAnomalies
        : [];

      return rows.filter((a) => {
        const type = String(a?.anomalyType ?? a?.type ?? "").toLowerCase();
        return type === "ghost_sales" || type === "ghost_stock";
      });
    }, [analysis]);

    // Preserve the other anomaly types instead of removing existing functionality.
    const otherStockAnomalies = useMemo(() => {
      const rows = Array.isArray(analysis?.stockAnomalies)
        ? analysis.stockAnomalies
        : [];

      return rows.filter((a) => {
        const type = String(a?.anomalyType ?? a?.type ?? "").toLowerCase();
        return type !== "ghost_sales" && type !== "ghost_stock";
      });
    }, [analysis]);

    const typeStyle = (type) => ({
      success: { borderColor: "#059669", bg: "#ecfdf5", color: "#065f46", badgeBg: "#d1fae5", dot: "#059669" },
      warning: { borderColor: "#d97706", bg: "#fffbeb", color: "#92400e", badgeBg: "#fef3c7", dot: "#f59e0b" },
      info:    { borderColor: "#2563eb", bg: "#eff6ff", color: "#1e40af", badgeBg: "#dbeafe", dot: "#3b82f6" },
    }[type] || { borderColor: "#6b7280", bg: "#f9fafb", color: "#374151", badgeBg: "#f3f4f6", dot: "#6b7280" });

    const preRunBullets = useMemo(() => {
      if (!total) return [];
      return [
        `${transactions?.length?.toLocaleString() ?? 0} transaction records are available to the AI service.`,
        `Recorded revenue represented by the selected dashboard series is ${fmtAmt(total)}.`,
        `The evidence charts below show the historical values supplied for analysis. AI forecasts only appear after Run AI Analysis is completed.`,
      ];
    }, [total, transactions]);

    // ── Print (opens the offscreen report layout in a new tab) ─────────────
    const handlePrint = () => {
      if (!exportRef.current) return;
      const printContents = exportRef.current.innerHTML;
      const win = window.open("", "_blank");
      if (!win) { alert("Please allow pop-ups to print this report."); return; }
    win.document.write(`
        <html>
          <head>
            <title>Prescriptive_Analysis_${filterLabel.replace(/\s+/g, "_")}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
              * { box-sizing: border-box; font-family: 'Montserrat', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              html, body { margin: 0; background: #ffffff !important; }
              @media print { @page { margin: 14mm; } button { display: none !important; } }
            </style>
          </head>
          <body>${printContents}</body>
        </html>
      `);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); win.close(); }, 400);
    };

    // ── Download as an actual PDF file (same layout as Print) ──────────────
    const handleDownloadPDF = async () => {
      if (!exportRef.current) return;
      setPdfBusy(true);
      try {
        const margin = 30; // pt
        const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
        const pageWidth    = pdf.internal.pageSize.getWidth();
        const pageHeight   = pdf.internal.pageSize.getHeight();
        const contentWidth = pageWidth - margin * 2;

        const canvas = await html2canvas(exportRef.current, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          windowWidth: exportRef.current.scrollWidth,
        });
        const imgData    = canvas.toDataURL("image/png");
        const imgHeight   = (canvas.height * contentWidth) / canvas.width;
        const pageContentH = pageHeight - margin * 2 - 20; // reserve a little for page number
        const totalPages   = Math.max(1, Math.ceil(imgHeight / pageContentH));

        for (let page = 0; page < totalPages; page++) {
          if (page > 0) pdf.addPage();
          const yOffset = margin - page * pageContentH;
          pdf.addImage(imgData, "PNG", margin, yOffset, contentWidth, imgHeight, undefined, "FAST");

          pdf.setDrawColor(224, 242, 241);
          pdf.line(margin, pageHeight - 26, pageWidth - margin, pageHeight - 26);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
          pdf.setTextColor(148, 163, 184);
          pdf.text(`Page ${page + 1} of ${totalPages}`, pageWidth - margin, pageHeight - 14, { align: "right" });
        }

        pdf.save(`Prescriptive_Analysis_${filterLabel.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
      } catch (err) {
        console.error("PDF export failed:", err);
        alert("Could not generate PDF. Please try again.");
      } finally {
        setPdfBusy(false);
      }
    };

    return (
      <PanelCard style={{ marginBottom: 22 }}>
        <CardHeader
          icon={Brain}
          title="AI Prescriptive Analysis"
          sub={`Powered by Groq · llama-3.3-70b${lastRun ? ` · Last run ${lastRun}` : ""}`}
          gradient="linear-gradient(135deg,#1e3a5f,#1d4ed8)"
          action={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={handlePrint}
                title="Print"
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 9, border: "1.5px solid rgba(255,255,255,0.3)", background: "rgba(0,200,83,0.22)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
                <Printer size={13} /> Print
              </button>
              <button onClick={handleDownloadPDF} disabled={pdfBusy}
                title="Download as PDF"
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 9, border: "1.5px solid rgba(255,255,255,0.3)", background: "rgba(0,200,83,0.22)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: pdfBusy ? "not-allowed" : "pointer", fontFamily: FONT, opacity: pdfBusy ? 0.7 : 1 }}>
                <Download size={13} style={{ animation: pdfBusy ? "spin 0.8s linear infinite" : "none" }} />
                {pdfBusy ? "Preparing…" : "Download PDF"}
              </button>
              <button onClick={runAnalysis} disabled={loading}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 9, border: "1.5px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.14)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: FONT }}>
                <Zap size={12} style={{ animation: loading ? "spin 0.8s linear infinite" : "none" }} />
                {loading ? "Analyzing…" : analysis ? "Re-run AI" : "Run AI Analysis"}
              </button>
            </div>
          }
        />

        {/* ── Live dashboard view (unchanged, compact) ── */}
        <div style={{ padding: "18px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,.8fr)", gap: 16, marginBottom: 20 }}>
            <div style={{ background: "#fff", border: "1px solid #dbeafe", borderRadius: 14, padding: "15px 16px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:8 }}>
                <div>
                  <div style={{ fontSize:12.5, fontWeight:800, color:"#1e3a5f", fontFamily:FONT }}>Historical Revenue Evidence</div>
                  <div style={{ fontSize:10.5, color:"#64748b", marginTop:2, fontFamily:FONT }}>Actual dashboard series used as evidence for the AI analysis</div>
                </div>
                <span style={{ fontSize:9.5, fontWeight:800, padding:"3px 8px", borderRadius:20, background:"#eff6ff", color:"#1d4ed8", fontFamily:FONT }}>SOURCE DATA</span>
              </div>
              <DashboardLineGraph labels={labels} values={values} height={210} />
            </div>
            <div style={{ background: "#fff", border: "1px solid #dbeafe", borderRadius: 14, padding: "15px 16px" }}>
              <div style={{ fontSize:12.5, fontWeight:800, color:"#1e3a5f", fontFamily:FONT }}>AI Output Evidence</div>
              <div style={{ fontSize:10.5, color:"#64748b", marginTop:2, marginBottom:12, fontFamily:FONT }}>Forecast fields stay empty until the AI returns them</div>
              {analysis ? (
                <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                  {[
                    ["Projected 7-Day Revenue", projRev != null ? fmtAmt(projRev) : "Not returned"],
                    ["Projected Change", projChg != null ? `${projChg >= 0 ? "+" : ""}${Number(projChg).toFixed(1)}%` : "Not returned"],
                    ["Peak Day", peakDay || "Not returned"],
                    ["Slowest Day", slowDay || "Not returned"],
                    ["Confidence", conf != null ? `${conf}%` : "Not returned"],
                  ].map(([label,value]) => <div key={label} style={{ display:"flex", justifyContent:"space-between", gap:12, padding:"9px 10px", borderRadius:9, background:"#f8fbff", border:"1px solid #e5edf8" }}><span style={{fontSize:10.5,color:"#64748b",fontWeight:700}}>{label}</span><strong style={{fontSize:11,color:"#1e3a5f",textAlign:"right"}}>{value}</strong></div>)}
                </div>
              ) : <div style={{ minHeight:180, display:"flex", alignItems:"center", justifyContent:"center", border:"1px dashed #bfdbfe", borderRadius:10, background:"#f8fbff", color:"#64748b", fontSize:11.5, textAlign:"center", padding:18 }}>Run AI Analysis to generate forecast evidence and recommendations.</div>}
            </div>
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

              {/* Ghost Stock Anomalies Across Branches — directly under AI Summary */}
              {analysis && showStockAnomalies && (
                <div style={{ background: "#fff", border: "1px solid #fecaca", borderRadius: 14, padding: "14px 15px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: ghostStockAnomalies.length > 0 ? 10 : 0, flexWrap: "wrap" }}>
                    <div style={{ width: 3, height: 14, borderRadius: 2, background: "#dc2626" }} />
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#dc2626",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontFamily: FONT
                    }}>
                      Ghost Stock Anomalies Across Branches
                    </span>

                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 20,
                      background: ghostStockAnomalies.length > 0 ? "#fee2e2" : "#f1f5f9",
                      color: ghostStockAnomalies.length > 0 ? "#991b1b" : "#64748b",
                      fontFamily: FONT
                    }}>
                      {ghostStockAnomalies.length}
                    </span>
                  </div>

                  <div style={{
                    marginBottom: 11,
                    padding: "10px 12px",
                    borderRadius: 9,
                    background: "#fff7f7",
                    border: "1px solid #fee2e2",
                    fontSize: 11.5,
                    color: "#7f1d1d",
                    lineHeight: 1.6,
                    fontFamily: FONT
                  }}>
                    <strong>What is a ghost stock anomaly?</strong>{" "}
                    A ghost stock anomaly occurs when a branch records sales while one or more related inventory items are already recorded as zero stock in the system. This means the sales record and inventory record may be out of sync and should be verified through stock reconciliation.
                  </div>

                  {ghostStockAnomalies.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {ghostStockAnomalies.map((a, i) => {
                        const severity = String(a?.severity || "critical").toLowerCase();
                        const severityColor =
                          severity === "critical"
                            ? "#dc2626"
                            : severity === "warning"
                              ? "#d97706"
                              : "#2563eb";

                        return (
                          <div
                            key={`${a?.branch || "branch"}-${i}`}
                            style={{
                              background: "linear-gradient(145deg,#fff7f7,#fef2f2)",
                              border: "1px solid #fecaca",
                              borderLeft: `4px solid ${severityColor}`,
                              borderRadius: 12,
                              padding: "13px 14px"
                            }}
                          >
                            <div style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 7,
                              marginBottom: 8,
                              flexWrap: "wrap"
                            }}>
                              <AlertTriangle size={13} color={severityColor} />

                              <span style={{
                                fontSize: 9.5,
                                fontWeight: 800,
                                padding: "2px 7px",
                                borderRadius: 20,
                                background: "#fee2e2",
                                color: "#991b1b",
                                textTransform: "uppercase",
                                fontFamily: FONT
                              }}>
                                Ghost Stock
                              </span>

                              <span style={{
                                fontSize: 12,
                                fontWeight: 800,
                                color: "#0d2b1e",
                                fontFamily: FONT
                              }}>
                                {a?.branch || "Unknown Branch"}
                              </span>

                              <span style={{
                                marginLeft: "auto",
                                fontSize: 9,
                                fontWeight: 800,
                                padding: "2px 7px",
                                borderRadius: 20,
                                background: severity === "critical" ? "#fee2e2" : severity === "warning" ? "#fef3c7" : "#dbeafe",
                                color: severity === "critical" ? "#991b1b" : severity === "warning" ? "#92400e" : "#1e40af",
                                textTransform: "uppercase",
                                fontFamily: FONT
                              }}>
                                {severity}
                              </span>
                            </div>

                            <BulletItem
                              text={a?.finding || "Sales activity was detected while related inventory is already recorded at zero stock."}
                              color={severityColor}
                              size="small"
                            />

                            <div style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 7,
                              padding: "8px 10px",
                              borderRadius: 8,
                              background: "rgba(255,255,255,0.78)",
                              border: "1px solid #fecaca",
                              marginTop: 7
                            }}>
                              <CheckCircle size={12} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                              <span style={{
                                fontSize: 11.5,
                                fontWeight: 600,
                                color: "#0d2b1e",
                                lineHeight: 1.55,
                                fontFamily: FONT
                              }}>
                                {a?.action || "Verify the branch's physical stock, reconcile recent sales against inventory movements, and correct the stock record before further replenishment decisions."}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "10px 11px",
                      borderRadius: 9,
                      background: "#f8fafc",
                      border: "1px dashed #cbd5e1"
                    }}>
                      <CheckCircle size={14} color="#059669" />
                      <span style={{
                        fontSize: 11.5,
                        color: "#64748b",
                        lineHeight: 1.55,
                        fontFamily: FONT
                      }}>
                        No ghost stock anomaly was detected in the branches included in this analysis.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Preserve non-ghost stock/sales anomalies below the ghost-stock section */}
              {analysis && showStockAnomalies && otherStockAnomalies.length > 0 && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 3, height: 14, borderRadius: 2, background: "#d97706" }} />
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#92400e",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontFamily: FONT
                    }}>
                      Other Stock vs Sales Anomalies
                    </span>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 20,
                      background: "#fef3c7",
                      color: "#92400e",
                      fontFamily: FONT
                    }}>
                      {otherStockAnomalies.length}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {otherStockAnomalies.map((a, i) => {
                      const cfg = {
                        low_stock_no_reorder: {
                          bg: "#fffbeb",
                          border: "#fde68a",
                          label: "Not Reordering",
                          labelBg: "#fef3c7",
                          labelColor: "#92400e",
                          dot: "#d97706"
                        },
                        dead_stock: {
                          bg: "#eff6ff",
                          border: "#bfdbfe",
                          label: "Dead Stock",
                          labelBg: "#dbeafe",
                          labelColor: "#1e40af",
                          dot: "#2563eb"
                        },
                      }[a?.anomalyType] || {
                        bg: "#f8fffe",
                        border: "#d1eedd",
                        label: "Anomaly",
                        labelBg: "#e0f2f1",
                        labelColor: "#00695c",
                        dot: "#00897b"
                      };

                      return (
                        <div key={i} style={{
                          background: cfg.bg,
                          border: `1px solid ${cfg.border}`,
                          borderRadius: 12,
                          padding: "13px 14px"
                        }}>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 7,
                            flexWrap: "wrap"
                          }}>
                            <span style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background: cfg.dot,
                              display: "inline-block"
                            }} />
                            <span style={{
                              fontSize: 9.5,
                              fontWeight: 800,
                              padding: "2px 7px",
                              borderRadius: 20,
                              background: cfg.labelBg,
                              color: cfg.labelColor,
                              textTransform: "uppercase",
                              fontFamily: FONT
                            }}>
                              {cfg.label}
                            </span>
                            <span style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#0d2b1e",
                              fontFamily: FONT
                            }}>
                              {a?.branch || "Unknown Branch"}
                            </span>
                          </div>

                          <BulletItem text={a?.finding} color={cfg.dot} size="small" />

                          {a?.action && (
                            <div style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 6,
                              padding: "7px 9px",
                              borderRadius: 7,
                              background: "rgba(255,255,255,0.65)",
                              border: `1px solid ${cfg.border}`,
                              marginTop: 6
                            }}>
                              <CheckCircle size={12} color={cfg.dot} style={{ flexShrink: 0, marginTop: 1 }} />
                              <span style={{
                                fontSize: 11.5,
                                fontWeight: 600,
                                color: "#0d2b1e",
                                lineHeight: 1.55,
                                fontFamily: FONT
                              }}>
                                {a.action}
                              </span>
                            </div>
                          )}
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

        {/* ── OFFSCREEN report layout — used only by Print & Download PDF ── */}
        <div style={{ position: "absolute", left: -99999, top: 0, width: 0, height: 0, overflow: "hidden" }}>
          <div ref={exportRef} style={{ width: 800, background: "#fff", padding: "44px 48px 36px", fontFamily: FONT, color: "#0d2b1e" }}>

            {/* Letterhead */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 18, marginBottom: 26, borderBottom: "4px solid #00c853" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <img src={logoIfranchise} alt="iFranchise Business Services Corp." style={{ height: 58, width: "auto" }} />
                <div style={{ width: 1, height: 44, background: "#d1eedd" }} />
                <img src={logoSync} alt="FranchiSync" style={{ height: 46, width: "auto" }} />
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#5a7a65", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  iFranchise Business Services Corp.
                </div>
                <div style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 2 }}>
                  {new Date().toLocaleString()}
                </div>
              </div>
            </div>

            {/* Title block */}
            <div style={{ marginBottom: 26 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#0d2b1e", letterSpacing: "-0.5px", lineHeight: 1.2 }}>
                AI Prescriptive Analysis Report
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#00897b", background: "#e0f2f1", padding: "4px 12px", borderRadius: 20 }}>
                  {filterLabel}
                </span>
                {lastRun && (
                  <span style={{ fontSize: 13, color: "#5a7a65", fontWeight: 600 }}>
                    AI run at {lastRun}
                  </span>
                )}
              </div>
            </div>

            {/* KPI summary grid — larger, readable */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 30 }}>
              {[
                { label: "Projected 7-Day Revenue", value: projRev ? fmtAmt(projRev) : "—", sub: projRev ? `${projChg >= 0 ? "+" : ""}${projChg.toFixed(1)}% vs prior period` : "Not yet calculated", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
                { label: "Peak Day Forecast",        value: peakDay || "—", sub: "Highest revenue day", color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
                { label: "Slowest Day Forecast",     value: slowDay || "—", sub: "Lowest revenue day", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
                { label: "Confidence Score",         value: conf ? `${conf}%` : "—", sub: conf ? (conf >= 80 ? "High confidence" : conf >= 60 ? "Medium confidence" : "Low — needs more data") : "Not yet calculated", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
              ].map((card, i) => (
                <div key={i} style={{ background: card.bg, border: `1.5px solid ${card.border}`, borderRadius: 14, padding: "18px 20px" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#5a7a65", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: card.color, lineHeight: 1.1 }}>{card.value}</div>
                  <div style={{ fontSize: 12.5, color: "#5a7a65", marginTop: 6 }}>{card.sub}</div>
                </div>
              ))}
            </div>

            {/* Executive summary */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                <div style={{ width: 5, height: 20, borderRadius: 3, background: "linear-gradient(180deg,#00c853,#00897b)" }} />
                <span style={{ fontSize: 16, fontWeight: 800, color: "#0d2b1e" }}>
                  {analysis ? "Executive Summary" : "Data Overview"}
                </span>
              </div>
              {analysis ? (
                <p style={{ fontSize: 14.5, lineHeight: 1.85, margin: 0, color: "#1a1a1a" }}>{analysis.summary}</p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 2, color: "#1a1a1a" }}>
                  {preRunBullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              )}
            </div>

            {/* Ghost Stock Anomalies Across Branches */}
            {analysis && showStockAnomalies && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                  <div style={{ width: 5, height: 20, borderRadius: 3, background: "#dc2626" }} />
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#0d2b1e" }}>
                    Ghost Stock Anomalies Across Branches
                  </span>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: ghostStockAnomalies.length > 0 ? "#fee2e2" : "#f1f5f9",
                    color: ghostStockAnomalies.length > 0 ? "#991b1b" : "#64748b"
                  }}>
                    {ghostStockAnomalies.length}
                  </span>
                </div>

                <div style={{
                  marginBottom: 14,
                  padding: "11px 13px",
                  borderRadius: 9,
                  background: "#fff7f7",
                  border: "1px solid #fee2e2",
                  fontSize: 12.5,
                  color: "#7f1d1d",
                  lineHeight: 1.65
                }}>
                  <strong>What is a ghost stock anomaly?</strong>{" "}
                  A ghost stock anomaly occurs when a branch records sales while one or more related inventory items are already recorded as zero stock in the system. This means the sales record and inventory record may be out of sync and should be verified through stock reconciliation.
                </div>

                {ghostStockAnomalies.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {ghostStockAnomalies.map((a, i) => (
                      <div
                        key={`${a?.branch || "branch"}-${i}`}
                        style={{
                          background: "#fef2f2",
                          border: "1.5px solid #fecaca",
                          borderLeft: "5px solid #dc2626",
                          borderRadius: 12,
                          padding: "16px 18px"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "3px 10px",
                            borderRadius: 20,
                            background: "#fff",
                            color: "#991b1b",
                            textTransform: "uppercase"
                          }}>
                            Ghost Stock
                          </span>
                          <span style={{ fontSize: 14, fontWeight: 700 }}>
                            {a?.branch || "Unknown Branch"}
                          </span>
                          <span style={{
                            marginLeft: "auto",
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "3px 10px",
                            borderRadius: 20,
                            background: "#fee2e2",
                            color: "#991b1b",
                            textTransform: "uppercase"
                          }}>
                            {a?.severity || "critical"}
                          </span>
                        </div>

                        <p style={{ fontSize: 13.5, lineHeight: 1.7, margin: "0 0 8px" }}>
                          {a?.finding || "Sales activity was detected while related inventory is recorded at zero stock."}
                        </p>

                        <div style={{
                          fontSize: 13,
                          fontWeight: 600,
                          background: "rgba(255,255,255,0.7)",
                          borderRadius: 8,
                          padding: "9px 12px"
                        }}>
                          → {a?.action || "Verify physical stock, reconcile inventory movements, and correct the branch stock record."}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    fontSize: 13,
                    color: "#64748b",
                    background: "#f8fafc",
                    border: "1px dashed #cbd5e1",
                    borderRadius: 10,
                    padding: "12px 14px"
                  }}>
                    No ghost stock anomaly was detected in the branches included in this analysis.
                  </div>
                )}
              </div>
            )}

            {/* Preserve other stock/sales anomalies in exported reports */}
            {analysis && showStockAnomalies && otherStockAnomalies.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                  <div style={{ width: 5, height: 20, borderRadius: 3, background: "#d97706" }} />
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#0d2b1e" }}>
                    Other Stock vs Sales Anomalies
                  </span>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: "#fef3c7",
                    color: "#92400e"
                  }}>
                    {otherStockAnomalies.length}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {otherStockAnomalies.map((a, i) => {
                    const cfg = {
                      low_stock_no_reorder: { bg: "#fffbeb", border: "#fde68a", label: "Not Reordering" },
                      dead_stock: { bg: "#eff6ff", border: "#bfdbfe", label: "Dead Stock" },
                    }[a?.anomalyType] || { bg: "#f8fffe", border: "#d1eedd", label: "Anomaly" };

                    return (
                      <div key={i} style={{
                        background: cfg.bg,
                        border: `1.5px solid ${cfg.border}`,
                        borderRadius: 12,
                        padding: "16px 18px"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "3px 10px",
                            borderRadius: 20,
                            background: "#fff",
                            textTransform: "uppercase"
                          }}>
                            {cfg.label}
                          </span>
                          <span style={{ fontSize: 14, fontWeight: 700 }}>
                            {a?.branch || "Unknown Branch"}
                          </span>
                        </div>

                        <p style={{ fontSize: 13.5, lineHeight: 1.7, margin: "0 0 8px" }}>
                          {a?.finding}
                        </p>

                        {a?.action && (
                          <div style={{
                            fontSize: 13,
                            fontWeight: 600,
                            background: "rgba(255,255,255,0.7)",
                            borderRadius: 8,
                            padding: "9px 12px"
                          }}>
                            → {a.action}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis?.recommendations?.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                  <div style={{ width: 5, height: 20, borderRadius: 3, background: "linear-gradient(180deg,#00c853,#00897b)" }} />
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#0d2b1e" }}>Actionable Recommendations</span>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#e0f2f1", color: "#00695c" }}>
                    {analysis.recommendations.length}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {analysis.recommendations.map((rec, i) => {
                    const s = typeStyle(rec.type);
                    return (
                      <div key={i} style={{ background: s.bg, border: `1.5px solid ${s.borderColor}40`, borderLeft: `5px solid ${s.borderColor}`, borderRadius: 10, padding: "14px 18px" }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: s.color, background: s.badgeBg, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase" }}>
                          {rec.branch || rec.type}
                        </span>
                        <p style={{ fontSize: 13.5, lineHeight: 1.75, margin: "8px 0 0" }}>{rec.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer */}
            <div style={{ marginTop: 36, paddingTop: 14, borderTop: "1.5px solid #e0f2f1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10.5, color: "#94a3b8" }}>
                Generated by FranchiSync · Franchise Business Services Corp.
              </span>
              <span style={{ fontSize: 10.5, color: "#94a3b8" }}>
                AI analysis powered by Groq
              </span>
            </div>
          </div>
        </div>
      </PanelCard>
    );
  }

  function SalesVsStockSection({ preset, appliedRange, rangeMode, filterBranch, filterBrand, selectedBrand, total, transactions = [] }) {
    const [data,    setData]    = useState(null);
    const [inventoryRows, setInventoryRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tab,     setTab]     = useState("top10");

    const fetchData = useCallback(async () => {
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
        const [analyticsRes, inventoryRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/dashboard/product-analytics?${params}`),
          fetch(`${process.env.REACT_APP_API_URL}/ingredients`),
        ]);
        const json = analyticsRes.ok ? await analyticsRes.json() : {};
        const inventoryJson = inventoryRes.ok ? await inventoryRes.json() : [];
        setData(json);
        setInventoryRows(Array.isArray(inventoryJson) ? inventoryJson : []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }, [preset, rangeMode, appliedRange, filterBranch, filterBrand, selectedBrand]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const top10     = data?.top10 ?? [];
    const fast      = data?.fastMoving ?? [];
    const slow      = data?.slowMoving ?? [];
    const totalSKUs = data?.totalProducts ?? 0;
    const fastCount = fast.length;
    const slowCount = slow.length;

    const stockEvidence = useMemo(() => {
      /*
        Build the stock charts from the SAME filtered transaction records used by
        the dashboard instead of relying only on top10/fast/slow lists.

        This fixes the empty charts when a sold product exists in transactions
        and inventory but was omitted from one of the analytics summary arrays.
      */

      const normalizeName = (value) =>
        String(value || "")
          .trim()
          .toLowerCase()
          .replace(/&/g, "and")
          .replace(/[^a-z0-9]+/g, "");

      const normalizeText = (value) =>
        String(value || "").trim().toLowerCase();

      const parseItems = (raw) => {
        if (Array.isArray(raw)) return raw;
        if (typeof raw === "string") {
          try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        return [];
      };

      // Number of days represented by the current dashboard filter.
      let periodDays = 30;

      if (rangeMode === "preset") {
        periodDays =
          preset === "day"
            ? 1
            : preset === "week"
              ? 7
              : preset === "year"
                ? 365
                : 30;
      } else if (appliedRange?.from && appliedRange?.to) {
        periodDays = Math.max(
          1,
          Math.ceil(
            (
              new Date(appliedRange.to + "T23:59:59") -
              new Date(appliedRange.from + "T00:00:00")
            ) / 864e5
          )
        );
      }

      /*
        Aggregate actual units sold from the already-filtered transactions.
        Store both an ID key and a normalized-name key because older transaction
        rows may not consistently contain the inventory/ingredient ID.
      */
      const soldById = new Map();
      const soldByName = new Map();

      (Array.isArray(transactions) ? transactions : []).forEach((tx) => {
        const txBranch = normalizeText(tx?.branch);

        parseItems(tx?.items).forEach((item) => {
          const qty = Number(
            item?.qty ??
            item?.quantity ??
            item?.quantity_sold ??
            0
          );

          if (!Number.isFinite(qty) || qty <= 0) return;

          const itemId =
            item?.ingredient_id ??
            item?.inventory_id ??
            item?.product_id ??
            item?.id ??
            null;

          const itemName =
            item?.name ??
            item?.product_name ??
            item?.item_name ??
            item?.title ??
            "";

          /*
            Include branch in the name key where possible so two branches selling
            products with the same name don't accidentally share sales quantities.
          */
          const nameKey = normalizeName(itemName);

          if (itemId != null && itemId !== "") {
            const idKey = `${txBranch}|${String(itemId)}`;
            soldById.set(idKey, (soldById.get(idKey) || 0) + qty);

            // Compatibility key for rows where inventory has no branch.
            const globalIdKey = `|${String(itemId)}`;
            soldById.set(globalIdKey, (soldById.get(globalIdKey) || 0) + qty);
          }

          if (nameKey) {
            const branchNameKey = `${txBranch}|${nameKey}`;
            soldByName.set(
              branchNameKey,
              (soldByName.get(branchNameKey) || 0) + qty
            );

            // Compatibility key for inventory records without a branch value.
            const globalNameKey = `|${nameKey}`;
            soldByName.set(
              globalNameKey,
              (soldByName.get(globalNameKey) || 0) + qty
            );
          }
        });
      });

      const selectedBranchNames =
        filterBrand && selectedBrand
          ? (selectedBrand.branches || [])
              .map((br) => typeof br === "string" ? br : br?.name)
              .filter(Boolean)
          : [];

      const inventoryInScope = (Array.isArray(inventoryRows) ? inventoryRows : [])
        .filter((inv) => {
          const invBranch = String(inv?.branch || "").trim();
          const invBrand = normalizeText(inv?.brand);

          if (filterBranch) {
            return invBranch === filterBranch;
          }

          if (filterBrand && selectedBrand) {
            const branchMatches =
              selectedBranchNames.length === 0 ||
              selectedBranchNames.includes(invBranch);

            const brandMatches =
              !invBrand ||
              invBrand === normalizeText(selectedBrand?.name);

            return branchMatches && brandMatches;
          }

          return true;
        });

      const rows = inventoryInScope
        .map((inv) => {
          const invBranch = normalizeText(inv?.branch);
          const invName = normalizeName(inv?.name);

          const invId =
            inv?.id ??
            inv?.ingredient_id ??
            inv?.inventory_id ??
            null;

          let sold = 0;

          if (invId != null && invId !== "") {
            sold =
              soldById.get(`${invBranch}|${String(invId)}`) ??
              soldById.get(`|${String(invId)}`) ??
              0;
          }

          // Fallback to normalized product name for older transactions.
          if (sold <= 0 && invName) {
            sold =
              soldByName.get(`${invBranch}|${invName}`) ??
              soldByName.get(`|${invName}`) ??
              0;
          }

          /*
            These two charts are sales-vs-stock charts, so only products that
            actually have sales in the selected period are meaningful.
          */
          if (!(sold > 0)) return null;

          const stock = Number(inv?.stock ?? 0);
          const reorder = Number(
            inv?.min_stock ??
            inv?.reorder_point ??
            inv?.minimum_stock ??
            0
          );

          const dailySales = sold / Math.max(periodDays, 1);
          const daysLeft = dailySales > 0 ? stock / dailySales : null;
          const ratio = sold > 0 ? stock / sold : null;

          let status = "OK";
          let recommendation = "Monitor stock level";

          if (
            stock <= reorder ||
            (daysLeft != null && daysLeft < 14)
          ) {
            status = "CRITICAL";
            recommendation = "Restock urgently";
          } else if (
            (daysLeft != null && daysLeft > 90) ||
            (ratio != null && ratio > 3)
          ) {
            status = "OVERSTOCK";
            recommendation = "Reduce ordering / promote";
          } else if (
            daysLeft != null &&
            daysLeft < 30
          ) {
            status = "WATCH";
            recommendation = "Reorder soon";
          }

          return {
            id: invId,
            name: inv?.name || "Unnamed Product",
            branch: inv?.branch || "Unassigned",
            brand: inv?.brand || "",
            stock,
            reorder,
            sold,
            daysLeft,
            ratio,
            status,
            recommendation,
            unit: inv?.unit || "units",
          };
        })
        .filter(Boolean);

      /*
        Put the products with the greatest sales first, while still keeping
        critical items visible near the top.
      */
      rows.sort((a, b) => {
        const priority = {
          CRITICAL: 0,
          WATCH: 1,
          OK: 2,
          OVERSTOCK: 3,
        };

        const p = (priority[a.status] ?? 9) - (priority[b.status] ?? 9);
        return p !== 0 ? p : b.sold - a.sold;
      });

      return rows.slice(0, 10);
    }, [
      transactions,
      inventoryRows,
      preset,
      rangeMode,
      appliedRange,
      filterBranch,
      filterBrand,
      selectedBrand,
    ]);

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
          style={{ display: "grid", gridTemplateColumns: isBuyers ? "28px 1fr 70px 1fr" : "28px 1fr 65px 70px 1fr", gap: 8, alignItems: "center", padding: "8px 10px", borderBottom: "1px solid #f4fbf6", borderRadius: 7, transition: "background .1s", cursor: "default" }}
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
            {isBuyers ? p.totalItems?.toLocaleString() : fmtPeso1(p.totalRevenue)}
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
          {stockEvidence.length > 0 && <div style={{background:"#fff",border:"1px solid #d1eedd",borderRadius:14,padding:"16px 18px",marginBottom:18,overflowX:"auto"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:13}}><span style={{width:4,height:18,borderRadius:4,background:"#22c55e"}}/><strong style={{fontSize:13,color:"#102a1c"}}>Inventory Recommendation Report</strong><span style={{fontSize:9.5,fontWeight:800,padding:"3px 8px",borderRadius:20,background:"#ecfdf5",color:"#15803d",border:"1px solid #bbf7d0"}}>ACTUAL STOCK + SALES</span></div>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:760,fontFamily:FONT}}><thead><tr>{["Product","Stock","Period Sales","Reorder Pt","Days Left","Status","Recommendation"].map(h=><th key={h} style={{padding:"8px 10px",textAlign:h==="Product"||h==="Recommendation"?"left":"center",fontSize:9.5,color:"#8290a3",textTransform:"uppercase",letterSpacing:".06em",borderBottom:"1px solid #d1eedd"}}>{h}</th>)}</tr></thead><tbody>{stockEvidence.map((r,i)=><tr key={r.name} style={{background:i%2?"#f5fcf7":"#fff"}}><td style={{padding:"10px",fontSize:11,fontWeight:700,color:"#183126"}}>{r.name}</td><td style={{padding:"10px",fontSize:11,textAlign:"center",fontWeight:800}}>{r.stock}</td><td style={{padding:"10px",fontSize:11,textAlign:"center"}}>{r.sold}</td><td style={{padding:"10px",fontSize:11,textAlign:"center"}}>{r.reorder}</td><td style={{padding:"10px",fontSize:11,textAlign:"center",fontWeight:800,color:r.status==="CRITICAL"?"#ef4444":"#334155"}}>{r.daysLeft==null?"—":`${Math.round(r.daysLeft)}d`}</td><td style={{padding:"10px",textAlign:"center"}}><span style={{fontSize:9,fontWeight:800,padding:"3px 8px",borderRadius:20,background:r.status==="CRITICAL"?"#fef2f2":r.status==="OVERSTOCK"?"#eff6ff":r.status==="WATCH"?"#fffbeb":"#ecfdf5",color:r.status==="CRITICAL"?"#ef4444":r.status==="OVERSTOCK"?"#2563eb":r.status==="WATCH"?"#d97706":"#15803d",border:"1px solid currentColor"}}>{r.status}</span></td><td style={{padding:"10px",fontSize:10.5,fontWeight:700,color:r.status==="CRITICAL"?"#ef4444":r.status==="OVERSTOCK"?"#2563eb":"#15803d"}}>{r.recommendation}</td></tr>)}</tbody></table>
          </div>}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 18 }}>
            {[
              { label: "SKUs Tracked",       value: totalSKUs || "—", color: "#0d2b1e", bg: "#f0fdf5",  border: "#d1eedd",  icon: Layers    },
              { label: "Fast Movers",         value: fastCount || "—", color: "#059669", bg: "#ecfdf5",  border: "#a7f3d0",  icon: TrendingUp },
              { label: "Slow Movers",         value: slowCount || "—", color: "#dc2626", bg: "#fef2f2",  border: "#fecaca",  icon: TrendingDown },
            { label: "Avg Units Sold / Product", value: data?.avgQty ? `${Number(data.avgQty).toLocaleString()} units` : "—", color: "#1e40af", bg: "#eff6ff", border: "#bfdbfe", icon: Activity },
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
                    { label: "Reorder Soon",  count: slowCount || 0,                                     color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: AlertTriangle },
                    { label: "Healthy Stock", count: Math.max(0, totalSKUs - slowCount - fastCount),     color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", icon: CheckCircle   },
                    { label: "High Demand",   count: fastCount || 0,                                     color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe", icon: TrendingUp    },
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

  function InfoModal({ modal, onClose, onConfirm }) {
    if (!modal) return null;
    const { type = "info", title, message, confirmLabel, cancelLabel, confirmTone = "danger" } = modal;

    const iconMap = {
      error: (
        <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ),
      success: (
        <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
      info: (
        <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      ),
      warning: (
        <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ),
      confirm: (
        <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ),
    };

    const hc = {
      error:   { bg: "#fef2f2", border: "#fecaca", titleColor: "#991b1b" },
      success: { bg: "#e8f5e9", border: "#c8e6c9", titleColor: "#00695c" },
      info:    { bg: "#eff6ff", border: "#bfdbfe", titleColor: "#1e3a8a" },
      warning: { bg: "#fffbeb", border: "#fed7aa", titleColor: "#92400e" },
      confirm: { bg: "#fffbeb", border: "#fed7aa", titleColor: "#92400e" },
    }[type] || { bg: "#eff6ff", border: "#bfdbfe", titleColor: "#1e3a8a" };

    return (
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(13,43,30,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 3000, padding: 20, backdropFilter: "blur(4px)",
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: "#fff", borderRadius: 16, width: "100%", maxWidth: 400,
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)", border: `1px solid ${hc.border}`,
            fontFamily: FONT, overflow: "hidden",
          }}
        >
          <div style={{ background: hc.bg, padding: "20px 24px 16px", borderBottom: `1px solid ${hc.border}`, display: "flex", alignItems: "flex-start", gap: 13 }}>
            <div style={{ flexShrink: 0, marginTop: 1 }}>{iconMap[type]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: hc.titleColor, marginBottom: 4, fontFamily: FONT }}>{title}</div>
              {message && (
                <div style={{ fontSize: 13, color: "#0d2b1e", lineHeight: 1.6, opacity: 0.85, fontFamily: FONT }}>{message}</div>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                flexShrink: 0, width: 26, height: 26, borderRadius: "50%",
                border: `1px solid ${hc.border}`, background: "transparent", cursor: "pointer",
                color: "#5a7a65", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div style={{ padding: "14px 24px", display: "flex", justifyContent: "flex-end", gap: 8 }}>
            {type === "confirm" && (
              <button
                onClick={onClose}
                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #b2dfdb", background: "#f0fdf5", color: "#5a7a65", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}
              >
                {cancelLabel || "Cancel"}
              </button>
            )}
            <button
              onClick={type === "confirm" ? onConfirm : onClose}
              style={{
                padding: "8px 18px", borderRadius: 8, border: "none",
                background: type === "confirm"
                  ? (confirmTone === "success" ? "linear-gradient(135deg,#2E7D32,#00897b)" : "linear-gradient(135deg,#ef4444,#dc2626)")
                  : "linear-gradient(135deg,#00c853,#00897b)",
                color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT,
              }}
            >
              {confirmLabel || "OK"}
            </button>
          </div>
        </div>
      </div>
    );
  }



  function DashboardLineGraph({ labels = [], values = [], height = 230 }) {
    const [hover, setHover] = useState(null);
    const W = 760, H = height, PL = 54, PR = 18, PT = 20, PB = 38;
    const safeValues = values.map(v => Number(v || 0));
    const max = Math.max(...safeValues, 1);
    const pW = W - PL - PR, pH = H - PT - PB;
    const x = i => labels.length <= 1 ? PL + pW / 2 : PL + (i / (labels.length - 1)) * pW;
    const y = v => PT + pH - (Number(v || 0) / max) * pH;
    const points = safeValues.map((v, i) => `${x(i)},${y(v)}`).join(" ");
    const tickIdx = labels.length <= 7 ? labels.map((_,i)=>i) : Array.from(new Set([0, ...Array.from({length:5},(_,i)=>Math.round((i+1)*(labels.length-1)/6)), labels.length-1]));
    const grid = [0,.25,.5,.75,1];

    if (!labels.length || !values.length) return <DashboardEmptyState message="No revenue data for the selected period." />;

    return (
      <div style={{ position:"relative", width:"100%" }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={height} role="img" aria-label="Revenue trend chart">
          {grid.map((g,i) => { const yy = PT + pH - g*pH; return (
            <g key={i}>
              <line x1={PL} y1={yy} x2={W-PR} y2={yy} stroke="#E8EEE5" strokeWidth="1" />
              <text x={PL-9} y={yy+4} textAnchor="end" fontSize="10" fill="#7A887B" fontFamily={FONT}>{fmtShort(max*g)}</text>
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
            <div style={{opacity:.7, fontSize:9.5, marginBottom:2}}>{labels[hover]}</div>
            {fmtAmt(safeValues[hover])}
          </div>
        )}
      </div>
    );
  }

  function DashboardBarGraph({ labels = [], values = [], height = 230 }) {
    const [hover, setHover] = useState(null);
    const W = 760, H = height, PL = 46, PR = 16, PT = 20, PB = 38;
    const safeValues = values.map(v => Number(v || 0));
    const max = Math.max(...safeValues, 1);
    const pW = W-PL-PR, pH = H-PT-PB;
    const gap = 6;
    const bw = Math.max(4, (pW / Math.max(labels.length,1)) - gap);
    const tickIdx = labels.length <= 7 ? labels.map((_,i)=>i) : Array.from(new Set([0, ...Array.from({length:5},(_,i)=>Math.round((i+1)*(labels.length-1)/6)), labels.length-1]));
    const grid=[0,.25,.5,.75,1];
    if (!labels.length || !values.length) return <DashboardEmptyState message="No transaction data for the selected period." />;
    return (
      <div style={{position:"relative", width:"100%"}}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={height} role="img" aria-label="Transaction volume chart">
          {grid.map((g,i)=>{const yy=PT+pH-g*pH;return <g key={i}><line x1={PL} y1={yy} x2={W-PR} y2={yy} stroke="#E8EEE5"/><text x={PL-8} y={yy+4} textAnchor="end" fontSize="10" fill="#7A887B" fontFamily={FONT}>{Math.round(max*g)}</text></g>})}
          {safeValues.map((v,i)=>{
            const slot=pW/Math.max(labels.length,1); const xx=PL+i*slot+(slot-bw)/2; const hh=(v/max)*pH; const yy=PT+pH-hh;
            return <rect key={i} x={xx} y={yy} width={bw} height={Math.max(hh,1)} rx="4" fill={hover===i?"#2c5c16":"#c9dba0"} onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)} style={{cursor:"pointer"}}/>
          })}
          {tickIdx.map(i=>{const slot=pW/Math.max(labels.length,1);return <text key={i} x={PL+i*slot+slot/2} y={H-12} textAnchor="middle" fontSize="10" fill="#7A887B" fontFamily={FONT}>{labels[i]}</text>})}
        </svg>
        {hover != null && <div style={{position:"absolute",top:8,right:10,background:"#12241B",color:"#fff",borderRadius:9,padding:"7px 10px",fontSize:11,fontWeight:700,pointerEvents:"none"}}><div style={{opacity:.7,fontSize:9.5,marginBottom:2}}>{labels[hover]}</div>{safeValues[hover].toLocaleString()} transactions</div>}
      </div>
    );
  }

  function DashboardEmptyState({ message }) {
    return <div style={{height:230,display:"flex",alignItems:"center",justifyContent:"center",border:"1px dashed #D7E1D4",borderRadius:12,background:"#FAFCF8",color:"#7A887B",fontSize:12,fontWeight:600,textAlign:"center",padding:20}}>{message}</div>;
  }

  function DashboardRankBars({ data = [] }) {
    if (!data.length) return <DashboardEmptyState message="No branch sales data for the selected period." />;
    const max = Math.max(...data.map(d=>d.value),1);
    return <div style={{display:"flex",flexDirection:"column",gap:13,padding:"4px 0 2px"}}>
      {data.slice(0,6).map((d,i)=><div key={`${d.label}-${i}`}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:6}}>
          <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}><span style={{width:22,height:22,borderRadius:7,background:"#F1F5EC",color:"#3b791e",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,flexShrink:0}}>{i+1}</span><span style={{fontSize:12,fontWeight:700,color:"#243128",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.label}</span></div>
          <strong style={{fontSize:12,color:"#243128",whiteSpace:"nowrap"}}>{fmtAmt(d.value)}</strong>
        </div>
        <div style={{height:8,borderRadius:999,background:"#EEF2EA",overflow:"hidden"}}><div style={{height:"100%",width:`${(d.value/max)*100}%`,borderRadius:999,background:"linear-gradient(90deg,#3b791e,#bdd43c)"}}/></div>
      </div>)}
    </div>;
  }

  // ─── FranchiSync B2B Revenue Assurance Dashboard ────────────────────────────
  const B2B_DEFAULT_GROWTH_TARGET = 20;
  const B2B_FALLBACK_THRESHOLDS = {
    highOrderDropPct: 25,
    watchOrderDropPct: 10,
    posStableFloorPct: -5,
  };

  const b2bNum = (...values) => {
    for (const value of values) {
      const n = Number(value);
      if (value !== null && value !== undefined && value !== "" && Number.isFinite(n)) return n;
    }
    return 0;
  };

  const b2bNullableNum = (...values) => {
    for (const value of values) {
      if (value === null || value === undefined || value === "") continue;
      const n = Number(value);
      if (Number.isFinite(n)) return n;
    }
    return null;
  };

  const b2bArray = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch { return []; }
    }
    return [];
  };

  const b2bMonthKey = (value) => {
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  const b2bShiftMonth = (monthKey, delta) => {
    const [y, m] = String(monthKey || "").split("-").map(Number);
    if (!y || !m) return b2bMonthKey(new Date());
    return b2bMonthKey(new Date(y, m - 1 + delta, 1));
  };

  const b2bMonthLabel = (monthKey) => {
    const [y, m] = String(monthKey || "").split("-").map(Number);
    if (!y || !m) return monthKey || "—";
    return new Date(y, m - 1, 1).toLocaleDateString("en-PH", { month: "short", year: "numeric" });
  };

  const b2bDateOfOrder = (o) => o?.order_date || o?.created_at || o?.createdAt || o?.updated_at || null;
  const b2bDateOfTx = (tx) => tx?.date || tx?.created_at || tx?.createdAt || tx?.transaction_date || null;
  const b2bDateOfInventory = (row) => row?.snapshot_date || row?.counted_at || row?.stock_date || row?.as_of_date || row?.updated_at || null;
  const b2bOrderAmount = (o) => b2bNum(o?.net_amount, o?.total_amount, o?.total, o?.amount);
  const b2bTxAmount = (tx) => b2bNum(tx?.net_total, tx?.total, tx?.total_amount, tx?.grand_total);
  const b2bBranchName = (row) => String(row?.branch_name || row?.branch || row?.store_name || row?.store || "").trim();
  const b2bBrandName = (row) => String(row?.brand_name || row?.brand || "").trim();
  const b2bOrderItems = (o) => b2bArray(o?.items || o?.order_items || o?.orderItems);
  const b2bTxItems = (tx) => b2bArray(tx?.items || tx?.transaction_items || tx?.transactionItems);
  const b2bItemQty = (item) => b2bNum(item?.qty_received, item?.received_qty, item?.qty, item?.quantity, item?.quantity_sold);
  const b2bItemId = (item) => item?.product_id ?? item?.inventory_id ?? item?.ingredient_id ?? item?.shop_item_id ?? item?.id ?? null;
  const b2bItemName = (item) => String(item?.product_name || item?.item_name || item?.name || item?.title || (b2bItemId(item) != null ? `SKU ${b2bItemId(item)}` : "Unknown SKU")).trim();
  const b2bInventoryOpening = (item) => b2bNullableNum(item?.opening_stock, item?.openingStock, item?.beginning_stock, item?.beginningStock);
  const b2bInventoryClosing = (item) => b2bNullableNum(item?.closing_stock, item?.closingStock, item?.ending_stock, item?.endingStock, item?.on_hand, item?.current_stock, item?.stock);
  const b2bInventoryDisposal = (item) => b2bNullableNum(item?.disposed_qty, item?.disposal_qty, item?.disposed, item?.waste_qty, item?.waste);
  const b2bInventoryTransferIn = (item) => b2bNullableNum(item?.transfer_in, item?.transferIn, item?.transfers_in);
  const b2bInventoryTransferOut = (item) => b2bNullableNum(item?.transfer_out, item?.transferOut, item?.transfers_out);
  const b2bInventoryAdjustment = (item) => b2bNullableNum(item?.manual_adjustment, item?.adjustment_qty, item?.adjustment);
  const b2bKeyPart = (value) => String(value || "").trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "");
  const b2bSkuKey = (item, parentBrand, parentBranch) => [
    b2bKeyPart(parentBranch || b2bBranchName(item)),
    b2bKeyPart(parentBrand || b2bBrandName(item)),
    b2bKeyPart(b2bItemName(item)) || String(b2bItemId(item) ?? "unknown"),
  ].join("|");

  const b2bIsEarnedOrder = (o) => {
    const s = String(o?.status || "").toLowerCase();
    return ["received", "delivered", "fulfilled", "completed", "complete"].includes(s);
  };

  const b2bIsCompletedTx = (tx) => {
    if (tx?.is_voided || tx?.voided || String(tx?.status || "").toLowerCase() === "void") return false;
    const status = String(tx?.status || "").toLowerCase();
    if (!status) return true;
    return ["paid", "completed", "complete", "success", "successful"].includes(status);
  };

  function B2BRiskBadge({ risk }) {
    const normalized = String(risk || "Normal").toLowerCase();
    const high = normalized.includes("high") || normalized.includes("critical");
    const watch = normalized.includes("watch") || normalized.includes("medium") || normalized.includes("moderate");
    const label = high ? "High Risk" : watch ? "Watch" : "Normal";
    const style = high
      ? { color: "#b42318", background: "#fff1f0", border: "#fecdca" }
      : watch
        ? { color: "#b54708", background: "#fffaeb", border: "#fedf89" }
        : { color: "#2c5c16", background: "#f0f5e8", border: "#c9dba0" };
    return (
      <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 9px", borderRadius:20, border:`1px solid ${style.border}`, background:style.background, color:style.color, fontSize:10.5, fontWeight:800, whiteSpace:"nowrap" }}>
        <span style={{ width:6, height:6, borderRadius:"50%", background:style.color }} />
        {label}
      </span>
    );
  }

  const b2bMaskedValue = (value) => {
    const text = String(value ?? "");
    if (!text || text === "—") return "—";
    if (text.trim().startsWith("₱")) return "₱••••••";
    if (text.includes("%")) return "•••%";
    return "••••";
  };

  function B2BVisibilityIcon({ masked, size=15 }) {
    return masked ? (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    ) : (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  function B2BMetricCard({ label, value, note, icon: Icon, tone="green", onClick, loading=false, defaultMasked=false, maskable=true }) {
    const [masked, setMasked] = useState(defaultMasked);
    const tones = {
      green: { iconBg:"#eef7e9", icon:"#3b791e", accent:"#3b791e" },
      blue:  { iconBg:"#eff6ff", icon:"#2563eb", accent:"#2563eb" },
      amber: { iconBg:"#fff7ed", icon:"#b45309", accent:"#b45309" },
      red:   { iconBg:"#fef2f2", icon:"#c0392b", accent:"#c0392b" },
    };
    const t = tones[tone] || tones.green;
    const displayValue = loading ? "…" : masked ? b2bMaskedValue(value) : value;
    const open = () => { if (onClick) onClick(); };
    return (
      <div
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={onClick ? `Open ${label} breakdown` : label}
        onClick={open}
        onKeyDown={e=>{ if(onClick && (e.key==="Enter" || e.key===" ")){ e.preventDefault(); open(); } }}
        style={{ textAlign:"left", width:"100%", background:"#fff", border:"1px solid #E1E6D8", borderRadius:16, padding:"16px 17px", boxShadow:"0 2px 12px rgba(50,109,32,.06)", cursor:onClick?"pointer":"default", fontFamily:FONT, minHeight:126, transition:"transform .15s ease, box-shadow .15s ease", position:"relative", outline:"none" }}
        onMouseEnter={e=>{ if(onClick){ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(50,109,32,.10)"; } }}
        onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 2px 12px rgba(50,109,32,.06)"; }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10 }}>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:".07em", textTransform:"uppercase", color:"#6B7A65" }}>{label}</div>
            <div style={{ fontSize:21, fontWeight:850, color:"#12241B", marginTop:7, lineHeight:1.15, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {displayValue}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
            {maskable && (
              <button
                type="button"
                onClick={e=>{ e.stopPropagation(); setMasked(v=>!v); }}
                onKeyDown={e=>e.stopPropagation()}
                aria-label={masked ? `Show ${label}` : `Hide ${label}`}
                title={masked ? "Show value" : "Hide value"}
                style={{ width:29, height:29, borderRadius:9, border:"1px solid #DDE8DA", background:"#fff", color:"#64748b", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", padding:0 }}
              >
                <B2BVisibilityIcon masked={masked} size={14}/>
              </button>
            )}
            <div style={{ width:36, height:36, borderRadius:11, background:t.iconBg, color:t.icon, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {Icon ? <Icon size={17}/> : null}
            </div>
          </div>
        </div>
        <div style={{ marginTop:10, paddingTop:9, borderTop:"1px solid #EEF2EA", fontSize:10.5, lineHeight:1.45, color:"#6B7A65", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ flex:1 }}>{note}</span>
          {onClick && <span style={{ display:"inline-flex", alignItems:"center", gap:3, color:t.accent, fontSize:9.5, fontWeight:800, whiteSpace:"nowrap" }}>Breakdown <ChevronRight size={12}/></span>}
        </div>
      </div>
    );
  }

  function B2BSummaryMetricCard({ label, value, loading=false, color="#12241B", border="#E1E6D8", onClick }) {
    const [masked, setMasked] = useState(false);
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={e=>{ if(e.key==="Enter" || e.key===" "){ e.preventDefault(); onClick?.(); } }}
        style={{ background:"rgba(255,255,255,.82)", border:`1px solid ${border}`, borderRadius:11, padding:"10px 12px", cursor:"pointer", position:"relative", transition:"transform .15s ease, box-shadow .15s ease", outline:"none" }}
        onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 7px 18px rgba(18,36,27,.09)"; }}
        onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="none"; }}
      >
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
          <div style={{fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:".06em",color:"#71806F"}}>{label}</div>
          <button
            type="button"
            onClick={e=>{e.stopPropagation();setMasked(v=>!v);}}
            onKeyDown={e=>e.stopPropagation()}
            aria-label={masked ? `Show ${label}` : `Hide ${label}`}
            title={masked ? "Show value" : "Hide value"}
            style={{width:26,height:26,borderRadius:8,border:"1px solid #DDE8DA",background:"#fff",color:"#64748b",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:0}}
          >
            <B2BVisibilityIcon masked={masked} size={13}/>
          </button>
        </div>
        <div style={{fontSize:17,fontWeight:850,color,marginTop:4}}>{loading ? "…" : masked ? b2bMaskedValue(value) : value}</div>
        <div style={{fontSize:9.3,fontWeight:800,color:"#3b791e",marginTop:5,display:"flex",alignItems:"center",gap:3}}>View breakdown <ChevronRight size={11}/></div>
      </div>
    );
  }

  function B2BKpiBreakdown({
    metric,
    overview,
    branchRows = [],
    brandRows = [],
    skuRows = [],
    anomalies = [],
    month,
    growthTargetPct,
    onOpenBranch,
    onOpenBrand,
    onOpenSku,
  }) {
    const previousHq = Number(overview?.prevHqRevenue || 0);
    const previousPos = Number(overview?.prevPosRevenue || 0);
    const hqGrowth = previousHq > 0 ? ((Number(overview?.hqRevenue || 0) - previousHq) / previousHq) * 100 : null;
    const posGrowth = previousPos > 0 ? ((Number(overview?.posRevenue || 0) - previousPos) / previousPos) * 100 : null;
    const highRiskRows = branchRows.filter(r=>String(r.risk||"").toLowerCase().includes("high"));
    const watchRows = branchRows.filter(r=>/watch|medium|moderate/i.test(String(r.risk||"")));
    const varianceRows = skuRows.filter(r=>r.stockVariance!=null && Number(r.stockVariance)!==0);
    const suppliedUnits = brandRows.reduce((sum,r)=>sum+Number(r.suppliedQty||0),0);
    const soldUnits = brandRows.reduce((sum,r)=>sum+Number(r.soldQty||0),0);
    const endingUnits = brandRows.reduce((sum,r)=>sum+Number(r.endingStock||0),0);
    const revenueDifference = Number(overview?.posRevenue || 0) - Number(overview?.hqRevenue || 0);

    const metricMeta = {
      hqRevenue: {
        title:"HQ Supply Revenue",
        description:"Fulfilled and delivered Head Office supply orders for the active filters.",
        formula:"Sum of net amounts from fulfilled or delivered Head Office orders.",
      },
      hqPrevious: {
        title:"Previous-Month HQ Revenue",
        description:"The prior-month baseline used for growth and target calculations.",
        formula:"Sum of prior-month fulfilled or delivered Head Office supply orders.",
      },
      hqChange: {
        title:"HQ Month-on-Month Change",
        description:"Change in Head Office supply revenue compared with the previous month.",
        formula:"Current HQ revenue − previous HQ revenue; percentage uses previous HQ revenue as the base.",
      },
      posRevenue: {
        title:"Franchisee POS Revenue",
        description:"Paid and completed franchisee POS sales for the active filters.",
        formula:"Sum of net totals from non-voided, paid or completed POS transactions.",
      },
      target: {
        title:"Monthly Target",
        description:"The Head Office supply-revenue goal calculated from the prior month.",
        formula:`Previous HQ revenue × (1 + ${growthTargetPct}% growth target).`,
      },
      targetGap: {
        title:"Target Gap",
        description:"The remaining Head Office supply revenue required to reach the monthly target.",
        formula:"Maximum of zero or monthly target − current HQ supply revenue.",
      },
      coverage: {
        title:"HQ Order Coverage",
        description:"The portion of reported sell-through supported by authorized HQ stock flow.",
        formula:"Authorized HQ-supplied sellable units ÷ reported POS-sold units × 100.",
      },
      atRisk: {
        title:"At-Risk Branches",
        description:"Branches with high-risk or watch signals under the current filters.",
        formula:"Count of branches whose reconciliation rules return High Risk or Watch.",
      },
      unexplained: {
        title:"Unexplained Stock",
        description:"Stock variance that cannot yet be explained by authorized receipts, sales, disposal, or transfers.",
        formula:"Opening + HQ receipts + transfer in − POS sold − disposal − transfer out − recorded closing.",
      },
      sellThrough: {
        title:"Sell-through",
        description:"How much available sellable inventory was sold through POS.",
        formula:"POS-sold units ÷ sellable units available × 100.",
      },
    };
    const meta = metricMeta[metric] || metricMeta.hqRevenue;

    const summariesByMetric = {
      hqRevenue: [
        ["Current HQ Revenue", fmtAmt(overview?.hqRevenue), Package, "green", "Selected month"],
        ["Previous HQ Revenue", previousHq > 0 ? fmtAmt(previousHq) : "—", History, "blue", "Comparison baseline"],
        ["MoM Growth", hqGrowth==null ? "—" : `${hqGrowth>=0?"+":""}${hqGrowth.toFixed(1)}%`, TrendingUp, hqGrowth!=null&&hqGrowth<0?"red":"green", "Current vs previous"],
        ["POS Revenue", fmtAmt(overview?.posRevenue), ShoppingCart, "blue", "Sell-through context"],
      ],
      hqPrevious: [
        ["Previous HQ Revenue", previousHq > 0 ? fmtAmt(previousHq) : "—", History, "blue", "Prior month"],
        ["Current HQ Revenue", fmtAmt(overview?.hqRevenue), Package, "green", "Selected month"],
        ["Absolute Change", `${Number(overview?.hqRevenue||0)-previousHq>=0?"+":"−"}${fmtAmt(Math.abs(Number(overview?.hqRevenue||0)-previousHq))}`, Activity, "amber", "Current less previous"],
        ["MoM Growth", hqGrowth==null ? "—" : `${hqGrowth>=0?"+":""}${hqGrowth.toFixed(1)}%`, TrendingUp, hqGrowth!=null&&hqGrowth<0?"red":"green", "Percentage change"],
      ],
      hqChange: [
        ["Absolute Change", `${Number(overview?.hqRevenue||0)-previousHq>=0?"+":"−"}${fmtAmt(Math.abs(Number(overview?.hqRevenue||0)-previousHq))}`, Activity, "amber", "Current less previous"],
        ["MoM Growth", hqGrowth==null ? "—" : `${hqGrowth>=0?"+":""}${hqGrowth.toFixed(1)}%`, TrendingUp, hqGrowth!=null&&hqGrowth<0?"red":"green", "Previous month is base"],
        ["Current HQ Revenue", fmtAmt(overview?.hqRevenue), Package, "green", "Selected month"],
        ["Previous HQ Revenue", previousHq > 0 ? fmtAmt(previousHq) : "—", History, "blue", "Prior month"],
      ],
      posRevenue: [
        ["Current POS Revenue", fmtAmt(overview?.posRevenue), ShoppingCart, "blue", "Selected month"],
        ["Previous POS Revenue", previousPos > 0 ? fmtAmt(previousPos) : "—", History, "green", "Comparison baseline"],
        ["POS MoM Growth", posGrowth==null ? "—" : `${posGrowth>=0?"+":""}${posGrowth.toFixed(1)}%`, TrendingUp, posGrowth!=null&&posGrowth<0?"red":"green", "Current vs previous"],
        ["POS − HQ", `${revenueDifference>=0?"+":"−"}${fmtAmt(Math.abs(revenueDifference))}`, Activity, "amber", "Reconciliation signal"],
      ],
      target: [
        ["Monthly Target", fmtAmt(overview?.target), Target, "amber", `${growthTargetPct}% above previous HQ`],
        ["Current HQ Revenue", fmtAmt(overview?.hqRevenue), Package, "green", "Revenue attained"],
        ["Target Attainment", overview?.targetAttainment==null?"—":`${Number(overview.targetAttainment).toFixed(1)}%`, Activity, "blue", "Current ÷ target"],
        ["Target Gap", fmtAmt(overview?.targetGap), TrendingDown, Number(overview?.targetGap)>0?"red":"green", "Remaining requirement"],
      ],
      targetGap: [
        ["Target Gap", fmtAmt(overview?.targetGap), TrendingDown, Number(overview?.targetGap)>0?"red":"green", "Remaining requirement"],
        ["Monthly Target", fmtAmt(overview?.target), Target, "amber", "Goal"],
        ["Current HQ Revenue", fmtAmt(overview?.hqRevenue), Package, "green", "Actual"],
        ["Target Attainment", overview?.targetAttainment==null?"—":`${Number(overview.targetAttainment).toFixed(1)}%`, Activity, "blue", "Actual ÷ goal"],
      ],
      coverage: [
        ["HQ Order Coverage", overview?.coverage==null?"—":`${Number(overview.coverage).toFixed(1)}%`, ShieldCheck, overview?.coverage!=null&&overview.coverage<70?"red":"green", "Authorized supply coverage"],
        ["Branches With Coverage", branchRows.filter(r=>r.orderCoverage!=null).length.toLocaleString(), Store, "blue", "Evidence available"],
        ["Below 70%", branchRows.filter(r=>r.orderCoverage!=null&&r.orderCoverage<70).length.toLocaleString(), AlertTriangle, "red", "Needs review"],
        ["At-Risk Branches", Number(overview?.atRisk||0).toLocaleString(), AlertTriangle, "amber", "All active rules"],
      ],
      atRisk: [
        ["At-Risk Branches", Number(overview?.atRisk||0).toLocaleString(), AlertTriangle, Number(overview?.atRisk)>0?"red":"green", "High Risk + Watch"],
        ["High Risk", highRiskRows.length.toLocaleString(), AlertTriangle, "red", "Immediate review"],
        ["Watch", watchRows.length.toLocaleString(), Activity, "amber", "Monitor"],
        ["Normal", Math.max(0,branchRows.length-highRiskRows.length-watchRows.length).toLocaleString(), CheckCircle2, "green", "No current signal"],
      ],
      unexplained: [
        ["Unexplained Units", overview?.unexplained==null?"—":Number(overview.unexplained).toLocaleString(), Layers, Number(overview?.unexplained)>0?"red":"green", "Absolute variance"],
        ["Affected SKUs", varianceRows.length.toLocaleString(), Package, varianceRows.length?"red":"green", "Non-zero variance"],
        ["Positive Variance", varianceRows.filter(r=>Number(r.stockVariance)>0).length.toLocaleString(), ArrowUp, "amber", "Recorded excess"],
        ["Negative Variance", varianceRows.filter(r=>Number(r.stockVariance)<0).length.toLocaleString(), ArrowDown, "red", "Recorded shortage"],
      ],
      sellThrough: [
        ["Sell-through", overview?.sellThrough==null?"—":`${Number(overview.sellThrough).toFixed(1)}%`, Activity, "green", "Sold ÷ available"],
        ["Units Supplied", suppliedUnits.toLocaleString(), Package, "green", "HQ receipts"],
        ["Units Sold", soldUnits.toLocaleString(), ShoppingCart, "blue", "POS deductions"],
        ["Ending Stock", endingUnits.toLocaleString(), Layers, "amber", "Recorded closing"],
      ],
    };
    const summaries = summariesByMetric[metric] || summariesByMetric.hqRevenue;

    let rows = branchRows;
    let entity = "branch";
    let emptyMessage = "No branch evidence is available for this KPI and filter.";
    let columns = [
      ["Branch", "left", r=>r.branch],
      ["HQ Supply", "right", r=>fmtAmt(r.hqRevenue)],
      ["POS Revenue", "right", r=>fmtAmt(r.posRevenue)],
      ["MoM", "right", r=>r.vsLastMonth==null?"—":`${r.vsLastMonth>=0?"+":""}${r.vsLastMonth.toFixed(1)}%`],
      ["Risk", "right", r=><B2BRiskBadge risk={r.risk}/>],
    ];

    if (metric === "posRevenue") {
      rows = [...branchRows].sort((a,b)=>b.posRevenue-a.posRevenue);
      columns = [
        ["Branch", "left", r=>r.branch],
        ["POS Revenue", "right", r=>fmtAmt(r.posRevenue)],
        ["HQ Supply", "right", r=>fmtAmt(r.hqRevenue)],
        ["POS − HQ", "right", r=>`${r.posRevenue-r.hqRevenue>=0?"+":"−"}${fmtAmt(Math.abs(r.posRevenue-r.hqRevenue))}`],
        ["Risk", "right", r=><B2BRiskBadge risk={r.risk}/>],
      ];
    } else if (metric === "target" || metric === "targetGap") {
      rows = [...branchRows].sort((a,b)=>Number(b.targetGap||0)-Number(a.targetGap||0));
      columns = [
        ["Branch", "left", r=>r.branch],
        ["HQ Supply", "right", r=>fmtAmt(r.hqRevenue)],
        ["Target Attainment", "right", r=>r.targetPct==null?"—":`${r.targetPct.toFixed(1)}%`],
        ["Target Gap", "right", r=>r.targetGap==null?"—":fmtAmt(r.targetGap)],
        ["Risk", "right", r=><B2BRiskBadge risk={r.risk}/>],
      ];
    } else if (metric === "coverage") {
      rows = [...branchRows].sort((a,b)=>Number(a.orderCoverage??999)-Number(b.orderCoverage??999));
      columns = [
        ["Branch", "left", r=>r.branch],
        ["Coverage", "right", r=>r.orderCoverage==null?"—":`${r.orderCoverage.toFixed(1)}%`],
        ["HQ Supply", "right", r=>fmtAmt(r.hqRevenue)],
        ["Stock Variance", "right", r=>r.stockVariance==null?"—":`${r.stockVariance>0?"+":""}${r.stockVariance.toLocaleString()}`],
        ["Risk", "right", r=><B2BRiskBadge risk={r.risk}/>],
      ];
    } else if (metric === "atRisk") {
      rows = [...highRiskRows, ...watchRows];
      columns = [
        ["Branch", "left", r=>r.branch],
        ["Reason", "left", r=>r.reason||"No explanation returned."],
        ["HQ Supply", "right", r=>fmtAmt(r.hqRevenue)],
        ["POS Revenue", "right", r=>fmtAmt(r.posRevenue)],
        ["Risk", "right", r=><B2BRiskBadge risk={r.risk}/>],
      ];
      emptyMessage = "No branch is currently classified as High Risk or Watch.";
    } else if (metric === "unexplained") {
      rows = varianceRows;
      entity = "sku";
      columns = [
        ["SKU / Product", "left", r=><><b>{r.product}</b><div style={{fontSize:9,color:"#94a3b8",marginTop:2}}>{r.branch} · {r.brand}</div></>],
        ["Opening", "right", r=>r.openingStock==null?"—":r.openingStock.toLocaleString()],
        ["HQ Received", "right", r=>Number(r.suppliedQty||0).toLocaleString()],
        ["POS Sold", "right", r=>Number(r.soldQty||0).toLocaleString()],
        ["Closing", "right", r=>r.endingStock==null?"—":r.endingStock.toLocaleString()],
        ["Variance", "right", r=>`${r.stockVariance>0?"+":""}${Number(r.stockVariance).toLocaleString()}`],
      ];
      emptyMessage = "No SKU-level variance evidence is available. Link opening stock, HQ receipts, POS deductions, disposal, transfers, and recorded closing stock.";
    } else if (metric === "sellThrough") {
      rows = [...brandRows].sort((a,b)=>Number(b.sellThrough||0)-Number(a.sellThrough||0));
      entity = "brand";
      columns = [
        ["Brand", "left", r=>r.brand],
        ["Units Supplied", "right", r=>Number(r.suppliedQty||0).toLocaleString()],
        ["Units Sold", "right", r=>Number(r.soldQty||0).toLocaleString()],
        ["Ending Stock", "right", r=>r.endingStock==null?"—":Number(r.endingStock).toLocaleString()],
        ["Sell-through", "right", r=>r.sellThrough==null?"—":`${Number(r.sellThrough).toFixed(1)}%`],
      ];
      emptyMessage = "No brand sell-through evidence is available for the active filters.";
    }

    const openRow = row => {
      if (entity === "sku") onOpenSku?.(row);
      else if (entity === "brand") onOpenBrand?.(row);
      else onOpenBranch?.(row);
    };
    const th = {padding:"10px 11px",fontSize:9.5,fontWeight:800,textTransform:"uppercase",letterSpacing:".06em",color:"#71806F",background:"#F6FAF3",borderBottom:"1px solid #DDE8DA",whiteSpace:"nowrap"};
    const td = {padding:"11px",fontSize:10.8,color:"#334155",borderBottom:"1px solid #EEF3EC",verticalAlign:"top"};

    return (
      <div>
        <div style={{padding:"11px 13px",borderRadius:11,background:"#F6FAF3",border:"1px solid #DDE8DA",marginBottom:13}}>
          <div style={{fontSize:12,fontWeight:850,color:"#12241B"}}>{meta.title}</div>
          <div style={{fontSize:10.7,color:"#5C6B60",lineHeight:1.55,marginTop:4}}>{meta.description}</div>
          <div style={{fontSize:10,color:"#3b791e",fontWeight:750,lineHeight:1.5,marginTop:5}}><b>Formula:</b> {meta.formula}</div>
          <div style={{fontSize:9.7,color:"#82907F",marginTop:4}}>Scope: {b2bMonthLabel(month)} · current Brand, Branch, and Risk filters</div>
        </div>

        <div className="b2b-kpi-grid" style={{gridTemplateColumns:"repeat(4,minmax(0,1fr))",marginBottom:14}}>
          {summaries.map(([label,value,Icon,tone,note])=><B2BMetricCard key={label} label={label} value={value} icon={Icon} tone={tone} note={note}/>) }
        </div>

        <div style={{fontSize:11,fontWeight:850,color:"#12241B",marginBottom:8}}>Evidence breakdown</div>
        <div style={{overflowX:"auto",border:"1px solid #E7EEE4",borderRadius:13}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:760}}>
            <thead><tr>{columns.map(([label,align])=><th key={label} style={{...th,textAlign:align}}>{label}</th>)}</tr></thead>
            <tbody>
              {rows.length ? rows.slice(0,20).map((row,index)=>(
                <tr key={row.id ?? `${entity}-${index}`} onClick={()=>openRow(row)} style={{cursor:"pointer",background:index%2?"#FBFDF9":"#fff"}} onMouseEnter={e=>e.currentTarget.style.background="#F4F8F0"} onMouseLeave={e=>e.currentTarget.style.background=index%2?"#FBFDF9":"#fff"}>
                  {columns.map(([label,align,render])=><td key={label} style={{...td,textAlign:align}}>{render(row)}</td>)}
                </tr>
              )) : <tr><td colSpan={columns.length} style={{padding:28,textAlign:"center",fontSize:10.8,color:"#82907F",lineHeight:1.6}}>{emptyMessage}</td></tr>}
            </tbody>
          </table>
        </div>

        {metric === "atRisk" && anomalies.length > 0 && (
          <div style={{marginTop:13}}>
            <div style={{fontSize:11,fontWeight:850,color:"#12241B",marginBottom:8}}>Triggered anomaly rules</div>
            <div style={{display:"grid",gap:7}}>{anomalies.slice(0,10).map((a,i)=><div key={a.id??i} style={{padding:"9px 11px",borderRadius:10,border:"1px solid #E7EEE4",background:i%2?"#FBFDF9":"#fff"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}><b style={{fontSize:10.5,color:"#12241B"}}>{a.branch||a.brand||"Unassigned"}</b><B2BRiskBadge risk={a.severity}/></div><div style={{fontSize:10.2,color:"#5C6B60",marginTop:5,lineHeight:1.5}}><b>{a.rule}:</b> {a.reason}</div></div>)}</div>
          </div>
        )}
      </div>
    );
  }

  function B2BDualTrendChart({ data = [], onPointClick }) {
    const [hover, setHover] = useState(null);
    if (!data.length) return <DashboardEmptyState message="No HQ supply / POS trend data for the selected filters." />;
    const W = 760, H = 240, PL = 55, PR = 24, PT = 20, PB = 38;
    const pW = W - PL - PR, pH = H - PT - PB;
    const hasTarget = data.some(d => b2bNullableNum(d?.targetRevenue) != null && Number(d.targetRevenue) > 0);
    const maxV = Math.max(1, ...data.flatMap(d => [b2bNum(d.hqRevenue), b2bNum(d.posRevenue), b2bNum(d.targetRevenue)])) * 1.12;
    const point = (v, i) => ({ x:PL + (i / Math.max(1, data.length - 1)) * pW, y:PT + pH - (b2bNum(v) / maxV) * pH });
    const hqPts = data.map((d,i)=>point(d.hqRevenue,i));
    const posPts = data.map((d,i)=>point(d.posRevenue,i));
    const targetPts = data.map((d,i)=>point(d.targetRevenue,i));
    const pathOf = (pts) => pts.map((p,i)=>`${i===0?"M":"L"} ${p.x} ${p.y}`).join(" ");
    const ticks = [0,.25,.5,.75,1];
    return (
      <div style={{ position:"relative" }}>
        <div style={{ display:"flex", gap:14, alignItems:"center", marginBottom:8, fontSize:10.5, fontWeight:700, color:"#5C6B60" }}>
          <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:9,height:9,borderRadius:3,background:"#3b791e"}}/>HQ Supply Revenue</span>
          <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:9,height:9,borderRadius:3,background:"#2563eb"}}/>Franchisee POS Revenue</span>
          {hasTarget && <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:11,height:0,borderTop:"2px dashed #b45309"}}/>HQ Monthly Target</span>}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:240, display:"block" }}>
          {ticks.map(t=>{
            const y = PT + pH * (1-t);
            return <g key={t}><line x1={PL} y1={y} x2={W-PR} y2={y} stroke="#E9EEE6" strokeDasharray="4 4"/><text x={PL-8} y={y+4} textAnchor="end" fontSize="9.5" fill="#71806F" fontFamily={FONT}>{fmtShort(maxV*t)}</text></g>;
          })}
          <path d={pathOf(hqPts)} fill="none" stroke="#3b791e" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>
          <path d={pathOf(posPts)} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>
          {hasTarget && <path d={pathOf(targetPts)} fill="none" stroke="#b45309" strokeWidth="2.25" strokeDasharray="7 6" strokeLinejoin="round" strokeLinecap="round"/>}
          {data.map((d,i)=>{
            const h=hqPts[i], p=posPts[i];
            const isHover=hover===i;
            return <g key={d.month || d.label || i} onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)} onClick={()=>onPointClick?.(d)} style={{cursor:onPointClick?"pointer":"default"}}>
              <rect x={Math.max(PL,h.x-28)} y={PT} width={56} height={pH} fill="transparent" />
              <circle cx={h.x} cy={h.y} r={isHover?5:3.5} fill="#3b791e" stroke="#fff" strokeWidth="2"/>
              <circle cx={p.x} cy={p.y} r={isHover?5:3.5} fill="#2563eb" stroke="#fff" strokeWidth="2"/>
              <text x={h.x} y={H-10} textAnchor="middle" fontSize="9.5" fill="#71806F" fontFamily={FONT}>{d.label || b2bMonthLabel(d.month)}</text>
            </g>;
          })}
        </svg>
        {hover !== null && data[hover] && (
          <div style={{ position:"absolute", top:35, right:10, background:"#12241B", color:"#fff", borderRadius:10, padding:"9px 11px", fontSize:10.5, boxShadow:"0 10px 25px rgba(0,0,0,.16)", pointerEvents:"none" }}>
            <div style={{fontWeight:800,marginBottom:4}}>{data[hover].label || b2bMonthLabel(data[hover].month)}</div>
            <div style={{opacity:.78}}>HQ: {fmtAmt(data[hover].hqRevenue)}</div>
            <div style={{opacity:.78}}>POS: {fmtAmt(data[hover].posRevenue)}</div>
            {hasTarget && <div style={{opacity:.78}}>Target: {fmtAmt(data[hover].targetRevenue)}</div>}
          </div>
        )}
      </div>
    );
  }

  function B2BRevenueAssuranceDashboard({ transactions = [], brands = [], user, view="overview", onOpenSalesAi }) {
    const API = process.env.REACT_APP_API_URL || "";
    const [month, setMonth] = useState(() => b2bMonthKey(new Date()));
    const [branch, setBranch] = useState("");
    const [brand, setBrand] = useState("");
    const [risk, setRisk] = useState("all");
    const [growthTargetPct, setGrowthTargetPct] = useState(B2B_DEFAULT_GROWTH_TARGET);
    const [loading, setLoading] = useState(true);
    const [sourceMode, setSourceMode] = useState("aggregated");
    const [overviewApi, setOverviewApi] = useState(null);
    const [branchesApi, setBranchesApi] = useState([]);
    const [brandsApi, setBrandsApi] = useState([]);
    const [anomaliesApi, setAnomaliesApi] = useState([]);
    const [rawOrders, setRawOrders] = useState([]);
    const [rawInventory, setRawInventory] = useState([]);
    const [loadError, setLoadError] = useState("");
    const [drilldown, setDrilldown] = useState(null);

    const branchCatalog = useMemo(() => {
      const map = new Map();
      (brands || []).forEach(b => {
        const brandName = String(b?.name || b?.brand || "").trim();
        (Array.isArray(b?.branches) ? b.branches : []).forEach(br => {
          const name = typeof br === "string" ? br : String(br?.name || br?.branch || br?.branch_name || "").trim();
          if (!name) return;
          const current = map.get(name) || { name, id: typeof br === "object" ? (br?.id ?? br?.branch_id ?? name) : name, location:"", brandNames:[] };
          if (typeof br === "object") current.location = String(br?.location || br?.address || br?.city || current.location || "").trim();
          if (brandName && !current.brandNames.includes(brandName)) current.brandNames.push(brandName);
          map.set(name, current);
        });
      });
      return Array.from(map.values()).sort((a,b)=>a.name.localeCompare(b.name));
    }, [brands]);

    const brandOptions = useMemo(() => (brands || []).map(b=>({ id:b?.id ?? b?.brand_id ?? b?.name, name:String(b?.name || b?.brand || "").trim() })).filter(b=>b.name).sort((a,b)=>a.name.localeCompare(b.name)), [brands]);
    const branchOptions = useMemo(() => {
      if (!brand) return branchCatalog;
      return branchCatalog.filter(br => br.brandNames.includes(brand));
    }, [branchCatalog, brand]);

    useEffect(() => {
      if (branch && !branchOptions.some(br=>br.name===branch)) setBranch("");
    }, [brand, branch, branchOptions]);

    const fetchJson = useCallback(async (url) => {
      const res = await fetch(url, { credentials:"include" });
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      if (json?.error) throw new Error(json.error);
      return json;
    }, []);

    const fetchRawOrdersFallback = useCallback(async () => {
      const params = new URLSearchParams();
      params.set("role", user?.role || "Super Admin");
      if (user?.branch && !["Super Admin", "Franchisee Operations Admin"].includes(user?.role)) params.set("branch", user.branch);
      if (user?.brand && !["Super Admin", "Franchisee Operations Admin"].includes(user?.role)) params.set("brand", user.brand);
      const data = await fetchJson(`${API}/orders?${params.toString()}`);
      return Array.isArray(data) ? data : [];
    }, [API, user, fetchJson]);

    const loadB2B = useCallback(async () => {
      if (!API) {
        setLoading(false);
        setLoadError("The API URL is not configured, so Mobile Orders and inventory cannot be loaded.");
        return;
      }
      setLoading(true);
      setLoadError("");
      const params = new URLSearchParams({ month });
      if (branch) params.set("branch", branch);
      if (brand) params.set("brand", brand);
      if (risk !== "all") params.set("risk", risk);
      params.set("growthTargetPct", String(growthTargetPct));

      const endpoints = [
        `${API}/dashboard/b2b/overview?${params.toString()}`,
        `${API}/dashboard/b2b/branches?${params.toString()}`,
        `${API}/dashboard/b2b/brands?${params.toString()}`,
        `${API}/dashboard/b2b/anomalies?${params.toString()}`,
      ];

      const settled = await Promise.allSettled(endpoints.map(fetchJson));
      const hasCoreSummary = settled.slice(0,3).every(r=>r.status==="fulfilled");

      if (hasCoreSummary) {
        setSourceMode("aggregated");
        const o = settled[0].status === "fulfilled" ? settled[0].value : null;
        const br = settled[1].status === "fulfilled" ? settled[1].value : [];
        const bd = settled[2].status === "fulfilled" ? settled[2].value : [];
        const an = settled[3].status === "fulfilled" ? settled[3].value : [];
        setOverviewApi(o?.data || o || null);
        setBranchesApi(Array.isArray(br) ? br : Array.isArray(br?.branches) ? br.branches : Array.isArray(br?.data) ? br.data : []);
        setBrandsApi(Array.isArray(bd) ? bd : Array.isArray(bd?.brands) ? bd.brands : Array.isArray(bd?.data) ? bd.data : []);
        setAnomaliesApi(Array.isArray(an) ? an : Array.isArray(an?.anomalies) ? an.anomalies : Array.isArray(an?.data) ? an.data : []);
        setRawOrders([]);
        setRawInventory([]);
      } else {
        setSourceMode("fallback");
        setOverviewApi(null); setBranchesApi([]); setBrandsApi([]); setAnomaliesApi([]);
        const inventoryParams = new URLSearchParams();
        if (branch) inventoryParams.set("branch", branch);
        const [ordersResult, stockInventoryResult, posInventoryResult] = await Promise.allSettled([
          fetchRawOrdersFallback(),
          fetchJson(`${API}/ingredients${inventoryParams.toString() ? `?${inventoryParams.toString()}` : ""}`),
          fetchJson(`${API}/inventory${inventoryParams.toString() ? `?${inventoryParams.toString()}` : ""}`),
        ]);
        setRawOrders(ordersResult.status === "fulfilled" && Array.isArray(ordersResult.value) ? ordersResult.value : []);
        const stockPayload = stockInventoryResult.status === "fulfilled" ? stockInventoryResult.value : [];
        const posPayload = posInventoryResult.status === "fulfilled" ? posInventoryResult.value : [];
        const stockRows = Array.isArray(stockPayload) ? stockPayload : Array.isArray(stockPayload?.data) ? stockPayload.data : [];
        const posRows = Array.isArray(posPayload) ? posPayload : Array.isArray(posPayload?.data) ? posPayload.data : [];
        setRawInventory(stockRows.length ? stockRows : posRows);
        if (ordersResult.status === "rejected") {
          setLoadError("The B2B summary endpoints and the existing Mobile Order endpoint could not be loaded.");
        }
      }
      setLoading(false);
    }, [API, month, branch, brand, risk, growthTargetPct, fetchJson, fetchRawOrdersFallback]);

    useEffect(() => { loadB2B(); }, [loadB2B]);

    const fallback = useMemo(() => {
      const currentMonth = month;
      const prevMonth = b2bShiftMonth(month, -1);
      const monthMatches = (value, key) => b2bMonthKey(value) === key;
      const brandAllows = (name) => !brand || String(name || "") === brand;
      const branchAllows = (name) => !branch || String(name || "") === branch;

      const orders = rawOrders.filter(o => b2bIsEarnedOrder(o) && brandAllows(b2bBrandName(o)) && branchAllows(b2bBranchName(o)));
      const pos = (transactions || []).filter(tx => b2bIsCompletedTx(tx) && brandAllows(b2bBrandName(tx)) && branchAllows(b2bBranchName(tx)));
      const inventory = (rawInventory || []).filter(row => {
        if (!brandAllows(b2bBrandName(row)) || !branchAllows(b2bBranchName(row))) return false;
        if (currentMonth === b2bMonthKey(new Date())) return true;
        const snapshotDate = b2bDateOfInventory(row);
        if (snapshotDate) return monthMatches(snapshotDate, currentMonth);
        return false;
      });
      const currentOrders = orders.filter(o => monthMatches(b2bDateOfOrder(o), currentMonth));
      const prevOrders = orders.filter(o => monthMatches(b2bDateOfOrder(o), prevMonth));
      const currentTx = pos.filter(tx => monthMatches(b2bDateOfTx(tx), currentMonth));
      const prevTx = pos.filter(tx => monthMatches(b2bDateOfTx(tx), prevMonth));

      const hqRevenue = currentOrders.reduce((s,o)=>s+b2bOrderAmount(o),0);
      const prevHqRevenue = prevOrders.reduce((s,o)=>s+b2bOrderAmount(o),0);
      const posRevenue = currentTx.reduce((s,tx)=>s+b2bTxAmount(tx),0);
      const prevPosRevenue = prevTx.reduce((s,tx)=>s+b2bTxAmount(tx),0);
      const target = prevHqRevenue * (1 + growthTargetPct / 100);
      const attainment = target > 0 ? (hqRevenue / target) * 100 : null;
      const gap = Math.max(0, target - hqRevenue);

      const allBranchNames = new Set(branchCatalog.map(b=>b.name));
      currentOrders.forEach(o=>{ if(b2bBranchName(o)) allBranchNames.add(b2bBranchName(o)); });
      currentTx.forEach(tx=>{ if(b2bBranchName(tx)) allBranchNames.add(b2bBranchName(tx)); });
      inventory.forEach(row=>{ if(b2bBranchName(row)) allBranchNames.add(b2bBranchName(row)); });
      prevOrders.forEach(o=>{ if(b2bBranchName(o)) allBranchNames.add(b2bBranchName(o)); });
      prevTx.forEach(tx=>{ if(b2bBranchName(tx)) allBranchNames.add(b2bBranchName(tx)); });

      const branchRows = Array.from(allBranchNames).map(name => {
        const cat = branchCatalog.find(x=>x.name===name);
        const currO = currentOrders.filter(o=>b2bBranchName(o)===name);
        const prevO = prevOrders.filter(o=>b2bBranchName(o)===name);
        const currT = currentTx.filter(tx=>b2bBranchName(tx)===name);
        const prevT = prevTx.filter(tx=>b2bBranchName(tx)===name);
        const currI = inventory.filter(row=>b2bBranchName(row)===name);
        const hq = currO.reduce((s,o)=>s+b2bOrderAmount(o),0);
        const prevHq = prevO.reduce((s,o)=>s+b2bOrderAmount(o),0);
        const posV = currT.reduce((s,tx)=>s+b2bTxAmount(tx),0);
        const prevPos = prevT.reduce((s,tx)=>s+b2bTxAmount(tx),0);
        const suppliedQty = currO.flatMap(b2bOrderItems).reduce((s,i)=>s+b2bItemQty(i),0);
        const soldQty = currT.flatMap(b2bTxItems).reduce((s,i)=>s+b2bItemQty(i),0);
        const openingValues = currI.map(b2bInventoryOpening).filter(v=>v!=null);
        const closingValues = currI.map(b2bInventoryClosing).filter(v=>v!=null);
        const openingQty = openingValues.length ? openingValues.reduce((s,v)=>s+v,0) : null;
        const endingStock = closingValues.length ? closingValues.reduce((s,v)=>s+v,0) : null;
        const disposalQty = currI.reduce((s,i)=>s+b2bNum(b2bInventoryDisposal(i)),0);
        const transferInQty = currI.reduce((s,i)=>s+b2bNum(b2bInventoryTransferIn(i)),0);
        const transferOutQty = currI.reduce((s,i)=>s+b2bNum(b2bInventoryTransferOut(i)),0);
        const adjustmentQty = currI.reduce((s,i)=>s+b2bNum(b2bInventoryAdjustment(i)),0);
        const officialAvailable = Math.max(0, b2bNum(openingQty) + suppliedQty + transferInQty - disposalQty - transferOutQty + adjustmentQty);
        const orderCoverage = soldQty > 0 ? Math.min(100, (officialAvailable / soldQty) * 100) : null;
        const expectedClosing = openingQty != null && endingStock != null
          ? openingQty + suppliedQty + transferInQty - soldQty - disposalQty - transferOutQty + adjustmentQty
          : null;
        const stockVariance = expectedClosing == null ? null : endingStock - expectedClosing;
        const hqGrowth = prevHq > 0 ? ((hq-prevHq)/prevHq)*100 : (hq>0?100:0);
        const posGrowth = prevPos > 0 ? ((posV-prevPos)/prevPos)*100 : (posV>0?100:0);
        const targetV = prevHq * (1 + growthTargetPct/100);
        const targetPct = targetV > 0 ? (hq/targetV)*100 : null;
        let riskLabel = "Normal";
        let reason = "No revenue-leakage signal from available order/POS data.";
        if (posV > 0 && hq === 0) {
          riskLabel = "High Risk";
          reason = "Active POS sales with no fulfilled HQ supply order in the selected month. Verify carry-over stock, approved transfers, or possible outside sourcing.";
        } else if (stockVariance != null && stockVariance > 0) {
          riskLabel = "High Risk";
          reason = `${stockVariance.toLocaleString()} units are above the stock expected from opening balance, HQ receipts, POS sales, disposal, and transfers.`;
        } else if (stockVariance != null && stockVariance < 0) {
          riskLabel = "High Risk";
          reason = `${Math.abs(stockVariance).toLocaleString()} units are missing from the expected stock balance and require a physical count.`;
        } else if (openingQty != null && orderCoverage != null && orderCoverage < 70 && posV > 0) {
          riskLabel = "High Risk";
          reason = `Only ${orderCoverage.toFixed(1)}% of reported POS-sold units are supported by opening stock and authorized HQ stock flow.`;
        } else if (posGrowth >= B2B_FALLBACK_THRESHOLDS.posStableFloorPct && hqGrowth <= -B2B_FALLBACK_THRESHOLDS.highOrderDropPct) {
          riskLabel = "High Risk";
          reason = "POS is stable/up while HQ supply revenue dropped materially.";
        } else if (posGrowth >= B2B_FALLBACK_THRESHOLDS.posStableFloorPct && hqGrowth <= -B2B_FALLBACK_THRESHOLDS.watchOrderDropPct) {
          riskLabel = "Watch";
          reason = "POS is stable/up while HQ supply revenue is declining.";
        }
        return {
          id:cat?.id ?? name, branch:name, location:cat?.location || "—", hqRevenue:hq, posRevenue:posV,
          vsLastMonth:hqGrowth, posGrowth, targetPct, orderCoverage, stockVariance,
          suppliedQty, soldQty, openingStock:openingQty, endingStock,
          risk:riskLabel, reason, targetGap:Math.max(0,targetV-hq), prevHqRevenue:prevHq,
        };
      }).filter(r=>!branch || r.branch===branch);

      const brandNames = new Set(brandOptions.map(b=>b.name));
      currentOrders.forEach(o=>{ if(b2bBrandName(o)) brandNames.add(b2bBrandName(o)); });
      currentTx.forEach(tx=>{ if(b2bBrandName(tx)) brandNames.add(b2bBrandName(tx)); });
      inventory.forEach(row=>{ if(b2bBrandName(row)) brandNames.add(b2bBrandName(row)); });
      const brandRows = Array.from(brandNames).map(name => {
        const currO = currentOrders.filter(o=>b2bBrandName(o)===name);
        const currT = currentTx.filter(tx=>b2bBrandName(tx)===name);
        const currI = inventory.filter(row=>b2bBrandName(row)===name);
        const hq = currO.reduce((s,o)=>s+b2bOrderAmount(o),0);
        const posV = currT.reduce((s,tx)=>s+b2bTxAmount(tx),0);
        const suppliedQty = currO.flatMap(b2bOrderItems).reduce((s,i)=>s+b2bItemQty(i),0);
        const soldQty = currT.flatMap(b2bTxItems).reduce((s,i)=>s+b2bItemQty(i),0);
        const openingValues = currI.map(b2bInventoryOpening).filter(v=>v!=null);
        const closingValues = currI.map(b2bInventoryClosing).filter(v=>v!=null);
        const openingStock = openingValues.length ? openingValues.reduce((s,v)=>s+v,0) : null;
        const endingStock = closingValues.length ? closingValues.reduce((s,v)=>s+v,0) : null;
        const disposalQty = currI.reduce((s,i)=>s+b2bNum(b2bInventoryDisposal(i)),0);
        const transferInQty = currI.reduce((s,i)=>s+b2bNum(b2bInventoryTransferIn(i)),0);
        const transferOutQty = currI.reduce((s,i)=>s+b2bNum(b2bInventoryTransferOut(i)),0);
        const adjustmentQty = currI.reduce((s,i)=>s+b2bNum(b2bInventoryAdjustment(i)),0);
        const expectedClosing = openingStock != null && endingStock != null
          ? openingStock + suppliedQty + transferInQty - soldQty - disposalQty - transferOutQty + adjustmentQty
          : null;
        const stockVariance = expectedClosing == null ? null : endingStock - expectedClosing;
        const availableQty = openingStock == null ? null : Math.max(0, openingStock + suppliedQty + transferInQty);
        const sellThrough = availableQty && availableQty > 0 ? (soldQty / availableQty) * 100 : null;
        return { id:brandOptions.find(b=>b.name===name)?.id ?? name, brand:name, hqRevenue:hq, posRevenue:posV, suppliedQty, soldQty, openingStock, endingStock, sellThrough, stockVariance };
      }).filter(r=>!brand || r.brand===brand).sort((a,b)=>b.hqRevenue-a.hqRevenue);

      const riskRows = branchRows.filter(r=>r.risk!=="Normal").map(r=>({
        id:`fallback-${r.branch}`,
        branch:r.branch,
        severity:r.risk,
        rule:r.hqRevenue===0 && r.posRevenue>0 ? "No Recent HQ Order + Active Sales" : "High POS, Low HQ Orders",
        reason:r.reason,
        gapValue:r.targetGap,
        recommendation:"Review the branch → brand → SKU breakdown and verify the source of replenishment.",
      }));

      const skuMap = new Map();
      const addSku = (item, kind, parentBrand, parentBranch) => {
        const resolvedBranch = parentBranch || b2bBranchName(item) || "—";
        const resolvedBrand = parentBrand || b2bBrandName(item) || "—";
        if (branch && resolvedBranch !== branch) return;
        if (brand && resolvedBrand !== brand) return;
        const id = b2bItemId(item);
        const name = b2bItemName(item);
        const key = b2bSkuKey(item, resolvedBrand, resolvedBranch);
        const row = skuMap.get(key) || { id:id ?? key, sku:id != null ? String(id) : "—", product:name, brand:resolvedBrand, branch:resolvedBranch, suppliedQty:0, soldQty:0, openingStock:null, endingStock:null, disposal:null, transferIn:null, transferOut:null, adjustment:null, transfers:null, stockVariance:null };
        if (kind==="supply") row.suppliedQty += b2bItemQty(item);
        if (kind==="sale") row.soldQty += b2bItemQty(item);
        if (kind==="inventory") {
          row.openingStock = b2bInventoryOpening(item);
          row.endingStock = b2bInventoryClosing(item);
          row.disposal = b2bInventoryDisposal(item);
          row.transferIn = b2bInventoryTransferIn(item);
          row.transferOut = b2bInventoryTransferOut(item);
          row.adjustment = b2bInventoryAdjustment(item);
          row.transfers = b2bNum(row.transferIn) + b2bNum(row.transferOut);
        }
        skuMap.set(key,row);
      };
      currentOrders.forEach(o=>b2bOrderItems(o).forEach(i=>addSku(i,"supply",b2bBrandName(o)||b2bBrandName(i),b2bBranchName(o)||b2bBranchName(i))));
      currentTx.forEach(tx=>b2bTxItems(tx).forEach(i=>addSku(i,"sale",b2bBrandName(tx)||b2bBrandName(i),b2bBranchName(tx)||b2bBranchName(i))));
      inventory.forEach(row=>addSku(row,"inventory",b2bBrandName(row),b2bBranchName(row)));
      const skuRows = Array.from(skuMap.values()).map(row=>{
        const hasFullBalance = row.openingStock != null && row.endingStock != null;
        const expectedClosing = hasFullBalance
          ? row.openingStock + row.suppliedQty + b2bNum(row.transferIn) - row.soldQty - b2bNum(row.disposal) - b2bNum(row.transferOut) + b2bNum(row.adjustment)
          : null;
        return { ...row, stockVariance:expectedClosing==null?null:row.endingStock-expectedClosing };
      }).sort((a,b)=>Math.abs(b.stockVariance||0)-Math.abs(a.stockVariance||0) || (b.soldQty+b.suppliedQty)-(a.soldQty+a.suppliedQty)).slice(0,25);

      const stockRiskRows = skuRows.filter(row=>row.stockVariance!=null && row.stockVariance!==0).map((row,index)=>({
        id:`stock-${row.id}-${index}`,
        branch:row.branch,
        brand:row.brand,
        sku:row.product,
        severity:"High Risk",
        rule:row.stockVariance>0 ? "Suspected Unofficial Supply" : "Ghost Stock / Shrinkage",
        reason:row.stockVariance>0
          ? `${row.stockVariance.toLocaleString()} recorded units are not explained by verified opening stock, HQ receipts, POS sales, disposal, and transfers.`
          : `${Math.abs(row.stockVariance).toLocaleString()} units expected by the stock ledger are missing from recorded closing stock.`,
        gapValue:null,
        recommendation:"Request a physical count, verify the source order or transfer, and review manual inventory adjustments.",
      }));

      const trend = [];
      for (let offset=-5; offset<=0; offset++) {
        const key = b2bShiftMonth(currentMonth, offset);
        const o = orders.filter(x=>monthMatches(b2bDateOfOrder(x),key)).reduce((s,x)=>s+b2bOrderAmount(x),0);
        const t = pos.filter(x=>monthMatches(b2bDateOfTx(x),key)).reduce((s,x)=>s+b2bTxAmount(x),0);
        const priorKey = b2bShiftMonth(key,-1);
        const priorHq = orders.filter(x=>monthMatches(b2bDateOfOrder(x),priorKey)).reduce((s,x)=>s+b2bOrderAmount(x),0);
        trend.push({ month:key, label:b2bMonthLabel(key).replace(/\s\d{4}$/,""), hqRevenue:o, posRevenue:t, targetRevenue:priorHq*(1+growthTargetPct/100) });
      }

      const suppliedUnits = brandRows.reduce((sum,row)=>sum+Number(row.suppliedQty||0),0);
      const soldUnits = brandRows.reduce((sum,row)=>sum+Number(row.soldQty||0),0);
      const openingUnits = brandRows.reduce((sum,row)=>sum+Number(row.openingStock||0),0);
      const hasOpeningEvidence = brandRows.some(row=>row.openingStock!=null);
      const coverage = soldUnits>0 ? Math.min(100,((suppliedUnits+(hasOpeningEvidence?openingUnits:0))/soldUnits)*100) : null;
      const unexplained = skuRows.filter(row=>row.stockVariance!=null).reduce((sum,row)=>sum+Math.abs(Number(row.stockVariance||0)),0);
      const sellThrough = hasOpeningEvidence && openingUnits+suppliedUnits>0 ? (soldUnits/(openingUnits+suppliedUnits))*100 : null;
      const allAnomalies = [...stockRiskRows,...riskRows];
      const atRisk = new Set(allAnomalies.map(row=>row.branch).filter(Boolean)).size;

      return { hqRevenue, prevHqRevenue, posRevenue, prevPosRevenue, target, attainment, gap, coverage, unexplained, sellThrough, atRisk, branchRows, brandRows, anomalies:allAnomalies, skuRows, trend };
    }, [month, branch, brand, rawOrders, rawInventory, transactions, branchCatalog, brandOptions, growthTargetPct]);

    const normalizedOverview = useMemo(() => {
      const o = overviewApi || {};
      const hqRevenue = b2bNullableNum(o?.hqSupplyRevenue, o?.hq_supply_revenue, o?.supplyRevenue, o?.franchisyncSupplyRevenue);
      const posRevenue = b2bNullableNum(o?.posRevenue, o?.pos_revenue, o?.franchiseePosRevenue, o?.franchisee_pos_revenue);
      const target = b2bNullableNum(o?.monthlyTarget, o?.monthly_target, o?.target);
      const targetGap = b2bNullableNum(o?.targetGap, o?.target_gap, target != null && hqRevenue != null ? Math.max(0,target-hqRevenue) : null);
      const targetAttainment = b2bNullableNum(o?.targetAttainment, o?.target_attainment, o?.targetAttainmentPct, o?.target_attainment_pct, target && hqRevenue != null ? hqRevenue/target*100 : null);
      const coverage = b2bNullableNum(o?.orderCoverage, o?.order_coverage, o?.coveragePct, o?.coverage_pct);
      const atRisk = b2bNullableNum(o?.atRiskBranches, o?.at_risk_branches, o?.riskCount, o?.risk_count);
      const unexplained = b2bNullableNum(o?.unexplainedStock, o?.unexplained_stock, o?.unexplainedStockUnits, o?.unexplained_stock_units);
      const sellThrough = b2bNullableNum(o?.sellThrough, o?.sell_through, o?.sellThroughPct, o?.sell_through_pct);
      const prevHqRevenue = b2bNullableNum(o?.previousHqSupplyRevenue, o?.previous_hq_supply_revenue, o?.prevHqRevenue, o?.prev_hq_revenue);
      const prevPosRevenue = b2bNullableNum(o?.previousPosRevenue, o?.previous_pos_revenue, o?.prevPosRevenue, o?.prev_pos_revenue);
      return {
        hqRevenue: hqRevenue ?? fallback.hqRevenue,
        posRevenue: posRevenue ?? fallback.posRevenue,
        target: target ?? fallback.target,
        targetGap: targetGap ?? fallback.gap,
        targetAttainment: targetAttainment ?? fallback.attainment,
        coverage: coverage ?? fallback.coverage,
        atRisk: atRisk ?? (sourceMode==="fallback" ? fallback.atRisk : 0),
        unexplained: unexplained ?? fallback.unexplained,
        sellThrough: sellThrough ?? fallback.sellThrough,
        prevHqRevenue: prevHqRevenue ?? fallback.prevHqRevenue,
        prevPosRevenue: prevPosRevenue ?? fallback.prevPosRevenue,
      };
    }, [overviewApi, fallback, sourceMode]);

    const branchRows = useMemo(() => {
      if (sourceMode === "fallback" || !branchesApi.length) {
        return fallback.branchRows.filter(r => risk === "all" || String(r.risk).toLowerCase().includes(risk.toLowerCase().replace("high-risk", "high")));
      }
      return branchesApi.map((r,i)=>({
        id:r?.branch_id ?? r?.id ?? r?.branch ?? i,
        branch:String(r?.branch_name || r?.branch || r?.name || "Unknown Branch"),
        location:String(r?.location || r?.address || "—"),
        hqRevenue:b2bNum(r?.hq_supply_revenue, r?.hqRevenue, r?.supply_revenue),
        posRevenue:b2bNum(r?.pos_revenue, r?.posRevenue, r?.franchisee_pos_revenue),
        vsLastMonth:b2bNullableNum(r?.mom_growth, r?.vs_last_month, r?.hq_growth_pct),
        targetPct:b2bNullableNum(r?.target_pct, r?.targetAttainment, r?.target_attainment_pct),
        targetGap:b2bNullableNum(r?.target_gap, r?.targetGap, r?.revenue_gap),
        prevHqRevenue:b2bNullableNum(r?.previous_hq_supply_revenue, r?.prevHqRevenue, r?.previous_revenue),
        orderCoverage:b2bNullableNum(r?.order_coverage, r?.coverage_pct, r?.orderCoverage),
        stockVariance:b2bNullableNum(r?.stock_variance, r?.stockVariance),
        risk:String(r?.risk || r?.risk_status || r?.anomaly_status || "Normal"),
        reason:String(r?.reason || r?.risk_reason || ""),
      })).filter(r=>(!branch||r.branch===branch)&&(!risk||risk==="all"||String(r.risk).toLowerCase().includes(risk.toLowerCase().replace("high-risk","high"))));
    }, [sourceMode, branchesApi, fallback.branchRows, branch, risk]);

    const brandRows = useMemo(() => {
      if (sourceMode === "fallback" || !brandsApi.length) return fallback.brandRows;
      return brandsApi.map((r,i)=>({
        id:r?.brand_id ?? r?.id ?? r?.brand ?? i,
        brand:String(r?.brand_name || r?.brand || r?.name || "Unknown Brand"),
        hqRevenue:b2bNum(r?.hq_supply_revenue, r?.hqRevenue, r?.supply_revenue),
        posRevenue:b2bNum(r?.pos_revenue, r?.posRevenue),
        suppliedQty:b2bNum(r?.supplied_qty, r?.qty_supplied, r?.quantity_supplied),
        soldQty:b2bNum(r?.sold_qty, r?.qty_sold, r?.quantity_sold),
        endingStock:b2bNullableNum(r?.ending_stock, r?.closing_stock, r?.on_hand),
        sellThrough:b2bNullableNum(r?.sell_through, r?.sell_through_pct),
        stockVariance:b2bNullableNum(r?.stock_variance, r?.stockVariance),
      })).filter(r=>!brand||r.brand===brand);
    }, [sourceMode, brandsApi, fallback.brandRows, brand]);

    const anomalies = useMemo(() => {
      const rows = sourceMode === "fallback" || !anomaliesApi.length
        ? fallback.anomalies
        : anomaliesApi.map((r,i)=>({
            id:r?.id ?? i,
            branch:String(r?.branch_name || r?.branch || "—"),
            brand:String(r?.brand_name || r?.brand || ""),
            sku:String(r?.sku || r?.product_name || ""),
            severity:String(r?.severity || r?.risk || "Watch"),
            rule:String(r?.rule || r?.rule_name || r?.anomaly || "Anomaly"),
            reason:String(r?.reason || r?.message || "Review supporting evidence."),
            gapValue:b2bNullableNum(r?.gap_value, r?.value_gap, r?.amount_gap),
            recommendation:String(r?.recommendation || "Review linked order, POS, and inventory evidence."),
          }));
      return rows.filter(r=>risk==="all" || String(r.severity).toLowerCase().includes(risk.toLowerCase().replace("high-risk","high")));
    }, [sourceMode, anomaliesApi, fallback.anomalies, risk]);

    const trendData = useMemo(() => {
      const o = overviewApi || {};
      const raw = b2bArray(o?.trend || o?.monthlyTrend || o?.monthly_trend || o?.revenueTrend || o?.revenue_trend);
      if (!raw.length) return fallback.trend;
      const mapped = raw.map((r,i)=>({
        month:String(r?.month || r?.period || ""),
        label:String(r?.label || (r?.month ? b2bMonthLabel(r.month).replace(/\s\d{4}$/,"|") : `M${i+1}`)).replace("|", ""),
        hqRevenue:b2bNum(r?.hq_supply_revenue, r?.hqRevenue, r?.supply_revenue),
        posRevenue:b2bNum(r?.pos_revenue, r?.posRevenue),
        targetRevenue:b2bNullableNum(r?.target_revenue, r?.targetRevenue, r?.monthly_target, r?.target),
      }));
      return mapped.map((row,index)=>({
        ...row,
        targetRevenue:row.targetRevenue ?? (index>0 ? mapped[index-1].hqRevenue*(1+growthTargetPct/100) : 0),
      }));
    }, [overviewApi, fallback.trend, growthTargetPct]);

    const skuRows = fallback.skuRows;

    const sortedBranchRows = useMemo(() => [...branchRows].sort((a,b)=>{
      const rank = v => String(v||"").toLowerCase().includes("high") ? 3 : (String(v||"").toLowerCase().includes("watch") || String(v||"").toLowerCase().includes("medium")) ? 2 : 1;
      return (rank(b.risk)-rank(a.risk)) || ((b.targetGap||0)-(a.targetGap||0)) || (b.hqRevenue-a.hqRevenue);
    }), [branchRows]);

    const monthlyLeaders = useMemo(() => {
      const byHq = [...branchRows].sort((a,b)=>Number(b.hqRevenue||0)-Number(a.hqRevenue||0));
      const byPos = [...branchRows].sort((a,b)=>Number(b.posRevenue||0)-Number(a.posRevenue||0));
      const byBrand = [...brandRows].sort((a,b)=>Number(b.hqRevenue||0)-Number(a.hqRevenue||0));
      const leakage = [...branchRows].sort((a,b)=>{
        const aGap = Number(a.posRevenue||0)-Number(a.hqRevenue||0);
        const bGap = Number(b.posRevenue||0)-Number(b.hqRevenue||0);
        return bGap-aGap;
      });
      return { hqBranch:byHq[0]||null, posBranch:byPos[0]||null, hqBrand:byBrand[0]||null, leakageBranch:leakage[0]||null };
    }, [branchRows, brandRows]);

    const openKpi = (metric, title) => setDrilldown({
      type:"kpi",
      title:title || metric,
      loading:false,
      data:{ metric },
    });

    const openBranch = async (row) => {
      setDrilldown({ type:"branch", title:row.branch, loading:true, data:row });
      if (sourceMode === "aggregated") {
        try {
          const data = await fetchJson(`${API}/dashboard/b2b/branches/${encodeURIComponent(row.id)}?month=${encodeURIComponent(month)}`);
          setDrilldown({ type:"branch", title:row.branch, loading:false, data:{ ...row, ...(data?.data || data) } });
          return;
        } catch {}
      }
      setDrilldown({ type:"branch", title:row.branch, loading:false, data:row });
    };

    const openBrand = async (row) => {
      setDrilldown({ type:"brand", title:row.brand, loading:true, data:row });
      const selectedBranchRow = branch ? branchCatalog.find(b=>b.name===branch) : null;
      if (sourceMode === "aggregated" && selectedBranchRow) {
        try {
          const data = await fetchJson(`${API}/dashboard/b2b/branches/${encodeURIComponent(selectedBranchRow.id)}/brands/${encodeURIComponent(row.id)}?month=${encodeURIComponent(month)}`);
          setDrilldown({ type:"brand", title:row.brand, loading:false, data:{ ...row, ...(data?.data || data) } });
          return;
        } catch {}
      }
      setDrilldown({ type:"brand", title:row.brand, loading:false, data:row });
    };

    const openSku = async (row) => {
      setDrilldown({ type:"sku", title:row.product, loading:true, data:row });
      const selectedBranchRow = branch ? branchCatalog.find(b=>b.name===branch) : null;
      if (sourceMode === "aggregated" && selectedBranchRow) {
        try {
          const q = new URLSearchParams({ branchId:String(selectedBranchRow.id), productId:String(row.id), month });
          const data = await fetchJson(`${API}/dashboard/b2b/reconcile?${q.toString()}`);
          setDrilldown({ type:"sku", title:row.product, loading:false, data:{ ...row, ...(data?.data || data) } });
          return;
        } catch {}
      }
      setDrilldown({ type:"sku", title:row.product, loading:false, data:row, warning:"Full opening/receipt/POS/disposal/transfer/manual-adjustment evidence needs the B2B reconciliation endpoint and inventory movement references." });
    };

    const stockDataReady = normalizedOverview.coverage != null || normalizedOverview.unexplained != null || normalizedOverview.sellThrough != null || branchRows.some(r=>r.stockVariance!=null || r.orderCoverage!=null) || brandRows.some(r=>r.endingStock!=null || r.stockVariance!=null);
    const hqMoM = normalizedOverview.prevHqRevenue > 0 ? ((normalizedOverview.hqRevenue-normalizedOverview.prevHqRevenue)/normalizedOverview.prevHqRevenue)*100 : null;
    const posMoM = normalizedOverview.prevPosRevenue > 0 ? ((normalizedOverview.posRevenue-normalizedOverview.prevPosRevenue)/normalizedOverview.prevPosRevenue)*100 : null;
    const hasPreviousHqRevenue = Number(normalizedOverview.prevHqRevenue || 0) > 0;
    const hqRevenueDifference = Number(normalizedOverview.hqRevenue || 0) - Number(normalizedOverview.prevHqRevenue || 0);
    const hqRevenueDirection = !hasPreviousHqRevenue ? "neutral" : hqRevenueDifference > 0 ? "up" : hqRevenueDifference < 0 ? "down" : "same";
    const hqRevenueStatus = hqRevenueDirection === "up"
      ? { label:"REVENUE UP", title:"Head Office revenue is higher this month", color:"#2c5c16", bg:"#f0f5e8", border:"#c9dba0", icon:TrendingUp }
      : hqRevenueDirection === "down"
        ? { label:"REVENUE DOWN", title:"Head Office revenue is lower this month", color:"#b42318", bg:"#fef3f2", border:"#fecaca", icon:TrendingDown }
        : hqRevenueDirection === "same"
          ? { label:"NO CHANGE", title:"Head Office revenue is unchanged", color:"#7c5d12", bg:"#fffbeb", border:"#fde68a", icon:Activity }
          : { label:"NO BASELINE", title:"Head Office monthly comparison is not available yet", color:"#5C6B60", bg:"#F6F7F1", border:"#E1E6D8", icon:Info };
    const HqStatusIcon = hqRevenueStatus.icon;
    const isOverviewView = view === "overview";
    const isGhostView = view === "ghost";

    const franchisorActions = useMemo(() => {
      const items = [];
      const highRiskCount = branchRows.filter(r=>String(r.risk||"").toLowerCase().includes("high")).length;
      const topAnomaly = anomalies[0];
      const targetGap = Number(normalizedOverview.targetGap || 0);
      const unexplained = Number(normalizedOverview.unexplained || 0);
      const coverage = normalizedOverview.coverage;

      if (targetGap > 0) items.push({
        priority:"Revenue priority",
        tone:"amber",
        title:`Close the ${fmtAmt(targetGap)} HQ revenue gap`,
        evidence:`Current HQ supply revenue is ${normalizedOverview.targetAttainment==null?"below target":`${Math.max(0,100-normalizedOverview.targetAttainment).toFixed(1)}% short of target`}.`,
        action:"Review branches with weak ordering activity, confirm upcoming replenishment needs, and validate whether the target remains realistic.",
      });

      if (highRiskCount > 0 || Number(normalizedOverview.atRisk || 0) > 0) items.push({
        priority:"Loss investigation",
        tone:"red",
        title:`Investigate ${Math.max(highRiskCount,Number(normalizedOverview.atRisk||0))} at-risk branch${Math.max(highRiskCount,Number(normalizedOverview.atRisk||0))===1?"":"es"}`,
        evidence:topAnomaly?.reason || "Revenue, HQ ordering, or stock movement is inconsistent at one or more branches.",
        action:topAnomaly?.recommendation || "Open Ghost Stock Anomalies, start with the highest-risk branch, then reconcile the affected SKU records.",
      });

      if (unexplained > 0) items.push({
        priority:"Inventory control",
        tone:"red",
        title:`Reconcile ${unexplained.toLocaleString()} unexplained stock unit${unexplained===1?"":"s"}`,
        evidence:"Recorded closing stock does not fully agree with opening stock, HQ receipts, POS sales, disposal, and transfers.",
        action:"Require physical counts and source references before approving adjustments or new replenishment.",
      });

      if (coverage != null && coverage < 70) items.push({
        priority:"Supply assurance",
        tone:"amber",
        title:`Improve HQ order coverage from ${Number(coverage).toFixed(1)}%`,
        evidence:"A material portion of reported sell-through is not supported by authorized HQ stock flow.",
        action:"Verify external sourcing, missing receipts, unposted transfers, and delayed mobile-order acknowledgements.",
      });

      if (!items.length) items.push({
        priority:"Healthy position",
        tone:"green",
        title:"No immediate revenue or stock-control exception",
        evidence:"Current targets, risk rules, and available reconciliation evidence show no material exception.",
        action:"Maintain controls, review the AI forecast, and continue monitoring changes by branch and SKU.",
      });

      return items.slice(0,3);
    }, [branchRows, anomalies, normalizedOverview]);

    const tableWrap = { overflowX:"auto", border:"1px solid #E7EEE4", borderRadius:13 };
    const th = { padding:"10px 11px", fontSize:9.5, fontWeight:800, textTransform:"uppercase", letterSpacing:".06em", color:"#71806F", background:"#F6FAF3", borderBottom:"1px solid #DDE8DA", whiteSpace:"nowrap" };
    const td = { padding:"11px", fontSize:11, color:"#334155", borderBottom:"1px solid #EEF3EC", whiteSpace:"nowrap" };
    const sectionCard = { background:"#fff", border:"1px solid #E1E6D8", borderRadius:18, padding:"18px 20px", boxShadow:"0 2px 14px rgba(50,109,32,.06)" };

    return (
      <div style={{ fontFamily:FONT, marginBottom:22 }}>
        <style>{`
          .b2b-kpi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.b2b-overview-kpi-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.b2b-two-col{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(300px,.8fr);gap:15px}.b2b-overview-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:14px}.b2b-filter-grid{display:grid;grid-template-columns:160px minmax(170px,1fr) minmax(170px,1fr) minmax(145px,.8fr) 125px;gap:10px;align-items:end}.b2b-brand-grid{display:grid;grid-template-columns:1fr;gap:12px}.b2b-hq-summary-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:13px}@media(max-width:1180px){.b2b-kpi-grid,.b2b-overview-kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.b2b-two-col,.b2b-overview-grid{grid-template-columns:1fr}.b2b-filter-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.franchisor-action-row{grid-template-columns:1fr 1fr!important}.franchisor-action-row>div:last-child{grid-column:1/-1}}@media(max-width:680px){.b2b-kpi-grid,.b2b-overview-kpi-grid,.b2b-filter-grid,.b2b-hq-summary-grid{grid-template-columns:1fr}.b2b-filter-grid button{width:100%}.franchisor-action-row{grid-template-columns:1fr!important}.franchisor-action-row>div:last-child{grid-column:auto}}
        `}</style>

        {isOverviewView && (
        <div style={{ ...sectionCard, marginBottom:14, padding:"17px 18px", border:`1px solid ${hqRevenueStatus.border}`, borderLeft:`5px solid ${hqRevenueStatus.color}`, background:hqRevenueStatus.bg }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:14, flexWrap:"wrap" }}>
            <div style={{ minWidth:260, flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:6 }}>
                <HqStatusIcon size={17} color={hqRevenueStatus.color}/>
                <span style={{ fontSize:10, fontWeight:850, letterSpacing:".08em", textTransform:"uppercase", color:hqRevenueStatus.color }}>Head Office Monthly Performance</span>
              </div>
              <div style={{ fontSize:18, fontWeight:850, color:"#12241B", lineHeight:1.25 }}>{hqRevenueStatus.title}</div>
              <div style={{ marginTop:5, fontSize:11.5, color:"#5C6B60", lineHeight:1.5 }}>
                {hasPreviousHqRevenue
                  ? <>This month is <b style={{color:hqRevenueStatus.color}}>{Math.abs(hqMoM || 0).toFixed(1)}% {hqRevenueDifference >= 0 ? "higher" : "lower"}</b> than last month based on total fulfilled/delivered Head Office supply orders.</>
                  : <>There is no previous-month Head Office supply revenue available yet for comparison.</>}
              </div>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <span style={{ padding:"6px 10px", borderRadius:999, background:"#fff", border:`1px solid ${hqRevenueStatus.border}`, color:hqRevenueStatus.color, fontSize:10, fontWeight:850 }}>{hqRevenueStatus.label}</span>
              <button onClick={loadB2B} disabled={loading} style={{ display:"inline-flex", alignItems:"center", gap:6, border:"1px solid #DDE8DA", background:"#fff", color:"#3b791e", borderRadius:9, padding:"7px 10px", fontSize:10.5, fontWeight:800, cursor:loading?"wait":"pointer" }}><RefreshCw size={12} style={{animation:loading?"spin .8s linear infinite":"none"}}/>Refresh</button>
            </div>
          </div>

          <div className="b2b-hq-summary-grid">
            <B2BSummaryMetricCard
              label="This Month"
              value={fmtAmt(normalizedOverview.hqRevenue)}
              loading={loading}
              border={hqRevenueStatus.border}
              onClick={()=>openKpi("hqRevenue", "Current HQ Supply Revenue")}
            />
            <B2BSummaryMetricCard
              label="Last Month"
              value={hasPreviousHqRevenue ? fmtAmt(normalizedOverview.prevHqRevenue) : "—"}
              loading={loading}
              border={hqRevenueStatus.border}
              onClick={()=>openKpi("hqPrevious", "Previous-Month HQ Supply Revenue")}
            />
            <B2BSummaryMetricCard
              label="Month-on-Month Change"
              value={hasPreviousHqRevenue ? `${hqRevenueDifference >= 0 ? "+" : "−"}${fmtAmt(Math.abs(hqRevenueDifference))}` : "—"}
              loading={loading}
              color={hqRevenueStatus.color}
              border={hqRevenueStatus.border}
              onClick={()=>openKpi("hqChange", "HQ Month-on-Month Change")}
            />
          </div>
        </div>
        )}

        <div style={{ ...sectionCard, padding:"15px 16px", marginBottom:14 }}>
          <div className="b2b-filter-grid">
            <label><span style={{fontSize:9.5,fontWeight:800,color:"#71806F",textTransform:"uppercase",letterSpacing:".06em"}}>Month</span><input type="month" value={month} onChange={e=>setMonth(e.target.value)} style={{...invInputSt,marginTop:5,height:37}}/></label>
            <label><span style={{fontSize:9.5,fontWeight:800,color:"#71806F",textTransform:"uppercase",letterSpacing:".06em"}}>Brand</span><select value={brand} onChange={e=>setBrand(e.target.value)} style={{...invInputSt,marginTop:5,height:37}}><option value="">All Brands</option>{brandOptions.map(b=><option key={b.id} value={b.name}>{b.name}</option>)}</select></label>
            <label><span style={{fontSize:9.5,fontWeight:800,color:"#71806F",textTransform:"uppercase",letterSpacing:".06em"}}>Branch / Location</span><select value={branch} onChange={e=>setBranch(e.target.value)} style={{...invInputSt,marginTop:5,height:37}}><option value="">All Branches</option>{branchOptions.map(b=><option key={b.id} value={b.name}>{b.name}{b.location&&b.location!=="—"?` — ${b.location}`:""}</option>)}</select></label>
            <label><span style={{fontSize:9.5,fontWeight:800,color:"#71806F",textTransform:"uppercase",letterSpacing:".06em"}}>Risk Status</span><select value={risk} onChange={e=>setRisk(e.target.value)} style={{...invInputSt,marginTop:5,height:37}}><option value="all">All Statuses</option><option value="high">High Risk</option><option value="watch">Watch</option><option value="normal">Normal</option></select></label>
            <label><span style={{fontSize:9.5,fontWeight:800,color:"#71806F",textTransform:"uppercase",letterSpacing:".06em"}}>Target Growth %</span><input type="number" min="0" max="500" value={growthTargetPct} onChange={e=>setGrowthTargetPct(Math.max(0,Number(e.target.value)||0))} style={{...invInputSt,marginTop:5,height:37}}/></label>
          </div>
        </div>

        {loadError && <div style={{ marginBottom:12, padding:"10px 12px", borderRadius:10, background:"#fef2f2", border:"1px solid #fecaca", color:"#991b1b", fontSize:11.5, display:"flex", gap:7, alignItems:"flex-start" }}><AlertTriangle size={14} style={{flexShrink:0,marginTop:1}}/>{loadError}</div>}
        {sourceMode === "fallback" && <div style={{ marginBottom:12, padding:"10px 12px", borderRadius:10, background:"#fffbeb", border:"1px solid #fde68a", color:"#92400e", fontSize:10.8, lineHeight:1.5, display:"flex", gap:7, alignItems:"flex-start" }}><Info size={14} style={{flexShrink:0,marginTop:1}}/><span>This view is using your existing Mobile Orders, POS transactions, and branch inventory endpoints. Exact historical ghost-stock proof still requires dated opening/closing counts and inventory movements linked to their source order, sale, disposal, or transfer.</span></div>}

        {isOverviewView && (
          <div style={{ ...sectionCard, marginBottom:15, padding:"18px 19px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:14, flexWrap:"wrap", marginBottom:13 }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:15, fontWeight:850, color:"#12241B" }}><Brain size={16} color="#3b791e"/> Franchisor Decision Summary</div>
                <div style={{ fontSize:10.8, color:"#6B7A65", marginTop:4 }}>What needs attention now, why it matters, and the next business action.</div>
              </div>
              <button onClick={onOpenSalesAi} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 11px", borderRadius:9, border:"1px solid #C9DBA0", background:"#F4F8F0", color:"#2c5c16", fontSize:10.5, fontWeight:850, cursor:"pointer", fontFamily:FONT }}>Open Sales &amp; AI Guidance <ChevronRight size={12}/></button>
            </div>
            <div style={{ display:"grid", gap:9 }}>
              {franchisorActions.map((item,index)=>{
                const tone = item.tone === "red"
                  ? { accent:"#c0392b", bg:"#fff7f7", border:"#f2c9c4", badge:"#fee2e2" }
                  : item.tone === "amber"
                    ? { accent:"#b45309", bg:"#fffbeb", border:"#fde68a", badge:"#fef3c7" }
                    : { accent:"#2c5c16", bg:"#f4f8f0", border:"#c9dba0", badge:"#eaf3df" };
                return <div className="franchisor-action-row" key={`${item.priority}-${index}`} style={{ display:"grid", gridTemplateColumns:"minmax(145px,.42fr) minmax(220px,.8fr) minmax(280px,1.25fr)", gap:13, padding:"12px 13px", borderRadius:12, border:`1px solid ${tone.border}`, borderLeft:`4px solid ${tone.accent}`, background:tone.bg, alignItems:"start" }}>
                  <div><span style={{ display:"inline-flex", padding:"4px 8px", borderRadius:20, background:tone.badge, color:tone.accent, fontSize:9.3, fontWeight:900, textTransform:"uppercase", letterSpacing:".055em" }}>{index + 1}. {item.priority}</span><div style={{ fontSize:12, fontWeight:850, color:"#12241B", marginTop:7, lineHeight:1.4 }}>{item.title}</div></div>
                  <div><div style={{ fontSize:9.2, fontWeight:850, color:"#71806F", textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>Evidence</div><div style={{ fontSize:10.7, color:"#526052", lineHeight:1.55 }}>{item.evidence}</div></div>
                  <div><div style={{ fontSize:9.2, fontWeight:850, color:tone.accent, textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>Recommended next step</div><div style={{ fontSize:10.8, color:"#26372B", lineHeight:1.55, fontWeight:650 }}>{item.action}</div></div>
                </div>;
              })}
            </div>
          </div>
        )}

        {isGhostView && (
          <div style={{ ...sectionCard, marginBottom:15, padding:"15px 17px", borderLeft:"5px solid #c0392b", background:"linear-gradient(135deg,#fff,#fff8f7)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:14, flexWrap:"wrap" }}>
              <div><div style={{ display:"flex", alignItems:"center", gap:7, fontSize:14.5, fontWeight:850, color:"#12241B" }}><ShieldCheck size={16} color="#c0392b"/> Loss Investigation Workflow</div><div style={{ fontSize:10.8, color:"#6B7A65", marginTop:4 }}>Start with a risk branch, identify the affected SKU, verify movement evidence, then assign the corrective action.</div></div>
              <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>{["1  Risk branch","2  Affected SKU","3  Movement evidence","4  Corrective action"].map((step,i)=><React.Fragment key={step}><span style={{ padding:"6px 9px", borderRadius:20, background:i===0?"#fee2e2":"#F6F7F1", color:i===0?"#991b1b":"#526052", border:`1px solid ${i===0?"#fecaca":"#DDE8DA"}`, fontSize:9.7, fontWeight:850 }}>{step}</span>{i<3&&<ChevronRight size={12} color="#94a3b8"/>}</React.Fragment>)}</div>
            </div>
          </div>
        )}

        {isOverviewView && (
        <div className="b2b-kpi-grid b2b-overview-kpi-grid" style={{marginBottom:12}}>
          <B2BMetricCard label="FranchiSync Supply Revenue" value={fmtAmt(normalizedOverview.hqRevenue)} icon={Package} tone="green" loading={loading} onClick={()=>openKpi("hqRevenue", "FranchiSync Supply Revenue")} note={`${hqMoM==null?"No prior-month baseline":`${hqMoM>=0?"+":""}${hqMoM.toFixed(1)}% vs last month`} · fulfilled/delivered HQ orders`} />
          <B2BMetricCard label="Monthly Target" value={hasPreviousHqRevenue?fmtAmt(normalizedOverview.target):"—"} icon={Target} tone="amber" loading={loading} onClick={()=>openKpi("target", "Monthly Target")} note={hasPreviousHqRevenue?`${normalizedOverview.targetAttainment==null?"—":`${normalizedOverview.targetAttainment.toFixed(1)}%`} attained · ${growthTargetPct}% above previous HQ supply revenue`:"Target appears after a previous-month HQ baseline is available"} />
          <B2BMetricCard label="Target Gap" value={hasPreviousHqRevenue?fmtAmt(normalizedOverview.targetGap):"—"} icon={TrendingDown} tone={normalizedOverview.targetGap>0?"red":"green"} loading={loading} onClick={()=>openKpi("targetGap", "Target Gap")} note={!hasPreviousHqRevenue?"No previous-month baseline":normalizedOverview.targetGap>0?"HQ supply revenue still needed to hit target":"Target achieved for the selected month"} />
          <B2BMetricCard label="Franchisee POS Revenue" value={fmtAmt(normalizedOverview.posRevenue)} icon={ShoppingCart} tone="blue" loading={loading} onClick={()=>openKpi("posRevenue", "Franchisee POS Revenue")} note={`${posMoM==null?"No prior-month baseline":`${posMoM>=0?"+":""}${posMoM.toFixed(1)}% vs last month`} · paid/completed POS`} />
          <B2BMetricCard label="HQ Supply Coverage" value={normalizedOverview.coverage==null?"—":`${normalizedOverview.coverage.toFixed(1)}%`} icon={ShieldCheck} tone={normalizedOverview.coverage!=null&&normalizedOverview.coverage<70?"red":"green"} loading={loading} onClick={()=>openKpi("coverage", "HQ Supply Coverage")} note={normalizedOverview.coverage==null?"Needs verified opening stock and inventory movements":"Share of sold units supported by official stock flow"} />
          <B2BMetricCard label="At-Risk Branches" value={Number(normalizedOverview.atRisk||0).toLocaleString()} icon={AlertTriangle} tone={normalizedOverview.atRisk>0?"red":"green"} loading={loading} onClick={()=>openKpi("atRisk", "At-Risk Branches")} note="High POS with weak HQ ordering or stock mismatch" />
        </div>
        )}

        {isGhostView && (
        <div className="b2b-kpi-grid" style={{marginBottom:15}}>
          <B2BMetricCard label="HQ Order Coverage" value={normalizedOverview.coverage==null?"—":`${normalizedOverview.coverage.toFixed(1)}%`} icon={ShieldCheck} tone={normalizedOverview.coverage!=null&&normalizedOverview.coverage<70?"red":"green"} loading={loading} onClick={()=>openKpi("coverage", "HQ Order Coverage")} note={normalizedOverview.coverage==null?"Requires authorized stock-flow reconciliation":"Authorized HQ stock coverage of reported sell-through"} />
          <B2BMetricCard label="At-Risk Branches" value={Number(normalizedOverview.atRisk||0).toLocaleString()} icon={AlertTriangle} tone={normalizedOverview.atRisk>0?"red":"green"} loading={loading} onClick={()=>openKpi("atRisk", "At-Risk Branches")} note={`${anomalies.filter(a=>String(a.severity).toLowerCase().includes("high")).length} high-risk · ranked anomaly list`} />
          <B2BMetricCard label="Unexplained Stock" value={normalizedOverview.unexplained==null?"—":Number(normalizedOverview.unexplained).toLocaleString()} icon={Layers} tone={normalizedOverview.unexplained>0?"red":"green"} loading={loading} onClick={()=>openKpi("unexplained", "Unexplained Stock")} note={normalizedOverview.unexplained==null?"Requires opening/receipts/transfers/POS/disposal linkage":"Positive/negative stock variance requiring investigation"} />
          <B2BMetricCard label="Sell-through" value={normalizedOverview.sellThrough==null?"—":`${normalizedOverview.sellThrough.toFixed(1)}%`} icon={Activity} tone="green" loading={loading} onClick={()=>openKpi("sellThrough", "Sell-through")} note={normalizedOverview.sellThrough==null?"Requires sellable-unit stock flow":"POS sold units ÷ sellable units available"} />
        </div>
        )}

        {isOverviewView && <div style={{ ...sectionCard, marginBottom:15 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:12, flexWrap:"wrap" }}><div><div style={{fontSize:15,fontWeight:800,color:"#12241B"}}>6-Month Supply Revenue vs POS Revenue</div><div style={{fontSize:10.8,color:"#6B7A65",marginTop:3,lineHeight:1.5}}>Green is FranchiSync supply revenue, blue is franchisee POS revenue, and the dashed line is the HQ target. If POS stays high while supply revenue falls, inspect the affected branch. Click a month to focus the dashboard.</div></div><div style={{fontSize:10.5,color:"#5C6B60",fontWeight:700}}>{b2bMonthLabel(month)}</div></div>
          <B2BDualTrendChart data={trendData} onPointClick={d=>{ if(d?.month) setMonth(d.month); }} />
        </div>}

        {isOverviewView && (
        <div className="b2b-overview-grid" style={{marginBottom:15}}>
          <div style={sectionCard}>
            <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start",marginBottom:11,flexWrap:"wrap"}}>
              <div><div style={{fontSize:15,fontWeight:800,color:"#12241B"}}>Branch Performance</div><div style={{fontSize:10.8,color:"#6B7A65",marginTop:3}}>Monthly supply orders versus POS revenue by store location</div></div>
              <div style={{fontSize:9.8,color:"#5C6B60",textAlign:"right",lineHeight:1.5}}>Top HQ branch: <b style={{color:"#2c5c16"}}>{monthlyLeaders.hqBranch?.branch||"—"}</b><br/>Highest POS: <b style={{color:"#2563eb"}}>{monthlyLeaders.posBranch?.branch||"—"}</b></div>
            </div>
            <div style={tableWrap}><table style={{width:"100%",borderCollapse:"collapse",minWidth:650}}><thead><tr>{["Branch / Location","HQ Supply","POS Revenue","Coverage","Status"].map((h,i)=><th key={h} style={{...th,textAlign:i===0?"left":"right"}}>{h}</th>)}</tr></thead><tbody>{[...branchRows].sort((a,b)=>Number(b.hqRevenue||0)-Number(a.hqRevenue||0)).slice(0,8).map((r,i)=><tr key={r.id} onClick={()=>openBranch(r)} style={{cursor:"pointer",background:i%2?"#FBFDF9":"#fff"}} onMouseEnter={e=>e.currentTarget.style.background="#F4F8F0"} onMouseLeave={e=>e.currentTarget.style.background=i%2?"#FBFDF9":"#fff"}><td style={{...td,fontWeight:800,color:"#12241B"}}><div>{r.branch}</div><div style={{fontSize:9.4,fontWeight:500,color:"#8A9687",marginTop:2}}>{r.location||"—"}</div></td><td style={{...td,textAlign:"right",fontWeight:800,color:"#3b791e"}}>{fmtAmt(r.hqRevenue)}</td><td style={{...td,textAlign:"right",fontWeight:800,color:"#2563eb"}}>{fmtAmt(r.posRevenue)}</td><td style={{...td,textAlign:"right",fontWeight:750}}>{r.orderCoverage==null?"—":`${r.orderCoverage.toFixed(1)}%`}</td><td style={{...td,textAlign:"right"}}><B2BRiskBadge risk={r.risk}/></td></tr>)}{!branchRows.length&&<tr><td colSpan="5" style={{padding:26,textAlign:"center",fontSize:10.8,color:"#82907F"}}>No branch data for the selected month.</td></tr>}</tbody></table></div>
          </div>

          <div style={sectionCard}>
            <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start",marginBottom:11,flexWrap:"wrap"}}>
              <div><div style={{fontSize:15,fontWeight:800,color:"#12241B"}}>Brand Performance</div><div style={{fontSize:10.8,color:"#6B7A65",marginTop:3}}>Which brand earns the most for FranchiSync this month</div></div>
              <div style={{fontSize:9.8,color:"#5C6B60",textAlign:"right",lineHeight:1.5}}>Top brand: <b style={{color:"#2c5c16"}}>{monthlyLeaders.hqBrand?.brand||"—"}</b><br/>Largest POS–HQ gap: <b style={{color:"#b42318"}}>{monthlyLeaders.leakageBranch?.branch||"—"}</b></div>
            </div>
            <div style={tableWrap}><table style={{width:"100%",borderCollapse:"collapse",minWidth:540}}><thead><tr>{["Brand","HQ Supply","POS Revenue","Supplied / Sold"].map((h,i)=><th key={h} style={{...th,textAlign:i===0?"left":"right"}}>{h}</th>)}</tr></thead><tbody>{[...brandRows].sort((a,b)=>Number(b.hqRevenue||0)-Number(a.hqRevenue||0)).slice(0,8).map((r,i)=><tr key={r.id} onClick={()=>openBrand(r)} style={{cursor:"pointer",background:i%2?"#FBFDF9":"#fff"}} onMouseEnter={e=>e.currentTarget.style.background="#F4F8F0"} onMouseLeave={e=>e.currentTarget.style.background=i%2?"#FBFDF9":"#fff"}><td style={{...td,fontWeight:800,color:"#12241B"}}>{r.brand}</td><td style={{...td,textAlign:"right",fontWeight:800,color:"#3b791e"}}>{fmtAmt(r.hqRevenue)}</td><td style={{...td,textAlign:"right",fontWeight:800,color:"#2563eb"}}>{fmtAmt(r.posRevenue)}</td><td style={{...td,textAlign:"right",fontWeight:750}}>{Number(r.suppliedQty||0).toLocaleString()} / {Number(r.soldQty||0).toLocaleString()}</td></tr>)}{!brandRows.length&&<tr><td colSpan="4" style={{padding:26,textAlign:"center",fontSize:10.8,color:"#82907F"}}>No brand data for the selected month.</td></tr>}</tbody></table></div>
          </div>
        </div>
        )}

        {isGhostView && (
        <div className="b2b-two-col" style={{marginBottom:15,gridTemplateColumns:"1fr"}}>
          <div style={sectionCard}>
            <div style={{ display:"flex", justifyContent:"space-between", gap:12, marginBottom:12, alignItems:"flex-start" }}><div><div style={{fontSize:15,fontWeight:800,color:"#12241B"}}>Loss Risk by Branch</div><div style={{fontSize:10.8,color:"#6B7A65",marginTop:3}}>Highest risk first. Use coverage and stock variance to locate the likely source of loss, then click a branch for evidence.</div></div><span style={{fontSize:10.5,fontWeight:800,color:"#3b791e"}}>{sortedBranchRows.length} branches</span></div>
            <div style={tableWrap}><table style={{width:"100%",borderCollapse:"collapse",minWidth:920}}><thead><tr>{["Branch / Location","HQ Supply Revenue","POS Revenue","vs Last Month","Target %","Order Coverage","Stock Variance","Risk"].map((h,i)=><th key={h} style={{...th,textAlign:i===0?"left":"right"}}>{h}</th>)}</tr></thead><tbody>{sortedBranchRows.length?sortedBranchRows.map((r,i)=><tr key={r.id} onClick={()=>openBranch(r)} style={{cursor:"pointer",background:i%2?"#FBFDF9":"#fff"}} onMouseEnter={e=>e.currentTarget.style.background="#F4F8F0"} onMouseLeave={e=>e.currentTarget.style.background=i%2?"#FBFDF9":"#fff"}><td style={{...td,fontWeight:800,color:"#12241B"}}><div>{r.branch}</div><div style={{fontSize:9.7,fontWeight:500,color:"#8A9687",marginTop:2}}>{r.location||"—"}</div></td><td style={{...td,textAlign:"right",fontWeight:800,color:"#3b791e"}}>{fmtAmt(r.hqRevenue)}</td><td style={{...td,textAlign:"right",fontWeight:800,color:"#2563eb"}}>{fmtAmt(r.posRevenue)}</td><td style={{...td,textAlign:"right",color:r.vsLastMonth!=null&&r.vsLastMonth<0?"#c0392b":"#2c5c16",fontWeight:700}}>{r.vsLastMonth==null?"—":`${r.vsLastMonth>=0?"+":""}${r.vsLastMonth.toFixed(1)}%`}</td><td style={{...td,textAlign:"right",fontWeight:700}}>{r.targetPct==null?"—":`${r.targetPct.toFixed(1)}%`}</td><td style={{...td,textAlign:"right",fontWeight:700}}>{r.orderCoverage==null?"—":`${r.orderCoverage.toFixed(1)}%`}</td><td style={{...td,textAlign:"right",fontWeight:700,color:r.stockVariance==null?"#94a3b8":r.stockVariance===0?"#2c5c16":"#c0392b"}}>{r.stockVariance==null?"—":`${r.stockVariance>0?"+":""}${r.stockVariance.toLocaleString()} units`}</td><td style={{...td,textAlign:"right"}}><B2BRiskBadge risk={r.risk}/></td></tr>):<tr><td colSpan="8" style={{padding:28,textAlign:"center",color:"#94a3b8",fontSize:11.5}}>No branch performance data for the selected filters.</td></tr>}</tbody></table></div>
          </div>

          <div style={{...sectionCard,display:"none"}}>
            <div style={{fontSize:15,fontWeight:800,color:"#12241B"}}>Store Location View</div><div style={{fontSize:10.8,color:"#6B7A65",marginTop:3,marginBottom:13}}>Fast location scan · click a store to open branch detail</div>
            <div style={{display:"grid",gap:8,maxHeight:390,overflowY:"auto",paddingRight:2}}>{sortedBranchRows.length?sortedBranchRows.map((r,i)=><button key={r.id} onClick={()=>openBranch(r)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"10px 11px",border:"1px solid #E7EEE4",borderRadius:11,background:i%2?"#FBFDF9":"#fff",cursor:"pointer",fontFamily:FONT,textAlign:"left"}}><div style={{display:"flex",gap:8,alignItems:"flex-start",minWidth:0}}><MapPin size={14} color="#3b791e" style={{flexShrink:0,marginTop:1}}/><div style={{minWidth:0}}><div style={{fontSize:11,fontWeight:800,color:"#12241B",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.branch}</div><div style={{fontSize:9.5,color:"#8A9687",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.location||"Location not set"}</div></div></div><B2BRiskBadge risk={r.risk}/></button>):<DashboardEmptyState message="No store locations available."/>}</div>
          </div>
        </div>
        )}

        {isGhostView && (
        <div style={{ ...sectionCard, marginBottom:15 }}>
          <div style={{ display:"flex", justifyContent:"space-between", gap:12, alignItems:"flex-start", marginBottom:12, flexWrap:"wrap" }}><div><div style={{fontSize:15,fontWeight:800,color:"#12241B"}}>Brand Performance</div><div style={{fontSize:10.8,color:"#6B7A65",marginTop:3}}>HQ supply revenue, franchisee POS sell-through, quantities and stock variance per brand</div></div><span style={{fontSize:10.5,fontWeight:800,color:"#3b791e"}}>{brandRows.length} brands</span></div>
          <div style={tableWrap}><table style={{width:"100%",borderCollapse:"collapse",minWidth:880}}><thead><tr>{["Brand","HQ Supply Revenue","POS Revenue","Qty Supplied","Qty Sold","Ending Stock","Sell-through","Stock Variance"].map((h,i)=><th key={h} style={{...th,textAlign:i===0?"left":"right"}}>{h}</th>)}</tr></thead><tbody>{brandRows.length?brandRows.map((r,i)=><tr key={r.id} onClick={()=>openBrand(r)} style={{cursor:"pointer",background:i%2?"#FBFDF9":"#fff"}} onMouseEnter={e=>e.currentTarget.style.background="#F4F8F0"} onMouseLeave={e=>e.currentTarget.style.background=i%2?"#FBFDF9":"#fff"}><td style={{...td,fontWeight:800,color:"#12241B"}}>{r.brand}</td><td style={{...td,textAlign:"right",fontWeight:800,color:"#3b791e"}}>{fmtAmt(r.hqRevenue)}</td><td style={{...td,textAlign:"right",fontWeight:800,color:"#2563eb"}}>{fmtAmt(r.posRevenue)}</td><td style={{...td,textAlign:"right"}}>{r.suppliedQty.toLocaleString()}</td><td style={{...td,textAlign:"right"}}>{r.soldQty.toLocaleString()}</td><td style={{...td,textAlign:"right"}}>{r.endingStock==null?"—":r.endingStock.toLocaleString()}</td><td style={{...td,textAlign:"right"}}>{r.sellThrough==null?"—":`${r.sellThrough.toFixed(1)}%`}</td><td style={{...td,textAlign:"right",color:r.stockVariance==null?"#94a3b8":r.stockVariance===0?"#2c5c16":"#c0392b",fontWeight:700}}>{r.stockVariance==null?"—":`${r.stockVariance>0?"+":""}${r.stockVariance.toLocaleString()}`}</td></tr>):<tr><td colSpan="8" style={{padding:28,textAlign:"center",color:"#94a3b8",fontSize:11.5}}>No brand performance data for the selected filters.</td></tr>}</tbody></table></div>
        </div>
        )}

        {isGhostView && (
        <div style={{ ...sectionCard, marginBottom:15 }}>
          <div style={{ display:"flex", justifyContent:"space-between", gap:12, alignItems:"flex-start", marginBottom:12, flexWrap:"wrap" }}><div><div style={{fontSize:15,fontWeight:800,color:"#12241B"}}>Sales & Stocks Reconciliation</div><div style={{fontSize:10.8,color:"#6B7A65",marginTop:3}}>Quantity-level SKU comparison. Click a row for opening → receipts → POS → disposal → transfer → closing evidence.</div></div>{!stockDataReady&&<span style={{fontSize:9.5,fontWeight:800,padding:"4px 8px",borderRadius:20,background:"#fffbeb",color:"#92400e",border:"1px solid #fde68a"}}>MOVEMENT LINKAGE REQUIRED</span>}</div>
          <div style={tableWrap}><table style={{width:"100%",borderCollapse:"collapse",minWidth:900}}><thead><tr>{["SKU / Product","Branch","Brand","Opening","HQ Received","POS Sold","Disposal / Transfer","Recorded Closing","Variance"].map((h,i)=><th key={h} style={{...th,textAlign:i<3?"left":"right"}}>{h}</th>)}</tr></thead><tbody>{skuRows.length?skuRows.map((r,i)=><tr key={`${r.id}-${r.branch}-${r.brand}`} onClick={()=>openSku(r)} style={{cursor:"pointer",background:i%2?"#FBFDF9":"#fff"}} onMouseEnter={e=>e.currentTarget.style.background="#F4F8F0"} onMouseLeave={e=>e.currentTarget.style.background=i%2?"#FBFDF9":"#fff"}><td style={{...td,fontWeight:800,color:"#12241B"}}><div>{r.product}</div><div style={{fontSize:9.4,fontWeight:600,color:"#94a3b8",marginTop:2}}>SKU {r.sku}</div></td><td style={{...td,fontWeight:700}}>{r.branch}</td><td style={{...td}}>{r.brand}</td><td style={{...td,textAlign:"right"}}>{r.openingStock==null?"—":r.openingStock.toLocaleString()}</td><td style={{...td,textAlign:"right",fontWeight:800,color:"#3b791e"}}>{r.suppliedQty.toLocaleString()}</td><td style={{...td,textAlign:"right",fontWeight:800,color:"#2563eb"}}>{r.soldQty.toLocaleString()}</td><td style={{...td,textAlign:"right"}}>{r.disposal==null&&r.transfers==null?"—":b2bNum(r.disposal)+b2bNum(r.transfers)}</td><td style={{...td,textAlign:"right"}}>{r.endingStock==null?"—":r.endingStock.toLocaleString()}</td><td style={{...td,textAlign:"right",fontWeight:800,color:r.stockVariance==null?"#94a3b8":r.stockVariance===0?"#2c5c16":"#c0392b"}}>{r.stockVariance==null?"—":`${r.stockVariance>0?"+":""}${r.stockVariance.toLocaleString()}`}</td></tr>):<tr><td colSpan="9" style={{padding:28,textAlign:"center",color:"#94a3b8",fontSize:11.5}}>No SKU order/POS activity for the selected month and filters.</td></tr>}</tbody></table></div>
        </div>
        )}

        {isGhostView && (
        <div style={sectionCard}>
          <div style={{ display:"flex", justifyContent:"space-between", gap:12, alignItems:"flex-start", marginBottom:12, flexWrap:"wrap" }}><div><div style={{fontSize:15,fontWeight:800,color:"#12241B"}}>Ghost Stock / Revenue Leakage</div><div style={{fontSize:10.8,color:"#6B7A65",marginTop:3}}>Ranked anomalies with reason and recommended action</div></div><span style={{fontSize:10.5,fontWeight:800,color:anomalies.length?"#c0392b":"#2c5c16"}}>{anomalies.length} flagged</span></div>
          {anomalies.length ? <div style={{display:"grid",gap:9}}>{anomalies.map((a,i)=><button key={a.id??i} onClick={()=>{ const br=branchRows.find(r=>r.branch===a.branch); if(br) openBranch(br); else setDrilldown({type:"anomaly",title:a.rule,loading:false,data:a}); }} style={{display:"grid",gridTemplateColumns:"minmax(150px,.8fr) minmax(180px,1fr) minmax(260px,1.6fr) auto",gap:12,alignItems:"center",padding:"12px 13px",border:"1px solid #E7EEE4",borderRadius:12,background:i%2?"#FBFDF9":"#fff",cursor:"pointer",fontFamily:FONT,textAlign:"left"}}><div><div style={{fontSize:11,fontWeight:800,color:"#12241B"}}>{a.branch||"—"}</div><div style={{fontSize:9.5,color:"#8A9687",marginTop:2}}>{[a.brand,a.sku].filter(Boolean).join(" · ")||b2bMonthLabel(month)}</div></div><div><B2BRiskBadge risk={a.severity}/><div style={{fontSize:10.5,fontWeight:800,color:"#334155",marginTop:5}}>{a.rule}</div></div><div><div style={{fontSize:10.5,color:"#5C6B60",lineHeight:1.45}}>{a.reason}</div><div style={{fontSize:9.8,color:"#3b791e",fontWeight:700,marginTop:4}}>Action: {a.recommendation}</div></div><ChevronRight size={15} color="#94a3b8"/></button>)}</div> : <div style={{padding:"24px 14px",textAlign:"center",border:"1px dashed #D7E1D4",borderRadius:12,background:"#FAFCF8"}}><CheckCircle2 size={22} color="#3b791e"/><div style={{fontSize:11.5,fontWeight:800,color:"#2c5c16",marginTop:7}}>No anomaly detected from the data currently available.</div><div style={{fontSize:10,color:"#7A887B",marginTop:3}}>{stockDataReady?"Stock reconciliation rules are included.":"Stock-based anomaly rules will appear after inventory movement linkage is available."}</div></div>}
        </div>
        )}

        {drilldown && (
          <div onMouseDown={e=>{ if(e.target===e.currentTarget)setDrilldown(null); }} style={{position:"fixed",inset:0,zIndex:5000,background:"rgba(18,36,27,.58)",backdropFilter:"blur(5px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <div style={{width:"min(940px,96vw)",maxHeight:"88vh",overflowY:"auto",background:"#fff",borderRadius:20,border:"1px solid #DDE8DA",boxShadow:"0 30px 80px rgba(18,36,27,.28)",fontFamily:FONT}}>
              <div style={{position:"sticky",top:0,zIndex:2,background:"#fff",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,padding:"17px 20px",borderBottom:"1px solid #E7EEE4"}}><div><div style={{fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:".07em",color:"#6B7A65"}}>{drilldown.type} detail · {b2bMonthLabel(month)}</div><div style={{fontSize:18,fontWeight:850,color:"#12241B",marginTop:3}}>{drilldown.title}</div></div><button onClick={()=>setDrilldown(null)} style={{width:32,height:32,borderRadius:9,border:"1px solid #E1E6D8",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#5C6B60"}}><X size={15}/></button></div>
              <div style={{padding:20}}>
                {drilldown.loading ? <div style={{padding:40,textAlign:"center",color:"#6B7A65"}}><RefreshCw size={22} style={{animation:"spin .8s linear infinite"}}/><div style={{marginTop:8,fontSize:11.5}}>Loading drilldown evidence…</div></div> : (
                  <>
                    {drilldown.warning && <div style={{marginBottom:12,padding:"10px 12px",borderRadius:10,background:"#fffbeb",border:"1px solid #fde68a",color:"#92400e",fontSize:10.8,lineHeight:1.5}}>{drilldown.warning}</div>}
                    {drilldown.type === "branch" && <div><div className="b2b-kpi-grid" style={{gridTemplateColumns:"repeat(4,minmax(0,1fr))",marginBottom:14}}><B2BMetricCard label="HQ Supply Revenue" value={fmtAmt(b2bNullableNum(drilldown.data?.hq_supply_revenue,drilldown.data?.hqRevenue)??0)} icon={Package} note="Open complete HQ breakdown" onClick={()=>openKpi("hqRevenue","HQ Supply Revenue")}/><B2BMetricCard label="POS Revenue" value={fmtAmt(b2bNullableNum(drilldown.data?.pos_revenue,drilldown.data?.posRevenue)??0)} icon={ShoppingCart} tone="blue" note="Open complete POS breakdown" onClick={()=>openKpi("posRevenue","POS Revenue")}/><B2BMetricCard label="Target Attainment" value={b2bNullableNum(drilldown.data?.target_attainment_pct,drilldown.data?.targetPct)==null?"—":`${b2bNullableNum(drilldown.data?.target_attainment_pct,drilldown.data?.targetPct).toFixed(1)}%`} icon={Target} tone="amber" note="Open monthly target evidence" onClick={()=>openKpi("target","Target Attainment")}/><B2BMetricCard label="Order Coverage" value={b2bNullableNum(drilldown.data?.order_coverage,drilldown.data?.orderCoverage)==null?"—":`${b2bNullableNum(drilldown.data?.order_coverage,drilldown.data?.orderCoverage).toFixed(1)}%`} icon={ShieldCheck} note="Open stock-flow coverage" onClick={()=>openKpi("coverage","Order Coverage")}/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><div style={sectionCard}><div style={{fontSize:12,fontWeight:800,color:"#12241B",marginBottom:8}}>Why this branch is flagged</div><div style={{fontSize:10.8,color:"#5C6B60",lineHeight:1.6}}>{drilldown.data?.reason || drilldown.data?.risk_reason || "No anomaly explanation was returned for this branch."}</div><div style={{marginTop:10}}><B2BRiskBadge risk={drilldown.data?.risk || drilldown.data?.risk_status}/></div></div><div style={sectionCard}><div style={{fontSize:12,fontWeight:800,color:"#12241B",marginBottom:8}}>Location / context</div><div style={{fontSize:10.8,color:"#5C6B60",lineHeight:1.6}}>Branch: <b>{drilldown.data?.branch || drilldown.title}</b><br/>Location: <b>{drilldown.data?.location || "—"}</b><br/>Selected month: <b>{b2bMonthLabel(month)}</b></div></div></div></div>}
                    {drilldown.type === "brand" && <div><div className="b2b-kpi-grid" style={{gridTemplateColumns:"repeat(4,minmax(0,1fr))",marginBottom:14}}><B2BMetricCard label="HQ Supply Revenue" value={fmtAmt(b2bNullableNum(drilldown.data?.hq_supply_revenue,drilldown.data?.hqRevenue)??0)} icon={Package} note="Open complete HQ breakdown" onClick={()=>openKpi("hqRevenue","HQ Supply Revenue")}/><B2BMetricCard label="POS Revenue" value={fmtAmt(b2bNullableNum(drilldown.data?.pos_revenue,drilldown.data?.posRevenue)??0)} icon={ShoppingCart} tone="blue" note="Open complete POS breakdown" onClick={()=>openKpi("posRevenue","POS Revenue")}/><B2BMetricCard label="Qty Supplied" value={b2bNum(drilldown.data?.supplied_qty,drilldown.data?.suppliedQty).toLocaleString()} icon={Package} note="Open HQ order coverage" onClick={()=>openKpi("coverage","Quantity Supplied")}/><B2BMetricCard label="Qty Sold" value={b2bNum(drilldown.data?.sold_qty,drilldown.data?.soldQty).toLocaleString()} icon={TrendingUp} tone="blue" note="Open sell-through evidence" onClick={()=>openKpi("sellThrough","Quantity Sold")}/></div><div style={{fontSize:10.8,color:"#5C6B60",lineHeight:1.6}}>Click an SKU in the reconciliation table for opening stock, HQ receipts, POS deductions, disposal, manual adjustment, closing stock and variance evidence.</div></div>}
                    {drilldown.type === "sku" && <div><div style={tableWrap}><table style={{width:"100%",borderCollapse:"collapse",minWidth:720}}><thead><tr>{["Opening","HQ Receipts","POS Sold","Disposal / Waste","Transfer In","Transfer Out","Recorded Closing","Variance"].map(h=><th key={h} style={{...th,textAlign:"right"}}>{h}</th>)}</tr></thead><tbody><tr><td style={{...td,textAlign:"right"}}>{b2bNullableNum(drilldown.data?.opening_stock,drilldown.data?.openingStock)==null?"—":b2bNullableNum(drilldown.data?.opening_stock,drilldown.data?.openingStock).toLocaleString()}</td><td style={{...td,textAlign:"right",fontWeight:800,color:"#3b791e"}}>{b2bNum(drilldown.data?.hq_received,drilldown.data?.received_qty,drilldown.data?.suppliedQty).toLocaleString()}</td><td style={{...td,textAlign:"right",fontWeight:800,color:"#2563eb"}}>{b2bNum(drilldown.data?.pos_sold,drilldown.data?.sold_qty,drilldown.data?.soldQty).toLocaleString()}</td><td style={{...td,textAlign:"right"}}>{b2bNullableNum(drilldown.data?.disposal,drilldown.data?.waste)==null?"—":b2bNum(drilldown.data?.disposal,drilldown.data?.waste).toLocaleString()}</td><td style={{...td,textAlign:"right"}}>{b2bNullableNum(drilldown.data?.transfer_in)==null?"—":b2bNum(drilldown.data?.transfer_in).toLocaleString()}</td><td style={{...td,textAlign:"right"}}>{b2bNullableNum(drilldown.data?.transfer_out)==null?"—":b2bNum(drilldown.data?.transfer_out).toLocaleString()}</td><td style={{...td,textAlign:"right"}}>{b2bNullableNum(drilldown.data?.closing_stock,drilldown.data?.endingStock)==null?"—":b2bNullableNum(drilldown.data?.closing_stock,drilldown.data?.endingStock).toLocaleString()}</td><td style={{...td,textAlign:"right",fontWeight:800,color:"#c0392b"}}>{b2bNullableNum(drilldown.data?.variance,drilldown.data?.stockVariance)==null?"—":b2bNullableNum(drilldown.data?.variance,drilldown.data?.stockVariance).toLocaleString()}</td></tr></tbody></table></div><div style={{marginTop:12,fontSize:10.5,color:"#6B7A65",lineHeight:1.55}}>Evidence endpoint should also return linked Mobile Order references, POS transactions, inventory movements, source/reference IDs, user/reason for manual adjustments, and before/after quantities.</div></div>}
                    {drilldown.type === "kpi" && (
                      <B2BKpiBreakdown
                        metric={drilldown.data?.metric}
                        overview={normalizedOverview}
                        branchRows={sortedBranchRows}
                        brandRows={brandRows}
                        skuRows={skuRows}
                        anomalies={anomalies}
                        month={month}
                        growthTargetPct={growthTargetPct}
                        onOpenBranch={openBranch}
                        onOpenBrand={openBrand}
                        onOpenSku={openSku}
                      />
                    )}
                    {drilldown.type === "anomaly" && <div style={{fontSize:11.5,color:"#5C6B60",lineHeight:1.65}}><B2BRiskBadge risk={drilldown.data?.severity}/><div style={{marginTop:12}}><b>Reason:</b> {drilldown.data?.reason}</div><div style={{marginTop:6}}><b>Recommended action:</b> {drilldown.data?.recommendation}</div></div>}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function OperationalKpiBreakdownModal({ detail, onClose, overview, branchRows = [], rangeLabel, filterLabel }) {
    if (!detail) return null;
    const id = detail.id;
    const rows = [...branchRows].sort((a,b)=>{
      if (id === "transactions") return Number(b.transactions||0)-Number(a.transactions||0);
      if (id === "averageSale") return Number(b.avgOrder||0)-Number(a.avgOrder||0);
      return Number(b.revenue||0)-Number(a.revenue||0);
    });
    const totalRevenue = Number(overview?.revenue || 0);
    const totalTransactions = Number(overview?.transactions || 0);
    const averageSale = Number(overview?.averageSale || 0);
    const activeBranches = Number(overview?.activeBranches || 0);
    const summaryCards = [
      ["Revenue", fmtAmt(totalRevenue), TrendingUp, "green", "Actual selected-period sales"],
      ["Transactions", totalTransactions.toLocaleString(), ShoppingCart, "blue", "Completed sales records"],
      ["Average Sale", fmtAmt(averageSale), BarChart2, "amber", "Revenue per transaction"],
      ["Active Branches", activeBranches.toLocaleString(), Store, "green", "Branches with recorded sales"],
    ];
    const descriptions = {
      revenue:"Actual POS revenue split by branch, including available cost and margin evidence.",
      transactions:"Completed POS transaction volume split by branch.",
      averageSale:"Average transaction value by branch, with volume and revenue context.",
      activeBranches:"All branches with sales activity inside the current dashboard scope.",
    };
    const columns = id === "transactions"
      ? [
          ["Branch","left",r=>r.branch],
          ["Transactions","right",r=>Number(r.transactions||0).toLocaleString()],
          ["Average Sale","right",r=>fmtAmt(r.avgOrder)],
          ["Revenue","right",r=>fmtAmt(r.revenue)],
        ]
      : id === "averageSale"
        ? [
            ["Branch","left",r=>r.branch],
            ["Average Sale","right",r=>fmtAmt(r.avgOrder)],
            ["Transactions","right",r=>Number(r.transactions||0).toLocaleString()],
            ["Revenue","right",r=>fmtAmt(r.revenue)],
          ]
        : id === "activeBranches"
          ? [
              ["Branch","left",r=>r.branch],
              ["Revenue","right",r=>fmtAmt(r.revenue)],
              ["Transactions","right",r=>Number(r.transactions||0).toLocaleString()],
              ["Avg. Sale","right",r=>fmtAmt(r.avgOrder)],
              ["Margin","right",r=>r.hasCogs?`${Number(r.margin||0).toFixed(1)}%`:"No COGS"],
            ]
          : [
              ["Branch","left",r=>r.branch],
              ["Revenue","right",r=>fmtAmt(r.revenue)],
              ["Revenue Share","right",r=>totalRevenue>0?`${(Number(r.revenue||0)/totalRevenue*100).toFixed(1)}%`:"—"],
              ["Gross Profit","right",r=>r.hasCogs?fmtAmt(r.grossProfit):"No COGS"],
              ["Margin","right",r=>r.hasCogs?`${Number(r.margin||0).toFixed(1)}%`:"—"],
            ];
    const th = {padding:"10px 11px",fontSize:9.5,fontWeight:800,textTransform:"uppercase",letterSpacing:".06em",color:"#71806F",background:"#F6FAF3",borderBottom:"1px solid #DDE8DA",whiteSpace:"nowrap"};
    const td = {padding:"11px",fontSize:10.8,color:"#334155",borderBottom:"1px solid #EEF3EC"};
    return (
      <div onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}} style={{position:"fixed",inset:0,zIndex:5100,background:"rgba(18,36,27,.58)",backdropFilter:"blur(5px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{width:"min(940px,96vw)",maxHeight:"88vh",overflowY:"auto",background:"#fff",borderRadius:20,border:"1px solid #DDE8DA",boxShadow:"0 30px 80px rgba(18,36,27,.28)",fontFamily:FONT}}>
          <div style={{position:"sticky",top:0,zIndex:2,background:"#fff",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,padding:"17px 20px",borderBottom:"1px solid #E7EEE4"}}>
            <div><div style={{fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:".07em",color:"#6B7A65"}}>Operational KPI detail · {rangeLabel}</div><div style={{fontSize:18,fontWeight:850,color:"#12241B",marginTop:3}}>{detail.label} Breakdown</div><div style={{fontSize:10.5,color:"#71806F",marginTop:3}}>{filterLabel}</div></div>
            <button onClick={onClose} style={{width:32,height:32,borderRadius:9,border:"1px solid #E1E6D8",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#5C6B60"}}><X size={15}/></button>
          </div>
          <div style={{padding:20}}>
            <div style={{padding:"10px 12px",borderRadius:10,background:"#F6FAF3",border:"1px solid #DDE8DA",fontSize:10.8,color:"#5C6B60",lineHeight:1.55,marginBottom:13}}>{descriptions[id] || descriptions.revenue} Values remain scoped to the active date, brand, and branch filters.</div>
            <div className="b2b-kpi-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12,marginBottom:14}}>{summaryCards.map(([label,value,Icon,tone,note])=><B2BMetricCard key={label} label={label} value={value} icon={Icon} tone={tone} note={note}/>)}</div>
            <div style={{fontSize:11,fontWeight:850,color:"#12241B",marginBottom:8}}>Branch breakdown</div>
            <div style={{overflowX:"auto",border:"1px solid #E7EEE4",borderRadius:13}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:720}}><thead><tr>{columns.map(([label,align])=><th key={label} style={{...th,textAlign:align}}>{label}</th>)}</tr></thead><tbody>{rows.length?rows.map((row,index)=><tr key={row.branch||index} style={{background:index%2?"#FBFDF9":"#fff"}}>{columns.map(([label,align,render])=><td key={label} style={{...td,textAlign:align}}>{render(row)}</td>)}</tr>):<tr><td colSpan={columns.length} style={{padding:28,textAlign:"center",fontSize:10.8,color:"#82907F"}}>No branch evidence is available for this KPI and filter.</td></tr>}</tbody></table></div>
          </div>
        </div>
      </div>
    );
  }

  function FADashboardContent({ transactions, brands: propBrands = [], user }) {
    const today = new Date();

    const [rangeMode,    setRangeMode]    = useState("preset");
    const [preset,       setPreset]       = useState("month");
    const [customFrom,   setCustomFrom]   = useState(fmt8(new Date(today.getFullYear(), today.getMonth(), 1)));
    const [customTo,     setCustomTo]     = useState(fmt8(today));
    const [appliedRange, setAppliedRange] = useState(null);
    const [archives,     setArchives]     = useState(() => { try { return JSON.parse(localStorage.getItem("dashboardArchives") || "[]"); } catch { return []; } });
    const [showArchive,  setShowArchive]  = useState(false);
    const [viewArchive,  setViewArchive]  = useState(null);
    const [archiveYear,  setArchiveYear]  = useState(String(today.getFullYear()));

    const [filterBrand,    setFilterBrand]    = useState(null);
    const [filterBranch,   setFilterBranch]   = useState(null);
    const [brandDropOpen,  setBrandDropOpen]  = useState(false);
    const [branchDropOpen, setBranchDropOpen] = useState(false);
    const [brandQ,  setBrandQ]  = useState("");
    const [branchQ, setBranchQ] = useState("");
    const brandRef  = useRef(null);
    const branchRef = useRef(null);
    const [kpiData,    setKpiData]    = useState(null);
    const [kpiLoading, setKpiLoading] = useState(false);

    const [applyingRange, setApplyingRange] = useState(false);

    const [infoModal, setInfoModal] = useState(null);
    const showInfo = (opts) => setInfoModal(opts);
    const closeInfo = () => setInfoModal(null);

    const [toast, setToast] = useState(null);

    const [hiddenKpis, setHiddenKpis] = useState({}); // { [index]: true } = hidden
    const [operationalKpiDetail, setOperationalKpiDetail] = useState(null);
    const [analysisTab, setAnalysisTab] = useState("sales");
    const [dashboardTab, setDashboardTab] = useState("overview");

    useEffect(() => {
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

    const fetchKpis = useCallback(async () => {
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
        const res = await fetch(`${process.env.REACT_APP_API_URL}/dashboard/stats?${params}`);
        const d   = await res.json();
        if (!d.error) setKpiData(d);
      } catch (err) { console.error(err); }
      finally { setKpiLoading(false); }
    }, [rangeMode, preset, appliedRange, filterBranch, filterBrand, selectedBrand]);

    useEffect(() => { if (!viewArchive) fetchKpis(); }, [fetchKpis, viewArchive]);

    const filterLabel = filterBranch ? filterBranch : filterBrand ? (selectedBrand?.name + " – All Branches") : "All Brands & Branches";

    const getRangeLabel = () => {
      if (viewArchive) return `Archive: ${viewArchive.year}`;
      if (rangeMode === "custom" && appliedRange) return `${appliedRange.from} → ${appliedRange.to}`;
      return { day: "Today", week: "This Week", month: "This Month", year: "This Year" }[preset] || "This Month";
    };

  const chartData = useMemo(() => {
    if (viewArchive) return viewArchive.chartData;
    let txList = transactions;
    if (filterBranch) txList = transactions.filter(tx => tx.branch === filterBranch);
    else if (filterBrand && selectedBrand) {
      const bn = (selectedBrand.branches || []).map(br => typeof br === "string" ? br : br.name);
      txList = transactions.filter(tx => bn.includes(tx.branch));
    }
    if (!txList.length) return { labels: [], values: [] };
    const now = new Date();
    const isCustom = rangeMode === "custom" && appliedRange;

  const filtered = txList.filter(tx => {
    const d = new Date(tx.created_at);
    if (isCustom) {
      const f = new Date(appliedRange.from + "T00:00:00");
      const t = new Date(appliedRange.to + "T23:59:59.999");
      return d >= f && d <= t;
    }
    if (preset === "day")   return d.toDateString() === now.toDateString();
    if (preset === "week")  { const s = new Date(now); s.setDate(now.getDate() - now.getDay()); s.setHours(0,0,0,0); const e = new Date(s); e.setDate(s.getDate()+6); e.setHours(23,59,59,999); return d >= s && d <= e; }
    if (preset === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (preset === "year")  return d.getFullYear() === now.getFullYear();
    return true;
  });

  if (isCustom) {
    const from = new Date(appliedRange.from + "T00:00:00");
    const to = new Date(appliedRange.to + "T23:59:59.999");
    const nw = Math.max(1, Math.ceil((to - from) / (7*864e5)) + 1);
    const labels = Array.from({ length: nw }, (_, i) => `W${i+1}`);
    const values = Array(nw).fill(0);
    filtered.forEach(tx => { const wi = Math.min(Math.floor((new Date(tx.created_at) - from) / (7*864e5)), nw-1); values[wi] += tx.total||0; });
    return { labels, values };
  }

  const groupedMap = new Map();
    const addToGroup = (key, label, amount) => {
      const prev = groupedMap.get(key) || { label, sortKey: key, value: 0 };
      prev.value += amount;
      groupedMap.set(key, prev);
    };

    if (preset === "day") {
      filtered.forEach(tx => {
        const d = new Date(tx.created_at);
        addToGroup(d.getHours(), `${d.getHours()}:00`, Number(tx.total||0));
      });
    } else if (preset === "week") {
      filtered.forEach(tx => {
        const d = new Date(tx.created_at);
        addToGroup(d.getDay(), d.toLocaleDateString("en-US",{weekday:"short"}), Number(tx.total||0));
      });
    } else if (preset === "month") {
      filtered.forEach(tx => {
        const d = new Date(tx.created_at);
        addToGroup(d.getDate(), `D${d.getDate()}`, Number(tx.total||0));
      });
    } else if (preset === "year") {
      filtered.forEach(tx => {
        const d = new Date(tx.created_at);
        addToGroup(d.getMonth(), d.toLocaleDateString("en-US",{month:"short"}), Number(tx.total||0));
      });
    }

    const sortedGroups = Array.from(groupedMap.values()).sort((a,b) => a.sortKey - b.sortKey);
    const labels = sortedGroups.map(e => e.label);
    return { labels, values: sortedGroups.map(e => e.value) };
  }, [transactions, preset, rangeMode, appliedRange, viewArchive, filterBranch, filterBrand, selectedBrand]);

  const filteredTransactions = useMemo(() => {
    let txList = transactions;
    if (filterBranch) txList = transactions.filter(tx => tx.branch === filterBranch);
    else if (filterBrand && selectedBrand) {
      const bn = (selectedBrand.branches || []).map(br => typeof br === "string" ? br : br.name);
      txList = transactions.filter(tx => bn.includes(tx.branch));
    }

    const isCustom = rangeMode === "custom" && appliedRange;
    const now = new Date();
    return txList.filter(tx => {
      const d = new Date(tx.created_at);
      if (isCustom) {
        const from = new Date(appliedRange.from + "T00:00:00");
        const to = new Date(appliedRange.to + "T23:59:59.999");
        return d >= from && d <= to;
      }
      if (preset === "day")   return d.toDateString() === now.toDateString();
      if (preset === "week")  { const s = new Date(now); s.setDate(now.getDate() - now.getDay()); s.setHours(0,0,0,0); const e = new Date(s); e.setDate(s.getDate()+6); e.setHours(23,59,59,999); return d >= s && d <= e; }
      if (preset === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (preset === "year")  return d.getFullYear() === now.getFullYear();
      return true;
    });
  }, [transactions, filterBranch, filterBrand, selectedBrand, rangeMode, appliedRange, preset]);

    const values = viewArchive
      ? (chartData?.values || [])
      : (kpiData?.revenueSeries?.length ? kpiData.revenueSeries : chartData.values);
    const chartLabels = viewArchive
      ? (chartData?.labels || [])
      : (kpiData?.revenueSeries?.length ? kpiData.revenueLabels : chartData.labels);  
    const total     = useMemo(() => values.reduce((a, b) => a + b, 0), [values]);
    const avg       = useMemo(() => values.length ? Math.round(total / values.length) : 0, [total, values.length]);
    const peak      = useMemo(() => values.length ? Math.max(...values) : 0, [values]);
    const low       = useMemo(() => values.length ? Math.min(...values) : 0, [values]);
  const peakLabel = values.length ? chartLabels[values.indexOf(peak)] : "—";
    const pctChange = values.length > 1 && values[0] > 0 ? (((values[values.length - 1] - values[0]) / values[0]) * 100).toFixed(1) : "0.0";
    const trending  = Number(pctChange) >= 0;

    const actualRevenue = useMemo(() => filteredTransactions.reduce((sum, tx) => sum + Number(tx.total || tx.total_amount || 0), 0), [filteredTransactions]);
    const transactionCount = viewArchive
      ? Number(viewArchive?.kpis?.transactionCount ?? 0)
      : filteredTransactions.length;
    const averageTransaction = viewArchive
      ? Number(viewArchive?.kpis?.avgOrder ?? viewArchive?.kpis?.avgSales ?? 0)
      : (transactionCount ? actualRevenue / transactionCount : 0);
    const activeBranchCount = viewArchive
      ? Number(viewArchive?.kpis?.activeBranchCount ?? 0)
      : new Set(filteredTransactions.map(tx => tx.branch).filter(Boolean)).size;

    const transactionCountSeries = useMemo(() => {
      if (viewArchive || !chartLabels.length) return [];
      const counts = Object.fromEntries(chartLabels.map(label => [label, 0]));
      const now = new Date();
      const isCustom = rangeMode === "custom" && appliedRange;
      let customFromDate = null;
      if (isCustom) customFromDate = new Date(appliedRange.from + "T00:00:00");

      filteredTransactions.forEach(tx => {
        const d = new Date(tx.created_at);
        let label;
        if (isCustom) {
          const wi = Math.max(0, Math.floor((d - customFromDate) / (7 * 864e5)));
          label = `W${wi + 1}`;
        } else if (preset === "day") label = `${d.getHours()}:00`;
        else if (preset === "week") label = d.toLocaleDateString("en-US", { weekday: "short" });
        else if (preset === "month") label = `D${d.getDate()}`;
        else if (preset === "year") label = d.toLocaleDateString("en-US", { month: "short" });
        if (label in counts) counts[label] += 1;
      });
      return chartLabels.map(label => counts[label] || 0);
    }, [filteredTransactions, chartLabels, preset, rangeMode, appliedRange, viewArchive]);

    const branchPerformance = useMemo(() => {
      if (viewArchive) return [];
      const grouped = {};
      filteredTransactions.forEach(tx => {
        const branch = tx.branch || "Unassigned";
        grouped[branch] = (grouped[branch] || 0) + Number(tx.total || tx.total_amount || 0);
      });
      return Object.entries(grouped).map(([label, value]) => ({ label, value })).sort((a,b) => b.value - a.value);
    }, [filteredTransactions, viewArchive]);

    const branchProfitability = useMemo(() => {
      if (viewArchive) return [];

      const grouped = {};

      filteredTransactions.forEach((tx) => {
        const branch = String(tx?.branch || "Unassigned").trim() || "Unassigned";
        const revenue = Number(tx?.total ?? tx?.total_amount ?? tx?.grand_total ?? 0) || 0;

        let cogs = Number(
          tx?.cogs ??
          tx?.total_cogs ??
          tx?.cost_of_goods ??
          tx?.cost_of_goods_sold ??
          0
        );

        if (!Number.isFinite(cogs)) cogs = 0;

        if (cogs === 0) {
          let items = tx?.items;
          if (typeof items === "string") {
            try { items = JSON.parse(items); } catch { items = []; }
          }

          if (Array.isArray(items)) {
            const itemCogs = items.reduce((sum, item) => {
              const qty = Number(item?.qty ?? item?.quantity ?? 0) || 0;
              const unitCost = Number(
                item?.cost ??
                item?.unit_cost ??
                item?.unitCost ??
                item?.purchase_cost ??
                0
              ) || 0;
              const lineCogs = Number(
                item?.cogs ??
                item?.total_cost ??
                item?.cost_total ??
                0
              ) || 0;

              return sum + (lineCogs > 0 ? lineCogs : unitCost * qty);
            }, 0);

            if (itemCogs > 0) cogs = itemCogs;
          }
        }

        if (!grouped[branch]) {
          grouped[branch] = {
            branch,
            revenue: 0,
            cogs: 0,
            transactions: 0,
            hasCogs: false,
          };
        }

        grouped[branch].revenue += revenue;
        grouped[branch].cogs += cogs;
        grouped[branch].transactions += 1;

        if (
          cogs > 0 ||
          tx?.cogs != null ||
          tx?.total_cogs != null ||
          tx?.cost_of_goods != null ||
          tx?.cost_of_goods_sold != null
        ) {
          grouped[branch].hasCogs = true;
        }
      });

      return Object.values(grouped)
        .map((row) => {
          const grossProfit = row.revenue - row.cogs;
          const margin = row.revenue > 0 ? (grossProfit / row.revenue) * 100 : 0;
          const avgOrder = row.transactions > 0 ? row.revenue / row.transactions : 0;

          return { ...row, grossProfit, margin, avgOrder };
        })
        .sort((a, b) =>
          (b.grossProfit - a.grossProfit) ||
          (b.revenue - a.revenue)
        );
    }, [filteredTransactions, viewArchive]);

    const brandPerformance = useMemo(() => {
      if (viewArchive) return [];
      const grouped = {};
      filteredTransactions.forEach(tx => {
        const brand = tx.brand || "Unassigned";
        grouped[brand] = (grouped[brand] || 0) + Number(tx.total || tx.total_amount || 0);
      });
      return Object.entries(grouped).map(([label, value]) => ({ label, value })).sort((a,b) => b.value - a.value);
    }, [filteredTransactions, viewArchive]);
    

  const getTransactionsForArchiveYear = (year) => {
    let txList = transactions;
    if (filterBranch) txList = transactions.filter(tx => tx.branch === filterBranch);
    else if (filterBrand && selectedBrand) {
      const branchNames = (selectedBrand.branches || []).map(br => typeof br === "string" ? br : br.name);
      txList = transactions.filter(tx => branchNames.includes(tx.branch));
    }
    return txList.filter(tx => {
      const d = new Date(tx.created_at);
      return !Number.isNaN(d.getTime()) && d.getFullYear() === year;
    });
  };

  const buildArchiveSnapshot = (year, yearTransactions) => {
    const labels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthlyValues = Array(12).fill(0);

    yearTransactions.forEach(tx => {
      const d = new Date(tx.created_at);
      if (Number.isNaN(d.getTime())) return;
      monthlyValues[d.getMonth()] += Number(tx.total || tx.total_amount || 0);
    });

    const revenue = monthlyValues.reduce((sum, value) => sum + Number(value || 0), 0);
    const transactionCount = yearTransactions.length;
    const averageOrder = transactionCount ? revenue / transactionCount : 0;
    const activeBranches = new Set(yearTransactions.map(tx => tx.branch).filter(Boolean)).size;
    const peakSales = monthlyValues.length ? Math.max(...monthlyValues) : 0;

    return {
      year,
      label: `Full Year ${year}`,
      savedAt: new Date().toLocaleString("en-PH"),
      filterLabel,
      chartData: { labels, values: monthlyValues },
      kpis: {
        totalSales: revenue,
        salesRevenue: revenue,
        avgSales: averageOrder,
        avgOrder: averageOrder,
        peakSales,
        transactionCount,
        activeBranchCount: activeBranches,
      },
    };
  };

  const saveArchive = (snapshot) => {
    const upd = [...archives, snapshot].sort((a, b) => b.year - a.year);
    setArchives(upd);
    localStorage.setItem("dashboardArchives", JSON.stringify(upd));
    setArchiveYear(String(snapshot.year));
    showInfo({
      type: "success",
      title: "Archive Saved",
      message: `${snapshot.label} was archived successfully with ${snapshot.kpis.transactionCount.toLocaleString()} transaction${snapshot.kpis.transactionCount === 1 ? "" : "s"}.`,
    });
  };

  const requestArchiveYear = () => {
    const year = parseInt(archiveYear, 10);
    if (Number.isNaN(year) || year < 2000 || year > 2100) {
      showInfo({ type: "warning", title: "Invalid Year", message: "Enter a valid year from 2000 to 2100." });
      return;
    }
    if (archives.some(a => Number(a.year) === year)) {
      showInfo({ type: "warning", title: "Already Archived", message: `Year ${year} is already archived.` });
      return;
    }

    const yearTransactions = getTransactionsForArchiveYear(year);
    if (yearTransactions.length === 0) {
      showInfo({
        type: "info",
        title: "No Data Found",
        message: `No sales data was found for ${year} under ${filterLabel}. Nothing was archived.`,
      });
      return;
    }

    const snapshot = buildArchiveSnapshot(year, yearTransactions);
    showInfo({
      type: "confirm",
      confirmTone: "success",
      title: `Archive ${year}?`,
      message: `Data found: ${snapshot.kpis.transactionCount.toLocaleString()} transaction${snapshot.kpis.transactionCount === 1 ? "" : "s"}, ${fmtAmt(snapshot.kpis.totalSales)} revenue, and ${snapshot.kpis.activeBranchCount.toLocaleString()} active branch${snapshot.kpis.activeBranchCount === 1 ? "" : "es"}. Confirm to save this yearly snapshot.`,
      confirmLabel: "Confirm Archive",
      cancelLabel: "Cancel",
      onConfirm: () => saveArchive(snapshot),
    });
  };

  const deleteArchive = (year) => {
    showInfo({
      type: "confirm",
      title: "Delete Archive?",
      message: `Are you sure you want to delete the archive for ${year}? This cannot be undone.`,
      confirmLabel: "Delete",
      onConfirm: () => {
        const upd = archives.filter(a => a.year !== year);
        setArchives(upd); localStorage.setItem("dashboardArchives", JSON.stringify(upd));
        if (viewArchive?.year === year) setViewArchive(null);
        closeInfo();
      },
    });
  };

  const applyCustomRange = async () => {
    if (!customFrom || !customTo) { showInfo({ type: "warning", title: "Missing Dates", message: "Please select both a start and end date." }); return; }
    if (customFrom > customTo) { showInfo({ type: "warning", title: "Invalid Range", message: "\"From\" cannot be after \"To\"." }); return; }

    let txList = transactions;
    if (filterBranch) txList = transactions.filter(tx => tx.branch === filterBranch);
    else if (filterBrand && selectedBrand) {
      const bn = (selectedBrand.branches || []).map(br => typeof br === "string" ? br : br.name);
      txList = transactions.filter(tx => bn.includes(tx.branch));
    }

    const from = new Date(customFrom + "T00:00:00");
    const to = new Date(customTo + "T23:59:59.999");

    const hasData = txList.some(tx => {
      const d = new Date(tx.created_at);
      return d >= from && d <= to;
    });

    if (!hasData) {
      showInfo({
        type: "error",
        title: "No Data Found",
        message: `No data found for the selected date range (${customFrom} → ${customTo})${filterLabel !== "All Brands & Branches" ? ` — ${filterLabel}` : ""}. Please choose a different date range.`,
      });
      return;
    }

    setApplyingRange(true);
    try {
      setRangeMode("custom");
      setAppliedRange({ from: customFrom, to: customTo });
      setViewArchive(null);

      // Fetch KPIs for this exact range right now, so the button reflects real completion
      setKpiLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("from", customFrom);
        params.set("to", customTo);
        if (filterBranch) params.set("branch", filterBranch);
        else if (filterBrand && selectedBrand) {
          const bn = (selectedBrand.branches || []).map(br => typeof br === "string" ? br : br.name);
          if (bn.length) params.set("branches", bn.join(","));
        }
        const res = await fetch(`${process.env.REACT_APP_API_URL}/dashboard/stats?${params}`);
        const d = await res.json();
        if (!d.error) setKpiData(d);
      } catch (err) {
        console.error(err);
      } finally {
        setKpiLoading(false);
      }

      setToast({ title: "Date Range Applied", message: `Showing data from ${customFrom} to ${customTo}.` });
    } finally {
      setApplyingRange(false);
    }
  };

    const filterInputSt = { height: 36, padding: "0 11px", borderRadius: 9, border: "1px solid #b2dfdb", background: "#f0fdf5", fontSize: 13, color: "#0d2b1e", outline: "none", fontFamily: FONT, boxSizing: "border-box", width: "100%" };
    const dropSt = { position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 400, background: "#fff", border: "1px solid #b2dfdb", borderRadius: 11, boxShadow: "0 8px 28px rgba(0,0,0,0.10)", maxHeight: 220, overflowY: "auto" };
    const optSt  = (a) => ({ padding: "9px 14px", cursor: "pointer", fontSize: 13, color: a ? "#00695c" : "#0d2b1e", fontWeight: a ? 700 : 500, background: a ? "#e0f2f1" : "transparent", display: "flex", alignItems: "center", gap: 8, fontFamily: FONT });
    const tabSt  = (a) => ({ padding: "6px 13px", borderRadius: 9, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT, transition: "all .15s", background: a ? "linear-gradient(135deg,#00c853,#00897b)" : "transparent", color: a ? "#fff" : "#5a7a65", boxShadow: a ? "0 2px 8px rgba(0,180,90,.35)" : "none" });

    return (
      <div style={{ fontFamily: FONT }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
          *, *::before, *::after { box-sizing: border-box; }
          @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
          @media(max-width:900px){.qa-dashboard-tabs{grid-template-columns:1fr!important}.qa-dashboard-tabs button{min-height:58px!important}}
        `}</style>

        {/* Archive banner */}
        {viewArchive && (
          <div style={{ background: "linear-gradient(135deg,#0d2b1e,#1a4a2e)", color: "#fff", borderRadius: 14, padding: "12px 20px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14, fontFamily: FONT }}>
              <Archive size={16} /> Viewing Archive: {viewArchive.year}
              <span style={{ opacity: 0.6, fontSize: 12, fontWeight: 400 }}>— saved {viewArchive.savedAt}</span>
            </span>
            <button onClick={() => setViewArchive(null)} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 8, padding: "5px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: FONT }}>
              <X size={12} /> Exit Archive View
            </button>
          </div>
        )}

        <div className="qa-dashboard-tabs" style={{ background:"#fff", border:"1px solid #DCE9DB", borderRadius:16, padding:7, marginBottom:16, display:"grid", gridTemplateColumns:"repeat(3,minmax(0,1fr))", gap:7, boxShadow:"0 2px 14px rgba(50,109,32,.06)" }}>
          {[
            { id:"overview", number:"01", label:"Overview", question:"What needs attention?", icon:Home },
            { id:"sales_ai", number:"02", label:"Sales Trend Analysis", question:"How are actual sales changing?", icon:LineChart },
            { id:"ghost", number:"03", label:"Ghost Stock Anomalies", question:"Where are losses coming from?", icon:ShieldCheck },
          ].map(tab=>{
            const active = dashboardTab === tab.id;
            const Icon = tab.icon;
            return <button key={tab.id} onClick={()=>{ setDashboardTab(tab.id); if(tab.id!=="sales_ai") setViewArchive(null); }} style={{ display:"flex", alignItems:"center", gap:10, minHeight:67, padding:"11px 13px", borderRadius:12, border:`1px solid ${active?"#A9C982":"transparent"}`, background:active?"linear-gradient(135deg,#F2F7EB,#EAF3DF)":"transparent", color:active?"#2c5c16":"#64748b", cursor:"pointer", textAlign:"left", fontFamily:FONT, boxShadow:active?"inset 0 0 0 1px rgba(59,121,30,.05)":"none" }}>
              <span style={{ width:34, height:34, borderRadius:10, flexShrink:0, display:"inline-flex", alignItems:"center", justifyContent:"center", background:active?"#3b791e":"#F1F5F2", color:active?"#fff":"#71806F" }}><Icon size={16}/></span>
              <span style={{ minWidth:0 }}><span style={{ display:"block", fontSize:9, fontWeight:900, letterSpacing:".08em", opacity:.72, marginBottom:2 }}>{tab.number}</span><span style={{ display:"block", fontSize:11.4, fontWeight:850, lineHeight:1.25 }}>{tab.label}</span><span style={{ display:"block", fontSize:9.4, color:active?"#5C6B60":"#94a3b8", fontWeight:650, marginTop:3, lineHeight:1.25 }}>{tab.question}</span></span>
            </button>;
          })}
        </div>

        {/* Overview and Ghost Stock share the B2B evidence source but render different decisions. */}
        {!viewArchive && (
          <div style={{display:dashboardTab==="sales_ai"?"none":"block"}}>
            <B2BRevenueAssuranceDashboard
              transactions={transactions}
              brands={propBrands}
              user={user}
              view={dashboardTab==="ghost"?"ghost":"overview"}
              onOpenSalesAi={()=>setDashboardTab("sales_ai")}
            />
          </div>
        )}

        {!viewArchive && dashboardTab === "ghost" && (
          <div style={{ marginTop:18 }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"17px 18px", margin:"0 0 14px", borderRadius:14, background:"linear-gradient(135deg,#eff6ff,#f8fbff)", border:"1px solid #bfdbfe" }}>
              <span style={{ width:34, height:34, borderRadius:10, display:"inline-flex", alignItems:"center", justifyContent:"center", background:"#2563eb", color:"#fff", flexShrink:0 }}><Brain size={17}/></span>
              <div><div style={{ fontSize:14, fontWeight:850, color:"#1e3a5f" }}>AI Prescriptive Guidance</div><div style={{ fontSize:10.8, color:"#52627a", lineHeight:1.55, marginTop:4 }}>Use the detected ghost-stock and revenue-leakage evidence to generate prioritized corrective actions for the selected branches.</div></div>
            </div>
            <PrescriptiveSection transactions={filteredTransactions} filterLabel={filterLabel} preset={preset} total={total} values={values} labels={chartLabels} kpiData={kpiData} showStockAnomalies={false} />
          </div>
        )}

        <div style={{ display:dashboardTab==="sales_ai"?"flex":"none", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, margin:"4px 0 14px", color:"#5C6B60" }}>
          <div style={{ height:1, background:"#E1E6D8", flex:1 }} />
          <span style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:".08em", whiteSpace:"nowrap" }}>Sales &amp; AI Decision Workspace</span>
          <div style={{ height:1, background:"#E1E6D8", flex:1 }} />
        </div>

        {/* ── KPI Cards: visible across Sales Trend, Prescriptive, and Sales vs Stock ── */}
        <div style={{ order:2, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 18, animation: "fadeUp .35s ease" }}>
          {[
            { id:"revenue", label: "Revenue", value: viewArchive ? (viewArchive?.kpis?.totalSales ?? total) : (kpiData?.salesRevenue ?? actualRevenue), icon: TrendingUp, format: "money", note: "Actual sales in selected period" },
            { id:"transactions", label: "Transactions", value: transactionCount, icon: ShoppingCart, format: "count", note: "Completed sales records" },
            { id:"averageSale", label: "Average Sale", value: viewArchive ? averageTransaction : (kpiData?.avgOrder ?? averageTransaction), icon: BarChart2, format: "money", note: "Revenue per transaction" },
            { id:"activeBranches", label: "Active Branches", value: activeBranchCount, icon: Store, format: "count", note: "Branches with recorded sales" },
          ].map((k, i) => {
            const isHidden = !!hiddenKpis[i];
            return (
              <div key={k.id}
                role="button"
                tabIndex={0}
                aria-label={`Open ${k.label} breakdown`}
                onClick={()=>setOperationalKpiDetail({id:k.id,label:k.label})}
                onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setOperationalKpiDetail({id:k.id,label:k.label});}}}
                style={{ background: "#fff", border: "1px solid rgba(0,168,76,0.12)", borderRadius: 18, padding: "18px 20px", boxShadow: "0 2px 14px rgba(0,140,60,0.07)", position: "relative", overflow: "hidden", transition: "transform .2s, box-shadow .2s", cursor:"pointer", outline:"none" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,140,60,0.13)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 14px rgba(0,140,60,0.07)"; }}>
                  <button
                    onClick={e => {e.stopPropagation();setHiddenKpis(prev => ({ ...prev, [i]: !prev[i] }));}}
                    onKeyDown={e=>e.stopPropagation()}
                    style={{
                      position: "absolute", top: 14, right: 14,
                      background: "none", border: "none", cursor: "pointer",
                      color: "#1565c0", opacity: 0.6, padding: 2,
                      display: "flex", alignItems: "center",
                    }}
                    title={isHidden ? "Show value" : "Hide value"}
                  >
                    {!isHidden
                      ? <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      : <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    }
                  </button>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#5a7a65", marginBottom: 5, display: "flex", alignItems: "center", gap: 5, fontFamily: FONT }}>
                      <k.icon size={12} color="#00897b" /> {k.label}
                    </div>
                    {kpiLoading && k.value == null
                      ? <div style={{ fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 9, background: "#f0fdf5", border: "1.5px dashed #a7f3d0", color: "#5a7a65", display: "inline-block", fontFamily: FONT }}>Loading…</div>
                      : k.value != null
                        ? <div style={{ fontSize: 22, fontWeight: 800, color: "#0d2b1e", letterSpacing: "-0.5px", fontFamily: FONT }}>
                            {!isHidden ? (k.format === "money" ? fmtAmt(k.value) : Number(k.value).toLocaleString()) : (k.format === "money" ? "₱••••••••" : "••••")}
                          </div>
                        : <div style={{ fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 9, background: "#f0fdf5", border: "1.5px dashed #a7f3d0", color: "#5a7a65", display: "inline-block", fontFamily: FONT }}>— Pending</div>
                    }
                  </div>
                  <SparkBar values={values.slice(-7)} color="#00c853" height={28} />
                </div>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: "#94a3b8", fontFamily: FONT }}>{k.note}</div>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginTop:4 }}><div style={{ fontSize: 9.5, fontWeight: 600, color: "#A7B0A5", fontFamily: FONT }}>{getRangeLabel()} · {filterLabel}</div><span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:9.5,fontWeight:800,color:"#3b791e",whiteSpace:"nowrap"}}>Breakdown <ChevronRight size={11}/></span></div>
              </div>
            );
          })}
        </div>

        <OperationalKpiBreakdownModal
          detail={operationalKpiDetail}
          onClose={()=>setOperationalKpiDetail(null)}
          overview={{
            revenue:viewArchive ? (viewArchive?.kpis?.totalSales ?? total) : (kpiData?.salesRevenue ?? actualRevenue),
            transactions:transactionCount,
            averageSale:viewArchive ? averageTransaction : (kpiData?.avgOrder ?? averageTransaction),
            activeBranches:activeBranchCount,
          }}
          branchRows={branchProfitability}
          rangeLabel={getRangeLabel()}
          filterLabel={filterLabel}
        />

        {/* ── Filter + Date toolbar ── */}
        <div style={{ order:1, background: "#fff", border: "1px solid rgba(0,168,76,0.12)", borderRadius: 14, padding: "12px 16px", marginBottom: 14, boxShadow: "0 1px 8px rgba(0,140,60,0.05)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Brand dropdown */}
          <div ref={brandRef} style={{ position: "relative", minWidth: 170 }}>
            <div onClick={() => { setBrandDropOpen(v => !v); setBrandQ(""); }}
              style={{ ...filterInputSt, display: "flex", alignItems: "center", gap: 7, cursor: "pointer", paddingRight: 26, userSelect: "none", color: filterBrand ? "#0d2b1e" : "#5a7a65" }}>
              <Globe size={12} color="#00897b" />
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12 }}>{selectedBrand ? selectedBrand.name : "All Brands"}</span>
              <ChevronDown size={10} style={{ position: "absolute", right: 8, color: "#5a7a65" }} />
            </div>
            {brandDropOpen && (
              <div style={dropSt}>
                <div style={{ padding: "6px 8px", borderBottom: "1px solid #b2dfdb", position: "sticky", top: 0, background: "#fff" }}>
                  <div style={{ position: "relative" }}>
                    <Search size={10} style={{ position: "absolute", left: 7, top: "50%", transform: "translateY(-50%)", color: "#5a7a65" }} />
                    <input autoFocus type="text" value={brandQ} onChange={e => setBrandQ(e.target.value)} placeholder="Search…" onClick={e => e.stopPropagation()} style={{ ...filterInputSt, height: 28, fontSize: 11, paddingLeft: 24 }} />
                  </div>
                </div>
                <div style={optSt(!filterBrand)} onMouseDown={() => { setFilterBrand(null); setFilterBranch(null); setBrandDropOpen(false); }}>All Brands</div>
                {filteredBrands.map(b => (
                  <div key={b.id} style={optSt(filterBrand === b.id)} onMouseDown={() => { setFilterBrand(b.id); setFilterBranch(null); setBrandDropOpen(false); setBrandQ(""); }}>
                    <Store size={12} color="#00897b" /> {b.name}
                    <span style={{ marginLeft: "auto", fontSize: 10, color: "#5a7a65" }}>{(b.branches || []).length} branches</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Branch dropdown */}
          <div ref={branchRef} style={{ position: "relative", minWidth: 180, opacity: filterBrand ? 1 : 0.45 }}>
            <div onClick={() => { if (filterBrand) { setBranchDropOpen(v => !v); setBranchQ(""); } }}
              style={{ ...filterInputSt, display: "flex", alignItems: "center", gap: 7, cursor: filterBrand ? "pointer" : "not-allowed", paddingRight: 26, userSelect: "none", color: filterBranch ? "#0d2b1e" : "#5a7a65" }}>
              <Store size={12} color={filterBrand ? "#00897b" : "#5a7a65"} />
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12 }}>{filterBranch || (filterBrand ? "All Branches" : "Select brand first")}</span>
              {filterBrand && <ChevronDown size={10} style={{ position: "absolute", right: 8, color: "#5a7a65" }} />}
            </div>
            {branchDropOpen && filterBrand && (
              <div style={dropSt}>
                <div style={{ padding: "6px 8px", borderBottom: "1px solid #b2dfdb", position: "sticky", top: 0, background: "#fff" }}>
                  <div style={{ position: "relative" }}>
                    <Search size={10} style={{ position: "absolute", left: 7, top: "50%", transform: "translateY(-50%)", color: "#5a7a65" }} />
                    <input autoFocus type="text" value={branchQ} onChange={e => setBranchQ(e.target.value)} placeholder="Search…" onClick={e => e.stopPropagation()} style={{ ...filterInputSt, height: 28, fontSize: 11, paddingLeft: 24 }} />
                  </div>
                </div>
                <div style={optSt(!filterBranch)} onMouseDown={() => { setFilterBranch(null); setBranchDropOpen(false); }}>All Branches</div>
                {filteredBranches.map(br => (
                  <div key={br} style={optSt(filterBranch === br)} onMouseDown={() => { setFilterBranch(br); setBranchDropOpen(false); setBranchQ(""); }}>
                    <Store size={11} color="#00897b" /> {br}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active chips */}
          {(filterBrand || filterBranch) && (
            <>
              {filterBrand && !filterBranch && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#e0f2f1", color: "#00695c", border: "1px solid #b2dfdb", cursor: "pointer", fontFamily: FONT }}
                  onClick={() => { setFilterBrand(null); setFilterBranch(null); }}>
                  <Store size={10} /> {selectedBrand?.name} <X size={9} />
                </span>
              )}
              {filterBranch && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#e0f2f1", color: "#00695c", border: "1px solid #b2dfdb", cursor: "pointer", fontFamily: FONT }}
                  onClick={() => setFilterBranch(null)}>
                  <Store size={10} /> {filterBranch} <X size={9} />
                </span>
              )}
              <button onClick={() => { setFilterBrand(null); setFilterBranch(null); }} style={{ padding: "3px 9px", borderRadius: 20, border: "1px solid #d1d5db", background: "#f9fafb", color: "#6b7280", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Clear</button>
            </>
          )}

          <div style={{ width: 1, height: 24, background: "#e0ede2", margin: "0 4px" }} />

          {/* Preset tabs */}
          <div style={{ display: "flex", gap: 3, background: "#f0faf4", borderRadius: 10, padding: 3 }}>
            {["day","week","month","year"].map(p => (
              <button key={p} style={tabSt(rangeMode === "preset" && preset === p)} onClick={() => { setRangeMode("preset"); setPreset(p); setViewArchive(null); }}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          {/* Custom range */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Calendar size={12} color="#5a7a65" />
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} max={customTo} style={{ padding: "6px 9px", borderRadius: 8, border: "1.5px solid #b2dfdb", background: "#f0fdf5", fontSize: 11, fontFamily: FONT, color: "#0d2b1e", outline: "none" }} />
            <span style={{ color: "#5a7a65", fontSize: 11, fontFamily: FONT }}>to</span>
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} min={customFrom} max={fmt8(today)} style={{ padding: "6px 9px", borderRadius: 8, border: "1.5px solid #b2dfdb", background: "#f0fdf5", fontSize: 11, fontFamily: FONT, color: "#0d2b1e", outline: "none" }} />
          <button
            onClick={applyCustomRange}
            disabled={applyingRange}
            style={{
              padding: "6px 13px", borderRadius: 8, border: "none",
              background: "linear-gradient(135deg,#00c853,#00897b)",
              color: "#fff", fontSize: 11, fontWeight: 700,
              cursor: applyingRange ? "not-allowed" : "pointer",
              fontFamily: FONT, opacity: applyingRange ? 0.7 : 1,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {applyingRange ? (
              <>
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}>
                  <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
                  <path d="M21 12a9 9 0 0 0-9-9" />
                </svg>
                Applying…
              </>
            ) : "Apply"}
          </button>
          </div>

          {/* Archive */}
          <button onClick={() => setShowArchive(v => !v)} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, border: "1.5px solid #b2dfdb", background: showArchive ? "#e0f2f1" : "#fff", color: "#00695c", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
            <Archive size={13} /> Archives
            {archives.length > 0 && <span style={{ background: "#00897b", color: "#fff", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 800 }}>{archives.length}</span>}
          </button>
        </div>

        {/* Archive panel */}
        {showArchive && (
          <div style={{ order:3, background: "#fff", border: "1px solid rgba(0,168,76,0.15)", borderRadius: 16, padding: "18px 20px", boxShadow: "0 2px 16px rgba(0,140,60,0.08)", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 14, color: "#0d2b1e", display: "flex", alignItems: "center", gap: 7 }}>
                <Archive size={15} color="#00897b" /> Yearly Archives
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="number"
                  value={archiveYear}
                  onChange={e => setArchiveYear(e.target.value)}
                  min="2000"
                  max="2100"
                  placeholder="Year"
                  style={{ padding: "6px 9px", borderRadius: 8, border: "1.5px solid #b2dfdb", background: "#f0fdf5", fontSize: 12, fontFamily: FONT, color: "#0d2b1e", outline: "none", width: 86 }}
                />
                <button onClick={requestArchiveYear} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#2E7D32,#00897b)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
                  <Plus size={12} /> Archive Year
                </button>
              </div>
            </div>
            {archives.length === 0
              ? <div style={{ padding: "20px 0", textAlign: "center", color: "#94a3b8", fontSize: 13, fontFamily: FONT }}>No archives yet.</div>
              : archives.map(a => (
                <div key={a.year} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 13px", borderRadius: 9, border: "1px solid #e0f2f1", marginBottom: 7, background: "#f8fffe" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: "#0d2b1e", fontFamily: FONT }}>{a.label}</div>
                    <div style={{ fontSize: 10.5, color: "#5a7a65", marginTop: 2, fontFamily: FONT }}>Saved: {a.savedAt} · Total: {fmtAmt(a.kpis.totalSales)}</div>
                  </div>
                  <div style={{ display: "flex", gap: 7 }}>
                    <button onClick={() => { setViewArchive(viewArchive?.year === a.year ? null : a); setShowArchive(false); }} style={{ padding: "4px 11px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT, border: `1px solid ${viewArchive?.year === a.year ? "#00897b" : "#b2dfdb"}`, background: viewArchive?.year === a.year ? "#e0f2f1" : "#f8fffe", color: "#00695c" }}>
                      {viewArchive?.year === a.year ? "Viewing" : "View"}
                    </button>
                    <button onClick={() => deleteArchive(a.year)} style={{ padding: "4px 11px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT, border: "1px solid #fecaca", background: "#fff", color: "#ef4444" }}>Delete</button>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* ── Analysis workspace tabs ── */}
        <div style={{ display:"none" }}>
          {[
            { id:"sales", label:"Sales Trend", icon:TrendingUp },
            { id:"prescriptive", label:"Prescriptive Analysis", icon:Brain },
            { id:"stock", label:"Sales vs Stock", icon:Package },
          ].map(t => <button key={t.id} onClick={()=>setAnalysisTab(t.id)} style={{ position:"relative", minWidth:170, padding:"17px 16px 15px", border:"none", background:"transparent", color:analysisTab===t.id?"#139a43":"#94a3b8", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:FONT, display:"flex", alignItems:"center", justifyContent:"center", gap:7, whiteSpace:"nowrap" }}><t.icon size={14}/>{t.label}{analysisTab===t.id&&<span style={{position:"absolute",left:10,right:10,bottom:0,height:2.5,borderRadius:"4px 4px 0 0",background:"#22a447"}}/>}</button>)}
        </div>

        {false && analysisTab === "sales" && <>
          <div style={{ display:"grid", gridTemplateColumns:"minmax(0,1.65fr) minmax(330px,.85fr)", gap:16, marginBottom:16 }}>
            <div style={{ background:"#fff", border:"1px solid #E1E6D8", borderRadius:18, padding:"18px 20px", boxShadow:"0 2px 14px rgba(50,109,32,.06)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:12 }}><div><div style={{ fontSize:15, fontWeight:800, color:"#12241B" }}>Revenue Trend</div><div style={{ fontSize:11, color:"#6B7A65", marginTop:3 }}>Actual revenue movement · {getRangeLabel()}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:10,color:"#7A887B",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em"}}>Period revenue</div><div style={{fontSize:17,fontWeight:800,color:"#3b791e",marginTop:2}}>{fmtAmt(viewArchive ? (viewArchive?.kpis?.totalSales ?? total) : actualRevenue)}</div></div></div>
              <DashboardLineGraph labels={chartLabels} values={values} />
            </div>
            <div style={{ background:"#fff", border:"1px solid #E1E6D8", borderRadius:18, padding:"18px 20px", boxShadow:"0 2px 14px rgba(50,109,32,.06)" }}><div style={{fontSize:15,fontWeight:800,color:"#12241B"}}>Branch Performance</div><div style={{fontSize:11,color:"#6B7A65",marginTop:3,marginBottom:16}}>Ranked by actual revenue</div><DashboardRankBars data={branchPerformance}/></div>
          </div>
          <div style={{
            background:"#fff",
            border:"1px solid #E1E6D8",
            borderRadius:18,
            padding:"18px 20px",
            marginBottom:18,
            boxShadow:"0 2px 14px rgba(50,109,32,.06)"
          }}>
            <div style={{
              display:"flex",
              justifyContent:"space-between",
              alignItems:"flex-start",
              gap:12,
              marginBottom:16,
              flexWrap:"wrap"
            }}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <div style={{fontSize:15,fontWeight:800,color:"#12241B"}}>
                    Branch Profitability
                  </div>
                  {!viewArchive && (
                    <span style={{
                      fontSize:9.5,fontWeight:800,padding:"3px 8px",
                      borderRadius:20,background:"#ecfdf5",color:"#15803d",
                      border:"1px solid #bbf7d0",letterSpacing:".04em"
                    }}>
                      API DATA
                    </span>
                  )}
                </div>
                <div style={{fontSize:11,color:"#6B7A65",marginTop:4}}>
                  Revenue, gross profit, margin and transaction efficiency by branch
                </div>
              </div>

              {!viewArchive && (
                <div style={{textAlign:"right"}}>
                  <div style={{
                    fontSize:9.5,color:"#7A887B",fontWeight:700,
                    textTransform:"uppercase",letterSpacing:".06em"
                  }}>
                    Branches analyzed
                  </div>
                  <div style={{
                    fontSize:17,fontWeight:800,color:"#3b791e",marginTop:2
                  }}>
                    {branchProfitability.length.toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {branchProfitability.length > 0 ? (
              <div style={{
                overflowX:"auto",
                border:"1px solid #E7EEE4",
                borderRadius:13
              }}>
                <table style={{
                  width:"100%",
                  borderCollapse:"collapse",
                  minWidth:820,
                  fontFamily:FONT
                }}>
                  <thead>
                    <tr style={{background:"#F6FAF3"}}>
                      {[
                        { label:"Branch", align:"left" },
                        { label:"Revenue", align:"right" },
                        { label:"Gross Profit", align:"right" },
                        { label:"Margin", align:"center" },
                        { label:"Transactions", align:"center" },
                        { label:"Avg. Order", align:"right" },
                      ].map((h) => (
                        <th key={h.label} style={{
                          padding:"11px 13px",
                          textAlign:h.align,
                          fontSize:9.5,
                          color:"#71806F",
                          fontWeight:800,
                          textTransform:"uppercase",
                          letterSpacing:".065em",
                          borderBottom:"1px solid #DDE8DA",
                          whiteSpace:"nowrap"
                        }}>
                          {h.label}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {branchProfitability.map((row, index) => {
                      const hasProfitData = row.hasCogs;
                      const marginColor = !hasProfitData
                        ? "#94a3b8"
                        : row.margin >= 40
                          ? "#15803d"
                          : row.margin >= 25
                            ? "#3b791e"
                            : row.margin >= 15
                              ? "#d97706"
                              : "#dc2626";

                      const marginBg = !hasProfitData
                        ? "#f8fafc"
                        : row.margin >= 40
                          ? "#ecfdf5"
                          : row.margin >= 25
                            ? "#f0f5e8"
                            : row.margin >= 15
                              ? "#fffbeb"
                              : "#fef2f2";

                      const borderBottom = index === branchProfitability.length - 1
                        ? "none"
                        : "1px solid #EEF3EC";

                      return (
                        <tr key={row.branch} style={{
                          background:index % 2 === 0 ? "#fff" : "#FBFDF9"
                        }}>
                          <td style={{padding:"12px 13px",borderBottom}}>
                            <div style={{display:"flex",alignItems:"center",gap:9}}>
                              <span style={{
                                width:24,height:24,borderRadius:8,
                                background:"#F0F5E8",color:"#3b791e",
                                display:"inline-flex",alignItems:"center",
                                justifyContent:"center",fontSize:10,
                                fontWeight:800,flexShrink:0
                              }}>
                                {index + 1}
                              </span>
                              <span style={{
                                fontSize:11.5,fontWeight:800,color:"#12241B",
                                whiteSpace:"nowrap"
                              }}>
                                {row.branch}
                              </span>
                            </div>
                          </td>

                          <td style={{
                            padding:"12px 13px",textAlign:"right",
                            fontSize:11.5,fontWeight:800,color:"#183126",
                            whiteSpace:"nowrap",borderBottom
                          }}>
                            {fmtAmt(row.revenue)}
                          </td>

                          <td style={{
                            padding:"12px 13px",textAlign:"right",
                            fontSize:11.5,fontWeight:800,
                            color:hasProfitData ? "#1d4ed8" : "#94a3b8",
                            whiteSpace:"nowrap",borderBottom
                          }}>
                            {hasProfitData ? fmtAmt(row.grossProfit) : "—"}
                          </td>

                          <td style={{
                            padding:"12px 13px",
                            textAlign:"center",
                            borderBottom
                          }}>
                            <span style={{
                              display:"inline-flex",
                              alignItems:"center",
                              justifyContent:"center",
                              minWidth:60,
                              padding:"4px 8px",
                              borderRadius:20,
                              background:marginBg,
                              color:marginColor,
                              border:`1px solid ${marginColor}25`,
                              fontSize:10.5,
                              fontWeight:800,
                              whiteSpace:"nowrap"
                            }}>
                              {hasProfitData ? `${row.margin.toFixed(1)}%` : "No COGS"}
                            </span>
                          </td>

                          <td style={{
                            padding:"12px 13px",textAlign:"center",
                            fontSize:11.5,fontWeight:700,color:"#334155",
                            borderBottom
                          }}>
                            {row.transactions.toLocaleString()}
                          </td>

                          <td style={{
                            padding:"12px 13px",textAlign:"right",
                            fontSize:11.5,fontWeight:800,color:"#3b791e",
                            whiteSpace:"nowrap",borderBottom
                          }}>
                            {fmtAmt(row.avgOrder)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{
                minHeight:180,display:"flex",alignItems:"center",
                justifyContent:"center",border:"1px dashed #D7E1D4",
                borderRadius:12,background:"#FAFCF8",color:"#7A887B",
                fontSize:12,fontWeight:600,textAlign:"center",padding:20
              }}>
                {viewArchive
                  ? "Branch profitability is not stored in this archived dashboard snapshot."
                  : "No branch transaction data is available for the selected filter."}
              </div>
            )}

            {!viewArchive &&
              branchProfitability.length > 0 &&
              branchProfitability.some(row => !row.hasCogs) && (
                <div style={{
                  marginTop:10,display:"flex",alignItems:"flex-start",gap:7,
                  padding:"9px 11px",borderRadius:9,background:"#fffaf0",
                  border:"1px solid #fde68a",color:"#92400e",
                  fontSize:10.5,lineHeight:1.55
                }}>
                  <Info size={13} style={{flexShrink:0,marginTop:1}} />
                  <span>
                    Gross Profit and Margin show “No COGS” when the transaction API
                    has no cost-of-goods value. Revenue, Transactions and Avg. Order
                    still come directly from the API.
                  </span>
                </div>
              )}
          </div>
        <SalesTrendSection values={values} labels={chartLabels} kpiData={kpiData} total={total} avg={avg} peak={peak} low={low} peakLabel={peakLabel} pctChange={pctChange} trending={trending} getRangeLabel={getRangeLabel} filterLabel={filterLabel} filterBrand={filterBrand} filterBranch={filterBranch} brands={brandList} transactionCount={transactionCount || 0} averageTransaction={averageTransaction} branchPerformance={branchPerformance} brandPerformance={brandPerformance} branchProfitability={branchProfitability} />
        </>}

        {false && analysisTab === "prescriptive" && <PrescriptiveSection transactions={filteredTransactions} filterLabel={filterLabel} preset={preset} total={total} values={values} labels={chartLabels} kpiData={kpiData} />}

        {false && analysisTab === "stock" && <SalesVsStockSection preset={preset} appliedRange={appliedRange} rangeMode={rangeMode} filterBranch={filterBranch} filterBrand={filterBrand} selectedBrand={selectedBrand} total={total} transactions={filteredTransactions} />}

        {dashboardTab === "sales_ai" && (
          <div style={{order:4}}>
            <div style={{ background:"linear-gradient(135deg,#F4F8F0,#fff)", border:"1px solid #DCE9DB", borderLeft:"5px solid #3b791e", borderRadius:14, padding:"14px 16px", marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:14, fontWeight:850, color:"#12241B" }}><LineChart size={16} color="#3b791e"/> Read the actual sales evidence first</div>
              <div style={{ fontSize:10.8, color:"#5C6B60", lineHeight:1.55, marginTop:5 }}>Use the actual revenue line, period summary, and branch profitability below to understand sales movement. Corrective recommendations are kept with the loss evidence in Ghost Stock Anomalies.</div>
            </div>

            <SalesTrendSection values={values} labels={chartLabels} kpiData={kpiData} total={total} avg={avg} peak={peak} low={low} peakLabel={peakLabel} pctChange={pctChange} trending={trending} getRangeLabel={getRangeLabel} filterLabel={filterLabel} filterBrand={filterBrand} filterBranch={filterBranch} brands={brandList} transactionCount={transactionCount || 0} averageTransaction={averageTransaction} branchPerformance={branchPerformance} brandPerformance={brandPerformance} branchProfitability={branchProfitability} />

          </div>
        )}
        </div>

        <InfoModal modal={infoModal} onClose={closeInfo} onConfirm={() => { if (infoModal?.onConfirm) infoModal.onConfirm(); }} />

        <Toast toast={toast} onClose={() => setToast(null)} />
          
      </div>
    );
  }

// MOBILE SHOP CONTENT
const Field = ({ label, error, children }) => (
    <div>
      <label style={{ fontSize:"0.8rem", fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</label>
      {children}
      {error && <p style={{ color:"#e53935", fontSize:"0.72rem", marginTop:3, fontWeight:600 }}>{error}</p>}
    </div>
  );


function MultiSelectBranchDropdown({ branches, selected, onChange, disabled, error, msInputStyle }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const toggle = (br) => {
    const updated = selected.includes(br)
      ? selected.filter(b => b !== br)
      : [...selected, br];
    onChange(updated);
  };

  const selectAll = () => onChange([...branches]);
  const clearAll  = () => onChange([]);

  const label = disabled
    ? "Select a brand first"
    : selected.length === 0
      ? "Select branches…"
      : selected.length === branches.length
        ? "All branches"
        : selected.join(", ");

  return (
    <div ref={ref} style={{ position:"relative", marginTop:"0.3rem" }}>
      <div
        onClick={() => { if (!disabled) setOpen(v => !v); }}
        style={{
          ...msInputStyle,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          border: `1px solid ${error ? "#e53935" : "#d1eedd"}`,
          userSelect:"none", paddingRight:10,
          minHeight:36, height:"auto", flexWrap:"wrap", gap:4,
        }}>
        {selected.length > 0 && !disabled ? (
          <div style={{ display:"flex", flexWrap:"wrap", gap:4, flex:1 }}>
            {selected.map(br => (
              <span key={br} style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:600, background:"#e0f2f1", color:"#00695c", border:"1px solid #b2dfdb" }}>
                {br}
                <span
                  onMouseDown={e => { e.stopPropagation(); toggle(br); }}
                  style={{ cursor:"pointer", fontSize:12, lineHeight:1, color:"#5a7a65" }}>×</span>
              </span>
            ))}
          </div>
        ) : (
          <span style={{ color: C.muted, fontSize:13 }}>{label}</span>
        )}
        <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition:"transform .15s" }}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>

      {open && !disabled && (
        <div style={{
          position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:500,
          background:C.white, border:`1px solid ${C.border}`, borderRadius:10,
          boxShadow:"0 8px 24px rgba(0,0,0,0.10)", overflow:"hidden",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", padding:"7px 12px", borderBottom:`1px solid ${C.border}`, background:"#f8fffe" }}>
            <span onMouseDown={e => { e.preventDefault(); selectAll(); }}
              style={{ fontSize:11, fontWeight:700, color:"#00897b", cursor:"pointer" }}>
              Select All
            </span>
            <span onMouseDown={e => { e.preventDefault(); clearAll(); }}
              style={{ fontSize:11, fontWeight:700, color:C.muted, cursor:"pointer" }}>
              Clear
            </span>
          </div>
          <div style={{ maxHeight:180, overflowY:"auto" }}>
            {branches.length === 0 ? (
              <div style={{ padding:"12px", fontSize:12, color:C.muted, fontStyle:"italic", textAlign:"center" }}>No branches available</div>
            ) : branches.map(br => (
              <div key={br} onMouseDown={e => { e.preventDefault(); toggle(br); }}
                style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding:"9px 12px", cursor:"pointer", fontSize:13,
                  background: selected.includes(br) ? "#f0fdf5" : C.white,
                  borderBottom:`1px solid #f5fdf7`,
                }}>
                <div style={{
                  width:16, height:16, borderRadius:4, flexShrink:0,
                  border: `2px solid ${selected.includes(br) ? "#00897b" : "#b2dfdb"}`,
                  background: selected.includes(br) ? "#00897b" : C.white,
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  {selected.includes(br) && (
                    <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
                <span style={{ fontWeight: selected.includes(br) ? 700 : 500, color: selected.includes(br) ? "#00695c" : C.ink }}>
                  {br}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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

const DB_TO_UI_STATUS = {
  pending:  "pending",
  accepted: "accepted",
  shipping: "shipping",
  received: "received",
  rejected: "rejected",
};

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

  const [shippingId, setShippingId] = useState(null);

  const [stockAvailability, setStockAvailability] = useState({});

  const showToast = (type, title, message) => setToast({ type, title, message });

  /* ── printing ── */
const triggerPrint = (ordersToPrint, onDone) => {
  if (!ordersToPrint || ordersToPrint.length === 0) { onDone?.(); return; }
  setPrintQueue(ordersToPrint);
  setTimeout(() => {
    window.print();
    setPrintQueue([]);
    onDone?.();
  }, 80);
};

  /* ── activity log ── */
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
    await fetchOrders({ silent: true });
    setToast(null);
    setRefreshingOrders(false);
  };

const fetchOrders = async ({ silent = false } = {}) => {
  if (!silent) setLoadingData(true);
  setError(null);
  try {
    const HQ_ROLES = ["Super Admin", "Franchisee Operations Admin"];
    const params = new URLSearchParams({ role: user?.role || "" });
    if (!HQ_ROLES.includes(user?.role)) {
      if (user?.branch) params.set("branch", user.branch);
      if (user?.brand)  params.set("brand", user.brand);
    }

    const res = await fetch(`${apiUrl}/orders?${params.toString()}`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to load orders");
    const data = await res.json();
    setOrders(data.map(normalizeOrder));
  } catch (err) {
    setError(err.message);
  } finally {
    if (!silent) setLoadingData(false);
  }
};

  const fetchIngredients = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/ingredients`);
      const d = await res.json();
      setIngredients(Array.isArray(d) ? d : []);
    } catch (err) { console.warn("Failed to fetch ingredients:", err); }
  }, [apiUrl]);

  useEffect(() => { fetchOrders(); fetchActivityLog(); fetchIngredients(); }, [fetchActivityLog, fetchIngredients]);

  /* ── NEW: automatic stock availability for all pending orders ──
     Runs whenever the order list changes — no button click needed.
     Caps each item's availability at the linked ingredient's real batch stock,
     same logic the old manual "check stock" step used, just automatic + upfront. */
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

/* ── automatic stock availability, sourced entirely from Stock Inventory
     (ingredients/ingredient_batches). shop_items.stock is just a mirror of
     this now — never treated as authoritative. ── */
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
      shopItemsMap = await fetchShopItemsMap(); // still needed to resolve shop_item_id -> ingredient_id
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
      const coords = await getBrowserLocation(); // reuse the helper used elsewhere in this app
      try {
        const res = await fetch(`${apiUrl}/orders/${order._dbId}`, {
          method:"PUT", headers:{ "Content-Type":"application/json" }, credentials:"include",
          body: JSON.stringify({
            status: nextUiStatus,
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

  const handleShip = async (order) => {
    setShippingId(order.id);
    try {
      await advanceStatus(order, "shipping", "Marked as shipping");
      showToast("success", "Order shipped", `#${order.id} is on its way.`);
    } catch (err) {
      showToast("error", "Couldn't ship order", err.message);
    } finally {
      setShippingId(null);
    }
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
      if (ok) accepted.push({ ...o, status: "accepted" });
    } catch {}
  }
  setMassAccepting(false);

  if (accepted.length > 0) {
    showToast("success", "Orders accepted", `${accepted.length} accepted${skipped ? `, ${skipped} skipped (low stock)` : ""} — sending to print.`);
    triggerPrint(accepted, () => { fetchOrders({ silent: true }); });
  } else {
    setToast(null);
    await fetchOrders({ silent: true });
  }
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
    shipping: orders.filter(o => o.status === "shipping").length,
    received: orders.filter(o => o.status === "received").length,
    rejected: orders.filter(o => o.status === "rejected").length,
  };

  const FILTER_CHIPS = [
    { key:"all",      label:"All Orders",      count:counts.total },
    { key:"pending",  label:"Incoming Orders", count:counts.pending },
    { key:"accepted", label:"To Ship",         count:counts.accepted },
    { key:"shipping", label:"Shipping",        count:counts.shipping },
    { key:"received", label:"Delivered",       count:counts.received },
    { key:"rejected", label:"Rejected",        count:counts.rejected },
  ];

  if (loadingData) return (
    <div style={{ padding:60, textAlign:"center", color:C.muted, fontFamily:"'Montserrat',sans-serif" }}>Loading orders…</div>
  );
  if (error) return (
    <div style={{ padding:40, textAlign:"center", fontFamily:"'Montserrat',sans-serif" }}>
      <div style={{ color:C.red, marginBottom:12 }}>{error}</div>
      <button onClick={fetchOrders} style={{ padding:"8px 20px", borderRadius:8, border:`1px solid ${C.border}`, background:C.greenLt, color:C.greenDk, fontWeight:700, cursor:"pointer" }}>Retry</button>
    </div>
  );

  return (
    <div style={{ fontFamily:"'Montserrat',sans-serif" }}>
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
                onShip={handleShip}
                shipDisabled={shippingId === order.id}
                shipping={shippingId === order.id} 
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
          onShip={handleShip}
          shipDisabled={shippingId === viewOrder.id}
          shipping={shippingId === viewOrder.id}
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
const tabFiltered = (selectedTab === 'recent' ? merged.filter(a => new Date(a.created_at) >= sevenDaysAgo)
  : selectedTab === 'pinned' ? merged.filter(a => a.pinned)
  : selectedTab === 'deleteHistory' ? [] : merged
).sort((a, b) => {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
  return new Date(b.created_at) - new Date(a.created_at);
});

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

