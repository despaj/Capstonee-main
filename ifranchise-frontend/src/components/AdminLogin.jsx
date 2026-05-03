
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import welcome from "../assets/welcomepage.png";
import LandingPage from "./LandingPage";
import AdminDashboard from "./AdminDashboard";
import StaffDashboard from "./StaffDashboard";
import FranchiseeDashboard from "./FranchiseeDashboard";
import FranchisorDashboard from "./FranchisorDashboard";
import ManagerDashboard from "./ManagerDashboard";
import { Eye, EyeOff, CheckCircle } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const [step, setStep] = useState("login");


  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpEmail, setOtpEmail] = useState("");
  const otpRefs = useRef([]);

  // Forgot Password states
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetOtp, setResetOtp] = useState(["", "", "", "", "", ""]);
  const resetOtpRefs = useRef([]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [showSplash, setShowSplash] = useState(true);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(null);
  const MAX_ATTEMPTS = 2;
  const LOCKOUT_DURATIONS = [2 * 60 * 1000, 5 * 60 * 1000, 15 * 60 * 1000, 45 * 60 * 1000];
  const [lockoutLevel, setLockoutLevel] = useState(0);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Remember Me
  const [rememberMe, setRememberMe] = useState(false);

  // OTP max attempts
  const OTP_MAX_ATTEMPTS = 5;
  const OTP_LOCKOUT_DURATION = 2 * 60 * 60 * 1000; // 2 hours
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [otpLockedUntil, setOtpLockedUntil] = useState(null);
  const [otpLockRemaining, setOtpLockRemaining] = useState("");

  // ===== CHECK FOR EXISTING SESSION ON MOUNT =====
  useEffect(() => {
    const checkExistingSession = () => {
      const storedUser = localStorage.getItem("rememberedUser") || sessionStorage.getItem("user");

      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user && user.role) {
            setLoggedIn(true);
            setUserRole(user.role);
          }
        } catch (err) {
          console.error("Error parsing stored user:", err);
          localStorage.removeItem("rememberedUser");
          sessionStorage.removeItem("user");
        }
      }
      setIsCheckingSession(false);
    };
    checkExistingSession();
  }, []);

  useEffect(() => {
    if (!email) return;
    const lockoutKey = `loginLockout_${email.toLowerCase()}`;
    const attemptsKey = `loginAttempts_${email.toLowerCase()}`;
    const levelKey = `lockoutLevel_${email.toLowerCase()}`;
    const storedLockoutTime = localStorage.getItem(lockoutKey);
    const storedAttempts = localStorage.getItem(attemptsKey);
    const storedLevel = localStorage.getItem(levelKey);

    if (storedLockoutTime) {
      const lockTime = parseInt(storedLockoutTime);
      if (Date.now() < lockTime) {
        setIsLocked(true);
        setLockoutTime(lockTime);
        setLoginAttempts(MAX_ATTEMPTS);
        setLockoutLevel(parseInt(storedLevel) || 0);
      } else {
        localStorage.removeItem(lockoutKey);
        localStorage.removeItem(attemptsKey);
        setIsLocked(false);
        setLoginAttempts(0);
      }
    } else if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts));
      setLockoutLevel(parseInt(storedLevel) || 0);
    } else {
      setLoginAttempts(0);
      setIsLocked(false);
      setLockoutLevel(parseInt(storedLevel) || 0);
    }
  }, [email]);

  // Splash timer
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Lockout timer
  useEffect(() => {
    if (isLocked && lockoutTime && email) {
      const interval = setInterval(() => {
        if (Date.now() >= lockoutTime) {
          setIsLocked(false);
          setLockoutTime(null);
          setLoginAttempts(0);
          const lockoutKey = `loginLockout_${email.toLowerCase()}`;
          const attemptsKey = `loginAttempts_${email.toLowerCase()}`;
          localStorage.removeItem(lockoutKey);
          localStorage.removeItem(attemptsKey);
          setAuthError("");
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isLocked, lockoutTime, email]);

  // OTP lock countdown
  useEffect(() => {
    if (!otpLockedUntil) return;
    const interval = setInterval(() => {
      const remaining = otpLockedUntil - Date.now();
      if (remaining <= 0) {
        setOtpLockedUntil(null);
        setOtpAttempts(0);
        setOtpLockRemaining("");
        clearInterval(interval);
      } else {
        const h = Math.floor(remaining / 3600000);
        const m = Math.floor((remaining % 3600000) / 60000);
        const s = Math.floor((remaining % 60000) / 1000);
        setOtpLockRemaining(
          `${h > 0 ? h + "h " : ""}${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [otpLockedUntil]);

  const getRemainingLockoutTime = () => {
    if (!lockoutTime) return "";
    const remaining = lockoutTime - Date.now();
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    let interval;
    if (resendDisabled && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setResendDisabled(false);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendDisabled, resendTimer]);

  // ===== OTP input handlers =====
  const handleOtpChange = (index, value, otpArray, setOtpArray, refs) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpArray];
    newOtp[index] = value.slice(-1);
    setOtpArray(newOtp);
    if (value && index < 5) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e, otpArray, setOtpArray, refs) => {
    if (e.key === "Backspace" && !otpArray[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) refs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e, setOtpArray, refs) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtpArray(pasted.split(""));
      refs.current[5]?.focus();
    }
  };

  // Prevent copy/paste on password fields
  const preventCopyPaste = (e) => {
    e.preventDefault();
    return false;
  };

  // ===== Login =====
  const login = async () => {
    if (isLocked) {
      setAuthError(`Account locked. Try again in ${getRemainingLockoutTime()}`);
      return;
    }
    setAuthError("");
    setOtpError("");
    let newErrors = {};
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Client": "web",
        },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        incrementAttempts();
        setAuthError(data.message || "Invalid credentials");
        return;
      }

      if (data.success) {
        const attemptsKey = `loginAttempts_${email.toLowerCase()}`;
        const lockoutKey = `loginLockout_${email.toLowerCase()}`;
        setLoginAttempts(0);
        localStorage.removeItem(attemptsKey);
        localStorage.removeItem(lockoutKey);

        if (data.skipOtp && rememberMe) {
          // Remember me: persist in localStorage for 30 days
          const userWithExpiry = {
            ...data.user,
            rememberExpiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
          };
          localStorage.setItem("rememberedUser", JSON.stringify(userWithExpiry));
          setLoggedIn(true);
          setUserRole(data.user.role);
        } else if (data.skipOtp && !rememberMe) {
          // No remember me: use sessionStorage
          localStorage.setItem("user", JSON.stringify(data.user)); // not sessionStorage
          setLoggedIn(true);
          setUserRole(data.user.role)
        } else {
          setOtpEmail(email.trim());
          sessionStorage.setItem("tempUser", JSON.stringify(data.user));
          setStep("emailPrompt");
        }
      }
    } catch (err) {
      console.error(err);
      setAuthError("Connection error. Please try again.");
    }
  };

  const incrementAttempts = () => {
    const newAttemptCount = loginAttempts + 1;
    setLoginAttempts(newAttemptCount);
    const attemptsKey = `loginAttempts_${email.toLowerCase()}`;
    localStorage.setItem(attemptsKey, newAttemptCount.toString());

    if (newAttemptCount >= MAX_ATTEMPTS) {
      const currentLevel = Math.min(lockoutLevel, LOCKOUT_DURATIONS.length - 1);
      const lockDuration = LOCKOUT_DURATIONS[currentLevel];
      const lockTime = Date.now() + lockDuration;
      setIsLocked(true);
      setLockoutTime(lockTime);
      const lockoutKey = `loginLockout_${email.toLowerCase()}`;
      const levelKey = `lockoutLevel_${email.toLowerCase()}`;
      localStorage.setItem(lockoutKey, lockTime.toString());
      const nextLevel = Math.min(currentLevel + 1, LOCKOUT_DURATIONS.length - 1);
      localStorage.setItem(levelKey, nextLevel.toString());
      setLockoutLevel(nextLevel);
      const minutes = Math.floor(lockDuration / 60000);
      setAuthError(`Too many failed attempts. Account locked for ${minutes} minute${minutes !== 1 ? "s" : ""}.`);
    } else {
      const remainingAttempts = MAX_ATTEMPTS - newAttemptCount;
      setAuthError(`Invalid credentials. ${remainingAttempts} attempt${remainingAttempts !== 1 ? "s" : ""} remaining.`);
    }
  };

  // ===== Send OTP =====
  const sendOtp = async () => {
    setOtpError("");
    if (!otpEmail) {
      setErrors({ ...errors, otpEmail: "Email is required" });
      return;
    }
    setStep("otp");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/send-otp-after-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail.trim() }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) return setOtpError(data.message || "Failed to send OTP");
    } catch (err) {
      console.error(err);
      setOtpError("Failed to send OTP. Try again.");
    }
  };

  // ===== Verify OTP =====
  const verifyOtp = async () => {
    setOtpError("");

    // Check OTP lockout
    if (otpLockedUntil && Date.now() < otpLockedUntil) {
      setOtpError(`Too many attempts. Try again in ${otpLockRemaining}.`);
      return;
    }

    const otpValue = otp.join("");
    if (!otpValue || otpValue.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/verify-otp-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail.trim(), otp: otpValue }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        const newAttempts = otpAttempts + 1;
        setOtpAttempts(newAttempts);
        if (newAttempts >= OTP_MAX_ATTEMPTS) {
          const lockUntil = Date.now() + OTP_LOCKOUT_DURATION;
          setOtpLockedUntil(lockUntil);
          setOtpError("Maximum OTP attempts reached. You are locked out for 2 hours. Password reset is also disabled.");
        } else {
          setOtpError(`Invalid OTP. ${OTP_MAX_ATTEMPTS - newAttempts} attempt(s) remaining.`);
        }
        return;
      }
      // Success — reset OTP attempt count
      setOtpAttempts(0);
      setOtpLockedUntil(null);

      const user = data.user;
      if (rememberMe) {
        const userWithExpiry = { ...user, rememberExpiry: Date.now() + 30 * 24 * 60 * 60 * 1000 };
        localStorage.setItem("rememberedUser", JSON.stringify(userWithExpiry));
      } else {
       localStorage.setItem("user", JSON.stringify(user)); 
      }
      sessionStorage.removeItem("tempUser");
      setLoggedIn(true);
      setUserRole(user.role);
    } catch (err) {
      console.error(err);
      setOtpError("OTP verification failed");
    }
  };

  // FORGOT PASSWORD: Send OTP
  const sendForgotPasswordOtp = async () => {
    setForgotError("");

    // Block if OTP locked
    if (otpLockedUntil && Date.now() < otpLockedUntil) {
      setForgotError(`You are currently locked out. Try again in ${otpLockRemaining}.`);
      return;
    }

    if (!forgotEmail) {
      setForgotError("Please enter your email address");
      return;
    }
    setStep("forgotPasswordOtp");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/send-forgot-password-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.message || "Failed to send OTP");
        return;
      }
    } catch (err) {
      console.error(err);
      setForgotError("Failed to send OTP. Please try again.");
    }
  };

  const validatePasswordStrength = (password) => {
    const errors = [];
    if (password.length < 8) errors.push("minLength");
    if (!/[A-Z]/.test(password)) errors.push("uppercase");
    if (!/[a-z]/.test(password)) errors.push("lowercase");
    if (!/\d/.test(password)) errors.push("number");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push("specialChar");
    return { isValid: errors.length === 0, errors };
  };

  // ===== FORGOT PASSWORD: Verify OTP and Reset Password =====
  const resetPassword = async () => {
    setForgotError("");

    // Block if OTP locked
    if (otpLockedUntil && Date.now() < otpLockedUntil) {
      setForgotError(`You are locked out. Password reset is disabled. Try again in ${otpLockRemaining}.`);
      return;
    }

    const resetOtpValue = resetOtp.join("");
    if (!resetOtpValue || resetOtpValue.length !== 6) {
      setForgotError("Please enter a valid 6-digit OTP");
      return;
    }
    if (!newPassword) {
      setForgotError("Please enter a new password");
      return;
    }
    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.isValid) {
      const messages = {
        minLength: " at least 8 characters",
        uppercase: " at least 1 uppercase letter",
        lowercase: " at least 1 lowercase letter",
        number: " at least 1 number",
        specialChar: " at least 1 special character",
      };
      setForgotError("Password must contain" + passwordCheck.errors.map((e) => messages[e]).join("\n"));
      return;
    }
    if (newPassword === password) {
      setForgotError("New password must be different from your current password");
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim(), otp: resetOtpValue, newPassword }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.message || "Failed to reset password");
        return;
      }
      setStep("resetDone");
    } catch (err) {
      console.error(err);
      setForgotError("Incorrect OTP. Please try again.");
    }
  };

  // ===== Logout =====
  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      try {
        await fetch(`${process.env.REACT_APP_API_URL}/logout`, { method: "POST", credentials: "include" });
      } catch (err) {
        console.error("Logout error:", err);
      }
      localStorage.removeItem("rememberedUser");
      localStorage.removeItem("user");   
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("tempUser");
      setLoggedIn(false);
      setUserRole(null);
      setStep("login");
      setEmail("");
      setPassword("");
      setOtp(["", "", "", "", "", ""]);
      setOtpEmail("");
    }
  };

  if (isCheckingSession) {
    return (
      <div className="splash">
        <img src={logo} alt="logo" className="splash-logo" />
        <style>{styles(welcome)}</style>
      </div>
    );
  }

  if (loggedIn && userRole) {
    switch (userRole) {
      case "Administrator": return <AdminDashboard onLogout={handleLogout} />;
      case "Franchisee": return <FranchiseeDashboard onLogout={handleLogout} />;
      case "Franchisor": return <FranchisorDashboard onLogout={handleLogout} />;
      case "Manager": return <ManagerDashboard onLogout={handleLogout} />;
      case "Staff": return <StaffDashboard onLogout={handleLogout} />;
      default:
        return (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <h2>Unknown Role: {userRole}</h2>
            <p>Your role is not recognized in the system.</p>
            <button
              style={{ padding: "10px 20px", background: "#2E7D32", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", marginTop: "1rem" }}
              onClick={() => { localStorage.removeItem("rememberedUser");  localStorage.removeItem("user");   sessionStorage.removeItem("user"); setLoggedIn(false); setUserRole(null); }}
            >
              Back to Login
            </button>
          </div>
        );
    }
  }

  if (showSplash) {
    return (
      <div className="splash">
        <img src={logo} alt="logo" className="splash-logo" />
        <style>{styles(welcome)}</style>
      </div>
    );
  }

  const otpIsLocked = otpLockedUntil && Date.now() < otpLockedUntil;

  // Step indicator helper
  const getStepIndex = () => {
    if (step === "emailPrompt") return 0;
    if (step === "otp") return 1;
    return -1;
  };
  const getForgotStepIndex = () => {
    if (step === "forgotPassword") return 0;
    if (step === "forgotPasswordOtp") return 1;
    if (step === "resetDone") return 2;
    return -1;
  };
//wonwoo
  return (
    <div className="page">
       <img src={logo} alt="logo" className="logo" />
      <div className="card">

       {step !== "login" && step !== "resetDone" && (
  <button
    type="button"
    className="back-btn"
    onClick={(e) => {
      e.preventDefault();

      if (step === "otp") {
        setStep("emailPrompt");
        setOtp(["","","","","",""]);
        setOtpError("");
      } 
      else if (step === "emailPrompt") {
        setStep("login");
        setOtpEmail("");
        setOtpError("");
      } 
      else if (step === "forgotPassword") {
        setStep("login");
        setForgotEmail("");
        setForgotError("");
      } 
      else if (step === "forgotPasswordOtp") {
        setStep("forgotPassword");
        setResetOtp(["","","","","",""]);
        setNewPassword("");
        setConfirmPassword("");
        setForgotError("");
      }
    }}
  >
    ← Back
  </button>
)}


        {/* ── LOGIN ── */}
        {step === "login" && (
          <>
           
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap" rel="stylesheet"></link>
            <h2 style={{ fontSize: "23px", color: "#0a8d1c", fontFamily: "Montserrat", fontWeight: 700, marginTop: 20}}>
  LOGIN
</h2>
<p className="login-subtext">Enter your credentials below</p>
            {authError && <p className="error general">{authError}</p>}
            <div className="input-container">
              <input
                placeholder="Email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: "", general: "" }); setAuthError(""); }}
                onKeyPress={(e) => e.key === "Enter" && login()}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            <div className="input-container">
              <div className="password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: "", general: "" }); setAuthError(""); }}
                  onKeyPress={(e) => e.key === "Enter" && login()}
                  onCopy={preventCopyPaste}
                  onPaste={preventCopyPaste}
                  onCut={preventCopyPaste}
                  className="password-input"
                />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
              <button className="forgot-link" onClick={() => { setForgotEmail(email.trim()); setStep("forgotPassword"); }}>
                Forgot Password?
              </button>
            </div>

            {/* Remember Me */}
            <div className="remember-wrap">
              <label className="remember-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="remember-checkbox"
                />
                <span className="remember-text">Remember me for 30 days</span>
              </label>
            </div>

            <button className="btn" onClick={login}>LOGIN</button>
          </>
        )}

        {/* ── FORGOT PASSWORD: Email Step ── */}
        {step === "forgotPassword" && (
          <>
            {/* Step progress */}
            <div className="step-progress">
              {["Email", "Reset", "Done"].map((label, i) => (
                <React.Fragment key={label}>
                  <div className="step-item">
                    <div className={`step-circle ${getForgotStepIndex() >= i ? "step-active" : ""} ${getForgotStepIndex() > i ? "step-done" : ""}`}>
                      {getForgotStepIndex() > i ? "✓" : i + 1}
                    </div>
                    <span className={`step-label ${getForgotStepIndex() >= i ? "step-label-active" : ""}`}>{label}</span>
                  </div>
                  {i < 2 && <div className={`step-line ${getForgotStepIndex() > i ? "step-line-active" : ""}`} />}
                </React.Fragment>
              ))}
            </div>

          <h2 style={{ fontSize: "23px", color: "#0a8d1c", fontFamily: "Montserrat", fontWeight: 700, marginTop: 20}}>
  Forgot Password
</h2>
            <p className="step-subtitle">OTP has been sent to your email</p>

            {otpIsLocked && (
              <div className="error general locked-banner">
                 Account locked due to too many OTP attempts. Password reset is disabled.<br />
                Try again in <strong>{otpLockRemaining}</strong>.
              </div>
            )}

            {forgotError && !otpIsLocked && <p className="error general">{forgotError}</p>}

            <div className="input-container">
              <input
                type="email"
                value={forgotEmail}
                placeholder={forgotEmail || "Email"}
                disabled
                style={{ backgroundColor: "#f5f5f5", color: "#888", cursor: "not-allowed" }}
              />
            </div>

            <button
              className={`btn yellow ${otpIsLocked ? "btn-disabled" : ""}`}
              onClick={!otpIsLocked ? sendForgotPasswordOtp : undefined}
              disabled={!!otpIsLocked}
            >
              SEND OTP
            </button>
          </>
        )}

        {/* ── FORGOT PASSWORD: OTP + Reset Step ── */}
        {step === "forgotPasswordOtp" && (
          <>
            <div className="step-progress">
              {["Email", "Reset", "Done"].map((label, i) => (
                <React.Fragment key={label}>
                  <div className="step-item">
                    <div className={`step-circle ${getForgotStepIndex() >= i ? "step-active" : ""} ${getForgotStepIndex() > i ? "step-done" : ""}`}>
                      {getForgotStepIndex() > i ? "✓" : i + 1}
                    </div>
                    <span className={`step-label ${getForgotStepIndex() >= i ? "step-label-active" : ""}`}>{label}</span>
                  </div>
                  {i < 2 && <div className={`step-line ${getForgotStepIndex() > i ? "step-line-active" : ""}`} />}
                </React.Fragment>
              ))}
            </div>

            <h2>Reset Password</h2>
            <p className="step-subtitle">OTP sent to: <strong style={{ color: "#2E7D32" }}>{forgotEmail}</strong></p>

            {otpIsLocked && (
              <div className="error general locked-banner">
                🔒 Too many OTP attempts. Password reset disabled for <strong>{otpLockRemaining}</strong>.
              </div>
            )}
            {forgotError && !otpIsLocked && <p className="error general" style={{ whiteSpace: "pre-line" }}>{forgotError}</p>}

            {/* OTP Boxes */}
            <div className="otp-box-wrap">
              {resetOtp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (resetOtpRefs.current[i] = el)}
                  className="otp-box"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value, resetOtp, setResetOtp, resetOtpRefs)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e, resetOtp, setResetOtp, resetOtpRefs)}
                  onPaste={(e) => handleOtpPaste(e, setResetOtp, resetOtpRefs)}
                  disabled={!!otpIsLocked}
                />
              ))}
            </div>

            <div className="input-container">
              <div className="password-wrap">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNewPassword(v);
                    setForgotError("");
                    if (v) { setShowPasswordValidation(true); setPasswordErrors(validatePasswordStrength(v).errors); }
                    else { setShowPasswordValidation(false); setPasswordErrors([]); }
                  }}
                  onCopy={preventCopyPaste}
                  onPaste={preventCopyPaste}
                  onCut={preventCopyPaste}
                  className="password-input"
                  disabled={!!otpIsLocked}
                />
                <button type="button" className="eye-btn" onClick={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ?   <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {showPasswordValidation && (
                <div className="pw-checklist">
                  <div className="pw-checklist-title">Password must contain:</div>
                  {[
                    { key: "minLength", label: "At least 8 characters" },
                    { key: "uppercase", label: "At least one uppercase letter (A-Z)" },
                    { key: "lowercase", label: "At least one lowercase letter (a-z)" },
                    { key: "number", label: "At least one number (0-9)" },
                    { key: "specialChar", label: "At least one special character (!@#$%^&*...)" },
                  ].map(({ key, label }) => (
                    <div key={key} className={`pw-check-row ${!passwordErrors.includes(key) ? "pw-check-pass" : "pw-check-fail"}`}>
                      {passwordErrors.includes(key) ? "✗" : "✓"} {label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="input-container">
              <div className="password-wrap">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setForgotError(""); }}
                  onCopy={preventCopyPaste}
                  onPaste={preventCopyPaste}
                  onCut={preventCopyPaste}
                  onKeyPress={(e) => e.key === "Enter" && resetPassword()}
                  className="password-input"
                  disabled={!!otpIsLocked}
                />
                <button type="button" className="eye-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ?<EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              className={`btn yellow ${otpIsLocked ? "btn-disabled" : ""}`}
              onClick={!otpIsLocked ? resetPassword : undefined}
              disabled={!!otpIsLocked}
            >
              RESET PASSWORD
            </button>

            <button
              className="link-resend"
              onClick={async () => {
                if (resendDisabled || otpIsLocked) return;
                setForgotError("");
                try {
                  setResendDisabled(true);
                  setResendTimer(30);
                  const res = await fetch(`${process.env.REACT_APP_API_URL}/send-forgot-password-otp`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: forgotEmail }),
                    credentials: "include",
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.message || "Failed to resend OTP");
                  alert("OTP resent successfully");
                } catch (err) {
                  setForgotError("Failed to resend OTP. Try again.");
                  setResendDisabled(false);
                }
              }}
              disabled={resendDisabled || !!otpIsLocked}
            >
              {resendDisabled ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
            </button>
          </>
        )}

        {/* ── FORGOT PASSWORD: Done ── */}
        {step === "resetDone" && (
          <>
            <div className="done-wrap">
              <div className="done-icon">  <CheckCircle size={60} color="#2E7D32" /></div>
              <h2>Password Reset!</h2>
              <p className="step-subtitle">Your password has been updated successfully. You can now log in with your new password.</p>
              <button className="btn" onClick={() => {
                setForgotEmail(""); setResetOtp(["","","","","",""]); setNewPassword(""); setConfirmPassword("");
                setForgotError(""); setStep("login");
              }}>
                BACK TO LOGIN
              </button>
            </div>
          </>
        )}

        {/* ── EMAIL PROMPT (OTP confirm) ── */}
        {step === "emailPrompt" && (
          <>
            {/* Step progress */}
            <div className="step-progress">
              {["Confirm", "Verify", "Done"].map((label, i) => (
                <React.Fragment key={label}>
                  <div className="step-item">
                    <div className={`step-circle ${getStepIndex() >= i ? "step-active" : ""} ${getStepIndex() > i ? "step-done" : ""}`}>
                      {getStepIndex() > i ? "✓" : i + 1}
                    </div>
                    <span className={`step-label ${getStepIndex() >= i ? "step-label-active" : ""}`}>{label}</span>
                  </div>
                  {i < 2 && <div className={`step-line ${getStepIndex() > i ? "step-line-active" : ""}`} />}
                </React.Fragment>
              ))}
            </div>

            <h2>Confirm Email for OTP</h2>
            <p className="step-subtitle">OTP will be sent to this email.</p>
            {otpError && <p className="error general">{otpError}</p>}
            <div className="input-container">
              <input
                placeholder="Email for OTP"
                value={otpEmail}
                disabled
                style={{ backgroundColor: "#f5f5f5", color: "#888", cursor: "not-allowed" }}
              />
            </div>
            <button className="btn yellow" onClick={sendOtp}>SEND OTP</button>
            <button className="link-small" onClick={() => setStep("login")}>Back to Login</button>
          </>
        )}

        {/* ── OTP VERIFY ── */}
        {step === "otp" && (
          <>
            <div className="step-progress">
              {["Confirm", "Verify", "Done"].map((label, i) => (
                <React.Fragment key={label}>
                  <div className="step-item">
                    <div className={`step-circle ${getStepIndex() >= i ? "step-active" : ""} ${getStepIndex() > i ? "step-done" : ""}`}>
                      {getStepIndex() > i ? "✓" : i + 1}
                    </div>
                    <span className={`step-label ${getStepIndex() >= i ? "step-label-active" : ""}`}>{label}</span>
                  </div>
                  {i < 2 && <div className={`step-line ${getStepIndex() > i ? "step-line-active" : ""}`} />}
                </React.Fragment>
              ))}
            </div>

            <h2>Enter OTP</h2>
            <p className="step-subtitle">
              We sent a 6-digit code to: <strong style={{ color: "#2E7D32" }}>{otpEmail}</strong>
            </p>

            {otpIsLocked && (
              <div className="error general locked-banner">
                Too many failed attempts. Locked for <strong>{otpLockRemaining}</strong>.
              </div>
            )}
            {otpError && !otpIsLocked && <p className="error general">{otpError}</p>}

            {/* OTP Attempt indicator */}
            {!otpIsLocked && otpAttempts > 0 && (
              <p className="otp-attempts-left">
                {OTP_MAX_ATTEMPTS - otpAttempts} attempt{OTP_MAX_ATTEMPTS - otpAttempts !== 1 ? "s" : ""} remaining
              </p>
            )}

            {/* OTP Boxes */}
            <div className="otp-box-wrap">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  className={`otp-box ${otpIsLocked ? "otp-box-locked" : ""}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value, otp, setOtp, otpRefs)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e, otp, setOtp, otpRefs)}
                  onPaste={(e) => handleOtpPaste(e, setOtp, otpRefs)}
                  disabled={!!otpIsLocked}
                />
              ))}
            </div>

            <button
              className={`btn yellow ${otpIsLocked ? "btn-disabled" : ""}`}
              onClick={!otpIsLocked ? verifyOtp : undefined}
              disabled={!!otpIsLocked}
            >
              VERIFY OTP
            </button>

            <button
              className="link-resend"
              onClick={async () => {
                if (resendDisabled || otpIsLocked) return;
                setOtpError("");
                try {
                  setResendDisabled(true);
                  setResendTimer(30);
                  const res = await fetch(`${process.env.REACT_APP_API_URL}/send-otp-after-login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: otpEmail }),
                    credentials: "include",
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.message || "Failed to resend OTP");
                } catch (err) {
                  setOtpError("Failed to resend OTP. Try again.");
                  setResendDisabled(false);
                }
              }}
              disabled={resendDisabled || !!otpIsLocked}
            >
              {resendDisabled ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
            </button>
          </>
        )}
      </div>

      <style>{styles(welcome)}</style>
    </div>
  );
}

const styles = (bgImage) => `
* { box-sizing: border-box; font-family: 'Montserrat', sans-serif; }

.splash { min-height:100vh; display:flex; justify-content:center; align-items:center; background-image: linear-gradient(rgba(255,255,255,0.78), rgba(211,255,201,0.78)), url(${bgImage}); background-size:cover; }
.splash-logo { width:300px; animation: zoom 3s ease forwards; }
@keyframes zoom { from { transform: scale(.3); opacity:0 } to { transform: scale(1); opacity:1 } }

.page {
  min-height: 100vh;  
  display: flex;
  flex-direction: column;     /* stack logo + card */
  align-items: center;        /* center horizontally */
  justify-content: flex-start;/* push content to TOP */
  padding: 40px 20px 20px;
  background-image: linear-gradient(rgba(255,255,255,0.78), rgba(211,255,201,0.78)), url(${bgImage});
  background-size: cover;
}

.card { background: rgba(255,255,255,0.96); width:100%; max-width:400px; padding:36px 30px 30px; border-radius:20px; box-shadow:0 10px 30px rgba(0,0,0,.1); text-align:center; position:relative; }
.logo {
  width: 200px;
  height: auto;
  margin-top:100px;
  margin-bottom: 20px;
}

h2 { margin: 12px 0 4px; color: #1a1a1a; font-size: 22px; }
p { color: #555; font-size: 13px; margin-bottom: 16px; }
.step-subtitle { color: #555; font-size: 13px; margin-bottom: 24px; margin-top:2px; }

.input-container { margin-bottom:18px; position:relative; width:100%; text-align:left; }
input[type="text"], input[type="email"], input[type="password"], input:not([type]) {
  width:100%; padding:13px 14px; border-radius:12px; border:1.5px solid #c8e6c9; outline:none;
  font-size:14px; background:#fafafa; transition: border-color 0.2s;
}
input:focus { border-color: #2E7D32; background: #fff; }
input:disabled { background: #f5f5f5; color: #888; cursor: not-allowed; }

.password-wrap { position: relative; display: flex; align-items: center; }
.password-wrap input.password-input { width:100%; padding-right:42px; }
.eye-btn {
  position: absolute; right: 12px; background: none; border: none;
  cursor: pointer; font-size: 16px; padding: 0; line-height:1;
  color: #777; display:flex; align-items:center;
}
.login-subtext {
  font-size: 13px;
  color: #666;
  margin-bottom: 18px;
  margin-top:0;
}
.field-error { color: #d32f2f; font-size: 11px; margin-top: 4px; display: block; }

.btn { width:100%; padding:14px; border-radius:12px; border:none; background:linear-gradient(90deg, #368f3b, #218428); color:white; font-weight:bold; cursor:pointer; font-size:14px; letter-spacing:0.5px; transition: background 0.2s; }
.btn:hover:not(:disabled) { background:linear-gradient(90deg, #246627, #2a7e30); }
.btn.yellow { background:linear-gradient(90deg, #368f3b, #218428); margin-top:8px; }
.btn.yellow:hover:not(:disabled) { background:linear-gradient(90deg, #0a4e0e, #2a7e30); }
.btn-disabled { opacity: 0.55; cursor: not-allowed !important; }

.link-small { background:none; border:none; color:#2E7D32; text-decoration:underline; font-size:12px; margin-top:10px; cursor:pointer; display:block; }
.link-small:hover { color:#1B5E20; }

.forgot-link {
  background: none; border: none; color: #2E7D32; text-decoration: underline;
  font-size: 12px; cursor: pointer; margin-top: 6px; display: block; text-align: right; width: 100%;
}
.forgot-link:hover { color:#1B5E20; }

.link-resend {
  background: none; border: none; color: #2E7D32; text-decoration: underline;
  font-size: 12px; margin-top: 12px; cursor: pointer; display: block; transition: color 0.2s;
}
.link-resend:hover:not(:disabled) { color: #1b5e20; }
.link-resend:disabled { color: #999; cursor: not-allowed; text-decoration: none; }

.error.general {
  color:#d32f2f; font-size:12px; margin-bottom:14px; padding:10px 12px;
  background:#ffebee; border-radius:10px; text-align:center; line-height: 1.5;
}
.locked-banner { border-left: 3px solid #d32f2f; }

.back-btn {
  position: absolute; top: 15px; left: 15px; background: none; border: none;
  color: #2E7D32; font-weight: bold; cursor: pointer; font-size: 13px;
}
.back-btn:hover { text-decoration: underline; }


/* ── Remember Me ── */
.remember-wrap { display: flex; justify-content: flex-start; margin-bottom: 16px; margin-top: -6px; }
.remember-label { display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
.remember-checkbox { width: 16px; height: 16px; accent-color: #2E7D32; cursor: pointer; }
.remember-text { font-size: 12px; color: #555; }

/* ── Step Progress ── */
.step-progress {
  display: flex; align-items: center; justify-content: center;
  margin: 8px 0 22px; gap: 0;
}
.step-item { display: flex; flex-direction: column; align-items: center; gap: 5px; }
.step-circle {
  width: 30px; height: 30px; border-radius: 50%; background: #e0e0e0;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: #fff;
  transition: background 0.3s;
}
.step-active { background: #2E7D32 !important; }
.step-done { background: #66bb6a !important; }
.step-label { font-size: 10px; color: #aaa; font-weight: 600; letter-spacing: 0.3px; }
.step-label-active { color: #2E7D32; }
.step-line { width: 36px; height: 2px; background: #e0e0e0; margin: 0 4px; margin-bottom: 18px; transition: background 0.3s; }
.step-line-active { background: #66bb6a; }

/* ── OTP Boxes ── */
.otp-box-wrap {
  display: flex; gap: 10px; justify-content: center; margin-bottom: 18px; margin-top: 6px;
}
.otp-box {
  width: 46px !important; height: 52px; text-align: center; font-size: 22px; font-weight: 700;
  border: 2px solid #c8e6c9; border-radius: 12px; background: #fafafa;
  outline: none; transition: border-color 0.2s, background 0.2s; color: #2E7D32;
  padding: 0 !important; caret-color: #2E7D32;
}
.otp-box:focus { border-color: #2E7D32; background: #f0fdf4; }
.otp-box:not(:placeholder-shown) { border-color: #43a047; }
.otp-box-locked { opacity: 0.45; pointer-events: none; }

.otp-attempts-left {
  font-size: 12px; color: #e65100; margin: -10px 0 12px;
  font-weight: 600; text-align: center;
}

/* ── Password Checklist ── */
.pw-checklist {
  margin-top: 8px; font-size: 12px; padding: 10px 12px;
  background: #f8fdf5; border-radius: 8px; border: 1px solid #c8e6c9; text-align: left;
}
.pw-checklist-title { margin-bottom: 6px; font-weight: 700; color: #333; }
.pw-check-row { margin-bottom: 3px; }
.pw-check-pass { color: #2E7D32; }
.pw-check-fail { color: #d32f2f; }

/* ── Done state ── */
.done-wrap { display: flex; flex-direction: column; align-items: center; padding: 10px 0; }
.done-icon { font-size: 56px; margin-bottom: 10px; }
.done-wrap h2 { margin-bottom: 8px; }
.done-wrap p { max-width: 280px; }
`;