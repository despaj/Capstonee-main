import { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;

const C = {
  green:"#00897b", greenDk:"#00695c", greenLt:"#e8f5e9", greenMid:"#c8e6c9",
  teal:"#00c853", ink:"#0d2b1e", muted:"#5a7a65", border:"#d1eedd",
  bg:"#f0fdf5", white:"#ffffff", warn:"#e65100", warnBg:"#fff3e0",
  ok:"#2e7d32", okBg:"#e8f5e9",
};

export default function Receipts() {
  const [receipts, setReceipts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [dateFrom, setDateFrom]   = useState("");
  const [dateTo, setDateTo]       = useState("");
  const [editOpen, setEditOpen]   = useState(false);
  const [editData, setEditData]   = useState(null);
  const [saving, setSaving]       = useState(false);

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
      setSelected(res.data);
    } catch (err) {
      console.error("Failed to fetch receipt detail", err);
    }
  };

  useEffect(() => { fetchReceipts(); }, []);

  const filtered = receipts.filter(r => {
    if (dateFrom && r.date < dateFrom) return false;
    if (dateTo   && r.date > dateTo)   return false;
    return true;
  });

  const grouped = filtered.reduce((acc, r) => {
    const key = r.date || "No Date";
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

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

  const updateField = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const updateItem = (idx, field, value) => {
    setEditData(prev => {
      const items = prev.lineItems.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      );
      return { ...prev, lineItems: items };
    });
  };

  const addItem = () => {
    setEditData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: "", quantity: 1, unit_price: 0, total_price: 0 }],
    }));
  };

  const removeItem = (idx) => {
    setEditData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== idx),
    }));
  };

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
      setSelected(res.data);
      setReceipts(prev => prev.map(r => r.id === selected.id
        ? { ...r, merchant: res.data.merchant, date: res.data.date, total_amount: res.data.total_amount, currency: res.data.currency }
        : r
      ));
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
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      alert("Failed to delete receipt.");
    }
  };

  return (
    <div style={s.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* Page header */}
      <div style={{ marginBottom: 22 }}>
      
        <h1 style={{ fontSize: 26, fontWeight: 600, color: C.greenDk, letterSpacing: "-0.6px", margin: 0 }}>
          Liquidation Report
        </h1>
      </div>

      {/* Summary Cards */}
      <div style={s.summaryRow}>
        {[
          { label: "Total Receipts", value: receiptCount, accent: C.green },
          { label: "Grand Total",    value: `PHP ${grandTotal.toFixed(2)}`, accent: C.teal },
          { label: "Date Range",     value: filtered.length > 0
              ? `${new Date(filtered[filtered.length-1].date).toLocaleDateString("en-PH",{month:"short",day:"numeric"})} → ${new Date(filtered[0].date).toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric"})}`
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
        <span style={s.filterLabel}>Filter by date:</span>
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

          {/* LEFT: Grouped Receipt List */}
          <div style={s.list}>
            {Object.keys(grouped).length === 0 && (
              <p style={{ color: C.muted, fontStyle: "italic", fontSize: 13 }}>No receipts found.</p>
            )}
            {Object.keys(grouped).sort((a, b) => b.localeCompare(a)).map(date => {
              const dayTotal = grouped[date].reduce((sum, r) => sum + parseFloat(r.total_amount || 0), 0);
              return (
                <div key={date}>
                  <div style={s.groupHeader}>
                    <span style={s.groupDate}>
                      {date === "No Date" ? "No Date" : new Date(date).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                    <span style={s.groupTotal}>PHP {dayTotal.toFixed(2)}</span>
                  </div>
                  {grouped[date].map(r => (
                    <div key={r.id}
                      style={{ ...s.card, borderLeft: selected?.id === r.id ? `4px solid ${C.green}` : `4px solid transparent` }}
                      onClick={() => fetchDetail(r.id)}>
                      <p style={s.cardMerchant}>{r.merchant || "Unknown Merchant"}</p>
                      <p style={s.cardTotal}>{r.currency} {Number(r.total_amount).toFixed(2)}</p>
                      <p style={s.cardTime}>
                        {new Date(r.created_at).toLocaleString("en-PH", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* RIGHT: Receipt Detail */}
          <div style={s.detail}>
            {!selected ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 300 }}>
                <p style={{ color: C.muted, fontStyle: "italic", fontSize: 13 }}>Select a receipt to view details.</p>
              </div>
            ) : (
              <>
                {/* Detail Header */}
                <div style={s.detailHeader}>
                  <div>
                    <h3 style={s.detailMerchant}>{selected.merchant || "Unknown"}</h3>
                    <p style={s.detailMeta}>
                      {selected.date ? new Date(selected.date).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }) : "N/A"}
                      &nbsp;|&nbsp;
                      {new Date(selected.created_at).toLocaleString("en-PH", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
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

                {/* Line Items Table */}
                <table style={s.table}>
                  <thead>
                    <tr>
                      {["Item","Qty","Unit Price","Total"].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selected.lineItems?.length > 0
                      ? selected.lineItems.map((item, i) => (
                          <tr key={i} style={{ borderBottom: `1px solid #f2faf5`, background: i%2===0 ? C.white : C.bg }}
                            onMouseEnter={e => e.currentTarget.style.background="#fafffe"}
                            onMouseLeave={e => e.currentTarget.style.background = i%2===0 ? C.white : C.bg}>
                            <td style={s.td}>{item.description}</td>
                            <td style={s.tdCenter}>{Math.trunc(item.quantity)}</td>
                            <td style={s.tdRight}>{Number(item.unit_price).toFixed(2)}</td>
                            <td style={s.tdRight}>{Number(item.total_price).toFixed(2)}</td>
                          </tr>
                        ))
                      : (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center", padding: 16, color: C.muted, fontStyle: "italic", fontSize: 13 }}>No line items</td>
                        </tr>
                      )
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
      {editOpen && editData && (
        <div style={s.modalOverlay} onClick={closeEdit}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div style={s.modalHeader}>
              <span style={s.modalTitle}>Edit Receipt</span>
              <button style={s.modalClose} onClick={closeEdit}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Modal Body */}
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
                    <input style={s.fieldInput} type={type} value={editData[field]}
                      onChange={e => updateField(field, e.target.value)} />
                  </div>
                ))}
              </div>

              {/* Line Items */}
              <div style={{ marginTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>Line Items</span>
                  <button style={s.addItemBtn} onClick={addItem}>+ Add Item</button>
                </div>
                <table style={{ ...s.table, tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: "40%" }} /><col style={{ width: "12%" }} />
                    <col style={{ width: "18%" }} /><col style={{ width: "18%" }} />
                    <col style={{ width: "12%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      {["Item","Qty","Unit Price","Total",""].map((h,i) => (
                        <th key={i} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {editData.lineItems.map((item, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid #f2faf5`, background: i%2===0 ? C.white : C.bg }}>
                        <td style={s.td}>
                          <input style={s.inlineInput} value={item.description} onChange={e => updateItem(i, "description", e.target.value)} />
                        </td>
                        <td style={s.tdCenter}>
                          <input style={{ ...s.inlineInput, textAlign: "center" }} type="number" step="1" min="0"
                            value={Math.trunc(item.quantity)} onChange={e => updateItem(i, "quantity", parseInt(e.target.value) || 0)} />
                        </td>
                        <td style={s.tdRight}>
                          <input style={{ ...s.inlineInput, textAlign: "right" }} type="number"
                            value={item.unit_price} onChange={e => updateItem(i, "unit_price", e.target.value)} />
                        </td>
                        <td style={s.tdRight}>
                          <input style={{ ...s.inlineInput, textAlign: "right" }} type="number"
                            value={item.total_price} onChange={e => updateItem(i, "total_price", e.target.value)} />
                        </td>
                        <td style={{ ...s.tdCenter, padding: "6px 4px" }}>
                          <button style={s.removeItemBtn} onClick={() => removeItem(i)}>
                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={s.modalFooter}>
              <button style={s.cancelBtn} onClick={closeEdit}>Cancel</button>
              <button style={s.saveBtn} onClick={saveEdit} disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page:         { padding: "24px 30px 48px", fontFamily: "'Montserrat', sans-serif", background: "linear-gradient(140deg,#e8f5e9 0%,#f0faf4 45%,#e0f2f1 100%)", minHeight: "100vh" },
  summaryRow:   { display: "flex", gap: 12, marginBottom: 18 },
  summaryCard:  { flex: 1, background: C.white, border: `1px solid rgba(0,168,76,0.13)`, borderRadius: 14, padding: "14px 18px", boxShadow: "0 1px 6px rgba(0,140,60,0.05)" },
  filterRow:    { display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap", background: C.white, border: `1px solid rgba(0,168,76,0.13)`, borderRadius: 12, padding: "12px 16px", boxShadow: "0 1px 6px rgba(0,140,60,0.05)" },
  filterLabel:  { fontSize: 12, color: C.muted, fontWeight: 600 },
  dateInput:    { border: `1px solid ${C.border}`, borderRadius: 9, padding: "7px 11px", fontSize: 13, background: C.bg, color: C.ink, outline: "none", fontFamily: "inherit" },
  clearBtn:     { background: "#ffebee", color: "#c62828", border: "none", borderRadius: 7, padding: "6px 13px", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit" },
  layout:       { display: "flex", gap: 20 },

  // Left list
  list:         { width: 290, flexShrink: 0, display: "flex", flexDirection: "column", gap: 4 },
  groupHeader:  { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 4px 4px", marginTop: 8 },
  groupDate:    { fontSize: 11, fontWeight: 800, color: C.greenDk, textTransform: "uppercase", letterSpacing: "0.06em" },
  groupTotal:   { fontSize: 12, fontWeight: 700, color: C.muted },
  card:         { background: C.white, padding: "10px 14px", borderRadius: 10, cursor: "pointer", boxShadow: "0 1px 4px rgba(0,140,60,0.07)", marginBottom: 4, transition: "box-shadow .12s" },
  cardMerchant: { fontWeight: 700, margin: 0, color: C.ink, fontSize: 13 },
  cardTotal:    { margin: "3px 0 0", fontWeight: 700, color: C.green, fontSize: 13 },
  cardTime:     { margin: "3px 0 0", fontSize: 11, color: C.muted },

  // Right detail
  detail:       { flex: 1, background: C.white, borderRadius: 16, padding: 24, boxShadow: "0 2px 18px rgba(0,140,60,0.07)", border: `1px solid rgba(0,168,76,0.12)` },
  detailHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  detailMerchant: { margin: 0, color: C.ink, fontSize: 18, fontWeight: 800 },
  detailMeta:   { margin: "4px 0 0", color: C.muted, fontSize: 12 },
  totalBadge:   { background: C.greenLt, border: `1px solid ${C.greenMid}`, borderRadius: 10, padding: "10px 16px", textAlign: "right" },

  // Table
  table:        { width: "100%", borderCollapse: "collapse" },
  th:           { padding: "9px 12px", textAlign: "left", fontWeight: 800, fontSize: 11, color: C.white, letterSpacing: "0.07em", textTransform: "uppercase", background: `linear-gradient(135deg,${C.teal},${C.green})` },
  td:           { padding: "10px 12px", fontSize: 13, color: C.ink },
  tdCenter:     { padding: "10px 12px", fontSize: 13, textAlign: "center", color: C.ink },
  tdRight:      { padding: "10px 12px", fontSize: 13, textAlign: "right", color: C.ink },
  totalLabel:   { padding: 12, fontWeight: 800, textAlign: "right", color: C.greenDk, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.07em" },
  totalValue:   { padding: 12, fontWeight: 800, textAlign: "right", fontSize: 15, color: C.green },

  // Action buttons
  editBtn: {
    display: "inline-flex", alignItems: "center", height: 32, padding: "0 14px", borderRadius: 8,
    border: `1px solid ${C.border}`, background: C.white, color: C.green,
    fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
  },
  deleteBtn: {
    display: "inline-flex", alignItems: "center", height: 32, padding: "0 14px", borderRadius: 8,
    border: "1px solid #ffcdd2", background: C.white, color: "#e53935",
    fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
  },

  // Modal
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.32)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalBox:     { background: C.white, borderRadius: 20, width: "90%", maxWidth: 700, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 10px 48px rgba(0,0,0,.18)" },
  modalHeader:  { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", background: `linear-gradient(135deg,${C.teal},${C.green})`, borderRadius: "20px 20px 0 0" },
  modalTitle:   { fontSize: 16, fontWeight: 800, color: C.white },
  modalClose:   { background: "none", border: "none", cursor: "pointer", color: C.white, padding: 4, display: "flex", alignItems: "center" },
  modalBody:    { padding: "20px 24px" },
  modalFooter:  { display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 24px", borderTop: `1px solid ${C.border}` },

  fieldGrid:    { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  fieldGroup:   { display: "flex", flexDirection: "column", gap: 5 },
  fieldLabel:   { fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em" },
  fieldInput:   { height: 36, padding: "0 11px", borderRadius: 9, border: `1px solid ${C.border}`, background: C.bg, fontSize: 13, color: C.ink, outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  inlineInput:  { width: "100%", border: `1px solid ${C.border}`, borderRadius: 7, padding: "5px 8px", fontSize: 12, outline: "none", boxSizing: "border-box", background: C.bg, color: C.ink, fontFamily: "inherit" },

  addItemBtn:   { fontSize: 12, fontWeight: 700, color: C.greenDk, background: C.greenLt, border: `1px solid ${C.greenMid}`, borderRadius: 7, padding: "5px 13px", cursor: "pointer", fontFamily: "inherit" },
  removeItemBtn:{ background: "none", border: "none", color: "#e53935", cursor: "pointer", padding: 3, display: "flex", alignItems: "center", justifyContent: "center" },

  cancelBtn:    { height: 36, padding: "0 20px", borderRadius: 9, border: `1px solid ${C.border}`, background: C.white, color: C.muted, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  saveBtn:      { height: 36, padding: "0 24px", borderRadius: 9, border: "none", background: `linear-gradient(135deg,${C.teal},${C.green})`, color: C.white, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 10px rgba(0,180,90,0.28)" },
};