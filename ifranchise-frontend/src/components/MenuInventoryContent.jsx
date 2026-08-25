import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import * as XLSX from "xlsx";
import { RefreshCw, AlertTriangle, Check, X, Trash2 } from "lucide-react";

// ─── Design tokens — copied 1:1 from Stock Inventory ──────────────────────────
const C = {
  green:"#3b791e", greenDk:"#2c5c16", greenLt:"#f0f5e8", greenMid:"#c9dba0",
  teal:"#509820", lime:"#bdd43c", limeInk:"#24310C", ink:"#12241B", muted:"#5C6B60", border:"#E1E6D8",
  bg:"#F6F7F1", white:"#ffffff", warn:"#b45309", warnBg:"#fff7ed",
  ok:"#2c5c16", okBg:"#f0f5e8", red:"#c0392b", redBg:"#fdf1f0",
  amber:"#d97706", amberBg:"#fff7ed", amberBorder:"#fed7aa",
};

const invInputSt = {
  height:38, padding:"0 13px", borderRadius:11,
  border:`1.5px solid ${C.border}`, background:C.white,
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
  height:38, padding:"0 18px", borderRadius:999,
  border:`1px solid ${C.border}`, background:C.white,
  fontSize:13, fontWeight:600, cursor:"pointer",
  fontFamily:"inherit", whiteSpace:"nowrap", color:C.ink,
  transition:"background .15s, border-color .15s",
};
const btnPrimarySt = {
  ...btnSt,
  background:C.green,
  color:C.white, border:"none",
  boxShadow:"0 10px 24px rgba(59,121,30,0.22)",
};
const smallBtnSt = {
  display:"inline-flex", alignItems:"center", gap:4,
  height:28, padding:"0 12px", borderRadius:999,
  fontSize:12, fontWeight:600, cursor:"pointer",
  fontFamily:"inherit", background:"transparent",
  transition:"background .12s, color .12s",
};

const DEFAULT_PROFIT_MARGIN = 40;
const UNITS = ["pcs","kg","g","liters","ml","tbsp","tsp","cups","bottles","packs","bags","boxes","cans"];

