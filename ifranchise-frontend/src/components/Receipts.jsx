import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5001";

export default function Receipts() {
  const [receipts, setReceipts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [dateFrom, setDateFrom]   = useState("");
  const [dateTo, setDateTo]       = useState("");

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

  // Filter by date range
  const filtered = receipts.filter(r => {
    if (dateFrom && r.date < dateFrom) return false;
    if (dateTo   && r.date > dateTo)   return false;
    return true;
  });

  // Group by date
  const grouped = filtered.reduce((acc, r) => {
    const key = r.date || "No Date";
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  // Summary totals
  const grandTotal   = filtered.reduce((sum, r) => sum + parseFloat(r.total_amount || 0), 0);
  const receiptCount = filtered.length;

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
          <p style={{ ...s.summaryValue, color: '#1b5e20' }}>
            PHP {grandTotal.toFixed(2)}
          </p>
        </div>
        <div style={s.summaryCard}>
          <p style={s.summaryLabel}>Date Range</p>
          <p style={s.summaryValue}>
            {filtered.length > 0
              ? `${filtered[filtered.length - 1].date || "?"} → ${filtered[0].date || "?"}`
              : "—"}
          </p>
        </div>
      </div>

      {/* Date Filter */}
      <div style={s.filterRow}>
        <span style={s.filterLabel}>Filter by date:</span>
        <input
          type="date" style={s.dateInput}
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
        />
        <span style={s.filterLabel}>to</span>
        <input
          type="date" style={s.dateInput}
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
        />
        {(dateFrom || dateTo) && (
          <button style={s.clearBtn} onClick={() => { setDateFrom(""); setDateTo(""); }}>
            ✕ Clear
          </button>
        )}
      </div>

      {loading ? <p>Loading...</p> : (
        <div style={s.layout}>

          {/* LEFT: Grouped Receipt List */}
          <div style={s.list}>
            {Object.keys(grouped).length === 0 && (
              <p style={s.empty}>No receipts found.</p>
            )}
            {Object.keys(grouped).sort((a, b) => b.localeCompare(a)).map(date => {
              const dayTotal = grouped[date].reduce(
                (sum, r) => sum + parseFloat(r.total_amount || 0), 0
              );
              return (
                <div key={date}>
                  {/* Date Group Header */}
                  <div style={s.groupHeader}>
                    <span style={s.groupDate}>{date}</span>
                    <span style={s.groupTotal}>PHP {dayTotal.toFixed(2)}</span>
                  </div>

                  {/* Receipts in this group */}
                  {grouped[date].map(r => (
                    <div
                      key={r.id}
                      style={{
                        ...s.card,
                        borderLeft: selected?.id === r.id
                          ? "4px solid #1b5e20"
                          : "4px solid transparent"
                      }}
                      onClick={() => fetchDetail(r.id)}
                    >
                      <p style={s.cardMerchant}>{r.merchant || "Unknown Merchant"}</p>
                      <p style={s.cardTotal}>
                        {r.currency} {Number(r.total_amount).toFixed(2)}
                      </p>
                      <p style={s.cardTime}>
                        {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                <p style={{ fontSize: 40, marginBottom: 12 }}>🧾</p>
                <p style={s.empty}>Select a receipt to view details.</p>
              </div>
            ) : (
              <>
                <div style={s.detailHeader}>
                  <div>
                    <h3 style={s.detailMerchant}>{selected.merchant || "Unknown"}</h3>
                    <p style={s.detailMeta}>
                      {selected.date || "N/A"} &nbsp;|&nbsp;
                      {new Date(selected.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div style={s.totalBadge}>
                    <p style={s.totalBadgeLabel}>Total</p>
                    <p style={s.totalBadgeValue}>
                      {selected.currency} {Number(selected.total_amount).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Line Items */}
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
                            <td style={s.tdCenter}>{item.quantity}</td>
                            <td style={s.tdRight}>{Number(item.unit_price).toFixed(2)}</td>
                            <td style={s.tdRight}>{Number(item.total_price).toFixed(2)}</td>
                          </tr>
                        ))
                      : (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center", padding: 16, color: "#999" }}>
                            No line items
                          </td>
                        </tr>
                      )
                    }
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} style={s.totalLabel}>TOTAL</td>
                      <td style={s.totalValue}>
                        {selected.currency} {Number(selected.total_amount).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

const s = {
  page:            { padding: 30, fontFamily: "Arial, sans-serif", backgroundColor: "#f9f9f9", minHeight: "100vh" },
  title:           { color: "#1b5e20", marginBottom: 20 },
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
  groupDate:       { fontSize: 13, fontWeight: "bold", color: "#1b5e20" },
  groupTotal:      { fontSize: 13, fontWeight: "bold", color: "#555" },
  card:            { backgroundColor: "#fff", padding: "10px 14px", borderRadius: 8, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.07)", marginBottom: 4 },
  cardMerchant:    { fontWeight: "bold", margin: 0, color: "#333", fontSize: 13 },
  cardTotal:       { margin: "2px 0 0", fontWeight: "600", color: "#1b5e20", fontSize: 13 },
  cardTime:        { margin: "2px 0 0", fontSize: 11, color: "#aaa" },
  empty:           { color: "#aaa", fontStyle: "italic" },
  emptyDetail:     { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 300 },
  detail:          { flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 6px rgba(0,0,0,0.1)" },
  detailHeader:    { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  detailMerchant:  { margin: 0, color: "#1b5e20", fontSize: 18 },
  detailMeta:      { margin: "4px 0 0", color: "#888", fontSize: 13 },
  totalBadge:      { backgroundColor: "#e8f5e9", borderRadius: 10, padding: "10px 16px", textAlign: "right" },
  totalBadgeLabel: { margin: 0, fontSize: 11, color: "#888" },
  totalBadgeValue: { margin: "4px 0 0", fontSize: 18, fontWeight: "bold", color: "#1b5e20" },
  table:           { width: "100%", borderCollapse: "collapse" },
  th:              { backgroundColor: "#e8f5e9", color: "#1b5e20", padding: "10px 12px", textAlign: "left", fontSize: 13 },
  td:              { padding: "10px 12px", fontSize: 14, color: "#333" },
  tdCenter:        { padding: "10px 12px", fontSize: 14, textAlign: "center", color: "#333" },
  tdRight:         { padding: "10px 12px", fontSize: 14, textAlign: "right", color: "#333" },
  rowEven:         { backgroundColor: "#fff" },
  rowOdd:          { backgroundColor: "#f9fbe7" },
  totalLabel:      { padding: 12, fontWeight: "bold", textAlign: "right", color: "#1b5e20" },
  totalValue:      { padding: 12, fontWeight: "bold", textAlign: "right", fontSize: 16, color: "#1b5e20" },
};