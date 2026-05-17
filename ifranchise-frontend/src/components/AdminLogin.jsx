import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import welcome from "../assets/welcomepage.png";
import AdminDashboard from "./AdminDashboard";
import StaffDashboard from "./StaffDashboard";
import FranchiseeDashboard from "./FranchiseeDashboard";
import FranchisorDashboard from "./FranchisorDashboard";
import ManagerDashboard from "./ManagerDashboard";
import { Eye, EyeOff, CheckCircle } from "lucide-react";

  const OtpEntryBlock = ({ otpArr, setOtpArr, refs, isLocked, lockRemaining, error, attempts, onVerify, resendEndpoint, resendBody, verifyLabel = "CONTINUE", loading, loadingKey, resendKey, showSmsSwitch, onSwitchMethod, extraButton,
    // pass these as props since they're no longer in scope:
    handleOtpChange, handleOtpKeyDown, handleOtpPaste, setResendDisabled, setResendTimer, setLoading, resendDisabled, resendTimer, OTP_MAX_ATTEMPTS
  }) => {

    const hasFocused = useRef(false);

    useEffect(() => {
  if (!hasFocused.current) {
    hasFocused.current = true;
    setTimeout(() => refs.current[0]?.focus(), 300);
  }
}, []);

    return (
      <>
        {isLocked && <div className="error general locked-banner">Too many attempts. Locked for <strong>{lockRemaining}</strong>.</div>}
        {error && !isLocked && <p className="error general">{error}</p>}
        {!isLocked && attempts > 0 && (
          <p className="otp-attempts-left">{OTP_MAX_ATTEMPTS - attempts} attempt{OTP_MAX_ATTEMPTS - attempts !== 1 ? "s" : ""} remaining</p>
        )}
        <div className="otp-box-wrap">
          {otpArr.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              className={`otp-box ${isLocked ? "otp-box-locked" : ""}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value, otpArr, setOtpArr, refs)}
              onKeyDown={(e) => handleOtpKeyDown(i, e, otpArr, setOtpArr, refs)}
              onPaste={(e) => handleOtpPaste(e, setOtpArr, refs)}
              onClick={() => refs.current[i]?.focus()}
              disabled={!!isLocked}
            />
          ))}
        </div>
        <button className={`btn yellow ${isLocked ? "btn-disabled" : ""}`}
          onClick={!isLocked ? onVerify : undefined}
          disabled={!!isLocked || !!loading}>
          {loading === loadingKey
            ? <><span className="sms-spinner" /> Verifying...</>
            : verifyLabel}
        </button>

        {extraButton}

        <button
          className="link-resend"
          disabled={resendDisabled || !!isLocked || loading === resendKey}
          onClick={async () => {
            if (resendDisabled || isLocked) return;
            setResendDisabled(true);
            setResendTimer(30);
            setLoading(resendKey);
            try {
              const res = await fetch(`${process.env.REACT_APP_API_URL}${resendEndpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(resendBody),
                credentials: "include",
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.message);
              setTimeout(() => refs.current[0]?.focus(), 150);
            } catch {
              setResendDisabled(false);
            } finally {
              setLoading("");
            }
          }}
        >
          {loading === resendKey
            ? <><span className="sms-spinner" /> Sending...</>
            : resendDisabled
            ? `Resend OTP in ${resendTimer}s`
            : "Resend OTP"}
        </button>
        
      </>
    );
  };

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState("");

  const [step, setStep] = useState("login");

  // Login OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpEmail, setOtpEmail] = useState("");
  const otpRefs = useRef([]);
  const [otpMethod, setOtpMethod] = useState("email"); // email | sms
  const [maskedOtpPhone, setMaskedOtpPhone] = useState("");

  // Forgot Password
  const [forgotEmail, setForgotEmail] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [isFetchingPhone, setIsFetchingPhone] = useState(false);
  const [choiceError, setChoiceError] = useState("");

  // Shared forgot OTP state (email or sms path)
  const [forgotOtp, setForgotOtp] = useState(["", "", "", "", "", ""]);
  const forgotOtpRefs = useRef([]);
  const [forgotOtpMethod, setForgotOtpMethod] = useState(""); // "email" | "sms"
  const [forgotOtpError, setForgotOtpError] = useState("");

  // Reset form
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");

  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [otpError, setOtpError] = useState("");

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

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);

  const OTP_MAX_ATTEMPTS = 5;
  const OTP_LOCKOUT_DURATION = 2 * 60 * 60 * 1000;

  // Login OTP lockout
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [otpLockedUntil, setOtpLockedUntil] = useState(null);
  const [otpLockRemaining, setOtpLockRemaining] = useState("");

  // Forgot OTP lockout (separate)
  const [forgotOtpAttempts, setForgotOtpAttempts] = useState(0);
  const [forgotOtpLockedUntil, setForgotOtpLockedUntil] = useState(null);
  const [forgotOtpLockRemaining, setForgotOtpLockRemaining] = useState("");

  // ── Session check ──
  useEffect(() => {
  // ✅ Check localStorage first (Remember Me), then sessionStorage (tab session)
  const stored = localStorage.getItem("user") || sessionStorage.getItem("user");

  if (stored) {
    try {
      const user = JSON.parse(stored);
      if (user && user.role && user.sessionExpiry && Date.now() < user.sessionExpiry) {
        setLoggedIn(true);
        setUserRole(user.role);
      } else {
        // Expired — clear both
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
      }
    } catch {
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
    }
  }
  setIsCheckingSession(false);
}, []);

  // ── Login lockout from storage ──
  useEffect(() => {
    if (!email) return;
    const storedLockout = localStorage.getItem(`loginLockout_${email.toLowerCase()}`);
    const storedAttempts = localStorage.getItem(`loginAttempts_${email.toLowerCase()}`);
    const storedLevel = localStorage.getItem(`lockoutLevel_${email.toLowerCase()}`);
    if (storedLockout) {
      const lockTime = parseInt(storedLockout);
      if (Date.now() < lockTime) {
        setIsLocked(true); setLockoutTime(lockTime);
        setLoginAttempts(MAX_ATTEMPTS); setLockoutLevel(parseInt(storedLevel) || 0);
      } else {
        localStorage.removeItem(`loginLockout_${email.toLowerCase()}`);
        localStorage.removeItem(`loginAttempts_${email.toLowerCase()}`);
        setIsLocked(false); setLoginAttempts(0);
      }
    } else if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts));
      setLockoutLevel(parseInt(storedLevel) || 0);
    } else {
      setLoginAttempts(0); setIsLocked(false);
      setLockoutLevel(parseInt(storedLevel) || 0);
    }
  }, [email]);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isLocked || !lockoutTime || !email) return;
    const interval = setInterval(() => {
      if (Date.now() >= lockoutTime) {
        setIsLocked(false); setLockoutTime(null); setLoginAttempts(0);
        localStorage.removeItem(`loginLockout_${email.toLowerCase()}`);
        localStorage.removeItem(`loginAttempts_${email.toLowerCase()}`);
        setAuthError("");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isLocked, lockoutTime, email]);

  // Login OTP countdown
  useEffect(() => {
    if (!otpLockedUntil) return;
    const interval = setInterval(() => {
      const r = otpLockedUntil - Date.now();
      if (r <= 0) { setOtpLockedUntil(null); setOtpAttempts(0); setOtpLockRemaining(""); }
      else {
        const h = Math.floor(r / 3600000), m = Math.floor((r % 3600000) / 60000), s = Math.floor((r % 60000) / 1000);
        setOtpLockRemaining(`${h > 0 ? h + "h " : ""}${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [otpLockedUntil]);

  // Forgot OTP countdown
  useEffect(() => {
    if (!forgotOtpLockedUntil) return;
    const interval = setInterval(() => {
      const r = forgotOtpLockedUntil - Date.now();
      if (r <= 0) { setForgotOtpLockedUntil(null); setForgotOtpAttempts(0); setForgotOtpLockRemaining(""); }
      else {
        const h = Math.floor(r / 3600000), m = Math.floor((r % 3600000) / 60000), s = Math.floor((r % 60000) / 1000);
        setForgotOtpLockRemaining(`${h > 0 ? h + "h " : ""}${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [forgotOtpLockedUntil]);

  useEffect(() => {
    if (!resendDisabled || resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((p) => { if (p <= 1) { setResendDisabled(false); return 0; } return p - 1; });
    }, 1000);
    return () => clearInterval(interval);
  }, [resendDisabled, resendTimer]);

  const getRemainingLockoutTime = () => {
    if (!lockoutTime) return "";
    const r = lockoutTime - Date.now();
    return `${Math.floor(r / 60000)}:${String(Math.floor((r % 60000) / 1000)).padStart(2, "0")}`;
  };

  // ── OTP input handlers ──
  const handleOtpChange = (index, value, arr, setArr, refs) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const n = [...arr]; 
    n[index] = value.slice(-1); 
    setArr(n);
    if (digit && index < 5) refs.current[index + 1]?.focus(); 
  };
  const handleOtpKeyDown = (index, e, arr, setArr, refs) => {
    if (e.key === "Backspace" && !arr[index] && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) refs.current[index + 1]?.focus();
  };
  const handleOtpPaste = (e, setArr, refs) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (p.length === 6) { setArr(p.split("")); refs.current[5]?.focus(); }
  };
  const preventCopyPaste = (e) => { e.preventDefault(); return false; };

  const validatePasswordStrength = (pw) => {
    const errs = [];
    if (pw.length < 8) errs.push("minLength");
    if (!/[A-Z]/.test(pw)) errs.push("uppercase");
    if (!/[a-z]/.test(pw)) errs.push("lowercase");
    if (!/\d/.test(pw)) errs.push("number");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) errs.push("specialChar");
    return { isValid: errs.length === 0, errors: errs };
  };

  // ── Login ──
  const login = async () => {
    if (isLocked) { setAuthError(`Account locked. Try again in ${getRemainingLockoutTime()}`); return; }
    setAuthError(""); setOtpError("");
    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
     
    setLoading("login");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: "POST", headers: { "Content-Type": "application/json", "X-Client": "web" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }), credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) { incrementAttempts(); setAuthError(data.message || "Invalid credentials"); return; }
      if (data.success) {
        setLoginAttempts(0);
        localStorage.removeItem(`loginAttempts_${email.toLowerCase()}`);
        localStorage.removeItem(`loginLockout_${email.toLowerCase()}`);
        setOtpEmail(email.trim());
        sessionStorage.setItem("tempUser", JSON.stringify(data.user));
        await sendOtpSilent(email.trim());
        setStep("otp");
      }
    } catch { setAuthError("Connection error. Please try again."); 
     } finally {
    setLoading("");
     }
  };

  const incrementAttempts = () => {
    const n = loginAttempts + 1;
    setLoginAttempts(n);
    localStorage.setItem(`loginAttempts_${email.toLowerCase()}`, n.toString());
    if (n >= MAX_ATTEMPTS) {
      const lvl = Math.min(lockoutLevel, LOCKOUT_DURATIONS.length - 1);
      const lockTime = Date.now() + LOCKOUT_DURATIONS[lvl];
      setIsLocked(true); setLockoutTime(lockTime);
      localStorage.setItem(`loginLockout_${email.toLowerCase()}`, lockTime.toString());
      const nextLvl = Math.min(lvl + 1, LOCKOUT_DURATIONS.length - 1);
      localStorage.setItem(`lockoutLevel_${email.toLowerCase()}`, nextLvl.toString());
      setLockoutLevel(nextLvl);
      const mins = Math.floor(LOCKOUT_DURATIONS[lvl] / 60000);
      setAuthError(`Too many failed attempts. Account locked for ${mins} minute${mins !== 1 ? "s" : ""}.`);
    } else {
      const rem = MAX_ATTEMPTS - n;
      setAuthError(`Invalid credentials. ${rem} attempt${rem !== 1 ? "s" : ""} remaining.`);
    }
  };
  const sendOtpSilent = async (e, method = "email") => {
    try {
      const endpoint =
        method === "sms"
          ? "/send-login-sms-otp"
          : "/send-otp-after-login";

    const res = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: e }),
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      setOtpError(data.message || "Failed to send OTP");
      return;
    }

    if (method === "sms" && data.maskedPhone) {
      setMaskedOtpPhone(data.maskedPhone);
    }

    setOtpMethod(method);
  } catch {
    setOtpError("Failed to send OTP. Try again.");
  }
};

