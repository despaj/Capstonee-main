import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import * as XLSX from "xlsx";

const C = {
  green:"#00897b", greenDk:"#00695c", greenLt:"#e8f5e9", greenMid:"#c8e6c9",
  teal:"#00c853", ink:"#0d2b1e", muted:"#5a7a65", border:"#d1eedd",
  bg:"#f0fdf5", white:"#ffffff", warn:"#e65100", warnBg:"#fff3e0",
  ok:"#2e7d32", okBg:"#e8f5e9",
};

const invInputSt = {
  height:36, padding:"0 11px", borderRadius:9,
  border:`1px solid ${C.border}`, background:C.bg,
  fontSize:13, color:C.ink, outline:"none",
  fontFamily:"inherit", boxSizing:"border-box", width:"100%",
};
const invLabelSt = {
  display:"block", fontSize:11, fontWeight:800,
  color:C.muted, marginBottom:5,
  textTransform:"uppercase", letterSpacing:"0.07em",
};
const btnSt = {
  display:"inline-flex", alignItems:"center", gap:6,
  height:36, padding:"0 16px", borderRadius:9,
  border:`1px solid ${C.border}`, background:C.white,
  fontSize:13, fontWeight:700, cursor:"pointer",
  fontFamily:"inherit", whiteSpace:"nowrap",
};
const btnPrimarySt = {
  ...btnSt,
  background:`linear-gradient(135deg,${C.teal},${C.green})`,
  color:C.white, border:"none",
  boxShadow:"0 2px 10px rgba(0,180,90,0.28)",
};
const smallBtnSt = {
  display:"inline-flex", alignItems:"center", gap:4,
  height:28, padding:"0 10px", borderRadius:7,
  fontSize:12, fontWeight:600, cursor:"pointer",
  fontFamily:"inherit", background:C.white,
};

const capitalizeName = (str) => str.replace(/\b\w/g, (c) => c.toUpperCase());
const normalizeName  = (str) => str.trim().toLowerCase().replace(/s$/i, "");

const UNITS = ["pcs","kg","g","liters","ml","tbsp","tsp","cups","bottles","packs","bags","boxes","cans"];
const PAGE_SIZE = 15;
const EXPIRY_WARN_DAYS = 30;

const fmtTs = (d) => new Date(d).toLocaleString("en-PH", {
  month:"short", day:"numeric", year:"numeric",
  hour:"2-digit", minute:"2-digit",
});

// ── Brand-specific field definitions ──
const BRAND_EXTRA_FIELDS = {
  iPharma: [
    { key:"batch_number",  label:"Batch No.",    type:"text",   width:110 },
    { key:"mfg_date",      label:"Mfg Date",     type:"date",   width:110 },
    { key:"exp_date",      label:"Exp Date",     type:"date",   width:110 },
    { key:"supply_date",   label:"Supply Date",  type:"date",   width:110 },
  ],
  "Coffee Spot": [
    { key:"batch_number",  label:"Batch No.",    type:"text",   width:110 },
    { key:"mfg_date",      label:"Mfg Date",     type:"date",   width:110 },
    { key:"exp_date",      label:"Exp Date",     type:"date",   width:110 },
    { key:"supply_date",   label:"Supply Date",  type:"date",   width:110 },
    { key:"perishable",    label:"Perishable",   type:"yesno",  width:100 },
  ],
  "Food Caravan": [
    { key:"batch_number",  label:"Batch No.",    type:"text",   width:110 },
    { key:"mfg_date",      label:"Mfg Date",     type:"date",   width:110 },
    { key:"exp_date",      label:"Exp Date",     type:"date",   width:110 },
    { key:"supply_date",   label:"Supply Date",  type:"date",   width:110 },
    { key:"perishable",    label:"Perishable",   type:"yesno",  width:100 },
  ],
  iFuel: [
    { key:"fuel_type",     label:"Type",         type:"text",   width:100 },
    { key:"tank_number",   label:"Tank No.",     type:"text",   width:90  },
    { key:"exp_date",      label:"Exp Date",     type:"date",   width:110 },
    { key:"supply_date",   label:"Supply Date",  type:"date",   width:110 },
    { key:"gallons_delivered", label:"Gals Delivered", type:"number", width:120 },
  ],
};

// Returns the extra field definitions for a given brand name
function getExtraFields(brandName) {
  if (!brandName) return [];
  for (const key of Object.keys(BRAND_EXTRA_FIELDS)) {
    if (brandName.trim().toLowerCase() === key.toLowerCase()) return BRAND_EXTRA_FIELDS[key];
  }
  return [];
}

// Default extra values for a brand
function defaultExtraValues(brandName) {
  const fields = getExtraFields(brandName);
  const obj = {};
  fields.forEach(f => { obj[f.key] = f.type === "yesno" ? false : ""; });
  return obj;
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

/* ── Brand badge color helper ── */
function brandAccent(brandName) {
  if (!brandName) return { bg:"#e0f2f1", color:"#00695c" };
  const n = brandName.toLowerCase();
  if (n.includes("ipharma"))       return { bg:"#e8eaf6", color:"#3949ab" };
  if (n.includes("coffee"))        return { bg:"#fff3e0", color:"#e65100" };
  if (n.includes("food caravan"))  return { bg:"#fce4ec", color:"#c62828" };
  if (n.includes("ifuel"))         return { bg:"#e3f2fd", color:"#1565c0" };
  return { bg:"#e0f2f1", color:"#00695c" };
}

/* ── Extra field badge renderer (for table cells) ── */
function ExtraFieldCell({ field, value }) {
  if (field.type === 'yesno') {
    const yes = value === true || value === 'true' || value === 1 || value === 'yes';
    return (
      <span style={{
        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
        background: yes ? '#e8f5e9' : '#fce4ec',
        color: yes ? '#2e7d32' : '#c62828',
      }}>
        {yes ? 'Yes' : 'No'}
      </span>
    );
  }
  if (!value || value === '') return <span style={{ color: C.muted, fontSize: 12 }}>—</span>;

  if (field.type === 'date') {
    try {
      const now      = new Date(); now.setHours(0, 0, 0, 0);
      const warnDate = new Date(now); warnDate.setDate(now.getDate() + EXPIRY_WARN_DAYS);
      const exp      = new Date(value); exp.setHours(0, 0, 0, 0);
      const daysLeft = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));

      const isExpDate  = field.key === 'exp_date';
      const isExpired  = isExpDate && exp < now;
      const isExpiring = isExpDate && exp >= now && exp <= warnDate;

      const formatted = exp.toLocaleDateString('en-PH', {
        month: 'short', day: 'numeric', year: 'numeric',
      });

      if (isExpired) {
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{
              padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 800,
              background: '#fce4ec', color: '#c62828',
            }}>
              ✕ Expired
            </span>
            <span style={{ fontSize: 11, color: '#c62828', fontWeight: 600 }}>{formatted}</span>
          </span>
        );
      }
      if (isExpiring) {
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{
              padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 800,
              background: '#fff3e0', color: '#e65100',
            }}>
              ⚠ {daysLeft}d left
            </span>
            <span style={{ fontSize: 11, color: '#e65100', fontWeight: 600 }}>{formatted}</span>
          </span>
        );
      }
      return <span style={{ fontSize: 12, color: C.ink }}>{formatted}</span>;
    } catch { return <span style={{ fontSize: 12 }}>{value}</span>; }
  }

  if (field.key === 'gallons_delivered') {
    return <span style={{ fontSize: 12, fontWeight: 700, color: '#1565c0' }}>{Number(value).toLocaleString()} gal</span>;
  }
  return <span style={{ fontSize: 12, color: C.ink }}>{value}</span>;
}

