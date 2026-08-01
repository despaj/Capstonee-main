import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown, ChevronLeft, CheckCircle2, AlertCircle, X,
  User, Briefcase, FileText, ArrowRight, Trash2, Pencil,
  Upload, ZoomIn, ZoomOut, Camera, Smartphone, Eye, EyeOff,
  Shield, MapPin, RotateCcw, AlertTriangle, Info, Lock, IdCard
} from "lucide-react";
import logo from "../assets/logo.png";
import welcome from "../assets/welcomepage.png";

// ─── AUDIT TRAIL ─────────────────────────────────────────────────────────────
const auditLog = (() => {
  const logs = [];
  return {
    record: (action, data = {}) => {
      const entry = {
        id: `AUDIT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        action,
        data,
        sessionId: sessionStorage.getItem("session_id") || (() => {
          const id = `SES-${Date.now()}`;
          sessionStorage.setItem("session_id", id);
          return id;
        })(),
      };
      logs.push(entry);
      console.info("[AUDIT TRAIL]", entry);
      return entry;
    },
    getAll: () => [...logs],
  };
})();

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CONCEPTS = [
  "Coffee Spot Full Store","iPharma Mart",
  "Food Caravan","iFuel"
];
const CIVIL = ["Single","Married","Widowed","Separated"];
const SUFFIXES = ["","Jr.","Sr.","II","III","IV","V","MD","PhD","Esq."];
const PAYMENT_MODES = ["Cash","Bank Transfer","Cheque"];
const EMPLOYMENT_TYPES = [
  "Full-time Employee","Part-time Employee","Self-Employed",
  "Business Owner","Freelancer","Retired","Unemployed",
];
const NATIONALITIES = ["Filipino","Others"];

const VALID_ID_TYPES = [
  "Philippine Passport","SSS ID","GSIS ID","PhilHealth ID",
  "Pag-IBIG ID","Driver's License","PRC ID","Voter's ID",
  "National ID (PhilSys)","Senior Citizen ID","PWD ID","UMID",
];

const capitalize = (v) => v.replace(/(^|\s)\S/g, (c) => c.toUpperCase());

// ─── MODAL ────────────────────────────────────────────────────────────────────
function AlertModal({ open, type, message, onClose, onConfirm }) {
  if (!open) return null;
  const isSuccess = type === "success";
  return (
    <div style={S.overlay}>
      <div style={S.modalBox}>
        <div style={{ ...S.iconWrap, background: isSuccess ? "#e8f5e9" : "#fdecea" }}>
          {isSuccess
            ? <CheckCircle2 size={38} color="#2E7D32" strokeWidth={2} />
            : <AlertCircle size={38} color="#c62828" strokeWidth={2} />}
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

// ─── TERMS MODAL ─────────────────────────────────────────────────────────────

function TermsModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div style={S.overlay}>
      <div
        style={{
          ...S.modalBox,
          width: 700,
          maxWidth: "95vw",
          textAlign: "left",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "#2E7D32",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            Terms & Conditions
          </h3>

          <button style={S.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            overflowY: "auto",
            flex: 1,
            paddingRight: 8,
            fontSize: 13,
            color: "#374151",
            lineHeight: 1.9,
          }}
        >
          <p>
            By completing and submitting this Franchise Application Form,
            the applicant agrees to the following Terms and Conditions set
            by <strong>iFranchise Business and Services Corporation</strong>.
          </p>

          <p>
            <strong>1. DATA PRIVACY AND CONSENT (RA 10173)</strong>
            <br />
            By submitting this application, the applicant voluntarily gives
            consent to <strong>iFranchise Business and Services Corporation</strong> to
            <strong> collect, process, store, and manage personal information</strong>
            in accordance with the
            <strong> Data Privacy Act of 2012 (Republic Act No. 10173)</strong>.
            <br />
            <br />
            Information collected may be used for
            <strong>
              {" "}
              franchise application processing, identity verification,
              communication, internal record keeping, fraud prevention,
              verification, and legal compliance
            </strong>.
            <br />
            <br />
            The company agrees to implement
            <strong>
              {" "}
              reasonable security measures to protect submitted personal
              information
            </strong>
            against unauthorized access, disclosure, misuse, or loss.
          </p>

          <p>
            <strong>2. APPLICANT INFORMATION AND DECLARATION</strong>
            <br />
            The applicant confirms that all personal information submitted
            in the application form is
            <strong> complete, true, accurate, and updated</strong>,
            including but not limited to
            <strong>
              {" "}
              full name, date of birth, civil status, gender, nationality,
              contact details, address, employment information, income details,
              uploaded IDs, and Letter of Intent
            </strong>.
            <br />
            <br />
            The applicant understands that any
            <strong>
              {" "}
              false, misleading, incomplete, or fraudulent information
            </strong>
            may result in
            <strong>
              {" "}
              rejection, suspension, permanent disqualification, or legal action
            </strong>.
          </p>

          <p>
            <strong>3. ID VERIFICATION AND DOCUMENT AUTHENTICITY</strong>
            <br />
            The applicant agrees to upload only
            <strong>
              {" "}
              valid and authentic government-issued identification documents
            </strong>
            for verification purposes.
            <br />
            <br />
            The applicant authorizes the company to
            <strong> verify the authenticity of submitted IDs</strong> and
            acknowledges that
            <strong> falsified or tampered IDs are strictly prohibited</strong>.
          </p>

          <p>
            <strong>4. OCR AND AUTO-FILLED INFORMATION CONSENT</strong>
            <br />
            The applicant acknowledges that the system may use
            <strong> OCR (Optical Character Recognition) technology</strong>
            to scan uploaded IDs and automatically populate application fields.
            <br />
            <br />
            The applicant is responsible for
            <strong>
              {" "}
              reviewing and correcting all auto-filled information
            </strong>
            before submission.
          </p>

          <p>
            <strong>5. FRANCHISE APPLICATION EVALUATION</strong>
            <br />
            Submission of this application form does
            <strong> not guarantee franchise approval</strong>,
            ownership, or partnership rights.
            <br />
            <br />
            All applications are subject to
            <strong>
              {" "}
              document verification, financial assessment, background checking,
              business evaluation, and internal approval procedures
            </strong>.
            <br />
            <br />
            The company reserves the right to
            <strong>
              {" "}
              approve, reject, suspend, or terminate any application
            </strong>
            at its sole discretion.
          </p>

          <p>
            <strong>6. PAYMENT TERMS</strong>
            <br />
            Any
            <strong>
              {" "}
              fees, reservation payments, processing fees, or franchise-related
              payments
            </strong>
            made through the selected payment mode are subject to company policies.
          </p>

          <p>
            <strong>7. EMPLOYMENT AND FINANCIAL INFORMATION</strong>
            <br />
            The applicant certifies that all
            <strong>
              {" "}
              employment, income, and business information submitted
            </strong>
            are accurate and may be used for
            <strong> financial and application evaluation purposes</strong>.
          </p>

          <p>
            <strong>8. LETTER OF INTENT SUBMISSION</strong>
            <br />
            The applicant agrees to upload a
            <strong> valid PDF copy of the required Letter of Intent</strong>.
            Uploaded documents must be
            <strong> readable, authentic, and free from malicious content</strong>.
          </p>

          <p>
            <strong>9. COMMUNICATION CONSENT</strong>
            <br />
            The applicant authorizes the company to contact them through
            <strong>
              {" "}
              mobile number, alternate mobile number, email address,
              or other communication channels
            </strong>
            regarding
            <strong>
              {" "}
              application updates, interviews, payment confirmations,
              and franchise-related notifications
            </strong>.
          </p>

          <p>
            <strong>10. AUDIT TRAIL AND SECURITY LOGS</strong>
            <br />
            All actions performed during the franchise application process
            may be recorded, including
            <strong>
              {" "}
              timestamps, session identifiers, uploaded files,
              and system activities
            </strong>
            for security and monitoring purposes.
          </p>

          <p>
            <strong>11. OTP VERIFICATION</strong>
            <br />
            The applicant may receive a
            <strong> One-Time Password (OTP)</strong>
            through the registered mobile number for
            <strong> identity verification and security purposes</strong>.
          </p>

          <p>
            <strong>12. INTELLECTUAL PROPERTY AND SYSTEM USAGE</strong>
            <br />
            The applicant agrees not to
            <strong>
              {" "}
              attempt unauthorized access, upload malicious files,
              manipulate records, or misuse the system
            </strong>.
          </p>

          <p>
            <strong>13. LIMITATION OF LIABILITY</strong>
            <br />
            The company shall not be held liable for
            <strong>
              {" "}
              delays caused by incomplete submissions, OCR inaccuracies,
              technical issues, or unauthorized access caused by applicant negligence
            </strong>.
          </p>

          <p>
            <strong>14. GOVERNING LAW</strong>
            <br />
            These Terms and Conditions shall be governed by the
            <strong> laws of the Republic of the Philippines</strong>.
          </p>

          <p>
            <strong>15. AMENDMENTS AND MODIFICATIONS</strong>
            <br />
            The company reserves the right to
            <strong>
              {" "}
              modify or update these Terms and Conditions at any time
            </strong>
            without prior notice.
          </p>

          <p>
            <strong>16. APPLICANT AGREEMENT</strong>
            <br />
            By checking the agreement checkbox and submitting the application,
            the applicant confirms that:
          </p>

          <ul style={{ paddingLeft: 20 }}>
            <li>
              They have <strong>read and understood</strong> these Terms and Conditions
            </li>
            <li>
              All submitted information is
              <strong> accurate and legitimate</strong>
            </li>
            <li>
              They voluntarily <strong>agree to all stated provisions</strong>
            </li>
            <li>
              They consent to
              <strong>
                {" "}
                verification, evaluation, and data processing procedures
              </strong>
            </li>
          </ul>

          <p style={{ color: "#6B7280", fontSize: 12, marginTop: 24 }}>
            Last Updated: May 12, 2026
          </p>
        </div>

        <button
          style={{
            ...S.btn,
            ...S.btnSolid,
            marginTop: 16,
            width: "100%",
          }}
          onClick={onClose}
        >
          I Have Read the Terms
        </button>
      </div>
    </div>
  );
}

// ─── OTP MODAL ───────────────────────────────────────────────────────────────
function OtpModal({ open, mobile, onVerify, onClose, maxAttempts = 3, expectedOtp, onResend }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const refs = useRef([]);

  useEffect(() => {
    if (!open) return;
    setOtp(["", "", "", "", "", ""]);
    setAttempts(0);
    setError("");
    setCountdown(60);
    setCanResend(false);
    auditLog.record("OTP_SENT", { mobile, timestamp: new Date().toISOString() });
  }, [open]);

  useEffect(() => {
    if (!open || canResend) return;
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(t); setCanResend(true); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [open, canResend]);

  const handleInput = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const verify = () => {
    const code = otp.join("");
    if (code.length < 6) { setError("Please enter the complete 6-digit OTP."); return; }
    auditLog.record("OTP_ATTEMPT", { attempt: attempts + 1, maskedOtp: "XXXXXX" });
    if (code === expectedOtp) {
      auditLog.record("OTP_VERIFIED", { success: true });
      onVerify(true);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      auditLog.record("OTP_FAILED", { attempt: newAttempts, remaining: maxAttempts - newAttempts });
      if (newAttempts >= maxAttempts) {
        auditLog.record("OTP_MAX_ATTEMPTS_REACHED");
        setError(`Maximum ${maxAttempts} attempts reached. Please request a new OTP.`);
        setOtp(["", "", "", "", "", ""]);
        setCanResend(true);
      } else {
        setError(`Incorrect OTP. ${maxAttempts - newAttempts} attempt(s) remaining.`);
        setOtp(["", "", "", "", "", ""]);
        refs.current[0]?.focus();
      }
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
        <div style={{ ...S.iconWrap, background: "#e8f5e9" }}>
          <Smartphone size={38} color="#2E7D32" strokeWidth={2} />
        </div>
        <h3 style={{ margin: "0 0 6px", color: "#1a1a1a", fontSize: 18, fontWeight: 700 }}>OTP Verification</h3>
        <p style={{ margin: "0 0 20px", color: "#6B7280", fontSize: 13, lineHeight: 1.6 }}>
          A 6-digit code was sent to <strong>{mobile?.replace(/(\d{4})(\d{3})(\d{4})/, "$1-$2-$3")}</strong>.
          <br />
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
          {otp.map((d, i) => (
            <input
              key={i}
              ref={el => refs.current[i] = el}
              type="text" inputMode="numeric" maxLength={1} value={d}
              onChange={e => handleInput(i, e.target.value)}
              onKeyDown={e => handleKey(i, e)}
              style={{
                width: 44, height: 52, textAlign: "center", fontSize: 22, fontWeight: 700,
                borderRadius: 10, border: error ? "2px solid #d32f2f" : "2px solid #c8e6c9",
                outline: "none", fontFamily: "'Montserrat',sans-serif",
                background: "#fafafa", color: "#1a1a1a",
              }}
            />
          ))}
        </div>
        {error && <p style={{ color: "#d32f2f", fontSize: 12, margin: "0 0 12px", fontWeight: 600 }}>{error}</p>}
        <button style={{ ...S.btn, ...S.btnSolid, width: "100%", marginBottom: 10 }} onClick={verify}>
          Verify OTP
        </button>
        <p style={{ margin: 0, fontSize: 12, color: "#9CA3AF" }}>
          {canResend
            ? <button onClick={resend} disabled={sending} style={{ background: "none", border: "none", color: "#2E7D32", fontWeight: 700, cursor: "pointer", fontSize: 12, padding: 0 }}>{sending ? "Resending…" : "Resend OTP"}</button>
            : <>Resend in <strong style={{ color: "#2E7D32" }}>{countdown}s</strong></>}
        </p>
        <button style={S.closeBtn} onClick={onClose}><X size={18} /></button>
      </div>
    </div>
  );
}

function IdScannerModal({ open, onComplete, onClose }) {
  const [step, setStep] = useState("type");
  const [idType, setIdType] = useState("");
  const [frontImg, setFrontImg] = useState(null);
  const [backImg, setBackImg] = useState(null);
  const [faceImg, setFaceImg] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [idValid, setIdValid] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedOcr, setEditedOcr] = useState({});
  const [frontZoom, setFrontZoom] = useState(1);
  const [backZoom, setBackZoom] = useState(1);
  const [frontRotation, setFrontRotation] = useState(0);
  const [backRotation, setBackRotation] = useState(0);

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [countdown, setCountdown] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const countdownRef = useRef(null);

  const frontRef = useRef();
  const backRef = useRef();
  const faceFileRef = useRef();

  // ── Reset on close ──────────────────────────────────────────────
  useEffect(() => {
    if (!open) {
      stopCamera();
      setStep("type"); setIdType("");
      setFrontImg(null); setBackImg(null); setFaceImg(null);
      setFrontZoom(1); setBackZoom(1);
      setFrontRotation(0); setBackRotation(0);
      setOcrResult(null); setIdValid(null);
      setIsEditing(false); setEditedOcr({});
      setCameraError(""); setCountdown(null);
    }
  }, [open]);

  // ── Camera helpers ──────────────────────────────────────────────
  const startCamera = async () => {
    setCameraError("");
    setFaceImg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access and try again."
          : "Could not access camera. Please upload a selfie instead."
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCameraActive(false);
    setCountdown(null);
  };

  const startCountdown = () => {
    let count = 3;
    setCountdown(count);
    countdownRef.current = setInterval(() => {
      count -= 1;
      if (count === 0) {
        clearInterval(countdownRef.current);
        setCountdown(null);
        capturePhoto();
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setFaceImg(dataUrl);
    stopCamera();
    auditLog.record("FACE_CAPTURED");
  };

  const handleFile = (side, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (side === "front") setFrontImg(e.target.result);
      else if (side === "back") setBackImg(e.target.result);
      else if (side === "face") setFaceImg(e.target.result);
      auditLog.record("ID_IMAGE_UPLOADED", { side, idType, fileName: file.name, size: file.size });
    };
    reader.readAsDataURL(file);
  };

  // Replace your existing runVerification function with this

const runVerification = async () => {
  stopCamera();
  setStep("processing");
  auditLog.record("OCR_STARTED", { idType });

  try {
    const verifyRes = await fetch(`${process.env.REACT_APP_API_URL}/api/verify-id`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        frontImage: frontImg,
        backImage:  backImg,
        idType,
      }),
    });

    if (!verifyRes.ok) throw new Error(`Server error ${verifyRes.status}`);

    const verifyResult = await verifyRes.json();

    if (!verifyResult.success) {
      setOcrResult({ reason: verifyResult.error || "ID verification failed. Please try again." });
      setIdValid(false);
      setStep("result");
      return;
    }

    const data = verifyResult.data || {};

    if (!data.isValid) {
      setOcrResult(data);
      setIdValid(false);
      setStep("result");
      auditLog.record("OCR_INVALID", { reason: data.reason });
      return;
    }

    const faceRes = await fetch(`${process.env.REACT_APP_API_URL}/api/face-match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        faceImage: faceImg, 
        idImage:   frontImg,
      }),
    });

    if (!faceRes.ok) throw new Error(`Face match server error ${faceRes.status}`);

    const faceResult = await faceRes.json();
    console.log("Face match:", faceResult);

    if (!faceResult.success || !faceResult.matched) {
      setOcrResult({
        ...data,
        isValid: false,
        reason: faceResult.reason || "Face does not match the ID photo. Please retake your selfie.",
        faceScore: faceResult.score || 0,
      });
      setIdValid(false);
      setStep("result");
      auditLog.record("FACE_MATCH_FAILED", { score: faceResult.score });
      return;
    }

    // ── Step 3: All passed ────────────────────────────────────────────
    auditLog.record("FACE_MATCH_PASSED", { score: faceResult.score });

    const merged = {
      ...data,
      faceScore: faceResult.score,
    };

    setOcrResult(merged);
    setEditedOcr({
      lastName:   (merged.lastName   || "").toUpperCase(),
      firstName:  (merged.firstName  || "").toUpperCase(),
      middleName: (merged.middleName || "").toUpperCase(),
      dob:        merged.dob        || "",
      idNumber:   (merged.idNumber   || "").toUpperCase(),
      expiryDate: merged.expiryDate || "",
    });
    auditLog.record("OCR_COMPLETED", { confidence: merged.confidence, idType });
    setIsEditing(true); // open edit mode so user can fix any missed fields
    setIdValid(true);
    setStep("result");

  } catch (err) {
    console.error("verify-id error:", err);
    auditLog.record("OCR_ERROR", { error: err.message });
    setOcrResult({ reason: "Something went wrong during verification. Please try again." });
    setIdValid(false);
    setStep("result");
  }
};

  // ── Confirm & fill form ─────────────────────────────────────────
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

    const merged = { ...ocrResult, ...editedOcr };
    const { address, ...mergedWithoutAddress } = merged;

    onComplete({
      ocrResult: { ...mergedWithoutAddress, dob: formatDob(merged.dob) },
      idType,
      idValid,
      frontImg,
      backImg,
      faceImg,
    });
    onClose();
  };

  if (!open) return null;

  // face step is now the last step before verify (no didit/processing in nav)
  const STEPS       = ["type", "front", "back", "face", "processing", "result"];
  const STEP_LABELS = ["Select ID", "Front", "Back", "Face", "Processing", "Result"];
  const stepIdx     = STEPS.indexOf(step);

  return (
    <div style={S.overlay}>
      <div style={{ ...S.modalBox, width: 560, maxWidth: "95vw", textAlign: "left", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#368f3b,#218428)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={18} color="#fff" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>ID Verification</h3>
            <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>Powered by ID Analyzer</p>
          </div>
          <button style={{ ...S.closeBtn, position: "static", marginLeft: "auto" }} onClick={onClose}><X size={18} /></button>
        </div>

        {/* Progress bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {STEP_LABELS.map((label, i) => (
            <div key={label} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= stepIdx ? "linear-gradient(90deg,#368f3b,#218428)" : "#e5e7eb" }} />
          ))}
        </div>

        <div style={{ overflowY: "auto", flex: 1 }}>

          {/* ── Select ID type ── */}
          {step === "type" && (
            <div>
              <p style={{ margin: "0 0 12px", fontWeight: 600, fontSize: 14 }}>Select your Government-Issued ID:</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {VALID_ID_TYPES.map(t => (
                  <button key={t} onClick={() => setIdType(t)} style={{
                    padding: "10px 12px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                    border: idType === t ? "2px solid #2E7D32" : "1.5px solid #e5e7eb",
                    background: idType === t ? "#e8f5e9" : "#fafafa",
                    color: idType === t ? "#2E7D32" : "#374151",
                    cursor: "pointer", textAlign: "left", transition: "all .15s",
                  }}>{t}</button>
                ))}
              </div>
              <button disabled={!idType} onClick={() => setStep("front")}
                style={{ ...S.btn, ...S.btnSolid, width: "100%", marginTop: 16, opacity: idType ? 1 : 0.5 }}>
                Continue — Scan Front Side <ArrowRight size={14} style={{ marginLeft: 6 }} />
              </button>
            </div>
          )}

          {/* ── Front image ── */}
          {step === "front" && (
            <div>
              <p style={{ margin: "0 0 12px", fontWeight: 600, fontSize: 14 }}>
                Scan FRONT side of your <span style={{ color: "#2E7D32" }}>{idType}</span>
              </p>
              <p style={{ margin: "0 0 12px", fontSize: 12, color: "#6B7280" }}>
                Ensure good lighting. All text must be clearly visible. Accepted: JPG, PNG, PDF.
              </p>
              <div style={{ position: "relative", marginBottom: 12 }}>
                <div style={{ width: "100%", height: 180, overflow: "hidden", borderRadius: 10, background: "#f0f0f0", border: "2px dashed #c8e6c9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {frontImg
                    ? <img src={frontImg} alt="Front ID" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", transform: `scale(${frontZoom}) rotate(${frontRotation}deg)`, transition: "transform .2s" }} />
                    : <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                        <Camera size={32} color="#9CA3AF" />
                        <span style={{ fontSize: 12, color: "#9CA3AF" }}>No image uploaded yet</span>
                      </div>}
                </div>
                {frontImg && (
                  <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 6 }}>
                    <button onClick={() => setFrontZoom(z => Math.min(z + 0.25, 3))} style={S.zoomBtn}><ZoomIn size={14} /></button>
                    <button onClick={() => setFrontZoom(z => Math.max(z - 0.25, 0.5))} style={S.zoomBtn}><ZoomOut size={14} /></button>
                    <button onClick={() => setFrontRotation(r => r - 90)} style={S.zoomBtn}><RotateCcw size={14} /></button>
                  </div>
                )}
              </div>
              <input ref={frontRef} type="file" accept="image/*,application/pdf" style={{ display: "none" }}
                onChange={e => handleFile("front", e.target.files[0])} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => frontRef.current.click()} style={{ ...S.btn, ...S.btnOutline, flex: 1 }}>
                  <Upload size={14} style={{ marginRight: 6 }} /> Upload Image
                </button>
                <button disabled={!frontImg} onClick={() => setStep("back")}
                  style={{ ...S.btn, ...S.btnSolid, flex: 1, opacity: frontImg ? 1 : 0.5 }}>
                  Next: Back Side <ArrowRight size={14} style={{ marginLeft: 6 }} />
                </button>
              </div>
            </div>
          )}

          {/* ── Back image ── */}
          {step === "back" && (
            <div>
              <p style={{ margin: "0 0 12px", fontWeight: 600, fontSize: 14 }}>
                Scan BACK side of your <span style={{ color: "#2E7D32" }}>{idType}</span>
              </p>
              <p style={{ margin: "0 0 12px", fontSize: 12, color: "#6B7280" }}>
                Upload the back of your ID. This helps verify authenticity.
              </p>
              <div style={{ position: "relative", marginBottom: 12 }}>
                <div style={{ width: "100%", height: 180, overflow: "hidden", borderRadius: 10, background: "#f0f0f0", border: "2px dashed #c8e6c9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {backImg
                    ? <img src={backImg} alt="Back ID" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", transform: `scale(${backZoom}) rotate(${backRotation}deg)`, transition: "transform .2s" }} />
                    : <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                        <Camera size={32} color="#9CA3AF" />
                        <span style={{ fontSize: 12, color: "#9CA3AF" }}>No image uploaded yet</span>
                      </div>}
                </div>
                {backImg && (
                  <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 6 }}>
                    <button onClick={() => setBackZoom(z => Math.min(z + 0.25, 3))} style={S.zoomBtn}><ZoomIn size={14} /></button>
                    <button onClick={() => setBackZoom(z => Math.max(z - 0.25, 0.5))} style={S.zoomBtn}><ZoomOut size={14} /></button>
                    <button onClick={() => setBackRotation(r => r - 90)} style={S.zoomBtn}><RotateCcw size={14} /></button>
                  </div>
                )}
              </div>
              <input ref={backRef} type="file" accept="image/*,application/pdf" style={{ display: "none" }}
                onChange={e => handleFile("back", e.target.files[0])} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setStep("front")} style={{ ...S.btn, ...S.btnOutline }}>← Back</button>
                <button onClick={() => backRef.current.click()} style={{ ...S.btn, ...S.btnOutline, flex: 1 }}>
                  <Upload size={14} style={{ marginRight: 6 }} /> Upload Image
                </button>
                <button disabled={!backImg} onClick={() => setStep("face")}
                  style={{ ...S.btn, ...S.btnSolid, flex: 1, opacity: backImg ? 1 : 0.5 }}>
                  Next: Face Scan <ArrowRight size={14} style={{ marginLeft: 6 }} />
                </button>
              </div>
            </div>
          )}

          {/* ── Face scan ── */}
          {step === "face" && (
            <div>
              <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>Face Verification</p>
              <p style={{ margin: "0 0 14px", fontSize: 12, color: "#6B7280", lineHeight: 1.6 }}>
                Position your face inside the oval and ensure good lighting.
              </p>

              {/* Camera viewport */}
              <div style={{
                position: "relative", width: "100%", height: 300,
                borderRadius: 16, overflow: "hidden",
                background: faceImg ? "#000" : "#0d1117",
                marginBottom: 14,
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              }}>

                {/* Live video */}
                <video
                  ref={videoRef} autoPlay playsInline muted
                  style={{
                    position: "absolute", inset: 0, width: "100%", height: "100%",
                    objectFit: "cover", transform: "scaleX(-1)",
                    display: cameraActive && !faceImg ? "block" : "none",
                  }}
                />

                {/* Captured photo */}
                {faceImg && (
                  <img src={faceImg} alt="Face capture" style={{
                    position: "absolute", inset: 0, width: "100%", height: "100%",
                    objectFit: "cover",
                  }} />
                )}

                {/* Idle state — camera not started */}
                {!cameraActive && !faceImg && !cameraError && (
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    gap: 12,
                  }}>
                    <div style={{
                      width: 80, height: 80, borderRadius: "50%",
                      background: "rgba(46,125,50,0.12)",
                      border: "2px dashed rgba(46,125,50,0.4)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Camera size={34} color="rgba(46,125,50,0.7)" />
                    </div>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                      Camera not started
                    </span>
                  </div>
                )}

                {/* Camera error */}
                {cameraError && !faceImg && (
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    padding: "0 24px", textAlign: "center", gap: 8,
                  }}>
                    <AlertCircle size={28} color="#ef4444" />
                    <p style={{ fontSize: 12, color: "#ef4444", fontWeight: 600, margin: 0 }}>{cameraError}</p>
                  </div>
                )}

                {/* Oval face guide overlay — only when camera active */}
                {cameraActive && !faceImg && (
                  <>
                    {/* Dark overlay with oval cutout via box-shadow trick */}
                    <div style={{
                      position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <div style={{
                        width: 150, height: 195,
                        borderRadius: "50%",
                        border: "3px solid rgba(46,125,50,0.95)",
                        boxShadow: "0 0 0 9999px rgba(0,0,0,0.52)",
                        position: "relative",
                      }}>
                        {/* Corner tick marks */}
                        {[
                          { top: -3, left: "50%", transform: "translateX(-50%)", width: 28, height: 3, borderRadius: 2 },
                          { bottom: -3, left: "50%", transform: "translateX(-50%)", width: 28, height: 3, borderRadius: 2 },
                        ].map((s, i) => (
                          <div key={i} style={{ position: "absolute", background: "#2E7D32", ...s }} />
                        ))}
                      </div>
                    </div>

                    {/* Instruction label at bottom */}
                    <div style={{
                      position: "absolute", bottom: 14, left: 0, right: 0,
                      textAlign: "center", zIndex: 3, pointerEvents: "none",
                    }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, color: "#fff",
                        background: "rgba(0,0,0,0.55)", borderRadius: 20,
                        padding: "4px 14px", letterSpacing: 0.3,
                      }}>
                        Center your face in the oval
                      </span>
                    </div>
                  </>
                )}

                {/* Countdown bubble */}
                {countdown !== null && (
                  <div style={{
                    position: "absolute", inset: 0, zIndex: 4,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    pointerEvents: "none",
                  }}>
                    <div style={{
                      width: 15, height: 15, borderRadius: "50%",
                      background: "rgba(46,125,50,0.88)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 25, fontWeight: 500, color: "#fff",
                      boxShadow: "0 0 0 8px rgba(46,125,50,0.25)",
                    }}>
                      {countdown}
                    </div>
                  </div>
                )}

                {/* Success checkmark overlay on captured photo */}
                {faceImg && (
                  <div style={{
                    position: "absolute", top: 12, right: 12, zIndex: 4,
                    width: 36, height: 36, borderRadius: "50%",
                    background: "#2E7D32",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}>
                    <CheckCircle2 size={20} color="#fff" />
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} style={{ display: "none" }} />

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 8 }}>
                {!faceImg && !cameraActive && (
                  <button onClick={startCamera} style={{
                    ...S.btn, ...S.btnSolid, flex: 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "13px 20px", fontSize: 13,
                  }}>
                    <Camera size={16} /> Open Camera
                  </button>
                )}

                {cameraActive && !faceImg && (
                  <>
                    <button onClick={stopCamera} style={{
                      ...S.btn, ...S.btnOutline,
                      padding: "13px 16px", fontSize: 13,
                    }}>
                      Cancel
                    </button>
                    <button
                      onClick={startCountdown}
                      disabled={countdown !== null}
                      style={{
                        ...S.btn, ...S.btnSolid, flex: 1,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        padding: "13px 20px", fontSize: 13,
                        opacity: countdown !== null ? 0.65 : 1,
                        transition: "opacity .2s",
                      }}
                    >
                      {countdown !== null
                        ? `📸 Taking in ${countdown}…`
                        : <><span style={{ fontSize: 16 }}>📸</span> Take Photo</>}
                    </button>
                  </>
                )}

                {faceImg && (
                  <button onClick={() => { setFaceImg(null); startCamera(); }} style={{
                    ...S.btn, ...S.btnOutline, flex: 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "13px 20px", fontSize: 13,
                  }}>
                    <RotateCcw size={15} /> Retake Photo
                  </button>
                )}
              </div>

              {/* Tips */}
              {!faceImg && (
                <div style={{
                  marginTop: 12, padding: "10px 14px",
                  background: "#f0fdf4", borderRadius: 10, border: "1px solid #c8e6c9",
                  display: "flex", gap: 10, alignItems: "flex-start",
                }}>
                  <Info size={14} color="#2E7D32" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ margin: 0, fontSize: 11, color: "#374151", lineHeight: 1.6 }}>
                    <strong>Tips:</strong> Face forward, remove glasses if possible, ensure your face is evenly lit with no harsh shadows.
                  </p>
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button onClick={() => { stopCamera(); setStep("back"); }} style={{
                  ...S.btn, ...S.btnOutline, padding: "13px 16px", fontSize: 13,
                }}>
                  ← Back
                </button>
                <button
                  disabled={!faceImg}
                  onClick={runVerification}
                  style={{
                    ...S.btn, ...S.btnSolid, flex: 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "13px 20px", fontSize: 13,
                    opacity: faceImg ? 1 : 0.45,
                    transition: "opacity .2s",
                  }}
                >
                  <Shield size={15} /> Verify ID
                </button>
              </div>
            </div>
          )}

          {/* ── Processing ── */}
          {step === "processing" && (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ width: 64, height: 64, border: "5px solid #c8e6c9", borderTop: "5px solid #2E7D32", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" }} />
              <p style={{ fontWeight: 700, fontSize: 16, color: "#2E7D32", margin: "0 0 8px" }}>Verifying ID…</p>
              <p style={{ color: "#6B7280", fontSize: 13, margin: 0 }}>Analyzing your document. Please wait.</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* ── Result ── */}
          {step === "result" && ocrResult && (
            <div>
              <div style={{ padding: "12px 16px", borderRadius: 10, marginBottom: 16, background: idValid ? "#e8f5e9" : "#fdecea", border: `1.5px solid ${idValid ? "#a5d6a7" : "#ef9a9a"}`, display: "flex", alignItems: "center", gap: 10 }}>
                {idValid ? <CheckCircle2 size={20} color="#2E7D32" /> : <AlertCircle size={20} color="#c62828" />}
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: idValid ? "#1b5e20" : "#b71c1c" }}>
                    {idValid ? "ID Validated Successfully" : "ID Validation Failed"}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: idValid ? "#388e3c" : "#c62828" }}>
                    {idValid
                      ? `Confidence: ${(ocrResult.confidence * 100).toFixed(0)}%`
                      : "Please upload a valid, clear government ID."}
                  </p>
                </div>
              </div>

              {idValid && (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 10px" }}>
                    <p style={{ fontWeight: 600, fontSize: 13, margin: 0, color: "#374151" }}>Extracted Information (will auto-fill form):</p>
                    <button
                      onClick={() => { if (isEditing) setOcrResult(prev => ({ ...prev, ...editedOcr })); setIsEditing(e => !e); }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: isEditing ? "#2E7D32" : "#6B7280", padding: 4, display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}
                    >
                      <Pencil size={14} />
                      {isEditing ? "Done" : "Edit"}
                    </button>
                  </div>
                  <div style={{ background: "#f9fdf9", border: "1.5px solid #c8e6c9", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
                    {[
                      ["Last Name",     "lastName"],
                      ["First Name",    "firstName"],
                      ["Middle Name",   "middleName"],
                      ["Date of Birth", "dob"],
                      ["ID Number",     "idNumber"],
                      ["Expiry Date",   "expiryDate"],
                    ].map(([label, field]) => (
                      <div key={label} style={{ display: "flex", gap: 12, fontSize: 13, padding: "5px 0", borderBottom: "1px solid #f3f4f6", alignItems: "center" }}>
                        <span style={{ color: "#6B7280", width: 110, flexShrink: 0 }}>{label}</span>
                        {isEditing ? (
                          <input value={editedOcr[field] || ""} onChange={e => setEditedOcr(p => ({ ...p, [field]: e.target.value.toUpperCase() }))}
                            style={{ flex: 1, border: "1.5px solid #c8e6c9", borderRadius: 8, padding: "4px 8px", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                        ) : (
                          <span style={{ fontWeight: 600, color: "#1a1a1a" }}>{editedOcr[field] || ocrResult[field] || "—"}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", background: "#fff8e1", borderRadius: 8, border: "1px solid #ffe082", marginBottom: 14 }}>
                    <Lock size={14} color="#e65100" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#c62828", margin: 0 }}>
                      The name registered in this application is NON-TRANSFERABLE and must match the approved franchisee's legal identity.
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setStep("type")} style={{ ...S.btn, ...S.btnOutline }}>Rescan ID</button>
                    <button onClick={confirmAndFill} style={{ ...S.btn, ...S.btnSolid, flex: 1 }}>
                      Use This Data & Continue <ArrowRight size={14} style={{ marginLeft: 6 }} />
                    </button>
                  </div>
                </>
              )}

              {!idValid && (
                <div>
                  {ocrResult?.reason && (
                    <p style={{ fontSize: 13, color: "#c62828", fontWeight: 600, marginBottom: 12, padding: "10px 14px", background: "#fdecea", borderRadius: 8 }}>
                      Reason: {ocrResult.reason}
                    </p>
                  )}
                  <button onClick={() => setStep("type")} style={{ ...S.btn, ...S.btnSolid, width: "100%" }}>
                    Try Again with a Valid ID
                  </button>
                </div>
              )}
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
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button type="button" disabled={disabled} onClick={() => setOpen(p => !p)} style={{
        width: "100%", padding: "13px 14px", borderRadius: 12,
        border: error ? "1.5px solid #d32f2f" : "1.5px solid #c8e6c9",
        fontSize: 14, fontFamily: "'Montserrat',sans-serif",
        color: value ? "#1a1a1a" : "#9CA3AF", background: "#fafafa",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        cursor: disabled ? "not-allowed" : "pointer", outline: "none",
        transition: "border-color .2s", boxSizing: "border-box",
      }}>
        <span>{value || placeholder}</span>
        <ChevronDown size={16} color="#6B7280" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#fff", border: "1.5px solid #c8e6c9", borderRadius: 12,
          zIndex: 300, maxHeight: 220, overflowY: "auto",
          boxShadow: "0 8px 32px rgba(33,132,40,0.12)",
        }}>
          {options.map(o => (
            <div key={o || "none"} style={{
              padding: "11px 14px", cursor: "pointer", fontSize: 14,
              borderBottom: "1px solid #f3f4f6",
              fontWeight: o === value ? 700 : 400,
              color: o === value ? "#2E7D32" : "#1a1a1a",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
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
      {label && (
        <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#374151", marginBottom: "0.4rem" }}>
          {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
        </label>
      )}
      {children}
      {error && (
        <span style={{ display: "flex", alignItems: "center", color: "#d32f2f", fontSize: "0.78rem", marginTop: "0.3rem", fontWeight: 600 }}>
          <AlertCircle size={12} style={{ marginRight: 4 }} />{error}
        </span>
      )}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.2rem" }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#368f3b,#218428)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={15} color="#fff" />
      </div>
      <div>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0a8d1c", margin: 0 }}>{title}</h3>
        {subtitle && <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function ApplyFranchise() {
  const navigate = useNavigate();
  const [alert, setAlert] = useState({ open: false, type: "", message: "", onConfirm: null });
  const showAlert = (type, message, onConfirm = null) => setAlert({ open: true, type, message, onConfirm });
  const closeAlert = () => setAlert(p => ({ ...p, open: false, onConfirm: null }));

  // Modals
  const [showTerms, setShowTerms] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [showIdScanner, setShowIdScanner] = useState(false);
  const [loading, setLoading] = useState(null);

  // Form state
  const [concept, setConcept] = useState("");
  const [civilStatus, setCivilStatus] = useState("");
  const [nationality, setNationality] = useState("");
  const [idVerified, setIdVerified] = useState(false);
  const [idData, setIdData] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [letterOfIntent, setLetterOfIntent] = useState(null);
  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState(0);
  const loiRef = useRef();

  const [generatedOtp, setGeneratedOtp] = useState("");

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

  const today = new Date().toISOString().split("T")[0];
  const maxDob = (() => {
    const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d.toISOString().split("T")[0];
  })();

  const [form, setForm] = useState({
    date: today, paymentMode: "", lastName: "", firstName: "",
    middleInitial: "", suffix: "", dob: "", dependents: "",
    gender: "", mobile: "", altMobile: "", email: "", spouseName: "",
    spouseOccupation: "", employmentType: "", yearsEmployer: "",
    income: "", employerName: "", businessAddress: "", position: "",
    businessNature: "", dateSigned: today, nationalityOther: "",
  });

  const textCap = ["lastName","firstName","spouseName","spouseOccupation","employerName","position","businessNature","nationalityOther"];

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "mobile" || name === "altMobile") value = value.replace(/\D/g, "").slice(0, 11);
    if (name === "middleInitial") value = value.replace(/[^a-zA-Z]/g, "").slice(0, 1).toUpperCase();
    if (textCap.includes(name)) value = capitalize(value);
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  };

  const validateField = (name, value) => {
    const optional = ["spouseName","spouseOccupation","middleInitial","suffix","date","dateSigned","nationalityOther","altMobile"];
    if (optional.includes(name)) {
      if (name === "middleInitial" && value && !/^[A-Za-z]$/.test(value)) return "1 letter only";
      if (name === "altMobile" && value && !/^09\d{9}$/.test(value)) return "Please enter Philippine number (09**********)";
      return "";
    }
    if (!value) return "This field is required";
    if (name === "email" && !/\S+@\S+\.\S+/.test(value)) return "Invalid email address";
    if (name === "mobile" && !/^09\d{9}$/.test(value)) return "Please enter Philippine number (09**********)";
    if (name === "dob" && new Date(value) > new Date(maxDob)) return "Must be at least 18 years old";
    if (name === "dependents" && (isNaN(value) || Number(value) < 0)) return "Enter a valid number";
    if (name === "yearsEmployer" && (isNaN(value) || Number(value) < 0)) return "Enter valid years";
    if (name === "income" && (isNaN(value) || Number(value) < 0)) return "Enter valid income";
    return "";
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors(p => ({ ...p, [name]: validateField(name, value) }));
  };

  const validate = () => {
    const e = {};
    Object.keys(form).filter(k => k !== "nationalityOther").forEach(k => {
      const err = validateField(k, form[k]);
      if (err) e[k] = err;
    });
    if (!concept) e.concept = "Please select a franchise concept";
    if (!civilStatus) e.civilStatus = "Please select civil status";
    if (!nationality) e.nationality = "Please select nationality";
    if (nationality === "Others" && !form.nationalityOther) e.nationalityOther = "Please specify your nationality";
    if (civilStatus === "Single") { delete e.spouseName; delete e.spouseOccupation; }
    if (!addrRegion)   e.addrRegion   = "Please select a region";
    if (provinces.length > 0 && !addrProvince) e.addrProvince = "Please select a province";
    if (!addrCity)     e.addrCity     = "Please select a city/municipality";
    if (!addrBarangay) e.addrBarangay = "Please select a barangay";
    if (!addrStreet)   e.addrStreet   = "Please enter a street address";
    if (!idVerified) e.idVerified = "Please complete ID verification";
    if (!letterOfIntent) e.letterOfIntent = "Please upload your Letter of Intent";
    if (!termsAccepted) e.terms = "You must accept the Terms and Conditions";
    if (!consentAccepted) e.consent = "You must give your data privacy consent";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

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
    return data.exists; // true if duplicate found
  } catch (err) {
     console.error("Duplicate check error:", err);
    return false; // if check fails, allow submission
  }
};

  const handleSubmitClick = async (e) => {
    e.preventDefault();
    setLoading("load"); 

    if (!validate()) {
      setLoading(null);
      showAlert("error", "Please fill in all required fields and complete all verification steps before submitting.");
      return;
    }

    const isDuplicate = await checkDuplicate(form.email, form.mobile);
    if (isDuplicate) {
      setLoading(null);
      auditLog.record("DUPLICATE_DETECTED", { email: form.email, mobile: form.mobile });
      showAlert("error", "An application with this email or mobile number already exists. Each person may only submit one application.");
      return;
    }

    auditLog.record("FORM_VALIDATED", { email: form.email, concept });
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

const handleIdComplete = ({ ocrResult, idType, idValid, frontImg, backImg }) => {
  if (!idValid) {
    showAlert("error", ocrResult?.reason || "ID validation failed. Please use a valid government-issued ID.");
    return;
  }

  setIdVerified(true);
  setIdData({ ocrResult, idType, idValid, frontImg }); // ← add frontImg here

  auditLog.record("ID_AUTOFILL", { idType });

  setForm(p => ({
    ...p,
    lastName:      ocrResult.lastName   ? capitalize(ocrResult.lastName)  : p.lastName,
    firstName:     ocrResult.firstName  ? capitalize(ocrResult.firstName) : p.firstName,
    middleInitial: ocrResult.middleName ? ocrResult.middleName.charAt(0).toUpperCase() : p.middleInitial,
    dob:           ocrResult.dob        || p.dob,
  }));

  if (ocrResult.address) setAddrStreet(ocrResult.address);

  showAlert("success", "ID verified! Fields have been auto-filled. Please review and complete the remaining fields.");
};


  const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

  const handleOtpVerified = async (success) => {
    setShowOtp(false);
    if (!success) { showAlert("error", "OTP verification failed. Please try again."); return; }
    auditLog.record("APPLICATION_SUBMIT_ATTEMPT", { email: form.email, concept });
    console.log("idData:", JSON.stringify(idData, null, 2));

    const fullAddress = [
      addrStreet,
      getBarangayName(),
      getCityName(),
      getProvinceName(),
      getRegionName(),
    ].filter(Boolean).join(", ");
    const resolvedNationality = nationality === "Others" ? form.nationalityOther : nationality;
    const fullName = [form.firstName, form.middleInitial ? form.middleInitial + "." : "", form.lastName, form.suffix].filter(Boolean).join(" ");

    let letterOfIntentBase64 = null;
    if (letterOfIntent) {
      letterOfIntentBase64 = await fileToBase64(letterOfIntent);
    }

    const payload = {
      name:             fullName,
      email:            form.email,
      phone:            form.mobile,
      altPhone:         form.altMobile || null,
      franchise:        concept,
      paymentMode:      form.paymentMode,
      dob:              form.dob,
      civilStatus,
      dependents:       form.dependents,
      gender:           form.gender,
      nationality:      resolvedNationality,
      address:          fullAddress,
      spouseName:       form.spouseName       || null,
      spouseOccupation: form.spouseOccupation || null,
      employmentType:   form.employmentType,
      yearsEmployer:    form.yearsEmployer,
      income:           form.income,
      employerName:     form.employerName,
      businessAddress:  form.businessAddress,
      position:         form.position,
      businessNature:   form.businessNature,
      dateSigned:       form.dateSigned,
      // ID verification fields
      idType:  idData?.idType   || null,
      idImage: idData?.frontImg || null, 
      // Letter of intent
      letterOfIntent:   letterOfIntentBase64,
      auditTrail:       auditLog.getAll(),
    };

     console.log("Payload being sent:", {
    ...payload,
    idImage: payload.idImage ? "base64_present" : null,
    letterOfIntent: payload.letterOfIntent ? "base64_present" : null,
  });

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { showAlert("error", `Server error: ${res.status}`); return; }
      const data = await res.json();
      if (data.success) {
        auditLog.record("APPLICATION_SUBMITTED", { success: true, applicationId: data.id });
        showAlert("success", "Application submitted successfully! We will review your application and contact you soon.", () => { closeAlert(); navigate("/"); });
      } else {
        showAlert("error", data.error || "Failed to submit. Please try again.");
      }
    } catch {
      showAlert("error", "Failed to submit. Please check your connection and try again.");
    }
  };

    // Fetch regions on mount
  useEffect(() => {
    const fetchRegions = async () => {
      setLoadingRegions(true);
      try {
        const res  = await fetch(`${PSGC}/regions/`);
        const data = await res.json();
        setRegions(data.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        console.error("Failed to fetch regions:", err);
      } finally {
        setLoadingRegions(false);
      }
    };
    fetchRegions();
  }, []);

  // Fetch provinces when region changes
  useEffect(() => {
    if (!addrRegion) { setProvinces([]); setCities([]); setBarangays([]); return; }
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      setAddrProvince(""); setAddrCity(""); setAddrBarangay("");
      setCities([]); setBarangays([]);
      try {
        const res  = await fetch(`${PSGC}/regions/${addrRegion}/provinces/`);
        const data = await res.json();
        // Some regions (like NCR) have no provinces — fetch cities directly
        if (!Array.isArray(data) || data.length === 0) {
          const citRes  = await fetch(`${PSGC}/regions/${addrRegion}/cities-municipalities/`);
          const citData = await citRes.json();
          setCities(Array.isArray(citData) ? citData.sort((a, b) => a.name.localeCompare(b.name)) : []);
          setProvinces([]);
        } else {
          setProvinces(data.sort((a, b) => a.name.localeCompare(b.name)));
        }
      } catch (err) {
        console.error("Failed to fetch provinces:", err);
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, [addrRegion]);

  // Fetch cities when province changes
  useEffect(() => {
    if (!addrProvince) { setCities([]); setBarangays([]); return; }
    const fetchCities = async () => {
      setLoadingCities(true);
      setAddrCity(""); setAddrBarangay("");
      setBarangays([]);
      try {
        const res  = await fetch(`${PSGC}/provinces/${addrProvince}/cities-municipalities/`);
        const data = await res.json();
        setCities(Array.isArray(data) ? data.sort((a, b) => a.name.localeCompare(b.name)) : []);
      } catch (err) {
        console.error("Failed to fetch cities:", err);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, [addrProvince]);

  // Fetch barangays when city changes
  useEffect(() => {
    if (!addrCity) { setBarangays([]); return; }
    const fetchBarangays = async () => {
      setLoadingBarangays(true);
      setAddrBarangay("");
      try {
        const res  = await fetch(`${PSGC}/cities-municipalities/${addrCity}/barangays/`);
        const data = await res.json();
        setBarangays(Array.isArray(data) ? data.sort((a, b) => a.name.localeCompare(b.name)) : []);
      } catch (err) {
        console.error("Failed to fetch barangays:", err);
      } finally {
        setLoadingBarangays(false);
      }
    };
    fetchBarangays();
  }, [addrCity]);

  // Helper to get name from code
  const getRegionName   = () => regions.find(r => r.code === addrRegion)?.name   || "";
  const getProvinceName = () => provinces.find(p => p.code === addrProvince)?.name || "";
  const getCityName     = () => cities.find(c => c.code === addrCity)?.name       || "";
  const getBarangayName = () => barangays.find(b => b.code === addrBarangay)?.name || addrBarangay || "";

  useEffect(() => {
    const fields = ["paymentMode","lastName","firstName","dob","gender","dependents","mobile","email","employmentType","yearsEmployer","income","employerName","businessAddress","position","businessNature"];
    let total = fields.length + 7;
    let filled = fields.filter(f => form[f]).length;
    if (concept) filled++;
    if (civilStatus) filled++;
    if (nationality) filled++;
    if (addrRegion && addrCity && addrStreet) filled++;
    if (idVerified) filled++;
    if (letterOfIntent) filled++;
    if (termsAccepted && consentAccepted) filled++;
    if (civilStatus === "Married" || civilStatus === "Widowed") { total += 2; if (form.spouseName) filled++; if (form.spouseOccupation) filled++; }
    setProgress(Math.round((filled / total) * 100));
  }, [form, concept, civilStatus, nationality, addrRegion, addrCity, addrStreet, idVerified, letterOfIntent, termsAccepted, consentAccepted]);

  const steps = [{ label: "Basic", pct: 20 }, { label: "Personal", pct: 50 }, { label: "Employment", pct: 80 }, { label: "Done", pct: 100 }];

  const inp = (name, placeholder, type = "text", extra = {}) => (
    <input
      style={{ ...inpStyle, border: errors[name] ? "1.5px solid #d32f2f" : "1.5px solid #c8e6c9" }}
      name={name} type={type} placeholder={placeholder}
      value={form[name]} onChange={handleChange} onBlur={handleBlur}
      {...extra}
    />
  );

  return (
    <div className="af-page">

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
                borderTop: "5px solid #2E7D32",
                borderRadius: "50%",
                animation: "spin 0.9s linear infinite",
              }} />
              <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "#2E7D32" }}>
                Loading...
              </p>
            </div>
          </div>
        </>
      )}

      <AlertModal {...alert} onClose={closeAlert} onConfirm={alert.onConfirm ? () => alert.onConfirm() : null} />
      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />
      <OtpModal open={showOtp} mobile={form.mobile} onVerify={handleOtpVerified} onClose={() => setShowOtp(false)} expectedOtp={generatedOtp} onResend={(newOtp) => setGeneratedOtp(newOtp)} />
      <IdScannerModal open={showIdScanner} onComplete={handleIdComplete} onClose={() => setShowIdScanner(false)} />

      {/* ── Nav ── */}
      <div className="af-nav">
        <div className="af-nav-inner">
          <Link 
            to="/" 
            className="af-back-link"
            onClick={() => window.scrollTo(0, 0)}
          >
            <ChevronLeft size={20} strokeWidth={2.5} /><span>Back to Home</span>
          </Link>
          <div className="af-progress">
            <div className="af-steps">
              {steps.map(st => (
                <span key={st.label} className={`af-step ${progress >= st.pct ? "active" : ""}`}>{st.label}</span>
              ))}
            </div>
            <div className="af-bar-bg"><div className="af-bar-fill" style={{ width: `${progress}%` }} /></div>
            <div className="af-progress-text">{progress}%</div>
          </div>
        </div>
      </div>

      <div className="af-content">
        <img src={logo} alt="iFranchise" className="af-logo" />

        <div className="af-card">
          <h2 className="af-title">Franchise Application</h2>
          <p className="af-sub">Complete the form below to begin your entrepreneurial journey</p>

          <form onSubmit={handleSubmitClick} style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>

            {/* ── Basic Info ── */}
            <div className="af-section">
              <SectionHeader icon={FileText} title="Basic Information" />
              <div className="af-row">
                <Field label="Application Date" half>
                  <input style={disabledStyle} value={form.date} disabled />
                </Field>
                <Field label="Payment Mode" required error={errors.paymentMode} half>
                  <CustomSelect value={form.paymentMode} placeholder="Select payment mode" options={PAYMENT_MODES}
                    error={errors.paymentMode}
                    onSelect={v => { setForm(p => ({ ...p, paymentMode: v })); setErrors(p => ({ ...p, paymentMode: "" })); }} />
                </Field>
              </div>
              <Field label="Chosen Franchise Concept" required error={errors.concept}>
                <CustomSelect value={concept} placeholder="Select a franchise concept" options={CONCEPTS}
                  error={errors.concept}
                  onSelect={v => { setConcept(v); setErrors(p => ({ ...p, concept: "" })); if (v === "iPharma Mart") navigate("/apply-pharma"); }} />
              </Field>
            </div>

            {/* ── ID Verification ── */}
            <div className="af-section">
              <SectionHeader icon={Shield} title="ID Verification" />

              {!idVerified ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                    <IdCard size={28} color="#2E7D32" />
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
                    <p style={{ margin: 0, fontSize: 11, color: "#388e3c" }}>Please fill in your personal details</p>
                  </div>
                  <button type="button" onClick={() => { setIdVerified(false); setIdData(null); }} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: 11 }}>Rescan</button>
                </div>
              )}
            </div>

            {/* ── Applicant Info ── */}
            <div className="af-section">
              <SectionHeader icon={User} title="Applicant Information" subtitle="Auto-filled from ID scan — verify and complete manually" />
              <div className="af-row">
                <Field label="Last Name" required error={errors.lastName} style={{ flex: "2 1 150px" }}>{inp("lastName", "Dela Cruz")}</Field>
                <Field label="First Name" required error={errors.firstName} style={{ flex: "2 1 150px" }}>{inp("firstName", "Juan")}</Field>
                <Field label="M.I." error={errors.middleInitial} style={{ flex: "0 0 72px" }}>{inp("middleInitial", "M", "text", { maxLength: 1 })}</Field>
                <Field label="Suffix" style={{ flex: "0 0 100px" }}>
                  <CustomSelect value={form.suffix} placeholder="—" options={SUFFIXES} onSelect={v => setForm(p => ({ ...p, suffix: v }))} />
                </Field>
              </div>
              <div className="af-row">
                <Field label="Date of Birth" required error={errors.dob} half>
                  <input style={{ ...inpStyle, border: errors.dob ? "1.5px solid #d32f2f" : "1.5px solid #c8e6c9" }}
                    name="dob" type="date" min="1930-01-01" max={maxDob}
                    value={form.dob} onChange={handleChange} onBlur={handleBlur} />
                </Field>
                <Field label="Civil Status" required error={errors.civilStatus} half>
                  <CustomSelect value={civilStatus} placeholder="Select civil status" options={CIVIL}
                    error={errors.civilStatus}
                    onSelect={v => { setCivilStatus(v); setErrors(p => ({ ...p, civilStatus: "" })); }} />
                </Field>
              </div>
              <div className="af-row">
                <Field label="Gender" required error={errors.gender} half>
                  <select style={{ ...inpStyle, border: errors.gender ? "1.5px solid #d32f2f" : "1.5px solid #c8e6c9" }}
                    name="gender" value={form.gender} onChange={handleChange} onBlur={handleBlur}>
                    <option value="">Select Gender</option>
                    <option>Male</option><option>Female</option><option>Prefer not to say</option>
                  </select>
                </Field>
                <Field label="Nationality" required error={errors.nationality} half>
                  <CustomSelect value={nationality} placeholder="Select nationality" options={NATIONALITIES}
                    error={errors.nationality}
                    onSelect={v => { setNationality(v); setErrors(p => ({ ...p, nationality: "", nationalityOther: "" })); if (v !== "Others") setForm(p => ({ ...p, nationalityOther: "" })); }} />
                </Field>
              </div>
              {nationality === "Others" && (
                <Field label="Please specify nationality" required error={errors.nationalityOther}>
                  <input style={{ ...inpStyle, border: errors.nationalityOther ? "1.5px solid #d32f2f" : "1.5px solid #c8e6c9" }}
                    name="nationalityOther" placeholder="e.g. American, Chinese, Japanese…"
                    value={form.nationalityOther} onChange={handleChange} onBlur={handleBlur} />
                </Field>
              )}
              <div className="af-row">
                <Field label="Number of Dependents" required error={errors.dependents} half>
                  {inp("dependents", "0", "number", { min: 0 })}
                </Field>
                <Field label="Mobile Number" required error={errors.mobile} half>{inp("mobile", "09123456789")}</Field>
              </div>
              <Field label="Alternate Mobile Number" error={errors.altMobile} half>
                {inp("altMobile", "09123456789 (optional)")}
              </Field>
              <Field label="Email Address" required error={errors.email}>{inp("email", "juandelacruz@email.com", "email")}</Field>
            </div>

            {/* ── Philippine Address ── */}
            <div className="af-section">
              <SectionHeader icon={MapPin} title="Present Address" subtitle="Powered by PSGC — Official Philippine address data" />

              {/* Region */}
              <Field label="Region" required error={errors.addrRegion}>
                <select
                  style={{ ...inpStyle, border: errors.addrRegion ? "1.5px solid #d32f2f" : "1.5px solid #c8e6c9" }}
                  value={addrRegion}
                  onChange={e => { setAddrRegion(e.target.value); setErrors(p => ({ ...p, addrRegion: "" })); }}
                  disabled={loadingRegions}
                >
                  <option value="">{loadingRegions ? "Loading regions..." : "Select Region"}</option>
                  {regions.map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
                </select>
              </Field>

              {/* Province — hidden for regions with no provinces (e.g. NCR) */}
              {provinces.length > 0 && (
                <Field label="Province" required error={errors.addrProvince}>
                  <select
                    style={{ ...inpStyle, border: errors.addrProvince ? "1.5px solid #d32f2f" : "1.5px solid #c8e6c9" }}
                    value={addrProvince}
                    onChange={e => { setAddrProvince(e.target.value); setErrors(p => ({ ...p, addrProvince: "" })); }}
                    disabled={loadingProvinces || !addrRegion}
                  >
                    <option value="">{loadingProvinces ? "Loading provinces..." : "Select Province"}</option>
                    {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                  </select>
                </Field>
              )}

              {/* City / Municipality */}
              <div className="af-row">
                <Field label="City / Municipality" required error={errors.addrCity} half>
                  <select
                    style={{ ...inpStyle, border: errors.addrCity ? "1.5px solid #d32f2f" : "1.5px solid #c8e6c9" }}
                    value={addrCity}
                    onChange={e => { setAddrCity(e.target.value); setErrors(p => ({ ...p, addrCity: "" })); }}
                    disabled={loadingCities || (!addrRegion)}
                  >
                    <option value="">
                      {loadingCities ? "Loading cities..." : !addrRegion ? "Select region first" : "Select City/Municipality"}
                    </option>
                    {cities.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </Field>

                {/* Barangay */}
                <Field label="Barangay" required error={errors.addrBarangay} half>
                  <select
                    style={{ ...inpStyle, border: errors.addrBarangay ? "1.5px solid #d32f2f" : "1.5px solid #c8e6c9" }}
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

              {/* Street */}
              <Field label="House No. / Street / Subdivision" required error={errors.addrStreet}>
                <input
                  style={{ ...inpStyle, border: errors.addrStreet ? "1.5px solid #d32f2f" : "1.5px solid #c8e6c9" }}
                  placeholder="House No., Street, Subdivision"
                  value={addrStreet}
                  onChange={e => { setAddrStreet(e.target.value); setErrors(p => ({ ...p, addrStreet: "" })); }}
                />
              </Field>

              {/* Address preview */}
              {addrRegion && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 12px", background: "#f0fdf4", borderRadius: 8, fontSize: 12, color: "#2E7D32" }}>
                  <MapPin size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>
                    {[addrStreet, getBarangayName(), getCityName(), getProvinceName(), getRegionName()]
                      .filter(Boolean).join(", ") || "Address preview will appear here"}
                  </span>
                </div>
              )}
            </div>

            {/* ── Spouse ── */}
            {(civilStatus === "Married" || civilStatus === "Widowed") && (
              <div className="af-section">
                <SectionHeader icon={User} title="Spouse Information" />
                <Field label="Spouse Full Name" error={errors.spouseName}>{inp("spouseName", "Spouse's Full Name")}</Field>
                <Field label="Spouse Occupation" error={errors.spouseOccupation}>{inp("spouseOccupation", "Spouse's Current Occupation")}</Field>
              </div>
            )}

            {/* ── Employment ── */}
            <div className="af-section">
              <SectionHeader icon={Briefcase} title="Employment Information" />
              <Field label="Employment Type" required error={errors.employmentType}>
                <CustomSelect value={form.employmentType} placeholder="Select employment type" options={EMPLOYMENT_TYPES}
                  error={errors.employmentType}
                  onSelect={v => { setForm(p => ({ ...p, employmentType: v })); setErrors(p => ({ ...p, employmentType: "" })); }} />
              </Field>
              <div className="af-row">
                <Field label="Years with Employer" required error={errors.yearsEmployer} half>{inp("yearsEmployer", "5", "number")}</Field>
                <Field label="Monthly Income (₱)" required error={errors.income} half>{inp("income", "50000", "number")}</Field>
              </div>
              <Field label="Business/Company Name (No Acronyms)" required error={errors.employerName}>
                {inp("employerName", "e.g. iFranchise Business and Services Corporation")}
              </Field>
              <Field label="Business Address" required error={errors.businessAddress}>
                {inp("businessAddress", "Complete Business Address")}
              </Field>
              <div className="af-row">
                <Field label="Position / Job Title" required error={errors.position} half>{inp("position", "e.g. Manager")}</Field>
                <Field label="Nature of Business" required error={errors.businessNature} half>{inp("businessNature", "e.g. Retail, Manufacturing")}</Field>
              </div>
            </div>

            {/* ── Letter of Intent + ID Attachment ── */}
            <div className="af-section">
              <SectionHeader icon={FileText} title="Required Documents" />

              <Field label="Letter of Intent (PDF)" required error={errors.letterOfIntent}>
                <input ref={loiRef} type="file" accept="application/pdf" style={{ display: "none" }}
                  onChange={e => {
                    const f = e.target.files[0];
                    if (!f) return;
                    auditLog.record("LOI_UPLOADED", { fileName: f.name, size: f.size });
                    setLetterOfIntent(f);
                    setErrors(p => ({ ...p, letterOfIntent: "" }));
                  }} />
                <div
                  onClick={() => loiRef.current.click()}
                  style={{
                    border: errors.letterOfIntent ? "2px dashed #d32f2f" : "2px dashed #c8e6c9",
                    borderRadius: 12, padding: "20px 16px", textAlign: "center",
                    cursor: "pointer", background: "#fafafa", transition: "all .2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fafafa"}
                >
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
                <div style={{ padding: "12px 14px", background: "#f0fdf4", borderRadius: 10, border: "1.5px solid #a5d6a7", display: "flex", alignItems: "center", gap: 10 }}>
                  <CheckCircle2 size={16} color="#2E7D32" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#1b5e20" }}>Valid ID attached — {idData?.idType} (from OCR scan)</span>
                </div>
              )}
            </div>

            {/* ── Terms & Consent ── */}
            <div className="af-section">
              <SectionHeader icon={Shield} title="Terms & Consent" />

              <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
                <input type="checkbox" checked={termsAccepted}
                  onChange={e => { setTermsAccepted(e.target.checked); setErrors(p => ({ ...p, terms: "" })); }}
                  style={{ marginTop: 2, accentColor: "#2E7D32", width: 16, height: 16, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
                  I have read and agree to the{" "}
                  <button type="button" onClick={() => setShowTerms(true)} style={{ background: "none", border: "none", color: "#2E7D32", fontWeight: 700, cursor: "pointer", padding: 0, fontSize: 13, textDecoration: "underline", fontFamily: "inherit" }}>
                    Terms and Conditions
                  </button>{" "}
                  of iFranchise Business and Services Corporation. <span style={{ color: "#EF4444" }}>*</span>
                </span>
              </label>
              {errors.terms && <p style={{ color: "#d32f2f", fontSize: 12, margin: "-4px 0 0", fontWeight: 600 }}>{errors.terms}</p>}

              <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
                <input type="checkbox" checked={consentAccepted}
                  onChange={e => { setConsentAccepted(e.target.checked); setErrors(p => ({ ...p, consent: "" })); }}
                  style={{ marginTop: 2, accentColor: "#2E7D32", width: 16, height: 16, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
                  I consent to the collection, processing, and use of my personal data in accordance with the <strong>Data Privacy Act of 2012 (RA 10173) stated on no. 1 in Terms and Conditions </strong> for the purpose of evaluating my franchise application. <span style={{ color: "#EF4444" }}>*</span>
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

            <button type="submit" className="af-submit-btn">
              Submit Application
              <ArrowRight size={18} style={{ marginLeft: 8 }} />
            </button>
            <p className="af-footer-note">By submitting, you agree to our terms & consent.</p>
          </form>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Poppins:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .af-page {
          min-height: 100vh;
          font-family: 'Montserrat', sans-serif;
          background-image: linear-gradient(rgba(255,255,255,0.78), rgba(211,255,201,0.78)), url(${welcome});
          background-size: cover;
          background-attachment: fixed;
          padding-top: 90px;
          padding-bottom: 60px;
        }

        .af-nav {
          position: fixed; top: 0; left: 0; width: 100%;
          z-index: 100; padding: 14px 24px;
          background: #ffffff; box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }
        .af-nav-inner {
          display: flex; align-items: center; gap: 20px; padding: 0 24px;
        }
        .af-back-link {
          display: flex; align-items: center; gap: 6px; color: #1b5e20;
          font-weight: 600; font-size: 0.9rem; text-decoration: none;
          white-space: nowrap; transition: opacity 0.2s;
        }
        .af-back-link:hover { opacity: 0.7; }
        .af-progress { flex: 1; display: flex; flex-direction: column; }
        .af-steps { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .af-step { font-size: 0.7rem; font-weight: 600; color: #9ca3af; transition: color 0.3s; }
        .af-step.active { color: #2e7d32; }
        .af-bar-bg { width: 100%; height: 8px; background: #e5e7eb; border-radius: 999px; overflow: hidden; }
        .af-bar-fill { height: 100%; border-radius: 999px; background: linear-gradient(135deg,#368f3b,#218428); transition: width 0.4s ease; }
        .af-progress-text { margin-top: 4px; text-align: right; font-size: 0.75rem; font-weight: 600; color: #2e7d32; }

        .af-content { max-width: 860px; margin: 0 auto; padding: 0 1.5rem; display: flex; flex-direction: column; align-items: center; }
        .af-logo { height: 66px; object-fit: contain; margin-top: 12px; margin-bottom: 18px; }

        .af-card {
          background: rgba(255,255,255,0.96); width: 100%;
          border-radius: 20px; padding: 36px 30px 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,.10);
        }
        .af-title { font-size: 23px; color: #2E7D32; font-weight: 700; margin: 0 0 4px; text-align: center; }
        .af-sub { color: #555; font-size: 13px; margin-bottom: 22px; text-align: center; }

        .af-section {
          background: #f9fdf9; border-radius: 14px; border: 1.5px solid #c8e6c9;
          padding: 1.3rem 1.3rem 1.1rem; display: flex; flex-direction: column; gap: 0.9rem;
        }
        .af-row { display: flex; flex-wrap: wrap; gap: 0.9rem; }

        .af-card input[type="text"], .af-card input[type="email"], .af-card input[type="number"],
        .af-card input[type="date"], .af-card input[type="password"], .af-card textarea, .af-card select {
          width: 100%; padding: 13px 14px; border-radius: 12px; border: 1.5px solid #c8e6c9;
          outline: none; font-size: 14px; font-family: 'Montserrat', sans-serif;
          color: #1a1a1a; background: #fafafa; transition: border-color 0.2s, background 0.2s; box-sizing: border-box;
        }
        .af-card input:focus, .af-card textarea:focus, .af-card select:focus {
          border-color: #2E7D32 !important; background: #fff !important;
        }
        .af-card input:disabled {
          background: #f5f5f5; color: #888; cursor: not-allowed; border-color: #e5e7eb !important;
        }

        .af-submit-btn {
          display: flex; align-items: center; justify-content: center;
          width: 100%; padding: 14px; border-radius: 12px; border: none;
          background: linear-gradient(90deg,#49a94e,#218428); color: #fff;
          font-weight: bold; cursor: pointer; font-size: 14px; letter-spacing: 0.5px;
          transition: background 0.2s; font-family: 'Montserrat', sans-serif;
          box-shadow: 0 4px 14px rgba(33,132,40,0.25);
        }
        .af-submit-btn:hover { background: linear-gradient(90deg,#246627,#2a7e30); }
        .af-footer-note { text-align: center; font-size: 0.82rem; color: #9CA3AF; margin-top: -0.8rem; }
      `}</style>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const inpStyle = {
  width: "100%", padding: "13px 14px", borderRadius: 12, outline: "none",
  fontSize: 14, fontFamily: "'Montserrat',sans-serif", color: "#1a1a1a",
  background: "#fafafa", transition: "border-color 0.2s", boxSizing: "border-box",
};

const disabledStyle = {
  ...inpStyle, background: "#f5f5f5", color: "#888",
  cursor: "not-allowed", border: "1.5px solid #e5e7eb",
};

const S = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" },
  modalBox: { background: "#fff", borderRadius: 20, padding: "2.5rem 2rem 2rem", width: 380, maxWidth: "92vw", textAlign: "center", position: "relative", boxShadow: "0 24px 80px rgba(0,0,0,0.18)" },
  iconWrap: { width: 72, height: 72, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.2rem" },
  modalMsg: { fontSize: "1rem", color: "#374151", lineHeight: 1.6, marginBottom: "1.5rem" },
  btnRow: { display: "flex", gap: 10, justifyContent: "center" },
  btn: { padding: "0.65rem 2rem", borderRadius: 10, fontSize: "0.95rem", fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "'Montserrat',sans-serif" },
  btnSolid: { background: "linear-gradient(90deg,#368f3b,#218428)", color: "#fff" },
  btnOutline: { background: "transparent", color: "#2E7D32", border: "2px solid #2E7D32" },
  closeBtn: { position: "absolute", top: 14, right: 14, background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 4 },
  zoomBtn: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
};