const verifyOtp = async () => {
  setOtpError("");
  if (otpLockedUntil && Date.now() < otpLockedUntil) {
    setOtpError(`Too many attempts. Try again in ${otpLockRemaining}.`);
    return;
  }
  const val = otp.join("");
  if (val.length !== 6) { setOtpError("Please enter a valid 6-digit OTP"); return; }

  setLoading("otp");
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/verify-otp-login`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: otpEmail.trim(), otp: val }), credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      const n = otpAttempts + 1; setOtpAttempts(n);
      if (n >= OTP_MAX_ATTEMPTS) {
        setOtpLockedUntil(Date.now() + OTP_LOCKOUT_DURATION);
        setOtpError("Maximum OTP attempts reached. You are locked out for 2 hours.");
      } else {
        setOtpError(`Invalid OTP. ${OTP_MAX_ATTEMPTS - n} attempt(s) remaining.`);
      }
      return;
    }

    setOtpAttempts(0); setOtpLockedUntil(null);
    const user = data.user;

     if (rememberMe) {
    localStorage.setItem("user", JSON.stringify({
      ...user,
      sessionExpiry: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
    }));
  } else {
    // sessionStorage clears automatically when browser/tab closes
    sessionStorage.setItem("user", JSON.stringify({
      ...user,
      sessionExpiry: Date.now() + 24 * 60 * 60 * 1000 // safety cap: 24hrs
    }));
  }

    sessionStorage.removeItem("tempUser");
    setLoggedIn(true); 
    setUserRole(user.role);
  } catch { setOtpError("OTP verification failed"); 
   } finally { setLoading(""); }
};

  // ── Open Forgot Password: pre-fetch phone then show choice ──
  const handleForgotPasswordOpen = async () => {
    setChoiceError("");
    setForgotEmail(email.trim());
     setMaskedPhone("your registered number"); 
       setStep("forgotPassword");
    if (email.trim()) {
      setIsFetchingPhone(true);
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/get-contact-number`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }), credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.contact_number) {
          const raw = data.contact_number.toString().replace(/\D/g, "");
          setMaskedPhone("*".repeat(raw.length - 2) + raw.slice(-2));
        }
      } catch { /* no phone found — SMS option will be disabled */ }
      finally { setIsFetchingPhone(false); }
    }
    setChoiceError("");
    setForgotEmail(email.trim());
    setMaskedPhone("your registered number");  
    setStep("forgotPassword");
  };

  const handleChooseEmail = async () => {
    setChoiceError("");
    if (forgotOtpLockedUntil && Date.now() < forgotOtpLockedUntil) {
      setChoiceError(`You are currently locked out. Try again in ${forgotOtpLockRemaining}.`); return;
    }
    
    setLoading("choiceEmail");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/send-forgot-password-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }), credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) { setChoiceError(data.message || "Failed to send OTP"); return; }
      setForgotOtpMethod("email");
      setForgotOtp(["", "", "", "", "", ""]);
      setForgotOtpError("");
      setResendDisabled(false);
      setStep("forgotEmailOtp");
    } catch { setChoiceError("Failed to send OTP. Please try again."); }
    finally { setLoading(""); }
  };

  const handleChooseSms = async () => {
    setChoiceError("");
    if (forgotOtpLockedUntil && Date.now() < forgotOtpLockedUntil) {
      setChoiceError(`You are currently locked out. Try again in ${forgotOtpLockRemaining}.`); return;
    }

    setLoading("choiceSms");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/send-login-sms-otp`, { // ← change this
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }), credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) { setChoiceError(data.message || "Failed to send SMS OTP"); return; }
      setForgotOtpMethod("sms");
      setForgotOtp(["", "", "", "", "", ""]);
      setForgotOtpError("");
      setResendDisabled(false);
      setStep("forgotSmsOtp");
    } catch { setChoiceError("Failed to send SMS OTP. Please try again."); }
    finally { setLoading(""); }
  };
  
const verifyForgotEmailOtp = async () => {
  setForgotOtpError("");
  if (forgotOtpLockedUntil && Date.now() < forgotOtpLockedUntil) {
    setForgotOtpError(`Too many attempts. Try again in ${forgotOtpLockRemaining}.`); return;
  }
  const val = forgotOtp.join("");
  if (val.length !== 6) { setForgotOtpError("Please enter a valid 6-digit OTP"); return; }

  setLoading("forgotOtp");
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/verify-otp-login`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail.trim(), otp: val }), credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      const n = forgotOtpAttempts + 1; setForgotOtpAttempts(n);
      if (n >= OTP_MAX_ATTEMPTS) {
        setForgotOtpLockedUntil(Date.now() + OTP_LOCKOUT_DURATION);
        setForgotOtpError("Maximum OTP attempts reached. Locked out for 2 hours.");
      } else {
        setForgotOtpError(`Invalid OTP. ${OTP_MAX_ATTEMPTS - n} attempt(s) remaining.`);
      }
      return;
    }
    setForgotOtpAttempts(0); setForgotOtpLockedUntil(null);
    setResetError(""); setNewPassword(""); setConfirmPassword("");
    setShowPasswordValidation(false); setPasswordErrors([]);
    setStep("forgotReset");
  } catch { setForgotOtpError("Verification failed. Please try again."); }
  finally { setLoading(""); }
};

