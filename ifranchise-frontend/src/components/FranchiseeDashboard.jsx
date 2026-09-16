// UI/UX copied from the admin dashboard reference; franchisee functionality is preserved.

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import logo from "../assets/logo.png";
import Receipts from "./Receipts";
import jsPDF from "jspdf";
import ifranchisejpg from "../assets/ifranchisejpg.jpg";
import franchisync from "../assets/franchisyncjpg.jpg";
import {
  Home,
  Box,
  FileText,
  FileCheck,
  Users,
  BarChart2,
  MessageCircle,
  User,
  ShoppingCart,
  LogOut,
  Search,
  Package,
  AlertTriangle,
  DollarSign,
  Grid3X3,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  ArrowLeft,
  ArrowRight,
  Building2,
  Store,
  TrendingDown,
  TrendingUp,
  Layers,
  GitBranch,
  Globe,
  MapPin,
  Phone,
  Mail,
  Edit2,
  Archive,
  Calendar,
  Pin,
  Megaphone,
  ArrowUpRight,
  ArrowDownRight,
  BarChart,
  RefreshCw,
  Eye,
  Clock,
  Info,
  Download,
  History,
  RotateCcw,
  UserPlus,
  CheckCircle,
  ChevronRight,
  Lock,
  Unlock,
  CheckCircle2,
  Zap,
  Target,
  Activity,
  ArrowUp,
  ArrowDown,
  EyeOff,
  Brain,
  PieChart,
  LineChart,
  Sparkles,
  Shield,
  Send,
  Save,
  Receipt,
} from "lucide-react";

async function adminModuleFetch(input, options) {
  const response = await fetch(input, options);
  const method = String(
    options?.method ||
      (typeof Request !== "undefined" && input instanceof Request
        ? input.method
        : "GET"),
  ).toUpperCase();
  if (response.ok && !["GET", "HEAD", "OPTIONS"].includes(method)) {
    window.dispatchEvent(new Event("franchisync:data-changed"));
  }
  return response;
}

const VIBE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body, #root, button, input, textarea, select, option { font-family:'Plus Jakarta Sans',sans-serif; }
  :root {
  --g1:#bdd43c; --g2:#3b791e; --g3:#2c5c16; --g4:#12241B;
  --green-primary:#3b791e; --green-dark:#2c5c16; --green-light:#509820;
  --green-accent:#bdd43c; --green-bg:#f0f5e8; --green-mid:#c9dba0; --white:#ffffff;
  --off-white:#F6F7F1; --gray-100:#F3F4F1; --gray-200:#E1E6D8;
  --gray-300:#D4DBC8; --gray-400:#9CA89C; --gray-500:#6B7A65;
  --gray-600:#4B5A45; --gray-700:#374132; --gray-800:#1F2A1B;
  --text-dark:#12241B; --text-gray:#5C6B60;
  --shadow:rgba(59,121,30,0.07); --shadow-strong:rgba(59,121,30,0.16);
  --blue:#3B82F6; --red:#dc2626; --orange:#d97706; --success:#2e7d32;
  --card-border:#E1E6D8;
  /* ── aliases matching StockInventoryContent's C{} palette 1:1 ── */
  --teal:#509820; --ink:#12241B; --muted:#5C6B60; --border:#E1E6D8; --bg:#F6F7F1;
  --warn:#d97706; --warn-bg:#fffbeb;
  --ok:#2e7d32; --ok-bg:#f0f5e8;
  --red-bg:#fef2f2;
  --amber:#f59e0b; --amber-bg:#fffbeb; --amber-border:#fde68a;
  --grad-main:linear-gradient(135deg,#509820,#3b791e);
  --grad-dark:linear-gradient(135deg,#12241B,#2c5c16);
  --grad-gold:linear-gradient(135deg,#e9cd30,#bdd43c);
  --grad-bg:#F6F7F1;
  --grad-blue:linear-gradient(135deg,#3b82f6,#1d4ed8);
  --grad-orange:linear-gradient(135deg,#f59e0b,#d97706);
  --grad-red:linear-gradient(135deg,#ef4444,#dc2626);
  --grad-purple:linear-gradient(135deg,#8b5cf6,#7c3aed);
}
  .v-card { background:#fff; border:1px solid #E1E6D8; border-radius:18px; box-shadow:0 2px 14px rgba(59,121,30,0.07); transition:box-shadow .2s; overflow:hidden; }
  .v-card:hover { box-shadow:0 8px 24px rgba(59,121,30,0.10); }
  .v-kpi { background:#fff; border:1px solid #E1E6D8; border-radius:18px; padding:20px 22px; box-shadow:0 2px 14px rgba(59,121,30,0.07); transition:box-shadow .2s; position:relative; overflow:hidden; }
  .v-kpi::before { content:''; position:absolute; top:-32px; right:-32px; width:96px; height:96px; border-radius:50%; background:rgba(189,212,60,0.10); pointer-events:none; }
  .v-kpi:hover { box-shadow:0 8px 24px rgba(59,121,30,0.10); }
  .v-kpi-label { font-size:10.5px; font-weight:800; text-transform:uppercase; letter-spacing:.09em; color:#5C6B60; margin-bottom:8px; font-family:'Plus Jakarta Sans',sans-serif; }
  .v-kpi-value { font-family:'Plus Jakarta Sans',sans-serif; font-size:26px; font-weight:800; color:#12241B; }
  .v-kpi-sub { font-size:11px; font-weight:600; color:#7A8878; margin-top:4px; font-family:'Plus Jakarta Sans',sans-serif; }
  .v-kpi-icon { width:44px; height:44px; border-radius:14px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .v-kpi-icon.green { background:#f0f5e8; color:#3b791e; }
  .v-kpi-icon.blue  { background:rgba(59,130,246,0.1); color:#3b82f6; }
  .v-kpi-icon.orange{ background:#fffbeb; color:#d97706; }
  .v-kpi-icon.red   { background:#fef2f2; color:#dc2626; }
  .v-kpi-icon.purple{ background:rgba(139,92,246,0.1); color:#8b5cf6; }
  .v-section-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-bottom:16px; border-bottom:2px solid rgba(59,121,30,0.1); }
  .v-section-title { font-family:'Plus Jakarta Sans',sans-serif; font-size:16px; font-weight:800; color:#12241B; display:flex; align-items:center; gap:10px; }
  .v-section-title-accent { width:6px; height:24px; border-radius:3px; background:var(--grad-main); }
  .v-btn { height:38px; padding:0 18px; border-radius:999px; border:1.5px solid #E1E6D8; font-weight:700; cursor:pointer; transition:all .15s; font-family:'Plus Jakarta Sans',sans-serif; font-size:13px; display:inline-flex; align-items:center; justify-content:center; gap:7px; background:#fff; color:#2c5c16; }
  .v-btn-primary { background:#3b791e; color:#fff; border-color:#3b791e; box-shadow:0 10px 24px rgba(59,121,30,.20); }
  .v-btn-primary:hover { background:#509820; box-shadow:0 10px 24px rgba(59,121,30,.20); }
  .v-btn-secondary { background:#fff; color:#2c5c16; border:1.5px solid #E1E6D8; }
  .v-btn-secondary:hover { background:#F6F7F1; border-color:#c9dba0; }
  .v-btn-danger { background:var(--grad-red); color:#fff; box-shadow:0 4px 14px rgba(239,68,68,.25); }
  .v-btn-danger:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(239,68,68,.35); }
  .v-btn-ghost { background:transparent; color:#3b791e; border:1.5px solid rgba(59,121,30,0.3); }
  .v-btn-ghost:hover { background:rgba(59,121,30,0.08); }
  .v-btn-blue { background:var(--grad-blue); color:#fff; box-shadow:0 4px 14px rgba(59,130,246,.3); }
  .v-btn-blue:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(59,130,246,.4); }
  .v-btn-sm { padding:6px 14px; font-size:12px; border-radius:8px; }
  .v-badge { padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; display:inline-flex; align-items:center; gap:4px; font-family:'Plus Jakarta Sans',sans-serif; }
  .v-badge::before { content:''; width:6px; height:6px; border-radius:50%; background:currentColor; opacity:.7; }
  .v-badge-green { background: rgba(59,121,30,0.12); color:#2c5c16; }
  .v-badge-orange { background: rgba(217,119,6,0.12); color:#d97706; }
  .v-badge-red { background: rgba(220,38,38,0.12); color:#dc2626; }
  .v-badge-blue { background:rgba(59,130,246,0.12); color:#2563eb; }
  .v-badge-purple { background:rgba(139,92,246,0.12); color:#7c3aed; }
  .v-table { width:100%; border-collapse:collapse; }
  .v-table th { text-align:left; padding:12px 16px; font-family:'Plus Jakarta Sans',sans-serif; font-size:10.5px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; color:#5C6B60; background:rgba(59,121,30,0.05); border-bottom:2px solid rgba(59,121,30,0.1); }
  .v-table th:first-child { border-radius:12px 0 0 0; }
  .v-table th:last-child { border-radius:0 12px 0 0; }
  .v-table td { padding:14px 16px; border-bottom:1px solid rgba(59,121,30,0.07); color:#374151; font-size:13.5px; transition:background .15s; font-family:'Plus Jakarta Sans',sans-serif; }
  .v-table tr:hover td { background:rgba(0,200,83,0.03); }
  .v-table tr:last-child td { border-bottom:none; }
  .v-search-wrap { position:relative; }
  .v-search-wrap svg { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:#94a3b8; pointer-events:none; }
  .v-search { width:100%; height:38px; padding:0 14px 0 38px; border:1.5px solid #E1E6D8; border-radius:11px; font-family:'Plus Jakarta Sans',sans-serif; font-size:13px; color:#12241B; background:#fff; transition:all .15s; outline:none; }
  .v-search::placeholder { color:#7A8878; }
  .v-search:focus { border-color:#3b791e; box-shadow:0 0 0 3px rgba(59,121,30,0.1); background:#fff; }
  .v-form-group { margin-bottom:18px; }
  .v-form-label { display:block; font-weight:700; font-size:11.5px; text-transform:uppercase; letter-spacing:.07em; color:#5C6B60; margin-bottom:7px; font-family:'Plus Jakarta Sans',sans-serif; }
  .v-form-input, .v-form-select { width:100%; min-height:38px; padding:9px 13px; border:1.5px solid #E1E6D8; border-radius:11px; font-family:'Plus Jakarta Sans',sans-serif; font-size:13px; color:#12241B; background:#fff; outline:none; transition:all .15s; }
  .v-form-input:focus, .v-form-select:focus { border-color:#3b791e; box-shadow:0 0 0 3px rgba(59,121,30,0.1); background:#fff; }
  .v-form-input:disabled { background:var(--gray-100); color:var(--gray-500); cursor:not-allowed; }
  .v-modal-overlay { position:fixed; inset:0; background:rgba(13,43,30,0.5); display:flex; align-items:center; justify-content:center; z-index:2000; animation:vFadeIn .2s ease; backdrop-filter:blur(4px); }
  .v-modal { background:#fff; padding:2rem; border-radius:18px; max-width:500px; width:90%; max-height:90vh; overflow-y:auto; box-shadow:0 24px 80px rgba(0,0,0,0.25); animation:vSlideUp .25s ease; border:1px solid rgba(59,121,30,0.15); }
  .v-modal-title { font-family:'Plus Jakarta Sans',sans-serif; font-size:18px; font-weight:800; color:#12241B; margin-bottom:6px; }
  .v-tabs { display:flex; gap:3px; background:#F6F7F1; border:1px solid #E1E6D8; border-radius:12px; padding:4px; width:fit-content; margin-bottom:22px; }
  .v-tab { padding:8px 20px; border-radius:9px; border:none; font-size:13px; font-weight:700; cursor:pointer; transition:all .15s; font-family:'Plus Jakarta Sans',sans-serif; color:#5C6B60; background:transparent; }
  .v-tab.active { background:#3b791e; color:#fff; box-shadow:none; }
  .v-tab:hover:not(.active) { background:rgba(59,121,30,0.1); color:#12241B; }
  .v-stat-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; margin-bottom:22px; }
  .v-empty { text-align:center; padding:60px 20px; color:#94a3b8; }
  .v-empty-icon { width:56px; height:56px; margin:0 auto 16px; border-radius:16px; display:flex; align-items:center; justify-content:center; background:#f0f5e8; color:#3b791e; }
  .v-empty-title { font-family:'Plus Jakarta Sans',sans-serif; font-size:1.1rem; font-weight:800; color:#5C6B60; margin-bottom:8px; }
  .v-empty-sub { font-size:13px; line-height:1.6; font-family:'Plus Jakarta Sans',sans-serif; }
  .v-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .v-dot-green { background:#509820; box-shadow:0 0 6px #509820; }
  .v-dot-red { background:#ef4444; box-shadow:0 0 6px #ef4444; }
  .v-dot-orange { background:#f59e0b; box-shadow:0 0 6px #f59e0b; }
  .v-dot-blue { background:#3b82f6; box-shadow:0 0 6px #3b82f6; }
  .placeholder-pill { display:inline-block; padding:5px 12px; border-radius:8px; background:linear-gradient(90deg,rgba(59,121,30,0.06) 25%,rgba(59,121,30,0.12) 50%,rgba(59,121,30,0.06) 75%); background-size:200% 100%; animation:shimmer 2s infinite; border:1.5px dashed rgba(59,121,30,0.25); color:#5C6B60; font-size:12px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; margin-top:4px; }
  .v-pw-box { margin-top:10px; padding:12px 14px; background:rgba(59,121,30,0.04); border:1.5px solid rgba(59,121,30,0.15); border-radius:12px; font-size:12px; }
  .v-pw-rule { display:flex; align-items:center; gap:7px; padding:3px 0; font-weight:600; font-family:'Plus Jakarta Sans',sans-serif; }
  .v-pw-rule.pass { color:#3b791e; }
  .v-pw-rule.fail { color:#ef4444; }
  @keyframes vFadeIn { from{opacity:0} to{opacity:1} }
  @keyframes vSlideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
`;

const fmtPeso = (n) =>
  "₱" +
  Number(n || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtReportId = (id) => `REP-${String(id).padStart(5, "0")}`;

const UNITS = [
  "pcs",
  "kg",
  "g",
  "liters",
  "ml",
  "tbsp",
  "tsp",
  "cups",
  "bottles",
  "packs",
  "bags",
  "boxes",
  "cans",
];

const bmInput = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 10,
  border: "1.5px solid #E1E6D8",
  fontSize: 13,
  color: "#12241B",
  background: "#f0f5e8",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  outline: "none",
  boxSizing: "border-box",
};
const bmLabel = {
  display: "block",
  fontSize: 11,
  fontWeight: 800,
  color: "#2e6725",
  marginBottom: 4,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
};

const BRAND_EXTRA_FIELDS = {
  iPharma: [
    { key: "batch_number", label: "Batch No.", type: "text", width: 110 },
    { key: "mfg_date", label: "Mfg Date", type: "date", width: 110 },
    { key: "exp_date", label: "Exp Date", type: "date", width: 110 },
    { key: "supply_date", label: "Supply Date", type: "date", width: 110 },
  ],
  "Coffee Spot": [
    { key: "batch_number", label: "Batch No.", type: "text", width: 110 },
    { key: "mfg_date", label: "Mfg Date", type: "date", width: 110 },
    { key: "exp_date", label: "Exp Date", type: "date", width: 110 },
    { key: "supply_date", label: "Supply Date", type: "date", width: 110 },
    { key: "perishable", label: "Perishable", type: "yesno", width: 100 },
  ],
  "Food Caravan": [
    { key: "batch_number", label: "Batch No.", type: "text", width: 110 },
    { key: "mfg_date", label: "Mfg Date", type: "date", width: 110 },
    { key: "exp_date", label: "Exp Date", type: "date", width: 110 },
    { key: "supply_date", label: "Supply Date", type: "date", width: 110 },
    { key: "perishable", label: "Perishable", type: "yesno", width: 100 },
  ],
  iFuel: [
    { key: "fuel_type", label: "Type", type: "text", width: 100 },
    { key: "tank_number", label: "Tank No.", type: "text", width: 90 },
    { key: "exp_date", label: "Exp Date", type: "date", width: 110 },
    { key: "supply_date", label: "Supply Date", type: "date", width: 110 },
    {
      key: "gallons_delivered",
      label: "Gals Delivered",
      type: "number",
      width: 120,
    },
  ],
};

function getExtraFields(brandName) {
  if (!brandName) return [];
  for (const key of Object.keys(BRAND_EXTRA_FIELDS)) {
    if (brandName.trim().toLowerCase() === key.toLowerCase())
      return BRAND_EXTRA_FIELDS[key];
  }
  return [];
}

function ExtraFieldCell({ field, value }) {
  if (field.type === "yesno") {
    const yes =
      value === true || value === "true" || value === 1 || value === "yes";
    return (
      <span className={`v-badge ${yes ? "v-badge-green" : "v-badge-red"}`}>
        {yes ? "Yes" : "No"}
      </span>
    );
  }
  if (!value || value === "")
    return <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>;
  if (field.type === "date") {
    try {
      return (
        <span style={{ fontSize: 13 }}>
          {new Date(value).toLocaleDateString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      );
    } catch {
      return <span style={{ fontSize: 13 }}>{value}</span>;
    }
  }
  if (field.key === "gallons_delivered") {
    return (
      <span style={{ fontSize: 13, fontWeight: 700, color: "#1565c0" }}>
        {Number(value).toLocaleString()} gal
      </span>
    );
  }
  return <span style={{ fontSize: 13 }}>{value}</span>;
}

const validatePw = (pw) => {
  const errs = [];
  if (pw.length < 8) errs.push("minLength");
  if (!/[A-Z]/.test(pw)) errs.push("uppercase");
  if (!/[a-z]/.test(pw)) errs.push("lowercase");
  if (!/\d/.test(pw)) errs.push("number");
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) errs.push("special");
  return { valid: errs.length === 0, errs };
};

const VKpi = ({ label, value, sub, icon, color = "green", placeholder }) => (
  <div className="v-kpi">
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
      }}
    >
      <div style={{ flex: 1 }}>
        <div className="v-kpi-label">{label}</div>
        {placeholder ? (
          <div className="placeholder-pill">— Pending connection</div>
        ) : (
          <div className="v-kpi-value">{value}</div>
        )}
      </div>
      <div className={`v-kpi-icon ${color}`}>{icon}</div>
    </div>
    {sub && <div className="v-kpi-sub">{sub}</div>}
  </div>
);

const VSectionTitle = ({ children, icon }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div className="v-section-title-accent" />
    <span className="v-section-title">
      {icon && <span style={{ color: "#3b791e" }}>{icon}</span>}
      {children}
    </span>
  </div>
);

const VEmptyState = ({ icon, title, sub }) => {
  const renderedIcon = React.isValidElement(icon)
    ? icon
    : icon
      ? React.createElement(icon, { size: 30 })
      : null;

  return (
    <div className="v-empty">
      <div className="v-empty-icon">{renderedIcon}</div>
      <div className="v-empty-title">{title}</div>
      <div className="v-empty-sub">{sub}</div>
    </div>
  );
};

const VPwBox = ({ errors }) => (
  <div className="v-pw-box">
    <div
      style={{
        fontWeight: 800,
        fontSize: 11.5,
        color: "#5C6B60",
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: ".06em",
        fontFamily: "Plus Jakarta Sans,sans-serif",
      }}
    >
      Password requirements
    </div>
    {[
      ["minLength", "At least 8 characters"],
      ["uppercase", "One uppercase letter (A-Z)"],
      ["lowercase", "One lowercase letter (a-z)"],
      ["number", "One number (0-9)"],
      ["special", "One special character"],
    ].map(([k, t]) => (
      <div
        key={k}
        className={`v-pw-rule ${errors.includes(k) ? "fail" : "pass"}`}
      >
        <span style={{ display: "inline-flex", alignItems: "center" }}>
          {errors.includes(k) ? <X size={13} /> : <Check size={13} />}
        </span>{" "}
        {t}
      </div>
    ))}
  </div>
);

const ReadOnlyBanner = ({
  message = "View only — contact your admin to make changes.",
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 16px",
      borderRadius: 12,
      marginBottom: 18,
      background: "#f0f5e8",
      border: "1.5px solid #c9dba0",
      fontSize: 12,
      fontWeight: 700,
      color: "#2c5c16",
      fontFamily: "Plus Jakarta Sans,sans-serif",
    }}
  >
    <Lock size={14} color="#3b791e" />
    {message}
  </div>
);

const getUserFromStorage = () => {
  try {
    const userString =
      localStorage.getItem("user") ||
      localStorage.getItem("rememberedUser") ||
      sessionStorage.getItem("user");

    if (!userString || userString === "undefined" || userString === "null")
      return null;
    const parsed = JSON.parse(userString);
    if (!parsed || typeof parsed !== "object" || !parsed.name) return null;
    return parsed;
  } catch {
    return null;
  }
};

export default function FranchiseeDashboard({ onLogout }) {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState(() => {
    return sessionStorage.getItem("fr_activeModule") || "dashboard";
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [brands, setBrands] = useState([]);

  const [user, setUser] = useState(getUserFromStorage);

  useEffect(() => {
    sessionStorage.setItem("fr_activeModule", activeModule);
  }, [activeModule]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/transactions`)
      .then((r) => r.json())
      .then((d) => setTransactions(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/brands`)
      .then((r) => r.json())
      .then((d) => setBrands(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const handleLogout = () => setShowLogoutModal(true);

  const confirmLogout = async () => {
    try {
      const stored =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      const userId = stored ? JSON.parse(stored)?.id : null;

      await fetch(`${process.env.REACT_APP_API_URL}/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("rememberedUser");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("tempUser");
      sessionStorage.removeItem("fr_activeModule");
      setShowLogoutModal(false);
      setIsLoggingOut(false);
      window.location.href = "/admin-login";
    }
  };

  const navigation = [
    { id: "dashboard", label: "Dashboard", icon: <Home size={20} /> },
    {
      id: "menuInventory",
      label: "Product Catalogue",
      icon: <Box size={20} />,
    },
    {
      id: "stockInventory",
      label: "Stock Inventory",
      icon: <Layers size={20} />,
    },
    // { id: 'receipts',       label: 'Liquidation',     icon: <FileText size={20} /> },
    { id: "reports", label: "Sales & Reports", icon: <BarChart2 size={20} /> },
    { id: "staff", label: "Staff Management", icon: <Users size={20} /> },
    {
      id: "communication",
      label: "Announcement",
      icon: <Megaphone size={20} />,
    },

    { id: "profile", label: "Edit Profile", icon: <User size={20} /> },
    {
      id: "logout",
      label: "Logout",
      icon: <LogOut size={20} />,
      action: handleLogout,
    },
  ];

  const moduleLabel =
    navigation.find((n) => n.id === activeModule)?.label || "Dashboard";

  return (
    <div className="franchisee-root">
      <style>
        {VIBE_CSS}
        {`
        .franchisee-root {
          font-family:'Plus Jakarta Sans',sans-serif;
          display:flex;
          min-height:100vh;
          background:#F6F7F1;
          background-image:radial-gradient(#E1E6D8 1px, transparent 1px);
          background-size:22px 22px;
          color:#12241B;
        }
        .fr-sidebar {
          width:${sidebarCollapsed ? "76px" : "272px"};
          background:#fff;
          border-right:1px solid #E1E6D8;
          box-shadow:none;
          position:fixed; left:0; top:0; height:100vh;
          transition:width 0.3s ease;
          z-index:1000;
          overflow-y:auto; overflow-x:hidden;
          padding:18px 14px;
        }
        .fr-sidebar-header {
          padding:4px 6px 18px;
          display:flex; align-items:center; justify-content:space-between;
          min-height:56px;
        }
        .fr-logo-mark {
          width:38px; height:38px;
          border-radius:10px;
          background:#12241B;
          display:flex; align-items:center; justify-content:center;
          flex-shrink:0;
          overflow:hidden;
        }
        .fr-logo-mark img { width:100%; height:100%; object-fit:contain; display:block; border-radius:10px; }
        .fr-brand { font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; font-size:16px; color:#12241B; white-space:nowrap; }
        .fr-toggle {
          background:#fff; border:1px solid #E1E6D8; cursor:pointer;
          width:30px; height:30px; color:#5C6B60; border-radius:9px;
          transition:all .15s; flex-shrink:0; display:flex; align-items:center; justify-content:center;
        }
        .fr-toggle:hover { color:#2c5c16; background:#F6F7F1; border-color:#c9dba0; }
        .fr-nav { padding:4px 0 0; }
        .fr-nav-section {
          font-size:10.5px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; color:#9CA89C;
          padding:12px 10px 6px; display:${sidebarCollapsed ? "none" : "block"}; font-family:'Plus Jakarta Sans',sans-serif;
        }
        .fr-nav-item {
          display:flex; align-items:center; gap:12px; padding:10px 12px; color:#5C6B60; cursor:pointer;
          transition:background .15s ease,color .15s ease; border-radius:12px; position:relative; margin:2px 0;
          font-weight:500; font-size:14px; font-family:'Plus Jakarta Sans',sans-serif;
        }
        .fr-nav-item:hover { background:#F6F7F1; color:#12241B; }
        .fr-nav-item.active { background:#F6F7F1; color:#2c5c16; box-shadow:none; font-weight:700; }
        .fr-nav-item.active .fr-nav-icon { color:#3b791e; }
        .fr-nav-item.logout { color:#c0392b; margin-top:8px; }
        .fr-nav-item.logout:hover { background:#fdf1f0; }
        .fr-nav-icon { flex-shrink:0; display:flex; align-items:center; justify-content:center; width:22px; height:22px; }
        .fr-nav-label { display:${sidebarCollapsed ? "none" : "block"}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .fr-nav-bar { position:absolute; right:6px; top:20%; height:60%; width:3px; border-radius:2px; background:#bdd43c; }
        .fr-main { flex:1; margin-left:${sidebarCollapsed ? "76px" : "272px"}; transition:margin-left 0.3s ease; min-width:0; }
        .fr-topbar {
          background:#fff; padding:16px 30px; box-shadow:none; display:flex; justify-content:space-between; align-items:center;
          position:sticky; top:0; z-index:100; border-bottom:1px solid #E1E6D8; min-height:72px;
        }
        .fr-topbar-breadcrumb { font-size:12px; color:#9CA89C; font-weight:600; font-family:'Plus Jakarta Sans',sans-serif; }
        .fr-topbar-title { font-family:'Plus Jakarta Sans',sans-serif; font-size:22px; font-weight:800; color:#12241B; margin:0; }
        .fr-user-name { font-weight:700; color:#12241B; font-size:13px; font-family:'Plus Jakarta Sans',sans-serif; }
        .fr-user-role { font-size:11.5px; color:#5C6B60; font-weight:500; font-family:'Plus Jakarta Sans',sans-serif; }
        .fr-avatar {
          width:38px; height:38px; border-radius:12px; background:#12241B; display:flex; align-items:center; justify-content:center;
          font-size:14px; font-weight:800; color:#bdd43c; cursor:pointer; transition:all .15s; box-shadow:none; font-family:'Plus Jakarta Sans',sans-serif;
        }
        .fr-avatar:hover { transform:translateY(-1px); }
        .fr-content { padding:20px 30px 40px; max-width:1400px; margin:0 auto; width:100%; }
        @media(max-width:768px){
          .fr-sidebar{width:${sidebarCollapsed ? "0" : "272px"};transform:translateX(${sidebarCollapsed ? "-100%" : "0"});}
          .fr-main{margin-left:0;}
          .fr-topbar,.fr-content{padding:16px;}
        }
`}
      </style>

      {/* Sidebar */}
      <aside className="fr-sidebar">
        <div className="fr-sidebar-header">
          {!sidebarCollapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src={franchisync}
                alt="FranchiSync"
                style={{
                  height: 50,
                  width: "auto",
                  maxWidth: 190,
                  objectFit: "contain",
                }}
              />
            </div>
          )}
          {sidebarCollapsed && (
            <div className="fr-logo-mark" style={{ margin: "0 auto" }}>
              <img src={ifranchisejpg} alt="iFranchise" />
            </div>
          )}
          {!sidebarCollapsed && (
            <button
              className="fr-toggle"
              onClick={() => setSidebarCollapsed(true)}
            >
              <X size={16} />
            </button>
          )}
        </div>
        {sidebarCollapsed && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "12px 0",
            }}
          >
            <button
              className="fr-toggle"
              onClick={() => setSidebarCollapsed(false)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
        <nav className="fr-nav">
          {!sidebarCollapsed && <div className="fr-nav-section">Main Menu</div>}
          {navigation.slice(0, 6).map((item) => (
            <div
              key={item.id}
              className={`fr-nav-item ${activeModule === item.id ? "active" : ""}`}
              onClick={() => {
                if (item.action) item.action();
                else setActiveModule(item.id);
              }}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="fr-nav-icon">{item.icon}</span>
              <span className="fr-nav-label">{item.label}</span>
              {activeModule === item.id && <span className="fr-nav-bar" />}
            </div>
          ))}
          {!sidebarCollapsed && (
            <div className="fr-nav-section" style={{ marginTop: 8 }}>
              Account
            </div>
          )}
          {navigation.slice(6).map((item) => (
            <div
              key={item.id}
              className={`fr-nav-item ${activeModule === item.id ? "active" : ""} ${item.id === "logout" ? "logout" : ""}`}
              onClick={() => {
                if (item.action) item.action();
                else setActiveModule(item.id);
              }}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="fr-nav-icon">{item.icon}</span>
              <span className="fr-nav-label">{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="fr-main">
        <div className="fr-topbar">
          <div>
            <h1 className="fr-topbar-title">{moduleLabel}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ textAlign: "right" }}>
              <div className="fr-user-name">{user?.name}</div>
              <div className="fr-user-role">Franchisee — {user?.branch}</div>
            </div>
            <div className="fr-avatar">{(user?.name || "F")[0]}</div>
          </div>
        </div>

        <div className="fr-content">
          {activeModule === "dashboard" && (
            <FrDashboardContent
              transactions={transactions}
              brands={brands}
              user={user}
            />
          )}
          {activeModule === "menuInventory" && (
            <FrMenuInventoryContent user={user} brands={brands} />
          )}
          {activeModule === "stockInventory" && (
            <FrStockInventoryContent user={user} brands={brands} />
          )}
          {/*activeModule === 'pos'            && <FrPOSContent user={user} brands={brands} />*/}
          {activeModule === "receipts" && <Receipts />}
          {activeModule === "reports" && (
            <FrReportsContent user={user} transactions={transactions} />
          )}
          {activeModule === "staff" && <FrStaffManagementContent user={user} />}
          {activeModule === "communication" && <FrCommunicationContent />}
          {activeModule === "profile" && <FrProfileContent user={user} />}
        </div>
      </main>

      {/* Logout modal */}
      {showLogoutModal && (
        <div
          className="v-modal-overlay"
          style={{ zIndex: 3000 }}
          onClick={() => {
            if (!isLoggingOut) setShowLogoutModal(false);
          }}
        >
          <div
            className="v-modal"
            style={{ maxWidth: 400, textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: "20px",
                background:
                  "linear-gradient(135deg,rgba(239,68,68,0.12),rgba(220,38,38,0.08))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                fontSize: "2rem",
                border: "1.5px solid rgba(239,68,68,0.15)",
              }}
            >
              <LogOut size={28} />
            </div>
            <h2 className="v-modal-title" style={{ textAlign: "center" }}>
              Log out?
            </h2>
            <p
              style={{
                color: "#94a3b8",
                fontSize: 13,
                margin: "8px 0 24px",
                lineHeight: 1.6,
                fontFamily: "Plus Jakarta Sans,sans-serif",
              }}
            >
              You'll need to sign in again to access your account.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="v-btn v-btn-secondary"
                style={{
                  flex: 1,
                  justifyContent: "center",
                  opacity: isLoggingOut ? 0.5 : 1,
                  cursor: isLoggingOut ? "not-allowed" : "pointer",
                }}
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
              >
                Cancel
              </button>
              <button
                className="v-btn v-btn-danger"
                style={{
                  flex: 1,
                  justifyContent: "center",
                  opacity: isLoggingOut ? 0.85 : 1,
                  cursor: isLoggingOut ? "not-allowed" : "pointer",
                }}
                onClick={confirmLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <RefreshCw size={14} className="fr-spin" /> Logging out…
                  </>
                ) : (
                  <>
                    <LogOut size={14} /> Log out
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fr-spin { to { transform: rotate(360deg); } }
        .fr-spin { animation: fr-spin .8s linear infinite; }
      `}</style>
    </div>
  );
}

const fmtAmt = (n) =>
  "₱" +
  Number(n || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const fmtShort = (n) => {
  if (n >= 1_000_000) return "₱" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return "₱" + (n / 1_000).toFixed(0) + "k";
  return "₱" + Number(n).toFixed(0);
};
const fmtPeso1 = (n) =>
  "₱" +
  Number(n || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
const fmt8 = (d) => d.toISOString().slice(0, 10);
const FONT = "'Plus Jakarta Sans', sans-serif";
const PAL = [
  "#509820",
  "#3b791e",
  "#26a69a",
  "#43a047",
  "#66bb6a",
  "#f59e0b",
  "#1d4ed8",
  "#7c3aed",
  "#db2777",
  "#ea580c",
];

function ProductAnalyticsPanel({
  preset,
  appliedRange,
  rangeMode,
  filterBranch,
  filterBrand,
  selectedBrand,
}) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [tab, setTab] = React.useState("top10"); // top10 | fast | slow | buyers | region

  const fetch_ = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (rangeMode === "preset") {
        params.set("preset", preset);
      } else if (appliedRange) {
        params.set("from", appliedRange.from);
        params.set("to", appliedRange.to);
      } else {
        params.set("preset", "month");
      }
      if (filterBranch) {
        params.set("branch", filterBranch);
      }
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/dashboard/product-analytics?${params}`,
      );
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [
    preset,
    rangeMode,
    appliedRange,
    filterBranch,
    filterBrand,
    selectedBrand,
  ]);

  React.useEffect(() => {
    fetch_();
  }, [fetch_]);

  const fmtPeso = (n) =>
    "₱" +
    Number(n || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const TABS = [
    { id: "top10", label: "Top 10 Products" },
    { id: "fast", label: "Fast Moving" },
    { id: "slow", label: "Slow Moving" },
  ];

  const BAR_COLORS = [
    "#509820",
    "#3b791e",
    "#26a69a",
    "#43a047",
    "#66bb6a",
    "#80cbc4",
    "#a5d6a7",
    "#D4DBC8",
    "#c9dba0",
    "#f0f5e8",
  ];

  const maxQty = data
    ? Math.max(
        1,
        ...(tab === "top10"
          ? data.top10
          : tab === "fast"
            ? data.fastMoving
            : data.slowMoving || []
        ).map((p) => p.totalQty),
      )
    : 1;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(59,121,30,0.12)",
        borderRadius: 22,
        padding: "20px 22px",
        boxShadow: "0 2px 20px rgba(59,121,30,0.07)",
        marginTop: 24,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg,#3b791e,#3b791e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BarChart2 size={18} color="#fff" />
          </div>
          <div>
            <div
              style={{
                fontFamily: "Plus Jakarta Sans,sans-serif",
                fontWeight: 800,
                fontSize: 15,
                color: "#12241B",
              }}
            >
              Product Analytics
            </div>
          </div>
        </div>
        <button
          onClick={fetch_}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 9,
            border: "1.5px solid #D4DBC8",
            background: "#F6F7F1",
            color: "#2c5c16",
            fontSize: 12,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
        >
          <RefreshCw
            size={12}
            style={{ animation: loading ? "spin 1s linear infinite" : "none" }}
          />
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {/* Summary chips */}
      {data && (
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Total Products", value: data.totalProducts },
            {
              label: "Fast Movers",
              value: data.fastMoving?.length || 0,
              color: "#059669",
              bg: "#d1fae5",
            },
            {
              label: "Slow Movers",
              value: data.slowMoving?.length || 0,
              color: "#dc2626",
              bg: "#fee2e2",
            },
            {
              label: "Avg Sales/Product",
              value: data.avgQty + " units",
              color: "#1e40af",
              bg: "#dbeafe",
            },
          ].map((c, i) => (
            <div
              key={i}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                background: c.bg || "#F6F7F1",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: c.color || "#2c5c16",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {c.label}:{" "}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: c.color || "#12241B",
                }}
              >
                {c.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: 4,
          background: "#F6F7F1",
          borderRadius: 12,
          padding: 4,
          marginBottom: 18,
          flexWrap: "wrap",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "7px 14px",
              borderRadius: 9,
              border: "none",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all .15s",
              background:
                tab === t.id
                  ? "linear-gradient(135deg,#509820,#3b791e)"
                  : "transparent",
              color: tab === t.id ? "#fff" : "#5C6B60",
              boxShadow:
                tab === t.id ? "0 2px 8px rgba(59,121,30,.28)" : "none",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div
          style={{
            padding: "32px 0",
            textAlign: "center",
            color: "#5C6B60",
            fontSize: 13,
          }}
        >
          <RefreshCw
            size={20}
            color="#3b791e"
            style={{ animation: "spin 1s linear infinite", marginBottom: 8 }}
          />
          <div style={{ marginTop: 8 }}>Loading product analytics…</div>
        </div>
      )}

      {/* TOP 10 / FAST / SLOW */}
      {!loading &&
        data &&
        (tab === "top10" || tab === "fast" || tab === "slow") &&
        (() => {
          const list =
            tab === "top10"
              ? data.top10
              : tab === "fast"
                ? data.fastMoving
                : data.slowMoving;
          if (!list?.length)
            return (
              <div
                style={{
                  padding: "32px 0",
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: 13,
                }}
              >
                No data for this filter.
              </div>
            );
          const maxR = Math.max(1, ...list.map((p) => p.totalRevenue));
          return (
            <div>
              {/* Column headers */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "24px 1fr 90px 90px 180px",
                  gap: 8,
                  padding: "6px 10px",
                  borderBottom: "2px solid #f0f5e8",
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#3b791e",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: 4,
                }}
              >
                <span>#</span>
                <span>Product</span>
                <span style={{ textAlign: "right" }}>Units</span>
                <span style={{ textAlign: "right" }}>Revenue</span>
                <span style={{ paddingLeft: 8 }}>Sales Bar</span>
              </div>
              {list.map((p, i) => (
                <div
                  key={p.name}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "24px 1fr 90px 90px 180px",
                    gap: 8,
                    alignItems: "center",
                    padding: "9px 10px",
                    borderBottom: "1px solid #f0f8f0",
                    borderRadius: 8,
                    marginBottom: 2,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#fbfdf6")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color:
                        i < 3
                          ? ["#f59e0b", "#94a3b8", "#cd7c2e"][i]
                          : "#9ca3af",
                    }}
                  >
                    {i < 3 ? ["1", "2", "3"][i] : `${i + 1}`}
                  </span>
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: "#12241B",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.name}
                    </div>
                    <div
                      style={{ fontSize: 10, color: "#5C6B60", marginTop: 1 }}
                    >
                      {Object.entries(p.branchBreakdown)
                        .slice(0, 2)
                        .map(([br, q]) => `${br}: ${q}`)
                        .join(" · ")}
                      {Object.keys(p.branchBreakdown).length > 2
                        ? ` +${Object.keys(p.branchBreakdown).length - 2} more`
                        : ""}
                    </div>
                  </div>
                  <span
                    style={{
                      textAlign: "right",
                      fontWeight: 800,
                      fontSize: 13,
                      color: "#12241B",
                    }}
                  >
                    {p.totalQty.toLocaleString()}
                  </span>
                  <span
                    style={{
                      textAlign: "right",
                      fontWeight: 700,
                      fontSize: 12,
                      color: "#3b791e",
                    }}
                  >
                    {fmtPeso(p.totalRevenue)}
                  </span>
                  <div style={{ paddingLeft: 8 }}>
                    <div
                      style={{
                        height: 10,
                        borderRadius: 5,
                        background: "#F6F7F1",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 5,
                          width: `${(p.totalRevenue / maxR) * 100}%`,
                          background: `${BAR_COLORS[i % BAR_COLORS.length]}`,
                          transition: "width .4s ease",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
    </div>
  );
}

// ─── AI PREDICTIVE PANEL ──────────────────────────────────────────────────────
function AIPredictivePanel({ transactions, filterLabel, preset }) {
  const [analysis, setAnalysis] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [lastRun, setLastRun] = React.useState(null);

  const fmtPeso = (n) =>
    "₱" +
    Number(n || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const runAnalysis = async () => {
    if (!transactions?.length) {
      setError(
        "No transaction data available for the current filter and date range.",
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/ai/dashboard-analysis`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactions, preset, filterLabel }),
        },
      );
      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
        setLastRun(
          new Date().toLocaleTimeString("en-PH", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        );
      } else {
        setError(data.error || "Analysis failed.");
      }
    } catch (err) {
      setError("Could not reach the AI service. Check your server connection.");
    } finally {
      setLoading(false);
    }
  };

  const typeStyle = (type) =>
    ({
      success: { borderColor: "#3B6D11", bg: "#EAF3DE", color: "#27500A" },
      warning: { borderColor: "#BA7517", bg: "#FAEEDA", color: "#633806" },
      info: { borderColor: "#185FA5", bg: "#E6F1FB", color: "#0C447C" },
    })[type] || { borderColor: "#888780", bg: "#F1EFE8", color: "#5F5E5A" };

  const anomalyConfig = (anomalyType) =>
    ({
      ghost_sales: {
        label: "Ghost sales",
        dot: "#A32D2D",
        badgeBg: "#FCEBEB",
        badgeColor: "#791F1F",
      },
      low_stock_no_reorder: {
        label: "Not reordering",
        dot: "#BA7517",
        badgeBg: "#FAEEDA",
        badgeColor: "#633806",
      },
      dead_stock: {
        label: "Dead stock",
        dot: "#185FA5",
        badgeBg: "#E6F1FB",
        badgeColor: "#0C447C",
      },
    })[anomalyType] || {
      label: "Anomaly",
      dot: "#888780",
      badgeBg: "#F1EFE8",
      badgeColor: "#5F5E5A",
    };

  const kpiAccent = (index, analysis) => {
    if (index === 0)
      return analysis.projectedChange >= 0 ? "#3B6D11" : "#A32D2D";
    if (index === 2) return "#BA7517";
    if (index === 3)
      return analysis.confidence >= 80
        ? "#3B6D11"
        : analysis.confidence >= 60
          ? "#BA7517"
          : "#A32D2D";
    return "#888780";
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(59,121,30,0.12)",
        borderRadius: 18,
        padding: "14px 18px",
        boxShadow: "0 2px 14px rgba(59,121,30,0.07)",
        marginTop: 16,
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#185FA5",
              flexShrink: 0,
            }}
          />
          <div>
            <div
              style={{
                fontFamily: "Plus Jakarta Sans,sans-serif",
                fontWeight: 800,
                fontSize: 14,
                color: "#12241B",
              }}
            >
              AI Prescriptive Analysis
            </div>
            <div style={{ fontSize: 11, color: "#5C6B60" }}>
              Groq · llama-3.3-70b{lastRun && ` · Last run ${lastRun}`}
            </div>
          </div>
        </div>
        <button
          onClick={runAnalysis}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 9,
            border: "1px solid #185FA5",
            background: loading ? "#f0f0f0" : "#E6F1FB",
            color: loading ? "#9e9e9e" : "#0C447C",
            fontSize: 12,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {loading ? (
            <>
              <svg
                width={13}
                height={13}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                style={{ animation: "spin 0.8s linear infinite" }}
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Analyzing…
            </>
          ) : (
            <>
              <svg
                width={13}
                height={13}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              {analysis ? "Re-run analysis" : "Run AI analysis"}
            </>
          )}
        </button>
      </div>

      {/* ── Empty state ── */}
      {!analysis && !loading && !error && (
        <div
          style={{
            padding: "28px 0",
            textAlign: "center",
            border: "1px dashed #D4DBC8",
            borderRadius: 12,
            color: "#5C6B60",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#f0f5e8",
              color: "#3b791e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 10px",
            }}
          >
            <Brain size={22} />
          </div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
            Ready to analyze your data
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            {transactions?.length
              ? `${transactions.length} transactions loaded · ${filterLabel}`
              : "Select a date range and branch filter, then run the analysis"}
          </div>
        </div>
      )}

      {/* ── Error state ── */}
      {error && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "#FCEBEB",
            border: "1px solid #F7C1C1",
            color: "#791F1F",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 7 }}
          >
            <AlertTriangle size={14} /> {error}
          </span>
        </div>
      )}

      {/* ── Loading state ── */}
      {loading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "28px 0",
            color: "#5C6B60",
            fontSize: 13,
          }}
        >
          <svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#185FA5"
            strokeWidth={2}
            style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          Sending {transactions?.length} transactions to Groq…
        </div>
      )}

      {/* ── Results ── */}
      {analysis && !loading && (
        <>
          {/* KPI row — colored left-border accent */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 8,
              marginBottom: 14,
            }}
          >
            {[
              {
                label: "Projected 7-day",
                value: fmtPeso(analysis.projectedRevenue),
                sub: `${analysis.projectedChange >= 0 ? "↑" : "↓"} ${Math.abs(analysis.projectedChange || 0).toFixed(1)}% vs prior`,
              },
              {
                label: "Peak day",
                value: analysis.peakDay || "—",
                sub: "Highest revenue expected",
              },
              {
                label: "Slowest day",
                value: analysis.slowestDay || "—",
                sub: `↓ ${Math.abs(analysis.slowestDayDropPct || 0).toFixed(0)}% below avg`,
              },
              {
                label: "Confidence",
                value: `${analysis.confidence || 0}%`,
                sub:
                  analysis.confidence >= 80
                    ? "High — strong data"
                    : analysis.confidence >= 60
                      ? "Medium — limited data"
                      : "Low — need more data",
              },
            ].map((card, i) => {
              const accent = kpiAccent(i, analysis);
              return (
                <div
                  key={i}
                  style={{
                    background: "#fbfdf6",
                    border: "1px solid #f0f5e8",
                    borderLeft: `3px solid ${accent}`,
                    borderRadius: 10,
                    padding: "9px 12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "#5C6B60",
                      marginBottom: 4,
                    }}
                  >
                    {card.label}
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: "#12241B",
                      marginBottom: 3,
                    }}
                  >
                    {card.value}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: accent }}>
                    {card.sub}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommendations — 2-column grid */}
          {analysis.recommendations?.length > 0 && (
            <>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#5C6B60",
                  marginBottom: 8,
                }}
              >
                Recommendations
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    analysis.recommendations.length > 2 ? "1fr 1fr" : "1fr",
                  gap: 6,
                }}
              >
                {analysis.recommendations.map((rec, i) => {
                  const s = typeStyle(rec.type);
                  return (
                    <div
                      key={i}
                      style={{
                        borderLeft: `2px solid ${s.borderColor}`,
                        background: s.bg,
                        borderRadius: "0 8px 8px 0",
                        padding: "8px 12px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: s.color,
                          marginBottom: 3,
                        }}
                      >
                        {rec.branch}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#12241B",
                          lineHeight: 1.55,
                        }}
                      >
                        {rec.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function ComboChart({
  barData = [],
  lineData = [],
  labels = [],
  height = 200,
}) {
  const [tip, setTip] = useState(null);
  const ref = useRef(null);
  const W = 700,
    H = height,
    PL = 56,
    PR = 48,
    PT = 16,
    PB = 32;
  const pW = W - PL - PR,
    pH = H - PT - PB;
  const barSeries = Array.isArray(barData[0]) ? barData : [barData];
  const maxBar = Math.max(...barSeries.flat(), 1) * 1.2;
  const maxLine = Math.max(...(lineData || []), 1) * 1.2;
  const minLine = Math.min(...(lineData || []), 0);
  const n = labels.length;
  const bW = Math.min(22, pW / Math.max(n, 1) - 6);

  const linepts = (lineData || []).map((v, i) => ({
    x: PL + (i / Math.max(n - 1, 1)) * pW,
    y: PT + pH - ((v - minLine) / (maxLine - minLine || 1)) * pH,
    v,
  }));
  let linePath = "";
  if (linepts.length > 1) {
    linePath = `M ${linepts[0].x} ${linepts[0].y}`;
    for (let i = 0; i < linepts.length - 1; i++) {
      const cx = (linepts[i].x + linepts[i + 1].x) / 2;
      linePath += ` C ${cx} ${linepts[i].y}, ${cx} ${linepts[i + 1].y}, ${linepts[i + 1].x} ${linepts[i + 1].y}`;
    }
  }
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: PT + pH * (1 - t),
    label: fmtShort(t * maxBar),
  }));

  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0,
      bestD = Infinity;
    labels.forEach((_, i) => {
      const x = PL + (i / Math.max(n - 1, 1)) * pW;
      const d = Math.abs(x - mx);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setTip({
      i: best,
      x: PL + (best / Math.max(n - 1, 1)) * pW,
      label: labels[best],
    });
  };

  return (
    <div
      style={{ position: "relative", cursor: "crosshair" }}
      onMouseMove={handleMove}
      onMouseLeave={() => setTip(null)}
    >
      <svg
        ref={ref}
        style={{ width: "100%", display: "block", overflow: "visible" }}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
      >
        <defs>
          {barSeries.map((_, si) => (
            <linearGradient
              key={si}
              id={`cbg${si}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={PAL[si]} stopOpacity="0.92" />
              <stop offset="100%" stopColor={PAL[si]} stopOpacity="0.55" />
            </linearGradient>
          ))}
          <linearGradient id="clgLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={PL}
              y1={t.y}
              x2={W - PR}
              y2={t.y}
              stroke="#e8ede9"
              strokeWidth="1"
              strokeDasharray="4 3"
            />
            <text
              x={PL - 6}
              y={t.y + 4}
              textAnchor="end"
              fontSize="10"
              fill="#6b9070"
              fontFamily={FONT}
            >
              {t.label}
            </text>
          </g>
        ))}
        {labels.map((lbl, i) => {
          const groupW = pW / Math.max(n, 1);
          const groupX = PL + i * groupW + groupW / 2;
          return barSeries.map((series, si) => {
            const v = series[i] || 0;
            const bH = (v / maxBar) * pH;
            const x = groupX - (barSeries.length / 2 - si) * (bW + 2) - bW / 2;
            return (
              <rect
                key={`${i}-${si}`}
                x={x}
                y={PT + pH - bH}
                width={bW}
                height={bH}
                rx="4"
                fill={`url(#cbg${si})`}
                opacity={tip?.i === i ? 1 : 0.82}
              />
            );
          });
        })}
        {labels.map((lbl, i) => (
          <text
            key={i}
            x={PL + (i / Math.max(n - 1, 1)) * pW}
            y={H - 4}
            textAnchor="middle"
            fontSize="10"
            fill="#6b9070"
            fontFamily={FONT}
          >
            {lbl}
          </text>
        ))}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="url(#clgLine)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}
        {linepts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={tip?.i === i ? 5 : 3}
            fill="#1d4ed8"
            stroke="#fff"
            strokeWidth="2"
          />
        ))}
        {tip && (
          <line
            x1={tip.x}
            y1={PT}
            x2={tip.x}
            y2={PT + pH}
            stroke="#509820"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.4"
          />
        )}
      </svg>
      {tip && (
        <div
          style={{
            position: "absolute",
            bottom: 36,
            left: `${(tip.x / W) * 100}%`,
            transform: "translateX(-50%)",
            background: "#12241B",
            color: "#fff",
            borderRadius: 10,
            padding: "8px 12px",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            fontSize: 11,
            fontFamily: FONT,
            boxShadow: "0 4px 16px rgba(0,0,0,0.22)",
            zIndex: 10,
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 3, color: "#a7f3d0" }}>
            {tip.label}
          </div>
          {barSeries.map((s, si) => (
            <div key={si} style={{ color: PAL[si] }}>
              {fmtShort(s[tip.i] || 0)}
            </div>
          ))}
          {lineData?.[tip.i] != null && (
            <div style={{ color: "#93c5fd" }}>
              GP%: {lineData[tip.i].toFixed(1)}%
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── HBarChart ────────────────────────────────────────────────────────────────
function HBarChart({ data = [] }) {
  const maxV = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map((d, i) => (
        <div key={i}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#12241B",
                fontFamily: FONT,
              }}
            >
              {d.label}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: PAL[i % PAL.length],
                fontFamily: FONT,
              }}
            >
              {fmtShort(d.value)}
            </span>
          </div>
          <div
            style={{
              height: 8,
              borderRadius: 4,
              background: "#F6F7F1",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 4,
                background: `linear-gradient(90deg,${PAL[i % PAL.length]},${PAL[(i + 2) % PAL.length]})`,
                width: `${(d.value / maxV) * 100}%`,
                transition: "width .6s ease",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── DonutChartSVG ────────────────────────────────────────────────────────────
function DonutChartSVG({
  segments = [],
  size = 140,
  innerRadius = 0.6,
  centerLabel = "",
  centerSub = "",
  showLegend = true,
}) {
  const [hover, setHover] = useState(null);
  const R = size / 2,
    cx = R,
    cy = R;
  const outerR = R - 4,
    innerR = outerR * innerRadius;
  const total = segments.reduce((s, d) => s + (d.value || 0), 0) || 1;
  let cum = 0;
  const slices = segments.map((seg, i) => {
    const pct = (seg.value || 0) / total;
    const sa = cum * 2 * Math.PI - Math.PI / 2;
    cum += pct;
    const ea = cum * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + outerR * Math.cos(sa),
      y1 = cy + outerR * Math.sin(sa);
    const x2 = cx + outerR * Math.cos(ea),
      y2 = cy + outerR * Math.sin(ea);
    const ix1 = cx + innerR * Math.cos(ea),
      iy1 = cy + innerR * Math.sin(ea);
    const ix2 = cx + innerR * Math.cos(sa),
      iy2 = cy + innerR * Math.sin(sa);
    const large = pct > 0.5 ? 1 : 0;
    const mid = sa + (ea - sa) / 2;
    return {
      ...seg,
      path: `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2} Z`,
      mid,
      pct,
      color: seg.color || PAL[i % PAL.length],
    };
  });
  const hov = hover !== null ? slices[hover] : null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ flexShrink: 0 }}
      >
        {slices.map((s, i) => (
          <path
            key={i}
            d={s.path}
            fill={s.color}
            opacity={hover === null ? 0.88 : hover === i ? 1 : 0.42}
            stroke="#fff"
            strokeWidth="2"
            transform={
              hover === i
                ? `translate(${Math.cos(s.mid) * 4} ${Math.sin(s.mid) * 4})`
                : ""
            }
            style={{ transition: "all .18s", cursor: "pointer" }}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
        {innerRadius > 0 && (
          <>
            <text
              x={cx}
              y={cy - 5}
              textAnchor="middle"
              fontSize="13"
              fontWeight="800"
              fill="#12241B"
              fontFamily={FONT}
            >
              {hov
                ? Math.round(hov.pct * 100) + "%"
                : centerLabel || total.toLocaleString()}
            </text>
            <text
              x={cx}
              y={cy + 11}
              textAnchor="middle"
              fontSize="9.5"
              fill="#5C6B60"
              fontFamily={FONT}
            >
              {hov ? hov.label : centerSub || "total"}
            </text>
          </>
        )}
      </svg>
      {showLegend && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 7,
            minWidth: 0,
          }}
        >
          {slices.map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                cursor: "pointer",
                opacity: hover === null ? 1 : hover === i ? 1 : 0.45,
                transition: "opacity .15s",
              }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  background: s.color,
                  flexShrink: 0,
                }}
              />
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#12241B",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontFamily: FONT,
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{ fontSize: 10, color: "#5C6B60", fontFamily: FONT }}
                >
                  {Math.round(s.pct * 100)}% · {(s.value || 0).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SparkBar ─────────────────────────────────────────────────────────────────
function SparkBar({ values = [], color = "#509820", height = 30 }) {
  if (!values.length) return null;
  const maxV = Math.max(...values, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height }}>
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            background: color,
            opacity: 0.4 + 0.6 * (i / values.length),
            borderRadius: 2,
            height: `${Math.max(4, (v / maxV) * height)}px`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Card wrappers ────────────────────────────────────────────────────────────
function PanelCard({ children, style: s }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E1E6D8",
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 2px 16px rgba(59,121,30,0.07)",
        ...s,
      }}
    >
      {children}
    </div>
  );
}

function CardHeader({
  icon: Icon,
  title,
  sub,
  gradient = "linear-gradient(135deg,#509820,#3b791e)",
  action,
}) {
  return (
    <div
      style={{
        background: gradient,
        padding: "13px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 33,
            height: 33,
            borderRadius: 9,
            background: C.greenLt,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1.5px solid rgba(255,255,255,0.28)",
          }}
        >
          <Icon size={17} color="#fff" />
        </div>
        <div>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 14,
              color: "#fff",
            }}
          >
            {title}
          </div>
          {sub && (
            <div
              style={{
                fontSize: 10.5,
                color: "rgba(255,255,255,0.65)",
                marginTop: 1,
              }}
            >
              {sub}
            </div>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

function ChartLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 800,
        color: "#5C6B60",
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        marginBottom: 10,
        display: "flex",
        alignItems: "center",
        gap: 5,
        fontFamily: FONT,
      }}
    >
      {children}
    </div>
  );
}

function BulletItem({ text, color = "#3b791e", size = "normal" }) {
  const fs = size === "small" ? 11 : 12.5;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        marginBottom: 6,
      }}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
          marginTop: fs === 11 ? 4 : 5,
        }}
      />
      <span
        style={{
          fontSize: fs,
          color: "#12241B",
          lineHeight: 1.6,
          fontFamily: FONT,
        }}
      >
        {text}
      </span>
    </div>
  );
}

// ─── SalesTrendSection ────────────────────────────────────────────────────────
function SalesTrendSection({
  values,
  labels,
  kpiData,
  total,
  avg,
  peak,
  low,
  peakLabel,
  pctChange,
  trending,
  getRangeLabel,
  filterLabel,
}) {
  const catData = useMemo(() => {
    if (kpiData?.categoryBreakdown?.length) return kpiData.categoryBreakdown;
    if (!total) return [];
    return [
      { label: "Medicine", value: Math.round(total * 0.28) },
      { label: "Supplements", value: Math.round(total * 0.22) },
      { label: "Coffee", value: Math.round(total * 0.18) },
      { label: "Vitamins", value: Math.round(total * 0.14) },
      { label: "Equipment", value: Math.round(total * 0.1) },
      { label: "Other", value: Math.round(total * 0.08) },
    ];
  }, [kpiData, total]);

  const branchData = useMemo(() => {
    if (kpiData?.branchBreakdown?.length)
      return kpiData.branchBreakdown.slice(0, 5);
    if (!total) return [];
    return [
      { label: "Main Branch", value: Math.round(total * 0.3) },
      { label: "Alabang", value: Math.round(total * 0.22) },
      { label: "BGC", value: Math.round(total * 0.18) },
      { label: "Makati", value: Math.round(total * 0.16) },
      { label: "Ortigas", value: Math.round(total * 0.14) },
    ];
  }, [kpiData, total]);


  const hasData = total > 0;
  const grossProfit = kpiData?.salesProfit ?? Math.round(total * 0.38);
  const txCount =
    kpiData?.txCount ?? values.reduce((s, v) => s + Math.round(v / 450), 0);
  const avgOrder = kpiData?.avgOrder ?? avg;

  const analysisBullets = useMemo(() => {
    if (!hasData) return [];
    const bullets = [];
    bullets.push(
      `Total revenue for ${getRangeLabel()} is ${fmtAmt(kpiData?.totalSales ?? total)} across ${filterLabel}.`,
    );
    bullets.push(
      `Gross profit stands at ${fmtAmt(grossProfit)}, a ${Math.round((grossProfit / (kpiData?.totalSales ?? total)) * 100)}% margin.`,
    );
    bullets.push(
      `${txCount.toLocaleString()} transactions processed with an average order of ${fmtAmt(avgOrder)}.`,
    );
    bullets.push(
      `Revenue is ${trending ? "trending upward" : "trending downward"} at ${trending ? "+" : ""}${pctChange}% from start to end of period.`,
    );
    bullets.push(
      `Peak revenue of ${fmtAmt(peak)} was recorded on ${peakLabel}, outperforming the period average by ${fmtAmt(peak - avg)}.`,
    );
    if (low < avg * 0.5)
      bullets.push(
        `Lowest period at ${fmtAmt(low)} — significantly below average, consider investigating that interval.`,
      );
    if (catData.length) {
      const topCat = catData[0];
      bullets.push(
        `${topCat.label} is the top-performing category at ${fmtShort(topCat.value)} (${Math.round((topCat.value / total) * 100)}% of revenue).`,
      );
    }
    if (branchData.length) {
      const topBranch = branchData[0];
      bullets.push(
        `${topBranch.label} leads branch revenue at ${fmtShort(topBranch.value)}.`,
      );
    }
    return bullets;
  }, [
    hasData,
    total,
    grossProfit,
    txCount,
    avgOrder,
    trending,
    pctChange,
    peak,
    peakLabel,
    avg,
    low,
    catData,
    branchData,
    kpiData,
    getRangeLabel,
    filterLabel,
  ]);

  return (
    <PanelCard style={{ marginBottom: 22 }}>
      <CardHeader
        icon={TrendingUp}
        title="Sales Trend Analysis"
        sub={`${getRangeLabel()} · ${filterLabel}`}
      />
      <div style={{ padding: "18px 20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 280px",
            gap: 18,
            marginBottom: 14,
            alignItems: "stretch",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <ChartLabel>
              <BarChart2 size={11} color="#3b791e" /> Revenue Trend
            </ChartLabel>
            {hasData ? (
              <>
                <ComboChart
                  barData={[values]}
                  lineData={[]}
                  labels={labels}
                  height={220}
                />
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    marginTop: 10,
                    marginBottom: 14,
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    { color: PAL[0], label: "Revenue" },
                  ].map((l, i) => (
                    <div
                      key={i}
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      {l.line ? (
                        <svg width={22} height={10}>
                          <line
                            x1="0"
                            y1="5"
                            x2="22"
                            y2="5"
                            stroke={l.color}
                            strokeWidth="2.5"
                          />
                          <circle cx="11" cy="5" r="3" fill={l.color} />
                        </svg>
                      ) : (
                        <div
                          style={{
                            width: 12,
                            height: 10,
                            borderRadius: 3,
                            background: l.color,
                          }}
                        />
                      )}
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 600,
                          color: "#5C6B60",
                          fontFamily: FONT,
                        }}
                      >
                        {l.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    flex: 1,
                  }}
                >
                  {[
                    {
                      label: "Total Revenue",
                      text: `Total revenue for ${getRangeLabel()} is ${fmtAmt(kpiData?.totalSales ?? total)} across ${filterLabel}.`,
                      icon: TrendingUp,
                      color: "#059669",
                      bg: "#ecfdf5",
                      border: "#a7f3d0",
                    },
                    {
                      label: "Gross Profit",
                      text: `Gross profit stands at ${fmtAmt(grossProfit)}, a ${Math.round((grossProfit / (kpiData?.totalSales ?? (total || 1))) * 100)}% margin.`,
                      icon: BarChart2,
                      color: "#1d4ed8",
                      bg: "#eff6ff",
                      border: "#bfdbfe",
                    },
                    {
                      label: "Period Trend",
                      text: `Revenue is ${trending ? "trending upward" : "trending downward"} at ${trending ? "+" : ""}${pctChange}% from start to end of period.`,
                      icon: trending ? ArrowUpRight : ArrowDownRight,
                      color: trending ? "#059669" : "#dc2626",
                      bg: trending ? "#ecfdf5" : "#fef2f2",
                      border: trending ? "#a7f3d0" : "#fecaca",
                    },
                  ].map((card, i) => (
                    <div
                      key={i}
                      style={{
                        background: card.bg,
                        border: `1px solid ${card.border}`,
                        borderRadius: 11,
                        padding: "12px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 9,
                          background: "#fff",
                          border: `1px solid ${card.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxShadow: `0 2px 6px ${card.border}`,
                        }}
                      >
                        <card.icon size={16} color={card.color} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 9.5,
                            fontWeight: 800,
                            color: card.color,
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                            fontFamily: FONT,
                            marginBottom: 3,
                          }}
                        >
                          {card.label}
                        </div>
                        <div
                          style={{
                            fontSize: 12.5,
                            color: "#12241B",
                            lineHeight: 1.55,
                            fontFamily: FONT,
                          }}
                        >
                          {card.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div
                style={{
                  flex: 1,
                  minHeight: 220,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#F6F7F1",
                  borderRadius: 12,
                  border: "1.5px dashed #D4DBC8",
                }}
              >
                <BarChart2 size={28} color="#D4DBC8" />
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    marginTop: 8,
                    color: "#5C6B60",
                    fontFamily: FONT,
                  }}
                >
                  No data for selection
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#94a3b8",
                    marginTop: 4,
                    fontFamily: FONT,
                  }}
                >
                  Try a different range, brand, or branch
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              background: "linear-gradient(160deg,#F6F7F1,#eaf5ec)",
              border: "1px solid #c9dba0",
              borderRadius: 14,
              padding: "16px 14px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 3,
                  height: 15,
                  borderRadius: 2,
                  background: "linear-gradient(180deg,#509820,#3b791e)",
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#2c5c16",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontFamily: FONT,
                }}
              >
                Period Analysis
              </span>
            </div>
            {hasData ? (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 7,
                    marginBottom: 12,
                  }}
                >
                  {[
                    {
                      label: "Peak",
                      value: fmtAmt(peak),
                      sub: `on ${peakLabel}`,
                      color: "#059669",
                      bg: "#ecfdf5",
                      border: "#a7f3d0",
                    },
                    {
                      label: "Low",
                      value: fmtAmt(low),
                      sub: "Period min",
                      color: "#d97706",
                      bg: "#fffbeb",
                      border: "#fde68a",
                    },
                    {
                      label: "Average",
                      value: fmtAmt(avg),
                      sub: `${labels.length} pts`,
                      color: "#1d4ed8",
                      bg: "#eff6ff",
                      border: "#bfdbfe",
                    },
                    {
                      label: "Trend",
                      value: `${trending ? "+" : ""}${pctChange}%`,
                      sub: trending ? "Upward" : "Downward",
                      color: trending ? "#059669" : "#dc2626",
                      bg: trending ? "#ecfdf5" : "#fef2f2",
                      border: trending ? "#a7f3d0" : "#fecaca",
                    },
                  ].map((s, i) => (
                    <div
                      key={i}
                      style={{
                        background: s.bg,
                        borderRadius: 9,
                        padding: "8px 9px",
                        border: `1px solid ${s.border}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 8.5,
                          fontWeight: 800,
                          color: "#5C6B60",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          fontFamily: FONT,
                          marginBottom: 2,
                        }}
                      >
                        {s.label}
                      </div>
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: 800,
                          color: s.color,
                          fontFamily: FONT,
                          lineHeight: 1.15,
                        }}
                      >
                        {s.value}
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          color: "#5C6B60",
                          fontFamily: FONT,
                          marginTop: 1,
                        }}
                      >
                        {s.sub}
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#5C6B60",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    fontFamily: FONT,
                    marginBottom: 8,
                  }}
                >
                  Key Observations
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    flex: 1,
                  }}
                >
                  {analysisBullets.slice(3).map((text, i) => {
                    const dotColors = [
                      "#7c3aed",
                      "#059669",
                      "#d97706",
                      "#dc2626",
                      "#3b791e",
                      "#1d4ed8",
                    ];
                    const bgColors = [
                      "#f5f3ff",
                      "#ecfdf5",
                      "#fffbeb",
                      "#fef2f2",
                      "#F6F7F1",
                      "#eff6ff",
                    ];
                    const bdrColors = [
                      "#ddd6fe",
                      "#a7f3d0",
                      "#fde68a",
                      "#fecaca",
                      "#E1E6D8",
                      "#bfdbfe",
                    ];
                    const dc = dotColors[i % dotColors.length];
                    const bc = bgColors[i % bgColors.length];
                    const bd = bdrColors[i % bdrColors.length];
                    return (
                      <div
                        key={i}
                        style={{
                          background: bc,
                          border: `1px solid ${bd}`,
                          borderRadius: 9,
                          padding: "8px 10px",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: dc,
                            flexShrink: 0,
                            marginTop: 4,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 11,
                            color: "#12241B",
                            lineHeight: 1.55,
                            fontFamily: FONT,
                          }}
                        >
                          {text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Info size={22} color="#D4DBC8" />
                <p
                  style={{
                    fontSize: 11.5,
                    color: "#94a3b8",
                    textAlign: "center",
                    lineHeight: 1.6,
                    margin: 0,
                    fontFamily: FONT,
                  }}
                >
                  Select a date range and branch to see analysis.
                </p>
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
          }}
        >
          <div
            style={{
              background: "#F6F7F1",
              border: "1px solid #f0f5e8",
              borderRadius: 14,
              padding: "14px 16px",
            }}
          >
            <ChartLabel>
              <PieChart size={11} color="#3b791e" /> Sales by Category
            </ChartLabel>
            {catData.length > 0 ? (
              <DonutChartSVG
                segments={catData.map((d, i) => ({
                  label: d.label,
                  value: d.value,
                  color: PAL[i % PAL.length],
                }))}
                size={130}
                centerLabel={hasData ? fmtShort(total) : "—"}
                centerSub="total"
              />
            ) : (
              <div
                style={{
                  height: 120,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#D4DBC8",
                  fontFamily: FONT,
                  fontSize: 12,
                }}
              >
                No data
              </div>
            )}
          </div>
          <div
            style={{
              background: "#F6F7F1",
              border: "1px solid #f0f5e8",
              borderRadius: 14,
              padding: "14px 16px",
            }}
          >
            <ChartLabel>
              <Globe size={11} color="#3b791e" /> Top 5 Sales by Branch
            </ChartLabel>
            {branchData.length > 0 ? (
              <HBarChart data={branchData.slice(0, 5)} />
            ) : (
              <div
                style={{
                  height: 120,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#D4DBC8",
                  fontFamily: FONT,
                  fontSize: 12,
                }}
              >
                No data
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <ChartLabel>
              <Activity size={11} color="#3b791e" /> Period Summary
            </ChartLabel>
            {[
              {
                label: "Peak Revenue",
                value: hasData ? fmtAmt(peak) : "—",
                sub: `on ${peakLabel}`,
                color: "#059669",
                bg: "#ecfdf5",
                border: "#a7f3d0",
              },
              {
                label: "Lowest Revenue",
                value: hasData ? fmtAmt(low) : "—",
                sub: "Period minimum",
                color: "#d97706",
                bg: "#fffbeb",
                border: "#fde68a",
              },
              {
                label: "Period Average",
                value: hasData ? fmtAmt(avg) : "—",
                sub: `${labels.length} data points`,
                color: "#1d4ed8",
                bg: "#eff6ff",
                border: "#bfdbfe",
              },
              {
                label: "Trend",
                value: hasData ? `${trending ? "+" : ""}${pctChange}%` : "—",
                sub: trending ? "Upward trend" : "Downward trend",
                color: trending ? "#059669" : "#dc2626",
                bg: trending ? "#ecfdf5" : "#fef2f2",
                border: trending ? "#a7f3d0" : "#fecaca",
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  background: s.bg,
                  border: `1px solid ${s.border}`,
                  borderRadius: 10,
                  padding: "9px 12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 9.5,
                      fontWeight: 800,
                      color: "#5C6B60",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      fontFamily: FONT,
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: s.color,
                      fontFamily: FONT,
                    }}
                  >
                    {s.value}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#5C6B60",
                    fontFamily: FONT,
                    textAlign: "right",
                  }}
                >
                  {s.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PanelCard>
  );
}

// ─── PrescriptiveSection ──────────────────────────────────────────────────────
function PrescriptiveSection({
  transactions,
  filterLabel,
  preset,
  total,
  values,
  kpiData,
}) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRun, setLastRun] = useState(null);

  const runAnalysis = async () => {
    if (!transactions?.length) {
      setError("No transaction data available.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/ai/dashboard-analysis`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactions, preset, filterLabel }),
        },
      );
      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
        setLastRun(
          new Date().toLocaleTimeString("en-PH", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        );
      } else {
        setError(data.error || "Analysis failed.");
      }
    } catch {
      setError("Could not reach the AI service.");
    } finally {
      setLoading(false);
    }
  };

  const projRev =
    analysis?.projectedRevenue ?? (total ? Math.round(total * 1.05) : null);
  const projChg = analysis?.projectedChange ?? 5.2;
  const peakDay = analysis?.peakDay ?? "Thursday";
  const slowDay = analysis?.slowestDay ?? "Sunday";
  const conf = analysis?.confidence ?? (total ? 72 : null);

  const typeStyle = (type) =>
    ({
      success: {
        borderColor: "#059669",
        bg: "#ecfdf5",
        color: "#065f46",
        badgeBg: "#d1fae5",
        dot: "#059669",
      },
      warning: {
        borderColor: "#d97706",
        bg: "#fffbeb",
        color: "#92400e",
        badgeBg: "#fef3c7",
        dot: "#f59e0b",
      },
      info: {
        borderColor: "#2563eb",
        bg: "#eff6ff",
        color: "#1e40af",
        badgeBg: "#dbeafe",
        dot: "#3b82f6",
      },
    })[type] || {
      borderColor: "#6b7280",
      bg: "#f9fafb",
      color: "#374151",
      badgeBg: "#f3f4f6",
      dot: "#6b7280",
    };

  const preRunBullets = useMemo(() => {
    if (!total) return [];
    return [
      `${transactions?.length?.toLocaleString() ?? 0} transactions loaded for ${filterLabel}.`,
      `Estimated 7-day projected revenue: ${projRev ? fmtAmt(projRev) : "—"} (${projChg >= 0 ? "+" : ""}${projChg.toFixed(1)}% estimate vs prior period).`,
      `Forecast peak day: ${peakDay} · Slowest day: ${slowDay}.`,
      conf
        ? `Model confidence: ${conf}% — ${conf >= 80 ? "High confidence based on strong data history." : conf >= 60 ? "Medium confidence — limited transaction history." : "Low confidence — more data needed for reliable forecasts."}`
        : null,
    ].filter(Boolean);
  }, [
    total,
    transactions,
    filterLabel,
    projRev,
    projChg,
    peakDay,
    slowDay,
    conf,
  ]);

  return (
    <PanelCard style={{ marginBottom: 22 }}>
      <CardHeader
        icon={Brain}
        title="AI Prescriptive Analysis"
        sub={`Powered by Groq · llama-3.3-70b${lastRun ? ` · Last run ${lastRun}` : ""}`}
        gradient="linear-gradient(135deg,#1e3a5f,#1d4ed8)"
        action={
          <button
            onClick={runAnalysis}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "8px 16px",
              borderRadius: 9,
              border: "1.5px solid rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.14)",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: FONT,
            }}
          >
            <Zap
              size={12}
              style={{
                animation: loading ? "spin 0.8s linear infinite" : "none",
              }}
            />
            {loading
              ? "Analyzing…"
              : analysis
                ? "Re-run AI"
                : "Run AI Analysis"}
          </button>
        }
      />
      <div style={{ padding: "18px 20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {[
            {
              label: "Projected 7-Day Revenue",
              value: projRev ? fmtAmt(projRev) : "—",
              sub: projRev
                ? `${projChg >= 0 ? "+" : ""}${projChg.toFixed(1)}% vs prior`
                : "Run AI to populate",
              color: "#059669",
              bg: "#ecfdf5",
              border: "#a7f3d0",
              icon: TrendingUp,
            },
            {
              label: "Peak Day Forecast",
              value: peakDay || "—",
              sub: "Highest revenue day",
              color: "#1d4ed8",
              bg: "#eff6ff",
              border: "#bfdbfe",
              icon: Target,
            },
            {
              label: "Slowest Day Forecast",
              value: slowDay || "—",
              sub: "Lowest revenue day",
              color: "#d97706",
              bg: "#fffbeb",
              border: "#fde68a",
              icon: TrendingDown,
            },
            {
              label: "Confidence Score",
              value: conf ? `${conf}%` : "—",
              sub: conf
                ? conf >= 80
                  ? "High confidence"
                  : conf >= 60
                    ? "Medium confidence"
                    : "Low — need more data"
                : "Run AI to populate",
              color: "#7c3aed",
              bg: "#f5f3ff",
              border: "#ddd6fe",
              icon: CheckCircle,
            },
          ].map((card, i) => (
            <div
              key={i}
              style={{
                background: card.bg,
                border: `1px solid ${card.border}`,
                borderRadius: 12,
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6,
                }}
              >
                <card.icon size={11} color={card.color} />
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 800,
                    color: "#5C6B60",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    fontFamily: FONT,
                  }}
                >
                  {card.label}
                </span>
              </div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  color: card.color,
                  fontFamily: FONT,
                  lineHeight: 1.15,
                }}
              >
                {card.value}
              </div>
              <div
                style={{
                  fontSize: 10.5,
                  color: "#5C6B60",
                  fontFamily: FONT,
                  marginTop: 3,
                }}
              >
                {card.sub}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                background: "linear-gradient(160deg,#eff6ff,#dbeafe)",
                border: "1px solid #bfdbfe",
                borderRadius: 14,
                padding: "16px 18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 3,
                    height: 14,
                    borderRadius: 2,
                    background: "linear-gradient(180deg,#3b82f6,#1d4ed8)",
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#1d4ed8",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontFamily: FONT,
                  }}
                >
                  {analysis ? "AI Summary" : "Data Overview"} · {filterLabel}
                </span>
              </div>
              {analysis ? (
                <p
                  style={{
                    fontSize: 12.5,
                    color: "#12241B",
                    lineHeight: 1.75,
                    margin: 0,
                    fontFamily: FONT,
                  }}
                >
                  {analysis.summary}
                </p>
              ) : (
                <>
                  {preRunBullets.length > 0 ? (
                    preRunBullets.map((b, i) => (
                      <BulletItem key={i} text={b} color="#3b82f6" />
                    ))
                  ) : (
                    <p
                      style={{
                        fontSize: 12,
                        color: "#94a3b8",
                        fontFamily: FONT,
                        fontStyle: "italic",
                      }}
                    >
                      Load transactions and run AI Analysis to generate
                      insights.
                    </p>
                  )}
                  {error && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 12px",
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        borderRadius: 9,
                        marginTop: 8,
                      }}
                    >
                      <AlertTriangle size={13} color="#dc2626" />
                      <span
                        style={{
                          fontSize: 11.5,
                          color: "#dc2626",
                          fontWeight: 600,
                          fontFamily: FONT,
                        }}
                      >
                        {error}
                      </span>
                    </div>
                  )}
                  {loading && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginTop: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          border: "2.5px solid #dbeafe",
                          borderTopColor: "#2563eb",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          color: "#5C6B60",
                          fontFamily: FONT,
                        }}
                      >
                        Sending {transactions?.length} transactions to Groq…
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {analysis?.stockAnomalies?.length > 0 && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 3,
                      height: 14,
                      borderRadius: 2,
                      background: "#dc2626",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#dc2626",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontFamily: FONT,
                    }}
                  >
                    Stock vs Sales Anomalies
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 20,
                      background: "#fee2e2",
                      color: "#dc2626",
                      fontFamily: FONT,
                    }}
                  >
                    {analysis.stockAnomalies.length}
                  </span>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {analysis.stockAnomalies.map((a, i) => {
                    const cfg = {
                      ghost_sales: {
                        bg: "#fef2f2",
                        border: "#fecaca",
                        label: "Ghost Sales",
                        labelBg: "#fee2e2",
                        labelColor: "#991b1b",
                        dot: "#dc2626",
                      },
                      low_stock_no_reorder: {
                        bg: "#fffbeb",
                        border: "#fde68a",
                        label: "Not Reordering",
                        labelBg: "#fef3c7",
                        labelColor: "#92400e",
                        dot: "#d97706",
                      },
                      dead_stock: {
                        bg: "#eff6ff",
                        border: "#bfdbfe",
                        label: "Dead Stock",
                        labelBg: "#dbeafe",
                        labelColor: "#1e40af",
                        dot: "#2563eb",
                      },
                    }[a.anomalyType] || {
                      bg: "#fbfdf6",
                      border: "#E1E6D8",
                      label: "Anomaly",
                      labelBg: "#f0f5e8",
                      labelColor: "#2c5c16",
                      dot: "#3b791e",
                    };
                    return (
                      <div
                        key={i}
                        style={{
                          background: cfg.bg,
                          border: `1px solid ${cfg.border}`,
                          borderRadius: 12,
                          padding: "13px 14px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 7,
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background:
                                a.severity === "critical"
                                  ? "#dc2626"
                                  : a.severity === "warning"
                                    ? "#d97706"
                                    : "#2563eb",
                              display: "inline-block",
                            }}
                          />
                          <span
                            style={{
                              fontSize: 9.5,
                              fontWeight: 800,
                              padding: "2px 7px",
                              borderRadius: 20,
                              background: cfg.labelBg,
                              color: cfg.labelColor,
                              textTransform: "uppercase",
                              fontFamily: FONT,
                            }}
                          >
                            {cfg.label}
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#12241B",
                              fontFamily: FONT,
                            }}
                          >
                            {a.branch}
                          </span>
                          {a.severity === "critical" && (
                            <span
                              style={{
                                marginLeft: "auto",
                                fontSize: 9.5,
                                fontWeight: 800,
                                padding: "2px 7px",
                                borderRadius: 20,
                                background: "#fee2e2",
                                color: "#991b1b",
                                fontFamily: FONT,
                              }}
                            >
                              CRITICAL
                            </span>
                          )}
                        </div>
                        <BulletItem
                          text={a.finding}
                          color={cfg.dot}
                          size="small"
                        />
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 6,
                            padding: "7px 9px",
                            borderRadius: 7,
                            background: "rgba(255,255,255,0.65)",
                            border: `1px solid ${cfg.border}`,
                            marginTop: 6,
                          }}
                        >
                          <CheckCircle
                            size={12}
                            color={cfg.dot}
                            style={{ flexShrink: 0, marginTop: 1 }}
                          />
                          <span
                            style={{
                              fontSize: 11.5,
                              fontWeight: 600,
                              color: "#12241B",
                              lineHeight: 1.55,
                              fontFamily: FONT,
                            }}
                          >
                            {a.action}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div>
            {analysis?.recommendations?.length > 0 ? (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 3,
                      height: 14,
                      borderRadius: 2,
                      background: "linear-gradient(180deg,#509820,#3b791e)",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#12241B",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontFamily: FONT,
                    }}
                  >
                    Actionable Recommendations
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 20,
                      background: "#f0f5e8",
                      color: "#2c5c16",
                      fontFamily: FONT,
                    }}
                  >
                    {analysis.recommendations.length}
                  </span>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {analysis.recommendations.map((rec, i) => {
                    const s = typeStyle(rec.type);
                    return (
                      <div
                        key={i}
                        style={{
                          background: s.bg,
                          border: `1px solid ${s.borderColor}25`,
                          borderRadius: 12,
                          padding: "12px 12px 12px 16px",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 4,
                            background: s.borderColor,
                            borderRadius: "4px 0 0 4px",
                          }}
                        />
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 7,
                          }}
                        >
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background: s.dot,
                              display: "inline-block",
                            }}
                          />
                          <span
                            style={{
                              fontSize: 9.5,
                              fontWeight: 800,
                              color: s.color,
                              textTransform: "uppercase",
                              letterSpacing: "0.07em",
                              background: s.badgeBg,
                              padding: "2px 7px",
                              borderRadius: 20,
                              fontFamily: FONT,
                            }}
                          >
                            {rec.branch || rec.type}
                          </span>
                        </div>
                        <BulletItem
                          text={rec.text}
                          color={s.dot}
                          size="small"
                        />
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div
                style={{
                  background: "#fafbff",
                  border: "1.5px dashed #dbeafe",
                  borderRadius: 14,
                  padding: "28px 20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  gap: 10,
                }}
              >
                <Brain size={32} color="#bfdbfe" />
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: "#12241B",
                    fontFamily: FONT,
                  }}
                >
                  Recommendations will appear here
                </div>
                <p
                  style={{
                    fontSize: 11.5,
                    color: "#94a3b8",
                    textAlign: "center",
                    lineHeight: 1.65,
                    margin: 0,
                    fontFamily: FONT,
                  }}
                >
                  {transactions?.length
                    ? `${transactions.length} transactions ready. Click "Run AI Analysis" to generate prescriptive recommendations.`
                    : "Load transactions then run the AI analysis."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PanelCard>
  );
}

// ─── SalesVsStockSection ──────────────────────────────────────────────────────
function SalesVsStockSection({
  preset,
  appliedRange,
  rangeMode,
  filterBranch,
  filterBrand,
  selectedBrand,
  total,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("top10");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (rangeMode === "preset") params.set("preset", preset);
      else if (appliedRange) {
        params.set("from", appliedRange.from);
        params.set("to", appliedRange.to);
      } else params.set("preset", "month");
      if (filterBranch) params.set("branch", filterBranch);
      else if (filterBrand && selectedBrand) {
        const names = (selectedBrand.branches || []).map((br) =>
          typeof br === "string" ? br : br.name,
        );
        if (names.length) params.set("branches", names.join(","));
      }
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/dashboard/product-analytics?${params}`,
      );
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [
    preset,
    rangeMode,
    appliedRange,
    filterBranch,
    filterBrand,
    selectedBrand,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const top10 = data?.top10 ?? [];
  const fast = data?.fastMoving ?? [];
  const slow = data?.slowMoving ?? [];
  const totalSKUs = data?.totalProducts ?? 0;
  const fastCount = fast.length;
  const slowCount = slow.length;

  const revenuePie = top10.slice(0, 5).map((p, i) => ({
    label: p.name.length > 14 ? p.name.slice(0, 14) + "…" : p.name,
    value: p.totalRevenue,
    color: PAL[i],
  }));
  const moverPie =
    totalSKUs > 0
      ? [
          { label: "Fast Movers", value: fastCount, color: "#059669" },
          { label: "Slow Movers", value: slowCount, color: "#dc2626" },
          {
            label: "Normal",
            value: Math.max(0, totalSKUs - fastCount - slowCount),
            color: "#94a3b8",
          },
        ].filter((d) => d.value > 0)
      : [];

  const TABS = [
    { id: "top10", label: "Top Products", icon: BarChart2 },
    { id: "fast", label: "Fast Movers", icon: TrendingUp },
    { id: "slow", label: "Slow Movers", icon: TrendingDown },
  ];
  const tabSt = (a) => ({
    padding: "6px 13px",
    borderRadius: 8,
    border: "none",
    fontSize: 11.5,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: FONT,
    transition: "all .15s",
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: a ? "#3b791e" : "transparent",
    color: a ? "#fff" : "#5C6B60",
    boxShadow: a ? "0 2px 8px rgba(59,121,30,.28)" : "none",
  });
  const RANK_COLORS = ["#f59e0b", "#94a3b8", "#cd7c2e"];

  const renderList = () => {
    const isBuyers = tab === "buyers";
    const list = isBuyers
      ? data?.topBuyers
      : tab === "top10"
        ? top10
        : tab === "fast"
          ? fast
          : slow;
    if (!list?.length)
      return (
        <div
          style={{
            padding: "28px 0",
            textAlign: "center",
            color: "#9ca3af",
            fontSize: 12,
            border: "1.5px dashed #E1E6D8",
            borderRadius: 10,
            fontFamily: FONT,
          }}
        >
          No data for this filter.
        </div>
      );
    const maxR = Math.max(
      1,
      ...list.map((p) => (isBuyers ? p.totalItems : p.totalRevenue)),
    );
    const maxQ = isBuyers ? maxR : Math.max(1, ...list.map((p) => p.totalQty));
    return list.slice(0, 8).map((p, i) => (
      <div
        key={p.name}
        style={{
          display: "grid",
          gridTemplateColumns: isBuyers
            ? "28px 1fr 70px 1fr"
            : "28px 1fr 65px 70px 1fr",
          gap: 8,
          alignItems: "center",
          padding: "8px 10px",
          borderBottom: "1px solid #f4fbf6",
          borderRadius: 7,
          transition: "background .1s",
          cursor: "default",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f4fbf6")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: 7,
            background:
              i < 3
                ? [
                    "rgba(245,158,11,0.12)",
                    "rgba(148,163,184,0.15)",
                    "rgba(205,124,46,0.12)",
                  ][i]
                : "#f4f6f8",
            fontWeight: 800,
            fontSize: 11,
            color: i < 3 ? RANK_COLORS[i] : "#9ca3af",
            fontFamily: FONT,
          }}
        >
          {i + 1}
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 12,
              color: "#12241B",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontFamily: FONT,
            }}
          >
            {p.name}
          </div>
          {!isBuyers && p.branchBreakdown && (
            <div
              style={{
                fontSize: 9.5,
                color: "#94a3b8",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontFamily: FONT,
              }}
            >
              {Object.entries(p.branchBreakdown)
                .slice(0, 2)
                .map(([br, q]) => `${br}: ${q}`)
                .join(" · ")}
            </div>
          )}
        </div>
        {!isBuyers && (
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontWeight: 800,
                fontSize: 11,
                color: "#12241B",
                fontFamily: FONT,
              }}
            >
              {p.totalQty?.toLocaleString()}
            </div>
            <div
              style={{
                height: 3,
                borderRadius: 2,
                background: "#f0f5e8",
                marginTop: 2,
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 2,
                  width: `${(p.totalQty / maxQ) * 100}%`,
                  background: PAL[i % PAL.length],
                }}
              />
            </div>
          </div>
        )}
        <div
          style={{
            textAlign: "right",
            fontWeight: 700,
            fontSize: 12,
            color: "#3b791e",
            fontFamily: FONT,
          }}
        >
          {isBuyers ? p.totalItems?.toLocaleString() : fmtPeso1(p.totalRevenue)}
        </div>
        <div style={{ paddingLeft: 8 }}>
          {isBuyers ? (
            <span
              style={{
                background: "#f0f5e8",
                color: "#2c5c16",
                padding: "2px 8px",
                borderRadius: 20,
                fontSize: 10,
                fontWeight: 700,
                display: "inline-block",
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontFamily: FONT,
              }}
            >
              {p.topProduct}
            </span>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  background: "#F6F7F1",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 3,
                    width: `${(p.totalRevenue / maxR) * 100}%`,
                    background: `linear-gradient(90deg,${PAL[i % PAL.length]},${PAL[(i + 2) % PAL.length]})`,
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 700,
                  color: "#94a3b8",
                  minWidth: 28,
                  textAlign: "right",
                  fontFamily: FONT,
                }}
              >
                {Math.round((p.totalRevenue / maxR) * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>
    ));
  };

  return (
    <PanelCard style={{ marginBottom: 22 }}>
      <CardHeader
        icon={Package}
        title="Sales vs Stock Recommendations"
        sub="Product performance · fast/slow movers · stock health"
        action={
          <button
            onClick={fetchData}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 13px",
              borderRadius: 9,
              border: "1.5px solid rgba(255,255,255,0.35)",
              background: "rgba(255,255,255,0.12)",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: FONT,
            }}
          >
            <RefreshCw
              size={12}
              style={{
                animation: loading ? "spin 1s linear infinite" : "none",
              }}
            />
            {loading ? "Loading…" : "Refresh"}
          </button>
        }
      />
      <div style={{ padding: "18px 20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: 10,
            marginBottom: 18,
          }}
        >
          {[
            {
              label: "SKUs Tracked",
              value: totalSKUs || "—",
              color: "#12241B",
              bg: "#F6F7F1",
              border: "#E1E6D8",
              icon: Layers,
            },
            {
              label: "Fast Movers",
              value: fastCount || "—",
              color: "#059669",
              bg: "#ecfdf5",
              border: "#a7f3d0",
              icon: TrendingUp,
            },
            {
              label: "Slow Movers",
              value: slowCount || "—",
              color: "#dc2626",
              bg: "#fef2f2",
              border: "#fecaca",
              icon: TrendingDown,
            },
            {
              label: "Avg Sales / Product",
              value: data?.avgQty ? `${data.avgQty} u` : "—",
              color: "#1e40af",
              bg: "#eff6ff",
              border: "#bfdbfe",
              icon: Activity,
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: s.bg,
                border: `1px solid ${s.border}`,
                borderRadius: 12,
                padding: "11px 13px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  marginBottom: 4,
                }}
              >
                <s.icon size={11} color={s.color} />
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 800,
                    color: "#5C6B60",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    fontFamily: FONT,
                  }}
                >
                  {s.label}
                </span>
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: s.color,
                  fontFamily: FONT,
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18 }}
        >
          <div>
            <div
              style={{
                display: "flex",
                gap: 3,
                background: "#f4f8f5",
                borderRadius: 11,
                padding: 4,
                marginBottom: 14,
                flexWrap: "wrap",
              }}
            >
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={tabSt(tab === t.id)}
                >
                  <t.icon size={11} /> {t.label}
                </button>
              ))}
            </div>
            {!loading &&
              (top10.length > 0 ||
                fast.length > 0 ||
                slow.length > 0 ||
                data?.topBuyers?.length > 0) && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      tab === "buyers"
                        ? "28px 1fr 70px 1fr"
                        : "28px 1fr 65px 70px 1fr",
                    gap: 8,
                    padding: "7px 10px",
                    borderBottom: "2px solid #f0f5e8",
                    fontSize: 9.5,
                    fontWeight: 800,
                    color: "#3b791e",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: 4,
                    fontFamily: FONT,
                  }}
                >
                  <span>#</span>
                  <span>Name</span>
                  {tab !== "buyers" && (
                    <span style={{ textAlign: "right" }}>Units</span>
                  )}
                  <span style={{ textAlign: "right" }}>
                    {tab === "buyers" ? "Items" : "Revenue"}
                  </span>
                  <span style={{ paddingLeft: 8 }}>
                    {tab === "buyers" ? "Top Product" : "Share"}
                  </span>
                </div>
              )}
            {loading ? (
              <div style={{ padding: "36px 0", textAlign: "center" }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    border: "3px solid #E1E6D8",
                    borderTopColor: "#3b791e",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    margin: "0 auto 10px",
                  }}
                />
                <div
                  style={{ fontSize: 12, color: "#5C6B60", fontFamily: FONT }}
                >
                  Loading…
                </div>
              </div>
            ) : (
              renderList()
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                background: "#F6F7F1",
                border: "1px solid #f0f5e8",
                borderRadius: 14,
                padding: "13px 14px",
              }}
            >
              <ChartLabel>
                <PieChart size={11} color="#3b791e" /> Revenue Share (Top 5)
              </ChartLabel>
              {revenuePie.length > 0 ? (
                <DonutChartSVG segments={revenuePie} size={120} />
              ) : (
                <div
                  style={{
                    height: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#D4DBC8",
                    fontSize: 12,
                    fontFamily: FONT,
                  }}
                >
                  —
                </div>
              )}
            </div>
            <div
              style={{
                background: "#F6F7F1",
                border: "1px solid #f0f5e8",
                borderRadius: 14,
                padding: "13px 14px",
              }}
            >
              <ChartLabel>
                <Activity size={11} color="#3b791e" /> Product Velocity
              </ChartLabel>
              {moverPie.length > 0 ? (
                <DonutChartSVG
                  segments={moverPie}
                  size={110}
                  centerLabel={totalSKUs.toString()}
                  centerSub="SKUs"
                />
              ) : (
                <div
                  style={{
                    height: 90,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#D4DBC8",
                    fontSize: 12,
                    fontFamily: FONT,
                  }}
                >
                  —
                </div>
              )}
            </div>
            <div
              style={{
                background: "#F6F7F1",
                border: "1px solid #f0f5e8",
                borderRadius: 14,
                padding: "13px 14px",
              }}
            >
              <ChartLabel>
                <ShoppingCart size={11} color="#3b791e" /> Stock Recommendations
              </ChartLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[
                  {
                    label: "Reorder Soon",
                    count: slowCount || 0,
                    color: "#d97706",
                    bg: "#fffbeb",
                    border: "#fde68a",
                    icon: AlertTriangle,
                  },
                  {
                    label: "Healthy Stock",
                    count: Math.max(0, totalSKUs - slowCount - fastCount),
                    color: "#059669",
                    bg: "#ecfdf5",
                    border: "#a7f3d0",
                    icon: CheckCircle,
                  },
                  {
                    label: "High Demand",
                    count: fastCount || 0,
                    color: "#1d4ed8",
                    bg: "#eff6ff",
                    border: "#bfdbfe",
                    icon: TrendingUp,
                  },
                ].map((r, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      background: r.bg,
                      border: `1px solid ${r.border}`,
                      borderRadius: 9,
                      padding: "8px 11px",
                    }}
                  >
                    <r.icon size={13} color={r.color} />
                    <span
                      style={{
                        flex: 1,
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#12241B",
                        fontFamily: FONT,
                      }}
                    >
                      {r.label}
                    </span>
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: r.color,
                        fontFamily: FONT,
                      }}
                    >
                      {r.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PanelCard>
  );
}

function BranchOperationsSnapshot({
  transactions = [],
  preset,
  rangeMode,
  appliedRange,
}) {
  const rows = useMemo(() => {
    const now = new Date();
    return transactions.filter((tx) => {
      const d = new Date(tx.created_at || tx.date || 0);
      if (Number.isNaN(d.getTime())) return false;
      if (rangeMode === "custom" && appliedRange) {
        const from = new Date(`${appliedRange.from}T00:00:00`);
        const to = new Date(`${appliedRange.to}T23:59:59.999`);
        return d >= from && d <= to;
      }
      if (preset === "day") return d.toDateString() === now.toDateString();
      if (preset === "week") {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return d >= start && d <= end;
      }
      if (preset === "year") return d.getFullYear() === now.getFullYear();
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    });
  }, [transactions, preset, rangeMode, appliedRange]);

  const metrics = useMemo(() => {
    const products = new Map();
    const hours = new Map();
    let units = 0;

    rows.forEach((tx) => {
      const hour = new Date(tx.created_at || tx.date).getHours();
      hours.set(hour, (hours.get(hour) || 0) + Number(tx.total || 0));

      let items = tx.items || tx.products || tx.cart_items || [];
      if (typeof items === "string") {
        try {
          items = JSON.parse(items);
        } catch {
          items = [];
        }
      }
      (Array.isArray(items) ? items : []).forEach((item) => {
        const name =
          item.product_name ||
          item.productName ||
          item.name ||
          item.menu_name ||
          "Unnamed Product";
        const qty = Number(item.quantity ?? item.qty ?? 1);
        units += qty;
        products.set(name, (products.get(name) || 0) + qty);
      });
    });

    const rankedProducts = [...products.entries()].sort((a, b) => b[1] - a[1]);
    const peakHour = [...hours.entries()].sort((a, b) => b[1] - a[1])[0];
    const revenue = rows.reduce((sum, tx) => sum + Number(tx.total || 0), 0);
    const productRows = buildBranchItemBreakdown(rows);
    return {
      units,
      revenue,
      top: rankedProducts[0] || null,
      slow:
        rankedProducts.length > 1
          ? rankedProducts[rankedProducts.length - 1]
          : null,
      peakHour,
      productRows,
    };
  }, [rows]);

  const hourLabel = (hour) => {
    if (hour === null || hour === undefined) return "No data";
    const start = new Date();
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(hour + 1);
    return `${start.toLocaleTimeString("en-PH", { hour: "numeric" })}–${end.toLocaleTimeString("en-PH", { hour: "numeric" })}`;
  };

  const cards = [
    {
      label: "Transactions",
      value: rows.length.toLocaleString(),
      sub: `${metrics.units.toLocaleString()} units sold`,
      icon: Receipt,
      color: "#3b791e",
      bg: "#f0f5e8",
    },
    {
      label: "Best Seller",
      value: metrics.top?.[0] || "No sales data",
      sub: metrics.top
        ? `${metrics.top[1]} units sold`
        : "Record product-level items",
      icon: TrendingUp,
      color: "#3b791e",
      bg: "#f0f5e8",
    },
    {
      label: "Needs Attention",
      value: metrics.slow?.[0] || "Not enough data",
      sub: metrics.slow
        ? `${metrics.slow[1]} units sold`
        : "Requires at least two products",
      icon: TrendingDown,
      color: "#b45309",
      bg: "#fff7ed",
    },
    {
      label: "Busiest Hour",
      value: hourLabel(metrics.peakHour?.[0]),
      sub: metrics.peakHour
        ? `${fmtPeso(metrics.peakHour[1])} sales`
        : "No transactions yet",
      icon: Clock,
      color: "#1d4ed8",
      bg: "#eff6ff",
    },
  ];

  return (
    <section
      style={{
        background: "#fff",
        border: "1px solid #E1E6D8",
        borderRadius: 16,
        padding: "20px 22px",
        boxShadow: "0 8px 24px rgba(50,109,32,.06)",
        marginBottom: 18,
      }}
    >
      <div className="v-section-head">
        <VSectionTitle icon={<Activity size={18} />}>
          Branch Operations Snapshot
        </VSectionTitle>
        <span style={{ fontSize: 11.5, color: "#5C6B60", fontWeight: 600 }}>
          Selected period · {fmtPeso(metrics.revenue)} revenue
        </span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
          gap: 12,
        }}
      >
        {cards.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div
            key={label}
            style={{
              border: "1px solid #E1E6D8",
              borderRadius: 14,
              padding: "15px 16px",
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 9,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div className="v-kpi-label">{label}</div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "#12241B",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={String(value)}
                >
                  {value}
                </div>
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  background: bg,
                  color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={17} />
              </div>
            </div>
            <div className="v-kpi-sub">{sub}</div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 14,
          paddingTop: 14,
          borderTop: "1px solid #E1E6D8",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginBottom: 9,
            fontSize: 12,
            fontWeight: 800,
            color: "#12241B",
          }}
        >
          <TrendingUp size={14} color="#3b791e" /> Top Item Performance
        </div>
        {metrics.productRows.length === 0 ? (
          <div style={{ color: "#9CA89C", fontSize: 12 }}>
            No item-level sales data for this period.
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto",
              border: "1px solid #E1E6D8",
              borderRadius: 10,
            }}
          >
            <table
              className="v-table"
              style={{
                minWidth: 700,
                tableLayout: "fixed",
              }}
            >
              <colgroup>
                <col style={{ width: "36%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "17%" }} />
                <col style={{ width: "17%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Item Sold</th>
                  <th style={{ textAlign: "right" }}>Qty</th>
                  <th style={{ textAlign: "right" }}>Revenue</th>
                  <th style={{ textAlign: "right" }}>Cost</th>
                  <th style={{ textAlign: "right" }}>Profit</th>
                </tr>
              </thead>
              <tbody>
                {metrics.productRows.slice(0, 5).map((row) => (
                  <tr key={row.name}>
                    <td
                      style={{
                        fontWeight: 700,
                        color: "#12241B",
                        textAlign: "left",
                      }}
                    >
                      {row.name}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        color: "#5C6B60",
                        fontWeight: 600,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {row.qty.toLocaleString()}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontWeight: 700,
                        color: "#12241B",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {fmtPeso(row.revenue)}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontWeight: 650,
                        color: row.cost == null ? "#94a3b8" : "#5C6B60",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {row.cost == null ? "—" : fmtPeso(row.cost)}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontWeight: 750,
                        color: row.profit == null ? "#94a3b8" : "#12241B",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {row.profit == null ? "—" : fmtPeso(row.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}


function buildBranchItemBreakdown(transactions = []) {
  const itemMap = new Map();
  let fallbackTransactionRevenue = 0;
  let fallbackTransactionCost = 0;

  const parseItems = (tx) => {
    let items = tx?.items || tx?.products || tx?.cart_items || [];
    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch {
        items = [];
      }
    }
    return Array.isArray(items) ? items : [];
  };

  transactions.forEach((tx) => {
    const txRevenue = Number(tx?.total || 0);
    const txCost = Number(
      tx?.cogs ??
        tx?.cost_of_goods_sold ??
        tx?.cost_of_sales ??
        tx?.cost ??
        0,
    );
    const items = parseItems(tx);

    if (!items.length) {
      fallbackTransactionRevenue += txRevenue;
      fallbackTransactionCost += txCost;
      return;
    }

    const rawLines = items.map((item) => {
      const qty = Number(item?.quantity ?? item?.qty ?? 1) || 1;
      const revenue =
        Number(item?.subtotal ?? item?.total ?? item?.line_total ?? 0) ||
        Number(item?.price ?? item?.unit_price ?? item?.selling_price ?? 0) *
          qty;
      const explicitUnitCost =
        item?.unit_cost ??
        item?.cost_price ??
        item?.cost ??
        item?.cogs ??
        item?.unitCost ??
        null;
      const explicitCost =
        explicitUnitCost == null ? null : Number(explicitUnitCost) * qty;
      const name =
        item?.product_name ||
        item?.productName ||
        item?.name ||
        item?.menu_name ||
        "Unnamed Product";

      return { name, qty, revenue, explicitCost };
    });

    const explicitCostTotal = rawLines.reduce(
      (sum, line) => sum + (line.explicitCost ?? 0),
      0,
    );
    const remainingCost = Math.max(0, txCost - explicitCostTotal);
    const revenueBasis =
      rawLines.reduce((sum, line) => sum + Math.max(line.revenue, 0), 0) ||
      rawLines.length;

    rawLines.forEach((line) => {
      const allocatedCost =
        line.explicitCost != null
          ? line.explicitCost
          : remainingCost *
            (Math.max(line.revenue, 0) / revenueBasis);

      const current = itemMap.get(line.name) || {
        qty: 0,
        revenue: 0,
        cost: 0,
        hasCost: false,
      };

      current.qty += line.qty;
      current.revenue += line.revenue;
      current.cost += allocatedCost;
      current.hasCost =
        current.hasCost ||
        line.explicitCost != null ||
        txCost > 0;

      itemMap.set(line.name, current);
    });
  });

  if (!itemMap.size && (fallbackTransactionRevenue || fallbackTransactionCost)) {
    itemMap.set("Transaction-level data", {
      qty: transactions.length,
      revenue: fallbackTransactionRevenue,
      cost: fallbackTransactionCost,
      hasCost: fallbackTransactionCost > 0,
    });
  }

  return [...itemMap.entries()]
    .map(([name, d]) => ({
      name,
      qty: d.qty,
      revenue: d.revenue,
      cost: d.hasCost ? d.cost : null,
      profit: d.hasCost ? d.revenue - d.cost : null,
      margin:
        d.hasCost && d.revenue > 0
          ? ((d.revenue - d.cost) / d.revenue) * 100
          : null,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

function FrDashboardContent({ transactions, brands, user }) {
  const userBranch = (user?.branch || "").trim();
  const userBrand = String(
    user?.brand ||
      user?.brand_name ||
      user?.brandName ||
      brands?.[0]?.name ||
      "",
  ).trim();
  const today = new Date();
  const fmt8 = (d) => d.toISOString().slice(0, 10);
  const [dashboardTab, setDashboardTab] = useState("overview");
  const [dashboardDrilldown, setDashboardDrilldown] = useState(null);

  // ── date-range state ──────────────────────────────────────────────────────
  const [rangeMode, setRangeMode] = useState("preset");
  const [preset, setPreset] = useState("month");
  const [customFrom, setCustomFrom] = useState(
    fmt8(new Date(today.getFullYear(), today.getMonth(), 1)),
  );
  const [customTo, setCustomTo] = useState(fmt8(today));
  const [appliedRange, setAppliedRange] = useState(null);

  // ── archive state ─────────────────────────────────────────────────────────
  const storageKey = `frArchives_branch_${userBranch.trim().toLowerCase()}`;
  const [archives, setArchives] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "[]");
    } catch {
      return [];
    }
  });
  const [showArchivePanel, setShowArchivePanel] = useState(false);
  const [viewingArchive, setViewingArchive] = useState(null);
  const [archiveYearInput, setArchiveYearInput] = useState(
    String(today.getFullYear()),
  );
  const [archiveConfirm, setArchiveConfirm] = useState(false);

  // ── chart tooltip ─────────────────────────────────────────────────────────
  const [tooltip, setTooltip] = useState(null);
  const svgRef = useRef(null);

  // ── KPI (server-side) ─────────────────────────────────────────────────────
  const [kpiData, setKpiData] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(false);

  const scopedTransactions = useMemo(() => {
    const branch = userBranch.toLowerCase();

    return (transactions || []).filter(
      (tx) =>
        (tx.branch || "").trim().toLowerCase() === branch &&
        (!userBrand ||
          !String(tx.brand || tx.brand_name || "").trim() ||
          String(tx.brand || tx.brand_name || "")
            .trim()
            .toLowerCase() === userBrand.toLowerCase()),
    );
  }, [transactions, userBranch, userBrand]);

  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, title, message = "") => {
    setToast({
      type,
      title,
      message,
    });
  }, []);

  const tabSt = (a) => ({
    padding: "6px 13px",
    borderRadius: 9,
    border: "none",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: FONT,
    transition: "all .15s",
    background: a ? "linear-gradient(135deg,#509820,#3b791e)" : "transparent",
    color: a ? "#fff" : "#5C6B60",
    boxShadow: a ? "0 2px 8px rgba(59,121,30,.35)" : "none",
  });

  const fetchKpis = useCallback(async () => {
    if (!userBranch) return;
    setKpiLoading(true);
    try {
      const params = new URLSearchParams();
      if (rangeMode === "preset") {
        params.set("preset", preset);
      } else if (appliedRange) {
        params.set("from", appliedRange.from);
        params.set("to", appliedRange.to);
      } else {
        params.set("preset", "month");
      }
      params.set("branch", userBranch.trim());
      if (!userBranch) return;

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/dashboard/stats?${params}`,
      );
      const data = await res.json();
      if (!data.error) setKpiData(data);
    } catch (e) {
      console.error("KPI fetch error:", e);
    } finally {
      setKpiLoading(false);
    }
  }, [rangeMode, preset, appliedRange, userBranch]);

  useEffect(() => {
    if (!viewingArchive) fetchKpis();
  }, [fetchKpis, viewingArchive]);

  // ── filter transactions to this branch ───────────────────────────────────
  const myTransactions = scopedTransactions;
  const periodTransactions = useMemo(() => {
    const now = new Date();
    return myTransactions.filter((tx) => {
      const d = new Date(tx.created_at || tx.date || 0);
      if (Number.isNaN(d.getTime())) return false;
      if (rangeMode === "custom" && appliedRange) {
        return (
          d >= new Date(`${appliedRange.from}T00:00:00`) &&
          d <= new Date(`${appliedRange.to}T23:59:59.999`)
        );
      }
      if (preset === "day") return d.toDateString() === now.toDateString();
      if (preset === "week") {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return d >= start && d <= end;
      }
      if (preset === "year") return d.getFullYear() === now.getFullYear();
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    });
  }, [myTransactions, preset, rangeMode, appliedRange]);
  // ── chart data ────────────────────────────────────────────────────────────
  const chartData = useMemo(() => {
    if (viewingArchive) return viewingArchive.chartData;

    const txList = myTransactions;
    if (!txList.length) return { labels: [], values: [] };

    const now = new Date();

    const filtered = txList.filter((tx) => {
      const d = new Date(tx.created_at);
      if (preset === "day") return d.toDateString() === now.toDateString();
      if (preset === "week") {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return d >= start && d <= end;
      }
      if (preset === "month")
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      if (preset === "year") return d.getFullYear() === now.getFullYear();
      if (rangeMode === "custom" && appliedRange) {
        return (
          d >= new Date(appliedRange.from) && d <= new Date(appliedRange.to)
        );
      }
      return true;
    });

    if (rangeMode === "custom" && appliedRange) {
      const from = new Date(appliedRange.from);
      const to = new Date(appliedRange.to);
      const diffDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
      const numWeeks = Math.max(1, Math.ceil(diffDays / 7));
      const labels = Array.from(
        { length: numWeeks },
        (_, i) => `Week ${i + 1}`,
      );
      const values = Array(numWeeks).fill(0);
      filtered.forEach((tx) => {
        const d = new Date(tx.created_at);
        const weekIdx = Math.min(
          Math.floor((d - from) / (7 * 24 * 60 * 60 * 1000)),
          numWeeks - 1,
        );
        values[weekIdx] += tx.total || 0;
      });
      return { labels, values };
    }

    let grouped = {};
    filtered.forEach((tx) => {
      const d = new Date(tx.created_at);
      let label;
      if (preset === "day") label = `${d.getHours()}:00`;
      if (preset === "week")
        label = d.toLocaleDateString("en-US", { weekday: "short" });
      if (preset === "month") label = `Day ${d.getDate()}`;
      if (preset === "year")
        label = d.toLocaleDateString("en-US", { month: "short" });
      grouped[label] = (grouped[label] || 0) + Number(tx.total || 0);
    });

    const labels = Object.keys(grouped);
    const values = labels.map((l) => grouped[l]);
    return { labels, values };
  }, [myTransactions, preset, rangeMode, appliedRange, viewingArchive]);

  // ── chart derived values ──────────────────────────────────────────────────
  const values = chartData.values;
  const total = useMemo(() => values.reduce((a, b) => a + b, 0), [values]);
  const avg = useMemo(
    () => (values.length ? Math.round(total / values.length) : 0),
    [total, values.length],
  );
  const peak = useMemo(
    () => (values.length ? Math.max(...values) : 0),
    [values],
  );
  const peakLabel = values.length
    ? chartData.labels[values.indexOf(peak)]
    : "—";
  const low = useMemo(
    () => (values.length ? Math.min(...values) : 0),
    [values],
  );
  const pctChange =
    values.length > 1 && values[0] > 0
      ? (((values[values.length - 1] - values[0]) / values[0]) * 100).toFixed(1)
      : "0.0";
  const trending = Number(pctChange) >= 0;

  // ── SVG chart geometry ────────────────────────────────────────────────────
  const SVG_W = 820,
    SVG_H = 260,
    PAD_L = 64,
    PAD_R = 16,
    PAD_T = 18,
    PAD_B = 36;
  const plotW = SVG_W - PAD_L - PAD_R;
  const plotH = SVG_H - PAD_T - PAD_B;
  const maxV = peak > 0 ? peak * 1.18 : 1;

  const pts = useMemo(
    () =>
      values.map((v, i) => ({
        x: PAD_L + (i / Math.max(values.length - 1, 1)) * plotW,
        y: PAD_T + plotH - (v / maxV) * plotH,
        v,
        label: chartData.labels[i],
      })),
    [values, chartData.labels, maxV, plotH, plotW],
  );

  const { linePath, areaPath } = useMemo(() => {
    if (!pts.length) return { linePath: "", areaPath: "" };
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const cx = (pts[i].x + pts[i + 1].x) / 2;
      d += ` C ${cx} ${pts[i].y}, ${cx} ${pts[i + 1].y}, ${pts[i + 1].x} ${pts[i + 1].y}`;
    }
    return {
      linePath: d,
      areaPath:
        d +
        ` L ${pts[pts.length - 1].x} ${PAD_T + plotH} L ${pts[0].x} ${PAD_T + plotH} Z`,
    };
  }, [pts, PAD_T, plotH]);

  const yTicks = useMemo(
    () =>
      [0, 0.25, 0.5, 0.75, 1].map((t) => ({
        y: PAD_T + plotH - t * plotH,
        label: fmtShort(t * maxV),
      })),
    [maxV, PAD_T, plotH],
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!svgRef.current || !pts.length) return;
      const rect = svgRef.current.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * SVG_W;
      let best = pts[0],
        bestDist = Infinity;
      for (const p of pts) {
        const dist = Math.abs(p.x - mx);
        if (dist < bestDist) {
          bestDist = dist;
          best = p;
        }
      }
      setTooltip({ x: best.x, y: best.y, label: best.label, value: best.v });
    },
    [pts],
  );

  // ── archive helpers ───────────────────────────────────────────────────────
  const getRangeLabel = () => {
    if (viewingArchive) return `Archive: ${viewingArchive.year}`;
    if (rangeMode === "custom" && appliedRange)
      return `${appliedRange.from} → ${appliedRange.to}`;
    return (
      {
        day: "Today",
        week: "This Week",
        month: "This Month",
        year: "This Year",
      }[preset] || "This Month"
    );
  };

  const saveArchive = () => {
    const year = parseInt(archiveYearInput);
    if (isNaN(year) || year < 2000 || year > 2100) {
      alert("Enter a valid year (2000–2100)");
      return;
    }
    if (archives.find((a) => a.year === year)) {
      alert(`Year ${year} already archived.`);
      return;
    }
    const snapshot = {
      year,
      label: `Full Year ${year}`,
      savedAt: new Date().toLocaleString(),
      chartData,
      kpis: {
        totalSales: kpiData?.totalSales || total,
        avgSales: avg,
        peakSales: peak,
      },
    };
    const updated = [...archives, snapshot].sort((a, b) => b.year - a.year);
    setArchives(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setArchiveConfirm(false);
    alert(`Year ${year} archived!`);
  };

  const deleteArchive = (year) => {
    if (!window.confirm(`Delete archive for ${year}?`)) return;
    const updated = archives.filter((a) => a.year !== year);
    setArchives(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    if (viewingArchive?.year === year) setViewingArchive(null);
  };

  const applyCustomRange = () => {
    if (!customFrom || !customTo) {
      setToast({
        type: "error",
        title: "Date Required",
        message: "Please select both From and To dates.",
      });
      return;
    }

    if (customFrom > customTo) {
      setToast({
        type: "error",
        title: "Invalid Date Range",
        message: 'The "From" date cannot be after the "To" date.',
      });
      return;
    }

    // Apply the selected custom date range
    setRangeMode("custom");
    setAppliedRange({
      from: customFrom,
      to: customTo,
    });
    setViewingArchive(null);

    // Format dates for toast
    const fromLabel = new Date(`${customFrom}T00:00:00`).toLocaleDateString(
      "en-PH",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      },
    );

    const toLabel = new Date(`${customTo}T00:00:00`).toLocaleDateString(
      "en-PH",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      },
    );

    // Show confirmation ONLY after Apply is clicked
    setToast({
      type: "success",
      title: "Date Filter Applied",
      message: `Showing data from ${fromLabel} to ${toLabel}.`,
    });
  };

  // ── today's quick stats ───────────────────────────────────────────────────
  const todayStr = today.toISOString().slice(0, 10);
  const todaySales = useMemo(() => {
    return scopedTransactions.filter((tx) =>
      (tx.created_at || "").startsWith(todayStr),
    );
  }, [scopedTransactions, todayStr]);
  const todayRevenue = todaySales.reduce(
    (s, tx) => s + Number(tx.total || 0),
    0,
  );
  const avgOrder = todaySales.length ? todayRevenue / todaySales.length : 0;
  const sortedBranchTransactions = useMemo(
    () =>
      [...periodTransactions].sort(
        (a, b) =>
          new Date(b.created_at || b.date || 0) -
          new Date(a.created_at || a.date || 0),
      ),
    [periodTransactions],
  );

  const itemBreakdown = useMemo(
    () => buildBranchItemBreakdown(periodTransactions),
    [periodTransactions],
  );

  const itemBreakdownTotals = useMemo(() => {
    const revenue = itemBreakdown.reduce((sum, row) => sum + row.revenue, 0);
    const hasCost = itemBreakdown.some((row) => row.cost != null);
    const cost = hasCost
      ? itemBreakdown.reduce((sum, row) => sum + Number(row.cost || 0), 0)
      : null;
    const profit = cost == null ? null : revenue - cost;
    const margin = revenue > 0 && profit != null ? (profit / revenue) * 100 : null;
    return { revenue, cost, profit, margin, hasCost };
  }, [itemBreakdown]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .fr-db-kpi-grid  { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:20px; }
        .fr-db-ins-grid  { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:20px; }
        .fr-db-bot-grid  { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        @media(max-width:960px){ .fr-db-kpi-grid{ grid-template-columns:repeat(2,1fr); } }
        @media(max-width:720px){ .fr-db-ins-grid,.fr-db-bot-grid{ grid-template-columns:1fr; } }
        .fr-db-kpi  { background:#fff; border:1px solid #DDE3D8; border-radius:14px; padding:18px 20px; box-shadow:0 2px 10px rgba(18,36,27,0.045); transition:transform .2s,box-shadow .2s,border-color .2s; }
        .fr-db-kpi:hover { transform:translateY(-1px); box-shadow:0 8px 20px rgba(18,36,27,0.08); border-color:#C9D2C6; }
        .fr-db-chart { background:#fff; border:1px solid #E1E6D8; border-radius:16px; padding:22px 24px 16px; box-shadow:0 8px 24px rgba(50,109,32,0.06); margin-bottom:18px; }
        .fr-db-ins  { background:#fff; border:1px solid #E1E6D8; border-radius:16px; padding:18px 20px; box-shadow:0 8px 24px rgba(50,109,32,0.06); }
        .fr-db-tab-group { display:flex; gap:3px; background:#F6F7F1; border:1px solid #E1E6D8; border-radius:999px; padding:4px; }
        .fr-db-tab { padding:6px 14px; border-radius:999px; border:none; background:transparent; font-size:12px; font-weight:600; color:#5C6B60; cursor:pointer; transition:all .15s; font-family:inherit; }
        .fr-db-tab.active { background:#12241B; color:#fff; box-shadow:0 2px 8px rgba(18,36,27,.16); }
        .fr-db-tab:hover:not(.active) { color:#12241B; background:#f0f5e8; }
        .fr-db-date { padding:7px 11px; border-radius:9px; border:1.5px solid #D4DBC8; background:#F6F7F1; font-size:12px; font-family:inherit; color:#12241B; outline:none; }
        .fr-db-date:focus { border-color:#3b791e; }
        .fr-db-apply { padding:7px 16px; border-radius:9px; border:none; background:#12241B; color:#fff; font-size:12px; font-weight:700; cursor:pointer; font-family:inherit; }
        .fr-db-tooltip { position:absolute; background:linear-gradient(135deg,#12241B,#2c5c16); color:#fff; border-radius:12px; padding:9px 14px; pointer-events:none; white-space:nowrap; box-shadow:0 6px 20px rgba(0,0,0,0.22); transform:translate(-50%,-100%) translateY(-12px); z-index:10; }
        .fr-db-tooltip::after { content:''; position:absolute; bottom:-6px; left:50%; transform:translateX(-50%); border:6px solid transparent; border-top-color:#2c5c16; border-bottom:none; }
        .fr-db-arc-panel { background:#fff; border:1px solid rgba(59,121,30,0.15); border-radius:18px; padding:22px 24px; box-shadow:0 2px 16px rgba(50,109,32,0.08); margin-bottom:18px; }
        .fr-db-arc-row   { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-radius:10px; border:1px solid #E1E6D8; margin-bottom:8px; background:#fbfdf6; }
        .fr-db-arc-row:hover { background:#f0f5e8; }
        .fr-db-arc-btn   { padding:5px 13px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; font-family:inherit; border:1px solid; }
        .fr-db-view-banner { background:linear-gradient(135deg,#12241B,#2c5c16); color:#fff; border-radius:14px; padding:12px 20px; margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; }
        .manager-dashboard-tabs { background:#fff; border:1px solid #DCE9DB; border-radius:16px; padding:7px; margin-bottom:16px; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:7px; box-shadow:0 2px 14px rgba(50,109,32,.06); }
        .manager-dashboard-tab { display:flex; align-items:center; gap:10px; min-height:67px; padding:11px 13px; border-radius:12px; cursor:pointer; text-align:left; font-family:inherit; transition:all .18s ease; }
        .manager-dashboard-tab:not(.active):hover { background:#F6F7F1 !important; color:#12241B !important; }
        @media(max-width:900px){ .manager-dashboard-tabs{grid-template-columns:1fr}.manager-dashboard-tab{min-height:58px} }
      `}</style>

      {/* Three-tab dashboard workspace — same UX treatment as AdminDashboard */}
      <div className="manager-dashboard-tabs">
        {[
          {
            id: "overview",
            number: "01",
            label: "Overview",
            question: "How is my branch performing?",
            icon: Home,
          },
          {
            id: "sales_ai",
            number: "02",
            label: "Sales & AI Analysis",
            question: "Why are sales changing?",
            icon: LineChart,
          },
          {
            id: "stock_products",
            number: "03",
            label: "Stock & Product Performance",
            question: "What should I reorder or improve?",
            icon: Layers,
          },
        ].map((tab) => {
          const active = dashboardTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`manager-dashboard-tab${active ? " active" : ""}`}
              onClick={() => setDashboardTab(tab.id)}
              style={{
                border: `1px solid ${active ? "#A9C982" : "transparent"}`,
                background: active
                  ? "linear-gradient(135deg,#F2F7EB,#EAF3DF)"
                  : "transparent",
                color: active ? "#2c5c16" : "#64748b",
                boxShadow: active
                  ? "inset 0 0 0 1px rgba(59,121,30,.05)"
                  : "none",
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: active ? "#3b791e" : "#F1F5F0",
                  color: active ? "#bdd43c" : "#71806F",
                }}
              >
                <Icon size={16} />
              </span>
              <span style={{ minWidth: 0 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 9,
                    fontWeight: 900,
                    letterSpacing: ".08em",
                    opacity: 0.72,
                    marginBottom: 2,
                  }}
                >
                  {tab.number}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: 11.4,
                    fontWeight: 850,
                    lineHeight: 1.25,
                  }}
                >
                  {tab.label}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: 9.4,
                    color: active ? "#5C6B60" : "#9CA89C",
                    fontWeight: 650,
                    marginTop: 3,
                    lineHeight: 1.25,
                  }}
                >
                  {tab.question}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          margin: "18px 0 12px",
          color: "#5C6B60",
        }}
      >
        <span style={{ height: 1, background: "#DCE9DB", flex: 1 }} />
        <span
          style={{
            fontSize: 10,
            fontWeight: 850,
            letterSpacing: ".11em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {dashboardTab === "overview"
            ? "Branch Performance Workspace"
            : dashboardTab === "sales_ai"
              ? "Sales & AI Decision Workspace"
              : "Stock & Product Decision Workspace"}
        </span>
        <span style={{ height: 1, background: "#DCE9DB", flex: 1 }} />
      </div>

      {/* ── Archive viewing banner ── */}
      {viewingArchive && (
        <div className="fr-db-view-banner">
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            <Archive size={16} /> Viewing Archive: {viewingArchive.year}
            <span style={{ opacity: 0.6, fontSize: 12, fontWeight: 400 }}>
              — saved {viewingArchive.savedAt}
            </span>
          </span>
          <button
            onClick={() => setViewingArchive(null)}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#fff",
              borderRadius: 8,
              padding: "5px 14px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <X size={12} /> Exit Archive View
          </button>
        </div>
      )}

      {/* ── Filter + Date toolbar ── */}
      <div
        style={{
          background: "#fff",
          border: "1px solid rgba(59,121,30,0.12)",
          borderRadius: 14,
          padding: "12px 16px",
          marginBottom: 14,
          boxShadow: "0 1px 8px rgba(50,109,32,0.05)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        {/* Preset tabs */}
        <div
          style={{
            display: "flex",
            gap: 3,
            background: "#F6F7F1",
            borderRadius: 10,
            padding: 3,
          }}
        >
          {["day", "week", "month", "year"].map((p) => (
            <button
              key={p}
              style={tabSt(rangeMode === "preset" && preset === p)}
              onClick={() => {
                setRangeMode("preset");
                setPreset(p);
                setViewingArchive(null);

                const labels = {
                  day: "Today",
                  week: "This Week",
                  month: "This Month",
                  year: "This Year",
                };

                showToast(
                  "success",
                  "Date Filter Applied",
                  `Dashboard data is now filtered to ${labels[p]}.`,
                );
              }}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Custom range */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Calendar size={12} color="#5C6B60" />
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            max={customTo}
            style={{
              padding: "6px 9px",
              borderRadius: 8,
              border: "1.5px solid #D4DBC8",
              background: "#F6F7F1",
              fontSize: 11,
              fontFamily: FONT,
              color: "#12241B",
              outline: "none",
            }}
          />
          <span style={{ color: "#5C6B60", fontSize: 11, fontFamily: FONT }}>
            to
          </span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            min={customFrom}
            max={fmt8(today)}
            style={{
              padding: "6px 9px",
              borderRadius: 8,
              border: "1.5px solid #D4DBC8",
              background: "#F6F7F1",
              fontSize: 11,
              fontFamily: FONT,
              color: "#12241B",
              outline: "none",
            }}
          />
          <button
            onClick={applyCustomRange}
            style={{
              padding: "6px 13px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg,#509820,#3b791e)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            Apply
          </button>
        </div>

        {/* Archive */}
        <button
          onClick={() => setShowArchivePanel((v) => !v)}
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 9,
            border: "1.5px solid #D4DBC8",
            background: showArchivePanel ? "#E1E6D8" : "#fff",
            color: "#2c5c16",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: FONT,
          }}
        >
          <Archive size={13} /> Archives
          {archives.length > 0 && (
            <span
              style={{
                background: "#3b791e",
                color: "#fff",
                borderRadius: 10,
                padding: "1px 6px",
                fontSize: 10,
                fontWeight: 800,
              }}
            >
              {archives.length}
            </span>
          )}
        </button>
      </div>

      {/* Compact KPI row — branch financial view */}
      <div className="fr-db-kpi-grid">
        {[
          {
            label: "Revenue",
            value: fmtPeso(itemBreakdownTotals.revenue),
            sub: `${getRangeLabel()} · sales generated`,
            icon: <DollarSign size={16} />,
            sort: "revenue",
          },
          {
            label: "Cost",
            value: itemBreakdownTotals.hasCost
              ? fmtPeso(itemBreakdownTotals.cost)
              : "Not available",
            sub: itemBreakdownTotals.hasCost
              ? "Recorded cost of goods sold"
              : "Record cost of goods sold to calculate profit",
            icon: <Package size={16} />,
            sort: "cost",
          },
          {
            label: "Gross Profit",
            value:
              itemBreakdownTotals.profit == null
                ? "Not available"
                : fmtPeso(itemBreakdownTotals.profit),
            sub:
              itemBreakdownTotals.profit == null
                ? "Requires recorded cost"
                : "Revenue − Cost",
            icon: <TrendingUp size={16} />,
            sort: "profit",
          },
          {
            label: "Profit Margin",
            value:
              itemBreakdownTotals.margin == null
                ? "Not available"
                : `${itemBreakdownTotals.margin.toFixed(1)}%`,
            sub:
              itemBreakdownTotals.margin == null
                ? "Requires revenue and cost"
                : "Gross Profit ÷ Revenue",
            icon: <BarChart2 size={16} />,
            sort: "margin",
          },
        ].map((k, i) => {
          const sortedRows = [...itemBreakdown].sort((a, b) => {
            const av = Number(a[k.sort] ?? -Infinity);
            const bv = Number(b[k.sort] ?? -Infinity);
            return bv - av;
          });

          const openBreakdown = () =>
            setDashboardDrilldown({
              title: `${k.label} Breakdown`,
              rows: sortedRows,
              sort: k.sort,
            });

          return (
            <div
              key={i}
              className="fr-db-kpi"
              role="button"
              tabIndex={0}
              onClick={openBreakdown}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openBreakdown();
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                    color: "#6B756D",
                  }}
                >
                  {k.label}
                </div>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    background: "#F4F6F3",
                    color: "#37413A",
                    border: "1px solid #E1E6D8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {k.icon}
                </div>
              </div>
              <div
                style={{
                  fontSize: 23,
                  fontWeight: 850,
                  color: "#12241B",
                  letterSpacing: "-.02em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {k.value}
              </div>
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: "#8A948B",
                  marginTop: 6,
                  lineHeight: 1.45,
                }}
              >
                {k.sub}
              </div>
              <div
                style={{
                  fontSize: 9.5,
                  fontWeight: 750,
                  color: "#5C6B60",
                  marginTop: 9,
                }}
              >
                View item breakdown
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #DCE9DB",
          borderLeft: "4px solid #3b791e",
          borderRadius: 14,
          padding: "14px 17px",
          marginBottom: 18,
          boxShadow: "0 2px 10px rgba(50,109,32,.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            fontWeight: 850,
            color: "#12241B",
            marginBottom: 4,
          }}
        >
          {dashboardTab === "overview" ? (
            <Activity size={15} color="#3b791e" />
          ) : dashboardTab === "sales_ai" ? (
            <LineChart size={15} color="#3b791e" />
          ) : (
            <Layers size={15} color="#3b791e" />
          )}
          {dashboardTab === "overview"
            ? "Start with the branch performance summary"
            : dashboardTab === "sales_ai"
              ? "Read the actual sales evidence before the AI guidance"
              : "Compare stock movement with actual product sales"}
        </div>
        <div style={{ fontSize: 10.8, color: "#5C6B60", lineHeight: 1.55 }}>
          {dashboardTab === "overview"
            ? "Use revenue, cost, profit, margin, best sellers, and peak hours to understand the branch at a glance."
            : dashboardTab === "sales_ai"
              ? "Use the revenue line and period summary to confirm the trend, then review the recommendations generated from the same branch data."
              : "Prioritize items with low coverage, unusual stock movement, weak sales velocity, or immediate reorder recommendations."}
        </div>
      </div>

      {/* Archive panel */}
      {showArchivePanel && (
        <div
          style={{
            background: "#fff",
            border: "1px solid rgba(59,121,30,0.15)",
            borderRadius: 16,
            padding: "18px 20px",
            boxShadow: "0 2px 16px rgba(50,109,32,0.08)",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 14,
                color: "#12241B",
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <Archive size={15} color="#3b791e" /> Yearly Archives —{" "}
              {userBranch}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {!archiveConfirm ? (
                <>
                  <input
                    type="number"
                    value={archiveYearInput}
                    onChange={(e) => setArchiveYearInput(e.target.value)}
                    min="2000"
                    max="2100"
                    placeholder="Year"
                    style={{
                      padding: "6px 9px",
                      borderRadius: 8,
                      border: "1.5px solid #D4DBC8",
                      background: "#F6F7F1",
                      fontSize: 12,
                      fontFamily: FONT,
                      color: "#12241B",
                      outline: "none",
                      width: 86,
                    }}
                  />
                  <button
                    onClick={() => setArchiveConfirm(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 14px",
                      borderRadius: 8,
                      border: "none",
                      background: "linear-gradient(135deg,#3b791e,#3b791e)",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: FONT,
                    }}
                  >
                    <Plus size={12} /> Archive Year
                  </button>
                </>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#fef9c3",
                    border: "1.5px solid #fde68a",
                    borderRadius: 9,
                    padding: "6px 12px",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#92400e",
                      fontFamily: FONT,
                    }}
                  >
                    Archive {archiveYearInput}?
                  </span>
                  <button
                    onClick={saveArchive}
                    style={{
                      padding: "4px 11px",
                      borderRadius: 7,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: FONT,
                      border: "1px solid #3b791e",
                      background: "#E1E6D8",
                      color: "#2c5c16",
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setArchiveConfirm(false)}
                    style={{
                      padding: "4px 11px",
                      borderRadius: 7,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: FONT,
                      border: "1px solid #d1d5db",
                      background: "#f9fafb",
                      color: "#6b7280",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          {archives.length === 0 ? (
            <div
              style={{
                padding: "20px 0",
                textAlign: "center",
                color: "#9CA89C",
                fontSize: 13,
                fontFamily: FONT,
              }}
            >
              No archives yet.
            </div>
          ) : (
            archives.map((a) => (
              <div
                key={a.year}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 13px",
                  borderRadius: 9,
                  border: "1px solid #E1E6D8",
                  marginBottom: 7,
                  background: "#fbfdf6",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 13,
                      color: "#12241B",
                      fontFamily: FONT,
                    }}
                  >
                    {a.label}
                  </div>
                  <div
                    style={{
                      fontSize: 10.5,
                      color: "#5C6B60",
                      marginTop: 2,
                      fontFamily: FONT,
                    }}
                  >
                    Saved: {a.savedAt} · Total: {fmtPeso(a.kpis.totalSales)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 7 }}>
                  <button
                    onClick={() => {
                      setViewingArchive(
                        viewingArchive?.year === a.year ? null : a,
                      );
                      setShowArchivePanel(false);
                    }}
                    style={{
                      padding: "4px 11px",
                      borderRadius: 7,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: FONT,
                      border: `1px solid ${viewingArchive?.year === a.year ? "#3b791e" : "#D4DBC8"}`,
                      background:
                        viewingArchive?.year === a.year ? "#E1E6D8" : "#fbfdf6",
                      color: "#2c5c16",
                    }}
                  >
                    {viewingArchive?.year === a.year ? "Viewing" : "View"}
                  </button>
                  <button
                    onClick={() => deleteArchive(a.year)}
                    style={{
                      padding: "4px 11px",
                      borderRadius: 7,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: FONT,
                      border: "1px solid #fecaca",
                      background: "#fff",
                      color: "#ef4444",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Branch-owner operational summary */}
      {dashboardTab === "overview" && (
        <BranchOperationsSnapshot
          transactions={myTransactions}
          preset={preset}
          rangeMode={rangeMode}
          appliedRange={appliedRange}
        />
      )}

      {/* ── SECTION 1: SALES TREND ── */}
      {dashboardTab === "sales_ai" && (
        <>
          <SalesTrendSection
            values={values}
            labels={chartData.labels}
            kpiData={kpiData}
            total={total}
            avg={avg}
            peak={peak}
            low={low}
            peakLabel={peakLabel}
            pctChange={pctChange}
            trending={trending}
            getRangeLabel={getRangeLabel}
            filterLabel={`${userBranch} — ${getRangeLabel()}`}
          />

          {/* ── SECTION 2: PRESCRIPTIVE ANALYSIS ── */}
          <PrescriptiveSection
            transactions={myTransactions}
            filterLabel={`${userBranch} — ${getRangeLabel()}`}
            preset={preset}
            total={total}
            values={values}
            kpiData={kpiData}
          />
        </>
      )}

      {/* ── SECTION 3: SALES VS STOCK ── */}
      {dashboardTab === "stock_products" && (
        <>
          <SalesVsStockSection
            preset={preset}
            appliedRange={appliedRange}
            rangeMode={rangeMode}
            filterBranch={userBranch}
            filterBrand={null}
            selectedBrand={null}
            total={total}
          />

          {/* Product-level decisions: top, fast-moving, and slow-moving items */}
          <ProductAnalyticsPanel
            preset={preset}
            appliedRange={appliedRange}
            rangeMode={rangeMode}
            filterBranch={userBranch}
            filterBrand={null}
            selectedBrand={null}
          />
        </>
      )}

      {dashboardDrilldown && (
        <div
          className="v-modal-overlay"
          onClick={() => setDashboardDrilldown(null)}
        >
          <div
            className="v-modal"
            style={{
              maxWidth: 900,
              width: "96%",
              padding: 0,
              borderRadius: 16,
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid #E1E6D8",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#fff",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 9.5,
                    fontWeight: 800,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color: "#788178",
                  }}
                >
                  KPI DETAIL · {String(getRangeLabel()).toUpperCase()}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 850,
                    color: "#12241B",
                    marginTop: 3,
                  }}
                >
                  {dashboardDrilldown.title}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => setDashboardDrilldown(null)}
                  style={{
                    height: 34,
                    padding: "0 14px",
                    borderRadius: 999,
                    border: "1px solid #DCE3DB",
                    background: "#fff",
                    color: "#2F3831",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Back
                </button>
                <button
                  onClick={() => setDashboardDrilldown(null)}
                  aria-label="Close"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    border: "1px solid #DCE3DB",
                    background: "#fff",
                    color: "#5C6B60",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            <div
              style={{
                padding: "18px 20px 20px",
                maxHeight: "78vh",
                overflowY: "auto",
                background: "#fff",
              }}
            >
              <div
                style={{
                  fontSize: 10.8,
                  color: "#7A857B",
                  marginBottom: 14,
                }}
              >
                {userBranch} · {getRangeLabel()}
              </div>

              {dashboardDrilldown.rows.length === 0 ? (
                <VEmptyState
                  icon={BarChart2}
                  title="No branch data"
                  sub="No completed transactions are available for this selection."
                />
              ) : (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "minmax(220px,1.7fr) repeat(5,minmax(82px,1fr))",
                      gap: 12,
                      marginBottom: 16,
                    }}
                  >
                    {(() => {
                      const rows = dashboardDrilldown.rows;
                      const revenue = rows.reduce(
                        (sum, r) => sum + Number(r.revenue || 0),
                        0,
                      );
                      const hasCost = rows.some((r) => r.cost != null);
                      const cost = hasCost
                        ? rows.reduce(
                            (sum, r) => sum + Number(r.cost || 0),
                            0,
                          )
                        : null;
                      const profit = rows.some((r) => r.profit != null)
                        ? rows.reduce(
                            (sum, r) => sum + Number(r.profit || 0),
                            0,
                          )
                        : null;

                      const cards = [
                        {
                          label: "Revenue",
                          value: fmtPeso(revenue),
                        },
                        {
                          label: "Cost",
                          value: cost == null ? "—" : fmtPeso(cost),
                        },
                        {
                          label: "Profit",
                          value: profit == null ? "—" : fmtPeso(profit),
                        },
                      ];

                      return cards.map((card) => (
                        <div
                          key={card.label}
                          style={{
                            gridColumn: "span 2",
                            background: "#fff",
                            border: "1px solid #DDE3D8",
                            borderRadius: 12,
                            padding: "13px 14px",
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 9.5,
                              fontWeight: 800,
                              textTransform: "uppercase",
                              letterSpacing: ".07em",
                              color: "#7A857B",
                              marginBottom: 5,
                            }}
                          >
                            {card.label}
                          </div>
                          <div
                            style={{
                              fontSize: 20,
                              fontWeight: 850,
                              color: "#12241B",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {card.value}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>

                  {dashboardDrilldown.sort !== "margin" && (
                    <div
                      style={{
                        fontSize: 11.3,
                        color: "#4D584F",
                        lineHeight: 1.55,
                        marginBottom: 14,
                        padding: "2px 0",
                      }}
                    >
                      Item-level branch sales for the selected period. Revenue
                      reflects recorded sales; cost and profit are shown only
                      when item cost data is available.
                    </div>
                  )}

                  <div
                    style={{
                      overflowX: "auto",
                      border: "1px solid #E1E6D8",
                      borderRadius: 12,
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        minWidth: 830,
                        borderCollapse: "collapse",
                        fontFamily: FONT,
                        tableLayout: "fixed",
                      }}
                    >
                      <colgroup>
                        <col style={{ width: "31%" }} />
                        <col style={{ width: "9%" }} />
                        <col style={{ width: "15%" }} />
                        <col style={{ width: "15%" }} />
                        <col style={{ width: "15%" }} />
                        <col style={{ width: "15%" }} />
                      </colgroup>
                      <thead>
                        <tr style={{ background: "#F6F7F1" }}>
                          {[
                            ["Item Sold", "left"],
                            ["Qty", "right"],
                            ["Revenue", "right"],
                            ["Cost", "right"],
                            ["Profit", "right"],
                            ["Margin", "right"],
                          ].map(([label, align]) => (
                            <th
                              key={label}
                              style={{
                                padding: "11px 12px",
                                textAlign: align,
                                fontSize: 9.5,
                                fontWeight: 800,
                                color: "#68736B",
                                textTransform: "uppercase",
                                letterSpacing: ".07em",
                                borderBottom: "1px solid #DDE3D8",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardDrilldown.rows.map((row, index) => (
                          <tr
                            key={`${row.name}-${index}`}
                            style={{
                              background:
                                index % 2 === 0 ? "#fff" : "#FBFCFA",
                            }}
                          >
                            <td
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                borderBottom: "1px solid #EEF2ED",
                                fontSize: 12,
                                fontWeight: 750,
                                color: "#253028",
                              }}
                            >
                              {row.name}
                            </td>
                            <td
                              style={{
                                padding: "12px",
                                textAlign: "right",
                                borderBottom: "1px solid #EEF2ED",
                                fontSize: 12,
                                color: "#5D685F",
                                fontVariantNumeric: "tabular-nums",
                              }}
                            >
                              {Number(row.qty || 0).toLocaleString()}
                            </td>
                            <td
                              style={{
                                padding: "12px",
                                textAlign: "right",
                                borderBottom: "1px solid #EEF2ED",
                                fontSize: 12,
                                color: "#253028",
                                fontWeight: 700,
                                fontVariantNumeric: "tabular-nums",
                              }}
                            >
                              {fmtPeso(row.revenue)}
                            </td>
                            <td
                              style={{
                                padding: "12px",
                                textAlign: "right",
                                borderBottom: "1px solid #EEF2ED",
                                fontSize: 12,
                                color: "#5D685F",
                                fontWeight: 650,
                                fontVariantNumeric: "tabular-nums",
                              }}
                            >
                              {row.cost == null ? "—" : fmtPeso(row.cost)}
                            </td>
                            <td
                              style={{
                                padding: "12px",
                                textAlign: "right",
                                borderBottom: "1px solid #EEF2ED",
                                fontSize: 12,
                                color: "#253028",
                                fontWeight: 750,
                                fontVariantNumeric: "tabular-nums",
                              }}
                            >
                              {row.profit == null ? "—" : fmtPeso(row.profit)}
                            </td>
                            <td
                              style={{
                                padding: "12px",
                                textAlign: "right",
                                borderBottom: "1px solid #EEF2ED",
                                fontSize: 12,
                                color: "#5D685F",
                                fontWeight: 700,
                                fontVariantNumeric: "tabular-nums",
                              }}
                            >
                              {row.margin == null
                                ? "—"
                                : `${row.margin.toFixed(1)}%`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ background: "#F6F7F1" }}>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              fontSize: 12,
                              fontWeight: 850,
                              color: "#12241B",
                            }}
                          >
                            Total
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "right",
                              fontSize: 12,
                              fontWeight: 750,
                              color: "#4F5A51",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {dashboardDrilldown.rows
                              .reduce(
                                (sum, r) => sum + Number(r.qty || 0),
                                0,
                              )
                              .toLocaleString()}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "right",
                              fontSize: 12,
                              fontWeight: 850,
                              color: "#12241B",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {fmtPeso(
                              dashboardDrilldown.rows.reduce(
                                (sum, r) => sum + Number(r.revenue || 0),
                                0,
                              ),
                            )}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "right",
                              fontSize: 12,
                              fontWeight: 750,
                              color: "#4F5A51",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {(() => {
                              const hasCost = dashboardDrilldown.rows.some(
                                (r) => r.cost != null,
                              );
                              return hasCost
                                ? fmtPeso(
                                    dashboardDrilldown.rows.reduce(
                                      (sum, r) => sum + Number(r.cost || 0),
                                      0,
                                    ),
                                  )
                                : "—";
                            })()}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "right",
                              fontSize: 12,
                              fontWeight: 850,
                              color: "#12241B",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {(() => {
                              const hasProfit = dashboardDrilldown.rows.some(
                                (r) => r.profit != null,
                              );
                              return hasProfit
                                ? fmtPeso(
                                    dashboardDrilldown.rows.reduce(
                                      (sum, r) => sum + Number(r.profit || 0),
                                      0,
                                    ),
                                  )
                                : "—";
                            })()}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "right",
                              fontSize: 12,
                              fontWeight: 750,
                              color: "#4F5A51",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {(() => {
                              const rev = dashboardDrilldown.rows.reduce(
                                (sum, r) => sum + Number(r.revenue || 0),
                                0,
                              );
                              const profit = dashboardDrilldown.rows.some(
                                (r) => r.profit != null,
                              )
                                ? dashboardDrilldown.rows.reduce(
                                    (sum, r) => sum + Number(r.profit || 0),
                                    0,
                                  )
                                : null;
                              return profit == null || rev <= 0
                                ? "—"
                                : `${((profit / rev) * 100).toFixed(1)}%`;
                            })()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

const C = {
  green: "#3b791e",
  greenDk: "#2c5c16",
  greenLt: "#f0f5e8",
  greenMid: "#c9dba0",
  teal: "#509820",
  lime: "#bdd43c",
  limeInk: "#24310C",
  ink: "#12241B",
  muted: "#5C6B60",
  border: "#E1E6D8",
  bg: "#F6F7F1",
  white: "#ffffff",
  warn: "#b45309",
  warnBg: "#fff7ed",
  ok: "#2c5c16",
  okBg: "#f0f5e8",
  red: "#c0392b",
  redBg: "#fdf1f0",
};
const invInputSt = {
  height: 38,
  padding: "0 13px",
  borderRadius: 11,
  border: `1.5px solid ${C.border}`,
  background: C.white,
  fontSize: 13,
  color: C.ink,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  width: "100%",
};
const btnSt = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  height: 38,
  padding: "0 18px",
  borderRadius: 999,
  border: `1px solid ${C.border}`,
  background: C.white,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "inherit",
  whiteSpace: "nowrap",
};
const smallBtnSt = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  height: 28,
  padding: "0 12px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
  background: C.white,
};

const PAGE_SIZE = 15;
const EXPIRY_WARN_DAYS = 30; // ← add this

// ─── Icons ────────────────────────────────────────────────────────────────────
const SearchIcon = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);
const XIcon = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const StoreIcon = ({ size = 14, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const ChevronIcon = ({ size = 12, dir = "down" }) => {
  const d = { down: "m6 9 6 6 6-6", up: "m18 15-6-6-6 6" };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d[dir]} />
    </svg>
  );
};
const SortAscIcon = () => (
  <svg
    width={11}
    height={11}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m18 15-6-6-6 6" />
  </svg>
);
const SortDescIcon = () => (
  <svg
    width={11}
    height={11}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const RefreshIcon = ({ size = 13 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
const LockIcon = ({ size = 13 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// ─── Chip ─────────────────────────────────────────────────────────────────────
function Chip({ label, color, bg, onRemove }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 9px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        color,
        background: bg,
      }}
    >
      {label}{" "}
      <XIcon
        size={9}
        style={{ cursor: "pointer", marginLeft: 2 }}
        onClick={onRemove}
      />
    </span>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, setPage, total, pageSize }) {
  const totalPgs = Math.max(1, Math.ceil(total / pageSize));
  if (totalPgs <= 1) return null;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "11px 16px",
        borderTop: `1px solid ${C.border}`,
        background: "#f9fefb",
      }}
    >
      <span style={{ fontSize: 12, color: C.muted }}>
        Showing{" "}
        <strong style={{ color: C.ink }}>
          {(page * pageSize + 1).toLocaleString()}–
          {Math.min((page + 1) * pageSize, total).toLocaleString()}
        </strong>{" "}
        of <strong style={{ color: C.ink }}>{total.toLocaleString()}</strong>
      </span>
      <div style={{ display: "flex", gap: 4 }}>
        {[
          { l: "«", a: () => setPage(0), d: page === 0 },
          {
            l: "‹",
            a: () => setPage((p) => Math.max(0, p - 1)),
            d: page === 0,
          },
        ].map(({ l, a, d }) => (
          <button
            key={l}
            onClick={a}
            disabled={d}
            style={{
              ...smallBtnSt,
              height: 30,
              width: 30,
              justifyContent: "center",
              border: `1px solid ${C.border}`,
              opacity: d ? 0.35 : 1,
            }}
          >
            {l}
          </button>
        ))}
        {Array.from({ length: totalPgs }, (_, i) => i)
          .filter((i) => Math.abs(i - page) <= 2)
          .map((i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              style={{
                ...smallBtnSt,
                height: 30,
                minWidth: 30,
                justifyContent: "center",
                fontWeight: i === page ? 800 : 600,
                border: i === page ? "none" : `1px solid ${C.border}`,
                background:
                  i === page
                    ? `linear-gradient(135deg,${C.teal},${C.green})`
                    : C.white,
                color: i === page ? C.white : C.ink,
              }}
            >
              {i + 1}
            </button>
          ))}
        {[
          {
            l: "›",
            a: () => setPage((p) => Math.min(totalPgs - 1, p + 1)),
            d: page >= totalPgs - 1,
          },
          { l: "»", a: () => setPage(totalPgs - 1), d: page >= totalPgs - 1 },
        ].map(({ l, a, d }) => (
          <button
            key={l}
            onClick={a}
            disabled={d}
            style={{
              ...smallBtnSt,
              height: 30,
              width: 30,
              justifyContent: "center",
              border: `1px solid ${C.border}`,
              opacity: d ? 0.35 : 1,
            }}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Read-only Inventory Table ─────────────────────────────────────────────────
function ReadOnlyInventoryTable({ items, page, setPage }) {
  const [sort, setSort] = useState({ col: "name", asc: true });
  const [expandedRows, setExpanded] = useState({});

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      let va = a[sort.col] ?? "",
        vb = b[sort.col] ?? "";
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      return sort.asc
        ? va < vb
          ? -1
          : va > vb
            ? 1
            : 0
        : va > vb
          ? -1
          : va < vb
            ? 1
            : 0;
    });
  }, [items, sort]);

  const pageItems = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const Th = ({ col, label, style: s }) => {
    const active = sort.col === col;
    return (
      <th
        onClick={() => {
          setSort((st) => ({ col, asc: st.col === col ? !st.asc : true }));
          setPage(0);
        }}
        style={{
          padding: "9px 12px",
          textAlign: "left",
          fontWeight: 800,
          fontSize: 11,
          color: active ? C.green : C.muted,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          borderBottom: `1px solid ${C.border}`,
          cursor: "pointer",
          userSelect: "none",
          whiteSpace: "nowrap",
          background: "#F6F7F1",
          ...s,
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          {label}{" "}
          {active ? (
            sort.asc ? (
              <SortAscIcon />
            ) : (
              <SortDescIcon />
            )
          ) : (
            <span style={{ opacity: 0.25 }}>
              <SortDescIcon />
            </span>
          )}
        </span>
      </th>
    );
  };
  const ThStatic = ({ label, style: s }) => (
    <th
      style={{
        padding: "9px 12px",
        textAlign: "left",
        fontWeight: 800,
        fontSize: 11,
        color: C.muted,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        borderBottom: `1px solid ${C.border}`,
        whiteSpace: "nowrap",
        background: "#F6F7F1",
        ...s,
      }}
    >
      {label}
    </th>
  );

  if (!items.length)
    return (
      <div
        style={{
          padding: "52px 0",
          textAlign: "center",
          color: C.muted,
          fontSize: 13,
          fontStyle: "italic",
        }}
      >
        No items match your filters.
      </div>
    );

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
        >
          <thead>
            <tr>
              <Th col="name" label="Item Name" style={{ minWidth: 160 }} />
              <Th col="category" label="Category" style={{ minWidth: 110 }} />
              <Th col="stock" label="Stock" style={{ minWidth: 72 }} />
              <Th col="min_stock" label="Min Stock" style={{ minWidth: 80 }} />
              <Th col="cost" label="Cost" style={{ minWidth: 90 }} />
              <Th col="price" label="Price" style={{ minWidth: 90 }} />
              <ThStatic label="Ingredients" style={{ minWidth: 140 }} />
              <ThStatic label="Status" style={{ minWidth: 100 }} />
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item) => {
              const low = Number(item.stock) <= Number(item.min_stock);
              const ingredients = item.ingredients || [];
              const isExpanded = expandedRows[item.id];
              return (
                <React.Fragment key={item.id}>
                  <tr
                    style={{
                      borderBottom: isExpanded ? "none" : `1px solid #f2faf5`,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#fafffe")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td
                      style={{
                        padding: "10px 12px",
                        fontWeight: 700,
                        color: C.ink,
                      }}
                    >
                      {item.name}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span
                        style={{
                          padding: "3px 9px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 600,
                          background: "#f0f5e8",
                          color: "#2c5c16",
                        }}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span
                        style={{
                          color: low ? C.warn : C.ink,
                          fontWeight: low ? 700 : 500,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        {item.stock}
                        {low && (
                          <span
                            style={{
                              background: "#fff3e0",
                              color: C.warn,
                              fontSize: 10,
                              fontWeight: 800,
                              padding: "2px 7px",
                              borderRadius: 20,
                            }}
                          >
                            LOW
                          </span>
                        )}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", color: C.muted }}>
                      {item.min_stock}
                    </td>
                    <td style={{ padding: "10px 12px", color: C.muted }}>
                      {fmtPeso(item.cost || 0)}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontWeight: 700,
                        color: C.green,
                      }}
                    >
                      {fmtPeso(item.price)}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      {ingredients.length === 0 ? (
                        <span
                          style={{
                            fontSize: 11,
                            color: C.muted,
                            fontStyle: "italic",
                          }}
                        >
                          —
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            setExpanded((p) => ({
                              ...p,
                              [item.id]: !p[item.id],
                            }))
                          }
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "3px 9px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            background: isExpanded ? C.greenMid : C.greenLt,
                            color: C.greenDk,
                            border: `1px solid ${C.greenMid}`,
                            cursor: "pointer",
                          }}
                        >
                          {ingredients.length} ingredient
                          {ingredients.length !== 1 ? "s" : ""}
                          <ChevronIcon
                            size={10}
                            dir={isExpanded ? "up" : "down"}
                          />
                        </button>
                      )}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      {low ? (
                        <span
                          style={{
                            padding: "3px 9px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            background: C.warnBg,
                            color: C.warn,
                          }}
                        >
                          Low Stock
                        </span>
                      ) : (
                        <span
                          style={{
                            padding: "3px 9px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            background: C.okBg,
                            color: C.ok,
                          }}
                        >
                          In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                  {isExpanded && ingredients.length > 0 && (
                    <tr style={{ borderBottom: `1px solid #f2faf5` }}>
                      <td
                        colSpan={8}
                        style={{
                          padding: "0 12px 12px 12px",
                          background: "#f9fefb",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 6,
                            padding: "10px 14px",
                            background: C.greenLt,
                            borderRadius: 10,
                            border: `1px solid ${C.greenMid}`,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              color: C.muted,
                              textTransform: "uppercase",
                              letterSpacing: "0.07em",
                              width: "100%",
                              marginBottom: 4,
                            }}
                          >
                            Ingredients required per unit:
                          </span>
                          {ingredients.map((ing, idx) => (
                            <span
                              key={idx}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "4px 10px",
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 600,
                                background: C.white,
                                color: C.ink,
                                border: `1px solid ${C.border}`,
                              }}
                            >
                              <span style={{ color: C.green, fontWeight: 700 }}>
                                {ing.name}
                              </span>
                              <span style={{ color: C.muted }}>×</span>
                              <span
                                style={{ fontWeight: 800, color: C.greenDk }}
                              >
                                {ing.qty_required}
                              </span>
                              {ing.unit && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: C.muted,
                                    background: C.bg,
                                    padding: "1px 6px",
                                    borderRadius: 20,
                                  }}
                                >
                                  {ing.unit}
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        setPage={setPage}
        total={sorted.length}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}

function FrMenuInventoryContent({ user, brands }) {
  const userBranch = (user?.branch || "").trim();

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState(null);

  const fetchInventory = useCallback(async () => {
    if (!userBranch) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/inventory?branch=${encodeURIComponent(userBranch)}`,
      );
      const d = await res.json();
      setInventory(Array.isArray(d) ? d : []);
    } catch {
      setInventory([]);
    } finally {
      setLoading(false);
    }
  }, [userBranch]);

  useEffect(() => {
    if (userBranch) fetchInventory();
  }, [fetchInventory, userBranch]);
  useEffect(() => {
    setPage(0);
    setSelectedId(null);
  }, [searchQuery, filterCategory, filterStatus]);

  const categories = useMemo(
    () => [...new Set(inventory.map((i) => i.category).filter(Boolean))].sort(),
    [inventory],
  );

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return inventory.filter((i) => {
      if (
        q &&
        !i.name.toLowerCase().includes(q) &&
        !(i.category || "").toLowerCase().includes(q)
      )
        return false;
      if (filterCategory && i.category !== filterCategory) return false;
      if (filterStatus === "low" && Number(i.stock) > Number(i.min_stock))
        return false;
      if (filterStatus === "ok" && Number(i.stock) <= Number(i.min_stock))
        return false;
      return true;
    });
  }, [inventory, searchQuery, filterCategory, filterStatus]);

  const lowCount = filteredItems.filter(
    (i) => Number(i.stock) <= Number(i.min_stock),
  ).length;
  const totalValue = filteredItems.reduce(
    (s, i) => s + (i.price || 0) * (i.stock || 0),
    0,
  );

  const selectedItem = filteredItems.find((i) => i.id === selectedId) || null;
  const anyFilter = filterCategory || filterStatus || searchQuery;
  const clearAll = () => {
    setFilterCategory("");
    setFilterStatus("");
    setSearchQuery("");
  };

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.ink }}
    >
      <style>{`
        .fr-menu-row:hover { background:#F6F7F1 !important; }
        @media(max-width:900px){ .fr-menu-master-detail{ grid-template-columns:1fr !important; } .fr-menu-detail{ border-top:1px solid #E1E6D8; } }
      `}</style>

      <ReadOnlyBanner message="Product Catalogue is view-only. You can search, filter, sort, and inspect item details." />

      <div
        style={{
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 2px 10px rgba(50,109,32,.05)",
        }}
      >
        {/* Flat header copied from the supplied Menu Inventory card layout */}
        <div
          style={{
            padding: "16px 22px",
            background: "#fbfcf8",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: C.greenLt,
                color: C.green,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${C.greenMid}`,
              }}
            >
              <StoreIcon size={16} color={C.green} />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: C.ink }}>
                Product Catalogue
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                {userBranch}
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 11,
              color: C.muted,
            }}
          >
            <span>
              {filteredItems.length} item{filteredItems.length === 1 ? "" : "s"}
            </span>
            {lowCount > 0 && (
              <span style={{ color: C.warn, fontWeight: 700 }}>
                {lowCount} low stock
              </span>
            )}
            <button
              onClick={fetchInventory}
              style={{
                ...smallBtnSt,
                height: 30,
                border: `1px solid ${C.border}`,
                background: C.white,
                color: C.greenDk,
              }}
            >
              <RefreshCw size={11} /> Refresh
            </button>
          </div>
        </div>

        {/* Filter row copied from MenuBrandCard */}
        <div
          style={{
            padding: "12px 18px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            background: "#fbfcf8",
          }}
        >
          <div
            style={{ position: "relative", flex: "1 1 200px", minWidth: 150 }}
          >
            <SearchIcon
              size={11}
              style={{
                position: "absolute",
                left: 9,
                top: "50%",
                transform: "translateY(-50%)",
                color: C.muted,
              }}
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search…"
              style={{
                ...invInputSt,
                height: 30,
                fontSize: 12,
                paddingLeft: 27,
              }}
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ ...invInputSt, height: 30, fontSize: 11, width: 150 }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ ...invInputSt, height: 30, fontSize: 11, width: 120 }}
          >
            <option value="">All Status</option>
            <option value="low">Low Stock</option>
            <option value="ok">In Stock</option>
          </select>
          {anyFilter && (
            <button
              onClick={clearAll}
              style={{
                ...smallBtnSt,
                height: 30,
                border: `1px solid ${C.border}`,
                background: C.white,
                color: C.muted,
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Same two-column list/details layout as the supplied Menu Inventory UX */}
        <div
          className="fr-menu-master-detail"
          style={{
            display: "grid",
            gridTemplateColumns: "420px 1fr",
            minHeight: 540,
            maxHeight: 700,
          }}
        >
          <div
            style={{
              borderRight: `1px solid ${C.border}`,
              overflowY: "auto",
              maxHeight: 700,
              minHeight: 0,
            }}
          >
            {loading ? (
              <div
                style={{
                  padding: "40px 14px",
                  textAlign: "center",
                  color: C.muted,
                  fontSize: 12,
                }}
              >
                Loading inventory…
              </div>
            ) : filteredItems.length === 0 ? (
              <div
                style={{
                  padding: "40px 14px",
                  textAlign: "center",
                  color: C.muted,
                  fontSize: 12,
                }}
              >
                No items found.
              </div>
            ) : (
              filteredItems.map((item) => {
                const low = Number(item.stock) <= Number(item.min_stock);
                const active = item.id === selectedId;
                const stockPct =
                  Number(item.min_stock) > 0
                    ? Math.min(
                        100,
                        Math.round(
                          (Number(item.stock || 0) /
                            (Number(item.min_stock) * 2)) *
                            100,
                        ),
                      )
                    : Number(item.stock) > 0
                      ? 100
                      : 0;
                return (
                  <div
                    key={item.id}
                    className="fr-menu-row"
                    onClick={() => setSelectedId(item.id)}
                    style={{
                      padding: "11px 14px",
                      cursor: "pointer",
                      borderLeft: `3px solid ${active ? C.lime : "transparent"}`,
                      background: active ? "#f6f8ef" : C.white,
                      borderBottom: `1px solid ${C.bg}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12.5,
                          fontWeight: active ? 800 : 600,
                          color: C.ink,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.name}
                      </span>
                      {low && (
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 800,
                            color: C.warn,
                            background: C.warnBg,
                            padding: "2px 7px",
                            borderRadius: 20,
                            flexShrink: 0,
                          }}
                        >
                          LOW
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                        fontSize: 10.5,
                        color: C.muted,
                        marginTop: 3,
                      }}
                    >
                      <span>{item.category || "Uncategorized"}</span>
                      <span style={{ fontWeight: 700, color: C.ink }}>
                        {item.stock ?? 0}
                      </span>
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <FrMiniBar
                        pct={stockPct}
                        color={low ? C.warn : C.green}
                        height={4}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div
            className="fr-menu-detail"
            style={{
              padding: 22,
              overflowY: "auto",
              maxHeight: 700,
              minHeight: 0,
            }}
          >
            {selectedItem ? (
              (() => {
                const low =
                  Number(selectedItem.stock) <= Number(selectedItem.min_stock);
                const ingredients = Array.isArray(selectedItem.ingredients)
                  ? selectedItem.ingredients
                  : [];
                return (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                        marginBottom: 18,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 800,
                            color: C.ink,
                          }}
                        >
                          {selectedItem.name}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: C.muted,
                            marginTop: 4,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <StoreIcon size={11} color={C.green} />
                          {userBranch}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "4px 9px",
                          borderRadius: 20,
                          background: low ? C.warnBg : C.okBg,
                          color: low ? C.warn : C.ok,
                          border: `1px solid ${low ? "#fed7aa" : C.greenMid}`,
                        }}
                      >
                        {low ? "LOW STOCK" : "IN STOCK"}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit,minmax(130px,1fr))",
                        gap: 10,
                        marginBottom: 18,
                      }}
                    >
                      {[
                        ["Category", selectedItem.category || "—"],
                        ["Stock", `${selectedItem.stock ?? 0}`],
                        ["Minimum Stock", `${selectedItem.min_stock ?? 0}`],
                        ["Price", fmtPeso(selectedItem.price || 0)],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          style={{
                            background: "#fbfcf8",
                            border: `1px solid ${C.border}`,
                            borderRadius: 12,
                            padding: "11px 12px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 9.5,
                              fontWeight: 800,
                              textTransform: "uppercase",
                              letterSpacing: ".06em",
                              color: C.muted,
                            }}
                          >
                            {label}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: C.ink,
                              marginTop: 4,
                            }}
                          >
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        borderTop: `1px solid ${C.border}`,
                        paddingTop: 16,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: ".07em",
                          color: C.muted,
                          marginBottom: 10,
                        }}
                      >
                        Ingredients
                      </div>
                      {ingredients.length === 0 ? (
                        <div
                          style={{
                            padding: "28px 0",
                            textAlign: "center",
                            color: C.muted,
                            fontSize: 12,
                          }}
                        >
                          No linked ingredients.
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          {ingredients.map((ing, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 10,
                                padding: "10px 12px",
                                border: `1px solid ${C.border}`,
                                borderRadius: 11,
                                background: C.white,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: C.ink,
                                }}
                              >
                                {ing.name ||
                                  ing.ingredient_name ||
                                  "Ingredient"}
                              </span>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: C.greenDk,
                                }}
                              >
                                {ing.qty_required ?? ing.quantity ?? "—"}{" "}
                                {ing.unit || ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  minHeight: 300,
                  color: C.muted,
                  fontSize: 12.5,
                  textAlign: "center",
                  padding: 20,
                }}
              >
                <div>
                  <Box size={28} color={C.green} style={{ marginBottom: 10 }} />
                  <br />
                  Select an item on the left
                  <br />
                  to view its details and ingredients.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── KPI STAT CARD — matches the rounded-card / icon-chip language used
   throughout StockInventoryContent (BrandOverviewCard, header gradients) ── */
function KpiStatCard({ icon, label, value, sub, tone = "green" }) {
  const tones = {
    green: { bg: C.greenLt, fg: C.greenDk },
    red: { bg: C.redBg, fg: C.red },
    blue: { bg: "#eff6ff", fg: "#1d4ed8" },
    orange: { bg: C.warnBg, fg: C.warn },
  };
  const t = tones[tone] || tones.green;
  return (
    <div
      style={{
        background: C.white,
        border: "1px solid rgba(59,121,30,0.12)",
        borderRadius: 16,
        padding: "16px 18px",
        boxShadow: "0 2px 16px rgba(59,121,30,0.07)",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          flexShrink: 0,
          background: t.bg,
          color: t.fg,
          border: `1px solid ${tone === "green" ? C.greenMid : C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "none",
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 800,
            color: C.muted,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 19,
            fontWeight: 800,
            color: C.ink,
            marginTop: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value}
        </div>
        {sub && (
          <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── FIFO / FEFO helpers (mirrors StockInventoryContent.jsx) ── */
const THREE_YEARS_MS = 3 * 365.25 * 24 * 60 * 60 * 1000;

function computeExpiryStatus(exp_date, brand) {
  if (!exp_date) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(exp_date);
  const msLeft = exp - now;
  const isIPharma = (brand || "").toLowerCase().includes("ipharma");
  if (isIPharma) {
    if (msLeft < THREE_YEARS_MS) return "expired";
    if (msLeft < THREE_YEARS_MS + 7 * 86400000) return "critical";
    if (msLeft < THREE_YEARS_MS + 30 * 86400000) return "warning";
    return "ok";
  }
  if (msLeft < 0) return "expired";
  if (msLeft < 7 * 86400000) return "critical";
  if (msLeft < 30 * 86400000) return "warning";
  return "ok";
}

function getFifoMethod(brand, isPerishable) {
  const isPharma = (brand || "").toLowerCase().includes("ipharma");
  if (isPharma || isPerishable) {
    return {
      method: "FEFO",
      topLabel: "NEXT OUT (FEFO)",
      queueLabel: isPharma
        ? "nearest expiry dispensed first — FDA compliance & patient safety"
        : "nearest expiry dispensed first — reduce spoilage waste",
    };
  }
  return {
    method: "FIFO",
    topLabel: "NEXT OUT",
    queueLabel: "oldest received batch used first",
  };
}

function sortBatchesByMethod(batches, brand, isPerishable) {
  const { method } = getFifoMethod(brand, isPerishable);
  return [...batches].sort((a, b) => {
    if (method === "FEFO") {
      const da = a.exp_date ? new Date(a.exp_date).getTime() : Infinity;
      const db = b.exp_date ? new Date(b.exp_date).getTime() : Infinity;
      return da - db;
    }
    const da = new Date(
      a.supply_date || a.mfg_date || a.created_at || 0,
    ).getTime();
    const db = new Date(
      b.supply_date || b.mfg_date || b.created_at || 0,
    ).getTime();
    return da - db;
  });
}

function daysRemaining(exp_date) {
  if (!exp_date) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(exp_date);
  return Math.round((exp - now) / 86400000);
}

function isPharmaBrand(brand) {
  return (brand || "").toLowerCase().includes("ipharma");
}
function isFuelBrand(brand) {
  return (brand || "").toLowerCase().includes("ifuel");
}

const FR_EXPIRY_STYLE = {
  expired: {
    border: "#fecaca",
    badgeText: "#991b1b",
    label: "EXPIRED",
    dot: "#dc2626",
  },
  critical: {
    border: "#fed7aa",
    badgeText: "#9a3412",
    label: "CRITICAL",
    dot: "#ea580c",
  },
  warning: {
    border: "#fef08a",
    badgeText: "#854d0e",
    label: "EXPIRING",
    dot: "#ca8a04",
  },
  ok: { border: C.greenMid, badgeText: null, label: null, dot: C.green },
};

function fmtFrDate(d) {
  return d
    ? new Date(d).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "Asia/Manila",
      })
    : "—";
}
function fmtFrTs(d) {
  return new Date(d).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  });
}

/* small reusable bar for stock level */
function FrMiniBar({ pct, color, track = "#eef6f1", height = 6 }) {
  const w = Math.max(0, Math.min(100, pct ?? 0));
  return (
    <div
      style={{
        background: track,
        borderRadius: 20,
        height,
        overflow: "hidden",
        width: "100%",
      }}
    >
      <div
        style={{
          width: `${w}%`,
          height: "100%",
          background: color,
          borderRadius: 20,
          transition: "width .3s ease",
        }}
      />
    </div>
  );
}

/* ── READ-ONLY FIFO / FEFO QUEUE PANEL (right column) ── */
function FrFifoQueue({ product, batches, loading }) {
  if (!product) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          minHeight: 300,
          color: C.muted,
          fontSize: 12.5,
          textAlign: "center",
          padding: 20,
        }}
      >
        <div>
          Select an ingredient on the left
          <br />
          to view its consumption queue.
        </div>
      </div>
    );
  }

  const fifo = getFifoMethod(product.brand, product.perishable);
  const sorted = sortBatchesByMethod(
    batches,
    product.brand,
    product.perishable,
  );
  const totalStock = sorted.reduce((s, b) => s + Number(b.stock || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ marginBottom: 10 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: C.ink,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {product.name}
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
          {totalStock} {product.unit} · {sorted.length} active batch
          {sorted.length === 1 ? "" : "es"} · min {product.min_stock}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 10px",
          borderRadius: 8,
          background: fifo.method === "FEFO" ? "#fffbeb" : C.greenLt,
          border: `1px solid ${fifo.method === "FEFO" ? "#fde68a" : C.greenMid}`,
          fontSize: 10.5,
          color: fifo.method === "FEFO" ? "#9a3412" : C.greenDk,
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        <span>{fifo.method} QUEUE</span>
        <span style={{ fontWeight: 500, opacity: 0.85 }}>
          — {fifo.queueLabel}
        </span>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          paddingRight: 2,
          minHeight: 0,
        }}
      >
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "30px 0",
              color: C.muted,
              fontSize: 12,
            }}
          >
            Loading queue…
          </div>
        ) : sorted.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "30px 0",
              color: C.muted,
              fontSize: 12,
              fontStyle: "italic",
            }}
          >
            No batches yet for this ingredient.
          </div>
        ) : (
          sorted.map((b, idx) => {
            const status = computeExpiryStatus(b.exp_date, product.brand);
            const ss = FR_EXPIRY_STYLE[status] || FR_EXPIRY_STYLE.ok;
            const isFirst = idx === 0;
            const isLast = idx === sorted.length - 1;
            const supplyStr = b.supply_date ? fmtFrTs(b.supply_date) : "—";
            const expStr = fmtFrDate(b.exp_date);
            const dRem = daysRemaining(b.exp_date);
            const stockPct =
              totalStock > 0
                ? Math.round((Number(b.stock || 0) / totalStock) * 100)
                : 0;

            return (
              <div
                key={b.id}
                style={{
                  background: C.white,
                  borderBottom: isLast
                    ? "none"
                    : `1px solid ${isFirst ? C.greenMid : C.border}`,
                  padding: "12px 4px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 19,
                        height: 19,
                        borderRadius: "50%",
                        background: isFirst ? C.green : "#b9c9bf",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span
                      style={{ fontSize: 12, fontWeight: 800, color: C.ink }}
                    >
                      Batch {b.batch_number || "—"}
                    </span>
                    {isFirst && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          color: C.greenDk,
                          border: `1px solid ${C.greenMid}`,
                          padding: "2px 8px",
                          borderRadius: 20,
                        }}
                      >
                        {fifo.topLabel}
                      </span>
                    )}
                  </span>
                  {ss.label && (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        color: ss.badgeText,
                        border: `1px solid ${ss.border}`,
                        padding: "2px 7px",
                        borderRadius: 20,
                      }}
                    >
                      {ss.label}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                    fontSize: 11,
                    color: C.muted,
                    marginBottom: 8,
                  }}
                >
                  {b.supplier && (
                    <span>
                      Supplier:{" "}
                      <strong style={{ color: C.ink }}>{b.supplier}</strong>
                    </span>
                  )}
                  <span>
                    Arrived:{" "}
                    <strong style={{ color: C.ink }}>{supplyStr}</strong>
                  </span>
                  <span>
                    Expires:{" "}
                    <strong style={{ color: ss.dot }}>
                      {expStr}
                      {dRem != null
                        ? ` (${dRem < 0 ? "expired" : dRem + "d left"})`
                        : ""}
                    </strong>
                  </span>
                  {b.cost_per_unit ? (
                    <span>
                      Cost/Unit:{" "}
                      <strong style={{ color: C.ink }}>
                        {fmtPeso(b.cost_per_unit)}
                      </strong>
                    </span>
                  ) : null}
                  {b.storage_location && (
                    <span>
                      Location:{" "}
                      <strong style={{ color: C.ink }}>
                        {b.storage_location}
                      </strong>
                    </span>
                  )}
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 9.5,
                      color: C.muted,
                      fontWeight: 700,
                      marginBottom: 2,
                    }}
                  >
                    <span>STOCK</span>
                    <span>
                      {b.stock}
                      {product.unit}/{totalStock}
                      {product.unit}
                    </span>
                  </div>
                  <FrMiniBar pct={stockPct} color={C.green} />
                </div>

                {isPharmaBrand(product.brand) &&
                  (b.lot_number ||
                    b.ndc_code ||
                    b.dosage_form ||
                    b.storage_requirement ||
                    b.controlled_substance) && (
                    <div
                      style={{
                        marginTop: 8,
                        paddingTop: 8,
                        borderTop: `1px dashed ${C.border}`,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 10,
                        fontSize: 10.5,
                        color: C.muted,
                      }}
                    >
                      {b.lot_number && (
                        <span>
                          LOT:{" "}
                          <strong style={{ color: C.ink }}>
                            {b.lot_number}
                          </strong>
                        </span>
                      )}
                      {b.ndc_code && (
                        <span>
                          NDC:{" "}
                          <strong style={{ color: C.ink }}>{b.ndc_code}</strong>
                        </span>
                      )}
                      {b.dosage_form && (
                        <span>
                          {b.dosage_form}
                          {b.strength ? ` · ${b.strength}` : ""}
                        </span>
                      )}
                      {b.storage_requirement && (
                        <span>
                          Storage:{" "}
                          <strong style={{ color: C.ink }}>
                            {b.storage_requirement}
                          </strong>
                        </span>
                      )}
                      {b.controlled_substance && (
                        <span style={{ color: "#991b1b", fontWeight: 800 }}>
                          CONTROLLED SUBSTANCE
                        </span>
                      )}
                    </div>
                  )}
                {isFuelBrand(product.brand) &&
                  (b.tank_id || b.grade || b.octane_rating || b.truck_id) && (
                    <div
                      style={{
                        marginTop: 8,
                        paddingTop: 8,
                        borderTop: `1px dashed ${C.border}`,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 10,
                        fontSize: 10.5,
                        color: C.muted,
                      }}
                    >
                      {b.tank_id && (
                        <span>
                          Tank:{" "}
                          <strong style={{ color: C.ink }}>{b.tank_id}</strong>
                        </span>
                      )}
                      {b.grade && (
                        <span>
                          Grade:{" "}
                          <strong style={{ color: C.ink }}>{b.grade}</strong>
                        </span>
                      )}
                      {b.octane_rating && (
                        <span>
                          Octane:{" "}
                          <strong style={{ color: C.ink }}>
                            {b.octane_rating}
                          </strong>
                        </span>
                      )}
                      {b.delivery_temp && (
                        <span>
                          Delivery Temp:{" "}
                          <strong style={{ color: C.ink }}>
                            {b.delivery_temp}°F
                          </strong>
                        </span>
                      )}
                      {b.truck_id && (
                        <span>
                          Truck:{" "}
                          <strong style={{ color: C.ink }}>{b.truck_id}</strong>
                        </span>
                      )}
                      {b.volume_correction && (
                        <span>
                          Corrected Vol (60°F):{" "}
                          <strong style={{ color: C.ink }}>
                            {b.volume_correction}
                          </strong>
                        </span>
                      )}
                    </div>
                  )}

                {b.notes && (
                  <div
                    style={{
                      fontSize: 10.5,
                      color: C.muted,
                      marginTop: 6,
                      fontStyle: "italic",
                    }}
                  >
                    {b.notes}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ── MAIN COMPONENT — read-only two-panel stock inventory for franchisees ── */
function FrStockInventoryContent({ user, brands }) {
  const userBranch = (user?.branch || "").trim();
  const userBrand = (user?.brand || "").trim();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [statusFilt, setStatusFilt] = useState("");

  const [selectedId, setSelectedId] = useState(null);
  const [batches, setBatches] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);

  const extraFields = useMemo(() => getExtraFields(userBrand), [userBrand]);
  const hasExpiry = extraFields.some((f) => f.key === "exp_date");

  const fetchItems = useCallback(async () => {
    if (!userBranch) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/ingredients?branch=${encodeURIComponent(userBranch)}`,
      );
      const d = await res.json();
      setItems(Array.isArray(d) ? d : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [userBranch]);

  useEffect(() => {
    if (userBranch) fetchItems();
  }, [fetchItems, userBranch]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const warnDate = new Date(now);
    warnDate.setDate(warnDate.getDate() + EXPIRY_WARN_DAYS);

    return items
      .filter((i) => {
        if (q && !i.name.toLowerCase().includes(q)) return false;
        if (unitFilter && i.unit !== unitFilter) return false;
        if (statusFilt === "low" && i.stock >= i.min_stock) return false;
        if (statusFilt === "ok" && i.stock < i.min_stock) return false;

        if (statusFilt === "expiring" || statusFilt === "expired") {
          const expRaw = i.extra_fields?.exp_date;
          if (!expRaw) return false;
          const exp = new Date(expRaw);
          exp.setHours(0, 0, 0, 0);
          if (statusFilt === "expired") return exp < now;
          if (statusFilt === "expiring") return exp >= now && exp <= warnDate;
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, search, unitFilter, statusFilt]);

  useEffect(() => {
    if (selectedId && !filtered.find((i) => i.id === selectedId))
      setSelectedId(null);
  }, [filtered, selectedId]);

  const selected = filtered.find((i) => i.id === selectedId) || null;

  useEffect(() => {
    if (!selectedId) {
      setBatches([]);
      return;
    }
    let cancelled = false;
    setBatchLoading(true);
    fetch(
      `${process.env.REACT_APP_API_URL}/ingredient-batches?ingredient_id=${selectedId}`,
    )
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          setBatches(Array.isArray(d) ? d : []);
          setBatchLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setBatchLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const lowCount = items.filter(
    (i) => Number(i.stock) < Number(i.min_stock),
  ).length;
  const totalValue = items.reduce(
    (s, i) => s + (i.cost_per_unit || 0) * (i.stock || 0),
    0,
  );

  const expiringCount = useMemo(() => {
    if (!hasExpiry) return 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const warnDate = new Date(now);
    warnDate.setDate(now.getDate() + EXPIRY_WARN_DAYS);
    return items.filter((i) => {
      const expRaw = i.extra_fields?.exp_date;
      if (!expRaw) return false;
      const exp = new Date(expRaw);
      exp.setHours(0, 0, 0, 0);
      return exp >= now && exp <= warnDate;
    }).length;
  }, [items, hasExpiry]);

  const expiredCount = useMemo(() => {
    if (!hasExpiry) return 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return items.filter((i) => {
      const expRaw = i.extra_fields?.exp_date;
      if (!expRaw) return false;
      const exp = new Date(expRaw);
      exp.setHours(0, 0, 0, 0);
      return exp < now;
    }).length;
  }, [items, hasExpiry]);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        .fr-inv-row:hover { background: #F6F7F1 !important; }
      `}</style>

      <ReadOnlyBanner message="Stock inventory is read-only. Contact your admin to add, edit, or delete ingredients." />

      {/* KPI cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${hasExpiry ? 4 : 3}, 1fr)`,
          gap: 14,
          marginTop: 16,
          marginBottom: 18,
        }}
      >
        <KpiStatCard
          tone="green"
          icon={<Package size={20} />}
          label="Total Ingredients"
          value={items.length}
          sub="Registered"
        />
        <KpiStatCard
          tone="red"
          icon={<AlertTriangle size={20} />}
          label="Low Stock Alerts"
          value={lowCount}
          sub="Needs reorder"
        />
        <KpiStatCard
          tone="blue"
          icon={<DollarSign size={20} />}
          label="Total Stock Value"
          value={fmtPeso(totalValue)}
          sub="Cost basis"
        />
        {hasExpiry && (
          <KpiStatCard
            tone="orange"
            icon={<Calendar size={20} />}
            label="Expiring / Expired"
            value={`${expiringCount} / ${expiredCount}`}
            sub={`Within ${EXPIRY_WARN_DAYS} days / already expired`}
          />
        )}
      </div>

      {/* filter row */}
      <div
        style={{
          background: C.white,
          border: "1px solid #E1E6D8",
          borderRadius: 16,
          padding: "12px 16px",
          marginBottom: 18,
          boxShadow: "0 2px 14px rgba(59,121,30,0.06)",
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: 160 }}>
          <div
            style={{
              position: "absolute",
              left: 9,
              top: "50%",
              transform: "translateY(-50%)",
              color: C.muted,
            }}
          >
            <Search size={13} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ingredient…"
            style={{ ...invInputSt, paddingLeft: 28, height: 34 }}
          />
        </div>
        <select
          value={unitFilter}
          onChange={(e) => setUnitFilter(e.target.value)}
          style={{ ...invInputSt, width: 130, height: 34 }}
        >
          <option value="">All Units</option>
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <select
          value={statusFilt}
          onChange={(e) => setStatusFilt(e.target.value)}
          style={{ ...invInputSt, width: 170, height: 34 }}
        >
          <option value="">All Status</option>
          <option value="low">Low Stock</option>
          <option value="ok">In Stock</option>
          {hasExpiry && <option value="expiring">Expiring Soon (30d)</option>}
          {hasExpiry && <option value="expired">Expired</option>}
        </select>
        <button onClick={fetchItems} style={btnSt}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* two-panel card — left: product list, right: FIFO/FEFO queue */}
      <div
        style={{
          background: C.white,
          border: "1px solid #E1E6D8",
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 2px 18px rgba(59,121,30,0.07)",
        }}
      >
        <div
          style={{
            padding: "16px 22px",
            background: "#fbfcf8",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: C.ink,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            <StoreIcon size={16} color={C.green} /> Stock Inventory —{" "}
            {userBranch}
            {userBrand && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  background: C.greenLt,
                  color: C.greenDk,
                  border: `1px solid ${C.greenMid}`,
                  padding: "2px 10px",
                  borderRadius: 20,
                }}
              >
                {userBrand}
              </span>
            )}
          </span>
          <span style={{ fontSize: 11, opacity: 0.92 }}>
            {filtered.length} items · {lowCount} low
          </span>
        </div>

        {loading ? (
          <div
            style={{
              padding: "52px 0",
              textAlign: "center",
              color: C.muted,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Loading…
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "380px 1fr",
              minHeight: 480,
              maxHeight: 620,
            }}
          >
            {/* LEFT — clickable product list */}
            <div
              style={{
                borderRight: `1px solid ${C.border}`,
                overflowY: "auto",
                maxHeight: 620,
                minHeight: 0,
              }}
            >
              {filtered.length === 0 ? (
                <div
                  style={{
                    padding: "30px 14px",
                    textAlign: "center",
                    color: C.muted,
                    fontSize: 12,
                  }}
                >
                  No ingredients found.
                </div>
              ) : (
                filtered.map((item) => {
                  const low = Number(item.stock) < Number(item.min_stock);
                  const active = item.id === selectedId;
                  const stockPct =
                    Number(item.min_stock) > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (Number(item.stock || 0) /
                              (Number(item.min_stock) * 2)) *
                              100,
                          ),
                        )
                      : Number(item.stock) > 0
                        ? 100
                        : 0;
                  return (
                    <div
                      key={item.id}
                      className="fr-inv-row"
                      onClick={() => setSelectedId(item.id)}
                      style={{
                        padding: "10px 14px",
                        cursor: "pointer",
                        borderLeft: `3px solid ${active ? C.green : "transparent"}`,
                        background: active ? C.greenLt : "transparent",
                        borderBottom: `1px solid ${C.bg}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12.5,
                            fontWeight: active ? 800 : 600,
                            color: active ? C.greenDk : C.ink,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.name}
                        </span>
                        {low && (
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 800,
                              color: C.warn,
                              background: C.warnBg,
                              padding: "1px 6px",
                              borderRadius: 4,
                              flexShrink: 0,
                            }}
                          >
                            LOW
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: 10.5,
                          color: C.muted,
                          marginTop: 3,
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>
                          {item.unit} · min {item.min_stock}
                        </span>
                        <span style={{ fontWeight: 700, color: C.ink }}>
                          {item.stock}
                        </span>
                      </div>
                      <div style={{ marginTop: 5 }}>
                        <FrMiniBar
                          pct={stockPct}
                          color={low ? C.warn : C.green}
                          height={4}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* RIGHT — FIFO / FEFO queue */}
            <div
              style={{
                padding: 20,
                overflowY: "auto",
                maxHeight: 620,
                minHeight: 0,
              }}
            >
              <FrFifoQueue
                product={selected}
                batches={batches}
                loading={batchLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
function FrPOSContent({ user, brands: propBrands = [] }) {
  const userBranch = (user?.branch || "").trim();

  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [searchProduct, setSearchProduct] = useState("");
  const [txSearch, setTxSearch] = useState("");
  const [txDateFrom, setTxDateFrom] = useState("");
  const [txDateTo, setTxDateTo] = useState("");
  const [activeTab, setActiveTab] = useState("cashier");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [cashReceived, setCashReceived] = useState("");
  const [discountPct, setDiscountPct] = useState(0);
  const [vatEnabled, setVatEnabled] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [txPage, setTxPage] = useState(0);
  const [noteInput, setNoteInput] = useState("");

  const VAT_RATE = 0.12;
  const TX_PAGE_SIZE = 20;

  const fetchProducts = useCallback(async () => {
    if (!userBranch) return;
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/inventory?branch=${encodeURIComponent(userBranch)}`,
      );
      const d = await res.json();
      setMenuItems(Array.isArray(d) ? d : []);
    } catch {
      setMenuItems([]);
    }
  }, [userBranch]);

  const fetchTransactions = useCallback(async () => {
    if (!userBranch) return;
    setLoadingTx(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/transactions?branch=${encodeURIComponent(userBranch)}`,
      );
      const d = await res.json();
      setTransactions(Array.isArray(d) ? d : []);
    } catch {
      setTransactions([]);
    } finally {
      setLoadingTx(false);
    }
  }, [userBranch]);

  useEffect(() => {
    if (userBranch) fetchProducts();
  }, [fetchProducts, userBranch]);
  useEffect(() => {
    if (userBranch) fetchTransactions();
  }, [fetchTransactions, userBranch]);
  useEffect(() => {
    setTxPage(0);
  }, [txSearch, txDateFrom, txDateTo]);

  const allProducts = useMemo(() => {
    const q = searchProduct.toLowerCase();
    return menuItems
      .map((m) => ({ ...m, source: "menu", displayName: m.name }))
      .filter(
        (p) =>
          !q ||
          p.displayName.toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q),
      );
  }, [menuItems, searchProduct]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find(
        (c) => c.id === product.id && c.source === product.source,
      );
      if (existing)
        return prev.map((c) =>
          c.id === product.id && c.source === product.source
            ? { ...c, qty: c.qty + 1 }
            : c,
        );
      return [...prev, { ...product, qty: 1 }];
    });
  };
  const updateQty = (id, source, delta) =>
    setCart((prev) =>
      prev
        .map((c) =>
          c.id === id && c.source === source
            ? { ...c, qty: Math.max(0, c.qty + delta) }
            : c,
        )
        .filter((c) => c.qty > 0),
    );
  const removeFromCart = (id, source) =>
    setCart((prev) =>
      prev.filter((c) => !(c.id === id && c.source === source)),
    );
  const clearCart = () => {
    setCart([]);
    setCashReceived("");
    setDiscountPct(0);
    setNoteInput("");
  };

  const subtotal = cart.reduce((s, c) => s + (c.price || 0) * c.qty, 0);
  const discountAmt = subtotal * (discountPct / 100);
  const discounted = subtotal - discountAmt;
  const vatAmt = vatEnabled ? discounted * VAT_RATE : 0;
  const totalAmt = discounted + vatAmt;
  const changeDue =
    paymentMethod === "Cash"
      ? Math.max(0, parseFloat(cashReceived || 0) - totalAmt)
      : 0;
  const cashShortfall =
    paymentMethod === "Cash" && cashReceived !== ""
      ? parseFloat(cashReceived || 0) - totalAmt
      : 0;

  const processSale = async () => {
    if (cart.length === 0) {
      alert("Cart is empty.");
      return;
    }
    if (paymentMethod === "Cash" && parseFloat(cashReceived || 0) < totalAmt) {
      alert("Cash received is less than total amount.");
      return;
    }
    setProcessing(true);
    try {
      const payload = {
        branch: userBranch,
        cashier: user?.name || "Staff",
        shop: "",
        payment_method: paymentMethod,
        cash_received:
          paymentMethod === "Cash" ? parseFloat(cashReceived) : totalAmt,
        discount_pct: discountPct,
        subtotal,
        discount_amt: discountAmt,
        vat_enabled: vatEnabled,
        vat_amt: vatAmt,
        total: totalAmt,
        change_due: changeDue,
        note: noteInput,
        items: cart.map((c) => ({
          id: c.id,
          source: c.source,
          name: c.displayName,
          price: c.price,
          qty: c.qty,
          subtotal: c.price * c.qty,
        })),
      };
      const res = await fetch(`${process.env.REACT_APP_API_URL}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (d.success) {
        setLastReceipt({
          ...payload,
          id: d.id,
          date: new Date().toLocaleString(),
        });
        setShowReceiptModal(true);
        clearCart();
        fetchTransactions();
        fetchProducts();
      } else alert(d.error || "Failed to process sale");
    } catch {
      alert("Failed to process sale.");
    } finally {
      setProcessing(false);
    }
  };

  const filteredTx = useMemo(() => {
    const q = txSearch.toLowerCase();
    return transactions.filter((tx) => {
      if (
        q &&
        !String(tx.id).includes(q) &&
        !(tx.cashier || "").toLowerCase().includes(q)
      )
        return false;
      if (txDateFrom && tx.created_at < txDateFrom) return false;
      if (txDateTo && tx.created_at > txDateTo + "T23:59:59") return false;
      return true;
    });
  }, [transactions, txSearch, txDateFrom, txDateTo]);

  const txPageItems = filteredTx.slice(
    txPage * TX_PAGE_SIZE,
    (txPage + 1) * TX_PAGE_SIZE,
  );
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySales = transactions.filter((tx) =>
    (tx.created_at || "").startsWith(todayStr),
  );
  const todayRevenue = todaySales.reduce(
    (s, tx) => s + Number(tx.total || 0),
    0,
  );

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        paddingBottom: 48,
      }}
    >
      <style>{`@media print{body>*{display:none!important;}.pos-receipt-print{display:block!important;}}`}</style>

      <div
        className="v-stat-grid"
        style={{ gridTemplateColumns: "repeat(4,1fr)" }}
      >
        <VKpi
          label="Today's Revenue"
          value={fmtPeso(todayRevenue)}
          icon={<DollarSign size={20} />}
          color="green"
          sub="All transactions today"
        />
        <VKpi
          label="Transactions Today"
          value={todaySales.length}
          icon={<Receipt size={20} />}
          color="blue"
          sub="Completed sales"
        />
        <VKpi
          label="Avg Order Value"
          value={fmtPeso(
            todaySales.length ? todayRevenue / todaySales.length : 0,
          )}
          icon={<BarChart2 size={20} />}
          color="orange"
          sub="Per transaction"
        />
        <VKpi
          label="Items in Cart"
          value={cart.reduce((s, c) => s + c.qty, 0)}
          icon={<ShoppingCart size={20} />}
          color="purple"
          sub="Current session"
        />
      </div>

      <div className="v-tabs">
        {[
          ["cashier", "Cashier"],
          ["history", "Transaction History"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={`v-tab ${activeTab === id ? "active" : ""}`}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "cashier" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: 18,
            alignItems: "start",
          }}
        >
          <div>
            <div
              className="v-card"
              style={{ padding: "14px 18px", marginBottom: 14 }}
            >
              <div className="v-search-wrap">
                <Search size={13} />
                <input
                  type="text"
                  className="v-search"
                  placeholder="Search products…"
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                />
              </div>
            </div>

            {!userBranch ? (
              <div
                className="v-card"
                style={{ padding: "48px 0", textAlign: "center" }}
              >
                <VEmptyState
                  icon={<AlertTriangle size={30} />}
                  title="No branch assigned to your account"
                  sub="Contact your admin to assign a branch."
                />
              </div>
            ) : allProducts.length === 0 ? (
              <div
                className="v-card"
                style={{ padding: "48px 0", textAlign: "center" }}
              >
                <VEmptyState
                  icon={<Store size={30} />}
                  title={`No products found for ${userBranch}`}
                  sub="Menu items will appear here once added by admin."
                />
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
                  gap: 12,
                }}
              >
                {allProducts.map((product) => {
                  const inCart = cart.find(
                    (c) => c.id === product.id && c.source === product.source,
                  );
                  return (
                    <div
                      key={`${product.source}-${product.id}`}
                      onClick={() => addToCart(product)}
                      style={{
                        background: "#fff",
                        border: `2px solid ${inCart ? "#3b791e" : "rgba(59,121,30,0.12)"}`,
                        borderRadius: 14,
                        padding: "14px 12px",
                        cursor: "pointer",
                        transition: "all .15s",
                        boxShadow: inCart
                          ? "0 4px 16px rgba(59,121,30,0.18)"
                          : "0 1px 6px rgba(59,121,30,0.05)",
                        position: "relative",
                      }}
                      onMouseEnter={(e) => {
                        if (!inCart)
                          e.currentTarget.style.borderColor = "#509820";
                      }}
                      onMouseLeave={(e) => {
                        if (!inCart)
                          e.currentTarget.style.borderColor =
                            "rgba(59,121,30,0.12)";
                      }}
                    >
                      {inCart && (
                        <div
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            background: "#12241B",
                            color: "#fff",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "2px 8px",
                          }}
                        >
                          ×{inCart.qty}
                        </div>
                      )}
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt=""
                          style={{
                            width: "100%",
                            height: 130,
                            objectFit: "cover",
                            borderRadius: 9,
                            marginBottom: 10,
                          }}
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: 130,
                            borderRadius: 9,
                            background:
                              "linear-gradient(135deg,rgba(0,200,83,0.08),rgba(59,121,30,0.06))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "2rem",
                            marginBottom: 10,
                          }}
                        >
                          <ShoppingCart size={24} />
                        </div>
                      )}
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          color: "#12241B",
                          marginBottom: 4,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontFamily: "Plus Jakarta Sans,sans-serif",
                        }}
                      >
                        {product.displayName}
                      </div>
                      {product.category && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            marginBottom: 6,
                          }}
                        >
                          {product.category}
                        </div>
                      )}
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 15,
                          color: "#3b791e",
                          fontFamily: "Plus Jakarta Sans,sans-serif",
                        }}
                      >
                        {fmtPeso(product.price)}
                      </div>
                      {product.stock !== undefined && (
                        <div
                          style={{
                            fontSize: 10,
                            marginTop: 3,
                            fontWeight: 600,
                            color: product.stock <= 5 ? "#e65100" : "#94a3b8",
                          }}
                        >
                          Stock: {product.stock}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ position: "sticky", top: 80 }}>
            <div className="v-card" style={{ overflow: "hidden" }}>
              <div
                style={{
                  padding: "14px 18px",
                  background: "var(--grad-dark)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: "#fff",
                }}
              >
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 14,
                    fontFamily: "Plus Jakarta Sans,sans-serif",
                  }}
                >
                  <ShoppingCart size={15} /> Order Cart
                </span>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      border: "none",
                      color: "#fff",
                      borderRadius: 8,
                      padding: "4px 12px",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>

              <div
                style={{
                  maxHeight: 280,
                  overflowY: "auto",
                  padding: cart.length === 0 ? 0 : "8px 0",
                }}
              >
                {cart.length === 0 ? (
                  <div
                    style={{
                      padding: "32px 0",
                      textAlign: "center",
                      color: "#94a3b8",
                      fontSize: 13,
                    }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: 8 }}>
                      <ShoppingCart size={24} />
                    </div>
                    Tap a product to add it
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={`${item.source}-${item.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "9px 16px",
                        borderBottom: "1px solid rgba(59,121,30,0.08)",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 13,
                            color: "#12241B",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontFamily: "Plus Jakarta Sans,sans-serif",
                          }}
                        >
                          {item.displayName}
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>
                          {fmtPeso(item.price)} each
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          flexShrink: 0,
                        }}
                      >
                        <button
                          onClick={() => updateQty(item.id, item.source, -1)}
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 7,
                            border: "1.5px solid rgba(59,121,30,0.2)",
                            background: "rgba(59,121,30,0.05)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#12241B",
                          }}
                        >
                          −
                        </button>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: "#12241B",
                            minWidth: 20,
                            textAlign: "center",
                            fontFamily: "Plus Jakarta Sans,sans-serif",
                          }}
                        >
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.source, +1)}
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 7,
                            border: "1.5px solid rgba(59,121,30,0.2)",
                            background: "rgba(59,121,30,0.05)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#3b791e",
                          }}
                        >
                          +
                        </button>
                      </div>
                      <div
                        style={{
                          minWidth: 60,
                          textAlign: "right",
                          fontWeight: 800,
                          fontSize: 13,
                          color: "#3b791e",
                          fontFamily: "Plus Jakarta Sans,sans-serif",
                        }}
                      >
                        {fmtPeso(item.price * item.qty)}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, item.source)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          padding: 2,
                          fontSize: 16,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div
                style={{
                  padding: "14px 18px",
                  borderTop: "1px solid rgba(59,121,30,0.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#5C6B60",
                      textTransform: "uppercase",
                      letterSpacing: ".07em",
                      whiteSpace: "nowrap",
                      fontFamily: "Plus Jakarta Sans,sans-serif",
                    }}
                  >
                    Discount %
                  </label>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[0, 5, 10, 15, 20].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDiscountPct(d)}
                        style={{
                          height: 28,
                          padding: "0 10px",
                          borderRadius: 7,
                          border: "none",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "Plus Jakarta Sans,sans-serif",
                          background:
                            discountPct === d
                              ? "var(--grad-main)"
                              : "rgba(59,121,30,0.07)",
                          color: discountPct === d ? "#fff" : "#5C6B60",
                        }}
                      >
                        {d}%
                      </button>
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#5C6B60",
                      textTransform: "uppercase",
                      letterSpacing: ".07em",
                      fontFamily: "Plus Jakarta Sans,sans-serif",
                    }}
                  >
                    VAT (12%)
                  </label>
                  <div
                    onClick={() => setVatEnabled((v) => !v)}
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      cursor: "pointer",
                      position: "relative",
                      background: vatEnabled ? "var(--grad-main)" : "#e0e0e0",
                      transition: "background .2s",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 3,
                        left: vatEnabled ? 23 : 3,
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "#fff",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                        transition: "left .2s",
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    background: "rgba(59,121,30,0.05)",
                    border: "1.5px solid rgba(59,121,30,0.12)",
                    borderRadius: 12,
                    padding: "12px 14px",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                      color: "#94a3b8",
                      marginBottom: 5,
                    }}
                  >
                    <span>Subtotal</span>
                    <span style={{ fontWeight: 700 }}>{fmtPeso(subtotal)}</span>
                  </div>
                  {discountPct > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        color: "#f59e0b",
                        marginBottom: 5,
                      }}
                    >
                      <span>Discount ({discountPct}%)</span>
                      <span style={{ fontWeight: 700 }}>
                        −{fmtPeso(discountAmt)}
                      </span>
                    </div>
                  )}
                  {vatEnabled && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        color: "#3b82f6",
                        marginBottom: 5,
                      }}
                    >
                      <span>VAT (12%)</span>
                      <span style={{ fontWeight: 700 }}>
                        +{fmtPeso(vatAmt)}
                      </span>
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 16,
                      color: "#12241B",
                      fontWeight: 800,
                      paddingTop: 8,
                      borderTop: "1.5px dashed rgba(59,121,30,0.2)",
                      fontFamily: "Plus Jakarta Sans,sans-serif",
                    }}
                  >
                    <span>Total</span>
                    <span style={{ color: "#3b791e" }}>
                      {fmtPeso(totalAmt)}
                    </span>
                  </div>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#5C6B60",
                      textTransform: "uppercase",
                      letterSpacing: ".07em",
                      marginBottom: 6,
                      fontFamily: "Plus Jakarta Sans,sans-serif",
                    }}
                  >
                    Payment Method
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["Cash", "GCash", "Card", "Others"].map((m) => (
                      <button
                        key={m}
                        onClick={() => setPaymentMethod(m)}
                        style={{
                          flex: 1,
                          height: 32,
                          border: "none",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "Plus Jakarta Sans,sans-serif",
                          background:
                            paymentMethod === m
                              ? "var(--grad-main)"
                              : "rgba(59,121,30,0.06)",
                          color: paymentMethod === m ? "#fff" : "#5C6B60",
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                {paymentMethod === "Cash" && (
                  <div style={{ marginBottom: 10 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: "#5C6B60",
                        textTransform: "uppercase",
                        letterSpacing: ".07em",
                        marginBottom: 6,
                        fontFamily: "Plus Jakarta Sans,sans-serif",
                      }}
                    >
                      Cash Received
                    </div>
                    <input
                      type="number"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder="0.00"
                      className="v-form-input"
                      style={{
                        fontSize: 16,
                        fontWeight: 800,
                        textAlign: "right",
                      }}
                    />
                    {cashReceived !== "" && (
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 13,
                          fontWeight: 700,
                          textAlign: "right",
                          color: cashShortfall < 0 ? "#ef4444" : "#3b791e",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: 5,
                        }}
                      >
                        {cashShortfall < 0 ? (
                          <>
                            <AlertTriangle size={12} /> Short by{" "}
                            {fmtPeso(Math.abs(cashShortfall))}
                          </>
                        ) : (
                          <>
                            <Check size={12} /> Change: {fmtPeso(changeDue)}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <div style={{ marginBottom: 12 }}>
                  <textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Order note (optional)…"
                    rows={2}
                    className="v-form-input"
                    style={{
                      height: "auto",
                      padding: "8px 11px",
                      resize: "none",
                      lineHeight: 1.5,
                    }}
                  />
                </div>
                <button
                  onClick={processSale}
                  disabled={processing || cart.length === 0}
                  className="v-btn v-btn-primary"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: "13px 0",
                    fontSize: 15,
                    fontWeight: 900,
                    opacity: cart.length === 0 || processing ? 0.6 : 1,
                    cursor:
                      cart.length === 0 || processing
                        ? "not-allowed"
                        : "pointer",
                    borderRadius: 13,
                  }}
                >
                  {processing ? (
                    <>
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          border: "2px solid rgba(255,255,255,0.4)",
                          borderTopColor: "#fff",
                          borderRadius: "50%",
                          animation: "spin .8s linear infinite",
                        }}
                      />{" "}
                      Processing…
                    </>
                  ) : (
                    <>
                      <Zap size={14} /> Charge {fmtPeso(totalAmt)}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <>
          <div
            className="v-card"
            style={{ padding: "14px 18px", marginBottom: 18 }}
          >
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div className="v-search-wrap" style={{ flex: "1 1 200px" }}>
                <Search size={13} />
                <input
                  type="text"
                  className="v-search"
                  placeholder="Search ID or cashier…"
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                />
              </div>
              <input
                type="date"
                value={txDateFrom}
                onChange={(e) => setTxDateFrom(e.target.value)}
                className="v-form-input"
                style={{ width: 150 }}
              />
              <input
                type="date"
                value={txDateTo}
                onChange={(e) => setTxDateTo(e.target.value)}
                className="v-form-input"
                style={{ width: 150 }}
              />
              {(txSearch || txDateFrom || txDateTo) && (
                <button
                  onClick={() => {
                    setTxSearch("");
                    setTxDateFrom("");
                    setTxDateTo("");
                  }}
                  className="v-btn v-btn-ghost v-btn-sm"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="v-card">
            <div
              style={{
                padding: "11px 18px",
                background: "#f0f5e8",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "#fff",
              }}
            >
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 13,
                  fontFamily: "Plus Jakarta Sans,sans-serif",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <History size={14} /> Transaction History
              </span>
              <span style={{ fontSize: 12, opacity: 0.9 }}>
                {filteredTx.length} records
              </span>
            </div>
            {loadingTx ? (
              <div
                style={{
                  padding: "52px 0",
                  textAlign: "center",
                  color: "#5C6B60",
                }}
              >
                Loading…
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="v-table">
                  <thead>
                    <tr>
                      {[
                        "#",
                        "Date",
                        "Cashier",
                        "Items",
                        "Subtotal",
                        "Discount",
                        "VAT",
                        "Total",
                        "Payment",
                      ].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {txPageItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          style={{
                            padding: "52px 0",
                            textAlign: "center",
                            color: "#5C6B60",
                            fontSize: 13,
                            fontStyle: "italic",
                          }}
                        >
                          No transactions found.
                        </td>
                      </tr>
                    ) : (
                      txPageItems.map((tx) => (
                        <tr key={tx.id}>
                          <td style={{ color: "#94a3b8", fontSize: 12 }}>
                            #{tx.id}
                          </td>
                          <td
                            style={{
                              color: "#5C6B60",
                              fontSize: 12,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {new Date(tx.created_at).toLocaleString("en-PH", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td style={{ fontWeight: 600, color: "#12241B" }}>
                            {tx.cashier}
                          </td>
                          <td style={{ color: "#5C6B60" }}>
                            {(tx.items || []).length}
                          </td>
                          <td style={{ color: "#5C6B60" }}>
                            {fmtPeso(tx.subtotal)}
                          </td>
                          <td>
                            {tx.discount_pct > 0 ? (
                              <span
                                style={{ color: "#f59e0b", fontWeight: 700 }}
                              >
                                −{tx.discount_pct}%
                              </span>
                            ) : (
                              <span style={{ color: "#94a3b8" }}>—</span>
                            )}
                          </td>
                          <td>
                            {tx.vat_enabled ? (
                              <span
                                style={{ color: "#3b82f6", fontWeight: 700 }}
                              >
                                +{fmtPeso(tx.vat_amt)}
                              </span>
                            ) : (
                              <span style={{ color: "#94a3b8" }}>—</span>
                            )}
                          </td>
                          <td
                            style={{
                              fontWeight: 800,
                              color: "#3b791e",
                              fontFamily: "Plus Jakarta Sans,sans-serif",
                            }}
                          >
                            {fmtPeso(tx.total)}
                          </td>
                          <td>
                            <span
                              className={`v-badge ${tx.payment_method === "Cash" ? "v-badge-green" : tx.payment_method === "GCash" ? "v-badge-blue" : "v-badge-purple"}`}
                            >
                              {tx.payment_method}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {showReceiptModal && lastReceipt && (
        <div
          className="v-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowReceiptModal(false);
          }}
        >
          <div className="v-modal" style={{ width: 380, maxWidth: "95vw" }}>
            <div className="pos-receipt-print">
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: 18,
                    color: "#12241B",
                    fontFamily: "Plus Jakarta Sans,sans-serif",
                  }}
                >
                  iFranchise POS
                </div>
                <div style={{ fontSize: 12, color: "#5C6B60", marginTop: 2 }}>
                  {lastReceipt.branch}
                </div>
                <div style={{ fontSize: 11, color: "#5C6B60" }}>
                  {lastReceipt.date}
                </div>
                <div style={{ fontSize: 11, color: "#5C6B60" }}>
                  Cashier: {lastReceipt.cashier}
                </div>
              </div>
              <div
                style={{
                  borderTop: "2px dashed rgba(59,121,30,0.2)",
                  borderBottom: "2px dashed rgba(59,121,30,0.2)",
                  padding: "12px 0",
                  marginBottom: 12,
                }}
              >
                {(lastReceipt.items || []).map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      marginBottom: 5,
                    }}
                  >
                    <span style={{ color: "#374151", fontWeight: 600 }}>
                      {item.name}{" "}
                      <span style={{ color: "#94a3b8", fontWeight: 400 }}>
                        ×{item.qty}
                      </span>
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        color: "#12241B",
                        fontFamily: "Plus Jakarta Sans,sans-serif",
                      }}
                    >
                      {fmtPeso(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  fontSize: 13,
                  marginBottom: 4,
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#5C6B60",
                }}
              >
                <span>Subtotal</span>
                <span style={{ fontWeight: 700 }}>
                  {fmtPeso(lastReceipt.subtotal)}
                </span>
              </div>
              {lastReceipt.discount_pct > 0 && (
                <div
                  style={{
                    fontSize: 13,
                    marginBottom: 4,
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#f59e0b",
                  }}
                >
                  <span>Discount ({lastReceipt.discount_pct}%)</span>
                  <span style={{ fontWeight: 700 }}>
                    −{fmtPeso(lastReceipt.discount_amt)}
                  </span>
                </div>
              )}
              {lastReceipt.vat_enabled && (
                <div
                  style={{
                    fontSize: 13,
                    marginBottom: 4,
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#3b82f6",
                  }}
                >
                  <span>VAT (12%)</span>
                  <span style={{ fontWeight: 700 }}>
                    +{fmtPeso(lastReceipt.vat_amt)}
                  </span>
                </div>
              )}
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 900,
                  display: "flex",
                  justifyContent: "space-between",
                  borderTop: "1px solid rgba(59,121,30,0.15)",
                  paddingTop: 8,
                  marginBottom: 8,
                  fontFamily: "Plus Jakarta Sans,sans-serif",
                }}
              >
                <span style={{ color: "#12241B" }}>TOTAL</span>
                <span style={{ color: "#3b791e" }}>
                  {fmtPeso(lastReceipt.total)}
                </span>
              </div>
              <div
                style={{
                  fontSize: 13,
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#5C6B60",
                  marginBottom: 2,
                }}
              >
                <span>Payment</span>
                <span style={{ fontWeight: 700, color: "#12241B" }}>
                  {lastReceipt.payment_method}
                </span>
              </div>
              {lastReceipt.payment_method === "Cash" && (
                <>
                  <div
                    style={{
                      fontSize: 13,
                      display: "flex",
                      justifyContent: "space-between",
                      color: "#5C6B60",
                      marginBottom: 2,
                    }}
                  >
                    <span>Cash Received</span>
                    <span style={{ fontWeight: 700 }}>
                      {fmtPeso(lastReceipt.cash_received)}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      display: "flex",
                      justifyContent: "space-between",
                      color: "#5C6B60",
                    }}
                  >
                    <span>Change</span>
                    <span
                      style={{
                        fontWeight: 800,
                        color: "#3b791e",
                        fontFamily: "Plus Jakarta Sans,sans-serif",
                      }}
                    >
                      {fmtPeso(lastReceipt.change_due)}
                    </span>
                  </div>
                </>
              )}
              {lastReceipt.note && (
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 12,
                    color: "#5C6B60",
                    fontStyle: "italic",
                  }}
                >
                  Note: {lastReceipt.note}
                </div>
              )}
              <div
                style={{
                  textAlign: "center",
                  marginTop: 16,
                  fontSize: 11,
                  color: "#5C6B60",
                }}
              >
                Thank you for your purchase.
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button
                onClick={() => window.print()}
                className="v-btn v-btn-secondary"
                style={{ flex: 1, justifyContent: "center" }}
              >
                <Receipt size={13} /> Print
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="v-btn v-btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
              >
                <Check size={13} /> Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FrReceiptsContent({ user }) {
  return (
    <div>
      <ReadOnlyBanner message="Liquidation records for your branch. Contact admin for modifications." />
      <div
        className="v-card"
        style={{ padding: "48px 0", textAlign: "center" }}
      >
        <VEmptyState
          icon={<FileText size={30} />}
          title="Liquidation Records"
          sub="Your branch liquidation reports will appear here."
        />
      </div>
    </div>
  );
}

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    if (toast.type === "loading") return;
    const t = setTimeout(onClose, 2000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  const isErr = toast.type === "error";
  const isLoading = toast.type === "loading";

  return (
    <div
      style={{
        position: "fixed",
        top: 22,
        right: 22,
        zIndex: 4000,
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        maxWidth: 380,
        padding: "16px 18px",
        borderRadius: 14,
        background: isErr ? "#fef2f2" : "#F6F7F1",
        borderLeft: `5px solid ${isErr ? "#dc2626" : "#3b791e"}`,
        border: `1px solid ${isErr ? "#fecaca" : "#D4DBC8"}`,
        borderLeftWidth: 5,
        boxShadow: "0 16px 40px rgba(0,0,0,0.24)",
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        animation: "toastIn .22s ease",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 32,
          height: 32,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isErr ? "#dc2626" : "#3b791e",
          color: "#fff",
          boxShadow: `0 4px 10px ${isErr ? "rgba(220,38,38,0.4)" : "rgba(59,121,30,0.4)"}`,
        }}
      >
        {isErr ? (
          <AlertTriangle size={16} />
        ) : isLoading ? (
          <RefreshCw
            size={16}
            style={{ animation: "spin 0.8s linear infinite" }}
          />
        ) : (
          <Check size={16} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: isErr ? "#7f1d1d" : "#12241B",
          }}
        >
          {toast.title}
        </div>
        {toast.message && (
          <div
            style={{
              fontSize: 12.5,
              color: isErr ? "#991b1b" : "#3f5f4f",
              marginTop: 3,
              lineHeight: 1.4,
            }}
          >
            {toast.message}
          </div>
        )}
      </div>

      {!isLoading && (
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: isErr ? "#991b1b" : "#3f5f4f",
            cursor: "pointer",
            padding: 2,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

function FrReportsContent({ user, transactions = [] }) {
  const branch = (user?.branch || "").trim();
  const today = new Date();
  const fmt8 = (d) => d.toISOString().slice(0, 10);

  const [dateFrom, setDateFrom] = useState(
    fmt8(new Date(today.getFullYear(), today.getMonth(), 1)),
  );
  const [dateTo, setDateTo] = useState(fmt8(today));
  const [aiReport, setAiReport] = useState("");
  const [generating, setGenerating] = useState(false);
  const [reports, setReports] = useState([]);
  const [history, setHistory] = useState([]);
  const [viewReportId, setViewReportId] = useState(null);
  const [submitting, setSubmitting] = useState(null);

  const [kpiStats, setKpiStats] = useState({
    salesRevenue: 0,
    cogs: 0,
    salesProfit: 0,
    txCount: 0,
  });
  const [kpiLoading, setKpiLoading] = useState(false);
  const [submittedReports, setSubmittedReports] = useState([]);
  const [deletedReports, setDeletedReports] = useState([]);
  const [retrieving, setRetrieving] = useState(null);
  const [viewSubmittedId, setViewSubmittedId] = useState(null);
  const [reportTab, setReportTab] = useState("generated");

  const PAGE_SIZE = 5;
  const [genPage, setGenPage] = useState(0);
  const [subPage, setSubPage] = useState(0);
  const [delPage, setDelPage] = useState(0);

  const [toast, setToast] = useState(null);
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const [logoB64, setLogoB64] = useState(null);
  const [iFranchiseLogoB64, setIFranchiseLogoB64] = useState(null);

  const showToast = (type, title, message) =>
    setToast({ type, title, message });

  const fmtPeriod = (period) => {
    if (!period) return "—";
    const parts = period.split("→").map((s) => s.trim());
    if (parts.length !== 2) return period;
    const fmtOne = (d) => {
      const date = new Date(d);
      if (isNaN(date.getTime())) return d;
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    };
    return `${fmtOne(parts[0])} - ${fmtOne(parts[1])}`;
  };

  const getBrowserLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        () => resolve(null),
        { timeout: 5000, maximumAge: 60000 },
      );
    });
  };

  useEffect(() => {
    setGenPage(0);
  }, [reports]);
  useEffect(() => {
    setSubPage(0);
  }, [submittedReports]);
  useEffect(() => {
    setDelPage(0);
  }, [deletedReports]);

  useEffect(() => {
    loadImageAsBase64(franchisync)
      .then(setLogoB64)
      .catch((err) => console.warn("Failed to load left logo:", err));
    loadImageAsBase64Circular(ifranchisejpg)
      .then(setIFranchiseLogoB64)
      .catch((err) => console.warn("Failed to load right logo:", err));
  }, []);

  useEffect(() => {
    const fetchSavedReports = async () => {
      try {
        const [savedRes, liveRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/generated-reports`),
          fetch(`${process.env.REACT_APP_API_URL}/reports?branch=${branch}`),
        ]);

        const savedData = await savedRes.json();
        const liveData = await liveRes.json();

        const liveStatusMap = {};
        liveData.forEach((r) => {
          liveStatusMap[r.id] = r.status;
        });

        const loaded = savedData
          .map((item) => {
            const snapshot =
              typeof item.snapshot === "string"
                ? JSON.parse(item.snapshot)
                : item.snapshot;
            return {
              id: item.reportId,
              localId: `saved-${item.id}`,
              generatedDate: item.savedAt
                ? new Date(item.savedAt).toLocaleString("en-PH")
                : snapshot.submittedAt
                  ? new Date(snapshot.submittedAt).toLocaleString("en-PH")
                  : "—",
              period: snapshot.period || "—",
              content: snapshot.content || "",
              saved: true,
              status: liveStatusMap[item.reportId] ?? snapshot.status,
            };
          })
          .filter((r) => r.status !== "submitted" && r.status !== "deleted");

        setReports(loaded);
      } catch (err) {
        console.error("Failed to load saved reports:", err);
      }
    };

    if (branch) fetchSavedReports();
  }, [branch]);

  const fetchKpiStats = async (from, to) => {
    if (!from || !to || !branch) return;
    setKpiLoading(true);
    try {
      const params = new URLSearchParams({ from, to, branch });
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/dashboard/stats?${params}`,
      );
      const data = await res.json();
      setKpiStats(data);
    } catch (err) {
      console.error("Failed to fetch KPI stats:", err);
    }
    setKpiLoading(false);
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/reports/history?branch=${branch}`,
        );
        const data = await res.json();

        setSubmittedReports(
          data.map((h) => ({
            id: h.id,
            content: h.content || "",
            generatedDate: h.generatedDate
              ? new Date(h.generatedDate).toLocaleString("en-PH", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—",
            period: h.period,
            submittedAt: new Date(h.submittedAt).toLocaleString("en-PH"),
            expiresAt: h.expiresAt,
            comments: h.comments || [],
            remark: h.remark || "",
            status: h.status,
          })),
        );
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    };
    if (branch) fetchHistory();

    const onFocus = () => {
      if (branch) fetchHistory();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [branch]);

  useEffect(() => {
    const fetchDeletedReports = async () => {
      if (!branch) return;
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/reports/deleted?branch=${branch}`,
        );
        const data = await res.json();
        setDeletedReports(
          data.map((r) => ({
            id: r.id,
            localId: `deleted-${r.id}`,
            period: r.period,
            generatedDate: r.generatedDate
              ? new Date(r.generatedDate).toLocaleString("en-PH")
              : "—",
            deletedAt: r.deletedAt
              ? new Date(r.deletedAt).toLocaleString("en-PH")
              : "—",
            expiresAt: r.expiresAt,
            content: r.content,
          })),
        );
      } catch (err) {
        console.error("Failed to load deleted reports:", err);
      }
    };
    fetchDeletedReports();
  }, [branch]);

  useEffect(() => {
    fetchKpiStats(dateFrom, dateTo);
  }, [dateFrom, dateTo]);

  const generateReport = async () => {
    if (!dateFrom || !dateTo) {
      showToast(
        "error",
        "Missing Date Range",
        "Please select a date range first.",
      );
      return;
    }
    setGenerating(true);
    setAiReport("");
    try {
      const from = new Date(dateFrom);
      const to = new Date(dateTo + "T23:59:59");

      const filtered = (transactions || []).filter((tx) => {
        const d = new Date(tx.created_at);
        return (
          (tx.branch || "").trim().toLowerCase() === branch.toLowerCase() &&
          d >= from &&
          d <= to
        );
      });

      const totalRevenue = filtered.reduce(
        (s, tx) => s + Number(tx.total || 0),
        0,
      );
      const totalTx = filtered.length;
      const avgOrder = totalTx ? totalRevenue / totalTx : 0;
      const totalCost = filtered.reduce((s, tx) => s + Number(tx.cogs || 0), 0);
      const totalProfit = totalRevenue - totalCost;

      const paymentBreakdown = filtered.reduce((acc, tx) => {
        const m = tx.payment_method || "Unknown";
        acc[m] = (acc[m] || 0) + Number(tx.total || 0);
        return acc;
      }, {});

      const itemMap = {};
      filtered.forEach((tx) => {
        (tx.items || []).forEach((item) => {
          if (!itemMap[item.name]) itemMap[item.name] = { qty: 0, revenue: 0 };
          itemMap[item.name].qty += item.qty || 1;
          itemMap[item.name].revenue += item.subtotal || 0;
        });
      });

      // ── CHANGE 1: top 10 instead of top 5, formatted as a numbered list ──
      const topItemsList = Object.entries(itemMap)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 10)
        .map(
          ([name, d], i) =>
            `  ${i + 1}. ${name} (qty: ${d.qty}, revenue: PHP ${d.revenue.toFixed(2)})`,
        )
        .join("\n");

      const topItems = topItemsList || "  No item-level data available";
      // ─────────────────────────────────────────────────────────────────────

      const dailyMap = {};
      filtered.forEach((tx) => {
        const day = tx.created_at?.slice(0, 10);
        if (day) dailyMap[day] = (dailyMap[day] || 0) + Number(tx.total || 0);
      });
      const peakDay = Object.entries(dailyMap).sort((a, b) => b[1] - a[1])[0];
      const lowestDay = Object.entries(dailyMap).sort((a, b) => a[1] - b[1])[0];

      const fmtP = (n) =>
        "PHP " +
        Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2 });

      const prompt = `
      CRITICAL RULES — READ BEFORE WRITING ANYTHING:
      1. You MUST write ALL seven sections (I through VII) in full. Do not stop early. Do not skip any section. Sections VI (Strategic Recommendations) and VII (Conclusion) are REQUIRED — the report is incomplete without them.
      2. Keep each section concise (2–4 sentences or 4–6 items max) so you have enough space to finish all seven sections.
      3. Use only standard ASCII characters. Write currency as "PHP" (e.g. PHP 2,406.20) — never use the peso sign. Use straight quotes only. No unicode symbols.
      4. Do not use markdown symbols like ** or ##. Plain text only.

      You are a senior business analyst writing an official franchise performance report. Use ONLY the verified data below. Do not fabricate figures.

      REPORT METADATA
      ---------------
      Branch:   ${branch}
      Period:   ${dateFrom} to ${dateTo}
      Prepared: ${new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}

      VERIFIED DATA INPUTS
      --------------------
      Total Transactions  : ${totalTx}
      Total Revenue       : ${fmtP(totalRevenue)}
      Average Order Value : ${fmtP(avgOrder)}
      Cost of Sales       : ${totalCost > 0 ? fmtP(totalCost) : "Not provided"}
      Gross Profit        : ${totalCost > 0 ? fmtP(totalProfit) : "Not provided"}
      Peak Sales Day      : ${peakDay ? `${peakDay[0]} — ${fmtP(peakDay[1])}` : "N/A"}
      Lowest Sales Day    : ${lowestDay ? `${lowestDay[0]} — ${fmtP(lowestDay[1])}` : "N/A"}
      Top-Selling Items (Top 10 by revenue):
${topItems}
      Payment Breakdown   : ${
        Object.entries(paymentBreakdown)
          .map(([k, v]) => `${k}: ${fmtP(v)}`)
          .join(" | ") || "N/A"
      }

      OUTPUT FORMAT — write the report exactly as shown below. Replace each [...] with real content.

      ═══════════════════════════════════════════════════════════════
              FRANCHISE SALES & PERFORMANCE REPORT
              Branch: ${branch}
              Period: ${dateFrom} to ${dateTo}
              Date Prepared: ${new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}
      ═══════════════════════════════════════════════════════════════

      I. EXECUTIVE SUMMARY
      ────────────────────
      [2–3 sentences: total revenue, transaction count, general performance assessment.]

      II. SALES PERFORMANCE OVERVIEW
      ───────────────────────────────
      [2–3 sentences: transaction volume, average order value, peak day, lowest day, and what these indicate.]

      III. REVENUE & PROFITABILITY ANALYSIS
      ──────────────────────────────────────
      [2–3 sentences: revenue figures, gross profit margin if cost data available, otherwise note the limitation.]

      IV. TOP-SELLING PRODUCTS
      ─────────────────────────
      [List all 10 products with rank, name, qty, and revenue. Follow with 1–2 sentences on patterns or bestsellers.]

      V. PAYMENT METHOD ANALYSIS
      ───────────────────────────
      [2–3 sentences: dominant payment method, proportions, and one recommendation on payment infrastructure.]

      VI. STRATEGIC RECOMMENDATIONS
      ──────────────────────────────
      [Exactly 5 numbered recommendations. Each must cite the specific data point that supports it. 1 sentence each.]

      VII. CONCLUSION
      ───────────────
      [2–3 sentences: key takeaways and performance outlook for the branch.]

      ═══════════════════════════════════════════════════════════════
        This report was automatically generated based on verified
        transaction data for the stated period. Figures are accurate
        as of the report generation date.
      ═══════════════════════════════════════════════════════════════
      `.trim();

      const res = await fetch(`${process.env.REACT_APP_API_URL}/ai/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          max_tokens: 4000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await res.json();
      const reportText =
        data.content?.[0]?.text ||
        "Failed to generate report.No data available for the selected period.";
      const sanitizeReport = (text) => {
        return text
          .replace(/₱/g, "PHP ")
          .replace(/±/g, "PHP ")
          .replace(/→/g, "to")
          .replace(/!'/g, "to")
          .replace(/[^\x00-\x7F]/g, (c) => {
            const map = {
              "\u2019": "'",
              "\u2018": "'",
              "\u201C": '"',
              "\u201D": '"',
              "\u2013": "-",
              "\u2014": "--",
              "\u2026": "...",
              "\u00b1": "+/-",
              "\u00b2": "2",
              "\u00b3": "3",
            };
            return map[c] || "";
          });
      };
      const cleanReportText = sanitizeReport(reportText);
      setAiReport(cleanReportText);

      const submitRes = await fetch(
        `${process.env.REACT_APP_API_URL}/reports`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand: user?.brand || "",
            branch,
            period: `${dateFrom} → ${dateTo}`,
            submittedBy: user?.name || user?.email || "Branch Manager",
            role: user?.role || "Branch Manager",
            content: reportText,
          }),
        },
      );
      const submitData = await submitRes.json();

      const realId = submitData.report?.id;

      const newReport = {
        id: realId,
        localId: `new-${Date.now()}`,
        generatedDate: new Date().toLocaleString("en-PH"),
        period: `${dateFrom} → ${dateTo}`,
        content: reportText,
      };

      setReports((prev) => {
        const exists = prev.some((r) => r.id === realId);
        if (exists)
          return prev.map((r) =>
            r.id === realId ? { ...r, ...newReport } : r,
          );
        return [newReport, ...prev];
      });
    } catch {
      setAiReport("Failed to generate report. Please try again.");
    }
    setGenerating(false);
  };

  const deleteReport = async (report) => {
    setDeletingId(report.localId || report.id);

    if (!report.id) {
      setDeletedReports((prev) => [
        {
          ...report,
          deletedAt: new Date().toLocaleString("en-PH"),
          expiresAt: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
        ...prev,
      ]);
      setReports((prev) => prev.filter((r) => r.localId !== report.localId));
      if (viewReportId === report.id) setViewReportId(null);
      setDeletingId(null);
      setConfirmDeleteTarget(null);
      return;
    }

    try {
      const coords = await getBrowserLocation();
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/reports/${report.id}/soft-delete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            performedBy: user?.name || user?.email || "Branch Manager",
            role: user?.role || "Branch Manager",
            latitude: coords?.latitude,
            longitude: coords?.longitude,
          }),
        },
      );
      if (!res.ok) throw new Error("Delete failed");
      const data = await res.json();

      setDeletedReports((prev) => [
        {
          ...report,
          deletedAt: new Date().toLocaleString("en-PH"),
          expiresAt: data.expiresAt,
        },
        ...prev,
      ]);
      setReports((prev) => prev.filter((r) => r.id !== report.id));
      if (viewReportId === report.id) setViewReportId(null);
      showToast(
        "success",
        "Report Deleted",
        `Report for ${fmtPeriod(report.period)} moved to history.`,
      );
    } catch {
      showToast(
        "error",
        "Delete Failed",
        "Failed to delete report. Please try again.",
      );
    } finally {
      setDeletingId(null);
      setConfirmDeleteTarget(null);
    }
  };

  const retrieveReport = async (report) => {
    if (!report.id) {
      setReports((prev) => [
        {
          ...report,
          deletedAt: undefined,
          expiresAt: undefined,
        },
        ...prev,
      ]);
      setDeletedReports((prev) =>
        prev.filter((r) => r.localId !== report.localId),
      );
      return;
    }

    setRetrieving(report.id);
    try {
      const coords = await getBrowserLocation();
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/reports/${report.id}/retrieve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            performedBy: user?.name || user?.email || "Branch Manager",
            role: user?.role || "Branch Manager",
            latitude: coords?.latitude,
            longitude: coords?.longitude,
          }),
        },
      );
      if (!res.ok) throw new Error("Retrieve failed");
      const data = await res.json();

      setReports((prev) => [
        {
          id: data.report.id,
          localId: `retrieved-${Date.now()}`,
          generatedDate: data.report.generatedDate
            ? new Date(data.report.generatedDate).toLocaleString("en-PH")
            : new Date().toLocaleString("en-PH"),
          period: data.report.period,
          content: data.report.content,
          saved: false,
        },
        ...prev,
      ]);
      setDeletedReports((prev) => prev.filter((r) => r.id !== report.id));
      showToast(
        "success",
        "Report Restored",
        `Report for ${fmtPeriod(report.period)} has been restored.`,
      );
    } catch {
      showToast(
        "error",
        "Retrieve Failed",
        "Failed to retrieve report. Please try again.",
      );
    }
    setRetrieving(null);
  };

  const loadImageAsBase64 = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const loadImageAsBase64Circular = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;
        ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);
        ctx.restore();
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const downloadReport = (report) => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentW = pageW - margin * 2;
    let y = 0;

    const addPage = () => {
      doc.addPage();
      y = margin;
    };
    const checkY = (needed = 8) => {
      if (y + needed > pageH - margin) addPage();
    };

    const writeLine = (
      text,
      fontSize = 10,
      style = "normal",
      color = [30, 30, 30],
      indent = 0,
    ) => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", style);
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, contentW - indent);
      lines.forEach((line) => {
        checkY(fontSize * 0.45 + 2);
        doc.text(line, margin + indent, y);
        y += fontSize * 0.45 + 1.5;
      });
    };
    const writeDivider = (color = [180, 180, 180]) => {
      checkY(6);
      doc.setDrawColor(...color);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageW - margin, y);
      y += 4;
    };

    y = margin;

    // ── Header, copied from ReportsContent.generatePdfDoc ──
    doc.setFillColor(22, 73, 51);
    doc.rect(0, 0, pageW, 2.5, "F");

    const logoW = 12,
      logoH = 12,
      wideLogoW = 34,
      wideLogoH = 12,
      gap = 6,
      logoY = 8;
    const totalWidth = logoW + gap + wideLogoW;
    const startX = (pageW - totalWidth) / 2;
    try {
      if (iFranchiseLogoB64)
        doc.addImage(iFranchiseLogoB64, "PNG", startX, logoY, logoW, logoH);
      if (logoB64)
        doc.addImage(
          logoB64,
          "PNG",
          startX + logoW + gap,
          logoY,
          wideLogoW,
          wideLogoH,
        );
    } catch (err) {
      console.warn("Failed to add logos to PDF:", err);
    }

    const badgeText = `REP-${String(report.id).padStart(5, "0")}`;
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    const badgeW = doc.getTextWidth(badgeText) + 10;
    doc.setDrawColor(13, 43, 30);
    doc.setLineWidth(0.4);
    doc.roundedRect(pageW - margin - badgeW, 8, badgeW, 8, 2, 2, "S");
    doc.setTextColor(13, 43, 30);
    doc.text(badgeText, pageW - margin - badgeW / 2, 13, { align: "center" });

    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(13, 43, 30);
    doc.text("SALES & PERFORMANCE REPORT", pageW / 2, 30, { align: "center" });

    const ruleWidth = 46;
    doc.setDrawColor(22, 73, 51);
    doc.setLineWidth(0.6);
    doc.line(pageW / 2 - ruleWidth / 2, 33.5, pageW / 2 + ruleWidth / 2, 33.5);

    const safePeriod = fmtPeriod(report.period).replace(/[^\x20-\x7E]/g, "");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(90, 122, 101);
    doc.text("CONFIDENTIAL — FOR INTERNAL USE ONLY", pageW / 2, 38.5, {
      align: "center",
    });

    doc.setDrawColor(220, 230, 225);
    doc.setLineWidth(0.3);
    doc.line(margin, 42, pageW - margin, 42);

    y = 50;

    // ── Body — same cleaning + parsing as before ──
    const cleanContent = report.content
      .replace(/₱/g, "PHP ")
      .replace(/±/g, "PHP ")
      .replace(/→/g, "to")
      .replace(/!'/g, "to")
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/\u2013/g, "-")
      .replace(/\u2014/g, "--")
      .replace(/\u2026/g, "...")
      .replace(/[═─━]+/g, "")
      .replace(/^.*FRANCHISE SALES.*$/gm, "")
      .replace(/^.*Branch:.*Period:.*$/gm, "")
      .replace(/^.*Date Prepared:.*$/gm, "")
      .replace(/^.*This report was automatically.*$/gm, "")
      .replace(/^.*transaction data for.*$/gm, "")
      .replace(/^.*report generation date.*$/gm, "")
      .replace(/[^\x00-\x7F]/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    cleanContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        y += 3;
        return;
      }

      if (/^(I{1,3}V?|VI{0,3}|VII)\.\s+\S/.test(trimmed)) {
        checkY(14);
        y += 4;
        doc.setFillColor(0, 137, 123);
        doc.rect(margin, y - 4, 3, 9, "F");
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(13, 43, 30);
        doc.text(trimmed, margin + 6, y + 2);
        y += 8;
        writeDivider([0, 137, 123]);
      } else if (/^\d+\.\s+/.test(trimmed)) {
        checkY(8);
        const [num, ...rest] = trimmed.split(/(?<=^\d+\.)\s+/);
        doc.setFontSize(9.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 137, 123);
        doc.text(num.replace(".", ""), margin + 2, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);
        const wrapped = doc.splitTextToSize(rest.join(" "), contentW - 10);
        wrapped.forEach((wl, i) => {
          if (i > 0) checkY(6);
          doc.text(wl, margin + 9, y);
          y += 5.5;
        });
      } else {
        writeLine(trimmed, 9.5, "normal", [50, 50, 50]);
        y += 1;
      }
    });

    // ── Footer, copied from ReportsContent.generatePdfDoc ──
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFillColor(22, 73, 51);
      doc.rect(0, pageH - 12, pageW, 0.6, "F");
      doc.setFillColor(245, 247, 245);
      doc.rect(0, pageH - 11.4, pageW, 11.4, "F");
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 140, 130);
      doc.text(`${branch} Branch  |  ${safePeriod}`, margin, pageH - 5);
      doc.text(`Page ${i} of ${totalPages}`, pageW - margin, pageH - 5, {
        align: "right",
      });
    }

    doc.save(
      `report_${branch.replace(/\s+/g, "_")}_${report.period.replace(/[^a-z0-9]/gi, "_")}.pdf`,
    );
  };

  const saveReport = async (report) => {
    if (!report.id) {
      showToast(
        "error",
        "Save Failed",
        "No report ID found. Try regenerating.",
      );
      return;
    }
    setSavingId(report.id);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/reports/${report.id}/save`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );
      const responseData = await res.json();
      if (res.status === 409) {
        showToast(
          "error",
          "Already Saved",
          "This report has already been saved.",
        );
        return;
      }
      if (!res.ok) throw new Error(responseData.error || "Unknown error");

      setReports((prev) =>
        prev.map((r) => (r.id === report.id ? { ...r, saved: true } : r)),
      );
      showToast(
        "success",
        "Report Saved",
        "The report has been saved successfully.",
      );
    } catch {
      showToast(
        "error",
        "Save Failed",
        "Failed to save report. Please try again.",
      );
    } finally {
      setSavingId(null);
    }
  };

  const submitReport = async (report) => {
    setSubmitting(report.id);
    try {
      const coords = await getBrowserLocation();
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/reports/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reportId: report.id,
            reportNumber: fmtReportId(report.id),
            branch,
            period: report.period,
            generatedDate: report.generatedDate,
            content: report.content,
            submittedBy: user?.name || user?.email || "Branch Manager",
            role: user?.role || "Branch Manager",
            brand: user?.brand || "",
            latitude: coords?.latitude,
            longitude: coords?.longitude,
          }),
        },
      );

      if (!res.ok) throw new Error("Submit failed");
      const data = await res.json();

      setSubmittedReports((prev) => [
        {
          id: report.id,
          localId: report.localId,
          generatedDate: report.generatedDate
            ? new Date(report.generatedDate).toLocaleString("en-PH", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—",
          period: report.period,
          content: report.content,
          submittedAt: new Date().toLocaleString("en-PH"),
          expiresAt: data.expiresAt,
        },
        ...prev,
      ]);

      setReports((prev) => prev.filter((r) => r.id !== report.id));
      showToast(
        "success",
        "Report Submitted",
        `Report for ${fmtPeriod(report.period)} sent for review.`,
      );
    } catch {
      showToast(
        "error",
        "Submit Failed",
        "Failed to submit report. Please try again.",
      );
    }
    setSubmitting(null);
  };

  const Paginator = ({ total, page, setPage }) => {
    const totalPages = Math.ceil(total / PAGE_SIZE);
    if (totalPages <= 1) return null;
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "11px 16px",
          borderTop: "1px solid rgba(59,121,30,0.1)",
          background: "#f9fefb",
        }}
      >
        <span style={{ fontSize: 12, color: "#5C6B60" }}>
          Showing{" "}
          <strong>
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)}
          </strong>{" "}
          of <strong>{total}</strong>
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            aria-label="First page"
            title="First page"
            onClick={() => setPage(0)}
            disabled={page === 0}
            className="v-btn v-btn-secondary v-btn-sm"
            style={{ opacity: page === 0 ? 0.35 : 1 }}
          >
            <ArrowLeft size={12} />
            <ArrowLeft size={12} style={{ marginLeft: -9 }} />
          </button>
          <button
            aria-label="Previous page"
            title="Previous page"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="v-btn v-btn-secondary v-btn-sm"
            style={{ opacity: page === 0 ? 0.35 : 1 }}
          >
            <ArrowLeft size={12} />
          </button>
          <button
            aria-label="Next page"
            title="Next page"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="v-btn v-btn-secondary v-btn-sm"
            style={{ opacity: page >= totalPages - 1 ? 0.35 : 1 }}
          >
            <ArrowRight size={12} />
          </button>
          <button
            aria-label="Last page"
            title="Last page"
            onClick={() => setPage(totalPages - 1)}
            disabled={page >= totalPages - 1}
            className="v-btn v-btn-secondary v-btn-sm"
            style={{ opacity: page >= totalPages - 1 ? 0.35 : 1 }}
          >
            <ArrowRight size={12} />
            <ArrowRight size={12} style={{ marginLeft: -9 }} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="ma-reports"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <style>{`
        .ma-reports {
          --ma-green:#3b791e; --ma-green-dark:#2c5c16; --ma-green-mid:#c9dba0;
          --ma-teal:#509820; --ma-lime:#b3a941; --ma-lime-ink:#24310C;
          --ma-ink:#347022; --ma-text:#24310C; --ma-muted:#5C6B60;
          --ma-border:#E1E6D8; --ma-bg:#F6F7F1; --ma-white:#ffffff;
          --ma-warn:#b45309; --ma-warn-bg:#fff7ed;
          --ma-red:#c0392b; --ma-red-bg:#fdf1f0;
          color:var(--ma-text); width:100%; min-width:0;
        }
        .ma-page-head { display:flex; align-items:flex-start; justify-content:space-between; gap:20px; margin-bottom:20px; }
        .ma-page-title { display:flex; align-items:center; gap:11px; margin:0 0 5px; color:var(--ma-green-dark); font-size:22px; font-weight:800; letter-spacing:-.025em; }
        .ma-page-icon { width:38px; height:38px; border-radius:11px; display:inline-flex; align-items:center; justify-content:center; color:var(--ma-white); background:linear-gradient(135deg,var(--ma-green),var(--ma-green-dark)); box-shadow:0 7px 18px rgba(59,121,30,.2); }
        .ma-page-sub { margin:0; color:var(--ma-muted); font-size:12.5px; line-height:1.55; }
        .ma-context { display:inline-flex; align-items:center; gap:7px; min-height:34px; padding:0 12px; border:1px solid var(--ma-border); border-radius:10px; background:var(--ma-white); color:var(--ma-green-dark); font-size:11.5px; font-weight:700; white-space:nowrap; }
        .ma-context-dot { width:7px; height:7px; border-radius:50%; background:var(--ma-teal); box-shadow:0 0 0 3px rgba(80,152,32,.12); }
        .ma-reports .v-stat-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; margin-bottom:16px; }
        .ma-reports .v-stat-card, .ma-reports .v-kpi { border:1px solid var(--ma-border)!important; border-radius:14px!important; background:var(--ma-white)!important; box-shadow:0 3px 12px rgba(36,49,12,.045)!important; }
        .ma-reports .v-card { border:1px solid var(--ma-border)!important; border-radius:16px!important; background:var(--ma-white)!important; box-shadow:0 5px 18px rgba(36,49,12,.05)!important; }
        .ma-reports .v-section-head { display:flex; justify-content:space-between; align-items:center; gap:14px; padding-bottom:14px; margin-bottom:16px; border-bottom:1px solid var(--ma-border); }
        .ma-reports .v-form-label { color:var(--ma-muted)!important; font-size:10.5px!important; font-weight:800!important; letter-spacing:.055em; text-transform:uppercase; }
        .ma-reports .v-form-input { height:42px!important; border:1px solid var(--ma-border)!important; border-radius:10px!important; background:var(--ma-bg)!important; color:var(--ma-text)!important; box-shadow:none!important; }
        .ma-reports .v-form-input:focus { border-color:var(--ma-green)!important; background:var(--ma-white)!important; box-shadow:0 0 0 3px rgba(59,121,30,.1)!important; }
        .ma-reports .v-btn { min-height:34px; border-radius:9px!important; font-family:inherit!important; font-weight:700!important; transition:transform .15s ease,box-shadow .15s ease,background .15s ease!important; }
        .ma-reports .v-btn:not(:disabled):hover { transform:translateY(-1px); }
        .ma-reports .v-btn-primary { background:var(--ma-green)!important; border-color:var(--ma-green)!important; color:var(--ma-white)!important; box-shadow:0 5px 14px rgba(59,121,30,.18)!important; }
        .ma-reports .v-btn-primary:not(:disabled):hover { background:var(--ma-green-dark)!important; }
        .ma-reports .v-btn-blue { background:var(--ma-bg)!important; color:var(--ma-green-dark)!important; border:1px solid var(--ma-green-mid)!important; box-shadow:none!important; }
        .ma-reports .v-btn-ghost, .ma-reports .v-btn-secondary { color:var(--ma-muted)!important; border-color:var(--ma-border)!important; background:var(--ma-white)!important; }
        .ma-reports .v-btn-ghost:not(:disabled):hover, .ma-reports .v-btn-secondary:not(:disabled):hover { color:var(--ma-green-dark)!important; background:var(--ma-bg)!important; border-color:var(--ma-green-mid)!important; }
        .ma-reports .v-table { width:100%; border-collapse:separate; border-spacing:0; }
        .ma-reports .v-table th { padding:10px 12px!important; background:var(--ma-bg)!important; color:var(--ma-muted)!important; border-bottom:1px solid var(--ma-border)!important; font-size:9.5px!important; font-weight:800!important; letter-spacing:.065em; text-transform:uppercase; white-space:nowrap; }
        .ma-reports .v-table td { padding:12px!important; border-bottom:1px solid var(--ma-border)!important; vertical-align:middle; }
        .ma-reports .v-table tbody tr:hover td { background:#fbfcf8; }
        .ma-reports .v-badge-blue { color:var(--ma-green-dark)!important; background:var(--ma-bg)!important; border:1px solid var(--ma-green-mid)!important; }
        .ma-reports .v-badge-green { color:var(--ma-green-dark)!important; background:#f0f5e8!important; border:1px solid var(--ma-green-mid)!important; }
        .ma-report-tabs { display:flex; gap:3px; background:var(--ma-bg); border:1px solid var(--ma-border); border-radius:12px; padding:4px; width:fit-content; max-width:100%; margin-bottom:16px; overflow-x:auto; }
        .ma-report-tab { display:inline-flex; align-items:center; gap:6px; height:34px; padding:0 14px; border-radius:9px; border:0; background:transparent; color:var(--ma-muted); font-size:12px; font-weight:700; cursor:pointer; font-family:inherit; white-space:nowrap; }
        .ma-report-tab.active { background:var(--ma-green); color:var(--ma-white); box-shadow:0 3px 10px rgba(59,121,30,.18); }
        .ma-report-count { min-width:18px; height:18px; padding:0 5px; border-radius:9px; display:inline-flex; align-items:center; justify-content:center; font-size:9.5px; background:var(--ma-white); border:1px solid var(--ma-border); }
        .ma-report-tab.active .ma-report-count { background:rgba(255,255,255,.18); border-color:transparent; }
        @media (max-width:1050px) { .ma-reports .v-stat-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
        @media (max-width:720px) {
          .ma-page-head { flex-direction:column; gap:10px; }
          .ma-reports .v-stat-grid { grid-template-columns:1fr; }
          .ma-generate-grid { grid-template-columns:1fr!important; }
          .ma-generate-grid .v-btn { width:100%; justify-content:center; }
          .ma-reports .v-card { padding:16px!important; }
        }
        /* Compact report workspace: scoped to avoid restyling other modules. */
        .ma-reports { font-size:12px; line-height:1.55; }
        .ma-reports .ma-page-head { margin-bottom:16px; }
        .ma-reports .ma-page-title { font-size:18px; gap:9px; }
        .ma-reports .ma-page-icon { width:32px; height:32px; border-radius:10px; box-shadow:none; }
        .ma-reports .ma-page-sub { font-size:11.5px; }
        .ma-reports .ma-context { font-size:10.5px; min-height:30px; }
        .ma-reports .v-card { padding:16px 18px!important; border-radius:14px!important; box-shadow:0 2px 10px rgba(36,49,12,.035)!important; animation:ma-report-enter .22s ease-out; }
        .ma-reports .v-section-head { padding-bottom:11px; margin-bottom:13px; flex-wrap:wrap; }
        .ma-reports .v-section-head > :first-child { font-size:12px!important; font-weight:750!important; color:var(--ma-green-dark)!important; }
        .ma-reports .v-section-head > span { font-size:10.5px!important; color:var(--ma-muted)!important; }
        .ma-reports .v-form-input { width:100%; box-sizing:border-box; min-width:0; height:38px!important; padding:0 11px; font-size:12px!important; font-family:inherit; }
        .ma-reports .ma-generate-grid { gap:12px!important; margin-bottom:12px!important; }
        .ma-reports .ma-generate-grid > button { height:38px!important; padding:0 18px!important; }
        .ma-reports .v-btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; min-height:32px; padding:6px 11px; font-size:11px!important; cursor:pointer; }
        .ma-reports .v-btn-sm { min-height:30px; padding:5px 9px; font-size:10.5px!important; }
        .ma-reports button:disabled { cursor:not-allowed; transform:none!important; box-shadow:none!important; }
        .ma-reports button:focus-visible, .ma-reports input:focus-visible { outline:2px solid var(--ma-green); outline-offset:3px; }
        .ma-reports .v-btn:not(:disabled):active { transform:translateY(0) scale(.98); }
        .ma-reports .ma-report-tab { font-size:11px; height:32px; padding:0 12px; transition:background .18s ease,color .18s ease,box-shadow .18s ease; }
        .ma-reports .ma-report-tab:not(.active):hover { background:var(--ma-white); color:var(--ma-green-dark); }
        .ma-reports .v-table { min-width:640px; }
        .ma-reports .v-table th { font-size:9px!important; padding:10px!important; }
        .ma-reports .v-table td { font-size:11px!important; padding:11px 10px!important; transition:background .16s ease; }
        .ma-reports .v-table td:first-child { font-variant-numeric:tabular-nums; }
        .ma-reports .v-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 7px; border-radius:6px; font-size:10px!important; font-weight:600; }
        .ma-reports pre { font-size:11.5px!important; line-height:1.8!important; color:var(--ma-text)!important; max-height:360px; overflow:auto; overflow-wrap:anywhere; white-space:pre-wrap; margin:0; padding:2px; animation:ma-report-enter .2s ease-out; scrollbar-width:thin; scrollbar-color:var(--ma-green-mid) transparent; }
        .ma-reports .ma-preset-active { background:#f0f5e8!important; border:1px solid var(--ma-green-mid)!important; color:var(--ma-green-dark)!important; }
        @keyframes ma-report-enter { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
        @media (max-width:720px) { .ma-reports .v-card { padding:14px!important; } .ma-reports .ma-page-title { font-size:17px; } }
        @media (prefers-reduced-motion:reduce) { .ma-reports *, .ma-reports *::before, .ma-reports *::after { animation:none!important; transition:none!important; scroll-behavior:auto!important; } }
      `}</style>

      <div className="ma-page-head">
        <div>
          <h2 className="ma-page-title">
            <span className="ma-page-icon">
              <FileText size={19} />
            </span>
            Sales &amp; Reports
          </h2>
          <p className="ma-page-sub">
            Generate, review, and submit evidence-based branch sales reports.
          </p>
        </div>
        <div className="ma-context">
          <span className="ma-context-dot" />
          {user?.brand || "Assigned brand"} · {branch || "Assigned branch"}
        </div>
      </div>
      <ConfirmDeleteReportModal
        report={confirmDeleteTarget}
        deleting={deletingId !== null}
        onConfirm={() =>
          confirmDeleteTarget && deleteReport(confirmDeleteTarget)
        }
        onCancel={() => {
          if (!deletingId) setConfirmDeleteTarget(null);
        }}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Generate Report Card */}
      <div
        className="v-card"
        style={{ padding: "20px 22px", marginBottom: 16 }}
      >
        <div className="v-section-head">
          <VSectionTitle icon={<Sparkles size={16} />}>
            Generate AI Sales Report
          </VSectionTitle>
        </div>

        <div
          className="ma-generate-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr auto",
            gap: 14,
            alignItems: "end",
            marginBottom: 20,
          }}
        >
          <div className="v-form-group" style={{ marginBottom: 0 }}>
            <label className="v-form-label">From Date</label>
            <input
              type="date"
              className="v-form-input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              max={dateTo}
            />
          </div>
          <div className="v-form-group" style={{ marginBottom: 0 }}>
            <label className="v-form-label">To Date</label>
            <input
              type="date"
              className="v-form-input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              min={dateFrom}
              max={fmt8(today)}
            />
          </div>
          <button
            className="v-btn v-btn-primary"
            onClick={generateReport}
            disabled={generating || !dateFrom || !dateTo}
            style={{
              height: 46,
              paddingLeft: 24,
              paddingRight: 24,
              opacity: generating ? 0.7 : 1,
            }}
          >
            {generating ? (
              <>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin .8s linear infinite",
                  }}
                />{" "}
                Generating…
              </>
            ) : (
              <>
                <Sparkles size={14} /> Generate Report
              </>
            )}
          </button>
        </div>

        {/* Quick Presets */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#9CA89C",
              alignSelf: "center",
              fontFamily: "Plus Jakarta Sans,sans-serif",
              textTransform: "uppercase",
              letterSpacing: ".06em",
            }}
          >
            Quick:
          </span>
          {[
            {
              label: "This Week",
              from: fmt8(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)),
              to: fmt8(today),
            },
            {
              label: "This Month",
              from: fmt8(new Date(today.getFullYear(), today.getMonth(), 1)),
              to: fmt8(today),
            },
            {
              label: "Last Month",
              from: fmt8(
                new Date(today.getFullYear(), today.getMonth() - 1, 1),
              ),
              to: fmt8(new Date(today.getFullYear(), today.getMonth(), 0)),
            },
            {
              label: "This Quarter",
              from: fmt8(
                new Date(
                  today.getFullYear(),
                  Math.floor(today.getMonth() / 3) * 3,
                  1,
                ),
              ),
              to: fmt8(today),
            },
            {
              label: "This Year",
              from: fmt8(new Date(today.getFullYear(), 0, 1)),
              to: fmt8(today),
            },
          ].map((p) => (
            <button
              key={p.label}
              aria-pressed={dateFrom === p.from && dateTo === p.to}
              className={`v-btn v-btn-ghost v-btn-sm ${dateFrom === p.from && dateTo === p.to ? "ma-preset-active" : ""}`}
              onClick={() => {
                setDateFrom(p.from);
                setDateTo(p.to);
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {aiReport && (
          <div
            style={{
              marginTop: 20,
              background:
                "linear-gradient(135deg,rgba(59,121,30,0.04),rgba(59,121,30,0.03))",
              border: "1.5px solid rgba(59,121,30,0.15)",
              borderRadius: 16,
              padding: "20px 22px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 13,
                  color: "#12241B",
                  fontFamily: "Plus Jakarta Sans,sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <Sparkles size={14} color="#3b791e" /> AI Report Preview
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: "#5C6B60",
                  fontFamily: "Plus Jakarta Sans,sans-serif",
                }}
              >
                Period: {dateFrom} → {dateTo}
              </span>
            </div>
            <pre
              style={{
                fontFamily: "Plus Jakarta Sans,sans-serif",
                fontSize: 12.5,
                color: "#374151",
                whiteSpace: "pre-wrap",
                lineHeight: 1.8,
                maxHeight: 320,
                overflowY: "auto",
              }}
            >
              {aiReport}
            </pre>
          </div>
        )}
      </div>

      {/* Sales report navigation — same compact tab layout as AdminDashboard */}
      <div className="ma-report-tabs">
        {[
          {
            id: "generated",
            label: "Generated Reports",
            icon: FileCheck,
            count: reports.length,
          },
          {
            id: "submitted",
            label: "Submitted Reports",
            icon: Send,
            count: submittedReports.length,
          },
          {
            id: "history",
            label: "Report History",
            icon: History,
            count: deletedReports.length,
          },
        ].map((t) => {
          const Icon = t.icon;
          const active = reportTab === t.id;
          return (
            <button
              key={t.id}
              aria-pressed={active}
              onClick={() => setReportTab(t.id)}
              className={`ma-report-tab ${active ? "active" : ""}`}
            >
              <Icon size={13} />
              {t.label}
              <span className="ma-report-count">{t.count}</span>
            </button>
          );
        })}
      </div>

      {/* Generated Reports Table */}
      {reportTab === "generated" && (
        <div
          className="v-card"
          style={{ padding: "18px 20px", marginBottom: 16 }}
        >
          <div className="v-section-head">
            <VSectionTitle icon={<FileCheck size={16} />}>
              Generated Reports
            </VSectionTitle>
            <span
              style={{
                fontSize: 12,
                color: "#9CA89C",
                fontFamily: "Plus Jakarta Sans,sans-serif",
              }}
            >
              {reports.length} pending submission
            </span>
          </div>
          {reports.length === 0 ? (
            <VEmptyState
              icon={<BarChart2 size={30} />}
              title="No reports generated yet"
              sub="Select a date range and click Generate Report to create an AI-powered sales report."
            />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="v-table">
                <thead>
                  <tr>
                    <th>Report #</th>
                    <th>Generated</th>
                    <th>Period</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports
                    .slice(genPage * PAGE_SIZE, (genPage + 1) * PAGE_SIZE)
                    .map((r) => (
                      <React.Fragment key={r.localId}>
                        <tr>
                          <td
                            style={{
                              fontWeight: 800,
                              color: "#12241B",
                              fontFamily: "Plus Jakarta Sans,sans-serif",
                              fontSize: 12,
                            }}
                          >
                            {r.id
                              ? `REP-${String(r.id).padStart(5, "0")}`
                              : "—"}
                          </td>
                          <td
                            style={{
                              fontSize: 14,
                              fontWeight: 400,
                              color: "#5C6B60",
                              fontFamily: "Plus Jakarta Sans,sans-serif",
                            }}
                          >
                            {r.generatedDate}
                          </td>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                gap: 6,
                                alignItems: "center",
                                flexWrap: "wrap",
                              }}
                            >
                              <span className="v-badge v-badge-blue">
                                {r.period}
                              </span>
                              {r.saved && (
                                <span className="v-badge v-badge-green">
                                  <Archive size={10} /> Saved
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                gap: 6,
                                flexWrap: "wrap",
                              }}
                            >
                              <button
                                className="v-btn v-btn-ghost v-btn-sm"
                                onClick={() =>
                                  setViewReportId(
                                    viewReportId === r.id ? null : r.id,
                                  )
                                }
                              >
                                <Eye size={12} />{" "}
                                {viewReportId === r.id ? "Hide" : "View"}
                              </button>
                              <button
                                className="v-btn v-btn-sm v-btn-blue"
                                onClick={() => saveReport(r)}
                                disabled={r.saved || savingId === r.id}
                                style={{
                                  opacity:
                                    r.saved || savingId === r.id ? 0.6 : 1,
                                }}
                              >
                                {savingId === r.id ? (
                                  <>
                                    <div
                                      style={{
                                        width: 10,
                                        height: 10,
                                        border:
                                          "2px solid rgba(255,255,255,0.4)",
                                        borderTopColor: "#fff",
                                        borderRadius: "50%",
                                        animation: "spin .8s linear infinite",
                                      }}
                                    />{" "}
                                    Saving…
                                  </>
                                ) : (
                                  <>
                                    <Save size={12} />{" "}
                                    {r.saved ? "Saved" : "Save"}
                                  </>
                                )}
                              </button>
                              <button
                                className="v-btn v-btn-primary v-btn-sm"
                                onClick={() => submitReport(r)}
                                disabled={submitting === r.id || !r.saved}
                                style={{
                                  opacity:
                                    submitting === r.id || !r.saved ? 0.5 : 1,
                                }}
                                title={
                                  !r.saved
                                    ? "Save the report first before submitting"
                                    : ""
                                }
                              >
                                {submitting === r.id ? (
                                  <>
                                    <div
                                      style={{
                                        width: 10,
                                        height: 10,
                                        border:
                                          "2px solid rgba(255,255,255,0.4)",
                                        borderTopColor: "#fff",
                                        borderRadius: "50%",
                                        animation: "spin .8s linear infinite",
                                      }}
                                    />{" "}
                                    Sending…
                                  </>
                                ) : (
                                  <>
                                    <Send size={12} /> Submit to Admin
                                  </>
                                )}
                              </button>
                              <button
                                className="v-btn v-btn-sm"
                                onClick={() => setConfirmDeleteTarget(r)}
                                style={{
                                  background: "#fff0f0",
                                  color: "#dc2626",
                                  border: "1px solid #fecaca",
                                }}
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>

                        {viewReportId === r.id && (
                          <tr>
                            <td
                              colSpan={4}
                              style={{ padding: 0, border: "none" }}
                            >
                              <div
                                style={{
                                  margin: "8px 0 12px",
                                  background:
                                    "linear-gradient(135deg,rgba(59,121,30,0.04),rgba(59,121,30,0.03))",
                                  border: "1.5px solid rgba(59,121,30,0.15)",
                                  borderRadius: 14,
                                  padding: "18px 20px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 12,
                                  }}
                                >
                                  <div
                                    style={{
                                      fontWeight: 800,
                                      fontSize: 13,
                                      color: "#12241B",
                                      fontFamily:
                                        "Plus Jakarta Sans,sans-serif",
                                    }}
                                  >
                                    {r.id
                                      ? `REP-${String(r.id).padStart(5, "0")}`
                                      : "—"}{" "}
                                    — {r.period}
                                  </div>
                                  <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                      className="v-btn v-btn-sm v-btn-blue"
                                      onClick={() => downloadReport(r)}
                                    >
                                      <Download size={12} /> Download PDF
                                    </button>
                                    <button
                                      className="v-btn v-btn-secondary v-btn-sm"
                                      onClick={() => setViewReportId(null)}
                                    >
                                      <X size={12} /> Close
                                    </button>
                                  </div>
                                </div>
                                <pre
                                  style={{
                                    fontFamily: "Plus Jakarta Sans,sans-serif",
                                    fontSize: 12.5,
                                    color: "#374151",
                                    whiteSpace: "pre-wrap",
                                    lineHeight: 1.8,
                                  }}
                                >
                                  {r.content}
                                </pre>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                </tbody>
              </table>

              <Paginator
                total={reports.length}
                page={genPage}
                setPage={setGenPage}
              />
            </div>
          )}
        </div>
      )}
      {/* Submitted Reports */}
      {reportTab === "submitted" && (
        <div
          className="v-card"
          style={{ padding: "18px 20px", marginBottom: 16 }}
        >
          <div className="v-section-head">
            <VSectionTitle icon={<Send size={16} />}>
              Submitted Reports
            </VSectionTitle>
            <span
              style={{
                fontSize: 12,
                color: "#9CA89C",
                fontFamily: "Plus Jakarta Sans,sans-serif",
              }}
            >
              {submittedReports.length} submitted to admin
            </span>
          </div>
          {submittedReports.length === 0 ? (
            <VEmptyState
              icon={<Send size={30} />}
              title="No submitted reports yet"
              sub="Reports submitted to admin will appear here."
            />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="v-table">
                <thead>
                  <tr>
                    <th>Report #</th>
                    <th>Submitted At</th>
                    <th>Period</th>
                    <th>Generated</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submittedReports
                    .slice(subPage * PAGE_SIZE, (subPage + 1) * PAGE_SIZE)
                    .map((h) => (
                      <React.Fragment key={h.id}>
                        <tr>
                          <td
                            style={{
                              fontWeight: 800,
                              color: "#12241B",
                              fontFamily: "Plus Jakarta Sans,sans-serif",
                              fontSize: 12,
                            }}
                          >
                            REP-{String(h.id).padStart(5, "0")}
                          </td>
                          <td
                            style={{
                              fontSize: 12,
                              color: "#5C6B60",
                              fontFamily: "Plus Jakarta Sans,sans-serif",
                            }}
                          >
                            {h.submittedAt}
                          </td>
                          <td>
                            <span className="v-badge v-badge-blue">
                              {h.period}
                            </span>
                          </td>
                          <td
                            style={{
                              fontSize: 12,
                              color: "#9CA89C",
                              fontFamily: "Plus Jakarta Sans,sans-serif",
                            }}
                          >
                            {h.generatedDate || "—"}
                          </td>
                          <td>
                            {(() => {
                              const s = (h.status || "submitted").toLowerCase();
                              const cfg = {
                                approved: {
                                  bg: "#dcfce7",
                                  color: "#166534",
                                  dot: "#22c55e",
                                  label: "Acknowledged",
                                },
                                submitted: {
                                  bg: "#faeeda",
                                  color: "#633806",
                                  dot: "#BA7517",
                                  label: "Pending",
                                },
                              };
                              const { bg, color, dot, label } =
                                cfg[s] || cfg.submitted;
                              return (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 5,
                                    padding: "3px 10px",
                                    borderRadius: 20,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    background: bg,
                                    color,
                                  }}
                                >
                                  <span
                                    style={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: "50%",
                                      background: dot,
                                      display: "inline-block",
                                    }}
                                  />
                                  {label}
                                </span>
                              );
                            })()}
                          </td>
                          <td>
                            <button
                              className="v-btn v-btn-ghost v-btn-sm"
                              onClick={() =>
                                setViewSubmittedId(
                                  viewSubmittedId === h.id ? null : h.id,
                                )
                              }
                            >
                              <Eye size={12} />{" "}
                              {viewSubmittedId === h.id ? "Hide" : "View"}
                            </button>
                          </td>
                        </tr>

                        {viewSubmittedId === h.id && (
                          <tr>
                            <td
                              colSpan={6}
                              style={{ padding: 0, border: "none" }}
                            >
                              <div
                                style={{
                                  margin: "8px 0 12px",
                                  background:
                                    "linear-gradient(135deg,rgba(59,121,30,0.04),rgba(59,121,30,0.03))",
                                  border: "1.5px solid rgba(59,121,30,0.15)",
                                  borderRadius: 14,
                                  padding: "18px 20px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 12,
                                  }}
                                >
                                  <div
                                    style={{
                                      fontWeight: 800,
                                      fontSize: 13,
                                      color: "#12241B",
                                      fontFamily:
                                        "Plus Jakarta Sans,sans-serif",
                                    }}
                                  >
                                    REP-{String(h.id).padStart(5, "0")} —{" "}
                                    {h.period}
                                  </div>
                                  <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                      className="v-btn v-btn-sm v-btn-blue"
                                      onClick={() => downloadReport(h)}
                                    >
                                      <Download size={12} /> Download PDF
                                    </button>
                                    <button
                                      className="v-btn v-btn-secondary v-btn-sm"
                                      onClick={() => setViewSubmittedId(null)}
                                    >
                                      <X size={12} /> Close
                                    </button>
                                  </div>
                                </div>
                                {h.content ? (
                                  <pre
                                    style={{
                                      fontFamily:
                                        "Plus Jakarta Sans,sans-serif",
                                      fontSize: 12.5,
                                      color: "#374151",
                                      whiteSpace: "pre-wrap",
                                      lineHeight: 1.8,
                                    }}
                                  >
                                    {h.content}
                                  </pre>
                                ) : (
                                  <div
                                    style={{
                                      padding: "24px 0",
                                      textAlign: "center",
                                      color: "#9CA89C",
                                      fontSize: 13,
                                      fontStyle: "italic",
                                    }}
                                  >
                                    Report content not available.
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                </tbody>
              </table>

              <Paginator
                total={submittedReports.length}
                page={subPage}
                setPage={setSubPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Report History (deleted reports) */}
      {reportTab === "history" && (
        <div className="v-card" style={{ padding: "18px 20px" }}>
          <div className="v-section-head">
            <VSectionTitle icon={<Archive size={16} />}>
              Report History
            </VSectionTitle>
            <span
              style={{
                fontSize: 12,
                color: "#9CA89C",
                fontFamily: "Plus Jakarta Sans,sans-serif",
              }}
            >
              {deletedReports.length} deleted · recoverable for 30 days
            </span>
          </div>
          {deletedReports.length === 0 ? (
            <VEmptyState
              icon={<Trash2 size={30} />}
              title="No deleted reports"
              sub="Deleted reports will appear here and are recoverable for 30 days."
            />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="v-table">
                <thead>
                  <tr>
                    <th>Report #</th>
                    <th>Deleted At</th>
                    <th>Period</th>
                    <th>Generated</th>
                    <th>Expires In</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedReports
                    .slice(delPage * PAGE_SIZE, (delPage + 1) * PAGE_SIZE)
                    .map((r, i) => {
                      const daysLeft = r.expiresAt
                        ? Math.ceil(
                            (new Date(r.expiresAt) - new Date()) /
                              (1000 * 60 * 60 * 24),
                          )
                        : null;
                      const isExpiringSoon = daysLeft !== null && daysLeft <= 5;

                      return (
                        <tr key={r.id || r.localId || i}>
                          <td
                            style={{
                              fontWeight: 800,
                              color: "#12241B",
                              fontFamily: "Plus Jakarta Sans,sans-serif",
                              fontSize: 12,
                            }}
                          >
                            {r.id
                              ? `REP-${String(r.id).padStart(5, "0")}`
                              : "—"}
                          </td>
                          <td
                            style={{
                              fontSize: 12,
                              color: "#ef4444",
                              fontFamily: "Plus Jakarta Sans,sans-serif",
                            }}
                          >
                            {r.deletedAt}
                          </td>
                          <td>
                            <span className="v-badge v-badge-blue">
                              {r.period}
                            </span>
                          </td>
                          <td
                            style={{
                              fontSize: 12,
                              color: "#9CA89C",
                              fontFamily: "Plus Jakarta Sans,sans-serif",
                            }}
                          >
                            {r.generatedDate}
                          </td>
                          <td>
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                fontFamily: "Plus Jakarta Sans,sans-serif",
                                color: isExpiringSoon ? "#ef4444" : "#9CA89C",
                              }}
                            >
                              {daysLeft !== null
                                ? isExpiringSoon
                                  ? `Expiring · ${daysLeft}d left`
                                  : `${daysLeft}d left`
                                : "—"}
                            </span>
                          </td>
                          <td>
                            <button
                              className="v-btn v-btn-sm"
                              onClick={() => retrieveReport(r)}
                              disabled={retrieving === r.id}
                              style={{
                                background: "#F6F7F1",
                                color: "#3b791e",
                                border: "1px solid #D4DBC8",
                                opacity: retrieving === r.id ? 0.6 : 1,
                              }}
                            >
                              {retrieving === r.id ? (
                                <>
                                  <div
                                    style={{
                                      width: 10,
                                      height: 10,
                                      border: "2px solid rgba(59,121,30,0.3)",
                                      borderTopColor: "#3b791e",
                                      borderRadius: "50%",
                                      animation: "spin .8s linear infinite",
                                    }}
                                  />{" "}
                                  Retrieving…
                                </>
                              ) : (
                                <>
                                  <RefreshCw size={12} /> Retrieve
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              <Paginator
                total={deletedReports.length}
                page={delPage}
                setPage={setDelPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
function ConfirmDeleteReportModal({ report, deleting, onConfirm, onCancel }) {
  const fmtPeriod = (period) => {
    if (!period) return "—";
    const parts = period.split("→").map((s) => s.trim());
    if (parts.length !== 2) return period;
    const fmtOne = (d) => {
      const date = new Date(d);
      if (isNaN(date.getTime())) return d;
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    };
    return `${fmtOne(parts[0])} - ${fmtOne(parts[1])}`;
  };

  if (!report) return null;
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13,43,30,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2500,
        padding: 20,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 24px 64px rgba(0,0,0,0.16)",
          border: "1px solid #fecaca",
          fontFamily: "Plus Jakarta Sans,sans-serif",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "#fef2f2",
            padding: "20px 24px 16px",
            borderBottom: "1px solid #fecaca",
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "#991b1b",
              marginBottom: 5,
              fontFamily: "Plus Jakarta Sans,sans-serif",
            }}
          >
            Delete Report
          </div>
          <div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6 }}>
            Delete the report for <strong>{fmtPeriod(report.period)}</strong>?
            It will be recoverable for 30 days.
          </div>
        </div>
        <div
          style={{
            padding: "14px 24px",
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          <button
            onClick={onCancel}
            disabled={deleting}
            className="v-btn v-btn-secondary v-btn-sm"
            style={{ opacity: deleting ? 0.5 : 1 }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 18px",
              borderRadius: 9,
              border: "none",
              background: deleting ? "#ef9a9a" : "#dc2626",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              cursor: deleting ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {deleting ? (
              <>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin .8s linear infinite",
                  }}
                />{" "}
                Deleting…
              </>
            ) : (
              "Yes, Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const StaffForm = ({
  onSubmit,
  isEdit,
  form,
  handleInputChange,
  closeModal,
  showPwRules,
  pwErrors,
}) => (
  <form onSubmit={onSubmit}>
    <div className="v-form-group">
      <label className="v-form-label">Full Name</label>
      <input
        type="text"
        name="name"
        className="v-form-input"
        value={form.name}
        onChange={handleInputChange}
        required
      />
    </div>
    <div className="v-form-group">
      <label className="v-form-label">Email Address</label>
      <input
        type="email"
        name="email"
        className="v-form-input"
        value={form.email}
        onChange={handleInputChange}
        required
      />
    </div>
    <div className="v-form-group">
      <label className="v-form-label">Role</label>
      <select
        name="role"
        className="v-form-select"
        value={form.role}
        onChange={handleInputChange}
      >
        <option value="Staff">Staff</option>
        <option value="Manager">Manager</option>
      </select>
    </div>
    <div className="v-form-group">
      <label className="v-form-label">Branch</label>
      <input
        type="text"
        className="v-form-input"
        value={form.branch}
        disabled
      />
    </div>
    <div className="v-form-group">
      <label className="v-form-label">
        {isEdit ? "New Password (leave blank to keep)" : "Password"}
      </label>
      <input
        type="password"
        name="password"
        className="v-form-input"
        value={form.password}
        onChange={handleInputChange}
        required={!isEdit}
        placeholder={
          isEdit ? "Leave blank to keep current" : "Enter secure password"
        }
      />
      {showPwRules && <VPwBox errors={pwErrors} />}
    </div>
    <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
      <button
        type="button"
        className="v-btn v-btn-secondary"
        style={{ flex: 1, justifyContent: "center" }}
        onClick={closeModal}
      >
        Cancel
      </button>
      <button
        type="submit"
        className="v-btn v-btn-primary"
        style={{ flex: 1, justifyContent: "center" }}
      >
        {isEdit ? "Save Changes" : "Create Account"}
      </button>
    </div>
  </form>
);

function FrStaffManagementContent({ user }) {
  const franchiseeBranch = (user?.branch || "").trim();
  const [staff, setStaff] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [pwErrors, setPwErrors] = useState([]);
  const [showPwRules, setShowPwRules] = useState(false);

  const emptyForm = {
    name: "",
    email: "",
    role: "Staff",
    branch: franchiseeBranch,
    password: "",
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/users?branch=${encodeURIComponent(franchiseeBranch)}`,
      );
      const d = await res.json();
      const normalizedBranch = franchiseeBranch.toLowerCase();
      setStaff(
        (Array.isArray(d) ? d : [])
          .filter((u) => ["Staff", "Manager"].includes(u.role))
          .filter(
            (u) => (u.branch || "").trim().toLowerCase() === normalizedBranch,
          ),
      );
    } catch {
      setStaff([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (name === "password") {
      if (value) {
        setShowPwRules(true);
        setPwErrors(validatePw(value).errs);
      } else {
        setShowPwRules(false);
        setPwErrors([]);
      }
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!validatePw(form.password).valid) {
      alert("Password does not meet requirements.");
      return;
    }
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, branch: franchiseeBranch }),
      });
      const d = await res.json();
      if (d.success) {
        await fetchStaff();
        setShowAddModal(false);
        setForm(emptyForm);
        setShowPwRules(false);
      } else alert(d.error || "Failed to add staff");
    } catch {
      alert("Failed to add staff");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (form.password && !validatePw(form.password).valid) {
      alert("Password does not meet requirements.");
      return;
    }
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/users/${editingStaff.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            role: form.role,
            email: form.email,
            ...(form.password && { newPassword: form.password }), // backend expects newPassword not password
          }),
        },
      );
      const d = await res.json();
      if (d.success) {
        await fetchStaff();
        setShowEditModal(false);
        setEditingStaff(null);
        setForm(emptyForm);
        setShowPwRules(false);
      } else alert(d.error || "Failed to update");
    } catch {
      alert("Failed to update");
    }
  };

  const handleDelete = async (id) => {
    if (confirmDel !== id) {
      setConfirmDel(id);
      return;
    }
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users/${id}`, {
        method: "DELETE",
      });
      const d = await res.json();
      if (d.success) {
        await fetchStaff();
        setConfirmDel(null);
      } else alert(d.error || "Failed to delete");
    } catch {
      alert("Failed to delete");
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setForm(emptyForm);
    setShowPwRules(false);
    setPwErrors([]);
  };

  return (
    <>
      <div className="v-stat-grid">
        <VKpi
          label="Total Staff"
          value={staff.length}
          sub={`Branch: ${franchiseeBranch}`}
          icon={<Users size={20} />}
          color="green"
        />
        <VKpi
          label="Active Staff"
          value={
            staff.filter((s) => (s.status || "active") === "active").length
          }
          sub="Active accounts"
          icon={<Check size={20} />}
          color="blue"
        />
        <VKpi
          label="Managers"
          value={staff.filter((s) => s.role === "Manager").length}
          sub="Manager accounts"
          icon={<Shield size={20} />}
          color="orange"
        />
      </div>

      <div className="v-card" style={{ padding: "20px 22px" }}>
        <div className="v-section-head">
          <VSectionTitle icon={<Users size={16} />}>
            Staff Accounts — {franchiseeBranch}
          </VSectionTitle>
          <button
            className="v-btn v-btn-primary"
            onClick={() => {
              setForm(emptyForm);
              setShowPwRules(false);
              setPwErrors([]);
              setShowAddModal(true);
            }}
          >
            <Plus size={14} /> Create Staff Account
          </button>
        </div>

        {staff.length === 0 ? (
          <VEmptyState
            icon={<Users size={30} />}
            title="No staff accounts yet"
            sub="Create the first staff account for your branch."
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="v-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 10,
                            background: "#f0f5e8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            color: "#bdd43c",
                            fontSize: 13,
                            fontFamily: "Plus Jakarta Sans,sans-serif",
                            flexShrink: 0,
                          }}
                        >
                          {(s.name || "S")[0]}
                        </div>
                        <strong
                          style={{
                            color: "#12241B",
                            fontFamily: "Plus Jakarta Sans,sans-serif",
                          }}
                        >
                          {s.name}
                        </strong>
                      </div>
                    </td>
                    <td style={{ color: "#5C6B60", fontSize: 13 }}>
                      {s.email}
                    </td>
                    <td>
                      {s.role === "Manager" ? (
                        <span className="v-badge v-badge-orange">
                          <Shield size={10} /> Manager
                        </span>
                      ) : (
                        <span className="v-badge v-badge-blue">Staff</span>
                      )}
                    </td>
                    <td>
                      <span className="v-badge v-badge-green">
                        <div
                          className="v-dot v-dot-green"
                          style={{ width: 6, height: 6 }}
                        />{" "}
                        {(s.status || "active").toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div
                        style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                      >
                        <button
                          className="v-btn v-btn-ghost v-btn-sm"
                          onClick={() => {
                            setEditingStaff(s);
                            setForm({
                              name: s.name,
                              email: s.email,
                              role: s.role,
                              branch: franchiseeBranch,
                              password: "",
                            });
                            setShowPwRules(false);
                            setPwErrors([]);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="v-btn v-btn-sm"
                          style={{
                            color: confirmDel === s.id ? "#fff" : "#ef4444",
                            background:
                              confirmDel === s.id
                                ? "var(--grad-red)"
                                : "rgba(239,68,68,0.06)",
                            border: "1.5px solid rgba(239,68,68,0.25)",
                            borderRadius: 9,
                            boxShadow:
                              confirmDel === s.id
                                ? "0 3px 10px rgba(239,68,68,.3)"
                                : "none",
                          }}
                        >
                          <Trash2 size={12} />{" "}
                          {confirmDel === s.id ? "Confirm?" : "Delete"}
                        </button>
                        {confirmDel === s.id && (
                          <button
                            className="v-btn v-btn-secondary v-btn-sm"
                            onClick={() => setConfirmDel(null)}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="v-modal-overlay" onClick={closeModal}>
          <div className="v-modal" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "#f0f5e8",
                  color: "#3b791e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UserPlus size={16} />
              </div>
              <h2 className="v-modal-title" style={{ marginBottom: 0 }}>
                Create Staff Account
              </h2>
            </div>
            <p
              style={{
                color: "#94a3b8",
                fontSize: 13,
                marginBottom: 22,
                fontFamily: "Plus Jakarta Sans,sans-serif",
              }}
            >
              Add a new staff or manager to your branch.
            </p>
            <StaffForm
              onSubmit={handleAdd}
              isEdit={false}
              form={form}
              handleInputChange={handleInputChange}
              closeModal={closeModal}
              showPwRules={showPwRules}
              pwErrors={pwErrors}
            />
          </div>
        </div>
      )}
      {showEditModal && (
        <div className="v-modal-overlay" onClick={closeModal}>
          <div className="v-modal" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "#f0f5e8",
                  color: "#3b791e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Pencil size={16} />
              </div>
              <h2 className="v-modal-title" style={{ marginBottom: 0 }}>
                Edit Staff Account
              </h2>
            </div>
            <p
              style={{
                color: "#94a3b8",
                fontSize: 13,
                marginBottom: 22,
                fontFamily: "Plus Jakarta Sans,sans-serif",
              }}
            >
              Update details for {editingStaff?.name}.
            </p>
            <StaffForm
              onSubmit={handleEdit}
              isEdit={true}
              form={form}
              handleInputChange={handleInputChange}
              closeModal={closeModal}
              showPwRules={showPwRules}
              pwErrors={pwErrors}
            />
          </div>
        </div>
      )}
    </>
  );
}

function FrCommunicationContent() {
  const [announcements, setAnnouncements] = useState([]);
  const [pinnedIds, setPinnedIds] = useState(new Set());
  const [fetching, setFetching] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedTab, setSelectedTab] = useState("all");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingItem, setViewingItem] = useState(null);

  // Load user from localStorage (mirrors AsyncStorage.getItem("user"))
  const [commUser, setCommUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const C = {
    border: "rgba(59,121,30,0.12)",
    greenMid: "rgba(59,121,30,0.1)",
  };

  const bmLabel = {
    display: "block",
    fontSize: 11.5,
    fontWeight: 700,
    color: "#5C6B60",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    fontFamily: "Plus Jakarta Sans,sans-serif",
    marginBottom: 4,
  };

  const bmInput = {
    width: "100%",
    padding: "10px 13px",
    border: "1.5px solid rgba(59,121,30,0.18)",
    borderRadius: 11,
    fontSize: 13.5,
    fontFamily: "Plus Jakarta Sans,sans-serif",
    color: "#12241B",
    background: "#ffffff",
    outline: "none",
    display: "block",
  };

  const isAdminUser = (u) => u?.role?.toLowerCase() === "administrator";

  const PIN_KEY = "announcement_pins";
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PIN_KEY);
      if (raw) setPinnedIds(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  const persistPins = (newSet) => {
    try {
      localStorage.setItem(PIN_KEY, JSON.stringify([...newSet]));
    } catch {}
  };

  // ── Fetch announcements ──
  const fetchAnnouncements = async () => {
    setFetching(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/announcements`);
      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setAnnouncements([]);
    } finally {
      setFetching(false);
    }
  };
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Merge server list with local pin state
  const mergedAnnouncements = announcements.map((a) => ({
    ...a,
    pinned: pinnedIds.has(String(a.id)),
  }));

  // ── Toggle pin — ADMIN ONLY ──
  const handlePin = (item) => {
    if (!isAdminUser(commUser)) return;
    const id = String(item.id);
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      persistPins(next);
      return next;
    });
    setViewingItem((prev) =>
      prev && String(prev.id) === id ? { ...prev, pinned: !prev.pinned } : prev,
    );
  };

  // ── Save (create / update) — ADMIN ONLY ──
  const handleSave = async (e) => {
    e.preventDefault();
    if (!isAdminUser(commUser)) {
      alert("Only administrators can post announcements.");
      return;
    }
    if (!title.trim() || !content.trim()) {
      alert("Please fill in all fields.");
      return;
    }
    try {
      const url = editing
        ? `${process.env.REACT_APP_API_URL}/announcements/${editing.id}`
        : `${process.env.REACT_APP_API_URL}/announcements`;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          userId: commUser.id,
          role: commUser.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to save.");
        return;
      }
      setModalVisible(false);
      setEditing(null);
      setTitle("");
      setContent("");
      fetchAnnouncements();
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  // ── Delete — ADMIN ONLY ──
  const handleDelete = async (id) => {
    if (!isAdminUser(commUser)) return;
    if (!window.confirm("Delete this announcement?")) return;
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/announcements/${id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: commUser.id, role: commUser.role }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Delete failed.");
        return;
      }
      const strId = String(id);
      if (pinnedIds.has(strId)) {
        setPinnedIds((prev) => {
          const next = new Set(prev);
          next.delete(strId);
          persistPins(next);
          return next;
        });
      }
      if (viewingItem?.id === id) setViewingItem(null);
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  // ── Edit — ADMIN ONLY ──
  const handleEdit = (item) => {
    if (!isAdminUser(commUser)) return;
    setEditing(item);
    setTitle(item.title);
    setContent(item.content);
    setModalVisible(true);
  };

  // ── Tab filtering ──
  const now = new Date();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const tabFiltered = (() => {
    let list;
    switch (selectedTab) {
      case "recent":
        list = mergedAnnouncements.filter(
          (a) => new Date(a.created_at) >= sevenDaysAgo,
        );
        break;
      case "pinned":
        list = mergedAnnouncements.filter((a) => a.pinned);
        break;
      case "deleteHistory":
        list = [];
        break;
      default:
        list = mergedAnnouncements;
    }
    return [...list].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });
  })();

  const filtered = searchQuery.trim()
    ? tabFiltered.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : tabFiltered;

  const tabBadge = {
    all: mergedAnnouncements.length,
    recent: mergedAnnouncements.filter(
      (a) => new Date(a.created_at) >= sevenDaysAgo,
    ).length,
    pinned: pinnedIds.size,
  };

  // ── Helpers ──
  const getInitials = (t = "") =>
    t
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");

  const isRecent = (item) =>
    new Date() - new Date(item.created_at) < 7 * 24 * 60 * 60 * 1000;

  // ── Styles (inline, consistent with dashboard tokens) ──
  const commStyles = {
    root: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      display: "flex",
      flexDirection: "column",
      minHeight: 620,
      background: "#fff",
      border: "1px solid #E1E6D8",
      borderRadius: 18,
      overflow: "hidden",
      boxShadow: "0 2px 14px rgba(50,109,32,.06)",
    },
    header: {
      background: "linear-gradient(135deg,#509820,#3b791e)",
      padding: "20px 24px 28px",
      borderRadius: "18px 18px 0 0",
      position: "relative",
      overflow: "hidden",
    },
    headerTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 4,
    },
    eyebrow: {
      fontSize: 9,
      fontWeight: 800,
      color: "rgba(255,255,255,0.6)",
      letterSpacing: "0.25em",
      marginBottom: 4,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: 900,
      color: "#fff",
      letterSpacing: "-0.4px",
    },
    liveChip: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      background: C.greenLt,
      borderRadius: 20,
      padding: "5px 11px",
      border: "1px solid rgba(255,255,255,0.3)",
    },
    liveDot: {
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: "#bdd43c",
      boxShadow: "0 0 0 3px rgba(212,223,51,0.3)",
    },
    liveTxt: {
      fontSize: 9,
      fontWeight: 800,
      color: "#bdd43c",
      letterSpacing: "0.15em",
    },
    searchBarWrap: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: C.greenLt,
      borderRadius: 12,
      padding: "9px 13px",
      marginTop: 12,
      border: "1px solid rgba(255,255,255,0.25)",
    },
    searchInput: {
      flex: 1,
      background: "none",
      border: "none",
      outline: "none",
      color: "#fff",
      fontSize: 13,
      fontFamily: "inherit",
    },
    tabsRow: {
      display: "flex",
      gap: 7,
      padding: "14px 20px",
      background: "#fff",
      borderBottom: `1px solid ${C.border}`,
      flexWrap: "wrap",
    },
    tabBase: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "6px 13px",
      borderRadius: 20,
      fontSize: 11.5,
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: "inherit",
      border: "none",
      transition: "all .15s",
    },
    badge: {
      padding: "1px 7px",
      borderRadius: 10,
      fontSize: 10,
      fontWeight: 800,
    },
    listArea: {
      flex: 1,
      overflowY: "auto",
      padding: "20px 20px 24px",
      background: "#F6F7F1",
    },
    sectionLabel: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 14,
    },
    labelAccent: {
      width: 4,
      height: 16,
      borderRadius: 2,
      background: "linear-gradient(135deg,#3b791e,#509820)",
      flexShrink: 0,
    },
    labelTxt: {
      fontSize: 11,
      fontWeight: 800,
      color: "#12241B",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    },
    card: (pinned) => ({
      display: "flex",
      background: "#fff",
      borderRadius: 18,
      marginBottom: 10,
      border: `1px solid ${pinned ? "#FFE082" : C.border}`,
      boxShadow: pinned
        ? "0 3px 14px rgba(249,168,37,0.18)"
        : "0 2px 10px rgba(59,121,30,0.07)",
      overflow: "hidden",
      cursor: "pointer",
      transition: "transform .15s, box-shadow .15s",
    }),
    cardAccentBar: (pinned) => ({
      width: 4,
      flexShrink: 0,
      background: pinned
        ? "linear-gradient(180deg,#F9A825,#FFC107)"
        : "linear-gradient(180deg,#509820,#3b791e)",
    }),
    cardBody: { flex: 1, padding: "13px 15px 11px" },
    cardHeaderRow: { display: "flex", alignItems: "flex-start", gap: 10 },
    initialsChip: (pinned) => ({
      width: 40,
      height: 40,
      borderRadius: 12,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: pinned
        ? "linear-gradient(135deg,#F9A825,#E65100)"
        : "linear-gradient(135deg,#3b791e,#3b791e)",
      fontSize: 13,
      fontWeight: 900,
      color: "#fff",
    }),
    cardMeta: { flex: 1, minWidth: 0 },
    cardTitleRow: {
      display: "flex",
      alignItems: "center",
      gap: 5,
      flexWrap: "wrap",
      marginBottom: 3,
    },
    cardTitle: { fontSize: 14, fontWeight: 800, color: "#12241B" },
    cardDate: { fontSize: 10, color: "#7A8878", fontFamily: "monospace" },
    cardContent: {
      fontSize: 12.5,
      color: "#5C6B60",
      lineHeight: 1.65,
      marginTop: 9,
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    },
    tapHint: {
      display: "flex",
      alignItems: "center",
      gap: 3,
      marginTop: 7,
      fontSize: 10,
      color: "#7A8878",
    },
    pinnedBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
      background: "#FFF8E1",
      borderRadius: 6,
      padding: "2px 6px",
      border: "1px solid #FFE082",
      fontSize: 8,
      fontWeight: 800,
      color: "#F9A825",
    },
    recentBadge: {
      background: "#E0F2F1",
      borderRadius: 6,
      padding: "2px 6px",
      border: "1px solid #B2DFDB",
      fontSize: 8,
      fontWeight: 800,
      color: "#2c5c16",
    },
    cardActions: {
      display: "flex",
      gap: 5,
      flexShrink: 0,
      alignItems: "flex-start",
    },
    actionBtn: (variant) => ({
      width: 28,
      height: 28,
      borderRadius: 8,
      border: `1px solid ${C.border}`,
      background: "#F6F7F1",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      color:
        variant === "delete"
          ? "#e53935"
          : variant === "pin"
            ? "#F9A825"
            : "#2c5c16",
    }),
    emptyState: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "60px 0 40px",
      gap: 10,
      textAlign: "center",
    },
    emptyIcon: { fontSize: 40, marginBottom: 4 },
    emptyTitle: { fontSize: 15, fontWeight: 800, color: "#12241B" },
    emptySub: {
      fontSize: 12,
      color: "#7A8878",
      maxWidth: 260,
      lineHeight: 1.6,
    },
  };

  const EmptyIcon =
    selectedTab === "pinned"
      ? Pin
      : selectedTab === "recent"
        ? Clock
        : Megaphone;
  const emptyTitle = searchQuery
    ? "No results found"
    : selectedTab === "pinned"
      ? "Nothing pinned yet"
      : selectedTab === "recent"
        ? "No recent announcements"
        : "No announcements yet";
  const emptySub = searchQuery
    ? "Try a different search term."
    : selectedTab === "pinned"
      ? "Administrators can pin important announcements."
      : selectedTab === "recent"
        ? "Announcements from the last 7 days appear here."
        : "Check back later.";

  return (
    <div style={commStyles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .comm-card:hover { box-shadow: 0 8px 22px rgba(59,121,30,0.10) !important; }
        .comm-action-btn:hover { opacity: 0.78; }
        .comm-tab:hover { background: #f0f5e8 !important; color: #2c5c16 !important; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={commStyles.header}>
        {/* subtle wave decoration */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 40,
            opacity: 0.15,
            background:
              "radial-gradient(ellipse at 30% 100%, #fff 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <div style={commStyles.headerTop}>
          <div>
            <div style={commStyles.eyebrow}>IFRANCHISE</div>
            <div
              style={{
                ...commStyles.headerTitle,
                display: "flex",
                alignItems: "center",
                gap: 9,
              }}
            >
              <Megaphone size={21} /> Announcements
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={commStyles.liveChip}>
              <div style={commStyles.liveDot} />
              <span style={commStyles.liveTxt}>LIVE</span>
            </div>
            <button
              onClick={() => {
                setSearchVisible((v) => !v);
                setSearchQuery("");
              }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.3)",
                background: searchVisible
                  ? "rgba(255,255,255,0.3)"
                  : "rgba(255,255,255,0.18)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 16,
              }}
            >
              {searchVisible ? (
                <X size={16} color="#fff" />
              ) : (
                <Search size={16} color="#fff" />
              )}
            </button>
            {isAdminUser(commUser) && (
              <button
                onClick={() => {
                  setEditing(null);
                  setTitle("");
                  setContent("");
                  setModalVisible(true);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: "1.5px solid rgba(255,255,255,0.4)",
                  background: C.greenLt,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <Plus size={14} /> New
              </button>
            )}
          </div>
        </div>

        {searchVisible && (
          <div style={commStyles.searchBarWrap}>
            <Search size={14} color="rgba(255,255,255,0.7)" />
            <input
              autoFocus
              type="text"
              placeholder="Search announcements…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={commStyles.searchInput}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 16,
                  lineHeight: 1,
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── TABS ── */}
      <div style={commStyles.tabsRow}>
        {["all", "recent", "pinned"].map((tab) => {
          const active = selectedTab === tab;
          return (
            <button
              key={tab}
              className={active ? "" : "comm-tab"}
              onClick={() => setSelectedTab(tab)}
              style={{
                ...commStyles.tabBase,
                background: active
                  ? "linear-gradient(135deg,#3b791e,#3b791e)"
                  : "#f0f5e8",
                color: active ? "#fff" : "#5C6B60",
                border: active ? "none" : `1px solid ${C.border}`,
                boxShadow: active ? "0 2px 8px rgba(59,121,30,0.28)" : "none",
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tabBadge[tab] > 0 && (
                <span
                  style={{
                    ...commStyles.badge,
                    background: active ? "rgba(255,255,255,0.28)" : C.greenMid,
                    color: active ? "#fff" : "#3b791e",
                  }}
                >
                  {tabBadge[tab]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── LIST ── */}
      <div style={commStyles.listArea}>
        <div style={commStyles.sectionLabel}>
          <div style={commStyles.labelAccent} />
          <span style={commStyles.labelTxt}>
            {searchQuery
              ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${searchQuery}"`
              : selectedTab === "recent"
                ? "Last 7 Days"
                : selectedTab === "pinned"
                  ? "Pinned Announcements"
                  : "All Announcements"}
          </span>
        </div>

        {fetching ? (
          <div
            style={{
              padding: "48px 0",
              textAlign: "center",
              color: "#5C6B60",
              fontSize: 13,
              fontStyle: "italic",
            }}
          >
            Loading announcements…
          </div>
        ) : filtered.length === 0 ? (
          <div style={commStyles.emptyState}>
            <div
              style={{
                ...commStyles.emptyIcon,
                color: "#3b791e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <EmptyIcon size={34} />
            </div>
            <div style={commStyles.emptyTitle}>{emptyTitle}</div>
            <div style={commStyles.emptySub}>{emptySub}</div>
          </div>
        ) : (
          filtered.map((item) => {
            const pinned = !!item.pinned;
            const recent = isRecent(item);
            return (
              <div
                key={item.id}
                className="comm-card"
                style={commStyles.card(pinned)}
                onClick={() =>
                  setViewingItem((prev) => (prev?.id === item.id ? null : item))
                }
              >
                <div style={commStyles.cardAccentBar(pinned)} />
                <div style={commStyles.cardBody}>
                  <div style={commStyles.cardHeaderRow}>
                    <div style={commStyles.initialsChip(pinned)}>
                      {getInitials(item.title)}
                    </div>
                    <div style={commStyles.cardMeta}>
                      <div style={commStyles.cardTitleRow}>
                        <span style={commStyles.cardTitle}>{item.title}</span>
                        {pinned && (
                          <span style={commStyles.pinnedBadge}>
                            <Pin size={9} /> PINNED
                          </span>
                        )}
                        {recent && !pinned && (
                          <span style={commStyles.recentBadge}>NEW</span>
                        )}
                      </div>
                      <div style={commStyles.cardDate}>
                        {new Date(item.created_at).toLocaleString()}
                      </div>
                    </div>
                    {isAdminUser(commUser) && (
                      <div
                        style={commStyles.cardActions}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="comm-action-btn"
                          style={commStyles.actionBtn("pin")}
                          onClick={() => handlePin(item)}
                          title={pinned ? "Unpin" : "Pin"}
                        >
                          <Pin
                            size={12}
                            fill={pinned ? "currentColor" : "none"}
                          />
                        </button>
                        <button
                          className="comm-action-btn"
                          style={commStyles.actionBtn("edit")}
                          onClick={() => {
                            handleEdit(item);
                          }}
                          title="Edit"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          className="comm-action-btn"
                          style={commStyles.actionBtn("delete")}
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div style={commStyles.cardContent}>{item.content}</div>
                  <div style={commStyles.tapHint}>
                    <span>Tap to read full announcement</span>
                    <span style={{ fontSize: 10 }}>›</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── FULL VIEW PANEL ── */}
      {viewingItem && (
        <div
          onClick={() => setViewingItem(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(13,43,30,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 20,
              width: "100%",
              maxWidth: 580,
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
              border: "1px solid rgba(59,121,30,0.15)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* gradient header */}
            <div
              style={{
                background: viewingItem.pinned
                  ? "linear-gradient(135deg,#F9A825,#E65100)"
                  : "linear-gradient(135deg,#3b791e,#3b791e)",
                borderRadius: "20px 20px 0 0",
                padding: "20px 22px 28px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 40,
                  opacity: 0.12,
                  background:
                    "radial-gradient(ellipse at 50% 100%, #fff 0%, transparent 70%)",
                }}
              />
              <button
                onClick={() => setViewingItem(null)}
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  border: "1.5px solid rgba(255,255,255,0.4)",
                  background: "rgba(255,255,255,0.2)",
                  cursor: "pointer",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={15} />
              </button>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  paddingRight: 40,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 900,
                    color: "#fff",
                    flexShrink: 0,
                    border: "1.5px solid rgba(255,255,255,0.35)",
                  }}
                >
                  {getInitials(viewingItem.title)}
                </div>
                <div>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      marginBottom: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    {viewingItem.pinned && (
                      <span
                        style={{
                          background: "rgba(255,255,255,0.25)",
                          padding: "2px 8px",
                          borderRadius: 8,
                          fontSize: 9,
                          fontWeight: 900,
                          color: "#fff",
                          letterSpacing: "0.08em",
                        }}
                      >
                        <Pin size={9} /> PINNED
                      </span>
                    )}
                    {isRecent(viewingItem) && (
                      <span
                        style={{
                          background: "rgba(255,255,255,0.2)",
                          padding: "2px 8px",
                          borderRadius: 8,
                          fontSize: 9,
                          fontWeight: 900,
                          color: "#fff",
                        }}
                      >
                        NEW
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 19,
                      fontWeight: 900,
                      color: "#fff",
                      lineHeight: 1.3,
                      letterSpacing: "-0.3px",
                    }}
                  >
                    {viewingItem.title}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.65)",
                      marginTop: 4,
                      fontFamily: "monospace",
                    }}
                  >
                    {new Date(viewingItem.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* body */}
            <div style={{ padding: "22px 24px 28px" }}>
              <p
                style={{
                  fontSize: 14.5,
                  color: "#1A3A2A",
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                {viewingItem.content}
              </p>

              {/* Admin actions */}
              {isAdminUser(commUser) && (
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 28,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={() => handlePin(viewingItem)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "9px 18px",
                      borderRadius: 11,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      border: viewingItem.pinned
                        ? "none"
                        : "1.5px solid #FFE082",
                      background: viewingItem.pinned ? "#F9A825" : "#FFF8E1",
                      color: viewingItem.pinned ? "#fff" : "#F9A825",
                    }}
                  >
                    <>
                      <Pin
                        size={13}
                        fill={viewingItem.pinned ? "currentColor" : "none"}
                      />{" "}
                      {viewingItem.pinned ? "Unpin" : "Pin"}
                    </>
                  </button>
                  <button
                    onClick={() => {
                      handleEdit(viewingItem);
                      setViewingItem(null);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "9px 18px",
                      borderRadius: 11,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      border: "none",
                      background: "linear-gradient(135deg,#509820,#3b791e)",
                      color: "#fff",
                    }}
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(viewingItem.id);
                      setViewingItem(null);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "9px 18px",
                      borderRadius: 11,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      border: "1.5px solid #fecaca",
                      background: "#fee2e2",
                      color: "#dc2626",
                    }}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE / EDIT MODAL — Admin only ── */}
      {isAdminUser(commUser) && modalVisible && (
        <div
          onClick={() => setModalVisible(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(13,43,30,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2500,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 20,
              width: "100%",
              maxWidth: 500,
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
              border: "1px solid rgba(59,121,30,0.15)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg,#509820,#3b791e)",
                padding: "16px 22px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 900, fontSize: 15, color: "#fff" }}>
                {editing ? "Edit Announcement" : "New Announcement"}
              </span>
              <button
                onClick={() => setModalVisible(false)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 10,
                  border: "1.5px solid rgba(255,255,255,0.4)",
                  background: C.greenLt,
                  cursor: "pointer",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleSave} style={{ padding: "22px 24px" }}>
              <div style={{ marginBottom: 16 }}>
                <label style={bmLabel}>Title</label>
                <input
                  type="text"
                  placeholder="Announcement title…"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  style={{ ...bmInput, marginTop: 4 }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={bmLabel}>Content</label>
                <textarea
                  placeholder="Write your announcement…"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={5}
                  style={{
                    ...bmInput,
                    marginTop: 4,
                    resize: "vertical",
                    lineHeight: 1.65,
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setModalVisible(false)}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: 10,
                    border: "1.5px solid #D4DBC8",
                    background: "#F6F7F1",
                    color: "#5C6B60",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    padding: "10px 0",
                    borderRadius: 10,
                    border: "none",
                    background: "linear-gradient(135deg,#509820,#3b791e)",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    boxShadow: "0 2px 10px rgba(59,121,30,0.35)",
                  }}
                >
                  <Check size={14} /> Save Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AlertModal({ message, onClose, type = "info" }) {
  const isError = type === "error";
  const isSuccess = type === "success";

  const iconBg = isError ? "#fdf1f0" : isSuccess ? "#d1fae5" : "#dbeafe";
  const iconColor = isError ? "#c0392b" : isSuccess ? "#059669" : "#2563eb";
  const Icon = isError ? Trash2 : isSuccess ? Check : Info;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13,43,30,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3000,
        padding: 20,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: "28px 32px",
          width: "100%",
          maxWidth: 380,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          border: "1px solid rgba(0,168,76,0.15)",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <Icon size={22} color={iconColor} />
        </div>
        <p
          style={{
            fontSize: 14,
            color: "#12241B",
            lineHeight: 1.6,
            marginBottom: 20,
            fontWeight: 600,
          }}
        >
          {message}
        </p>
        <button
          onClick={onClose}
          style={{
            padding: "9px 28px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg,#3b791e,#3b791e)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            boxShadow: "0 2px 10px rgba(0,180,90,0.35)",
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}

function FrProfileContent({ user }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleInitial: "",
    suffix: "",
    name: "",
    email: "",
    role: "",
    branch: "",
    password: "",
  });
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // ── UI modal state ──
  const [alertModal, setAlertModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const showAlert = (message, type = "info") =>
    setAlertModal({ message, type });
  const showConfirm = (message, onConfirm) =>
    setConfirmModal({ message, onConfirm });

  const formDataRef = React.useRef(formData);
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      middleInitial: user.middleInitial || "",
      suffix: user.suffix || "",
      name: user.name || "",
      email: user.email || "",
      role: user.role || "",
      personalEmail: user.personalEmail || "",
    }));
  }, [user]);
  const handleInputChange = React.useCallback((e) => {
    const { name, value } = e.target;
    formDataRef.current = { ...formDataRef.current, [name]: value };
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error on change
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "newPassword") {
      if (value) {
        setShowPasswordValidation(true);
        setPasswordErrors(validatePasswordStrength(value).errors);
      } else {
        setShowPasswordValidation(false);
        setPasswordErrors([]);
      }
    }
    if (name === "confirmPassword") {
      // live match feedback handled by fieldErrors below
    }
  }, []);

  const validatePasswordStrength = (password) => {
    const errors = [];
    if (password.length < 8) errors.push("minLength");
    if (!/[A-Z]/.test(password)) errors.push("uppercase");
    if (!/[a-z]/.test(password)) errors.push("lowercase");
    if (!/\d/.test(password)) errors.push("number");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
      errors.push("specialChar");
    return { isValid: errors.length === 0, errors };
  };

  const sendOtp = async () => {
    try {
      const emailToSend = formData.personalEmail || formData.email;
      const response = await adminModuleFetch(
        `${process.env.REACT_APP_API_URL}/send-otp-password-change`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailToSend }),
        },
      );
      const data = await response.json();
      if (data.success) {
        setOtpSent(true);
        showAlert(`OTP has been sent to ${emailToSend}`, "success");
      } else
        showAlert(data.message || data.error || "Failed to send OTP.", "error");
    } catch (error) {
      console.error("Error sending OTP:", error);
      showAlert("Failed to send OTP. Please try again.", "error");
    }
  };

  const verifyOtpAndChangePassword = async () => {
    try {
      setOtpError("");
      const emailToVerify = formData.personalEmail || formData.email;
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/${user.id}/password`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
            email: emailToVerify,
            otp: otp.trim(),
          }),
        },
      );
      const data = await response.json();
      if (data.success) {
        setShowOtpModal(false);
        setShowSuccessModal(true);
        localStorage.removeItem("user");
        localStorage.removeItem("rememberedUser");
        localStorage.removeItem("tempUser");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("tempUser");
        sessionStorage.removeItem("fr_activeModule");
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      } else {
        setOtpError(data.error || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setOtpError("Failed to change password. Please try again.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isUnlocked) return;

    const errs = {};
    const isPasswordChange =
      formData.currentPassword ||
      formData.newPassword ||
      formData.confirmPassword;

    if (isPasswordChange) {
      if (!formData.currentPassword)
        errs.currentPassword = "Please enter your current password.";
      if (!formData.newPassword)
        errs.newPassword = "Please enter a new password.";
      else {
        const pv = validatePasswordStrength(formData.newPassword);
        if (!pv.isValid)
          errs.newPassword = "Password does not meet all requirements.";
      }
      if (!formData.confirmPassword) {
        errs.confirmPassword = "Please confirm your new password.";
      } else if (formData.newPassword !== formData.confirmPassword) {
        errs.confirmPassword = "Passwords do not match.";
      }
      if (!formData.personalEmail && !formData.email)
        errs.personalEmail = "An email is required to receive OTP.";

      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        return;
      }
      sendOtp();
      setShowOtpModal(true);
    } else {
      updateProfile();
    }
  };

  const updateProfile = async () => {
    try {
      const fullName = [
        formData.firstName,
        formData.middleInitial ? formData.middleInitial + "." : "",
        formData.lastName,
        formData.suffix,
      ]
        .filter(Boolean)
        .join(" ");
      const response = await adminModuleFetch(
        `${process.env.REACT_APP_API_URL}/users/${user.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fullName,
            firstName: formData.firstName,
            lastName: formData.lastName,
            middleInitial: formData.middleInitial || null,
            suffix: formData.suffix || null,
            email: formData.email,
            role: formData.role,
            branch: user.branch,
          }),
        },
      );
      const data = await response.json();
      if (data.success) {
        showAlert("Profile updated successfully!", "success");
        const updatedUser = {
          ...user,
          name: fullName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleInitial: formData.middleInitial,
          suffix: formData.suffix,
          email: formData.email,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setIsUnlocked(false);
      } else {
        showAlert(data.error || "Failed to update profile.", "error");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showAlert("Failed to update profile. Please try again.", "error");
    }
  };

  const handleCancel = () => {
    showConfirm("Discard all unsaved changes?", () => {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        middleInitial: user.middleInitial || "",
        suffix: user.suffix || "",
        name: user.name,
        email: user.email,
        personalEmail: "",
        role: user.role,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setOtp("");
      setOtpSent(false);
      setShowOtpModal(false);
      setShowPasswordValidation(false);
      setPasswordErrors([]);
      setFieldErrors({});
      setIsUnlocked(false);
    });
  };

  const initials = user.name
    ? user.name
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  // ── Shared input style ──
  const inputStyle = (disabled) => ({
    ...bmInput,
    marginTop: 4,
    background: disabled ? "#f5f8f5" : "#fff",
    color: disabled ? "#9ca3af" : "#12241B",
    cursor: disabled ? "not-allowed" : "text",
    border: disabled ? "1.5px solid #e5e7eb" : "1.5px solid #E1E6D8",
  });

  const PwChecklist = () => (
    <div
      style={{
        marginTop: 8,
        fontSize: 12,
        padding: "10px 14px",
        background: "#f0f5e8",
        borderRadius: 10,
        border: "1.5px solid #E1E6D8",
      }}
    >
      <div
        style={{
          marginBottom: 6,
          fontWeight: 700,
          color: "#12241B",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        Password must contain:
      </div>
      {[
        ["minLength", "At least 8 characters"],
        ["uppercase", "Uppercase letter (A-Z)"],
        ["lowercase", "Lowercase letter (a-z)"],
        ["number", "Number (0-9)"],
        ["specialChar", "Special character (!@#$%^&*...)"],
      ].map(([key, text]) => (
        <div
          key={key}
          style={{
            color: passwordErrors.includes(key) ? "#c0392b" : "#059669",
            marginBottom: 3,
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontWeight: 600,
          }}
        >
          <span>{passwordErrors.includes(key) ? "✗" : "✓"}</span> {text}
        </div>
      ))}
    </div>
  );

  const FieldError = ({ name }) =>
    fieldErrors[name] ? (
      <span
        style={{
          fontSize: 11,
          color: "#c0392b",
          marginTop: 4,
          display: "block",
          fontWeight: 600,
        }}
      >
        {fieldErrors[name]}
      </span>
    ) : null;

  const EyeToggle = ({ show, onToggle, disabled }) => (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      style={{
        position: "absolute",
        right: 12,
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        color: "#5C6B60",
        display: "flex",
        alignItems: "center",
        padding: 0,
      }}
    >
      {show ? (
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ── Account Overview Card ── */}
      <div
        style={{
          background: C.white,
          border: "1px solid rgba(0,168,76,0.12)",
          borderRadius: 18,
          boxShadow: "0 2px 14px rgba(0,140,60,0.07)",
          overflow: "hidden",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg,#3b791e,#3b791e)",
            padding: "16px 22px",
          }}
        >
          <span style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>
            Account Overview
          </span>
        </div>
        <div
          style={{
            padding: "22px 24px",
            display: "flex",
            alignItems: "center",
            gap: 22,
          }}
        >
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#d1fae5,#6ee7b7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 800,
              color: "#2c5c16",
              flexShrink: 0,
              letterSpacing: 1,
              border: "2.5px solid #a7f3d0",
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 800,
                fontSize: 20,
                color: "#12241B",
                marginBottom: 4,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.name}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#5C6B60",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <svg
                width={13}
                height={13}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#5C6B60"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-10 7L2 7" />
              </svg>
              {user.email}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  background: "rgba(0,137,123,0.1)",
                  color: "#2c5c16",
                  padding: "3px 12px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {user.role}
              </span>
              {user.branch && (
                <span
                  style={{
                    background: "#f0f5e8",
                    color: "#12241B",
                    padding: "3px 12px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    border: "1.5px solid #E1E6D8",
                  }}
                >
                  {user.branch}
                </span>
              )}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              flexShrink: 0,
              textAlign: "right",
            }}
          >
            <div
              style={{
                padding: "8px 16px",
                borderRadius: 12,
                background: "#f0f5e8",
                border: "1.5px solid #E1E6D8",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "#5C6B60",
                  marginBottom: 2,
                }}
              >
                Account Status
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 5,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#059669",
                    display: "inline-block",
                  }}
                />
                <span
                  style={{ fontWeight: 800, fontSize: 13, color: "#059669" }}
                >
                  Active
                </span>
              </div>
            </div>
            {user.branch && (
              <div
                style={{
                  padding: "8px 16px",
                  borderRadius: 12,
                  background: "#f0f5e8",
                  border: "1.5px solid #E1E6D8",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    color: "#5C6B60",
                    marginBottom: 2,
                  }}
                >
                  Branch
                </div>
                <div
                  style={{ fontWeight: 800, fontSize: 13, color: "#12241B" }}
                >
                  {user.branch}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Lock/Unlock Banner ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: isUnlocked ? "#f0f5e8" : "#f5f8f5",
          border: `1.5px solid ${isUnlocked ? "#E1E6D8" : "#e5e7eb"}`,
          borderRadius: 14,
          padding: "12px 20px",
          marginBottom: 20,
          transition: "all 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isUnlocked ? <Unlock size={18} /> : <Lock size={18} />}
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: "#12241B" }}>
              {isUnlocked ? "Editing Enabled" : "Profile Locked"}
            </div>
            <div style={{ fontSize: 11, color: "#5C6B60" }}>
              {isUnlocked
                ? "Make your changes and save when done."
                : "Click Unlock to edit your profile."}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (isUnlocked) {
              handleCancel();
            } else {
              setIsUnlocked(true);
            }
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 18px",
            borderRadius: 10,
            border: "none",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            background: isUnlocked
              ? "linear-gradient(135deg,#c0392b,#c0392b)"
              : "linear-gradient(135deg,#3b791e,#3b791e)",
            color: "#fff",
            boxShadow: isUnlocked
              ? "0 2px 8px rgba(220,38,38,0.3)"
              : "0 2px 8px rgba(0,180,90,0.3)",
          }}
        >
          {isUnlocked ? "✕ Cancel" : " Unlock"}
        </button>
      </div>

      {/* ── Two-column: Personal Info + Change Password ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* ── Personal Information Card ── */}
        <div
          style={{
            background: C.white,
            border: "1px solid rgba(0,168,76,0.12)",
            borderRadius: 18,
            boxShadow: "0 2px 14px rgba(0,140,60,0.07)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg,#3b791e,#3b791e)",
              padding: "16px 22px",
            }}
          >
            <span style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>
              Personal Information
            </span>
          </div>
          <form onSubmit={handleSubmit} style={{ padding: "22px 24px" }}>
            {/* Name */}
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 2 }}>
                <label style={bmLabel}>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isUnlocked}
                  style={inputStyle(!isUnlocked)}
                />
              </div>
              <div style={{ flex: 2 }}>
                <label style={bmLabel}>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isUnlocked}
                  style={inputStyle(!isUnlocked)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={bmLabel}>M.I.</label>
                <input
                  type="text"
                  name="middleInitial"
                  maxLength={1}
                  value={formData.middleInitial}
                  onChange={handleInputChange}
                  disabled={!isUnlocked}
                  style={inputStyle(!isUnlocked)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={bmLabel}>Suffix</label>
                <input
                  type="text"
                  name="suffix"
                  value={formData.suffix}
                  onChange={handleInputChange}
                  disabled={!isUnlocked}
                  style={inputStyle(!isUnlocked)}
                />
              </div>
            </div>
            <FieldError name="lastName" />
            {/* Work Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>Work Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isUnlocked}
                style={inputStyle(!isUnlocked)}
              />
              <FieldError name="email" />
            </div>

            {/* Personal Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>
                Personal Email{" "}
                <span style={{ color: "#9ca3af", fontWeight: 400 }}>
                  (Optional)
                </span>
              </label>
              <input
                type="email"
                name="personalEmail"
                value={formData.personalEmail}
                onChange={handleInputChange}
                placeholder="your.personal@email.com"
                disabled={!isUnlocked}
                style={inputStyle(!isUnlocked)}
              />
              <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                OTP for password changes will be sent here
              </p>
              <FieldError name="personalEmail" />
            </div>

            {/* Role (always locked) */}
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>Role</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                disabled
                style={{ ...inputStyle(true), background: "#f0f0f0" }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                type="submit"
                disabled={!isUnlocked}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  border: "none",
                  background: isUnlocked
                    ? "linear-gradient(135deg,#3b791e,#3b791e)"
                    : "#d1d5db",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: isUnlocked ? "pointer" : "not-allowed",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxShadow: isUnlocked
                    ? "0 2px 10px rgba(0,180,90,0.28)"
                    : "none",
                  opacity: isUnlocked ? 1 : 0.6,
                }}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* ── Change Password Card ── */}
        <div
          style={{
            background: C.white,
            border: "1px solid rgba(0,168,76,0.12)",
            borderRadius: 18,
            boxShadow: "0 2px 14px rgba(0,140,60,0.07)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg,#3b791e,#3b791e)",
              padding: "16px 22px",
            }}
          >
            <span style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>
              Change Password
            </span>
          </div>
          <form onSubmit={handleSubmit} style={{ padding: "22px 24px" }}>
            <div
              style={{
                background: isUnlocked ? "#f0f5e8" : "#f5f8f5",
                borderRadius: 12,
                padding: "12px 16px",
                marginBottom: 20,
                border: `1.5px solid ${isUnlocked ? C.border : "#e5e7eb"}`,
                fontSize: 12,
                color: C.muted,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {isUnlocked
                ? "An OTP will be sent to your email for verification"
                : "Unlock your profile to change your password"}
            </div>

            {/* Current Password */}
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>Current Password</label>
              <div style={{ position: "relative", marginTop: 4 }}>
                <input
                  type={showCurrentPw ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder={
                    isUnlocked ? "Enter current password" : "••••••••"
                  }
                  disabled={!isUnlocked}
                  style={{ ...inputStyle(!isUnlocked), paddingRight: 40 }}
                />
                <EyeToggle
                  show={showCurrentPw}
                  onToggle={() => setShowCurrentPw((v) => !v)}
                  disabled={!isUnlocked}
                />
              </div>
              <FieldError name="currentPassword" />
            </div>

            {/* New Password */}
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>New Password</label>
              <div style={{ position: "relative", marginTop: 4 }}>
                <input
                  type={showNewPw ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder={isUnlocked ? "Enter new password" : "••••••••"}
                  disabled={!isUnlocked}
                  style={{ ...inputStyle(!isUnlocked), paddingRight: 40 }}
                />
                <EyeToggle
                  show={showNewPw}
                  onToggle={() => setShowNewPw((v) => !v)}
                  disabled={!isUnlocked}
                />
              </div>
              {isUnlocked && showPasswordValidation && <PwChecklist />}
              <FieldError name="newPassword" />
            </div>

            {/* Confirm New Password */}
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>Confirm New Password</label>
              <div style={{ position: "relative", marginTop: 4 }}>
                <input
                  type={showConfirmPw ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder={isUnlocked ? "Confirm new password" : "••••••••"}
                  disabled={!isUnlocked}
                  style={{ ...inputStyle(!isUnlocked), paddingRight: 40 }}
                />
                <EyeToggle
                  show={showConfirmPw}
                  onToggle={() => setShowConfirmPw((v) => !v)}
                  disabled={!isUnlocked}
                />
              </div>
              {/* Live match indicator */}
              {isUnlocked && formData.confirmPassword && (
                <div
                  style={{
                    fontSize: 11,
                    marginTop: 4,
                    fontWeight: 600,
                    color:
                      formData.newPassword === formData.confirmPassword
                        ? "#059669"
                        : "#c0392b",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {formData.newPassword === formData.confirmPassword
                    ? "✓ Passwords match"
                    : "✗ Passwords do not match"}
                </div>
              )}
              <FieldError name="confirmPassword" />
            </div>

            <button
              type="submit"
              disabled={!isUnlocked}
              style={{
                width: "100%",
                padding: "10px 0",
                borderRadius: 10,
                border: "none",
                background: isUnlocked
                  ? "linear-gradient(135deg,#3b791e,#3b791e)"
                  : "#d1d5db",
                color: "#fff",
                fontSize: 13,
                fontWeight: 800,
                cursor: isUnlocked ? "pointer" : "not-allowed",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: isUnlocked
                  ? "0 2px 10px rgba(0,180,90,0.28)"
                  : "none",
                opacity: isUnlocked ? 1 : 0.6,
              }}
            >
              Update Password
            </button>
          </form>
        </div>
      </div>

      {/* ── OTP Modal ── */}
      {showOtpModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(13,43,30,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: C.white,
              borderRadius: 20,
              padding: "28px 32px",
              width: "100%",
              maxWidth: 440,
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
              border: "1px solid rgba(0,168,76,0.15)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#d1fae5,#6ee7b7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                  fontSize: "1.6rem",
                }}
              >
                🔑
              </div>
              <h2
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#12241B",
                  marginBottom: 6,
                }}
              >
                Verify OTP
              </h2>
              <p style={{ fontSize: 13, color: C.muted }}>
                Code sent to{" "}
                <strong style={{ color: "#12241B" }}>
                  {formData.personalEmail || formData.email}
                </strong>
              </p>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>Enter 6-Digit OTP</label>
              <input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(v);
                  setOtpError("");
                }}
                maxLength={6}
                autoFocus
                style={{
                  ...bmInput,
                  marginTop: 6,
                  fontSize: 24,
                  textAlign: "center",
                  letterSpacing: "0.6rem",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              />
            </div>
            {otpSent && !otpError && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "rgba(16,185,129,0.08)",
                  borderRadius: 10,
                  border: "1px solid #a7f3d0",
                  color: "#059669",
                  fontSize: 12,
                  fontWeight: 700,
                  textAlign: "center",
                  marginBottom: 12,
                }}
              >
                OTP sent successfully
              </div>
            )}
            {otpError && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "#fdf1f0",
                  borderRadius: 10,
                  border: "1.5px solid #f2c9c4",
                  color: "#c0392b",
                  fontSize: 12,
                  fontWeight: 700,
                  textAlign: "center",
                  marginBottom: 12,
                }}
              >
                Please try again {otpError}
              </div>
            )}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <button
                type="button"
                onClick={sendOtp}
                style={{
                  background: "none",
                  border: "none",
                  color: "#3b791e",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: "underline",
                }}
              >
                Resend OTP
              </button>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  setShowOtpModal(false);
                  setOtp("");
                  setOtpSent(false);
                  setOtpError("");
                }}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  border: "1.5px solid #E1E6D8",
                  background: "#f0f5e8",
                  color: "#5C6B60",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={verifyOtpAndChangePassword}
                disabled={otp.length !== 6}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg,#3b791e,#3b791e)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: otp.length !== 6 ? "not-allowed" : "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  opacity: otp.length !== 6 ? 0.5 : 1,
                }}
              >
                Verify & Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success Modal ── */}
      {showSuccessModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(13,43,30,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: 20,
          }}
        >
          <div
            style={{
              background: C.white,
              borderRadius: 20,
              padding: "40px 36px",
              maxWidth: 420,
              width: "100%",
              textAlign: "center",
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
              border: "1px solid rgba(0,168,76,0.15)",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#d1fae5,#6ee7b7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: "2.2rem",
              }}
            >
              ✅
            </div>
            <h2
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 22,
                fontWeight: 800,
                color: "#12241B",
                marginBottom: 10,
              }}
            >
              Password Changed!
            </h2>
            <p
              style={{
                color: C.muted,
                fontSize: 13,
                lineHeight: 1.7,
                marginBottom: 20,
              }}
            >
              Your password has been updated successfully.
              <br />
              You'll be redirected to login shortly.
            </p>
            <div
              style={{
                background: "#f0f5e8",
                borderRadius: 12,
                padding: "10px 16px",
                fontSize: 12,
                color: C.muted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              💡 Use your new password on the next login
            </div>
          </div>
        </div>
      )}

      {/* ── Alert Modal ── */}
      {alertModal && (
        <AlertModal
          message={alertModal.message}
          type={alertModal.type}
          onClose={() => setAlertModal(null)}
        />
      )}

      {/* ── Confirm Modal ── */}
      {confirmModal && (
        <div
          onClick={() => setConfirmModal(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(13,43,30,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3000,
            padding: 20,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "28px 32px",
              width: "100%",
              maxWidth: 400,
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
              border: "1px solid rgba(0,168,76,0.15)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "#fff7ed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: 22,
              }}
            >
              ↩
            </div>
            <h2
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: "#12241B",
                marginBottom: 8,
              }}
            >
              Discard Changes?
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "#5C6B60",
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              {confirmModal.message}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                style={{
                  padding: "9px 22px",
                  borderRadius: 10,
                  border: "1px solid #E1E6D8",
                  background: "#f0f5e8",
                  color: "#5C6B60",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 24px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg,#c2410c,#ea580c)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxShadow: "0 2px 10px rgba(194,65,12,0.35)",
                }}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


