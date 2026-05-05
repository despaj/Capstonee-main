import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronLeft, AlertCircle } from "lucide-react";
import logo from '../assets/ipharma.png';
import welcome from '../assets/welcomepage.png';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const capitalize = (v) => v.replace(/(^|\s)\S/g, (c) => c.toUpperCase());

const MARITAL_OPTIONS = ["Single", "Married", "Widowed", "Separated"];
const SUFFIXES = ["", "Jr.", "Sr.", "II", "III", "IV", "V", "MD", "PhD", "Esq."];

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
          borderRadius: 12, border: error ? "1.5px solid #d32f2f" : "1.5px solid #fed7aa",
          fontSize: 14, fontFamily: "'Montserrat', sans-serif",
          color: value ? "#1a1a1a" : "#9CA3AF",
          background: "#fffbf7",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: disabled ? "not-allowed" : "pointer",
          outline: "none", transition: "border-color .2s",
          boxSizing: "border-box",
        }}
      >
        <span>{value || placeholder}</span>
        <ChevronDown size={16} color="#ea580c" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#fff", border: "1.5px solid #fed7aa",
          borderRadius: 12, zIndex: 200,
          maxHeight: 220, overflowY: "auto",
          boxShadow: "0 8px 32px rgba(234,88,12,0.12)",
        }}>
          {options.map((o) => (
            <div
              key={o || "none"}
              style={{
                padding: "11px 14px", cursor: "pointer", fontSize: 14,
                borderBottom: "1px solid #f3f4f6",
                fontWeight: o === value ? 700 : 400,
                color: o === value ? "#ea580c" : "#1a1a1a",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#fff3e0"}
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
function SectionHeader({ title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.8rem" }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8,
        background: "linear-gradient(135deg, #ea580c, #fb923c)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>✦</span>
      </div>
      <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#c2410c", margin: 0 }}>{title}</h3>
    </div>
  );
}

// ─── Shared styles ─────────────────────────────────────────────────────────────
const inpStyle = {
  width: "100%", padding: "13px 14px",
  borderRadius: 12, outline: "none",
  fontSize: 14, fontFamily: "'Montserrat', sans-serif",
  color: "#1a1a1a", background: "#fffbf7",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

const disabledStyle = {
  ...inpStyle,
  background: "#f5f5f5", color: "#888",
  cursor: "not-allowed", border: "1.5px solid #e5e7eb",
};

const sectionStyle = {
  background: "#fff7ed", borderRadius: 14,
  border: "1.5px solid #fed7aa",
  padding: "1.3rem 1.3rem 1.1rem",
  display: "flex", flexDirection: "column", gap: "0.9rem",
};

const submitBtnStyle = {
  flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
  padding: 14, borderRadius: 12, border: "none",
  background: " linear-gradient(135deg, #2e7d32, #3ea443",
  color: "#fff", fontWeight: "bold", cursor: "pointer",
  fontSize: 14, letterSpacing: "0.5px",
  transition: "all 0.2s ease",
  fontFamily: "'Montserrat', sans-serif",
  boxShadow: "0 4px 14px rgba(234,88,12,0.3)",
};

const backBtnStyle = {
  flex: 1, padding: 14, backgroundColor: "#6B7280",
  color: "#fff", border: "none", borderRadius: 12,
  fontSize: 14, fontWeight: 600, cursor: "pointer",
  transition: "all 0.3s ease",
  fontFamily: "'Montserrat', sans-serif",
  boxShadow: "0 4px 12px rgba(107,114,128,0.3)",
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function IPharmaForm() {
  const [page, setPage] = useState(1);
  const [maritalStatus, setMaritalStatus] = useState("");
  const [suffix, setSuffix] = useState("");
  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState(0);

  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    .toISOString().split("T")[0];

  const [form, setForm] = useState({
    lastName: "", firstName: "", middleInitial: "",
    date: "", address: "", mobile: "", telephone: "", email: "",
    dob: "", spouseName: "", spouseOccupation: "", spouseDob: "",
    dependents: "", tin: "", education: "", involvement: "", equity: "",
    investment: "", fundSource: "", otherBusiness: "", location: "",
    customerExperience: "", successReason: "", systemsExperience: "",
    difficultiesPlan: "", familyDepend: "", incomeExpectation: "",
    otherIncome: "", marketArea: "", startDate: "", criminal: "",
    criminalDetails: "", pending: "", pendingDetails: "",
    signature: "", dateSigned: "",
  });

  useEffect(() => {
    const t = new Date().toISOString().split("T")[0];
    setForm((prev) => ({ ...prev, date: t, dateSigned: t }));
  }, []);

  // ─── Progress calculation ──────────────────────────────────────────────────
  useEffect(() => {
    const allFields = [
      "lastName","firstName","address","mobile","email","dob","education",
      "involvement","equity","investment","fundSource","location",
      "familyDepend","marketArea","startDate",
    ];
    let total = allFields.length + 1;
    let filled = allFields.filter(f => form[f]).length;
    if (maritalStatus) filled++;
    const showSpouseCalc = maritalStatus === "Married" || maritalStatus === "Widowed";
    if (showSpouseCalc) {
      total += 2;
      if (form.spouseName) filled++;
      if (form.spouseOccupation) filled++;
    }
    setProgress(Math.round((filled / total) * 100));
  }, [form, maritalStatus]);

  const showSpouse = maritalStatus === "Married" || maritalStatus === "Widowed";

  const capFields = ["lastName", "firstName", "spouseName", "spouseOccupation", "marketArea", "fundSource"];

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "mobile") value = value.replace(/\D/g, "").slice(0, 11);
    if (name === "telephone") value = value.replace(/[^0-9()\-\s]/g, "").slice(0, 15);
    if (["equity","investment","dependents"].includes(name)) value = value.replace(/\D/g, "");
    if (name === "middleInitial") value = value.replace(/[^a-zA-Z]/g, "").slice(0, 1).toUpperCase();
    if (capFields.includes(name)) value = capitalize(value);
    if (["address","location","involvement","otherBusiness","education","familyDepend"].includes(name)) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateField = (name, value) => {
    const optionalFields = [
      "spouseName","spouseOccupation","spouseDob","dependents","telephone",
      "otherBusiness","date","dateSigned","tin","customerExperience",
      "successReason","systemsExperience","difficultiesPlan","incomeExpectation",
      "otherIncome","criminal","criminalDetails","pending","pendingDetails","middleInitial",
    ];
    if (!value && !optionalFields.includes(name)) return "This field is required";
    if (name === "email" && value && !/\S+@\S+\.\S+/.test(value)) return "Invalid email address";
    if (name === "mobile" && value && !/^09\d{9}$/.test(value)) return "Enter a valid 11-digit mobile (09xxxxxxxxx)";
    if (name === "dob" && value) {
      const age = Math.floor((new Date() - new Date(value)) / (365.25 * 24 * 3600 * 1000));
      if (age < 18) return "You must be at least 18 years old";
    }
    if (name === "equity" && value && (Number(value) <= 0 || Number(value) > 100)) return "Enter a value between 1 and 100";
    if (name === "investment" && value && Number(value) <= 0) return "Must be greater than 0";
    if (name === "dependents" && value && Number(value) < 0) return "Cannot be negative";
    if (name === "startDate" && value) {
      const sel = new Date(value); sel.setHours(0,0,0,0);
      const tod = new Date(); tod.setHours(0,0,0,0);
      if (sel < tod) return "Start date cannot be in the past";
    }
    return "";
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const inp = (name, placeholder, type = "text", extra = {}) => (
    <input
      style={{ ...inpStyle, border: errors[name] ? "1.5px solid #d32f2f" : "1.5px solid #fed7aa" }}
      name={name} type={type} placeholder={placeholder}
      value={form[name]} onChange={handleChange} onBlur={handleBlur}
      {...extra}
    />
  );

  const validatePage = (fields) => {
    const e = {};
    fields.forEach((k) => { const err = validateField(k, form[k]); if (err) e[k] = err; });
    if (fields.includes("maritalStatus") && !maritalStatus) e.maritalStatus = "Please select marital status";
    setErrors((prev) => ({ ...prev, ...e }));
    return Object.keys(e).length === 0;
  };

  const page1Fields = ["lastName","firstName","address","mobile","email","dob","education","maritalStatus"];
  const page2Fields = ["involvement","equity","investment","fundSource","location"];
  const page3Fields = ["familyDepend","marketArea","startDate"];

  const steps = [
    { label: "Personal", pct: 33 },
    { label: "Business", pct: 66 },
    { label: "Done", pct: 100 },
  ];

  return (
    <div style={{
      minHeight: "100vh", fontFamily: "'Montserrat', sans-serif",
      backgroundImage: `linear-gradient(rgba(255,255,255,0.78), rgba(211,255,201,0.78)), url(${welcome})`,
      backgroundSize: "cover", backgroundAttachment: "fixed",
      paddingTop: 90, paddingBottom: 60,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        input:focus, textarea:focus, select:focus {
          outline: none !important;
          border-color:"#2e7d32", !important;
          background: #fff !important;
        }
        .ip-submit-btn:hover {
          background: linear-gradient(90deg, "#2e7d32", "#3ea443"), !important;
          transform: translateY(-1px);
        }
        @media (max-width: 768px) { .ip-row { flex-direction: column !important; } }
      `}</style>

      {/* ── Navbar with Progress Bar ── */}
      <div style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: 70,
        zIndex: 100, background: "#ffffff",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        display: "flex", alignItems: "center",
      }}>
        <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center", padding: "0 24px" }}>
          <Link to="/apply-franchise" style={{
            display: "flex", alignItems: "center", gap: 6,
            color: "#2e7d32", fontWeight: 600, fontSize: "0.9rem",
            textDecoration: "none", whiteSpace: "nowrap",
          }}>
            <ChevronLeft size={20} strokeWidth={2.5} />
            <span>Back to Application</span>
          </Link>

          <div style={{
            position: "absolute", left: "50%", top: "50%",
            transform: "translate(-50%, -50%)",
            width: "50%", display: "flex", flexDirection: "column",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              {steps.map((st) => (
                <span key={st.label} style={{
                  fontSize: "0.7rem", fontWeight: 600,
                  color: progress >= st.pct ? "#ea580c" : "#9ca3af",
                  transition: "color 0.3s ease",
                }}>
                  {st.label}
                </span>
              ))}
            </div>
            <div style={{ width: "100%", height: 8, background: "#e5e7eb", borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 999,
                background: "linear-gradient(90deg, #ea580c, #fb923c)",
                width: `${progress}%`, transition: "width 0.4s ease",
              }} />
            </div>
            <div style={{ marginTop: 4, textAlign: "right", fontSize: "0.75rem", fontWeight: 600, color: "#2e7d32" }}>
              {progress}%
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 1.5rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <img src={logo} alt="iPharma" style={{ height: 66, objectFit: "contain", marginTop: 12, marginBottom: 18 }} />

        <div style={{
          background: "rgba(255,255,255,0.97)", width: "100%",
          borderRadius: 20, padding: "36px 30px 30px",
          boxShadow: "0 10px 30px rgba(234,88,12,0.10)",
        }}>
          <h2 style={{ fontSize: 23, color:" #2E7D32", fontFamily: "'Montserrat', sans-serif", fontWeight: 700, margin: "0 0 4px 0", textAlign: "center" }}>
            iPharma Mart Application
          </h2>
          <p style={{ color: "#2E7D32", fontSize: 13, marginBottom: 22, textAlign: "center" }}>
            Complete the application form to begin your entrepreneurial journey with iPharma Mart
          </p>

          {/* ── PAGE 1 ── */}
          {page === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
              <div style={sectionStyle}>
                <SectionHeader title="Applicant Information" />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.9rem" }} className="ip-row">
                  <Field label="Last Name" required error={errors.lastName} style={{ flex: "2 1 150px" }}>
                    {inp("lastName", "Dela Cruz")}
                  </Field>
                  <Field label="First Name" required error={errors.firstName} style={{ flex: "2 1 150px" }}>
                    {inp("firstName", "Juan")}
                  </Field>
                  <Field label="M.I." error={errors.middleInitial} style={{ flex: "0 0 72px" }}>
                    {inp("middleInitial", "M", "text", { maxLength: 1 })}
                  </Field>
                  <Field label="Suffix" style={{ flex: "0 0 110px" }}>
                    <CustomSelect
                      value={suffix} placeholder="—" options={SUFFIXES}
                      onSelect={(v) => setSuffix(v)}
                    />
                  </Field>
                </div>

                <Field label="Application Date" style={{ flex: "0 0 calc(50% - 0.45rem)" }}>
                  <input style={disabledStyle} value={form.date} disabled />
                </Field>

                <Field label="Complete Address" required error={errors.address}>
                  <textarea
                    style={{ ...inpStyle, minHeight: 76, resize: "vertical", border: errors.address ? "1.5px solid #d32f2f" : "1.5px solid #fed7aa" }}
                    name="address" placeholder="House No., Street, Barangay, City, Province"
                    value={form.address} onChange={handleChange} onBlur={handleBlur}
                  />
                </Field>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.9rem" }} className="ip-row">
                  <Field label="Mobile Number" required error={errors.mobile} half>
                    {inp("mobile", "09123456789")}
                  </Field>
                  <Field label="Telephone Number" error={errors.telephone} half>
                    {inp("telephone", "(02) 1234-5678", "tel")}
                  </Field>
                </div>

                <Field label="Email Address" required error={errors.email}>
                  {inp("email", "juandelacruz@email.com", "email")}
                </Field>
              </div>

              <div style={sectionStyle}>
                <SectionHeader title="Personal Information" />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.9rem" }} className="ip-row">
                  <Field label="Date of Birth" required error={errors.dob} half>
                    <input
                      style={{ ...inpStyle, border: errors.dob ? "1.5px solid #d32f2f" : "1.5px solid #fed7aa" }}
                      name="dob" type="date" min="1936-01-01" max={maxDate}
                      value={form.dob} onChange={handleChange} onBlur={handleBlur}
                    />
                  </Field>
                  <Field label="Marital Status" required error={errors.maritalStatus} half>
                    <CustomSelect
                      value={maritalStatus} placeholder="Select Status" options={MARITAL_OPTIONS}
                      error={errors.maritalStatus}
                      onSelect={(v) => { setMaritalStatus(v); setErrors((p) => ({ ...p, maritalStatus: "" })); }}
                    />
                  </Field>
                </div>

                {showSpouse && (
                  <>
                    <Field label="Spouse's Name" error={errors.spouseName}>
                      {inp("spouseName", "Spouse's Full Name")}
                    </Field>
                    <Field label="Spouse's Occupation" error={errors.spouseOccupation}>
                      {inp("spouseOccupation", "Current Occupation")}
                    </Field>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.9rem" }} className="ip-row">
                      <Field label="Spouse's Date of Birth" error={errors.spouseDob} half>
                        <input
                          style={{ ...inpStyle, border: errors.spouseDob ? "1.5px solid #d32f2f" : "1.5px solid #fed7aa" }}
                          name="spouseDob" type="date" min="1936-01-01" max={maxDate}
                          value={form.spouseDob} onChange={handleChange} onBlur={handleBlur}
                        />
                      </Field>
                      <Field label="Number of Dependents" error={errors.dependents} half>
                        {inp("dependents", "0", "number")}
                      </Field>
                    </div>
                  </>
                )}
              </div>

              <div style={sectionStyle}>
                <SectionHeader title="Education" />
                <Field label="Educational Background" required error={errors.education}>
                  <textarea
                    style={{ ...inpStyle, minHeight: 76, resize: "vertical", border: errors.education ? "1.5px solid #d32f2f" : "1.5px solid #fed7aa" }}
                    name="education" placeholder="Educational background, schools attended, years completed, degrees earned"
                    value={form.education} onChange={handleChange} onBlur={handleBlur}
                  />
                </Field>
              </div>

              <button className="ip-submit-btn" style={submitBtnStyle}
                onClick={() => validatePage(page1Fields) && setPage(2)}>
                Next →
              </button>
            </div>
          )}

          {/* ── PAGE 2 ── */}
          {page === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
              <div style={sectionStyle}>
                <SectionHeader title="Business Interest" />
                <Field label="Extent of Involvement" required error={errors.involvement}>
                  <textarea
                    style={{ ...inpStyle, minHeight: 76, resize: "vertical", border: errors.involvement ? "1.5px solid #d32f2f" : "1.5px solid #fed7aa" }}
                    name="involvement" placeholder="Describe your expected involvement in daily operations"
                    value={form.involvement} onChange={handleChange} onBlur={handleBlur}
                  />
                </Field>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.9rem" }} className="ip-row">
                  <Field label="Percent of Equity Owned" required error={errors.equity} half>
                    {inp("equity", "100", "number")}
                  </Field>
                  <Field label="Cash Investment Amount (₱)" required error={errors.investment} half>
                    {inp("investment", "2000000", "number")}
                  </Field>
                </div>
                <Field label="Source of Funds" required error={errors.fundSource}>
                  {inp("fundSource", "e.g., Personal Savings, Loan, Investment")}
                </Field>
                <Field label="Other Business Interests" error={errors.otherBusiness}>
                  <textarea
                    style={{ ...inpStyle, minHeight: 76, resize: "vertical", border: "1.5px solid #fed7aa" }}
                    name="otherBusiness" placeholder="List any other business interests or ventures (if any)"
                    value={form.otherBusiness} onChange={handleChange} onBlur={handleBlur}
                  />
                </Field>
                <Field label="Preferred Franchise Location" required error={errors.location}>
                  <textarea
                    style={{ ...inpStyle, minHeight: 76, resize: "vertical", border: errors.location ? "1.5px solid #d32f2f" : "1.5px solid #fed7aa" }}
                    name="location" placeholder="Describe your preferred location (city, area, specific address if available)"
                    value={form.location} onChange={handleChange} onBlur={handleBlur}
                  />
                </Field>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button style={backBtnStyle} onClick={() => setPage(1)}>← Back</button>
                <button className="ip-submit-btn" style={submitBtnStyle}
                  onClick={() => validatePage(page2Fields) && setPage(3)}>
                  Next: Declaration →
                </button>
              </div>
            </div>
          )}

          {/* ── PAGE 3 ── */}
          {page === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
              <div style={sectionStyle}>
                <SectionHeader title="Declaration" />
                <Field label="Family Dependence on Franchise Income" required error={errors.familyDepend}>
                  <textarea
                    style={{ ...inpStyle, minHeight: 76, resize: "vertical", border: errors.familyDepend ? "1.5px solid #d32f2f" : "1.5px solid #fed7aa" }}
                    name="familyDepend" placeholder="Will your family depend solely on franchise income? Please explain."
                    value={form.familyDepend} onChange={handleChange} onBlur={handleBlur}
                  />
                </Field>
                <Field label="Immediate Market Area" required error={errors.marketArea}>
                  {inp("marketArea", "Describe the immediate market area for your franchise")}
                </Field>
                <Field label="Target Start Date" required error={errors.startDate}>
                  <input
                    style={{ ...inpStyle, border: errors.startDate ? "1.5px solid #d32f2f" : "1.5px solid #fed7aa" }}
                    name="startDate" type="date"
                    value={form.startDate} onChange={handleChange} onBlur={handleBlur}
                  />
                </Field>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button style={backBtnStyle} onClick={() => setPage(2)}>← Back</button>
                <button
                  className="ip-submit-btn"
                  style={submitBtnStyle}
                  onClick={async () => {
                    if (validatePage(page3Fields)) {
                      const fullName = [form.firstName, form.middleInitial ? form.middleInitial + "." : "", form.lastName, suffix].filter(Boolean).join(" ");
                      try {
                        const response = await fetch(`${process.env.REACT_APP_API_URL}/ipharma-applications`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ ...form, name: fullName, suffix, maritalStatus }),
                        });
                        const data = await response.json();
                        if (data.success) {
                          alert("iPharma Mart Application Submitted Successfully! We will review your application and contact you soon.");
                          const t = new Date().toISOString().split("T")[0];
                          setForm({ lastName:"",firstName:"",middleInitial:"",date:t,address:"",mobile:"",telephone:"",email:"",dob:"",spouseName:"",spouseOccupation:"",spouseDob:"",dependents:"",tin:"",education:"",involvement:"",equity:"",investment:"",fundSource:"",otherBusiness:"",location:"",customerExperience:"",successReason:"",systemsExperience:"",difficultiesPlan:"",familyDepend:"",incomeExpectation:"",otherIncome:"",marketArea:"",startDate:"",criminal:"",criminalDetails:"",pending:"",pendingDetails:"",signature:"",dateSigned:t });
                          setMaritalStatus(""); setSuffix(""); setPage(1); setErrors({});
                        } else {
                          alert(data.error || "Failed to submit application. Please try again.");
                        }
                      } catch {
                        alert("Failed to submit application. Please check your connection and try again.");
                      }
                    }
                  }}
                >
                  Submit Application
                </button>
              </div>
              <p style={{ textAlign: "center", fontSize: "0.82rem", color: "#9CA3AF", marginTop: "-0.8rem" }}>
                By submitting this form, you agree to our terms and conditions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}