const handleSwitchToSmsOtp = async () => {
  setOtpError("");

  if (otpLockedUntil && Date.now() < otpLockedUntil) {
    setOtpError(`You are currently locked out. Try again in ${otpLockRemaining}.`);
    return;
  }

  setLoading("sms");
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/send-login-sms-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: otpEmail.trim() }),
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      setOtpError(data.message || "Failed to send SMS OTP");
      return;
    }

    if (data.maskedPhone) setMaskedOtpPhone(data.maskedPhone);
    setOtpMethod("sms");
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    setResendDisabled(true);
    setResendTimer(30);
  } catch {
    setOtpError("Failed to send SMS OTP. Please try again.");
  } finally {
    setLoading("");
  }
};

const verifyForgotSmsOtp = async () => {
  setForgotOtpError("");
  if (forgotOtpLockedUntil && Date.now() < forgotOtpLockedUntil) {
    setForgotOtpError(`Too many attempts. Try again in ${forgotOtpLockRemaining}.`); return;
  }
  const val = forgotOtp.join("");
  if (val.length !== 6) { setForgotOtpError("Please enter a valid 6-digit OTP"); return; }

  setLoading("forgotOtp");
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/verify-sms-otp`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail.trim(), otp: val }), credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      const n = forgotOtpAttempts + 1; setForgotOtpAttempts(n);
      if (n >= OTP_MAX_ATTEMPTS) {
        setForgotOtpLockedUntil(Date.now() + OTP_LOCKOUT_DURATION);
        setForgotOtpError("Maximum OTP attempts reached. Locked out for 2 hours.");
      } else {
        setForgotOtpError(`Invalid OTP. ${OTP_MAX_ATTEMPTS - n} attempt(s) remaining.`);
      }
      return;
    }
    setForgotOtpAttempts(0); setForgotOtpLockedUntil(null);
    setResetError(""); setNewPassword(""); setConfirmPassword("");
    setShowPasswordValidation(false); setPasswordErrors([]);
    setStep("forgotReset");
  } catch { setForgotOtpError("Verification failed. Please try again."); }
  finally { setLoading(""); }
};

  // ── Reset Password ──
  const resetPassword = async () => {
    setResetError("");
    if (!newPassword) { setResetError("Please enter a new password"); return; }

    setLoading("reset"); 
    const check = validatePasswordStrength(newPassword);
    if (!check.isValid) {
      const msgs = { minLength: " at least 8 characters", uppercase: " at least 1 uppercase letter", lowercase: " at least 1 lowercase letter", number: " at least 1 number", specialChar: " at least 1 special character" };
      setResetError("Password must contain" + check.errors.map((e) => msgs[e]).join("\n")); return;
    }
    if (newPassword === password) { setResetError("New password must be different from your current password"); return; }
    if (newPassword !== confirmPassword) { setResetError("Passwords do not match"); return; }
    setLoading("reset");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/reset-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim(), newPassword, method: forgotOtpMethod }),
        credentials: "include",
      });
      const data = await res.json();
      console.log("API response:", data);
      if (!res.ok) { setResetError(data.message || "Failed to reset password"); return; }
      setStep("resetDone");
    } catch { setResetError("Failed to reset password. Please try again."); }
    finally { setLoading(""); }
  };

  // ── Logout ──
  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;

    const storedUser = localStorage.getItem("user");
    const userId = storedUser ? JSON.parse(storedUser)?.id : null;

    try {
      await fetch(`${process.env.REACT_APP_API_URL}/logout`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),   
        credentials: "include"
      });
    } catch {}
    localStorage.removeItem("user");
    localStorage.removeItem("rememberedUser");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("tempUser");
    setLoggedIn(false); setUserRole(null); setStep("login");
    setEmail(""); setPassword(""); setOtp(["","","","","",""]); setOtpEmail("");
  };

  // ── Step progress index ──
  const getForgotStepIndex = () => {
    if (step === "forgotPassword") return 0;
    if (step === "forgotEmailOtp" || step === "forgotSmsOtp") return 1;
    if (step === "forgotReset") return 2;
    if (step === "resetDone") return 3;
    return -1;
  };

  if (isCheckingSession) return 
    <div className="splash"><img src={logo} alt="logo" className="splash-logo" /><style>{styles(welcome)}</style></div>;

  if (loggedIn && userRole) {
    switch (userRole) {
      case "Administrator": return <AdminDashboard onLogout={handleLogout} />;
      case "Franchisee":    return <FranchiseeDashboard onLogout={handleLogout} />;
      case "Franchisor":    return <FranchisorDashboard onLogout={handleLogout} />;
      case "Manager":       return <ManagerDashboard onLogout={handleLogout} />;
      case "Staff":         return <StaffDashboard onLogout={handleLogout} />;
      default:
        return (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <h2>Unknown Role: {userRole}</h2>
            <p>Your role is not recognized in the system.</p>
            <button style={{ padding: "10px 20px", background: "#2E7D32", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", marginTop: "1rem" }}
              onClick={() => { localStorage.removeItem("rememberedUser"); localStorage.removeItem("user"); sessionStorage.removeItem("user"); setLoggedIn(false); setUserRole(null); }}>
              ← Back to Login
            </button>
          </div>
        );
    }
  }

  if (showSplash) return <div className="splash"><img src={logo} alt="logo" className="splash-logo" /><style>{styles(welcome)}</style></div>;

  const otpIsLocked = otpLockedUntil && Date.now() < otpLockedUntil;
  const forgotOtpIsLocked = forgotOtpLockedUntil && Date.now() < forgotOtpLockedUntil;

  // Reusable step bar for forgot password (4 steps)
  const ForgotStepBar = () => (
    <div className="step-progress">
      {["Method", "Verify", "Reset", "Done"].map((label, i) => (
        <React.Fragment key={label}>
          <div className="step-item">
            <div className={`step-circle ${getForgotStepIndex() >= i ? "step-active" : ""} ${getForgotStepIndex() > i ? "step-done" : ""}`}>
              {getForgotStepIndex() > i ? "✓" : i + 1}
            </div>
            <span className={`step-label ${getForgotStepIndex() >= i ? "step-label-active" : ""}`}>{label}</span>
          </div>
          {i < 3 && <div className={`step-line ${getForgotStepIndex() > i ? "step-line-active" : ""}`} />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="page">

        {loading === "sms" && (
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
                Sending SMS OTP...
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
                Please wait a moment
              </p>
            </div>
          </div>
        </>
      )}

      <img src={logo} alt="logo" className="logo" />
      <div className="card">

        {/* Back button */}
        {step !== "login" && step !== "resetDone" && (
          <button type="button" className="back-btn" onClick={() => {
            if (step === "otp") { setStep("login"); setOtp(["","","","","",""]); setOtpError(""); }
            else if (step === "forgotPassword") { setStep("login"); setChoiceError(""); }
            else if (step === "forgotEmailOtp" || step === "forgotSmsOtp") { setStep("forgotPassword"); setForgotOtp(["","","","","",""]); setForgotOtpError(""); }
            else if (step === "forgotReset") { setStep(forgotOtpMethod === "sms" ? "forgotSmsOtp" : "forgotEmailOtp"); setResetError(""); }
          }}>
            ← Back
          </button>
        )}

        {/* ── LOGIN ── */}
        {step === "login" && (
          <>
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
            <h2 style={{ fontSize: "23px", color: "#0a8d1c", fontFamily: "Montserrat", fontWeight: 700, marginTop: 20 }}>LOGIN</h2>
            <p className="login-subtext">Enter your credentials below</p>
            {authError && <p className="error general">{authError}</p>}
            <div className="input-container">
              <input placeholder="Email" value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: "" }); setAuthError(""); }}
                onKeyPress={(e) => e.key === "Enter" && login()} />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            <div className="input-container">
              <div className="password-wrap">
                <input type={showPassword ? "text" : "password"} placeholder="Password" value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: "" }); setAuthError(""); }}
                  onKeyPress={(e) => e.key === "Enter" && login()}
                  onCopy={preventCopyPaste} onPaste={preventCopyPaste} onCut={preventCopyPaste}
                  className="password-input" />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
              <button className="forgot-link" onClick={handleForgotPasswordOpen}>Forgot Password?</button>
            </div>
            <div className="remember-wrap">
              <label className="remember-label">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="remember-checkbox" />
                <span className="remember-text">Remember me for 30 days</span>
              </label>
            </div>
            <button className="btn" onClick={login} disabled={loading === "login"}>
              {loading === "login" ? <><span className="sms-spinner" /> Logging in...</> : "LOGIN"}
            </button>
          </>
        )}

        {/* ── LOGIN OTP ── */} 
      {step === "otp" && (
        <>
          <h2
            style={{
              fontSize: "23px",
              color: "#0a8d1c",
              fontFamily: "Montserrat",
              fontWeight: 700,
              marginTop: 20,
            }}
          >
            Verify OTP
          </h2>

          <p className="step-subtitle">
            {otpMethod === "email" ? (
              <>
                A 6-digit code was sent to:{" "}
                <strong style={{ color: "#2E7D32" }}>{otpEmail}</strong>
              </>
            ) : (
              <>
                A 6-digit SMS OTP was sent to:{" "}
                <strong style={{ color: "#2E7D32" }}>
                  {maskedOtpPhone || "your registered mobile number"}
                </strong>
              </>
            )}
          </p>
            <OtpEntryBlock
              otpArr={otp}
              setOtpArr={setOtp}
              refs={otpRefs}
              isLocked={otpIsLocked}
              lockRemaining={otpLockRemaining}
              error={otpError}
              attempts={otpAttempts}
              onVerify={verifyOtp}
              resendEndpoint={
                otpMethod === "sms"
                  ? "/send-login-sms-otp"
                  : "/send-otp-after-login"
              }
              resendBody={{ email: otpEmail }}
              verifyLabel="VERIFY OTP"
              loading={loading} loadingKey="otp" resendKey="resend" 
               handleOtpChange={handleOtpChange}
              handleOtpKeyDown={handleOtpKeyDown}
              handleOtpPaste={handleOtpPaste}
              setResendDisabled={setResendDisabled}
              setResendTimer={setResendTimer}
              setLoading={setLoading}
              resendDisabled={resendDisabled}
              resendTimer={resendTimer}
              OTP_MAX_ATTEMPTS={OTP_MAX_ATTEMPTS}
               extraButton={
    otpMethod === "email" ? (
      <button
        type="button"
        className="switch-method-link"
        onClick={handleSwitchToSmsOtp}
        disabled={!!loading}
      >
        Use SMS instead
      </button>
    ) : null
  }
            />
        

            {loading === "sms" &&(
            <div className="sms-loading-overlay">
              <div className="sms-loading-box">
                <div className="sms-spinner-large" />
                <p className="sms-loading-text">Sending SMS OTP...</p>
                <p className="sms-loading-sub">Please wait a moment</p>
              </div>
            </div>
            )}
          </>
        )}
        {/* ── FORGOT: Level 1 — Choose Method ── */}
        {step === "forgotPassword" && (
          <>
            <ForgotStepBar />
            <h2 style={{ fontSize: "21px", color: "#0a8d1c", fontFamily: "Montserrat", fontWeight: 700, marginTop: 12 }}>Reset Password</h2>
            <p className="step-subtitle">Choose how you would like to receive your OTP.</p>

            {forgotOtpIsLocked && (
              <div className="error general locked-banner">
                Account locked due to too many attempts. Try again in <strong>{forgotOtpLockRemaining}</strong>.
              </div>
            )}
            {choiceError && !forgotOtpIsLocked && <p className="error general">{choiceError}</p>}

            <button
              className={`method-btn ${forgotOtpIsLocked ? "btn-disabled" : ""}`}
              onClick={!forgotOtpIsLocked ? handleChooseEmail : undefined}
              disabled={!!forgotOtpIsLocked || !!loading}>
              <div className="method-btn-title">
                {loading === "choiceEmail" ? <><span className="sms-spinner" /> Sending...</> : "Send via Email"}
              </div>
              <div className="method-btn-sub">{forgotEmail || "your registered email"}</div>
            </button>

          <button
            className={`method-btn ${forgotOtpIsLocked || loading ? "btn-disabled" : ""}`}
            onClick={!forgotOtpIsLocked && !loading ? handleChooseSms : undefined}
            disabled={!!forgotOtpIsLocked || !!loading}
            style={{ marginTop: 12 }}>
            <div className="method-btn-title">
              {loading === "choiceSms" ? <><span className="sms-spinner" /> Sending...</> : "Send via SMS"}
            </div>
            <div className="method-btn-sub">your registered number</div>
          </button>
          </>
        )}

        {/* ── FORGOT: Email OTP verify ── */}
        {step === "forgotEmailOtp" && (
          <>
            <ForgotStepBar />
            <h2>Verify OTP</h2>
            <p className="step-subtitle">A 6-digit code was sent to: <strong style={{ color: "#2E7D32" }}>{forgotEmail}</strong></p>
            <OtpEntryBlock
              otpArr={forgotOtp} setOtpArr={setForgotOtp} refs={forgotOtpRefs}
              isLocked={forgotOtpIsLocked} lockRemaining={forgotOtpLockRemaining}
              error={forgotOtpError} attempts={forgotOtpAttempts}
              onVerify={verifyForgotEmailOtp} 
              resendEndpoint="/send-forgot-password-otp" resendBody={{ email: forgotEmail }}
              loading={loading} loadingKey="forgotOtp" resendKey="resend" 
               handleOtpChange={handleOtpChange}
              handleOtpKeyDown={handleOtpKeyDown}
              handleOtpPaste={handleOtpPaste}
              setResendDisabled={setResendDisabled}
              setResendTimer={setResendTimer}
              setLoading={setLoading}
              resendDisabled={resendDisabled}
              resendTimer={resendTimer}
              OTP_MAX_ATTEMPTS={OTP_MAX_ATTEMPTS}
            />
          </>
        )}

        {/* ── FORGOT: SMS OTP verify ── */}
        {step === "forgotSmsOtp" && (
          <>
            <ForgotStepBar />
            <h2>Verify OTP</h2>
            <p className="step-subtitle">A 6-digit code was sent to: <strong style={{ color: "#2E7D32" }}>{maskedPhone}</strong></p>
            <OtpEntryBlock
              otpArr={forgotOtp} setOtpArr={setForgotOtp} refs={forgotOtpRefs}
              isLocked={forgotOtpIsLocked} lockRemaining={forgotOtpLockRemaining}
              error={forgotOtpError} attempts={forgotOtpAttempts}
              onVerify={verifyForgotSmsOtp}  
              resendEndpoint="/send-sms-otp" 
              resendBody={{ email: forgotEmail }}
              loading={loading} loadingKey="forgotOtp" resendKey="resend"
              handleOtpChange={handleOtpChange}
              handleOtpKeyDown={handleOtpKeyDown}
              handleOtpPaste={handleOtpPaste}
              setResendDisabled={setResendDisabled}
              setResendTimer={setResendTimer}
              setLoading={setLoading}
              resendDisabled={resendDisabled}
              resendTimer={resendTimer}
              OTP_MAX_ATTEMPTS={OTP_MAX_ATTEMPTS}
            />
          </>
        )}

        {/* ── FORGOT: Level 2 — Reset Form ── */}
        {step === "forgotReset" && (
          <>
            <ForgotStepBar />
            <h2>New Password</h2>
            <p className="step-subtitle">Enter and confirm your new password below.</p>
            {resetError && <p className="error general" style={{ whiteSpace: "pre-line" }}>{resetError}</p>}

            <div className="input-container">
              <div className="password-wrap">
                <input type={showNewPassword ? "text" : "password"} placeholder="New Password" value={newPassword}
                  onChange={(e) => {
                    const v = e.target.value; setNewPassword(v); setResetError("");
                    if (v) { setShowPasswordValidation(true); setPasswordErrors(validatePasswordStrength(v).errors); }
                    else { setShowPasswordValidation(false); setPasswordErrors([]); }
                  }}
                  onCopy={preventCopyPaste} onPaste={preventCopyPaste} onCut={preventCopyPaste}
                  className="password-input" />
                <button type="button" className="eye-btn" onClick={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {showPasswordValidation && (
                <div className="pw-checklist">
                  <div className="pw-checklist-title">Password must contain:</div>
                  {[
                    { key: "minLength",   label: "At least 8 characters" },
                    { key: "uppercase",   label: "At least one uppercase letter (A-Z)" },
                    { key: "lowercase",   label: "At least one lowercase letter (a-z)" },
                    { key: "number",      label: "At least one number (0-9)" },
                    { key: "specialChar", label: "At least one special character (!@#$%^&*...)" },
                  ].map(({ key, label }) => (
                    <div key={key} className={`pw-check-row ${!passwordErrors.includes(key) ? "pw-check-pass" : "pw-check-fail"}`}>
                      {passwordErrors.includes(key) ? "x" : "✓"} {label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="input-container">
              <div className="password-wrap">
                <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm New Password" value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setResetError(""); }}
                  onCopy={preventCopyPaste} onPaste={preventCopyPaste} onCut={preventCopyPaste}
                  onKeyPress={(e) => e.key === "Enter" && resetPassword()}
                  className="password-input" />
                <button type="button" className="eye-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button className="btn yellow" onClick={resetPassword} disabled={loading === "reset"}>
              {loading === "reset" ? <><span className="sms-spinner" /> Resetting...</> : "RESET PASSWORD"}
            </button>
          </>
        )}

        {/* ── RESET DONE ── */}
        {step === "resetDone" && (
          <div className="done-wrap">
            <div className="done-icon"><CheckCircle size={60} color="#2E7D32" /></div>
            <h2>Password Reset!</h2>
            <p className="step-subtitle">Your password has been updated. You can now log in with your new password.</p>
            <button className="btn" onClick={() => {
              setForgotEmail(""); setForgotOtp(["","","","","",""]); setNewPassword(""); setConfirmPassword("");
              setResetError(""); setChoiceError(""); setForgotOtpError(""); setStep("login");
            }}>
              ← BACK TO LOGIN
            </button>
          </div>
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

.page { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; padding:40px 20px 20px; background-image: linear-gradient(rgba(255,255,255,0.78), rgba(211,255,201,0.78)), url(${bgImage}); background-size:cover; }

.card { background:rgba(255,255,255,0.96); width:100%; max-width:400px; padding:36px 30px 30px; border-radius:20px; box-shadow:0 10px 30px rgba(0,0,0,.1); text-align:center; position:relative; }
.logo { width:200px; height:auto; margin-top:100px; margin-bottom:20px; }

h2 { margin:12px 0 4px; color:#1a1a1a; font-size:22px; }
p { color:#555; font-size:13px; margin-bottom:16px; }
.step-subtitle { color:#555; font-size:13px; margin-bottom:24px; margin-top:2px; }
.login-subtext { font-size:13px; color:#666; margin-bottom:18px; margin-top:0; }

.input-container { margin-bottom:18px; position:relative; width:100%; text-align:left; }
input[type="text"], input[type="email"], input[type="password"], input:not([type]) {
  width:100%; padding:13px 14px; border-radius:12px; border:1.5px solid #c8e6c9; outline:none;
  font-size:14px; background:#fafafa; transition: border-color 0.2s;
}
input:focus { border-color:#2E7D32; background:#fff; }
input:disabled { background:#f5f5f5; color:#888; cursor:not-allowed; }

.password-wrap { position:relative; display:flex; align-items:center; }
.password-wrap input.password-input { width:100%; padding-right:42px; }
.eye-btn { position:absolute; right:12px; background:none; border:none; cursor:pointer; font-size:16px; padding:0; line-height:1; color:#777; display:flex; align-items:center; }
.field-error { color:#d32f2f; font-size:11px; margin-top:4px; display:block; }

.btn { width:100%; padding:14px; border-radius:12px; border:none; background:linear-gradient(90deg,#368f3b,#218428); color:white; font-weight:bold; cursor:pointer; font-size:14px; letter-spacing:0.5px; transition:background 0.2s; }
.btn:hover:not(:disabled) { background:linear-gradient(90deg,#246627,#2a7e30); }
.btn.yellow { background:linear-gradient(90deg,#368f3b,#218428); margin-top:8px; }
.btn.yellow:hover:not(:disabled) { background:linear-gradient(90deg,#0a4e0e,#2a7e30); }
.btn-disabled { opacity:0.55; cursor:not-allowed !important; }

/* ── Method choice buttons ── */
.method-btn {
  width:100%; padding:14px 16px; border-radius:12px;
  border:1.5px solid #c8e6c9; background:#fafafa;
  cursor:pointer; text-align:left; transition:border-color 0.2s, background 0.2s;
  display:block;
}
.method-btn:hover:not(:disabled) { border-color:#2E7D32; background:#f0fdf4; }
.method-btn:disabled { opacity:0.5; cursor:not-allowed; }
.method-btn-title { font-size:14px; font-weight:700; color:#1a1a1a; margin-bottom:3px; }
.method-btn-sub { font-size:12px; color:#666; letter-spacing:1.5px; }

.forgot-link { background:none; border:none; color:#2E7D32; text-decoration:underline; font-size:12px; cursor:pointer; margin-top:6px; display:block; text-align:right; width:100%; }
.forgot-link:hover { color:#1B5E20; }

.link-resend { background:none; border:none; color:#2E7D32; text-decoration:underline; font-size:12px; margin-top:12px; cursor:pointer; display:block; transition:color 0.2s; }
.link-resend:hover:not(:disabled) { color:#1b5e20; }
.link-resend:disabled { color:#999; cursor:not-allowed; text-decoration:none; }

.error.general { color:#d32f2f; font-size:12px; margin-bottom:14px; padding:10px 12px; background:#ffebee; border-radius:10px; text-align:center; line-height:1.5; }
.locked-banner { border-left:3px solid #d32f2f; }

.back-btn { position:absolute; top:15px; left:15px; background:none; border:none; color:#2E7D32; font-weight:bold; cursor:pointer; font-size:13px; }
.back-btn:hover { text-decoration:underline; }

.remember-wrap { display:flex; justify-content:flex-start; margin-bottom:16px; margin-top:-6px; }
.remember-label { display:flex; align-items:center; gap:8px; cursor:pointer; user-select:none; }
.remember-checkbox { width:16px; height:16px; accent-color:#2E7D32; cursor:pointer; }
.remember-text { font-size:12px; color:#555; }

/* ── Step Progress ── */
.step-progress { display:flex; align-items:center; justify-content:center; margin:8px 0 22px; gap:0; }
.step-item { display:flex; flex-direction:column; align-items:center; gap:5px; }
.step-circle { width:26px; height:26px; border-radius:50%; background:#e0e0e0; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#fff; transition:background 0.3s; }
.step-active { background:#2E7D32 !important; }
.step-done { background:#66bb6a !important; }
.step-label { font-size:9px; color:#aaa; font-weight:600; letter-spacing:0.3px; }
.step-label-active { color:#2E7D32; }
.step-line { width:24px; height:2px; background:#e0e0e0; margin:0 3px; margin-bottom:18px; transition:background 0.3s; }
.step-line-active { background:#66bb6a; }

/* ── OTP Boxes ── */
.otp-box-wrap { display:flex; gap:10px; justify-content:center; margin-bottom:18px; margin-top:6px; }
.otp-box { width:46px !important; height:52px; text-align:center; font-size:22px; font-weight:700; border:2px solid #c8e6c9; border-radius:12px; background:#fafafa; outline:none; transition:border-color 0.2s, background 0.2s; color:#2E7D32; padding:0 !important; caret-color:#2E7D32; }
.otp-box:focus { border-color:#2E7D32; background:#f0fdf4; }
.otp-box:not(:placeholder-shown) { border-color:#43a047; }
.otp-box-locked { opacity:0.45; pointer-events:none; }

.switch-method-link {
  width:100%;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  padding:12px;
  margin-top: 10px;
  margin-bottom:18px;
  border:none;
  border-radius:12px;
  background:#f0fdf4;
  color:#2E7D32;
  font-weight:700;
  font-size:13px;
  cursor:pointer;
  transition:all .2s ease;
  border:1px solid #369533;
}
.switch-method-link:hover{
  background:#dcfce7;
  transform:translateY(-1px);
}

.switch-method-link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.otp-attempts-left { font-size:12px; color:#e65100; margin:-10px 0 12px; font-weight:600; text-align:center; }

/* ── Password Checklist ── */
.pw-checklist { margin-top:8px; font-size:12px; padding:10px 12px; background:#f8fdf5; border-radius:8px; border:1px solid #c8e6c9; text-align:left; }
.pw-checklist-title { margin-bottom:6px; font-weight:700; color:#333; }
.pw-check-row { margin-bottom:3px; }
.pw-check-pass { color:#2E7D32; }
.pw-check-fail { color:#d32f2f; }

.use-sms-btn{
  width:100%;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  padding:12px;
  margin-top: 10px;
  margin-bottom:18px;
  border:none;
  border-radius:12px;
  background:#f0fdf4;
  color:#2E7D32;
  font-weight:700;
  font-size:13px;
  cursor:pointer;
  transition:all .2s ease;
  border:1px solid #369533;
}

/* ── SMS Loading Overlay ── */
.sms-loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.92);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.sms-loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.sms-loading-text {
  font-size: 15px;
  font-weight: 700;
  color: #2E7D32;
  margin: 0;
}

.sms-loading-sub {
  font-size: 12px;
  color: #888;
  margin: 0;
}

.sms-spinner-large {
  width: 48px;
  height: 48px;
  border: 5px solid #c8e6c9;
  border-top: 5px solid #2E7D32;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

.sms-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top: 2px solid #2E7D32;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 6px;
  vertical-align: middle;
}

.use-sms-btn:hover{
  background:#dcfce7;
  transform:translateY(-1px);
}

/* ── Done state ── */
.done-wrap { display:flex; flex-direction:column; align-items:center; padding:10px 0; }
.done-icon { margin-bottom:10px; }
.done-wrap h2 { margin-bottom:8px; }
.done-wrap p { max-width:280px; }
`;