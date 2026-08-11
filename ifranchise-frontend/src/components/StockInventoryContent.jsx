import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import * as XLSX from "xlsx";

import {
  AlertTriangle, RefreshCw, Check, X
} from 'lucide-react'

const C = {
  green:"#00897b", greenDk:"#00695c", greenLt:"#e8f5e9", greenMid:"#c8e6c9",
  teal:"#00c853", ink:"#0d2b1e", muted:"#6b8c77", border:"#daeee5",
  bg:"#f4fbf7", white:"#ffffff", warn:"#d97706", warnBg:"#fffbeb",
  ok:"#2e7d32", okBg:"#e8f5e9", red:"#dc2626", redBg:"#fef2f2",
  amber:"#f59e0b", amberBg:"#fffbeb", amberBorder:"#fde68a",
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

/* ── shared style atoms ── */
const invInputSt = {
  height:36, padding:"0 11px", borderRadius:8,
  border:`1px solid ${C.border}`, background:C.white,
  fontSize:13, color:C.ink, outline:"none",
  fontFamily:"inherit", boxSizing:"border-box", width:"100%",
  transition:"border-color .15s",
};
const invLabelSt = {
  display:"block", fontSize:11, fontWeight:700,
  color:C.muted, marginBottom:5, letterSpacing:"0.04em",
};
const btnSt = {
  display:"inline-flex", alignItems:"center", gap:6,
  height:36, padding:"0 16px", borderRadius:8,
  border:`1px solid ${C.border}`, background:C.white,
  fontSize:13, fontWeight:600, cursor:"pointer",
  fontFamily:"inherit", whiteSpace:"nowrap", color:C.ink,
  transition:"background .15s, border-color .15s",
};
const btnPrimarySt = {
  ...btnSt,
  background:`linear-gradient(135deg,${C.teal},${C.green})`,
  color:C.white, border:"none",
  boxShadow:"0 2px 10px rgba(0,180,90,0.25)",
};
const btnAmberSt = {
  ...btnSt,
  background:`linear-gradient(135deg,#fbbf24,${C.warn})`,
  color:C.white, border:"none",
  boxShadow:"0 2px 10px rgba(217,119,6,0.30)",
};
const smallBtnSt = {
  display:"inline-flex", alignItems:"center", gap:4,
  height:28, padding:"0 11px", borderRadius:6,
  fontSize:12, fontWeight:600, cursor:"pointer",
  fontFamily:"inherit", background:"transparent",
  transition:"background .12s, color .12s",
};

const capitalizeName = (str) => str.replace(/\b\w/g, (c) => c.toUpperCase());
const normalizeName  = (str) => str.trim().toLowerCase().replace(/s$/i, "");


const UNITS = ["pcs","kg","g","liters","ml","tbsp","tsp","cups","bottles","packs","bags","boxes","cans","gallons"];
const DOSAGE_FORMS = ["Tablet","Capsule","Liquid","Injection","Cream","Ointment","Syrup","Other"];
const STORAGE_REQS = ["Room Temperature","Refrigerated","Frozen"];
const FUEL_GRADES  = ["Regular","Premium","Diesel","Kerosene"];
const PAGE_SIZE = 15;
const EXPIRY_WARN_DAYS = 30;
const MIN_SHELF_LIFE_DAYS = 30; // Receive Stock: expiry must be at least 1 month out from received date

const fmtTs = (d) => new Date(d).toLocaleString("en-PH", {
  month:"short", day:"numeric", year:"numeric",
  hour:"2-digit", minute:"2-digit",
  timeZone: "Asia/Manila",
});
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-PH", { month:"short", day:"numeric", year:"numeric", timeZone:"Asia/Manila" }) : "—";

/* ── validation helpers ── */
function isValidDateStr(s) {
  if (!s) return true;
  const d = new Date(s);
  return !isNaN(d.getTime());
}
function isPositiveOrZeroNumber(v) {
  if (v === "" || v === null || v === undefined) return false;
  const n = parseFloat(v);
  return !isNaN(n) && n >= 0;
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
      fontFamily:"'Montserrat',sans-serif",
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
/* ── tiny inline SVG icons ── */
const SearchIcon   = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const EditIcon     = ({ size=12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon    = ({ size=12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const XIcon        = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const PlusIcon     = ({ size=13 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const StoreIcon    = ({ size=14, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const FileIcon     = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const SortAscIcon  = ({ size=11 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>;
const SortDescIcon = ({ size=11 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>;
const FilterIcon   = ({ size=12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const ChevronIcon  = ({ size=12, dir="down" }) => { const d={down:"m6 9 6 6 6-6",up:"m18 15-6-6-6 6"}; return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={d[dir]}/></svg>; };
const HistoryIcon  = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/></svg>;
const RestoreIcon  = ({ size=12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.41"/></svg>;
const ActivityIcon = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const AlertCircleIcon = ({ size=22, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const CheckCircleIcon = ({ size=22, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const InfoIcon        = ({ size=22, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
const LoaderIcon      = ({ size=28, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{animation:"spin 0.9s linear infinite"}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const UploadIcon      = ({ size=28, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const ArrowLeftIcon   = ({ size=13 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const ArrowRightIcon  = ({ size=12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const TruckIcon       = ({ size=13, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const PackageIcon     = ({ size=13, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;

/* ── Brand accent colors (for brand column text only — no bg pill) ── */
function brandAccent(brandName) {
  if (!brandName) return { color:"#00695c" };
  const n = brandName.toLowerCase();
  if (n.includes("ipharma"))      return { color:"#3949ab" };
  if (n.includes("coffee"))       return { color:"#b45309" };
  if (n.includes("food caravan")) return { color:"#b91c1c" };
  if (n.includes("ifuel"))        return { color:"#1565c0" };
  return { color:"#00695c" };
}

/* ── FIFO / FEFO helpers (shared by ReceiveStockModal, FifoQueue) ── */
const THREE_YEARS_MS = 3 * 365.25 * 24 * 60 * 60 * 1000;

function computeExpiryStatus(exp_date, brand) {
  if (!exp_date) return null;
  const now = new Date(); now.setHours(0,0,0,0);
  const exp = new Date(exp_date);
  const msLeft = exp - now;
  const isIPharma = (brand || "").toLowerCase().includes("ipharma");
  if (isIPharma) {
    if (msLeft < THREE_YEARS_MS) return "expired";
    if (msLeft < THREE_YEARS_MS + 7  * 86400000) return "critical";
    if (msLeft < THREE_YEARS_MS + 30 * 86400000) return "warning";
    return "ok";
  }
  if (msLeft < 0) return "expired";
  if (msLeft < 7  * 86400000) return "critical";
  if (msLeft < 30 * 86400000) return "warning";
  return "ok";
}

function getFifoMethod(brand, isPerishable) {
  const isPharma = (brand || "").toLowerCase().includes("ipharma") && isPerishable;
  if (isPharma || isPerishable) {
    return {
      method: "FEFO",
      topLabel: "▲ EXPIRY DATE (FEFO KEY)",
      queueLabel: isPharma
        ? "nearest expiry dispensed first — FDA compliance & patient safety"
        : "nearest expiry dispensed first — reduce spoilage waste",
    };
  }
  return {
    method: "FIFO",
    topLabel: "◄ NEXT OUT",
    queueLabel: "oldest received batch used first",
  };
}

function sortBatchesByMethod(batches, brand, isPerishable) {
  const { method } = getFifoMethod(brand, isPerishable);
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

function computeNextOutCost(batches, brand, isPerishable) {
  const active = batches.filter(b => Number(b.stock) > 0);
  if (active.length === 0) return null;
  const sorted = sortBatchesByMethod(active, brand, isPerishable);
  return Number(sorted[0].cost_per_unit) || 0;
}

function daysRemaining(exp_date) {
  if (!exp_date) return null;
  const now = new Date(); now.setHours(0,0,0,0);
  const exp = new Date(exp_date);
  return Math.round((exp - now) / 86400000);
}

const EXPIRY_STYLE = {
  expired:  { border:"#fecaca", bg:"#fef2f2", badge:"#fecaca", badgeText:"#991b1b", label:"EXPIRED",   dot:"#dc2626" },
  critical: { border:"#fed7aa", bg:"#fff7ed", badge:"#fed7aa", badgeText:"#9a3412", label:"CRITICAL",  dot:"#ea580c" },
  warning:  { border:"#fef08a", bg:"#fefce8", badge:"#fef08a", badgeText:"#854d0e", label:"EXPIRING",  dot:"#ca8a04" },
  ok:       { border:C.greenMid, bg:"#f9fefb", badge:null, badgeText:null, label:null, dot:C.green },
};

const BRAND_DEFS = [
  { key:"coffee",       label:"Coffee Spot",  match:(n)=>n.includes("coffee") },
  { key:"foodcaravan",  label:"Food Caravan", match:(n)=>n.includes("food caravan") },
  { key:"ipharma",      label:"iPharma",      match:(n)=>n.includes("ipharma") },
  { key:"ifuel",        label:"iFuel",        match:(n)=>n.includes("ifuel") },
];

function isPharmaBrand(brand) { return (brand || "").toLowerCase().includes("ipharma"); }
function isFuelBrand(brand)   { return (brand || "").toLowerCase().includes("ifuel"); }

/* small reusable bar for stock level / freshness */
function MiniBar({ pct, color, track="#eef6f1", height=6 }) {
  const w = Math.max(0, Math.min(100, pct ?? 0));
  return (
    <div style={{ background:track, borderRadius:20, height, overflow:"hidden", width:"100%" }}>
      <div style={{ width:`${w}%`, height:"100%", background:color, borderRadius:20, transition:"width .3s ease" }}/>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   UI MODAL
───────────────────────────────────────────────────────────────────────── */
function UIModal({ modal, onClose, onConfirm }) {
  if (!modal) return null;
  const { type, title, message, lines, confirmLabel, cancelLabel } = modal;
  const iconMap = {
    error:   <AlertCircleIcon size={26} color={C.red}/>,
    success: <CheckCircleIcon size={26} color={C.green}/>,
    info:    <InfoIcon size={26} color="#1d4ed8"/>,
    confirm: <AlertCircleIcon size={26} color={C.warn}/>,
  };
  const hc = {
    error:   { bg:C.redBg,   border:"#fecaca",    titleColor:"#991b1b"  },
    success: { bg:C.greenLt, border:C.greenMid,   titleColor:C.greenDk  },
    info:    { bg:"#eff6ff",  border:"#bfdbfe",    titleColor:"#1e3a8a"  },
    confirm: { bg:C.warnBg,  border:"#fed7aa",    titleColor:"#9a3412"  },
  }[type] || { bg:"#eff6ff", border:"#bfdbfe", titleColor:"#1e3a8a" };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:3000, padding:20, backdropFilter:"blur(4px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:16, width:"100%", maxWidth:440, boxShadow:"0 24px 64px rgba(0,0,0,0.16)", border:`1px solid ${hc.border}`, fontFamily:"Montserrat,sans-serif", overflow:"hidden" }}>
        <div style={{ background:hc.bg, padding:"20px 24px 16px", borderBottom:`1px solid ${hc.border}`, display:"flex", alignItems:"flex-start", gap:13 }}>
          <div style={{ flexShrink:0, marginTop:1 }}>{iconMap[type]}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:800, color:hc.titleColor, marginBottom:4 }}>{title}</div>
            {message && <div style={{ fontSize:13, color:C.ink, lineHeight:1.6, opacity:0.85 }}>{message}</div>}
          </div>
          <button onClick={onClose} style={{ flexShrink:0, width:28, height:28, borderRadius:"50%", border:`1px solid ${hc.border}`, background:"transparent", cursor:"pointer", color:C.muted, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <XIcon size={13}/>
          </button>
        </div>
        {lines && lines.length > 0 && (
          <div style={{ maxHeight:220, overflowY:"auto", padding:"12px 24px", borderBottom:`1px solid ${C.border}` }}>
            {lines.map((l, i) => (
              <div key={i} style={{ fontSize:12, color:l.warn?C.warn:C.muted, padding:"3px 0", display:"flex", alignItems:"flex-start", gap:7 }}>
                <span style={{ marginTop:1, flexShrink:0, color:l.warn?C.warn:C.green }}>{l.warn?"–":"+"}</span>
                <span>{l.text}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ padding:"14px 24px", display:"flex", justifyContent:"flex-end", gap:8 }}>
          {type === "confirm" && (
            <button onClick={onClose} style={{ ...btnSt }}>{cancelLabel||"Cancel"}</button>
          )}
          {type === "confirm" ? (
            <button onClick={onConfirm} style={{ ...btnSt, background:C.red, color:"#fff", border:"none" }}>{confirmLabel||"Confirm"}</button>
          ) : (
            <button onClick={onClose} style={{ ...btnPrimarySt }}>{confirmLabel||"OK"}</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── DELETE CONFIRM MODAL ── */
function DeleteConfirmModal({ item, deleting, onConfirm, onCancel }) {
  if (!item) return null;
  return (
    <div onClick={onCancel} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2500, padding:20, backdropFilter:"blur(4px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:16, width:"100%", maxWidth:420, boxShadow:"0 24px 64px rgba(0,0,0,0.16)", border:`1px solid #fecaca`, fontFamily:"Montserrat,sans-serif", overflow:"hidden" }}>
        <div style={{ background:C.redBg, padding:"20px 24px 16px", borderBottom:"1px solid #fecaca", display:"flex", alignItems:"flex-start", gap:13 }}>
          <div style={{ flexShrink:0, marginTop:1 }}><AlertCircleIcon size={26} color={C.red}/></div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:800, color:"#991b1b", marginBottom:5 }}>Delete Ingredient</div>
            <div style={{ fontSize:13, color:C.ink, lineHeight:1.6 }}>
              Are you sure you want to delete <strong>"{item.name}"</strong>?
            </div>
            <div style={{ marginTop:8, background:"#fff5f5", border:"1px solid #fecaca", borderRadius:8, padding:"8px 12px", fontSize:12, color:"#7f1d1d" }}>
              This will move the ingredient to Delete History where it can be restored.
            </div>
          </div>
          <button onClick={onCancel} style={{ flexShrink:0, width:28, height:28, borderRadius:"50%", border:"1px solid #fecaca", background:"transparent", cursor:"pointer", color:C.muted, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <XIcon size={13}/>
          </button>
        </div>
        <div style={{ padding:"12px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", gap:20 }}>
          {[
            { label:"Branch",   val:item.branch||"—"  },
            { label:"Unit",     val:item.unit         },
            { label:"Stock",    val:item.stock        },
            { label:"Cost/Unit",val:`₱${Number(item.cost_per_unit||0).toLocaleString("en-PH",{minimumFractionDigits:2,maximumFractionDigits:2})}` },
          ].map(x => (
            <div key={x.label} style={{ fontSize:12 }}>
              <div style={{ color:C.muted, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>{x.label}</div>
              <div style={{ fontWeight:700, color:C.ink }}>{x.val}</div>
            </div>
          ))}
        </div>
        <div style={{ padding:"14px 24px", display:"flex", justifyContent:"flex-end", gap:8 }}>
          <button onClick={onCancel} disabled={deleting} style={{ ...btnSt, opacity: deleting ? 0.5 : 1 }}>Cancel</button>
      <button onClick={onConfirm} disabled={deleting}
        style={{ ...btnSt, background:C.red, color:"#fff", border:"none", boxShadow:"0 2px 8px rgba(220,38,38,0.25)", opacity: deleting ? 0.7 : 1, cursor: deleting ? "not-allowed" : "pointer" }}>
        {deleting
          ? <><RefreshCw size={13} style={{ animation:"spin .8s linear infinite" }}/> Deleting…</>
          : <><TrashIcon size={13}/> Delete</>}
      </button>
        </div>
      </div>
    </div>
  );
}

/* ── BATCH DELETE CONFIRM MODAL ── */
function BatchDeleteConfirmModal({ batch, ingredient, deleting, onConfirm, onCancel }) {
  if (!batch) return null;
  const expStr = fmtDate(batch.exp_date);
  return (
    <div onClick={onCancel} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2700, padding:20, backdropFilter:"blur(4px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:16, width:"100%", maxWidth:420, boxShadow:"0 24px 64px rgba(0,0,0,0.16)", border:"1px solid #fecaca", fontFamily:"Montserrat,sans-serif", overflow:"hidden" }}>
        <div style={{ background:C.redBg, padding:"20px 24px 16px", borderBottom:"1px solid #fecaca", display:"flex", alignItems:"flex-start", gap:13 }}>
          <div style={{ flexShrink:0, marginTop:1 }}><AlertCircleIcon size={26} color={C.red}/></div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:800, color:"#991b1b", marginBottom:5 }}>Delete Batch</div>
            <div style={{ fontSize:13, color:C.ink, lineHeight:1.6 }}>
              Are you sure you want to delete <strong>Batch {batch.batch_number || "—"}</strong> of <strong>"{ingredient?.name}"</strong>?
            </div>
            <div style={{ marginTop:8, background:"#fff5f5", border:"1px solid #fecaca", borderRadius:8, padding:"8px 12px", fontSize:12, color:"#7f1d1d" }}>
              This will move the batch to Batch Delete History where it can be restored. Ingredient stock totals will be recalculated.
            </div>
          </div>
          <button onClick={onCancel} style={{ flexShrink:0, width:28, height:28, borderRadius:"50%", border:"1px solid #fecaca", background:"transparent", cursor:"pointer", color:C.muted, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <XIcon size={13}/>
          </button>
        </div>
        <div style={{ padding:"12px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", gap:20, flexWrap:"wrap" }}>
          {[
            { label:"Stock",    val:`${batch.stock ?? "—"} ${ingredient?.unit || ""}` },
            { label:"Supplier", val:batch.supplier || "—" },
            { label:"Exp Date", val:expStr },
          ].map(x => (
            <div key={x.label} style={{ fontSize:12 }}>
              <div style={{ color:C.muted, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>{x.label}</div>
              <div style={{ fontWeight:700, color:C.ink }}>{x.val}</div>
            </div>
          ))}
        </div>
        <div style={{ padding:"14px 24px", display:"flex", justifyContent:"flex-end", gap:8 }}>
          <button onClick={onCancel} disabled={deleting} style={{ ...btnSt, opacity: deleting ? 0.5 : 1 }}>Cancel</button>
            <button onClick={onConfirm} disabled={deleting}
              style={{ ...btnSt, background:C.red, color:"#fff", border:"none", boxShadow:"0 2px 8px rgba(220,38,38,0.25)", opacity: deleting ? 0.7 : 1, cursor: deleting ? "not-allowed" : "pointer" }}>
              {deleting
                ? <><RefreshCw size={13} style={{ animation:"spin .8s linear infinite" }}/> Deleting…</>
                : <><TrashIcon size={13}/> Delete Batch</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── IMPORT LOADING MODAL ── */
function ImportLoadingModal({ visible, progress }) {
  if (!visible) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:3500, padding:20, backdropFilter:"blur(6px)" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ background:C.white, borderRadius:18, padding:"32px 36px", width:"100%", maxWidth:380, boxShadow:"0 28px 70px rgba(0,0,0,0.22)", border:`1px solid ${C.greenMid}`, fontFamily:"Montserrat,sans-serif", textAlign:"center" }}>
        <div style={{ width:60, height:60, borderRadius:"50%", background:C.greenLt, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px" }}>
          <UploadIcon size={28} color={C.green}/>
        </div>
        <div style={{ fontSize:16, fontWeight:800, color:C.ink, marginBottom:6 }}>Importing Excel</div>
        <div style={{ fontSize:13, color:C.muted, marginBottom:20 }}>Please wait while your data is being processed…</div>
        <div style={{ background:C.greenLt, borderRadius:999, height:6, overflow:"hidden", marginBottom:12 }}>
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

/* ── BrandBranchFilter ── */
function BrandBranchFilter({ brands, activeBrand, activeBranch, onChangeBrand, onChangeBranch }) {
  const [brandQ, setBrandQ]   = useState("");
  const [branchQ, setBranchQ] = useState("");
  const [openB, setOpenB]     = useState(false);
  const [openBr, setOpenBr]   = useState(false);
  const brandRef  = useRef(null);
  const branchRef = useRef(null);

  useEffect(() => {
    const fn = (e) => {
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

  const dropSt = { position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:300, background:C.white, border:`1px solid ${C.border}`, borderRadius:10, boxShadow:"0 8px 28px rgba(0,0,0,0.10)", maxHeight:230, overflowY:"auto" };
  const optSt  = (active) => ({ padding:"9px 14px", cursor:"pointer", fontSize:13, color:active?C.greenDk:C.ink, fontWeight:active?700:500, background:active?C.greenLt:"transparent", display:"flex", alignItems:"center", gap:8 });

  return (
    <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
      <div ref={brandRef} style={{ position:"relative", minWidth:175 }}>
        <div onClick={() => { setOpenB(v=>!v); setBrandQ(""); }}
          style={{ ...invInputSt, display:"flex", alignItems:"center", gap:7, cursor:"pointer", paddingRight:30, userSelect:"none", color:activeBrand?C.ink:C.muted }}>
          <FilterIcon color={C.green}/>
          <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:13 }}>
            {selectedBrand ? selectedBrand.name : "All Brands"}
          </span>
          <ChevronIcon dir={openB?"up":"down"}/>
        </div>
        {openB && (
          <div style={dropSt}>
            <div style={{ padding:"7px 9px", borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, background:C.white }}>
              <div style={{ position:"relative" }}>
                <div style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)", color:C.muted }}><SearchIcon size={11}/></div>
                <input autoFocus type="text" value={brandQ} onChange={e=>setBrandQ(e.target.value)} placeholder="Search brand…" onClick={e=>e.stopPropagation()}
                  style={{ ...invInputSt, height:30, fontSize:12, paddingLeft:26 }}/>
              </div>
            </div>
            <div style={optSt(!activeBrand)} onMouseDown={() => { onChangeBrand(null); onChangeBranch(null); setBrandQ(""); setOpenB(false); }}>All Brands</div>
            {filteredBrands.map(b => (
              <div key={b.id} style={optSt(activeBrand===b.id)} onMouseDown={() => { onChangeBrand(b.id); onChangeBranch(null); setBrandQ(""); setOpenB(false); }}>
                {b.name}
                <span style={{ marginLeft:"auto", fontSize:11, color:C.muted }}>{(b.branches||[]).length} branches</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div ref={branchRef} style={{ position:"relative", minWidth:185, opacity:activeBrand?1:0.45 }}>
        <div onClick={() => { if(activeBrand){ setOpenBr(v=>!v); setBranchQ(""); } }}
          style={{ ...invInputSt, display:"flex", alignItems:"center", gap:7, cursor:activeBrand?"pointer":"not-allowed", paddingRight:30, userSelect:"none", color:activeBranch?C.ink:C.muted }}>
          <StoreIcon size={12} color={activeBrand?C.green:C.muted}/>
          <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:13 }}>
            {activeBranch||(activeBrand?"All Branches":"Select brand first")}
          </span>
        </div>
        {openBr && activeBrand && (
          <div style={dropSt}>
            <div style={{ padding:"7px 9px", borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, background:C.white }}>
              <input autoFocus type="text" value={branchQ} onChange={e=>setBranchQ(e.target.value)} placeholder="Search branch…" style={{ ...invInputSt, height:30, fontSize:12 }}/>
            </div>
            <div style={optSt(!activeBranch)} onMouseDown={() => { onChangeBranch(null); setOpenBr(false); }}>All Branches</div>
            {filteredBranches.map(br => (
              <div key={br} style={optSt(activeBranch===br)} onMouseDown={() => { onChangeBranch(br); setOpenBr(false); }}>
                <StoreIcon size={11} color={C.green}/> {br}
              </div>
            ))}
          </div>
        )}
      </div>

      {(activeBrand || activeBranch) && (
        <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px 3px 8px", borderRadius:20, fontSize:11, fontWeight:700, background:C.greenLt, color:C.greenDk, border:`1px solid ${C.greenMid}`, cursor:"pointer" }}
          onClick={() => { onChangeBrand(null); onChangeBranch(null); }}>
          {activeBranch || selectedBrand?.name} <XIcon size={10}/>
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Pagination
───────────────────────────────────────────────────────────────────────── */
function Pagination({ page, setPage, total, pageSize }) {
  const totalPgs = Math.max(1, Math.ceil(total / pageSize));
  if (totalPgs <= 1) return null;
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 18px", borderTop:`1px solid ${C.border}`, background:"#f9fefb" }}>
      <span style={{ fontSize:12, color:C.muted }}>
        Showing <strong style={{ color:C.ink }}>{(page*pageSize+1).toLocaleString()}–{Math.min((page+1)*pageSize,total).toLocaleString()}</strong> of <strong style={{ color:C.ink }}>{total.toLocaleString()}</strong>
      </span>
      <div style={{ display:"flex", gap:4 }}>
        {[{l:"«",a:()=>setPage(0),d:page===0},{l:"‹",a:()=>setPage(p=>Math.max(0,p-1)),d:page===0}].map(({l,a,d})=>(
          <button key={l} onClick={a} disabled={d} style={{ ...smallBtnSt, height:30, width:30, justifyContent:"center", border:`1px solid ${C.border}`, opacity:d?0.35:1, background:C.white }}>{l}</button>
        ))}
        {Array.from({length:totalPgs},(_,i)=>i).filter(i=>Math.abs(i-page)<=2).map(i=>(
          <button key={i} onClick={()=>setPage(i)} style={{ ...smallBtnSt, height:30, minWidth:30, justifyContent:"center", fontWeight:i===page?800:600, border:i===page?"none":`1px solid ${C.border}`, background:i===page?`linear-gradient(135deg,${C.teal},${C.green})`:C.white, color:i===page?C.white:C.ink }}>{i+1}</button>
        ))}
        {[{l:"›",a:()=>setPage(p=>Math.min(totalPgs-1,p+1)),d:page>=totalPgs-1},{l:"»",a:()=>setPage(totalPgs-1),d:page>=totalPgs-1}].map(({l,a,d})=>(
          <button key={l} onClick={a} disabled={d} style={{ ...smallBtnSt, height:30, width:30, justifyContent:"center", border:`1px solid ${C.border}`, opacity:d?0.35:1, background:C.white }}>{l}</button>
        ))}
      </div>
    </div>
  );
}

/* ── DELETE HISTORY PANEL ── */
function DeleteHistoryPanel({ history, restoringId, onRestore, onClose }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:20, backdropFilter:"blur(4px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:18, padding:"28px 32px", width:"100%", maxWidth:680, maxHeight:"80vh", display:"flex", flexDirection:"column", boxShadow:"0 24px 64px rgba(0,0,0,0.18)", border:"1px solid rgba(0,168,76,0.15)", fontFamily:"Montserrat,sans-serif" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <h2 style={{ fontSize:16, fontWeight:800, color:C.ink, margin:0 }}>Delete History</h2>
            {history.length > 0 && (
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:"#fee2e2", color:C.red }}>{history.length} deleted</span>
            )}
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:`1px solid ${C.border}`, background:C.greenLt, cursor:"pointer", color:C.green, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <XIcon size={15}/>
          </button>
        </div>
        {history.length > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 90px 110px 100px", gap:8, padding:"6px 0 10px", borderBottom:`2px solid ${C.greenLt}`, fontSize:10, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em" }}>
            <span>Ingredient</span><span>Branch</span><span>Stock</span><span>Deleted At</span><span></span>
          </div>
        )}
        <div style={{ overflowY:"auto", flex:1 }}>
          {history.length === 0 ? (
            <div style={{ padding:"40px 0", textAlign:"center", color:"#9ca3af", fontSize:13 }}>No deleted ingredients yet.</div>
          ) : history.map((entry, i) => {
            const d = entry.data || {};
            return (
              <div key={entry.id} style={{ display:"grid", gridTemplateColumns:"1fr 90px 90px 110px 100px", gap:8, alignItems:"center", padding:"12px 0", borderBottom: i < history.length-1 ? `1px solid ${C.bg}` : "none" }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:13, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.name}</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{d.brand||"—"}</div>
                </div>
                <div style={{ fontSize:12, color:C.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.branch}</div>
                <div style={{ fontSize:12, color:C.ink, fontWeight:600 }}>{d.stock} {d.unit}</div>
                <div style={{ fontSize:11, color:"#9ca3af" }}>{entry.deletedAt ? fmtTs(entry.deletedAt) : "—"}</div>
                <button onClick={()=>onRestore(entry)} disabled={restoringId !== null}
                    style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:8,
                      border:`1.5px solid ${C.green}`, background:C.greenLt, color:C.greenDk, fontSize:12, fontWeight:700,
                      cursor: restoringId !== null ? "not-allowed" : "pointer", fontFamily:"inherit", whiteSpace:"nowrap",
                      opacity: restoringId !== null ? (restoringId === entry.id ? 0.85 : 0.4) : 1 }}>
                    {restoringId === entry.id
                      ? <><RefreshCw size={12} style={{ animation:"spin 1s linear infinite" }}/> Restoring…</>
                      : <><RestoreIcon/> Restore</>}
                  </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── ACTIVITY LOG PANEL ── */
function ActivityLogPanel({ log, onClose }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = log.filter(entry => {
    if (typeFilter !== "all" && entry.action !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!entry.ingredientName?.toLowerCase().includes(q) &&
          !(entry.performedBy||"").toLowerCase().includes(q) &&
          !(entry.branch||"").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const actionBadge = (action) => {
    const map = {
      add:     { bg:"rgba(16,185,129,0.12)",  color:"#059669",  label:"Added"    },
      edit:    { bg:"rgba(59,130,246,0.12)",  color:"#1d4ed8",  label:"Edited"   },
      import:  { bg:"rgba(139,92,246,0.12)",  color:"#7c3aed",  label:"Imported" },
      receive: { bg:"rgba(245,158,11,0.14)",  color:"#b45309",  label:"Received" },
    };
    const s = map[action] || map.edit;
    return <span style={{ padding:"2px 9px", borderRadius:4, fontSize:10, fontWeight:700, background:s.bg, color:s.color, whiteSpace:"nowrap" }}>{s.label}</span>;
  };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:20, backdropFilter:"blur(4px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:18, padding:"28px 32px", width:"100%", maxWidth:780, maxHeight:"82vh", display:"flex", flexDirection:"column", boxShadow:"0 24px 64px rgba(0,0,0,0.18)", border:"1px solid rgba(0,168,76,0.15)", fontFamily:"Montserrat,sans-serif" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <h2 style={{ fontSize:16, fontWeight:800, color:C.ink, margin:0 }}>Activity Log</h2>
            <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:C.greenLt, color:C.greenDk }}>{filtered.length} entries</span>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:`1px solid ${C.border}`, background:C.greenLt, cursor:"pointer", color:C.green, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <XIcon size={15}/>
          </button>
        </div>
        <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
          <div style={{ position:"relative", flex:"1 1 200px" }}>
            <div style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", color:C.muted }}><SearchIcon size={12}/></div>
            <input type="text" placeholder="Search ingredient, user, branch…" value={search} onChange={e=>setSearch(e.target.value)}
              style={{ ...invInputSt, paddingLeft:28, height:32, fontSize:12 }}/>
          </div>
          <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} style={{ ...invInputSt, width:130, height:32, fontSize:12 }}>
            <option value="all">All Actions</option>
            <option value="add">Added</option>
            <option value="edit">Edited</option>
            <option value="import">Imported</option>
            <option value="receive">Received</option>
          </select>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"80px 1fr 100px 120px 160px", gap:8, padding:"6px 0 8px", borderBottom:`2px solid ${C.greenLt}`, fontSize:10, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em" }}>
          <span>Action</span><span>Ingredient</span><span>Branch</span><span>By</span><span>Timestamp</span>
        </div>
        <div style={{ overflowY:"auto", flex:1 }}>
          {filtered.length === 0 ? (
            <div style={{ padding:"40px 0", textAlign:"center", color:"#9ca3af", fontSize:13 }}>No activity yet.</div>
          ) : filtered.map((entry, i) => (
            <div key={entry.id||i} style={{ display:"grid", gridTemplateColumns:"80px 1fr 100px 120px 160px", gap:8, alignItems:"center", padding:"11px 0", borderBottom: i < filtered.length-1 ? `1px solid ${C.bg}` : "none" }}>
              <div>{actionBadge(entry.action)}</div>
              <div>
                <div style={{ fontWeight:700, fontSize:13, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{entry.ingredientName}</div>
                {entry.changes && (
                  <div style={{ fontSize:10, color:C.muted, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{entry.changes}</div>
                )}
              </div>
              <div style={{ fontSize:11, color:C.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{entry.branch||"—"}</div>
              <div style={{ fontSize:12, fontWeight:600, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{entry.performedBy||"System"}</div>
              <div style={{ fontSize:11, color:"#9ca3af" }}>{entry.timestamp ? fmtTs(entry.timestamp) : "—"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   FIFO / FEFO QUEUE (right column of each brand card)
   Simple white rows, divided by a thin bottom line (green for the next-out
   batch, gray for the rest) instead of colored backgrounds.
───────────────────────────────────────────────────────────────────────── */
function FifoQueue({ product, batches, loading, onManageBatches }) {
  if (!product) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", minHeight:300, color:C.muted, fontSize:12.5, textAlign:"center", padding:20 }}>
        <div>
          Select a product on the left<br/>to view its consumption queue.
        </div>
      </div>
    );
  }

  const fifo = getFifoMethod(product.brand, product.perishable);
  const sorted = sortBatchesByMethod(batches, product.brand, product.perishable);
  const totalStock = sorted.reduce((s, b) => s + Number(b.stock || 0), 0);

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10, gap:8 }}>
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:14, fontWeight:800, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{product.name}</div>
          <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>
            {totalStock} {product.unit} · {sorted.length} active batch{sorted.length===1?"":"es"} · min {product.min_stock}
          </div>
        </div>
        <div style={{ display:"flex", gap:6, flexShrink:0 }}>
          <button onClick={onManageBatches} style={{ ...smallBtnSt, border:`1.5px solid ${C.green}`, color:C.greenDk, background:C.greenLt }}>
            Manage
          </button>
        </div>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 10px", borderRadius:8,
        background: fifo.method==="FEFO" ? C.amberBg : C.greenLt,
        border:`1px solid ${fifo.method==="FEFO" ? C.amberBorder : C.greenMid}`,
        fontSize:10.5, color: fifo.method==="FEFO" ? "#9a3412" : C.greenDk, fontWeight:700, marginBottom:10 }}>
        <span>{fifo.method} QUEUE</span>
        <span style={{ fontWeight:500, opacity:0.85 }}>— {fifo.queueLabel}</span>
      </div>

      <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", paddingRight:2, minHeight:0 }}>
        {loading ? (
          <div style={{ textAlign:"center", padding:"30px 0", color:C.muted, fontSize:12 }}>Loading queue…</div>
        ) : sorted.length === 0 ? (
          <div style={{ textAlign:"center", padding:"30px 0", color:C.muted, fontSize:12, fontStyle:"italic" }}>No batches yet for this product.</div>
        ) : sorted.map((b, idx) => {
          const status = computeExpiryStatus(b.exp_date, product.brand);
          const ss = EXPIRY_STYLE[status] || EXPIRY_STYLE.ok;
          const isFirst = idx === 0;
          const isLast = idx === sorted.length - 1;
          const supplyStr = b.supply_date ? fmtTs(b.supply_date) : "—";
          const expStr    = fmtDate(b.exp_date);
          const dRem = daysRemaining(b.exp_date);
          const stockPct = totalStock > 0 ? Math.round((Number(b.stock||0) / totalStock) * 100) : 0;
          return (
            <div key={b.id} style={{
              background:C.white,
              borderBottom: isLast ? "none" : `1px solid ${isFirst ? C.greenMid : C.border}`,
              padding:"12px 4px",
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6, gap:8, flexWrap:"wrap" }}>
                <span style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
                  <span style={{ width:19, height:19, borderRadius:"50%", background:isFirst?C.green:"#b9c9bf", color:"#fff", fontSize:10, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{idx+1}</span>
                  <span style={{ fontSize:12, fontWeight:800, color:C.ink }}>Batch {b.batch_number || "—"}</span>
                  {isFirst && (
                    <span style={{ fontSize:9, fontWeight:800, color:C.greenDk, border:`1px solid ${C.greenMid}`, padding:"2px 8px", borderRadius:20 }}>
                      {fifo.topLabel}
                    </span>
                  )}
                </span>
                {ss.label && (
                  <span style={{ fontSize:9, fontWeight:800, color:ss.badgeText, border:`1px solid ${ss.border}`, padding:"2px 7px", borderRadius:20 }}>{ss.label}</span>
                )}
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:12, fontSize:11, color:C.muted, marginBottom:8 }}>
                {b.supplier && <span>Supplier: <strong style={{ color:C.ink }}>{b.supplier}</strong></span>}
                <span>Arrived: <strong style={{ color:C.ink }}>{supplyStr}</strong></span>
                <span>Expires: <strong style={{ color:ss.dot }}>{expStr}{dRem!=null ? ` (${dRem<0?"expired":dRem+"d left"})` : ""}</strong></span>
                {b.cost_per_unit ? <span>Cost/Unit: <strong style={{ color:C.ink }}>₱{Number(b.cost_per_unit).toLocaleString("en-PH",{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></span> : null}
                {b.storage_location && <span>Location: <strong style={{ color:C.ink }}>{b.storage_location}</strong></span>}
                {b.received_by && <span>Received by: <strong style={{ color:C.ink }}>{b.received_by}</strong></span>}
              </div>

              <div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:9.5, color:C.muted, fontWeight:700, marginBottom:2 }}>
                  <span>STOCK</span><span>{b.stock}{product.unit}/{totalStock}{product.unit}</span>
                </div>
                <MiniBar pct={stockPct} color={C.green}/>
              </div>

              {isPharmaBrand(product.brand) && product.perishable && (b.lot_number || b.ndc_code || b.dosage_form || b.storage_requirement || b.controlled_substance) && (
                <div style={{ marginTop:8, paddingTop:8, borderTop:`1px dashed ${C.border}`, display:"flex", flexWrap:"wrap", gap:10, fontSize:10.5, color:C.muted }}>
                  {b.lot_number && <span>LOT: <strong style={{ color:C.ink }}>{b.lot_number}</strong></span>}
                  {b.ndc_code && <span>NDC: <strong style={{ color:C.ink }}>{b.ndc_code}</strong></span>}
                  {b.dosage_form && <span>{b.dosage_form}{b.strength ? ` · ${b.strength}` : ""}</span>}
                  {b.storage_requirement && <span>Storage: <strong style={{ color:C.ink }}>{b.storage_requirement}</strong></span>}
                  {b.controlled_substance && <span style={{ color:"#991b1b", fontWeight:800 }}>CONTROLLED SUBSTANCE</span>}
                </div>
              )}
              {isFuelBrand(product.brand) && (b.tank_id || b.grade || b.octane_rating || b.truck_id) && (
                <div style={{ marginTop:8, paddingTop:8, borderTop:`1px dashed ${C.border}`, display:"flex", flexWrap:"wrap", gap:10, fontSize:10.5, color:C.muted }}>
                  {b.tank_id && <span>Tank: <strong style={{ color:C.ink }}>{b.tank_id}</strong></span>}
                  {b.grade && <span>Grade: <strong style={{ color:C.ink }}>{b.grade}</strong></span>}
                  {b.octane_rating && <span>Octane: <strong style={{ color:C.ink }}>{b.octane_rating}</strong></span>}
                  {b.delivery_temp && <span>Delivery Temp: <strong style={{ color:C.ink }}>{b.delivery_temp}°F</strong></span>}
                  {b.truck_id && <span>Truck: <strong style={{ color:C.ink }}>{b.truck_id}</strong></span>}
                  {b.volume_correction && <span>Corrected Vol (60°F): <strong style={{ color:C.ink }}>{b.volume_correction}</strong></span>}
                </div>
              )}

              {b.notes && <div style={{ fontSize:10.5, color:C.muted, marginTop:6, fontStyle:"italic" }}>{b.notes}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   BRAND OVERVIEW CARD — landing screen, one per brand, clickable
───────────────────────────────────────────────────────────────────────── */
function BrandOverviewCard({ brandDef, brandObj, items, onClick }) {
  const brandItems  = items.filter(i => brandDef.match((i.brand || "").toLowerCase()));
  const lowCount    = brandItems.filter(i => Number(i.stock) < Number(i.min_stock)).length;
  const totalStock  = brandItems.reduce((s, i) => s + Number(i.stock || 0), 0);
  const branchCount = (brandObj?.branches || []).length;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
      style={{
        background:C.white, border:"1px solid rgba(0,168,76,0.14)", borderRadius:20,
        overflow:"hidden", boxShadow:"0 4px 20px rgba(0,140,60,0.08)", cursor:"pointer",
        transition:"transform .15s ease, box-shadow .15s ease", display:"flex", flexDirection:"column",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,140,60,0.16)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,140,60,0.08)"; }}
    >
      <div style={{ padding:"22px 20px 18px", background:`linear-gradient(135deg,${C.teal},${C.green})`, color:C.white }}>
        <div style={{ width:44, height:44, borderRadius:12, background:"rgba(255,255,255,0.18)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
          <StoreIcon size={22} color="#fff"/>
        </div>
        <div style={{ fontSize:17, fontWeight:800 }}>{brandDef.label}</div>
        <div style={{ fontSize:11.5, opacity:0.85, marginTop:2 }}>{branchCount} branch{branchCount===1?"":"es"}</div>
      </div>
      <div style={{ padding:"16px 20px 20px", display:"flex", flexDirection:"column", gap:10 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:12, color:C.muted, fontWeight:600 }}>Ingredients</span>
          <span style={{ fontSize:15, fontWeight:800, color:C.ink }}>{brandItems.length}</span>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:12, color:C.muted, fontWeight:600 }}>Total Stock</span>
          <span style={{ fontSize:15, fontWeight:800, color:C.ink }}>{totalStock.toLocaleString()}</span>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:12, color:C.muted, fontWeight:600 }}>Low Stock</span>
          <span style={{ fontSize:15, fontWeight:800, color:lowCount>0?C.warn:C.green }}>{lowCount}</span>
        </div>
        <div style={{ marginTop:8, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"10px 0", borderRadius:9, background:C.greenLt, color:C.greenDk, fontSize:12, fontWeight:700 }}>
          View Products <ArrowRightIcon size={11}/>
        </div>
      </div>
    </div>
  );
}

/* ── Searchable branch filter — same UX pattern as MenuInventoryContent's BrandBranchFilter,
     but scoped to a single already-selected brand (BrandCard is itself the brand context) ── */
function BranchOnlyFilter({ branches, activeBranch, onChangeBranch }) {
  const [branchQ, setBranchQ] = useState("");
  const [open, setOpen]       = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const filteredBranches = branches.filter(br => !branchQ || br.toLowerCase().includes(branchQ.toLowerCase()));

  const dropSt = { position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:300, background:C.white, border:`1px solid ${C.border}`, borderRadius:10, boxShadow:"0 8px 28px rgba(0,0,0,0.10)", maxHeight:230, overflowY:"auto" };
  const optSt  = (active) => ({ padding:"9px 14px", cursor:"pointer", fontSize:13, color:active?C.greenDk:C.ink, fontWeight:active?700:500, background:active?C.greenLt:"transparent", display:"flex", alignItems:"center", gap:8 });

  return (
    <div ref={ref} style={{ position:"relative", minWidth:150 }}>
      <div onClick={() => { setOpen(v=>!v); setBranchQ(""); }}
        style={{ ...invInputSt, height:30, fontSize:11, display:"flex", alignItems:"center", gap:6, cursor:"pointer", paddingRight:26, userSelect:"none", color:activeBranch?C.ink:C.muted }}>
        <StoreIcon size={11} color={C.green}/>
        <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {activeBranch || "All Branches"}
        </span>
        <ChevronIcon size={10} dir={open?"up":"down"}/>
      </div>
      {open && (
        <div style={dropSt}>
          <div style={{ padding:"6px 8px", borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, background:C.white }}>
            <div style={{ position:"relative" }}>
              <div style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)", color:C.muted }}><SearchIcon size={11}/></div>
              <input autoFocus type="text" value={branchQ} onChange={e=>setBranchQ(e.target.value)} placeholder="Search branch…" onClick={e=>e.stopPropagation()}
                style={{ ...invInputSt, height:28, fontSize:11, paddingLeft:26 }}/>
            </div>
          </div>
          <div style={optSt(!activeBranch)} onMouseDown={() => { onChangeBranch(""); setOpen(false); }}>All Branches</div>
          {filteredBranches.map(br => (
            <div key={br} style={optSt(activeBranch===br)} onMouseDown={() => { onChangeBranch(br); setOpen(false); }}>
              <StoreIcon size={11} color={C.green}/> {br}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   BRAND CARD — filters + (left, scrollable) product list + (right) FIFO/FEFO queue
   pass expanded=true for the single-brand full-width view
───────────────────────────────────────────────────────────────────────── */
function BrandCard({ brandDef, brandObj, items, apiUrl, onEdit, onDelete, onManageBatches, onQuickAdd, onReceiveStock, expanded=false, initialBranchFilter="", initialStatusFilter="" }) {
  const [search, setSearch]     = useState("");
  const [branchF, setBranchF]   = useState(initialBranchFilter);
  const [unitF, setUnitF]       = useState("");
  const [statusF, setStatusF]   = useState(initialStatusFilter);
  const [selectedId, setSelectedId] = useState(null);
  const [batches, setBatches]       = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const didSetDefaultBranch = useRef(false); // ← new

  const brandItems = useMemo(
    () => items.filter(i => brandDef.match((i.brand || "").toLowerCase())),
    [items, brandDef]
  );

const branchOptions = useMemo(() => {
  return (brandObj?.branches || []).map(br => typeof br === "string" ? br : br.name);
}, [brandObj]);

  const filtered = useMemo(() => {
  const q = search.toLowerCase();
  return brandItems
    .filter(i => {
      if (q && !i.name.toLowerCase().includes(q)) return false;
      if (branchF && i.branch !== branchF) return false;
      if (unitF && i.unit !== unitF) return false;
      if (statusF === "low" && Number(i.stock) >= Number (i.min_stock)) return false;
      if (statusF === "ok"  && Number(i.stock) <  Number(i.min_stock)) return false;
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}, [brandItems, search, branchF, unitF, statusF]);

  useEffect(() => {
    if (initialBranchFilter) {
      setBranchF(initialBranchFilter);
      didSetDefaultBranch.current = true;
      return;
    }
    if (!didSetDefaultBranch.current && branchOptions.length > 0) {
      const headOffice = branchOptions.find(b => b.toLowerCase() === "head office");
      if (headOffice) setBranchF(headOffice);
      didSetDefaultBranch.current = true;
    }
  }, [initialBranchFilter, branchOptions]);

  useEffect(() => {
    setStatusF(initialStatusFilter);
  }, [initialStatusFilter]);

  useEffect(() => {
    if (selectedId && !brandItems.find(i => i.id === selectedId)) setSelectedId(null);
  }, [brandItems, selectedId]);

  const selected = brandItems.find(i => i.id === selectedId) || null;

  const refreshBatches = useCallback(() => {
    if (!selectedId) { setBatches([]); return; }
    setBatchLoading(true);
    fetch(`${apiUrl}/ingredient-batches?ingredient_id=${selectedId}`)
      .then(r => r.json())
      .then(d => { setBatches(Array.isArray(d) ? d : []); setBatchLoading(false); })
      .catch(() => { setBatchLoading(false); });
  }, [selectedId, apiUrl]);

  useEffect(() => {
    if (!selectedId) { setBatches([]); return; }
    let cancelled = false;
    setBatchLoading(true);
    fetch(`${apiUrl}/ingredient-batches?ingredient_id=${selectedId}`)
      .then(r => r.json())
      .then(d => { if (!cancelled) { setBatches(Array.isArray(d) ? d : []); setBatchLoading(false); } })
      .catch(() => { if (!cancelled) setBatchLoading(false); });
    return () => { cancelled = true; };
  }, [selectedId, apiUrl]);

  const lowCount = brandItems.filter(i => Number(i.stock) < Number(i.min_stock)).length;
  const listMaxHeight = expanded ? 700 : 480;

  return (
    <div style={{ background:C.white, border:"1px solid rgba(0,168,76,0.12)", borderRadius:18, overflow:"hidden", boxShadow:"0 2px 18px rgba(0,140,60,0.07)", display:"flex", flexDirection:"column" }}>
      {/* header */}
      <div style={{ padding: expanded ? "16px 22px" : "12px 18px", background:`linear-gradient(135deg,${C.teal},${C.green})`, display:"flex", justifyContent:"space-between", alignItems:"center", color:C.white, flexWrap:"wrap", gap:8 }}>
        <span style={{ display:"flex", alignItems:"center", gap:8 }}>
          <StoreIcon size={expanded?17:14} color="#fff"/>
          <span style={{ fontWeight:800, fontSize:expanded?17:14 }}>{brandDef.label}</span>
        </span>
        <span style={{ display:"flex", alignItems:"center", gap:10, fontSize:11 }}>
          <span style={{ opacity:0.92 }}>{brandItems.length} item{brandItems.length===1?"":"s"}{lowCount>0?` · ${lowCount} low`:""}</span>
          <button onClick={() => onReceiveStock(brandDef, selected)} title="Receive stock for this brand"
            style={{ display:"inline-flex", alignItems:"center", gap:5, height:26, padding:"0 11px", borderRadius:7, border:"1px solid rgba(255,255,255,0.55)", background:"rgba(255,255,255,0.16)", color:"#fff", fontSize:11, fontWeight:700, fontFamily:"inherit" }}>
            <PlusIcon size={11}/> Receive Stock
          </button>
          <button onClick={() => onQuickAdd(brandDef)} title="Add a new ingredient to this brand"
            style={{ display:"inline-flex", alignItems:"center", gap:5, height:26, padding:"0 12px", borderRadius:7, border:"1px solid rgba(255,255,255,0.5)", background:"rgba(255,255,255,0.15)", color:"#fff", fontSize:11, fontWeight:700, fontFamily:"inherit", whiteSpace:"nowrap" }}>
            <PlusIcon size={12}/> Add Item
          </button>
        </span>
      </div>

      {/* filter row (brand filter intentionally omitted — this card IS the brand filter) */}
      <div style={{ padding: expanded ? "12px 18px" : "10px 14px", borderBottom:`1px solid ${C.border}`, display:"flex", gap:6, flexWrap:"wrap", background:"#fafffe" }}>
        <div style={{ position:"relative", flex:"1 1 160px", minWidth:100 }}>
          <div style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)", color:C.muted }}><SearchIcon size={11}/></div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{ ...invInputSt, height:30, fontSize:12, paddingLeft:24 }}/>
        </div>
<BranchOnlyFilter branches={branchOptions} activeBranch={branchF} onChangeBranch={setBranchF}/>
        <select value={unitF} onChange={e=>setUnitF(e.target.value)} style={{ ...invInputSt, height:30, fontSize:11, width:100 }}>
          <option value="">All Units</option>
          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <select value={statusF} onChange={e=>setStatusF(e.target.value)} style={{ ...invInputSt, height:30, fontSize:11, width:110 }}>
          <option value="">All Status</option>
          <option value="low">Low Stock</option>
          <option value="ok">In Stock</option>
        </select>
      </div>

      {/* two columns: left = scrollable product list, right = scrollable FIFO/FEFO queue */}
      <div style={{ display:"grid", gridTemplateColumns: expanded ? "420px 1fr" : "1fr 1fr", minHeight: expanded ? 540 : 380, maxHeight: listMaxHeight }}>
        <div style={{ borderRight:`1px solid ${C.border}`, overflowY:"auto", maxHeight:listMaxHeight, minHeight:0 }}>
          {filtered.length === 0 ? (
            <div style={{ padding:"30px 14px", textAlign:"center", color:C.muted, fontSize:12 }}>No products found.</div>
          ) : filtered.map(item => {
            const low = Number(item.stock) < Number(item.min_stock);
            const active = item.id === selectedId;
            const stockPct = Number(item.min_stock) > 0 ? Math.min(100, Math.round((Number(item.stock||0) / (Number(item.min_stock)*2)) * 100)) : (Number(item.stock)>0?100:0);
            return (
              <div key={item.id} onClick={() => setSelectedId(item.id)}
                style={{ padding:"10px 14px", cursor:"pointer", borderLeft:`3px solid ${active?C.green:"transparent"}`, background:active?C.greenLt:"transparent", borderBottom:`1px solid ${C.bg}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:12.5, fontWeight:active?800:600, color:active?C.greenDk:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</span>
                  {low && <span style={{ fontSize:9, fontWeight:800, color:C.warn, background:C.warnBg, padding:"1px 6px", borderRadius:4, flexShrink:0 }}>LOW</span>}
                </div>
                <div style={{ fontSize:10.5, color:C.muted, marginTop:3 }}>
                  <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.branch}</span>
                </div>
                <div style={{ marginTop:5 }}>
                  <MiniBar pct={stockPct} color={low?C.warn:C.green} height={4}/>
                </div>
                <div style={{ display:"flex", gap:6, marginTop:7 }}>
                  <button onClick={e=>{ e.stopPropagation(); onEdit(item); }} className="edit-btn" style={{ ...smallBtnSt, height:24, padding:"0 9px", fontSize:10.5, border:`1px solid ${C.border}`, color:C.green }}><EditIcon size={10}/> Edit</button>
                  <button onClick={e=>{ e.stopPropagation(); onDelete(item); }} className="del-btn" style={{ ...smallBtnSt, height:24, padding:"0 9px", fontSize:10.5, border:"1px solid #fecaca", color:"#e53935" }}><TrashIcon size={10}/> Delete</button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding: expanded ? 20 : 14, overflowY:"auto", maxHeight:listMaxHeight, minHeight:0 }}>
          <FifoQueue product={selected} batches={batches} loading={batchLoading}
            onManageBatches={() => onManageBatches(selected)}/>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   RECEIVE STOCK MODAL — matches the "Receive Stock" mock: pick a product,
   log a new batch with full timestamp, auto-queued by FIFO/FEFO rules.
   Expiry date must be at least MIN_SHELF_LIFE_DAYS (1 month) after the
   date received — anything shorter is rejected.
───────────────────────────────────────────────────────────────────────── */
function ReceiveStockModal({ brandDef, brandItems, initialProduct, apiUrl, userName, userRole, onClose, onDone, showUiModal, setToast }) {
  const nowLocal = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0,16);
  };
  const [productId, setProductId] = useState(initialProduct?.id || "");
  const [form, setForm] = useState({
    stock:"", cost_batch:"", supplier:"", mfg_date:"", received_at: nowLocal(), exp_date:"", notes:"",
    lot_number:"", ndc_code:"", dosage_form:"", strength:"", storage_requirement:"", controlled_substance:false,
    tank_id:"", grade:"", octane_rating:"", delivery_temp:"", truck_id:"", volume_correction:"",
  });
  const [saving, setSaving] = useState(false);

  const product = brandItems.find(i => String(i.id) === String(productId)) || null;
  const pharma = isPharmaBrand(product?.brand) && !!product?.perishable;
  const fuel   = isFuelBrand(product?.brand);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const qty = parseFloat(form.stock) || 0;
  const batchCost = parseFloat(form.cost_batch) || 0;
  const unitCost = qty > 0 && batchCost > 0 ? batchCost / qty : 0;

  const [noExpiry, setNoExpiry] = useState(false);

  const minShelfLifeDays = pharma ? Math.ceil(THREE_YEARS_MS / 86400000) : MIN_SHELF_LIFE_DAYS;

  const minExpiryDate = useMemo(() => {
    const base = form.received_at ? new Date(form.received_at) : new Date();
    base.setDate(base.getDate() + minShelfLifeDays);
    return base;
  }, [form.received_at, minShelfLifeDays]);
  const minExpiryDateStr = minExpiryDate.toISOString().slice(0,10);

  const syncIngredientStock = async (prod) => {
    try {
      const res = await fetch(`${apiUrl}/ingredient-batches?ingredient_id=${prod.id}`);
      const freshBatches = await res.json();
      const totalStock = Array.isArray(freshBatches) ? freshBatches.reduce((s,b)=>s+Number(b.stock||0),0) : 0;
      await fetch(`${apiUrl}/ingredients/${prod.id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ ...prod, stock: totalStock }),
      });
    } catch (err) { console.warn("Failed to sync ingredient stock:", err); }
  };

  const validate = () => {
    const errors = [];
    if (!product) errors.push("Please select a product to receive stock for.");
    if (!isPositiveOrZeroNumber(form.stock) || parseFloat(form.stock) <= 0) errors.push("Quantity received must be a number greater than 0.");
    if (form.cost_batch !== "" && !isPositiveOrZeroNumber(form.cost_batch)) errors.push("Total batch cost must be a valid number of 0 or more.");
    if (form.cost_batch && Number(form.cost_batch) > 0 && (!form.stock || Number(form.stock) <= 0)) {
      errors.push("Enter the quantity received before the total batch cost, so cost per unit can be calculated.");
    }
    if (form.mfg_date && !isValidDateStr(form.mfg_date)) errors.push("Manufacture date is not a valid date.");
    if (form.received_at && !isValidDateStr(form.received_at)) errors.push("Date & time received is not a valid date.");
    if (form.mfg_date && form.received_at && isValidDateStr(form.mfg_date) && isValidDateStr(form.received_at) && new Date(form.received_at) < new Date(form.mfg_date)) {
      errors.push("Date received cannot be before the manufacture date.");
    }
    if (!noExpiry) {
      if (!form.exp_date) {
        errors.push("Expiry date is required.");
      } else if (!isValidDateStr(form.exp_date)) {
        errors.push("Expiry date is not a valid date.");
      } else {
        if (product) {
          const status = computeExpiryStatus(form.exp_date, product.brand);
          if (status === "expired") {
            errors.push(pharma
              ? "Expiry date does not meet iPharma's 3-year shelf life requirement."
              : "Expiry date is already in the past.");
          }
        }
        if (form.mfg_date && isValidDateStr(form.mfg_date) && new Date(form.mfg_date) > new Date(form.exp_date)) {
          errors.push("Manufacture date cannot be after the expiry date.");
        }
        if (form.received_at && isValidDateStr(form.received_at) && new Date(form.exp_date) < new Date(form.received_at)) {
          errors.push("Expiry date cannot be earlier than the date received.");
        }
        const receivedBase = form.received_at ? new Date(form.received_at) : new Date();
        const minExp = new Date(receivedBase);
        minExp.setDate(minExp.getDate() + minShelfLifeDays);
        if (new Date(form.exp_date) < minExp) {
          errors.push(pharma
            ? `Expiry date must be at least 3 years after the date received (FDA shelf life requirement for medicine).`
            : `Expiry date must be at least 1 month (${MIN_SHELF_LIFE_DAYS} days) after the date received.`);
        }
      }
    }
    if (pharma && form.controlled_substance && !form.lot_number) {
      errors.push("LOT Number is required for controlled substances.");
    }
    return errors;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (errors.length > 0) {
      showUiModal({ type:"error", title:"Please fix the following", lines: errors.map(t=>({ text:t, warn:true })) });
      return;
    }
    setSaving(true);
    const coords = await getBrowserLocation();
    const body = {
      ingredient_id: product.id,
      stock: parseFloat(form.stock) || 0,
      cost_per_unit: unitCost ? Math.round(unitCost * 100) / 100 : 0,
      supplier: form.supplier || null,
      mfg_date: form.mfg_date || null,
      supply_date: form.received_at ? new Date(form.received_at).toISOString() : null,
      exp_date: form.exp_date || null,
      notes: form.notes || null,
      performed_by: userName,
      performed_by_role: userRole || "Unknown",
      latitude: coords?.latitude,
      longitude: coords?.longitude,
      ...(pharma ? {
        lot_number: form.lot_number || null,
        ndc_code: form.ndc_code || null,
        dosage_form: form.dosage_form || null,
        strength: form.strength || null,
        storage_requirement: form.storage_requirement || null,
        controlled_substance: !!form.controlled_substance,
      } : {}),
      ...(fuel ? {
        tank_id: form.tank_id || null,
        grade: form.grade || null,
        octane_rating: form.octane_rating || null,
        delivery_temp: form.delivery_temp || null,
        truck_id: form.truck_id || null,
        volume_correction: form.volume_correction || null,
      } : {}),
    };
    try {
      const res = await fetch(`${apiUrl}/ingredient-batches`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
      const d = await res.json();
      setSaving(false);
      onDone();
      setToast({ type: "success", title: "Stock Received", message: `${body.stock} ${product.unit} of "${product.name}" logged.` });
    } catch {
      setSaving(false);
      setToast({ type: "error", title: "Connection Error", message: "Failed to log the received stock." });
    }
  };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2200, padding:20, backdropFilter:"blur(4px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:560, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 64px rgba(0,0,0,0.20)", fontFamily:"Montserrat,sans-serif" }}>
        <div style={{ padding:"20px 26px", background:`linear-gradient(135deg,#fbbf24,${C.warn})`, color:"#fff", borderRadius:"20px 20px 0 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:18, fontWeight:900, letterSpacing:"0.02em" }}>RECEIVE STOCK</div>
              <div style={{ fontSize:12, opacity:0.9, marginTop:2 }}>Log incoming inventory for {brandDef.label} · batch auto-queued by {pharma?"FEFO":"FIFO"} rules</div>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.2)", border:"none", color:"#fff", borderRadius:"50%", width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center" }}><XIcon size={14}/></button>
          </div>
        </div>

        <form onSubmit={submit} style={{ padding:24, display:"grid", gap:14 }}>
          <div style={{ fontSize:10.5, fontWeight:800, color:C.muted, letterSpacing:"0.06em", borderBottom:`1px solid ${C.border}`, paddingBottom:6 }}>BATCH DETAILS</div>

          <div>
            <label style={invLabelSt}>Product *</label>
            <select style={invInputSt} value={productId} required onChange={e=>setProductId(e.target.value)}>
              <option value="">Select product…</option>
              {brandItems.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(i => (
                <option key={i.id} value={i.id}>{i.name} ({i.branch})</option>
              ))}
            </select>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={invLabelSt}>Quantity ({product?.unit || "unit"}) *</label>
              <input type="number" min="0" step="0.01" style={invInputSt} value={form.stock} required placeholder="0.00" onChange={e=>setF("stock", e.target.value)}/>
            </div>
            <div>
              <label style={invLabelSt}>Total Batch Cost (₱)</label>
              <input type="number" min="0" step="0.01" style={invInputSt} value={form.cost_batch} placeholder="e.g. 4000.00" onChange={e=>setF("cost_batch", e.target.value)}/>
              <div style={{ fontSize:10, color:C.muted, marginTop:4 }}>What you paid for this whole batch — not per unit</div>
            </div>
          </div>
          {batchCost > 0 && qty > 0 && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div style={{ padding:"10px 13px", borderRadius:9, background:C.bg, border:`1px solid ${C.border}` }}>
                <div style={{ fontSize:11.5, fontWeight:700, color:C.muted }}>Cost / Unit</div>
                <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>₱{batchCost.toFixed(2)} ÷ {qty} {product?.unit || "unit"}</div>
                <div style={{ fontSize:18, fontWeight:900, color:C.ink, marginTop:4 }}>₱{unitCost.toFixed(2)}</div>
              </div>
              <div style={{ padding:"10px 13px", borderRadius:9, background:C.greenLt, border:`1px solid ${C.greenMid}` }}>
                <div style={{ fontSize:11.5, fontWeight:700, color:C.greenDk }}>Shop Price</div>
                <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>cost/unit + 10% (weighted avg across batches)</div>
                <div style={{ fontSize:18, fontWeight:900, color:C.greenDk, marginTop:4 }}>₱{(unitCost * 1.10).toFixed(2)}</div>
              </div>
            </div>
          )}
          <div>
            <label style={invLabelSt}>Supplier</label>
            <input style={invInputSt} value={form.supplier} placeholder="Supplier name" onChange={e=>setF("supplier", e.target.value)}/>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={invLabelSt}>Manufacture Date</label>
              <input type="date" style={invInputSt} value={form.mfg_date} onChange={e=>setF("mfg_date", e.target.value)}/>
            </div>
            <div>
              <label style={invLabelSt}>Date &amp; Time Received</label>
              <input type="datetime-local" style={invInputSt} value={form.received_at} onChange={e=>setF("received_at", e.target.value)}/>
            </div>
          </div>

          <div>
  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
    <label style={{ ...invLabelSt, marginBottom:0 }}>Expiry Date {!noExpiry && "*"}</label>
    <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:11.5, fontWeight:600, color:C.muted, cursor:"pointer" }}>
      <input
        type="checkbox"
        checked={noExpiry}
        onChange={e => { setNoExpiry(e.target.checked); if (e.target.checked) setF("exp_date", ""); }}
      />
      No expiry date
    </label>
  </div>
  <input
    type="date"
    style={{ ...invInputSt, opacity: noExpiry ? 0.5 : 1 }}
    value={form.exp_date}
    min={minExpiryDateStr}
    required={!noExpiry}
    disabled={noExpiry}
    onChange={e=>setF("exp_date", e.target.value)}
  />
  {!noExpiry && (
    <div style={{ fontSize:11, color:C.muted, marginTop:5 }}>
      {pharma
        ? <>Medicine requires at least <strong style={{ color:C.ink }}>3 years</strong> of shelf life from the date received</>
        : <>Must be at least 1 month after the date received</>} (earliest allowed: <strong style={{ color:C.ink }}>{fmtDate(minExpiryDateStr)}</strong>).
    </div>
  )}
  {noExpiry && pharma && (
    <div style={{ fontSize:11, color:C.warn, marginTop:5, fontWeight:600 }}>
      ⚠ iPharma items are expected to carry expiry dates for compliance. Only use this for genuinely non-expiring stock.
    </div>
  )}
</div>

          {pharma && (
            <div style={{ display:"grid", gap:12, padding:14, background:"#eef2ff", border:"1px solid #c7d2fe", borderRadius:10 }}>
              <div style={{ fontSize:10.5, fontWeight:800, color:"#3730a3", letterSpacing:"0.06em" }}>PHARMACY DETAILS</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={invLabelSt}>LOT Number</label>
                  <input style={invInputSt} value={form.lot_number} onChange={e=>setF("lot_number", e.target.value)}/>
                </div>
                <div>
                  <label style={invLabelSt}>NDC Code</label>
                  <input style={invInputSt} value={form.ndc_code} onChange={e=>setF("ndc_code", e.target.value)}/>
                </div>
                <div>
                  <label style={invLabelSt}>Dosage Form</label>
                  <select style={invInputSt} value={form.dosage_form} onChange={e=>setF("dosage_form", e.target.value)}>
                    <option value="">Select…</option>
                    {DOSAGE_FORMS.map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={invLabelSt}>Strength</label>
                  <input style={invInputSt} value={form.strength} placeholder="e.g. 500mg" onChange={e=>setF("strength", e.target.value)}/>
                </div>
                <div>
                  <label style={invLabelSt}>Storage Requirement</label>
                  <select style={invInputSt} value={form.storage_requirement} onChange={e=>setF("storage_requirement", e.target.value)}>
                    <option value="">Select…</option>
                    {STORAGE_REQS.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:18 }}>
                  <input type="checkbox" id="controlled" checked={form.controlled_substance} onChange={e=>setF("controlled_substance", e.target.checked)}/>
                  <label htmlFor="controlled" style={{ fontSize:12, fontWeight:700, color:"#3730a3", cursor:"pointer" }}>Controlled substance</label>
                </div>
              </div>
            </div>
          )}

          {fuel && (
            <div style={{ display:"grid", gap:12, padding:14, background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:10 }}>
              <div style={{ fontSize:10.5, fontWeight:800, color:"#1e40af", letterSpacing:"0.06em" }}>FUEL DETAILS</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={invLabelSt}>Tank ID</label>
                  <input style={invInputSt} value={form.tank_id} onChange={e=>setF("tank_id", e.target.value)}/>
                </div>
                <div>
                  <label style={invLabelSt}>Grade</label>
                  <select style={invInputSt} value={form.grade} onChange={e=>setF("grade", e.target.value)}>
                    <option value="">Select…</option>
                    {FUEL_GRADES.map(g=><option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label style={invLabelSt}>Octane Rating</label>
                  <input style={invInputSt} value={form.octane_rating} placeholder="e.g. 95" onChange={e=>setF("octane_rating", e.target.value)}/>
                </div>
                <div>
                  <label style={invLabelSt}>Delivery Temp (°F)</label>
                  <input type="number" style={invInputSt} value={form.delivery_temp} onChange={e=>setF("delivery_temp", e.target.value)}/>
                </div>
                <div>
                  <label style={invLabelSt}>Truck / Tanker ID</label>
                  <input style={invInputSt} value={form.truck_id} onChange={e=>setF("truck_id", e.target.value)}/>
                </div>
                <div>
                  <label style={invLabelSt}>Net Volume @ 60°F</label>
                  <input style={invInputSt} value={form.volume_correction} placeholder="API corrected volume" onChange={e=>setF("volume_correction", e.target.value)}/>
                </div>
              </div>
            </div>
          )}

          <div>
            <label style={invLabelSt}>Notes</label>
            <textarea style={{ ...invInputSt, height:64, padding:"8px 11px", resize:"vertical" }} value={form.notes} placeholder="Optional notes…" onChange={e=>setF("notes", e.target.value)}/>
          </div>

          <button type="submit" disabled={saving} style={{ ...btnAmberSt, width:"100%", justifyContent:"center", height:46, fontSize:13.5, opacity:saving?0.6:1, cursor:saving?"not-allowed":"pointer" }}>
            <PlusIcon size={14}/> {saving ? "Saving…" : "Receive & Add to Queue"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   BATCH DELETE HISTORY PANEL
───────────────────────────────────────────────────────────────────────── */
function BatchDeleteHistoryPanel({ history, restoringId, onRestore, onClose }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:3000, padding:20, backdropFilter:"blur(5px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:20, padding:"26px 30px", width:"100%", maxWidth:660, maxHeight:"80vh", display:"flex", flexDirection:"column", boxShadow:"0 24px 64px rgba(0,0,0,0.20)", border:"1px solid #fecaca", fontFamily:"Montserrat,sans-serif" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <h2 style={{ fontSize:16, fontWeight:800, color:C.ink, margin:0 }}>Batch Delete History</h2>
            {history.length > 0 && (
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:"#fee2e2", color:"#dc2626" }}>
                {history.length} deleted
              </span>
            )}
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:"1px solid #fecaca", background:"#fef2f2", cursor:"pointer", color:"#dc2626", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <XIcon size={14}/>
          </button>
        </div>
        {history.length > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 70px 100px 130px 90px", gap:8, padding:"6px 0 10px", borderBottom:"2px solid #fee2e2", fontSize:10, fontWeight:800, color:"#dc2626", textTransform:"uppercase", letterSpacing:"0.07em" }}>
            <span>Batch No.</span><span>Stock</span><span>Exp Date</span><span>Deleted At</span><span></span>
          </div>
        )}
        <div style={{ overflowY:"auto", flex:1 }}>
          {history.length === 0 ? (
            <div style={{ padding:"44px 0", textAlign:"center" }}>
              <div style={{ color:"#9ca3af", fontSize:13, fontStyle:"italic" }}>No deleted batches yet.</div>
            </div>
          ) : history.map((entry, i) => {
            const d = entry.data || {};
            const expStr = fmtDate(d.exp_date);
            return (
              <div key={entry.id} style={{ display:"grid", gridTemplateColumns:"1fr 70px 100px 130px 90px", gap:8, alignItems:"center", padding:"12px 0", borderBottom: i < history.length-1 ? "1px solid #fff0f0" : "none" }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:13, color:C.ink }}>{d.batch_number || <span style={{ color:C.muted, fontStyle:"italic" }}>No batch #</span>}</div>
                  {d.notes && <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>{d.notes}</div>}
                </div>
                <div style={{ fontSize:13, fontWeight:600, color:C.ink }}>{d.stock ?? "—"}</div>
                <div style={{ fontSize:12, color:"#6b7280" }}>{expStr}</div>
                <div style={{ fontSize:11, color:"#9ca3af" }}>{entry.deletedAt ? fmtTs(entry.deletedAt) : "—"}</div>
                <button onClick={() => onRestore(entry)} disabled={restoringId !== null}
                  style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:9, border:`1.5px solid ${C.green}`, background:"#e0f2f1", color:C.greenDk, fontSize:12, fontWeight:700, cursor: restoringId !== null ? "not-allowed" : "pointer", fontFamily:"inherit", whiteSpace:"nowrap", opacity: restoringId !== null ? (restoringId === entry.id ? 0.85 : 0.4) : 1 }}>
                  {restoringId === entry.id
                    ? <><RefreshCw size={12} style={{ animation:"spin 1s linear infinite" }}/> Restoring…</>
                    : <><RestoreIcon/> Restore</>}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   BATCH EDIT MODAL — standalone modal (opened on top of BatchesModal) for
   editing a single batch's queuing details (expiry date, stock, etc).
───────────────────────────────────────────────────────────────────────── */
function BatchEditModal({ ingredient, batch, onClose, onSave, saving }) {
  const pharma = isPharmaBrand(ingredient.brand) && !!ingredient.perishable;
  const fuel   = isFuelBrand(ingredient.brand);
  const [noExpiry, setNoExpiry] = useState(!batch.exp_date);

  const toDatetimeLocal = (isoStr) => {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0,16);
};

  const [form, setForm] = useState({
    stock:        batch.stock        || 0,
    mfg_date:     batch.mfg_date     ? batch.mfg_date.split("T")[0]    : "",
    exp_date:     batch.exp_date     ? batch.exp_date.split("T")[0]    : "",
    supply_date:  toDatetimeLocal(batch.supply_date), 
    notes:        batch.notes        || "",
    supplier:     batch.supplier     || "",
    cost_per_unit:batch.cost_per_unit|| "",
    lot_number:   batch.lot_number   || "",
    ndc_code:     batch.ndc_code     || "",
    dosage_form:  batch.dosage_form  || "",
    strength:     batch.strength     || "",
    storage_requirement: batch.storage_requirement || "",
    controlled_substance: !!batch.controlled_substance,
    tank_id:      batch.tank_id      || "",
    grade:        batch.grade        || "",
    octane_rating:batch.octane_rating|| "",
    delivery_temp:batch.delivery_temp|| "",
    truck_id:     batch.truck_id     || "",
    volume_correction: batch.volume_correction || "",
  });

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const getExpiryStatus = (exp_date, brand) => computeExpiryStatus(exp_date, brand);

  const submit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      supply_date: form.supply_date ? new Date(form.supply_date).toISOString() : null,
    });
  };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2600, padding:20, backdropFilter:"blur(5px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:18, width:"100%", maxWidth:560, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 64px rgba(0,0,0,0.20)", fontFamily:"Montserrat,sans-serif" }}>
        <div style={{ padding:"18px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:C.ink }}>Edit Batch {batch.batch_number || ""}</div>
            <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{ingredient.name} · {ingredient.branch}</div>
          </div>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:"50%", border:`1px solid ${C.border}`, background:C.white, cursor:"pointer", color:C.muted, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <XIcon size={14}/>
          </button>
        </div>

        <form onSubmit={submit} style={{ padding:22, display:"grid", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={invLabelSt}>Quantity *</label>
              <input type="number" min="0" required style={invInputSt} value={form.stock} onChange={e=>setF("stock", e.target.value)}/>
            </div>
            <div>
              <label style={invLabelSt}>Supplier</label>
              <input style={invInputSt} value={form.supplier} placeholder="Supplier name" onChange={e=>setF("supplier", e.target.value)}/>
            </div>
            <div>
              <label style={invLabelSt}>Cost/Unit (₱)</label>
              <input type="number" min="0" step="0.01" style={invInputSt} value={form.cost_per_unit} onChange={e=>setF("cost_per_unit", e.target.value)}/>
            </div>
            <div>
              <label style={invLabelSt}>Mfg Date</label>
              <input type="date" style={invInputSt} value={form.mfg_date} onChange={e=>setF("mfg_date", e.target.value)}/>
            </div>
            <div>
              <label style={invLabelSt}>Exp Date</label>
              <input type="date" style={invInputSt} value={form.exp_date} onChange={e=>setF("exp_date", e.target.value)}/>
              {form.exp_date && getExpiryStatus(form.exp_date, ingredient.brand) === "expired" && (
                <div style={{ marginTop:5, fontSize:11, fontWeight:700, color:C.red }}>
                  {pharma
                    ? "Does not meet iPharma's 3-year shelf life requirement."
                    : "This expiry date is already in the past."}
                </div>
              )}
            </div>
            <div>
              <label style={invLabelSt}>Supply Date &amp; Time</label>
              <input type="datetime-local" style={invInputSt} value={form.supply_date} onChange={e=>setF("supply_date", e.target.value)}/>
            </div>
            <div style={{ gridColumn:"1 / -1" }}>
              <label style={invLabelSt}>Notes</label>
              <input style={invInputSt} value={form.notes} placeholder="Optional notes…" onChange={e=>setF("notes", e.target.value)}/>
            </div>
          </div>

          {pharma && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, padding:14, background:"#eef2ff", border:"1px solid #c7d2fe", borderRadius:10 }}>
              <div style={{ gridColumn:"1 / -1", fontSize:10.5, fontWeight:800, color:"#3730a3", letterSpacing:"0.06em" }}>PHARMACY DETAILS</div>
              <div>
                <label style={invLabelSt}>LOT Number</label>
                <input style={invInputSt} value={form.lot_number} onChange={e=>setF("lot_number", e.target.value)}/>
              </div>
              <div>
                <label style={invLabelSt}>NDC Code</label>
                <input style={invInputSt} value={form.ndc_code} onChange={e=>setF("ndc_code", e.target.value)}/>
              </div>
              <div>
                <label style={invLabelSt}>Dosage Form</label>
                <select style={invInputSt} value={form.dosage_form} onChange={e=>setF("dosage_form", e.target.value)}>
                  <option value="">Select…</option>
                  {DOSAGE_FORMS.map(d=><option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={invLabelSt}>Strength</label>
                <input style={invInputSt} value={form.strength} placeholder="e.g. 500mg" onChange={e=>setF("strength", e.target.value)}/>
              </div>
              <div>
                <label style={invLabelSt}>Storage</label>
                <select style={invInputSt} value={form.storage_requirement} onChange={e=>setF("storage_requirement", e.target.value)}>
                  <option value="">Select…</option>
                  {STORAGE_REQS.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:18 }}>
                <input type="checkbox" id="controlled-edit" checked={form.controlled_substance} onChange={e=>setF("controlled_substance", e.target.checked)}/>
                <label htmlFor="controlled-edit" style={{ fontSize:12, fontWeight:700, color:"#3730a3", cursor:"pointer" }}>Controlled substance</label>
              </div>
            </div>
          )}

          {fuel && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, padding:14, background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:10 }}>
              <div style={{ gridColumn:"1 / -1", fontSize:10.5, fontWeight:800, color:"#1e40af", letterSpacing:"0.06em" }}>FUEL DETAILS</div>
              <div>
                <label style={invLabelSt}>Tank ID</label>
                <input style={invInputSt} value={form.tank_id} onChange={e=>setF("tank_id", e.target.value)}/>
              </div>
              <div>
                <label style={invLabelSt}>Grade</label>
                <select style={invInputSt} value={form.grade} onChange={e=>setF("grade", e.target.value)}>
                  <option value="">Select…</option>
                  {FUEL_GRADES.map(g=><option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={invLabelSt}>Octane Rating</label>
                <input style={invInputSt} value={form.octane_rating} onChange={e=>setF("octane_rating", e.target.value)}/>
              </div>
              <div>
                <label style={invLabelSt}>Delivery Temp (°F)</label>
                <input type="number" style={invInputSt} value={form.delivery_temp} onChange={e=>setF("delivery_temp", e.target.value)}/>
              </div>
              <div>
                <label style={invLabelSt}>Truck/Tanker ID</label>
                <input style={invInputSt} value={form.truck_id} onChange={e=>setF("truck_id", e.target.value)}/>
              </div>
              <div>
                <label style={invLabelSt}>Net Vol @ 60°F</label>
                <input style={invInputSt} value={form.volume_correction} onChange={e=>setF("volume_correction", e.target.value)}/>
              </div>
            </div>
          )}

          <div style={{ display:"flex", justifyContent:"flex-end", gap:8, paddingTop:8, borderTop:`1px solid ${C.border}` }}>
            <button type="button" onClick={onClose} style={btnSt}>Cancel</button>
            <button type="submit" disabled={saving} style={{ ...btnPrimarySt, opacity:saving?0.6:1 }}>{saving ? "Saving…" : "Save Changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BatchesModal({ ingredient, batches, loading, onClose, onRefresh, apiUrl, userName, userRole, showUiModal, setToast }) {
  const pharma = isPharmaBrand(ingredient.brand) && !!ingredient.perishable;
  const [editingBatch, setEditingBatch] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [batchDeleteHistory, setBatchDeleteHistory] = useState([]);
  const [showBatchHistory, setShowBatchHistory] = useState(false);
  const [deleteConfirmBatch, setDeleteConfirmBatch] = useState(null);
  const [deletingBatch, setDeletingBatch] = useState(false);
  const [restoringBatchId, setRestoringBatchId] = useState(null);

  const fetchBatchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/ingredient-batch-delete-history?ingredient_id=${ingredient.id}`);
      const data = await res.json();
      setBatchDeleteHistory(Array.isArray(data) ? data.map(row => ({
        id: row.id,
        data: row.batch_data,
        deletedAt: row.deleted_at,
        deletedBy: row.deleted_by,
      })) : []);
    } catch (err) { console.warn("Failed to fetch batch delete history:", err); }
  }, [apiUrl, ingredient.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchBatchHistory(); }, [fetchBatchHistory]);

  const getExpiryStatus = (exp_date, brand) => computeExpiryStatus(exp_date, brand);

  const statusStyle = {
    expired:  { badgeText:"#991b1b", border:"#f3c9c9", label:"EXPIRED",          dateColor:"#dc2626" },
    critical: { badgeText:"#9a3412", border:"#f0d3b2", label:"EXPIRING CRITICAL", dateColor:"#ea580c" },
    warning:  { badgeText:"#854d0e", border:"#ecdca0", label:"EXPIRING SOON",     dateColor:"#ca8a04" },
    ok:       { badgeText:null,      border:C.border,  label:null,                dateColor:C.ink },
  };

  const syncIngredientStock = async () => {
    try {
      const res = await fetch(`${apiUrl}/ingredient-batches?ingredient_id=${ingredient.id}`);
      const freshBatches = await res.json();
      const totalStock = Array.isArray(freshBatches)
        ? freshBatches.reduce((sum, b) => sum + Number(b.stock || 0), 0) : 0;
      await fetch(`${apiUrl}/ingredients/${ingredient.id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ ...ingredient, stock: totalStock }),
      });
    } catch (err) { console.warn("Failed to sync ingredient stock:", err); }
  };

  const validateBatchForm = (form) => {
    const errors = [];
    if (!isPositiveOrZeroNumber(form.stock)) errors.push("Count must be a valid number of 0 or more.");
    if (form.mfg_date && !isValidDateStr(form.mfg_date)) errors.push("Manufacture date is not a valid date.");
    if (form.exp_date && !isValidDateStr(form.exp_date)) errors.push("Expiry date is not a valid date.");
    if (form.supply_date && !isValidDateStr(form.supply_date)) errors.push("Supply date is not a valid date.");
    if (form.mfg_date && form.exp_date && isValidDateStr(form.mfg_date) && isValidDateStr(form.exp_date) && new Date(form.mfg_date) > new Date(form.exp_date)) {
      errors.push("Manufacture date cannot be after the expiry date.");
    }
    if (form.supply_date && form.mfg_date && isValidDateStr(form.supply_date) && isValidDateStr(form.mfg_date) && new Date(form.supply_date) < new Date(form.mfg_date)) {
      errors.push("Supply date cannot be before the manufacture date.");
    }
    if (form.supply_date && form.exp_date && isValidDateStr(form.supply_date) && isValidDateStr(form.exp_date) && new Date(form.supply_date) > new Date(form.exp_date)) {
      errors.push("Supply date cannot be after the expiry date.");
    }
    if (form.exp_date && isValidDateStr(form.exp_date)) {
      const status = getExpiryStatus(form.exp_date, ingredient.brand);
      if (status === "expired") {
        errors.push(pharma
          ? "Expiry date does not meet iPharma's 3-year shelf life requirement."
          : "This expiry date is already in the past.");
      }
    }
    if (pharma && form.exp_date && form.supply_date && isValidDateStr(form.exp_date) && isValidDateStr(form.supply_date)) {
      const minExp = new Date(form.supply_date);
      minExp.setDate(minExp.getDate() + Math.ceil(THREE_YEARS_MS / 86400000));
      if (new Date(form.exp_date) < minExp) {
        errors.push("Expiry date must be at least 3 years after the supply date (FDA shelf life requirement for medicine).");
      }
    }
    if (pharma && form.controlled_substance && !form.lot_number) {
      errors.push("LOT Number is required for controlled substances.");
    }
    return errors;
  };

  const saveBatch = async (form) => {
    const errors = validateBatchForm(form);
    if (errors.length > 0) {
      showUiModal({ type:"error", title:"Please fix the following", lines: errors.map(t=>({ text:t, warn:true })) });
      return;
    }
    setSavingEdit(true);
    const coords = await getBrowserLocation();
    const industryFields = {
      ...(pharma ? { lot_number:form.lot_number, ndc_code:form.ndc_code, dosage_form:form.dosage_form, strength:form.strength, storage_requirement:form.storage_requirement, controlled_substance:!!form.controlled_substance } : {}),
      ...(isFuelBrand(ingredient.brand) ? { tank_id:form.tank_id, grade:form.grade, octane_rating:form.octane_rating, delivery_temp:form.delivery_temp, truck_id:form.truck_id, volume_correction:form.volume_correction } : {}),
    };
    const body = {
      ...form,
      ...industryFields,
      performed_by: userName,
      performed_by_role: userRole || "Unknown",
      latitude: coords?.latitude,
      longitude: coords?.longitude,
    };
    try {
      await fetch(`${apiUrl}/ingredient-batches/${editingBatch.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
      await syncIngredientStock();
      setEditingBatch(null);
      onRefresh();
      setToast({ type: "success", title: "Batch Updated", message: "The batch has been updated successfully." });
    } catch {
      setToast({ type: "error", title: "Connection Error", message: "Failed to save the batch." });
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete now requires confirmation via BatchDeleteConfirmModal — see requestDeleteBatch / confirmDeleteBatch below.
  const deleteBatch = async (id) => {
    // Find the batch data before deleting
    const batchToDelete = batches.find(b => b.id === id);
    await fetch(`${apiUrl}/ingredient-batch-delete-history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        batch_data: batchToDelete,
        ingredient_id: ingredient.id,
        ingredient_name: ingredient.name,
        deleted_by: userName,
      }),
    });
    await fetch(`${apiUrl}/ingredient-batches/${id}`, { method:"DELETE" });
    await syncIngredientStock();
    await fetchBatchHistory();
    onRefresh();
  };

  // Step 1: user clicks "Delete" on a batch row — open confirmation modal instead of deleting immediately
  const requestDeleteBatch = (batch) => setDeleteConfirmBatch(batch);

  // Step 2: user confirms in the modal — perform the actual delete
  const confirmDeleteBatch = async () => {
    if (!deleteConfirmBatch) return;
    setDeletingBatch(true);
    try {
      await deleteBatch(deleteConfirmBatch.id);
        setToast({ type: "success", title: "Batch Deleted", message: `Batch ${deleteConfirmBatch.batch_number || ""} moved to history.` });
    } catch {
        setToast({ type: "error", title: "Connection Error", message: "Failed to delete the batch." });
    } finally {
      setDeletingBatch(false);
      setDeleteConfirmBatch(null);
    }
  };

const restoreBatch = async (entry) => {
  setRestoringBatchId(entry.id);
  try {
    const d = entry.data || {};
    const res = await fetch(`${apiUrl}/ingredient-batches`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredient_id: ingredient.id, batch_number: d.batch_number || null, stock: d.stock || 0, mfg_date: d.mfg_date || null, exp_date: d.exp_date || null, supply_date: d.supply_date || null, cost_per_unit: d.cost_per_unit || 0, supplier: d.supplier || null, perishable: d.perishable || false, notes: d.notes || null }),
    });
    const result = await res.json();
    if (result && (result.id || result.success)) {
      await fetch(`${apiUrl}/ingredient-batch-delete-history/${entry.id}`, { method: "DELETE" });
      await fetchBatchHistory();
      onRefresh();
      setToast({ type: "success", title: "Batch Restored", message: `Batch ${d.batch_number || ""} has been restored.` });
    } else {
      setToast({ type: "error", title: "Restore Failed", message: "Failed to restore the batch." });
    }
  } catch {
    setToast({ type: "error", title: "Connection Error", message: "Failed to restore the batch." });
  } finally {
    setRestoringBatchId(null);
  }
};

  const fifo = getFifoMethod(ingredient.brand, ingredient.perishable);
  const sortedBatches = sortBatchesByMethod(batches, ingredient.brand, ingredient.perishable);

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:20, backdropFilter:"blur(4px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:700, maxHeight:"88vh", display:"flex", flexDirection:"column", boxShadow:"0 24px 64px rgba(0,0,0,0.18)", fontFamily:"Montserrat,sans-serif", overflow:"hidden" }}>

        {/* Header */}
        <div style={{ padding:"18px 24px", background:"linear-gradient(135deg,#00c853,#00897b)", color:"#fff", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontWeight:800, fontSize:16 }}>Batches — {ingredient.name}</div>
            <div style={{ fontSize:12, opacity:0.85, display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
              {ingredient.branch} · Total stock: {batches.reduce((s,b)=>s+Number(b.stock||0),0)} {ingredient.unit}
              <button onClick={() => setShowBatchHistory(true)}
                style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(255,255,255,0.2)", border:"1px solid rgba(255,255,255,0.4)", borderRadius:8, color:"#fff", fontSize:11, fontWeight:700, padding:"3px 10px" }}>
                <HistoryIcon size={11}/> Delete History
                {batchDeleteHistory.length > 0 && (
                  <span style={{ background:"#dc2626", borderRadius:20, fontSize:10, fontWeight:800, padding:"1px 6px" }}>{batchDeleteHistory.length}</span>
                )}
              </button>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.2)", border:"none", color:"#fff", borderRadius:"50%", width:32, height:32, fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ overflowY:"auto", flex:1, padding:"8px 24px 24px" }}>

          {/* Batch list — plain white rows, separated by a thin line */}
          {loading ? (
            <div style={{ textAlign:"center", padding:"24px 0", color:"#5a7a65" }}>Loading batches…</div>
          ) : sortedBatches.length === 0 ? (
            <div style={{ textAlign:"center", padding:"40px 0", color:"#9ca3af", fontSize:13, fontStyle:"italic" }}>
              No batches yet. Use <strong>Receive Stock</strong> to add the first one.
            </div>
          ) : sortedBatches.map((batch, idx) => {
            const status = getExpiryStatus(batch.exp_date, ingredient.brand);
            const ss = statusStyle[status] || statusStyle.ok;
            const isFirst = idx === 0;
            const isLast = idx === sortedBatches.length - 1;

            return (
              <div key={batch.id} style={{
                background:"#fff",
                padding:"14px 4px",
                borderBottom: isLast ? "none" : `1px solid ${isFirst ? C.greenMid : C.border}`,
                display:"flex", alignItems:"center", gap:12,
              }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <span style={{ fontWeight:800, fontSize:13, color:"#0d2b1e" }}>
                      Batch {batch.batch_number || "—"}
                    </span>
                    {isFirst && (
                      <span style={{ fontSize:9, fontWeight:800, color:C.greenDk, border:`1px solid ${C.greenMid}`, padding:"2px 8px", borderRadius:20 }}>
                        NEXT OUT
                      </span>
                    )}
                    {ss.label && (
                      <span style={{ fontSize:10, fontWeight:800, color:ss.badgeText, border:`1px solid ${ss.border}`, padding:"2px 8px", borderRadius:20 }}>
                        {ss.label}
                      </span>
                    )}
                  </div>
                  <div style={{ display:"flex", gap:16, fontSize:12, color:"#5a7a65", flexWrap:"wrap" }}>
                    <span>Stock: <strong style={{ color:"#0d2b1e" }}>{batch.stock}</strong></span>
                    {batch.supplier && <span>Supplier: <strong style={{ color:"#0d2b1e" }}>{batch.supplier}</strong></span>}
                    {batch.exp_date && (
                      <span>Exp: <strong style={{ color:ss.dateColor }}>{fmtDate(batch.exp_date)}</strong></span>
                    )}
                    {batch.mfg_date && <span>Mfg: {fmtDate(batch.mfg_date)}</span>}
                    {batch.supply_date && <span>Supplied: {fmtDate(batch.supply_date)}</span>}
                    {batch.storage_location && <span>Location: <strong style={{ color:"#0d2b1e" }}>{batch.storage_location}</strong></span>}
                    {batch.received_by && <span>By: <strong style={{ color:"#0d2b1e" }}>{batch.received_by}</strong></span>}
                  </div>
                  {status === "expired" && (
                    <div style={{ marginTop:6, fontSize:11, fontWeight:700, color:"#dc2626", display:"flex", alignItems:"center", gap:5 }}>
                      {ingredient.brand?.toLowerCase().includes("ipharma")
                        ? "Item does not meet iPharma's 3-year shelf life requirement."
                        : "This batch has already expired."}
                    </div>
                  )}
                  {batch.notes && <div style={{ fontSize:11, color:"#9ca3af", marginTop:4 }}>{batch.notes}</div>}
                </div>
                <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                  <button onClick={()=>setEditingBatch(batch)} title="Edit batch" className="edit-btn"
                    style={{ display:"inline-flex", alignItems:"center", gap:5, height:30, padding:"0 12px", borderRadius:8, border:"1px solid #d1eedd", background:"#fff", color:"#00897b", fontSize:12, fontWeight:700, fontFamily:"inherit" }}>
                    <EditIcon size={12}/> Edit
                  </button>
                  <button onClick={()=>requestDeleteBatch(batch)} title="Delete batch" className="del-btn"
                    style={{ display:"inline-flex", alignItems:"center", gap:5, height:30, padding:"0 12px", borderRadius:8, border:"1px solid #ffcdd2", background:"#fff", color:"#e53935", fontSize:12, fontWeight:700, fontFamily:"inherit" }}>
                    <TrashIcon size={12}/> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editingBatch && (
        <BatchEditModal
          ingredient={ingredient}
          batch={editingBatch}
          saving={savingEdit}
          onClose={() => setEditingBatch(null)}
          onSave={saveBatch}
        />
      )}

      {deleteConfirmBatch && (
        <BatchDeleteConfirmModal
          batch={deleteConfirmBatch}
          ingredient={ingredient}
          deleting={deletingBatch}
          onConfirm={confirmDeleteBatch}
          onCancel={() => { if (!deletingBatch) setDeleteConfirmBatch(null); }}
        />
      )}

{showBatchHistory && (
  <BatchDeleteHistoryPanel history={batchDeleteHistory} restoringId={restoringBatchId} onRestore={restoreBatch} onClose={() => setShowBatchHistory(false)} />
)}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────── */
export default function StockInventoryContent({ user, brands: propBrands = [], initialFocus = null }) {
  const isAdmin    = user?.role === "Super Admin";
  const userBranch = user?.branch || "";
  const userName   = user?.name   || "Unknown";

  const [savingItem,   setSavingItem]   = useState(false);
  const [deletingItem, setDeletingItem] = useState(false);
  const [restoringId,  setRestoringId]  = useState(null);
  const [toast, setToast] = useState(null);

  const brandList = propBrands.length > 0 ? propBrands : [];
  
  const allBranches = useMemo(() => {
    const out = [];
    brandList.forEach(b =>
      (b.branches||[]).forEach(br => {
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
  const [sort,       setSort]       = useState({ col:"name", asc:true });
  const [showModal,  setShowModal]  = useState(false);
  const [editing,    setEditing]    = useState(null);

  // navigation: null = landing grid of 4 brand cards, otherwise a BRAND_DEFS key
  const [activeBrandKey, setActiveBrandKey] = useState(null);
  const activeBrandDef = BRAND_DEFS.find(b => b.key === activeBrandKey) || null;

  const currentBrandName = activeBrandDef
  ? (brandList.find(b => activeBrandDef.match((b.name||"").toLowerCase()))?.name || "")
  : "";

  const [uiModal,    setUiModal]    = useState(null);
  const showUiModal  = useCallback((opts) => setUiModal(opts), []);
  const closeUiModal = useCallback(() => setUiModal(null), []);

  const [deleteTarget,          setDeleteTarget]          = useState(null);
  const [importLoading,         setImportLoading]         = useState(false);
  const [importProgress,        setImportProgress]        = useState({ percent:0, label:"Preparing…", current:0, total:0 });
  const [deleteHistory,         setDeleteHistory]         = useState([]);
  const [showDeleteHistory,     setShowDeleteHistory]     = useState(false);
  const [activityLog,           setActivityLog]           = useState([]);
  const [showActivityLog,       setShowActivityLog]       = useState(false);
  const [activeBatchIngredient, setActiveBatchIngredient] = useState(null);
  const [batches,               setBatches]               = useState([]);
  const [batchLoading,          setBatchLoading]          = useState(false);
  const [showValue, setShowValue] = useState(true);

  const [receiveTarget, setReceiveTarget] = useState(null);

  const excelRef = useRef(null);

const emptyForm = useCallback(() => ({
  name:"", branch: isAdmin ? "" : userBranch, brand:"",
  unit:"pcs", min_stock:0, cost_per_unit:"", perishable:false,
  listInShop: false,
  shopCategory:"", 
}), [isAdmin, userBranch]);

  const [form, setForm] = useState(emptyForm);

  /* ── fetch ingredients ── */
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const q   = !isAdmin && userBranch ? `?branch=${encodeURIComponent(userBranch)}` : "";
      const res = await fetch(`${process.env.REACT_APP_API_URL}/ingredients${q}`);
      const d   = await res.json();
      setItems(Array.isArray(d) ? d : []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, [isAdmin, userBranch]);

  const fetchDeleteHistory = useCallback(async () => {
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/ingredient-delete-history`);
      const data = await res.json();
      setDeleteHistory(Array.isArray(data) ? data.map(row => ({
        id: row.id, data: row.ingredient_data ?? row.data ?? {},
        deletedAt: row.deleted_at ?? row.deletedAt,
        deletedBy: row.deleted_by ?? row.deletedBy,
      })) : []);
    } catch (err) { console.error(err); }
  }, []);

  const fetchActivityLog = useCallback(async () => {
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/ingredient-activity-log`);
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
    } catch (err) { console.error(err); }
  }, []);

    useEffect(() => {
    if (!initialFocus?.brand) return;
    const matchedDef = BRAND_DEFS.find(bd => bd.match(initialFocus.brand.toLowerCase()));
    if (matchedDef) setActiveBrandKey(matchedDef.key);
  }, [initialFocus]);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { fetchDeleteHistory(); fetchActivityLog(); }, [fetchDeleteHistory, fetchActivityLog]);
  useEffect(() => { setPage(0); }, [search, brand, branch, unitFilter, statusFilt]);
  useEffect(() => {
    if (!activeBatchIngredient) return;
    setBatchLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/ingredient-batches?ingredient_id=${activeBatchIngredient.id}`)
      .then(r => r.json())
      .then(d => { setBatches(Array.isArray(d) ? d : []); setBatchLoading(false); });
  }, [activeBatchIngredient]);

  /* ── import excel ── */
  const importExcel = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImportLoading(true);
    setImportProgress({ percent:5, label:"Reading file…", current:0, total:0 });
    const reader = new FileReader();
    reader.onload = async ev => {
      try {
        const coords = await getBrowserLocation();
        setImportProgress({ percent:15, label:"Parsing spreadsheet…", current:0, total:0 });
        const wb = XLSX.read(ev.target.result, { type:"array" });
        const rows_to_save = [];
        wb.SheetNames.forEach(sheetName => {
          const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval:"" });
          rows.forEach(row => {
            const name = capitalizeName(String(row.name||row.Name||row["INGREDIENT NAME"]||"").trim());
            if (!name) return;
            const rowBranch = String(row.branch || row.Branch || "").trim() || "Unknown";
            const alreadyExists = items.some(
              i => normalizeName(i.name) === normalizeName(name) && i.branch.trim().toLowerCase() === rowBranch.toLowerCase()
            );
            if (alreadyExists) return;
            const rawListInShop = row.list_in_shop ?? row["List In Shop"] ?? "";
            const listInShop = rawListInShop === 1 || rawListInShop === true
              || String(rawListInShop).trim().toLowerCase() === "1"
              || String(rawListInShop).trim().toLowerCase() === "yes"
              || String(rawListInShop).trim().toLowerCase() === "true";
            const rowBrand = String(row.brand || row.Brand || "").trim();
            rows_to_save.push({
              name, branch:rowBranch, brand:rowBrand,
              unit:          String(row.unit||row.Unit||"pcs").trim(),
              stock:         parseFloat(row.stock||row.Stock||0)||0,
              min_stock:     parseFloat(row.min_stock||row["Min Stock"]||0)||0,
              cost_per_unit: parseFloat(row.cost_per_unit||row["Cost/Unit"]||0)||0,
              listInShop,
              shopPrice:    parseFloat(row.shop_price  || row["Shop Price"] || 0) || 0,
              shopUnit:     String(row.shop_unit       || row["Shop Unit"]  || "").trim(),
              shopCategory: String(row.shop_category   || row["Shop Category"] || "Coffee Spot").trim(),
            });
          });
        });

        setImportProgress({ percent:25, label:`Found ${rows_to_save.length} rows. Importing…`, current:0, total:rows_to_save.length });
        let saved=0, shopSaved=0, skipped=0;
        const skippedNames=[];

        for (let idx=0; idx<rows_to_save.length; idx++) {
                const item = rows_to_save[idx];
                setImportProgress({ percent: 25+Math.round(((idx+1)/rows_to_save.length)*65), label:`Saving "${item.name}"…`, current:idx+1, total:rows_to_save.length });
                try {
                  const res = await fetch(`${process.env.REACT_APP_API_URL}/ingredients`, {
                    method:"POST", headers:{"Content-Type":"application/json"},
                    body:JSON.stringify({ ...item, performed_by: userName, latitude: coords?.latitude, longitude: coords?.longitude, imported: true }),
                  });
                  const d = await res.json();
                  if (d.success) {
                    saved++;
              if (item.listInShop && item.shopPrice>0) {
                try {
                  const checkRes  = await fetch(`${process.env.REACT_APP_API_URL}/shop-items`);
                  const checkData = await checkRes.json();
                  if (!checkData.some(s=>s.name.trim().toLowerCase()===item.name.toLowerCase()&&s.shop.trim().toLowerCase()===item.shopCategory.toLowerCase())) {
                      const shopRes = await fetch(`${process.env.REACT_APP_API_URL}/shop-items`, {
                      method:"POST", headers:{"Content-Type":"application/json"},
                      body:JSON.stringify({
                        name:item.name, price:item.shopPrice, unit:item.shopUnit, stock:item.stock,
                        shop:item.shopCategory, brand:item.brand||"",
                        image_url:"...",
                        is_visible:true,
                        performed_by_role: user?.role || "Unknown", 
                        latitude: coords?.latitude,
                        longitude: coords?.longitude,
                      }) });
                    if ((await shopRes.json()).success) shopSaved++;
                  }
                } catch {}
              }
            } else { skipped++; skippedNames.push(item.name); }
          } catch { skipped++; skippedNames.push(item.name); }
        }

        setImportProgress({ percent:100, label:"Complete!", current:rows_to_save.length, total:rows_to_save.length });
        await fetchItems(); await fetchActivityLog();
        const summaryLines = [
          { text:`${rows_to_save.length} row(s) parsed from file` },
          { text:`${saved} ingredient(s) saved successfully` },
          ...(shopSaved>0 ? [{ text:`${shopSaved} item(s) also added to Mobile Shop` }] : []),
          ...(skipped>0 ? [{ text:`${skipped} item(s) failed or skipped`, warn:true }, ...skippedNames.map(n=>({ text:n, warn:true }))] : []),
        ];
        setTimeout(() => {
          setImportLoading(false); e.target.value="";
          showUiModal({ type:skipped>0?"info":"success", title:"Import Complete", message:skipped>0?`${saved} ingredient(s) saved. ${skipped} item(s) were skipped.`:`Successfully imported ${saved} ingredient(s).`, lines:summaryLines });
        }, 400);
      } catch {
        setImportLoading(false); e.target.value="";
        showUiModal({ type:"error", title:"Import Failed", message:"An error occurred while processing the Excel file." });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  /* ── filtered + sorted ── */
  const filtered = useMemo(() => {
    const q   = search.toLowerCase();
    const now = new Date(); now.setHours(0,0,0,0);
    const warnDate = new Date(now); warnDate.setDate(now.getDate()+EXPIRY_WARN_DAYS);
    return [...items]
      .filter(i => {
        if (q && !i.name.toLowerCase().includes(q) && !(i.branch || '').toLowerCase().includes(q)) return false;
        if (branch && i.branch !== branch) return false;
        else if (brand && !branch) {
          const b = brandList.find(x => x.id === brand);
          if (b) {
            const names = (b.branches || []).map(br => typeof br === 'string' ? br : br.name);
            if (!names.includes(i.branch)) return false;
          }
        }
        if (unitFilter && i.unit !== unitFilter) return false;
        if (statusFilt === 'low' && Number(i.stock) >= Number(i.min_stock)) return false;
        if (statusFilt === 'ok'  && Number(i.stock) <  Number(i.min_stock)) return false;
        return true;
      })
      .sort((a, b) => {
        let va = a[sort.col] ?? '', vb = b[sort.col] ?? '';
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        return sort.asc ? (va < vb ? -1 : va > vb ? 1 : 0) : (va > vb ? -1 : va < vb ? 1 : 0);
      });
  }, [items, search, brand, branch, unitFilter, statusFilt, sort, brandList]);

  const lowCount   = items.filter(i => Number(i.stock) < Number(i.min_stock)).length;
  const totalValue = items.reduce((s, i) => s+(i.cost_per_unit||0)*(i.stock||0), 0);
  const pageItems  = filtered.slice(page*PAGE_SIZE, (page+1)*PAGE_SIZE);

  const saveItem = async e => {
    e.preventDefault();
    const errors = [];
    if (!form.name || !form.name.trim()) errors.push("Ingredient name is required.");
    if (!form.brand) errors.push("Brand is required.");
    if (isAdmin && !form.branch) errors.push("Branch is required.");
    if (!form.unit) errors.push("Unit is required.");
    if (!isPositiveOrZeroNumber(form.min_stock)) errors.push("Minimum stock must be a valid number of 0 or more.");
  
    if (editing && form.stock !== undefined && form.stock !== "" && !isPositiveOrZeroNumber(form.stock)) {
      errors.push("Stock must be a valid number of 0 or more.");
    }
    if (errors.length > 0) {
      showUiModal({ type:"error", title:"Please fix the following", lines: errors.map(t=>({ text:t, warn:true })) });
      return;
    }

    setSavingItem(true);

    const coords = await getBrowserLocation();
    const payload = {
      ...form,
      cost_per_unit: editing ? form.cost_per_unit : 0,
      stock: editing ? (form.stock ?? 0) : 0,
      branch: isAdmin ? form.branch : userBranch,
      name: capitalizeName(form.name.trim()),
      performed_by: userName,
      performed_by_role: user?.role || "Unknown",
      latitude: coords?.latitude,
      longitude: coords?.longitude,
      ...((!isAdmin && editing) ? { cost_per_unit: editing.cost_per_unit } : {}),
    };
    if (!editing) {
      const duplicate = items.find(
        i => normalizeName(i.name) === normalizeName(payload.name) && i.branch.trim().toLowerCase() === payload.branch.trim().toLowerCase()
      );
      if (duplicate) {
        showUiModal({ type:"error", title:"Duplicate Ingredient", message:`"${payload.name}" already exists in ${payload.branch}. Please use a different name.` });
        return;
      }
    };

    const url    = editing ? `${process.env.REACT_APP_API_URL}/ingredients/${editing.id}` : `${process.env.REACT_APP_API_URL}/ingredients`;
    const method = editing ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
      const d   = await res.json();
      if (d.success) {
        let changesStr = null;
        if (editing) {
          const changed=[];
          if (String(editing.stock)!==String(payload.stock)) changed.push(`stock: ${editing.stock}→${payload.stock}`);
          if (String(editing.min_stock)!==String(payload.min_stock)) changed.push(`min: ${editing.min_stock}→${payload.min_stock}`);
          if (String(editing.cost_per_unit)!==String(payload.cost_per_unit)) changed.push(`cost: ₱${editing.cost_per_unit}→₱${payload.cost_per_unit}`);
          if (editing.unit!==payload.unit) changed.push(`unit: ${editing.unit}→${payload.unit}`);
          changesStr = changed.length>0 ? changed.join("; ") : "Minor update";
        }
        if (form.listInShop && form.cost_per_unit) {
          const computedShopPrice = Math.round(parseFloat(form.cost_per_unit) * 1.10 * 100) / 100;
          try {
            const ingredientId = editing ? editing.id : d.item.id;
            const shopRes  = await fetch(`${process.env.REACT_APP_API_URL}/shop-items`);
            const shopData = await shopRes.json();
            const existingShopItem = Array.isArray(shopData)
              ? shopData.find(s => s.ingredient_id === ingredientId)
              : null;

            const shopBody = {
              name: payload.name,
              price: computedShopPrice,
              unit: form.unit || "",
              shop: form.shopCategory,
              brand: payload.brand || "",
              performed_by: userName,
              latitude: payload.latitude,
              longitude: payload.longitude,
            };

            if (existingShopItem) {
              await fetch(`${process.env.REACT_APP_API_URL}/shop-items/${existingShopItem.id}`, {
                method:"PUT", headers:{"Content-Type":"application/json"},
                body:JSON.stringify({ ...existingShopItem, ...shopBody }),
              });
            } else {
              await fetch(`${process.env.REACT_APP_API_URL}/shop-items`, {
                method:"POST", headers:{"Content-Type":"application/json"},
                body:JSON.stringify({
                  ...shopBody,
                  stock:0,
                  image_url:"https://placehold.co/150x150/e8f5e9/2e7d32?text="+encodeURIComponent(payload.name.slice(0,8)),
                  is_visible:true,
                  branches:[],
                  ingredient_id: ingredientId,
                }),
              });
            }
          } catch {}
        }
        await fetchItems(); await fetchActivityLog();
        closeModal();
        setToast({ type: "success", title: editing ? "Ingredient Updated" : "Ingredient Added", message: editing ? `"${payload.name}" has been updated.` : `"${payload.name}" has been added.` });
      } else {
        setToast({ type: "error", title: "Failed to Save", message: d.error || "An unexpected error occurred." });
      }
    } catch {
      setToast({ type: "error", title: "Connection Error", message: "Failed to save. Please check your connection." });
    } finally {
    setSavingItem(false);
  }
  };

  const handleDeleteItem = (item) => setDeleteTarget(item);

const confirmDelete = async () => {
  if (!deleteTarget) return;
  const item = deleteTarget;
  setDeletingItem(true);
  try {
    const coords = await getBrowserLocation();
    const res = await fetch(`${process.env.REACT_APP_API_URL}/ingredients/${item.id}`, {
      method:"DELETE", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ deleted_by: userName,  performed_by_role: user?.role || "Unknown", latitude: coords?.latitude, longitude: coords?.longitude }),
    });
    const d = await res.json();
    if (d.success) {
      await fetch(`${process.env.REACT_APP_API_URL}/ingredient-delete-history`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ ingredient_data:item, deleted_by:userName }) });
      await fetchItems(); await fetchDeleteHistory(); await fetchActivityLog();
      setToast({ type: "success", title: "Ingredient Deleted", message: `"${item.name}" moved to Delete History.` });
    } else {
      setToast({ type: "error", title: "Failed to Delete", message: d.error || "An unexpected error occurred." });
    }
  } catch {
    setToast({ type: "error", title: "Connection Error", message: "Failed to delete." });
  } finally {
    setDeletingItem(false);
    setDeleteTarget(null);
  }
};

const handleRestore = async (entry) => {
  setRestoringId(entry.id); // ← was: setToast({ type: "loading", ... })
  try {
    const d = entry.data;
    const coords = await getBrowserLocation();
    const res = await fetch(`${process.env.REACT_APP_API_URL}/ingredients`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ name:d.name, branch:d.branch, brand:d.brand, unit:d.unit, stock:d.stock, min_stock:d.min_stock, cost_per_unit:d.cost_per_unit, performed_by: userName, performed_by_role: user?.role || "Unknown", latitude: coords?.latitude, longitude: coords?.longitude, restored: true }),
    });
    const result = await res.json();
    if (result.success) {
      await fetch(`${process.env.REACT_APP_API_URL}/ingredient-delete-history/${entry.id}`, { method:"DELETE" });
      await fetchItems(); await fetchDeleteHistory(); await fetchActivityLog();
      setToast({ type: "success", title: "Ingredient Restored", message: `"${d.name}" has been restored.` });
    } else {
      setToast({ type: "error", title: "Restore Failed", message: result.error || "Failed to restore." });
    }
  } catch {
    setToast({ type: "error", title: "Connection Error", message: "Failed to restore." });
  } finally {
    setRestoringId(null);
  }
};

const openEdit = async item => {
  setEditing(item);
  let shopMatch = null;
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/shop-items`);
    const data = await res.json();
    if (Array.isArray(data)) {
      shopMatch = data.find(s => s.ingredient_id === item.id) || null;
    }
  } catch {}
  setForm({
    name: item.name, brand: item.brand || "", branch: item.branch || "",
    unit: item.unit || "pcs", stock: item.stock, min_stock: item.min_stock,
    cost_per_unit: item.cost_per_unit || "",
    perishable: !!item.perishable,
    listInShop: !!shopMatch,                                              // stays true if already listed
    shopCategory: shopMatch ? (shopMatch.shop || item.brand || "Coffee Spot") : (item.brand || "Coffee Spot"),
  });
  setShowModal(true);
};

  const closeModal = () => { setShowModal(false); setEditing(null); setForm(emptyForm()); };

  /* ── Table header components ── */
  const SortTh = ({ col, label, minW, align="left" }) => {
    const active = sort.col === col;
    return (
      <th onClick={() => { setSort(s=>({ col, asc:s.col===col?!s.asc:true })); setPage(0); }}
        style={{ padding:"11px 16px", textAlign:align, fontWeight:600, fontSize:12, color:active?C.green:C.muted, letterSpacing:"0.02em", borderBottom:`1.5px solid ${C.border}`, cursor:"pointer", userSelect:"none", whiteSpace:"nowrap", background:"#fafffe", minWidth:minW }}>
        <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}>
          {label}
          {active ? (sort.asc ? <SortAscIcon/> : <SortDescIcon/>) : <span style={{ opacity:0.22 }}><SortDescIcon/></span>}
        </span>
      </th>
    );
  };

  const brandItemsFor = (brandDef) => items.filter(i => brandDef.match((i.brand||"").toLowerCase()));

  /* ── render ── */
  return (
    <div style={{ fontFamily:"'Montserrat', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .inv-row:hover td { background: #f4fbf7 !important; }
        .edit-btn:hover  { background: #e8f5e9 !important; color: #00695c !important; }
        .del-btn:hover   { background: #fef2f2 !important; color: #dc2626 !important; }
        button:not(:disabled) { transition: filter .15s ease, transform .1s ease, background .15s ease, border-color .15s ease, box-shadow .15s ease; cursor: pointer; }
        button:not(:disabled):hover { filter: brightness(0.96); }
        button:not(:disabled):active { transform: translateY(1px); }
        select, input { transition: border-color .15s ease, box-shadow .15s ease; }
        select:hover:not(:disabled), input:hover:not(:disabled) { border-color: #00897b !important; }
        select:focus, input:focus, textarea:focus { border-color: #00897b !important; box-shadow: 0 0 0 3px rgba(0,137,123,0.12); }
        [role="button"] { transition: filter .15s ease, transform .12s ease; }
        [role="button"]:hover { filter: brightness(0.97); }
      `}</style>

      {/* Landing screen: 4 brand cards — clicking one opens its full product + FIFO/FEFO view */}
      {!activeBrandDef ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:16 }}>
          {BRAND_DEFS.map(bd => (
            <BrandOverviewCard
              key={bd.key}
              brandDef={bd}
              brandObj={brandList.find(b => bd.match((b.name||"").toLowerCase()))}
              items={items}
              onClick={() => setActiveBrandKey(bd.key)}
            />
          ))}
        </div>
      ) : (
        <>
          {/* navbar (back button + breadcrumb) — only shown once a brand is selected */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18, flexWrap:"wrap" }}>
            <button onClick={() => setActiveBrandKey(null)}
              style={{ ...smallBtnSt, height:34, padding:"0 13px", border:`1px solid ${C.border}`, color:C.greenDk, background:C.white }}>
              <ArrowLeftIcon size={13}/> Back
            </button>
            <div>
              <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:C.ink }}>
                Stock Inventory
              </h1>
              <div style={{ fontSize:12, color:C.muted, marginTop:2, fontWeight:600 }}>
                Stock Inventory / {activeBrandDef.label}
              </div>
            </div>
          </div>

          <BrandCard
            key={activeBrandDef.key}
            brandDef={activeBrandDef}
            brandObj={brandList.find(b => activeBrandDef.match((b.name||"").toLowerCase()))}
            items={items}
            apiUrl={process.env.REACT_APP_API_URL}
            onEdit={openEdit}
            onDelete={handleDeleteItem}
            onManageBatches={(item) => { if (item) { setActiveBatchIngredient(item); setBatches([]); } }}
            onQuickAdd={(bd2) => {
              setEditing(null);
              const matchedBrand = brandList.find(b => bd2.match((b.name||"").toLowerCase()));
              setForm({ ...emptyForm(), brand: matchedBrand ? matchedBrand.name : "", shopCategory: matchedBrand ? matchedBrand.name : "" });
              setShowModal(true);
            }}
            onReceiveStock={(bd2, product) => setReceiveTarget({ brandDef: bd2, product })}
            initialBranchFilter={initialFocus?.branch || ""}   // ← new
            initialStatusFilter={initialFocus?.lowStockOnly ? "low" : ""}   // ← new
            expanded
          />
        </>
      )}

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.3)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}
          onClick={e=>{ if(e.target===e.currentTarget) closeModal(); }}>
          <div style={{ background:C.white, borderRadius:18, padding:"26px 26px 20px", width:540, maxWidth:"95vw", maxHeight:"93vh", overflowY:"auto", boxShadow:"0 12px 48px rgba(0,0,0,0.16)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ margin:0, fontSize:16, fontWeight:800, color:C.ink }}>{editing ? "Edit Ingredient" : "Add Stock Ingredient"}</h2>
              <button onClick={closeModal} style={{ background:"none", border:"none", color:C.muted, padding:4 }}><XIcon size={18}/></button>
            </div>
            <form onSubmit={saveItem} style={{ display:"grid", gap:14 }}>
              <div>
                <label style={invLabelSt}>Ingredient Name *</label>
                <input style={invInputSt} value={form.name}
                  onChange={e=>setForm(f=>({...f,name:e.target.value.replace(/\b\w/g,c=>c.toUpperCase())}))}
                  required placeholder="e.g. Coffee Beans"/>
              </div>

              <div>
                <label style={invLabelSt}>Brand</label>
                <div style={{ ...invInputSt, height:"auto", padding:"9px 12px", background:"#f5f5f5", color:C.muted, fontWeight:700, display:"flex", alignItems:"center" }}>
                  {form.brand || currentBrandName || "—"}
                </div>
              </div>
              {isAdmin ? (
                <div>
                  <label style={invLabelSt}>Branch *</label>
                  {(() => {
                    const selectedBrandObj = brandList.find(b => b.name === form.brand);
                    const filteredBranches = selectedBrandObj
                      ? (selectedBrandObj.branches || []).map(br => typeof br === "string" ? br : br.name)
                      : [];
                    return (
                      <select style={{ ...invInputSt, opacity: !form.brand ? 0.5 : 1, cursor: !form.brand ? "not-allowed" : "pointer" }}
                        value={form.branch} required disabled={!form.brand}
                        onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}>
                        <option value="">{!form.brand ? "Select a brand first…" : "Select branch…"}</option>
                        {filteredBranches.map(br => <option key={br} value={br}>{br}</option>)}
                      </select>
                    );
                  })()}
                </div>
              ) : (
                <div>
                  <label style={invLabelSt}>Branch</label>
                  <div style={{ ...invInputSt, height:"auto", padding:"9px 12px", background:"#f5f5f5", color:C.muted, fontWeight:700, display:"flex", alignItems:"center" }}>{userBranch||"—"}</div>
                </div>
              )}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <label style={invLabelSt}>Unit *</label>
                <select style={invInputSt} value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))} required>
                  {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label style={invLabelSt}>Cost per Unit (₱)</label>
                <div style={{ ...invInputSt, height:"auto", padding:"9px 12px", background:"#f5f5f5", color:C.muted, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}>
                  ₱{Number(form.cost_per_unit||0).toLocaleString("en-PH",{minimumFractionDigits:2,maximumFractionDigits:2})}
                  <span style={{ fontSize:10, color:C.muted, fontWeight:400, marginLeft:4 }}>
                    {editing ? "(from next-out batch)" : "(set when you receive stock)"}
                  </span>
                </div>
                {!editing && (
                  <div style={{ fontSize:11, color:"#1e40af", marginTop:5, display:"flex", alignItems:"flex-start", gap:5 }}>
                    <span>ℹ️</span>
                    <span>Cost starts at ₱0.00. Use <strong>Receive Stock</strong> after saving this item to log a batch.</span>
                  </div>
                )}
              </div>
            </div>

<div style={{
  display:"flex", alignItems:"center", gap:10,
  padding:"10px 12px", borderRadius:9,
  background: form.perishable ? C.greenLt : "#f7f7f7",
  border:`1px solid ${form.perishable ? C.greenMid : C.border}`,
}}>
  <div onClick={()=>setForm(f=>({...f, perishable: !f.perishable}))}
    style={{ width:40, height:22, borderRadius:11, cursor:"pointer", position:"relative",
      background: form.perishable ? `linear-gradient(135deg,${C.teal},${C.green})` : "#e0e0e0",
      transition:"background .2s", flexShrink:0 }}>
    <div style={{ position:"absolute", top:3, left: form.perishable ? 21 : 3, width:16, height:16,
      borderRadius:"50%", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.2)", transition:"left .2s" }}/>
  </div>
  <label style={{ ...invLabelSt, marginBottom:0, cursor:"pointer", flex:1 }} onClick={()=>setForm(f=>({...f, perishable: !f.perishable}))}>
    {isPharmaBrand(form.brand || currentBrandName) ? "Medicine (perishable)" : "Perishable (e.g. dairy, fresh items)"}
    <span style={{ fontWeight:400, color:C.muted, display:"block", fontSize:10.5, marginTop:2 }}>
      {isPharmaBrand(form.brand || currentBrandName)
        ? form.perishable
          ? "Uses FEFO queuing and shows pharmacy fields (LOT, NDC, dosage, controlled substance) when receiving stock."
          : "Off = medical supply (e.g. bandages, gauze) — uses FIFO queuing, no dosage/LOT fields shown."
        : "Uses FEFO (earliest expiry first) instead of FIFO for its batch queue."}
    </span>
  </label>
</div>

              <div>
                <label style={invLabelSt}>Minimum Stock *</label>
                <input type="number" style={invInputSt} value={form.min_stock} min="0"
                  onChange={e=>setForm(f=>({...f,min_stock:e.target.value}))} required/>
              </div>

              {!editing && (
                <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:9, padding:"10px 14px", fontSize:12, color:"#1e40af", display:"flex", alignItems:"flex-start", gap:8 }}>
                  <span>Stock starts at <strong>0</strong> and is automatically calculated from batches. Use <strong>Receive Stock</strong> on the ingredient row to add stock.</span>
                </div>
              )}
              <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:form.listInShop?14:0 }}>
                  <div onClick={()=>setForm(f=>({...f,listInShop:!f.listInShop}))}
                    style={{ width:40, height:22, borderRadius:11, cursor:"pointer", position:"relative", background:form.listInShop?`linear-gradient(135deg,${C.teal},${C.green})`:"#e0e0e0", transition:"background .2s", flexShrink:0 }}>
                    <div style={{ position:"absolute", top:3, left:form.listInShop?21:3, width:16, height:16, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.2)", transition:"left .2s" }}/>
                  </div>
                  <label style={{ ...invLabelSt, marginBottom:0, cursor:"pointer" }} onClick={()=>setForm(f=>({...f,listInShop:!f.listInShop}))}>
                    Also list in Mobile Shop Supplies
                  </label>
                </div>
                {form.listInShop && (
                  <div style={{ display:"grid", gap:12, marginTop:14, padding:"14px", background:C.bg, borderRadius:10, border:`1px solid ${C.border}` }}>
                    <p style={{ fontSize:11, color:C.muted, margin:0 }}>
                      Shop price and unit are synced automatically from this ingredient's cost and unit.
                    </p>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                      <div>
                        <label style={invLabelSt}>Shop Price (₱)</label>
                        <div style={{ ...invInputSt, height:"auto", padding:"9px 12px", background:"#f5f5f5", color:C.muted, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}>
                          {form.cost_per_unit
                            ? `₱${(parseFloat(form.cost_per_unit) * 1.10).toLocaleString("en-PH",{minimumFractionDigits:2,maximumFractionDigits:2})}`
                            : "—"}
                          <span style={{ fontSize:10, color:C.muted, fontWeight:400 }}>(cost + 10%)</span>
                        </div>
                      </div>
                      <div>
                        <label style={invLabelSt}>Shop Unit</label>
                        <div style={{ ...invInputSt, height:"auto", padding:"9px 12px", background:"#f5f5f5", color:C.muted, fontWeight:700, display:"flex", alignItems:"center" }}>
                          {form.unit || "—"}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label style={invLabelSt}>Shop Category</label>
                      <select style={invInputSt} value={form.shopCategory} onChange={e=>setForm(f=>({...f,shopCategory:e.target.value}))}>
                        <option value="">Select category…</option>
                        {brandList.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display:"flex", justifyContent:"flex-end", gap:8, paddingTop:14, borderTop:`1px solid ${C.border}` }}>
                <button type="button" onClick={closeModal} style={btnSt}>Cancel</button>
                <button type="submit" disabled={savingItem}
                  style={{ ...btnPrimarySt, opacity: savingItem ? 0.6 : 1, cursor: savingItem ? "not-allowed" : "pointer" }}>
                  {savingItem ? "Saving…" : "Save Ingredient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── RECEIVE STOCK MODAL ── */}
      {receiveTarget && (
        <ReceiveStockModal
          brandDef={receiveTarget.brandDef}
          brandItems={brandItemsFor(receiveTarget.brandDef)}
          initialProduct={receiveTarget.product}
          apiUrl={process.env.REACT_APP_API_URL}
          userName={userName}
          userRole={user?.role}
          onClose={() => setReceiveTarget(null)}
          onDone={() => { setReceiveTarget(null); fetchItems(); fetchActivityLog(); }}
          showUiModal={showUiModal}
          setToast={setToast}
        />
      )}

      {/* ── MANAGE BATCHES MODAL (edit expiry / delete queuing entries) ── */}
      {activeBatchIngredient && (
        <BatchesModal
          ingredient={activeBatchIngredient}
          batches={batches}
          loading={batchLoading}
          apiUrl={process.env.REACT_APP_API_URL}
          userName={userName}
          userRole={user?.role}
          showUiModal={showUiModal}
          setToast={setToast}
          onRefresh={() => {
            setBatchLoading(true);
            fetch(`${process.env.REACT_APP_API_URL}/ingredient-batches?ingredient_id=${activeBatchIngredient.id}`)
              .then(r => r.json())
              .then(d => { setBatches(Array.isArray(d) ? d : []); setBatchLoading(false); });
            fetchItems();
          }}
          onClose={() => setActiveBatchIngredient(null)}
        />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* ── DELETE CONFIRM MODAL ── */}
      <DeleteConfirmModal item={deleteTarget} deleting={deletingItem} onConfirm={confirmDelete}
        onCancel={() => { if (!deletingItem) setDeleteTarget(null); }}/>

      {/* ── IMPORT LOADING MODAL ── */}
      <ImportLoadingModal visible={importLoading} progress={importProgress}/>
      <UIModal modal={uiModal} onClose={closeUiModal} onConfirm={()=>{ if(uiModal?.onConfirm) uiModal.onConfirm(); closeUiModal(); }}/>
      {showDeleteHistory && <DeleteHistoryPanel history={deleteHistory} restoringId={restoringId} onRestore={handleRestore} onClose={()=>setShowDeleteHistory(false)}/>}
      {showActivityLog && (
  <ActivityLogPanel
    log={activityLog}
    onClose={() => setShowActivityLog(false)}
    title="Stock Activity Log"
  />
)}
    </div>
  );
}