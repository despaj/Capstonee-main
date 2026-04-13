import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from '../assets/ipharma.png';
import welcome from '../assets/welcomepage.png'
export default function IPharmaForm() {
  const [page, setPage] = useState(1);

  const today = new Date();
  const maxDate = new Date(
  today.getFullYear() - 18,
  today.getMonth(),
  today.getDate()
)
  .toISOString()
  .split("T")[0]; // format YYYY-MM-DD
 
  const [form, setForm] = useState({
    name: "",
    date: "",
    address: "",
    mobile: "",
    telephone: "",
    email: "",
    dob: "",
    maritalStatus: "",
    spouseName: "",
    spouseOccupation: "",
    spouseDob: "",
    dependents: "",
    tin: "",  
    education: "",
 
    involvement: "",
    equity: "",
    investment: "",
    fundSource: "",
    otherBusiness: "",
    location: "",
    customerExperience: "",
    successReason: "",
    systemsExperience: "",
    difficultiesPlan: "",
 
    familyDepend: "",
    incomeExpectation: "",
    otherIncome: "",
    marketArea: "",
    startDate: "",
    criminal: "",
    criminalDetails: "",
    pending: "",
    pendingDetails: "",
    signature: "",
    dateSigned: "",
  });
 
  const [errors, setErrors] = useState({});
 
  // Auto-fill date
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setForm((prev) => ({ ...prev, date: today, dateSigned: today }));
  }, []);
 
  const showSpouse =
    form.maritalStatus === "Married" || form.maritalStatus === "Widowed";

  /* ================= SINGLE-FIELD VALIDATOR ================= */
  const validateField = (name, value) => {
  let error = "";

  const optionalFields = [
    "spouseName",
    "spouseOccupation",
    "spouseDob",
    "dependents",
    "telephone",
    "otherBusiness",
    "date",
    "dateSigned",
    "tin",
    "customerExperience",
    "successReason",
    "systemsExperience",
    "difficultiesPlan",
    "incomeExpectation",
    "otherIncome",
    "criminal",
    "criminalDetails",
    "pending",
    "pendingDetails",
  ];

  // Required fields
  if (!value && !optionalFields.includes(name)) {
    return "Required";
  }

  // Email
  if (name === "email" && value && !/\S+@\S+\.\S+/.test(value)) {
    return "Invalid email address";
  }

  // Mobile (PH format)
  if (name === "mobile") {
    if (!/^09\d{9}$/.test(value)) {
      return "Enter a valid 11-digit mobile number";
    }
  }

  // Telephone (digits, spaces, dash, parentheses allowed)
  if (name === "telephone" && value && !/^[0-9()\-\s]+$/.test(value)) {
    return "Invalid telephone number";
  }

  // Date of Birth (18+)
  if (name === "dob" && value) {
    const birthDate = new Date(value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) return "You must be at least 18 years old";
  }

  // Spouse DOB (only if spouse shown)
  if (name === "spouseDob" && value && showSpouse) {
    const birthDate = new Date(value);
    const today = new Date();
    if (birthDate > today) return "Invalid date";
  }

  // Dependents must be 0 or more
  if (name === "dependents" && value && Number(value) < 0) {
    return "Cannot be negative";
  }

  // Equity % (1–100)
  if (name === "equity" && value) {
    const num = Number(value);
    if (num <= 0 || num > 100) return "Enter a value between 1 and 100";
  }

  // Investment must be positive
  if (name === "investment" && value && Number(value) <= 0) {
    return "Must be greater than 0";
  }

  // Start date cannot be past
  if (name === "startDate" && value) {
    const selected = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) return "Start date cannot be in the past";
  }

  // Signature must match name (optional cool feature)
  if (name === "signature" && value && value.length < 3) {
    return "Enter your full name as signature";
  }

  return "";
};

  /* ================= FORM INPUT HANDLER ================= */
  const handleChange = (e) => {
  const { name, value } = e.target;
  let newValue = value;

  if (name === "mobile") {
    newValue = value.replace(/\D/g, "").slice(0, 11);
  }

  if (name === "telephone") {
    newValue = value.slice(0, 15);
  }

  if (name === "equity" || name === "investment" || name === "dependents") {
    newValue = value.replace(/\D/g, "");
  }

  setForm((prev) => ({ ...prev, [name]: newValue }));

  setErrors((prev) => ({
    ...prev,
    [name]: validateField(name, newValue),
  }));
};

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  /* ================= PAGE VALIDATORS (full-page sweep) ================= */
  const validatePage1 = () => {
    const fields = [
      "name", "address", "mobile", "email", "dob", "maritalStatus", "education",
    ];
    let e = {};
    fields.forEach((key) => {
      const error = validateField(key, form[key]);
      if (error) e[key] = error;
    });
    setErrors((prev) => ({ ...prev, ...e }));
    return Object.keys(e).length === 0;
  };

  const validatePage2 = () => {
    const fields = [
      "involvement", "equity", "investment", "fundSource", "location",
    ];
    let e = {};
    fields.forEach((key) => {
      const error = validateField(key, form[key]);
      if (error) e[key] = error;
    });
    setErrors((prev) => ({ ...prev, ...e }));
    return Object.keys(e).length === 0;
  };

  const validatePage3 = () => {
    const fields = [
      "familyDepend", "marketArea", "startDate", "signature",
    ];
    let e = {};
    fields.forEach((key) => {
      const error = validateField(key, form[key]);
      if (error) e[key] = error;
    });
    setErrors((prev) => ({ ...prev, ...e }));
    return Object.keys(e).length === 0;
  };
 
  return (
    <div style={styles.wrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap');
       
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
 
        body {
          font-family: 'Montserrat', sans-serif;
        }
 
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #2e9976 !important;
          box-shadow: 0 0 0 3px rgba(46, 153, 118, 0.1) !important;
        }
 
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2) !important;
        }
 
        @media (max-width: 768px) {
          .card {
            padding: 2rem 1.5rem !important;
          }
          .row {
            flex-direction: column !important;
          }
        }
      `}</style>
 
      <div style={styles.bgOverlay}></div>
 
      <nav style={styles.navbar}>
        <Link to="/apply-franchise" style={styles.backLink}>
          <span style={styles.backArrow}>←</span>
          <span>Back to Application</span>
        </Link>
 
      </nav>
 
      <div style={styles.container}>
        <div style={styles.card} className="card">
          <div style={styles.cardHeader}>
            <div style={styles.logoContainer}>
              <img src={logo} alt="iFranchise Logo" style={styles.logoImage} />
            </div>
            <h1 style={styles.title}>iPharma Mart Application</h1>
            <p style={styles.subtitle}>
            Complete the application form to begin your entrepreneurial journey with iPharma Mart
            </p>
           
          </div>
 
          {/* PAGE 1 */}
          {page === 1 && (
            <div style={styles.form}>
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Applicant Information</h3>
 
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name <span style={styles.required}>*</span></label>
                  <input
                    style={styles.input}
                    name="name"
                    placeholder="Juan Dela Cruz"
                    value={form.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.name && <span style={styles.error}>{errors.name}</span>}
                </div>
 
                <div style={styles.formGroup}>
                  <label style={styles.label}>Application Date</label>
                  <input
                    style={styles.inputDisabled}
                    value={form.date}
                    readOnly
                  />
                </div>
 
                <div style={styles.formGroup}>
                  <label style={styles.label}>Complete Address <span style={styles.required}>*</span></label>
                  <textarea
                    style={styles.textarea}
                    name="address"
                    placeholder="House No., Street, Barangay, City, Province"
                    value={form.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.address && <span style={styles.error}>{errors.address}</span>}
                </div>
 
                <div style={styles.row} className="row">
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Mobile Number <span style={styles.required}>*</span></label>
                    <input
                      style={styles.input}
                      name="mobile"
                      placeholder="09123456789"
                      value={form.mobile}
                      maxLength={11}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.mobile && <span style={styles.error}>{errors.mobile}</span>}
                  </div>
 
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Telephone Number</label>
                    <input
                      style={styles.input}
                      name="telephone"
                      type="tel"
                      placeholder="(02) 1234-5678"
                      value={form.telephone}
                      maxLength={11}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>
                </div>
 
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address <span style={styles.required}>*</span></label>
                  <input
                    style={styles.input}
                    name="email"
                    type="email"
                    placeholder="juandelacruz@email.com"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.email && <span style={styles.error}>{errors.email}</span>}
                </div>
              </div>
 
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Personal Information</h3>
 
                <div style={styles.row} className="row">
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Date of Birth <span style={styles.required}>*</span></label>
                <input
                  style={styles.input}
                  name="dob"
                  type="date"
                  min="1936-01-01"
                  max={maxDate}
                  value={form.dob}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                
                    {errors.dob && <span style={styles.error}>{errors.dob}</span>}
                  </div>
 
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Marital Status <span style={styles.required}>*</span></label>
                    <select
                      style={styles.input}
                      name="maritalStatus"
                      value={form.maritalStatus}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Separated">Separated</option>
                    </select>
                    {errors.maritalStatus && (
                      <span style={styles.error}>{errors.maritalStatus}</span>
                    )}
                  </div>
                </div>
 
                {showSpouse && (
                  <>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Spouse's Name</label>
                      <input
                        style={styles.input}
                        name="spouseName"
                        placeholder="Spouse's Full Name"
                        value={form.spouseName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </div>
 
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Spouse's Occupation</label>
                      <input
                        style={styles.input}
                        name="spouseOccupation"
                        placeholder="Current Occupation"
                        value={form.spouseOccupation}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </div>
 
                    <div style={styles.row} className="row">
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Spouse's Date of Birth</label>
                   <input
                      style={styles.input}
                      name="spouseDob"
                      type="date"
                      min="1936-01-01"
                      max={maxDate}
                      value={form.spouseDob}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
 
                      </div>
 
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Number of Dependents</label>
                        <input
                          style={styles.input}
                          name="dependents"
                          type="number"
                          placeholder="0"
                          value={form.dependents}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
 
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Education</h3>
 
                <div style={styles.formGroup}>
                  <label style={styles.label}>Educational Background <span style={styles.required}>*</span></label>
                  <textarea
                    style={styles.textarea}
                    name="education"
                    placeholder="Educational background, schools attended, years completed, degrees earned"
                    value={form.education}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.education && <span style={styles.error}>{errors.education}</span>}
                </div>
              </div>
 
              <div style={styles.buttonGroup}>
                <button
                  style={styles.nextBtn}
                  onClick={() => validatePage1() && setPage(2)}
                >
                 NEXT
                </button>
              </div>
            </div>
          )}
 
          {/* PAGE 2 */}
          {page === 2 && (
            <div style={styles.form}>
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Business Interest</h3>
 
                <div style={styles.formGroup}>
                  <label style={styles.label}>Extent of Involvement <span style={styles.required}>*</span></label>
                  <textarea
                    style={styles.textarea}
                    name="involvement"
                    placeholder="Describe your expected involvement in daily operations"
                    value={form.involvement}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.involvement && <span style={styles.error}>{errors.involvement}</span>}
                </div>
 
                <div style={styles.row} className="row">
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Percent of Equity Owned <span style={styles.required}>*</span></label>
                    <input
                      style={styles.input}
                      name="equity"
                      type="number"
                      placeholder="100"
                      value={form.equity}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.equity && <span style={styles.error}>{errors.equity}</span>}
                  </div>
 
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Cash Investment Amount (₱) <span style={styles.required}>*</span></label>
                    <input
                      style={styles.input}
                      name="investment"
                      type="number"
                      placeholder="2000000"
                      value={form.investment}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.investment && <span style={styles.error}>{errors.investment}</span>}
                  </div>
                </div>
 
                <div style={styles.formGroup}>
                  <label style={styles.label}>Source of Funds <span style={styles.required}>*</span></label>
                  <input
                    style={styles.input}
                    name="fundSource"
                    placeholder="e.g., Personal Savings, Loan, Investment"
                    value={form.fundSource}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.fundSource && <span style={styles.error}>{errors.fundSource}</span>}
                </div>
 
                <div style={styles.formGroup}>
                  <label style={styles.label}>Other Business Interests</label>
                  <textarea
                    style={styles.textarea}
                    name="otherBusiness"
                    placeholder="List any other business interests or ventures (if any)"
                    value={form.otherBusiness}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
 
                <div style={styles.formGroup}>
                  <label style={styles.label}>Preferred Franchise Location <span style={styles.required}>*</span></label>
                  <textarea
                    style={styles.textarea}
                    name="location"
                    placeholder="Describe your preferred location (city, area, specific address if available)"
                    value={form.location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.location && <span style={styles.error}>{errors.location}</span>}
                </div>
              </div>
 
              <div style={styles.buttonGroup}>
                <button style={styles.backBtn} onClick={() => setPage(1)}>
                  ← Back
                </button>
                <button
                  style={styles.nextBtn}
                  onClick={() => validatePage2() && setPage(3)}
                >
                  Next: Declaration →
                </button>
              </div>
            </div>
          )}
 
          {/* PAGE 3 */}
          {page === 3 && (
            <div style={styles.form}>
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Declaration</h3>
 
                <div style={styles.formGroup}>
                  <label style={styles.label}>Family Dependence on Franchise Income <span style={styles.required}>*</span></label>
                  <textarea
                    style={styles.textarea}
                    name="familyDepend"
                    placeholder="Will your family depend solely on franchise income? Please explain."
                    value={form.familyDepend}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.familyDepend && <span style={styles.error}>{errors.familyDepend}</span>}
                </div>
 
                <div style={styles.formGroup}>
                  <label style={styles.label}>Immediate Market Area <span style={styles.required}>*</span></label>
                  <input
                    style={styles.input}
                    name="marketArea"
                    placeholder="Describe the immediate market area for your franchise"
                    value={form.marketArea}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.marketArea && <span style={styles.error}>{errors.marketArea}</span>}
                </div>
 
                <div style={styles.formGroup}>
                  <label style={styles.label}>Target Start Date <span style={styles.required}>*</span></label>
                  <input
                    style={styles.input}
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.startDate && <span style={styles.error}>{errors.startDate}</span>}
                </div>
              </div>
 
              <div style={styles.certificationBox}>
                <h3 style={styles.sectionTitle}>Certification</h3>
                <p style={styles.certText}>
                  I/We hereby certify that all information provided above is true and correct to the best of my/our
                  knowledge and authorize <strong>iFRANCHISE BUSINESS SERVICES CORP.</strong> to verify
                  the information provided herein.
                </p>
 
                <div style={styles.row} className="row">
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Applicant Signature <span style={styles.required}>*</span></label>
                    <input
                      style={{ ...styles.input, fontStyle: 'italic', fontWeight: '500' }}
                      name="signature"
                      placeholder="Type Your Full Name"
                      value={form.signature}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.signature && <span style={styles.error}>{errors.signature}</span>}
                  </div>
 
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Date Signed</label>
                    <input
                      style={styles.inputDisabled}
                      value={form.dateSigned}
                      readOnly
                    />
                  </div>
                </div>
              </div>
 
              <div style={styles.buttonGroup}>
                <button style={styles.backBtn} onClick={() => setPage(2)}>
                  ← Back
                </button>
                <button
                  style={styles.submitBtn}
                  onClick={async () => {
                    if (validatePage3()) {
                      try {
                        const response = await fetch(`${process.env.REACT_APP_API_URL}/ipharma-applications`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(form),
                        });

                        const data = await response.json();

                        if (data.success) {
                          alert("iPharma Mart Application Submitted Successfully! We will review your application and contact you soon.");
                          console.log("Application Data:", data.application);
                          
                          // Reset form to initial state
                          const today = new Date().toISOString().split("T")[0];
                          setForm({
                            name: "",
                            date: today,
                            address: "",
                            mobile: "",
                            telephone: "",
                            email: "",
                            dob: "",
                            maritalStatus: "",
                            spouseName: "",
                            spouseOccupation: "",
                            spouseDob: "",
                            dependents: "",
                            tin: "",
                            education: "",
                            involvement: "",
                            equity: "",
                            investment: "",
                            fundSource: "",
                            otherBusiness: "",
                            location: "",
                            customerExperience: "",
                            successReason: "",
                            systemsExperience: "",
                            difficultiesPlan: "",
                            familyDepend: "",
                            incomeExpectation: "",
                            otherIncome: "",
                            marketArea: "",
                            startDate: "",
                            criminal: "",
                            criminalDetails: "",
                            pending: "",
                            pendingDetails: "",
                            signature: "",
                            dateSigned: today,
                          });
                          
                          // Reset to page 1
                          setPage(1);
                          setErrors({});
                          
                        } else {
                          alert(data.error || "Failed to submit application. Please try again.");
                        }
                      } catch (error) {
                        console.error('Error submitting application:', error);
                        alert("Failed to submit application. Please check your connection and try again.");
                      }
                    }
                  }}
                >
                  Submit Application
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
 
/* ================= STYLES ================= */
const styles = {
  wrapper: {
  minHeight: "100vh",
  position: "relative",
  paddingTop: "80px",
  paddingBottom: "40px",
  fontFamily: "'Montserrat', sans-serif",
  backgroundImage: `url(${welcome})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  animation: "bgFlow 20s ease-in-out infinite alternate",
 
 
},
bgOverlay: {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: `
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.85) 0%,
      rgba(220, 255, 215, 0.75) 40%,
      rgba(46, 125, 50, 0.55) 100%
    )
  `,
  backdropFilter: "blur(2px)",
  zIndex: 0,
},
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "70px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 5%",
    zIndex: 1000,
  },
  backLink: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "#2E7D32",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "1rem",
    transition: "color 0.3s ease",
  },
  backArrow: {
    fontSize: "1.2rem",
  },
  navTitle: {
    fontSize: "1.4rem",
    fontWeight: "700",
    color: "#2e9976",
    letterSpacing: "0.02em",
  },
  container: {
    display: "flex",
    justifyContent: "center",
    padding: "20px",
    position: "relative",
    zIndex: 1,
  },
  card: {
    width: "100%",
    maxWidth: "1100px",
    backgroundColor: "#fff",
    borderRadius: "20px",
    padding: "3rem",
    boxShadow: "0 10px 40px rgba(46, 153, 118, 0.15)",
  },
  cardHeader: {
    textAlign: "center",
    marginBottom: "3rem",
    paddingBottom: "2rem",
    borderBottom: "2px solid rgba(46, 153, 118, 0.1)",
  },
  logoContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "1.5rem",
  },
  logoImage: {
    height: "80px",
    width: "auto",
    objectFit: "contain",
    filter: "drop-shadow(0 4px 12px rgba(46, 153, 118, 0.2))",
  },
  title: {
    fontSize: "2.2rem",
    fontWeight: "700",
    color: "#2e9976",
    marginBottom: "0.8rem",
    letterSpacing: "-0.01em",
  },
  subtitle: {
    fontSize: "1.05rem",
    color: "#004d00",
    lineHeight: "1.6",
    fontWeight: "400",
    marginBottom: "1rem",
 
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },
  section: {
    padding: "2rem",
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
    border: "1px solid rgba(46, 153, 118, 0.1)",
  },
  sectionTitle: {
    fontSize: "1.3rem",
    fontWeight: "700",
    color: "#2e9976",
    marginBottom: "1.8rem",
    paddingBottom: "0.8rem",
    borderBottom: "1px solid rgba(46, 153, 118, 0.15)",
    letterSpacing: "0.01em",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "1rem",
    flex: 1,
  },
  label: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: "0.6rem",
    letterSpacing: "0.01em",
  },
  required: {
    color: "#FF8C00",
    fontWeight: "700",
  },
  input: {
    width: "100%",
    padding: "0.9rem 1rem",
    borderRadius: "10px",
    border: "2px solid rgba(46, 153, 118, 0.2)",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    backgroundColor: "#fff",
  },
  inputDisabled: {
    width: "100%",
    padding: "0.9rem 1rem",
    borderRadius: "10px",
    backgroundColor: "#f3f4f6",
    border: "2px solid #e5e7eb",
    fontSize: "1rem",
    cursor: "not-allowed",
    color: "#6B7280",
  },
  textarea: {
    width: "100%",
    padding: "0.9rem 1rem",
    borderRadius: "10px",
    border: "2px solid rgba(46, 153, 118, 0.2)",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    backgroundColor: "#fff",
    minHeight: "100px",
    resize: "vertical",
    fontFamily: "'Montserrat', sans-serif",
  },
  row: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
  },
  error: {
    color: "#FF8C00",
    fontSize: "0.85rem",
    marginTop: "0.4rem",
    fontWeight: "500",
  },
  certificationBox: {
    padding: "2.5rem",
    backgroundColor: "rgba(46, 153, 118, 0.05)",
    borderRadius: "12px",
    border: "2px solid #FF8C00",
  },
  certText: {
    fontSize: "1rem",
    lineHeight: "1.8",
    color: "#4B5563",
    marginBottom: "2rem",
  },
  buttonGroup: {
    display: "flex",
    gap: "1rem",
    marginTop: "1rem",
  },
  backBtn: {
    flex: 1,
    padding: "1.2rem",
    backgroundColor: "#6B7280",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "1.05rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(107, 114, 128, 0.3)",
  },
  nextBtn: {
    flex: 1,
    padding: "1.2rem",
    backgroundColor: "#2e9976",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "1.05rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 6px 20px rgba(46, 153, 118, 0.3)",
    letterSpacing: "0.03em",
  },
  submitBtn: {
    flex: 1,
    padding: "1.2rem",
    background: "linear-gradient(135deg, #FF8C00, #FF6B35)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "1.1rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 6px 20px rgba(255, 140, 0, 0.4)",
    letterSpacing: "0.05em",
  },
};