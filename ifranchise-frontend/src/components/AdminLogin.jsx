import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import welcome from "../assets/welcomepage.png";
import { Eye, EyeOff, CheckCircle } from "lucide-react";

const TEST_ACCOUNTS = [
  { email: "genmanager@test.com", password: "Genmanager123!" },
  { email: "foa@test.com", password: "FOAdmin123!" },
  { email: "salesadmin@test.com", password: "Salesadmin123!" },
  { email: "franchisee@test.com", password: "Franchisee123!" },
  { email: "manager@test.com", password: "Manager123!" },
  { email: "staff@test.com", password: "Staff123!" },
];

const getBrowserLocation = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => {
        console.warn("Geolocation denied or failed:", err.message);
        resolve(null);
      },
      { timeout: 5000, maximumAge: 60000 },
    );
  });
};

const OtpEntryBlock = ({
  otpArr,
  setOtpArr,
  refs,
  isLocked,
  lockRemaining,
  error,
  attempts,
  onVerify,
  resendEndpoint,
  resendBody,
  verifyLabel = "CONTINUE",
  loading,
  loadingKey,
  resendKey,
  showSmsSwitch,
  onSwitchMethod,
  extraButton,
  trustDeviceCheckbox,
  handleOtpChange,
  handleOtpKeyDown,
  handleOtpPaste,
  setResendDisabled,
  setResendTimer,
  setLoading,
  resendDisabled,
  resendTimer,
  OTP_MAX_ATTEMPTS,
}) => {
  const hasFocused = useRef(false);
  const isVerifying = loading === loadingKey;

  useEffect(() => {
    if (!hasFocused.current) {
      hasFocused.current = true;
      setTimeout(() => refs.current[0]?.focus(), 300);
    }
  }, []);

  return (
    <>
      {isLocked && (
        <div className="error general locked-banner">
          Too many attempts. Locked for <strong>{lockRemaining}</strong>.
        </div>
      )}
      {error && !isLocked && <p className="error general">{error}</p>}
      <div className="otp-box-wrap">
        {otpArr.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            className={`otp-box ${isLocked ? "otp-box-locked" : ""} ${isVerifying ? "otp-box-verifying" : ""}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => {
              const value = e.target.value;
              if (!/^\d*$/.test(value)) return;
              const digitVal = value.slice(-1);
              const next = [...otpArr];
              next[i] = digitVal;
              setOtpArr(next);

              if (digitVal && i < 5) {
                refs.current[i + 1]?.focus();
              }

              if (digitVal && i === 5 && next.every((d) => d !== "")) {
                setTimeout(() => onVerify(next.join("")), 100);
              }
            }}
            onPaste={(e) => {
              e.preventDefault();
              const p = e.clipboardData
                .getData("text")
                .replace(/\D/g, "")
                .slice(0, 6);
              if (p.length === 6) {
                setOtpArr(p.split(""));
                refs.current[5]?.focus();
                setTimeout(() => onVerify(p), 100);
              }
            }}
            onClick={() => refs.current[i]?.focus()}
            disabled={!!isLocked || isVerifying}
          />
        ))}
      </div>

      {isVerifying && (
        <div className="otp-verifying-row">
          <span className="sms-spinner" /> Verifying code...
        </div>
      )}

      {trustDeviceCheckbox}

      {extraButton}

      <button
        className="link-resend"
        disabled={
          resendDisabled || !!isLocked || loading === resendKey || isVerifying
        }
        onClick={async () => {
          if (resendDisabled || isLocked) return;
          setResendDisabled(true);
          setResendTimer(30);
          setLoading(resendKey);
          try {
            const res = await fetch(
              `${process.env.REACT_APP_API_URL}${resendEndpoint}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(resendBody),
                credentials: "include",
              },
            );
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
        {loading === resendKey ? (
          <>
            <span className="sms-spinner" /> Sending...
          </>
        ) : resendDisabled ? (
          `Resend OTP in ${resendTimer}s`
        ) : (
          "Resend OTP"
        )}
      </button>
    </>
  );
};

