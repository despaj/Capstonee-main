import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Briefcase,
  FileText,
  ArrowRight,
} from "lucide-react";
import logo from "../assets/logo.png";
import welcome from "../assets/welcomepage.png";



// ─── UI Alert Modal ───────────────────────────────────────────────────────────
function AlertModal({ open, type, message, onClose, onConfirm }) {
  if (!open) return null;
  const isSuccess = type === "success";
  const isError = type === "error";
  return (
    <div style={modal.overlay}>
      <div style={modal.box}>
        <div style={{ ...modal.iconWrap, background: isSuccess ? "#e8f5e9" : isError ? "#fdecea" : "#fff8e1" }}>
          {isSuccess ? (
            <CheckCircle2 size={38} color="#2E7D32" strokeWidth={2} />
          ) : (
            <AlertCircle size={38} color={isError ? "#c62828" : "#e65100"} strokeWidth={2} />
          )}
        </div>
        <p style={modal.msg}>{message}</p>
        <div style={modal.btnRow}>
          {onConfirm ? (
            <>
              <button style={{ ...modal.btn, ...modal.btnOutline }} onClick={onClose}>Cancel</button>
              <button style={{ ...modal.btn, ...modal.btnSolid }} onClick={onConfirm}>Confirm</button>
            </>
          ) : (
            <button style={{ ...modal.btn, ...modal.btnSolid }} onClick={onClose}>OK</button>
          )}
        </div>
        <button style={modal.close} onClick={onClose}><X size={18} /></button>
      </div>
    </div>
  );
}

const modal = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" },
  box: { background: "#fff", borderRadius: 20, padding: "2.5rem 2rem 2rem", width: 360, maxWidth: "90vw", textAlign: "center", position: "relative", boxShadow: "0 24px 80px rgba(0,0,0,0.18)" },
  iconWrap: { width: 72, height: 72, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.2rem" },
  msg: { fontSize: "1rem", color: "#374151", lineHeight: 1.6, marginBottom: "1.5rem" },
  btnRow: { display: "flex", gap: 10, justifyContent: "center" },
  btn: { padding: "0.65rem 2rem", borderRadius: 10, fontSize: "0.95rem", fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "inherit" },
  btnSolid: { background: "linear-gradient(90deg,#368f3b,#218428)", color: "#fff" },
  btnOutline: { background: "transparent", color: "#2E7D32", border: "2px solid #2E7D32" },
  close: { position: "absolute", top: 14, right: 14, background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 4 },
};


// ─── Helpers ──────────────────────────────────────────────────────────────────
const capitalize = (v) => v.replace(/(^|\s)\S/g, (c) => c.toUpperCase());

const CONCEPTS = [
  "Coffee Spot Outdoor Kiosk",
  "Coffee Spot Full Store",
  "iPharma Mart",
  "Food Caravan",
  "Dodram Luncheon Meat",
  "Coffee Spot Products",
  "Kwezen",
];
const CIVIL = ["Single", "Married", "Widowed", "Separated"];
const SUFFIXES = ["", "Jr.", "Sr.", "II", "III", "IV", "V", "MD", "PhD", "Esq."];
const PAYMENT_MODES = ["Cash", "Bank Transfer", "Check"];
const EMPLOYMENT_TYPES = [
  "Full-time Employee", "Part-time Employee", "Self-Employed",
  "Business Owner", "Freelancer", "Retired", "Unemployed",
];
const NATIONALITIES = ["Filipino", "Others"];

