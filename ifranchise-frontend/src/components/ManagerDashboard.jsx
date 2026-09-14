//replace and paste here
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
import logoIfranchise from "../assets/report/ifranchise-logo.png";
import logoSync from "../assets/report/franchsync-logo.png";
import StockInventoryContent from "./StockInventoryContent";
import MenuInventoryContent from "./MenuInventoryContent";
import {
  Bell,
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
  Building2,
  Store,
  TrendingDown,
  TrendingUp,
  Layers,
  GitBranch,
  EyeOff,
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
  Brain,
  PieChart,
  LineChart,
  Sparkles,
  Shield,
  Send,
  Save,
  Receipt,
  Printer,
  Banknote,
  QrCode,
  CreditCard,
  AlertCircle,
  LoaderCircle,
  UploadCloud,
  ArrowLeft,
  ArrowRight,
  Truck,
  Filter,
  ChevronUp,
  Tag,
  Link2,
  PackageCheck,
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
  :root {
    --g1:#bdd43c; --g2:#3b791e; --g3:#2c5c16; --g4:#12241B;
    --green-primary:#3b791e; --green-dark:#2c5c16; --green-light:#509820;
    --green-accent:#bdd43c; --green-bg:#f0f5e8; --white:#ffffff;
    --off-white:#F6F7F1; --gray-100:#F3F4F1; --gray-200:#E1E6D8;
    --gray-300:#D4DBC8; --gray-400:#9CA89C; --gray-500:#6B7A65;
    --gray-600:#4B5A45; --gray-700:#374132; --gray-800:#1F2A1B;
    --text-dark:#12241B; --text-gray:#5C6B60;
    --shadow:rgba(50,109,32,0.10); --shadow-strong:rgba(14,59,34,0.20);
    --blue:#3B82F6; --red:#EF4444; --orange:#F59E0B; --success:#10B981;
    --card-border:#E1E6D8;
    --grad-main:linear-gradient(135deg,#509820,#3b791e);
    --grad-dark:linear-gradient(135deg,#12241B,#2c5c16);
    --grad-gold:linear-gradient(135deg,#e9cd30,#bdd43c);
    --grad-bg:#F6F7F1;
    --grad-blue:linear-gradient(135deg,#3b82f6,#1d4ed8);
    --grad-orange:linear-gradient(135deg,#f59e0b,#d97706);
    --grad-red:linear-gradient(135deg,#ef4444,#dc2626);
    --grad-purple:linear-gradient(135deg,#8b5cf6,#7c3aed);
  }
  .v-card {
    background:#fff; border:1px solid var(--card-border);
    border-radius:16px; box-shadow:0 8px 24px rgba(50,109,32,0.06);
    transition:transform .2s,box-shadow .2s; overflow:hidden;
  }
  .v-card:hover { transform:translateY(-3px); box-shadow:0 10px 32px rgba(50,109,32,0.14); }
  .v-kpi {
    background:#fff; border:1px solid var(--card-border);
    border-radius:16px; padding:22px 24px;
    box-shadow:0 8px 24px rgba(50,109,32,0.06);
    transition:transform .2s,box-shadow .2s;
    position:relative; overflow:hidden;
  }
  .v-kpi::before {
    content:''; position:absolute; top:-30px; right:-30px;
    width:100px; height:100px; border-radius:50%;
    background:linear-gradient(135deg,rgba(80,152,32,0.08),rgba(59,121,30,0.06));
    pointer-events:none;
  }
  .v-kpi:hover { transform:translateY(-4px); box-shadow:0 12px 36px rgba(50,109,32,0.15); }
  .v-kpi-label { font-size:10.5px; font-weight:800; text-transform:uppercase; letter-spacing:.09em; color:#5C6B60; margin-bottom:8px; font-family:'Plus Jakarta Sans',sans-serif; }
  .v-kpi-value { font-family:'Plus Jakarta Sans',sans-serif; font-size:26px; font-weight:800; color:#12241B; }
  .v-kpi-sub { font-size:11px; font-weight:600; color:#9CA89C; margin-top:4px; font-family:'Plus Jakarta Sans',sans-serif; }
  .v-kpi-icon { width:44px; height:44px; border-radius:14px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .v-kpi-icon.green { background:rgba(80,152,32,0.1); color:#3b791e; }
  .v-kpi-icon.blue  { background:rgba(59,130,246,0.1); color:#3b82f6; }
  .v-kpi-icon.orange{ background:rgba(245,158,11,0.1); color:#f59e0b; }
  .v-kpi-icon.red   { background:rgba(239,68,68,0.1); color:#ef4444; }
  .v-kpi-icon.purple{ background:rgba(139,92,246,0.1); color:#8b5cf6; }
  .v-section-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-bottom:16px; border-bottom:2px solid rgba(59,121,30,0.1); }
  .v-section-title { font-family:'Plus Jakarta Sans',sans-serif; font-size:1.3rem; font-weight:800; color:#12241B; display:flex; align-items:center; gap:10px; }
  .v-section-title-accent { width:6px; height:24px; border-radius:3px; background:var(--grad-main); }
  .v-btn { padding:9px 20px; border-radius:999px; border:none; font-weight:700; cursor:pointer; transition:all .2s; font-family:'Plus Jakarta Sans',sans-serif; font-size:13px; display:inline-flex; align-items:center; gap:7px; letter-spacing:.02em; }
  .v-btn-primary { background:var(--grad-main); color:#fff; box-shadow:0 4px 14px rgba(59,121,30,.3); }
  .v-btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(59,121,30,.4); }
  .v-btn-secondary { background:var(--gray-100); color:var(--gray-700); border:1px solid var(--gray-200); }
  .v-btn-secondary:hover { background:var(--gray-200); }
  .v-btn-danger { background:var(--grad-red); color:#fff; box-shadow:0 4px 14px rgba(239,68,68,.25); }
  .v-btn-danger:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(239,68,68,.35); }
  .v-btn-ghost { background:transparent; color:#3b791e; border:1.5px solid rgba(59,121,30,0.3); }
  .v-btn-ghost:hover { background:rgba(59,121,30,0.08); }
  .v-btn-blue { background:var(--grad-blue); color:#fff; box-shadow:0 4px 14px rgba(59,130,246,.3); }
  .v-btn-blue:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(59,130,246,.4); }
  .v-btn-sm { padding:6px 14px; font-size:12px; border-radius:9px; }
  .v-badge { padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; display:inline-flex; align-items:center; gap:4px; font-family:'Plus Jakarta Sans',sans-serif; }
  .v-badge::before { content:''; width:6px; height:6px; border-radius:50%; background:currentColor; opacity:.7; }
  .v-badge-green { background:rgba(80,152,32,0.12); color:#3b791e; }
  .v-badge-orange { background:rgba(245,158,11,0.12); color:#d97706; }
  .v-badge-red { background:rgba(239,68,68,0.12); color:#dc2626; }
  .v-badge-blue { background:rgba(59,130,246,0.12); color:#2563eb; }
  .v-badge-purple { background:rgba(139,92,246,0.12); color:#7c3aed; }
  .v-table { width:100%; border-collapse:collapse; }
  .v-table th { text-align:left; padding:12px 16px; font-family:'Plus Jakarta Sans',sans-serif; font-size:10.5px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; color:#5C6B60; background:rgba(59,121,30,0.05); border-bottom:2px solid rgba(59,121,30,0.1); }
  .v-table th:first-child { border-radius:12px 0 0 0; }
  .v-table th:last-child { border-radius:0 12px 0 0; }
  .v-table td { padding:14px 16px; border-bottom:1px solid rgba(59,121,30,0.07); color:#374151; font-size:13.5px; transition:background .15s; font-family:'Plus Jakarta Sans',sans-serif; }
  .v-table tr:hover td { background:rgba(80,152,32,0.03); }
  .v-table tr:last-child td { border-bottom:none; }
  .v-search-wrap { position:relative; }
  .v-search-wrap svg { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:#9CA89C; pointer-events:none; }
  .v-search { width:100%; padding:10px 14px 10px 38px; border:2px solid rgba(59,121,30,0.15); border-radius:12px; font-family:'Plus Jakarta Sans',sans-serif; font-size:13px; color:#12241B; background:#fafffc; transition:all .2s; outline:none; }
  .v-search::placeholder { color:#9CA89C; }
  .v-search:focus { border-color:#3b791e; box-shadow:0 0 0 3px rgba(59,121,30,0.1); background:#fff; }
  .v-form-group { margin-bottom:18px; }
  .v-form-label { display:block; font-weight:700; font-size:11.5px; text-transform:uppercase; letter-spacing:.07em; color:#5C6B60; margin-bottom:7px; font-family:'Plus Jakarta Sans',sans-serif; }
  .v-form-input, .v-form-select { width:100%; padding:11px 14px; border:2px solid rgba(59,121,30,0.15); border-radius:12px; font-family:'Plus Jakarta Sans',sans-serif; font-size:14px; color:#12241B; background:#fafffc; outline:none; transition:all .2s; }
  .v-form-input:focus, .v-form-select:focus { border-color:#3b791e; box-shadow:0 0 0 3px rgba(59,121,30,0.1); background:#fff; }
  .v-form-input:disabled { background:var(--gray-100); color:var(--gray-500); cursor:not-allowed; }
  .v-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.55); display:flex; align-items:center; justify-content:center; z-index:2000; animation:vFadeIn .2s ease; backdrop-filter:blur(4px); }
  .v-modal { background:#fff; padding:2rem; border-radius:22px; max-width:500px; width:90%; max-height:90vh; overflow-y:auto; box-shadow:0 24px 80px rgba(0,0,0,0.25); animation:vSlideUp .25s ease; border:1px solid rgba(59,121,30,0.15); }
  .v-modal-title { font-family:'Plus Jakarta Sans',sans-serif; font-size:1.4rem; font-weight:800; color:#12241B; margin-bottom:6px; }
  .v-tabs { display:flex; gap:3px; background:#F6F7F1; border:1px solid #E1E6D8; border-radius:999px; padding:4px; width:fit-content; margin-bottom:22px; }
  .v-tab { padding:8px 20px; border-radius:999px; border:none; font-size:13px; font-weight:700; cursor:pointer; transition:all .15s; font-family:'Plus Jakarta Sans',sans-serif; color:#5C6B60; background:transparent; }
  .v-tab.active { background:var(--grad-main); color:#fff; box-shadow:0 3px 10px rgba(59,121,30,.3); }
  .v-tab:hover:not(.active) { background:rgba(59,121,30,0.1); color:#12241B; }
  .v-stat-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; margin-bottom:22px; }
  .v-empty { text-align:center; padding:60px 20px; color:#9CA89C; }
  .v-empty-icon { font-size:3.5rem; margin-bottom:16px; }
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

const fmtDate = () =>
  new Date().toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const fmtTime = () =>
  new Date().toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

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

const generateReceiptNo = () => "OR-" + Date.now().toString().slice(-8);
const generateTxnId = () =>
  "TXN-" + Math.random().toString(36).toUpperCase().slice(2, 10);

const VAT_RATE = 0.12;

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
    : React.createElement(icon || Info, { size: 34, strokeWidth: 1.8 });
  return (
    <div className="v-empty">
      <div
        className="v-empty-icon"
        style={{ display: "flex", justifyContent: "center", color: "#3b791e" }}
      >
        {renderedIcon}
      </div>
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
        {errors.includes(k) ? <X size={14} /> : <Check size={14} />} {t}
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
      background:
        "linear-gradient(135deg,rgba(59,130,246,0.07),rgba(29,78,216,0.04))",
      border: "1.5px solid rgba(59,130,246,0.15)",
      fontSize: 12,
      fontWeight: 600,
      color: "#2563eb",
      fontFamily: "Plus Jakarta Sans,sans-serif",
    }}
  >
    <Lock size={14} color="#3b82f6" />
    {message}
  </div>
);

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState(() => {
    const savedModule = sessionStorage.getItem("fr_activeModule");
    return savedModule || "dashboard";
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [brands, setBrands] = useState([]);

  const getUserFromStorage = () => {
    const userString =
      localStorage.getItem("user") ||
      localStorage.getItem("rememberedUser") ||
      sessionStorage.getItem("user");

    if (userString) return JSON.parse(userString);
    return null;
  };
  const [user, setUser] = useState(getUserFromStorage);
  const [managerNotifications, setManagerNotifications] = useState(null);
  const [managerNotifLoading, setManagerNotifLoading] = useState(false);
  const [managerNotifError, setManagerNotifError] = useState("");
  const managerNotifRefresh = useRef(() => {});

  useEffect(() => {
    let disposed = false;
    let pending = false;
    const controller = new AbortController();
    setManagerNotifications(null);
    setManagerNotifError("");
    const brand = String(
      user?.brand || user?.brand_name || user?.brandName || "",
    ).trim();
    const branch = String(user?.branch || "").trim();
    const normalize = (value) =>
      String(value || "")
        .trim()
        .toLowerCase();
    const refresh = async () => {
      if (disposed || pending || !user?.id || !brand || !branch) return;
      pending = true;
      setManagerNotifLoading(true);
      try {
        const params = new URLSearchParams({ brand, branch });
        const options = { credentials: "include", signal: controller.signal };
        const [stockResponse, notificationResponse] = await Promise.all([
          fetch(
            `${process.env.REACT_APP_API_URL}/ingredients?${params}`,
            options,
          ),
          fetch(
            `${process.env.REACT_APP_API_URL}/notifications?${new URLSearchParams({ userId: String(user.id) })}`,
            options,
          ),
        ]);
        if (!stockResponse.ok || !notificationResponse.ok)
          throw new Error("Notification request failed");
        const [stock, recorded] = await Promise.all([
          stockResponse.json(),
          notificationResponse.json(),
        ]);
        if (!Array.isArray(stock) || !Array.isArray(recorded))
          throw new Error("Unexpected notification response");
        const low = stock.filter(
          (item) =>
            normalize(item.brand) === normalize(brand) &&
            normalize(item.branch) === normalize(branch) &&
            item.stock !== null &&
            item.stock !== undefined &&
            item.min_stock !== null &&
            item.min_stock !== undefined &&
            Number.isFinite(Number(item.stock)) &&
            Number.isFinite(Number(item.min_stock)) &&
            Number(item.min_stock) > 0 &&
            Number(item.stock) <= Number(item.min_stock),
        );
        const items = low.length
          ? [
              {
                id: "manager-low-stock",
                module: "stockInventory",
                title: `${brand} — Low Stock`,
                message: `${branch}: ${low
                  .slice(0, 3)
                  .map((item) => item.name)
                  .join(
                    ", ",
                  )}${low.length > 3 ? ` and ${low.length - 3} more` : ""}. Open Stock Inventory to review quantities.`,
                count: low.length,
                icon: AlertTriangle,
                bg: "#fff7ed",
                color: "#3b791e",
                border: "#c9dba0",
              },
            ]
          : [];
        recorded
          .filter(
            (n) =>
              String(n.user_id) === String(user.id) &&
              !n.is_read &&
              n.type !== "low_stock" &&
              (!n.brand || normalize(n.brand) === normalize(brand)) &&
              (!n.branch || normalize(n.branch) === normalize(branch)),
          )
          .forEach((n) =>
            items.push({
              id: `manager-record-${n.id}`,
              recordId: n.id,
              title: n.title || "Branch notification",
              message: n.body || "",
              count: 1,
              module:
                n.type === "announcement"
                  ? "communication"
                  : String(n.type || "").includes("report")
                    ? "reports"
                    : "dashboard",
              icon: Bell,
              bg: "#f0f5e8",
              color: "#3b791e",
              border: "#c9dba0",
            }),
          );
        if (!disposed) {
          setManagerNotifications(items);
          setManagerNotifError("");
        }
      } catch (error) {
        if (!disposed && error.name !== "AbortError")
          setManagerNotifError(
            "Unable to refresh notifications. Retry using the bell refresh button.",
          );
      } finally {
        pending = false;
        if (!disposed) setManagerNotifLoading(false);
      }
    };
    managerNotifRefresh.current = refresh;
    refresh();
    const timer = setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    return () => {
      disposed = true;
      controller.abort();
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [user?.id, user?.brand, user?.brand_name, user?.brandName, user?.branch]);

  const scopedBrands = useMemo(() => {
    const accountBrand = String(
      user?.brand || user?.brand_name || user?.brandName || "",
    )
      .trim()
      .toLowerCase();
    if (accountBrand)
      return brands.filter(
        (b) =>
          String(b.name || "")
            .trim()
            .toLowerCase() === accountBrand,
      );
    const accountBranch = String(user?.branch || "")
      .trim()
      .toLowerCase();
    if (!accountBranch) return [];
    return brands.filter((b) =>
      (b.branches || []).some(
        (br) =>
          String(typeof br === "string" ? br : br?.name || "")
            .trim()
            .toLowerCase() === accountBranch,
      ),
    );
  }, [brands, user]);

  useEffect(() => {
    sessionStorage.setItem("fr_activeModule", activeModule);
  }, [activeModule]);

  useEffect(() => {
    const currentUser = getUserFromStorage();
    if (!currentUser) navigate("/admin-login");
    else setUser(currentUser);
  }, []);

  useEffect(() => {
    const branch = String(user?.branch || "").trim();
    const brand = String(
      user?.brand || user?.brand_name || user?.brandName || "",
    ).trim();
    if (!branch) {
      setTransactions([]);
      return;
    }
    const params = new URLSearchParams({ branch });
    if (brand) params.set("brand", brand);
    fetch(`${process.env.REACT_APP_API_URL}/transactions?${params}`, {
      credentials: "include",
    })
      .then((r) =>
        r.ok
          ? r.json()
          : Promise.reject(new Error("Transaction request failed")),
      )
      .then((d) =>
        setTransactions(Array.isArray(d) ? d : d?.transactions || []),
      )
      .catch(() => setTransactions([]));
  }, [user]);

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
      window.location.href = "/admin-login";
    }
  };
  const navigation = [
    { id: "dashboard", label: "Dashboard", icon: <Home size={20} /> },
    {
      id: "stockInventory",
      label: "Stock Inventory",
      icon: <Layers size={20} />,
    },
    {
      id: "menuInventory",
      label: "Product Catalogue",
      icon: <Box size={20} />,
    },
    // { id: 'receipts',       label: 'Liquidation',     icon: <FileText size={20} /> },
    { id: "reports", label: "Sales & Reports", icon: <BarChart2 size={20} /> },
    {
      id: "communication",
      label: "Announcement",
      icon: <MessageCircle size={20} />,
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
    <div className="franchisee-root manager-dashboard-root">
      <style>
        {VIBE_CSS}
        {`
        .franchisee-root {
          font-family:'Plus Jakarta Sans',sans-serif; display:flex; min-height:100vh;
          background:#F6F7F1;
          background-image:radial-gradient(#E1E6D8 1px,transparent 1px);
          background-size:22px 22px;
        }
        .manager-dashboard-root,
        .manager-dashboard-root * {
          font-family:'Plus Jakarta Sans',sans-serif !important;
        }
        .fr-sidebar {
          width:${sidebarCollapsed ? "76px" : "272px"};
          background:#fff; box-shadow:1px 0 0 #E1E6D8;
          position:fixed; left:0; top:0; height:100vh;
          transition:width 0.3s ease; z-index:1000; overflow-y:auto; overflow-x:hidden;
          display:flex; flex-direction:column; padding:18px 14px;
        }
        .fr-sidebar-header {
          padding:4px 6px 18px; display:flex; align-items:center;
          justify-content:space-between; min-height:60px;
        }
        .fr-logo-mark {
          width:38px; height:38px; border-radius:10px; background:#12241B;
          display:flex; align-items:center; justify-content:center; color:#bdd43c;
          font-weight:800; font-size:15px; flex-shrink:0;
        }
        .fr-brand { font-weight:800; font-size:16px; color:#12241B; white-space:nowrap; }
        .fr-toggle { background:none; border:1px solid #E1E6D8; cursor:pointer; width:28px; height:28px; color:#5C6B60; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .fr-toggle:hover { color:#2c5c16; background:#F6F7F1; }
        .fr-nav { display:flex; flex-direction:column; gap:2px; }
        .fr-nav-section { font-size:10.5px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; color:#9CA89C; padding:12px 10px 6px; display:${sidebarCollapsed ? "none" : "block"}; }
        .fr-nav-item {
          display:flex; align-items:center; gap:12px; padding:10px 12px;
          color:#5C6B60; cursor:pointer; transition:background .15s ease,color .15s ease;
          border-radius:12px; position:relative; font-weight:500; font-size:14px;
        }
        .fr-nav-item:hover { background:#F6F7F1; color:#12241B; }
        .fr-nav-item.active { background:#F6F7F1; color:#2c5c16; box-shadow:none; font-weight:700; }
        .fr-nav-item.active .fr-nav-icon { color:#3b791e; }
        .fr-nav-item.logout { color:#c0392b; }
        .fr-nav-item.logout:hover { background:#fdf1f0; }
        .fr-nav-icon { flex-shrink:0; display:flex; align-items:center; justify-content:center; width:22px; height:22px; }
        .fr-nav-label { display:${sidebarCollapsed ? "none" : "block"}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .fr-nav-bar { position:absolute; right:6px; top:20%; height:60%; width:3px; border-radius:2px; background:#bdd43c; }
        .fr-main { flex:1; min-width:0; margin-left:${sidebarCollapsed ? "76px" : "272px"}; transition:margin-left 0.3s ease; }
        .fr-topbar {
          width:100%; background:#fff; padding:16px 30px; box-shadow:none;
          display:flex; justify-content:space-between; align-items:center;
          position:sticky; top:0; z-index:100; border-bottom:1px solid #E1E6D8;
        }
        .fr-topbar-title { font-size:22px; font-weight:800; color:#12241B; }
        .fr-user-name { font-weight:700; color:#12241B; font-size:13px; }
        .fr-user-role { font-size:11.5px; color:#5C6B60; }
        .fr-avatar {
          width:38px; height:38px; border-radius:12px; background:#12241B;
          display:flex; align-items:center; justify-content:center;
          font-size:14px; font-weight:700; color:#bdd43c;
        }
        .fr-content { width:100%; max-width:1400px; margin:0 auto; padding:20px 30px 40px; }
        .manager-dashboard-root button,.manager-dashboard-root input,.manager-dashboard-root select,.manager-dashboard-root textarea { font-family:'Plus Jakarta Sans',sans-serif; }
        @media(max-width:768px){
          .fr-sidebar{width:${sidebarCollapsed ? "0" : "272px"};transform:translateX(${sidebarCollapsed ? "-100%" : "0"});}
          .fr-main{margin-left:0;}
          .fr-topbar,.fr-content{padding:1rem;}
        }
      `}
      </style>

      {/* Sidebar */}
      <aside className="fr-sidebar">
        <div className="fr-sidebar-header">
          {!sidebarCollapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src={logoSync}
                alt="FranchiSync"
                style={{ height: 50, width: "auto", objectFit: "contain" }}
              />
            </div>
          )}
          {sidebarCollapsed && (
            <img
              src={logoIfranchise}
              alt="iFranchise"
              style={{
                height: 35,
                width: "auto",
                objectFit: "contain",
                margin: "10px auto",
                display: "block",
              }}
            />
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
            <div title={managerNotifError || "Branch notifications"}>
              <NotificationBell
                key={`${user?.id}:${user?.brand || user?.brand_name || user?.brandName}:${user?.branch}`}
                notifications={managerNotifications}
                loading={managerNotifLoading}
                onRefresh={() => managerNotifRefresh.current()}
                onNavigate={(notification) => {
                  setActiveModule(notification.module);
                  if (notification.recordId != null) {
                    fetch(
                      `${process.env.REACT_APP_API_URL}/notifications/${encodeURIComponent(notification.recordId)}/read`,
                      {
                        method: "PATCH",
                        credentials: "include",
                      },
                    )
                      .then((response) => {
                        if (!response.ok)
                          throw new Error("Unable to mark notification read");
                      })
                      .catch(() =>
                        setManagerNotifError(
                          "Read status could not be saved. Please refresh notifications.",
                        ),
                      );
                  }
                }}
              />
              {managerNotifError && (
                <span
                  role="status"
                  style={{
                    display: "block",
                    maxWidth: 180,
                    fontSize: 10,
                    color: "#b45309",
                  }}
                >
                  {managerNotifError}
                </span>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="fr-user-name">{user?.name}</div>
              <div className="fr-user-role">Manager — {user?.branch}</div>
            </div>
            <div className="fr-avatar">{(user?.name || "F")[0]}</div>
          </div>
        </div>

        <div className="fr-content">
          {activeModule === "dashboard" && (
            <BranchDecisionDashboard
              transactions={transactions}
              brands={scopedBrands}
              user={user}
            />
          )}

          {activeModule === "menuInventory" && (
            <MenuInventoryContent user={user} brands={scopedBrands} />
          )}

          {activeModule === "stockInventory" && (
            <StockInventoryContent user={user} brands={scopedBrands} />
          )}

          {activeModule === "receipts" && <Receipts />}

          {activeModule === "reports" && (
            <MaReportsContent user={user} transactions={transactions} />
          )}

          {activeModule === "communication" && <FrCommunicationContent />}

          {activeModule === "profile" && <ProfileContent user={user} />}
        </div>
      </main>

      {/* Logout modal */}
      {showLogoutModal && (
        <div
          className="v-modal-overlay"
          style={{ zIndex: 3000 }}
          onClick={() => setShowLogoutModal(false)}
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
                color: "#dc2626",
                border: "1.5px solid rgba(239,68,68,0.15)",
              }}
            >
              <LogOut size={30} />
            </div>
            <h2 className="v-modal-title" style={{ textAlign: "center" }}>
              Log out?
            </h2>
            <p
              style={{
                color: "#9CA89C",
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
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                className="v-btn v-btn-danger"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={confirmLogout}
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
          </div>
        </div>
      )}
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
    "#c8e6c9",
    "#E1E6D8",
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
        padding: "22px 24px",
        boxShadow: "0 2px 20px rgba(50,109,32,0.07)",
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
                  borderBottom: "2px solid #E1E6D8",
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
                    (e.currentTarget.style.background = "#f6fef8")
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
                          ? ["#f59e0b", "#9CA89C", "#cd7c2e"][i]
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
        boxShadow: "0 2px 14px rgba(50,109,32,0.07)",
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
              display: "flex",
              justifyContent: "center",
              color: "#185FA5",
              marginBottom: 8,
            }}
          >
            <Brain size={28} />
          </div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
            Ready to analyze your data
          </div>
          <div style={{ fontSize: 12, color: "#9CA89C" }}>
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
                    border: "1px solid #E1E6D8",
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
        border: "1px solid rgba(59,121,30,0.12)",
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 2px 16px rgba(50,109,32,0.07)",
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
  gradient = "linear-gradient(135deg,#3b791e,#3b791e)",
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
            background: "rgba(255,255,255,0.18)",
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
    return Array.isArray(kpiData?.categoryBreakdown)
      ? kpiData.categoryBreakdown
      : [];
  }, [kpiData]);

  const branchData = useMemo(() => {
    return Array.isArray(kpiData?.branchBreakdown)
      ? kpiData.branchBreakdown.slice(0, 5)
      : [];
  }, [kpiData]);

  const previousValues = Array.isArray(kpiData?.previousPeriodValues)
    ? kpiData.previousPeriodValues
    : [];
  const gpLine = Array.isArray(kpiData?.grossProfitTrend)
    ? kpiData.grossProfitTrend
    : [];

  const hasData = total > 0;
  const grossProfit = kpiData?.salesProfit ?? null;
  const txCount = kpiData?.txCount ?? null;
  const avgOrder = kpiData?.avgOrder ?? null;

  const analysisBullets = useMemo(() => {
    if (!hasData) return [];
    const bullets = [];
    bullets.push(
      `Total revenue for ${getRangeLabel()} is ${fmtAmt(kpiData?.totalSales ?? total)} across ${filterLabel}.`,
    );
    if (grossProfit !== null)
      bullets.push(
        `Gross profit stands at ${fmtAmt(grossProfit)}, a ${Math.round((grossProfit / (kpiData?.totalSales ?? total)) * 100)}% margin.`,
      );
    if (txCount !== null)
      bullets.push(
        `${Number(txCount).toLocaleString()} transactions processed${avgOrder !== null ? ` with an average order of ${fmtAmt(avgOrder)}` : ""}.`,
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
              <BarChart2 size={11} color="#3b791e" /> Sales Trend · CURRENT YEAR
              vs PAST YEAR with Gross Profit %
            </ChartLabel>
            {hasData ? (
              <>
                <ComboChart
                  barData={
                    previousValues.length === values.length
                      ? [values, previousValues]
                      : [values]
                  }
                  lineData={gpLine}
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
                    { color: PAL[0], label: "Sales CY" },
                    ...(previousValues.length === values.length
                      ? [{ color: PAL[1], label: "Previous Period" }]
                      : []),
                    ...(gpLine.length === values.length
                      ? [
                          {
                            color: "#1d4ed8",
                            label: "Gross Profit %",
                            line: true,
                          },
                        ]
                      : []),
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
                    ...(grossProfit !== null
                      ? [
                          {
                            label: "Gross Profit",
                            text: `Gross profit stands at ${fmtAmt(grossProfit)}, a ${Math.round((grossProfit / (kpiData?.totalSales ?? (total || 1))) * 100)}% margin.`,
                            icon: BarChart2,
                            color: "#1d4ed8",
                            bg: "#eff6ff",
                            border: "#bfdbfe",
                          },
                        ]
                      : []),
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
                  background: "#fbfdf6",
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
                    color: "#9CA89C",
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
              border: "1px solid #c8e6c9",
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
                    color: "#9CA89C",
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
              background: "#fbfdf6",
              border: "1px solid #E1E6D8",
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
              background: "#fbfdf6",
              border: "1px solid #E1E6D8",
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

  const projRev = analysis?.projectedRevenue ?? null;
  const projChg = analysis?.projectedChange ?? null;
  const peakDay = analysis?.peakDay ?? null;
  const slowDay = analysis?.slowestDay ?? null;
  const conf = analysis?.confidence ?? null;

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
      `Recorded revenue in the selected period: ${fmtAmt(total)}.`,
      "Run AI Analysis to generate projections and recommendations from the loaded branch records.",
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
              value: projRev !== null ? fmtAmt(projRev) : "—",
              sub:
                projRev !== null && projChg !== null
                  ? `${projChg >= 0 ? "+" : ""}${Number(projChg).toFixed(1)}% vs prior`
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
                        color: "#9CA89C",
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
                      labelBg: "#E1E6D8",
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
                      background: "#E1E6D8",
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
                    color: "#9CA89C",
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
            color: "#9CA89C",
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
    background: a ? "linear-gradient(135deg,#509820,#3b791e)" : "transparent",
    color: a ? "#fff" : "#5C6B60",
    boxShadow: a ? "0 2px 8px rgba(59,121,30,.28)" : "none",
  });
  const RANK_COLORS = ["#f59e0b", "#9CA89C", "#cd7c2e"];

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
                color: "#9CA89C",
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
                background: "#e8f5e9",
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
                background: "#E1E6D8",
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
                  color: "#9CA89C",
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
                    borderBottom: "2px solid #e8f5e9",
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
                background: "#fbfdf6",
                border: "1px solid #E1E6D8",
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
                background: "#fbfdf6",
                border: "1px solid #E1E6D8",
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
                background: "#fbfdf6",
                border: "1px solid #E1E6D8",
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
    const payments = new Map();
    let units = 0;

    rows.forEach((tx) => {
      const hour = new Date(tx.created_at || tx.date).getHours();
      hours.set(hour, (hours.get(hour) || 0) + Number(tx.total || 0));

      const payment =
        tx.payment_method ||
        tx.paymentMethod ||
        tx.payment_type ||
        "Unspecified";
      payments.set(
        payment,
        (payments.get(payment) || 0) + Number(tx.total || 0),
      );

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
    const paymentRows = [...payments.entries()].sort((a, b) => b[1] - a[1]);
    const revenue = rows.reduce((sum, tx) => sum + Number(tx.total || 0), 0);
    return {
      units,
      revenue,
      top: rankedProducts[0] || null,
      slow:
        rankedProducts.length > 1
          ? rankedProducts[rankedProducts.length - 1]
          : null,
      peakHour,
      paymentRows,
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
          <CreditCard size={14} color="#3b791e" /> Payment Mix
        </div>
        {metrics.paymentRows.length === 0 ? (
          <div style={{ color: "#9CA89C", fontSize: 12 }}>
            No payment data for this period.
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {metrics.paymentRows.map(([method, amount]) => {
              const share =
                metrics.revenue > 0 ? (amount / metrics.revenue) * 100 : 0;
              return (
                <span
                  key={method}
                  style={{
                    padding: "7px 11px",
                    borderRadius: 999,
                    background: "#F6F7F1",
                    border: "1px solid #E1E6D8",
                    fontSize: 11.5,
                    color: "#374132",
                  }}
                >
                  <strong>{method}</strong> · {share.toFixed(0)}% (
                  {fmtPeso(amount)})
                </span>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

const firstValue = (obj, keys, fallback = null) => {
  for (const key of keys)
    if (obj?.[key] !== undefined && obj?.[key] !== null && obj?.[key] !== "")
      return obj[key];
  return fallback;
};
const normText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();
const safeDate = (value) => {
  const d = new Date(value || 0);
  return Number.isNaN(d.getTime()) ? null : d;
};
const numberOrNull = (value) =>
  value === "" ||
  value === null ||
  value === undefined ||
  Number.isNaN(Number(value))
    ? null
    : Number(value);
const evidenceId = (row, index = 0) =>
  firstValue(
    row,
    [
      "transaction_id",
      "reference_no",
      "reference_id",
      "receipt_no",
      "batch_no",
      "id",
    ],
    `Record ${index + 1}`,
  );

// Uses the exact fields saved by routes/transactions.js.
// A zero COGS value is valid; only null/undefined/blank means unavailable.
const transactionCogsAvailable = (transactions = []) =>
  transactions.length > 0 &&
  transactions.every(
    (transaction) =>
      transaction?.cogs !== null &&
      transaction?.cogs !== undefined &&
      transaction?.cogs !== "" &&
      Number.isFinite(Number(transaction.cogs)),
  );

const calculateTransactionProfit = (transactions = []) =>
  transactions.reduce(
    (profit, transaction) =>
      profit + Number(transaction?.total || 0) - Number(transaction?.cogs || 0),
    0,
  );

const C = {
  green: "#3b791e",
  greenDk: "#2c5c16",
  greenMid: "#c9dba0",
  teal: "#509820",
  lime: "#b3a941",
  limeInk: "#24310C",
  ink: "#347022",
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
  redBorder: "#f2c9c4",
};

/* ── NEW: animates a number toward its latest value ── */
function useCountUp(value, duration = 650) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  useEffect(() => {
    const from = fromRef.current,
      to = value;
    if (from === to || typeof to !== "number") {
      setDisplay(to);
      fromRef.current = to;
      return;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return display;
}

/* ── NEW: shared severity → color tokens (gray base, colored dot only) ── */
function severityStyle(sev) {
  return (
    {
      Critical: { dot: C.red, bg: C.redBg, text: C.red, border: C.redBorder },
      High: { dot: C.warn, bg: C.warnBg, text: C.warn, border: C.greenMid },
      Medium: { dot: C.lime, bg: C.bg, text: C.limeInk, border: C.greenMid },
      Normal: { dot: C.ok, bg: C.okBg, text: C.greenDk, border: C.greenMid },
    }[sev] || { dot: C.muted, bg: C.bg, text: C.muted, border: C.border }
  );
}

/* ── NEW: animated segmented tab control ── */
function BdTabs({ tabs, active, onChange }) {
  const refs = useRef({});
  const [ind, setInd] = useState({ left: 0, width: 0 });
  useEffect(() => {
    const el = refs.current[active];
    if (el) setInd({ left: el.offsetLeft, width: el.offsetWidth });
  }, [active, tabs]);
  return (
    <div className="bd-tabs-wrap">
      <div
        className="bd-tab-indicator"
        style={{ left: ind.left, width: ind.width }}
      />
      {tabs.map((t) => (
        <button
          key={t.id}
          ref={(el) => (refs.current[t.id] = el)}
          className={`bd-tab ${active === t.id ? "active" : ""}`}
          onClick={() => onChange(t.id)}
        >
          <t.icon size={13} /> {t.label}
        </button>
      ))}
    </div>
  );
}

/* ── NEW: KPI card with count-up. Handles numeric or string values (e.g. a product name). ── */
function BdKpiCard({
  icon: Icon,
  tone = "neutral",
  label,
  value,
  sub,
  trend,
  onClick,
}) {
  const toneMap = {
    green: { bg: C.okBg, color: C.greenDk },
    neutral: { bg: C.bg, color: C.muted },
    amber: { bg: C.warnBg, color: C.warn },
    red: { bg: C.redBg, color: C.red },
  }[tone] || { bg: C.bg, color: C.muted };
  const isNumber = typeof value === "number";
  const animated = useCountUp(isNumber ? value : 0);
  return (
    <button className="bd-kpi" onClick={onClick}>
      <div className="bd-kpi-top">
        <span
          className="bd-kpi-icon"
          style={{ background: toneMap.bg, color: toneMap.color }}
        >
          <Icon size={16} />
        </span>
        {trend != null && (
          <span className={`bd-kpi-trend ${trend >= 0 ? "up" : "down"}`}>
            {trend >= 0 ? (
              <ArrowUpRight size={11} />
            ) : (
              <ArrowDownRight size={11} />
            )}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="bd-kpi-value">
        {isNumber ? Math.round(animated).toLocaleString("en-PH") : value}
      </div>
      <div className="bd-kpi-label">{label}</div>
      {sub && <div className="bd-kpi-sub">{sub}</div>}
    </button>
  );
}

/* ── NEW: compact secondary stat card (best seller, busiest period, etc) ── */
function BdMiniCard({ icon: Icon, label, value, sub, onClick }) {
  return (
    <button className="bd-mini-card" onClick={onClick} disabled={!onClick}>
      <span className="bd-mini-icon">
        <Icon size={14} />
      </span>
      <div style={{ minWidth: 0, flex: 1, textAlign: "left" }}>
        <div className="bd-mini-label">{label}</div>
        <div className="bd-mini-value">{value}</div>
        {sub && <div className="bd-mini-sub">{sub}</div>}
      </div>
    </button>
  );
}

/* ── NEW: revenue trend chart — draws itself in, tooltips, click-through to evidence.
   Takes the SAME `points` shape BranchDecisionDashboard already computes
   ({x,y,value,label,rows}) so none of the bucketing/scale logic is touched. ── */
function BdTrendChart({ points, maxGraph, onPointClick }) {
  const [tip, setTip] = useState(null);
  const [drawn, setDrawn] = useState(false);
  const pathRef = useRef(null);
  const [len, setLen] = useState(0);
  const signature = points.map((p) => p.value).join(",");

  let path = "";
  points.forEach((p, i) => {
    if (i === 0) path += `M ${p.x} ${p.y}`;
    else {
      const prev = points[i - 1];
      const cx = (prev.x + p.x) / 2;
      path += ` C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
    }
  });
  const area = points.length
    ? path + ` L ${points[points.length - 1].x} 146 L ${points[0].x} 146 Z`
    : "";

  useEffect(() => {
    setDrawn(false);
    if (pathRef.current) setLen(pathRef.current.getTotalLength());
    const t = setTimeout(() => setDrawn(true), 60);
    return () => clearTimeout(t);
  }, [signature]);

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 800;
    let best = points[0],
      bd = Infinity;
    points.forEach((p) => {
      const d = Math.abs(p.x - mx);
      if (d < bd) {
        bd = d;
        best = p;
      }
    });
    setTip(best);
  };

  const yTicks = [0, 0.5, 1].map((f) => ({
    y: 16 + 130 * (1 - f),
    label: fmtShort(maxGraph * f),
  }));
  const showEveryLabel = points.length <= 15;

  return (
    <div
      style={{ position: "relative" }}
      onMouseMove={handleMove}
      onMouseLeave={() => setTip(null)}
    >
      <svg
        viewBox="0 0 800 178"
        style={{
          width: "100%",
          maxHeight: 190,
          display: "block",
          overflow: "visible",
        }}
      >
        <defs>
          <linearGradient id="bddArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b791e" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#3b791e" stopOpacity="0" />
          </linearGradient>
        </defs>
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1="55"
              y1={t.y}
              x2="775"
              y2={t.y}
              stroke={C.border}
              strokeDasharray="3 5"
            />
            <text
              x="46"
              y={t.y + 3}
              textAnchor="end"
              fontSize="9"
              fill={C.muted}
            >
              {t.label}
            </text>
          </g>
        ))}
        {area && (
          <path
            d={area}
            fill="url(#bddArea)"
            opacity={drawn ? 1 : 0}
            style={{ transition: "opacity .6s ease .2s" }}
          />
        )}
        {path && (
          <path
            ref={pathRef}
            d={path}
            fill="none"
            stroke={C.green}
            strokeWidth="2.25"
            strokeLinecap="round"
            style={{
              strokeDasharray: len,
              strokeDashoffset: drawn ? 0 : len,
              transition: "stroke-dashoffset 1s cubic-bezier(.3,.7,.3,1)",
            }}
          />
        )}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={tip?.label === p.label ? 4.5 : 2.5}
            fill={C.green}
            stroke={C.white}
            strokeWidth="1.75"
            style={{ cursor: "pointer", transition: "r .12s" }}
            onClick={() => onPointClick(p)}
          />
        ))}
        {tip && (
          <line
            x1={tip.x}
            y1="16"
            x2={tip.x}
            y2="146"
            stroke={C.greenMid}
            strokeDasharray="3 4"
          />
        )}
        {points.map(
          (p, i) =>
            (showEveryLabel || i % Math.ceil(points.length / 12) === 0) && (
              <text
                key={p.label}
                x={p.x}
                y="166"
                textAnchor="middle"
                fontSize="9"
                fill={C.muted}
              >
                {p.label}
              </text>
            ),
        )}
      </svg>
      {tip && (
        <div
          className="bd-chart-tooltip"
          style={{
            left: `${(tip.x / 800) * 100}%`,
            top: `${(tip.y / 178) * 100}%`,
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 2 }}>{tip.label}</div>
          {fmtPeso(tip.value)} · click for evidence
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   1. BranchDecisionDashboard — same props, same computed values, new UI
───────────────────────────────────────────────────────────────────────── */
function BranchDecisionDashboard({ transactions = [], brands = [], user }) {
  const branch = String(user?.branch || "").trim();
  const brand = String(
    user?.brand ||
      user?.brand_name ||
      user?.brandName ||
      brands?.[0]?.name ||
      "",
  ).trim();
  const api = process.env.REACT_APP_API_URL;
  const today = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  const [tab, setTab] = useState("overview");
  const [period, setPeriod] = useState("month");
  const [from, setFrom] = useState(
    iso(new Date(today.getFullYear(), today.getMonth(), 1)),
  );
  const [to, setTo] = useState(iso(today));
  const [custom, setCustom] = useState(null);
  const [sources, setSources] = useState({
    inventory: [],
    movements: [],
    loading: true,
    errors: [],
  });
  const [drill, setDrill] = useState(null);
  const [sort, setSort] = useState({ key: "impact", dir: "desc" });
  const [ai, setAi] = useState({ loading: false, data: null, error: null });

  // NEW: UI-only state — filtering/sorting the product table doesn't touch
  // the underlying computation, it just changes what's displayed.
  const [productSearch, setProductSearch] = useState("");
  const [productSort, setProductSort] = useState({
    key: "revenue",
    dir: "desc",
  });

  const scope = useCallback(
    (row) => {
      const rowBranch = normText(
        firstValue(row, ["branch", "branch_name", "location"]),
      );
      const rowBrand = normText(firstValue(row, ["brand", "brand_name"]));
      return (
        (!rowBranch || rowBranch === normText(branch)) &&
        (!rowBrand || !brand || rowBrand === normText(brand))
      );
    },
    [branch, brand],
  );

  useEffect(() => {
    if (!branch) {
      setSources({
        inventory: [],
        movements: [],
        loading: false,
        errors: ["Authenticated account has no assigned branch."],
      });
      return;
    }
    let live = true;
    const params = new URLSearchParams({ branch });
    if (brand) params.set("brand", brand);
    const endpoints = [
      ["inventory", "/ingredients"],
      ["menu", "/inventory"],
    ];
    Promise.all(
      endpoints.map(async ([name, path]) => {
        try {
          const res = await fetch(`${api}${path}?${params}`, {
            credentials: "include",
          });
          if (!res.ok) throw new Error(`${res.status}`);
          const json = await res.json();
          const rows = Array.isArray(json)
            ? json
            : firstValue(json, [name, "items", "records", "data"], []);
          return {
            name,
            rows: Array.isArray(rows) ? rows.filter(scope) : [],
            ok: true,
          };
        } catch {
          return { name, rows: [], ok: false };
        }
      }),
    ).then(async (results) => {
      if (!live) return;
      const byName = Object.fromEntries(results.map((r) => [r.name, r.rows]));
      const ingredients = byName.inventory || [];
      const batchResults = await Promise.all(
        ingredients.map(async (ingredient) => {
          try {
            const response = await fetch(
              `${api}/ingredient-batches?ingredient_id=${ingredient.id}`,
              { credentials: "include" },
            );
            if (!response.ok) throw new Error(`${response.status}`);
            const rows = await response.json();
            return {
              ingredient_id: ingredient.id,
              rows: Array.isArray(rows) ? rows : [],
              ok: true,
            };
          } catch {
            return { ingredient_id: ingredient.id, rows: [], ok: false };
          }
        }),
      );
      if (!live) return;
      const batchesByIngredient = Object.fromEntries(
        batchResults.map((result) => [
          String(result.ingredient_id),
          result.rows,
        ]),
      );
      const enrichedIngredients = ingredients.map((ingredient) => ({
        ...ingredient,
        _record_type: "ingredient",
        _batches: batchesByIngredient[String(ingredient.id)] || [],
      }));
      const menuItems = (byName.menu || []).map((item) => ({
        ...item,
        _record_type: "menu",
      }));
      const batchEvidence = batchResults.flatMap((result) =>
        result.rows.map((batch) => ({
          ...batch,
          ingredient_id: result.ingredient_id,
          _source: "ingredient_batches",
        })),
      );
      const errors = results.filter((r) => !r.ok).map((r) => r.name);
      if (batchResults.some((result) => !result.ok))
        errors.push("ingredient_batches");
      setSources({
        inventory: [...enrichedIngredients, ...menuItems],
        movements: batchEvidence,
        loading: false,
        errors,
      });
    });
    return () => {
      live = false;
    };
  }, [api, branch, brand, scope]);

  const bounds = useMemo(() => {
    if (custom)
      return [
        new Date(`${custom.from}T00:00:00`),
        new Date(`${custom.to}T23:59:59.999`),
      ];
    const end = new Date();
    let start = new Date(end);
    if (period === "day") start.setHours(0, 0, 0, 0);
    if (period === "week") {
      start.setDate(end.getDate() - 6);
      start.setHours(0, 0, 0, 0);
    }
    if (period === "month")
      start = new Date(end.getFullYear(), end.getMonth(), 1);
    if (period === "year") start = new Date(end.getFullYear(), 0, 1);
    return [start, end];
  }, [period, custom]);

  const completed = useMemo(
    () =>
      (transactions || []).filter((tx) => {
        if (!scope(tx)) return false;
        const status = normText(
          firstValue(
            tx,
            ["status", "transaction_status", "payment_status"],
            "completed",
          ),
        );
        const d = safeDate(
          firstValue(tx, [
            "created_at",
            "date",
            "transaction_date",
            "completed_at",
          ]),
        );
        return (
          (!status ||
            ["completed", "paid", "success", "successful"].includes(status)) &&
          d &&
          d >= bounds[0] &&
          d <= bounds[1]
        );
      }),
    [transactions, scope, bounds],
  );

  const txItems = useMemo(
    () =>
      completed.flatMap((tx, ti) => {
        let items = firstValue(
          tx,
          ["items", "products", "line_items", "transaction_items"],
          [],
        );
        if (typeof items === "string") {
          try {
            items = JSON.parse(items);
          } catch {
            items = [];
          }
        }
        return (Array.isArray(items) ? items : []).map((item, ii) => ({
          ...item,
          _tx: tx,
          _key: `${evidenceId(tx, ti)}-${ii}`,
          name: firstValue(
            item,
            ["product_name", "name", "item_name", "menu_name"],
            "Product not recorded",
          ),
          category: firstValue(
            item,
            ["category", "product_category"],
            "Not recorded",
          ),
          qty: Number(firstValue(item, ["quantity", "qty", "units"], 0)) || 0,
          price: numberOrNull(
            firstValue(item, ["unit_price", "price", "selling_price"]),
          ),
          amount: numberOrNull(
            firstValue(item, ["subtotal", "amount", "line_total"]),
          ),
        }));
      }),
    [completed],
  );

  const revenue = completed.reduce(
    (s, tx) =>
      s +
      (Number(
        firstValue(tx, ["total", "total_amount", "grand_total", "amount"], 0),
      ) || 0),
    0,
  );
  const quantitySold = txItems.reduce((s, x) => s + x.qty, 0);
  const productRows = useMemo(() => {
    const map = new Map();
    txItems.forEach((x) => {
      const key = normText(x.name);
      const r = map.get(key) || {
        name: x.name,
        category: x.category,
        qty: 0,
        revenue: 0,
        tx: new Set(),
        rows: [],
      };
      r.qty += x.qty;
      r.revenue += x.amount ?? (x.price === null ? 0 : x.price * x.qty);
      r.tx.add(evidenceId(x._tx));
      r.rows.push(x);
      map.set(key, r);
    });
    return [...map.values()]
      .map((r) => ({
        ...r,
        transactions: r.tx.size,
        avgPrice: r.qty ? r.revenue / r.qty : null,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [txItems]);

  const movementInRange = useMemo(
    () =>
      sources.movements.filter((m) => {
        const d = safeDate(
          firstValue(m, ["created_at", "date", "movement_date", "received_at"]),
        );
        return scope(m) && d && d >= bounds[0] && d <= bounds[1];
      }),
    [sources.movements, scope, bounds],
  );
  const inventoryRows = useMemo(() => {
    const map = new Map();
    sources.inventory
      .filter((item) => item._record_type === "ingredient" && scope(item))
      .forEach((item, i) => {
        const inventoryKey = String(
          firstValue(
            item,
            ["ingredient_id", "stock_item_id", "product_id", "sku", "id"],
            `item-${i}`,
          ),
        );
        if (!map.has(inventoryKey))
          map.set(inventoryKey, { rowKey: inventoryKey, item, movements: [] });
      });
    movementInRange.forEach((m, i) => {
      const movementKey = String(
        firstValue(
          m,
          ["ingredient_id", "stock_item_id", "product_id", "sku", "item_id"],
          `movement-${i}`,
        ),
      );
      const entry = map.get(movementKey) || {
        rowKey: movementKey,
        item: {
          name: firstValue(
            m,
            ["ingredient_name", "product_name", "item_name", "sku"],
            "Unidentified SKU",
          ),
        },
        movements: [],
      };
      entry.movements.push(m);
      map.set(movementKey, entry);
    });
    const kind = (m) =>
      normText(firstValue(m, ["movement_type", "type", "action", "_source"]));
    const qty = (m) =>
      Math.abs(
        Number(
          firstValue(m, ["quantity", "qty", "quantity_changed", "amount"], 0),
        ) || 0,
      );
    const sum = (ms, tests) =>
      ms
        .filter((m) => tests.some((t) => kind(m).includes(t)))
        .reduce((s, m) => s + qty(m), 0);
    return [...map.values()].map((entry) => {
      const item = entry.item,
        ms = entry.movements;
      const opening = numberOrNull(
        firstValue(item, [
          "opening_stock",
          "opening_quantity",
          "beginning_stock",
        ]),
      );
      const received = sum(ms, [
        "deliver",
        "receipt",
        "receive",
        "stock in",
        "stock_in",
      ]);
      const transfersIn = sum(ms, ["transfer in", "transfer_in"]);
      const transfersOut = sum(ms, ["transfer out", "transfer_out"]);
      const disposals = sum(ms, ["disposal", "waste", "expired"]);
      const adjustments = sum(ms, ["adjust"]);
      const recorded = numberOrNull(
        firstValue(item, [
          "closing_stock",
          "recorded_closing_stock",
          "current_stock",
          "stock",
          "quantity",
        ]),
      );
      const name = firstValue(
        item,
        ["ingredient_name", "product_name", "name", "item_name", "sku"],
        "Unidentified SKU",
      );
      const soldFromMovements = sum(ms, ["sale", "pos", "sold"]);
      const product = productRows.find(
        (p) => normText(p.name) === normText(name),
      );
      const recipeEvidence = [];
      let recipeSold = 0;
      sources.inventory
        .filter((record) => record._record_type === "menu")
        .forEach((menuItem) => {
          let recipe = firstValue(
            menuItem,
            ["ingredients", "recipe", "linked_ingredients"],
            [],
          );
          if (typeof recipe === "string") {
            try {
              recipe = JSON.parse(recipe);
            } catch {
              recipe = [];
            }
          }
          if (!Array.isArray(recipe)) return;
          const menuSales = productRows.find(
            (p) =>
              normText(p.name) ===
              normText(
                firstValue(menuItem, [
                  "product_name",
                  "name",
                  "item_name",
                  "menu_name",
                ]),
              ),
          );
          if (!menuSales) return;
          recipe.forEach((ing) => {
            const ingId = String(
              firstValue(
                ing,
                ["ingredient_id", "stock_item_id", "product_id", "id"],
                "unknown",
              ),
            );
            const ingName = firstValue(ing, [
              "ingredient_name",
              "stock_item_name",
              "name",
              "item_name",
            ]);
            if (ingId !== entry.rowKey && normText(ingName) !== normText(name))
              return;
            const perProduct =
              Number(
                firstValue(
                  ing,
                  ["qty_required", "quantity_required", "quantity", "qty"],
                  0,
                ),
              ) || 0;
            const consumed = menuSales.qty * perProduct;
            recipeSold += consumed;
            recipeEvidence.push({
              product: menuSales.name,
              productsSold: menuSales.qty,
              perProduct,
              consumed,
              unit: firstValue(
                ing,
                ["unit", "measurement_unit"],
                firstValue(item, ["unit"], "unit"),
              ),
            });
          });
        });
      const sold = soldFromMovements || recipeSold || product?.qty || 0;
      const calculable = opening !== null && recorded !== null;
      const expected = calculable
        ? opening + received + transfersIn - sold - disposals - transfersOut
        : null;
      const variance = expected === null ? null : recorded - expected;
      const missingRefs = ms.filter(
        (m) =>
          !firstValue(m, [
            "reference_no",
            "reference_id",
            "transaction_id",
            "receipt_no",
            "batch_no",
            "id",
          ]),
      ).length;
      const batchExpirations = (item._batches || [])
        .map((batch) => safeDate(batch.exp_date))
        .filter(Boolean)
        .sort((a, b) => a - b);
      const exp =
        batchExpirations[0] || safeDate(firstValue(item, ["exp_date"]));
      const daysToExpiry = exp ? Math.ceil((exp - today) / 86400000) : null;
      let severity = "Normal";
      if ((variance !== null && Math.abs(variance) >= 10) || missingRefs >= 2)
        severity = "Critical";
      else if (
        (variance !== null && Math.abs(variance) >= 5) ||
        adjustments > 0 ||
        (daysToExpiry !== null && daysToExpiry <= 7)
      )
        severity = "High";
      else if (
        (variance !== null && variance !== 0) ||
        missingRefs > 0 ||
        (daysToExpiry !== null && daysToExpiry <= 30)
      )
        severity = "Medium";
      return {
        rowKey: entry.rowKey,
        name,
        item,
        movements: ms,
        recipeEvidence,
        opening,
        received,
        transfersIn,
        transfersOut,
        disposals,
        adjustments,
        sold,
        recorded,
        expected,
        variance,
        missingRefs,
        daysToExpiry,
        severity,
        impact:
          variance === null
            ? 0
            : Math.abs(variance) *
              (numberOrNull(firstValue(item, ["cost_per_unit", "cost"])) || 0),
      };
    });
  }, [sources.inventory, movementInRange, scope, productRows, today]);

  const previous = useMemo(() => {
    const duration = bounds[1] - bounds[0] + 1,
      end = new Date(bounds[0].getTime() - 1),
      start = new Date(end.getTime() - duration + 1);
    const rows = (transactions || []).filter((tx) => {
      const d = safeDate(
        firstValue(tx, [
          "created_at",
          "date",
          "transaction_date",
          "completed_at",
        ]),
      );
      return scope(tx) && d && d >= start && d <= end;
    });
    return rows.reduce(
      (s, tx) =>
        s +
        (Number(
          firstValue(tx, ["total", "total_amount", "grand_total", "amount"], 0),
        ) || 0),
      0,
    );
  }, [transactions, scope, bounds]);
  const change = previous > 0 ? ((revenue - previous) / previous) * 100 : null;

  const graph = useMemo(() => {
    const map = new Map();
    completed.forEach((tx) => {
      const d = safeDate(
        firstValue(tx, ["created_at", "date", "transaction_date"]),
      );
      if (!d) return;
      const key =
        period === "day"
          ? `${String(d.getHours()).padStart(2, "0")}:00`
          : period === "year"
            ? d.toLocaleDateString("en-PH", { month: "short" })
            : iso(d);
      const r = map.get(key) || {
        label: key,
        value: 0,
        rows: [],
        order:
          period === "day"
            ? d.getHours()
            : period === "year"
              ? d.getMonth()
              : d.getTime(),
      };
      r.value +=
        Number(
          firstValue(tx, ["total", "total_amount", "grand_total", "amount"], 0),
        ) || 0;
      r.rows.push(tx);
      map.set(key, r);
    });
    return [...map.values()].sort((a, b) => a.order - b.order);
  }, [completed, period]);
  const maxGraph = Math.max(1, ...graph.map((x) => x.value));
  const points = graph.map((g, i) => ({
    x: 55 + (i / Math.max(graph.length - 1, 1)) * 720,
    y: 16 + 130 - (g.value / maxGraph) * 130,
    ...g,
  }));

  const severityRank = { Critical: 4, High: 3, Medium: 2, Normal: 1 };
  const sortedInventory = useMemo(
    () =>
      [...inventoryRows].sort((a, b) => {
        let av = a[sort.key],
          bv = b[sort.key];
        if (sort.key === "severity") {
          av = severityRank[av];
          bv = severityRank[bv];
        }
        if (sort.key === "name") {
          av = normText(av);
          bv = normText(bv);
          return (sort.dir === "asc" ? 1 : -1) * av.localeCompare(bv);
        }
        return (
          (sort.dir === "asc" ? 1 : -1) *
          ((Number(av) || 0) - (Number(bv) || 0))
        );
      }),
    [inventoryRows, sort],
  );
  const setSortKey = (key) =>
    setSort((s) => ({
      key,
      dir: s.key === key && s.dir === "desc" ? "asc" : "desc",
    }));
  const openTx = (title, rows) =>
    setDrill({
      title,
      type: "transactions",
      rows: [...rows].sort(
        (a, b) =>
          (Number(firstValue(b, ["total", "amount"], 0)) || 0) -
          (Number(firstValue(a, ["total", "amount"], 0)) || 0),
      ),
    });
  const openStock = (row) => setDrill({ title: row.name, type: "stock", row });

  const runAi = async () => {
    if (completed.length < 3) {
      setAi({
        loading: false,
        data: null,
        error: "Insufficient historical data",
      });
      return;
    }
    setAi({ loading: true, data: null, error: null });
    try {
      const res = await fetch(`${api}/ai/dashboard-analysis`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactions: completed,
          preset: custom ? `${custom.from} to ${custom.to}` : period,
          filterLabel: `${brand} — ${branch}`,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "AI service failed");
      setAi({ loading: false, data: json.analysis || json, error: null });
    } catch (e) {
      setAi({ loading: false, data: null, error: e.message });
    }
  };

  const noData = (label) => <span style={{ color: "#9a9aa2" }}>{label}</span>;
  const best = productRows[0];
  const peak = graph.length
    ? [...graph].sort((a, b) => b.value - a.value)[0]
    : null;
  const lowStock = inventoryRows.filter((r) => {
    const min = numberOrNull(
      firstValue(r.item, ["min_stock", "minimum_stock", "reorder_level"]),
    );
    return min !== null && r.recorded !== null && r.recorded <= min;
  });
  const expiring = inventoryRows.filter(
    (r) =>
      r.daysToExpiry !== null && r.daysToExpiry >= 0 && r.daysToExpiry <= 30,
  );
  const alerts = inventoryRows.filter((r) => r.severity !== "Normal");
  const highPriority = alerts.filter((a) =>
    ["Critical", "High"].includes(a.severity),
  );
  const hasCogs = transactionCogsAvailable(completed);

  // NEW: display-only filter/sort of productRows — the underlying computation above is untouched
  const filteredProductRows = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    const rows = q
      ? productRows.filter((r) => r.name.toLowerCase().includes(q))
      : productRows;
    return [...rows].sort((a, b) => {
      const av = a[productSort.key],
        bv = b[productSort.key];
      if (typeof av === "string")
        return productSort.dir === "asc"
          ? av.localeCompare(bv)
          : bv.localeCompare(av);
      return productSort.dir === "asc"
        ? (Number(av) || 0) - (Number(bv) || 0)
        : (Number(bv) || 0) - (Number(av) || 0);
    });
  }, [productRows, productSearch, productSort]);
  const setProductSortKey = (key) =>
    setProductSort((s) => ({
      key,
      dir: s.key === key ? (s.dir === "asc" ? "desc" : "asc") : "desc",
    }));

  const rangeLabel = custom
    ? `${custom.from} → ${custom.to}`
    : {
        day: "Today",
        week: "This week",
        month: "This month",
        year: "This year",
      }[period];

  return (
    <div className="bd-scope" style={{ fontFamily: FONT }}>
      <style>{`
        .bd-scope {
          --green:${C.green}; --green-dark:${C.greenDk}; --green-light:${C.okBg}; --green-line:${C.greenMid};
          --teal:${C.teal}; --lime:${C.lime}; --lime-ink:${C.limeInk};
          --amber:${C.warn}; --amber-bg:${C.warnBg}; --red:${C.red}; --red-bg:${C.redBg}; --red-border:${C.redBorder};
          --border:${C.border}; --border-soft:${C.border}; --text:${C.ink}; --text-soft:${C.muted}; --text-mute:${C.muted};
          --surface:${C.white}; --surface-soft:${C.bg}; --radius:16px;
          --shadow:0 2px 8px rgba(59,121,30,0.06), 0 10px 24px rgba(44,92,22,0.05);
          --shadow-hover:0 5px 14px rgba(59,121,30,0.10), 0 18px 34px rgba(44,92,22,0.10);
          color:var(--text); font-variant-numeric:tabular-nums;
        }
        .bd-scope button { font-family:inherit; cursor:pointer; }
        .bd-scope :focus-visible { outline:2px solid var(--green); outline-offset:2px; }
        @keyframes bd-pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes bd-spin { to{transform:rotate(360deg)} }
        @keyframes bd-shimmer { 0%{background-position:-300px 0} 100%{background-position:300px 0} }
        @keyframes bd-fade-up { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bd-pop { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
        @keyframes bd-overlay-fade { from{opacity:0} to{opacity:1} }
        @keyframes bd-modal-center { from{opacity:0;transform:translate(-50%,-47%) scale(.98)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
        .bd-skel { background:linear-gradient(90deg,#eee 25%,#f6f6f6 37%,#eee 63%); background-size:400px 100%; animation:bd-shimmer 1.3s ease infinite; border-radius:8px; }

        .bd-topbar { display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; margin-bottom:16px; }
        .bd-brand { display:flex; align-items:center; gap:12px; }
        .bd-live-dot { position:relative; width:9px; height:9px; border-radius:50%; background:var(--green); flex-shrink:0; }
        .bd-live-dot::after { content:''; position:absolute; inset:-5px; border-radius:50%; border:2px solid var(--green); opacity:.5; animation:bd-pulse 2s ease infinite; }
        .bd-title { font-size:18px; font-weight:800; letter-spacing:-.01em; display:flex; align-items:center; gap:8px; }
        .bd-title-tag { font-size:11.5px; font-weight:700; color:var(--green-dark); background:var(--green-light); border:1px solid var(--green-line); padding:3px 9px; border-radius:20px; }
        .bd-lock-note { font-size:11.5px; color:var(--text-mute); font-weight:500; margin-top:2px; display:flex; align-items:center; gap:5px; }

        .bd-tabs-wrap { position:relative; display:inline-flex; gap:2px; background:var(--surface-soft); border:1px solid var(--border); border-radius:12px; padding:4px; margin-bottom:14px; }
        .bd-tab-indicator { position:absolute; top:4px; bottom:4px; border-radius:9px; background:var(--green); transition:left .28s cubic-bezier(.3,.8,.4,1), width .28s cubic-bezier(.3,.8,.4,1); z-index:0; }
        .bd-tab { position:relative; z-index:1; display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 15px; border:none; background:transparent; border-radius:9px; font-size:12.5px; font-weight:700; color:var(--text-soft); transition:color .2s; white-space:nowrap; }
        .bd-tab.active { color:#fff; }

        .bd-filterbar { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:16px; }
        .bd-pill { height:32px; padding:0 14px; border-radius:999px; border:1px solid var(--border); background:var(--surface); color:var(--text-soft); font-size:12.5px; font-weight:700; transition:all .15s; }
        .bd-pill:hover { border-color:#cfcfd4; color:var(--text); }
        .bd-pill.active { background:var(--green); border-color:var(--green); color:#fff; }
        .bd-date-input { height:32px; padding:0 10px; border-radius:9px; border:1.5px solid var(--border); background:var(--surface); font-size:12px; font-family:inherit; color:var(--text); }
        .bd-apply-btn { height:32px; padding:0 14px; border-radius:999px; border:none; background:var(--green); color:#fff; font-size:12.5px; font-weight:700; }
        .bd-apply-btn:hover { background:var(--green-dark); }

        .bd-kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:12px; }
        .bd-kpi { text-align:left; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:16px 17px; box-shadow:var(--shadow); transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
        .bd-kpi:hover { transform:translateY(-3px); box-shadow:var(--shadow-hover); border-color:#d8d8db; }
        .bd-kpi:active { transform:translateY(-1px); }
        .bd-kpi-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:10px; }
        .bd-kpi-icon { width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .bd-kpi-trend { display:inline-flex; align-items:center; gap:3px; font-size:11px; font-weight:800; padding:3px 7px; border-radius:20px; }
        .bd-kpi-trend.up { color:var(--green-dark); background:var(--green-light); }
        .bd-kpi-trend.down { color:var(--red); background:var(--red-bg); }
        .bd-kpi-value { font-size:21px; font-weight:800; letter-spacing:-.02em; line-height:1.15; }
        .bd-kpi-label { font-size:12.5px; font-weight:600; color:var(--text-soft); margin-top:3px; }
        .bd-kpi-sub { font-size:11px; color:var(--text-mute); font-weight:500; margin-top:3px; }

        .bd-mini-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:16px; }
        .bd-mini-card { display:flex; align-items:center; gap:10px; background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:11px 13px; text-align:left; transition:border-color .15s, transform .15s; }
        .bd-mini-card:not(:disabled):hover { border-color:#d8d8db; transform:translateY(-1px); }
        .bd-mini-card:disabled { cursor:default; }
        .bd-mini-icon { width:30px; height:30px; border-radius:9px; background:var(--surface-soft); border:1px solid var(--border-soft); display:flex; align-items:center; justify-content:center; color:var(--text-soft); flex-shrink:0; }
        .bd-mini-label { font-size:10.5px; font-weight:700; color:var(--text-mute); text-transform:uppercase; letter-spacing:.04em; }
        .bd-mini-value { font-size:13.5px; font-weight:800; color:var(--text); margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .bd-mini-sub { font-size:11px; color:var(--text-mute); margin-top:1px; }

        .bd-layout { display:grid; grid-template-columns:1.6fr 1fr; gap:14px; align-items:start; margin-bottom:16px; }
        .bd-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); box-shadow:var(--shadow); overflow:hidden; }
        .bd-card-head { display:flex; align-items:center; justify-content:space-between; padding:16px 18px; border-bottom:1px solid var(--border-soft); gap:10px; flex-wrap:wrap; }
        .bd-card-title { font-size:14px; font-weight:800; display:flex; align-items:center; gap:8px; }
        .bd-card-sub { font-size:11.5px; color:var(--text-mute); font-weight:500; margin-top:2px; }
        .bd-card-body { padding:16px 18px; }
        .bd-search { display:flex; align-items:center; gap:7px; height:34px; padding:0 12px; border:1.5px solid var(--border); border-radius:10px; background:var(--surface-soft); width:210px; transition:border-color .15s; }
        .bd-search:focus-within { border-color:var(--green); background:var(--surface); }
        .bd-search input { border:none; background:transparent; outline:none; font-size:12.5px; width:100%; color:var(--text); }

        .bd-table { width:100%; border-collapse:collapse; font-size:12.8px; }
        .bd-table th { text-align:left; padding:9px 12px; font-size:10.5px; font-weight:800; text-transform:uppercase; letter-spacing:.05em; color:var(--text-mute); border-bottom:1px solid var(--border); cursor:pointer; user-select:none; white-space:nowrap; }
        .bd-table th:hover { color:var(--text-soft); }
        .bd-table td { padding:11px 12px; border-bottom:1px solid var(--border-soft); color:var(--text-soft); }
        .bd-table tr.bd-row { transition:background .15s; cursor:pointer; }
        .bd-table tr.bd-row:hover { background:var(--surface-soft); }
        .bd-table tr.bd-row:hover .bd-row-chevron { opacity:1; transform:translateX(0); }
        .bd-row-chevron { opacity:0; transform:translateX(-4px); transition:all .15s; color:var(--text-mute); }
        .bd-name-cell { font-weight:700; color:var(--text); }

        .bd-attn-row { display:flex; align-items:center; gap:11px; padding:11px 10px; border-radius:10px; cursor:pointer; transition:background .15s; }
        .bd-attn-row:hover { background:var(--surface-soft); }
        .bd-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
        .bd-attn-label { flex:1; font-size:12.5px; font-weight:700; color:var(--text); }
        .bd-attn-sub { font-size:11px; color:var(--text-mute); font-weight:500; }
        .bd-attn-count { font-size:13px; font-weight:800; color:var(--text); background:var(--surface-soft); border:1px solid var(--border); width:26px; height:26px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }

        .bd-chip { display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:700; white-space:nowrap; }
        .bd-banner-warn { padding:11px 14px; background:var(--amber-bg); border:1px solid #f3dfb8; color:var(--amber); border-radius:10px; font-size:12px; margin-bottom:12px; line-height:1.55; }

        .bd-ai-btn { display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 15px; border-radius:9px; border:none; background:var(--green); color:#fff; font-size:12.5px; font-weight:700; transition:transform .1s, opacity .15s; }
        .bd-ai-btn:hover { opacity:.88; }
        .bd-ai-btn:active { transform:translateY(1px); }
        .bd-ai-btn:disabled { opacity:.55; cursor:not-allowed; }
        .bd-ai-card { border-radius:12px; padding:13px 14px; border:1px solid; animation:bd-fade-up .35s ease both; }
        .bd-ai-tag { font-size:9.5px; font-weight:800; text-transform:uppercase; letter-spacing:.06em; color:var(--lime-ink); background:var(--green-line); padding:2px 8px; border-radius:20px; }

        .bd-chart-tooltip { position:absolute; background:var(--green-dark); color:#fff; padding:8px 12px; border-radius:10px; font-size:11.5px; pointer-events:none; white-space:nowrap; transform:translate(-50%,-115%); box-shadow:0 8px 20px rgba(44,92,22,.25); }

        .bd-modal-overlay { position:fixed; inset:0; width:100vw; height:100vh; padding:0; background:rgba(36,49,12,0.42); backdrop-filter:blur(4px); z-index:5000; animation:bd-overlay-fade .18s ease; }
        .bd-modal-sheet { position:absolute; top:50%; left:50%; width:min(880px,calc(100vw - 48px)); max-height:min(82vh,760px); margin:0; background:var(--surface); border:1px solid var(--green-line); border-radius:20px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 26px 75px rgba(36,49,12,.30); transform:translate(-50%,-50%); animation:bd-modal-center .24s cubic-bezier(.2,.8,.3,1) both; }
        .bd-icon-btn { display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:9px; border:1px solid var(--border); background:var(--surface); color:var(--text-soft); transition:border-color .15s, color .15s; }
        .bd-icon-btn:hover { border-color:var(--green); color:var(--green-dark); background:var(--green-light); }

        @media (max-width: 980px) { .bd-layout { grid-template-columns:1fr; } .bd-kpi-grid, .bd-mini-grid { grid-template-columns:repeat(2,1fr); } }
        @media (max-width: 640px) { .bd-modal-sheet { width:calc(100vw - 24px); max-height:90vh; border-radius:16px; } }
        @media (prefers-reduced-motion: reduce) { .bd-scope *, .bd-scope *::after { animation-duration:.001s !important; transition-duration:.001s !important; } }
      `}</style>

      {/* top bar — replaces the old dark "locked context" banner */}
      <div className="bd-topbar">
        <div className="bd-brand">
          <div className="bd-live-dot" />
          <div>
            <div className="bd-title">
              {branch || "Branch not assigned"}{" "}
              <span className="bd-title-tag">
                {brand || "Brand not assigned"}
              </span>
            </div>
            <div className="bd-lock-note">
              <Lock size={11} /> Locked to your assigned branch ·{" "}
              {completed.length} verified transaction
              {completed.length === 1 ? "" : "s"}
            </div>
          </div>
        </div>
      </div>

      <BdTabs
        tabs={[
          { id: "overview", label: "Overview", icon: Activity },
          { id: "sales", label: "Sales & AI", icon: BarChart2 },
          { id: "ghost", label: "Stock Health", icon: Layers },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="bd-filterbar">
        {["day", "week", "month", "year"].map((p) => (
          <button
            key={p}
            className={`bd-pill ${!custom && period === p ? "active" : ""}`}
            onClick={() => {
              setCustom(null);
              setPeriod(p);
            }}
          >
            {p[0].toUpperCase() + p.slice(1)}
          </button>
        ))}
        <Calendar size={13} color="#9a9aa2" />
        <input
          type="date"
          className="bd-date-input"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <span style={{ fontSize: 12, color: "#9a9aa2" }}>to</span>
        <input
          type="date"
          className="bd-date-input"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <button
          className="bd-apply-btn"
          onClick={() => from && to && from <= to && setCustom({ from, to })}
        >
          Apply
        </button>
      </div>

      {tab === "overview" && (
        <>
          <div className="bd-kpi-grid">
            <BdKpiCard
              icon={DollarSign}
              tone="green"
              label="Total sales revenue"
              value={completed.length ? Math.round(revenue) : 0}
              sub={
                completed.length
                  ? `${completed.length} completed POS records`
                  : "No data available"
              }
              trend={change}
              onClick={() => openTx("Total Sales Revenue", completed)}
            />
            <BdKpiCard
              icon={Receipt}
              tone="neutral"
              label="Completed transactions"
              value={completed.length}
              sub="Completed / paid POS records only"
              onClick={() => openTx("Completed Transactions", completed)}
            />
            <BdKpiCard
              icon={ShoppingCart}
              tone="neutral"
              label="Average transaction value"
              value={
                completed.length ? Math.round(revenue / completed.length) : 0
              }
              sub="Revenue ÷ completed transactions"
              onClick={() => openTx("Average Transaction Value", completed)}
            />
            <BdKpiCard
              icon={TrendingUp}
              tone={hasCogs ? "green" : "neutral"}
              label="Gross profit"
              value={
                hasCogs
                  ? Math.round(calculateTransactionProfit(completed))
                  : "—"
              }
              sub={
                hasCogs ? "Revenue − cost of sales" : "Cost data not recorded"
              }
              onClick={() =>
                setDrill({
                  title: "Gross Profit Calculation",
                  type: "profit",
                  rows: completed,
                })
              }
            />
          </div>

          <div className="bd-mini-grid">
            <BdMiniCard
              icon={BarChart2}
              label="Best-selling product"
              value={best?.name || "No data available"}
              sub={
                best
                  ? `${best.qty} units · ${fmtPeso(best.revenue)}`
                  : "POS item details unavailable"
              }
              onClick={
                best
                  ? () =>
                      setDrill({ title: best.name, type: "product", row: best })
                  : undefined
              }
            />
            <BdMiniCard
              icon={Clock}
              label="Busiest sales period"
              value={peak?.label || "No data available"}
              sub={peak ? fmtPeso(peak.value) : "No completed POS records"}
              onClick={
                peak
                  ? () => openTx(`Sales for ${peak.label}`, peak.rows)
                  : undefined
              }
            />
            <BdMiniCard
              icon={Package}
              label="Products sold"
              value={txItems.length ? quantitySold : "No data available"}
              sub={`${productRows.length} distinct product(s)`}
              onClick={() =>
                setDrill({
                  title: "Products Sold",
                  type: "products",
                  rows: productRows,
                })
              }
            />
          </div>

          <div className="bd-layout">
            <div className="bd-card">
              <div className="bd-card-head">
                <div>
                  <div className="bd-card-title">
                    <Package size={14} /> Branch performance evidence
                  </div>
                  <div className="bd-card-sub">
                    Highest revenue first · click a row for supporting POS
                    records
                  </div>
                </div>
                <div className="bd-search">
                  <Search size={13} color="#9a9aa2" />
                  <input
                    placeholder="Search products…"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="bd-card-body" style={{ padding: 8 }}>
                <ProductEvidenceTable
                  rows={filteredProductRows}
                  sort={productSort}
                  onSort={setProductSortKey}
                  onOpen={(row) =>
                    setDrill({ title: row.name, type: "product", row })
                  }
                />
              </div>
            </div>

            <div className="bd-card">
              <div className="bd-card-head">
                <div className="bd-card-title">
                  <AlertTriangle size={14} /> Needs attention
                </div>
              </div>
              <div
                className="bd-card-body"
                style={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                {[
                  {
                    label: "Low-stock items",
                    sub: sources.errors.includes("inventory")
                      ? "Incomplete stock movement records"
                      : "At or below reorder level",
                    count: sources.loading ? "…" : lowStock.length,
                    sev: "High",
                    rows: lowStock,
                  },
                  {
                    label: "Expiring items",
                    sub: "Within 30 days of recorded expiry",
                    count: sources.loading ? "…" : expiring.length,
                    sev: "Medium",
                    rows: expiring,
                  },
                  {
                    label: "High-priority alerts",
                    sub: "Critical and High inventory findings",
                    count: sources.loading ? "…" : highPriority.length,
                    sev: "Critical",
                    rows: highPriority,
                  },
                ].map((a, i) => {
                  const s = severityStyle(a.sev);
                  return (
                    <div
                      key={i}
                      className="bd-attn-row"
                      onClick={() =>
                        setDrill({
                          title: a.label,
                          type: "inventory",
                          rows: a.rows,
                        })
                      }
                    >
                      <span className="bd-dot" style={{ background: s.dot }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="bd-attn-label">{a.label}</div>
                        <div className="bd-attn-sub">{a.sub}</div>
                      </div>
                      <span className="bd-attn-count">{a.count}</span>
                    </div>
                  );
                })}
                <div
                  style={{
                    marginTop: 8,
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: "var(--surface-soft)",
                    border: "1px dashed var(--border)",
                    fontSize: 11.5,
                    color: "var(--text-mute)",
                    lineHeight: 1.5,
                  }}
                >
                  Tap any row to see the exact recorded evidence behind it.
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "sales" && (
        <>
          <div className="bd-mini-grid">
            <BdMiniCard
              icon={DollarSign}
              label="Current-period revenue"
              value={completed.length ? fmtPeso(revenue) : "No data available"}
              sub="Verified completed POS only"
              onClick={() => openTx("Current-period Revenue", completed)}
            />
            <BdMiniCard
              icon={Clock}
              label="Previous comparable period"
              value={previous ? fmtPeso(previous) : "No data available"}
              sub="Same duration immediately before"
            />
            <BdMiniCard
              icon={change >= 0 ? TrendingUp : TrendingDown}
              label="Percentage change"
              value={
                change === null
                  ? "No comparable data"
                  : `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`
              }
              sub="(Current − previous) ÷ previous"
            />
          </div>

          <div className="bd-card" style={{ marginBottom: 14 }}>
            <div className="bd-card-head">
              <div>
                <div className="bd-card-title">
                  <BarChart2 size={14} /> Sales trend analysis
                </div>
                <div className="bd-card-sub">
                  {rangeLabel} · click a point to inspect that period's
                  transactions
                </div>
              </div>
            </div>
            <div className="bd-card-body">
              {points.length ? (
                <BdTrendChart
                  points={points}
                  maxGraph={maxGraph}
                  onPointClick={(p) => openTx(`Sales for ${p.label}`, p.rows)}
                />
              ) : (
                <VEmptyState
                  icon={LineChart}
                  title="No data available"
                  sub="No completed POS transactions exist for the selected period."
                />
              )}
            </div>
          </div>

          <div className="bd-card">
            <div className="bd-card-head">
              <div>
                <div className="bd-card-title">
                  <Brain size={14} /> AI prescriptive analysis{" "}
                  <span className="bd-ai-tag" style={{ marginLeft: 6 }}>
                    AI-generated
                  </span>
                </div>
                <div className="bd-card-sub">
                  Generated only from the verified branch evidence above
                </div>
              </div>
              <button
                className="bd-ai-btn"
                onClick={runAi}
                disabled={ai.loading}
              >
                {ai.loading ? (
                  <RefreshCw
                    size={13}
                    style={{ animation: "bd-spin .7s linear infinite" }}
                  />
                ) : (
                  <Sparkles size={13} />
                )}
                {ai.loading
                  ? "Analyzing…"
                  : ai.data
                    ? "Re-run analysis"
                    : "Run AI analysis"}
              </button>
            </div>
            <div className="bd-card-body">
              {!ai.loading && !ai.data && !ai.error && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "26px 10px",
                    border: "1px dashed var(--border)",
                    borderRadius: 12,
                    color: "var(--text-mute)",
                    fontSize: 12.5,
                  }}
                >
                  Run the analysis to get evidence-based recommendations for
                  this branch.
                </div>
              )}
              {ai.loading && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="bd-skel" style={{ height: 58 }} />
                  ))}
                </div>
              )}
              {ai.error && <div className="bd-banner-warn">{ai.error}</div>}
              {ai.data && (
                <AIRecommendations
                  data={ai.data}
                  from={bounds[0]}
                  to={bounds[1]}
                  onEvidence={(name) => {
                    const p = productRows.find(
                      (x) => normText(x.name) === normText(name),
                    );
                    if (p) setDrill({ title: p.name, type: "product", row: p });
                  }}
                />
              )}
            </div>
          </div>
        </>
      )}

      {tab === "ghost" && (
        <div className="bd-card">
          <div className="bd-card-head">
            <div>
              <div className="bd-card-title">
                <Layers size={14} /> Stock evidence
              </div>
              <div className="bd-card-sub">
                Expected = opening + received + transfers in − sold − disposals
                − transfers out
              </div>
            </div>
          </div>
          <div className="bd-card-body">
            {sources.loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="bd-skel" style={{ height: 44 }} />
                ))}
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    gap: 7,
                    flexWrap: "wrap",
                    marginBottom: 12,
                  }}
                >
                  {[
                    ["severity", "Severity"],
                    ["variance", "Largest variance"],
                    ["impact", "Financial impact"],
                    ["daysToExpiry", "Earliest expiry"],
                    ["name", "Product / SKU"],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      className={`bd-pill ${sort.key === key ? "active" : ""}`}
                      onClick={() => setSortKey(key)}
                    >
                      {label}
                      {sort.key === key
                        ? sort.dir === "desc"
                          ? " ↓"
                          : " ↑"
                        : ""}
                    </button>
                  ))}
                </div>
                {sources.errors.length > 0 && (
                  <div className="bd-banner-warn">
                    Incomplete stock movement records: unavailable source(s):{" "}
                    {sources.errors.join(", ")}. Variance is shown as "Unable to
                    calculate" where required fields are missing.
                  </div>
                )}
                <InventoryEvidenceTable
                  rows={sortedInventory}
                  onOpen={openStock}
                />
              </>
            )}
          </div>
        </div>
      )}

      {drill && (
        <EvidenceModal
          drill={drill}
          brand={brand}
          branch={branch}
          onClose={() => setDrill(null)}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   2. ProductEvidenceTable — now takes sort/onSort so headers are clickable
───────────────────────────────────────────────────────────────────────── */
function ProductEvidenceTable({ rows, sort, onSort, onOpen }) {
  if (!rows.length)
    return (
      <VEmptyState
        icon={Package}
        title="No data available"
        sub="Product-level POS line items were not recorded for this period."
      />
    );
  const cols = [
    ["name", "Product"],
    ["category", "Category"],
    ["qty", "Quantity sold"],
    ["transactions", "Transactions"],
    ["revenue", "Sales revenue"],
    ["avgPrice", "Average price"],
  ];
  return (
    <table className="bd-table">
      <thead>
        <tr>
          {cols.map(([key, label]) => (
            <th
              key={key}
              onClick={() => onSort && onSort(key)}
              style={{
                textAlign: [
                  "qty",
                  "transactions",
                  "revenue",
                  "avgPrice",
                ].includes(key)
                  ? "right"
                  : "left",
              }}
            >
              {label}{" "}
              {sort?.key === key ? (sort.dir === "asc" ? "↑" : "↓") : ""}
            </th>
          ))}
          <th />
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.name} className="bd-row" onClick={() => onOpen(r)}>
            <td className="bd-name-cell">{r.name}</td>
            <td>{r.category}</td>
            <td style={{ textAlign: "right" }}>{r.qty}</td>
            <td style={{ textAlign: "right" }}>{r.transactions}</td>
            <td
              style={{
                textAlign: "right",
                fontWeight: 700,
                color: "var(--text)",
              }}
            >
              {fmtPeso(r.revenue)}
            </td>
            <td style={{ textAlign: "right" }}>
              {r.avgPrice === null ? "Not recorded" : fmtPeso(r.avgPrice)}
            </td>
            <td style={{ width: 20 }}>
              <ChevronRight size={14} className="bd-row-chevron" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   3. InventoryEvidenceTable — severity as a dot chip, gray table otherwise
───────────────────────────────────────────────────────────────────────── */
function InventoryEvidenceTable({ rows, onOpen }) {
  if (!rows.length)
    return (
      <VEmptyState
        icon={FileCheck}
        title="No data available"
        sub="No branch-scoped inventory or stock movement records were returned."
      />
    );
  return (
    <table className="bd-table">
      <thead>
        <tr>
          <th>Severity</th>
          <th>Ingredient / SKU</th>
          <th style={{ textAlign: "right" }}>Expected</th>
          <th style={{ textAlign: "right" }}>Recorded</th>
          <th style={{ textAlign: "right" }}>Variance</th>
          <th>Missing refs</th>
          <th>Expiry</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const s = severityStyle(r.severity);
          return (
            <tr key={r.rowKey} className="bd-row" onClick={() => onOpen(r)}>
              <td>
                <span
                  className="bd-chip"
                  style={{
                    background: s.bg,
                    color: s.text,
                    border: `1px solid ${s.border}`,
                  }}
                >
                  <span className="bd-dot" style={{ background: s.dot }} />
                  {r.severity}
                </span>
              </td>
              <td className="bd-name-cell">{r.name}</td>
              <td style={{ textAlign: "right" }}>
                {r.expected === null ? "Unable to calculate" : r.expected}
              </td>
              <td style={{ textAlign: "right" }}>
                {r.recorded === null ? "Not recorded" : r.recorded}
              </td>
              <td
                style={{
                  textAlign: "right",
                  fontWeight: 800,
                  color:
                    r.variance === null
                      ? "var(--text-mute)"
                      : r.variance === 0
                        ? "var(--green-dark)"
                        : "var(--red)",
                }}
              >
                {r.variance === null
                  ? "Unable to calculate"
                  : `${r.variance > 0 ? "+" : ""}${r.variance}`}
              </td>
              <td>{r.missingRefs}</td>
              <td>
                {r.daysToExpiry === null
                  ? "Not recorded"
                  : r.daysToExpiry < 0
                    ? "Expired"
                    : `${r.daysToExpiry} day(s)`}
              </td>
              <td style={{ width: 20 }}>
                <ChevronRight size={14} className="bd-row-chevron" />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   4. AIRecommendations — same data contract, staggered reveal
───────────────────────────────────────────────────────────────────────── */
function AIRecommendations({ data, from, to, onEvidence }) {
  const list = Array.isArray(data?.recommendations)
    ? data.recommendations
    : Array.isArray(data)
      ? data
      : [];
  if (!list.length)
    return (
      <VEmptyState
        icon={Brain}
        title="No recommendation returned"
        sub="The AI service did not return structured recommendations."
      />
    );
  const priorityStyle = (p) => severityStyle(p || "Medium");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {list.map((r, i) => {
        const s = priorityStyle(r.priority);
        return (
          <div
            key={i}
            className="bd-ai-card"
            style={{
              background: s.bg,
              borderColor: s.border,
              animationDelay: `${i * 80}ms`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginBottom: 6,
                flexWrap: "wrap",
              }}
            >
              <span className="bd-dot" style={{ background: s.dot }} />
              <strong style={{ fontSize: 12.8 }}>
                {r.product || r.ingredient || "Branch-level recommendation"}
              </strong>
              <span className="bd-ai-tag">AI-generated</span>
              <span
                className="bd-chip"
                style={{
                  background: s.bg,
                  color: s.text,
                  border: `1px solid ${s.border}`,
                }}
              >
                {r.priority || "Priority not supplied"}
              </span>
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-soft)",
                lineHeight: 1.65,
              }}
            >
              <b>Issue:</b> {r.issue || "Not supplied"}
              <br />
              <b>Supporting evidence:</b>{" "}
              {r.evidence || r.supportingEvidence || "Not supplied"}
              <br />
              <b>Business impact:</b>{" "}
              {r.impact || r.businessImpact || "Not supplied"}
              <br />
              <b>Recommended action:</b>{" "}
              {r.action || r.recommendedAction || r.text || "Not supplied"}
              <br />
              <b>Confidence:</b> {r.confidence ?? "Not supplied"} ·{" "}
              <b>Date range:</b> {from.toLocaleDateString("en-PH")}–
              {to.toLocaleDateString("en-PH")}
            </div>
            {(r.product || r.ingredient) && (
              <button
                className="bd-pill"
                style={{ marginTop: 9, height: 28 }}
                onClick={() => onEvidence(r.product || r.ingredient)}
              >
                Open supporting records
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   5. EvidenceModal — same type branches (transactions/product/products/
   profit/inventory/stock), restyled as a slide-up sheet
───────────────────────────────────────────────────────────────────────── */
function EvidenceModal({ drill, brand, branch, onClose }) {
  const txTable = (rows) => (
    <table className="bd-table">
      <thead>
        <tr>
          <th>Source / ID</th>
          <th>Date &amp; time</th>
          <th>User</th>
          <th style={{ textAlign: "right" }}>Quantity</th>
          <th style={{ textAlign: "right" }}>Unit price / cost</th>
          <th style={{ textAlign: "right" }}>Amount</th>
          <th>Completeness</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const tx = r._tx || r;
          const date = firstValue(tx, [
            "created_at",
            "supply_date",
            "transaction_date",
          ]);
          const actor = firstValue(tx, ["cashier", "performed_by", "supplier"]);
          const required = [evidenceId(tx, i), date, actor];
          const complete = required.every(Boolean);
          return (
            <tr key={r._key || evidenceId(tx, i)}>
              <td>
                <b>
                  {r._tx
                    ? "POS line item"
                    : r._source === "ingredient_batches"
                      ? "Ingredient batch"
                      : "POS"}
                </b>
                <br />
                {evidenceId(tx, i)}
              </td>
              <td>
                {safeDate(date)?.toLocaleString("en-PH") || "Not recorded"}
              </td>
              <td>{actor || "Not recorded"}</td>
              <td style={{ textAlign: "right" }}>
                {firstValue(r, ["qty", "quantity", "stock"], "Not recorded")}
              </td>
              <td style={{ textAlign: "right" }}>
                {numberOrNull(firstValue(r, ["price", "cost_per_unit"])) ===
                null
                  ? "Not recorded"
                  : fmtPeso(firstValue(r, ["price", "cost_per_unit"]))}
              </td>
              <td
                style={{
                  textAlign: "right",
                  fontWeight: 700,
                  color: "var(--text)",
                }}
              >
                {r._tx
                  ? fmtPeso(r.amount ?? (r.price || 0) * r.qty)
                  : firstValue(r, ["total"], "Not applicable")}
              </td>
              <td>
                <span
                  className="bd-chip"
                  style={
                    complete
                      ? {
                          background: "var(--green-light)",
                          color: "var(--green-dark)",
                          border: "1px solid var(--green-line)",
                        }
                      : {
                          background: "var(--amber-bg)",
                          color: "var(--amber)",
                          border: "1px solid #f3dfb8",
                        }
                  }
                >
                  {complete ? "Complete" : "Incomplete"}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  let body = null;
  if (drill.type === "transactions")
    body = drill.rows.length ? (
      txTable(drill.rows)
    ) : (
      <VEmptyState
        icon={Receipt}
        title="No data available"
        sub="No completed POS source records are included."
      />
    );
  if (drill.type === "product")
    body = (
      <>
        <div
          style={{
            marginBottom: 14,
            fontSize: 12.5,
            color: "var(--text-soft)",
          }}
        >
          <b>Category:</b> {drill.row.category} · <b>Quantity:</b>{" "}
          {drill.row.qty} · <b>Revenue:</b> {fmtPeso(drill.row.revenue)} ·{" "}
          <b>Calculation:</b> sum of POS line amounts for this product
        </div>
        {txTable(drill.row.rows)}
      </>
    );
  if (drill.type === "products")
    body = <ProductEvidenceTable rows={drill.rows} onOpen={() => {}} />;
  if (drill.type === "profit")
    body = (
      <>
        <div
          style={{
            marginBottom: 14,
            fontSize: 12.5,
            color: "var(--text-soft)",
          }}
        >
          <b>Calculation:</b> Σ transaction total − Σ transaction cogs ={" "}
          {fmtPeso(calculateTransactionProfit(drill.rows))}
        </div>
        {txTable(drill.rows)}
      </>
    );
  if (drill.type === "inventory")
    body = <InventoryEvidenceTable rows={drill.rows} onOpen={() => {}} />;
  if (drill.type === "stock") {
    const r = drill.row;
    body = (
      <>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 8,
            marginBottom: 14,
          }}
        >
          {[
            ["Opening", r.opening],
            ["Received", r.received],
            ["Transfers in", r.transfersIn],
            ["POS / recipe consumed", r.sold],
            ["Disposals", r.disposals],
            ["Transfers out", r.transfersOut],
            ["Manual adjustments", r.adjustments],
            ["Expected", r.expected],
            ["Recorded", r.recorded],
            ["Variance", r.variance],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                padding: 10,
                background: "var(--surface-soft)",
                border: "1px solid var(--border-soft)",
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  fontSize: 10.5,
                  color: "var(--text-mute)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".04em",
                }}
              >
                {k}
              </div>
              <div style={{ fontWeight: 800, fontSize: 14, marginTop: 2 }}>
                {v === null ? "Not recorded" : v}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: "var(--text-mute)",
            marginBottom: 14,
            lineHeight: 1.6,
          }}
        >
          <b style={{ color: "var(--text-soft)" }}>Calculation:</b>{" "}
          {r.opening ?? "?"} + {r.received} + {r.transfersIn} − {r.sold} −{" "}
          {r.disposals} − {r.transfersOut} ={" "}
          {r.expected ?? "Unable to calculate"}
          <br />
          <b style={{ color: "var(--text-soft)" }}>SKU:</b>{" "}
          {r.item.sku || "Not recorded"} ·{" "}
          <b style={{ color: "var(--text-soft)" }}>Cost per unit:</b>{" "}
          {r.item.cost_per_unit == null
            ? "Not recorded"
            : fmtPeso(r.item.cost_per_unit)}{" "}
          · <b style={{ color: "var(--text-soft)" }}>Missing references:</b>{" "}
          {r.missingRefs}
        </div>
        {r.recipeEvidence?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, marginBottom: 8 }}>
              Menu ingredient consumption evidence
            </div>
            <table className="bd-table">
              <thead>
                <tr>
                  <th>Sold product</th>
                  <th style={{ textAlign: "right" }}>Products sold</th>
                  <th style={{ textAlign: "right" }}>Required per product</th>
                  <th style={{ textAlign: "right" }}>
                    Total ingredient consumed
                  </th>
                </tr>
              </thead>
              <tbody>
                {r.recipeEvidence.map((x, i) => (
                  <tr key={`${x.product}-${i}`}>
                    <td>{x.product}</td>
                    <td style={{ textAlign: "right" }}>{x.productsSold}</td>
                    <td style={{ textAlign: "right" }}>
                      {x.perProduct} {x.unit}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>
                      {x.consumed} {x.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {r.movements.length ? (
          txTable(r.movements)
        ) : (
          <VEmptyState
            icon={FileText}
            title="Incomplete stock movement records"
            sub="No ingredient batch evidence was returned for this ingredient or SKU."
          />
        )}
      </>
    );
  }

  return (
    <div
      className="bd-modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "rgba(36,49,12,0.46)",
        backdropFilter: "blur(5px)",
        zIndex: 99999,
      }}
    >
      <div
        className="bd-scope bd-modal-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          top: "auto",
          left: "auto",
          transform: "none",
          width: "min(880px, calc(100vw - 48px))",
          maxHeight: "82vh",
          margin: "0 auto",
          background: C.white,
          border: `1px solid ${C.greenMid}`,
          borderRadius: 20,
          boxShadow: "0 26px 75px rgba(36,49,12,0.32)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          animation: "none",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            background: C.bg,
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: 14.5, color: C.greenDk }}>
              {drill.title}
            </div>
            <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>
              {brand} → {branch} → evidence source records
            </div>
          </div>
          <button
            className="bd-icon-btn"
            onClick={onClose}
            style={{
              borderColor: C.border,
              color: C.greenDk,
              background: C.white,
            }}
          >
            <X size={14} />
          </button>
        </div>
        <div
          style={{
            padding: "14px 16px 20px",
            overflowY: "auto",
            background: C.white,
          }}
        >
          {body}
        </div>
      </div>
    </div>
  );
}

function MaDashboardContent({ transactions, brands, user }) {
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
      alert("Select both dates.");
      return;
    }
    if (customFrom > customTo) {
      alert('"From" cannot be after "To".');
      return;
    }
    setAppliedRange({ from: customFrom, to: customTo });
    setViewingArchive(null);
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
        .fr-db-kpi  { background:#fff; border:1px solid #E1E6D8; border-radius:16px; padding:20px 22px; box-shadow:0 8px 24px rgba(50,109,32,0.06); transition:transform .2s,box-shadow .2s; }
        .fr-db-kpi:hover { transform:translateY(-2px); box-shadow:0 12px 28px rgba(50,109,32,0.10); }
        .fr-db-chart { background:#fff; border:1px solid #E1E6D8; border-radius:16px; padding:22px 24px 16px; box-shadow:0 8px 24px rgba(50,109,32,0.06); margin-bottom:18px; }
        .fr-db-ins  { background:#fff; border:1px solid #E1E6D8; border-radius:16px; padding:18px 20px; box-shadow:0 8px 24px rgba(50,109,32,0.06); }
        .fr-db-tab-group { display:flex; gap:3px; background:#F6F7F1; border:1px solid #E1E6D8; border-radius:999px; padding:4px; }
        .fr-db-tab { padding:6px 14px; border-radius:999px; border:none; background:transparent; font-size:12px; font-weight:600; color:#5C6B60; cursor:pointer; transition:all .15s; font-family:inherit; }
        .fr-db-tab.active { background:linear-gradient(135deg,#509820,#3b791e); color:#fff; box-shadow:0 2px 8px rgba(59,121,30,.35); }
        .fr-db-tab:hover:not(.active) { color:#12241B; background:#f0f5e8; }
        .fr-db-date { padding:7px 11px; border-radius:9px; border:1.5px solid #D4DBC8; background:#F6F7F1; font-size:12px; font-family:inherit; color:#12241B; outline:none; }
        .fr-db-date:focus { border-color:#3b791e; }
        .fr-db-apply { padding:7px 16px; border-radius:9px; border:none; background:linear-gradient(135deg,#509820,#3b791e); color:#fff; font-size:12px; font-weight:700; cursor:pointer; font-family:inherit; }
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

      {/* Compact KPI row — visible in every decision workspace */}
      <div className="fr-db-kpi-grid">
        {[
          {
            label: "Today's Revenue",
            value: fmtPeso(todayRevenue),
            sub: `${todaySales.length} completed transactions`,
            icon: <DollarSign size={17} />,
            color: "#3b791e",
            bg: "#F2F7EB",
            rows: todaySales,
          },
          {
            label: "Period Revenue",
            value: kpiLoading ? "…" : fmtPeso(kpiData?.salesRevenue ?? 0),
            sub: `${getRangeLabel()} · ${userBranch || "Branch"}`,
            icon: <BarChart size={17} />,
            color: "#3b791e",
            bg: "#F2F7EB",
            rows: sortedBranchTransactions,
          },
          {
            label: "Period Profit",
            value: kpiLoading
              ? "…"
              : kpiData?.salesProfit == null
                ? "Not available"
                : fmtPeso(kpiData.salesProfit),
            sub: "Requires recorded cost of sales",
            icon: <TrendingUp size={17} />,
            color: "#3b791e",
            bg: "#F2F7EB",
            rows: sortedBranchTransactions,
          },
          {
            label: "Average Sale",
            value: fmtPeso(isNaN(avgOrder) ? 0 : avgOrder),
            sub: "Revenue per transaction today",
            icon: <ShoppingCart size={17} />,
            color: "#3b791e",
            bg: "#F2F7EB",
            rows: todaySales,
          },
        ].map((k, i) => (
          <div
            key={i}
            className="fr-db-kpi"
            role="button"
            tabIndex={0}
            onClick={() =>
              setDashboardDrilldown({
                title: k.label,
                rows: [...k.rows].sort(
                  (a, b) => Number(b.total || 0) - Number(a.total || 0),
                ),
              })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                setDashboardDrilldown({
                  title: k.label,
                  rows: [...k.rows].sort(
                    (a, b) => Number(b.total || 0) - Number(a.total || 0),
                  ),
                });
            }}
            style={{ cursor: "pointer" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 850,
                  textTransform: "uppercase",
                  letterSpacing: ".08em",
                  color: "#3b791e",
                }}
              >
                {k.label}
              </div>
              <div
                style={{
                  width: 31,
                  height: 31,
                  borderRadius: 9,
                  background: k.bg,
                  color: k.color,
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
              }}
            >
              {k.value}
            </div>
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                color: "#9CA89C",
                marginTop: 6,
                lineHeight: 1.45,
              }}
            >
              {k.sub}
            </div>
            <div
              style={{
                fontSize: 9.5,
                fontWeight: 800,
                color: "#3b791e",
                marginTop: 8,
              }}
            >
              View sorted breakdown →
            </div>
          </div>
        ))}
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
            ? "Use revenue, profit, average sale, best sellers, peak hours, and payment mix to understand the branch at a glance."
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
            style={{ maxWidth: 760, padding: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "18px 20px",
                borderBottom: "1px solid #E1E6D8",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{ fontSize: 16, fontWeight: 850, color: "#12241B" }}
                >
                  {dashboardDrilldown.title}
                </div>
                <div style={{ fontSize: 10.5, color: "#5C6B60", marginTop: 3 }}>
                  {userBranch} · highest-value transactions first
                </div>
              </div>
              <button
                onClick={() => setDashboardDrilldown(null)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  border: "1px solid #E1E6D8",
                  background: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={15} />
              </button>
            </div>
            <div style={{ padding: 20, maxHeight: "65vh", overflowY: "auto" }}>
              {dashboardDrilldown.rows.length === 0 ? (
                <VEmptyState
                  icon={BarChart2}
                  title="No branch data"
                  sub="No completed transactions are available for this selection."
                />
              ) : (
                <table className="v-table">
                  <thead>
                    <tr>
                      <th>Transaction</th>
                      <th>Date</th>
                      <th>Payment</th>
                      <th style={{ textAlign: "right" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardDrilldown.rows.map((tx, index) => (
                      <tr key={tx.id || tx.transaction_id || index}>
                        <td style={{ fontWeight: 750 }}>
                          {tx.transaction_id ||
                            tx.reference_no ||
                            tx.id ||
                            `Transaction ${index + 1}`}
                        </td>
                        <td>
                          {new Date(tx.created_at || tx.date).toLocaleString(
                            "en-PH",
                          )}
                        </td>
                        <td>
                          {tx.payment_method ||
                            tx.paymentMethod ||
                            tx.payment_type ||
                            "Not recorded"}
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            fontWeight: 800,
                            color: "#3b791e",
                          }}
                        >
                          {fmtPeso(tx.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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

function MaReportsContent({ user, transactions = [] }) {
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
    background: "#fafffc",
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
    switch (selectedTab) {
      case "recent":
        return mergedAnnouncements.filter(
          (a) => new Date(a.created_at) >= sevenDaysAgo,
        );
      case "pinned":
        return mergedAnnouncements.filter((a) => a.pinned);
      default:
        return mergedAnnouncements;
    }
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
      height: "100%",
    },
    header: {
      background: "linear-gradient(135deg,#3b791e,#3b791e)",
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
      background: "rgba(255,255,255,0.18)",
      borderRadius: 20,
      padding: "5px 11px",
      border: "1px solid rgba(255,255,255,0.3)",
    },
    liveDot: {
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: "#d4df33",
      boxShadow: "0 0 0 3px rgba(212,223,51,0.3)",
    },
    liveTxt: {
      fontSize: 9,
      fontWeight: 800,
      color: "#d4df33",
      letterSpacing: "0.15em",
    },
    searchBarWrap: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: "rgba(255,255,255,0.18)",
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
      background: "#fbfdf6",
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
      background: "linear-gradient(135deg,#3b791e,#4CAF50)",
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
        : "0 2px 10px rgba(50,109,32,0.07)",
      overflow: "hidden",
      cursor: "pointer",
      transition: "transform .15s, box-shadow .15s",
    }),
    cardAccentBar: (pinned) => ({
      width: 4,
      flexShrink: 0,
      background: pinned
        ? "linear-gradient(180deg,#F9A825,#FFC107)"
        : "linear-gradient(180deg,#3b791e,#4CAF50)",
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
    cardDate: { fontSize: 10, color: "#8AAD96", fontFamily: "monospace" },
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
      color: "#8AAD96",
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
      background: "#E1E6D8",
      borderRadius: 6,
      padding: "2px 6px",
      border: "1px solid #D4DBC8",
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
    emptyIcon: {
      display: "flex",
      justifyContent: "center",
      color: "#3b791e",
      marginBottom: 4,
    },
    emptyTitle: { fontSize: 15, fontWeight: 800, color: "#12241B" },
    emptySub: {
      fontSize: 12,
      color: "#8AAD96",
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
        @import url('https://fonts.googleapis.com/css2?family=Plus Jakarta Sans:wght@400;500;600;700;800;900&display=swap');
        .comm-card:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 20px rgba(50,109,32,0.12) !important; }
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
            <div style={commStyles.headerTitle}>Announcements</div>
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
                  background: "rgba(255,255,255,0.18)",
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
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <X size={15} />
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
                  : "#e8f5e9",
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
            <div style={commStyles.emptyIcon}>
              <EmptyIcon size={38} strokeWidth={1.7} />
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
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
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
                    <Pin
                      size={13}
                      fill={viewingItem.pinned ? "currentColor" : "none"}
                    />{" "}
                    {viewingItem.pinned ? "Unpin" : "Pin"}
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
                      background: "linear-gradient(135deg,#3b791e,#3b791e)",
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
                background: "linear-gradient(135deg,#3b791e,#3b791e)",
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
                  background: "rgba(255,255,255,0.18)",
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
                    background: "linear-gradient(135deg,#3b791e,#3b791e)",
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

function ProfileContent({ user }) {
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

function NotificationBell({ notifications, loading, onRefresh, onNavigate }) {
  const [open, setOpen] = useState(false);
  const [liveNotif, setLiveNotif] = useState(null);
  const [readCounts, setReadCounts] = useState({});

  const wrapRef = useRef(null);
  const previousCountsRef = useRef({});
  const initializedRef = useRef(false);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /*
    ========================================================
    LIVE NOTIFICATION DETECTOR
    ========================================================
    */

  useEffect(() => {
    if (!notifications) return;

    const currentCounts = {};

    notifications.forEach((n) => {
      currentCounts[n.id] = n.count || 0;
    });

    /*
        Initial load:
        store existing counts but don't show a splash.
      */
    if (!initializedRef.current) {
      previousCountsRef.current = currentCounts;
      initializedRef.current = true;
      return;
    }

    let newNotification = null;

    for (const n of notifications) {
      const previousCount = previousCountsRef.current[n.id] || 0;

      const currentCount = n.count || 0;

      if (currentCount > previousCount) {
        newNotification = n;
        break;
      }
    }

    previousCountsRef.current = currentCounts;

    if (newNotification) {
      setLiveNotif(newNotification);

      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }

      toastTimerRef.current = setTimeout(() => {
        setLiveNotif(null);
      }, 5000);
    }
  }, [notifications]);

  /*
    ========================================================
    CLEAN TIMER
    ========================================================
    */

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  /*
    ========================================================
    READ / UNREAD NOTIFICATION COUNTS
    ========================================================

    Clicking a notification marks the CURRENT count for that
    notification as read. Only newly-added counts appear again.
    */

  useEffect(() => {
    setReadCounts((prev) => {
      const next = { ...prev };
      const currentById = new Map(
        (Array.isArray(notifications) ? notifications : []).map((n) => [
          n.id,
          Number(n.count || 0),
        ]),
      );

      let changed = false;

      // If a notification disappeared completely, reset its read count
      // so a future occurrence starts as unread again.
      Object.keys(next).forEach((id) => {
        if (!currentById.has(id)) {
          if (next[id] !== 0) {
            next[id] = 0;
            changed = true;
          }
          return;
        }

        const currentCount = currentById.get(id);
        const readCount = Number(next[id] || 0);

        // If the server count decreased after an item was resolved,
        // keep the remembered read count within the current total.
        if (readCount > currentCount) {
          next[id] = currentCount;
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [notifications]);

  const markNotificationAsRead = (notification) => {
    if (!notification?.id) return;

    setReadCounts((prev) => ({
      ...prev,
      [notification.id]: Number(notification.count || 0),
    }));
  };

  const visibleNotifications = (
    Array.isArray(notifications) ? notifications : []
  )
    .map((n) => {
      const currentCount = Number(n.count || 0);
      const alreadyRead = Number(readCounts[n.id] || 0);
      const unreadCount = Math.max(currentCount - alreadyRead, 0);

      return {
        ...n,
        unreadCount,
      };
    })
    .filter((n) => n.unreadCount > 0);

  const totalCount = visibleNotifications.reduce(
    (sum, n) => sum + n.unreadCount,
    0,
  );

  return (
    <>
      {/* ====================================================
            LIVE NOTIFICATION SPLASH
            TOP RIGHT
        ==================================================== */}

      {liveNotif && (
        <div
          className="franchisync-live-toast"
          onClick={() => {
            markNotificationAsRead(liveNotif);
            onNavigate(liveNotif);
            setLiveNotif(null);
          }}
        >
          {/* ICON */}

          <div className="franchisync-toast-icon">
            <liveNotif.icon size={19} strokeWidth={2.2} color="#2E7D32" />
          </div>

          {/* CONTENT */}

          <div
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,

                  color: "#2E7D32",

                  textTransform: "uppercase",
                  letterSpacing: ".5px",

                  background: "#EDF7EF",

                  border: "1px solid #B9DDBF",

                  borderRadius: 20,

                  padding: "3px 7px",
                }}
              >
                New
              </span>

              <div
                style={{
                  fontSize: 13.5,
                  fontWeight: 800,

                  color: "#234329",

                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {liveNotif.title}
              </div>
            </div>

            <div
              style={{
                marginTop: 6,

                fontSize: 12,
                fontWeight: 500,

                color: "#5F6D63",

                lineHeight: 1.5,

                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {liveNotif.message}
            </div>

            <div
              style={{
                marginTop: 7,

                fontSize: 10.5,
                fontWeight: 700,

                color: "#2E7D32",
              }}
            >
              Click to view
            </div>
          </div>

          {/* CLOSE */}

          <button
            type="button"
            className="franchisync-toast-close"
            title="Close"
            onClick={(e) => {
              e.stopPropagation();
              setLiveNotif(null);
            }}
          >
            <X size={16} strokeWidth={2} />
          </button>

          {/* AUTO CLOSE PROGRESS */}

          <div className="franchisync-toast-progress" />
        </div>
      )}

      {/* ====================================================
            YOUR ORIGINAL NOTIFICATION BELL
        ==================================================== */}

      <div
        ref={wrapRef}
        style={{
          position: "relative",
        }}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          title="Notifications"
          style={{
            position: "relative",

            width: 42,
            height: 42,

            borderRadius: 11,

            border: `1px solid ${open ? "#2E7D32" : "#B9DDBF"}`,

            background: open ? "#E8F5EA" : "#EDF7EF",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            cursor: "pointer",

            transition: "all .2s ease",

            boxShadow: open
              ? "0 4px 14px rgba(46,125,50,.14)"
              : "0 2px 8px rgba(46,125,50,.07)",

            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#2E7D32";

            e.currentTarget.style.background = "#E8F5EA";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = open ? "#2E7D32" : "#B9DDBF";

            e.currentTarget.style.background = open ? "#E8F5EA" : "#EDF7EF";
          }}
        >
          <Bell size={19} color="#2E7D32" strokeWidth={2.1} />

          {totalCount > 0 && (
            <span
              style={{
                position: "absolute",

                top: -5,
                right: -5,

                minWidth: 19,
                height: 19,

                borderRadius: 10,

                padding: "0 4px",

                background: "linear-gradient(135deg,#ef4444,#dc2626)",

                color: "#fff",

                fontSize: 10,
                fontWeight: 800,

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                border: "2px solid #fff",

                fontFamily: "'Plus Jakarta Sans',sans-serif", //dito

                boxShadow: "0 2px 6px rgba(220,38,38,.22)",
              }}
            >
              {totalCount > 99 ? "99+" : totalCount}
            </span>
          )}
        </button>

        {/* ==================================================
              DROPDOWN
          ================================================== */}

        {open && (
          <div
            className="franchisync-notification-dropdown"
            style={{
              position: "absolute",

              top: "calc(100% + 10px)",

              right: 0,

              width: 370,

              height: 430,

              maxWidth: "calc(100vw - 30px)",

              background: "#fff",

              borderRadius: 13,

              border: "1px solid #C7E0CB",

              boxShadow: "0 18px 45px rgba(15,23,42,.15)",

              overflow: "hidden",

              zIndex: 3000,

              fontFamily: "'Plus Jakarta Sans',sans-serif",

              display: "flex",
              flexDirection: "column",

              animation: "franchisyncDropdown .22s ease-out",
            }}
          >
            {/* HEADER */}

            <div
              style={{
                padding: "15px 18px",

                background: "linear-gradient(135deg,#256529,#2E7D32)",

                display: "flex",

                justifyContent: "space-between",

                alignItems: "center",

                flexShrink: 0,
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 14,

                    color: "#fff",
                  }}
                >
                  Notifications
                </div>

                <div
                  style={{
                    fontSize: 11,

                    color: "rgba(255,255,255,.78)",

                    marginTop: 3,
                  }}
                >
                  {totalCount > 0
                    ? `${totalCount} ${
                        totalCount !== 1 ? "notifications" : "notification"
                      } require attention`
                    : "You're all caught up"}
                </div>
              </div>

              {/* REFRESH */}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRefresh();
                }}
                title="Refresh"
                style={{
                  width: 30,
                  height: 30,

                  borderRadius: 8,

                  border: "1px solid rgba(255,255,255,.45)",

                  background: "rgba(255,255,255,.15)",

                  color: "#fff",

                  cursor: "pointer",

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  flexShrink: 0,

                  transition: "all .2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fff";

                  e.currentTarget.style.color = "#2E7D32";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,.15)";

                  e.currentTarget.style.color = "#fff";
                }}
              >
                <RefreshCw
                  size={13}
                  style={{
                    animation: loading
                      ? "notificationSpin .8s linear infinite"
                      : "none",
                  }}
                />
              </button>
            </div>

            {/* ==================================================
                  VERTICAL NOTIFICATION LIST
              ================================================== */}

            <div
              className="franchisync-notification-scroll"
              style={{
                overflowY: "auto",
                overflowX: "hidden",

                flex: 1,

                minHeight: 0,

                background: "#fff",
              }}
            >
              {loading && !notifications?.length ? (
                <div
                  style={{
                    padding: "45px 0",

                    textAlign: "center",

                    color: "#5A7A65",

                    fontSize: 13,
                  }}
                >
                  <RefreshCw
                    size={20}
                    color="#2E7D32"
                    style={{
                      marginBottom: 9,

                      animation: "notificationSpin .8s linear infinite",
                    }}
                  />

                  <div>Loading notifications...</div>
                </div>
              ) : visibleNotifications.length === 0 ? (
                /* EMPTY */

                <div
                  style={{
                    padding: "45px 20px",

                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,

                      borderRadius: 10,

                      background: "#EDF7EF",

                      border: "1px solid #B9DDBF",

                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",

                      margin: "0 auto 11px",
                    }}
                  >
                    <Check size={20} color="#2E7D32" />
                  </div>

                  <div
                    style={{
                      fontSize: 13,

                      fontWeight: 700,

                      color: "#243128",
                    }}
                  >
                    Nothing needs your attention
                  </div>

                  <div
                    style={{
                      fontSize: 11.5,

                      color: "#829087",

                      marginTop: 4,
                    }}
                  >
                    New alerts will show up here.
                  </div>
                </div>
              ) : (
                visibleNotifications.map((n, index) => (
                  <div
                    key={n.id}
                    /*
                        =========================================
                        CLICK SPECIFIC NOTIFICATION
                        =========================================

                        This keeps your original redirect logic.

                        onNavigate(n) receives the selected
                        notification and your parent component
                        decides which module to open.
                        */

                    onClick={() => {
                      markNotificationAsRead(n);
                      onNavigate(n);
                      setOpen(false);
                    }}
                    style={{
                      display: "flex",

                      gap: 12,

                      padding: "14px 18px",

                      cursor: "pointer",

                      borderBottom:
                        index !== visibleNotifications.length - 1
                          ? "1px solid #EEF3EF"
                          : "none",

                      alignItems: "flex-start",

                      background: "#fff",

                      transition: "background .18s ease, transform .18s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#F5FAF6";

                      e.currentTarget.style.transform = "translateX(2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#fff";

                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    {/* ICON */}

                    <div
                      style={{
                        width: 38,
                        height: 38,

                        borderRadius: 9,

                        // Uniform FranchiSync icon style
                        background: "#EDF7EF",

                        border: "1px solid #B9DDBF",

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center",

                        flexShrink: 0,
                      }}
                    >
                      <n.icon size={17} strokeWidth={2} color="#2E7D32" />
                    </div>

                    {/* DETAILS */}

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",

                          justifyContent: "space-between",

                          alignItems: "flex-start",

                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,

                            fontSize: 12.75,

                            color: "#243128",

                            lineHeight: 1.4,

                            overflow: "hidden",

                            textOverflow: "ellipsis",

                            whiteSpace: "nowrap",
                          }}
                        >
                          {n.title}
                        </span>

                        {n.count > 0 && (
                          <span
                            style={{
                              flexShrink: 0,

                              minWidth: 22,

                              height: 21,

                              padding: "0 6px",

                              borderRadius: 6,

                              display: "flex",

                              alignItems: "center",

                              justifyContent: "center",

                              fontSize: 10,

                              fontWeight: 800,

                              lineHeight: 1,

                              background: "#EDF7EF",

                              color: "#2E7D32",

                              border: "1px solid #B9DDBF",

                              boxSizing: "border-box",
                            }}
                          >
                            {n.unreadCount > 99 ? "99+" : n.unreadCount}
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: 11.75,

                          color: "#65736A",

                          marginTop: 4,

                          lineHeight: 1.45,
                        }}
                      >
                        {n.message}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ====================================================
              STYLE / MOTION
          ==================================================== */}

        <style>
          {`

              /* ================================
                DROPDOWN
              ================================= */

              @keyframes franchisyncDropdown {
                0% {
                  opacity: 0;
                  transform: translateY(-7px) scale(.98);
                }

                100% {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }


              /* ================================
                TOP RIGHT LIVE SPLASH
              ================================= */

              .franchisync-live-toast {
                position: fixed;

                top: 22px;
                right: 24px;

                width: 410px;
                max-width: calc(100vw - 32px);

                min-height: 88px;

                padding: 16px 17px;

                background: #FFFDF3;

                border: 1.5px solid #2E7D32;

                border-radius: 13px;

                box-shadow:
                  0 16px 45px rgba(15,23,42,.18),
                  0 3px 10px rgba(46,125,50,.08);

                z-index: 99999;

                display: flex;

                align-items: flex-start;

                gap: 13px;

                box-sizing: border-box;

                font-family:
                  'Plus Jakarta Sans',
                  sans-serif;

                cursor: pointer;

                overflow: hidden;

                animation:
                  franchisyncLiveSplash
                  .52s
                  cubic-bezier(.22,1,.36,1);
              }


              .franchisync-live-toast:hover {
                background: #FFFBEA;

                box-shadow:
                  0 18px 48px rgba(15,23,42,.21),
                  0 4px 14px rgba(46,125,50,.10);

                transform: translateY(2px);
              }


              .franchisync-toast-icon {
                width: 40px;
                height: 40px;

                border-radius: 9px;

                background: #EDF7EF;

                border: 1px solid #2E7D32;

                display: flex;

                align-items: center;
                justify-content: center;

                flex-shrink: 0;

                box-shadow:
                  0 3px 8px rgba(46,125,50,.08);
              }


              .franchisync-toast-close {
                width: 27px;
                height: 27px;

                border: none;

                border-radius: 7px;

                background: transparent;

                color: #59675D;

                display: flex;

                align-items: center;
                justify-content: center;

                cursor: pointer;

                flex-shrink: 0;

                transition:
                  background .18s ease,
                  color .18s ease;
              }


              .franchisync-toast-close:hover {
                background: rgba(46,125,50,.08);

                color: #2E7D32;
              }


              @keyframes franchisyncLiveSplash {

                0% {
                  opacity: 0;

                  transform:
                    translateX(65px)
                    translateY(-12px)
                    scale(.92);
                }

                55% {
                  opacity: 1;

                  transform:
                    translateX(-7px)
                    translateY(0)
                    scale(1.015);
                }

                75% {
                  transform:
                    translateX(3px)
                    translateY(0)
                    scale(.997);
                }

                100% {
                  opacity: 1;

                  transform:
                    translateX(0)
                    translateY(0)
                    scale(1);
                }
              }


              /* ================================
                5 SECOND PROGRESS BAR
              ================================= */

              .franchisync-toast-progress {
                position: absolute;

                left: 0;
                bottom: 0;

                height: 3px;

                background:
                  linear-gradient(
                    90deg,
                    #2E7D32,
                    #66A96B
                  );

                animation:
                  franchisyncToastProgress
                  5s
                  linear forwards;
              }


              @keyframes franchisyncToastProgress {

                0% {
                  width: 100%;
                }

                100% {
                  width: 0%;
                }
              }


              /* ================================
                SCROLLBAR
              ================================= */

              .franchisync-notification-scroll {
                scrollbar-width: thin;

                scrollbar-color:
                  #A8D1AE
                  #F2F7F3;

                overscroll-behavior:
                  contain;
              }


              .franchisync-notification-scroll::-webkit-scrollbar {
                width: 7px;
              }


              .franchisync-notification-scroll::-webkit-scrollbar-track {
                background:
                  #F2F7F3;
              }


              .franchisync-notification-scroll::-webkit-scrollbar-thumb {
                background:
                  #A8D1AE;

                border-radius:
                  10px;

                border:
                  2px solid #F2F7F3;
              }


              .franchisync-notification-scroll::-webkit-scrollbar-thumb:hover {
                background:
                  #2E7D32;
              }


              /* ================================
                REFRESH
              ================================= */

              @keyframes notificationSpin {

                from {
                  transform:
                    rotate(0deg);
                }

                to {
                  transform:
                    rotate(360deg);
                }
              }


              /* ================================
                MOBILE
              ================================= */

              @media (max-width: 600px) {

                .franchisync-live-toast {

                  top: 12px;

                  left: 12px;
                  right: 12px;

                  width: auto;

                  max-width: none;
                }
              }

            `}
        </style>
      </div>
    </>
  );
}
