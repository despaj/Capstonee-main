import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from '../assets/iFranchise_logo.png';
import welcome from '../assets/welcomepage.png';
 
export default function ApplyFranchise() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [concept, setConcept] = useState("Select Concept");
  const [civilOpen, setCivilOpen] = useState(false);
  const [civilStatus, setCivilStatus] = useState("");
  const [errors, setErrors] = useState({});
 
  const [form, setForm] = useState({
    date: "",
    paymentMode: "",
    lastName: "",
    firstName: "",
    middleInitial: "",
    dob: "",
    dependents: "",
    gender: "",
    nationality: "",
    mobile: "",
    address: "",
    email: "",
    spouseName: "",
    spouseOccupation: "",
    employmentType: "",
    yearsEmployer: "",
    income: "",
    employerName: "",
    businessAddress: "",
    position: "",
    businessNature: "",
    signature: "",
    dateSigned: "",
  });
 
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setForm((prev) => ({ ...prev, date: today, dateSigned: today }));
  }, []);
 
 const handleChange = (e) => {
  const { name, value } = e.target;

  let newValue = value;

  if (name === "mobile") {
    newValue = value.replace(/\D/g, "").slice(0, 11);
  }

  if (name === "lastName" || name === "firstName" || name === "middleInitial" || name === "employerName" ||
     name === "position" || name === "businessNature" || name === "spouseName" || name === "nationality" || 
     name === "signature") {
    newValue = value.replace(/[^a-zA-Z\s'-]/g, "");
  }

  setForm((prev) => ({
    ...prev,
    [name]: newValue,
  }));

  if (errors[name]) {
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }
};

const [progress, setProgress] = useState(0);

useEffect(() => {
  const calculateProgress = () => {
    let totalFields = 0;
    let filledFields = 0;

    totalFields += 3;
    if (form.date) filledFields++;
    if (form.paymentMode) filledFields++;
    if (concept !== "Select Concept") filledFields++;

    totalFields += 10;
    if (form.firstName) filledFields++;
    if (form.lastName) filledFields++;
    if (form.dob) filledFields++;
    if (civilStatus) filledFields++;
    if (form.gender) filledFields++;
    if (form.nationality) filledFields++;
    if (form.dependents) filledFields++;
    if (form.mobile) filledFields++;
    if (form.email) filledFields++;
    if (form.address) filledFields++;

    if (civilStatus === "Married" || civilStatus === "Widowed") {
      totalFields += 2;
      if (form.spouseName) filledFields++;
      if (form.spouseOccupation) filledFields++;
    }

    totalFields += 7;
    if (form.employmentType) filledFields++;
    if (form.yearsEmployer) filledFields++;
    if (form.income) filledFields++;
    if (form.employerName) filledFields++;
    if (form.businessAddress) filledFields++;
    if (form.position) filledFields++;
    if (form.businessNature) filledFields++;

    totalFields += 1;
    if (form.signature) filledFields++;

    const percentage = Math.round((filledFields / totalFields) * 100);
    setProgress(percentage);
  };

  calculateProgress();
}, [form, concept, civilStatus]);

const handleBlur = (e) => {
  const { name, value } = e.target;

  setErrors((prev) => ({
    ...prev,
    [name]: validateField(name, value),
  }));
};

  const concepts = [
    "Coffee Spot Outdoor Kiosk",
    "Coffee Spot Full Store",
    "iPharma Mart",
    "Food Caravan",
    "Dodram Luncheon Meat",
    "Coffee Spot Products",
    "Kwezen",
  ];
 
  const civilStatuses = ["Single", "Married", "Widowed", "Separated"];

  const today = new Date();
  const maxDate = new Date(
  today.getFullYear() - 18,
  today.getMonth(),
  today.getDate()
)
  .toISOString()
  .split("T")[0]; 
 
  const handleConceptSelect = (selectedConcept) => {
    setConcept(selectedConcept);
    setOpen(false);
   
    if (selectedConcept === "iPharma Mart") {
      navigate('/apply-pharma');
    }
  };

  const validateField = (name, value) => {
    let error = "";

    if (!value && name !== "spouseName" && name !== "spouseOccupation" && name !== "middleInitial") {
      error = "Required";
      return error;
    }

    if (name === "middleInitial" && value && value.length > 1) {
      error = "Only 1 letter";
    }

    if (name === "email" && value && !/\S+@\S+\.\S+/.test(value)) {
      error = "Invalid email";
    }

    if (name === "mobile" && value) {
      const mobileRegex = /^09\d{9}$/;
      if (!mobileRegex.test(value)) {
        error = "Enter a valid 11-digit mobile number";
      }
    }

    if (name === "dob" && value) {
      const birthDate = new Date(value);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        error = "You must be at least 18 years old";
      }
    }

    return error;
  };
 
  const validate = () => {
  let e = {};

  Object.keys(form).forEach((key) => {
    const error = validateField(key, form[key]);
    if (error) e[key] = error;
  });

  if (concept === "Select Concept") e.concept = "Required";
  if (!civilStatus) e.civilStatus = "Required";

  if (civilStatus === "Single") {
    delete e.spouseName;
    delete e.spouseOccupation;
  }

  setErrors(e);
  return Object.keys(e).length === 0;
};

   const calculateAge = (dob) => {
      const birthDate = new Date(dob);
      const diff = Date.now() - birthDate.getTime();
      const ageDate = new Date(diff);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

  const submitForm = async (e) => {
  e.preventDefault();
  if (!validate()) {
    alert("Please fix the errors before submitting.");
    return;
  }

  const fullName = [
    form.firstName,
    form.middleInitial ? form.middleInitial + '.' : '',
    form.lastName
  ].filter(Boolean).join(' ').trim();
 
  const applicationData = {
    name: fullName, 
    email: form.email,
    phone: form.mobile,
    franchise: concept,
    paymentMode: form.paymentMode,
    dob: form.dob,
    civilStatus: civilStatus,
    dependents: form.dependents,
    gender: form.gender,
    nationality: form.nationality,
    address: form.address,
    spouseName: form.spouseName,
    spouseOccupation: form.spouseOccupation,
    employmentType: form.employmentType,
    yearsEmployer: form.yearsEmployer,
    income: form.income,
    employerName: form.employerName,
    businessAddress: form.businessAddress,
    position: form.position,
    businessNature: form.businessNature,
    signature: form.signature,
    dateSigned: form.dateSigned
  };
 
  try {
    const response = await fetch('http://localhost:5001/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicationData),
    });

    const data = await response.json();

    if (data.success) {
      alert("Application submitted successfully! We will review your application and contact you soon.");
      navigate('/');
      // Reset form
      setForm({
        date: new Date().toISOString().split("T")[0],
        paymentMode: "",
        lastName: "",
        firstName: "",
        middleInitial: "",
        dob: "",
        dependents: "",
        gender: "",
        nationality: "",
        mobile: "",
        address: "",
        email: "",
        spouseName: "",
        spouseOccupation: "",
        employmentType: "",
        yearsEmployer: "",
        income: "",
        employerName: "",
        businessAddress: "",
        position: "",
        businessNature: "",
        signature: "",
        dateSigned: new Date().toISOString().split("T")[0],
      });
      setConcept("Select Concept");
      setCivilStatus("");
      setErrors({});
    } else {
      alert(data.error || "Failed to submit application. Please try again.");
    }
  } catch (error) {
    console.error('Error submitting application:', error);
    alert("Failed to submit application. Please check your connection and try again.");
  }
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
          border-color: #2E7D32 !important;
          box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1) !important;
        }
 
        button[type="submit"]:hover {
          background: #1B5E20 !important;
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(46, 125, 50, 0.4) !important;
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
 
      {/* Combined Navbar + Progress Bar */}
      <div style={styles.progressContainer}>
        <div style={styles.progressWrapper}>
          {/* Header with Back Link and Progress */}
          <div style={styles.progressHeaderRow}>
            <Link to="/" style={styles.backLink}>
              <span style={styles.backArrow}>←</span>
              <span>Back to Home</span>
            </Link>
            
            <div style={styles.progressInfo}>
              <span style={styles.progressLabel}>Progress</span>
              <span style={styles.progressPercentage}>{progress}%</span>
            </div>
          </div>
          
          <div style={styles.progressBarBg}>
            <div 
              style={{
                ...styles.progressBarFill,
                width: `${progress}%`,
                backgroundColor: progress === 100 ? '#10B981' : '#2E7D32'
              }}
            >
              {progress === 100 && (
                <span style={styles.checkmark}>✓</span>
              )}
            </div>
          </div>
          <div style={styles.progressSteps}>
            <div style={progress >= 25 ? styles.stepActive : styles.stepInactive}>
              <div style={styles.stepDot}></div>
              <span style={styles.stepLabel}>Basic</span>
            </div>
            <div style={progress >= 50 ? styles.stepActive : styles.stepInactive}>
              <div style={styles.stepDot}></div>
              <span style={styles.stepLabel}>Details</span>
            </div>
            <div style={progress >= 75 ? styles.stepActive : styles.stepInactive}>
              <div style={styles.stepDot}></div>
              <span style={styles.stepLabel}>Employment</span>
            </div>
            <div style={progress >= 100 ? styles.stepActive : styles.stepInactive}>
              <div style={styles.stepDot}></div>
              <span style={styles.stepLabel}>Complete</span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.card} className="card">
          <div style={styles.cardHeader}>
            <div style={styles.logoContainer}>
              <img src={logo} alt="iFranchise Logo" style={styles.logoImage} />
            </div>
            <h1 style={styles.title}>Franchise Application</h1>
            <p style={styles.subtitle}>
              Complete the application form to begin your entrepreneurial journey with iFranchise
            </p>
          </div>
 
          <form onSubmit={submitForm} style={styles.form}>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Basic Information</h3>
             
              <div style={styles.row} className="row">
                <div style={styles.formGroup}>
                  <label style={styles.label}>Application Date</label>
                  <input style={styles.inputDisabled} value={form.date} disabled />
                </div>
 
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Payment Mode <span style={styles.required}>*</span>
                  </label>
                  <input
                    style={styles.input}
                    name="paymentMode"
                    placeholder="e.g., Cash, Bank Transfer, Check"
                    value={form.paymentMode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.paymentMode && <span style={styles.error}>{errors.paymentMode}</span>}
                </div>
              </div>
 
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Chosen Franchise Concept <span style={styles.required}>*</span>
                </label>
                <div style={styles.dropdown} onClick={() => setOpen(!open)}>
                  <span style={{ color: concept === "Select Concept" ? "#999" : "#1A1A1A" }}>
                    {concept}
                  </span>
                  <span style={styles.dropdownArrow}>{open ? "▲" : "▼"}</span>
                </div>
                {errors.concept && <span style={styles.error}>{errors.concept}</span>}
 
                {open && (
                  <div style={styles.dropdownList}>
                    {concepts.map((c) => (
                      <div
                        key={c}
                        style={styles.dropdownItem}
                        onClick={() => handleConceptSelect(c)}
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
 
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Applicant Information</h3>
 
              <div style={styles.formGroup}>
                <div style={styles.row} className="row">
                  <div style={styles.formGroup}>
                  <label style={styles.label}>
                        Last Name <span style={styles.required}>*</span>
                  </label>
                  <input
                        style={styles.input}
                        name="lastName"
                        placeholder="Dela Cruz"
                        value={form.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {errors.lastName && <span style={styles.error}>{errors.lastName}</span>}
                  </div>
                  
                    <div style={styles.formGroup}>
                  <label style={styles.label}>
                        First Name <span style={styles.required}>*</span>
                  </label>
                  <input
                        style={styles.input}
                        name="firstName"
                        placeholder="Juan"
                        value={form.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {errors.firstName && <span style={styles.error}>{errors.firstName}</span>}
                  </div>
                  
                    <div style={{ ...styles.formGroup, maxWidth: "120px" }}>
                  <label style={styles.label}>MI</label>
                  <input
                        style={styles.input}
                        name="middleInitial"
                        placeholder="M"
                        maxLength={1}
                        value={form.middleInitial}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {errors.middleInitial && <span style={styles.error}>{errors.middleInitial}</span>}
                  </div>
                  </div>
              </div>
 
              <div style={styles.row} className="row">
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Date of Birth <span style={styles.required}>*</span>
                  </label>
                  <input
                    style={styles.input}
                    name="dob"
                    type="date"
                    min="1930-01-01"
                    max={maxDate}
                    value={form.dob}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.dob && <span style={styles.error}>{errors.dob}</span>}
                </div>
 
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Civil Status <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.dropdown} onClick={() => setCivilOpen(!civilOpen)}>
                    <span style={{ color: civilStatus ? "#1A1A1A" : "#999" }}>
                      {civilStatus || "Select Status"}
                    </span>
                    <span style={styles.dropdownArrow}>{civilOpen ? "▲" : "▼"}</span>
                  </div>
                  {errors.civilStatus && <span style={styles.error}>{errors.civilStatus}</span>}
                </div>
              </div>
 
              {civilOpen && (
                <div style={styles.dropdownList}>
                  {civilStatuses.map((c) => (
                    <div
                      key={c}
                      style={styles.dropdownItem}
                      onClick={() => {
                        setCivilStatus(c);
                        setCivilOpen(false);
                      }}
                    >
                      {c}
                    </div>
                  ))}
                </div>
              )}
 
              <div style={styles.row} className="row">
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Gender <span style={styles.required}>*</span>
                  </label>
                  <select
                    style={styles.input}
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  {errors.gender && <span style={styles.error}>{errors.gender}</span>}
                </div>
 
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Nationality <span style={styles.required}>*</span>
                  </label>
                  <input
                    style={styles.input}
                    name="nationality"
                    placeholder="Filipino"
                    value={form.nationality}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.nationality && <span style={styles.error}>{errors.nationality}</span>}
                </div>
              </div>
 
              <div style={styles.row} className="row">
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Number of Dependents <span style={styles.required}>*</span>
                  </label>
                  <input
                    style={styles.input}
                    name="dependents"
                    type="number"
                    placeholder="0"
                    value={form.dependents}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.dependents && <span style={styles.error}>{errors.dependents}</span>}
                </div>
 
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Mobile Number <span style={styles.required}>*</span>
                  </label>
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
              </div>
 
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Email Address <span style={styles.required}>*</span>
                </label>
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
 
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Present Address <span style={styles.required}>*</span>
                </label>
                <textarea
                  style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                  name="address"
                  placeholder="House No., Street, Barangay, City, Province"
                  value={form.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.address && <span style={styles.error}>{errors.address}</span>}
              </div>
            </div>
 
           {(civilStatus === "Married" || civilStatus === "Widowed") && (
 
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Spouse Information</h3>
 
                <div style={styles.formGroup}>
                  <label style={styles.label}>Spouse Name</label>
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
                  <label style={styles.label}>Spouse Occupation</label>
                  <input
                    style={styles.input}
                    name="spouseOccupation"
 
                    placeholder="Spouse's Current Occupation"
                    value={form.spouseOccupation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
              </div>
            )}
 
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Employment Information</h3>
 
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Employment Type <span style={styles.required}>*</span>
                </label>
                <select
                  style={styles.input}
                  name="employmentType"
                  value={form.employmentType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="">Select Employment Type</option>
                  <option value="Full-time Employee">Full-time Employee</option>
                  <option value="Part-time Employee">Part-time Employee</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Business Owner">Business Owner</option>
                  <option value="Freelancer">Freelancer</option>
                  <option value="Retired">Retired</option>
                  <option value="Unemployed">Unemployed</option>
                </select>
                {errors.employmentType && <span style={styles.error}>{errors.employmentType}</span>}
              </div>
 
              <div style={styles.row} className="row">
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Years with Employer <span style={styles.required}>*</span>
                  </label>
                  <input
                    style={styles.input}
                    name="yearsEmployer"
                    type="number"
                    placeholder="5"
                    value={form.yearsEmployer}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.yearsEmployer && <span style={styles.error}>{errors.yearsEmployer}</span>}
                </div>
 
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Monthly Income (₱) <span style={styles.required}>*</span>
                  </label>
                  <input
                    style={styles.input}
                    name="income"
                    type="number"
                    placeholder="50000"
                    value={form.income}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.income && <span style={styles.error}>{errors.income}</span>}
                </div>
              </div>
 
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Employer / Business Name <span style={styles.required}>*</span>
                </label>
                <input
                  style={styles.input}
                  name="employerName"
                  placeholder="Company or Business Name"
                  value={form.employerName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.employerName && <span style={styles.error}>{errors.employerName}</span>}
              </div>
 
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Business Address <span style={styles.required}>*</span>
                </label>
                <input
                  style={styles.input}
                  name="businessAddress"
                  placeholder="Complete Business Address"
                  value={form.businessAddress}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.businessAddress && <span style={styles.error}>{errors.businessAddress}</span>}
              </div>
 
              <div style={styles.row} className="row">
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Position <span style={styles.required}>*</span>
                  </label>
                  <input
                    style={styles.input}
                    name="position"
                    placeholder="Job Position/Title"
                    value={form.position}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.position && <span style={styles.error}>{errors.position}</span>}
                </div>
 
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Nature of Business <span style={styles.required}>*</span>
                  </label>
                  <input
                    style={styles.input}
                    name="businessNature"
                    placeholder="e.g., Retail, Manufacturing"
                    value={form.businessNature}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.businessNature && <span style={styles.error}>{errors.businessNature}</span>}
                </div>
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
                  <label style={styles.label}>
                    Signature (Type Full Name) <span style={styles.required}>*</span>
                  </label>
                  <input
                    style={{ ...styles.input, fontStyle: 'italic', fontWeight: '500', fontSize: '1.05rem' }}
                    name="signature"
                    placeholder="Your Full Name"
                    value={form.signature}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.signature && <span style={styles.error}>{errors.signature}</span>}
                </div>
 
                <div style={styles.formGroup}>
                  <label style={styles.label}>Date Signed</label>
                  <input style={styles.inputDisabled} value={form.dateSigned} disabled />
                </div>
              </div>
            </div>
 
            <button type="submit" style={styles.submitBtn}>
              Submit Application
            </button>
 
            <p style={styles.footerText}>
              By submitting this form, you agree to our terms and conditions
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
 