/* ── Extra Fields Form Section ── */
function ExtraFieldsForm({ brandName, extraValues, onChange }) {
  const fields = getExtraFields(brandName);
  if (!fields.length) return null;

  const accent = brandAccent(brandName);

  return (
    <div style={{ marginTop:4, padding:"14px 16px", borderRadius:12, border:`1.5px solid ${accent.bg}`, background: accent.bg + "55" }}>
      
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {fields.map(f => (
          <div key={f.key} style={f.key === "batch_number" || f.key === "fuel_type" ? { gridColumn:"1/-1" } : {}}>
            <label style={invLabelSt}>{f.label}</label>
            {f.type === "yesno" ? (
              <div style={{ display:"flex", gap:10, marginTop:4 }}>
                {["Yes","No"].map(opt => {
                  const isYes = opt === "Yes";
                  const active = isYes
                    ? (extraValues[f.key] === true || extraValues[f.key] === "yes")
                    : (extraValues[f.key] === false || extraValues[f.key] === "no" || !extraValues[f.key]);
                  return (
                    <button key={opt} type="button"
                      onClick={() => onChange({ ...extraValues, [f.key]: isYes })}
                      style={{
                        flex:1, height:36, borderRadius:9, fontFamily:"inherit",
                        fontSize:13, fontWeight:700, cursor:"pointer",
                        border: active ? `2px solid ${isYes ? C.green : "#e53935"}` : `1px solid ${C.border}`,
                        background: active ? (isYes ? "#e8f5e9" : "#fce4ec") : C.white,
                        color: active ? (isYes ? C.greenDk : "#c62828") : C.muted,
                        transition:"all .15s",
                      }}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            ) : (
              <input
                type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                min={f.type === "number" ? "0" : undefined}
                step={f.type === "number" ? "0.01" : undefined}
                style={invInputSt}
                value={extraValues[f.key] ?? ""}
                onChange={e => onChange({ ...extraValues, [f.key]: e.target.value })}
                placeholder={f.type === "date" ? "" : `Enter ${f.label.toLowerCase()}…`}
              />
            )}
          </div>
        ))}
      </div>
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
      <div onClick={e => e.stopPropagation()} style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:440, boxShadow:"0 24px 64px rgba(0,0,0,0.18)", border:`1px solid ${hc.border}`, fontFamily:"Montserrat,sans-serif", overflow:"hidden" }}>
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

/* ─────────────────────────────────────────────────────────────────────────
   DELETE CONFIRM MODAL
───────────────────────────────────────────────────────────────────────── */
function DeleteConfirmModal({ item, onConfirm, onCancel }) {
  if (!item) return null;
  return (
    <div onClick={onCancel} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2500, padding:20, backdropFilter:"blur(4px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:420, boxShadow:"0 24px 64px rgba(0,0,0,0.18)", border:"1px solid #fecaca", fontFamily:"Montserrat,sans-serif", overflow:"hidden" }}>
        <div style={{ background:"#fef2f2", padding:"20px 24px 16px", borderBottom:"1px solid #fecaca", display:"flex", alignItems:"flex-start", gap:13 }}>
          <div style={{ flexShrink:0, marginTop:1 }}><AlertCircleIcon size={26} color="#dc2626"/></div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:16, fontWeight:800, color:"#991b1b", marginBottom:5 }}>Delete Ingredient</div>
            <div style={{ fontSize:13, color:C.ink, lineHeight:1.55 }}>
              Are you sure you want to delete <strong style={{ color:C.ink }}>"{item.name}"</strong>?
            </div>
            <div style={{ marginTop:8, background:"#fff5f5", border:"1px solid #fecaca", borderRadius:9, padding:"8px 12px", fontSize:12, color:"#7f1d1d" }}>
              This will move the ingredient to Delete History where it can be restored.
            </div>
          </div>
          <button onClick={onCancel} style={{ flexShrink:0, width:28, height:28, borderRadius:"50%", border:"1px solid #fecaca", background:"transparent", cursor:"pointer", color:C.muted, display:"flex", alignItems:"center", justifyContent:"center", marginTop:-2 }}>
            <XIcon size={13}/>
          </button>
        </div>
        <div style={{ padding:"12px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", gap:16 }}>
          <div style={{ fontSize:12 }}>
            <div style={{ color:C.muted, fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:3 }}>Branch</div>
            <div style={{ fontWeight:600, color:C.ink }}>{item.branch || "—"}</div>
          </div>
          <div style={{ fontSize:12 }}>
            <div style={{ color:C.muted, fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:3 }}>Unit</div>
            <div style={{ fontWeight:600, color:C.ink }}>{item.unit}</div>
          </div>
          <div style={{ fontSize:12 }}>
            <div style={{ color:C.muted, fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:3 }}>Stock</div>
            <div style={{ fontWeight:600, color:C.ink }}>{item.stock}</div>
          </div>
          <div style={{ fontSize:12 }}>
            <div style={{ color:C.muted, fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:3 }}>Cost/Unit</div>
            <div style={{ fontWeight:700, color:C.green }}>₱{Number(item.cost_per_unit||0).toLocaleString("en-PH",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
          </div>
        </div>
        <div style={{ padding:"14px 24px", display:"flex", justifyContent:"flex-end", gap:8 }}>
          <button onClick={onCancel} style={{ ...btnSt, border:`1px solid ${C.border}`, color:C.muted }}>Cancel</button>
          <button onClick={onConfirm} style={{ ...btnSt, background:"#dc2626", color:"#fff", border:"none", boxShadow:"0 2px 8px rgba(220,38,38,0.3)", display:"inline-flex", alignItems:"center", gap:6 }}>
            <TrashIcon size={13}/> Delete Ingredient
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   IMPORT LOADING MODAL
───────────────────────────────────────────────────────────────────────── */
function ImportLoadingModal({ visible, progress }) {
  if (!visible) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:3500, padding:20, backdropFilter:"blur(6px)" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ background:C.white, borderRadius:22, padding:"32px 36px", width:"100%", maxWidth:380, boxShadow:"0 28px 70px rgba(0,0,0,0.22)", border:`1px solid ${C.greenMid}`, fontFamily:"Montserrat,sans-serif", textAlign:"center" }}>
        <div style={{ width:64, height:64, borderRadius:"50%", background:C.greenLt, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px" }}>
          <UploadIcon size={30} color={C.green}/>
        </div>
        <div style={{ fontSize:17, fontWeight:800, color:C.ink, marginBottom:6 }}>Importing Excel</div>
        <div style={{ fontSize:13, color:C.muted, marginBottom:20 }}>Please wait while your data is being processed…</div>
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

/* ─────────────────────────────────────────────────────────────────────────
   BrandBranchFilter
───────────────────────────────────────────────────────────────────────── */
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
  const branchList       = selectedBrand ? (selectedBrand.branches||[]).map(br => typeof br==="string"?br:br.name) : [];
  const filteredBrands   = brands.filter(b => !brandQ || b.name.toLowerCase().includes(brandQ.toLowerCase()));
  const filteredBranches = branchList.filter(br => !branchQ || br.toLowerCase().includes(branchQ.toLowerCase()));

  const dropSt = { position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:300, background:C.white, border:`1px solid ${C.border}`, borderRadius:11, boxShadow:"0 8px 28px rgba(0,0,0,0.10)", maxHeight:230, overflowY:"auto" };
  const optSt  = (active) => ({ padding:"9px 14px", cursor:"pointer", fontSize:13, color:active?C.greenDk:C.ink, fontWeight:active?700:500, background:active?C.greenLt:"transparent", display:"flex", alignItems:"center", gap:8 });

  return (
    <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
      <div ref={brandRef} style={{ position:"relative", minWidth:180 }}>
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

      <div ref={branchRef} style={{ position:"relative", minWidth:190, opacity:activeBrand?1:0.45 }}>
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
   BranchSearchSelect
───────────────────────────────────────────────────────────────────────── */
function BranchSearchSelect({ value, onChange, allBranches }) {
  const [query, setQuery] = useState(value||"");
  const [open, setOpen]   = useState(false);
  const ref = useRef(null);

  useEffect(() => { setQuery(value||""); }, [value]);
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const filtered = allBranches.filter(({ branch, brand }) =>
    !query || branch.toLowerCase().includes(query.toLowerCase()) || brand.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <div style={{ position:"relative" }}>
        <div style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:C.muted }}><SearchIcon size={12}/></div>
        <input type="text" value={query} placeholder="Search branch…"
          onChange={e => { setQuery(e.target.value); setOpen(true); onChange(""); }}
          onFocus={() => setOpen(true)}
          style={{ ...invInputSt, paddingLeft:30 }}/>
      </div>
      {open && filtered.length > 0 && (
        <div style={{ position:"absolute", top:"calc(100% + 3px)", left:0, right:0, zIndex:400, background:C.white, border:`1px solid ${C.border}`, borderRadius:10, boxShadow:"0 6px 20px rgba(0,0,0,0.1)", maxHeight:190, overflowY:"auto" }}>
          {filtered.map(({ branch, brand }) => (
            <div key={branch} onMouseDown={e => { e.preventDefault(); onChange(branch); setQuery(branch); setOpen(false); }}
              onMouseEnter={e => e.currentTarget.style.background=C.bg}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}
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

/* ─────────────────────────────────────────────────────────────────────────
   Pagination
───────────────────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────────────────
   DELETE HISTORY PANEL
───────────────────────────────────────────────────────────────────────── */
function DeleteHistoryPanel({ history, onRestore, onClose }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:20, backdropFilter:"blur(4px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:20, padding:"28px 32px", width:"100%", maxWidth:680, maxHeight:"80vh", display:"flex", flexDirection:"column", boxShadow:"0 24px 64px rgba(0,0,0,0.18)", border:"1px solid rgba(0,168,76,0.15)", fontFamily:"Montserrat,sans-serif" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <h2 style={{ fontSize:17, fontWeight:800, color:"#0d2b1e", margin:0 }}>Delete History</h2>
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
        {history.length > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 90px 110px 100px", gap:8, padding:"6px 0 10px", borderBottom:"2px solid #e0f2f1", fontSize:10, fontWeight:800, color:C.green, textTransform:"uppercase", letterSpacing:"0.07em" }}>
            <span>Ingredient</span><span>Branch</span><span>Stock</span><span>Deleted At</span><span></span>
          </div>
        )}
        <div style={{ overflowY:"auto", flex:1 }}>
          {history.length === 0 ? (
            <div style={{ padding:"40px 0", textAlign:"center", color:"#9ca3af", fontSize:13, fontStyle:"italic" }}>No deleted ingredients yet.</div>
          ) : history.map((entry, i) => {
            const d = entry.data || {};
            return (
              <div key={entry.id} style={{ display:"grid", gridTemplateColumns:"1fr 90px 90px 110px 100px", gap:8, alignItems:"center", padding:"12px 0", borderBottom: i < history.length-1 ? "1px solid #f0f8f0" : "none" }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:13, color:"#0d2b1e", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.name}</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{d.brand || "—"}</div>
                </div>
                <div style={{ fontSize:12, color:C.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.branch}</div>
                <div style={{ fontSize:12, color:C.ink, fontWeight:600 }}>{d.stock} {d.unit}</div>
                <div style={{ fontSize:11, color:"#9ca3af" }}>{entry.deletedAt ? fmtTs(entry.deletedAt) : "—"}</div>
                <button onClick={() => onRestore(entry)} style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:9, border:`1.5px solid ${C.green}`, background:"#e0f2f1", color:C.greenDk, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                  <RestoreIcon/> Restore
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
   ACTIVITY LOG PANEL
───────────────────────────────────────────────────────────────────────── */
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
      add:    { bg:"rgba(16,185,129,0.12)",  color:"#059669",  label:"Added"   },
      edit:   { bg:"rgba(59,130,246,0.12)",  color:"#1d4ed8",  label:"Edited"  },
      import: { bg:"rgba(139,92,246,0.12)",  color:"#7c3aed",  label:"Imported"},
    };
    const s = map[action] || map.edit;
    return <span style={{ padding:"2px 9px", borderRadius:20, fontSize:10, fontWeight:800, background:s.bg, color:s.color, whiteSpace:"nowrap" }}>{s.label}</span>;
  };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:20, backdropFilter:"blur(4px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:20, padding:"28px 32px", width:"100%", maxWidth:780, maxHeight:"82vh", display:"flex", flexDirection:"column", boxShadow:"0 24px 64px rgba(0,0,0,0.18)", border:"1px solid rgba(0,168,76,0.15)", fontFamily:"Montserrat,sans-serif" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <h2 style={{ fontSize:17, fontWeight:800, color:"#0d2b1e", margin:0 }}>Activity Log</h2>
            <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:"#e0f2f1", color:C.greenDk }}>{filtered.length} entries</span>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:`1px solid ${C.border}`, background:"#e0f2f1", cursor:"pointer", color:C.green, display:"flex", alignItems:"center", justifyContent:"center" }}>
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
          </select>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"80px 1fr 100px 120px 160px", gap:8, padding:"6px 0 8px", borderBottom:"2px solid #e0f2f1", fontSize:10, fontWeight:800, color:C.green, textTransform:"uppercase", letterSpacing:"0.07em" }}>
          <span>Action</span><span>Ingredient</span><span>Branch</span><span>By</span><span>Timestamp</span>
        </div>
        <div style={{ overflowY:"auto", flex:1 }}>
          {filtered.length === 0 ? (
            <div style={{ padding:"40px 0", textAlign:"center", color:"#9ca3af", fontSize:13, fontStyle:"italic" }}>No activity yet.</div>
          ) : filtered.map((entry, i) => (
            <div key={entry.id || i} style={{ display:"grid", gridTemplateColumns:"80px 1fr 100px 120px 160px", gap:8, alignItems:"center", padding:"11px 0", borderBottom: i < filtered.length-1 ? "1px solid #f0f8f0" : "none" }}>
              <div>{actionBadge(entry.action)}</div>
              <div>
                <div style={{ fontWeight:700, fontSize:13, color:"#0d2b1e", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{entry.ingredientName}</div>
                {entry.changes && (
                  <div style={{ fontSize:10, color:C.muted, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{entry.changes}</div>
                )}
              </div>
              <div style={{ fontSize:11, color:C.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{entry.branch || "—"}</div>
              <div style={{ fontSize:12, fontWeight:600, color:"#0d2b1e", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{entry.performedBy || "System"}</div>
              <div style={{ fontSize:11, color:"#9ca3af" }}>{entry.timestamp ? fmtTs(entry.timestamp) : "—"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────── */
export default function StockInventoryContent({ user, brands: propBrands = [] }) {
  const isAdmin    = user?.role === "Super Admin";
  const userBranch = user?.branch || "";
  const userName   = user?.name  || "Unknown";

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

  const [uiModal,    setUiModal]    = useState(null);
  const showUiModal  = useCallback((opts) => setUiModal(opts), []);
  const closeUiModal = useCallback(() => setUiModal(null), []);

  const [deleteTarget,      setDeleteTarget]      = useState(null);
  const [importLoading,     setImportLoading]     = useState(false);
  const [importProgress,    setImportProgress]    = useState({ percent:0, label:"Preparing…", current:0, total:0 });
  const [deleteHistory,     setDeleteHistory]     = useState([]);
  const [showDeleteHistory, setShowDeleteHistory] = useState(false);
  const [activityLog,       setActivityLog]       = useState([]);
  const [showActivityLog,   setShowActivityLog]   = useState(false);

  // Extra brand-specific field values (in the Add/Edit modal)
  const [extraValues, setExtraValues] = useState({});

  const excelRef = useRef(null);

  const emptyForm = useCallback(() => ({
    name:"", branch: isAdmin ? "" : userBranch, brand:"",
    unit:"pcs", stock:0, min_stock:0, cost_per_unit:"",
    listInShop: false,
    shopPrice:"", shopUnit:"", shopCategory:"Coffee Spot",
  }), [isAdmin, userBranch]);
  const [form, setForm] = useState(emptyForm);

  // When brand changes in form, reset extra values
  useEffect(() => {
    setExtraValues(defaultExtraValues(form.brand));
  }, [form.brand]);

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
      const mapped = Array.isArray(data)
        ? data.map(row => ({
            id:        row.id,
            data:      row.ingredient_data ?? row.data ?? {},
            deletedAt: row.deleted_at      ?? row.deletedAt,
            deletedBy: row.deleted_by      ?? row.deletedBy,
          }))
        : [];
      setDeleteHistory(mapped);
    } catch (err) { console.error("Failed to fetch ingredient delete history:", err); }
  }, []);

  const fetchActivityLog = useCallback(async () => {
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/ingredient-activity-log`);
      const data = await res.json();
      const mapped = Array.isArray(data)
        ? data.map(row => ({
            id:             row.id,
            action:         row.action,
            ingredientName: row.ingredient_name ?? row.ingredientName,
            branch:         row.branch,
            performedBy:    row.performed_by    ?? row.performedBy,
            changes:        row.changes,
            timestamp:      row.created_at      ?? row.timestamp,
          }))
        : [];
      setActivityLog(mapped);
    } catch (err) { console.error("Failed to fetch ingredient activity log:", err); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { fetchDeleteHistory(); fetchActivityLog(); }, [fetchDeleteHistory, fetchActivityLog]);
  useEffect(() => { setPage(0); }, [search, brand, branch, unitFilter, statusFilt]);

  const logActivity = useCallback(async (action, ingredientName, branchName, changes = null) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/ingredient-activity-log`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ action, ingredient_name: ingredientName, branch: branchName, performed_by: userName, changes }),
      });
    } catch (err) { console.warn("Activity log failed (non-fatal):", err); }
  }, [userName]);

  /* ── import excel ── */
  const importExcel = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImportLoading(true);
    setImportProgress({ percent:5, label:"Reading file…", current:0, total:0 });
    const reader = new FileReader();
    reader.onload = async ev => {
      try {
        setImportProgress({ percent:15, label:"Parsing spreadsheet…", current:0, total:0 });
        const wb = XLSX.read(ev.target.result, { type:"array" });
        const rows_to_save = [];
        wb.SheetNames.forEach(sheetName => {
          const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval:"" });
          rows.forEach(row => {
            const name = capitalizeName(String(row.name || row.Name || row["INGREDIENT NAME"] || "").trim());
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
            // Extra fields from Excel
            const extra = {};
            const fields = getExtraFields(rowBrand);
            fields.forEach(f => {
              const v = row[f.key] ?? row[f.label] ?? "";
              extra[f.key] = f.type === "yesno"
                ? (v === 1 || v === true || String(v).toLowerCase() === "yes" || String(v).toLowerCase() === "true")
                : v;
            });
            rows_to_save.push({
              name, branch: rowBranch, brand: rowBrand,
              unit:          String(row.unit          || row.Unit          || "pcs").trim(),
              stock:         parseFloat(row.stock     || row.Stock         || 0) || 0,
              min_stock:     parseFloat(row.min_stock || row["Min Stock"]  || 0) || 0,
              cost_per_unit: parseFloat(row.cost_per_unit || row["Cost/Unit"] || 0) || 0,
              listInShop,
              shopPrice:    parseFloat(row.shop_price  || row["Shop Price"] || 0) || 0,
              shopUnit:     String(row.shop_unit       || row["Shop Unit"]  || "").trim(),
              shopCategory: String(row.shop_category   || row["Shop Category"] || "Coffee Spot").trim(),
              extra_fields: extra,
            });
          });
        });

        setImportProgress({ percent:25, label:`Found ${rows_to_save.length} rows. Importing…`, current:0, total:rows_to_save.length });

        let saved = 0, shopSaved = 0, skipped = 0;
        const skippedNames = [];

        for (let idx = 0; idx < rows_to_save.length; idx++) {
          const item = rows_to_save[idx];
          const pct  = 25 + Math.round(((idx + 1) / rows_to_save.length) * 65);
          setImportProgress({ percent: pct, label: `Saving "${item.name}"…`, current: idx + 1, total: rows_to_save.length });
          try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/ingredients`, {
              method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(item),
            });
            const d = await res.json();
            if (d.success) {
              saved++;
              await logActivity("import", item.name, item.branch, `stock=${item.stock} ${item.unit}, cost=₱${item.cost_per_unit}`);
              if (item.listInShop && item.shopPrice > 0) {
                try {
                  const checkRes  = await fetch(`${process.env.REACT_APP_API_URL}/shop-items`);
                  const checkData = await checkRes.json();
                  const shopDup   = checkData.some(s => s.name.trim().toLowerCase() === item.name.toLowerCase() && s.shop.trim().toLowerCase() === item.shopCategory.toLowerCase());
                  if (!shopDup) {
                    const shopRes = await fetch(`${process.env.REACT_APP_API_URL}/shop-items`, {
                      method:"POST", headers:{"Content-Type":"application/json"},
                      body:JSON.stringify({ name:item.name, price:item.shopPrice, unit:item.shopUnit, stock:item.stock, shop:item.shopCategory, brand:item.brand||"", image_url:"https://placehold.co/150x150/e8f5e9/2e7d32?text="+encodeURIComponent(item.name.slice(0,8)), is_visible:true }),
                    });
                    const shopD = await shopRes.json();
                    if (shopD.success) shopSaved++;
                  }
                } catch {}
              }
            } else { skipped++; skippedNames.push(item.name); }
          } catch { skipped++; skippedNames.push(item.name); }
        }

        setImportProgress({ percent:100, label:"Complete!", current:rows_to_save.length, total:rows_to_save.length });
        await fetchItems();
        await fetchActivityLog();

        const summaryLines = [
          { text:`${rows_to_save.length} row(s) parsed from file` },
          { text:`${saved} ingredient(s) saved successfully` },
          ...(shopSaved > 0 ? [{ text:`${shopSaved} item(s) also added to Mobile Shop` }] : []),
          ...(skipped > 0 ? [{ text:`${skipped} item(s) failed or skipped`, warn:true }, ...skippedNames.map(n => ({ text:n, warn:true }))] : []),
        ];

        setTimeout(() => {
          setImportLoading(false);
          e.target.value = "";
          showUiModal({
            type: skipped > 0 ? "info" : "success",
            title: "Import Complete",
            message: skipped > 0
              ? `${saved} ingredient(s) saved. ${skipped} item(s) were skipped.`
              : `Successfully imported ${saved} ingredient(s) into stock inventory.`,
            lines: summaryLines,
          });
        }, 400);
      } catch (err) {
        setImportLoading(false);
        e.target.value = "";
        showUiModal({ type:"error", title:"Import Failed", message:"An error occurred while processing the Excel file. Please check the file format and try again." });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  /* ── filtered + sorted list ── */
  const filtered = useMemo(() => {
  const q   = search.toLowerCase();
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const warnDate = new Date(now); warnDate.setDate(now.getDate() + EXPIRY_WARN_DAYS);

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

      if (statusFilt === 'expiring' || statusFilt === 'expired') {
        const expRaw = i.extra_fields?.exp_date;
        if (!expRaw) return false;
        const exp = new Date(expRaw); exp.setHours(0, 0, 0, 0);
        if (statusFilt === 'expired')  return exp < now;
        if (statusFilt === 'expiring') return exp >= now && exp <= warnDate;
      }

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
  const totalValue = items.reduce((s, i) => s + (i.cost_per_unit||0)*(i.stock||0), 0);
  const pageItems  = filtered.slice(page * PAGE_SIZE, (page+1) * PAGE_SIZE);

  /* ── Determine which extra fields to show in table based on visible items ── */
  // For the table, we show extra columns only when a single brand filter is active
  const activeBrandName = useMemo(() => {
    if (!brand) return null;
    return brandList.find(b => b.id === brand)?.name || null;
  }, [brand, brandList]);
  const tableExtraFields = useMemo(() => getExtraFields(activeBrandName), [activeBrandName]);

  /* ── save (add / edit) ── */
  const saveItem = async e => {
    e.preventDefault();
    const payload = {
      ...form,
      branch: isAdmin ? form.branch : userBranch,
      name: capitalizeName(form.name.trim()),
      extra_fields: extraValues,
    };

    if (!editing) {
      const duplicate = items.find(
        i => normalizeName(i.name) === normalizeName(payload.name) && i.branch.trim().toLowerCase() === payload.branch.trim().toLowerCase()
      );
      if (duplicate) {
        showUiModal({ type:"error", title:"Duplicate Ingredient", message:`"${payload.name}" already exists in ${payload.branch}. Please use a different name.` });
        return;
      }
    }

    const url    = editing ? `${process.env.REACT_APP_API_URL}/ingredients/${editing.id}` : `${process.env.REACT_APP_API_URL}/ingredients`;
    const method = editing ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
      const d   = await res.json();
      if (d.success) {
        let changesStr = null;
        if (editing) {
          const changed = [];
          if (String(editing.stock)         !== String(payload.stock))         changed.push(`stock: ${editing.stock} → ${payload.stock}`);
          if (String(editing.min_stock)     !== String(payload.min_stock))     changed.push(`min: ${editing.min_stock} → ${payload.min_stock}`);
          if (String(editing.cost_per_unit) !== String(payload.cost_per_unit)) changed.push(`cost: ₱${editing.cost_per_unit} → ₱${payload.cost_per_unit}`);
          if (editing.unit !== payload.unit) changed.push(`unit: ${editing.unit} → ${payload.unit}`);
          changesStr = changed.length > 0 ? changed.join("; ") : "Minor update";
        }
        await logActivity(editing ? "edit" : "add", payload.name, payload.branch, changesStr);

        if (!editing && form.listInShop && form.shopPrice) {
          try {
            await fetch(`${process.env.REACT_APP_API_URL}/shop-items`, {
              method:"POST", headers:{"Content-Type":"application/json"},
              body:JSON.stringify({ name:payload.name, price:parseFloat(form.shopPrice)||0, unit:form.shopUnit||"", stock:parseInt(payload.stock)||0, shop:form.shopCategory, brand:payload.brand||"", image_url:"https://placehold.co/150x150/e8f5e9/2e7d32?text="+encodeURIComponent(payload.name.slice(0,8)), is_visible:true, branches:[] }),
            });
          } catch {}
        }

        await fetchItems();
        await fetchActivityLog();
        closeModal();
        showUiModal({
          type:"success",
          title: editing ? "Ingredient Updated" : "Ingredient Added",
          message: editing
            ? `"${payload.name}" has been updated successfully.`
            : `"${payload.name}" has been added to stock inventory.`,
        });
      } else {
        showUiModal({ type:"error", title:"Failed to Save", message: d.error || "An unexpected error occurred." });
      }
    } catch {
      showUiModal({ type:"error", title:"Connection Error", message:"Failed to save ingredient. Please check your connection and try again." });
    }
  };

  const handleDeleteItem = (item) => setDeleteTarget(item);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const item = deleteTarget;
    setDeleteTarget(null);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/ingredients/${item.id}`, { method:"DELETE" });
      const d   = await res.json();
      if (d.success) {
        await fetch(`${process.env.REACT_APP_API_URL}/ingredient-delete-history`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body:JSON.stringify({ ingredient_data: item, deleted_by: userName }),
        });
        await fetchItems();
        await fetchDeleteHistory();
      } else {
        showUiModal({ type:"error", title:"Failed to Delete", message: d.error || "An unexpected error occurred." });
      }
    } catch {
      showUiModal({ type:"error", title:"Connection Error", message:"Failed to delete ingredient. Please check your connection and try again." });
    }
  };

  const handleRestore = async (entry) => {
    try {
      const d = entry.data;
      const res = await fetch(`${process.env.REACT_APP_API_URL}/ingredients`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ name:d.name, branch:d.branch, brand:d.brand, unit:d.unit, stock:d.stock, min_stock:d.min_stock, cost_per_unit:d.cost_per_unit, extra_fields: d.extra_fields || {} }),
      });
      const result = await res.json();
      if (result.success) {
        await fetch(`${process.env.REACT_APP_API_URL}/ingredient-delete-history/${entry.id}`, { method:"DELETE" });
        await logActivity("add", d.name, d.branch, "Restored from delete history");
        await fetchItems();
        await fetchDeleteHistory();
        await fetchActivityLog();
        showUiModal({ type:"success", title:"Ingredient Restored", message:`"${d.name}" has been restored to stock inventory.` });
      } else {
        showUiModal({ type:"error", title:"Restore Failed", message: result.error || "Failed to restore ingredient." });
      }
    } catch {
      showUiModal({ type:"error", title:"Connection Error", message:"Failed to restore ingredient. Please check your connection and try again." });
    }
  };

  const openEdit = item => {
    setEditing(item);
    setForm({
      name:          item.name,
      brand:         item.brand  || "",   // brand first so branch dropdown populates
      branch:        item.branch || "",
      unit:          item.unit   || "pcs",
      stock:         item.stock,
      min_stock:     item.min_stock,
      cost_per_unit: item.cost_per_unit || "",
      listInShop:    false,
      shopPrice:     "",
      shopUnit:      "",
      shopCategory:  "Coffee Spot",
    });
    // Pre-populate extra values from saved data
    const savedExtra = item.extra_fields || {};
    const defaults   = defaultExtraValues(item.brand);
    setExtraValues({ ...defaults, ...savedExtra });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); setForm(emptyForm()); setExtraValues({}); };

  /* ── sortable table header ── */
  const SortTh = ({ col, label, minW }) => {
    const active = sort.col === col;
    return (
      <th onClick={() => { setSort(s => ({ col, asc: s.col===col?!s.asc:true })); setPage(0); }}
        style={{ padding:"9px 12px", textAlign:"left", fontWeight:800, fontSize:11, color:active?C.green:C.muted, letterSpacing:"0.07em", textTransform:"uppercase", borderBottom:`1px solid ${C.border}`, cursor:"pointer", userSelect:"none", whiteSpace:"nowrap", background:"#f0fdf5", minWidth:minW }}>
        <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}>
          {label}
          {active ? (sort.asc ? <SortAscIcon/> : <SortDescIcon/>) : <span style={{ opacity:0.25 }}><SortDescIcon/></span>}
        </span>
      </th>
    );
  };

  const PlainTh = ({ label, minW, accent }) => (
    <th style={{ padding:"9px 12px", textAlign:"left", fontWeight:800, fontSize:11, color: accent || C.muted, letterSpacing:"0.07em", textTransform:"uppercase", borderBottom:`1px solid ${C.border}`, userSelect:"none", whiteSpace:"nowrap", background:"#f0fdf5", minWidth:minW }}>
      {label}
    </th>
  );

  /* ── render ── */
  return (
    <div style={{ fontFamily:"'Montserrat', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* stat cards */}
      {(() => {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const warnDate = new Date(now); warnDate.setDate(now.getDate() + EXPIRY_WARN_DAYS);

  const expiringCount = items.filter(i => {
    const expRaw = i.extra_fields?.exp_date;
    if (!expRaw) return false;
    const exp = new Date(expRaw); exp.setHours(0, 0, 0, 0);
    return exp >= now && exp <= warnDate;
  }).length;

  const expiredCount = items.filter(i => {
    const expRaw = i.extra_fields?.exp_date;
    if (!expRaw) return false;
    const exp = new Date(expRaw); exp.setHours(0, 0, 0, 0);
    return exp < now;
  }).length;

  // Only show the expiry card if the active brand filter has exp_date fields
  const showExpiryCard = tableExtraFields.some(f => f.key === 'exp_date');

  const statCards = [
    { label: 'Total Ingredients', value: items.length.toLocaleString(),  sub: 'Registered',   accent: C.green   },
    { label: 'Low Stock Alerts',  value: lowCount,                        sub: 'Needs reorder', accent: '#e65100' },
    { label: 'Total Stock Value', value: '₱' + Number(totalValue).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), sub: 'Cost basis', accent: '#1565c0' },
    ...(showExpiryCard ? [{
      label:  'Expiring / Expired',
      value:  `${expiringCount} / ${expiredCount}`,
      sub:    `Within ${EXPIRY_WARN_DAYS} days / Already expired`,
      accent: '#f59e0b',
      highlight: expiredCount > 0 ? '#fce4ec' : expiringCount > 0 ? '#fff3e0' : undefined,
    }] : []),
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${statCards.length}, 1fr)`,
      gap: 12,
      marginBottom: 18,
    }}>
      {statCards.map((s, i) => (
        <div key={i} style={{
          background: s.highlight || C.white,
          border: s.highlight ? `1.5px solid ${s.accent}44` : '1px solid rgba(0,168,76,0.13)',
          borderRadius: 14,
          padding: '14px 18px',
          boxShadow: '0 1px 6px rgba(0,140,60,0.05)',
          transition: 'border-color .2s',
        }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.accent, marginBottom: 5 }}>{s.label}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, lineHeight: 1.15 }}>{s.value}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
})()}

      {/* filter bar */}
      <div style={{ background:C.white, border:"1px solid rgba(0,168,76,0.13)", borderRadius:16, padding:"14px 18px", marginBottom:18, boxShadow:"0 1px 8px rgba(0,140,60,0.05)" }}>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ position:"relative", flex:"1 1 220px", minWidth:180 }}>
            <div style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:C.muted }}><SearchIcon size={13}/></div>
            <input type="text" placeholder="Search ingredient or branch…" value={search} onChange={e=>setSearch(e.target.value)} style={{ ...invInputSt, paddingLeft:30 }}/>
            {search && <div onClick={()=>setSearch("")} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", cursor:"pointer", color:C.muted }}><XIcon size={12}/></div>}
          </div>
          {isAdmin && (
            <BrandBranchFilter brands={brandList} activeBrand={brand} activeBranch={branch}
              onChangeBrand={id=>{setBrand(id);setBranch(null);}} onChangeBranch={setBranch}/>
          )}
          <select value={unitFilter} onChange={e=>setUnitFilter(e.target.value)} style={{ ...invInputSt, width:120 }}>
            <option value="">All Units</option>
            {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
          </select>
          <select value={statusFilt} onChange={e=>setStatusFilt(e.target.value)} style={{ ...invInputSt, width:160 }}>
  <option value="">All Status</option>
  <option value="low">Low Stock</option>
  <option value="ok">In Stock</option>
  {tableExtraFields.some(f => f.key === 'exp_date') && (
    <option value="expiring">⚠ Expiring Soon (30d)</option>
  )}
  {tableExtraFields.some(f => f.key === 'exp_date') && (
    <option value="expired">✕ Expired</option>
  )}
</select>
          <div style={{ flex:1 }}/>
          <button onClick={()=>setShowDeleteHistory(true)} style={{ ...btnSt, border:"1.5px solid #dc2626", color:"#dc2626", gap:6 }}>
            <HistoryIcon size={13}/> Delete History
            {deleteHistory.length > 0 && <span style={{ background:"#dc2626", color:"#fff", fontSize:10, fontWeight:800, padding:"1px 7px", borderRadius:20 }}>{deleteHistory.length}</span>}
          </button>
          <button onClick={()=>setShowActivityLog(true)} style={{ ...btnSt, border:`1.5px solid ${C.green}`, color:C.greenDk, gap:6 }}>
            <ActivityIcon size={13}/> Activity Log
            {activityLog.length > 0 && <span style={{ background:C.green, color:"#fff", fontSize:10, fontWeight:800, padding:"1px 7px", borderRadius:20 }}>{activityLog.length}</span>}
          </button>
          <label style={{ ...btnSt, cursor:"pointer" }}>
            <FileIcon size={13}/> Import Excel
            <input ref={excelRef} type="file" accept=".xlsx,.xls" onChange={importExcel} style={{ display:"none" }}/>
          </label>
          <button onClick={()=>{ setEditing(null); setForm(emptyForm()); setExtraValues({}); setShowModal(true); }} style={btnPrimarySt}>
            <PlusIcon/> Add Ingredient
          </button>
        </div>

       
      </div>

      {/* table card */}
      <div style={{ background:C.white, border:"1px solid rgba(0,168,76,0.12)", borderRadius:18, overflow:"hidden", boxShadow:"0 2px 18px rgba(0,140,60,0.07)" }}>
        <div style={{ padding:"11px 18px", background:`linear-gradient(135deg,${C.teal},${C.green})`, display:"flex", justifyContent:"space-between", alignItems:"center", color:C.white }}>
          <span style={{ fontWeight:800, fontSize:13 }}>
            Stock Ingredients
            {activeBrandName && tableExtraFields.length > 0 && (
              <span style={{ marginLeft:10, fontSize:11, opacity:0.85, fontWeight:600 }}>— {activeBrandName} view</span>
            )}
          </span>
          <span style={{ fontSize:12, opacity:0.9 }}>{filtered.length} items · {lowCount} low stock</span>
        </div>

        {loading ? (
          <div style={{ padding:"52px 0", textAlign:"center", color:C.muted, fontSize:14, fontWeight:700 }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:"52px 0", textAlign:"center", color:C.muted, fontSize:13, fontStyle:"italic" }}>
            <div style={{ fontSize:"2.5rem", marginBottom:10 }}></div>
            No ingredients found. Add your first ingredient above.
          </div>
        ) : (
          <>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr>
                    <SortTh col="name"         label="Ingredient" minW={150}/>
                    <SortTh col="branch"        label="Branch"     minW={120}/>
                    <SortTh col="brand"         label="Brand"      minW={100}/>
                    <SortTh col="unit"          label="Unit"       minW={70} />
                    <SortTh col="stock"         label="Stock"      minW={80} />
                    <SortTh col="min_stock"     label="Min Stock"  minW={80} />
                    <SortTh col="cost_per_unit" label="Cost/Unit"  minW={90} />
                    {/* Brand-specific extra columns */}
                    {tableExtraFields.map(f => (
                      <PlainTh key={f.key} label={f.label} minW={f.width} accent={brandAccent(activeBrandName).color}/>
                    ))}
                    <th style={{ padding:"9px 12px", background:"#f0fdf5", borderBottom:`1px solid ${C.border}`, minWidth:140 }}/>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map(item => {
                    const low        = Number(item.stock) < Number(item.min_stock);
                    const itemBrand  = item.brand || "";
                    const itemExtra  = item.extra_fields || {};
                    return (
                      <tr key={item.id} style={{ borderBottom:"1px solid #f2faf5" }}
                        onMouseEnter={e=>e.currentTarget.style.background="#fafffe"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{ padding:"10px 12px", fontWeight:700, color:C.ink }}>{item.name}</td>
                        <td style={{ padding:"10px 12px", color:C.muted, fontSize:12 }}>
                          <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}>
                            <StoreIcon size={11} color={C.green}/> {item.branch}
                          </span>
                        </td>
                        <td style={{ padding:"10px 12px" }}>
                          {itemBrand
                            ? <span style={{ padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:600, background: brandAccent(itemBrand).bg, color: brandAccent(itemBrand).color }}>{itemBrand}</span>
                            : <span style={{ color:C.muted }}>—</span>}
                        </td>
                        <td style={{ padding:"10px 12px" }}>
                          <span style={{ padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:600, background:"#f3e8ff", color:"#6a1b9a" }}>{item.unit}</span>
                        </td>
                        <td style={{ padding:"10px 12px" }}>
                          <span style={{ color:low?C.warn:C.ink, fontWeight:low?700:500, display:"inline-flex", alignItems:"center", gap:5 }}>
                            {item.stock}
                            {low && <span style={{ background:"#fff3e0", color:C.warn, fontSize:10, fontWeight:800, padding:"2px 7px", borderRadius:20 }}>⚠️ LOW</span>}
                          </span>
                        </td>
                        <td style={{ padding:"10px 12px", color:C.muted }}>{item.min_stock}</td>
                        <td style={{ padding:"10px 12px", fontWeight:700, color:C.green }}>
                          ₱{Number(item.cost_per_unit||0).toLocaleString("en-PH",{minimumFractionDigits:2,maximumFractionDigits:2})}
                        </td>
                        {/* Extra brand-specific columns */}
                        {tableExtraFields.map(f => (
                          <td key={f.key} style={{ padding:"10px 12px" }}>
                            <ExtraFieldCell field={f} value={itemExtra[f.key]}/>
                          </td>
                        ))}
                        <td style={{ padding:"10px 12px" }}>
                          <div style={{ display:"flex", gap:5, justifyContent:"flex-end" }}>
                            <button onClick={()=>openEdit(item)} style={{ ...smallBtnSt, border:`1px solid ${C.border}`, color:C.green }}>
                              <EditIcon/> Edit
                            </button>
                            <button onClick={()=>handleDeleteItem(item)} style={{ ...smallBtnSt, border:"1px solid #ffcdd2", color:"#e53935", background:C.white }}>
                              <TrashIcon/> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* No brand filter active — tip */}
            {!activeBrandName && (
              <div style={{ padding:"10px 18px", borderTop:`1px solid ${C.border}`, background:"#f9fefb", fontSize:11, color:C.muted, display:"flex", alignItems:"center", gap:6 }}>
                <span>💡</span>
                <span>Filter by brand (iPharma, Coffee Spot, Food Caravan, or iFuel) to see brand-specific columns like Batch No., Exp Date, and more.</span>
              </div>
            )}

            <Pagination page={page} setPage={setPage} total={filtered.length} pageSize={PAGE_SIZE}/>
          </>
        )}
      </div>

      {/* ── ADD/EDIT MODAL ── */}
      {showModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.32)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}
          onClick={e=>{ if(e.target===e.currentTarget) closeModal(); }}>
          <div style={{ background:C.white, borderRadius:20, padding:"26px 26px 20px", width:540, maxWidth:"95vw", maxHeight:"93vh", overflowY:"auto", boxShadow:"0 10px 48px rgba(0,0,0,.18)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ margin:0, fontSize:17, fontWeight:800, color:C.ink }}>{editing ? "Edit Ingredient" : "Add Stock Ingredient"}</h2>
              <button onClick={closeModal} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, padding:4 }}><XIcon size={18}/></button>
            </div>
            <form onSubmit={saveItem} style={{ display:"grid", gap:14 }}>
              <div>
                <label style={invLabelSt}>Ingredient Name *</label>
                <input style={invInputSt} value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value.replace(/\b\w/g, c => c.toUpperCase()) }))}
                  required placeholder="e.g. Coffee Beans"/>
              </div>

              {/* ── BRAND first, then filtered BRANCH ── */}
              <div>
                <label style={invLabelSt}>Brand *</label>
                <select
                  style={invInputSt}
                  value={form.brand}
                  required
                  onChange={e => setForm(f => ({ ...f, brand: e.target.value, branch: "" }))}
                >
                  <option value="">Select brand…</option>
                  {brandList.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
              </div>

              {isAdmin ? (
                <div>
                  <label style={invLabelSt}>Branch *</label>
                  {(() => {
                    // Get branches that belong to the selected brand
                    const selectedBrandObj = brandList.find(b => b.name === form.brand);
                    const filteredBranches = selectedBrandObj
                      ? (selectedBrandObj.branches || []).map(br => typeof br === "string" ? br : br.name)
                      : [];
                    return (
                      <select
                        style={{
                          ...invInputSt,
                          opacity: !form.brand ? 0.5 : 1,
                          cursor: !form.brand ? "not-allowed" : "pointer",
                        }}
                        value={form.branch}
                        required
                        disabled={!form.brand}
                        onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}
                      >
                        <option value="">
                          {!form.brand ? "Select a brand first…" : "Select branch…"}
                        </option>
                        {filteredBranches.map(br => (
                          <option key={br} value={br}>{br}</option>
                        ))}
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
                  <label style={invLabelSt}>Cost per Unit (₱) *</label>
                  <input type="number" style={invInputSt} value={form.cost_per_unit} min="0" step="0.01"
                    onChange={e=>setForm(f=>({...f,cost_per_unit:e.target.value}))} required placeholder="0.00"/>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={invLabelSt}>Current Stock *</label>
                  <input type="number" style={invInputSt} value={form.stock} min="0"
                    onChange={e=>setForm(f=>({...f,stock:e.target.value}))} required/>
                </div>
                <div>
                  <label style={invLabelSt}>Minimum Stock *</label>
                  <input type="number" style={invInputSt} value={form.min_stock} min="0"
                    onChange={e=>setForm(f=>({...f,min_stock:e.target.value}))} required/>
                </div>
              </div>

              {/* ── BRAND-SPECIFIC EXTRA FIELDS ── */}
              {form.brand && getExtraFields(form.brand).length > 0 && (
                <ExtraFieldsForm
                  brandName={form.brand}
                  extraValues={extraValues}
                  onChange={setExtraValues}
                />
              )}

              {/* shop toggle — only on add */}
              {!editing && (
                <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:14 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom: form.listInShop ? 14 : 0 }}>
                    <div onClick={() => setForm(f => ({ ...f, listInShop: !f.listInShop }))}
                      style={{ width:40, height:22, borderRadius:11, cursor:"pointer", position:"relative", background: form.listInShop ? `linear-gradient(135deg,${C.teal},${C.green})` : "#e0e0e0", transition:"background .2s", flexShrink:0 }}>
                      <div style={{ position:"absolute", top:3, left: form.listInShop ? 21 : 3, width:16, height:16, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.2)", transition:"left .2s" }}/>
                    </div>
                    <label style={{ ...invLabelSt, marginBottom:0, cursor:"pointer" }} onClick={() => setForm(f => ({ ...f, listInShop: !f.listInShop }))}>
                      Also list in Mobile Shop Supplies
                    </label>
                  </div>
                  {form.listInShop && (
                    <div style={{ display:"grid", gap:12, marginTop:14, padding:"14px", background:C.bg, borderRadius:10, border:`1px solid ${C.border}` }}>
                      <p style={{ fontSize:11, color:C.muted, margin:0 }}>Set the <strong>bulk/supply price and unit</strong> for the shop listing.</p>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                        <div>
                          <label style={invLabelSt}>Shop Price (₱) *</label>
                          <input type="number" min="0" step="0.01" style={invInputSt} placeholder="e.g. 500.00" value={form.shopPrice} onChange={e=>setForm(f=>({...f,shopPrice:e.target.value}))}/>
                        </div>
                        <div>
                          <label style={invLabelSt}>Shop Unit</label>
                          <input type="text" style={invInputSt} placeholder="e.g. per sack" value={form.shopUnit} onChange={e=>setForm(f=>({...f,shopUnit:e.target.value}))}/>
                        </div>
                      </div>
                      <div>
                        <label style={invLabelSt}>Shop Category</label>
                        <select style={invInputSt} value={form.shopCategory} onChange={e=>setForm(f=>({...f,shopCategory:e.target.value,shopBranches:[]}))}>
                          <option value="Coffee Spot">Coffee Spot</option>
                          <option value="iPharma">iPharma</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display:"flex", justifyContent:"flex-end", gap:8, paddingTop:14, borderTop:`1px solid ${C.border}` }}>
                <button type="button" onClick={closeModal} style={btnSt}>Cancel</button>
                <button type="submit" style={btnPrimarySt}>Save Ingredient</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      <DeleteConfirmModal item={deleteTarget} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)}/>

      {/* ── IMPORT LOADING MODAL ── */}
      <ImportLoadingModal visible={importLoading} progress={importProgress}/>

      {/* ── UI MODAL ── */}
      <UIModal modal={uiModal} onClose={closeUiModal} onConfirm={() => { if (uiModal?.onConfirm) uiModal.onConfirm(); closeUiModal(); }}/>

      {/* ── DELETE HISTORY PANEL ── */}
      {showDeleteHistory && (
        <DeleteHistoryPanel history={deleteHistory} onRestore={handleRestore} onClose={() => setShowDeleteHistory(false)}/>
      )}

      {/* ── ACTIVITY LOG PANEL ── */}
      {showActivityLog && (
        <ActivityLogPanel log={activityLog} onClose={() => setShowActivityLog(false)}/>
      )}
    </div>
  );
}
