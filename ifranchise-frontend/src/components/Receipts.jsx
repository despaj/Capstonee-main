import { useEffect, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import ReceiptPrintTemplate from "./ReceiptPrintTemplate";

const API = process.env.REACT_APP_API_URL;

const C = {
  green:"#00897b", greenDk:"#00695c", greenLt:"#e8f5e9", greenMid:"#c8e6c9",
  teal:"#00c853", ink:"#0d2b1e", muted:"#5a7a65", border:"#d1eedd",
  bg:"#f0fdf5", white:"#ffffff", warn:"#e65100", warnBg:"#fff3e0",
  ok:"#2e7d32", okBg:"#e8f5e9",
};

const RECENT_DAYS = 7;
function isRecent(receipt) {
  if (!receipt.created_at) return false;
  const diff = Date.now() - new Date(receipt.created_at).getTime();
  return diff < RECENT_DAYS * 24 * 60 * 60 * 1000;
}

function toDateStr(val) {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function normalizeDesc(desc) {
  return (desc ?? "").toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}
function resolveItemName(item) {
  return item.description ?? item.name ?? item.item_name ?? item.item ?? item.title ?? "";
}
function resolveLineItems(receipt) {
  return receipt?.lineItems ?? receipt?.line_items ?? receipt?.items ?? receipt?.products ?? [];
}

function findDuplicateItemsInReceipt(lineItems) {
  const items = Array.isArray(lineItems) ? lineItems : resolveLineItems(lineItems);
  if (!items?.length) return [];
  const groups = {};
  items.forEach((item, idx) => {
    const rawName = resolveItemName(item);
    const nd = normalizeDesc(rawName);
    if (!nd) return;
    if (!groups[nd]) groups[nd] = { description: rawName || "Item", normalizedDesc: nd, indices: [], items: [] };
    groups[nd].indices.push(idx);
    groups[nd].items.push(item);
  });
  return Object.values(groups).filter(g => g.indices.length > 1);
}

// ── Get current user from localStorage ──────────────────────────────────────
function getCurrentUser() {
  try {
    return JSON.parse(
      localStorage.getItem("rememberedUser") ||
      localStorage.getItem("user") ||
      "{}"
    );
  } catch { return {}; }
}

export default function Receipts() {
  const [receipts, setReceipts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [dateFrom, setDateFrom]   = useState("");
  const [dateTo, setDateTo]       = useState("");
  const [editOpen, setEditOpen]   = useState(false);
  const [editData, setEditData]   = useState(null);
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState("");
  const [leftPage, setLeftPage]   = useState(1);

  const [selectMode,    setSelectMode]    = useState(false);
  const [selectedIds,   setSelectedIds]   = useState(new Set());
  const [itemDuplicates,    setItemDuplicates]    = useState([]);
  const [showItemDupModal,  setShowItemDupModal]  = useState(false);
const [filterBrand,  setFilterBrand]  = useState(null);
const [filterBranch, setFilterBranch] = useState(null);

  // ── Current user info ──────────────────────────────────────────────────────
  const currentUser   = getCurrentUser();
  const userId        = currentUser?.id;
  const userRole      = currentUser?.role;
  const userBranch    = currentUser?.branch;
  const userBrand     = currentUser?.brand;

  // Roles that see only their own branch
  const isBranchScoped = ["Staff", "Manager", "Franchisee"].includes(userRole);
  const isPrivileged   = ["Administrator", "Franchisor"].includes(userRole);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/receipts`, {
        params: { user_id: userId }
      });
      setReceipts(res.data);
    } catch (err) {
      console.error("Failed to fetch receipts", err);
    } finally {
      setLoading(false);
    }
  };

  const brandsFromReceipts = useMemo(() => {
  const map = {};
  receipts.forEach(r => {
    if (!r.brand) return;
    if (!map[r.brand]) map[r.brand] = { id: r.brand, name: r.brand, branches: [] };
    if (r.branch && !map[r.brand].branches.includes(r.branch)) {
      map[r.brand].branches.push(r.branch);
    }
  });
  return Object.values(map);
}, [receipts]);

  const [printReceipts, setPrintReceipts] = useState([]);

  const fetchDetail = async (id) => {
    if (selectMode) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      });
      return;
    }
    try {
      const res = await axios.get(`${API}/receipts/${id}`);
      const receipt = res.data;
      setSelected(receipt);
      const dupItems = findDuplicateItemsInReceipt(resolveLineItems(receipt));
      if (dupItems.length > 0) { setItemDuplicates(dupItems); setShowItemDupModal(true); }
      else setItemDuplicates([]);
    } catch (err) {
      console.error("Failed to fetch receipt detail", err);
    }
  };

  useEffect(() => { fetchReceipts(); }, []);

const filtered = useMemo(() => {
  const q = search.trim().toLowerCase();
  return receipts.filter(r => {
    const rDate = toDateStr(r.date);
    if (dateFrom && rDate < dateFrom) return false;
    if (dateTo   && rDate > dateTo)   return false;
    if (filterBranch) {
      if (r.branch !== filterBranch) return false;
    } else if (filterBrand) {
      if (r.brand !== filterBrand) return false;
    }
    if (q) {
      const merchant = (r.merchant || "").toLowerCase();
      const total    = String(r.total_amount || "");
      const date     = (r.date || "").toLowerCase();
      const branch   = (r.branch || "").toLowerCase();
      const brand    = (r.brand || "").toLowerCase();
      if (!merchant.includes(q) && !total.includes(q) && !date.includes(q) && !branch.includes(q) && !brand.includes(q)) return false;
    }
    return true;
  });
}, [receipts, dateFrom, dateTo, search, filterBrand, filterBranch]);

  const recentReceipts = useMemo(() => filtered.filter(isRecent), [filtered]);
  const allReceipts    = useMemo(() => filtered, [filtered]);
  const activeList     = leftPage === 1 ? recentReceipts : allReceipts;

  const grouped = useMemo(() => activeList.reduce((acc, r) => {
    const key = toDateStr(r.date) || "No Date";
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {}), [activeList]);

  const grandTotal   = filtered.reduce((sum, r) => sum + parseFloat(r.total_amount || 0), 0);
  const receiptCount = filtered.length;

  // ── Branch summary (for privileged users) ─────────────────────────────────
  const branchSummary = useMemo(() => {
    if (!isPrivileged) return [];
    const map = {};
    filtered.forEach(r => {
      const key = r.branch || "Unassigned";
      if (!map[key]) map[key] = { branch: key, brand: r.brand || "—", count: 0, total: 0 };
      map[key].count++;
      map[key].total += parseFloat(r.total_amount || 0);
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filtered, isPrivileged]);

  const toggleSelectMode = () => {
    setSelectMode(v => !v);
    setSelectedIds(new Set());
  };

  const selectAll    = () => setSelectedIds(new Set(activeList.map(r => r.id)));
  const clearSelection = () => setSelectedIds(new Set());

  const openEdit = () => {
    if (!selected) return;
    setEditData({
      merchant:      selected.merchant      || "",
      date:          selected.date          || "",
      currency:      selected.currency      || "PHP",
      total_amount:  selected.total_amount  || 0,
      vat:           selected.vat           || 0,
      reference_no:  selected.reference_no  || "",
      lineItems:     (selected.lineItems || []).map(i => ({ ...i })),
    });
    setEditOpen(true);
  };
  const closeEdit = () => { setEditOpen(false); setEditData(null); };

  const updateField = (field, value) => setEditData(prev => ({ ...prev, [field]: value }));
  const updateItem  = (idx, field, value) => setEditData(prev => ({
    ...prev,
    lineItems: prev.lineItems.map((item, i) => i === idx ? { ...item, [field]: value } : item),
  }));
  const addItem    = () => setEditData(prev => ({ ...prev, lineItems: [...prev.lineItems, { description: "", quantity: 1, unit_price: 0, total_price: 0 }] }));
  const removeItem = (idx) => setEditData(prev => ({ ...prev, lineItems: prev.lineItems.filter((_, i) => i !== idx) }));

  const saveEdit = async () => {
    setSaving(true);
    try {
      const payload = {
        merchant:     editData.merchant,
        date:         editData.date,
        currency:     editData.currency,
        total_amount: parseFloat(editData.total_amount),
        lineItems:    editData.lineItems.map(i => ({
          description: i.description,
          quantity:    parseInt(i.quantity)    || 0,
          unit_price:  parseFloat(i.unit_price)  || 0,
          total_price: parseFloat(i.total_price) || 0,
        })),
      };
      const res     = await axios.put(`${API}/receipts/${selected.id}`, payload);
      const updated = res.data;
      setSelected(updated);
      setReceipts(prev => prev.map(r => r.id === selected.id
        ? { ...r, merchant: updated.merchant, date: updated.date, total_amount: updated.total_amount, currency: updated.currency }
        : r
      ));
      const dupItems = findDuplicateItemsInReceipt(resolveLineItems(updated));
      if (dupItems.length > 0) { setItemDuplicates(dupItems); setShowItemDupModal(true); }
      else setItemDuplicates([]);
      closeEdit();
    } catch (err) {
      console.error("Failed to save receipt", err);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const deleteReceipt = async (id) => {
    if (!window.confirm("Delete this receipt?")) return;
    try {
      await axios.delete(`${API}/receipts/${id}`);
      setReceipts(prev => prev.filter(r => r.id !== id));
      if (selected?.id === id) { setSelected(null); setItemDuplicates([]); }
      setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    } catch { alert("Failed to delete receipt."); }
  };

  const handleDismissItemDups = () => setShowItemDupModal(false);

  const saveLineItemsToDb = async (updatedItems) => {
    if (!selected) return;
    try {
      await axios.put(`${API}/receipts/${selected.id}`, {
        merchant:     selected.merchant,
        date:         selected.date,
        currency:     selected.currency,
        total_amount: selected.total_amount,
        lineItems:    updatedItems.map(i => ({
          description: i.description,
          quantity:    parseInt(i.quantity)    || 0,
          unit_price:  parseFloat(i.unit_price)  || 0,
          total_price: parseFloat(i.total_price) || 0,
        })),
      });
    } catch (err) {
      console.error("Failed to save after duplicate resolution:", err);
      alert("Changes could not be saved to the database.");
    }
  };

  const printRef = useRef(null);

  // ── needed for BrandBranchFilter ──────────────────────────────────────────────
const invInputSt = {
  height:36, padding:"0 11px", borderRadius:9,
  border:`1px solid ${C.border}`, background:C.bg,
  fontSize:13, color:C.ink, outline:"none",
  fontFamily:"inherit", boxSizing:"border-box", width:"100%",
};

const FilterIcon  = ({ size=12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const ChevronIcon = ({ size=12, dir="down" }) => { const d={down:"m6 9 6 6 6-6",up:"m18 15-6-6-6 6"}; return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={d[dir]}/></svg>; };
const StoreIcon   = ({ size=14, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;

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
  const branchList       = selectedBrand ? (selectedBrand.branches || []).map(br => typeof br === "string" ? br : br.name) : [];
  const filteredBrands   = brands.filter(b => !brandQ || b.name.toLowerCase().includes(brandQ.toLowerCase()));
  const filteredBranches = branchList.filter(br => !branchQ || br.toLowerCase().includes(branchQ.toLowerCase()));

  const dropSt = { position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:300, background:C.white, border:`1px solid ${C.border}`, borderRadius:11, boxShadow:"0 8px 28px rgba(0,0,0,0.10)", maxHeight:230, overflowY:"auto" };
  const optSt  = active => ({ padding:"9px 14px", cursor:"pointer", fontSize:13, color:active?C.greenDk:C.ink, fontWeight:active?700:500, background:active?C.greenLt:"transparent", display:"flex", alignItems:"center", gap:8 });

  return (
    <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
      <div ref={brandRef} style={{ position:"relative", minWidth:180 }}>
        <div onClick={() => { setOpenB(v => !v); setBrandQ(""); }}
          style={{ ...invInputSt, display:"flex", alignItems:"center", gap:7, cursor:"pointer", paddingRight:30, userSelect:"none", color:activeBrand?C.ink:C.muted }}>
          <FilterIcon/>
          <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:13 }}>
            {selectedBrand ? selectedBrand.name : "All Brands"}
          </span>
          <ChevronIcon dir={openB ? "up" : "down"} style={{ position:"absolute", right:10 }}/>
        </div>
        {openB && (
          <div style={dropSt}>
            <div style={{ padding:"7px 9px", borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, background:C.white }}>
              <input autoFocus type="text" value={brandQ} onChange={e => setBrandQ(e.target.value)}
                placeholder="Search brand…" onClick={e => e.stopPropagation()}
                style={{ ...invInputSt, height:30, fontSize:12 }}/>
            </div>
            <div style={optSt(!activeBrand)} onMouseDown={() => { onChangeBrand(null); onChangeBranch(null); setBrandQ(""); setOpenB(false); }}>
              All Brands
            </div>
            {filteredBrands.map(b => (
              <div key={b.id} style={optSt(activeBrand === b.id)}
                onMouseDown={() => { onChangeBrand(b.id); onChangeBranch(null); setBrandQ(""); setOpenB(false); }}>
                {b.name}
                <span style={{ marginLeft:"auto", fontSize:11, color:C.muted }}>{(b.branches || []).length} branches</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div ref={branchRef} style={{ position:"relative", minWidth:190, opacity:activeBrand ? 1 : 0.45 }}>
        <div onClick={() => { if (activeBrand) { setOpenBr(v => !v); setBranchQ(""); } }}
          style={{ ...invInputSt, display:"flex", alignItems:"center", gap:7, cursor:activeBrand?"pointer":"not-allowed", paddingRight:30, userSelect:"none", color:activeBranch?C.ink:C.muted }}>
          <StoreIcon size={12} color={activeBrand ? C.green : C.muted}/>
          <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:13 }}>
            {activeBranch || (activeBrand ? "All Branches" : "Select brand first")}
          </span>
        </div>
        {openBr && activeBrand && (
          <div style={dropSt}>
            <div style={{ padding:"7px 9px", borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, background:C.white }}>
              <input autoFocus type="text" value={branchQ} onChange={e => setBranchQ(e.target.value)}
                placeholder="Search branch…" style={{ ...invInputSt, height:30, fontSize:12 }}/>
            </div>
            <div style={optSt(!activeBranch)} onMouseDown={() => { onChangeBranch(null); setOpenBr(false); }}>
              All Branches
            </div>
            {filteredBranches.map(br => (
              <div key={br} style={optSt(activeBranch === br)}
                onMouseDown={() => { onChangeBranch(br); setOpenBr(false); }}>
                <StoreIcon size={11} color={C.green}/> {br}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

  const handlePrint = async (receiptsToprint) => {
    if (receiptsToprint.length === 0) { alert("No receipts to print."); return; }
    const full = await Promise.all(
      receiptsToprint.map(async r => {
        if (r.lineItems) return r;
        try {
          const res = await axios.get(`${API}/receipts/${r.id}`);
          return res.data;
        } catch { return r; }
      })
    );
    setPrintReceipts(full);
    setTimeout(() => {
      const el = printRef.current;
      if (!el) return;
      el.setAttribute("data-print", "true");
      el.style.display = "block";
      document.body.appendChild(el);
      const img = el.querySelector("img");
      if (img && !img.complete) {
        img.onload = () => {
          window.print();
          el.style.display = "none";
          el.removeAttribute("data-print");
        };
      } else {
        window.print();
        el.style.display = "none";
        el.removeAttribute("data-print");
      }
    }, 300);
  };

  const fmtReceiptDate = (val) => {
    const d = toDateStr(val);
    if (!d) return "N/A";
    return new Date(d + "T00:00:00").toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
  };
  const fmtScannedDate = (val) => {
    if (!val) return "N/A";
    return new Date(val).toLocaleString("en-PH", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        .receipt-card:hover { box-shadow: 0 4px 16px rgba(0,140,60,0.13) !important; transform: translateY(-1px); }
        .receipt-card { transition: box-shadow .15s, transform .15s; }
        .page-tab { transition: background .15s, color .15s, box-shadow .15s; }
        .page-tab:hover { background: #e8f5e9 !important; }
        .search-input:focus { border-color: #00897b !important; box-shadow: 0 0 0 3px rgba(0,137,123,0.12) !important; outline: none; }
        .item-dup-row { animation: fadein .2s ease; }
        .select-checkbox { cursor:pointer; accent-color:#00897b; width:16px; height:16px; flex-shrink:0; }
        .export-btn:hover { opacity:0.88; transform:translateY(-1px); }
        .export-btn { transition: opacity .15s, transform .15s; }
        @keyframes fadein { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
      `}</style>

      {/* ── Duplicate items modal ── */}
      {showItemDupModal && itemDuplicates.length > 0 && createPortal(
        <div style={s.modalOverlay} onClick={handleDismissItemDups}>
          <div style={{ ...s.modalBox, maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div style={{ ...s.modalHeader, background: "linear-gradient(135deg,#c62828,#e53935)" }}>
              <span style={s.modalTitle}>⚠ Duplicate Items Detected</span>
              <button style={s.modalClose} onClick={handleDismissItemDups}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={s.modalBody}>
              <p style={{ margin: "0 0 14px", fontSize: 13, color: C.muted }}>
                {itemDuplicates.length === 1 ? "1 item appears more than once." : `${itemDuplicates.length} items appear more than once.`} This may be a scanning error.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {itemDuplicates.map((group, idx) => (
                  <div key={idx} className="item-dup-row" style={s.itemDupRow}>
                    <div style={s.itemDupIcon}>⚠</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={s.itemDupName}>{group.description}</div>
                      <div style={s.itemDupMeta}>{group.items[0]?.quantity ? `${group.items[0].quantity} × ${group.items[0].unit_price ?? "—"}` : group.items[0]?.total_price ?? "—"}</div>
                      <div style={s.itemDupBadge}>Listed {group.indices.length}× on this receipt</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ ...s.modalFooter, justifyContent: "stretch", gap: 8 }}>
              <button style={{ ...s.saveBtn, background: "linear-gradient(135deg,#1565c0,#1976d2)", flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13 }}
                onClick={() => {
                  const items = [...resolveLineItems(selected)];
                  const indicesToRemove = new Set();
                  itemDuplicates.forEach(group => {
                    const totalQty   = group.items.reduce((sum, it) => sum + (parseFloat(it.quantity) || 1), 0);
                    const totalPrice = group.items.reduce((sum, it) => sum + (parseFloat(it.total_price ?? it.totalPrice ?? it.price) || 0), 0);
                    items[group.indices[0]] = { ...items[group.indices[0]], quantity: totalQty, total_price: totalPrice };
                    group.indices.slice(1).forEach(i => indicesToRemove.add(i));
                  });
                  const merged = items.filter((_, i) => !indicesToRemove.has(i));
                  setSelected(prev => ({ ...prev, lineItems: merged, line_items: merged, items: merged }));
                  setItemDuplicates([]); handleDismissItemDups(); saveLineItemsToDb(merged);
                }}>Merge</button>
              <button style={{ ...s.saveBtn, background: "linear-gradient(135deg,#c62828,#e53935)", flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13 }}
                onClick={() => {
                  const items = [...resolveLineItems(selected)];
                  const indicesToRemove = new Set();
                  itemDuplicates.forEach(group => group.indices.slice(1).forEach(i => indicesToRemove.add(i)));
                  const kept = items.filter((_, i) => !indicesToRemove.has(i));
                  setSelected(prev => ({ ...prev, lineItems: kept, line_items: kept, items: kept }));
                  setItemDuplicates([]); handleDismissItemDups(); saveLineItemsToDb(kept);
                }}>Delete Duplicates</button>
              <button style={{ ...s.saveBtn, background: "linear-gradient(135deg,#5a7a65,#3d5a47)", flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13 }}
                onClick={handleDismissItemDups}>Keep All</button>
            </div>
          </div>
        </div>,
        document.body
      )}

  

      {/* Summary Cards */}
      <div style={s.summaryRow}>
        {[
          { label: "Total Receipts",  value: receiptCount, accent: C.green },
          { label: "Grand Total",     value: `PHP ${grandTotal.toFixed(2)}`, accent: C.teal },
          { label: "Date Range",
            value: filtered.length > 0
              ? `${new Date(toDateStr(filtered[filtered.length-1].date) + "T00:00:00").toLocaleDateString("en-PH",{month:"short",day:"numeric"})} → ${new Date(toDateStr(filtered[0].date) + "T00:00:00").toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric"})}`
              : "—",
            accent: "#1565c0" },
          ...(isBranchScoped
            ? [{ label: "Branch", value: userBranch || "—", accent: C.greenDk }]
            : []
          ),
          ...(selectMode ? [{ label: "Selected for Print", value: selectedIds.size, accent: C.warn }] : []),
        ].map((card, i) => (
          <div key={i} style={s.summaryCard}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: card.accent, marginBottom: 5 }}>{card.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, lineHeight: 1.15 }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Branch breakdown table — privileged users only */}
      {/* {isPrivileged && branchSummary.length > 0 && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 20px", marginBottom: 18, boxShadow: "0 1px 6px rgba(0,140,60,0.05)" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            Branch Breakdown
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {["Brand", "Branch", "Receipts", "Total Amount"].map(h => (
                    <th key={h} style={{ padding: "7px 12px", textAlign: "left", fontWeight: 800, fontSize: 10.5, color: C.white, background: `linear-gradient(135deg,${C.teal},${C.green})`, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {branchSummary.map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.white : C.bg }}>
                    <td style={{ padding: "9px 12px", color: C.ink, fontWeight: 600 }}>{row.brand}</td>
                    <td style={{ padding: "9px 12px", color: C.ink, fontWeight: 700 }}>{row.branch}</td>
                    <td style={{ padding: "9px 12px", color: C.muted }}>{row.count}</td>
                    <td style={{ padding: "9px 12px", color: C.greenDk, fontWeight: 800 }}>PHP {row.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )} */}

      {/* Date Filter */}
<div style={s.filterRow}>
  <span style={s.filterLabel}>Filter by receipt date:</span>
  <input type="date" style={s.dateInput} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
  <span style={s.filterLabel}>to</span>
  <input type="date" style={s.dateInput} value={dateTo} onChange={e => setDateTo(e.target.value)} />
  {(dateFrom || dateTo) && (
    <button style={s.clearBtn} onClick={() => { setDateFrom(""); setDateTo(""); }}>✕ Clear</button>
  )}

  {/* Brand / Branch — same component as inventory */}
  <BrandBranchFilter
    brands={brandsFromReceipts}
    activeBrand={filterBrand}
    activeBranch={filterBranch}
    onChangeBrand={id => { setFilterBrand(id); setFilterBranch(null); }}
    onChangeBranch={val => setFilterBranch(val)}
  />

  {(filterBrand || filterBranch) && (
    <button style={s.clearBtn} onClick={() => { setFilterBrand(null); setFilterBranch(null); }}>
      ✕ Brand/Branch
    </button>
  )}
</div>

      {loading ? (
        <div style={{ padding: "52px 0", textAlign: "center", color: C.muted, fontSize: 14, fontWeight: 700 }}>Loading receipts…</div>
      ) : (
        <div style={s.layout}>

          {/* ── LEFT PANEL ── */}
          <div style={s.leftPanel}>
            <div style={s.searchWrap}>
              <svg style={s.searchIcon} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input className="search-input" style={s.searchInput} type="text" placeholder="Search merchant, branch, brand…" value={search} onChange={e => setSearch(e.target.value)} />
              {search && (
                <button style={s.searchClear} onClick={() => setSearch("")}>
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>

            <div style={s.tabBar}>
              {[{ num: 1, label: "Recent", count: recentReceipts.length }, { num: 2, label: "All", count: allReceipts.length }].map(tab => {
                const active = leftPage === tab.num;
                return (
                  <button key={tab.num} className="page-tab"
                    style={{ ...s.tab, background: active ? `linear-gradient(135deg,${C.teal},${C.green})` : C.white, color: active ? C.white : C.muted, boxShadow: active ? "0 2px 10px rgba(0,180,90,0.22)" : "none", border: active ? "none" : `1px solid ${C.border}` }}
                    onClick={() => setLeftPage(tab.num)}>
                    <span style={{ fontWeight: 800, fontSize: 12 }}>{tab.label}</span>
                    <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, background: active ? "rgba(255,255,255,0.25)" : C.greenLt, color: active ? C.white : C.greenDk, padding: "1px 7px", borderRadius: 99 }}>{tab.count}</span>
                  </button>
                );
              })}
            </div>

            <div style={s.pageLabel}>
              <span style={s.pageLabelDot} />
              <span>{leftPage === 1 ? `Recently scanned — last ${RECENT_DAYS} days` : "All receipts"}</span>
            </div>

            <div style={s.list}>
              {Object.keys(grouped).length === 0 && (
                <div style={s.emptyState}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.border} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <p style={{ color: C.muted, fontStyle: "italic", fontSize: 12, margin: "8px 0 0" }}>{leftPage === 1 ? "No recent receipts." : "No receipts found."}</p>
                </div>
              )}
              {Object.keys(grouped).sort((a, b) => b.localeCompare(a)).map(dateKey => {
                const dayTotal = grouped[dateKey].reduce((sum, r) => sum + parseFloat(r.total_amount || 0), 0);
                return (
                  <div key={dateKey}>
                    <div style={s.groupHeader}>
                      <span style={s.groupDate}>
                        {dateKey === "No Date" ? "No Date" : new Date(dateKey + "T00:00:00").toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}
                      </span>
                      <span style={s.groupTotal}>PHP {dayTotal.toFixed(2)}</span>
                    </div>
                    {grouped[dateKey].map(r => {
                      const isChecked = selectedIds.has(r.id);
                      return (
                        <div key={r.id} className="receipt-card"
                          style={{
                            ...s.card,
                            borderLeft: isChecked
                              ? `4px solid ${C.teal}`
                              : selected?.id === r.id && !selectMode
                                ? `4px solid ${C.green}`
                                : `4px solid transparent`,
                            background: isChecked ? "#e0fdf4" : selected?.id === r.id && !selectMode ? "#f0fdf9" : C.white,
                            outline: isChecked ? `1.5px solid ${C.teal}` : "none",
                          }}
                          onClick={() => fetchDetail(r.id)}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                              {selectMode && (
                                <input
                                  type="checkbox"
                                  className="select-checkbox"
                                  checked={isChecked}
                                  onChange={() => fetchDetail(r.id)}
                                  onClick={e => e.stopPropagation()}
                                />
                              )}
                              <p style={{ ...s.cardMerchant, margin: 0 }}>{r.merchant || "Unknown Merchant"}</p>
                            </div>
                            {isRecent(r) && leftPage === 2 && <span style={s.recentBadge}>New</span>}
                            {isChecked && <span style={{ fontSize: 9, fontWeight: 800, background: C.teal, color: "#fff", borderRadius: 99, padding: "2px 7px", letterSpacing: "0.05em", flexShrink: 0, marginLeft: 6 }}>✓</span>}
                          </div>
                          <p style={s.cardTotal}>{r.currency || "PHP"} {Number(r.total_amount).toFixed(2)}</p>
                          <div style={s.cardDates}>
                            <span style={s.cardDateLabel}>Receipt date:</span>
                            <span style={s.cardDateVal}>{r.date ? new Date(toDateStr(r.date) + "T00:00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}</span>
                          </div>
                          <div style={s.cardDates}>
                            <span style={s.cardDateLabel}>Date scanned:</span>
                            <span style={s.cardDateVal}>{r.created_at ? new Date(r.created_at).toLocaleString("en-PH", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A"}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div style={s.detail}>
            {selectMode ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 300, gap: 16 }}>
                <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg,rgba(0,200,83,0.12),rgba(0,137,123,0.08))", display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px dashed ${C.border}` }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: C.ink, marginBottom: 6 }}>
                    {selectedIds.size === 0 ? "No receipts selected" : `${selectedIds.size} receipt${selectedIds.size !== 1 ? "s" : ""} selected`}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, maxWidth: 260, lineHeight: 1.6 }}>
                    {selectedIds.size === 0
                      ? "Tap receipts on the left to select them for print."
                      : "Click Print below to download selected receipts."}
                  </div>
                </div>
                {selectedIds.size > 0 && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                    <button style={{ ...s.toolBtn, color: C.muted, borderColor: C.border }} onClick={clearSelection}>Clear Selection</button>
                    <button style={{ ...s.toolBtn, color: C.green, borderColor: C.border }} onClick={selectAll}>Select All ({activeList.length})</button>
                    <button
                      className="export-btn"
                      style={{ ...s.toolBtn, background: "linear-gradient(135deg,#00c853,#00897b)", color: "#fff", border: "none", fontWeight: 800, paddingLeft: 20, paddingRight: 20 }}
                      onClick={async () => {
                        const sel = await Promise.all(
                          [...selectedIds].map(async id => {
                            try { const res = await axios.get(`${API}/receipts/${id}`); return res.data; }
                            catch { return receipts.find(r => r.id === id) || null; }
                          })
                        );
                        handlePrint(sel.filter(Boolean));
                      }}
                      disabled={selectedIds.size === 0}
                    >
                      🖨 Print {selectedIds.size} Receipt{selectedIds.size !== 1 ? "s" : ""} →
                    </button>
                  </div>
                )}
              </div>
            ) : !selected ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 300 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={C.border} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                <p style={{ color: C.muted, fontStyle: "italic", fontSize: 13, marginTop: 12 }}>Select a receipt to view details.</p>
              </div>
            ) : (
              <>
                <div style={s.detailHeader}>
                  <div>
                    <h3 style={s.detailMerchant}>{selected.merchant || "Unknown"}</h3>
                    <div style={s.detailMetaRow}>
                      <div style={s.detailMetaRow}>
                        {selected.brand && (
                          <>
                            <span style={s.detailMetaChip}>
                              <strong>Brand:</strong>&nbsp;{selected.brand}
                            </span>
                            <span style={s.detailMetaSep}>·</span>
                          </>
                        )}
                        {selected.branch && (
                          <>
                            <span style={s.detailMetaChip}>
                              <strong>Branch:</strong>&nbsp;{selected.branch}
                            </span>
                            <span style={s.detailMetaSep}>·</span>
                          </>
                        )}
                        <span style={s.detailMetaChip}>
                          <strong>Receipt date:</strong>&nbsp;{fmtReceiptDate(selected.date)}
                        </span>
                        <span style={s.detailMetaSep}>·</span>
                        <span style={s.detailMetaChip}>
                          <strong>Date scanned:</strong>&nbsp;{fmtScannedDate(selected.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={s.totalBadge}>
                      <p style={{ margin: 0, fontSize: 11, color: C.muted }}>Total</p>
                      <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 800, color: C.greenDk }}>{selected.currency} {Number(selected.total_amount).toFixed(2)}</p>
                    </div>
                    <button style={{ ...s.editBtn, background: C.greenLt, borderColor: C.border, color: C.greenDk }}
                      onClick={() => handlePrint([selected])}>
                      🖨 Print
                    </button>
                    <button style={s.editBtn} onClick={openEdit}>
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 5 }}>
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit
                    </button>
                    <button style={s.deleteBtn} onClick={() => deleteReceipt(selected.id)}>
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 5 }}>
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
                {itemDuplicates.length > 0 && (
                  <div style={s.itemDupBanner}>
                    <span style={{ fontSize: 15, marginRight: 8 }}>⚠</span>
                    <span style={{ flex: 1, fontSize: 12, color: "#7b3800" }}>
                      <strong>{itemDuplicates.length} duplicate {itemDuplicates.length === 1 ? "item" : "items"}</strong> detected on this receipt.
                    </span>
                    <button style={s.itemDupBannerClose} onClick={() => setItemDuplicates([])}>✕</button>
                  </div>
                )}
                <table style={s.table}>
                  <thead>
                    <tr>{["Item","Qty","Unit Price","Total"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {resolveLineItems(selected).length > 0
                      ? (() => {
                          const dupIndexSet = new Set(itemDuplicates.flatMap(g => g.indices));
                          return resolveLineItems(selected).map((item, i) => {
                            const isDup = dupIndexSet.has(i);
                            return (
                              <tr key={i} style={{ borderBottom: "1px solid #f2faf5", background: isDup ? "#fff8e1" : i % 2 === 0 ? C.white : C.bg }}
                                onMouseEnter={e => e.currentTarget.style.background = isDup ? "#fff3cd" : "#fafffe"}
                                onMouseLeave={e => e.currentTarget.style.background = isDup ? "#fff8e1" : i % 2 === 0 ? C.white : C.bg}>
                                <td style={s.td}>{isDup && <span style={{ color: "#e65100", marginRight: 5, fontWeight: 700 }}>⚠</span>}{item.description}</td>
                                <td style={s.tdCenter}>{Math.trunc(item.quantity)}</td>
                                <td style={s.tdRight}>{Number(item.unit_price).toFixed(2)}</td>
                                <td style={s.tdRight}>{Number(item.total_price).toFixed(2)}</td>
                              </tr>
                            );
                          });
                        })()
                      : <tr><td colSpan={4} style={{ textAlign: "center", padding: 16, color: C.muted, fontStyle: "italic", fontSize: 13 }}>No line items</td></tr>
                    }
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: `2px solid ${C.border}` }}>
                      <td colSpan={3} style={s.totalLabel}>TOTAL</td>
                      <td style={s.totalValue}>{selected.currency} {Number(selected.total_amount).toFixed(2)}</td>
                    </tr>
                    {selected.vat != null && Number(selected.vat) > 0 && (
                      <tr>
                        <td colSpan={4} style={{ ...s.totalLabel, textAlign: "left", paddingLeft: 12, color: C.muted, fontWeight: 600 }}>
                          VAT: <span style={{ color: C.greenDk, fontWeight: 800 }}>{selected.currency} {Number(selected.vat).toFixed(2)}</span>
                        </td>
                      </tr>
                    )}
                    {selected.reference_no && (
                      <tr>
                        <td colSpan={4} style={{ ...s.totalLabel, textAlign: "left", paddingLeft: 12, color: C.muted, fontWeight: 600 }}>
                          OR / REF #: <span style={{ color: C.greenDk, fontWeight: 800 }}>{selected.reference_no}</span>
                        </td>
                      </tr>
                    )}
                  </tfoot>
                </table>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {editOpen && editData && createPortal(
        <div style={s.modalOverlay} onClick={closeEdit}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <span style={s.modalTitle}>Edit Receipt</span>
              <button style={s.modalClose} onClick={closeEdit}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={s.modalBody}>
              {/* Show brand/branch as read-only in edit modal */}
              {(selected?.brand || selected?.branch) && (
                <div style={{ display: "flex", gap: 10, marginBottom: 16, padding: "10px 14px", background: C.greenLt, borderRadius: 10, border: `1px solid ${C.greenMid}` }}>
                  {selected?.brand && <span style={{ fontSize: 12, color: C.greenDk, fontWeight: 700 }}>🏷 {selected.brand}</span>}
                  {selected?.branch && <span style={{ fontSize: 12, color: C.greenDk, fontWeight: 700 }}>📍 {selected.branch}</span>}
                  <span style={{ fontSize: 11, color: C.muted, marginLeft: "auto" }}>Brand &amp; branch are auto-assigned</span>
                </div>
              )}
              <div style={s.fieldGrid}>
                {[
                  { label: "Merchant",     field: "merchant",     type: "text"   },
                  { label: "Date",         field: "date",         type: "date"   },
                  { label: "Currency",     field: "currency",     type: "text"   },
                  { label: "Total Amount", field: "total_amount", type: "number" },
                  { label: "VAT",          field: "vat",          type: "number" },
                  { label: "OR / Ref #",   field: "reference_no", type: "text"   },
                ].map(({ label, field, type }) => (
                  <div key={field} style={s.fieldGroup}>
                    <label style={s.fieldLabel}>{label}</label>
                    <input style={s.fieldInput} type={type} value={editData[field]} onChange={e => updateField(field, e.target.value)} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>Line Items</span>
                  <button style={s.addItemBtn} onClick={addItem}>+ Add Item</button>
                </div>
                <table style={{ ...s.table, tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: "40%" }}/><col style={{ width: "12%" }}/><col style={{ width: "18%" }}/><col style={{ width: "18%" }}/><col style={{ width: "12%" }}/>
                  </colgroup>
                  <thead>
                    <tr>{["Item","Qty","Unit Price","Total",""].map((h,i) => <th key={i} style={s.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {editData.lineItems.map((item, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f2faf5", background: i%2===0 ? C.white : C.bg }}>
                        <td style={s.td}><input style={s.inlineInput} value={item.description} onChange={e => updateItem(i,"description",e.target.value)}/></td>
                        <td style={s.tdCenter}><input style={{...s.inlineInput,textAlign:"center"}} type="number" step="1" min="0" value={Math.trunc(item.quantity)} onChange={e => updateItem(i,"quantity",parseInt(e.target.value)||0)}/></td>
                        <td style={s.tdRight}><input style={{...s.inlineInput,textAlign:"right"}} type="number" value={item.unit_price} onChange={e => updateItem(i,"unit_price",e.target.value)}/></td>
                        <td style={s.tdRight}><input style={{...s.inlineInput,textAlign:"right"}} type="number" value={item.total_price} onChange={e => updateItem(i,"total_price",e.target.value)}/></td>
                        <td style={{...s.tdCenter,padding:"6px 4px"}}>
                          <button style={s.removeItemBtn} onClick={() => removeItem(i)}>
                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.cancelBtn} onClick={closeEdit}>Cancel</button>
              <button style={s.saveBtn} onClick={saveEdit} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ReceiptPrintTemplate ref={printRef} receipts={printReceipts} />
    </div>
  );
}

const s = {
  page:         { padding: "24px 30px 48px", fontFamily: "'Montserrat', sans-serif", background: "linear-gradient(140deg,#e8f5e9 0%,#f0faf4 45%,#e0f2f1 100%)", minHeight: "100vh" },
  summaryRow:   { display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" },
  summaryCard:  { flex: 1, minWidth: 140, background: "#ffffff", border: "1px solid rgba(0,168,76,0.13)", borderRadius: 14, padding: "14px 18px", boxShadow: "0 1px 6px rgba(0,140,60,0.05)" },
  filterRow:    { display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap", background: "#ffffff", border: "1px solid rgba(0,168,76,0.13)", borderRadius: 12, padding: "12px 16px", boxShadow: "0 1px 6px rgba(0,140,60,0.05)" },
  filterLabel:  { fontSize: 12, color: "#5a7a65", fontWeight: 600 },
  dateInput:    { border: "1px solid #d1eedd", borderRadius: 9, padding: "7px 11px", fontSize: 13, background: "#f0fdf5", color: "#0d2b1e", outline: "none", fontFamily: "inherit" },
  clearBtn:     { background: "#ffebee", color: "#c62828", border: "none", borderRadius: 7, padding: "6px 13px", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit" },
  layout:       { display: "flex", gap: 20 },
  leftPanel:    { width: 300, flexShrink: 0, display: "flex", flexDirection: "column", gap: 0 },
  searchWrap:   { position: "relative", marginBottom: 12 },
  searchIcon:   { position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, pointerEvents: "none" },
  searchInput:  { width: "100%", boxSizing: "border-box", paddingLeft: 34, paddingRight: 32, height: 38, border: "1.5px solid #d1eedd", borderRadius: 11, background: "#ffffff", fontSize: 12, color: "#0d2b1e", fontFamily: "inherit", transition: "border-color .15s, box-shadow .15s" },
  searchClear:  { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#5a7a65", display: "flex", alignItems: "center", padding: 2 },
  tabBar:       { display: "flex", gap: 8, marginBottom: 10 },
  tab:          { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", height: 36, borderRadius: 10, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.02em" },
  pageLabel:    { display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, color: "#5a7a65", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, paddingLeft: 2 },
  pageLabelDot: { width: 6, height: 6, borderRadius: "50%", background: "#00c853", flexShrink: 0 },
  list:         { display: "flex", flexDirection: "column", gap: 0, overflowY: "auto", maxHeight: "calc(100vh - 340px)" },
  emptyState:   { display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0" },
  groupHeader:  { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 4px 4px", marginTop: 8 },
  groupDate:    { fontSize: 10, fontWeight: 800, color: "#00695c", textTransform: "uppercase", letterSpacing: "0.07em" },
  groupTotal:   { fontSize: 11, fontWeight: 700, color: "#5a7a65" },
  card:         { background: "#ffffff", padding: "10px 14px", borderRadius: 10, cursor: "pointer", boxShadow: "0 1px 4px rgba(0,140,60,0.07)", marginBottom: 5 },
  cardMerchant: { fontWeight: 700, margin: 0, color: "#0d2b1e", fontSize: 13 },
  cardTotal:    { margin: "3px 0 0", fontWeight: 700, color: "#00897b", fontSize: 13 },
  cardChip:     { fontSize: 10, fontWeight: 600, color: "#00695c", background: "#e8f5e9", border: "1px solid #c8e6c9", borderRadius: 6, padding: "2px 7px" },
  cardDates:    { display: "flex", alignItems: "center", gap: 4, marginTop: 3 },
  cardDateLabel:{ fontSize: 10, fontWeight: 700, color: "#5a7a65", flexShrink: 0 },
  cardDateVal:  { fontSize: 10, color: "#0d2b1e" },
  recentBadge:  { fontSize: 9, fontWeight: 800, background: "linear-gradient(135deg,#00c853,#00897b)", color: "#fff", borderRadius: 99, padding: "2px 7px", letterSpacing: "0.05em", flexShrink: 0, marginLeft: 6 },
  contextChip:  { fontSize: 12, fontWeight: 600, color: "#00695c", background: "#e8f5e9", border: "1px solid #c8e6c9", borderRadius: 8, padding: "4px 10px" },
  detail:       { flex: 1, background: "#ffffff", borderRadius: 16, padding: 24, boxShadow: "0 2px 18px rgba(0,140,60,0.07)", border: "1px solid rgba(0,168,76,0.12)" },
  detailHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  detailMerchant:{ margin: 0, color: "#0d2b1e", fontSize: 18, fontWeight: 800 },
  detailMetaRow:{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, marginTop: 6 },
  detailMetaChip:{ display: "inline-flex", alignItems: "center", fontSize: 12, color: "#5a7a65", background: "#f0fdf5", border: "1px solid #d1eedd", borderRadius: 7, padding: "3px 9px" },
  detailMetaSep:{ fontSize: 12, color: "#d1eedd", fontWeight: 700 },
  totalBadge:   { background: "#e8f5e9", border: "1px solid #c8e6c9", borderRadius: 10, padding: "10px 16px", textAlign: "right" },
  itemDupBanner:{ display: "flex", alignItems: "center", gap: 8, background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 10, padding: "10px 14px", marginBottom: 14 },
  itemDupBannerClose:{ background: "none", border: "none", cursor: "pointer", color: "#9e5800", fontWeight: 700, fontSize: 13, padding: "0 2px", lineHeight: 1 },
  itemDupRow:   { display: "flex", alignItems: "flex-start", gap: 12, background: "#ffebee", border: "1px solid #ffcdd2", borderRadius: 10, padding: "12px 14px" },
  itemDupIcon:  { fontSize: 18, color: "#c62828", flexShrink: 0, marginTop: 1 },
  itemDupName:  { fontSize: 13, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.4 },
  itemDupMeta:  { fontSize: 11, color: "#555", marginTop: 2 },
  itemDupBadge: { fontSize: 11, color: "#c62828", fontWeight: 700, marginTop: 4 },
  table:        { width: "100%", borderCollapse: "collapse" },
  th:           { padding: "9px 12px", textAlign: "left", fontWeight: 800, fontSize: 11, color: "#ffffff", letterSpacing: "0.07em", textTransform: "uppercase", background: "linear-gradient(135deg,#00c853,#00897b)" },
  td:           { padding: "10px 12px", fontSize: 13, color: "#0d2b1e" },
  tdCenter:     { padding: "10px 12px", fontSize: 13, textAlign: "center", color: "#0d2b1e" },
  tdRight:      { padding: "10px 12px", fontSize: 13, textAlign: "right", color: "#0d2b1e" },
  totalLabel:   { padding: 12, fontWeight: 800, textAlign: "right", color: "#00695c", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.07em" },
  totalValue:   { padding: 12, fontWeight: 800, textAlign: "right", fontSize: 15, color: "#00897b" },
  editBtn:      { display: "inline-flex", alignItems: "center", height: 32, padding: "0 14px", borderRadius: 8, border: "1px solid #d1eedd", background: "#ffffff", color: "#00897b", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  deleteBtn:    { display: "inline-flex", alignItems: "center", height: 32, padding: "0 14px", borderRadius: 8, border: "1px solid #ffcdd2", background: "#ffffff", color: "#e53935", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  toolBtn:      { display: "inline-flex", alignItems: "center", height: 34, padding: "0 14px", borderRadius: 9, border: "1.5px solid #d1eedd", background: "#ffffff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.32)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalBox:     { background: "#ffffff", borderRadius: 20, width: "90%", maxWidth: 700, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 10px 48px rgba(0,0,0,.18)" },
  modalHeader:  { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", background: "linear-gradient(135deg,#00c853,#00897b)", borderRadius: "20px 20px 0 0" },
  modalTitle:   { fontSize: 16, fontWeight: 800, color: "#ffffff" },
  modalClose:   { background: "none", border: "none", cursor: "pointer", color: "#ffffff", padding: 4, display: "flex", alignItems: "center" },
  modalBody:    { padding: "20px 24px" },
  modalFooter:  { display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 24px", borderTop: "1px solid #d1eedd" },
  fieldGrid:    { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  fieldGroup:   { display: "flex", flexDirection: "column", gap: 5 },
  fieldLabel:   { fontSize: 11, fontWeight: 800, color: "#5a7a65", textTransform: "uppercase", letterSpacing: "0.07em" },
  fieldInput:   { height: 36, padding: "0 11px", borderRadius: 9, border: "1px solid #d1eedd", background: "#f0fdf5", fontSize: 13, color: "#0d2b1e", outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  inlineInput:  { width: "100%", border: "1px solid #d1eedd", borderRadius: 7, padding: "5px 8px", fontSize: 12, outline: "none", boxSizing: "border-box", background: "#f0fdf5", color: "#0d2b1e", fontFamily: "inherit" },
  addItemBtn:   { fontSize: 12, fontWeight: 700, color: "#00695c", background: "#e8f5e9", border: "1px solid #c8e6c9", borderRadius: 7, padding: "5px 13px", cursor: "pointer", fontFamily: "inherit" },
  removeItemBtn:{ background: "none", border: "none", color: "#e53935", cursor: "pointer", padding: 3, display: "flex", alignItems: "center", justifyContent: "center" },
  cancelBtn:    { height: 36, padding: "0 20px", borderRadius: 9, border: "1px solid #d1eedd", background: "#ffffff", color: "#5a7a65", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  saveBtn:      { height: 36, padding: "0 24px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#00c853,#00897b)", color: "#ffffff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 10px rgba(0,180,90,0.28)" },
};