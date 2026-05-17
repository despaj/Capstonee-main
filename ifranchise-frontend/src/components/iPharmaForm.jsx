import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown, ChevronLeft, AlertCircle, CheckCircle2, X,
  Shield, Upload, Camera, ZoomIn, ZoomOut, RotateCcw,
  FileText, User, Briefcase, MapPin, Smartphone, Lock,
  ArrowRight, Plus, Trash2, BookOpen, IdCard
} from "lucide-react";
import logo from "../assets/ipharma.png";
import welcome from "../assets/welcomepage.png";

// ─── AUDIT TRAIL ──────────────────────────────────────────────────────────────
const auditLog = (() => {
  const logs = [];
  const getSession = () =>
    sessionStorage.getItem("ip_session") ||
    (() => { const id = `IP-SES-${Date.now()}`; sessionStorage.setItem("ip_session", id); return id; })();
  return {
    record: (action, data = {}) => {
      const entry = {
        id: `AUDIT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: getSession(),
        action,
        data,
      };
      logs.push(entry);
      console.info("[IPHARMA AUDIT]", entry);
      return entry;
    },
    getAll: () => [...logs],
  };
})();

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const MARITAL_OPTIONS = ["Single", "Married", "Widowed", "Separated"];
const SUFFIXES = ["", "Jr.", "Sr.", "II", "III", "IV", "V", "MD", "PhD", "Esq."];
const VALID_ID_TYPES = [
  "Philippine Passport", "SSS ID", "GSIS ID", "PhilHealth ID",
  "Pag-IBIG ID", "Driver's License", "PRC ID", "Voter's ID",
  "National ID (PhilSys)", "Senior Citizen ID", "PWD ID", "UMID",
];
const DEGREE_TYPES = [
  "Elementary", "High School", "Senior High School", "Vocational/Technical",
  "Bachelor's Degree", "Master's Degree", "Doctorate", "Others",
];

const capitalize = (v) => v.replace(/(^|\s)\S/g, (c) => c.toUpperCase());

// ─── ALERT MODAL ──────────────────────────────────────────────────────────────
function AlertModal({ open, type, message, onClose, onConfirm }) {
  if (!open) return null;
  const ok = type === "success";

  return (
    <div style={S.overlay}>
      <div style={S.modalBox}>
        <div style={{ ...S.iconWrap, background: ok ? "#e8f5e9" : "#fdecea" }}>
          {ok ? <CheckCircle2 size={38} color="#2e7d32" /> : <AlertCircle size={38} color="#c62828" />}
        </div>
        <p style={S.modalMsg}>{message}</p>
        <div style={S.btnRow}>
          {onConfirm ? (
            <>
              <button style={{ ...S.btn, ...S.btnOutline }} onClick={onClose}>Cancel</button>
              <button style={{ ...S.btn, ...S.btnSolid }} onClick={onConfirm}>Confirm</button>
            </>
          ) : (
            <button style={{ ...S.btn, ...S.btnSolid }} onClick={onClose}>OK</button>
          )}
        </div>
        <button style={S.closeBtn} onClick={onClose}><X size={18} /></button>
      </div>
    </div>
  );
}

// ─── TERMS MODAL ──────────────────────────────────────────────────────────────
function TermsModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div style={S.overlay}>
      <div style={{ ...S.modalBox, width: 640, maxWidth: "95vw", textAlign: "left", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: "#c2410c", fontSize: 18, fontWeight: 700 }}>Terms & Conditions</h3>
          <button style={S.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ overflowY: "auto", flex: 1, paddingRight: 8, fontSize: 13, color: "#374151", lineHeight: 1.8 }}>
          <p><strong>1. APPLICATION PROCESS</strong><br />By submitting this iPharma Mart Franchise Application Form, you acknowledge this is an expression of interest only and does not constitute a binding agreement.</p>
          <p><strong>2. DATA PRIVACY (RA 10173)</strong><br />All personal data collected is governed by the Data Privacy Act of 2012. Your information will be used solely for evaluating your franchise application.</p>
          <p><strong>3. NON-TRANSFERABILITY</strong><br />The franchise application and, if approved, the franchise agreement are personal to the applicant and strictly non-transferable.</p>
          <p><strong>4. ID VALIDATION</strong><br />You consent to OCR technology verifying your government-issued ID. Data extracted will be used solely for identity verification.</p>
          <p><strong>5. AUDIT TRAIL</strong><br />All actions performed during this application are logged with timestamps and session identifiers as part of our tamper-evident digital audit trail.</p>
          <p><strong>6. OTP VERIFICATION</strong><br />A One-Time Password will be sent to your registered mobile number. Standard SMS rates may apply.</p>
          <p><strong>7. NO GUARANTEE</strong><br />Submission does not guarantee approval. iFranchise reserves the right to approve or reject any application at its sole discretion.</p>
          <p><strong>8. GOVERNING LAW</strong><br />This application shall be governed by the laws of the Republic of the Philippines.</p>
          <p style={{ color: "#6B7280", fontSize: 12 }}>Last updated: January 2025</p>
        </div>
        <button style={{ ...S.btn, ...S.btnSolid, marginTop: 16, width: "100%" }} onClick={onClose}>I Have Read the Terms</button>
      </div>
    </div>
  );
}

// ─── OTP MODAL ────────────────────────────────────────────────────────────────
function OtpModal({ open, mobile, onVerify, onClose, maxAttempts = 3, expectedOtp, onResend }) {
  const [otp, setOtp] = useState(["","","","","",""]);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const refs = useRef([]);

  useEffect(() => {
    if (!open) return;
    setOtp(["","","","","",""]); setAttempts(0); setError(""); setCountdown(60); setCanResend(false);
    auditLog.record("OTP_SENT", { mobile });
  }, [open]);

  useEffect(() => {
    if (!open || canResend) return;
    const t = setInterval(() => setCountdown(c => { if (c <= 1) { clearInterval(t); setCanResend(true); return 0; } return c - 1; }), 1000);
    return () => clearInterval(t);
  }, [open, canResend]);

  const handleInput = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };
  const handleKey = (i, e) => { if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus(); };

  const verify = () => {
    const code = otp.join("");
    if (code.length < 6) { setError("Please enter the complete 6-digit OTP."); return; }
    auditLog.record("OTP_ATTEMPT", { attempt: attempts + 1 });
    if (code === expectedOtp) { auditLog.record("OTP_VERIFIED"); onVerify(true); }
    else {
      const n = attempts + 1; setAttempts(n);
      auditLog.record("OTP_FAILED", { attempt: n });
      if (n >= maxAttempts) { setError(`Maximum ${maxAttempts} attempts reached.`); setCanResend(true); }
      else { setError(`Incorrect OTP. ${maxAttempts - n} attempt(s) remaining.`); }
      setOtp(["","","","","",""]); refs.current[0]?.focus();
    }
  };

  const resend = async () => {
    setOtp(["", "", "", "", "", ""]);
    setAttempts(0);
    setError("");
    setCountdown(60);
    setCanResend(false);
    setSending(true);
    auditLog.record("OTP_RESENT", { mobile });
    setTimeout(() => setSending(false), 1000);
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    await fetch(`${process.env.REACT_APP_API_URL}/api/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, otp: newOtp }),
    });
    onResend(newOtp);
  };

  if (!open) return null;
  return (
    <div style={S.overlay}>
      <div style={{ ...S.modalBox, width: 380 }}>
        <div style={{ ...S.iconWrap, background: "#e8f5e9" }}><Smartphone size={38} color="#2e7d32" /></div>
        <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700 }}>OTP Verification</h3>
        <p style={{ margin: "0 0 20px", color: "#6B7280", fontSize: 13, lineHeight: 1.6 }}>
          A 6-digit code was sent to <strong>{mobile?.replace(/(\d{4})(\d{3})(\d{4})/, "$1-$2-$3")}</strong>.
          <br />
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
          {otp.map((d, i) => (
            <input key={i} ref={el => refs.current[i] = el}
              type="text" inputMode="numeric" maxLength={1} value={d}
              onChange={e => handleInput(i, e.target.value)} onKeyDown={e => handleKey(i, e)}
              style={{ width: 44, height: 52, textAlign: "center", fontSize: 22, fontWeight: 700, borderRadius: 10, border: error ? "2px solid #d32f2f" : "2px solid #fed7aa", outline: "none", fontFamily: "'Montserrat',sans-serif", background: "#fffbf7" }} />
          ))}
        </div>
        {error && <p style={{ color: "#d32f2f", fontSize: 12, margin: "0 0 12px", fontWeight: 600 }}>{error}</p>}
        <button style={{ ...S.btn, ...S.btnSolid, width: "100%", marginBottom: 10 }} onClick={verify}>Verify OTP</button>
        <p style={{ margin: 0, fontSize: 12, color: "#9CA3AF" }}>
          {canResend
            ? <button onClick={resend} disabled={sending} style={{ background: "none", border: "none", color: "#ea580c", fontWeight: 700, cursor: "pointer", fontSize: 12, padding: 0 }}>{sending ? "Resending…" : "Resend OTP"}</button>
            : <>Resend in <strong style={{ color: "#ea580c" }}>{countdown}s</strong></>}
        </p>
        <button style={S.closeBtn} onClick={onClose}><X size={18} /></button>
      </div>
    </div>
  );
}