// ─── CustomSelect ─────────────────────────────────────────────────────────────
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
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        style={{
          width: "100%", padding: "13px 14px",
          borderRadius: 12, border: error ? "1.5px solid #d32f2f" : "1.5px solid #c8e6c9",
          fontSize: 14, fontFamily: "'Montserrat', sans-serif",
          color: value ? "#1a1a1a" : "#9CA3AF",
          background: "#fafafa",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: disabled ? "not-allowed" : "pointer",
          outline: "none", transition: "border-color .2s",
          boxSizing: "border-box",
        }}
      >
        <span>{value || placeholder}</span>
        <ChevronDown size={16} color="#6B7280" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#fff", border: "1.5px solid #c8e6c9",
          borderRadius: 12, zIndex: 200,
          maxHeight: 220, overflowY: "auto",
          boxShadow: "0 8px 32px rgba(33,132,40,0.12)",
        }}>
          {options.map((o) => (
            <div
              key={o || "none"}
              style={{
                padding: "11px 14px", cursor: "pointer", fontSize: 14,
                borderBottom: "1px solid #f3f4f6",
                fontWeight: o === value ? 700 : 400,
                color: o === value ? "#2E7D32" : "#1a1a1a",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              onClick={() => { onSelect(o); setOpen(false); }}
            >
              {o || <span style={{ color: "#9CA3AF" }}>{placeholder}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
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

// ─── SectionHeader ────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.2rem" }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8,
        background: "linear-gradient(135deg,#368f3b,#218428)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={15} color="#fff" />
      </div>
      <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0a8d1c", margin: 0 }}>{title}</h3>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ApplyFranchise() {
  const navigate = useNavigate();
  const [alert, setAlert] = useState({ open: false, type: "", message: "", onConfirm: null });
  const showAlert = (type, message, onConfirm = null) => setAlert({ open: true, type, message, onConfirm });
  const closeAlert = () => setAlert((p) => ({ ...p, open: false, onConfirm: null }));

  const [concept, setConcept] = useState("");
  const [civilStatus, setCivilStatus] = useState("");
  const [nationality, setNationality] = useState("");
  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState(0);

  const today = new Date().toISOString().split("T")[0];
  const maxDob = (() => {
    const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d.toISOString().split("T")[0];
  })();

  const [form, setForm] = useState({
    date: today, paymentMode: "", lastName: "", firstName: "",
    middleInitial: "", suffix: "", dob: "", dependents: "",
    gender: "", mobile: "", address: "",
    email: "", spouseName: "", spouseOccupation: "",
    employmentType: "", yearsEmployer: "", income: "",
    employerName: "", businessAddress: "", position: "",
    businessNature: "", dateSigned: today, nationalityOther: "",
  });

  const textCap = ["lastName","firstName","spouseName","address", "spouseOccupation","employerName","position","businessNature","nationalityOther"];
const handleChange = (e) => {
  let { name, value } = e.target;

  // Mobile: numbers only, max 11 digits
  if (name === "mobile") {
    value = value.replace(/\D/g, "").slice(0, 11);
  }

  // Middle Initial: 1 uppercase letter only
  if (name === "middleInitial") {
    value = value.replace(/[^a-zA-Z]/g, "").slice(0, 1).toUpperCase();
  }

  // Capitalize names & similar fields (every word)
  if (textCap.includes(name)) {
    value = capitalize(value);
  }

  // Address: only first letter uppercase (more natural typing)
  if (name === "address") {
    value = value.charAt(0).toUpperCase() + value.slice(1);
  }

  setForm((p) => ({ ...p, [name]: value }));

  if (errors[name]) {
    setErrors((p) => ({ ...p, [name]: "" }));
  }
};
  const validateField = (name, value) => {
    const optional = ["spouseName","spouseOccupation","middleInitial","suffix","date","dateSigned","nationalityOther"];
    if (optional.includes(name)) {
      if (name === "middleInitial" && value && !/^[A-Za-z]$/.test(value)) return "1 letter only";
      return "";
    }
    if (!value) return "This field is required";
    if (name === "email" && !/\S+@\S+\.\S+/.test(value)) return "Invalid email address";
    if (name === "mobile" && !/^09\d{9}$/.test(value)) return "Enter a valid 11-digit mobile (09xxxxxxxxx)";
    if (name === "dob" && new Date(value) > new Date(maxDob)) return "Must be at least 18 years old";
    if (name === "dependents" && (isNaN(value) || Number(value) < 0)) return "Enter a valid number";
    if (name === "yearsEmployer" && (isNaN(value) || Number(value) < 0)) return "Enter valid years";
    if (name === "income" && (isNaN(value) || Number(value) < 0)) return "Enter valid income";
    return "";
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors((p) => ({ ...p, [name]: validateField(name, value) }));
  };

  const validate = () => {
    const e = {};
    Object.keys(form).filter(k => k !== "nationalityOther").forEach((k) => {
      const err = validateField(k, form[k]);
      if (err) e[k] = err;
    });
    if (!concept) e.concept = "Please select a franchise concept";
    if (!civilStatus) e.civilStatus = "Please select civil status";
    if (!nationality) e.nationality = "Please select nationality";
    if (nationality === "Others" && !form.nationalityOther) e.nationalityOther = "Please specify your nationality";
    if (civilStatus === "Single") { delete e.spouseName; delete e.spouseOccupation; }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    const fields = ["paymentMode","lastName","firstName","dob","gender","dependents","mobile","email","address","employmentType","yearsEmployer","income","employerName","businessAddress","position","businessNature"];
    let total = fields.length + 3;
    let filled = fields.filter((f) => form[f]).length;
    if (concept) filled++;
    if (civilStatus) filled++;
    if (nationality) filled++;
    if (civilStatus === "Married" || civilStatus === "Widowed") {
      total += 2;
      if (form.spouseName) filled++;
      if (form.spouseOccupation) filled++;
    }
    setProgress(Math.round((filled / total) * 100));
  }, [form, concept, civilStatus, nationality]);

  const steps = [
    { label: "Basic", pct: 20 },
    { label: "Personal", pct: 50 },
    { label: "Employment", pct: 80 },
    { label: "Done", pct: 100 },
  ];

  const submitForm = async (e) => {
    e.preventDefault();
    if (!validate()) { showAlert("error", "Please fill in all required fields before submitting."); return; }
    const resolvedNationality = nationality === "Others" ? form.nationalityOther : nationality;
    const fullName = [form.firstName, form.middleInitial ? form.middleInitial + "." : "", form.lastName, form.suffix].filter(Boolean).join(" ");
    const payload = { name: fullName, email: form.email, phone: form.mobile, franchise: concept, paymentMode: form.paymentMode, dob: form.dob, civilStatus, dependents: form.dependents, gender: form.gender, nationality: resolvedNationality, address: form.address, spouseName: form.spouseName, spouseOccupation: form.spouseOccupation, employmentType: form.employmentType, yearsEmployer: form.yearsEmployer, income: form.income, employerName: form.employerName, businessAddress: form.businessAddress, position: form.position, businessNature: form.businessNature, dateSigned: form.dateSigned };
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/applications`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { showAlert("error", `Server error: ${res.status}`); return; }
      const data = await res.json();
      if (data.success) {
        showAlert("success", "Application submitted successfully! We will review your application and contact you soon.", () => { closeAlert(); navigate("/"); });
      } else {
        showAlert("error", data.error || "Failed to submit. Please try again.");
      }
    } catch {
      showAlert("error", "Failed to submit. Please check your connection and try again.");
    }
  };

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
      <AlertModal {...alert} onClose={closeAlert} onConfirm={alert.onConfirm ? () => { alert.onConfirm(); } : null} />
{/* ── Sticky Progress Nav ── */}
<div className="af-nav">
  <div className="af-nav-inner">

    {/* Back Button */}
    <Link to="/" className="af-back-link">
      <ChevronLeft size={20} strokeWidth={2.5} />
      <span>Back to Home</span>
    </Link>

    {/* Centered Progress */}
    <div className="af-progress">
      
      <div className="af-steps">
        {steps.map((st) => (
          <span
            key={st.label}
            className={`af-step ${progress >= st.pct ? "active" : ""}`}
          >
            {st.label}
          </span>
        ))}
      </div>

      <div className="af-bar-bg">
        <div
          className="af-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="af-progress-text">
        {progress}%
      </div>

    </div>

  </div>
</div>

      {/* ── Content ── */}
      <div className="af-content">
        <img src={logo} alt="iFranchise" className="af-logo" />

        <div className="af-card">
          <h2 className="af-title">Franchise Application</h2>
          <p className="af-sub">Complete the form below to begin your entrepreneurial journey</p>

          <form onSubmit={submitForm} style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>

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
                    onSelect={(v) => { setForm((p) => ({ ...p, paymentMode: v })); setErrors((p) => ({ ...p, paymentMode: "" })); }} />
                </Field>
              </div>
              <Field label="Chosen Franchise Concept" required error={errors.concept}>
                <CustomSelect value={concept} placeholder="Select a franchise concept" options={CONCEPTS}
                  error={errors.concept}
                  onSelect={(v) => { setConcept(v); setErrors((p) => ({ ...p, concept: "" })); if (v === "iPharma Mart") navigate("/apply-pharma"); }} />
              </Field>
            </div>

            {/* ── Applicant Info ── */}
            <div className="af-section">
              <SectionHeader icon={User} title="Applicant Information" />

              <div className="af-row">
                <Field label="Last Name" required error={errors.lastName} style={{ flex: "2 1 150px" }}>
                  {inp("lastName", "Dela Cruz")}
                </Field>
                <Field label="First Name" required error={errors.firstName} style={{ flex: "2 1 150px" }}>
                  {inp("firstName", "Juan")}
                </Field>
                <Field label="M.I." error={errors.middleInitial} style={{ flex: "0 0 72px" }}>
                  {inp("middleInitial", "M", "text", { maxLength: 1 })}
                </Field>
                <Field label="Suffix" style={{ flex: "0 0 100px" }}>
                  <CustomSelect value={form.suffix} placeholder="—" options={SUFFIXES}
                    onSelect={(v) => setForm((p) => ({ ...p, suffix: v }))} />
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
                    onSelect={(v) => { setCivilStatus(v); setErrors((p) => ({ ...p, civilStatus: "" })); }} />
                </Field>
              </div>

              <div className="af-row">
                <Field label="Gender" required error={errors.gender} half>
                  <select style={{ ...inpStyle, border: errors.gender ? "1.5px solid #d32f2f" : "1.5px solid #c8e6c9" }}
                    name="gender" value={form.gender} onChange={handleChange} onBlur={handleBlur}>
                    <option value="">Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Prefer not to say</option>
                  </select>
                </Field>
                <Field label="Nationality" required error={errors.nationality} half>
                  <CustomSelect value={nationality} placeholder="Select nationality" options={NATIONALITIES}
                    error={errors.nationality}
                    onSelect={(v) => { setNationality(v); setErrors((p) => ({ ...p, nationality: "", nationalityOther: "" })); if (v !== "Others") setForm((p) => ({ ...p, nationalityOther: "" })); }} />
                </Field>
              </div>

              {nationality === "Others" && (
                <Field label="Please specify nationality" required error={errors.nationalityOther}>
                  <input
                    style={{ ...inpStyle, border: errors.nationalityOther ? "1.5px solid #d32f2f" : "1.5px solid #c8e6c9" }}
                    name="nationalityOther" placeholder="e.g. American, Chinese, Japanese..."
                    value={form.nationalityOther} onChange={handleChange} onBlur={handleBlur}
                  />
                </Field>
              )}

              <div className="af-row">
                <Field label="Number of Dependents" required error={errors.dependents} half>
                  {inp("dependents", "0", "number")}
                </Field>
                <Field label="Mobile Number" required error={errors.mobile} half>
                  {inp("mobile", "09123456789")}
                </Field>
              </div>

              <Field label="Email Address" required error={errors.email}>
                {inp("email", "juandelacruz@email.com", "email")}
              </Field>

              <Field label="Present Address" required error={errors.address}>
                <textarea
                  style={{ ...inpStyle, minHeight: 76, resize: "vertical", border: errors.address ? "1.5px solid #d32f2f" : "1.5px solid #c8e6c9" }}
                  name="address" placeholder="House No., Street, Barangay, City, Province"
                  value={form.address} onChange={handleChange} onBlur={handleBlur}
                />
              </Field>
            </div>

            {/* ── Spouse ── */}
            {(civilStatus === "Married" || civilStatus === "Widowed") && (
              <div className="af-section">
                <SectionHeader icon={User} title="Spouse Information" />
                <Field label="Spouse Full Name" error={errors.spouseName}>
                  {inp("spouseName", "Spouse's Full Name")}
                </Field>
                <Field label="Spouse Occupation" error={errors.spouseOccupation}>
                  {inp("spouseOccupation", "Spouse's Current Occupation")}
                </Field>
              </div>
            )}

            {/* ── Employment ── */}
            <div className="af-section">
              <SectionHeader icon={Briefcase} title="Employment Information" />
              <Field label="Employment Type" required error={errors.employmentType}>
                <CustomSelect value={form.employmentType} placeholder="Select employment type" options={EMPLOYMENT_TYPES}
                  error={errors.employmentType}
                  onSelect={(v) => { setForm((p) => ({ ...p, employmentType: v })); setErrors((p) => ({ ...p, employmentType: "" })); }} />
              </Field>
              <div className="af-row">
                <Field label="Years with Employer" required error={errors.yearsEmployer} half>
                  {inp("yearsEmployer", "5", "number")}
                </Field>
                <Field label="Monthly Income (₱)" required error={errors.income} half>
                  {inp("income", "50000", "number")}
                </Field>
              </div>
              <Field label="Business/Company Name (No Acronyms)" required error={errors.employerName}>
                {inp("employerName", "e.g. iFranchise Business and Services Corporation")}
              </Field>
              <Field label="Business Address" required error={errors.businessAddress}>
                {inp("businessAddress", "Complete Business Address")}
              </Field>
              <div className="af-row">
                <Field label="Position / Job Title" required error={errors.position} half>
                  {inp("position", "e.g. Manager")}
                </Field>
                <Field label="Nature of Business" required error={errors.businessNature} half>
                  {inp("businessNature", "e.g. Retail, Manufacturing")}
                </Field>
              </div>
            </div>

            <button type="submit" className="af-submit-btn">
              Submit Application
              <ArrowRight size={18} style={{ marginLeft: 8 }} />
            </button>
            <p className="af-footer-note">By submitting this form, you agree to our terms and conditions.</p>
          </form>
        </div>
      </div>

      <style>
      {`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Poppins:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }

        .af-page {
          min-height: 100vh;
          font-family: 'Montserrat', sans-serif;
          background-image: linear-gradient(rgba(255,255,255,0.78), rgba(211,255,201,0.78)), url(${welcome});
          background-size: cover;
          background-attachment: fixed;
          padding-top: 90px;
          padding-bottom: 60px;
        }
/* Header pinned to pinaka taas */
.af-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 70px;
  z-index: 100;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);

  display: flex;
  align-items: center;
}

/* Container */
.af-nav-inner {
  position: relative;
  width: 100%;
}

/* 🔥 Back button at 20% from left */
.af-back-link {
  position: absolute;
  right: 90%;
  top: 50%;
  transform: translateY(-50%);

  display: flex;
  align-items: center;
  gap: 6px;
  color: #1b5e20;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
}

.af-back-link:hover {
  opacity: 0.7;
}

/* 🔥 PERFECT CENTERING */
.af-progress {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  display: flex;
  flex-direction: column;
}

/* Steps */
.af-steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.af-step {
  font-size: 0.7rem;
  font-weight: 600;
  color: #9ca3af;
}

.af-step.active {
  color: #2e7d32;
}

/* Bar background */
.af-bar-bg {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}

/* Gradient progress */
.af-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(135deg, #0d2b1e, #1a4a2e);
  transition: width 0.4s ease;
}
/* Percent */
.af-progress-text {
  margin-top: 4px;
  text-align: right;
  font-size: 0.75rem;
  font-weight: 600;
  color: #2e7d32;
}
        .af-bar-bg { height: 7px; border-radius: 99px; background: #e5e7eb; overflow: hidden; }
        .af-bar-fill { height: 100%; border-radius: 99px; transition: width 0.5s cubic-bezier(.4,0,.2,1); }

        .af-content {
          max-width: 860px;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .af-logo {
          height: 66px;
          object-fit: contain;
          margin-top: 12px;
          margin-bottom: 18px;
        }

        /* ── Card — exact AdminLogin card style ── */
        .af-card {
          background: rgba(255,255,255,0.96);
          width: 100%;
          border-radius: 20px;
          padding: 36px 30px 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,.10);
        }

        .af-title {
          font-size: 23px;
          color: #2E7D32;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          margin: 0 0 4px 0;
          text-align: center;
        }
        .af-sub {
          color: #555;
          font-size: 13px;
          margin-bottom: 22px;
          text-align: center;
        }

        /* ── Section panels ── */
        .af-section {
          background: #f9fdf9;
          border-radius: 14px;
          border: 1.5px solid #c8e6c9;
          padding: 1.3rem 1.3rem 1.1rem;
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }

        .af-row { display: flex; flex-wrap: wrap; gap: 0.9rem; }

        /* ── Inputs — identical to AdminLogin ── */
        .af-card input[type="text"],
        .af-card input[type="email"],
        .af-card input[type="number"],
        .af-card input[type="date"],
        .af-card input[type="password"],
        .af-card textarea,
        .af-card select {
          width: 100%;
          padding: 13px 14px;
          border-radius: 12px;
          border: 1.5px solid #c8e6c9;
          outline: none;
          font-size: 14px;
          font-family: 'Montserrat', sans-serif;
          color: #1a1a1a;
          background: #fafafa;
          transition: border-color 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .af-card input:focus,
        .af-card textarea:focus,
        .af-card select:focus {
          border-color: #2E7D32 !important;
          background: #fff !important;
        }
        .af-card input:disabled {
          background: #f5f5f5;
          color: #888;
          cursor: not-allowed;
          border-color: #e5e7eb !important;
        }
          .af-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  padding: 14px 24px;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.af-nav-inner {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 0 24px;
}
.af-back-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #1b5e20;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  white-space: nowrap;
  transition: opacity 0.2s ease;
}

.af-back-link:hover {
  opacity: 0.7;
}

.af-progress {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.af-steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.af-step {
  font-size: 0.7rem;
  font-weight: 600;
  color: #9ca3af;
  transition: color 0.3s ease;
}

.af-step.active {
  color:  linear-gradient(90deg, #368f3b, #218428);
}

.af-bar-bg {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}

.af-bar-fill {
  height: 100%;
  border-radius: 999px;
  background:  linear-gradient(135deg, #256f29, #1ed834, #147218);
  transition: width 0.4s ease;
}

.af-progress-text {
  margin-top: 4px;
  text-align: right;
  font-size: 0.75rem;
  font-weight: 600;
  color: #2e7d32;
}
        /* ── Submit button — identical to AdminLogin .btn ── */
        .af-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(90deg, #49a94e, #218428);
          color: #fff;
          font-weight: bold;
          cursor: pointer;
          font-size: 14px;
          letter-spacing: 0.5px;
          transition: background 0.2s;
          font-family: 'Montserrat', sans-serif;
          box-shadow: 0 4px 14px rgba(33,132,40,0.25);
        }
        .af-submit-btn:hover {
          background: linear-gradient(90deg, #246627, #2a7e30);
        }

        .af-footer-note {
          text-align: center;
          font-size: 0.82rem;
          color: #9CA3AF;
          margin-top: -0.8rem;
        }
      `}</style>
    </div>
  );
}

// ─── Shared inline styles for dynamic border colors ───────────────────────────
const inpStyle = {
  width: "100%", padding: "13px 14px",
  borderRadius: 12, outline: "none",
  fontSize: 14, fontFamily: "'Montserrat', sans-serif",
  color: "#1a1a1a", background: "#fafafa",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

const disabledStyle = {
  ...inpStyle,
  background: "#f5f5f5", color: "#888",
  cursor: "not-allowed", border: "1.5px solid #e5e7eb",
};