const styles = {
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
  backLink: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    color: "#2E7D32",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "0.9rem",
    transition: "color 0.3s ease",
    marginTop: "15px",
  },
  backArrow: {
    fontSize: "1.1rem",
  },
  navTitle: {
    fontSize: "1.4rem",
    fontWeight: "700",
    color: "#2E7D32",
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
    boxShadow: "0 10px 40px rgba(46, 125, 50, 0.15)",
  },
  cardHeader: {
    textAlign: "center",
    marginBottom: "3rem",
    paddingBottom: "2rem",
    borderBottom: "2px solid rgba(46, 125, 50, 0.1)",
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
    filter: "drop-shadow(0 4px 12px rgba(46, 125, 50, 0.2))",
  },
  title: {
    fontSize: "2.2rem",
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: "0.8rem",
    letterSpacing: "-0.01em",
  },
  subtitle: {
    fontSize: "1.05rem",
    color: "#004d00",
    lineHeight: "1.6",
    fontWeight: "400",
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
    border: "1px solid rgba(46, 125, 50, 0.1)",
  },
  sectionTitle: {
    fontSize: "1.3rem",
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: "1.8rem",
    paddingBottom: "0.8rem",
    borderBottom: "1px solid rgba(46, 125, 50, 0.15)",
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
    color: "#EF4444",
    fontWeight: "700",
  },
  input: {
    width: "100%",
    padding: "0.9rem 1rem",
    borderRadius: "10px",
    border: "2px solid rgba(46, 125, 50, 0.2)",
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
  row: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
  },
  dropdown: {
    width: "100%",
    padding: "0.9rem 1rem",
    borderRadius: "10px",
    border: "2px solid rgba(46, 125, 50, 0.2)",
    backgroundColor: "#fff",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "1rem",
    transition: "all 0.3s ease",
  },
  dropdownArrow: {
    fontSize: "0.8rem",
    color: "#2E7D32",
  },
 
  dropdownList: {
    marginTop: "0.5rem",
    border: "2px solid rgba(46, 125, 50, 0.2)",
    borderRadius: "10px",
    backgroundColor: "#fff",
    maxHeight: "200px",
    overflowY: "auto",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  dropdownItem: {
    padding: "0.9rem 1rem",
    cursor: "pointer",
    borderBottom: "1px solid #f3f4f6",
    fontSize: "1rem",
    transition: "background 0.2s ease",
  },
  error: {
    color: "#EF4444",
    fontSize: "0.85rem",
    marginTop: "0.4rem",
    fontWeight: "500",
  },
  certificationBox: {
    padding: "2.5rem",
    backgroundColor: "rgba(46, 125, 50, 0.05)",
    borderRadius: "12px",
    border: "2px solid #d4df33",
  },
  certText: {
    fontSize: "1rem",
    lineHeight: "1.8",
    color: "#4B5563",
    marginBottom: "2rem",
  },
  submitBtn: {
    width: "100%",
    padding: "1.2rem",
    backgroundColor: "#2E7D32",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "1.1rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 6px 20px rgba(46, 125, 50, 0.3)",
    letterSpacing: "0.05em",
  },
  footerText: {
    textAlign: "center",
    fontSize: "0.9rem",
    color: "#6B7280",
    marginTop: "-1rem",
  },
progressContainer: {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  backgroundColor: '#fff',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  zIndex: 999,
  padding: '20 rem 10%',
},
progressWrapper: {
  maxWidth: '1100px',
  margin: '0 auto',
},
progressHeaderRow: {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1rem',
},
progressInfo: {
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  marginTop: "15px",
},
progressLabel: {
  fontSize: '0.85rem',
  fontWeight: '600',
  color: '#1A1A1A',
},
progressPercentage: {
  fontSize: '1rem',
  fontWeight: '700',
  color: '#2E7D32',
},
progressBarBg: {
  width: '100%',
  height: '8px',
  backgroundColor: '#E5E7EB',
  borderRadius: '20px',
  overflow: 'hidden',
  position: 'relative',
},
progressBarFill: {
  height: '100%',
  backgroundColor: '#2E7D32',
  borderRadius: '20px',
  transition: 'width 0.4s ease, background-color 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  paddingRight: '6px',
},
checkmark: {
  color: '#fff',
  fontSize: '0.6rem',
  fontWeight: 'bold',
},
progressSteps: {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '0.5rem',
  paddingTop: '0.5rem',
  marginBottom: '0.5rem',
  borderTop: '1px solid rgba(46, 125, 50, 0.1)',
},
stepActive: {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.3rem',
  color: '#2E7D32',
  transition: 'all 0.3s ease',
},
stepInactive: {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.3rem',
  color: '#9CA3AF',
  transition: 'all 0.3s ease',
},
stepDot: {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: 'currentColor',
},
stepLabel: {
  fontSize: '0.7rem',
  fontWeight: '500',
  textAlign: 'center',
},
wrapper: {
  minHeight: "100vh",
  position: "relative",
  paddingTop: "120px", 
  paddingBottom: "40px",
  fontFamily: "'Montserrat', sans-serif",
  backgroundImage: `url(${welcome})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  animation: "bgFlow 20s ease-in-out infinite alternate",
},
};