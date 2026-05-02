import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import axios from "axios";

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
  return (desc ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
function resolveItemName(item) {
  return (
    item.description ??
    item.name ??
    item.item_name ??
    item.item ??
    item.title ??
    ""
  );
}
function resolveLineItems(receipt) {
  return (
    receipt?.lineItems ??
    receipt?.line_items ??
    receipt?.items ??
    receipt?.products ??
    []
  );
}

function findDuplicateItemsInReceipt(lineItems) {
  const items = Array.isArray(lineItems)
    ? lineItems
    : resolveLineItems(lineItems);

  if (!items?.length) return [];

  const groups = {}; 

  items.forEach((item, idx) => {
    const rawName = resolveItemName(item);
    const nd = normalizeDesc(rawName);
    if (!nd) return; 
    if (!groups[nd]) {
      groups[nd] = {
        description: rawName || "Item",
        normalizedDesc: nd,
        indices: [],
        items: [],
      };
    }
    groups[nd].indices.push(idx);
    groups[nd].items.push(item);
  });

  return Object.values(groups).filter(g => g.indices.length > 1);
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

  const [itemDuplicates, setItemDuplicates]     = useState([]);
  const [showItemDupModal, setShowItemDupModal] = useState(false);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/receipts`);
      setReceipts(res.data);
    } catch (err) {
      console.error("Failed to fetch receipts", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id) => {
    try {
      const res = await axios.get(`${API}/receipts/${id}`);
      const receipt = res.data;
      setSelected(receipt);

      const dupItems = findDuplicateItemsInReceipt(resolveLineItems(receipt));
      if (dupItems.length > 0) {
        setItemDuplicates(dupItems);
        setShowItemDupModal(true);
      } else {
        setItemDuplicates([]);
      }
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
      if (q) {
        const merchant = (r.merchant || "").toLowerCase();
        const total    = String(r.total_amount || "");
        const date     = (r.date || "").toLowerCase();
        if (!merchant.includes(q) && !total.includes(q) && !date.includes(q)) return false;
      }
      return true;
    });
  }, [receipts, dateFrom, dateTo, search]);

  const recentReceipts = useMemo(() => filtered.filter(isRecent), [filtered]);
  const allReceipts    = useMemo(() => filtered, [filtered]);

  const activeList = leftPage === 1 ? recentReceipts : allReceipts;

  const grouped = useMemo(() => activeList.reduce((acc, r) => {
    const key = toDateStr(r.date) || "No Date";
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {}), [activeList]);

  const grandTotal   = filtered.reduce((sum, r) => sum + parseFloat(r.total_amount || 0), 0);
  const receiptCount = filtered.length;

  const openEdit = () => {
    if (!selected) return;
    setEditData({
      merchant:     selected.merchant     || "",
      date:         selected.date         || "",
      currency:     selected.currency     || "PHP",
      total_amount: selected.total_amount || 0,
      lineItems:    (selected.lineItems || []).map(i => ({ ...i })),
    });
    setEditOpen(true);
  };
  const closeEdit = () => { setEditOpen(false); setEditData(null); };

  const updateField = (field, value) =>
    setEditData(prev => ({ ...prev, [field]: value }));

  const updateItem = (idx, field, value) =>
    setEditData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      ),
    }));

  const addItem = () =>
    setEditData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: "", quantity: 1, unit_price: 0, total_price: 0 }],
    }));

  const removeItem = (idx) =>
    setEditData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== idx),
    }));

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
      const res = await axios.put(`${API}/receipts/${selected.id}`, payload);
      const updated = res.data;
      setSelected(updated);
      setReceipts(prev => prev.map(r => r.id === selected.id
        ? { ...r, merchant: updated.merchant, date: updated.date, total_amount: updated.total_amount, currency: updated.currency }
        : r
      ));

      const dupItems = findDuplicateItemsInReceipt(resolveLineItems(updated));
      if (dupItems.length > 0) {
        setItemDuplicates(dupItems);
        setShowItemDupModal(true);
      } else {
        setItemDuplicates([]);
      }

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
      if (selected?.id === id) {
        setSelected(null);
        setItemDuplicates([]);
      }
    } catch (err) {
      alert("Failed to delete receipt.");
    }
  };

  const handleDismissItemDups = () => {
    setShowItemDupModal(false);
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
        @keyframes fadein { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
      `}</style>

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
              {itemDuplicates.length === 1
                ? "1 item appears more than once on this receipt."
                : `${itemDuplicates.length} items appear more than once on this receipt.`}{" "}
              This may be a scanning error — review carefully.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {itemDuplicates.map((group, idx) => (
                <div key={idx} className="item-dup-row" style={s.itemDupRow}>
                  <div style={s.itemDupIcon}>⚠</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={s.itemDupName}>{group.description}</div>
                    <div style={s.itemDupMeta}>
                      {group.items[0]?.quantity
                        ? `${group.items[0].quantity} × ${group.items[0].unit_price ?? group.items[0].unitPrice ?? group.items[0].price ?? "—"}`
                        : group.items[0]?.total_price ?? group.items[0]?.totalPrice ?? group.items[0]?.price ?? "—"}
                    </div>
                    <div style={s.itemDupBadge}>Listed {group.indices.length}× on this receipt</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
              <div style={{ ...s.modalFooter, justifyContent: "stretch", gap: 8 }}>
                {/* Merge */}
                <button
                  style={{ ...s.saveBtn, background: "linear-gradient(135deg,#1565c0,#1976d2)", flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, whiteSpace: "nowrap", fontSize: 13  }}
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
                    setItemDuplicates([]);
                    handleDismissItemDups();
                    saveLineItemsToDb(merged);
                  }}
                >
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
                      <path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
                    </svg>
                    Merge
                  </button>

                {/* Discard */}
                <button
                  style={{ ...s.saveBtn, background: "linear-gradient(135deg,#c62828,#e53935)", flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, whiteSpace: "nowrap", fontSize: 13  }}
                  onClick={() => {
                    const items = [...resolveLineItems(selected)];
                    const indicesToRemove = new Set();
                    itemDuplicates.forEach(group => {
                      group.indices.slice(1).forEach(i => indicesToRemove.add(i));
                    });
                    const kept = items.filter((_, i) => !indicesToRemove.has(i));
                    setSelected(prev => ({ ...prev, lineItems: kept, line_items: kept, items: kept }));
                    setItemDuplicates([]);
                    handleDismissItemDups();
                    saveLineItemsToDb(kept);
                  }}
                >
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                      Delete Duplicates
                    </button>

                {/* Ignore */}
                <button
                  style={{ ...s.saveBtn, background: "linear-gradient(135deg,#5a7a65,#3d5a47)", flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, whiteSpace: "nowrap", fontSize: 13 }}
                  onClick={handleDismissItemDups}
                >
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Keep All
                </button>
              </div>
              </div>
            </div>,
            document.body
          )}



      {/* Summary Cards */}
      <div style={s.summaryRow}>
        {[
          { label: "Total Receipts", value: receiptCount, accent: C.green },
          { label: "Grand Total",    value: `PHP ${grandTotal.toFixed(2)}`, accent: C.teal },
          { label: "Date Range",
            value: filtered.length > 0
              ? `${new Date(toDateStr(filtered[filtered.length-1].date) + "T00:00:00").toLocaleDateString("en-PH",{month:"short",day:"numeric"})} → ${new Date(toDateStr(filtered[0].date) + "T00:00:00").toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric"})}`
              : "—",
            accent: "#1565c0" },
        ].map((card, i) => (
          <div key={i} style={s.summaryCard}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: card.accent, marginBottom: 5 }}>{card.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, lineHeight: 1.15 }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Date Filter */}
      <div style={s.filterRow}>
        <span style={s.filterLabel}>Filter by receipt date:</span>
        <input type="date" style={s.dateInput} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <span style={s.filterLabel}>to</span>
        <input type="date" style={s.dateInput} value={dateTo}   onChange={e => setDateTo(e.target.value)} />
        {(dateFrom || dateTo) && (
          <button style={s.clearBtn} onClick={() => { setDateFrom(""); setDateTo(""); }}>✕ Clear</button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: "52px 0", textAlign: "center", color: C.muted, fontSize: 14, fontWeight: 700 }}>Loading receipts…</div>
      ) : (
        <div style={s.layout}>

          {/* ── LEFT PANEL ──────────────────────────────────────────────────── */}
          <div style={s.leftPanel}>

            {/* Search bar */}
            <div style={s.searchWrap}>
              <svg style={s.searchIcon} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="search-input"
                style={s.searchInput}
                type="text"
                placeholder="Search merchant, date, amount…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button style={s.searchClear} onClick={() => setSearch("")}>
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>

            {/* Page tabs */}
            <div style={s.tabBar}>
              {[
                { num: 1, label: "Recent", count: recentReceipts.length },
                { num: 2, label: "All",    count: allReceipts.length    },
              ].map(tab => {
                const active = leftPage === tab.num;
                return (
                  <button
                    key={tab.num}
                    className="page-tab"
                    style={{
                      ...s.tab,
                      background: active ? `linear-gradient(135deg,${C.teal},${C.green})` : C.white,
                      color:      active ? C.white : C.muted,
                      boxShadow:  active ? "0 2px 10px rgba(0,180,90,0.22)" : "none",
                      border:     active ? "none" : `1px solid ${C.border}`,
                    }}
                    onClick={() => setLeftPage(tab.num)}
                  >
                    <span style={{ fontWeight: 800, fontSize: 12 }}>{tab.label}</span>
                    <span style={{
                      marginLeft: 6,
                      fontSize: 10,
                      fontWeight: 700,
                      background: active ? "rgba(255,255,255,0.25)" : C.greenLt,
                      color:      active ? C.white : C.greenDk,
                      padding: "1px 7px",
                      borderRadius: 99,
                    }}>{tab.count}</span>
                  </button>
                );
              })}
            </div>

            {/* Page label */}
            <div style={s.pageLabel}>
              <span style={s.pageLabelDot} />
              <span>
                {leftPage === 1
                  ? `Recently scanned — last ${RECENT_DAYS} days`
                  : "All receipts"}
              </span>
            </div>

            {/* Receipt list */}
            <div style={s.list}>
              {Object.keys(grouped).length === 0 && (
                <div style={s.emptyState}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.border} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                  </svg>
                  <p style={{ color: C.muted, fontStyle: "italic", fontSize: 12, margin: "8px 0 0" }}>
                    {leftPage === 1 ? "No recent receipts." : "No receipts found."}
                  </p>
                </div>
              )}
              {Object.keys(grouped).sort((a, b) => b.localeCompare(a)).map(dateKey => {
                const dayTotal = grouped[dateKey].reduce((sum, r) => sum + parseFloat(r.total_amount || 0), 0);
                return (
                  <div key={dateKey}>
                    <div style={s.groupHeader}>
                      <span style={s.groupDate}>
                        {dateKey === "No Date"
                          ? "No Date"
                          : new Date(dateKey + "T00:00:00").toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}
                      </span>
                      <span style={s.groupTotal}>PHP {dayTotal.toFixed(2)}</span>
                    </div>
                    {grouped[dateKey].map(r => (
                      <div
                        key={r.id}
                        className="receipt-card"
                        style={{
                          ...s.card,
                          borderLeft: selected?.id === r.id ? `4px solid ${C.green}` : `4px solid transparent`,
                          background: selected?.id === r.id ? "#f0fdf9" : C.white,
                        }}
                        onClick={() => fetchDetail(r.id)}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <p style={s.cardMerchant}>{r.merchant || "Unknown Merchant"}</p>
                          {isRecent(r) && leftPage === 2 && (
                            <span style={s.recentBadge}>New</span>
                          )}
                        </div>
                        <p style={s.cardTotal}>{r.currency || "PHP"} {Number(r.total_amount).toFixed(2)}</p>
                        <div style={s.cardDates}>
                          <span style={s.cardDateLabel}>Receipt date:</span>
                          <span style={s.cardDateVal}>
                            {r.date
                              ? new Date(toDateStr(r.date) + "T00:00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
                              : "N/A"}
                          </span>
                        </div>
                        <div style={s.cardDates}>
                          <span style={s.cardDateLabel}>Date scanned:</span>
                          <span style={s.cardDateVal}>
                            {r.created_at
                              ? new Date(r.created_at).toLocaleString("en-PH", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

          </div>

          {/* ── RIGHT: Receipt Detail ────────────────────────────────────────── */}
          <div style={s.detail}>
            {!selected ? (
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
                      <span style={s.detailMetaChip}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <strong>Receipt date:</strong>&nbsp;{fmtReceiptDate(selected.date)}
                      </span>
                      <span style={s.detailMetaSep}>·</span>
                      <span style={s.detailMetaChip}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <strong>Date scanned:</strong>&nbsp;{fmtScannedDate(selected.created_at)}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={s.totalBadge}>
                      <p style={{ margin: 0, fontSize: 11, color: C.muted }}>Total</p>
                      <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 800, color: C.greenDk }}>{selected.currency} {Number(selected.total_amount).toFixed(2)}</p>
                    </div>
                    <button style={s.editBtn} onClick={openEdit}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 5 }}>
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit
                    </button>
                    <button style={s.deleteBtn} onClick={() => deleteReceipt(selected.id)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 5 }}>
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>

                {/* Inline item-duplicate warning banner */}
                {itemDuplicates.length > 0 && (
                  <div style={s.itemDupBanner}>
                    <span style={{ fontSize: 15, marginRight: 8 }}>⚠</span>
                    <span style={{ flex: 1, fontSize: 12, color: "#7b3800" }}>
                      <strong>{itemDuplicates.length} duplicate {itemDuplicates.length === 1 ? "item" : "items"}</strong> detected on this receipt.{" "}
                      Affected rows are highlighted below.
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
                          // Build a set of duplicate indices for highlight
                          const dupIndexSet = new Set(itemDuplicates.flatMap(g => g.indices));
                          return resolveLineItems(selected).map((item, i) => {
                            const isDup = dupIndexSet.has(i);
                            return (
                              <tr
                                key={i}
                                style={{
                                  borderBottom: `1px solid #f2faf5`,
                                  background: isDup ? "#fff8e1" : i % 2 === 0 ? C.white : C.bg,
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = isDup ? "#fff3cd" : "#fafffe"}
                                onMouseLeave={e => e.currentTarget.style.background = isDup ? "#fff8e1" : i % 2 === 0 ? C.white : C.bg}
                              >
                                <td style={s.td}>
                                  {isDup && <span style={{ color: "#e65100", marginRight: 5, fontWeight: 700 }}>⚠</span>}
                                  {item.description}
                                </td>
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
              <div style={s.fieldGrid}>
                {[
                  { label: "Merchant",     field: "merchant",     type: "text"   },
                  { label: "Date",         field: "date",         type: "date"   },
                  { label: "Currency",     field: "currency",     type: "text"   },
                  { label: "Total Amount", field: "total_amount", type: "number" },
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
                    <col style={{ width: "40%" }}/><col style={{ width: "12%" }}/>
                    <col style={{ width: "18%" }}/><col style={{ width: "18%" }}/>
                    <col style={{ width: "12%" }}/>
                  </colgroup>
                  <thead>
                    <tr>{["Item","Qty","Unit Price","Total",""].map((h,i) => <th key={i} style={s.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {editData.lineItems.map((item, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid #f2faf5`, background: i%2===0 ? C.white : C.bg }}>
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
    </div>
  );
}

const s = {
  page:         { padding: "24px 30px 48px", fontFamily: "'Montserrat', sans-serif", background: "linear-gradient(140deg,#e8f5e9 0%,#f0faf4 45%,#e0f2f1 100%)", minHeight: "100vh" },
  summaryRow:   { display: "flex", gap: 12, marginBottom: 18 },
  summaryCard:  { flex: 1, background: "#ffffff", border: `1px solid rgba(0,168,76,0.13)`, borderRadius: 14, padding: "14px 18px", boxShadow: "0 1px 6px rgba(0,140,60,0.05)" },
  filterRow:    { display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap", background: "#ffffff", border: `1px solid rgba(0,168,76,0.13)`, borderRadius: 12, padding: "12px 16px", boxShadow: "0 1px 6px rgba(0,140,60,0.05)" },
  filterLabel:  { fontSize: 12, color: "#5a7a65", fontWeight: 600 },
  dateInput:    { border: `1px solid #d1eedd`, borderRadius: 9, padding: "7px 11px", fontSize: 13, background: "#f0fdf5", color: "#0d2b1e", outline: "none", fontFamily: "inherit" },
  clearBtn:     { background: "#ffebee", color: "#c62828", border: "none", borderRadius: 7, padding: "6px 13px", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit" },
  layout:       { display: "flex", gap: 20 },

  leftPanel:    { width: 300, flexShrink: 0, display: "flex", flexDirection: "column", gap: 0 },

  searchWrap:   { position: "relative", marginBottom: 12 },
  searchIcon:   { position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, pointerEvents: "none" },
  searchInput:  { width: "100%", boxSizing: "border-box", paddingLeft: 34, paddingRight: 32, height: 38, border: `1.5px solid #d1eedd`, borderRadius: 11, background: "#ffffff", fontSize: 12, color: "#0d2b1e", fontFamily: "inherit", transition: "border-color .15s, box-shadow .15s" },
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
  cardDates:    { display: "flex", alignItems: "center", gap: 4, marginTop: 3 },
  cardDateLabel:{ fontSize: 10, fontWeight: 700, color: "#5a7a65", flexShrink: 0 },
  cardDateVal:  { fontSize: 10, color: "#0d2b1e" },
  recentBadge:  { fontSize: 9, fontWeight: 800, background: "linear-gradient(135deg,#00c853,#00897b)", color: "#fff", borderRadius: 99, padding: "2px 7px", letterSpacing: "0.05em", flexShrink: 0, marginLeft: 6 },

  detail:       { flex: 1, background: "#ffffff", borderRadius: 16, padding: 24, boxShadow: "0 2px 18px rgba(0,140,60,0.07)", border: `1px solid rgba(0,168,76,0.12)` },
  detailHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  detailMerchant: { margin: 0, color: "#0d2b1e", fontSize: 18, fontWeight: 800 },
  detailMetaRow:{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, marginTop: 6 },
  detailMetaChip:{ display: "inline-flex", alignItems: "center", fontSize: 12, color: "#5a7a65", background: "#f0fdf5", border: `1px solid #d1eedd`, borderRadius: 7, padding: "3px 9px" },
  detailMetaSep:{ fontSize: 12, color: "#d1eedd", fontWeight: 700 },
  totalBadge:   { background: "#e8f5e9", border: `1px solid #c8e6c9`, borderRadius: 10, padding: "10px 16px", textAlign: "right" },

  // Item duplicate styles
  itemDupBanner:{ display: "flex", alignItems: "center", gap: 8, background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 10, padding: "10px 14px", marginBottom: 14 },
  itemDupBannerClose: { background: "none", border: "none", cursor: "pointer", color: "#9e5800", fontWeight: 700, fontSize: 13, padding: "0 2px", lineHeight: 1 },
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

  editBtn:      { display: "inline-flex", alignItems: "center", height: 32, padding: "0 14px", borderRadius: 8, border: `1px solid #d1eedd`, background: "#ffffff", color: "#00897b", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  deleteBtn:    { display: "inline-flex", alignItems: "center", height: 32, padding: "0 14px", borderRadius: 8, border: "1px solid #ffcdd2", background: "#ffffff", color: "#e53935", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },

  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.32)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalBox:     { background: "#ffffff", borderRadius: 20, width: "90%", maxWidth: 700, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 10px 48px rgba(0,0,0,.18)" },
  modalHeader:  { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", background: "linear-gradient(135deg,#00c853,#00897b)", borderRadius: "20px 20px 0 0" },
  modalTitle:   { fontSize: 16, fontWeight: 800, color: "#ffffff" },
  modalClose:   { background: "none", border: "none", cursor: "pointer", color: "#ffffff", padding: 4, display: "flex", alignItems: "center" },
  modalBody:    { padding: "20px 24px" },
  modalFooter:  { display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 24px", borderTop: `1px solid #d1eedd` },

  fieldGrid:    { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  fieldGroup:   { display: "flex", flexDirection: "column", gap: 5 },
  fieldLabel:   { fontSize: 11, fontWeight: 800, color: "#5a7a65", textTransform: "uppercase", letterSpacing: "0.07em" },
  fieldInput:   { height: 36, padding: "0 11px", borderRadius: 9, border: `1px solid #d1eedd`, background: "#f0fdf5", fontSize: 13, color: "#0d2b1e", outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  inlineInput:  { width: "100%", border: `1px solid #d1eedd`, borderRadius: 7, padding: "5px 8px", fontSize: 12, outline: "none", boxSizing: "border-box", background: "#f0fdf5", color: "#0d2b1e", fontFamily: "inherit" },

  addItemBtn:   { fontSize: 12, fontWeight: 700, color: "#00695c", background: "#e8f5e9", border: `1px solid #c8e6c9`, borderRadius: 7, padding: "5px 13px", cursor: "pointer", fontFamily: "inherit" },
  removeItemBtn:{ background: "none", border: "none", color: "#e53935", cursor: "pointer", padding: 3, display: "flex", alignItems: "center", justifyContent: "center" },

  cancelBtn:    { height: 36, padding: "0 20px", borderRadius: 9, border: `1px solid #d1eedd`, background: "#ffffff", color: "#5a7a65", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  saveBtn:      { height: 36, padding: "0 24px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#00c853,#00897b)", color: "#ffffff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 10px rgba(0,180,90,0.28)" },
};