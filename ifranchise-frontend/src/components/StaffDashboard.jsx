//copy and align franchisync design here. all. even the font it should be plus jakarta, colors, etc

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Search,
  ShoppingCart,
  AlertTriangle,
  Check,
  X,
  Printer,
  CreditCard,
  QrCode,
  Banknote,
  RefreshCw,
  Eye,
  EyeOff,
  Scissors,
  Inbox,
  SmilePlus,
} from "lucide-react";
import logoSync from "../assets/report/franchsync-logo.png";
import { adminModuleFetch } from "../utils/adminModuleFetch";

const fmtPeso = (n) =>
  "₱" +
  Number(n || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtDate = () =>
  new Date().toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const fmtTime = () =>
  new Date().toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const generateReceiptNo = () => "OR-" + Date.now().toString().slice(-8);
const generateTxnId = () =>
  "TXN-" + Math.random().toString(36).toUpperCase().slice(2, 10);

const VAT_RATE = 0.12;
const MANAGER_PASSWORD = "Admin123"; // same as admin POS

// ─── FranchiSync shared design tokens (matches AdminDashboard) ───────────────
const C = {
  green: "#3b791e",
  greenDk: "#2c5c16",
  greenMid: "#c9dba0",
  greenLt: "#f0f5e8",
  teal: "#509820",
  lime: "#d8cb39",
  limeInk: "#24310C",
  ink: "#12241B",
  muted: "#5C6B60",
  border: "#E1E6D8",
  bg: "#F6F7F1",
  white: "#ffffff",
  warn: "#b45309",
  warnBg: "#fff7ed",
  warnBorder: "#fde68a",
  ok: "#2c5c16",
  okBg: "#f0f5e8",
  red: "#c0392b",
  redBg: "#fdf1f0",
  redBorder: "#f2c9c4",
};
const FONT = "'Plus Jakarta Sans', sans-serif";

const invInputSt = {
  height: 38,
  padding: "0 13px",
  borderRadius: 11,
  border: `1.5px solid ${C.border}`,
  background: "#fff",
  fontSize: 13,
  color: C.ink,
  outline: "none",
  fontFamily: FONT,
  boxSizing: "border-box",
  width: "100%",
  transition: "border-color .2s ease, box-shadow .2s ease",
};
const btnSt = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  height: 38,
  padding: "0 18px",
  borderRadius: 999,
  border: `1.5px solid ${C.border}`,
  background: C.white,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: FONT,
  whiteSpace: "nowrap",
  color: C.green,
  transition: "all .2s cubic-bezier(.4,0,.2,1)",
};
const btnPrimarySt = {
  ...btnSt,
  background: C.green,
  color: C.white,
  border: "none",
  boxShadow: "0 10px 24px rgba(59,121,30,0.22)",
};
const smallBtnSt = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  height: 28,
  padding: "0 12px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: FONT,
  background: C.white,
  border: `1px solid ${C.border}`,
};
const fmtPHP = fmtPeso;

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM MODAL
// ─────────────────────────────────────────────────────────────────────────────
function Modal({
  show,
  title,
  message,
  type = "info",
  onConfirm,
  onCancel,
  confirmText = "OK",
  cancelText = "Cancel",
  showCancel = false,
}) {
  if (!show) return null;
  const colors = {
    info: { bg: C.greenLt, icon: C.teal, border: C.border },
    error: { bg: C.redBg, icon: C.red, border: C.redBorder },
    success: { bg: C.okBg, icon: C.ok, border: C.greenMid },
    warning: { bg: C.warnBg, icon: C.warn, border: C.warnBorder },
  };
  const c = colors[type] || colors.info;
  const icons = {
    info: <Check size={22} />,
    error: <X size={22} />,
    success: <Check size={22} />,
    warning: <AlertTriangle size={22} />,
  };
  return (
    <div
      onClick={showCancel ? onCancel : onConfirm}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(18,36,27,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 20,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.white,
          borderRadius: 20,
          padding: "36px 32px",
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 24px 64px rgba(18,36,27,0.22)",
          border: `1px solid ${c.border}`,
          fontFamily: FONT,
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: c.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 18px",
            color: c.icon,
          }}
        >
          {icons[type]}
        </div>
        <h3
          style={{
            fontFamily: FONT,
            fontSize: 18,
            fontWeight: 800,
            color: C.ink,
            marginBottom: 10,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: 13,
            color: C.muted,
            lineHeight: 1.7,
            marginBottom: 26,
          }}
        >
          {message}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          {showCancel && (
            <button
              onClick={onCancel}
              style={{ flex: 1, ...btnSt, justifyContent: "center" }}
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              ...btnPrimarySt,
              justifyContent: "center",
              background: type === "error" ? C.red : C.green,
              boxShadow:
                type === "error"
                  ? "0 10px 24px rgba(192,57,43,0.22)"
                  : btnPrimarySt.boxShadow,
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function GCashQRModal({ totalAmt, onConfirm, onCancel, fmtPHP }) {
  const [step, setStep] = React.useState("loading");
  const [qrUrl, setQrUrl] = React.useState("");
  const [linkId, setLinkId] = React.useState("");
  const [refNo, setRefNo] = React.useState("");
  const [gcashRef, setGcashRef] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [countdown, setCountdown] = React.useState(180);
  const pollRef = React.useRef(null);
  const timerRef = React.useRef(null);

  React.useEffect(() => {
    const create = async () => {
      try {
        const res = await adminModuleFetch(
          `${process.env.REACT_APP_API_URL}/paymongo/create-gcash`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: totalAmt,
              description: "iFranchise POS Payment",
              orderId: Date.now(),
            }),
          },
        );
        const data = await res.json();
        if (!data.success) {
          setErrorMsg(data.error || "Failed to create payment link.");
          setStep("error");
          return;
        }
        const qr = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.checkoutUrl)}`;
        setQrUrl(qr);
        setLinkId(data.linkId);
        setRefNo(data.referenceNo);
        setStep("ready");
        startPolling(data.linkId);
        startCountdown();
      } catch {
        setErrorMsg("Could not reach payment server.");
        setStep("error");
      }
    };
    create();
    return () => {
      clearInterval(pollRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

  const startPolling = (id) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await adminModuleFetch(
          `${process.env.REACT_APP_API_URL}/paymongo/link-status/${id}`,
        );
        const data = await res.json();
        if (data.status === "paid") {
          clearInterval(pollRef.current);
          clearInterval(timerRef.current);
          setGcashRef(data.gcashRef || refNo);
          setStep("paid");
          setTimeout(() => onConfirm(data.gcashRef || refNo), 1500);
        }
      } catch {}
    }, 3000);
  };

  const startCountdown = () => {
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          clearInterval(pollRef.current);
          setStep("error");
          setErrorMsg("Payment window expired. Please try again.");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleRetry = () => {
    clearInterval(pollRef.current);
    clearInterval(timerRef.current);
    setStep("loading");
    setCountdown(180);
    setErrorMsg("");
  };

  const fmtCountdown = (s) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(18,36,27,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 4000,
        padding: 20,
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        style={{
          background: C.white,
          borderRadius: 24,
          width: "100%",
          maxWidth: 400,
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(18,36,27,0.3)",
          fontFamily: FONT,
          animation: "gcashSlideUp .25s cubic-bezier(.22,1,.36,1)",
        }}
      >
        <style>{`
          @keyframes gcashSlideUp { from{opacity:0;transform:translateY(28px) scale(0.97);} to{opacity:1;transform:translateY(0) scale(1);} }
          @keyframes paidPop { 0%{transform:scale(0.8);opacity:0;} 70%{transform:scale(1.1);} 100%{transform:scale(1);opacity:1;} }
          @keyframes scanLine { 0%{top:0;} 100%{top:196px;} }
        `}</style>
        {/* Header — GCash keeps its own brand blue; everything else follows FranchiSync */}
        <div
          style={{
            background: "linear-gradient(135deg,#0072c6,#004f8c)",
            padding: "18px 22px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0072c6",
              }}
            >
              <QrCode size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 15, color: "#fff" }}>
                GCash via PayMongo
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>
                {step === "loading" && "Generating payment link…"}
                {step === "ready" &&
                  `Waiting for payment · ${fmtCountdown(countdown)}`}
                {step === "paid" && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    Payment confirmed <Check size={11} />
                  </span>
                )}
                {step === "error" && "Payment failed"}
              </div>
            </div>
          </div>
          <button
            onClick={onCancel}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: "1.5px solid rgba(255,255,255,0.4)",
              background: "rgba(255,255,255,0.15)",
              cursor: "pointer",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
            }}
          >
            ×
          </button>
        </div>
        {/* Amount bar */}
        <div
          style={{
            background: C.bg,
            padding: "12px 22px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: C.muted,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Amount
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.greenDk }}>
            {fmtPHP(totalAmt)}
          </div>
        </div>
        {/* Body */}
        <div style={{ padding: "22px 24px 24px", textAlign: "center" }}>
          {step === "loading" && (
            <div style={{ padding: "32px 0" }}>
              <svg
                width={36}
                height={36}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0072c6"
                strokeWidth={2}
                style={{
                  animation: "spin 0.8s linear infinite",
                  marginBottom: 12,
                }}
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <div style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>
                Creating payment link…
              </div>
            </div>
          )}
          {step === "ready" && qrUrl && (
            <>
              <div
                style={{
                  fontSize: 13,
                  color: C.ink,
                  fontWeight: 600,
                  marginBottom: 14,
                }}
              >
                Ask the customer to scan this QR code with their GCash app
              </div>
              <div
                style={{
                  width: 200,
                  height: 200,
                  margin: "0 auto 14px",
                  border: "3px solid #0072c6",
                  borderRadius: 16,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <img
                  src={qrUrl}
                  alt="PayMongo GCash QR"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background:
                      "linear-gradient(90deg,transparent,#0072c6,transparent)",
                    animation: "scanLine 2s linear infinite",
                  }}
                />
              </div>
              {refNo && (
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>
                  Ref #{" "}
                  <strong style={{ color: C.ink, fontFamily: "monospace" }}>
                    {refNo}
                  </strong>
                </div>
              )}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: countdown < 30 ? C.redBg : C.bg,
                  border: `1px solid ${countdown < 30 ? C.redBorder : C.border}`,
                  borderRadius: 20,
                  padding: "5px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: countdown < 30 ? C.red : C.greenDk,
                  marginBottom: 16,
                }}
              >
                <svg
                  width={12}
                  height={12}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Expires in {fmtCountdown(countdown)}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  fontSize: 12,
                  color: C.muted,
                }}
              >
                <svg
                  width={13}
                  height={13}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0072c6"
                  strokeWidth={2}
                  style={{
                    animation: "spin 1.2s linear infinite",
                    flexShrink: 0,
                  }}
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Waiting for payment confirmation…
              </div>
              <button
                onClick={onCancel}
                style={{
                  marginTop: 14,
                  width: "100%",
                  ...btnSt,
                  justifyContent: "center",
                }}
              >
                Cancel payment
              </button>
            </>
          )}
          {step === "paid" && (
            <div style={{ padding: "24px 0", animation: "paidPop .4s ease" }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg,${C.teal},${C.greenDk})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  boxShadow: "0 4px 20px rgba(59,121,30,0.4)",
                }}
              >
                <svg
                  width={32}
                  height={32}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 18,
                  color: C.ink,
                  marginBottom: 6,
                }}
              >
                Payment Received!
              </div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 10 }}>
                {fmtPHP(totalAmt)} via GCash
              </div>
              {gcashRef && (
                <div
                  style={{
                    background: C.greenLt,
                    border: `1px solid ${C.greenMid}`,
                    borderRadius: 10,
                    padding: "8px 14px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.greenDk,
                    fontFamily: "monospace",
                    letterSpacing: "0.05em",
                  }}
                >
                  Ref: {gcashRef}
                </div>
              )}
              <div style={{ marginTop: 12, fontSize: 12, color: C.muted }}>
                Processing transaction…
              </div>
            </div>
          )}
          {step === "error" && (
            <div style={{ padding: "24px 0" }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: C.redBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                }}
              >
                <svg
                  width={26}
                  height={26}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={C.red}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 15,
                  color: C.ink,
                  marginBottom: 6,
                }}
              >
                Payment Failed
              </div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
                {errorMsg}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={onCancel}
                  style={{ flex: 1, ...btnSt, justifyContent: "center" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRetry}
                  style={{
                    flex: 1,
                    ...btnSt,
                    justifyContent: "center",
                    background: "linear-gradient(135deg,#0072c6,#004f8c)",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReceiptModal({ show, receipt, onClose, onNewSale }) {
  if (!show || !receipt) return null;

  const handlePrint = () => {
    const printWin = window.open(
      "",
      "_blank",
      "width=600,height=900,resizable=yes",
    );

    const css = [
      "* { margin: 0; padding: 0; box-sizing: border-box; }",
      'body { font-family: "Courier New", monospace; background: #fff; color: #000; display: flex; justify-content: center; align-items: flex-start; padding: 8mm; min-height: 100vh; }',
      ".page-wrapper { width: 100%; max-width: 94mm; }",
      ".center { text-align: center; }",
      ".bold { font-weight: 700; }",
      ".row { display: flex; justify-content: space-between; font-size: 8.5px; line-height: 1.65; }",
      ".item-row { display: flex; font-size: 8.5px; line-height: 1.65; }",
      ".col-item { width: 44%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }",
      ".col-qty { width: 10%; text-align: right; }",
      ".col-price { width: 22%; text-align: right; }",
      ".col-total { width: 22%; text-align: right; }",
      ".divider-solid { border-top: 1px solid #000; margin: 3px 0; }",
      ".divider-dash { border-top: 1px dashed #000; margin: 3px 0; }",
      ".header { font-size: 8.5px; line-height: 1.7; }",
      "@media print {",
      "  body { background: #fff; display: block; padding: 4mm; }",
      "  .page-wrapper { width: 100%; max-width: 100%; }",
      "  @page { size: 110mm 220mm; margin: 4mm 5mm; }",
      "}",
    ].join("\n");

    const bodyHTML = `
    <div class="center bold" style="font-size:11.5px">iFranchise Business and Services Corporation</div>
    <div class="center bold" style="font-size:10px">FranchiSync</div>
    <div class="center header" style="margin-top:4px">
      Main Office: Blk 113 Bldg. Connecticut St.,<br>
      Greenhills San Juan City, Philippines<br>
      Contact No.: 09271820495<br>
      Email: franchise.ordering@gmail.com
    </div>
    <div class="center header" style="margin-top:4px">
      VAT Registered TIN: _______________<br>
      Permit No.: _______________<br>
      Serial No.: _______________
    </div>
    <div class="divider-dash"></div>
    <div class="center bold" style="font-size:10px;margin-bottom:4px">SALES INVOICE</div>
    <div class="header">
      <div><b>Receipt No.:</b> ${receipt.receiptNo}</div>
      <div><b>Transaction ID:</b> ${receipt.txnId}</div>
      <div><b>Date:</b> ${receipt.date}</div>
      <div><b>Time:</b> ${receipt.time}</div>
      <div><b>Cashier:</b> ${receipt.cashier}</div>
      <div><b>Branch:</b> ${receipt.branch}</div>
      <div><b>Terminal No.:</b> 001</div>
    </div>
    <div class="divider-solid"></div>
    <div class="item-row bold">
      <span class="col-item">ITEM</span>
      <span class="col-qty">QTY</span>
      <span class="col-price">PRICE</span>
      <span class="col-total">TOTAL</span>
    </div>
    <div class="divider-solid"></div>
    ${(receipt.items || [])
      .map(
        (item) => `
      <div class="item-row">
        <span class="col-item">${item.name}</span>
        <span class="col-qty">${item.qty}</span>
        <span class="col-price">P${Number(item.price).toFixed(2)}</span>
        <span class="col-total">P${Number(item.subtotal).toFixed(2)}</span>
      </div>
    `,
      )
      .join("")}
    <div class="divider-solid"></div>
    <div class="row"><span>SUBTOTAL</span><span>P${Number(receipt.subtotal).toFixed(2)}</span></div>
    ${receipt.vat_enabled ? `<div class="row"><span>VAT 12%</span><span>P${Number(receipt.vat_amt || 0).toFixed(2)}</span></div>` : ""}
    ${receipt.discount_pct > 0 ? `<div class="row"><span>DISCOUNT (${receipt.discount_label || receipt.discount_pct + "%"})</span><span>-P${Number(receipt.discount_amt || 0).toFixed(2)}</span></div>` : ""}
    <div class="divider-solid"></div>
    <div class="row bold" style="font-size:9.5px"><span>TOTAL</span><span>P${Number(receipt.total).toFixed(2)}</span></div>
    ${
      receipt.payment_method === "Cash"
        ? `
      <div class="row"><span>CASH</span><span>P${Number(receipt.cash_received).toFixed(2)}</span></div>
      <div class="row"><span>CHANGE</span><span>P${Number(receipt.change_due).toFixed(2)}</span></div>
    `
        : ""
    }
    ${
      receipt.is_split
        ? `
      <div class="row"><span>GCASH</span><span>P${Number(receipt.split_gcash_amt || 0).toFixed(2)}</span></div>
      ${receipt.gcash_ref ? `<div class="row"><span>GCash Ref</span><span>${receipt.gcash_ref}</span></div>` : ""}
      <div class="row"><span>CASH</span><span>P${Number(receipt.split_cash_amt || 0).toFixed(2)}</span></div>
    `
        : ""
    }
    <div class="divider-dash"></div>
    <div class="header">
      <div><b>Payment Method:</b> ${receipt.payment_method}</div>
      ${receipt.gcash_ref && !receipt.is_split ? `<div><b>GCash Ref #:</b> ${receipt.gcash_ref}</div>` : ""}
      <div><b>Payment Status:</b> PAID</div>
      <div><b>Processed By:</b> FranchiSync</div>
      <div><b>Approval Status:</b> Verified</div>
    </div>
    <div class="divider-dash"></div>
    <div class="center header">
      THIS SERVES AS YOUR SALES INVOICE.<br>
      Please keep this invoice for future reference.<br>
      All franchise payments are subject to verification<br>
      and approval by iFranchise Business and<br>
      Services Corporation.<br><br>
      For support: franchise.ordering@gmail.com<br>
      (+63) 9271820495
    </div>
  `;

    const html = [
      "<!DOCTYPE html><html><head>",
      "<title>Sales Invoice - " + receipt.receiptNo + "</title>",
      "<style>" + css + "</style>",
      "</head><body>",
      '<div class="page-wrapper">',
      bodyHTML,
      "</div>",
      "<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script>",
      "</body></html>",
    ].join("");

    printWin.document.write(html);
    printWin.document.close();
  };
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(18,36,27,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 4000,
        padding: 20,
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.white,
          borderRadius: 20,
          width: "100%",
          maxWidth: 500,
          boxShadow: "0 24px 64px rgba(18,36,27,0.22)",
          border: `1px solid ${C.border}`,
          overflow: "hidden",
          fontFamily: FONT,
        }}
      >
        {/* Header */}
        <div
          style={{
            background: `linear-gradient(135deg,${C.teal},${C.greenDk})`,
            padding: "16px 22px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 15,
                color: "#fff",
              }}
            >
              Sales Invoice
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.75)",
                marginTop: 2,
              }}
            >
              {receipt.receiptNo} — {receipt.date}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "1.5px solid rgba(255,255,255,0.4)",
              background: "rgba(255,255,255,0.15)",
              cursor: "pointer",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={14} />
          </button>
        </div>
        {/* Preview */}
        <div
          style={{
            padding: "18px 22px",
            background: C.bg,
            maxHeight: "50vh",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              background: "#fff",
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: "14px 16px",
              fontFamily: "Courier New, monospace",
              fontSize: 11,
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>
                iFranchise Business and Services Corporation
              </div>
              <div style={{ fontWeight: 600, fontSize: 11 }}>
                FranchiSync — {receipt.branch}
              </div>
              <div style={{ marginTop: 4, fontSize: 10, color: C.muted }}>
                Receipt: {receipt.receiptNo} · {receipt.date} {receipt.time}
              </div>
              <div style={{ fontSize: 10, color: C.muted }}>
                Cashier: {receipt.cashier}
              </div>
            </div>
            <div
              style={{
                borderTop: "1px dashed #ccc",
                borderBottom: "1px dashed #ccc",
                padding: "8px 0",
                margin: "8px 0",
              }}
            >
              {(receipt.items || []).map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    marginBottom: 3,
                  }}
                >
                  <span>
                    {item.name} ×{item.qty}
                  </span>
                  <span style={{ fontWeight: 700 }}>
                    ₱{Number(item.subtotal).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 3,
                }}
              >
                <span>Subtotal</span>
                <span>₱{Number(receipt.subtotal).toFixed(2)}</span>
              </div>
              {receipt.discount_pct > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 3,
                    color: C.warn,
                  }}
                >
                  <span>Discount ({receipt.discount_pct}%)</span>
                  <span>−₱{Number(receipt.discount_amt || 0).toFixed(2)}</span>
                </div>
              )}
              {receipt.vat_enabled && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 3,
                    color: "#1d4ed8",
                  }}
                >
                  <span>VAT 12%</span>
                  <span>+₱{Number(receipt.vat_amt || 0).toFixed(2)}</span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 800,
                  fontSize: 13,
                  borderTop: `1px solid ${C.border}`,
                  paddingTop: 5,
                  marginBottom: 5,
                }}
              >
                <span>TOTAL</span>
                <span style={{ color: C.greenDk }}>
                  ₱{Number(receipt.total).toFixed(2)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 2,
                }}
              >
                <span>Payment</span>
                <span style={{ fontWeight: 700 }}>
                  {receipt.payment_method}
                </span>
              </div>
              {receipt.is_split && (
                <div
                  style={{
                    background: C.greenLt,
                    borderRadius: 6,
                    padding: "6px 8px",
                    margin: "4px 0",
                    fontSize: 10,
                  }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>GCash</span>
                    <span>
                      ₱{Number(receipt.split_gcash_amt || 0).toFixed(2)}
                    </span>
                  </div>
                  {receipt.gcash_ref && (
                    <div style={{ color: C.greenDk, fontFamily: "monospace" }}>
                      Ref: {receipt.gcash_ref}
                    </div>
                  )}
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>Cash</span>
                    <span>
                      ₱{Number(receipt.split_cash_amt || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
              {receipt.payment_method === "Cash" && !receipt.is_split && (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 2,
                    }}
                  >
                    <span>Cash Received</span>
                    <span>₱{Number(receipt.cash_received).toFixed(2)}</span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>Change</span>
                    <span style={{ fontWeight: 800, color: C.greenDk }}>
                      ₱{Number(receipt.change_due).toFixed(2)}
                    </span>
                  </div>
                </>
              )}
              {receipt.gcash_ref && !receipt.is_split && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 2,
                  }}
                >
                  <span>GCash Ref #</span>
                  <span style={{ fontFamily: "monospace" }}>
                    {receipt.gcash_ref}
                  </span>
                </div>
              )}
            </div>
            <div
              style={{
                textAlign: "center",
                marginTop: 10,
                fontSize: 10,
                color: C.muted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
              }}
            >
              <SmilePlus size={12} color={C.greenDk} /> Thank you for your
              purchase!
            </div>
          </div>
        </div>
        {/* Actions */}
        <div
          style={{
            padding: "14px 22px",
            borderTop: `1px solid ${C.border}`,
            display: "flex",
            gap: 10,
          }}
        >
          <button
            onClick={handlePrint}
            style={{ flex: 1, ...btnPrimarySt, justifyContent: "center" }}
          >
            <Printer size={14} /> Print Receipt
          </button>
          <button
            onClick={onNewSale}
            style={{ flex: 1, ...btnSt, justifyContent: "center" }}
          >
            <Check size={14} /> New Sale
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VOID MODAL
// ─────────────────────────────────────────────────────────────────────────────
function VoidModal({ show, tx, branch, onClose, onConfirm }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleConfirm = async () => {
    if (!pw) {
      setErr("Please enter the manager password.");
      return;
    }
    setVerifying(true);
    setErr("");
    try {
      const res = await adminModuleFetch(
        `${process.env.REACT_APP_API_URL}/verify-manager-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ branch, password: pw }),
        },
      );
      const data = await res.json();
      if (!data.valid) {
        setErr(data.error || "Incorrect manager password.");
        setVerifying(false);
        return;
      }
      onConfirm(tx);
      setPw("");
      setErr("");
    } catch {
      setErr("Could not verify password. Check your connection.");
    } finally {
      setVerifying(false);
    }
  };

  const handleClose = () => {
    setPw("");
    setErr("");
    setShowPw(false);
    onClose();
  };
  if (!show) return null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(18,36,27,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 4000,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.white,
          borderRadius: 20,
          width: "100%",
          maxWidth: 440,
          boxShadow: "0 24px 64px rgba(18,36,27,0.2)",
          overflow: "hidden",
          fontFamily: FONT,
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg,#e74c3c,${C.red})`,
            padding: "16px 22px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 15,
              color: "#fff",
            }}
          >
            Void Transaction
          </div>
          <button
            onClick={handleClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "1.5px solid rgba(255,255,255,0.4)",
              background: "rgba(255,255,255,0.15)",
              cursor: "pointer",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={14} />
          </button>
        </div>
        <div style={{ padding: 24 }}>
          {tx && (
            <div
              style={{
                padding: "12px 14px",
                background: C.warnBg,
                borderRadius: 10,
                border: `1px solid ${C.warnBorder}`,
                marginBottom: 18,
                fontSize: 13,
              }}
            >
              <div style={{ fontWeight: 700, color: C.ink }}>
                #{tx.id} — {fmtPeso(tx.total)}
              </div>
              <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>
                This action cannot be undone.
              </div>
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 800,
                color: C.muted,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                marginBottom: 6,
              }}
            >
              Manager Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                value={pw}
                disabled={verifying}
                onChange={(e) => {
                  setPw(e.target.value);
                  setErr("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirm();
                }}
                placeholder="Enter manager password to authorize"
                style={{
                  ...invInputSt,
                  padding: "10px 40px 10px 13px",
                  border: `1.5px solid ${err ? C.redBorder : C.border}`,
                  background: verifying ? "#f3f4f6" : "#fff",
                  opacity: verifying ? 0.7 : 1,
                  cursor: verifying ? "not-allowed" : "text",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                tabIndex={-1}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  color: C.muted,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {err && (
              <div
                style={{
                  color: C.red,
                  fontSize: 12,
                  marginTop: 5,
                  fontWeight: 600,
                }}
              >
                {err}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleClose}
              disabled={verifying}
              style={{
                flex: 1,
                ...btnSt,
                justifyContent: "center",
                cursor: verifying ? "not-allowed" : "pointer",
                opacity: verifying ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={verifying}
              style={{
                flex: 1,
                ...btnPrimarySt,
                justifyContent: "center",
                background: `linear-gradient(135deg,#e74c3c,${C.red})`,
                cursor: verifying ? "not-allowed" : "pointer",
                opacity: verifying ? 0.7 : 1,
              }}
            >
              {verifying ? (
                <>
                  <div
                    style={{
                      width: 13,
                      height: 13,
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin .8s linear infinite",
                    }}
                  />
                  Verifying...
                </>
              ) : (
                "Void Transaction"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// POS CONTENT  — staff-fixed branch, all admin features included
// ─────────────────────────────────────────────────────────────────────────────
export function POSContent({ user }) {
  const userBranch = (user?.branch || "").trim();

  // ── State ─────────────────────────────────────────────────────────────────
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [searchProduct, setSearchProduct] = useState("");
  const [txSearch, setTxSearch] = useState("");
  const [txDateFrom, setTxDateFrom] = useState("");
  const [txDateTo, setTxDateTo] = useState("");
  const [activeTab, setActiveTab] = useState("cashier");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [cashReceived, setCashReceived] = useState("");
  const [discountPct, setDiscountPct] = useState(0);
  const [discountType, setDiscountType] = useState("None");
  const [vatEnabled, setVatEnabled] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [txPage, setTxPage] = useState(0);
  const [noteInput, setNoteInput] = useState("");

  // Split payment
  const [isSplitPayment, setIsSplitPayment] = useState(false);
  const [splitGcashAmt, setSplitGcashAmt] = useState("");
  const [splitCashAmt, setSplitCashAmt] = useState("");
  const [splitGcashPaid, setSplitGcashPaid] = useState(false);
  const [splitGcashRef, setSplitGcashRef] = useState("");

  const [unitPickerProduct, setUnitPickerProduct] = useState(null);
  const [unitType, setUnitType] = useState("Pc");

  // GCash / PayMongo
  const [showGCashModal, setShowGCashModal] = useState(false);
  const [gcashRefNumber, setGcashRefNumber] = useState("");
  const [gcashPaymentAmt, setGcashPaymentAmt] = useState(0);

  // Discount auth
  const [showDiscountAuth, setShowDiscountAuth] = useState(false);
  const [pendingDiscount, setPendingDiscount] = useState(null);
  const [discountAuthInput, setDiscountAuthInput] = useState("");
  const [discountAuthErr, setDiscountAuthErr] = useState("");
  const [customDiscountInput, setCustomDiscountInput] = useState("");
  const [discountVerifying, setDiscountVerifying] = useState(false);

  // Modals
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [voidTarget, setVoidTarget] = useState(null);
  const [modal, setModal] = useState({ show: false });

  const getAvailableUnits = (product) => {
    if (!product) return ["Pc"];

    const pcsPerStrip = Number(product.pcs_per_strip) || 0;
    const stripsPerBox = Number(product.strips_per_box) || 0;

    const units = ["Pc"];

    if (pcsPerStrip > 0) {
      units.push("Strip");
    }

    if (pcsPerStrip > 0 && stripsPerBox > 0) {
      units.push("Box");
    }

    return units;
  };

  const isIpharmaBrand = (brand) =>
    (brand || "").toLowerCase().includes("ipharma");

  const TX_PAGE_SIZE = 20;

  const showAlert = (title, message, type = "info") =>
    setModal({ show: true, title, message, type, onConfirm: null });
  const closeModal = () => setModal((m) => ({ ...m, show: false }));

  const pcsForUnit = (product, unit) => {
    const pcsPerStrip = Number(product?.pcs_per_strip) || 0;
    const stripsPerBox = Number(product?.strips_per_box) || 0;

    if (unit === "Strip") {
      return pcsPerStrip || 1;
    }

    if (unit === "Box") {
      if (!pcsPerStrip || !stripsPerBox) return 1;
      return pcsPerStrip * stripsPerBox;
    }

    return 1;
  };

  // product.price is the BOX price (bulk unit) — same convention as
  // shop-items' priceFromCost. Strip/Pc prices are derived by dividing
  // the box price down, e.g. box = ₱100, 4 strips/box → strip = ₱25.
  const getUnitPrice = (product, unit) => {
    if (!product) return 0;

    if (unit === "Box") {
      return Number(product.price_box || 0);
    }

    if (unit === "Strip") {
      return Number(product.price_strip || 0);
    }

    // Pc
    return Number(product.price_pc ?? product.price ?? 0);
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    if (!userBranch) return;
    try {
      const res = await adminModuleFetch(
        `${process.env.REACT_APP_API_URL}/inventory?branch=${encodeURIComponent(userBranch)}`,
        {
          credentials: "include",
        },
      );
      const d = await res.json();
      setMenuItems(Array.isArray(d) ? d : []);
    } catch {
      setMenuItems([]);
    }
  }, [userBranch]);

  const fetchTransactions = useCallback(async () => {
    if (!userBranch) return;
    setLoadingTx(true);
    try {
      const [activeRes, voidedRes] = await Promise.all([
        adminModuleFetch(
          `${process.env.REACT_APP_API_URL}/transactions?branch=${encodeURIComponent(userBranch)}`,
          {
            credentials: "include",
          },
        ),
        adminModuleFetch(
          `${process.env.REACT_APP_API_URL}/transactions/voided?branch=${encodeURIComponent(userBranch)}`,
          {
            credentials: "include",
          },
        ),
      ]);
      const active = await activeRes.json();
      const voided = await voidedRes.json();
      const merged = [
        ...(Array.isArray(active) ? active : []),
        ...(Array.isArray(voided) ? voided : []),
      ].map((tx) => ({ ...tx, voided: !!tx.is_voided }));
      setTransactions(merged);
    } catch {
      setTransactions([]);
    } finally {
      setLoadingTx(false);
    }
  }, [userBranch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);
  useEffect(() => {
    setTxPage(0);
  }, [txSearch, txDateFrom, txDateTo]);

  const allProducts = useMemo(() => {
    const q = searchProduct.toLowerCase();

    return menuItems
      .map((m) => ({
        ...m,
        source: "menu",
        displayName: m.name,

        pcs_per_strip: Number(m.pcs_per_strip) || 0,
        strips_per_box: Number(m.strips_per_box) || 0,

        price_pc: Number(m.price_pc ?? m.price ?? 0),
        price_strip: m.price_strip != null ? Number(m.price_strip) : null,
        price_box: m.price_box != null ? Number(m.price_box) : null,
      }))
      .filter(
        (p) =>
          !q ||
          (p.displayName || "").toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q),
      );
  }, [menuItems, searchProduct]);

  const openUnitPicker = (product) => {
    setUnitPickerProduct(product);
    setUnitType("Pc");
  };

  const confirmUnitAdd = () => {
    const product = unitPickerProduct;

    if (!product) return;

    const availableStock = Number(product.stock) || 0;
    const pcsPerUnit = pcsForUnit(product, unitType);

    if (availableStock <= 0) {
      showAlert(
        "Out of Stock",
        `${product.displayName || product.name} is currently out of stock.`,
        "warning",
      );
      setUnitPickerProduct(null);
      return;
    }

    if (availableStock < pcsPerUnit) {
      showAlert(
        "Insufficient Stock",
        `${unitType} requires ${pcsPerUnit} pcs, but only ${availableStock} pcs are available.`,
        "warning",
      );
      return;
    }

    const price = getUnitPrice(product, unitType);
    const compositeId = `${product.id}-${unitType}`;

    const label =
      unitType === "Pc"
        ? product.displayName
        : `${product.displayName} (${unitType} · ${pcsPerUnit} pcs)`;

    setCart((prev) => {
      // Count ALL units of this same product already in the cart.
      // Example: 1 Strip (10 pcs) + 2 Pc = 12 pcs used.
      const alreadyUsedPieces = prev
        .filter(
          (c) =>
            String(c.baseProductId ?? c.id).split("-")[0] ===
            String(product.id),
        )
        .reduce(
          (total, c) => total + Number(c.qty || 0) * Number(c.unitPcs || 1),
          0,
        );

      const requestedPieces = alreadyUsedPieces + pcsPerUnit;

      if (requestedPieces > availableStock) {
        showAlert(
          "Insufficient Stock",
          `Only ${availableStock} pcs of ${product.displayName || product.name} are available.`,
          "warning",
        );

        return prev;
      }

      const existing = prev.find((c) => c.id === compositeId);

      if (existing) {
        return prev.map((c) =>
          c.id === compositeId ? { ...c, qty: c.qty + 1 } : c,
        );
      }

      return [
        ...prev,
        {
          ...product,
          id: compositeId,
          baseProductId: product.id,
          source: product.source || "menu",
          displayName: label,
          price,
          qty: 1,
          unitType,
          unitPcs: pcsPerUnit,
        },
      ];
    });

    setUnitPickerProduct(null);
  };

  const addToCart = (product) => {
    const availableStock = Number(product.stock) || 0;

    if (availableStock <= 0) {
      showAlert(
        "Out of Stock",
        `${product.displayName || product.name} is currently out of stock.`,
        "warning",
      );
      return;
    }

    setCart((prev) => {
      const existing = prev.find((c) => c.id === product.id);

      if (existing) {
        if (existing.qty >= availableStock) {
          showAlert(
            "Insufficient Stock",
            `Only ${availableStock} item${availableStock !== 1 ? "s" : ""} available in stock.`,
            "warning",
          );
          return prev;
        }

        return prev.map((c) =>
          c.id === product.id ? { ...c, qty: c.qty + 1 } : c,
        );
      }

      return [
        ...prev,
        {
          ...product,
          source: product.source || "menu",
          qty: 1,
        },
      ];
    });
  };

  const updateQty = (id, change) => {
    setCart((prev) => {
      const targetItem = prev.find((item) => item.id === id);

      if (!targetItem) return prev;

      const newQty = targetItem.qty + change;

      // Remove item if quantity becomes 0
      if (newQty <= 0) {
        return prev.filter((item) => item.id !== id);
      }

      // Only need stock validation when increasing quantity
      if (change > 0) {
        const baseProductId = targetItem.baseProductId ?? targetItem.id;

        // Find the original product so we get its latest stock
        const product = menuItems.find(
          (p) => String(p.id) === String(baseProductId),
        );

        const availableStock = Number(product?.stock ?? targetItem.stock) || 0;

        // Pc = 1 piece
        // Strip = pcs_per_strip
        // Box = pcs_per_strip * strips_per_box
        const piecesPerUnit =
          Number(targetItem.unitPcs) || Number(targetItem.unit_pcs) || 1;

        // Count pieces already being used by OTHER cart entries
        // belonging to the same product.
        const otherPiecesInCart = prev
          .filter(
            (item) =>
              item.id !== id &&
              String(item.baseProductId ?? item.id) === String(baseProductId),
          )
          .reduce((sum, item) => {
            const itemPieces =
              Number(item.unitPcs) || Number(item.unit_pcs) || 1;

            return sum + Number(item.qty || 0) * itemPieces;
          }, 0);

        // Pieces this cart entry would use after pressing +
        const targetPieces = newQty * piecesPerUnit;

        const totalPiecesNeeded = otherPiecesInCart + targetPieces;

        if (totalPiecesNeeded > availableStock) {
          showAlert(
            "Insufficient Stock",
            `Only ${availableStock} piece${
              availableStock !== 1 ? "s" : ""
            } of ${product?.displayName || product?.name || targetItem.name} are available.`,
            "warning",
          );

          return prev;
        }
      }

      return prev.map((item) =>
        item.id === id
          ? {
              ...item,
              qty: newQty,
            }
          : item,
      );
    });
  };

  const setCartQty = (id, value) => {
    // Allow the input to temporarily be empty while typing
    if (value === "") {
      setCart((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                qty: "",
              }
            : item,
        ),
      );
      return;
    }

    // Whole numbers only
    const requestedQty = parseInt(value, 10);

    if (isNaN(requestedQty)) return;

    // Minimum quantity = 1
    if (requestedQty < 1) {
      return;
    }

    setCart((prev) => {
      const targetItem = prev.find((item) => item.id === id);

      if (!targetItem) return prev;

      const baseProductId = targetItem.baseProductId ?? targetItem.id;

      // Get latest product stock
      const product = menuItems.find(
        (p) => String(p.id) === String(baseProductId),
      );

      const availableStock = Number(product?.stock ?? targetItem.stock) || 0;

      const piecesPerUnit =
        Number(targetItem.unitPcs) || Number(targetItem.unit_pcs) || 1;

      // Count other cart entries for the same product.
      // Important for iPharma Pc / Strip / Box combinations.
      const otherPiecesInCart = prev
        .filter(
          (item) =>
            item.id !== id &&
            String(item.baseProductId ?? item.id) === String(baseProductId),
        )
        .reduce((sum, item) => {
          const itemPieces = Number(item.unitPcs) || Number(item.unit_pcs) || 1;

          return sum + Number(item.qty || 0) * itemPieces;
        }, 0);

      const requestedPieces = requestedQty * piecesPerUnit;

      const totalPiecesNeeded = otherPiecesInCart + requestedPieces;

      if (totalPiecesNeeded > availableStock) {
        // Calculate maximum quantity allowed for THIS cart row
        const remainingPieces = Math.max(0, availableStock - otherPiecesInCart);

        const maxQty = Math.floor(remainingPieces / piecesPerUnit);

        showAlert(
          "Insufficient Stock",
          `You can only enter up to ${maxQty} ${
            targetItem.unitType || "item"
          }${maxQty !== 1 ? "s" : ""}. Available stock: ${availableStock} pcs.`,
          "warning",
        );

        return prev;
      }

      return prev.map((item) =>
        item.id === id
          ? {
              ...item,
              qty: requestedQty,
            }
          : item,
      );
    });
  };

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((c) => c.id !== id));
  const clearCart = () => {
    setCart([]);
    setCashReceived("");
    setDiscountPct(0);
    setDiscountType("None");
    setNoteInput("");
    setGcashRefNumber("");
    setGcashPaymentAmt(0);
    setIsSplitPayment(false);
    setSplitGcashAmt("");
    setSplitCashAmt("");
    setSplitGcashPaid(false);
    setSplitGcashRef("");
    setShowDiscountAuth(false);
    setPendingDiscount(null);
    setDiscountAuthInput("");
    setCustomDiscountInput("");
  };

  const confirmDiscountAuth = async () => {
    if (!discountAuthInput) {
      setDiscountAuthErr("Please enter the manager password.");
      return;
    }

    if (pendingDiscount.label === "Others") {
      const pct = parseFloat(customDiscountInput);
      if (!pct || pct <= 0 || pct > 100) {
        setDiscountAuthErr("Enter a valid discount % (1–100).");
        return;
      }
    }

    setDiscountVerifying(true);
    setDiscountAuthErr("");
    try {
      const res = await adminModuleFetch(
        `${process.env.REACT_APP_API_URL}/verify-manager-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            branch: userBranch,
            password: discountAuthInput,
          }),
        },
      );
      const data = await res.json();
      if (!data.valid) {
        setDiscountAuthErr(data.error || "Incorrect manager password.");
        setDiscountVerifying(false);
        return;
      }

      if (pendingDiscount.label === "Others") {
        setDiscountPct(parseFloat(customDiscountInput));
        setDiscountType("Others");
      } else {
        setDiscountPct(pendingDiscount.pct);
        setDiscountType(pendingDiscount.label);
      }
      setShowDiscountAuth(false);
      setDiscountAuthInput("");
      setDiscountAuthErr("");
      setCustomDiscountInput("");
      setPendingDiscount(null);
    } catch {
      setDiscountAuthErr("Could not verify password. Check your connection.");
    } finally {
      setDiscountVerifying(false);
    }
  };

  // ── Totals ────────────────────────────────────────────────────────────────
  const subtotal = cart.reduce((s, c) => s + (c.price || 0) * c.qty, 0);
  const discountAmt = subtotal * (discountPct / 100);
  const discounted = subtotal - discountAmt;
  const vatAmt = vatEnabled ? discounted * VAT_RATE : 0;
  const totalAmt = discounted + vatAmt;
  const changeDue =
    paymentMethod === "Cash"
      ? Math.max(0, parseFloat(cashReceived || 0) - totalAmt)
      : 0;
  const cashShortfall =
    paymentMethod === "Cash" && cashReceived !== ""
      ? parseFloat(cashReceived || 0) - totalAmt
      : 0;

  // ── Process sale ──────────────────────────────────────────────────────────
  const processSale = async () => {
    if (cart.length === 0) {
      showAlert("Empty Cart", "Please add at least one item.", "warning");
      return;
    }

    if (isSplitPayment) {
      const gcash = parseFloat(splitGcashAmt) || 0;
      const cash = parseFloat(splitCashAmt) || 0;
      if (Math.abs(gcash + cash - totalAmt) > 0.01) {
        showAlert(
          "Split Amounts Mismatch",
          `GCash + Cash must equal ${fmtPeso(totalAmt)}.`,
          "error",
        );
        return;
      }
      if (gcash > 0 && !splitGcashPaid) {
        showAlert(
          "GCash Pending",
          "Please complete the GCash payment first.",
          "warning",
        );
        return;
      }
    } else {
      if (
        paymentMethod === "Cash" &&
        parseFloat(cashReceived || 0) < totalAmt
      ) {
        showAlert(
          "Insufficient Cash",
          "Cash received is less than the total amount.",
          "error",
        );
        return;
      }
      if (paymentMethod === "GCash" && !gcashRefNumber) {
        setShowGCashModal(true);
        return;
      }
    }

    setProcessing(true);
    try {
      const receiptNo = generateReceiptNo();
      const txnId = generateTxnId();

      const payload = {
        branch: userBranch,
        cashier: user?.name || "Staff",
        shop: "",
        payment_method: isSplitPayment ? "Split" : paymentMethod,
        is_split: isSplitPayment,
        split_gcash_amt: isSplitPayment ? parseFloat(splitGcashAmt) || 0 : null,
        split_cash_amt: isSplitPayment ? parseFloat(splitCashAmt) || 0 : null,
        gcash_ref: isSplitPayment
          ? splitGcashRef
          : paymentMethod === "GCash"
            ? gcashRefNumber
            : null,
        cash_received: isSplitPayment
          ? parseFloat(splitCashAmt) || 0
          : paymentMethod === "Cash"
            ? parseFloat(cashReceived)
            : totalAmt,
        discount_pct: discountPct,
        discount_label: discountType,
        subtotal,
        discount_amt: discountAmt,
        vat_enabled: vatEnabled,
        vat_amt: vatAmt,
        total: totalAmt,
        change_due: isSplitPayment
          ? Math.max(
              0,
              (parseFloat(splitCashAmt) || 0) -
                (totalAmt - (parseFloat(splitGcashAmt) || 0)),
            )
          : changeDue,
        note: noteInput,
        receipt_no: receiptNo,
        txn_id: txnId,
        items: cart.map((c) => ({
          id: c.baseProductId ?? c.id,
          source: c.source || "menu",

          name: c.displayName,
          price: Number(c.price),

          qty: Number(c.qty),

          unit_type: c.unitType || c.unit || "Pc",
          unit_pcs: Number(c.unitPcs || 1),

          subtotal: Number(c.price) * Number(c.qty),
        })),
      };

      const res = await adminModuleFetch(
        `${process.env.REACT_APP_API_URL}/transactions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const d = await res.json();
      if (d.success) {
        setLastReceipt({
          ...payload,
          receiptNo,
          txnId,
          date: fmtDate(),
          time: fmtTime(),
          cashier: user?.name || "Staff",
          branch: userBranch,
        });
        setShowReceiptModal(true);
        clearCart();
        fetchTransactions();
        fetchProducts();
      } else {
        showAlert(
          "Transaction Failed",
          d.error || "Failed to process sale.",
          "error",
        );
      }
    } catch {
      showAlert(
        "Connection Error",
        "Failed to process sale. Check your connection.",
        "error",
      );
    } finally {
      setProcessing(false);
    }
  };

  // ── Void ──────────────────────────────────────────────────────────────────
  const handleVoidRequest = (tx) => {
    setVoidTarget(tx);
    setShowVoidModal(true);
  };
  const handleVoidConfirm = async (tx) => {
    try {
      const res = await adminModuleFetch(
        `${process.env.REACT_APP_API_URL}/transactions/${tx.id}/void`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            voided_by: user?.name || "Manager",
            reason: "Manager authorized void",
          }),
        },
      );
      const d = await res.json();
      setShowVoidModal(false);
      setVoidTarget(null);
      if (d.success) {
        showAlert(
          "Voided",
          "Transaction has been voided successfully.",
          "success",
        );
        fetchTransactions();
      } else
        showAlert(
          "Void Failed",
          d.error || "Could not void this transaction.",
          "error",
        );
    } catch {
      setShowVoidModal(false);
      showAlert("Connection Error", "Failed to void transaction.", "error");
    }
  };

  // ── Filtered transactions ─────────────────────────────────────────────────
  const filteredTx = useMemo(() => {
    const q = txSearch.toLowerCase();
    return transactions.filter((tx) => {
      if (
        q &&
        !String(tx.id).includes(q) &&
        !(tx.cashier || "").toLowerCase().includes(q)
      )
        return false;
      if (txDateFrom && tx.created_at < txDateFrom) return false;
      if (txDateTo && tx.created_at > txDateTo + "T23:59:59") return false;
      return true;
    });
  }, [transactions, txSearch, txDateFrom, txDateTo]);

  const txPageItems = filteredTx.slice(
    txPage * TX_PAGE_SIZE,
    (txPage + 1) * TX_PAGE_SIZE,
  );
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySales = transactions.filter(
    (tx) => (tx.created_at || "").startsWith(todayStr) && !tx.voided,
  );
  const todayRevenue = todaySales.reduce(
    (s, tx) => s + Number(tx.total || 0),
    0,
  );

  // ── Shared styles ─────────────────────────────────────────────────────────
  const inp = invInputSt;
  const smallBtn = smallBtnSt;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: FONT, padding: "18px 20px", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

      <style>{`
  .cart-qty-input::-webkit-inner-spin-button,
  .cart-qty-input::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .cart-qty-input {
    -moz-appearance: textfield;
    appearance: textfield;
  }
`}</style>

      {/* ── Modals ── */}
      <Modal
        show={modal.show}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={closeModal}
        onCancel={closeModal}
      />
      <ReceiptModal
        show={showReceiptModal}
        receipt={lastReceipt}
        onClose={() => setShowReceiptModal(false)}
        onNewSale={() => setShowReceiptModal(false)}
      />
      <VoidModal
        show={showVoidModal}
        tx={voidTarget}
        branch={userBranch}
        onClose={() => {
          setShowVoidModal(false);
          setVoidTarget(null);
        }}
        onConfirm={handleVoidConfirm}
      />
      {unitPickerProduct && (
        <div
          onClick={() => setUnitPickerProduct(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(18,36,27,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: C.white,
              borderRadius: 18,
              padding: "26px 28px",
              width: 340,
              maxWidth: "95vw",
              boxShadow: "0 16px 48px rgba(18,36,27,0.22)",
              fontFamily: FONT,
            }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: 16,
                color: C.ink,
                marginBottom: 4,
              }}
            >
              {unitPickerProduct.displayName}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>
              Choose selling unit for this sale.
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {getAvailableUnits(unitPickerProduct).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnitType(u)}
                  style={{
                    flex: 1,
                    height: 34,
                    borderRadius: 9,
                    border: "none",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: FONT,
                    background: unitType === u ? C.green : C.greenLt,
                    color: unitType === u ? "#fff" : C.greenDk,
                  }}
                >
                  {u}
                </button>
              ))}
            </div>
            <div
              style={{
                fontSize: 13,
                color: C.ink,
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              {pcsForUnit(unitPickerProduct, unitType)} pcs —{" "}
              {fmtPeso(getUnitPrice(unitPickerProduct, unitType))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setUnitPickerProduct(null)}
                style={{
                  ...smallBtnSt,
                  flex: 1,
                  height: 38,
                  fontSize: 13,
                  justifyContent: "center",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmUnitAdd}
                style={{
                  flex: 1,
                  height: 38,
                  ...btnPrimarySt,
                  justifyContent: "center",
                  fontSize: 13,
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
      {showGCashModal && (
        <GCashQRModal
          totalAmt={isSplitPayment ? parseFloat(splitGcashAmt) || 0 : totalAmt}
          fmtPHP={fmtPeso}
          onConfirm={(refNum) => {
            setShowGCashModal(false);
            if (isSplitPayment) {
              setSplitGcashPaid(true);
              setSplitGcashRef(refNum);
              setGcashRefNumber(refNum);
            } else {
              setGcashRefNumber(refNum);
              setTimeout(() => processSale(), 100);
            }
          }}
          onCancel={() => {
            setShowGCashModal(false);
            setGcashPaymentAmt(0);
          }}
        />
      )}

      {/* ── Discount Auth Modal ── */}
      {showDiscountAuth && pendingDiscount && (
        <div
          onClick={() => setShowDiscountAuth(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(18,36,27,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: C.white,
              borderRadius: 18,
              padding: "26px 28px",
              width: 340,
              maxWidth: "95vw",
              boxShadow: "0 16px 48px rgba(18,36,27,0.22)",
              fontFamily: FONT,
            }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: 16,
                color: C.ink,
                marginBottom: 4,
              }}
            >
              {pendingDiscount.label} Discount
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>
              Manager authorization required.
            </div>
            {pendingDiscount.label === "Others" && (
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: C.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: 5,
                  }}
                >
                  Custom Discount %
                </div>
                <input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="e.g. 15"
                  value={customDiscountInput}
                  onChange={(e) => setCustomDiscountInput(e.target.value)}
                  style={inp}
                />
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: C.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: 5,
                }}
              >
                Manager Password
              </div>
              <input
                type="password"
                placeholder="Enter password…"
                value={discountAuthInput}
                onChange={(e) => {
                  setDiscountAuthInput(e.target.value);
                  setDiscountAuthErr("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmDiscountAuth();
                }}
                autoFocus
                style={inp}
              />
              {discountAuthErr && (
                <div
                  style={{
                    marginTop: 5,
                    fontSize: 12,
                    color: C.red,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <AlertTriangle size={12} /> {discountAuthErr}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setShowDiscountAuth(false)}
                style={{
                  ...smallBtn,
                  flex: 1,
                  height: 38,
                  fontSize: 13,
                  justifyContent: "center",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDiscountAuth}
                style={{
                  flex: 1,
                  height: 38,
                  ...btnPrimarySt,
                  justifyContent: "center",
                  fontSize: 13,
                }}
              >
                Apply Discount
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 12,
          marginBottom: 18,
        }}
      >
        {[
          {
            label: "Today's Revenue",
            value: fmtPeso(todayRevenue),
            sub: `${todaySales.length} transactions`,
          },
          {
            label: "Transactions Today",
            value: todaySales.length,
            sub: "Completed sales",
          },
          {
            label: "Avg Order Value",
            value: fmtPeso(
              todaySales.length ? todayRevenue / todaySales.length : 0,
            ),
            sub: "Per transaction",
          },
          {
            label: "Items in Cart",
            value: cart.reduce((s, c) => s + c.qty, 0),
            sub: "Current session",
          },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 18,
              padding: "16px 18px",
              boxShadow: "0 2px 10px rgba(50,109,32,0.05)",
              transition: "transform .25s ease, box-shadow .25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow =
                "0 12px 26px rgba(50,109,32,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow =
                "0 2px 10px rgba(50,109,32,0.05)";
            }}
          >
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.09em",
                color: C.muted,
                marginBottom: 6,
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: C.ink,
                letterSpacing: "-0.02em",
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: C.muted,
                marginTop: 4,
                fontWeight: 500,
              }}
            >
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div
        style={{
          display: "flex",
          gap: 4,
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 4,
          marginBottom: 18,
          width: "fit-content",
        }}
      >
        {[
          { id: "cashier", label: "Cashier", red: false },
          { id: "history", label: "Transaction History", red: false },
          { id: "voided", label: "Voided", red: true },
        ].map(({ id, label, red }) => {
          const isActive = activeTab === id;
          const voidedCount = transactions.filter((t) => t.voided).length;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                padding: "8px 20px",
                borderRadius: 9,
                border: "none",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: FONT,
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: isActive
                  ? red
                    ? `linear-gradient(135deg,#e74c3c,${C.red})`
                    : C.green
                  : "transparent",
                color: isActive ? "#fff" : red ? C.red : C.muted,
                boxShadow: isActive
                  ? red
                    ? "0 3px 10px rgba(192,57,43,.28)"
                    : "0 3px 10px rgba(59,121,30,.28)"
                  : "none",
              }}
            >
              {label}
              {id === "voided" && voidedCount > 0 && (
                <span
                  style={{
                    background: isActive ? "rgba(255,255,255,0.25)" : C.redBg,
                    color: isActive ? "#fff" : C.red,
                    padding: "1px 7px",
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {voidedCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CASHIER TAB                                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "cashier" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 390px",
            gap: 18,
            alignItems: "start",
          }}
        >
          {/* Products */}
          <div>
            <div
              style={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: "12px 16px",
                marginBottom: 14,
              }}
            >
              <div style={{ position: "relative" }}>
                <Search
                  size={13}
                  color={C.muted}
                  style={{
                    position: "absolute",
                    left: 11,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
                <input
                  type="text"
                  autoComplete="off"
                  placeholder="Search products..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  style={{ ...inp, paddingLeft: 32 }}
                />
              </div>
            </div>
            {allProducts.length === 0 ? (
              <div
                style={{
                  background: C.white,
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  padding: "48px 0",
                  textAlign: "center",
                  color: C.muted,
                  fontSize: 13,
                }}
              >
                {!userBranch
                  ? "No branch assigned to your account."
                  : "No products found for this branch."}
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))",
                  gap: 10,
                }}
              >
                {allProducts.map((product) => {
                  const inCart = cart.find((c) => c.id === product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => {
                        if (Number(product.stock) <= 0) {
                          showAlert(
                            "Out of Stock",
                            `${product.displayName || product.name} is currently out of stock.`,
                            "warning",
                          );
                          return;
                        }

                        if (isIpharmaBrand(product.brand)) {
                          openUnitPicker(product);
                        } else {
                          addToCart(product);
                        }
                      }}
                      style={{
                        background: C.white,
                        border: `2px solid ${inCart ? C.teal : C.border}`,
                        borderRadius: 13,
                        padding: "13px 11px",
                        cursor:
                          Number(product.stock) <= 0
                            ? "not-allowed"
                            : "pointer",
                        opacity: Number(product.stock) <= 0 ? 0.55 : 1,
                        transition: "all .15s",
                        boxShadow: inCart
                          ? "0 4px 14px rgba(80,152,32,0.18)"
                          : "0 1px 6px rgba(50,109,32,0.05)",
                        position: "relative",
                      }}
                    >
                      {inCart && (
                        <div
                          style={{
                            position: "absolute",
                            top: 7,
                            right: 7,
                            background: C.green,
                            color: "#fff",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "1px 7px",
                          }}
                        >
                          ×{inCart.qty}
                        </div>
                      )}
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt=""
                          style={{
                            width: "100%",
                            height: 85,
                            objectFit: "cover",
                            borderRadius: 8,
                            marginBottom: 9,
                          }}
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: 85,
                            borderRadius: 8,
                            background: C.greenLt,
                            marginBottom: 9,
                          }}
                        />
                      )}
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 12,
                          color: C.ink,
                          marginBottom: 3,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {product.displayName}
                      </div>
                      {product.category && (
                        <div
                          style={{
                            fontSize: 10,
                            color: C.muted,
                            marginBottom: 5,
                          }}
                        >
                          {product.category}
                        </div>
                      )}
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 14,
                          color: C.greenDk,
                        }}
                      >
                        {fmtPeso(product.price)}
                      </div>
                      {product.stock !== undefined && (
                        <div
                          style={{
                            fontSize: 10,
                            color: product.stock <= 5 ? C.red : C.muted,
                            marginTop: 2,
                          }}
                        >
                          {Number(product.stock) <= 0
                            ? "OUT OF STOCK"
                            : `Stock: ${product.stock}`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Order panel ── */}
          <div style={{ position: "sticky", top: 80 }}>
            <div
              style={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: "0 2px 10px rgba(50,109,32,0.05)",
              }}
            >
              {/* Cart header */}
              <div
                style={{
                  padding: "13px 16px",
                  background: C.ink,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: "#fff",
                }}
              >
                <span style={{ fontWeight: 800, fontSize: 14 }}>
                  Order Cart
                </span>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      border: "none",
                      color: C.lime,
                      borderRadius: 7,
                      padding: "3px 11px",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
              {/* Cart items */}
              <div
                style={{
                  maxHeight: 240,
                  overflowY: "auto",
                  padding: cart.length === 0 ? 0 : "6px 0",
                }}
              >
                {cart.length === 0 ? (
                  <div
                    style={{
                      padding: "28px 0",
                      textAlign: "center",
                      color: C.muted,
                      fontSize: 13,
                    }}
                  >
                    <ShoppingCart
                      size={28}
                      color={C.greenMid}
                      style={{
                        marginBottom: 8,
                        display: "block",
                        margin: "0 auto 8px",
                      }}
                    />
                    Tap a product to add it
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 14px",
                        borderBottom: `1px solid ${C.border}`,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 12,
                            color: C.ink,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.displayName}
                        </div>
                        <div style={{ fontSize: 11, color: C.muted }}>
                          {fmtPeso(item.price)} each
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          flexShrink: 0,
                        }}
                      >
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            border: `1.5px solid ${C.border}`,
                            background: C.bg,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                            fontWeight: 700,
                            color: C.ink,
                          }}
                        >
                          −
                        </button>
                        <input
                          className="cart-qty-input"
                          type="number"
                          min="1"
                          step="1"
                          value={item.qty}
                          onChange={(e) => setCartQty(item.id, e.target.value)}
                          onBlur={(e) => {
                            if (
                              e.target.value === "" ||
                              Number(e.target.value) < 1
                            ) {
                              setCartQty(item.id, "1");
                            }
                          }}
                          onKeyDown={(e) => {
                            if (
                              e.key === "-" ||
                              e.key === "+" ||
                              e.key === "." ||
                              e.key === "e" ||
                              e.key === "E"
                            ) {
                              e.preventDefault();
                            }
                          }}
                          style={{
                            width: 48,
                            height: 30,
                            border: `1.5px solid ${C.border}`,
                            borderRadius: 8,
                            textAlign: "center",
                            fontFamily: FONT,
                            fontSize: 13,
                            fontWeight: 800,
                            color: C.ink,
                            outline: "none",
                            background: C.white,
                            boxSizing: "border-box",
                          }}
                        />
                        <button
                          onClick={() => updateQty(item.id, +1)}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            border: `1.5px solid ${C.border}`,
                            background: C.bg,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                            fontWeight: 700,
                            color: C.green,
                          }}
                        >
                          +
                        </button>
                      </div>
                      <div
                        style={{
                          minWidth: 56,
                          textAlign: "right",
                          fontWeight: 800,
                          fontSize: 12,
                          color: C.greenDk,
                        }}
                      >
                        {fmtPeso(item.price * item.qty)}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: C.red,
                          cursor: "pointer",
                          padding: 2,
                          fontSize: 16,
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Order options */}
              <div
                style={{
                  padding: "13px 16px",
                  borderTop: `1px solid ${C.border}`,
                }}
              >
                {/* VAT */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: C.muted,
                      textTransform: "uppercase",
                      letterSpacing: ".07em",
                    }}
                  >
                    VAT (12%)
                  </label>
                  <div
                    onClick={() => setVatEnabled((v) => !v)}
                    style={{
                      width: 42,
                      height: 22,
                      borderRadius: 11,
                      cursor: "pointer",
                      position: "relative",
                      background: vatEnabled ? C.green : "#e0e0e0",
                      transition: "background .2s",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 2,
                        left: vatEnabled ? 21 : 2,
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "#fff",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                        transition: "left .2s",
                      }}
                    />
                  </div>
                </div>

                {/* Discount */}
                <div style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: C.muted,
                      textTransform: "uppercase",
                      letterSpacing: ".07em",
                      marginBottom: 6,
                    }}
                  >
                    Discount
                  </div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {[
                      { label: "None", pct: 0, requiresAuth: false },
                      { label: "PWD/Senior", pct: 20, requiresAuth: true },
                      { label: "Others", pct: null, requiresAuth: true },
                    ].map((d) => {
                      const isActive =
                        d.pct !== null
                          ? discountPct === d.pct && discountType === d.label
                          : discountType === "Others";
                      return (
                        <button
                          key={d.label}
                          onClick={() => {
                            if (d.label === "None") {
                              setDiscountPct(0);
                              setDiscountType("None");
                              setShowDiscountAuth(false);
                              setCustomDiscountInput("");
                            } else {
                              setPendingDiscount(d);
                              setDiscountAuthInput("");
                              setDiscountAuthErr("");
                              setCustomDiscountInput("");
                              setShowDiscountAuth(true);
                            }
                          }}
                          style={{
                            height: 30,
                            padding: "0 12px",
                            borderRadius: 8,
                            border: "none",
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: FONT,
                            background: isActive ? C.green : C.greenLt,
                            color: isActive ? "#fff" : C.greenDk,
                          }}
                        >
                          {d.label}
                          {d.pct !== null && d.label !== "None"
                            ? ` (${d.pct}%)`
                            : ""}
                        </button>
                      );
                    })}
                  </div>
                  {discountType &&
                    discountType !== "None" &&
                    discountPct > 0 && (
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 12,
                          color: C.greenDk,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            background: C.greenLt,
                            border: `1px solid ${C.greenMid}`,
                            borderRadius: 20,
                            padding: "2px 10px",
                          }}
                        >
                          {discountType} — {discountPct}% off
                        </span>
                        <button
                          onClick={() => {
                            setDiscountPct(0);
                            setDiscountType("None");
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: C.red,
                            fontSize: 13,
                            fontWeight: 800,
                            padding: 0,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    )}
                </div>

                {/* Totals */}
                <div
                  style={{
                    background: C.bg,
                    border: `1.5px solid ${C.border}`,
                    borderRadius: 11,
                    padding: "11px 13px",
                    marginBottom: 12,
                  }}
                >
                  {[
                    {
                      label: "Subtotal",
                      value: fmtPeso(subtotal),
                      color: C.muted,
                    },
                    ...(discountPct > 0
                      ? [
                          {
                            label: `Discount (${discountPct}%)`,
                            value: `−${fmtPeso(discountAmt)}`,
                            color: C.warn,
                          },
                        ]
                      : []),
                    ...(vatEnabled
                      ? [
                          {
                            label: "VAT (12%)",
                            value: `+${fmtPeso(vatAmt)}`,
                            color: "#1d4ed8",
                          },
                        ]
                      : []),
                  ].map((r) => (
                    <div
                      key={r.label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        color: r.color,
                        marginBottom: 4,
                      }}
                    >
                      <span>{r.label}</span>
                      <span style={{ fontWeight: 700 }}>{r.value}</span>
                    </div>
                  ))}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 16,
                      color: C.ink,
                      fontWeight: 800,
                      paddingTop: 7,
                      borderTop: `1.5px dashed ${C.border}`,
                    }}
                  >
                    <span>Total</span>
                    <span style={{ color: C.greenDk }}>
                      {fmtPeso(totalAmt)}
                    </span>
                  </div>
                </div>

                {/* Payment Method */}
                <div style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: C.muted,
                        textTransform: "uppercase",
                        letterSpacing: ".07em",
                      }}
                    >
                      Payment Method
                    </div>
                    {/* Split toggle */}
                    <button
                      onClick={() => {
                        setIsSplitPayment((v) => !v);
                        setSplitGcashAmt("");
                        setSplitCashAmt("");
                        setSplitGcashPaid(false);
                        setSplitGcashRef("");
                        setGcashRefNumber("");
                        setCashReceived("");
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "3px 10px",
                        borderRadius: 20,
                        border: "none",
                        background: isSplitPayment
                          ? "linear-gradient(135deg,#0072c6,#004f8c)"
                          : C.bg,
                        color: isSplitPayment ? "#fff" : C.muted,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: FONT,
                      }}
                    >
                      <Scissors size={11} />{" "}
                      {isSplitPayment ? "Split ON" : "Split Payment"}
                    </button>
                  </div>

                  {/* Normal payment buttons */}
                  {!isSplitPayment && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      {[
                        {
                          id: "Cash",
                          label: "Cash",
                          icon: <Banknote size={15} />,
                        },
                        {
                          id: "GCash",
                          label: "GCash",
                          icon: <QrCode size={15} />,
                          sub: "PayMongo QR",
                        },
                        {
                          id: "Others",
                          label: "Others",
                          icon: <CreditCard size={15} />,
                        },
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setPaymentMethod(m.id);
                            if (m.id !== "GCash") setGcashRefNumber("");
                          }}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            borderRadius: 10,
                            border: `2px solid ${paymentMethod === m.id ? C.green : C.border}`,
                            background:
                              paymentMethod === m.id ? C.green : "#fff",
                            color: paymentMethod === m.id ? "#fff" : C.ink,
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: FONT,
                            display: "flex",
                            alignItems: "center",
                            gap: 9,
                            transition: "all .15s",
                          }}
                        >
                          {m.icon} <span>{m.label}</span>
                          {m.sub && (
                            <span
                              style={{
                                marginLeft: "auto",
                                fontSize: 11,
                                opacity: 0.75,
                              }}
                            >
                              {m.sub}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* GCash ref badge */}
                  {!isSplitPayment &&
                    paymentMethod === "GCash" &&
                    gcashRefNumber && (
                      <div
                        style={{
                          marginTop: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: "#eff6ff",
                          border: "1px solid #bfdbfe",
                          borderRadius: 8,
                          padding: "6px 12px",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              color: "#1e40af",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                            }}
                          >
                            GCash Ref #
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#1e40af",
                              fontFamily: "monospace",
                            }}
                          >
                            {gcashRefNumber}
                          </div>
                        </div>
                        <button
                          onClick={() => setGcashRefNumber("")}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#93c5fd",
                            fontSize: 16,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    )}

                  {/* Split payment panel */}
                  {isSplitPayment && (
                    <div
                      style={{
                        background: C.bg,
                        border: `1.5px solid ${C.border}`,
                        borderRadius: 12,
                        padding: "14px 14px 10px",
                        marginTop: 4,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 10,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: C.muted,
                          }}
                        >
                          Total to split:
                        </span>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: C.ink,
                          }}
                        >
                          {fmtPeso(totalAmt)}
                        </span>
                      </div>
                      {/* GCash leg */}
                      <div
                        style={{
                          background: splitGcashPaid ? C.greenLt : "#fff",
                          border: `1.5px solid ${splitGcashPaid ? C.green : "#bfdbfe"}`,
                          borderRadius: 10,
                          padding: "10px 12px",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 6,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <div
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: 6,
                                background:
                                  "linear-gradient(135deg,#0072c6,#004f8c)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                              }}
                            >
                              <QrCode size={12} />
                            </div>
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#1e40af",
                              }}
                            >
                              GCash amount
                            </span>
                          </div>
                          {splitGcashPaid && (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: C.greenDk,
                                background: C.greenLt,
                                padding: "2px 8px",
                                borderRadius: 20,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <Check size={10} /> Paid
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <div style={{ position: "relative", flex: 1 }}>
                            <span
                              style={{
                                position: "absolute",
                                left: 10,
                                top: "50%",
                                transform: "translateY(-50%)",
                                fontSize: 13,
                                fontWeight: 700,
                                color: C.muted,
                              }}
                            >
                              ₱
                            </span>
                            <input
                              type="number"
                              placeholder="0.00"
                              value={splitGcashAmt}
                              disabled={splitGcashPaid}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSplitGcashAmt(val);
                                const g = parseFloat(val) || 0;
                                const rem = Math.max(0, totalAmt - g);
                                setSplitCashAmt(rem > 0 ? rem.toFixed(2) : "");
                              }}
                              style={{
                                ...inp,
                                paddingLeft: 24,
                                opacity: splitGcashPaid ? 0.6 : 1,
                                cursor: splitGcashPaid ? "not-allowed" : "text",
                              }}
                            />
                          </div>
                          {!splitGcashPaid ? (
                            <button
                              onClick={() => {
                                const g = parseFloat(splitGcashAmt);
                                if (!g || g <= 0) {
                                  showAlert(
                                    "Invalid Amount",
                                    "Enter a valid GCash amount.",
                                    "error",
                                  );
                                  return;
                                }
                                if (g > totalAmt) {
                                  showAlert(
                                    "Too Much",
                                    "GCash amount cannot exceed total.",
                                    "error",
                                  );
                                  return;
                                }
                                if (g < 100) {
                                  showAlert(
                                    "Minimum ₱100",
                                    "Minimum GCash amount via PayMongo is ₱100.",
                                    "error",
                                  );
                                  return;
                                }
                                setGcashPaymentAmt(g);
                                setShowGCashModal(true);
                              }}
                              style={{
                                padding: "0 14px",
                                height: 36,
                                borderRadius: 9,
                                border: "none",
                                background:
                                  "linear-gradient(135deg,#0072c6,#004f8c)",
                                color: "#fff",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                                fontFamily: FONT,
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                              }}
                            >
                              Pay GCash
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSplitGcashPaid(false);
                                setSplitGcashRef("");
                                setGcashRefNumber("");
                                setSplitCashAmt("");
                              }}
                              style={{
                                padding: "0 10px",
                                height: 36,
                                borderRadius: 9,
                                border: `1px solid ${C.redBorder}`,
                                background: C.redBg,
                                color: C.red,
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: "pointer",
                                fontFamily: FONT,
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                              }}
                            >
                              Redo
                            </button>
                          )}
                        </div>
                        {splitGcashPaid && splitGcashRef && (
                          <div
                            style={{
                              marginTop: 5,
                              fontSize: 11,
                              color: C.greenDk,
                              fontFamily: "monospace",
                              fontWeight: 600,
                            }}
                          >
                            Ref: {splitGcashRef}
                          </div>
                        )}
                      </div>
                      {/* Cash leg */}
                      <div
                        style={{
                          background: "#fff",
                          border: `1.5px solid ${C.greenMid}`,
                          borderRadius: 10,
                          padding: "10px 12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 6,
                          }}
                        >
                          <div
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 6,
                              background: C.green,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                              fontWeight: 900,
                              color: "#fff",
                            }}
                          >
                            ₱
                          </div>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: C.greenDk,
                            }}
                          >
                            Cash amount
                          </span>
                        </div>
                        <div style={{ position: "relative" }}>
                          <span
                            style={{
                              position: "absolute",
                              left: 10,
                              top: "50%",
                              transform: "translateY(-50%)",
                              fontSize: 13,
                              fontWeight: 700,
                              color: C.muted,
                            }}
                          >
                            ₱
                          </span>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={splitCashAmt}
                            onChange={(e) => setSplitCashAmt(e.target.value)}
                            style={{ ...inp, paddingLeft: 24 }}
                          />
                        </div>
                      </div>
                      {/* Split summary */}
                      {(parseFloat(splitGcashAmt) || 0) +
                        (parseFloat(splitCashAmt) || 0) >
                        0 &&
                        (() => {
                          const gcash = parseFloat(splitGcashAmt) || 0;
                          const cash = parseFloat(splitCashAmt) || 0;
                          const covered = gcash + cash;
                          const shortfall = totalAmt - covered;
                          const change = covered - totalAmt;
                          return (
                            <div
                              style={{
                                marginTop: 10,
                                padding: "8px 10px",
                                background:
                                  Math.abs(shortfall) < 0.01
                                    ? C.greenLt
                                    : shortfall > 0
                                      ? C.warnBg
                                      : C.greenLt,
                                borderRadius: 8,
                                fontSize: 12,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  color: C.muted,
                                  marginBottom: 2,
                                }}
                              >
                                <span>GCash</span>
                                <span style={{ fontWeight: 700 }}>
                                  {fmtPeso(gcash)}
                                </span>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  color: C.muted,
                                  marginBottom: 4,
                                }}
                              >
                                <span>Cash</span>
                                <span style={{ fontWeight: 700 }}>
                                  {fmtPeso(cash)}
                                </span>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  borderTop: "1px solid rgba(0,0,0,0.06)",
                                  paddingTop: 4,
                                }}
                              >
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                    fontWeight: 800,
                                    color:
                                      shortfall > 0.01 ? C.warn : C.greenDk,
                                  }}
                                >
                                  {shortfall > 0.01 ? (
                                    <>
                                      <AlertTriangle size={11} /> Short by
                                    </>
                                  ) : change > 0.01 ? (
                                    "Change due"
                                  ) : (
                                    <>
                                      <Check size={11} /> Exact
                                    </>
                                  )}
                                </span>
                                <span
                                  style={{
                                    fontWeight: 800,
                                    color:
                                      shortfall > 0.01 ? C.warn : C.greenDk,
                                  }}
                                >
                                  {shortfall > 0.01
                                    ? fmtPeso(shortfall)
                                    : change > 0.01
                                      ? fmtPeso(change)
                                      : ""}
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                    </div>
                  )}
                </div>

                {/* Cash received (normal) */}
                {!isSplitPayment && paymentMethod === "Cash" && (
                  <div style={{ marginBottom: 10 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: C.muted,
                        textTransform: "uppercase",
                        letterSpacing: ".07em",
                        marginBottom: 5,
                      }}
                    >
                      Cash Received
                    </div>
                    <input
                      type="number"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder="0.00"
                      style={{
                        ...inp,
                        fontSize: 16,
                        fontWeight: 800,
                        textAlign: "right",
                      }}
                    />
                    {cashReceived !== "" && (
                      <div
                        style={{
                          marginTop: 5,
                          fontSize: 13,
                          fontWeight: 700,
                          textAlign: "right",
                          color: cashShortfall < 0 ? C.red : C.greenDk,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: 5,
                        }}
                      >
                        {cashShortfall < 0 ? (
                          <>
                            <AlertTriangle size={12} /> Short by{" "}
                            {fmtPeso(Math.abs(cashShortfall))}
                          </>
                        ) : (
                          <>
                            <Check size={12} /> Change: {fmtPeso(changeDue)}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Note */}
                <div style={{ marginBottom: 12 }}>
                  <textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Order note (optional)..."
                    rows={2}
                    style={{
                      ...inp,
                      resize: "none",
                      lineHeight: 1.5,
                      height: "auto",
                      padding: "8px 11px",
                    }}
                  />
                </div>

                {/* Charge button */}
                <button
                  onClick={processSale}
                  disabled={processing || cart.length === 0}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    padding: "13px 0",
                    borderRadius: 999,
                    border: "none",
                    background:
                      cart.length === 0 || processing
                        ? "#e0e0e0"
                        : isSplitPayment
                          ? (() => {
                              const g = parseFloat(splitGcashAmt) || 0;
                              const c = parseFloat(splitCashAmt) || 0;
                              const ok =
                                Math.abs(g + c - totalAmt) < 0.01 &&
                                (!g || splitGcashPaid);
                              return ok ? C.green : "#e0e0e0";
                            })()
                          : paymentMethod === "GCash" && !gcashRefNumber
                            ? "linear-gradient(135deg,#0072c6,#004f8c)"
                            : C.green,
                    color: cart.length === 0 || processing ? "#9e9e9e" : "#fff",
                    fontSize: 15,
                    fontWeight: 900,
                    cursor:
                      cart.length === 0 || processing
                        ? "not-allowed"
                        : "pointer",
                    fontFamily: FONT,
                    opacity: processing ? 0.7 : 1,
                    boxShadow:
                      cart.length === 0 || processing
                        ? "none"
                        : "0 10px 24px rgba(59,121,30,0.22)",
                  }}
                >
                  {processing ? (
                    <>
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          border: "2px solid rgba(255,255,255,0.4)",
                          borderTopColor: "#fff",
                          borderRadius: "50%",
                          animation: "spin .8s linear infinite",
                        }}
                      />{" "}
                      Processing...
                    </>
                  ) : isSplitPayment ? (
                    (() => {
                      const g = parseFloat(splitGcashAmt) || 0;
                      const c = parseFloat(splitCashAmt) || 0;
                      const covered = Math.abs(g + c - totalAmt) < 0.01;
                      const gcashDone = !g || splitGcashPaid;
                      if (!covered)
                        return `Enter amounts totalling ${fmtPeso(totalAmt)}`;
                      if (!gcashDone) return "Complete GCash payment first";
                      return (
                        <>
                          <CreditCard size={16} /> Charge {fmtPeso(totalAmt)}{" "}
                          (Split)
                        </>
                      );
                    })()
                  ) : paymentMethod === "GCash" && !gcashRefNumber ? (
                    <>
                      <QrCode size={16} /> Scan GCash QR — {fmtPeso(totalAmt)}
                    </>
                  ) : (
                    <>
                      <CreditCard size={16} /> Charge {fmtPeso(totalAmt)}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HISTORY TAB                                                          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "history" && (
        <>
          <div
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: "12px 16px",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div style={{ position: "relative", flex: "1 1 200px" }}>
                <Search
                  size={13}
                  color={C.muted}
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search ID or cashier..."
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  style={{ ...inp, paddingLeft: 30 }}
                />
              </div>
              <input
                type="date"
                value={txDateFrom}
                onChange={(e) => setTxDateFrom(e.target.value)}
                style={{ ...inp, width: 150 }}
              />
              <input
                type="date"
                value={txDateTo}
                onChange={(e) => setTxDateTo(e.target.value)}
                style={{ ...inp, width: 150 }}
              />
              {(txSearch || txDateFrom || txDateTo) && (
                <button
                  onClick={() => {
                    setTxSearch("");
                    setTxDateFrom("");
                    setTxDateTo("");
                  }}
                  style={{ ...smallBtn, color: C.green, borderColor: C.border }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 2px 10px rgba(50,109,32,0.05)",
            }}
          >
            <div
              style={{
                padding: "13px 18px",
                background: C.ink,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "#fff",
              }}
            >
              <span style={{ fontWeight: 800, fontSize: 13 }}>
                Transaction History
              </span>
              <span style={{ fontSize: 12, opacity: 0.75 }}>
                {filteredTx.length} records
              </span>
            </div>
            {loadingTx ? (
              <div
                style={{
                  padding: "48px 0",
                  textAlign: "center",
                  color: C.muted,
                  fontSize: 13,
                }}
              >
                Loading...
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr>
                      {[
                        "#",
                        "Date",
                        "Cashier",
                        "Items",
                        "Subtotal",
                        "Disc",
                        "VAT",
                        "Total",
                        "Payment",
                        "Status",
                        "",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "10px 12px",
                            textAlign: "left",
                            fontWeight: 800,
                            fontSize: 10.5,
                            color: C.greenDk,
                            letterSpacing: "0.07em",
                            textTransform: "uppercase",
                            borderBottom: `2px solid ${C.border}`,
                            background: C.bg,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {txPageItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={11}
                          style={{
                            padding: "48px 0",
                            textAlign: "center",
                            color: C.muted,
                            fontSize: 13,
                          }}
                        >
                          No transactions found.
                        </td>
                      </tr>
                    ) : (
                      txPageItems.map((tx) => (
                        <tr
                          key={tx.id}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#f6faf3")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                          style={{
                            borderBottom: `1px solid ${C.border}`,
                            opacity: tx.voided ? 0.5 : 1,
                          }}
                        >
                          <td
                            style={{
                              padding: "10px 12px",
                              color: C.muted,
                              fontSize: 12,
                            }}
                          >
                            #{tx.id}
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              color: C.muted,
                              fontSize: 12,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {new Date(tx.created_at).toLocaleString("en-PH", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              fontWeight: 600,
                              color: C.ink,
                            }}
                          >
                            {tx.cashier}
                          </td>
                          <td style={{ padding: "10px 12px", color: C.muted }}>
                            {(tx.items || []).length}
                          </td>
                          <td style={{ padding: "10px 12px", color: C.muted }}>
                            {fmtPeso(tx.subtotal)}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            {tx.discount_pct > 0 ? (
                              <span style={{ color: C.warn, fontWeight: 700 }}>
                                −{tx.discount_pct}%
                              </span>
                            ) : (
                              <span style={{ color: C.muted }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            {tx.vat_enabled ? (
                              <span
                                style={{ color: "#1d4ed8", fontWeight: 700 }}
                              >
                                +{fmtPeso(tx.vat_amt)}
                              </span>
                            ) : (
                              <span style={{ color: C.muted }}>—</span>
                            )}
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              fontWeight: 800,
                              color: C.greenDk,
                            }}
                          >
                            {fmtPeso(tx.total)}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <span
                              style={{
                                padding: "3px 9px",
                                borderRadius: 20,
                                fontSize: 11,
                                fontWeight: 700,
                                background:
                                  tx.payment_method === "Cash"
                                    ? C.okBg
                                    : tx.payment_method === "Split"
                                      ? "#f3e8ff"
                                      : "#eff6ff",
                                color:
                                  tx.payment_method === "Cash"
                                    ? C.greenDk
                                    : tx.payment_method === "Split"
                                      ? "#6b21a8"
                                      : "#1d4ed8",
                              }}
                            >
                              {tx.payment_method}
                            </span>
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            {tx.voided ? (
                              <span
                                style={{
                                  padding: "3px 9px",
                                  borderRadius: 20,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  background: C.redBg,
                                  color: C.red,
                                }}
                              >
                                VOIDED
                              </span>
                            ) : (
                              <span
                                style={{
                                  padding: "3px 9px",
                                  borderRadius: 20,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  background: C.okBg,
                                  color: C.greenDk,
                                }}
                              >
                                PAID
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            {!tx.voided && (
                              <button
                                onClick={() => handleVoidRequest(tx)}
                                style={{
                                  ...smallBtn,
                                  color: C.red,
                                  borderColor: C.redBorder,
                                  background: "#fff",
                                }}
                              >
                                Void
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {filteredTx.length > TX_PAGE_SIZE && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "11px 16px",
                  borderTop: `1px solid ${C.border}`,
                  background: "#f9fefb",
                }}
              >
                <span style={{ fontSize: 12, color: C.muted }}>
                  {txPage * TX_PAGE_SIZE + 1}–
                  {Math.min((txPage + 1) * TX_PAGE_SIZE, filteredTx.length)} of{" "}
                  {filteredTx.length}
                </span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    onClick={() => setTxPage((p) => Math.max(0, p - 1))}
                    disabled={txPage === 0}
                    style={{ ...smallBtn, opacity: txPage === 0 ? 0.35 : 1 }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={() =>
                      setTxPage((p) =>
                        Math.min(
                          Math.ceil(filteredTx.length / TX_PAGE_SIZE) - 1,
                          p + 1,
                        ),
                      )
                    }
                    disabled={
                      txPage >= Math.ceil(filteredTx.length / TX_PAGE_SIZE) - 1
                    }
                    style={{
                      ...smallBtn,
                      opacity:
                        txPage >=
                        Math.ceil(filteredTx.length / TX_PAGE_SIZE) - 1
                          ? 0.35
                          : 1,
                    }}
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* VOIDED TAB                                                           */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "voided" &&
        (() => {
          const voidedList = transactions.filter((tx) => tx.voided);
          return (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 12,
                  marginBottom: 18,
                }}
              >
                {[
                  {
                    label: "Total Voided",
                    value: voidedList.length,
                    sub: "All time",
                  },
                  {
                    label: "Total Amount Voided",
                    value: fmtPeso(
                      voidedList.reduce((s, t) => s + Number(t.total || 0), 0),
                    ),
                    sub: "Lost revenue",
                  },
                  {
                    label: "Today Voided",
                    value: voidedList.filter((t) =>
                      (t.created_at || "").startsWith(
                        new Date().toISOString().slice(0, 10),
                      ),
                    ).length,
                    sub: "Today only",
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      background: C.white,
                      border: `1px solid ${C.redBorder}`,
                      borderRadius: 18,
                      padding: "16px 18px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: C.red,
                        marginBottom: 6,
                      }}
                    >
                      {s.label}
                    </div>
                    <div
                      style={{ fontSize: 24, fontWeight: 800, color: C.ink }}
                    >
                      {s.value}
                    </div>
                    <div
                      style={{ fontSize: 11.5, color: C.muted, marginTop: 4 }}
                    >
                      {s.sub}
                    </div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  background: C.white,
                  border: `1px solid ${C.redBorder}`,
                  borderRadius: 18,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "13px 18px",
                    background: `linear-gradient(135deg,#e74c3c,${C.red})`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    color: "#fff",
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: 13 }}>
                    Voided Transactions
                  </span>
                  <span style={{ fontSize: 12, opacity: 0.9 }}>
                    {voidedList.length} record
                    {voidedList.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {voidedList.length === 0 ? (
                  <div
                    style={{
                      padding: "52px 0",
                      textAlign: "center",
                      color: C.muted,
                      fontSize: 13,
                    }}
                  >
                    <Inbox
                      size={30}
                      color={C.greenMid}
                      style={{ marginBottom: 10 }}
                    />
                    <div style={{ fontWeight: 700 }}>
                      No voided transactions
                    </div>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: 13,
                      }}
                    >
                      <thead>
                        <tr>
                          {[
                            "#",
                            "Date",
                            "Cashier",
                            "Items",
                            "Total",
                            "Payment",
                            "Discount",
                          ].map((h) => (
                            <th
                              key={h}
                              style={{
                                padding: "10px 12px",
                                textAlign: "left",
                                fontWeight: 800,
                                fontSize: 10.5,
                                color: C.red,
                                letterSpacing: "0.07em",
                                textTransform: "uppercase",
                                borderBottom: `1px solid ${C.redBorder}`,
                                background: C.redBg,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {voidedList.map((tx) => (
                          <tr
                            key={tx.id}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = C.redBg)
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                            style={{ borderBottom: `1px solid ${C.redBg}` }}
                          >
                            <td
                              style={{
                                padding: "10px 12px",
                                color: C.muted,
                                fontSize: 12,
                              }}
                            >
                              #{tx.id}
                            </td>
                            <td
                              style={{
                                padding: "10px 12px",
                                color: C.muted,
                                fontSize: 12,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {new Date(tx.created_at).toLocaleString("en-PH", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td
                              style={{
                                padding: "10px 12px",
                                fontWeight: 600,
                                color: C.ink,
                              }}
                            >
                              {tx.cashier}
                            </td>
                            <td
                              style={{ padding: "10px 12px", color: C.muted }}
                            >
                              {(tx.items || []).length}
                            </td>
                            <td
                              style={{
                                padding: "10px 12px",
                                fontWeight: 800,
                                color: C.red,
                                textDecoration: "line-through",
                              }}
                            >
                              {fmtPeso(tx.total)}
                            </td>
                            <td style={{ padding: "10px 12px" }}>
                              <span
                                style={{
                                  padding: "3px 8px",
                                  borderRadius: 20,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  background: C.redBg,
                                  color: C.red,
                                }}
                              >
                                {tx.payment_method}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "10px 12px",
                                color: C.muted,
                                fontSize: 12,
                              }}
                            >
                              {tx.discount_pct > 0 ? (
                                <span
                                  style={{ color: C.warn, fontWeight: 700 }}
                                >
                                  {tx.discount_label || tx.discount_pct + "%"}
                                </span>
                              ) : (
                                <span style={{ color: C.muted }}>—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          );
        })()}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAFF DASHBOARD SHELL
// ─────────────────────────────────────────────────────────────────────────────
export default function StaffDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const confirmLogout = async () => {
    try {
      const stored =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      const userId = stored ? JSON.parse(stored)?.id : null;

      await adminModuleFetch(`${process.env.REACT_APP_API_URL}/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("rememberedUser");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("tempUser");
      sessionStorage.removeItem("fr_activeModule");
      setShowLogoutModal(false);
      window.location.href = "/admin-login";
    }
  };

  return (
    <div
      style={{
        fontFamily: FONT,
        minHeight: "100vh",
        background: "#F6F7F1",
        backgroundImage: `radial-gradient(${C.border} 1px, transparent 1px)`,
        backgroundSize: "22px 22px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
      `}</style>

      {/* Top bar */}
      <div
        style={{
          background: C.white,
          padding: "14px 30px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img
            src={logoSync}
            alt="FranchiSync"
            style={{ height: 40, width: "auto", objectFit: "contain" }}
          />
          <div style={{ width: 1, height: 26, background: C.border }} />
          <h1
            style={{
              fontFamily: FONT,
              fontSize: "1.15rem",
              fontWeight: 800,
              color: C.ink,
              margin: 0,
            }}
          >
            Point of Sale
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700, color: C.ink, fontSize: "0.95rem" }}>
              {user.name}
            </div>
            <div style={{ fontSize: "0.8rem", color: C.muted }}>
              {user.role} — {user.branch}
            </div>
          </div>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: C.ink,
              color: C.lime,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {user.name ? user.name.trim()[0].toUpperCase() : "S"}
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            style={{
              ...btnSt,
              background: C.red,
              color: "#fff",
              border: "none",
              boxShadow: "0 10px 24px rgba(192,57,43,0.22)",
            }}
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </div>

      <POSContent user={user} />

      {/* Logout modal */}
      {showLogoutModal && (
        <div
          onClick={() => setShowLogoutModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(18,36,27,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3000,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: C.white,
              borderRadius: 22,
              padding: "32px 36px",
              maxWidth: 400,
              width: "90%",
              textAlign: "center",
              boxShadow: "0 24px 80px rgba(18,36,27,0.25)",
              border: `1px solid ${C.border}`,
              fontFamily: FONT,
            }}
          >
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 20,
                background: C.redBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                border: `1.5px solid ${C.redBorder}`,
              }}
            >
              <LogOut size={28} color={C.red} strokeWidth={1.75} />
            </div>
            <h2
              style={{
                fontFamily: FONT,
                fontSize: 20,
                fontWeight: 800,
                color: C.ink,
                marginBottom: 8,
              }}
            >
              Log out?
            </h2>
            <p
              style={{
                color: C.muted,
                fontSize: 13,
                marginBottom: 28,
                lineHeight: 1.6,
              }}
            >
              You will need to sign in again to access your account.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{ flex: 1, ...btnSt, justifyContent: "center" }}
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                style={{
                  flex: 1,
                  ...btnPrimarySt,
                  justifyContent: "center",
                  background: `linear-gradient(135deg,#e74c3c,${C.red})`,
                  boxShadow: "0 10px 24px rgba(192,57,43,0.25)",
                }}
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