// ─── ID SCANNER MODAL ─────────────────────────────────────────────────────────
function IdScannerModal({ open, onComplete, onClose }) {
  const [step, setStep] = useState("type");
  const [idType, setIdType] = useState("");
  const [frontImg, setFrontImg] = useState(null);
  const [backImg, setBackImg] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [ocrResult, setOcrResult] = useState(null);
  const [idValid, setIdValid] = useState(null);
  const frontRef = useRef(); const backRef = useRef();

  useEffect(() => {
    if (!open) { setStep("type"); setIdType(""); setFrontImg(null); setBackImg(null); setZoom(1); setOcrResult(null); setIdValid(null); }
  }, [open]);

  const handleFile = (side, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => { side === "front" ? setFrontImg(e.target.result) : setBackImg(e.target.result); auditLog.record("ID_UPLOADED", { side, idType, fileName: file.name }); };
    reader.readAsDataURL(file);
  };

const runOcr = async () => {
  setStep("processing");
  auditLog.record("OCR_STARTED", { idType });

  try {
    const verifyRes = await fetch(`${process.env.REACT_APP_API_URL}/api/verify-id`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frontImage: frontImg, backImage: backImg, idType }),
    });
    const verifyResult = await verifyRes.json();

    if (!verifyResult.success || !verifyResult.data.isValid) {
      setOcrResult({ reason: verifyResult.data?.reason || verifyResult.error });
      setIdValid(false);
      setStep("result");
      return;
    }

    const extractRes = await fetch(`${process.env.REACT_APP_API_URL}/api/extract-id`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frontImage: frontImg, idType }),
    });
    const extractResult = await extractRes.json();

    if (!extractResult.success) {
      setOcrResult({
        ...verifyResult.data,
        firstName: "", lastName: "", middleName: "",
        dob: "", address: "", idNumber: "", expiryDate: null,
        reason: "ID verified but could not extract data. Please fill in manually.",
      });
      setIdValid(true);
      setStep("result");
      return;
    }

    const merged = {
      ...verifyResult.data,
      ...extractResult.data,
      isValid: true,
      confidence: verifyResult.data.confidence,
      reason: "ID verified and data extracted successfully",
    };
    setOcrResult(merged);
    auditLog.record("OCR_COMPLETED", { confidence: merged.confidence, idType });
    setIdValid(true);
    setStep("result");

  } catch (err) {
    console.error("OCR error:", err);
    auditLog.record("OCR_ERROR", { error: err.message });
    setOcrResult({ reason: "Something went wrong. Please try again." });
    setIdValid(false);
    setStep("result");
  }
};

  const confirmAndFill = () => {
  auditLog.record("ID_DATA_ACCEPTED", { idType, ocrResult });

  const formatDob = (raw) => {
    if (!raw) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
      const [dd, mm, yyyy] = raw.split("/");
      return `${yyyy}-${mm}-${dd}`;
    }
    return raw;
  };

  const { address, ...ocrWithoutAddress } = ocrResult; 

  onComplete({
      ocrResult: {
      ...ocrWithoutAddress,
      dob: formatDob(ocrResult?.dob),
    },
    idType, idValid, frontImg, backImg,
  });
  onClose();
};

  if (!open) return null;
  const imgStyle = () => ({ width: "100%", height: 170, objectFit: "contain", background: "#f9f9f9", borderRadius: 10, border: "2px dashed #fed7aa", transform: `scale(${zoom})`, transition: "transform .2s", display: "block" });

  return (
    <div style={S.overlay}>
      <div style={{ ...S.modalBox, width: 560, maxWidth: "95vw", textAlign: "left", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#ea580c,#fb923c)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={18} color="#fff" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>ID Verification</h3>
            <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>OCR-powered identity check</p>
          </div>
          <button style={{ ...S.closeBtn, position: "static", marginLeft: "auto" }} onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {["Select ID","Front","Back","Processing","Result"].map((s, i) => {
            const idx = ["type","front","back","processing","result"].indexOf(step);
            return <div key={s} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= idx ? "linear-gradient(90deg,#ea580c,#fb923c)" : "#e5e7eb" }} />;
          })}
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {step === "type" && (
            <div>
              <p style={{ margin: "0 0 12px", fontWeight: 600, fontSize: 14 }}>Select your Government-Issued ID:</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {VALID_ID_TYPES.map(t => (
                  <button key={t} onClick={() => setIdType(t)} style={{ padding: "10px 12px", borderRadius: 10, fontSize: 12, fontWeight: 600, border: idType === t ? "2px solid #ea580c" : "1.5px solid #e5e7eb", background: idType === t ? "#fff3e0" : "#fafafa", color: idType === t ? "#ea580c" : "#374151", cursor: "pointer", textAlign: "left" }}>{t}</button>
                ))}
              </div>
              <button disabled={!idType} onClick={() => setStep("front")} style={{ ...S.btn, ...S.btnSolid, width: "100%", marginTop: 16, opacity: idType ? 1 : 0.5 }}>
                Continue — Scan Front Side <ArrowRight size={14} style={{ marginLeft: 6 }} />
              </button>
            </div>
          )}
          {(step === "front" || step === "back") && (() => {
            const isFront = step === "front";
            const img = isFront ? frontImg : backImg;
            const ref = isFront ? frontRef : backRef;
            return (
              <div>
                <p style={{ margin: "0 0 12px", fontWeight: 600, fontSize: 14 }}>Scan <strong>{isFront ? "FRONT" : "BACK"}</strong> side of your <span style={{ color: "#ea580c" }}>{idType}</span></p>
                <div style={{ position: "relative", marginBottom: 12 }}>
                  {img ? <img src={img} alt="ID" style={imgStyle()} /> : <div style={{ ...imgStyle(), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}><Camera size={32} color="#9CA3AF" /><span style={{ fontSize: 12, color: "#9CA3AF" }}>No image uploaded yet</span></div>}
                  {img && <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 6 }}>
                    <button onClick={() => setZoom(z => Math.min(z + 0.25, 3))} style={S.zoomBtn}><ZoomIn size={14} /></button>
                    <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} style={S.zoomBtn}><ZoomOut size={14} /></button>
                    <button onClick={() => setZoom(1)} style={S.zoomBtn}><RotateCcw size={14} /></button>
                  </div>}
                </div>
                <input ref={ref} type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={e => handleFile(isFront ? "front" : "back", e.target.files[0])} />
                <div style={{ display: "flex", gap: 8 }}>
                  {!isFront && <button onClick={() => setStep("front")} style={{ ...S.btn, ...S.btnOutline }}>← Back</button>}
                  <button onClick={() => ref.current.click()} style={{ ...S.btn, ...S.btnOutline, flex: 1 }}><Upload size={14} style={{ marginRight: 6 }} /> Upload</button>
                  <button disabled={!img} onClick={() => isFront ? setStep("back") : runOcr()} style={{ ...S.btn, ...S.btnSolid, flex: 1, opacity: img ? 1 : 0.5 }}>
                    {isFront ? <>Next: Back <ArrowRight size={14} style={{ marginLeft: 4 }} /></> : <>Scan ID <Shield size={14} style={{ marginLeft: 4 }} /></>}
                  </button>
                </div>
              </div>
            );
          })()}
          {step === "processing" && (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ width: 64, height: 64, border: "5px solid #fed7aa", borderTop: "5px solid #ea580c", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" }} />
              <p style={{ fontWeight: 700, fontSize: 16, color: "#ea580c", margin: "0 0 8px" }}>Processing ID…</p>
              <p style={{ color: "#6B7280", fontSize: 13, margin: 0 }}>Running OCR and identity validation.</p>
            </div>
          )}
          {step === "result" && ocrResult && (
            <div>
              <div style={{ padding: "12px 16px", borderRadius: 10, marginBottom: 16, background: idValid ? "#e8f5e9" : "#fdecea", border: `1.5px solid ${idValid ? "#a5d6a7" : "#ef9a9a"}`, display: "flex", alignItems: "center", gap: 10 }}>
                {idValid ? <CheckCircle2 size={20} color="#2E7D32" /> : <AlertCircle size={20} color="#c62828" />}
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: idValid ? "#1b5e20" : "#b71c1c" }}>{idValid ? "ID Validated Successfully" : "ID Validation Failed"}</p>
                  <p style={{ margin: 0, fontSize: 12, color: idValid ? "#388e3c" : "#c62828" }}>{idValid ? `Confidence: ${(ocrResult.confidence * 100).toFixed(0)}%` : "Please upload a valid government ID."}</p>
                </div>
              </div>
              {idValid && (
                <>
                  <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 10px", color: "#374151" }}>Extracted Information (will auto-fill form):</p>
                  <div style={{ background: "#fffbf7", border: "1.5px solid #fed7aa", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
                    {[["Last Name", ocrResult.lastName],
                    ["First Name", ocrResult.firstName],
                    ["Middle Name", ocrResult.middleName],
                    ["Date of Birth", ocrResult.dob],
                    ["ID Number", ocrResult.idNumber],
                    ["Expiry", ocrResult.expiryDate]].map(([l, v]) => (
                      <div key={l} style={{ display: "flex", gap: 12, fontSize: 13, padding: "5px 0", borderBottom: "1px solid #f3f4f6" }}>
                        <span style={{ color: "#6B7280", width: 110, flexShrink: 0 }}>{l}</span>
                        <span style={{ fontWeight: 600 }}>{v || "—"}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", background: "#fff8e1", borderRadius: 8, border: "1px solid #ffe082", marginBottom: 14 }}>
                    <Lock size={14} color="#e65100" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#c62828", margin: 0 }}>The name registered is NON-TRANSFERABLE and must match the approved franchisee's legal identity.</p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setStep("type")} style={{ ...S.btn, ...S.btnOutline }}>Rescan</button>
                    <button onClick={confirmAndFill} style={{ ...S.btn, ...S.btnSolid, flex: 1 }}>Use This Data <ArrowRight size={14} style={{ marginLeft: 6 }} /></button>
                  </div>
                </>
              )}
              {!idValid && <button onClick={() => setStep("type")} style={{ ...S.btn, ...S.btnSolid, width: "100%" }}>Try Again</button>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CUSTOM SELECT ────────────────────────────────────────────────────────────
function CustomSelect({ value, placeholder, options, onSelect, error, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn); return () => document.removeEventListener("mousedown", fn);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button type="button" disabled={disabled} onClick={() => setOpen(p => !p)} style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: error ? "1.5px solid #d32f2f" : "1.5px solid #fed7aa", fontSize: 14, fontFamily: "'Montserrat',sans-serif", color: value ? "#1a1a1a" : "#9CA3AF", background: "#fffbf7", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: disabled ? "not-allowed" : "pointer", outline: "none", boxSizing: "border-box" }}>
        <span>{value || placeholder}</span>
        <ChevronDown size={16} color="#ea580c" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }} />
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1.5px solid #fed7aa", borderRadius: 12, zIndex: 300, maxHeight: 220, overflowY: "auto", boxShadow: "0 8px 32px rgba(234,88,12,0.12)" }}>
          {options.map(o => (
            <div key={o || "none"} style={{ padding: "11px 14px", cursor: "pointer", fontSize: 14, borderBottom: "1px solid #f3f4f6", fontWeight: o === value ? 700 : 400, color: o === value ? "#ea580c" : "#1a1a1a" }}
              onMouseEnter={e => e.currentTarget.style.background = "#fff3e0"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              onClick={() => { onSelect(o); setOpen(false); }}>
              {o || <span style={{ color: "#9CA3AF" }}>{placeholder}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── FIELD ────────────────────────────────────────────────────────────────────
function Field({ label, required, error, children, half, style: extraStyle }) {
  return (
    <div style={{ flex: half ? "0 0 calc(50% - 0.45rem)" : "1 1 100%", minWidth: half ? 140 : "auto", ...extraStyle }}>
      {label && <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#374151", marginBottom: "0.4rem" }}>{label} {required && <span style={{ color: "#EF4444" }}>*</span>}</label>}
      {children}
      {error && <span style={{ display: "flex", alignItems: "center", color: "#d32f2f", fontSize: "0.78rem", marginTop: "0.3rem", fontWeight: 600 }}><AlertCircle size={12} style={{ marginRight: 4 }} />{error}</span>}
    </div>
  );
}

function SectionHeader({ icon: Icon, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.2rem" }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#ea580c,#fb923c)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={15} color="#fff" />
      </div>
      <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#c2410c", margin: 0 }}>{title}</h3>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function IPharmaForm() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [maritalStatus, setMaritalStatus] = useState("");
  const [suffix, setSuffix] = useState("");
  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(null);

  const [generatedOtp, setGeneratedOtp] = useState("");

  // Modals
  const [alert, setAlert] = useState({ open: false, type: "", message: "", onConfirm: null });
  const showAlert = (type, message, onConfirm = null) => setAlert({ open: true, type, message, onConfirm });
  const closeAlert = () => setAlert(p => ({ ...p, open: false, onConfirm: null }));
  const [showTerms, setShowTerms] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [showIdScanner, setShowIdScanner] = useState(false);

  // ID & docs
  const [idVerified, setIdVerified] = useState(false);
  const [idData, setIdData] = useState(null);
  const [letterOfIntent, setLetterOfIntent] = useState(null);
  const loiRef = useRef();

  // Consents
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);

   // Address
  const [addrRegion,   setAddrRegion]   = useState("");
  const [addrProvince, setAddrProvince] = useState("");
  const [addrCity,     setAddrCity]     = useState("");
  const [addrBarangay, setAddrBarangay] = useState("");
  const [addrStreet,   setAddrStreet]   = useState("");

  const [regions,    setRegions]    = useState([]);
  const [provinces,  setProvinces]  = useState([]);
  const [cities,     setCities]     = useState([]);
  const [barangays,  setBarangays]  = useState([]);

  const [loadingRegions,   setLoadingRegions]   = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities,    setLoadingCities]    = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  const PSGC = "https://psgc.gitlab.io/api";

  // Education list
  const [educList, setEducList] = useState([]);

  const today = new Date().toISOString().split("T")[0];
  const maxDob = (() => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d.toISOString().split("T")[0]; })();

  const [form, setForm] = useState({
    date: today, lastName: "", firstName: "", middleInitial: "",
    mobile: "", altMobile: "", telephone: "", email: "",
    dob: "", spouseName: "", spouseOccupation: "", spouseDob: "",
    dependents: "", tin: "", involvement: "", equity: "", investment: "",
    fundSource: "", otherBusiness: "", location: "", familyDepend: "",
    marketArea: "", startDate: "", dateSigned: today,
  });

  const capFields = ["lastName","firstName","spouseName","spouseOccupation","marketArea","fundSource"];

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "mobile" || name === "altMobile") value = value.replace(/\D/g, "").slice(0, 11);
    if (name === "telephone") value = value.replace(/[^0-9()\-\s]/g, "").slice(0, 15);
    if (["equity","investment","dependents"].includes(name)) value = value.replace(/\D/g, "");
    if (name === "middleInitial") value = value.replace(/[^a-zA-Z]/g, "").slice(0, 1).toUpperCase();
    if (capFields.includes(name)) value = capitalize(value);
    if (["involvement","otherBusiness","familyDepend","location"].includes(name)) value = value.charAt(0).toUpperCase() + value.slice(1);
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  };

  const validateField = (name, value) => {
    const optional = ["spouseName","spouseOccupation","spouseDob","dependents","telephone","otherBusiness","date","dateSigned","tin","altMobile","middleInitial"];
    if (optional.includes(name)) {
      if (name === "altMobile" && value && !/^09\d{9}$/.test(value)) return "Please enter valid Philippine number (09**********)";
      return "";
    }
    if (!value) return "This field is required";
    if (name === "email" && !/\S+@\S+\.\S+/.test(value)) return "Invalid email address";
    if (name === "mobile" && !/^09\d{9}$/.test(value)) return "Please enter valid Philippine number (09**********)";
    if (name === "dob") { const age = Math.floor((new Date() - new Date(value)) / (365.25 * 24 * 3600 * 1000)); if (age < 18) return "Must be at least 18 years old"; }
    if (name === "equity" && (Number(value) <= 0 || Number(value) > 100)) return "Enter a value between 1 and 100";
    if (name === "investment" && Number(value) <= 0) return "Must be greater than 0";
    if (name === "startDate") { const sel = new Date(value); sel.setHours(0,0,0,0); const tod = new Date(); tod.setHours(0,0,0,0); if (sel < tod) return "Start date cannot be in the past"; }
    return "";
  };

  const handleBlur = (e) => { const { name, value } = e.target; setErrors(p => ({ ...p, [name]: validateField(name, value) })); };

  const inp = (name, placeholder, type = "text", extra = {}) => (
    <input style={{ ...inpStyle, border: errors[name] ? "1.5px solid #d32f2f" : "1.5px solid #fed7aa" }}
      name={name} type={type} placeholder={placeholder}
      value={form[name]} onChange={handleChange} onBlur={handleBlur} {...extra} />
  );

  // Educ helpers
  const addEduc = () => setEducList(p => [...p, { degree: "", school: "", yearGrad: "", course: "" }]);
  const updateEduc = (i, field, val) => setEducList(p => { const n = [...p]; n[i] = { ...n[i], [field]: val }; return n; });
  const removeEduc = (i) => setEducList(p => p.filter((_, idx) => idx !== i));

  // ID complete handler
const handleIdComplete = ({ ocrResult, idType, idValid, frontImg, backImg }) => {
  if (!idValid) {
    showAlert("error", ocrResult?.reason || "ID validation failed. Please use a valid government-issued ID.");
    return;
  }

  setIdVerified(true);
  setIdData({ ocrResult, idType, idValid, frontImg });

  auditLog.record("ID_AUTOFILL", { idType });

  setForm(p => ({
    ...p,
    lastName:      ocrResult.lastName   ? capitalize(ocrResult.lastName)  : p.lastName,
    firstName:     ocrResult.firstName  ? capitalize(ocrResult.firstName) : p.firstName,
    middleInitial: ocrResult.middleName ? ocrResult.middleName.charAt(0).toUpperCase() : p.middleInitial,
    dob:           ocrResult.dob        || p.dob,
  }));

  showAlert("success", "ID verified! Fields have been auto-filled. Please review and complete the remaining fields.");
};

useEffect(() => {
  const fetchRegions = async () => {
    setLoadingRegions(true);
    try {
      const res  = await fetch(`${PSGC}/regions/`);
      const data = await res.json();
      setRegions(data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) { console.error("Failed to fetch regions:", err); }
    finally { setLoadingRegions(false); }
  };
  fetchRegions();
}, []);

useEffect(() => {
  if (!addrRegion) { setProvinces([]); setCities([]); setBarangays([]); return; }
  const fetchProvinces = async () => {
    setLoadingProvinces(true);
    setAddrProvince(""); setAddrCity(""); setAddrBarangay("");
    setCities([]); setBarangays([]);
    try {
      const res  = await fetch(`${PSGC}/regions/${addrRegion}/provinces/`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        const citRes  = await fetch(`${PSGC}/regions/${addrRegion}/cities-municipalities/`);
        const citData = await citRes.json();
        setCities(Array.isArray(citData) ? citData.sort((a, b) => a.name.localeCompare(b.name)) : []);
        setProvinces([]);
      } else {
        setProvinces(data.sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch (err) { console.error("Failed to fetch provinces:", err); }
    finally { setLoadingProvinces(false); }
  };
  fetchProvinces();
}, [addrRegion]);

useEffect(() => {
  if (!addrProvince) { setCities([]); setBarangays([]); return; }
  const fetchCities = async () => {
    setLoadingCities(true);
    setAddrCity(""); setAddrBarangay(""); setBarangays([]);
    try {
      const res  = await fetch(`${PSGC}/provinces/${addrProvince}/cities-municipalities/`);
      const data = await res.json();
      setCities(Array.isArray(data) ? data.sort((a, b) => a.name.localeCompare(b.name)) : []);
    } catch (err) { console.error("Failed to fetch cities:", err); }
    finally { setLoadingCities(false); }
  };
  fetchCities();
}, [addrProvince]);

useEffect(() => {
  if (!addrCity) { setBarangays([]); return; }
  const fetchBarangays = async () => {
    setLoadingBarangays(true);
    setAddrBarangay("");
    try {
      const res  = await fetch(`${PSGC}/cities-municipalities/${addrCity}/barangays/`);
      const data = await res.json();
      setBarangays(Array.isArray(data) ? data.sort((a, b) => a.name.localeCompare(b.name)) : []);
    } catch (err) { console.error("Failed to fetch barangays:", err); }
    finally { setLoadingBarangays(false); }
  };
  fetchBarangays();
}, [addrCity]);

const getRegionName   = () => regions.find(r => r.code === addrRegion)?.name    || "";
const getProvinceName = () => provinces.find(p => p.code === addrProvince)?.name || "";
const getCityName     = () => cities.find(c => c.code === addrCity)?.name        || "";
const getBarangayName = () => barangays.find(b => b.code === addrBarangay)?.name || addrBarangay || "";

  // Progress
  useEffect(() => {
    const fields = ["lastName","firstName","mobile","email","dob","involvement","equity","investment","fundSource","location","familyDepend","marketArea","startDate"];
    let total = fields.length + 5;
    let filled = fields.filter(f => form[f]).length;
    if (maritalStatus) filled++;
    if (addrRegion && addrCity && addrStreet) filled++;
    if (idVerified) filled++;
    if (letterOfIntent) filled++;
    if (termsAccepted && consentAccepted) filled++;
    setProgress(Math.round((filled / total) * 100));
  }, [form, maritalStatus, addrRegion, addrCity, addrStreet, idVerified, letterOfIntent, termsAccepted, consentAccepted]);

  const showSpouse = maritalStatus === "Married" || maritalStatus === "Widowed";

const checkDuplicate = async (email, mobile) => {
  auditLog.record("DUPLICATE_CHECK", { email, mobile });
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/check-duplicate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, mobile }),
    });
    const data = await res.json();
    console.log("Duplicate check response:", data);
    return data.exists;
  } catch (err) {
    console.error("Duplicate check error:", err);
    return false;
  }
};

  // Page validators
  const validatePage = (fields, extras = []) => {
    const e = {};
    fields.forEach(k => { const err = validateField(k, form[k]); if (err) e[k] = err; });
    if (extras.includes("maritalStatus") && !maritalStatus) e.maritalStatus = "Please select marital status";
    if (extras.includes("addrRegion") && !addrRegion) e.addrRegion = "Please select a region";
    if (extras.includes("addrProvince") && provinces.length > 0 && !addrProvince) e.addrProvince = "Please select a province";
    if (extras.includes("addrCity") && !addrCity) e.addrCity = "Please select a city/municipality";
    if (extras.includes("addrBarangay") && !addrBarangay) e.addrBarangay = "Please select a barangay";
    if (extras.includes("addrStreet") && !addrStreet) e.addrStreet = "Please enter a street address";
    if (extras.includes("idVerified") && !idVerified) e.idVerified = "Please complete ID verification";
    if (extras.includes("letterOfIntent") && !letterOfIntent) e.letterOfIntent = "Please upload your Letter of Intent";
    if (extras.includes("terms") && !termsAccepted) e.terms = "You must accept the Terms and Conditions";
    if (extras.includes("consent") && !consentAccepted) e.consent = "You must give your data privacy consent";
    setErrors(p => ({ ...p, ...e }));
    return Object.keys(e).length === 0;
  };

  const p1Fields = ["lastName","firstName","mobile","email","dob"];
  const p1Extras = ["maritalStatus","addrRegion","addrProvince","addrCity","addrBarangay","addrStreet","idVerified"];
  const p2Fields = ["involvement","equity","investment","fundSource","location"];
  const p3Fields = ["familyDepend","marketArea","startDate"];
  const p3Extras = ["letterOfIntent","terms","consent"];

  const handleFinalSubmit = async () => {
    
    setLoading("load"); 
    if (!validatePage(p3Fields, p3Extras)) {
      setLoading(null);
      showAlert("error", "Please fill in all required fields and complete all verification steps.");
      return;
    }
    const isDuplicate = await checkDuplicate(form.email, form.mobile);
    if (isDuplicate) {
      auditLog.record("DUPLICATE_DETECTED", { email: form.email, mobile: form.mobile });
      showAlert("error", "An application with this email or mobile number already exists.");
      setLoading(null);
      return;
    }
    auditLog.record("FORM_VALIDATED", { email: form.email });
    setLoading(null);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);

    try {
    await fetch(`${process.env.REACT_APP_API_URL}/api/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile: form.mobile, otp }),
    });
  } finally {
      setLoading(null);
    }
    setShowOtp(true);

  };

const handleOtpVerified = async (success) => {
  setShowOtp(false);
  if (!success) { showAlert("error", "OTP verification failed. Please try again."); return; }
  auditLog.record("APPLICATION_SUBMIT_ATTEMPT", { email: form.email });

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  let letterOfIntentBase64 = null;
  if (letterOfIntent) {
    try {
      letterOfIntentBase64 = await toBase64(letterOfIntent);
    } catch {
      showAlert("error", "Failed to process Letter of Intent. Please try again.");
      return;
    }
  }

  const fullAddress = [addrStreet, getBarangayName(), getCityName(), getProvinceName(), getRegionName()].filter(Boolean).join(", ");
  const fullName = [form.firstName, form.middleInitial ? form.middleInitial + "." : "", form.lastName, suffix].filter(Boolean).join(" ");

  const payload = {
    name: fullName, suffix, maritalStatus,
    email: form.email, phone: form.mobile, altPhone: form.altMobile || null,
    telephone: form.telephone, dob: form.dob, address: fullAddress,
    spouseName: form.spouseName, spouseOccupation: form.spouseOccupation, spouseDob: form.spouseDob,
    dependents: form.dependents, tin: form.tin,
    education: educList,
    involvement: form.involvement, equity: form.equity, investment: form.investment,
    fundSource: form.fundSource, otherBusiness: form.otherBusiness, location: form.location,
    familyDepend: form.familyDepend, marketArea: form.marketArea, startDate: form.startDate,
    idType:         idData?.idType        || null,
    letterOfIntent: letterOfIntentBase64  || null,  // ← now properly base64
    idImage:        idData?.frontImg      || null,
    dateSigned: form.dateSigned,
    auditTrail: auditLog.getAll(),
  };

  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/ipharma-applications`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    if (!res.ok) { showAlert("error", `Server error: ${res.status}`); return; }
    const data = await res.json();
    if (data.success) {
      auditLog.record("APPLICATION_SUBMITTED", { success: true, applicationId: data.id });
      showAlert("success", "iPharma Mart Application submitted successfully! We will review your application and contact you soon.", () => { closeAlert(); navigate("/"); });
    } else {
      showAlert("error", data.error || "Failed to submit. Please try again.");
    }
  } catch {
    showAlert("error", "Failed to submit. Please check your connection and try again.");
  }
};

  const steps = [{ label: "Personal", pct: 33 }, { label: "Business", pct: 66 }, { label: "Done", pct: 100 }];

  return (
    
    <div style={{ minHeight: "100vh", fontFamily: "'Montserrat',sans-serif", backgroundImage: `linear-gradient(rgba(255,255,255,0.78),rgba(255,237,213,0.78)),url(${welcome})`, backgroundSize: "cover", backgroundAttachment: "fixed", paddingTop: 90, paddingBottom: 60 }}>
          {loading === "load" && (
        <>
          <style>{`
            @keyframes spin {
              0%   { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <div style={{
              background: "#fff", borderRadius: 20, padding: "40px 48px",
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 16, boxShadow: "0 24px 80px rgba(0,0,0,0.18)", minWidth: 260,
            }}>
              <div style={{
                width: 56, height: 56,
                border: "5px solid #c8e6c9",
                borderTop: "5px solid #ea580c",
                borderRadius: "50%",
                animation: "spin 0.9s linear infinite",
              }} />
              <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "#ea580c" }}>
                Loading...
              </p>
            </div>
          </div>
        </>
      )}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ip-inp:focus { border-color: #ea580c !important; background: #fff !important; outline: none !important; }
        @media (max-width: 768px) { .ip-row { flex-direction: column !important; } }
      `}</style>

      <AlertModal {...alert} onClose={closeAlert} onConfirm={alert.onConfirm ? () => alert.onConfirm() : null} />
      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />
      <OtpModal open={showOtp} mobile={form.mobile} onVerify={handleOtpVerified} onClose={() => setShowOtp(false)} expectedOtp={generatedOtp} onResend={(newOtp) => setGeneratedOtp(newOtp)} />
      <IdScannerModal open={showIdScanner} onComplete={handleIdComplete} onClose={() => setShowIdScanner(false)} />

      {/* ── Nav ── */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: 70, zIndex: 100, background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", display: "flex", alignItems: "center" }}>
        <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center", padding: "0 24px" }}>
          <Link to="/apply-franchise" style={{ display: "flex", alignItems: "center", gap: 6, color: "#2e7d32", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none", whiteSpace: "nowrap" }}>
            <ChevronLeft size={20} strokeWidth={2.5} /><span>Back to Application</span>
          </Link>
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "50%", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              {steps.map(st => <span key={st.label} style={{ fontSize: "0.7rem", fontWeight: 600, color: progress >= st.pct ? "#2e7d32" : "#9ca3af", transition: "color 0.3s" }}>{st.label}</span>)}
            </div>
            <div style={{ width: "100%", height: 8, background: "#e5e7eb", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#ea580c,#fb923c)", width: `${progress}%`, transition: "width 0.4s ease" }} />
            </div>
            <div style={{ marginTop: 4, textAlign: "right", fontSize: "0.75rem", fontWeight: 600, color: "#2e7d32" }}>{progress}%</div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 1.5rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <img src={logo} alt="iPharma" style={{ height: 66, objectFit: "contain", marginTop: 12, marginBottom: 18 }} />
        <div style={{ background: "rgba(255,255,255,0.97)", width: "100%", borderRadius: 20, padding: "36px 30px 30px", boxShadow: "0 10px 30px rgba(234,88,12,0.10)" }}>
          <h2 style={{ fontSize: 23, color: "#2e7d32", fontWeight: 700, margin: "0 0 4px", textAlign: "center" }}>iPharma Mart Application</h2>
          <p style={{ color: "#9CA3AF", fontSize: 13, marginBottom: 22, textAlign: "center" }}>Complete the form below to begin your journey with iPharma Mart</p>

          {/* ══ PAGE 1 ══ */}
          {page === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>

              {/* ID Verification */}
              <div style={sec}>
                <SectionHeader icon={IdCard} title="ID Verification" />
                {!idVerified ? (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: "#fff3e0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                      <IdCard size={28} color="#ea580c" />
                    </div>
                    <p style={{ fontSize: 13, color: "#374151", marginBottom: 16, fontWeight: 600 }}>Please upload a valid ID</p>
                    <button type="button" onClick={() => setShowIdScanner(true)} style={{ ...S.btn, ...S.btnSolid, padding: "12px 28px" }}>
                      <Camera size={16} style={{ marginRight: 8 }} /> Upload ID
                    </button>
                    {errors.idVerified && <p style={{ color: "#d32f2f", fontSize: 12, marginTop: 8, fontWeight: 600 }}>{errors.idVerified}</p>}
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#e8f5e9", borderRadius: 10, border: "1.5px solid #a5d6a7" }}>
                    <CheckCircle2 size={24} color="#2E7D32" />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#1b5e20" }}>ID Verified — {idData?.idType}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#388e3c" }}>Personal details have been auto-filled from your ID scan.</p>
                    </div>
                    <button type="button" onClick={() => { setIdVerified(false); setIdData(null); }} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: 11 }}>Rescan</button>
                  </div>
                )}
              </div>

              {/* Applicant Info */}
              <div style={sec}>
                <SectionHeader icon={User} title="Applicant Information" />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.9rem" }} className="ip-row">
                  <Field label="Last Name" required error={errors.lastName} style={{ flex: "2 1 150px" }}>{inp("lastName", "Dela Cruz")}</Field>
                  <Field label="First Name" required error={errors.firstName} style={{ flex: "2 1 150px" }}>{inp("firstName", "Juan")}</Field>
                  <Field label="M.I." error={errors.middleInitial} style={{ flex: "0 0 72px" }}>{inp("middleInitial", "M", "text", { maxLength: 1 })}</Field>
                  <Field label="Suffix" style={{ flex: "0 0 110px" }}>
                    <CustomSelect value={suffix} placeholder="—" options={SUFFIXES} onSelect={v => setSuffix(v)} />
                  </Field>
                </div>
                <Field label="Application Date"><input style={disabledStyle} value={form.date} disabled /></Field>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.9rem" }} className="ip-row">
                  <Field label="Date of Birth" required error={errors.dob} half>
                    <input className="ip-inp" style={{ ...inpStyle, border: errors.dob ? "1.5px solid #d32f2f" : "1.5px solid #fed7aa" }}
                      name="dob" type="date" min="1936-01-01" max={maxDob}
                      value={form.dob} onChange={handleChange} onBlur={handleBlur} />
                  </Field>
                  <Field label="Marital Status" required error={errors.maritalStatus} half>
                    <CustomSelect value={maritalStatus} placeholder="Select Status" options={MARITAL_OPTIONS}
                      error={errors.maritalStatus}
                      onSelect={v => { setMaritalStatus(v); setErrors(p => ({ ...p, maritalStatus: "" })); }} />
                  </Field>
                </div>
                {showSpouse && (
                  <>
                    <Field label="Spouse's Name" error={errors.spouseName}>{inp("spouseName", "Spouse's Full Name")}</Field>
                    <Field label="Spouse's Occupation" error={errors.spouseOccupation}>{inp("spouseOccupation", "Current Occupation")}</Field>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.9rem" }} className="ip-row">
                      <Field label="Spouse's Date of Birth" error={errors.spouseDob} half>
                        <input className="ip-inp" style={{ ...inpStyle, border: errors.spouseDob ? "1.5px solid #d32f2f" : "1.5px solid #fed7aa" }}
                          name="spouseDob" type="date" min="1936-01-01" max={maxDob}
                          value={form.spouseDob} onChange={handleChange} onBlur={handleBlur} />
                      </Field>
                      <Field label="Number of Dependents" error={errors.dependents} half>{inp("dependents", "0", "number")}</Field>
                    </div>
                  </>
                )}
              </div>

              {/* Contact */}
              <div style={sec}>
                <SectionHeader icon={Smartphone} title="Contact Information" />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.9rem" }} className="ip-row">
                  <Field label="Mobile Number" required error={errors.mobile} half>{inp("mobile", "09123456789")}</Field>
                  <Field label="Alternate Mobile Number" error={errors.altMobile} half>{inp("altMobile", "09123456789 (optional)")}</Field>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.9rem" }} className="ip-row">
                  <Field label="Telephone Number" error={errors.telephone} half>{inp("telephone", "(02) 1234-5678", "tel")}</Field>
                  <Field label="Email Address" required error={errors.email} half>{inp("email", "juandelacruz@email.com", "email")}</Field>
                </div>
              </div>

              {/* Address */}
              <div style={sec}>
                <SectionHeader icon={MapPin} title="Present Address" />

                <Field label="Region" required error={errors.addrRegion}>
                  <select
                    className="ip-inp"
                    style={{ ...inpStyle, border: errors.addrRegion ? "1.5px solid #d32f2f" : "1.5px solid #fed7aa" }}
                    value={addrRegion}
                    onChange={e => { setAddrRegion(e.target.value); setErrors(p => ({ ...p, addrRegion: "" })); }}
                    disabled={loadingRegions}
                  >
                    <option value="">{loadingRegions ? "Loading regions..." : "Select Region"}</option>
                    {regions.map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
                  </select>
                </Field>

                {provinces.length > 0 && (
                  <Field label="Province" required error={errors.addrProvince}>
                    <select
                      className="ip-inp"
                      style={{ ...inpStyle, border: errors.addrProvince ? "1.5px solid #d32f2f" : "1.5px solid #fed7aa" }}
                      value={addrProvince}
                      onChange={e => { setAddrProvince(e.target.value); setErrors(p => ({ ...p, addrProvince: "" })); }}
                      disabled={loadingProvinces || !addrRegion}
                    >
                      <option value="">{loadingProvinces ? "Loading provinces..." : "Select Province"}</option>
                      {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                    </select>
                  </Field>
                )}

                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.9rem" }} className="ip-row">
                  <Field label="City / Municipality" required error={errors.addrCity} half>
                    <select
                      className="ip-inp"
                      style={{ ...inpStyle, border: errors.addrCity ? "1.5px solid #d32f2f" : "1.5px solid #fed7aa" }}
                      value={addrCity}
                      onChange={e => { setAddrCity(e.target.value); setErrors(p => ({ ...p, addrCity: "" })); }}
                      disabled={loadingCities || !addrRegion}
                    >
                      <option value="">
                        {loadingCities ? "Loading cities..." : !addrRegion ? "Select region first" : "Select City/Municipality"}
                      </option>
                      {cities.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                  </Field>

                  <Field label="Barangay" required error={errors.addrBarangay} half>
                    <select
                      className="ip-inp"
                      style={{ ...inpStyle, border: errors.addrBarangay ? "1.5px solid #d32f2f" : "1.5px solid #fed7aa" }}
                      value={addrBarangay}
                      onChange={e => { setAddrBarangay(e.target.value); setErrors(p => ({ ...p, addrBarangay: "" })); }}
                      disabled={loadingBarangays || !addrCity}
                    >
                      <option value="">
                        {loadingBarangays ? "Loading barangays..." : !addrCity ? "Select city first" : "Select Barangay"}
                      </option>
                      {barangays.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="House No. / Street / Subdivision" required error={errors.addrStreet}>
                  <input className="ip-inp"
                    style={{ ...inpStyle, border: errors.addrStreet ? "1.5px solid #d32f2f" : "1.5px solid #fed7aa" }}
                    placeholder="House No., Street, Subdivision" value={addrStreet}
                    onChange={e => { setAddrStreet(e.target.value); setErrors(p => ({ ...p, addrStreet: "" })); }} />
                </Field>

                {addrRegion && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 12px", background: "#fff3e0", borderRadius: 8, fontSize: 12, color: "#ea580c" }}>
                    <MapPin size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>
                      {[addrStreet, getBarangayName(), getCityName(), getProvinceName(), getRegionName()]
                        .filter(Boolean).join(", ") || "Address preview will appear here"}
                    </span>
                  </div>
                )}
              </div>

              {/* Educational Background */}
              <div style={sec}>
                <SectionHeader icon={BookOpen} title="Educational Background" />
                {educList.length === 0 && <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0" }}>No education records added yet. Click below to begin.</p>}
                {educList.map((educ, i) => (
                  <div key={i} style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: 12, color: "#ea580c" }}>Record #{i + 1}</span>
                      <button type="button" onClick={() => removeEduc(i)} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", padding: 4 }}><Trash2 size={14} /></button>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.9rem" }}>
                      <Field label="Degree / Level" required half>
                        <CustomSelect value={educ.degree} placeholder="Select degree" options={DEGREE_TYPES} onSelect={v => updateEduc(i, "degree", v)} />
                      </Field>
                      <Field label="Year Graduated" half>
                        <input className="ip-inp" style={{ ...inpStyle, border: "1.5px solid #fed7aa" }} type="number" placeholder="e.g. 2010" min="1950" max={new Date().getFullYear()} value={educ.yearGrad} onChange={e => updateEduc(i, "yearGrad", e.target.value)} />
                      </Field>
                    </div>
                    <Field label="School / University">
                      <input className="ip-inp" style={{ ...inpStyle, border: "1.5px solid #fed7aa" }} placeholder="Name of School or University" value={educ.school} onChange={e => updateEduc(i, "school", capitalize(e.target.value))} />
                    </Field>
                    <Field label="Course / Program">
                      <input className="ip-inp" style={{ ...inpStyle, border: "1.5px solid #fed7aa" }} placeholder="e.g. BS Pharmacy" value={educ.course} onChange={e => updateEduc(i, "course", capitalize(e.target.value))} />
                    </Field>
                  </div>
                ))}
                <button type="button" onClick={addEduc} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 10, border: "1.5px dashed #ea580c", background: "transparent", color: "#ea580c", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Montserrat',sans-serif" }}>
                  <Plus size={16} /> Add Education Record
                </button>
              </div>

              <button style={submitBtn} onClick={() => { if (validatePage(p1Fields, p1Extras)) { auditLog.record("PAGE_1_COMPLETE"); setPage(2); window.scrollTo(0,0); } }}>
                Next: Business Interest <ArrowRight size={16} style={{ marginLeft: 8 }} />
              </button>
            </div>
          )}

          {/* ══ PAGE 2 ══ */}
          {page === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
              <div style={sec}>
                <SectionHeader icon={Briefcase} title="Business Interest" />
                <Field label="Extent of Involvement" required error={errors.involvement}>
                  <textarea className="ip-inp" style={{ ...inpStyle, minHeight: 76, resize: "vertical", border: errors.involvement ? "1.5px solid #d32f2f" : "1.5px solid #fed7aa" }}
                    name="involvement" placeholder="Describe your expected involvement in daily operations"
                    value={form.involvement} onChange={handleChange} onBlur={handleBlur} />
                </Field>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.9rem" }} className="ip-row">
                  <Field label="Percent of Equity Owned" required error={errors.equity} half>{inp("equity", "100", "number")}</Field>
                  <Field label="Cash Investment Amount (₱)" required error={errors.investment} half>{inp("investment", "2000000", "number")}</Field>
                </div>
                <Field label="Source of Funds" required error={errors.fundSource}>{inp("fundSource", "e.g. Personal Savings, Loan, Investment")}</Field>
                <Field label="Other Business Interests" error={errors.otherBusiness}>
                  <textarea className="ip-inp" style={{ ...inpStyle, minHeight: 76, resize: "vertical", border: "1.5px solid #fed7aa" }}
                    name="otherBusiness" placeholder="List any other business interests or ventures (optional)"
                    value={form.otherBusiness} onChange={handleChange} onBlur={handleBlur} />
                </Field>
                <Field label="Preferred Franchise Location" required error={errors.location}>
                  <textarea className="ip-inp" style={{ ...inpStyle, minHeight: 76, resize: "vertical", border: errors.location ? "1.5px solid #d32f2f" : "1.5px solid #fed7aa" }}
                    name="location" placeholder="Describe your preferred location (city, area, specific address if available)"
                    value={form.location} onChange={handleChange} onBlur={handleBlur} />
                </Field>
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button style={backBtn} onClick={() => { setPage(1); window.scrollTo(0,0); }}>← Back</button>
                <button style={submitBtn} onClick={() => { if (validatePage(p2Fields)) { auditLog.record("PAGE_2_COMPLETE"); setPage(3); window.scrollTo(0,0); } }}>
                  Next: Declaration <ArrowRight size={16} style={{ marginLeft: 8 }} />
                </button>
              </div>
            </div>
          )}

          {/* ══ PAGE 3 ══ */}
          {page === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
              <div style={sec}>
                <SectionHeader icon={FileText} title="Declaration" />
                <Field label="Family Dependence on Franchise Income" required error={errors.familyDepend}>
                  <textarea className="ip-inp" style={{ ...inpStyle, minHeight: 76, resize: "vertical", border: errors.familyDepend ? "1.5px solid #d32f2f" : "1.5px solid #fed7aa" }}
                    name="familyDepend" placeholder="Will your family depend solely on franchise income? Please explain."
                    value={form.familyDepend} onChange={handleChange} onBlur={handleBlur} />
                </Field>
                <Field label="Immediate Market Area" required error={errors.marketArea}>{inp("marketArea", "Describe the immediate market area for your franchise")}</Field>
                <Field label="Target Start Date" required error={errors.startDate}>
                  <input className="ip-inp" style={{ ...inpStyle, border: errors.startDate ? "1.5px solid #d32f2f" : "1.5px solid #fed7aa" }}
                    name="startDate" type="date" value={form.startDate} onChange={handleChange} onBlur={handleBlur} />
                </Field>
              </div>

              {/* Documents */}
              <div style={sec}>
                <SectionHeader icon={Upload} title="Required Documents" />
                <Field label="Letter of Intent (PDF)" required error={errors.letterOfIntent}>
                  <input ref={loiRef} type="file" accept="application/pdf" style={{ display: "none" }}
                    onChange={e => {
                      const f = e.target.files[0]; if (!f) return;
                      auditLog.record("LOI_UPLOADED", { fileName: f.name, size: f.size });
                      setLetterOfIntent(f); setErrors(p => ({ ...p, letterOfIntent: "" }));
                    }} />
                  <div onClick={() => loiRef.current.click()} style={{ border: errors.letterOfIntent ? "2px dashed #d32f2f" : "2px dashed #fed7aa", borderRadius: 12, padding: "20px 16px", textAlign: "center", cursor: "pointer", background: "#fffbf7", transition: "all .2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fff3e0"}
                    onMouseLeave={e => e.currentTarget.style.background = "#fffbf7"}>
                    {letterOfIntent ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
                        <CheckCircle2 size={20} color="#2E7D32" />
                        <span style={{ fontWeight: 700, color: "#2E7D32", fontSize: 13 }}>{letterOfIntent.name}</span>
                        <span style={{ color: "#9CA3AF", fontSize: 11 }}>({(letterOfIntent.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={24} color="#9CA3AF" style={{ margin: "0 auto 8px" }} />
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#374151" }}>Click to upload Letter of Intent</p>
                        <p style={{ margin: "4px 0 0", fontSize: 11, color: "#9CA3AF" }}>PDF only — max 10MB</p>
                      </>
                    )}
                  </div>
                </Field>
                {idVerified && (
                  <div style={{ padding: "12px 14px", background: "#e8f5e9", borderRadius: 10, border: "1.5px solid #a5d6a7", display: "flex", alignItems: "center", gap: 10 }}>
                    <CheckCircle2 size={16} color="#2E7D32" />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#1b5e20" }}>Valid ID attached — {idData?.idType} (from OCR scan)</span>
                  </div>
                )}
              </div>

              {/* Terms & Consent */}
              <div style={sec}>
                <SectionHeader icon={Shield} title="Terms & Consent" />
                <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
                  <input type="checkbox" checked={termsAccepted} onChange={e => { setTermsAccepted(e.target.checked); setErrors(p => ({ ...p, terms: "" })); }}
                    style={{ marginTop: 2, accentColor: "#ea580c", width: 16, height: 16, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
                    I have read and agree to the{" "}
                    <button type="button" onClick={() => setShowTerms(true)} style={{ background: "none", border: "none", color: "#ea580c", fontWeight: 700, cursor: "pointer", padding: 0, fontSize: 13, textDecoration: "underline", fontFamily: "inherit" }}>Terms and Conditions</button>
                    {" "}of iFranchise Business and Services Corporation. <span style={{ color: "#EF4444" }}>*</span>
                  </span>
                </label>
                {errors.terms && <p style={{ color: "#d32f2f", fontSize: 12, margin: "-4px 0 0", fontWeight: 600 }}>{errors.terms}</p>}

                <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
                  <input type="checkbox" checked={consentAccepted} onChange={e => { setConsentAccepted(e.target.checked); setErrors(p => ({ ...p, consent: "" })); }}
                    style={{ marginTop: 2, accentColor: "#ea580c", width: 16, height: 16, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
                    I consent to the collection, processing, and use of my personal data in accordance with the <strong>Data Privacy Act of 2012 (RA 10173)</strong> for the purpose of evaluating my franchise application. <span style={{ color: "#EF4444" }}>*</span>
                  </span>
                </label>
                {errors.consent && <p style={{ color: "#d32f2f", fontSize: 12, margin: "-4px 0 0", fontWeight: 600 }}>{errors.consent}</p>}

                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 14px", background: "#fff8e1", borderRadius: 8, border: "1px solid #ffe082" }}>
                  <Lock size={14} color="#e65100" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 12, color: "#e65100" }}>
                    <strong>Non-Transferability Notice:</strong> The franchise registered under this application is strictly personal and non-transferable. The name verified by your government-issued ID will be the sole authorized franchisee.
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button style={backBtn} onClick={() => { setPage(2); window.scrollTo(0,0); }}>← Back</button>
                <button style={submitBtn} onClick={handleFinalSubmit}>
                  Submit Application & Verify via OTP <ArrowRight size={16} style={{ marginLeft: 8 }} />
                </button>
              </div>
              <p style={{ textAlign: "center", fontSize: "0.82rem", color: "#9CA3AF", marginTop: "-0.8rem" }}>
                By submitting, you agree to our terms. An OTP will be sent to your registered mobile number.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const inpStyle = {
  width: "100%", padding: "13px 14px", borderRadius: 12, outline: "none",
  fontSize: 14, fontFamily: "'Montserrat',sans-serif", color: "#1a1a1a",
  background: "#fffbf7", transition: "border-color 0.2s", boxSizing: "border-box",
};
const disabledStyle = { ...inpStyle, background: "#f5f5f5", color: "#888", cursor: "not-allowed", border: "1.5px solid #e5e7eb" };
const sec = { background: "#fff7ed", borderRadius: 14, border: "1.5px solid #fed7aa", padding: "1.3rem 1.3rem 1.1rem", display: "flex", flexDirection: "column", gap: "0.9rem" };
const submitBtn = { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 14, borderRadius: 12, border: "none", background: "linear-gradient(90deg,#ea580c,#fb923c)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, letterSpacing: "0.5px", fontFamily: "'Montserrat',sans-serif", boxShadow: "0 4px 14px rgba(234,88,12,0.3)" };
const backBtn = { padding: "14px 24px", background: "#6B7280", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Montserrat',sans-serif" };

const S = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" },
  modalBox: { background: "#fff", borderRadius: 20, padding: "2.5rem 2rem 2rem", width: 380, maxWidth: "92vw", textAlign: "center", position: "relative", boxShadow: "0 24px 80px rgba(0,0,0,0.18)" },
  iconWrap: { width: 72, height: 72, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.2rem" },
  modalMsg: { fontSize: "1rem", color: "#374151", lineHeight: 1.6, marginBottom: "1.5rem" },
  btnRow: { display: "flex", gap: 10, justifyContent: "center" },
  btn: { padding: "0.65rem 2rem", borderRadius: 10, fontSize: "0.95rem", fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "'Montserrat',sans-serif", display: "inline-flex", alignItems: "center" },
  btnSolid: { background: "linear-gradient(90deg,#ea580c,#fb923c)", color: "#fff" },
  btnOutline: { background: "transparent", color: "#ea580c", border: "2px solid #ea580c" },
  closeBtn: { position: "absolute", top: 14, right: 14, background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 4 },
  zoomBtn: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
};