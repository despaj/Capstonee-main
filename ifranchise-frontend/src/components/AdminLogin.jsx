import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/iFranchise_logo.png";
import welcome from "../assets/welcomepage.png";
import AdminDashboard from "./AdminDashboard";
import StaffDashboard from "./StaffDashboard";
import FranchiseeDashboard from "./FranchiseeDashboard";
import FranchisorDashboard from "./FranchisorDashboard";
import ManagerDashboard from "./ManagerDashboard";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const [step, setStep] = useState("login"); 

  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");

  // Forgot Password states
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
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
  const MAX_ATTEMPTS = 3;
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);


  // ===== CHECK FOR EXISTING SESSION ON MOUNT =====
  useEffect(() => {
    const checkExistingSession = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user && user.role) {
            setLoggedIn(true);
            setUserRole(user.role);
          }
        } catch (err) {
          console.error("Error parsing stored user:", err);
          localStorage.removeItem("user");
        }
      }
      setIsCheckingSession(false);
    };

    checkExistingSession();
  }, []);

  useEffect(() => {
    // Only check lockout for the current email being entered
    if (!email) return;
    
    const lockoutKey = `loginLockout_${email.toLowerCase()}`;
    const attemptsKey = `loginAttempts_${email.toLowerCase()}`;
    
    const storedLockoutTime = localStorage.getItem(lockoutKey);
    const storedAttempts = localStorage.getItem(attemptsKey);

    if (storedLockoutTime) {
      const lockTime = parseInt(storedLockoutTime);
      const currentTime = Date.now();
      if (currentTime < lockTime) {
        setIsLocked(true);
        setLockoutTime(lockTime);
        setLoginAttempts(MAX_ATTEMPTS);
      } else {
        localStorage.removeItem(lockoutKey);
        localStorage.removeItem(attemptsKey);
        setIsLocked(false);
        setLoginAttempts(0);
      }
    } else if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts));
    } else {
      setLoginAttempts(0);
      setIsLocked(false);
    }
  }, [email]); // Re-check when email changes

  // ===== Splash timer =====
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // ===== Lockout timer =====
  useEffect(() => {
    if (isLocked && lockoutTime && email) {
      const interval = setInterval(() => {
        if (Date.now() >= lockoutTime) {
          setIsLocked(false);
          setLockoutTime(null);
          setLoginAttempts(0);
          
          // Clear account-specific lockout
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


  // ===== Login: validate email & password =====
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
      // credentials: "include" sends the httpOnly device_token cookie automatically
      const res = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim(), 
          password: password.trim()
        }),
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

        if (data.skipOtp) {
          // ✅ Device trusted (cookie matched server-side) → login directly
          localStorage.setItem("user", JSON.stringify(data.user));
          setLoggedIn(true);
          setUserRole(data.user.role);
        } else {
          // ❗ OTP required
          setOtpEmail(email.trim());
          localStorage.setItem("tempUser", JSON.stringify(data.user));
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
      
      // Store attempts per email
      const attemptsKey = `loginAttempts_${email.toLowerCase()}`;
      localStorage.setItem(attemptsKey, newAttemptCount.toString());

      if (newAttemptCount >= MAX_ATTEMPTS) {
        const lockTime = Date.now() + LOCKOUT_DURATION;
        setIsLocked(true);
        setLockoutTime(lockTime);
        
        // Store lockout per email
        const lockoutKey = `loginLockout_${email.toLowerCase()}`;
        localStorage.setItem(lockoutKey, lockTime.toString());
        setAuthError(`Too many failed attempts. Account locked for 15 minutes.`);
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
      const res = await fetch("http://localhost:5001/send-otp-after-login", {
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
    
    if (!otp || otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      // credentials: "include" receives the device_token cookie set by the server
      const res = await fetch("http://localhost:5001/verify-otp-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail.trim(), otp: otp.trim() }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        return setOtpError(data.message || "Invalid OTP");
      }

      // OTP verified → complete login
      // The server already set the device_token httpOnly cookie via credentials: "include"
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.removeItem("tempUser");
      
      setLoggedIn(true);
      setUserRole(data.user.role);
    } catch (err) {
      console.error(err);
      setOtpError("OTP verification failed");
    }
  };

  // ===== FORGOT PASSWORD: Send OTP =====
  const sendForgotPasswordOtp = async () => {
    setForgotError("");

    if (!forgotEmail) {
      setForgotError("Please enter your email address");
      return;
    }

    setStep("forgotPasswordOtp");

    try {
      // credentials: "include" so the cookie jar is available for the reset step
      const res = await fetch("http://localhost:5001/send-forgot-password-otp", {
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
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const errors = [];

  if (password.length < minLength) errors.push("minLength");
  if (!hasUpperCase) errors.push("uppercase");
  if (!hasLowerCase) errors.push("lowercase");
  if (!hasNumber) errors.push("number");
  if (!hasSpecialChar) errors.push("specialChar");

  return {
    isValid: errors.length === 0,
    errors,
  };
};

  // ===== FORGOT PASSWORD: Verify OTP and Reset Password =====
  const resetPassword = async () => {
    setForgotError("");

    // Validation
    if (!resetOtp || resetOtp.length !== 6) {
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
        minLength: "• At least 8 characters",
        uppercase: "• At least 1 uppercase letter",
        lowercase: "• At least 1 lowercase letter",
        number: "• At least 1 number",
        specialChar: "• At least 1 special character",
      };

      const errorText =
        "Password must contain:\n" +
        passwordCheck.errors.map(err => messages[err]).join("\n");

      setForgotError(errorText);
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError("Passwords do not match");
      return;
    }

    try {
      // credentials: "include" is the key fix — this tells the browser to:
      //   1) Send any existing cookies with the request
      //   2) Store any Set-Cookie headers the server sends back (the new device_token)
      const res = await fetch("http://localhost:5001/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          otp: resetOtp.trim(),
          newPassword: newPassword,
        }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setForgotError(data.message || "Failed to reset password");
        return;
      }

      alert("Password reset successfully! Please login with your new password.");

      // Reset all forgot password states
      setForgotEmail("");
      setResetOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setStep("login");
    } catch (err) {
      console.error(err);
      setForgotError("Failed to reset password. Please try again.");
    }
  };


  // ===== Logout =====
  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      try {
        // Call backend to clear device token from DB and clear the cookie
        await fetch("http://localhost:5001/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch (err) {
        console.error("Logout error:", err);
      }
      
      localStorage.removeItem("user");
      localStorage.removeItem("tempUser");
      setLoggedIn(false);
      setUserRole(null);
      setStep("login");
      setEmail("");
      setPassword("");
      setOtp("");
      setOtpEmail("");
    }
  };

  // Show loading while checking session
  if (isCheckingSession) {
    return (
      <div className="splash">
        <img src={logo} alt="logo" className="splash-logo" />
        <style>{styles(welcome)}</style>
      </div>
    );
  }

  // ===== Render dashboards based on role =====
  if (loggedIn && userRole) {
    switch (userRole) {
      case "Administrator":
        return <AdminDashboard onLogout={handleLogout} />;
      case "Franchisee":
        return <FranchiseeDashboard onLogout={handleLogout} />;
      case "Franchisor":
        return <FranchisorDashboard onLogout={handleLogout} />;
      case "Manager":
        return <ManagerDashboard onLogout={handleLogout} />;
      case "Staff":
        return <StaffDashboard onLogout={handleLogout} />;
      default:
        return (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <h2>Unknown Role: {userRole}</h2>
            <p>Your role is not recognized in the system.</p>
            <button
              style={{
                padding: "10px 20px",
                background: "#2E7D32",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                marginTop: "1rem"
              }}
              onClick={() => {
                localStorage.removeItem("user");
                setLoggedIn(false);
                setUserRole(null);
              }}
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

  // ===== Main UI =====
  return (
    <div className="page">
      <div className="card">
        <button
          className="back-btn"
          onClick={() => {
            if (step === "otp") {
              setStep("emailPrompt");
              setOtp("");
              setOtpError("");
            } else if (step === "emailPrompt") {
              setStep("login");
              setOtpEmail("");
              setOtpError("");
            } else if (step === "forgotPassword") {
              setStep("login");
              setForgotEmail("");
              setForgotError("");
            } else if (step === "forgotPasswordOtp") {
              setStep("forgotPassword");
              setResetOtp("");
              setNewPassword("");
              setConfirmPassword("");
              setForgotError("");
            } else {
              window.history.back();
            }
          }}
        >
          ← Back
        </button>

        {step === "login" && (
          <>
            <img src={logo} alt="logo" className="logo" />
            <h2>LOGIN</h2>
            {authError && <p className="error general">{authError}</p>}
            <div className="input-container">
              <input
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({ ...errors, email: "", general: "" });
                  setAuthError("");
                }}
                onKeyPress={(e) => e.key === "Enter" && login()}
              />
            </div>
            <div className="input-container">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: "", general: "" });
                  setAuthError("");
                }}
                onKeyPress={(e) => e.key === "Enter" && login()}
              />
              <button 
                className="forgot-link"
                onClick={() => setStep("forgotPassword")}
              >
                Forgot Password?
              </button>
            </div>
            <button className="btn" onClick={login}>
              LOGIN
            </button>
          </>
        )}

        {step === "forgotPassword" && (
          <>
            <h2>Forgot Password</h2>
            <p>Enter your email address to receive an OTP</p>
            {forgotError && <p className="error general">{forgotError}</p>}
            <div className="input-container">
              <input
                placeholder="Email Address"
                type="email"
                value={forgotEmail}
                onChange={(e) => {
                  setForgotEmail(e.target.value);
                  setForgotError("");
                }}
                onKeyPress={(e) => e.key === "Enter" && sendForgotPasswordOtp()}
              />
            </div>
            <button className="btn yellow" onClick={sendForgotPasswordOtp}>
              SEND OTP
            </button>
          </>
        )}

        {step === "forgotPasswordOtp" && (
          <>
            <h2>Reset Password</h2>
            <p>OTP sent to: <b>{forgotEmail}</b></p>
            {forgotError && <p className="error general">{forgotError}</p>}
            <div className="input-container">
              <input
                placeholder="Enter 6-digit OTP"
                value={resetOtp}
                maxLength={6}
                style={{ textAlign: "center", letterSpacing: "8px", fontSize: "20px" }}
                onChange={(e) => {
                  setResetOtp(e.target.value.replace(/\D/g, ""));
                  setForgotError("");
                }}
              />
            </div>
           <div className="input-container">
  <input
    type="password"
    placeholder="New Password"
    value={newPassword}
    onChange={(e) => {
      const value = e.target.value;
      setNewPassword(value);
      setForgotError("");

      if (value) {
        setShowPasswordValidation(true);
        const validation = validatePasswordStrength(value);
        setPasswordErrors(validation.errors);
      } else {
        setShowPasswordValidation(false);
        setPasswordErrors([]);
      }
    }}
  />

{/* Password Validation Display */}
{showPasswordValidation && (
  <div style={{ 
    marginTop: '8px',
    fontSize: '12px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    border: '1px solid #dee2e6',
    textAlign: 'left'   // 👈 THIS FIXES THE CENTERING
  }}>
    <div style={{ marginBottom: '6px', fontWeight: '600', color: '#495057' }}>
      Password must contain:
    </div>

    <div style={{ 
      color: passwordErrors.includes('minLength') ? '#dc3545' : '#28a745',
      marginBottom: '4px'
    }}>
      {passwordErrors.includes('minLength') ? '✗' : '✓'} At least 8 characters
    </div>

    <div style={{ 
      color: passwordErrors.includes('uppercase') ? '#dc3545' : '#28a745',
      marginBottom: '4px'
    }}>
      {passwordErrors.includes('uppercase') ? '✗' : '✓'} At least one uppercase letter (A-Z)
    </div>

    <div style={{ 
      color: passwordErrors.includes('lowercase') ? '#dc3545' : '#28a745',
      marginBottom: '4px'
    }}>
      {passwordErrors.includes('lowercase') ? '✗' : '✓'} At least one lowercase letter (a-z)
    </div>

    <div style={{ 
      color: passwordErrors.includes('number') ? '#dc3545' : '#28a745',
      marginBottom: '4px'
    }}>
      {passwordErrors.includes('number') ? '✗' : '✓'} At least one number (0-9)
    </div>

    <div style={{ 
      color: passwordErrors.includes('specialChar') ? '#dc3545' : '#28a745'
    }}>
      {passwordErrors.includes('specialChar') ? '✗' : '✓'} At least one special character (!@#$%^&*...)
    </div>
  </div>
)}

</div>
            <div className="input-container">
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setForgotError("");
                }}
                onKeyPress={(e) => e.key === "Enter" && resetPassword()}
              />
            </div>
            <button className="btn yellow" onClick={resetPassword}>
              RESET PASSWORD
            </button>
            <button
              className="link-resend"
              onClick={async () => {
                if (resendDisabled) return;

                setForgotError("");
                try {
                  setResendDisabled(true);
                  setResendTimer(30);

                  const res = await fetch("http://localhost:5001/send-forgot-password-otp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: forgotEmail }),
                    credentials: "include",
                  });

                  const data = await res.json();
                  if (!res.ok) throw new Error(data.message || "Failed to resend OTP");

                  alert("OTP resent successfully");
                } catch (err) {
                  console.error(err);
                  setForgotError("Failed to resend OTP. Try again.");
                  setResendDisabled(false);
                }
              }}
              disabled={resendDisabled}
            >
              {resendDisabled ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
            </button>
          </>
        )}

        {step === "emailPrompt" && (
          <>
            <h2>Confirm Email for OTP</h2>
            <p>OTP will be sent to this email. You can edit it if needed.</p>
            {otpError && <p className="error general">{otpError}</p>}
            <div className="input-container">
              <input
                placeholder="Email for OTP"
                value={otpEmail}
                onChange={(e) => {
                  setOtpEmail(e.target.value);
                  setOtpError("");
                }}
                onKeyPress={(e) => e.key === "Enter" && sendOtp()}
              />
            </div>
            <button className="btn yellow" onClick={sendOtp}>
              SEND OTP
            </button>
            <button className="link-small" onClick={() => setStep("login")}>
              Back to Login
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <h2>Enter OTP</h2>
            <p>We sent a 6-digit code to: <b>{otpEmail}</b></p>
            {otpError && <p className="error general">{otpError}</p>}
            <div className="input-container">
              <input
                placeholder="Enter OTP"
                value={otp}
                maxLength={6}
                style={{ textAlign: "center", letterSpacing: "8px", fontSize: "20px" }}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  setOtpError("");
                }}
                onKeyPress={(e) => e.key === "Enter" && verifyOtp()}
              />
            </div>
            <button className="btn yellow" onClick={verifyOtp}>
              VERIFY OTP
            </button>
            <button className="link-small" onClick={() => setStep("emailPrompt")}>
              Change Email
            </button>
            <button
              className="link-resend"
              onClick={async () => {
                if (resendDisabled) return;

                setOtpError("");
                try {
                  setResendDisabled(true);
                  setResendTimer(30);

                  const res = await fetch("http://localhost:5001/send-otp-after-login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: otpEmail }),
                    credentials: "include",
                  });

                  const data = await res.json();
                  if (!res.ok) throw new Error(data.message || "Failed to resend OTP");

                } catch (err) {
                  console.error(err);
                  setOtpError("Failed to resend OTP. Try again.");
                  setResendDisabled(false);
                }
              }}
              disabled={resendDisabled}
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

.splash { min-height:100vh; display:flex; justify-content:center; align-items:center; background: linear-gradient(135deg, #e3f9d1, #E8F5E9); }
.splash-logo { width:150px; animation: zoom 3s ease forwards; }
@keyframes zoom { from { transform: scale(.3); opacity:0 } to { transform: scale(1); opacity:1 } }

.page { min-height:100vh; display:flex; justify-content:center; align-items:center; padding:20px; background-image: linear-gradient(rgba(255,255,255,0.85), rgba(211,255,201,0.85)), url(${bgImage}); background-size:cover; }

.card { background: rgba(255,255,255,0.96); width:100%; max-width:380px; padding:30px; border-radius:20px; box-shadow:0 10px 30px rgba(0,0,0,.1); text-align:center; position:relative; }
.logo { width:90px; margin-top:20px; }

.input-container { margin-bottom:25px; position:relative; width:100%; }
input { width:100%; padding:14px; border-radius:12px; border:1px solid #2E7D32; outline:none; }

.btn { width:100%; padding:15px; border-radius:12px; border:none; background:#2E7D32; color:white; font-weight:bold; cursor:pointer; }
.btn:hover { background:#1B5E20; }

.btn.yellow { background:#cabd2c; margin-top:10px; }
.btn.yellow:hover { background:#b3a728; }

.link-small { background:none; border:none; color:#2E7D32; text-decoration:underline; font-size:12px; margin-top:10px; cursor:pointer; display:block; }
.link-small:hover { color:#1B5E20; }

.forgot-link {
  background: none;
  border: none;
  color: #2E7D32;
  text-decoration: underline;
  font-size: 12px;
  cursor: pointer;
  margin-top: 8px;
  display: block;
  text-align: right;
  width: 100%;
}

.forgot-link:hover {
  color: #1B5E20;
}

.link-resend {
  background: none;
  border: none;
  color: #2E7D32;
  text-decoration: underline;
  font-size: 12px;
  margin-top: 10px;
  cursor: pointer;
  transition: color 0.2s;
  display: block;
}

.link-resend:hover:not(:disabled) {
  color: #1b5e20;
}

.link-resend:disabled {
  color: #999;
  cursor: not-allowed;
  text-decoration: none;
}

.error.general { color:#d32f2f; font-size:13px; margin-bottom:15px; padding:10px; background:#ffebee; border-radius:8px; }

.back-btn {
  position: absolute;
  top: 15px;
  left: 15px;
  background: none;
  border: none;
  color: #2E7D32;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
}

.back-btn:hover {
  text-decoration: underline;
}

`;