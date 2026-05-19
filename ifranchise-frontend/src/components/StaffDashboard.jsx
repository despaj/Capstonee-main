import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Search, ShoppingCart, AlertTriangle, Check, X,
  Printer, CreditCard, QrCode, Banknote, RefreshCw,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const fmtPeso = (n) =>
  '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = () =>
  new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });

const fmtTime = () =>
  new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const generateReceiptNo = () => 'OR-' + Date.now().toString().slice(-8);
const generateTxnId     = () => 'TXN-' + Math.random().toString(36).toUpperCase().slice(2, 10);

const VAT_RATE        = 0.12;
const MANAGER_PASSWORD = 'Admin123'; // same as admin POS

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM MODAL
// ─────────────────────────────────────────────────────────────────────────────
function Modal({ show, title, message, type = 'info', onConfirm, onCancel, confirmText = 'OK', cancelText = 'Cancel', showCancel = false }) {
  if (!show) return null;
  const colors = {
    info:    { bg: '#e0f2f1', icon: '#00897b', border: '#b2dfdb' },
    error:   { bg: '#fee2e2', icon: '#dc2626', border: '#fca5a5' },
    success: { bg: '#dcfce7', icon: '#16a34a', border: '#86efac' },
    warning: { bg: '#fef9c3', icon: '#d97706', border: '#fde68a' },
  };
  const c = colors[type] || colors.info;
  const icons = {
    info: <Check size={22} />, error: <X size={22} />,
    success: <Check size={22} />, warning: <AlertTriangle size={22} />,
  };
  return (
    <div onClick={showCancel ? onCancel : onConfirm}
      style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 20, padding: '36px 32px', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', border: `1px solid ${c.border}` }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: c.icon }}>
          {icons[type]}
        </div>
        <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 18, fontWeight: 800, color: '#0d2b1e', marginBottom: 10 }}>{title}</h3>
        <p style={{ fontSize: 13, color: '#5a7a65', lineHeight: 1.7, marginBottom: 26 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          {showCancel && (
            <button onClick={onCancel}
              style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              {cancelText}
            </button>
          )}
          <button onClick={onConfirm}
            style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: type === 'error' ? '#dc2626' : 'linear-gradient(135deg,#2E7D32,#00897b)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYMONGO GCASH MODAL  — identical to admin POS
// ─────────────────────────────────────────────────────────────────────────────
function GCashQRModal({ totalAmt, onConfirm, onCancel, fmtPHP }) {
  const [step,      setStep]      = React.useState('loading');
  const [qrUrl,     setQrUrl]     = React.useState('');
  const [linkId,    setLinkId]    = React.useState('');
  const [refNo,     setRefNo]     = React.useState('');
  const [gcashRef,  setGcashRef]  = React.useState('');
  const [errorMsg,  setErrorMsg]  = React.useState('');
  const [countdown, setCountdown] = React.useState(180);
  const pollRef  = React.useRef(null);
  const timerRef = React.useRef(null);

  React.useEffect(() => {
    const create = async () => {
      try {
        const res  = await fetch(`${process.env.REACT_APP_API_URL}/paymongo/create-gcash`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: totalAmt, description: 'iFranchise POS Payment', orderId: Date.now() }),
        });
        const data = await res.json();
        if (!data.success) { setErrorMsg(data.error || 'Failed to create payment link.'); setStep('error'); return; }
        const qr = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.checkoutUrl)}`;
        setQrUrl(qr);
        setLinkId(data.linkId);
        setRefNo(data.referenceNo);
        setStep('ready');
        startPolling(data.linkId);
        startCountdown();
      } catch { setErrorMsg('Could not reach payment server.'); setStep('error'); }
    };
    create();
    return () => { clearInterval(pollRef.current); clearInterval(timerRef.current); };
  }, []);

  const startPolling = (id) => {
    pollRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`${process.env.REACT_APP_API_URL}/paymongo/link-status/${id}`);
        const data = await res.json();
        if (data.status === 'paid') {
          clearInterval(pollRef.current);
          clearInterval(timerRef.current);
          setGcashRef(data.gcashRef || refNo);
          setStep('paid');
          setTimeout(() => onConfirm(data.gcashRef || refNo), 1500);
        }
      } catch {}
    }, 3000);
  };

  const startCountdown = () => {
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          clearInterval(pollRef.current);
          setStep('error');
          setErrorMsg('Payment window expired. Please try again.');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleRetry = () => {
    clearInterval(pollRef.current);
    clearInterval(timerRef.current);
    setStep('loading');
    setCountdown(180);
    setErrorMsg('');
  };

  const fmtCountdown = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: 20, backdropFilter: 'blur(6px)' }}>
      <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 400, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.3)', fontFamily: "'Montserrat',sans-serif", animation: 'gcashSlideUp .25s cubic-bezier(.22,1,.36,1)' }}>
        <style>{`
          @keyframes gcashSlideUp { from{opacity:0;transform:translateY(28px) scale(0.97);} to{opacity:1;transform:translateY(0) scale(1);} }
          @keyframes paidPop { 0%{transform:scale(0.8);opacity:0;} 70%{transform:scale(1.1);} 100%{transform:scale(1);opacity:1;} }
          @keyframes scanLine { 0%{top:0;} 100%{top:196px;} }
        `}</style>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#007acc,#0057a8)', padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 17, color: '#007acc' }}>G</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 15, color: '#fff' }}>GCash via PayMongo</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                {step === 'loading' && 'Generating payment link…'}
                {step === 'ready'   && `Waiting for payment · ${fmtCountdown(countdown)}`}
                {step === 'paid'    && 'Payment confirmed ✓'}
                {step === 'error'   && 'Payment failed'}
              </div>
            </div>
          </div>
          <button onClick={onCancel} style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.15)', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>×</button>
        </div>
        {/* Amount bar */}
        <div style={{ background: '#f0f7ff', padding: '12px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#5a7a65', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Amount</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#0057a8' }}>{fmtPHP(totalAmt)}</div>
        </div>
        {/* Body */}
        <div style={{ padding: '22px 24px 24px', textAlign: 'center' }}>
          {step === 'loading' && (
            <div style={{ padding: '32px 0' }}>
              <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="#007acc" strokeWidth={2} style={{ animation: 'spin 0.8s linear infinite', marginBottom: 12 }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
              <div style={{ fontSize: 14, color: '#5a7a65', fontWeight: 600 }}>Creating payment link…</div>
            </div>
          )}
          {(step === 'ready') && qrUrl && (
            <>
              <div style={{ fontSize: 13, color: '#374151', fontWeight: 600, marginBottom: 14 }}>Ask the customer to scan this QR code with their GCash app</div>
              <div style={{ width: 200, height: 200, margin: '0 auto 14px', border: '3px solid #007acc', borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
                <img src={qrUrl} alt="PayMongo GCash QR" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#007acc,transparent)', animation: 'scanLine 2s linear infinite' }} />
              </div>
              {refNo && <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12 }}>Ref # <strong style={{ color: '#374151', fontFamily: 'monospace' }}>{refNo}</strong></div>}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: countdown < 30 ? '#fee2e2' : '#f0f7ff', border: `1px solid ${countdown < 30 ? '#fecaca' : '#bfdbfe'}`, borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 700, color: countdown < 30 ? '#dc2626' : '#1e40af', marginBottom: 16 }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                Expires in {fmtCountdown(countdown)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 12, color: '#5a7a65' }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#007acc" strokeWidth={2} style={{ animation: 'spin 1.2s linear infinite', flexShrink: 0 }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                Waiting for payment confirmation…
              </div>
              <button onClick={onCancel} style={{ marginTop: 14, width: '100%', padding: '10px 0', borderRadius: 10, border: '1.5px solid #d1d5db', background: '#f9fafb', color: '#6b7280', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel payment</button>
            </>
          )}
          {step === 'paid' && (
            <div style={{ padding: '24px 0', animation: 'paidPop .4s ease' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#059669,#047857)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 20px rgba(5,150,105,0.4)' }}>
                <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div style={{ fontWeight: 900, fontSize: 18, color: '#0d2b1e', marginBottom: 6 }}>Payment Received!</div>
              <div style={{ fontSize: 13, color: '#5a7a65', marginBottom: 10 }}>{fmtPHP(totalAmt)} via GCash</div>
              {gcashRef && <div style={{ background: '#f0fdf5', border: '1px solid #d1eedd', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 700, color: '#00695c', fontFamily: 'monospace', letterSpacing: '0.05em' }}>Ref: {gcashRef}</div>}
              <div style={{ marginTop: 12, fontSize: 12, color: '#9ca3af' }}>Processing transaction…</div>
            </div>
          )}
          {step === 'error' && (
            <div style={{ padding: '24px 0' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth={2.5} strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
              </div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#0d2b1e', marginBottom: 6 }}>Payment Failed</div>
              <div style={{ fontSize: 13, color: '#5a7a65', marginBottom: 20 }}>{errorMsg}</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={onCancel} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #d1d5db', background: '#f9fafb', color: '#6b7280', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                <button onClick={handleRetry} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#007acc,#0057a8)', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>Try Again</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RECEIPT PRINT — Legal landscape 2-copy (identical to admin POS)
// ─────────────────────────────────────────────────────────────────────────────
function ReceiptModal({ show, receipt, onClose, onNewSale }) {
  if (!show || !receipt) return null;

  const handlePrint = () => {
    const printWin = window.open('', '_blank', 'width=1360,height=860,resizable=yes');

    const copyHTML = (label) => `
      <div class="copy">
        <div class="copy-label">${label}</div>
        <div class="center bold" style="font-size:12px">iFranchise Business and Services Corporation</div>
        <div class="center bold" style="font-size:11px">FranchiSync</div>
        <div class="center header" style="margin-top:5px">
          Main Office: Blk 113 Bldg. Connecticut St.,<br>
          Greenhills San Juan City, Philippines<br>
          Contact No.: 09271820495<br>
          Email: franchise.ordering@gmail.com
        </div>
        <div class="center header" style="margin-top:5px">
          VAT Registered TIN: _______________<br>
          Permit No.: _______________<br>
          Serial No.: _______________
        </div>
        <div class="divider-dash"></div>
        <div class="center bold" style="font-size:11px;margin-bottom:5px">SALES INVOICE</div>
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
        ${(receipt.items || []).map(item => `
          <div class="item-row">
            <span class="col-item">${item.name}</span>
            <span class="col-qty">${item.qty}</span>
            <span class="col-price">P${Number(item.price).toFixed(2)}</span>
            <span class="col-total">P${Number(item.subtotal).toFixed(2)}</span>
          </div>
        `).join('')}
        <div class="divider-solid"></div>
        <div class="row"><span>SUBTOTAL</span><span>P${Number(receipt.subtotal).toFixed(2)}</span></div>
        ${receipt.vat_enabled ? `<div class="row"><span>VAT 12%</span><span>P${Number(receipt.vat_amt || 0).toFixed(2)}</span></div>` : ''}
        ${receipt.discount_pct > 0 ? `<div class="row"><span>DISCOUNT (${receipt.discount_label || receipt.discount_pct + '%'})</span><span>-P${Number(receipt.discount_amt || 0).toFixed(2)}</span></div>` : ''}
        <div class="divider-solid"></div>
        <div class="row bold" style="font-size:10px"><span>TOTAL</span><span>P${Number(receipt.total).toFixed(2)}</span></div>
        ${receipt.payment_method === 'Cash' ? `
          <div class="row"><span>CASH</span><span>P${Number(receipt.cash_received).toFixed(2)}</span></div>
          <div class="row"><span>CHANGE</span><span>P${Number(receipt.change_due).toFixed(2)}</span></div>
        ` : ''}
        ${receipt.is_split ? `
          <div class="row"><span>GCASH</span><span>P${Number(receipt.split_gcash_amt || 0).toFixed(2)}</span></div>
          ${receipt.gcash_ref ? `<div class="row"><span>GCash Ref</span><span>${receipt.gcash_ref}</span></div>` : ''}
          <div class="row"><span>CASH</span><span>P${Number(receipt.split_cash_amt || 0).toFixed(2)}</span></div>
        ` : ''}
        <div class="divider-dash"></div>
        <div class="header">
          <div><b>Payment Method:</b> ${receipt.payment_method}</div>
          ${receipt.gcash_ref && !receipt.is_split ? `<div><b>GCash Ref #:</b> ${receipt.gcash_ref}</div>` : ''}
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
      </div>
    `;

    const css = [
      '* { margin: 0; padding: 0; box-sizing: border-box; }',
      'body { font-family: Courier New, monospace; background: #f0f0f0; color: #000; display: flex; justify-content: center; align-items: flex-start; padding: 24px; min-height: 100vh; }',
      '.page-wrapper { background: #fff; display: flex; flex-direction: row; align-items: flex-start; box-shadow: 0 2px 16px rgba(0,0,0,0.15); padding: 14px 10px; width: fit-content; }',
      '.copy { width: 165mm; padding: 6px 10px; font-size: 10px; }',
      '.cut-line { width: 1px; min-height: 100%; border-left: 1.5px dashed #555; margin: 0 10px; align-self: stretch; position: relative; }',
      ".cut-line::after { content: 'CUT'; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(90deg); font-size: 7px; color: #888; background: #fff; padding: 2px 4px; letter-spacing: 0.1em; white-space: nowrap; }",
      '.copy-label { text-align: center; font-size: 9px; font-weight: 700; border: 1px solid #000; padding: 2px 4px; margin-bottom: 6px; letter-spacing: 0.06em; }',
      '.center { text-align: center; }',
      '.bold { font-weight: 700; }',
      '.row { display: flex; justify-content: space-between; font-size: 9px; line-height: 1.65; }',
      '.item-row { display: flex; font-size: 9px; line-height: 1.65; }',
      '.col-item { width: 44%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }',
      '.col-qty { width: 10%; text-align: right; }',
      '.col-price { width: 22%; text-align: right; }',
      '.col-total { width: 22%; text-align: right; }',
      '.divider-solid { border-top: 1px solid #000; margin: 4px 0; }',
      '.divider-dash { border-top: 1px dashed #000; margin: 4px 0; }',
      '.header { font-size: 9px; line-height: 1.7; }',
      '@media print {',
      '  body { background: #fff; display: block; padding: 0; }',
      '  .page-wrapper { box-shadow: none; padding: 0; width: 100%; }',
      '  .copy { width: 48%; padding: 4px 8px; }',
      '  .cut-line { width: 4px; margin: 0 4px; }',
      '  @page { size: legal landscape; margin: 8mm 10mm; }',
      '}',
    ].join('\n');

    const html = [
      '<!DOCTYPE html><html><head>',
      '<title>Sales Invoice - ' + receipt.receiptNo + '</title>',
      '<style>' + css + '</style>',
      '</head><body>',
      '<div class="page-wrapper">',
      copyHTML('CUSTOMER COPY'),
      '<div class="cut-line"></div>',
      copyHTML('MERCHANT COPY'),
      '</div>',
      '<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<' + '/script>',
      '</body></html>',
    ].join('');

    printWin.document.write(html);
    printWin.document.close();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: 20, overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 500, boxShadow: '0 24px 64px rgba(0,0,0,0.22)', border: '1px solid rgba(0,168,76,0.15)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#2E7D32,#00897b)', padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 800, fontSize: 15, color: '#fff' }}>Sales Invoice</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{receipt.receiptNo} — {receipt.date}</div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.15)', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={14} />
          </button>
        </div>
        {/* Preview */}
        <div style={{ padding: '18px 22px', background: '#f8fffe', maxHeight: '50vh', overflowY: 'auto' }}>
          <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: '14px 16px', fontFamily: 'Courier New, monospace', fontSize: 11 }}>
            <div style={{ textAlign: 'center', marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>iFranchise Business and Services Corporation</div>
              <div style={{ fontWeight: 600, fontSize: 11 }}>FranchiSync — {receipt.branch}</div>
              <div style={{ marginTop: 4, fontSize: 10, color: '#5a7a65' }}>Receipt: {receipt.receiptNo} · {receipt.date} {receipt.time}</div>
              <div style={{ fontSize: 10, color: '#5a7a65' }}>Cashier: {receipt.cashier}</div>
            </div>
            <div style={{ borderTop: '1px dashed #ccc', borderBottom: '1px dashed #ccc', padding: '8px 0', margin: '8px 0' }}>
              {(receipt.items || []).map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                  <span>{item.name} ×{item.qty}</span>
                  <span style={{ fontWeight: 700 }}>₱{Number(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><span>Subtotal</span><span>₱{Number(receipt.subtotal).toFixed(2)}</span></div>
              {receipt.discount_pct > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, color: '#d97706' }}><span>Discount ({receipt.discount_pct}%)</span><span>−₱{Number(receipt.discount_amt || 0).toFixed(2)}</span></div>}
              {receipt.vat_enabled && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, color: '#2563eb' }}><span>VAT 12%</span><span>+₱{Number(receipt.vat_amt || 0).toFixed(2)}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 13, borderTop: '1px solid #ccc', paddingTop: 5, marginBottom: 5 }}><span>TOTAL</span><span style={{ color: '#00897b' }}>₱{Number(receipt.total).toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span>Payment</span><span style={{ fontWeight: 700 }}>{receipt.payment_method}</span></div>
              {receipt.is_split && (
                <div style={{ background: '#f0fdf5', borderRadius: 6, padding: '6px 8px', margin: '4px 0', fontSize: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>GCash</span><span>₱{Number(receipt.split_gcash_amt || 0).toFixed(2)}</span></div>
                  {receipt.gcash_ref && <div style={{ color: '#00695c', fontFamily: 'monospace' }}>Ref: {receipt.gcash_ref}</div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Cash</span><span>₱{Number(receipt.split_cash_amt || 0).toFixed(2)}</span></div>
                </div>
              )}
              {receipt.payment_method === 'Cash' && !receipt.is_split && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span>Cash Received</span><span>₱{Number(receipt.cash_received).toFixed(2)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Change</span><span style={{ fontWeight: 800, color: '#00897b' }}>₱{Number(receipt.change_due).toFixed(2)}</span></div>
                </>
              )}
              {receipt.gcash_ref && !receipt.is_split && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span>GCash Ref #</span><span style={{ fontFamily: 'monospace' }}>{receipt.gcash_ref}</span></div>}
            </div>
            <div style={{ textAlign: 'center', marginTop: 10, fontSize: 10, color: '#5a7a65' }}>Thank you for your purchase! 🎉</div>
          </div>
        </div>
        {/* Actions */}
        <div style={{ padding: '14px 22px', borderTop: '1px solid #e0f2f1', display: 'flex', gap: 10 }}>
          <button onClick={handlePrint}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2E7D32,#00897b)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Printer size={14} /> Print 2 Copies
          </button>
          <button onClick={onNewSale}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 0', borderRadius: 10, border: '1.5px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
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
function VoidModal({ show, tx, onClose, onConfirm }) {
  const [pw,  setPw]  = useState('');
  const [err, setErr] = useState('');

  const handleConfirm = () => {
    if (!pw) { setErr('Please enter the manager password.'); return; }
    if (pw !== MANAGER_PASSWORD) { setErr('Incorrect manager password.'); return; }
    onConfirm(tx); setPw(''); setErr('');
  };
  const handleClose = () => { setPw(''); setErr(''); onClose(); };
  if (!show) return null;

  return (
    <div onClick={handleClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: 20 }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 440, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 800, fontSize: 15, color: '#fff' }}>Void Transaction</div>
          <button onClick={handleClose} style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.15)', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
        </div>
        <div style={{ padding: 24 }}>
          {tx && (
            <div style={{ padding: '12px 14px', background: '#fff3e0', borderRadius: 10, border: '1px solid #ffcc80', marginBottom: 18, fontSize: 13 }}>
              <div style={{ fontWeight: 700, color: '#0d2b1e' }}>#{tx.id} — {fmtPeso(tx.total)}</div>
              <div style={{ color: '#5a7a65', fontSize: 12, marginTop: 2 }}>This action cannot be undone.</div>
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#5a7a65', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Manager Password</label>
            <input type="password" value={pw} onChange={e => { setPw(e.target.value); setErr(''); }} onKeyDown={e => { if (e.key === 'Enter') handleConfirm(); }} placeholder="Enter manager password to authorize"
              style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: `1.5px solid ${err ? '#fca5a5' : '#b2dfdb'}`, background: '#f0fdf5', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
            {err && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 5, fontWeight: 600 }}>{err}</div>}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleClose} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            <button onClick={handleConfirm} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Void Transaction</button>
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
  const userBranch = (user?.branch || '').trim();

  // ── State ─────────────────────────────────────────────────────────────────
  const [menuItems,     setMenuItems]     = useState([]);
  const [cart,          setCart]          = useState([]);
  const [transactions,  setTransactions]  = useState([]);
  const [loadingTx,     setLoadingTx]     = useState(false);
  const [searchProduct, setSearchProduct] = useState('');
  const [txSearch,      setTxSearch]      = useState('');
  const [txDateFrom,    setTxDateFrom]    = useState('');
  const [txDateTo,      setTxDateTo]      = useState('');
  const [activeTab,     setActiveTab]     = useState('cashier');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [cashReceived,  setCashReceived]  = useState('');
  const [discountPct,   setDiscountPct]   = useState(0);
  const [discountType,  setDiscountType]  = useState('None');
  const [vatEnabled,    setVatEnabled]    = useState(false);
  const [processing,    setProcessing]    = useState(false);
  const [txPage,        setTxPage]        = useState(0);
  const [noteInput,     setNoteInput]     = useState('');

  // Split payment
  const [isSplitPayment,  setIsSplitPayment]  = useState(false);
  const [splitGcashAmt,   setSplitGcashAmt]   = useState('');
  const [splitCashAmt,    setSplitCashAmt]     = useState('');
  const [splitGcashPaid,  setSplitGcashPaid]   = useState(false);
  const [splitGcashRef,   setSplitGcashRef]    = useState('');

  // GCash / PayMongo
  const [showGCashModal,  setShowGCashModal]  = useState(false);
  const [gcashRefNumber,  setGcashRefNumber]  = useState('');
  const [gcashPaymentAmt, setGcashPaymentAmt] = useState(0);

  // Discount auth
  const [showDiscountAuth,   setShowDiscountAuth]   = useState(false);
  const [pendingDiscount,    setPendingDiscount]     = useState(null);
  const [discountAuthInput,  setDiscountAuthInput]   = useState('');
  const [discountAuthErr,    setDiscountAuthErr]     = useState('');
  const [customDiscountInput,setCustomDiscountInput] = useState('');

  // Modals
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastReceipt,      setLastReceipt]      = useState(null);
  const [showVoidModal,    setShowVoidModal]     = useState(false);
  const [voidTarget,       setVoidTarget]        = useState(null);
  const [modal,            setModal]             = useState({ show: false });

  const TX_PAGE_SIZE = 20;

  const showAlert = (title, message, type = 'info') =>
    setModal({ show: true, title, message, type, onConfirm: null });
  const closeModal = () => setModal(m => ({ ...m, show: false }));

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    if (!userBranch) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory?branch=${encodeURIComponent(userBranch)}`);
      const d   = await res.json();
      setMenuItems(Array.isArray(d) ? d : []);
    } catch { setMenuItems([]); }
  }, [userBranch]);

  const fetchTransactions = useCallback(async () => {
    if (!userBranch) return;
    setLoadingTx(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/transactions?branch=${encodeURIComponent(userBranch)}`);
      const d   = await res.json();
      setTransactions(Array.isArray(d) ? d : []);
    } catch { setTransactions([]); }
    finally { setLoadingTx(false); }
  }, [userBranch]);

  useEffect(() => { fetchProducts(); },     [fetchProducts]);
  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);
  useEffect(() => { setTxPage(0); }, [txSearch, txDateFrom, txDateTo]);

  // ── Products ──────────────────────────────────────────────────────────────
  const allProducts = useMemo(() => {
    const q = searchProduct.toLowerCase();
    return menuItems
      .map(m => ({ ...m, source: 'menu', displayName: m.name }))
      .filter(p => !q || p.displayName.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q));
  }, [menuItems, searchProduct]);

  // ── Cart ──────────────────────────────────────────────────────────────────
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === product.id);
      if (existing) return prev.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...product, qty: 1 }];
    });
  };
  const updateQty    = (id, delta) => setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter(c => c.qty > 0));
  const removeFromCart = (id) => setCart(prev => prev.filter(c => c.id !== id));
  const clearCart    = () => {
    setCart([]); setCashReceived(''); setDiscountPct(0); setDiscountType('None');
    setNoteInput(''); setGcashRefNumber(''); setGcashPaymentAmt(0);
    setIsSplitPayment(false); setSplitGcashAmt(''); setSplitCashAmt('');
    setSplitGcashPaid(false); setSplitGcashRef('');
    setShowDiscountAuth(false); setPendingDiscount(null);
    setDiscountAuthInput(''); setCustomDiscountInput('');
  };

  // ── Discount auth ─────────────────────────────────────────────────────────
  const confirmDiscountAuth = () => {
    if (discountAuthInput !== MANAGER_PASSWORD) {
      setDiscountAuthErr('Incorrect manager password.');
      return;
    }
    if (pendingDiscount.label === 'Others') {
      const pct = parseFloat(customDiscountInput);
      if (!pct || pct <= 0 || pct > 100) {
        setDiscountAuthErr('Enter a valid discount % (1–100).');
        return;
      }
      setDiscountPct(pct);
      setDiscountType('Others');
    } else {
      setDiscountPct(pendingDiscount.pct);
      setDiscountType(pendingDiscount.label);
    }
    setShowDiscountAuth(false);
    setDiscountAuthInput('');
    setDiscountAuthErr('');
    setCustomDiscountInput('');
    setPendingDiscount(null);
  };

  // ── Totals ────────────────────────────────────────────────────────────────
  const subtotal    = cart.reduce((s, c) => s + (c.price || 0) * c.qty, 0);
  const discountAmt = subtotal * (discountPct / 100);
  const discounted  = subtotal - discountAmt;
  const vatAmt      = vatEnabled ? discounted * VAT_RATE : 0;
  const totalAmt    = discounted + vatAmt;
  const changeDue   = paymentMethod === 'Cash' ? Math.max(0, parseFloat(cashReceived || 0) - totalAmt) : 0;
  const cashShortfall = paymentMethod === 'Cash' && cashReceived !== ''
    ? parseFloat(cashReceived || 0) - totalAmt : 0;

  // ── Process sale ──────────────────────────────────────────────────────────
  const processSale = async () => {
    if (cart.length === 0) { showAlert('Empty Cart', 'Please add at least one item.', 'warning'); return; }

    if (isSplitPayment) {
      const gcash = parseFloat(splitGcashAmt) || 0;
      const cash  = parseFloat(splitCashAmt)  || 0;
      if (Math.abs((gcash + cash) - totalAmt) > 0.01) {
        showAlert('Split Amounts Mismatch', `GCash + Cash must equal ${fmtPeso(totalAmt)}.`, 'error');
        return;
      }
      if (gcash > 0 && !splitGcashPaid) {
        showAlert('GCash Pending', 'Please complete the GCash payment first.', 'warning');
        return;
      }
    } else {
      if (paymentMethod === 'Cash' && parseFloat(cashReceived || 0) < totalAmt) {
        showAlert('Insufficient Cash', 'Cash received is less than the total amount.', 'error');
        return;
      }
      if (paymentMethod === 'GCash' && !gcashRefNumber) {
        setShowGCashModal(true);
        return;
      }
    }

    setProcessing(true);
    try {
      const receiptNo = generateReceiptNo();
      const txnId     = generateTxnId();

      const payload = {
        branch: userBranch, cashier: user?.name || 'Staff', shop: '',
        payment_method: isSplitPayment ? 'Split' : paymentMethod,
        is_split: isSplitPayment,
        split_gcash_amt: isSplitPayment ? (parseFloat(splitGcashAmt) || 0) : null,
        split_cash_amt:  isSplitPayment ? (parseFloat(splitCashAmt)  || 0) : null,
        gcash_ref: isSplitPayment ? splitGcashRef : (paymentMethod === 'GCash' ? gcashRefNumber : null),
        cash_received: isSplitPayment
          ? (parseFloat(splitCashAmt) || 0)
          : (paymentMethod === 'Cash' ? parseFloat(cashReceived) : totalAmt),
        discount_pct: discountPct, discount_label: discountType,
        subtotal, discount_amt: discountAmt,
        vat_enabled: vatEnabled, vat_amt: vatAmt,
        total: totalAmt,
        change_due: isSplitPayment
          ? Math.max(0, (parseFloat(splitCashAmt) || 0) - (totalAmt - (parseFloat(splitGcashAmt) || 0)))
          : changeDue,
        note: noteInput,
        receipt_no: receiptNo, txn_id: txnId,
        items: cart.map(c => ({ id: c.id, source: 'menu', name: c.displayName, price: c.price, qty: c.qty, subtotal: c.price * c.qty })),
      };

      const res = await fetch(`${process.env.REACT_APP_API_URL}/transactions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (d.success) {
        setLastReceipt({ ...payload, receiptNo, txnId, date: fmtDate(), time: fmtTime(), cashier: user?.name || 'Staff', branch: userBranch });
        setShowReceiptModal(true);
        clearCart();
        fetchTransactions();
        fetchProducts();
      } else {
        showAlert('Transaction Failed', d.error || 'Failed to process sale.', 'error');
      }
    } catch {
      showAlert('Connection Error', 'Failed to process sale. Check your connection.', 'error');
    } finally { setProcessing(false); }
  };

  // ── Void ──────────────────────────────────────────────────────────────────
  const handleVoidRequest = (tx) => { setVoidTarget(tx); setShowVoidModal(true); };
  const handleVoidConfirm = async (tx) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/transactions/${tx.id}/void`, { method: 'PUT' });
      const d   = await res.json();
      setShowVoidModal(false); setVoidTarget(null);
      if (d.success) { showAlert('Voided', 'Transaction has been voided successfully.', 'success'); fetchTransactions(); }
      else showAlert('Void Failed', d.error || 'Could not void this transaction.', 'error');
    } catch { setShowVoidModal(false); showAlert('Connection Error', 'Failed to void transaction.', 'error'); }
  };

  // ── Filtered transactions ─────────────────────────────────────────────────
  const filteredTx = useMemo(() => {
    const q = txSearch.toLowerCase();
    return transactions.filter(tx => {
      if (q && !String(tx.id).includes(q) && !(tx.cashier || '').toLowerCase().includes(q)) return false;
      if (txDateFrom && tx.created_at < txDateFrom) return false;
      if (txDateTo   && tx.created_at > txDateTo + 'T23:59:59') return false;
      return true;
    });
  }, [transactions, txSearch, txDateFrom, txDateTo]);

  const txPageItems  = filteredTx.slice(txPage * TX_PAGE_SIZE, (txPage + 1) * TX_PAGE_SIZE);
  const todayStr     = new Date().toISOString().slice(0, 10);
  const todaySales   = transactions.filter(tx => (tx.created_at || '').startsWith(todayStr) && !tx.voided);
  const todayRevenue = todaySales.reduce((s, tx) => s + Number(tx.total || 0), 0);

  // ── Shared styles ─────────────────────────────────────────────────────────
  const inp = { width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #b2dfdb', background: '#f0fdf5', fontSize: 13, fontFamily: 'inherit', color: '#0d2b1e', outline: 'none', boxSizing: 'border-box' };
  const smallBtn = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, height: 30, padding: '0 12px', borderRadius: 8, border: '1px solid #b2dfdb', background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif", padding: '18px 20px', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Poppins:wght@300;400;500;600&display=swap');
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

      {/* ── Modals ── */}
      <Modal show={modal.show} title={modal.title} message={modal.message} type={modal.type}
        onConfirm={closeModal} onCancel={closeModal} />
      <ReceiptModal show={showReceiptModal} receipt={lastReceipt}
        onClose={() => setShowReceiptModal(false)} onNewSale={() => setShowReceiptModal(false)} />
      <VoidModal show={showVoidModal} tx={voidTarget}
        onClose={() => { setShowVoidModal(false); setVoidTarget(null); }}
        onConfirm={handleVoidConfirm} />
      {showGCashModal && (
        <GCashQRModal
          totalAmt={isSplitPayment ? (parseFloat(splitGcashAmt) || 0) : totalAmt}
          fmtPHP={fmtPeso}
          onConfirm={refNum => {
            setShowGCashModal(false);
            if (isSplitPayment) { setSplitGcashPaid(true); setSplitGcashRef(refNum); setGcashRefNumber(refNum); }
            else { setGcashRefNumber(refNum); setTimeout(() => processSale(), 100); }
          }}
          onCancel={() => { setShowGCashModal(false); setGcashPaymentAmt(0); }}
        />
      )}

      {/* ── Discount Auth Modal ── */}
      {showDiscountAuth && pendingDiscount && (
        <div onClick={() => setShowDiscountAuth(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 18, padding: '26px 28px', width: 340, maxWidth: '95vw', boxShadow: '0 16px 48px rgba(0,0,0,0.22)' }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#0d2b1e', marginBottom: 4 }}>{pendingDiscount.label} Discount</div>
            <div style={{ fontSize: 12, color: '#5a7a65', marginBottom: 16 }}>Manager authorization required.</div>
            {pendingDiscount.label === 'Others' && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#5a7a65', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Custom Discount %</div>
                <input type="number" min="1" max="100" placeholder="e.g. 15" value={customDiscountInput} onChange={e => setCustomDiscountInput(e.target.value)} style={inp} />
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#5a7a65', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Manager Password</div>
              <input type="password" placeholder="Enter password…" value={discountAuthInput}
                onChange={e => { setDiscountAuthInput(e.target.value); setDiscountAuthErr(''); }}
                onKeyDown={e => { if (e.key === 'Enter') confirmDiscountAuth(); }}
                autoFocus style={inp} />
              {discountAuthErr && <div style={{ marginTop: 5, fontSize: 12, color: '#e53935', fontWeight: 700 }}>⚠ {discountAuthErr}</div>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowDiscountAuth(false)} style={{ ...smallBtn, flex: 1, height: 38, fontSize: 13 }}>Cancel</button>
              <button onClick={confirmDiscountAuth}
                style={{ flex: 1, height: 38, borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#2E7D32,#00897b)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Apply Discount
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
        {[
          { label: "Today's Revenue",    value: fmtPeso(todayRevenue),          sub: `${todaySales.length} transactions` },
          { label: 'Transactions Today', value: todaySales.length,              sub: 'Completed sales' },
          { label: 'Avg Order Value',    value: fmtPeso(todaySales.length ? todayRevenue / todaySales.length : 0), sub: 'Per transaction' },
          { label: 'Items in Cart',      value: cart.reduce((s, c) => s + c.qty, 0), sub: 'Current session' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid rgba(0,168,76,0.12)', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 8px rgba(0,140,60,0.06)' }}>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5a7a65', marginBottom: 5 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0d2b1e' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(0,168,76,0.06)', borderRadius: 12, padding: 4, marginBottom: 18, width: 'fit-content' }}>
        {[
          { id: 'cashier', label: 'Cashier',             red: false },
          { id: 'history', label: 'Transaction History', red: false },
          { id: 'voided',  label: 'Voided',              red: true },
        ].map(({ id, label, red }) => {
          const isActive     = activeTab === id;
          const voidedCount  = transactions.filter(t => t.voided).length;
          return (
            <button key={id} onClick={() => setActiveTab(id)}
              style={{ padding: '8px 20px', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, background: isActive ? (red ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#00c853,#00897b)') : 'transparent', color: isActive ? '#fff' : (red ? '#ef4444' : '#5a7a65'), boxShadow: isActive ? (red ? '0 2px 8px rgba(239,68,68,.3)' : '0 2px 8px rgba(0,180,90,.3)') : 'none' }}>
              {label}
              {id === 'voided' && voidedCount > 0 && (
                <span style={{ background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(239,68,68,0.15)', color: isActive ? '#fff' : '#dc2626', padding: '1px 7px', borderRadius: 10, fontSize: 11, fontWeight: 800 }}>{voidedCount}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CASHIER TAB                                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'cashier' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 390px', gap: 18, alignItems: 'start' }}>
          {/* Products */}
          <div>
            <div style={{ background: '#fff', border: '1px solid rgba(0,168,76,0.12)', borderRadius: 14, padding: '12px 16px', marginBottom: 14 }}>
              <div style={{ position: 'relative' }}>
                <Search size={13} color="#94a3b8" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" autoComplete="off" placeholder="Search products..." value={searchProduct} onChange={e => setSearchProduct(e.target.value)} style={{ ...inp, paddingLeft: 32 }} />
              </div>
            </div>
            {allProducts.length === 0 ? (
              <div style={{ background: '#fff', border: '1px solid rgba(0,168,76,0.12)', borderRadius: 14, padding: '48px 0', textAlign: 'center', color: '#5a7a65', fontSize: 13 }}>
                {!userBranch ? 'No branch assigned to your account.' : 'No products found for this branch.'}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(155px,1fr))', gap: 10 }}>
                {allProducts.map(product => {
                  const inCart = cart.find(c => c.id === product.id);
                  return (
                    <div key={product.id} onClick={() => addToCart(product)}
                      style={{ background: '#fff', border: `2px solid ${inCart ? '#00897b' : 'rgba(0,168,76,0.12)'}`, borderRadius: 13, padding: '13px 11px', cursor: 'pointer', transition: 'all .15s', boxShadow: inCart ? '0 4px 14px rgba(0,137,123,0.18)' : '0 1px 6px rgba(0,140,60,0.05)', position: 'relative' }}>
                      {inCart && <div style={{ position: 'absolute', top: 7, right: 7, background: 'linear-gradient(135deg,#00c853,#00897b)', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 800, padding: '1px 7px' }}>×{inCart.qty}</div>}
                      {product.image_url ? (
                        <img src={product.image_url} alt="" style={{ width: '100%', height: 85, objectFit: 'cover', borderRadius: 8, marginBottom: 9 }} onError={e => (e.target.style.display = 'none')} />
                      ) : (
                        <div style={{ width: '100%', height: 85, borderRadius: 8, background: 'linear-gradient(135deg,rgba(0,200,83,0.08),rgba(0,137,123,0.06))', marginBottom: 9 }} />
                      )}
                      <div style={{ fontWeight: 700, fontSize: 12, color: '#0d2b1e', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.displayName}</div>
                      {product.category && <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 5 }}>{product.category}</div>}
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#00897b' }}>{fmtPeso(product.price)}</div>
                      {product.stock !== undefined && <div style={{ fontSize: 10, color: product.stock <= 5 ? '#ef4444' : '#94a3b8', marginTop: 2 }}>Stock: {product.stock}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Order panel ── */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ background: '#fff', border: '1px solid rgba(0,168,76,0.12)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,140,60,0.08)' }}>
              {/* Cart header */}
              <div style={{ padding: '13px 16px', background: 'linear-gradient(135deg,#0d2b1e,#1a4a2e)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
                <span style={{ fontWeight: 800, fontSize: 14 }}>Order Cart</span>
                {cart.length > 0 && <button onClick={clearCart} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 7, padding: '3px 11px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Clear</button>}
              </div>
              {/* Cart items */}
              <div style={{ maxHeight: 240, overflowY: 'auto', padding: cart.length === 0 ? 0 : '6px 0' }}>
                {cart.length === 0 ? (
                  <div style={{ padding: '28px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    <ShoppingCart size={28} color="#d1eedd" style={{ marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                    Tap a product to add it
                  </div>
                ) : cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderBottom: '1px solid rgba(0,168,76,0.07)' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: '#0d2b1e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.displayName}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{fmtPeso(item.price)} each</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                      <button onClick={() => updateQty(item.id, -1)} style={{ width: 24, height: 24, borderRadius: 6, border: '1.5px solid rgba(0,168,76,0.2)', background: 'rgba(0,168,76,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#0d2b1e' }}>−</button>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#0d2b1e', minWidth: 18, textAlign: 'center' }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, +1)} style={{ width: 24, height: 24, borderRadius: 6, border: '1.5px solid rgba(0,168,76,0.2)', background: 'rgba(0,168,76,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#00897b' }}>+</button>
                    </div>
                    <div style={{ minWidth: 56, textAlign: 'right', fontWeight: 800, fontSize: 12, color: '#00897b' }}>{fmtPeso(item.price * item.qty)}</div>
                    <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2, fontSize: 16, lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>

              {/* Order options */}
              <div style={{ padding: '13px 16px', borderTop: '1px solid rgba(0,168,76,0.1)' }}>

                {/* VAT */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#5a7a65', textTransform: 'uppercase', letterSpacing: '.07em' }}>VAT (12%)</label>
                  <div onClick={() => setVatEnabled(v => !v)} style={{ width: 42, height: 22, borderRadius: 11, cursor: 'pointer', position: 'relative', background: vatEnabled ? 'linear-gradient(135deg,#00c853,#00897b)' : '#e0e0e0', transition: 'background .2s' }}>
                    <div style={{ position: 'absolute', top: 2, left: vatEnabled ? 21 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left .2s' }} />
                  </div>
                </div>

                {/* Discount */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#5a7a65', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>Discount</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {[
                      { label: 'None',           pct: 0,    requiresAuth: false },
                      { label: 'PWD/Senior Citizen',            pct: 20,   requiresAuth: true  },
                      { label: 'Others',         pct: null, requiresAuth: true  },
                    ].map(d => {
                      const isActive = d.pct !== null ? discountPct === d.pct && discountType === d.label : discountType === 'Others';
                      return (
                        <button key={d.label}
                          onClick={() => {
                            if (d.label === 'None') { setDiscountPct(0); setDiscountType('None'); setShowDiscountAuth(false); setCustomDiscountInput(''); }
                            else { setPendingDiscount(d); setDiscountAuthInput(''); setDiscountAuthErr(''); setCustomDiscountInput(''); setShowDiscountAuth(true); }
                          }}
                          style={{ height: 30, padding: '0 12px', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: isActive ? 'linear-gradient(135deg,#2E7D32,#00897b)' : '#f0fdf5', color: isActive ? '#fff' : '#5a7a65' }}>
                          {d.label}{d.pct !== null && d.label !== 'None' ? ` (${d.pct}%)` : ''}
                        </button>
                      );
                    })}
                  </div>
                  {discountType && discountType !== 'None' && discountPct > 0 && (
                    <div style={{ marginTop: 6, fontSize: 12, color: '#00897b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ background: '#e0f2f1', border: '1px solid #b2dfdb', borderRadius: 20, padding: '2px 10px' }}>{discountType} — {discountPct}% off</span>
                      <button onClick={() => { setDiscountPct(0); setDiscountType('None'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53935', fontSize: 13, fontWeight: 800, padding: 0 }}>×</button>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div style={{ background: 'rgba(0,168,76,0.05)', border: '1.5px solid rgba(0,168,76,0.12)', borderRadius: 11, padding: '11px 13px', marginBottom: 12 }}>
                  {[
                    { label: 'Subtotal', value: fmtPeso(subtotal), color: '#94a3b8' },
                    ...(discountPct > 0 ? [{ label: `Discount (${discountPct}%)`, value: `−${fmtPeso(discountAmt)}`, color: '#f59e0b' }] : []),
                    ...(vatEnabled ? [{ label: 'VAT (12%)', value: `+${fmtPeso(vatAmt)}`, color: '#3b82f6' }] : []),
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: r.color, marginBottom: 4 }}>
                      <span>{r.label}</span><span style={{ fontWeight: 700 }}>{r.value}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, color: '#0d2b1e', fontWeight: 800, paddingTop: 7, borderTop: '1.5px dashed rgba(0,168,76,0.2)' }}>
                    <span>Total</span><span style={{ color: '#00897b' }}>{fmtPeso(totalAmt)}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#5a7a65', textTransform: 'uppercase', letterSpacing: '.07em' }}>Payment Method</div>
                    {/* Split toggle */}
                    <button onClick={() => { setIsSplitPayment(v => !v); setSplitGcashAmt(''); setSplitCashAmt(''); setSplitGcashPaid(false); setSplitGcashRef(''); setGcashRefNumber(''); setCashReceived(''); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, border: 'none', background: isSplitPayment ? 'linear-gradient(135deg,#007acc,#0057a8)' : '#f0f0f0', color: isSplitPayment ? '#fff' : '#5a7a65', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      ✂ {isSplitPayment ? 'Split ON' : 'Split Payment'}
                    </button>
                  </div>

                  {/* Normal payment buttons */}
                  {!isSplitPayment && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {[
                        { id: 'Cash',  label: 'Cash',  icon: <Banknote size={15} /> },
                        { id: 'GCash', label: 'GCash', icon: <QrCode size={15} />,    sub: 'PayMongo QR' },
                        { id: 'Others',label: 'Others',icon: <CreditCard size={15} /> },
                      ].map(m => (
                        <button key={m.id} onClick={() => { setPaymentMethod(m.id); if (m.id !== 'GCash') setGcashRefNumber(''); }}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `2px solid ${paymentMethod === m.id ? '#00897b' : 'rgba(0,168,76,0.15)'}`, background: paymentMethod === m.id ? 'linear-gradient(135deg,#00c853,#00897b)' : '#fff', color: paymentMethod === m.id ? '#fff' : '#0d2b1e', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 9, transition: 'all .15s' }}>
                          {m.icon} <span>{m.label}</span>
                          {m.sub && <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.75 }}>{m.sub}</span>}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* GCash ref badge */}
                  {!isSplitPayment && paymentMethod === 'GCash' && gcashRefNumber && (
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#e8f4ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '6px 12px' }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>GCash Ref #</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1e40af', fontFamily: 'monospace' }}>{gcashRefNumber}</div>
                      </div>
                      <button onClick={() => setGcashRefNumber('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#93c5fd', fontSize: 16 }}>×</button>
                    </div>
                  )}

                  {/* Split payment panel */}
                  {isSplitPayment && (
                    <div style={{ background: '#f8fffe', border: '1.5px solid #b2dfdb', borderRadius: 12, padding: '14px 14px 10px', marginTop: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#5a7a65' }}>Total to split:</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#0d2b1e' }}>{fmtPeso(totalAmt)}</span>
                      </div>
                      {/* GCash leg */}
                      <div style={{ background: splitGcashPaid ? '#e8f5e9' : '#fff', border: `1.5px solid ${splitGcashPaid ? '#00897b' : '#bfdbfe'}`, borderRadius: 10, padding: '10px 12px', marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg,#007acc,#0057a8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, color: '#fff' }}>G</div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#1e40af' }}>GCash amount</span>
                          </div>
                          {splitGcashPaid && <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '2px 8px', borderRadius: 20 }}>✓ Paid</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <div style={{ position: 'relative', flex: 1 }}>
                            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, fontWeight: 700, color: '#5a7a65' }}>₱</span>
                            <input type="number" placeholder="0.00" value={splitGcashAmt} disabled={splitGcashPaid}
                              onChange={e => { const val = e.target.value; setSplitGcashAmt(val); const g = parseFloat(val) || 0; const rem = Math.max(0, totalAmt - g); setSplitCashAmt(rem > 0 ? rem.toFixed(2) : ''); }}
                              style={{ ...inp, paddingLeft: 24, opacity: splitGcashPaid ? 0.6 : 1, cursor: splitGcashPaid ? 'not-allowed' : 'text' }} />
                          </div>
                          {!splitGcashPaid ? (
                            <button onClick={() => {
                              const g = parseFloat(splitGcashAmt);
                              if (!g || g <= 0) { showAlert('Invalid Amount', 'Enter a valid GCash amount.', 'error'); return; }
                              if (g > totalAmt) { showAlert('Too Much', 'GCash amount cannot exceed total.', 'error'); return; }
                              if (g < 100) { showAlert('Minimum ₱100', 'Minimum GCash amount via PayMongo is ₱100.', 'error'); return; }
                              setGcashPaymentAmt(g); setShowGCashModal(true);
                            }}
                              style={{ padding: '0 14px', height: 36, borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#007acc,#0057a8)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}>
                              Pay GCash
                            </button>
                          ) : (
                            <button onClick={() => { setSplitGcashPaid(false); setSplitGcashRef(''); setGcashRefNumber(''); setSplitCashAmt(''); }}
                              style={{ padding: '0 10px', height: 36, borderRadius: 9, border: '1px solid #fecaca', background: '#fee2e2', color: '#dc2626', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}>
                              Redo
                            </button>
                          )}
                        </div>
                        {splitGcashPaid && splitGcashRef && <div style={{ marginTop: 5, fontSize: 11, color: '#00695c', fontFamily: 'monospace', fontWeight: 600 }}>Ref: {splitGcashRef}</div>}
                      </div>
                      {/* Cash leg */}
                      <div style={{ background: '#fff', border: '1.5px solid #d1eedd', borderRadius: 10, padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg,#2E7D32,#00897b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#fff' }}>₱</div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#2E7D32' }}>Cash amount</span>
                        </div>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, fontWeight: 700, color: '#5a7a65' }}>₱</span>
                          <input type="number" placeholder="0.00" value={splitCashAmt} onChange={e => setSplitCashAmt(e.target.value)} style={{ ...inp, paddingLeft: 24 }} />
                        </div>
                      </div>
                      {/* Split summary */}
                      {((parseFloat(splitGcashAmt) || 0) + (parseFloat(splitCashAmt) || 0)) > 0 && (() => {
                        const gcash = parseFloat(splitGcashAmt) || 0;
                        const cash  = parseFloat(splitCashAmt)  || 0;
                        const covered   = gcash + cash;
                        const shortfall = totalAmt - covered;
                        const change    = covered - totalAmt;
                        return (
                          <div style={{ marginTop: 10, padding: '8px 10px', background: Math.abs(shortfall) < 0.01 ? '#e8f5e9' : shortfall > 0 ? '#fff3e0' : '#e8f5e9', borderRadius: 8, fontSize: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5a7a65', marginBottom: 2 }}><span>GCash</span><span style={{ fontWeight: 700 }}>{fmtPeso(gcash)}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5a7a65', marginBottom: 4 }}><span>Cash</span><span style={{ fontWeight: 700 }}>{fmtPeso(cash)}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 4 }}>
                              <span style={{ fontWeight: 800, color: shortfall > 0.01 ? '#e65100' : '#2e7d32' }}>{shortfall > 0.01 ? `⚠ Short by` : change > 0.01 ? 'Change due' : '✓ Exact'}</span>
                              <span style={{ fontWeight: 800, color: shortfall > 0.01 ? '#e65100' : '#2e7d32' }}>{shortfall > 0.01 ? fmtPeso(shortfall) : change > 0.01 ? fmtPeso(change) : ''}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Cash received (normal) */}
                {!isSplitPayment && paymentMethod === 'Cash' && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#5a7a65', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 5 }}>Cash Received</div>
                    <input type="number" value={cashReceived} onChange={e => setCashReceived(e.target.value)} placeholder="0.00"
                      style={{ ...inp, fontSize: 16, fontWeight: 800, textAlign: 'right' }} />
                    {cashReceived !== '' && (
                      <div style={{ marginTop: 5, fontSize: 13, fontWeight: 700, textAlign: 'right', color: cashShortfall < 0 ? '#ef4444' : '#00897b', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}>
                        {cashShortfall < 0
                          ? <><AlertTriangle size={12} /> Short by {fmtPeso(Math.abs(cashShortfall))}</>
                          : <><Check size={12} /> Change: {fmtPeso(changeDue)}</>}
                      </div>
                    )}
                  </div>
                )}

                {/* Note */}
                <div style={{ marginBottom: 12 }}>
                  <textarea value={noteInput} onChange={e => setNoteInput(e.target.value)} placeholder="Order note (optional)..." rows={2}
                    style={{ ...inp, resize: 'none', lineHeight: 1.5, height: 'auto', padding: '8px 11px' }} />
                </div>

                {/* Charge button */}
                <button onClick={processSale} disabled={processing || cart.length === 0}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '13px 0', borderRadius: 12, border: 'none',
                    background: cart.length === 0 || processing ? '#e0e0e0' : isSplitPayment ? (() => { const g = parseFloat(splitGcashAmt) || 0; const c = parseFloat(splitCashAmt) || 0; const ok = Math.abs((g + c) - totalAmt) < 0.01 && (!g || splitGcashPaid); return ok ? 'linear-gradient(135deg,#00c853,#00897b)' : '#e0e0e0'; })() : paymentMethod === 'GCash' && !gcashRefNumber ? 'linear-gradient(135deg,#007acc,#0057a8)' : 'linear-gradient(135deg,#00c853,#00897b)',
                    color: cart.length === 0 || processing ? '#9e9e9e' : '#fff',
                    fontSize: 15, fontWeight: 900, cursor: cart.length === 0 || processing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: processing ? 0.7 : 1,
                  }}>
                  {processing ? (
                    <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .8s linear infinite' }} /> Processing...</>
                  ) : isSplitPayment ? (() => {
                    const g = parseFloat(splitGcashAmt) || 0; const c = parseFloat(splitCashAmt) || 0;
                    const covered = Math.abs((g + c) - totalAmt) < 0.01;
                    const gcashDone = !g || splitGcashPaid;
                    if (!covered) return `Enter amounts totalling ${fmtPeso(totalAmt)}`;
                    if (!gcashDone) return 'Complete GCash payment first';
                    return `💳 Charge ${fmtPeso(totalAmt)} (Split)`;
                  })() : paymentMethod === 'GCash' && !gcashRefNumber
                    ? `💳 Scan GCash QR — ${fmtPeso(totalAmt)}`
                    : `💳 Charge ${fmtPeso(totalAmt)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HISTORY TAB                                                          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'history' && (
        <>
          <div style={{ background: '#fff', border: '1px solid rgba(0,168,76,0.12)', borderRadius: 14, padding: '12px 16px', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1 1 200px' }}>
                <Search size={13} color="#94a3b8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" placeholder="Search ID or cashier..." value={txSearch} onChange={e => setTxSearch(e.target.value)} style={{ ...inp, paddingLeft: 30 }} />
              </div>
              <input type="date" value={txDateFrom} onChange={e => setTxDateFrom(e.target.value)} style={{ ...inp, width: 150 }} />
              <input type="date" value={txDateTo}   onChange={e => setTxDateTo(e.target.value)}   style={{ ...inp, width: 150 }} />
              {(txSearch || txDateFrom || txDateTo) && <button onClick={() => { setTxSearch(''); setTxDateFrom(''); setTxDateTo(''); }} style={{ ...smallBtn, color: '#00897b', borderColor: '#b2dfdb' }}>Clear</button>}
            </div>
          </div>
          <div style={{ background: '#fff', border: '1px solid rgba(0,168,76,0.12)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,140,60,0.05)' }}>
            <div style={{ padding: '12px 18px', background: 'linear-gradient(135deg,#2E7D32,#00897b)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
              <span style={{ fontWeight: 800, fontSize: 13 }}>Transaction History</span>
              <span style={{ fontSize: 12, opacity: 0.9 }}>{filteredTx.length} records</span>
            </div>
            {loadingTx ? (
              <div style={{ padding: '48px 0', textAlign: 'center', color: '#5a7a65', fontSize: 13 }}>Loading...</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr>
                      {['#', 'Date', 'Cashier', 'Items', 'Subtotal', 'Disc', 'VAT', 'Total', 'Payment', 'Status', ''].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800, fontSize: 10.5, color: '#00897b', letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: '1px solid #d1eedd', background: '#f8fffe', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {txPageItems.length === 0 ? (
                      <tr><td colSpan={11} style={{ padding: '48px 0', textAlign: 'center', color: '#5a7a65', fontSize: 13 }}>No transactions found.</td></tr>
                    ) : txPageItems.map(tx => (
                      <tr key={tx.id} onMouseEnter={e => e.currentTarget.style.background = '#f6fef8'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} style={{ borderBottom: '1px solid #f0f8f0', opacity: tx.voided ? 0.5 : 1 }}>
                        <td style={{ padding: '10px 12px', color: '#94a3b8', fontSize: 12 }}>#{tx.id}</td>
                        <td style={{ padding: '10px 12px', color: '#5a7a65', fontSize: 12, whiteSpace: 'nowrap' }}>{new Date(tx.created_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0d2b1e' }}>{tx.cashier}</td>
                        <td style={{ padding: '10px 12px', color: '#5a7a65' }}>{(tx.items || []).length}</td>
                        <td style={{ padding: '10px 12px', color: '#5a7a65' }}>{fmtPeso(tx.subtotal)}</td>
                        <td style={{ padding: '10px 12px' }}>{tx.discount_pct > 0 ? <span style={{ color: '#f59e0b', fontWeight: 700 }}>−{tx.discount_pct}%</span> : <span style={{ color: '#94a3b8' }}>—</span>}</td>
                        <td style={{ padding: '10px 12px' }}>{tx.vat_enabled ? <span style={{ color: '#3b82f6', fontWeight: 700 }}>+{fmtPeso(tx.vat_amt)}</span> : <span style={{ color: '#94a3b8' }}>—</span>}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 800, color: '#00897b' }}>{fmtPeso(tx.total)}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: tx.payment_method === 'Cash' ? 'rgba(0,200,83,0.1)' : tx.payment_method === 'Split' ? 'rgba(107,33,168,0.1)' : 'rgba(59,130,246,0.1)', color: tx.payment_method === 'Cash' ? '#00897b' : tx.payment_method === 'Split' ? '#6b21a8' : '#2563eb' }}>
                            {tx.payment_method}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {tx.voided ? <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(239,68,68,0.1)', color: '#dc2626' }}>VOIDED</span>
                            : <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(0,200,83,0.1)', color: '#00897b' }}>PAID</span>}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {!tx.voided && <button onClick={() => handleVoidRequest(tx)} style={{ ...smallBtn, color: '#dc2626', borderColor: '#fca5a5', background: '#fff' }}>Void</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {filteredTx.length > TX_PAGE_SIZE && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderTop: '1px solid rgba(0,168,76,0.1)', background: '#f9fefb' }}>
                <span style={{ fontSize: 12, color: '#5a7a65' }}>{(txPage * TX_PAGE_SIZE + 1)}–{Math.min((txPage + 1) * TX_PAGE_SIZE, filteredTx.length)} of {filteredTx.length}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => setTxPage(p => Math.max(0, p - 1))} disabled={txPage === 0} style={{ ...smallBtn, opacity: txPage === 0 ? 0.35 : 1 }}>‹</button>
                  <button onClick={() => setTxPage(p => Math.min(Math.ceil(filteredTx.length / TX_PAGE_SIZE) - 1, p + 1))} disabled={txPage >= Math.ceil(filteredTx.length / TX_PAGE_SIZE) - 1} style={{ ...smallBtn, opacity: txPage >= Math.ceil(filteredTx.length / TX_PAGE_SIZE) - 1 ? 0.35 : 1 }}>›</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* VOIDED TAB                                                           */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'voided' && (() => {
        const voidedList = transactions.filter(tx => tx.voided);
        return (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 18 }}>
              {[
                { label: 'Total Voided',        value: voidedList.length, sub: 'All time' },
                { label: 'Total Amount Voided', value: fmtPeso(voidedList.reduce((s, t) => s + Number(t.total || 0), 0)), sub: 'Lost revenue' },
                { label: 'Today Voided',        value: voidedList.filter(t => (t.created_at || '').startsWith(new Date().toISOString().slice(0, 10))).length, sub: 'Today only' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#b91c1c', marginBottom: 5 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#0d2b1e' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#fff', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '12px 18px', background: 'linear-gradient(135deg,#ef4444,#dc2626)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
                <span style={{ fontWeight: 800, fontSize: 13 }}>Voided Transactions</span>
                <span style={{ fontSize: 12, opacity: 0.9 }}>{voidedList.length} record{voidedList.length !== 1 ? 's' : ''}</span>
              </div>
              {voidedList.length === 0 ? (
                <div style={{ padding: '52px 0', textAlign: 'center', color: '#5a7a65', fontSize: 13 }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>--</div>
                  <div style={{ fontWeight: 700 }}>No voided transactions</div>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr>
                        {['#', 'Date', 'Cashier', 'Items', 'Total', 'Payment', 'Discount'].map(h => (
                          <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800, fontSize: 10.5, color: '#dc2626', letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: '1px solid #fecaca', background: '#fff5f5', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {voidedList.map(tx => (
                        <tr key={tx.id} onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} style={{ borderBottom: '1px solid #fff0f0' }}>
                          <td style={{ padding: '10px 12px', color: '#94a3b8', fontSize: 12 }}>#{tx.id}</td>
                          <td style={{ padding: '10px 12px', color: '#5a7a65', fontSize: 12, whiteSpace: 'nowrap' }}>{new Date(tx.created_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0d2b1e' }}>{tx.cashier}</td>
                          <td style={{ padding: '10px 12px', color: '#5a7a65' }}>{(tx.items || []).length}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 800, color: '#dc2626', textDecoration: 'line-through' }}>{fmtPeso(tx.total)}</td>
                          <td style={{ padding: '10px 12px' }}><span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(239,68,68,0.08)', color: '#dc2626' }}>{tx.payment_method}</span></td>
                          <td style={{ padding: '10px 12px', color: '#5a7a65', fontSize: 12 }}>{tx.discount_pct > 0 ? <span style={{ color: '#f59e0b', fontWeight: 700 }}>{tx.discount_label || tx.discount_pct + '%'}</span> : <span style={{ color: '#94a3b8' }}>—</span>}</td>
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
export default function StaffDashboard() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const getUserFromStorage = () => {
    const s = 
    localStorage.getItem('user') ||
    localStorage.getItem('rememberedUser') ||
    sessionStorage.getItem('user'); 

    if (s) return JSON.parse(s);
    navigate('/admin-login');
    return null;
  };

  const [user, setUser] = useState(getUserFromStorage);

  useEffect(() => {
    const u = getUserFromStorage();
    if (!u) navigate('/admin-login');
    else setUser(u);
  }, []);

   const confirmLogout = async () => {
  try {
    const stored = localStorage.getItem("user") || sessionStorage.getItem("user");
    const userId = stored ? JSON.parse(stored)?.id : null;

    await fetch(`${process.env.REACT_APP_API_URL}/logout`, {
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
  if (!user) return null;

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", minHeight: '100vh', background: 'linear-gradient(140deg,#e8f5e9 0%,#f0faf4 45%,#e0f2f1 100%)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Poppins:wght@300;400;500;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
      `}</style>

      {/* Top bar */}
      <div style={{ background: '#fff', padding: '1rem 2rem', boxShadow: '0 2px 8px rgba(46,125,50,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.4rem', fontWeight: 800, color: '#00897b' }}>Point of Sale</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, color: '#0d2b1e', fontSize: '0.95rem' }}>{user.name}</div>
            <div style={{ fontSize: '0.8rem', color: '#5a7a65' }}>{user.role} — {user.branch}</div>
          </div>
          <button onClick={() => setShowLogoutModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 10, border: 'none', background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </div>

      <POSContent user={user} />

      {/* Logout modal */}
      {showLogoutModal && (
        <div onClick={() => setShowLogoutModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 20, padding: '32px 36px', maxWidth: 400, width: '90%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid rgba(0,168,76,0.15)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <LogOut size={28} color="#dc2626" />
            </div>
            <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 20, fontWeight: 800, color: '#0d2b1e', marginBottom: 8 }}>Log out?</h2>
            <p style={{ color: '#5a7a65', fontSize: 13, marginBottom: 28 }}>You will need to sign in again to access your account.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowLogoutModal(false)}
                style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button onClick={confirmLogout}
                style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}