const fmtPeso = n => "₱" + Number(n||0).toLocaleString("en-PH",{minimumFractionDigits:2,maximumFractionDigits:2});
const PAGE_SIZE = 20;
const fmtTs   = d  => new Date(d).toLocaleString("en-PH",{ month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit" });
const FONT     = "'Plus Jakarta Sans', sans-serif";

const SortAscIcon  = () => <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>;
const SortDescIcon = () => <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>;

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

// ─── Icons — Stock Inventory's set, plus the couple Menu needed extra ─────────
const SearchIcon    = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const EditIcon      = ({ size=12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon     = ({ size=12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const XIcon         = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const PlusIcon      = ({ size=13 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const StoreIcon     = ({ size=14, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const FileIcon      = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const TagIcon       = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const ChevronIcon   = ({ size=12, dir="down" }) => { const d={down:"m6 9 6 6 6-6",up:"m18 15-6-6-6 6"}; return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={d[dir]}/></svg>; };
const HistoryIcon   = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/></svg>;
const RestoreIcon   = ({ size=12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.41"/></svg>;
const ActivityIcon  = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const ArrowLeftIcon = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const ArrowRightIcon= ({ size=12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const EyeIcon       = ({ size=12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const AlertCircleIcon = ({ size=22, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;

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

// ─── MiniBar ───────────────────────────────────────────────────────────────────
function MiniBar({ pct, color, track="#eef6f1", height=6 }) {
  const w = Math.max(0, Math.min(100, pct ?? 0));
  return (
    <div style={{ background:track, borderRadius:20, height, overflow:"hidden", width:"100%" }}>
      <div style={{ width:`${w}%`, height:"100%", background:color, borderRadius:20, transition:"width .3s ease" }}/>
    </div>
  );
}

// ─── Chip ──────────────────────────────────────────────────────────────────────
function Chip({ label, color, bg, onRemove }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:700, color, background:bg }}>
      {label} <XIcon size={9} style={{ cursor:"pointer", marginLeft:2 }} onClick={onRemove}/>
    </span>
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
          onChange={e=>{setQuery(e.target.value);setOpen(true);}}
          onFocus={()=>setOpen(true)}
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

// ─── Searchable single-branch filter — copied from Stock Inventory ───────────
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
  const optSt  = (active) => ({ padding:"9px 14px", cursor:"pointer", fontSize:13, color:C.ink, fontWeight:active?700:500, background:active?C.greenLt:"transparent", display:"flex", alignItems:"center", gap:8 });

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

// ─── CategorySelect ─────────────────────────────────────────────────────────
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
        <button type="button" onClick={()=>setAdding(v=>!v)} style={{ ...smallBtnSt, height:38, width:38, justifyContent:"center", border:`1px solid ${C.border}`, color:adding?C.green:C.muted }}>
          <TagIcon size={14}/>
        </button>
      </div>
      {adding && (
        <div style={{ display:"flex", gap:6, marginTop:6 }}>
          <input autoFocus type="text" value={newCat} onChange={e=>setNewCat(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();handleAdd();}}} placeholder="New category…" style={{ ...invInputSt, flex:1 }}/>
          <button type="button" onClick={handleAdd} style={{ ...btnPrimarySt, padding:"0 14px" }}>Add</button>
          <button type="button" onClick={()=>{setAdding(false);setNewCat("");}} style={{ ...smallBtnSt, height:38, width:38, justifyContent:"center", border:"1px solid #fecaca", color:C.red }}><XIcon size={13}/></button>
        </div>
      )}
    </div>
  );
}

// ─── DELETE CONFIRM MODAL — Stock Inventory's header-strip chrome ────────────
function DeleteConfirmModal({ target, onConfirm, onClose, deleting = false }) {
  if (!target) return null;
  return (
    <div onClick={deleting ? undefined : onClose} style={{ position:"fixed", inset:0, background:"rgba(18,36,27,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2500, padding:20, backdropFilter:"blur(4px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:16, width:"100%", maxWidth:420, boxShadow:"0 24px 64px rgba(0,0,0,0.16)", border:"1px solid #fecaca", fontFamily:FONT, overflow:"hidden" }}>
        <div style={{ background:C.redBg, padding:"20px 24px 16px", borderBottom:"1px solid #fecaca", display:"flex", alignItems:"flex-start", gap:13 }}>
          <div style={{ flexShrink:0, marginTop:1 }}><AlertCircleIcon size={26} color={C.red}/></div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:800, color:"#991b1b", marginBottom:5 }}>Delete Item</div>
            <div style={{ fontSize:13, color:C.ink, lineHeight:1.6 }}>
              Are you sure you want to delete <strong>"{target.name}"</strong>{target.branch ? <> from <strong>{target.branch}</strong></> : null}?
            </div>
            {target.ingredientCount > 0 && (
              <div style={{ marginTop:8, background:"#fff5f5", border:"1px solid #fecaca", borderRadius:8, padding:"8px 12px", fontSize:12, color:"#7f1d1d" }}>
                This item has {target.ingredientCount} linked ingredient{target.ingredientCount!==1?"s":""}.
              </div>
            )}
            <div style={{ marginTop:8, fontSize:11.5, color:C.muted }}>You can recover this from Delete History.</div>
          </div>
          <button onClick={onClose} disabled={deleting} style={{ flexShrink:0, width:28, height:28, borderRadius:"50%", border:"1px solid #fecaca", background:"transparent", cursor:deleting?"not-allowed":"pointer", color:C.muted, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <XIcon size={13}/>
          </button>
        </div>
        <div style={{ padding:"14px 24px", display:"flex", justifyContent:"flex-end", gap:8 }}>
          <button onClick={onClose} disabled={deleting} style={{ ...btnSt, opacity: deleting ? 0.5 : 1 }}>Cancel</button>
          <button onClick={onConfirm} disabled={deleting}
            style={{ ...btnSt, background:C.red, color:"#fff", border:"none", boxShadow:"0 2px 8px rgba(192,57,43,0.25)", opacity: deleting ? 0.7 : 1, cursor: deleting ? "not-allowed" : "pointer" }}>
            {deleting
              ? <><RefreshCw size={13} style={{ animation:"spin .8s linear infinite" }}/> Deleting…</>
              : <><TrashIcon size={13}/> Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete History Panel — Stock Inventory's grid-row chrome ────────────────
function InventoryDeleteHistoryPanel({ history, onRestore, restoringId, onClose }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(18,36,27,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:20, backdropFilter:"blur(4px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:18, padding:"28px 32px", width:"100%", maxWidth:780, maxHeight:"82vh", display:"flex", flexDirection:"column", boxShadow:"0 24px 64px rgba(0,0,0,0.18)", border:`1px solid ${C.greenMid}`, fontFamily:FONT }}>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <h2 style={{ fontSize:16, fontWeight:800, color:C.ink, margin:0 }}>Delete History</h2>
            {history.length > 0 && (
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:"#fee2e2", color:C.red }}>
                {history.length} deleted
              </span>
            )}
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:`1px solid ${C.border}`, background:C.greenLt, cursor:"pointer", color:C.green, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <XIcon size={15}/>
          </button>
        </div>

        {history.length > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 70px 80px 110px 100px", gap:8, padding:"6px 0 10px", borderBottom:`2px solid ${C.greenLt}`, fontSize:10, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em" }}>
            <span>Item</span><span>Branch</span><span>Stock</span><span>Price</span><span>Deleted At</span><span></span>
          </div>
        )}

        <div style={{ overflowY:"auto", flex:1 }}>
          {history.length === 0 ? (
            <div style={{ padding:"40px 0", textAlign:"center", color:"#9ca3af", fontSize:13, fontStyle:"italic" }}>No deleted items yet.</div>
          ) : history.map((entry, i) => {
            const d    = entry.inventory_data   || {};
            const ings = entry.ingredients_data || [];
            return (
              <div key={entry.id} style={{ padding:"14px 0", borderBottom: i < history.length-1 ? `1px solid ${C.bg}` : "none" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 70px 80px 110px 100px", gap:8, alignItems:"center" }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.name}</div>
                    <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{d.category}</div>
                  </div>
                  <div style={{ fontSize:12, color:C.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.branch}</div>
                  <div style={{ fontSize:12, color:C.ink, fontWeight:600 }}>{d.stock}</div>
                  <div style={{ fontSize:12, color:C.green, fontWeight:700 }}>{fmtPeso(d.price||0)}</div>
                  <div style={{ fontSize:11, color:"#9ca3af" }}>{entry.deleted_at ? fmtTs(entry.deleted_at) : "—"}</div>
                  <button onClick={() => onRestore(entry)} disabled={restoringId === entry.id}
                   style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:8, border:`1.5px solid ${C.green}`, background:C.greenLt, color:C.greenDk, fontSize:12, fontWeight:700, fontFamily:"inherit", whiteSpace:"nowrap",
                      opacity: restoringId === entry.id ? 0.7 : 1, cursor: restoringId === entry.id ? "not-allowed" : "pointer" }}>
                    {restoringId === entry.id
                      ? <RefreshCw size={12} style={{ animation:"spin 0.8s linear infinite" }}/>
                      : <RestoreIcon/>}
                    {restoringId === entry.id ? "Restoring…" : "Restore"}
                  </button>
                </div>
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

// ─── Activity Log Panel — Stock Inventory's grid-row chrome ──────────────────
function InventoryActivityLogPanel({ log, onClose }) {
  const [search, setSearch]         = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = log.filter(entry => {
    if (typeFilter !== "all" && entry.action !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!entry.itemName?.toLowerCase().includes(q) &&
          !(entry.performedBy||"").toLowerCase().includes(q) &&
          !(entry.branch||"").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const actionBadge = action => {
    const map = {
      add:    { bg:"rgba(16,185,129,0.12)",  color:"#059669", label:"Added"   },
      edit:   { bg:"rgba(59,130,246,0.12)",  color:"#1d4ed8", label:"Edited"  },
      import: { bg:"rgba(139,92,246,0.12)",  color:"#7c3aed", label:"Imported"},
      delete: { bg:"rgba(239,68,68,0.12)",   color:"#dc2626", label:"Deleted" },
    };
    const s = map[action] || map.edit;
    return <span style={{ padding:"2px 9px", borderRadius:4, fontSize:10, fontWeight:700, background:s.bg, color:s.color, whiteSpace:"nowrap" }}>{s.label}</span>;
  };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(18,36,27,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:20, backdropFilter:"blur(4px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:18, padding:"28px 32px", width:"100%", maxWidth:780, maxHeight:"82vh", display:"flex", flexDirection:"column", boxShadow:"0 24px 64px rgba(0,0,0,0.18)", border:`1px solid ${C.greenMid}`, fontFamily:FONT }}>

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
            <input type="text" placeholder="Search item, user, branch…" value={search} onChange={e=>setSearch(e.target.value)}
              style={{ ...invInputSt, paddingLeft:28, height:32, fontSize:12 }}/>
          </div>
          <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} style={{ ...invInputSt, width:140, height:32, fontSize:12 }}>
            <option value="all">All Actions</option>
            <option value="add">Added</option>
            <option value="edit">Edited</option>
            <option value="import">Imported</option>
            <option value="delete">Deleted</option>
          </select>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"80px 1fr 100px 120px 160px", gap:8, padding:"6px 0 8px", borderBottom:`2px solid ${C.greenLt}`, fontSize:10, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em" }}>
          <span>Action</span><span>Item</span><span>Branch</span><span>By</span><span>Timestamp</span>
        </div>

        <div style={{ overflowY:"auto", flex:1 }}>
          {filtered.length === 0 ? (
            <div style={{ padding:"40px 0", textAlign:"center", color:"#9ca3af", fontSize:13, fontStyle:"italic" }}>No activity yet.</div>
          ) : filtered.map((entry, i) => (
            <div key={entry.id || i} style={{ display:"grid", gridTemplateColumns:"80px 1fr 100px 120px 160px", gap:8, alignItems:"center", padding:"11px 0", borderBottom: i < filtered.length-1 ? `1px solid ${C.bg}` : "none" }}>
              <div>{actionBadge(entry.action)}</div>
              <div>
              <div style={{ fontWeight:700, fontSize:13, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{entry.itemName}</div>
                {entry.changes && <div style={{ fontSize:10, color:C.muted, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{entry.changes}</div>}
              </div>
              <div style={{ fontSize:11, color:C.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{entry.branch || "—"}</div>
              <div style={{ fontSize:12, fontWeight:600, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{entry.performedBy || "System"}</div>
              <div style={{ fontSize:11, color:"#9ca3af" }}>{entry.timestamp ? fmtTs(entry.timestamp) : "—"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LogPagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pageBtn = (active, disabled) => ({
    minWidth: 32, height: 32, padding: '0 8px', borderRadius: 999,
    border: `1px solid ${active ? 'transparent' : C.border}`,
    background: active ? C.green : C.white,
    color: active ? '#fff' : disabled ? '#cbd5c9' : C.ink,
    fontSize: 12.5, fontWeight: active ? 800 : 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: FONT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: active ? '0 3px 10px rgba(59,121,30,0.25)' : 'none',
    transition: 'transform .12s ease, box-shadow .12s ease, background .12s ease',
  });
  const pages = Array.from({ length: totalPages }, (_, i) => i).filter(i => Math.abs(i - page) <= 2 || i === 0 || i === totalPages - 1);
  const withGaps = [];
  pages.forEach((p, idx) => {
    if (idx > 0 && p - pages[idx - 1] > 1) withGaps.push('gap');
    withGaps.push(p);
  });
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
      <button onClick={() => onChange(Math.max(0, page - 1))} disabled={page === 0} style={pageBtn(false, page === 0)}>‹</button>
      {withGaps.map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} style={{ width: 20, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>···</span>
        ) : (
          <button key={p} onClick={() => onChange(p)} style={pageBtn(p === page, false)}>{p + 1}</button>
        )
      )}
      <button onClick={() => onChange(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} style={pageBtn(false, page >= totalPages - 1)}>›</button>
    </div>
  );
}

// ─── Pagination — copied from Stock Inventory ─────────────────────────────────
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
          <button key={i} onClick={()=>setPage(i)} style={{ ...smallBtnSt, height:30, minWidth:30, justifyContent:"center", fontWeight:i===page?800:600, border:i===page?"none":`1px solid ${C.border}`, background:i===page?C.green:C.white, color:i===page?C.white:C.ink }}>{i+1}</button>
        ))}
        {[{l:"›",a:()=>setPage(p=>Math.min(totalPgs-1,p+1)),d:page>=totalPgs-1},{l:"»",a:()=>setPage(totalPgs-1),d:page>=totalPgs-1}].map(({l,a,d})=>(
          <button key={l} onClick={a} disabled={d} style={{ ...smallBtnSt, height:30, width:30, justifyContent:"center", border:`1px solid ${C.border}`, opacity:d?0.35:1, background:C.white }}>{l}</button>
        ))}
      </div>
    </div>
  );
}

// ─── InventoryTable (kept for parity — same token-driven styling now) ────────
function InventoryTable({ items, onEdit, onRequestDelete, deletingId }) {
  const [sort, setSort]             = useState({ col:"name", asc:true });
  const [page, setPage]             = useState(0);
  const [expandedRows, setExpanded] = useState({});

  useEffect(() => { setPage(0); }, [items]);

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
        style={{ padding:"9px 12px", textAlign:"left", fontWeight:800, fontSize:10.5, color:active?C.green:C.muted, letterSpacing:"0.07em", textTransform:"uppercase", borderBottom:`2px solid ${C.greenLt}`, cursor:"pointer", userSelect:"none", whiteSpace:"nowrap", background:"#f8fffe", ...s }}>
        <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}>
          {label} {active?(sort.asc?<SortAscIcon/>:<SortDescIcon/>):<span style={{ opacity:0.25 }}><SortDescIcon/></span>}
        </span>
      </th>
    );
  };
  const ThStatic = ({ label, style:s }) => (
    <th style={{ padding:"9px 12px", textAlign:"left", fontWeight:800, fontSize:10.5, color:C.muted, letterSpacing:"0.07em", textTransform:"uppercase", borderBottom:`2px solid ${C.greenLt}`, whiteSpace:"nowrap", background:"#f8fffe", ...s }}>{label}</th>
  );

  if (!items.length) return <div style={{ padding:"36px 0", textAlign:"center", color:C.muted, fontSize:13, fontStyle:"italic" }}>No items match your filters.</div>;

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
              <th style={{ padding:"9px 12px", background:"#f8fffe", borderBottom:`2px solid ${C.greenLt}`, minWidth:150 }}/>
            </tr>
          </thead>
          <tbody>
            {pageItems.map(item => {
              const low        = Number(item.stock) <= Number(item.min_stock);
              const isDeleting = deletingId === item.id;
              const ingredients= item.ingredients || [];
              const isExpanded = expandedRows[item.id];
              return (
                <React.Fragment key={item.id}>
                  <tr style={{ borderBottom: isExpanded?"none":`1px solid ${C.bg}` }}
                    onMouseEnter={e=>e.currentTarget.style.background="#fafcf7"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{ padding:"10px 12px", fontWeight:700, color:C.ink }}>{item.name}</td>
                    <td style={{ padding:"10px 12px" }}>
                      <span style={{ padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:600, background:C.greenLt, color:C.greenDk }}>{item.category}</span>
                    </td>
                    <td style={{ padding:"10px 12px", color:C.muted, fontSize:12 }}>
                      <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}><StoreIcon size={11} color={C.green}/> {item.branch}</span>
                    </td>
                    <td style={{ padding:"10px 12px" }}>
                      <span style={{ color:low?C.warn:C.ink, fontWeight:low?700:500, display:"inline-flex", alignItems:"center", gap:5 }}>
                        {item.stock}
                        {low && <span style={{ background:C.warnBg, color:C.warn, fontSize:10, fontWeight:800, padding:"2px 7px", borderRadius:20 }}>⚠️ LOW</span>}
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
                       <button onClick={()=>onEdit(item)} disabled={isDeleting} style={{ ...smallBtnSt, border:`1px solid ${C.border}`, color:C.green, opacity: isDeleting ? 0.5 : 1, cursor: isDeleting ? "not-allowed" : "pointer" }}><EditIcon/> Edit</button>
                        <button onClick={()=>onRequestDelete(item)} disabled={isDeleting}
                        style={{ ...smallBtnSt, border:"1px solid #fecaca", color:C.red, opacity: isDeleting ? 0.6 : 1, cursor: isDeleting ? "not-allowed" : "pointer" }}>
                        {isDeleting && <RefreshCw size={11} style={{ animation:"spin 0.8s linear infinite" }}/>}
                        {isDeleting ? "Deleting…" : "Delete"}
                      </button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && ingredients.length > 0 && (
                    <tr style={{ borderBottom:`1px solid ${C.bg}` }}>
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

// ─── Toast — same design, retuned to Stock Inventory's green/red tokens ──────
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
      background: isErr ? C.redBg : C.okBg,
      borderLeft: `5px solid ${isErr ? C.red : C.green}`,
      border: `1px solid ${isErr ? "#fecaca" : C.greenMid}`,
      borderLeftWidth: 5,
      boxShadow: "0 16px 40px rgba(0,0,0,0.24)",
      fontFamily:FONT,
      animation:"toastIn .22s ease",
    }}>
      <div style={{
        flexShrink:0, width:32, height:32, borderRadius:"50%", display:"flex",
        alignItems:"center", justifyContent:"center",
        background: isErr ? C.red : C.green, color:"#fff",
        boxShadow: `0 4px 10px ${isErr ? "rgba(192,57,43,0.4)" : "rgba(59,121,30,0.4)"}`,
      }}>
        {isErr
          ? <AlertTriangle size={16}/>
          : isLoading
            ? <RefreshCw size={16} style={{ animation:"spin 0.8s linear infinite" }}/>
            : <Check size={16}/>}
      </div>

      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:800, color: isErr ? "#7f1d1d" : C.ink }}>
          {toast.title}
        </div>
        {toast.message && (
          <div style={{ fontSize:12.5, color: isErr ? "#991b1b" : C.muted, marginTop:3, lineHeight:1.4 }}>
            {toast.message}
          </div>
        )}
      </div>

      {!isLoading && (
        <button onClick={onClose} style={{
          background:"none", border:"none",
          color: isErr ? "#991b1b" : C.muted,
          cursor:"pointer", padding:2, flexShrink:0,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <X size={14}/>
        </button>
      )}
    </div>
  );
}

// ─── BrandOverviewCard — Stock Inventory's ink-icon / 2-stat card ─────────────
function BrandOverviewCard({ brand, branchCount, itemCount, lowCount, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign:"left", width:"100%", padding:0, appearance:"none",
        background:C.white, border:`1px solid ${C.border}`, borderRadius:18,
        overflow:"hidden", boxShadow:"0 2px 10px rgba(50,109,32,.05)", cursor:"pointer",
        transition:"transform .2s ease, box-shadow .2s ease, border-color .2s ease",
        fontFamily:"inherit",
      }}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 14px 32px rgba(50,109,32,.12)";e.currentTarget.style.borderColor=C.greenMid;}}
      onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 2px 10px rgba(50,109,32,.05)";e.currentTarget.style.borderColor=C.border;}}
    >
      <div style={{ padding:"18px 18px 15px", borderBottom:`1px solid ${C.border}`, background:"#fbfcf8", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:42, height:42, borderRadius:12, background:C.ink, color:C.lime, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <StoreIcon size={19} color={C.lime}/>
        </div>
        <div style={{ minWidth:0, flex:1 }}>
          <div style={{ fontSize:15, fontWeight:800, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{brand.name}</div>
          <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>{branchCount} branch{branchCount===1?"":"es"}</div>
        </div>
        <div style={{ width:30, height:30, borderRadius:9, background:C.bg, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", color:C.greenDk }}>
          <ArrowRightIcon size={13}/>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:0, padding:"16px 18px" }}>
        <div><div style={{ fontSize:10, color:C.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:".05em" }}>Items</div><div style={{ fontSize:18, fontWeight:800, color:C.ink, marginTop:3 }}>{itemCount}</div></div>
        <div><div style={{ fontSize:10, color:C.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:".05em" }}>Low</div><div style={{ fontSize:18, fontWeight:800, color:lowCount?C.red:C.green, marginTop:3 }}>{lowCount}</div></div>
      </div>
    </button>
  );
}

// ─── ItemDetailPanel ───────────────────────────────────────────────────────────
function ItemDetailPanel({ item, onEdit, onRequestDelete, deletingId }) {
  if (!item) return null;

  const low        = item.is_low;
  const isDeleting = deletingId === item.id;
  const ingredients = item.ingredients || [];

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14, gap:8 }}>
        <div style={{ flex:1, background:low?C.warnBg:C.okBg, borderRadius:10, padding:"10px 14px" }}>
  <div style={{ fontSize:9.5, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>Can Make</div>
  <div style={{ fontSize:18, fontWeight:800, color:low?C.warn:C.ink, display:"flex", alignItems:"center", gap:6 }}>
    {item.available_stock != null ? item.available_stock : "—"}
    {low && <span style={{ fontSize:9, fontWeight:800, color:C.warn, background:C.warnBg, padding:"2px 7px", borderRadius:20 }}>LOW</span>}
  </div>
</div>
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:16, fontWeight:800, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</div>
          <div style={{ fontSize:11, color:C.muted, marginTop:3, display:"flex", alignItems:"center", gap:5 }}>
            <StoreIcon size={11} color={C.green}/> {item.branch}
          </div>
        </div>
        <div style={{ display:"flex", gap:6, flexShrink:0 }}>
          <button onClick={()=>onEdit(item)} disabled={isDeleting} style={{ ...smallBtnSt, border:`1px solid ${C.border}`, color:C.green, opacity:isDeleting?0.5:1, cursor:isDeleting?"not-allowed":"pointer" }}><EditIcon size={11}/> Edit</button>
          <button onClick={()=>onRequestDelete(item)} disabled={isDeleting} style={{ ...smallBtnSt, border:"1px solid #fecaca", color:C.red, opacity:isDeleting?0.6:1, cursor:isDeleting?"not-allowed":"pointer" }}>
            {isDeleting && <RefreshCw size={11} style={{ animation:"spin 0.8s linear infinite" }}/>}
            {isDeleting ? "Deleting…" : <><TrashIcon size={11}/> Delete</>}
          </button>
        </div>
      </div>
      {item.low_ingredients?.length > 0 && (
  <div style={{ fontSize:11, color:C.warn, marginTop:8 }}>
    Low on: {item.low_ingredients.join(", ")}
  </div>
)}

      {item.image_url && (
        <img src={item.image_url} alt={item.name}
          style={{ width:"100%", maxWidth:280, height:170, objectFit:"cover", borderRadius:12, border:`1px solid ${C.border}`, marginBottom:14 }}
          onError={e => e.target.style.display="none"}/>
      )}

      <div style={{ display:"flex", gap:10, marginBottom:16 }}>
        <div style={{ flex:1, background:C.greenLt, borderRadius:10, padding:"10px 14px" }}>
          <div style={{ fontSize:9.5, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>Price</div>
          <div style={{ fontSize:18, fontWeight:800, color:C.greenDk }}>{fmtPeso(item.price)}</div>
        </div>
        {item.category && (
          <div style={{ flex:1, background:C.bg, borderRadius:10, padding:"10px 14px" }}>
            <div style={{ fontSize:9.5, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>Category</div>
            <div style={{ fontSize:14, fontWeight:800, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.category}</div>
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Ingredients</div>
        {ingredients.length === 0 ? (
          <div style={{ fontSize:12, color:C.muted, fontStyle:"italic" }}>No ingredients linked.</div>
        ) : (
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {ingredients.map((ing, idx) => (
              <span key={idx} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 11px", borderRadius:20, fontSize:12, fontWeight:600, background:C.white, color:C.ink, border:`1px solid ${C.border}` }}>
                <span style={{ color:C.green, fontWeight:700 }}>{ing.name}</span>
                <span style={{ color:C.muted }}>×</span>
                <span style={{ fontWeight:800, color:C.greenDk }}>{ing.qty_required}</span>
                {ing.unit && <span style={{ fontSize:11, color:C.muted, background:C.bg, padding:"1px 6px", borderRadius:20 }}>{ing.unit}</span>}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ItemDetailModal({ item, onClose, onEdit, onRequestDelete, deletingId }) {
  if (!item) return null;
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(18,36,27,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:20, backdropFilter:"blur(4px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:18, padding:"26px 28px", width:"100%", maxWidth:520, maxHeight:"86vh", overflowY:"auto", boxShadow:"0 24px 64px rgba(0,0,0,0.16)", border:`1px solid ${C.greenMid}`, fontFamily:FONT }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h2 style={{ fontSize:16, fontWeight:800, color:C.ink, margin:0, display:"flex", alignItems:"center", gap:8 }}>
            <EyeIcon size={15}/> Item Details
          </h2>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:`1px solid ${C.border}`, background:C.greenLt, cursor:"pointer", color:C.green, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <XIcon size={15}/>
          </button>
        </div>
        <ItemDetailPanel item={item} onEdit={onEdit} onRequestDelete={onRequestDelete} deletingId={deletingId}/>
      </div>
    </div>
  );
}

function MenuBrandListCard({ items, onEdit, onRequestDelete, deletingId }) {
  const [search, setSearch]   = useState("");
  const [statusF, setStatusF] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items
      .filter(i => {
        if (q && !i.name.toLowerCase().includes(q)) return false;
        if (statusF === "low" && Number(i.stock) > Number(i.min_stock)) return false;
        if (statusF === "ok"  && Number(i.stock) <= Number(i.min_stock)) return false;
        return true;
      })
      .sort((a,b) => a.name.localeCompare(b.name));
  }, [items, search, statusF]);

  useEffect(() => {
    if (selectedId && !items.find(i => i.id === selectedId)) setSelectedId(null);
  }, [items, selectedId]);

  const selected = items.find(i => i.id === selectedId) || null;

  return (
    <div>
      <div style={{ padding:"10px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", gap:8, flexWrap:"wrap", background:"#fbfcf8" }}>
        <div style={{ position:"relative", flex:"1 1 180px", minWidth:140 }}>
          <div style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", color:C.muted }}><SearchIcon size={12}/></div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search item…" style={{ ...invInputSt, height:32, fontSize:12, paddingLeft:28 }}/>
        </div>
        <select value={statusF} onChange={e=>setStatusF(e.target.value)} style={{ ...invInputSt, height:32, fontSize:12, width:120 }}>
          <option value="">All Status</option>
          <option value="low">Low Stock</option>
          <option value="ok">In Stock</option>
        </select>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", minHeight:420, maxHeight:560 }}>
        <div style={{ borderRight:`1px solid ${C.border}`, overflowY:"auto", maxHeight:560 }}>
          {filtered.length === 0 ? (
            <div style={{ padding:"30px 14px", textAlign:"center", color:C.muted, fontSize:12 }}>No items found.</div>
          ) : filtered.map(item => {
              const low = item.is_low;
              const active = item.id === selectedId;
              return (
              <div key={item.id} onClick={() => setSelectedId(item.id)}
                style={{ padding:"11px 16px", cursor:"pointer", borderLeft:`3px solid ${active?C.lime:"transparent"}`, background:active?"#f6f8ef":C.white, borderBottom:`1px solid ${C.bg}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:13, fontWeight:active?800:600, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</span>
                  {low && <span style={{ fontSize:9, fontWeight:800, color:C.warn, background:C.warnBg, padding:"1px 6px", borderRadius:4, flexShrink:0 }}>LOW</span>}
                </div>
                <div style={{ fontSize:11, color:C.muted, marginTop:3, display:"flex", justifyContent:"space-between", gap:6 }}>
                  <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.branch}</span>
                  <span style={{ fontWeight:700, color:C.greenDk, flexShrink:0 }}>{fmtPeso(item.price)}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding:20, overflowY:"auto", maxHeight:560 }}>
          {selected ? (
            <ItemDetailPanel item={selected} onEdit={onEdit} onRequestDelete={onRequestDelete} deletingId={deletingId}/>
          ) : (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", minHeight:300, color:C.muted, fontSize:12.5, textAlign:"center" }}>
              <div>Select an item on the left<br/>to view its ingredients.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function computeAvailability(ingredients) {
  if (!ingredients || ingredients.length === 0) return { available: null, lowIngredients: [] };

  let minPortions = Infinity;
  const lowIngredients = [];

  for (const ing of ingredients) {
    const qtyRequired = parseFloat(ing.qty_required) || 0;
    const stock = parseFloat(ing.stock) || 0;
    if (qtyRequired <= 0) continue;

    const portions = Math.floor(stock / qtyRequired);
    if (portions < minPortions) minPortions = portions;

    if (ing.min_stock != null && stock <= parseFloat(ing.min_stock)) {
      lowIngredients.push(ing.name);
    }
  }

  return {
    available: minPortions === Infinity ? null : minPortions,
    lowIngredients,
  };
}

// ─── MenuBrandCard — header/filter row restyled flat like Stock Inventory's BrandCard ─
function MenuBrandCard({
  brandName, items, branchOptions, categories,
  onEdit, onRequestDelete, deletingId, onQuickAdd, onBack,
  onOpenDeleteHistory, deleteHistoryCount,
  onImportExcel, excelRef,
}) {
  const [search, setSearch]         = useState("");
  const [branchF, setBranchF]       = useState("");
  const [statusF, setStatusF]       = useState("");
  const [categoryF, setCategoryF]   = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const didSetDefaultBranch = useRef(false)

   useEffect(() => {
    if (!didSetDefaultBranch.current && branchOptions.length > 0) {
      const headOffice = branchOptions.find(b => b.toLowerCase() === "head office");
      if (headOffice) setBranchF(headOffice);
      didSetDefaultBranch.current = true;
    }
  }, [branchOptions]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items
      .filter(i => {
        if (q && !i.name.toLowerCase().includes(q)) return false;
        if (branchF && i.branch !== branchF) return false;
        if (categoryF && i.category !== categoryF) return false;
        if (statusF === "low" && !i.is_low) return false;
        if (statusF === "ok"  && i.is_low) return false;
        return true;
      })
      .sort((a,b) => a.name.localeCompare(b.name));
  }, [items, search, branchF, categoryF, statusF]);

  useEffect(() => {
    if (selectedId && !items.find(i => i.id === selectedId)) setSelectedId(null);
  }, [items, selectedId]);

  const selected = items.find(i => i.id === selectedId) || null;
  const lowCount = items.filter(i => i.is_low).length;

  return (
    <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:18, overflow:"hidden", boxShadow:"0 2px 10px rgba(50,109,32,.05)", display:"flex", flexDirection:"column" }}>
      {/* header — flat, matches Stock Inventory's BrandCard */}
      <div style={{ padding:"16px 22px", background:"#fbfcf8", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", color:C.ink, flexWrap:"wrap", gap:8 }}>
        <span style={{ display:"flex", alignItems:"center", gap:10 }}>
          {onBack ? (
            <button onClick={onBack} title="Back to all brands"
              style={{ display:"inline-flex", alignItems:"center", gap:6, height:34, padding:"0 14px", borderRadius:9, border:`1px solid ${C.border}`, background:C.white, color:C.greenDk, fontSize:13, fontWeight:800, fontFamily:"inherit", cursor:"pointer" }}>
              <ArrowLeftIcon size={16} strokeWidth={2.5}/>
            </button>
          ) : (
            <StoreIcon size={17} color={C.green}/>
          )}
          <span style={{ fontWeight:800, fontSize:17 }}>{brandName}</span>
        </span>
        <span style={{ display:"flex", alignItems:"center", gap:10, fontSize:11 }}>
          <span style={{ opacity:0.85, color:C.muted }}>{items.length} item{items.length===1?"":"s"}{lowCount>0?` · ${lowCount} low`:""}</span>
          <button onClick={onQuickAdd} title="Add a new menu item"
            style={{ display:"inline-flex", alignItems:"center", gap:5, height:26, padding:"0 12px", borderRadius:7, border:"none", background:C.green, color:C.white, fontSize:11, fontWeight:700, fontFamily:"inherit", whiteSpace:"nowrap" }}>
            <PlusIcon size={12}/> Add Item
          </button>
        </span>
      </div>

      {/* filter row */}
      <div style={{ padding:"12px 18px", borderBottom:`1px solid ${C.border}`, display:"flex", gap:6, flexWrap:"wrap", background:"#fbfcf8" }}>
        <div style={{ position:"relative", flex:"1 1 160px", minWidth:100 }}>
          <div style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)", color:C.muted }}><SearchIcon size={11}/></div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{ ...invInputSt, height:30, fontSize:12, paddingLeft:24 }}/>
        </div>
        <BranchOnlyFilter branches={branchOptions} activeBranch={branchF} onChangeBranch={setBranchF}/>
        <select value={categoryF} onChange={e=>setCategoryF(e.target.value)} style={{ ...invInputSt, height:30, fontSize:11, width:140 }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={statusF} onChange={e=>setStatusF(e.target.value)} style={{ ...invInputSt, height:30, fontSize:11, width:110 }}>
          <option value="">All Status</option>
          <option value="low">Low Stock</option>
          <option value="ok">In Stock</option>
        </select>
        <div style={{ flex:1 }}/>
        <button onClick={onOpenDeleteHistory} style={{ ...smallBtnSt, height:30, padding:"0 11px", border:`1.5px solid ${C.red}`, color:C.red, gap:5, background:C.white }}>
          <HistoryIcon size={11}/> Delete History
          {deleteHistoryCount > 0 && (
            <span style={{ background:C.red, color:"#fff", fontSize:9, fontWeight:800, padding:"1px 6px", borderRadius:20 }}>{deleteHistoryCount}</span>
          )}
        </button>
        <label style={{ ...smallBtnSt, height:30, padding:"0 11px", border:`1px solid ${C.border}`, cursor:"pointer", gap:5, background:C.white }}>
          <FileIcon size={11}/> Import Excel
          <input ref={excelRef} type="file" accept=".xlsx,.xls" onChange={onImportExcel} style={{ display:"none" }}/>
        </label>
      </div>

      {/* two columns: left = scrollable item list, right = scrollable ingredients panel */}
      <div style={{ display:"grid", gridTemplateColumns:"420px 1fr", minHeight:540, maxHeight:700 }}>
        <div style={{ borderRight:`1px solid ${C.border}`, overflowY:"auto", maxHeight:700, minHeight:0 }}>
          {filtered.length === 0 ? (
            <div style={{ padding:"30px 14px", textAlign:"center", color:C.muted, fontSize:12 }}>No items found.</div>
          ) : filtered.map(item => {
            const low = Number(item.stock) <= Number(item.min_stock);
            const active = item.id === selectedId;
            const stockPct = Number(item.min_stock) > 0 ? Math.min(100, Math.round((Number(item.stock||0) / (Number(item.min_stock)*2)) * 100)) : (Number(item.stock)>0?100:0);
            return (
              <div key={item.id} onClick={() => setSelectedId(item.id)}
                style={{ padding:"10px 14px", cursor:"pointer", borderLeft:`3px solid ${active?C.lime:"transparent"}`, background:active?"#f6f8ef":C.white, borderBottom:`1px solid ${C.bg}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:12.5, fontWeight:active?800:600, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</span>
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
                  <button onClick={e=>{ e.stopPropagation(); onRequestDelete(item); }} className="del-btn" style={{ ...smallBtnSt, height:24, padding:"0 9px", fontSize:10.5, border:"1px solid #fecaca", color:C.red }}><TrashIcon size={10}/> Delete</button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding:20, overflowY:"auto", maxHeight:700, minHeight:0 }}>
          {selected ? (
            <ItemDetailPanel item={selected} onEdit={onEdit} onRequestDelete={onRequestDelete} deletingId={deletingId}/>
          ) : (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", minHeight:300, color:C.muted, fontSize:12.5, textAlign:"center", padding:20 }}>
              <div>Select an item on the left<br/>to view its ingredients.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function MenuInventoryContent({ user, brands: propBrands = [] }) {
  const isAdmin    = user?.role === "Super Admin" || user?.role === "Sales Admin";
  const userBranch = user?.branch || "";
  const userName   = user?.name   || "Unknown";

  const [branchFilter, setBranchFilter] = useState("");

  const brandList   = propBrands.length > 0 ? propBrands : [];
  const allBranches = useMemo(() => {
    const out = [];
    brandList.forEach(b => (b.branches||[]).forEach(br => {
      const name = typeof br==="string"?br:br.name;
      if (!out.find(x=>x.branch===name)) out.push({ brand:b.name, branch:name });
    }));
    return out;
  }, [brandList]);

  const branchToBrand = useMemo(() => {
    const map = {};
    brandList.forEach(b => (b.branches||[]).forEach(br => {
      const name = typeof br==="string"?br:br.name;
      map[name] = b.name;
    }));
    return map;
  }, [brandList]);

  const [inventory,       setInventory]       = useState([]);
  const [stockItems,      setStockItems]       = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [filterBrandName, setFilterBrandName] = useState("");
  const [filterCategory,  setFilterCategory]  = useState("");
  const [filterStatus,    setFilterStatus]    = useState("");
  const [searchQuery,     setSearchQuery]     = useState("");
  const [brandBranchFilter, setBrandBranchFilter] = useState({});
  const [showAddModal,    setShowAddModal]    = useState(false);
  const [showEditModal,   setShowEditModal]   = useState(false);
  const [editingItem,     setEditingItem]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeScreen, setActiveScreen] = useState(isAdmin ? "brands" : "inventory");
  const [filterBrand, setFilterBrand]   = useState(null);

  const [saving,          setSaving]          = useState(false);
  const [deletingId,      setDeletingId]      = useState(null);
  const [restoringId,     setRestoringId]     = useState(null);
  const [toast,           setToast]           = useState(null);
  const showToast = (type, title, message) => setToast({ type, title, message });

  const [deleteHistory,     setDeleteHistory]     = useState([]);
  const [showDeleteHistory, setShowDeleteHistory] = useState(false);
  const [activityLog,       setActivityLog]       = useState([]);
  const [showActivityLog,   setShowActivityLog]   = useState(false);

  const [ingSearch,   setIngSearch]   = useState("");
  const [ingQty,      setIngQty]      = useState("1");
  const [ingUnit,     setIngUnit]     = useState("");
  const [ingPicked,   setIngPicked]   = useState(null);
  const [ingDropOpen, setIngDropOpen] = useState(false);
  const ingRef = useRef(null);

const emptyForm = useCallback(() => ({
  name:"", category:"", branch:isAdmin?"":userBranch, brand:"",
  cost:"", price:"", ingredients:[], image_url:"",
}), [isAdmin, userBranch]);

  const excelRef = useRef(null);

  const [formData,    setFormData]    = useState(emptyForm);
  const [formBrandId, setFormBrandId] = useState("");

  const inventoryCategories = useMemo(() => {
    return [...new Set(brandList.flatMap(b => b.categories || []).filter(Boolean))].sort();
  }, [brandList]);

  const formBrand = useMemo(() => {
    if (!formData.branch) return null;
    return brandList.find(b =>
      (b.branches || []).some(br => (typeof br === "string" ? br : br.name) === formData.branch)
    );
  }, [formData.branch, brandList]);

  const [formCategories, setFormCategories] = useState([]);
  useEffect(() => {
    const cats = formBrand?.categories || inventoryCategories;
    setFormCategories(cats.length ? cats : []);
  }, [formBrand, inventoryCategories]);

  useEffect(() => {
    const fn = e => { if(ingRef.current && !ingRef.current.contains(e.target)) setIngDropOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const fetchInventory = useCallback(async (branch) => {
    setLoading(true);
    try {
      const q   = branch ? `?branch=${encodeURIComponent(branch)}` : "";
      const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory${q}`);
      const d   = await res.json();
      setInventory(Array.isArray(d) ? d : []);
    } catch { setInventory([]); }
    finally { setLoading(false); }
  }, []);

const fetchStockItems = useCallback(async (branch, brand) => {
  try {
    const params = new URLSearchParams();
    if (branch) params.set("branch", branch);
    if (brand)  params.set("brand", brand);
    const q = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${process.env.REACT_APP_API_URL}/ingredients${q}`);
    const d   = await res.json();
    setStockItems(Array.isArray(d) ? d : []);
  } catch { setStockItems([]); }
}, []);

  const fetchDeleteHistory = useCallback(async () => {
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/inventory-delete-history`);
      const data = await res.json();
      setDeleteHistory(Array.isArray(data) ? data.map(row => ({
        id:               row.id,
        inventory_data:   row.inventory_data,
        ingredients_data: row.ingredients_data || [],
        deleted_at:       row.deleted_at,
        deleted_by:       row.deleted_by,
      })) : []);
    } catch (err) { console.error("Failed to fetch inventory delete history:", err); }
  }, []);

    useEffect(() => {
  if (!formData.branch && !formBrandId) return;
  const brandObj = brandList.find(b => String(b.id) === String(formBrandId));
  fetchStockItems(formData.branch, brandObj?.name || "");
}, [formData.branch, formBrandId, brandList, fetchStockItems]);

  const fetchActivityLog = useCallback(async () => {
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/menu-activity-log`);
      const data = await res.json();
      setActivityLog(Array.isArray(data) ? data.map(row => ({
        id: row.id, action: row.action,
        itemName: row.item_name ?? row.itemName,
        performedBy: row.performed_by ?? row.performedBy,
        branch: row.branch,
        role: row.role,
        changes: row.changes,
        location: row.location,
        timestamp: row.created_at ?? row.timestamp,
      })) : []);
    } catch (err) {
      console.error("Failed to fetch menu activity log:", err);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) { fetchInventory(userBranch); return; }
    fetchInventory();
  }, [isAdmin, userBranch, fetchInventory]);

  useEffect(() => { fetchStockItems(); }, [fetchStockItems]);
  useEffect(() => { fetchDeleteHistory(); fetchActivityLog(); }, [fetchDeleteHistory, fetchActivityLog]);

  const refetch = () => fetchInventory(isAdmin ? undefined : userBranch);

const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return inventory.filter(i => {
      const itemBrand = i.brand || branchToBrand[i.branch] || "Unassigned";
      if (filterBrandName && itemBrand !== filterBrandName) return false;
      if (q && !i.name.toLowerCase().includes(q) && !i.category.toLowerCase().includes(q) && !i.branch.toLowerCase().includes(q)) return false;
      if (filterCategory && i.category!==filterCategory) return false;
      if (filterStatus==="low" && Number(i.stock) >  Number(i.min_stock)) return false;
      if (filterStatus==="ok"  && Number(i.stock) <= Number(i.min_stock)) return false;
      return true;
    });
  }, [inventory, searchQuery, filterCategory, filterStatus, filterBrandName, branchToBrand]);

  const filteredCategories = useMemo(() => {
    if (filterBrandName) {
      const brand = brandList.find(b => b.name === filterBrandName);
      return brand?.categories || [];
    }
    return [...new Set(brandList.flatMap(b => b.categories || []).filter(Boolean))].sort();
  }, [filterBrandName, brandList]);

  const brandGroups = useMemo(() => {
    const map = {};
    filteredItems.forEach(item => {
      const brandName = branchToBrand[item.branch] || "Unassigned";
      if (!map[brandName]) map[brandName] = [];
      map[brandName].push(item);
    });
    let names = brandList.map(b => b.name).filter(n => map[n]);
    if (map["Unassigned"]) names.push("Unassigned");
    if (filterBrandName) names = names.filter(n => n === filterBrandName);
    return names.map(name => ({ name, items: map[name] }));
  }, [filteredItems, branchToBrand, brandList, filterBrandName]);
  
  const UNIT_GROUPS = {
  g:      { base: "kg",      factor: 0.001 },
  kg:     { base: "kg",      factor: 1 },
  ml:     { base: "liters",  factor: 0.001 },
  liters: { base: "liters",  factor: 1 },
  pcs:    { base: "pcs",     factor: 1 },
};

function convertUnit(quantity, fromUnit, toUnit) {
  if (fromUnit === toUnit) return quantity;
  const from = UNIT_GROUPS[fromUnit];
  const to = UNIT_GROUPS[toUnit];
  if (!from || !to || from.base !== to.base) return quantity; // fail-safe: don't crash the form
  return (quantity * from.factor) / to.factor;
}

const computedCost = useMemo(() => {
  if (!formData.ingredients || formData.ingredients.length === 0) return 0;
  return formData.ingredients.reduce((total, ing) => {
    const stock = stockItems.find(s => s.id === ing.stock_item_id);
    if (!stock) return total;
    const qtyInStockUnit = convertUnit(parseFloat(ing.qty_required||0), ing.unit, stock.unit);
    return total + (parseFloat(stock.cost_per_unit||0) * qtyInStockUnit);
  }, 0);
}, [formData.ingredients, stockItems]);

  useEffect(() => {
    const cost  = computedCost.toFixed(2);
    const price = cost > 0 ? (parseFloat(cost) * (1 + DEFAULT_PROFIT_MARGIN / 100)).toFixed(2) : "";
    setFormData(prev => ({ ...prev, cost, price }));
  }, [computedCost]);

const handleAddItem = async e => {
  e.preventDefault();
  const branch = isAdmin ? formData.branch : userBranch;

  const missing = [];
  if (!formData.name?.trim())      missing.push("Name");
  if (!formData.category?.trim())  missing.push("Category");
  if (!branch?.trim())             missing.push("Branch");
  if (!formData.brand?.trim())     missing.push("Brand");
  if (formData.cost === "" || formData.cost == null)   missing.push("Cost");
  if (formData.price === "" || formData.price == null) missing.push("Price");
  if (!formData.image_url?.trim()) missing.push("Image");
  if (formData.minStock === "" || formData.minStock == null) missing.push("Min stock");
  if (!formData.ingredients || formData.ingredients.length === 0) {
    missing.push("At least one ingredient");
  } else {
    const badIngredient = formData.ingredients.some(
      ing => !ing.stock_item_id || !ing.qty_required || !ing.unit
    );
    if (badIngredient) missing.push("All ingredient fields (item, quantity, unit)");
  }

  if (missing.length > 0) {
    showToast("error", "Missing required fields", missing.join(", "));
    return;
  }

  const duplicate = findDuplicate(formData.name, branch, inventory);
  if (duplicate) { showToast("error", "Duplicate item", `"${duplicate.name}" already exists in this branch.`); return; }

  setSaving(true);
  const coords = await getBrowserLocation();
  const payload = {
    ...formData,
    branch,
    min_stock: formData.minStock,
    performed_by: userName,
    performed_by_role: user?.role || "Unknown",
    latitude: coords?.latitude,
    longitude: coords?.longitude,
  };
   try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory`, {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)
      });
      const d = await res.json();
      if (d.success) {
        if (formData.ingredients && formData.ingredients.length > 0) {
          const ingRes = await fetch(`${process.env.REACT_APP_API_URL}/inventory/${d.item.id}/ingredients`, {
            method:"POST", headers:{"Content-Type":"application/json"},
            body: JSON.stringify({
              ingredients: formData.ingredients.map(ing => ({
                ingredient_id: ing.stock_item_id,
                quantity:      ing.qty_required,
                unit:          ing.unit,
              }))
            })
          });
          const ingData = await ingRes.json();
          if (!ingData.success) {
            showToast("error", "Ingredients not saved", ingData.error || "The item was added but its ingredients failed to save.");
            setSaving(false);
            return;
          }
        }
        await refetch();
        await fetchActivityLog();
        setShowAddModal(false); setFormData(emptyForm()); resetIngPicker();
      showToast("success", "Item added", `"${formData.name}" was added.`);
      } else showToast("error", "Failed to add item", d.error || "Something went wrong.");
    } catch { showToast("error", "Failed to add item", "Something went wrong. Please try again."); }
    finally { setSaving(false); }
  };

  const handleEditItem = async e => {
    e.preventDefault();
    const branch     = isAdmin ? formData.branch : userBranch;
    const otherItems = inventory.filter(i => i.id !== editingItem.id);
    const duplicate  = findDuplicate(formData.name, branch, otherItems);
    if (duplicate) { showToast("error", "Duplicate item", `"${duplicate.name}" already exists in this branch.`); return; }
    setSaving(true);
    const coords = await getBrowserLocation();
    const payload = {
      ...formData,
      branch,
      min_stock: formData.minStock,
      performed_by: userName,
      performed_by_role: user?.role || "Unknown",
      latitude: coords?.latitude,
      longitude: coords?.longitude,
    };
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory/${editingItem.id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)
      });
      const d = await res.json();
      if (d.success) {
        const ingRes = await fetch(`${process.env.REACT_APP_API_URL}/inventory/${editingItem.id}/ingredients`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            ingredients: (formData.ingredients||[]).map(ing => ({
              ingredient_id: ing.stock_item_id,
              quantity:      ing.qty_required,
              unit:          ing.unit,
            }))
          })
        });
        const ingData = await ingRes.json();
        if (!ingData.success) {
          showToast("error", "Ingredients not saved", ingData.error || "The item was updated but its ingredients failed to save.");
          setSaving(false);
          return;
        }

        const changed = [];
        if (String(editingItem.stock)     !== String(formData.stock))    changed.push(`stock: ${editingItem.stock} → ${formData.stock}`);
        if (String(editingItem.min_stock) !== String(formData.minStock)) changed.push(`min: ${editingItem.min_stock} → ${formData.minStock}`);
        if (String(editingItem.price)     !== String(formData.price))    changed.push(`price: ₱${editingItem.price} → ₱${formData.price}`);
        if (editingItem.category          !== formData.category)         changed.push(`category: ${editingItem.category} → ${formData.category}`);
        const changesStr = changed.length > 0 ? changed.join("; ") : "Minor update";
        void changesStr;

        await refetch();
        await fetchActivityLog();
        setShowEditModal(false); setEditingItem(null); setFormData(emptyForm()); resetIngPicker();
      showToast("success", "Item updated", `"${formData.name}" was saved.`);
      } else showToast("error", "Failed to update item", d.error || "Something went wrong.");
    } catch { showToast("error", "Failed to update item", "Something went wrong. Please try again."); }
    finally { setSaving(false); }
  };

  const handleDeleteItem = async id => {
    setDeletingId(id);
    try {
      const coords = await getBrowserLocation();
     const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deleted_by: userName,
          performed_by_role: user?.role || "Unknown",
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        }),
      });
      const d = await res.json();
      if (d.success) {
        await refetch();
        await fetchDeleteHistory();
        await fetchActivityLog();
        showToast("success", "Item deleted", "The item was removed.");
          } else showToast("error", "Failed to delete", d.error || "Something went wrong.");
        } catch { showToast("error", "Failed to delete", "Something went wrong. Please try again."); }
        finally { setDeletingId(null); }
  };

  const handleRestore = async (entry) => {
    setRestoringId(entry.id);
    try {
      const d    = entry.inventory_data;
      const ings = entry.ingredients_data || [];
      const coords = await getBrowserLocation();

      const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          name:      d.name,
          category:  d.category,
          branch:    d.branch,
          brand:     d.brand,
          stock:     d.stock,
          min_stock: d.min_stock,
          cost:      d.cost,
          price:     d.price,
          performed_by: userName,
          performed_by_role: user?.role || "Unknown",
          latitude:  coords?.latitude,
          longitude: coords?.longitude,
          restored:  true,
        }),
      });
      const result = await res.json();
      if (result.success) {
        if (ings.length > 0) {
          await fetch(`${process.env.REACT_APP_API_URL}/inventory/${result.item.id}/ingredients`, {
            method:"POST", headers:{"Content-Type":"application/json"},
            body: JSON.stringify({
              ingredients: ings.map(ing => ({
                ingredient_id: ing.stock_item_id,
                quantity:      ing.qty_required,
                unit:          ing.unit,
              })),
            }),
          });
        }
        await fetch(`${process.env.REACT_APP_API_URL}/inventory-delete-history/${entry.id}`, { method:"DELETE" });
        await refetch();
        await fetchDeleteHistory();
        await fetchActivityLog();
        showToast("success", "Item restored", `"${d.name}" is back with ${ings.length} ingredient(s).`);
      } else showToast("error", "Failed to restore", result.error || "Something went wrong.");
    } catch { showToast("error", "Failed to restore", "Something went wrong. Please try again."); }
    finally { setRestoringId(null); }
  };

const openEditModal = item => {
  setEditingItem(item);
  const branch = isAdmin ? "Head Office" : item.branch;
  const brandForItem = filterBrandName || branchToBrand[item.branch] || ""; 
  setFormData({
    name:item.name, category:item.category, branch, brand:brandForItem,
    cost:item.cost||"", price:item.price,
    image_url: item.image_url || "",
    ingredients: (item.ingredients||[]).map(ing => ({
      stock_item_id: ing.stock_item_id || ing.id,
      name:          ing.name,
      qty_required:  ing.qty_required,
      unit:          ing.unit,
    })),
  });
  const brandObj = brandList.find(b => b.name === brandForItem);
  setFormBrandId(brandObj ? String(brandObj.id) : "");
  fetchStockItems(branch, brandForItem);
  setShowEditModal(true);
};

const openAddModal = () => {
  const branch = isAdmin ? "Head Office" : userBranch;
  const brandName = selectedBrandObj ? selectedBrandObj.name : "";
  setFormData({ ...emptyForm(), branch, brand: brandName });
  fetchStockItems(branch, brandName);
  setFormBrandId(selectedBrandObj ? String(selectedBrandObj.id) : "");
  setShowAddModal(true);
};

  const handleInputChange = e => {
    let { name, value } = e.target;
    if (name === "name") value = value.replace(/\b\w/g, c => c.toUpperCase());
    setFormData(p => ({ ...p, [name]: value }));
  };

  const resetIngPicker = () => { setIngSearch(""); setIngQty("1"); setIngUnit(""); setIngPicked(null); setIngDropOpen(false); };

  const addIngredient = () => {
    if (!ingPicked) return;
    if ((formData.ingredients||[]).find(x=>x.stock_item_id===ingPicked.id)) { alert("Already added"); return; }
    setFormData(f => ({
      ...f, ingredients:[...(f.ingredients||[]), {
        stock_item_id: ingPicked.id,
        name:          ingPicked.name,
        qty_required:  parseFloat(ingQty)||1,
        unit:          ingUnit||ingPicked.unit,
      }],
    }));
    resetIngPicker();
  };

  const removeIngredient = idx => setFormData(f=>({...f, ingredients:f.ingredients.filter((_,i)=>i!==idx)}));
  const updateIngQty     = (idx,qty) => setFormData(f=>({...f, ingredients:f.ingredients.map((ing,i)=>i===idx?{...ing,qty_required:parseFloat(qty)||0}:ing)}));

  const ingFiltered = stockItems.filter(s => {
    if (ingSearch && !s.name.toLowerCase().includes(ingSearch.toLowerCase())) return false;

    if (formData.branch) return s.branch === formData.branch;

    // No branch chosen yet (e.g. admin hasn't picked one) — fall back to brand.
    const brandName = formBrandId
      ? brandList.find(b => String(b.id) === String(formBrandId))?.name
      : (filterBrandName || "");
    if (brandName) return s.brand === brandName;

    return true;
  });

  const importExcel = e => {
    const file = e.target.files[0];
    const toTitleCase = str => str.replace(/\b\w/g, c => c.toUpperCase());
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      const wb    = XLSX.read(ev.target.result, { type:"array" });
      const items = [];
      wb.SheetNames.forEach(sheetName => {
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval:"" });
        rows.forEach(row => {
          const name = toTitleCase(String(row.name || row.Name || row["ITEM NAME"] || "").trim());
          if (!name) return;
          const category  = toTitleCase(String(row.category || row.Category || "Other").trim());
          const cost      = parseFloat(row.cost  || row.Cost  || 0) || 0;
          const rawPrice  = parseFloat(row.price || row.Price || 0) || 0;
          const price     = rawPrice > 0 ? rawPrice : (cost > 0 ? parseFloat((cost * 1.4).toFixed(2)) : 0);
          const stock     = parseInt(row.stock     || row.Stock     || 0) || 0;
          const minStock  = parseInt(row.min_stock || row["Min Stock"] || 0) || 0;
          const branch    = String(row.branch || row.Branch || "").trim();
          const rawIng    = String(row.ingredients || row.Ingredients || "").trim();
          const ingredients = rawIng
            ? rawIng.split("|").map(seg => {
                const [ingName, qty, unit] = seg.split(":").map(s => s.trim());
                return ingName ? { name:ingName, qty_required:parseFloat(qty)||1, unit:unit||"" } : null;
              }).filter(Boolean)
            : [];
          items.push({ name, category, branch:branch||"Unknown", cost, stock, min_stock:minStock, price, ingredients });
        });
      });

      let currentInventory = [...inventory];
      let saved = 0, skipped = 0;
      const skippedNames = [];

      for (const item of items) {
        const combined  = [...currentInventory];
        const duplicate = findDuplicate(item.name, item.branch, combined);
        if (duplicate) { skipped++; skippedNames.push(`${item.name} (${item.branch})`); continue; }

        try {
          const { ingredients, ...itemData } = item;
          const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory`, {
            method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(itemData)
          });
          const d = await res.json();
          if (d.success) {
            saved++;
            currentInventory.push({ ...itemData, id:d.item.id });
            if (ingredients.length > 0) {
              const ingPayload = ingredients.map(ing => {
                const match = stockItems.find(s => s.name.toLowerCase()===ing.name.toLowerCase() && s.branch===itemData.branch);
                return match ? { ingredient_id:match.id, quantity:ing.qty_required, unit:ing.unit||match.unit } : null;
              }).filter(Boolean);
              if (ingPayload.length > 0) {
                await fetch(`${process.env.REACT_APP_API_URL}/inventory/${d.item.id}/ingredients`, {
                  method:"POST", headers:{"Content-Type":"application/json"},
                  body: JSON.stringify({ ingredients:ingPayload })
                });
              }
            }
          }
        } catch {}
      }

      e.target.value = "";
      let msg = `Parsed ${items.length} row(s).\n✅ Saved: ${saved}`;
      if (skipped > 0) msg += `\n⚠️ Skipped ${skipped} duplicate(s):\n• ${skippedNames.join("\n• ")}`;
      alert(msg);
      await refetch();
      await fetchActivityLog();
    };
    reader.readAsArrayBuffer(file);
  };

  const renderIngredientPicker = () => (
    <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px", marginTop:4 }}>
      <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>Ingredients Required</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 90px auto", gap:8, marginBottom:10 }}>
        <div ref={ingRef} style={{ position:"relative" }}>
          <input style={invInputSt} value={ingSearch}
            onChange={e=>{setIngSearch(e.target.value);setIngPicked(null);setIngDropOpen(true);}}
            onFocus={()=>setIngDropOpen(true)}
            placeholder="Search stock ingredient…"/>
          {ingDropOpen && ingFiltered.length > 0 && (
            <div style={{ position:"absolute", top:"calc(100% + 3px)", left:0, right:0, zIndex:500, background:C.white, border:`1px solid ${C.border}`, borderRadius:10, boxShadow:"0 6px 20px rgba(0,0,0,0.10)", maxHeight:160, overflowY:"auto" }}>
              {ingFiltered.map(s=>(
                <div key={s.id}
                  onMouseDown={e=>{e.preventDefault();setIngPicked(s);setIngSearch(s.name);setIngUnit(s.unit);setIngDropOpen(false);}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                  style={{ padding:"8px 12px", cursor:"pointer", fontSize:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontWeight:600, color:C.ink }}>{s.name}</span>
                  <span style={{ fontSize:11, color:C.muted, background:C.greenLt, padding:"2px 8px", borderRadius:20 }}>{s.unit} · {s.branch}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <input type="number" style={invInputSt} value={ingQty} min="0" step="any" onChange={e=>setIngQty(e.target.value)} placeholder="Qty"/>
        <select style={invInputSt} value={ingUnit} onChange={e=>setIngUnit(e.target.value)}>
          <option value="">unit</option>
          {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
        </select>
        <button type="button" onClick={addIngredient} style={{ ...btnPrimarySt, height:38, padding:"0 14px", flexShrink:0 }}>
          <PlusIcon/> Add
        </button>
      </div>
      {(!formData.ingredients || formData.ingredients.length === 0) ? (
        <div style={{ textAlign:"center", padding:"12px 0", color:C.muted, fontSize:12, fontStyle:"italic" }}>No ingredients linked yet.</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {formData.ingredients.map((ing,idx)=>(
            <div key={idx} style={{ display:"grid", gridTemplateColumns:"1fr 100px 70px auto", gap:8, alignItems:"center", background:C.white, border:`1px solid ${C.border}`, borderRadius:9, padding:"8px 12px" }}>
              <span style={{ fontSize:13, fontWeight:700, color:C.ink }}>{ing.name}</span>
              <input type="number" value={ing.qty_required} min="0" step="any"
                onChange={e=>updateIngQty(idx,e.target.value)}
                style={{ ...invInputSt, textAlign:"center" }}/>
              <select
  value={ing.unit}
  onChange={e => setFormData(f => ({
    ...f,
    ingredients: f.ingredients.map((row,i) => i===idx ? { ...row, unit: e.target.value } : row)
  }))}
  style={{ ...invInputSt, height:28, fontSize:11, padding:"0 8px" }}>
  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
</select>
              <button type="button" onClick={()=>removeIngredient(idx)}
                style={{ ...smallBtnSt, height:28, width:28, justifyContent:"center", border:"1px solid #fecaca", color:C.red, flexShrink:0 }}>
                <XIcon size={11}/>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

const renderFormFields = () => {
   const currentBrandName = formData.brand || selectedBrandObj?.name || filterBrandName || "";

    return (
    <>
      <div style={{ marginBottom:13 }}>
        <label style={invLabelSt}>Item Name</label>
        <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={invInputSt} placeholder="Product name"/>
      </div>
      <div style={{ marginBottom:13 }}>
        <label style={invLabelSt}>Product Image</label>
        <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
          <div style={{ flex:1 }}>
            <input
              type="text"
              placeholder="Paste image URL or upload below…"
              value={formData.image_url || ""}
              onChange={e => setFormData(p => ({ ...p, image_url: e.target.value }))}
              style={invInputSt}
            />
          </div>
          <label style={{ ...btnSt, cursor:"pointer", flexShrink:0 }}>
            <FileIcon size={13}/> Upload
            <input
              type="file"
              accept="image/*"
              style={{ display:"none" }}
              onChange={async e => {
                const file = e.target.files[0];
                if (!file) return;
                const fd = new FormData();
                fd.append("image", file);
                try {
                  const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory/upload-image`, {
                    method: "POST",
                    body: fd,
                  });
                  const d = await res.json();
                  if (d.url) setFormData(p => ({ ...p, image_url: d.url }));
                  else alert("Upload failed");
                } catch { alert("Upload failed"); }
              }}
            />
          </label>
        </div>

        {formData.image_url && (
          <div style={{ marginTop:8, position:"relative", display:"inline-block" }}>
            <img
              src={formData.image_url}
              alt="preview"
              style={{ width:80, height:80, objectFit:"cover", borderRadius:10, border:`1px solid ${C.border}` }}
              onError={e => e.target.style.display="none"}
            />
            <button
              type="button"
              onClick={() => setFormData(p => ({ ...p, image_url: "" }))}
              style={{ position:"absolute", top:-6, right:-6, width:18, height:18, borderRadius:"50%", border:"none", background:C.red, color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", padding:0 }}>
              <XIcon size={9}/>
            </button>
          </div>
        )}
      </div>

 <div style={{ marginBottom:13 }}>
        <label style={invLabelSt}>Brand</label>
        <div style={{ ...invInputSt, height:"auto", padding:"9px 12px", background:"#f5f5f5", color:C.muted, fontWeight:700, display:"flex", alignItems:"center" }}>
          {currentBrandName || "—"}
        </div>
      </div>

      {isAdmin ? (
        <div style={{ marginBottom:13 }}>
          <label style={invLabelSt}>Branch *</label>
          {(() => {
            const selectedBrandObjForBranch = brandList.find(b => b.name === formData.brand);
            const filteredBranches = selectedBrandObjForBranch
              ? (selectedBrandObjForBranch.branches || []).map(br => typeof br === "string" ? br : br.name)
              : [];
            return (
              <select style={{ ...invInputSt, opacity: !formData.brand ? 0.5 : 1, cursor: !formData.brand ? "not-allowed" : "pointer" }}
                value={formData.branch} required disabled={!formData.brand}
                onChange={e => setFormData(f => ({ ...f, branch: e.target.value }))}>
                <option value="">{!formData.brand ? "Select a brand first…" : "Select branch…"}</option>
                {filteredBranches.map(br => <option key={br} value={br}>{br}</option>)}
              </select>
            );
          })()}
        </div>
      ) : (
        <div style={{ marginBottom:13 }}>
          <label style={invLabelSt}>Branch</label>
          <div style={{ ...invInputSt, height:"auto", padding:"9px 12px", background:"#f5f5f5", color:C.muted, fontWeight:700, display:"flex", alignItems:"center" }}>{userBranch||"—"}</div>
        </div>
      )}

      <div style={{ marginBottom:13 }}>
        <label style={invLabelSt}>Category</label>
        <CategorySelect
          value={formData.category}
          onChange={val=>setFormData(p=>({...p,category:val}))}
          categories={formCategories}
          onAddCategory={cat=>setFormCategories(prev=>prev.includes(cat)?prev:[...prev,cat])}
        />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:13 }}>
        <div>
          <label style={invLabelSt}>Product Cost (₱)</label>
          <input type="number" name="cost" value={formData.cost} readOnly style={{ ...invInputSt, background:"#f5f5f5", color:C.muted }}/>
        </div>
        <div>
          <label style={invLabelSt}>Profit Markup (%)</label>
          <input type="number" value={DEFAULT_PROFIT_MARGIN} readOnly disabled style={{ ...invInputSt, background:"#f5f5f5", color:C.muted, cursor:"not-allowed" }}/>
        </div>
      </div>
      {formData.cost !== "" && parseFloat(formData.cost) > 0 && (
        <div style={{ background:C.greenLt, border:`1px solid ${C.greenMid}`, borderRadius:9, padding:"9px 13px", marginBottom:13, fontSize:12, display:"flex", gap:8, alignItems:"center", color:C.ok }}>
          Cost: <strong>{fmtPeso(formData.cost)}</strong> + <strong>{DEFAULT_PROFIT_MARGIN}%</strong> = Selling price: <strong style={{ color:C.green, fontSize:13 }}>{fmtPeso(formData.price)}</strong>
        </div>
      )}
    <div style={{ marginBottom:13 }}>
      <label style={invLabelSt}>Selling Price (₱)</label>
      <input type="number" name="price" value={formData.price} onChange={handleInputChange} step="0.01" min="0" style={invInputSt} placeholder="Auto-calc"/>
    </div>
      <div style={{ marginBottom:13 }}>
        <label style={invLabelSt}>Ingredients</label>
        {renderIngredientPicker()}
      </div>
      <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:8, paddingTop:14, borderTop:`1px solid ${C.border}` }}>
        <button type="button" disabled={saving} onClick={()=>{ setShowAddModal(false); setShowEditModal(false); setFormData(emptyForm()); setFormBrandId(""); resetIngPicker(); }} style={{ ...btnSt, opacity: saving ? 0.5 : 1, cursor: saving ? "not-allowed" : "pointer" }}>Cancel</button>
        <button type="submit" disabled={saving} style={{ ...btnPrimarySt, opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer" }}>
          {saving && <RefreshCw size={13} style={{ animation:"spin 0.8s linear infinite" }}/>}
          {saving ? (showEditModal ? "Saving…" : "Adding…") : "Save Item"}
        </button>
      </div>
    </>
  );
}; 

  const selectedBrandObj = brandList.find(b => b.id === filterBrand) || null;
  const anyFilter = filterBrandName||filterCategory||filterStatus||searchQuery;
  const clearAll  = () => { setFilterBrandName(""); setFilterCategory(""); setFilterStatus(""); setSearchQuery(""); };

const goBackToBrands = () => {
  setActiveScreen("brands");
  setFilterBrand(null);
  setFilterBrandName("");
  setBranchFilter("");
};

const openBrand = brandId => {
  const brandObj = brandList.find(b => b.id === brandId);
  setFilterBrand(brandId);
  setFilterBrandName(brandObj ? brandObj.name : "");
  setBranchFilter("");
  setActiveScreen("inventory");
};

  const fontImport = <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes toastIn { from{opacity:0;transform:translateY(-6px);} to{opacity:1;transform:translateY(0);} }
    .inv-row:hover td { background: #F6F7F1 !important; }
    .edit-btn:hover  { background: ${C.greenLt} !important; color: ${C.greenDk} !important; }
    .del-btn:hover   { background: #fef2f2 !important; color: ${C.red} !important; }
    button:not(:disabled) { transition: filter .15s ease, transform .1s ease, background .15s ease, border-color .15s ease, box-shadow .15s ease; cursor: pointer; }
    button:not(:disabled):hover { filter: brightness(0.96); }
    button:not(:disabled):active { transform: translateY(1px); }
    select, input { transition: border-color .15s ease, box-shadow .15s ease; }
    select:hover:not(:disabled), input:hover:not(:disabled) { border-color: ${C.green} !important; }
    select:focus, input:focus, textarea:focus { border-color: ${C.green} !important; box-shadow: 0 0 0 3px rgba(59,121,30,0.12); }
  `}</style>;

  const branchOptionsForCard = isAdmin && selectedBrandObj
    ? (selectedBrandObj.branches || []).map(br => typeof br === "string" ? br : br.name)
    : [];

  // ── Screen 1: Brand cards ─────────────────────────────────────────────────────
  if (activeScreen === "brands" && isAdmin) {
    return (
      <div style={{ fontFamily:FONT, color:C.ink }}>
        {fontImport}

        {loading && brandList.length === 0 ? (
          <div style={{ padding:"52px 0", textAlign:"center", color:C.muted, fontSize:14, fontWeight:700 }}>Loading brands…</div>
        ) : brandList.length === 0 ? (
          <div style={{ padding:"52px 0", textAlign:"center", color:C.muted, fontSize:13, fontStyle:"italic" }}>No brands found.</div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:14 }}>
            {brandList.map(b => {
              const branchNames = (b.branches||[]).map(br=>typeof br==="string"?br:br.name);
              const brandItems  = inventory.filter(i => (i.brand || branchToBrand[i.branch]) === b.name || (!i.brand && branchNames.includes(i.branch)));
              return (
                <BrandOverviewCard
                  key={b.id}
                  brand={b}
                  branchCount={branchNames.length}
                  itemCount={brandItems.length}
                  lowCount={brandItems.filter(i => Number(i.stock) <= Number(i.min_stock)).length}
                  onClick={() => openBrand(b.id)}
                />
              );
            })}
          </div>
        )}

        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    );
  }

  // ── Screen 2: Row-list card (scoped to selected brand for admins) ─────────────
return (
  <div style={{ fontFamily:FONT, color:C.ink }}>
    {fontImport}

    {loading ? (
      <div style={{ padding:"52px 0", textAlign:"center", color:C.muted, fontSize:14, fontWeight:700, background:C.white, borderRadius:18, border:`1px solid ${C.border}` }}>
        Loading inventory…
      </div>
    ) : (
<MenuBrandCard
  key={filterBrandName || "all"}
  brandName={filterBrandName || "All Items"}
  items={filteredItems}
  branchOptions={branchOptionsForCard}
  categories={filteredCategories}
  onEdit={openEditModal}
  onRequestDelete={setDeleteTarget}
  deletingId={deletingId}
  onQuickAdd={()=>{
    const branch = isAdmin ? "Head Office" : userBranch;
    setFormData({...emptyForm(), branch, brand: filterBrandName || ""});
    fetchStockItems(branch, filterBrandName || "");
    setFormBrandId(filterBrand ? String(filterBrand) : "");
    setShowAddModal(true);
  }}
  onBack={isAdmin ? goBackToBrands : null}
  onOpenDeleteHistory={()=>setShowDeleteHistory(true)}
  deleteHistoryCount={deleteHistory.length}
  onImportExcel={importExcel}
  excelRef={excelRef}
/>
    )}

    {deleteTarget && (
      <DeleteConfirmModal
        target={{
          name: deleteTarget.name,
          branch: deleteTarget.branch,
          ingredientCount: (deleteTarget.ingredients || []).length,
        }}
        deleting={deletingId === deleteTarget.id}
        onClose={() => { if (deletingId !== deleteTarget.id) setDeleteTarget(null); }}
        onConfirm={async () => {
          await handleDeleteItem(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
      )}

    {/* Add / Edit Modal */}
    {(showAddModal || showEditModal) && (
      <div style={{ position:"fixed", inset:0, background:"rgba(18,36,27,0.32)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}
        onClick={e=>{ if(e.target===e.currentTarget){setShowAddModal(false);setShowEditModal(false);setFormData(emptyForm());resetIngPicker();} }}>
        <div style={{ background:C.white, borderRadius:18, padding:"26px 26px 20px", width:540, maxWidth:"95vw", maxHeight:"93vh", overflowY:"auto", boxShadow:"0 12px 48px rgba(0,0,0,0.16)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <h2 style={{ margin:0, fontSize:16, fontWeight:800, color:C.ink }}>{showAddModal?"Add New Menu Item":"Edit Menu Item"}</h2>
            <button onClick={()=>{setShowAddModal(false);setShowEditModal(false);setFormData(emptyForm());setFormBrandId("");resetIngPicker();}} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, padding:4 }}><XIcon size={18}/></button>
          </div>
          <form onSubmit={showAddModal ? handleAddItem : handleEditItem}>
            {renderFormFields()}
          </form>
        </div>
      </div>
    )}

    {showDeleteHistory && (
      <InventoryDeleteHistoryPanel
        history={deleteHistory}
        onRestore={handleRestore}
        restoringId={restoringId}
        onClose={() => setShowDeleteHistory(false)}
      />
    )}

    {showActivityLog && (
      <InventoryActivityLogPanel
        log={activityLog}
        onClose={() => setShowActivityLog(false)}
      />
    )}

     <Toast toast={toast} onClose={() => setToast(null)} />
  </div>
);
}