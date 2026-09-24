const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,

  // Each email gets its own rate-limit counter
  keyGenerator: (req) => {
    const email = req.body?.email;

    if (typeof email === "string" && email.trim()) {
      return `login:${email.trim().toLowerCase()}`;
    }

    // No email was provided.
    // Validation in /login will reject this anyway.
    return "login:no-email";
  },

  skipSuccessfulRequests: true,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
});

const sendOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 3,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    message:
      "Too many OTP requests. Please wait 10 minutes before requesting another code.",
  },
});

const verifyOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    message:
      "Too many OTP verification attempts. Please try again after 10 minutes.",
  },
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    message:
      "Too many password reset attempts. Please try again after 15 minutes.",
  },
});

module.exports = {
  loginLimiter,
  sendOtpLimiter,
  verifyOtpLimiter,
  passwordResetLimiter,
};
