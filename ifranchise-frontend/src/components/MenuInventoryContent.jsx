import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import * as XLSX from "xlsx";

// ─── Design tokens ────────────────────────────────────────────────────────────
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

const DEFAULT_PROFIT_MARGIN = 40;
const PAGE_SIZE = 50;
const DEFAULT_CATEGORIES = ["Medicine","Vitamins","Supplements","Coffee","Sports Drink","Equipment","Personal Care","Other"];
const UNITS = ["pcs","kg","g","liters","ml","tbsp","tsp","cups","bottles","packs","bags","boxes","cans"];

const fmtPeso = n => "₱" + Number(n||0).toLocaleString("en-PH",{minimumFractionDigits:2,maximumFractionDigits:2});

// ─── Mini SVG icons ───────────────────────────────────────────────────────────
const SearchIcon  = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const EditIcon    = ({ size=12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon   = ({ size=12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const XIcon       = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const PlusIcon    = ({ size=13 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const StoreIcon   = ({ size=14, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const FileIcon    = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const TagIcon     = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const FilterIcon  = ({ size=12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const ChevronIcon = ({ size=12, dir="down" }) => { const d={down:"m6 9 6 6 6-6",up:"m18 15-6-6-6 6"}; return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={d[dir]}/></svg>; };
const SortAscIcon = () => <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>;
const SortDescIcon= () => <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>;

// ─── Chip ─────────────────────────────────────────────────────────────────────
function Chip({ label, color, bg, onRemove }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:700, color, background:bg }}>
      {label} <XIcon size={9} style={{ cursor:"pointer", marginLeft:2 }} onClick={onRemove}/>
    </span>
  );
}


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

function InventoryTable({ items, onEdit, onDelete, confirmDeleteId, setConfirmDeleteId, page, setPage }) {
  const [sort, setSort]           = useState({ col:"name", asc:true });
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
              const low        = item.stock < item.min_stock;
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
                        {item.stock} {low&&<span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:C.warn }}/>}
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

export default function MenuInventoryContent({ user, brands: propBrands = [] }) {
  const isAdmin    = user?.role === "Administrator";
  const userBranch = user?.branch || "";

  const brandList = propBrands.length > 0 ? propBrands : [];
  const allBranches = useMemo(() => {
    const out = [];
    brandList.forEach(b => (b.branches||[]).forEach(br => {
      const name = typeof br==="string"?br:br.name;
      if (!out.find(x=>x.branch===name)) out.push({ brand:b.name, branch:name });
    }));
    return out;
  }, [brandList]);

    const [inventory,       setInventory]       = useState([]);
  const [stockItems,      setStockItems]       = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [categories,      setCategories]      = useState(DEFAULT_CATEGORIES);
  const [filterBrand,     setFilterBrand]     = useState(null);
  const [filterBranch,    setFilterBranch]    = useState(null);
  const [filterCategory,  setFilterCategory]  = useState("");
  const [filterStatus,    setFilterStatus]    = useState("");
  const [searchQuery,     setSearchQuery]     = useState("");
  const [showAddModal,    setShowAddModal]    = useState(false);
  const [showEditModal,   setShowEditModal]   = useState(false);
  const [editingItem,     setEditingItem]     = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [page,            setPage]            = useState(0);

  
  const [ingSearch,   setIngSearch]   = useState("");
  const [ingQty,      setIngQty]      = useState("1");
  const [ingUnit,     setIngUnit]     = useState("");
  const [ingPicked,   setIngPicked]   = useState(null);
  const [ingDropOpen, setIngDropOpen] = useState(false);
  const ingRef = useRef(null);

  useEffect(() => {
    const fn = e => { if(ingRef.current && !ingRef.current.contains(e.target)) setIngDropOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const emptyForm = useCallback(() => ({
    name:"", category:"", branch:isAdmin?"":userBranch,
    cost:"", stock:0, minStock:0, price:"", ingredients:[],
  }), [isAdmin, userBranch]);
  const [formData, setFormData] = useState(emptyForm);

  
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

const fetchStockItems = useCallback(async (branch) => {
  try {
    const effectiveBranch = !isAdmin ? userBranch : (branch || "");
    const q = effectiveBranch ? `?branch=${encodeURIComponent(effectiveBranch)}` : "";
    const res = await fetch(`${process.env.REACT_APP_API_URL}/ingredients${q}`);
    const d   = await res.json();
    setStockItems(Array.isArray(d) ? d : []);
  } catch { setStockItems([]); }
}, [isAdmin, userBranch]);

  useEffect(() => {
    if (!isAdmin) { fetchInventory(userBranch); return; }
    fetchInventory(filterBranch||undefined);
  }, [filterBranch, isAdmin, userBranch, fetchInventory]);

  useEffect(() => { fetchStockItems(); }, [fetchStockItems]);
  useEffect(() => { setPage(0); }, [searchQuery, filterBrand, filterBranch, filterCategory, filterStatus]);

  const refetch = () => fetchInventory(isAdmin ? filterBranch||undefined : userBranch);

  
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return inventory.filter(i => {
      if (q && !i.name.toLowerCase().includes(q) && !i.category.toLowerCase().includes(q) && !i.branch.toLowerCase().includes(q)) return false;
      if (filterBranch) { if (i.branch!==filterBranch) return false; }
      else if (filterBrand) {
        const b = brandList.find(x=>x.id===filterBrand);
        if (b) { const names=(b.branches||[]).map(br=>typeof br==="string"?br:br.name); if (!names.includes(i.branch)) return false; }
      }
      if (filterCategory && i.category!==filterCategory) return false;
      if (filterStatus==="low" && i.stock>=i.min_stock) return false;
      if (filterStatus==="ok"  && i.stock< i.min_stock) return false;
      return true;
    });
  }, [inventory, searchQuery, filterBrand, filterBranch, filterCategory, filterStatus, brandList]);
  const computedCost = useMemo(() => {
  if (!formData.ingredients || formData.ingredients.length === 0) return 0;

  return formData.ingredients.reduce((total, ing) => {
    const stock = stockItems.find(s => s.id === ing.stock_item_id);
    if (!stock) return total;

    const costPerUnit = parseFloat(stock.cost_per_unit || 0);
    const qty = parseFloat(ing.qty_required || 0);

    return total + (costPerUnit * qty);
  }, 0);
}, [formData.ingredients, stockItems]);
  const lowCount   = filteredItems.filter(i => i.stock < i.min_stock).length;
  const totalValue = filteredItems.reduce((s,i) => s+(i.price||0)*(i.stock||0), 0);


const handleAddItem = async e => {
  e.preventDefault();
  const payload = { ...formData, branch:isAdmin?formData.branch:userBranch, min_stock:formData.minStock };
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory`, {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)
    });
    const d = await res.json();
    if (d.success) {
      
      if (formData.ingredients && formData.ingredients.length > 0) {
        await fetch(`${process.env.REACT_APP_API_URL}/inventory/${d.item.id}/ingredients`, {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            ingredients: formData.ingredients.map(ing => ({
              ingredient_id: ing.stock_item_id,
              quantity: ing.qty_required,
              unit: ing.unit,
            }))
          })
        });
      }
      await refetch(); setShowAddModal(false); setFormData(emptyForm()); resetIngPicker();
    } else alert(d.error||"Failed to add item");
  } catch { alert("Failed to add item"); }
};


const handleEditItem = async e => {
  e.preventDefault();
  const payload = { ...formData, branch:isAdmin?formData.branch:userBranch, min_stock:formData.minStock };
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory/${editingItem.id}`, {
      method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)
    });
    const d = await res.json();
    if (d.success) {
     
      await fetch(`${process.env.REACT_APP_API_URL}/inventory/${editingItem.id}/ingredients`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          ingredients: (formData.ingredients||[]).map(ing => ({
            ingredient_id: ing.stock_item_id,
            quantity: ing.qty_required,
            unit: ing.unit,
          }))
        })
      });
      await refetch(); setShowEditModal(false); setEditingItem(null); setFormData(emptyForm()); resetIngPicker();
    } else alert(d.error||"Failed to update item");
  } catch { alert("Failed to update item"); }
};

  const handleDeleteItem = async id => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory/${id}`, { method:"DELETE" });
      const d   = await res.json();
      if (d.success) { await refetch(); setConfirmDeleteId(null); }
      else alert(d.error||"Failed to delete");
    } catch { alert("Failed to delete"); }
  };

  const openEditModal = item => {
    setEditingItem(item);
    setFormData({
      name:item.name, category:item.category, branch:item.branch,
      cost:item.cost||"", stock:item.stock, minStock:item.min_stock, price:item.price,
     
      ingredients: (item.ingredients||[]).map(ing => ({
        stock_item_id: ing.stock_item_id,
        name:          ing.name,
        qty_required:  ing.qty_required,
        unit:          ing.unit,
      })),
    });
    fetchStockItems(item.branch);
    setShowEditModal(true);
  };

  useEffect(() => {
  const cost = computedCost.toFixed(2);

  const price =
    cost > 0
      ? (parseFloat(cost) * (1 + DEFAULT_PROFIT_MARGIN / 100)).toFixed(2)
      : "";

  setFormData(prev => ({
    ...prev,
    cost,
    price,
  }));
}, [computedCost]);

    const handleCostChange = e => {
    const cost = e.target.value;
   const price = cost !== "" ? (parseFloat(cost) * (1 + DEFAULT_PROFIT_MARGIN/100)).toFixed(2) : "";
    setFormData(p=>({...p,cost,price}));
  };
  const handleInputChange = e => { const {name,value}=e.target; setFormData(p=>({...p,[name]:value})); };

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
  const updateIngQty = (idx,qty) => setFormData(f=>({...f, ingredients:f.ingredients.map((ing,i)=>i===idx?{...ing,qty_required:parseFloat(qty)||0}:ing)}));

  const ingFiltered = stockItems.filter(s => {
  const matchesSearch =
    !ingSearch || s.name.toLowerCase().includes(ingSearch.toLowerCase());

const matchesBranch =
  formData.branch && s.branch === formData.branch;

  return matchesSearch && matchesBranch;
});


  const excelRef = useRef(null);
  
  const importExcel = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async ev => {
    const wb    = XLSX.read(ev.target.result, { type: "array" });
    const items = [];
    wb.SheetNames.forEach(sheetName => {
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: "" });
      rows.forEach(row => {
        const name = String(row.name || row.Name || row["ITEM NAME"] || "").trim();
        if (!name) return;
        const category  = String(row.category || row.Category || "Other").trim();
        const cost      = parseFloat(row.cost || row.Cost || 0) || 0;
        const rawPrice  = parseFloat(row.price || row.Price || 0) || 0;
        const price     = rawPrice > 0 ? rawPrice : (cost > 0 ? parseFloat((cost * 1.4).toFixed(2)) : 0);
        const stock     = parseInt(row.stock || row.Stock || 0) || 0;
        const minStock  = parseInt(row.min_stock || row["Min Stock"] || 0) || 0;
        const branch    = String(row.branch || row.Branch || "").trim();

        // Parse pipe-separated ingredients: "name:qty:unit|name:qty:unit"
        const rawIng    = String(row.ingredients || row.Ingredients || "").trim();
        const ingredients = rawIng
          ? rawIng.split("|").map(seg => {
              const [ingName, qty, unit] = seg.split(":").map(s => s.trim());
              return ingName ? { name: ingName, qty_required: parseFloat(qty) || 1, unit: unit || "" } : null;
            }).filter(Boolean)
          : [];

        items.push({ name, category, branch: branch || "Unknown", cost, stock, min_stock: minStock, price, ingredients });
      });
    });

    let saved = 0;
    for (const item of items) {
      try {
        const { ingredients, ...itemData } = item;
        const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(itemData)
        });
        const d = await res.json();
        if (d.success) {
          saved++;
          // Post ingredients if any
          if (ingredients.length > 0) {
            // Look up stock_item_id by name for each ingredient
            const ingPayload = ingredients.map(ing => {
              const match = stockItems.find(s =>
                s.name.toLowerCase() === ing.name.toLowerCase() && s.branch === itemData.branch
              );
              return match
                ? { ingredient_id: match.id, quantity: ing.qty_required, unit: ing.unit || match.unit }
                : null;
            }).filter(Boolean);

            if (ingPayload.length > 0) {
              await fetch(`${process.env.REACT_APP_API_URL}/inventory/${d.item.id}/ingredients`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ingredients: ingPayload })
              });
            }
          }
        }
      } catch {}
    }
    e.target.value = "";
    alert(`Parsed ${items.length} row(s). Saved ${saved}.`);
    refetch();
  };
  reader.readAsArrayBuffer(file);
};

  
  const IngredientPicker = () => (
    <div style={{ background:"#f0fdf5", border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px", marginTop:4 }}>
      <div style={{ fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>Ingredients Required</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 90px auto", gap:8, marginBottom:10 }}>
        <div ref={ingRef} style={{ position:"relative" }}>
          <input style={invInputSt} value={ingSearch}
            onChange={e=>{setIngSearch(e.target.value);setIngPicked(null);setIngDropOpen(true);}}
            onFocus={()=>setIngDropOpen(true)} placeholder="Search stock ingredient…"/>
          {ingDropOpen && ingFiltered.length > 0 && (
            <div style={{ position:"absolute", top:"calc(100% + 3px)", left:0, right:0, zIndex:500, background:C.white, border:`1px solid ${C.border}`, borderRadius:10, boxShadow:"0 6px 20px rgba(0,0,0,0.10)", maxHeight:160, overflowY:"auto" }}>
              {ingFiltered.map(s=>(
                <div key={s.id}
                  onMouseDown={e=>{e.preventDefault();setIngPicked(s);setIngSearch(s.name);setIngUnit(s.unit);setIngDropOpen(false);}}
                  onMouseEnter={e=>e.currentTarget.style.background="#f0fdf5"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                  style={{ padding:"8px 12px", cursor:"pointer", fontSize:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontWeight:600, color:C.ink }}>{s.name}</span>
                  <span style={{ fontSize:11, color:C.muted, background:"#dcfce7", padding:"2px 8px", borderRadius:20 }}>{s.unit} · {s.branch}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <input type="number" style={invInputSt} value={ingQty} min="0" step="any"
          onChange={e=>setIngQty(e.target.value)} placeholder="Qty"/>
        <select style={invInputSt} value={ingUnit} onChange={e=>setIngUnit(e.target.value)}>
          <option value="">unit</option>
          {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
        </select>
        <button type="button" onClick={addIngredient} style={{ ...btnPrimarySt, height:36, padding:"0 14px", flexShrink:0 }}>
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
              <span style={{ fontSize:11, color:C.muted, background:"#f0fdf5", padding:"3px 8px", borderRadius:20, textAlign:"center" }}>{ing.unit}</span>
              <button type="button" onClick={()=>removeIngredient(idx)}
                style={{ ...smallBtnSt, height:28, width:28, justifyContent:"center", border:"1px solid #ffcdd2", color:"#e53935", flexShrink:0 }}>
                <XIcon size={11}/>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

    const FormFields = () => (
    <>
      <div style={{ marginBottom:13 }}>
        <label style={invLabelSt}>Item Name</label>
        <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={invInputSt} placeholder="Product name"/>
      </div>
      <div style={{ marginBottom:13 }}>
        <label style={invLabelSt}>Category</label>
        <CategorySelect value={formData.category} onChange={val=>setFormData(p=>({...p,category:val}))} categories={categories} onAddCategory={cat=>setCategories(prev=>prev.includes(cat)?prev:[...prev,cat])}/>
      </div>
      {isAdmin ? (
        <div style={{ marginBottom:13 }}>
          <label style={invLabelSt}>Branch</label>
          <BranchSearchSelect value={formData.branch} onChange={val=>setFormData(p=>({...p,branch:val}))} allBranches={allBranches}/>
        </div>
      ) : (
        <div style={{ marginBottom:13 }}>
          <label style={invLabelSt}>Branch</label>
          <div style={{ ...invInputSt, height:"auto", padding:"9px 12px", background:"#f5f5f5", color:C.muted, fontWeight:700, display:"flex", alignItems:"center" }}>{userBranch||"—"}</div>
        </div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:13 }}>
        <div>
          <label style={invLabelSt}>Product Cost (₱)</label>
         <input
  type="number"
  name="cost"
  value={formData.cost}
  readOnly
  style={{ ...invInputSt, background:"#f5f5f5", color:C.muted }}
/>
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
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:13 }}>
        <div><label style={invLabelSt}>Stock Qty</label><input type="number" name="stock"    value={formData.stock}    onChange={handleInputChange} min="0" style={invInputSt}/></div>
        <div><label style={invLabelSt}>Min Stock</label><input type="number" name="minStock" value={formData.minStock} onChange={handleInputChange} min="0" style={invInputSt}/></div>
        <div><label style={invLabelSt}>Selling Price (₱)</label><input type="number" name="price" value={formData.price} onChange={handleInputChange} step="0.01" min="0" style={invInputSt} placeholder="Auto-calc"/></div>
      </div>
      <div style={{ marginBottom:13 }}>
        <label style={invLabelSt}>Ingredients</label>
        <IngredientPicker/>
      </div>
      <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:8, paddingTop:14, borderTop:`1px solid ${C.border}` }}>
        <button type="button" onClick={()=>{ setShowAddModal(false); setShowEditModal(false); setFormData(emptyForm()); resetIngPicker(); }} style={btnSt}>Cancel</button>
        <button type="submit" style={btnPrimarySt}>Save Item</button>
      </div>
    </>
  );

  const anyFilter = filterBrand||filterBranch||filterCategory||filterStatus||searchQuery;
  const clearAll  = () => { setFilterBrand(null); setFilterBranch(null); setFilterCategory(""); setFilterStatus(""); setSearchQuery(""); };

  return (
    <div style={{ fontFamily:"'Montserrat', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* ── Filter bar ──────────────────────────────────────────────────────── */}
      <div style={{ background:C.white, border:`1px solid rgba(0,168,76,0.13)`, borderRadius:16, padding:"14px 18px", marginBottom:18, boxShadow:"0 1px 8px rgba(0,140,60,0.05)" }}>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ position:"relative", flex:"1 1 220px", minWidth:180 }}>
            <div style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:C.muted }}><SearchIcon size={13}/></div>
            <input type="text" placeholder="Search name, category, branch…" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} style={{ ...invInputSt, paddingLeft:30 }}/>
            {searchQuery && <div onClick={()=>setSearchQuery("")} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", cursor:"pointer", color:C.muted }}><XIcon size={12}/></div>}
          </div>
          {isAdmin && <BrandBranchFilter brands={brandList} activeBrand={filterBrand} activeBranch={filterBranch} onChangeBrand={id=>{setFilterBrand(id);setFilterBranch(null);}} onChangeBranch={setFilterBranch}/>}
          <select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} style={{ ...invInputSt, width:150 }}>
            <option value="">All Categories</option>
            {categories.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ ...invInputSt, width:130 }}>
            <option value="">All Status</option>
            <option value="low">Low Stock</option>
            <option value="ok">In Stock</option>
          </select>
          <div style={{ flex:1 }}/>
          <label style={{ ...btnSt, cursor:"pointer" }}>
            <FileIcon size={13}/> Import Excel
            <input ref={excelRef} type="file" accept=".xlsx,.xls" onChange={importExcel} style={{ display:"none" }}/>
          </label>
          <button onClick={()=>{ 
  const branch = isAdmin ? (filterBranch||"") : userBranch;
  setFormData({...emptyForm(), branch}); 
  fetchStockItems(branch);
  setShowAddModal(true); 
}} style={btnPrimarySt}>
  <PlusIcon/> Add New Item
</button>
        </div>
        {anyFilter && (
          <div style={{ display:"flex", alignItems:"center", gap:7, marginTop:10, paddingTop:10, borderTop:`1px solid ${C.border}`, flexWrap:"wrap" }}>
            <span style={{ fontSize:11, color:C.muted, fontWeight:600 }}>Active:</span>
            {searchQuery    && <Chip label={`"${searchQuery}"`}                                               color="#3949ab" bg="#e8eaf6" onRemove={()=>setSearchQuery("")}/>}
            {filterBrand && !filterBranch && <Chip label={brandList.find(b=>b.id===filterBrand)?.name}       color={C.greenDk} bg={C.greenLt} onRemove={()=>{setFilterBrand(null);setFilterBranch(null);}}/>}
            {filterBranch   && <Chip label={filterBranch}                                                     color="#00695c" bg="#e0f7fa" onRemove={()=>setFilterBranch(null)}/>}
            {filterCategory && <Chip label={filterCategory}                                                   color="#00695c" bg="#e0f2f1" onRemove={()=>setFilterCategory("")}/>}
            {filterStatus   && <Chip label={filterStatus==="low"?"Low Stock":"In Stock"} color={filterStatus==="low"?C.warn:C.ok} bg={filterStatus==="low"?C.warnBg:C.okBg} onRemove={()=>setFilterStatus("")}/>}
            <button onClick={clearAll} style={{ ...smallBtnSt, height:24, border:`1px solid ${C.border}`, fontSize:11, color:C.muted, marginLeft:"auto" }}>Clear all</button>
          </div>
        )}
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:18 }}>
        {[
          { label:"Showing",    value:filteredItems.length.toLocaleString(), sub:`of ${inventory.length.toLocaleString()} total`, accent:C.green },
          { label:"Low Stock",  value:lowCount,                              sub:"Needs reorder",   accent:C.warn },
          { label:"Est. Value", value:fmtPeso(totalValue),                  sub:"Filtered selection", accent:C.green },
          { label:"Categories", value:categories.length,                    sub:"Product types",   accent:"#1565c0" },
        ].map((s,i)=>(
          <div key={i} style={{ background:C.white, border:`1px solid rgba(0,168,76,0.13)`, borderRadius:14, padding:"14px 18px", boxShadow:"0 1px 6px rgba(0,140,60,0.05)" }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase", color:s.accent, marginBottom:5 }}>{s.label}</div>
            <div style={{ fontSize:22, fontWeight:800, color:C.ink, lineHeight:1.15 }}>{s.value}</div>
            <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div style={{ background:C.white, border:`1px solid rgba(0,168,76,0.12)`, borderRadius:18, overflow:"hidden", boxShadow:"0 2px 18px rgba(0,140,60,0.07)" }}>
        <div style={{ padding:"11px 18px", background:`linear-gradient(135deg,${C.teal},${C.green})`, display:"flex", justifyContent:"space-between", alignItems:"center", color:C.white }}>
          <span style={{ fontWeight:800, fontSize:13, display:"flex", alignItems:"center", gap:7 }}><StoreIcon size={14} color="#fff"/> Menu Inventory</span>
          <span style={{ fontSize:12, opacity:0.9 }}>{filteredItems.length.toLocaleString()} items – {lowCount} low stock</span>
        </div>
        {loading ? (
          <div style={{ padding:"52px 0", textAlign:"center", color:C.muted, fontSize:14, fontWeight:700 }}>Loading inventory…</div>
        ) : (
          <InventoryTable items={filteredItems} onEdit={openEditModal} onDelete={handleDeleteItem} confirmDeleteId={confirmDeleteId} setConfirmDeleteId={setConfirmDeleteId} page={page} setPage={setPage}/>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {(showAddModal || showEditModal) && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.32)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}
          onClick={e=>{ if(e.target===e.currentTarget){setShowAddModal(false);setShowEditModal(false);setFormData(emptyForm());resetIngPicker();} }}>
          <div style={{ background:C.white, borderRadius:20, padding:"26px 26px 20px", width:560, maxWidth:"95vw", maxHeight:"92vh", overflowY:"auto", boxShadow:"0 10px 48px rgba(0,0,0,.18)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ margin:0, fontSize:17, fontWeight:800, color:C.ink }}>{showAddModal?"Add New Menu Item":"Edit Menu Item"}</h2>
              <button onClick={()=>{setShowAddModal(false);setShowEditModal(false);setFormData(emptyForm());resetIngPicker();}} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, padding:4 }}><XIcon size={18}/></button>
            </div>
            <form onSubmit={showAddModal ? handleAddItem : handleEditItem}><FormFields/></form>
          </div>
        </div>
      )}
    </div>
  );
}