function UnknownRoleScreen({ userRole, onBackToLogin }) {
  const [secondsLeft, setSecondsLeft] = useState(3);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onBackToLogin();
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, onBackToLogin]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Unknown Role: {userRole}</h2>
      <p>Your role is not recognized in the system.</p>
      <p style={{ color: "var(--muted)", fontSize: 13 }}>
        Redirecting to login in {secondsLeft}s...
      </p>
      <button
        style={{
          padding: "10px 22px",
          background: "var(--green-900)",
          color: "white",
          border: "none",
          borderRadius: "999px",
          cursor: "pointer",
          marginTop: "1rem",
          fontWeight: 700,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
        onClick={onBackToLogin}
      >
        ← Back to Login Now
      </button>
    </div>
  );
}
export default function AdminLogin({ onLogin }) {
  const navigate = useNavigate();
  useEffect(() => {
  sessionStorage.removeItem("tempUser");
  sessionStorage.removeItem("user");
}, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState("");

  const [step, setStep] = useState("login");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpEmail, setOtpEmail] = useState("");
  const otpRefs = useRef([]);
  const [otpMethod, setOtpMethod] = useState("email"); // email | sms
  const [maskedOtpPhone, setMaskedOtpPhone] = useState("");

  const [forgotEmail, setForgotEmail] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [isFetchingPhone, setIsFetchingPhone] = useState(false);
  const [choiceError, setChoiceError] = useState("");

  const [forgotOtp, setForgotOtp] = useState(["", "", "", "", "", ""]);
  const forgotOtpRefs = useRef([]);
  const [forgotOtpMethod, setForgotOtpMethod] = useState("");
  const [forgotOtpError, setForgotOtpError] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");

  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [otpError, setOtpError] = useState("");

  const [showSplash, setShowSplash] = useState(true);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(null);
  const MAX_ATTEMPTS = 5;
  const LOGIN_LOCKOUT_DURATION = 15 * 60 * 1000;
  const [lockoutLevel, setLockoutLevel] = useState(0);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);
  const [coords, setCoords] = useState(null);
  const loginInFlight = useRef(false);
  const otpInFlight = useRef(false);
  const locationRequest = useRef(null);

  // Start the existing location lookup while the user enters credentials.
  // Login still awaits its result, preserving the location payload contract.
  const prepareLocation = () => {
    if (
      !locationRequest.current ||
      Date.now() - locationRequest.current.startedAt > 60000
    ) {
      locationRequest.current = {
        startedAt: Date.now(),
        promise: getBrowserLocation(),
      };
    }
    return locationRequest.current.promise;
  };

  const fillTestAccount = (account) => {
    if (loginInFlight.current || loading) return;
    setEmail(account.email);
    setPassword(account.password);
    setErrors({});
    setAuthError("");
    prepareLocation();
  };

  const clearDashboardSessions = () => {
    sessionStorage.removeItem("sa_activeModule");
    sessionStorage.removeItem("fa_activeModule");
    sessionStorage.removeItem("bm_activeModule");
  };

  const OTP_MAX_ATTEMPTS = 5;
  const OTP_LOCKOUT_DURATION = 10 * 60 * 1000;

  // Login OTP lockout
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [otpLockedUntil, setOtpLockedUntil] = useState(null);
  const [otpLockRemaining, setOtpLockRemaining] = useState("");

  // Forgot OTP lockout (separate)
  const [forgotOtpAttempts, setForgotOtpAttempts] = useState(0);
  const [forgotOtpLockedUntil, setForgotOtpLockedUntil] = useState(null);
  const [forgotOtpLockRemaining, setForgotOtpLockRemaining] = useState("");

  const [resetToken, setResetToken] = useState("");

  const [resetDoneCountdown, setResetDoneCountdown] = useState(3);

  useEffect(() => {
    if (step !== "resetDone") {
      setResetDoneCountdown(3); // reset for next time
      return;
    }

    if (resetDoneCountdown <= 0) {
      setForgotEmail("");
      setForgotOtp(["", "", "", "", "", ""]);
      setNewPassword("");
      setConfirmPassword("");
      setResetError("");
      setChoiceError("");
      setForgotOtpError("");
      setStep("login");
      return;
    }

    const timer = setTimeout(() => setResetDoneCountdown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, resetDoneCountdown]);

  // Keep the required three-second welcome splash.
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // ── Login lockout from storage — PER EMAIL ──
  useEffect(() => {
    if (!email.trim()) {
      setIsLocked(false);
      setLockoutTime(null);
      setLoginAttempts(0);
      setAuthError("");
      return;
    }

    const emailKey = email.trim().toLowerCase();

    const storedLockout = localStorage.getItem(`loginLockout_${emailKey}`);

    const storedAttempts =
      parseInt(localStorage.getItem(`loginAttempts_${emailKey}`), 10) || 0;

    // Always reset the currently displayed account state first
    setIsLocked(false);
    setLockoutTime(null);
    setLoginAttempts(storedAttempts);
    setAuthError("");

    if (!storedLockout) {
      return;
    }

    const lockTime = parseInt(storedLockout, 10);

    // This specific email is still locked
    if (Date.now() < lockTime) {
      setIsLocked(true);
      setLockoutTime(lockTime);
      setLoginAttempts(MAX_ATTEMPTS);
      return;
    }

    // This specific email's lockout has expired
    localStorage.removeItem(`loginLockout_${emailKey}`);
    localStorage.removeItem(`loginAttempts_${emailKey}`);

    setIsLocked(false);
    setLockoutTime(null);
    setLoginAttempts(0);
  }, [email]);

  useEffect(() => {
    if (!isLocked || !lockoutTime || !email) return;
    const interval = setInterval(() => {
      if (Date.now() >= lockoutTime) {
        setIsLocked(false);
        setLockoutTime(null);
        setLoginAttempts(0);
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
      if (r <= 0) {
        setOtpLockedUntil(null);
        setOtpAttempts(0);
        setOtpLockRemaining("");
      } else {
        const h = Math.floor(r / 3600000),
          m = Math.floor((r % 3600000) / 60000),
          s = Math.floor((r % 60000) / 1000);
        setOtpLockRemaining(
          `${h > 0 ? h + "h " : ""}${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`,
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [otpLockedUntil]);

  // Forgot OTP countdown
  useEffect(() => {
    if (!forgotOtpLockedUntil) return;
    const interval = setInterval(() => {
      const r = forgotOtpLockedUntil - Date.now();
      if (r <= 0) {
        setForgotOtpLockedUntil(null);
        setForgotOtpAttempts(0);
        setForgotOtpLockRemaining("");
      } else {
        const h = Math.floor(r / 3600000),
          m = Math.floor((r % 3600000) / 60000),
          s = Math.floor((r % 60000) / 1000);
        setForgotOtpLockRemaining(
          `${h > 0 ? h + "h " : ""}${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`,
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [forgotOtpLockedUntil]);

  useEffect(() => {
    if (!resendDisabled || resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((p) => {
        if (p <= 1) {
          setResendDisabled(false);
          return 0;
        }
        return p - 1;
      });
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
    if (e.key === "Backspace" && !arr[index] && index > 0)
      refs.current[index - 1]?.focus();
    if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) refs.current[index + 1]?.focus();
  };
  const handleOtpPaste = (e, setArr, refs) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (p.length === 6) {
      setArr(p.split(""));
      refs.current[5]?.focus();
    }
  };
  const preventCopyPaste = (e) => {
    e.preventDefault();
    return false;
  };

  const validatePasswordStrength = (pw) => {
    const errs = [];
    if (pw.length < 8) errs.push("minLength");
    if (!/[A-Z]/.test(pw)) errs.push("uppercase");
    if (!/[a-z]/.test(pw)) errs.push("lowercase");
    if (!/\d/.test(pw)) errs.push("number");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw))
      errs.push("specialChar");
    return { isValid: errs.length === 0, errors: errs };
  };

  const login = async () => {
    if (loginInFlight.current || loading) return;
    if (isLocked) {
      setAuthError(`Account locked. Try again in ${getRemainingLockoutTime()}`);
      return;
    }
    setAuthError("");
    setOtpError("");
    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    loginInFlight.current = true;
    setErrors({});
    setLoading("login");
    try {
      const locationCoords = await prepareLocation();
      setCoords(locationCoords);

      const res = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Client": "web",
          "X-Device-ID": getOrCreateLocalDeviceId(),
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          latitude: locationCoords?.latitude ?? null,
          longitude: locationCoords?.longitude ?? null,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status >= 500 || res.status === 429) {
          setAuthError(
            data.message || "The server is busy. Please try again shortly.",
          );
        } else {
          incrementAttempts();
        }
        return;
      }
      if (data.success) {
        setLoginAttempts(0);
        localStorage.removeItem(`loginAttempts_${email.toLowerCase()}`);
        localStorage.removeItem(`loginLockout_${email.toLowerCase()}`);
        setOtpEmail(email.trim());

       // sessionStorage.setItem("tempUser", JSON.stringify(data.user));

        if (data.skipOtp) {
  clearDashboardSessions();
  onLogin(data.user);
  return;
}
        await sendOtpSilent(email.trim());
        setStep("otp");
      } else {
        setAuthError(
          data.message || "Unable to sign in. Please check your credentials.",
        );
      }
    } catch {
      setAuthError("Connection error. Please try again.");
    } finally {
      loginInFlight.current = false;
      setLoading("");
    }
  };

  const incrementAttempts = () => {
    const emailKey = email.trim().toLowerCase();

    const storedAttempts =
      parseInt(localStorage.getItem(`loginAttempts_${emailKey}`), 10) || 0;

    const n = storedAttempts + 1;

    setLoginAttempts(n);

    localStorage.setItem(`loginAttempts_${emailKey}`, n.toString());

    if (n >= MAX_ATTEMPTS) {
      const lockTime = Date.now() + LOGIN_LOCKOUT_DURATION;

      localStorage.setItem(`loginLockout_${emailKey}`, lockTime.toString());

      setIsLocked(true);
      setLockoutTime(lockTime);

      setAuthError(
        "Too many login attempts. Please try again after 15 minutes.",
      );

      return;
    }

    const remaining = MAX_ATTEMPTS - n;

    setAuthError(
      `Invalid credentials. ${remaining} attempt${
        remaining !== 1 ? "s" : ""
      } remaining.`,
    );
  };

  const sendOtpSilent = async (e, method = "email") => {
    try {
      const endpoint =
        method === "sms" ? "/send-login-sms-otp" : "/send-otp-after-login";

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

  const verifyOtp = async (overrideVal) => {
    if (otpInFlight.current || loading) return;
    setOtpError("");
    if (otpLockedUntil && Date.now() < otpLockedUntil) {
      setOtpError(`Too many attempts. Try again in ${otpLockRemaining}.`);
      return;
    }
    const val = overrideVal || otp.join("");
    if (val.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    otpInFlight.current = true;
    setLoading("otp");
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/verify-otp-login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Device-ID": getOrCreateLocalDeviceId(),
          },
          body: JSON.stringify({
            email: otpEmail.trim(),
            otp: val,
            trustDevice: !!trustDevice,
            latitude: coords?.latitude || null,
            longitude: coords?.longitude || null,
          }),
          credentials: "include",
        },
      );
      const data = await res.json();

      if (!res.ok) {
        const n = otpAttempts + 1;
        setOtpAttempts(n);
        if (n >= OTP_MAX_ATTEMPTS) {
          setOtpLockedUntil(Date.now() + OTP_LOCKOUT_DURATION);
          setOtpError(
            "Too many OTP verification attempts. Please try again after 10 minutes.",
          );
        } else {
          setOtpError(
            `Invalid OTP. ${OTP_MAX_ATTEMPTS - n} attempt(s) remaining.`,
          );
        }
        return;
      }

      setOtpAttempts(0);
      setOtpLockedUntil(null);

      clearDashboardSessions();
onLogin(data.user);
    } catch {
      setOtpError("OTP verification failed");
    } finally {
      otpInFlight.current = false;
      setLoading("");
    }
  };

  const handleForgotPasswordOpen = async () => {
    setChoiceError("");
    setForgotEmail(email.trim());
    setMaskedPhone("your registered number");
    setStep("forgotPassword");

    if (email.trim()) {
      setIsFetchingPhone(true);
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/get-contact-number`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.trim() }),
            credentials: "include",
          },
        );
        const data = await res.json();
        if (res.ok && data.contact_number) {
          const raw = data.contact_number.toString().replace(/\D/g, "");
          setMaskedPhone("*".repeat(raw.length - 2) + raw.slice(-2));
        }
      } catch {
        /* no phone found — SMS option will be disabled */
      } finally {
        setIsFetchingPhone(false);
      }
    }
  };

  const handleChooseEmail = async () => {
    setChoiceError("");
    if (forgotOtpLockedUntil && Date.now() < forgotOtpLockedUntil) {
      setChoiceError(
        `You are currently locked out. Try again in ${forgotOtpLockRemaining}.`,
      );
      return;
    }

    setLoading("choiceEmail");
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/send-forgot-password-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: forgotEmail.trim() }),
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setChoiceError(data.message || "Failed to send OTP");
        return;
      }
      setForgotOtpMethod("email");
      setForgotOtp(["", "", "", "", "", ""]);
      setForgotOtpError("");
      setResendDisabled(false);
      setStep("forgotEmailOtp");
    } catch {
      setChoiceError("Failed to send OTP. Please try again.");
    } finally {
      setLoading("");
    }
  };

  const handleChooseSms = async () => {
    setChoiceError("");
    if (forgotOtpLockedUntil && Date.now() < forgotOtpLockedUntil) {
      setChoiceError(
        `You are currently locked out. Try again in ${forgotOtpLockRemaining}.`,
      );
      return;
    }

    setLoading("choiceSms");
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/send-login-sms-otp`,
        {
          // ← change this
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: forgotEmail.trim() }),
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setChoiceError(data.message || "Failed to send SMS OTP");
        return;
      }
      setForgotOtpMethod("sms");
      setForgotOtp(["", "", "", "", "", ""]);
      setForgotOtpError("");
      setResendDisabled(false);
      setStep("forgotSmsOtp");
    } catch {
      setChoiceError("Failed to send SMS OTP. Please try again.");
    } finally {
      setLoading("");
    }
  };

  const verifyForgotEmailOtp = async (overrideVal) => {
    setForgotOtpError("");
    if (forgotOtpLockedUntil && Date.now() < forgotOtpLockedUntil) {
      setForgotOtpError(
        `Too many attempts. Try again in ${forgotOtpLockRemaining}.`,
      );
      return;
    }
    const val = overrideVal || forgotOtp.join(""); // ← use passed value if provided
    if (val.length !== 6) {
      setForgotOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading("forgotOtp");
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/verify-otp-login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: forgotEmail.trim(),
            otp: val,
            purpose: "reset",
          }),
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok) {
        const n = forgotOtpAttempts + 1;
        setForgotOtpAttempts(n);
        if (n >= OTP_MAX_ATTEMPTS) {
          setForgotOtpLockedUntil(Date.now() + OTP_LOCKOUT_DURATION);
          setForgotOtpError(
            "Too many OTP verification attempts. Please try again after 10 minutes.",
          );
        } else {
          setForgotOtpError(
            `Invalid OTP. ${OTP_MAX_ATTEMPTS - n} attempt(s) remaining.`,
          );
        }
        return;
      }
      setResetToken(data.resetToken || "");
      setForgotOtpAttempts(0);
      setForgotOtpLockedUntil(null);
      setResetError("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordValidation(false);
      setPasswordErrors([]);
      setStep("forgotReset");
    } catch {
      setForgotOtpError("Verification failed. Please try again.");
    } finally {
      setLoading("");
    }
  };

  const handleSwitchToSmsOtp = async () => {
    setOtpError("");

    if (otpLockedUntil && Date.now() < otpLockedUntil) {
      setOtpError(
        `You are currently locked out. Try again in ${otpLockRemaining}.`,
      );
      return;
    }

    setLoading("sms");
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/send-login-sms-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: otpEmail.trim() }),
          credentials: "include",
        },
      );
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

  const verifyForgotSmsOtp = async (overrideVal) => {
    setForgotOtpError("");
    if (forgotOtpLockedUntil && Date.now() < forgotOtpLockedUntil) {
      setForgotOtpError(
        `Too many attempts. Try again in ${forgotOtpLockRemaining}.`,
      );
      return;
    }
    const val = overrideVal || forgotOtp.join(""); // ← use passed value if provided
    if (val.length !== 6) {
      setForgotOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading("forgotOtp");
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/verify-sms-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: forgotEmail.trim(),
            otp: val,
            purpose: "reset",
          }),
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok) {
        const n = forgotOtpAttempts + 1;
        setForgotOtpAttempts(n);
        if (n >= OTP_MAX_ATTEMPTS) {
          setForgotOtpLockedUntil(Date.now() + OTP_LOCKOUT_DURATION);
          setForgotOtpError(
            "Maximum OTP attempts reached. Locked out for 2 hours.",
          );
        } else {
          setForgotOtpError(
            `Invalid OTP. ${OTP_MAX_ATTEMPTS - n} attempt(s) remaining.`,
          );
        }
        return;
      }
      setResetToken(data.resetToken || ""); // ← store the token
      setForgotOtpAttempts(0);
      setForgotOtpLockedUntil(null);
      setResetError("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordValidation(false);
      setPasswordErrors([]);
      setStep("forgotReset");
    } catch {
      setForgotOtpError("Verification failed. Please try again.");
    } finally {
      setLoading("");
    }
  };

  const resetPassword = async () => {
    setResetError("");
    if (!newPassword) {
      setResetError("Please enter a new password");
      return;
    }

    const check = validatePasswordStrength(newPassword);
    if (!check.isValid) {
      const msgs = {
        minLength: " at least 8 characters",
        uppercase: " at least 1 uppercase letter",
        lowercase: " at least 1 lowercase letter",
        number: " at least 1 number",
        specialChar: " at least 1 special character",
      };
      setResetError(
        "Password must contain" + check.errors.map((e) => msgs[e]).join("\n"),
      );
      return;
    }
    if (newPassword === password) {
      setResetError(
        "New password must be different from your current password",
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match");
      return;
    }

    setLoading("reset");
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: forgotEmail.trim(),
            newPassword,
            resetToken,
          }),
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setResetError(data.message || "Failed to reset password");
        return;
      }
      setResetToken("");
      setStep("resetDone");
    } catch {
      setResetError("Failed to reset password. Please try again.");
    } finally {
      setLoading("");
    }
  };

  const getOrCreateLocalDeviceId = () => {
    let deviceId = localStorage.getItem("device_id");
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("device_id", deviceId);
    }
    return deviceId;
  };

  // ── Step progress index ──
  const getForgotStepIndex = () => {
    if (step === "forgotPassword") return 0;
    if (step === "forgotEmailOtp" || step === "forgotSmsOtp") return 1;
    if (step === "forgotReset") return 2;
    if (step === "resetDone") return 3;
    return -1;
  };

  if (showSplash)
    return (
      <div className="splash">
        <img src={logo} alt="iFranchise" className="splash-logo" />
        <style>{styles(welcome)}</style>
      </div>
    );

  const otpIsLocked = otpLockedUntil && Date.now() < otpLockedUntil;
  const forgotOtpIsLocked =
    forgotOtpLockedUntil && Date.now() < forgotOtpLockedUntil;

  // Reusable step bar for forgot password (4 steps)
  const ForgotStepBar = () => (
    <div className="step-progress">
      {["Method", "Verify", "Reset", "Done"].map((label, i) => (
        <React.Fragment key={label}>
          <div className="step-item">
            <div
              className={`step-circle ${getForgotStepIndex() >= i ? "step-active" : ""} ${getForgotStepIndex() > i ? "step-done" : ""}`}
            >
              {getForgotStepIndex() > i ? "✓" : i + 1}
            </div>
            <span
              className={`step-label ${getForgotStepIndex() >= i ? "step-label-active" : ""}`}
            >
              {label}
            </span>
          </div>
          {i < 3 && (
            <div
              className={`step-line ${getForgotStepIndex() > i ? "step-line-active" : ""}`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="page">
      <div className="field-dot" />
      <div className="blob blob-a" />
      <div className="blob blob-b" />

      {loading === "sms" && (
        <>
          <style>{`
            @keyframes spin {
              0%   { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(18,36,27,0.55)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(6px)",
            }}
          >
            <div
              style={{
                background: "var(--white)",
                borderRadius: 24,
                padding: "40px 48px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                boxShadow: "0 24px 80px var(--shadow-strong)",
                minWidth: 260,
                border: "1px solid var(--line)",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  border: "5px solid var(--pale)",
                  borderTop: "5px solid var(--green-900)",
                  borderRadius: "50%",
                  animation: "spin 0.9s linear infinite",
                }}
              />
              <p
                style={{
                  margin: 0,
                  fontWeight: 700,
                  fontSize: 16,
                  color: "var(--green-900)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Sending SMS OTP...
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: "var(--muted)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
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
          <button
            type="button"
            className="back-btn"
            onClick={() => {
              if (step === "otp") {
                setStep("login");
                setOtp(["", "", "", "", "", ""]);
                setOtpError("");
              } else if (step === "forgotPassword") {
                setStep("login");
                setChoiceError("");
              } else if (step === "forgotEmailOtp" || step === "forgotSmsOtp") {
                setStep("forgotPassword");
                setForgotOtp(["", "", "", "", "", ""]);
                setForgotOtpError("");
              } else if (step === "forgotReset") {
                setStep(
                  forgotOtpMethod === "sms" ? "forgotSmsOtp" : "forgotEmailOtp",
                );
                setResetError("");
              }
            }}
          >
            ← Back
          </button>
        )}

        {/* ── LOGIN ── */}
        {step === "login" && (
          <>
            <link
              href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
              rel="stylesheet"
            />
            <button
              type="button"
              className="back-btn"
              disabled={!!loading}
              onClick={() => navigate("/")}
            >
              ← Back
            </button>
            <span className="eyebrow">Welcome, Partner!</span>
            <h2 style={{ marginTop: 8 }}>LOGIN</h2>
            <p className="login-subtext">Enter your credentials below</p>
            {authError && <p className="error general">{authError}</p>}
            <div className="input-container">
              <input
                type="email"
                name="email"
                aria-label="Email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                onFocus={prepareLocation}
                disabled={!!loading}
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({ ...errors, email: "" });
                  setAuthError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    login();
                  }
                }}
              />
              {errors.email && (
                <span className="field-error">{errors.email}</span>
              )}
            </div>
            <div className="input-container">
              <div className="password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  name="password"
                  aria-label="Password"
                  autoComplete="current-password"
                  onFocus={prepareLocation}
                  disabled={!!loading}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({ ...errors, password: "" });
                    setAuthError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      login();
                    }
                  }}
                  className="password-input"
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span className="field-error">{errors.password}</span>
              )}
              <button
                className="forgot-link"
                disabled={!!loading}
                onClick={handleForgotPasswordOpen}
              >
                Forgot Password?
              </button>
            </div>
            <button
              className="btn"
              onClick={login}
              disabled={!!loading || isLocked}
            >
              {loading === "login" ? (
                <>
                  <span className="sms-spinner" /> Logging in...
                </>
              ) : (
                "LOGIN"
              )}
            </button>
          </>
        )}

        {/* ── LOGIN OTP ── */}
        {step === "otp" && (
          <>
            <span className="eyebrow">Verification</span>
            <h2 style={{ marginTop: 8 }}>Verify OTP</h2>

            <p className="step-subtitle">
              {otpMethod === "email" ? (
                <>
                  A 6-digit code was sent to:{" "}
                  <strong style={{ color: "var(--green-900)" }}>
                    {otpEmail}
                  </strong>
                </>
              ) : (
                <>
                  A 6-digit SMS OTP was sent to:{" "}
                  <strong style={{ color: "var(--green-900)" }}>
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
              loading={loading}
              loadingKey="otp"
              resendKey="resend"
              handleOtpChange={handleOtpChange}
              handleOtpKeyDown={handleOtpKeyDown}
              handleOtpPaste={handleOtpPaste}
              setResendDisabled={setResendDisabled}
              setResendTimer={setResendTimer}
              setLoading={setLoading}
              resendDisabled={resendDisabled}
              resendTimer={resendTimer}
              OTP_MAX_ATTEMPTS={OTP_MAX_ATTEMPTS}
              trustDeviceCheckbox={
                <div style={{ textAlign: "left", marginBottom: 12 }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 12,
                      color: "var(--muted)",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={trustDevice}
                      onChange={(e) => setTrustDevice(e.target.checked)}
                      style={{
                        accentColor: "var(--green-900)",
                        width: 15,
                        height: 15,
                        flexShrink: 0,
                      }}
                    />
                    Don't ask again on this device for 30 days
                  </label>
                </div>
              }
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

            {loading === "sms" && (
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
            <h2 style={{ fontSize: "21px", marginTop: 12 }}>Reset Password</h2>
            <p className="step-subtitle">
              Choose how you would like to receive your OTP.
            </p>

            {forgotOtpIsLocked && (
              <div className="error general locked-banner">
                Account locked due to too many attempts. Try again in{" "}
                <strong>{forgotOtpLockRemaining}</strong>.
              </div>
            )}
            {choiceError && !forgotOtpIsLocked && (
              <p className="error general">{choiceError}</p>
            )}

            <button
              className={`method-btn ${forgotOtpIsLocked ? "btn-disabled" : ""}`}
              onClick={!forgotOtpIsLocked ? handleChooseEmail : undefined}
              disabled={!!forgotOtpIsLocked || !!loading}
            >
              <div className="method-btn-title">
                {loading === "choiceEmail" ? (
                  <>
                    <span className="sms-spinner" /> Sending...
                  </>
                ) : (
                  "Send via Email"
                )}
              </div>
              <div className="method-btn-sub">
                {forgotEmail || "your registered email"}
              </div>
            </button>

            <button
              className={`method-btn ${forgotOtpIsLocked || loading ? "btn-disabled" : ""}`}
              onClick={
                !forgotOtpIsLocked && !loading ? handleChooseSms : undefined
              }
              disabled={!!forgotOtpIsLocked || !!loading}
              style={{ marginTop: 12 }}
            >
              <div className="method-btn-title">
                {loading === "choiceSms" ? (
                  <>
                    <span className="sms-spinner" /> Sending...
                  </>
                ) : (
                  "Send via SMS"
                )}
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
            <p className="step-subtitle">
              A 6-digit code was sent to:{" "}
              <strong style={{ color: "var(--green-900)" }}>
                {forgotEmail}
              </strong>
            </p>
            <OtpEntryBlock
              otpArr={forgotOtp}
              setOtpArr={setForgotOtp}
              refs={forgotOtpRefs}
              isLocked={forgotOtpIsLocked}
              lockRemaining={forgotOtpLockRemaining}
              error={forgotOtpError}
              attempts={forgotOtpAttempts}
              onVerify={verifyForgotEmailOtp}
              resendEndpoint="/send-forgot-password-otp"
              resendBody={{ email: forgotEmail }}
              loading={loading}
              loadingKey="forgotOtp"
              resendKey="resend"
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
            <p className="step-subtitle">
              A 6-digit code was sent to:{" "}
              <strong style={{ color: "var(--green-900)" }}>
                {maskedPhone}
              </strong>
            </p>
            <OtpEntryBlock
              otpArr={forgotOtp}
              setOtpArr={setForgotOtp}
              refs={forgotOtpRefs}
              isLocked={forgotOtpIsLocked}
              lockRemaining={forgotOtpLockRemaining}
              error={forgotOtpError}
              attempts={forgotOtpAttempts}
              onVerify={verifyForgotSmsOtp}
              resendEndpoint="/send-sms-otp"
              resendBody={{ email: forgotEmail }}
              loading={loading}
              loadingKey="forgotOtp"
              resendKey="resend"
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
            <p className="step-subtitle">
              Enter and confirm your new password below.
            </p>
            {resetError && (
              <p className="error general" style={{ whiteSpace: "pre-line" }}>
                {resetError}
              </p>
            )}

            <div className="input-container">
              <div className="password-wrap">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNewPassword(v);
                    setResetError("");
                    if (v) {
                      setShowPasswordValidation(true);
                      setPasswordErrors(validatePasswordStrength(v).errors);
                    } else {
                      setShowPasswordValidation(false);
                      setPasswordErrors([]);
                    }
                  }}
                  onCopy={preventCopyPaste}
                  onPaste={preventCopyPaste}
                  onCut={preventCopyPaste}
                  className="password-input"
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {showPasswordValidation && (
                <div className="pw-checklist">
                  <div className="pw-checklist-title">
                    Password must contain:
                  </div>
                  {[
                    { key: "minLength", label: "At least 8 characters" },
                    {
                      key: "uppercase",
                      label: "At least one uppercase letter (A-Z)",
                    },
                    {
                      key: "lowercase",
                      label: "At least one lowercase letter (a-z)",
                    },
                    { key: "number", label: "At least one number (0-9)" },
                    {
                      key: "specialChar",
                      label: "At least one special character (!@#$%^&*...)",
                    },
                  ].map(({ key, label }) => (
                    <div
                      key={key}
                      className={`pw-check-row ${!passwordErrors.includes(key) ? "pw-check-pass" : "pw-check-fail"}`}
                    >
                      {passwordErrors.includes(key) ? "x" : "✓"} {label}
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
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setResetError("");
                  }}
                  onCopy={preventCopyPaste}
                  onPaste={preventCopyPaste}
                  onCut={preventCopyPaste}
                  onKeyPress={(e) => e.key === "Enter" && resetPassword()}
                  className="password-input"
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              className="btn yellow"
              onClick={resetPassword}
              disabled={loading === "reset"}
            >
              {loading === "reset" ? (
                <>
                  <span className="sms-spinner" /> Resetting...
                </>
              ) : (
                "RESET PASSWORD"
              )}
            </button>
          </>
        )}

        {step === "resetDone" && (
          <div className="done-wrap">
            <div className="done-icon">
              <CheckCircle size={60} color="var(--green-900)" />
            </div>
            <h2>Password Reset!</h2>
            <p className="step-subtitle">
              Your password has been updated. You can now log in with your new
              password.
            </p>
            <p style={{ color: "var(--muted)", fontSize: 15, marginTop: -8 }}>
              Redirecting to login in {resetDoneCountdown}s...
            </p>
          </div>
        )}
      </div>
      <style>{styles(welcome)}</style>
    </div>
  );
}

const styles = (bgImage) => `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

* { box-sizing: border-box; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }

:root {
  --cream: #F6F7F1;
  --white: #FFFFFF;
  --ink: #12241B;
  --muted: #5C6B60;
  --green-900: #3b791e;
  --green-700: #438f1a;
  --green-600: #509820;
  --green-500: #3f811e;
  --lime: #bdd43c;
  --lime-ink: #24310C;
  --line: #E1E6D8;
  --pale: #E7EFDA;
  --shadow: rgba(50, 109, 32, 0.12);
  --shadow-strong: rgba(14, 59, 34, 0.24);
}

.splash {
  min-height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center;
  background-image: linear-gradient(rgba(246,247,241,0.85), rgba(189,212,60,0.16)), url(${bgImage});
  background-size:cover; position:relative; overflow:hidden;
}
.splash-logo { width:300px; animation: zoom 3s ease forwards; position:relative; z-index:1; }
@keyframes zoom { from { transform: scale(.3); opacity:0 } to { transform: scale(1); opacity:1 } }

.page {
  min-height:100vh;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:flex-start;
  padding:40px 20px 20px;

  background-image:
    linear-gradient(
      rgba(246,247,241,0.85),
      rgba(189,212,60,0.16)
    ),
    url(${bgImage});

  background-size:cover;
  background-position:center;
  background-repeat:no-repeat;

  position:relative;
  overflow:hidden;
}
.field-dot {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(var(--line) 1.4px, transparent 1.4px);
  background-size: 26px 26px;
  -webkit-mask-image: radial-gradient(ellipse 70% 55% at 50% 0%, #000 0%, transparent 70%);
  mask-image: radial-gradient(ellipse 70% 55% at 50% 0%, #000 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.blob { position:absolute; border-radius:50%; filter:blur(80px); opacity:0.45; pointer-events:none; z-index:0; }
.blob-a { width:420px; height:420px; background:var(--lime); opacity:0.18; top:-160px; right:-140px; }
.blob-b { width:360px; height:360px; background:var(--green-600); opacity:0.14; bottom:-160px; left:-140px; }

.card {
  background:var(--white);
  width:100%; max-width:400px;
  padding:36px 30px 30px;
  border-radius:28px;
  border:1px solid var(--line);
  box-shadow:0 24px 60px var(--shadow);
  text-align:center;
  position:relative;
  z-index:1;
}
.logo { width:200px; height:auto; margin-top:100px; margin-bottom:20px; position:relative; z-index:1; }

.eyebrow {
  display:inline-flex; align-items:center; gap:0.5rem;
  font-size:0.72rem; font-weight:700; letter-spacing:0.14em; text-transform:uppercase;
  color:var(--green-700); margin-bottom:0.2rem;
}

h2 { margin:12px 0 4px; color:var(--green-900); font-size:22px; font-weight:800; letter-spacing:-0.01em; }
p { color:var(--muted); font-size:13px; margin-bottom:16px; }
.step-subtitle { color:var(--muted); font-size:13px; margin-bottom:24px; margin-top:2px; }
.login-subtext { font-size:13px; color:var(--muted); margin-bottom:18px; margin-top:0; }

.input-container { margin-bottom:18px; position:relative; width:100%; text-align:left; }
input[type="text"], input[type="email"], input[type="password"], 

input:not([type]) {
  width:100%; padding:13px 14px; border-radius:14px; border:1.5px solid var(--line); outline:none;
  font-size:14px; background:var(--cream); transition: border-color 0.2s, background 0.2s;
  color:var(--ink);
}
input:focus { border-color:var(--green-600); background:var(--white); }
input:disabled { background:#f0f1ec; color:#888; cursor:not-allowed; }

.password-wrap { position:relative; display:flex; align-items:center; }
.password-wrap input.password-input { width:100%; padding-right:42px; }
.password-input::-ms-reveal,
.password-input::-ms-clear {
  display: none;
}

.password-input::-webkit-credentials-auto-fill-button {
  display: none !important;
}
.eye-btn { position:absolute; right:12px; background:none; border:none; cursor:pointer; font-size:16px; padding:0; line-height:1; color:var(--muted); display:flex; align-items:center; }
.field-error { color:#d32f2f; font-size:11px; margin-top:4px; display:block; }

.btn {
  width:100%; padding:14px; border-radius:999px; border:none;
  background:var(--green-900); color:white; font-weight:700; cursor:pointer; font-size:14px;
  letter-spacing:0.3px; transition:background 0.25s, box-shadow 0.25s, transform 0.15s;
  box-shadow:0 10px 24px var(--shadow);
}
.btn:hover:not(:disabled) { background:var(--green-700); box-shadow:0 14px 30px var(--shadow-strong); }
.btn:active:not(:disabled) { transform:scale(0.98); }
.btn.yellow { background:var(--green-900); margin-top:8px; }
.btn.yellow:hover:not(:disabled) { background:var(--green-700); }
.btn-disabled { opacity:0.55; cursor:not-allowed !important; }

/* ── Method choice buttons ── */
.method-btn {
  width:100%; padding:14px 16px; border-radius:16px;
  border:1.5px solid var(--line); background:var(--cream);
  cursor:pointer; text-align:left; transition:border-color 0.2s, background 0.2s;
  display:block;
}
.method-btn:hover:not(:disabled) { border-color:var(--green-600); background:var(--pale); }
.method-btn:disabled { opacity:0.5; cursor:not-allowed; }
.method-btn-title { font-size:14px; font-weight:700; color:var(--ink); margin-bottom:3px; }
.method-btn-sub { font-size:12px; color:var(--muted); letter-spacing:1px; }

.forgot-link { background:none; border:none; color:var(--green-700); text-decoration:underline; font-size:12px; cursor:pointer; margin-top:6px; display:block; text-align:right; width:100%; }
.forgot-link:hover { color:var(--green-900); }

.link-resend { background:none; border:none; color:var(--green-700); text-decoration:underline; font-size:12px; margin-top:12px; cursor:pointer; display:block; transition:color 0.2s; }
.link-resend:hover:not(:disabled) { color:var(--green-900); }
.link-resend:disabled { color:#999; cursor:not-allowed; text-decoration:none; }

.error.general { color:#d32f2f; font-size:12px; margin-bottom:14px; padding:10px 12px; background:#fdecea; border-radius:12px; text-align:center; line-height:1.5; border:1px solid #f5c6c2; }
.locked-banner { border-left:3px solid #d32f2f; }

.back-btn { position:absolute; top:15px; left:15px; background:none; border:none; color:var(--green-900); font-weight:700; cursor:pointer; font-size:13px; }
.back-btn:hover { text-decoration:underline; }

.remember-wrap { display:flex; justify-content:flex-start; margin-bottom:16px; margin-top:-6px; }
.remember-label { display:flex; align-items:center; gap:8px; cursor:pointer; user-select:none; }
.remember-checkbox { width:16px; height:16px; accent-color:var(--green-900); cursor:pointer; }
.remember-text { font-size:12px; color:var(--muted); }

/* ── Step Progress ── */
.step-progress { display:flex; align-items:center; justify-content:center; margin:8px 0 22px; gap:0; }
.step-item { display:flex; flex-direction:column; align-items:center; gap:5px; }
.step-circle { width:26px; height:26px; border-radius:50%; background:var(--line); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#fff; transition:background 0.3s; }
.step-active { background:var(--green-900) !important; }
.step-done { background:var(--green-600) !important; }
.step-label { font-size:9px; color:#aaa; font-weight:600; letter-spacing:0.3px; }
.step-label-active { color:var(--green-900); }
.step-line { width:24px; height:2px; background:var(--line); margin:0 3px; margin-bottom:18px; transition:background 0.3s; }
.step-line-active { background:var(--green-600); }

/* ── OTP Boxes ── */
.otp-box-wrap { display:flex; gap:10px; justify-content:center; margin-bottom:18px; margin-top:6px; }
.otp-box { width:46px !important; height:52px; text-align:center; font-size:22px; font-weight:700; border:2px solid var(--line); border-radius:14px; background:var(--cream); outline:none; transition:border-color 0.2s, background 0.2s; color:var(--green-900); padding:0 !important; caret-color:var(--green-900); }
.otp-box:focus { border-color:var(--green-600); background:var(--pale); }
.otp-box:not(:placeholder-shown) { border-color:var(--green-600); }
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
  border-radius:14px;
  background:var(--pale);
  color:var(--green-900);
  font-weight:700;
  font-size:13px;
  cursor:pointer;
  transition:all .2s ease;
  border:1px solid var(--green-600);
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
.pw-checklist { margin-top:8px; font-size:12px; padding:10px 12px; background:var(--cream); border-radius:12px; border:1px solid var(--line); text-align:left; }
.pw-checklist-title { margin-bottom:6px; font-weight:700; color:var(--ink); }
.pw-check-row { margin-bottom:3px; }
.pw-check-pass { color:var(--green-900); }
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
  border-radius:14px;
  background:var(--pale);
  color:var(--green-900);
  font-weight:700;
  font-size:13px;
  cursor:pointer;
  transition:all .2s ease;
  border:1px solid var(--green-600);
}

/* ── SMS Loading Overlay ── */
.sms-loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.92);
  border-radius: 28px;
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
  color: var(--green-900);
  margin: 0;
}

.sms-loading-sub {
  font-size: 12px;
  color: var(--muted);
  margin: 0;
}

.sms-spinner-large {
  width: 48px;
  height: 48px;
  border: 5px solid var(--pale);
  border-top: 5px solid var(--green-900);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

.sms-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top: 2px solid var(--green-900);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 6px;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
.use-sms-btn:hover{
  background:#dcfce7;
  transform:translateY(-1px);
}

.otp-box-verifying {
  opacity: 0.6;
}

.otp-verifying-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--green-900);
  margin: -8px 0 16px;
}

/* Survey credentials stay compact inside the existing login card. */
.survey-test-box { margin-top:20px; padding:12px; background:var(--cream); border:1px solid var(--line); border-radius:12px; text-align:left; }
.survey-test-title { display:block; color:var(--green-900); font-size:10px; letter-spacing:.4px; }
.survey-test-note { margin:5px 0 8px; font-size:11px; line-height:1.5; }
.survey-test-account { display:block; width:100%; padding:7px 3px; border:0; border-bottom:1px solid var(--line); border-radius:4px; background:transparent; color:var(--ink); font-size:10px; line-height:1.6; text-align:left; overflow-wrap:anywhere; cursor:pointer; }
.survey-test-account:last-child { border-bottom:0; }
.survey-test-account:hover:not(:disabled) { background:var(--pale); }
.survey-test-account:focus-visible { outline:2px solid var(--green-900); outline-offset:2px; }
.survey-test-account:disabled, .btn:disabled { opacity:.6; cursor:not-allowed; }

/* ── Done state ── */
.done-wrap { display:flex; flex-direction:column; align-items:center; padding:10px 0; }
.done-icon { margin-bottom:10px; }
.done-wrap h2 { margin-bottom:8px; }
.done-wrap p { max-width:280px; }
`;
