import { forwardRef } from "react";
import templateBg from "../assets/printTemplate.png";

function toDateStr(val) {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function resolveLineItems(receipt) {
  return receipt?.lineItems ?? receipt?.line_items ?? receipt?.items ?? receipt?.products ?? [];
}

const ReceiptPrintTemplate = forwardRef(({ receipts }, ref) => {
  const grandTotal = receipts.reduce((s, r) => s + parseFloat(r.total_amount || 0), 0);
  const totalVat   = receipts.reduce((s, r) => s + parseFloat(r.vat || 0), 0);

  return (
    <div ref={ref} style={{ display: "none" }}>
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body > * { display: none !important; }
          body > div[data-print] { display: block !important; }

          .print-root {
            display: block !important;
            width: 210mm;
            min-height: 330mm;
            position: relative;
            font-family: Arial, sans-serif;
            font-size: 15px;
            color: #111;
          }

         .print-page {
            position: relative;
            width: 210mm;
            min-height: 297mm;
            page-break-after: always;
  page-break-inside: avoid;
            display: block !important;
            }

            .template-bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 210mm;
            height: 297mm;
            object-fit: fill;
            z-index: 1;
            display: block !important;
            }

            .print-content {
            position: absolute;
            z-index: 999;
            top: 92mm;
            left: 0mm;
            width: 210mm;
            }

            .print-totals {
                width: 100%;
                margin-top: 4px;
            }

            .print-items-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 15px;
            position: relative;
            z-index: 999;
            border: 1px solid #ccc; 
            }

            .print-items-table td {
            padding: 3px 5px;
            vertical-align: top;
            border:  1px solid #ccc;
            background: transparent !important;
            color: #000 !important;
            font-size: 15px;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            }

          .print-items-table td.center { text-align: center; }
          .print-items-table td.right  { text-align: right; }

          .print-totals table {
            width: 100%;
            border-collapse: collapse;
            font-size: 15px;
          }

          .print-totals td {
            padding: 4px 6px;
          }

          .print-totals td.label {
            text-align: right;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 15px;
            background: #f5f5f5;
            border: 1px solid #ccc;
          }

          .print-totals td.value {
            text-align: right;
            border: 1px solid #ccc;
            min-width: 28mm;
            font-size: 15px;
          }
        }
      `}</style>

      <div className="print-root">
        {receipts.flatMap((r, rIdx) => {
        const items = resolveLineItems(r);
        const ITEMS_PER_PAGE = 20;

        const pages = [];
        if (items.length === 0) {
            pages.push([]);
        } else {
            for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
            pages.push(items.slice(i, i + ITEMS_PER_PAGE));
            }
        }

            return pages.map((pageItems, pageIdx) => {
            const isLastPage = pageIdx === pages.length - 1;
            return (
            <div key={`${rIdx}-${pageIdx}`} className="print-page">
                <img className="template-bg" src={templateBg} alt="" />

                <div className="print-content">
                <table className="print-items-table">
                    <thead>
                    <tr>
                        <th style={{ width: "50%", textAlign: "left", padding: "3px 5px", fontWeight: 700, fontSize: "15px", textTransform: "uppercase", borderBottom: "1px solid #ccc" }}>Item Name</th>
                        <th style={{ width: "12%", textAlign: "center", padding: "3px 5px", fontWeight: 700, fontSize: "15px", textTransform: "uppercase", borderBottom: "1px solid #ccc" }}>Qty</th>
                        <th style={{ width: "18%", textAlign: "right", padding: "3px 5px", fontWeight: 700, fontSize: "15px", textTransform: "uppercase", borderBottom: "1px solid #ccc" }}>Price</th>
                        <th style={{ width: "20%", textAlign: "right", padding: "3px 5px", fontWeight: 700, fontSize: "15px", textTransform: "uppercase", borderBottom: "1px solid #ccc" }}>Total</th>
                    </tr>
                    </thead>
                    <tbody>
                    {pageItems.length === 0 ? (
                        <tr>
                        <td style={{ color: "#999", fontStyle: "italic" }}>(no items)</td>
                        <td className="center">—</td>
                        <td className="right">—</td>
                        <td className="right">{parseFloat(r.total_amount || 0).toFixed(2)}</td>
                        </tr>
                    ) : (
                        pageItems.map((item, iIdx) => (
                        <tr key={iIdx}>
                            <td style={{ width: "50%" }}>{item.description || "—"}</td>
                            <td className="center" style={{ width: "12%" }}>{parseFloat(item.quantity || 0).toFixed(2)}</td>
                            <td className="right" style={{ width: "18%" }}>{parseFloat(item.unit_price || 0).toFixed(2)}</td>
                            <td className="right" style={{ width: "20%" }}>{parseFloat(item.total_price || 0).toFixed(2)}</td>
                        </tr>
                        ))
                    )}
                    </tbody>
                </table>

                {isLastPage && (
                    <div className="print-totals">
                    <table>
                        <tbody>
                        <tr>
                            <td className="label">SUBTOTAL</td>
                            <td className="value">{grandTotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td className="label">VAT</td>
                            <td className="value">{totalVat > 0 ? totalVat.toFixed(2) : "0.00"}</td>
                        </tr>
                        <tr>
                            <td className="label">TOTAL</td>
                            <td className="value" style={{ fontWeight: 800 }}>{(grandTotal + (totalVat || 0)).toFixed(2)}</td>
                        </tr>
                        </tbody>
                    </table>
                    </div>
                )}
                </div>
            </div>
            );
        });
        })}
      </div>
    </div>
  );
});

export default ReceiptPrintTemplate;