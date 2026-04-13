import { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;

// const GREEN        = "#1a6c2e";
// const GREEN_LIGHT  = "#e8f5e9";
// const GREEN_HEADER = "#1b5e20";

export default function Receipts() {
  const [receipts, setReceipts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(null);
  const [dateFrom, setDateFrom]     = useState("");
  const [dateTo, setDateTo]         = useState("");
  const [editOpen, setEditOpen]     = useState(false);
  const [editData, setEditData]     = useState(null);
  const [saving, setSaving]         = useState(false);

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

  // --- EDIT HANDLERS ---
  const openEdit = () => {
    if (!selected) return;
    setEditData({
      merchant:  selected.merchant  || "",
      date:      selected.date      || "",
      currency:  selected.currency  || "PHP",
      total_amount: selected.total_amount || 0,
      lineItems: (selected.lineItems || []).map(i => ({ ...i })),
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
        merchant:    editData.merchant,
        date:        editData.date,
        currency:    editData.currency,
        total_amount: parseFloat(editData.total_amount),
        lineItems:   editData.lineItems.map(i => ({
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
      <h2 style={s.title}>Liquidation Report</h2>

      {/* Summary Cards */}
      <div style={s.summaryRow}>
        <div style={s.summaryCard}>
          <p style={s.summaryLabel}>Total Receipts</p>
          <p style={s.summaryValue}>{receiptCount}</p>
        </div>
        <div style={s.summaryCard}>
          <p style={s.summaryLabel}>Grand Total</p>
          <p style={{ ...s.summaryValue, color: GREEN }}>PHP {grandTotal.toFixed(2)}</p>
        </div>
        <div style={s.summaryCard}>
          <p style={s.summaryLabel}>Date Range</p>
          <p style={s.summaryValue}>
            {filtered.length > 0
              ? `${new Date(filtered[filtered.length - 1].date).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })} → ${new Date(filtered[0].date).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}`
              : "—"}
          </p>
        </div>
      </div>

      {/* Date Filter */}
      <div style={s.filterRow}>
        <span style={s.filterLabel}>Filter by date:</span>
        <input type="date" style={s.dateInput} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <span style={s.filterLabel}>to</span>
        <input type="date" style={s.dateInput} value={dateTo} onChange={e => setDateTo(e.target.value)} />
        {(dateFrom || dateTo) && (
          <button style={s.clearBtn} onClick={() => { setDateFrom(""); setDateTo(""); }}>✕ Clear</button>
        )}
      </div>

      {loading ? <p>Loading...</p> : (
        <div style={s.layout}>

          {/* LEFT: Grouped Receipt List */}
          <div style={s.list}>
            {Object.keys(grouped).length === 0 && <p style={s.empty}>No receipts found.</p>}
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
                    <div
                      key={r.id}
                      style={{ ...s.card, borderLeft: selected?.id === r.id ? `4px solid ${GREEN}` : "4px solid transparent" }}
                      onClick={() => fetchDetail(r.id)}
                    >
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
              <div style={s.emptyDetail}>
                <p style={s.empty}>Select a receipt to view details.</p>
              </div>
            ) : (
              <>
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
                      <p style={s.totalBadgeLabel}>Total</p>
                      <p style={s.totalBadgeValue}>{selected.currency} {Number(selected.total_amount).toFixed(2)}</p>
                    </div>
                    {/* Action Buttons — matching inventory management style */}
                    <button style={s.editBtn} onClick={openEdit}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 5 }}>
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit
                    </button>
                    <button style={s.deleteBtn} onClick={() => deleteReceipt(selected.id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 5 }}>
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
                      <th style={s.th}>Item</th>
                      <th style={s.th}>Qty</th>
                      <th style={s.th}>Unit Price</th>
                      <th style={s.th}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.lineItems?.length > 0
                      ? selected.lineItems.map((item, i) => (
                          <tr key={i} style={i % 2 === 0 ? s.rowEven : s.rowOdd}>
                            <td style={s.td}>{item.description}</td>
                            <td style={s.tdCenter}>{Math.trunc (item.quantity)}</td>
                            <td style={s.tdRight}>{Number(item.unit_price).toFixed(2)}</td>
                            <td style={s.tdRight}>{Number(item.total_price).toFixed(2)}</td>
                          </tr>
                        ))
                      : (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center", padding: 16, color: "#999" }}>No line items</td>
                        </tr>
                      )
                    }
                  </tbody>
                  <tfoot>
                    <tr>
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
              <button style={s.modalClose} onClick={closeEdit}>✕</button>
            </div>

            {/* Receipt-level fields */}
            <div style={s.modalBody}>
              <div style={s.fieldGrid}>
                <div style={s.fieldGroup}>
                  <label style={s.fieldLabel}>Merchant</label>
                  <input style={s.fieldInput} value={editData.merchant} onChange={e => updateField("merchant", e.target.value)} />
                </div>
                <div style={s.fieldGroup}>
                  <label style={s.fieldLabel}>Date</label>
                  <input style={s.fieldInput} type="date" value={editData.date} onChange={e => updateField("date", e.target.value)} />
                </div>
                <div style={s.fieldGroup}>
                  <label style={s.fieldLabel}>Currency</label>
                  <input style={s.fieldInput} value={editData.currency} onChange={e => updateField("currency", e.target.value)} />
                </div>
                <div style={s.fieldGroup}>
                  <label style={s.fieldLabel}>Total Amount</label>
                  <input style={s.fieldInput} type="number" value={editData.total_amount} onChange={e => updateField("total_amount", e.target.value)} />
                </div>
              </div>

              {/* Line Items Table */}
              <div style={{ marginTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: "600", color: GREEN_HEADER }}>Line Items</span>
                  <button style={s.addItemBtn} onClick={addItem}>+ Add Item</button>
                </div>

                <table style={{ ...s.table, tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: "40%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "12%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th style={s.th}>Item</th>
                      <th style={s.th}>Qty</th>
                      <th style={s.th}>Unit Price</th>
                      <th style={s.th}>Total</th>
                      <th style={s.th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {editData.lineItems.map((item, i) => (
                      <tr key={i} style={i % 2 === 0 ? s.rowEven : s.rowOdd}>
                        <td style={s.td}>
                          <input style={s.inlineInput} value={item.description} onChange={e => updateItem(i, "description", e.target.value)} />
                        </td>
                        <td style={s.tdCenter}>
                          <input style={{ ...s.inlineInput, textAlign: "center" }} 
                          type="number" 
                          step="1"
                          min="0"
                          value={Math.trunc(item.quantity)} 
                          onChange={e => updateItem(i, "quantity", parseInt(e.target.value) || 0)} />
                        </td>
                        <td style={s.tdRight}>
                          <input style={{ ...s.inlineInput, textAlign: "right" }} type="number" value={item.unit_price} onChange={e => updateItem(i, "unit_price", e.target.value)} />
                        </td>
                        <td style={s.tdRight}>
                          <input style={{ ...s.inlineInput, textAlign: "right" }} type="number" value={item.total_price} onChange={e => updateItem(i, "total_price", e.target.value)} />
                        </td>
                        <td style={{ ...s.tdCenter, padding: "6px 4px" }}>
                          <button style={s.removeItemBtn} onClick={() => removeItem(i)}>✕</button>
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
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const GREEN      = "#1a6c2e";
const GREEN_LIGHT = "#e8f5e9";
const GREEN_HEADER = "#1b5e20";

const s = {
  page:            { padding: 30, fontFamily: "Arial, sans-serif", backgroundColor: "#f9f9f9", minHeight: "100vh" },
  title:           { color: GREEN_HEADER, marginBottom: 20 },
  summaryRow:      { display: "flex", gap: 16, marginBottom: 24 },
  summaryCard:     { flex: 1, backgroundColor: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", textAlign: "center" },
  summaryLabel:    { margin: 0, fontSize: 13, color: "#888" },
  summaryValue:    { margin: "8px 0 0", fontSize: 22, fontWeight: "bold", color: "#333" },
  filterRow:       { display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" },
  filterLabel:     { fontSize: 13, color: "#666" },
  dateInput:       { border: "1px solid #c8e6c9", borderRadius: 6, padding: "6px 10px", fontSize: 13 },
  clearBtn:        { backgroundColor: "#ffebee", color: "#c62828", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 13 },
  layout:          { display: "flex", gap: 24 },
  list:            { width: 300, flexShrink: 0, display: "flex", flexDirection: "column", gap: 4 },
  groupHeader:     { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 4px 4px", marginTop: 8 },
  groupDate:       { fontSize: 13, fontWeight: "bold", color: GREEN_HEADER },
  groupTotal:      { fontSize: 13, fontWeight: "bold", color: "#555" },
  card:            { backgroundColor: "#fff", padding: "10px 14px", borderRadius: 8, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.07)", marginBottom: 4 },
  cardMerchant:    { fontWeight: "bold", margin: 0, color: "#333", fontSize: 13 },
  cardTotal:       { margin: "2px 0 0", fontWeight: "600", color: GREEN_HEADER, fontSize: 13 },
  cardTime:        { margin: "2px 0 0", fontSize: 11, color: "#aaa" },
  empty:           { color: "#aaa", fontStyle: "italic" },
  emptyDetail:     { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 300 },
  detail:          { flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 6px rgba(0,0,0,0.1)" },
  detailHeader:    { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  detailMerchant:  { margin: 0, color: GREEN_HEADER, fontSize: 18 },
  detailMeta:      { margin: "4px 0 0", color: "#888", fontSize: 13 },
  totalBadge:      { backgroundColor: GREEN_LIGHT, borderRadius: 10, padding: "10px 16px", textAlign: "right" },
  totalBadgeLabel: { margin: 0, fontSize: 11, color: "#888" },
  totalBadgeValue: { margin: "4px 0 0", fontSize: 18, fontWeight: "bold", color: GREEN_HEADER },
  table:           { width: "100%", borderCollapse: "collapse" },
  th:              { backgroundColor: GREEN_HEADER, color: "#fff", padding: "10px 12px", textAlign: "left", fontSize: 12, fontWeight: "600", letterSpacing: "0.04em" },
  td:              { padding: "10px 12px", fontSize: 14, color: "#333" },
  tdCenter:        { padding: "10px 12px", fontSize: 14, textAlign: "center", color: "#333" },
  tdRight:         { padding: "10px 12px", fontSize: 14, textAlign: "right", color: "#333" },
  rowEven:         { backgroundColor: "#fff" },
  rowOdd:          { backgroundColor: "#f9fbe7" },
  totalLabel:      { padding: 12, fontWeight: "bold", textAlign: "right", color: GREEN_HEADER },
  totalValue:      { padding: 12, fontWeight: "bold", textAlign: "right", fontSize: 16, color: GREEN_HEADER },

  // Action buttons (matching inventory management style)
  editBtn: {
    display: "flex", alignItems: "center", padding: "7px 14px", borderRadius: 8,
    border: "1.5px solid #1b5e20", backgroundColor: "#fff", color: "#1b5e20",
    fontSize: 13, fontWeight: "600", cursor: "pointer",
  },
  deleteBtn: {
    display: "flex", alignItems: "center", padding: "7px 14px", borderRadius: 8,
    border: "1.5px solid #c62828", backgroundColor: "#fff", color: "#c62828",
    fontSize: 13, fontWeight: "600", cursor: "pointer",
  },

  // Modal
  modalOverlay: {
    position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
  },
  modalBox: {
    backgroundColor: "#fff", borderRadius: 14, width: "90%", maxWidth: 700,
    maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
  },
  modalHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 24px", borderBottom: "1px solid #e0e0e0",
    backgroundColor: GREEN_HEADER, borderRadius: "14px 14px 0 0",
  },
  modalTitle:  { fontSize: 16, fontWeight: "700", color: "#fff" },
  modalClose:  { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#fff", lineHeight: 1 },
  modalBody:   { padding: "20px 24px" },
  modalFooter: { display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 24px", borderTop: "1px solid #e0e0e0" },

  fieldGrid:  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 5 },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: "#555", textTransform: "uppercase", letterSpacing: "0.04em" },
  fieldInput: {
    border: "1px solid #c8e6c9", borderRadius: 7, padding: "8px 10px",
    fontSize: 13, outline: "none", color: "#333",
  },

  inlineInput: {
    width: "100%", border: "1px solid #e0e0e0", borderRadius: 5,
    padding: "5px 7px", fontSize: 13, outline: "none", boxSizing: "border-box",
    backgroundColor: "#fafafa",
  },

  addItemBtn: {
    fontSize: 12, fontWeight: "600", color: GREEN_HEADER,
    backgroundColor: GREEN_LIGHT, border: `1px solid #a5d6a7`,
    borderRadius: 6, padding: "5px 12px", cursor: "pointer",
  },
  removeItemBtn: {
    background: "none", border: "none", color: "#c62828",
    cursor: "pointer", fontSize: 14, fontWeight: "bold", padding: 2,
  },

  cancelBtn: {
    padding: "9px 20px", borderRadius: 8, border: "1px solid #ccc",
    backgroundColor: "#fff", color: "#555", fontSize: 13, fontWeight: "600", cursor: "pointer",
  },
  saveBtn: {
    padding: "9px 24px", borderRadius: 8, border: "none",
    backgroundColor: GREEN_HEADER, color: "#fff", fontSize: 13, fontWeight: "700", cursor: "pointer",
  },
};