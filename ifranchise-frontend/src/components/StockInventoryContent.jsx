import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import * as XLSX from "xlsx";

const C = {
  green:"#00897b", greenDk:"#00695c", greenLt:"#e8f5e9", greenMid:"#c8e6c9",
  teal:"#00c853", ink:"#0d2b1e", muted:"#5a7a65", border:"#d1eedd",
  bg:"#f0fdf5", white:"#ffffff", warn:"#e65100", warnBg:"#fff3e0",
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

const UNITS = ["pcs","kg","g","liters","ml","tbsp","tsp","cups","bottles","packs","bags","boxes","cans"];
const PAGE_SIZE = 50;

const SearchIcon  = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const EditIcon    = ({ size=12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon   = ({ size=12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const XIcon       = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const PlusIcon    = ({ size=13 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const StoreIcon   = ({ size=14, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const FileIcon    = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const SortAscIcon = ({ size=11 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>;
const SortDescIcon= ({ size=11 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>;
const FilterIcon  = ({ size=12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const ChevronIcon = ({ size=12, dir="down" }) => { const d={down:"m6 9 6 6 6-6",up:"m18 15-6-6-6 6"}; return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={d[dir]}/></svg>; };

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
          <ChevronIcon dir={openB?"up":"down"} style={{ position:"absolute", right:10 }}/>
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

export default function StockInventoryContent({ user, brands: propBrands = [] }) {
  const isAdmin    = user?.role === "Administrator";
  const userBranch = user?.branch || "";

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
  const [confirmDel, setConfirmDel] = useState(null);
  const [showModal,  setShowModal]  = useState(false);
  const [editing,    setEditing]    = useState(null);

    const excelRef = useRef(null);

  const emptyForm = useCallback(() => ({
    name:"", branch: isAdmin ? "" : userBranch, brand:"",
    unit:"pcs", stock:0, min_stock:0, cost_per_unit:"",
  }), [isAdmin, userBranch]);
  const [form, setForm] = useState(emptyForm);

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

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { setPage(0); }, [search, brand, branch, unitFilter, statusFilt]);

    const importExcel = e => {
    const file = e.target.files[0];
    const toTitleCase = str => str.replace(/\b\w/g, c => c.toUpperCase());
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      const wb    = XLSX.read(ev.target.result, { type: "array" });
      const rows_to_save = [];
      wb.SheetNames.forEach(sheetName => {
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: "" });
        rows.forEach(row => {
          const name = toTitleCase(String(row.name || row.Name || row["INGREDIENT NAME"] || "").trim());
          if (!name) return;
          rows_to_save.push({
            name,
            branch:        String(row.branch         || row.Branch         || "").trim() || "Unknown",
            brand:         String(row.brand           || row.Brand           || "").trim(),
            unit:          String(row.unit             || row.Unit             || "pcs").trim(),
            stock:         parseFloat(row.stock        || row.Stock           || 0) || 0,
            min_stock:     parseFloat(row.min_stock    || row["Min Stock"]    || 0) || 0,
            cost_per_unit: parseFloat(row.cost_per_unit|| row["Cost/Unit"]   || 0) || 0,
          });
        });
      });
      let saved = 0;
      for (const item of rows_to_save) {
        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL}/ingredients`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
          });
          const d = await res.json();
          if (d.success) saved++;
        } catch {}
      }
      e.target.value = "";
      alert(`Parsed ${rows_to_save.length} row(s). Saved ${saved}.`);
      fetchItems();
    };
    reader.readAsArrayBuffer(file);
  };

    const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...items]
      .filter(i => {
        if (q && !i.name.toLowerCase().includes(q) && !(i.branch||"").toLowerCase().includes(q)) return false;
        if (branch && i.branch !== branch) return false;
        else if (brand && !branch) {
          const b = brandList.find(x => x.id === brand);
          if (b) { const names=(b.branches||[]).map(br=>typeof br==="string"?br:br.name); if (!names.includes(i.branch)) return false; }
        }
        if (unitFilter && i.unit !== unitFilter) return false;
        if (statusFilt === "low" && i.stock >= i.min_stock) return false;
        if (statusFilt === "ok"  && i.stock <  i.min_stock) return false;
        return true;
      })
      .sort((a, b) => {
        let va = a[sort.col]??"", vb = b[sort.col]??"";
        if (typeof va==="string") va=va.toLowerCase();
        if (typeof vb==="string") vb=vb.toLowerCase();
        return sort.asc ? (va<vb?-1:va>vb?1:0) : (va>vb?-1:va<vb?1:0);
      });
  }, [items, search, brand, branch, unitFilter, statusFilt, sort, brandList]);

  const lowCount   = items.filter(i => i.stock < i.min_stock).length;
  const totalValue = items.reduce((s, i) => s + (i.cost_per_unit||0)*(i.stock||0), 0);
  const pageItems  = filtered.slice(page * PAGE_SIZE, (page+1) * PAGE_SIZE);

    const saveItem = async e => {
    e.preventDefault();
    const payload = { ...form, branch: isAdmin ? form.branch : userBranch };
    const url    = editing ? `${process.env.REACT_APP_API_URL}/ingredients/${editing.id}` : `${process.env.REACT_APP_API_URL}/ingredients`;
    const method = editing ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
      const d   = await res.json();
      if (d.success) { await fetchItems(); closeModal(); }
      else alert(d.error || "Failed to save");
    } catch { alert("Failed to save ingredient"); }
  };

  const deleteItem = async id => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/ingredients/${id}`, { method:"DELETE" });
      const d   = await res.json();
      if (d.success) { await fetchItems(); setConfirmDel(null); }
      else alert(d.error || "Failed to delete");
    } catch { alert("Failed to delete"); }
  };

  const openEdit = item => {
    setEditing(item);
    setForm({ name:item.name, branch:item.branch||"", brand:item.brand||"", unit:item.unit||"pcs", stock:item.stock, min_stock:item.min_stock, cost_per_unit:item.cost_per_unit||"" });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); setForm(emptyForm()); };

    const SortTh = ({ col, label, minW }) => {
    const active = sort.col === col;
    return (
      <th onClick={() => { setSort(s => ({ col, asc: s.col===col?!s.asc:true })); setPage(0); }}
        style={{ padding:"9px 12px", textAlign:"left", fontWeight:800, fontSize:11,
          color:active?C.green:C.muted, letterSpacing:"0.07em", textTransform:"uppercase",
          borderBottom:`1px solid ${C.border}`, cursor:"pointer", userSelect:"none",
          whiteSpace:"nowrap", background:"#f0fdf5", minWidth:minW }}>
        <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}>
          {label}
          {active ? (sort.asc ? <SortAscIcon/> : <SortDescIcon/>) : <span style={{ opacity:0.25 }}><SortDescIcon/></span>}
        </span>
      </th>
    );
  };

  return (
    <div style={{ fontFamily:"'Montserrat', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:18 }}>
        {[
          { label:"Total Ingredients", value:items.length.toLocaleString(), sub:"Registered", accent:C.green },
          { label:"Low Stock Alerts",  value:lowCount, sub:"Needs reorder", accent:"#e65100" },
          { label:"Total Stock Value", value:"₱"+Number(totalValue).toLocaleString("en-PH",{minimumFractionDigits:2,maximumFractionDigits:2}), sub:"Cost basis", accent:"#1565c0" },
        ].map((s,i) => (
          <div key={i} style={{ background:C.white, border:`1px solid rgba(0,168,76,0.13)`, borderRadius:14, padding:"14px 18px", boxShadow:"0 1px 6px rgba(0,140,60,0.05)" }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase", color:s.accent, marginBottom:5 }}>{s.label}</div>
            <div style={{ fontSize:22, fontWeight:800, color:C.ink, lineHeight:1.15 }}>{s.value}</div>
            <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Filter bar ──────────────────────────────────────────────────────── */}
      <div style={{ background:C.white, border:`1px solid rgba(0,168,76,0.13)`, borderRadius:16, padding:"14px 18px", marginBottom:18, boxShadow:"0 1px 8px rgba(0,140,60,0.05)" }}>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ position:"relative", flex:"1 1 220px", minWidth:180 }}>
            <div style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:C.muted }}><SearchIcon size={13}/></div>
            <input type="text" placeholder="Search ingredient or branch…" value={search}
              onChange={e=>setSearch(e.target.value)} style={{ ...invInputSt, paddingLeft:30 }} />
            {search && (
              <div onClick={()=>setSearch("")} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", cursor:"pointer", color:C.muted }}><XIcon size={12}/></div>
            )}
          </div>
          {isAdmin && (
            <BrandBranchFilter brands={brandList} activeBrand={brand} activeBranch={branch}
              onChangeBrand={id=>{setBrand(id);setBranch(null);}} onChangeBranch={setBranch}/>
          )}
          <select value={unitFilter} onChange={e=>setUnitFilter(e.target.value)} style={{ ...invInputSt, width:120 }}>
            <option value="">All Units</option>
            {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
          </select>
          <select value={statusFilt} onChange={e=>setStatusFilt(e.target.value)} style={{ ...invInputSt, width:130 }}>
            <option value="">All Status</option>
            <option value="low">Low Stock</option>
            <option value="ok">In Stock</option>
          </select>
          <div style={{ flex:1 }} />
          {/* ── Import Excel button ── */}
          <label style={{ ...btnSt, cursor:"pointer" }}>
            <FileIcon size={13}/> Import Excel
            <input ref={excelRef} type="file" accept=".xlsx,.xls" onChange={importExcel} style={{ display:"none" }}/>
          </label>
          <button onClick={()=>{ setEditing(null); setForm(emptyForm()); setShowModal(true); }} style={btnPrimarySt}>
            <PlusIcon/> Add Ingredient
          </button>
        </div>
      </div>

      {/* ── Table card ──────────────────────────────────────────────────────── */}
      <div style={{ background:C.white, border:`1px solid rgba(0,168,76,0.12)`, borderRadius:18, overflow:"hidden", boxShadow:"0 2px 18px rgba(0,140,60,0.07)" }}>
        <div style={{ padding:"11px 18px", background:`linear-gradient(135deg,${C.teal},${C.green})`, display:"flex", justifyContent:"space-between", alignItems:"center", color:C.white }}>
          <span style={{ fontWeight:800, fontSize:13, display:"flex", alignItems:"center", gap:7 }}>
            Stock Ingredients
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
                    <SortTh col="name"         label="Ingredient"  minW={150} />
                    <SortTh col="branch"        label="Branch"      minW={120} />
                    <SortTh col="brand"         label="Brand"       minW={100} />
                    <SortTh col="unit"          label="Unit"        minW={70}  />
                    <SortTh col="stock"         label="Stock"       minW={80}  />
                    <SortTh col="min_stock"     label="Min Stock"   minW={80}  />
                    <SortTh col="cost_per_unit" label="Cost/Unit"   minW={90}  />
                    <th style={{ padding:"9px 12px", background:"#f0fdf5", borderBottom:`1px solid ${C.border}`, minWidth:140 }} />
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map(item => {
                    const low   = item.stock < item.min_stock;
                    const isDel = confirmDel === item.id;
                    return (
                      <tr key={item.id} style={{ borderBottom:`1px solid #f2faf5` }}
                        onMouseEnter={e=>e.currentTarget.style.background="#fafffe"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{ padding:"10px 12px", fontWeight:700, color:C.ink }}>
                          <div style={{ display:"flex", alignItems:"center", gap:7 }}>{item.name}</div>
                        </td>
                        <td style={{ padding:"10px 12px", color:C.muted, fontSize:12 }}>
                          <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}>
                            <StoreIcon size={11} color={C.green}/> {item.branch}
                          </span>
                        </td>
                        <td style={{ padding:"10px 12px" }}>
                          {item.brand
                            ? <span style={{ padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:600, background:"#e0f2f1", color:"#00695c" }}>{item.brand}</span>
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
                        <td style={{ padding:"10px 12px" }}>
                          <div style={{ display:"flex", gap:5, justifyContent:"flex-end" }}>
                            <button onClick={()=>openEdit(item)} style={{ ...smallBtnSt, border:`1px solid ${C.border}`, color:C.green }}>
                              <EditIcon/> Edit
                            </button>
                            <button onClick={()=>{ if(isDel) deleteItem(item.id); else setConfirmDel(item.id); }}
                              style={{ ...smallBtnSt, border:isDel?"none":"1px solid #ffcdd2", color:isDel?C.white:"#e53935", background:isDel?"#e53935":C.white }}>
                              <TrashIcon/> {isDel?"Confirm?":"Delete"}
                            </button>
                            {isDel && <button onClick={()=>setConfirmDel(null)} style={{ ...smallBtnSt, border:`1px solid ${C.border}`, color:C.muted }}>Cancel</button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} setPage={setPage} total={filtered.length} pageSize={PAGE_SIZE}/>
          </>
        )}
      </div>

      {/* ── Modal ───────────────────────────────────────────────────────────── */}
      {showModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.32)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}
          onClick={e=>{ if(e.target===e.currentTarget) closeModal(); }}>
          <div style={{ background:C.white, borderRadius:20, padding:"26px 26px 20px", width:500, maxWidth:"95vw", maxHeight:"92vh", overflowY:"auto", boxShadow:"0 10px 48px rgba(0,0,0,.18)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ margin:0, fontSize:17, fontWeight:800, color:C.ink }}>
                {editing ? "Edit Ingredient" : "Add Stock Ingredient"}
              </h2>
              <button onClick={closeModal} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, padding:4 }}><XIcon size={18}/></button>
            </div>
            <form onSubmit={saveItem} style={{ display:"grid", gap:14 }}>
              <div>
                <label style={invLabelSt}>Ingredient Name *</label>
                <input style={invInputSt} value={form.name} onChange={e => {
                  const v = e.target.value.replace(/\b\w/g, c => c.toUpperCase());
                  setForm(f => ({ ...f, name: v })); // ← v, not e.target.value
                }}
                required placeholder="e.g. Coffee Beans" />
              </div>
              {isAdmin ? (
                <div>
                  <label style={invLabelSt}>Branch *</label>
                  <BranchSearchSelect value={form.branch} onChange={val=>setForm(f=>({...f,branch:val}))} allBranches={allBranches}/>
                </div>
              ) : (
                <div>
                  <label style={invLabelSt}>Branch</label>
                  <div style={{ ...invInputSt, height:"auto", padding:"9px 12px", background:"#f5f5f5", color:C.muted, fontWeight:700, display:"flex", alignItems:"center" }}>{userBranch||"—"}</div>
                </div>
              )}
              <div>
                <label style={invLabelSt}>Brand</label>
                <select style={invInputSt} value={form.brand} onChange={e=>setForm(f=>({...f,brand:e.target.value}))}>
                  <option value="">Select brand…</option>
                  {brandList.map(b=><option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
              </div>
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
                    onChange={e=>setForm(f=>({...f,cost_per_unit:e.target.value}))} required placeholder="0.00" />
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={invLabelSt}>Current Stock *</label>
                  <input type="number" style={invInputSt} value={form.stock} min="0"
                    onChange={e=>setForm(f=>({...f,stock:e.target.value}))} required />
                </div>
                <div>
                  <label style={invLabelSt}>Minimum Stock *</label>
                  <input type="number" style={invInputSt} value={form.min_stock} min="0"
                    onChange={e=>setForm(f=>({...f,min_stock:e.target.value}))} required />
                </div>
              </div>
              <div style={{ display:"flex", justifyContent:"flex-end", gap:8, paddingTop:14, borderTop:`1px solid ${C.border}` }}>
                <button type="button" onClick={closeModal} style={btnSt}>Cancel</button>
                <button type="submit" style={btnPrimarySt}>Save Ingredient</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}