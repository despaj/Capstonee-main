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
    { id: "menuInventory", label: "Menu Inventory", icon: <Box size={20} /> },
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
          {activeModule === "profile" && <FrProfileContent user={user} />}
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

function FrProfileContent({ user }) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    personalEmail: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");

  const initials = user?.name
    ? user.name
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const sendOtp = async () => {
    try {
      const email = formData.personalEmail || formData.email;
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/send-otp-password-change`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      const d = await res.json();
      if (d.success) {
        setOtpSent(true);
        alert(`OTP sent to ${email}`);
      } else alert(d.error || "Failed to send OTP");
    } catch {
      alert("Failed to send OTP.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.currentPassword || formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        alert("Passwords don't match!");
        return;
      }
      sendOtp();
      setShowOtpModal(true);
    } else {
      alert("Profile updated successfully!");
    }
  };

  return (
    <div>
      <div
        style={{
          background: "var(--grad-dark)",
          borderRadius: 20,
          padding: "28px 28px 20px",
          marginBottom: 22,
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: "var(--grad-gold)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 26,
            color: "#fff",
            fontFamily: "Plus Jakarta Sans,sans-serif",
            boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div>
          <div
            style={{
              fontFamily: "Plus Jakarta Sans,sans-serif",
              fontWeight: 800,
              fontSize: 20,
              color: "#fff",
            }}
          >
            {user?.name}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.6)",
              marginTop: 3,
              fontFamily: "Plus Jakarta Sans,sans-serif",
            }}
          >
            Franchisee · {user?.branch}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <span
              className="v-badge v-badge-green"
              style={{ background: "rgba(80,152,32,0.2)", color: "#a7f3d0" }}
            >
              Franchisee
            </span>
            {user?.branch && (
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  background: "rgba(255,255,255,0.12)",
                  color: "#fff",
                  fontFamily: "Plus Jakarta Sans,sans-serif",
                }}
              >
                {user.branch}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div className="v-card" style={{ padding: "22px 24px" }}>
          <div className="v-section-head">
            <VSectionTitle icon={<User size={16} />}>
              Personal Information
            </VSectionTitle>
          </div>
          <form onSubmit={handleSubmit}>
            {[
              ["Full Name", "name", "text"],
              ["Work Email", "email", "email"],
            ].map(([label, name, type]) => (
              <div key={name} className="v-form-group">
                <label className="v-form-label">{label}</label>
                <input
                  type={type}
                  value={formData[name]}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, [name]: e.target.value }))
                  }
                  className="v-form-input"
                />
              </div>
            ))}
            <div className="v-form-group">
              <label className="v-form-label">
                Personal Email{" "}
                <span
                  style={{
                    textTransform: "none",
                    fontWeight: 500,
                    color: "#9CA89C",
                  }}
                >
                  (for OTP)
                </span>
              </label>
              <input
                type="email"
                value={formData.personalEmail}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, personalEmail: e.target.value }))
                }
                placeholder="your.personal@email.com"
                className="v-form-input"
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="submit"
                className="v-btn v-btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
              >
                <Check size={14} /> Save Changes
              </button>
            </div>
          </form>
        </div>

        <div className="v-card" style={{ padding: "22px 24px" }}>
          <div className="v-section-head">
            <VSectionTitle icon={<Lock size={16} />}>
              Change Password
            </VSectionTitle>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              background: "rgba(59,121,30,0.06)",
              border: "1.5px solid rgba(59,121,30,0.15)",
              borderRadius: 12,
              marginBottom: 20,
            }}
          >
            <Shield size={14} color="#3b791e" />
            <span
              style={{
                fontSize: 12,
                color: "#5C6B60",
                fontWeight: 600,
                fontFamily: "Plus Jakarta Sans,sans-serif",
              }}
            >
              OTP will be sent to your email for verification
            </span>
          </div>
          <form onSubmit={handleSubmit}>
            {[
              ["Current Password", "currentPassword"],
              ["New Password", "newPassword"],
              ["Confirm Password", "confirmPassword"],
            ].map(([label, name]) => (
              <div key={name} className="v-form-group">
                <label className="v-form-label">{label}</label>
                <input
                  type="password"
                  value={formData[name]}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, [name]: e.target.value }))
                  }
                  className="v-form-input"
                />
              </div>
            ))}
            <button
              type="submit"
              className="v-btn v-btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <Lock size={14} /> Update Password
            </button>
          </form>
        </div>
      </div>

      {showOtpModal && (
        <div className="v-modal-overlay">
          <div
            className="v-modal"
            style={{ maxWidth: 440 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: "var(--grad-main)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                color: "#fff",
                boxShadow: "0 6px 20px rgba(59,121,30,.3)",
              }}
            >
              <Lock size={27} />
            </div>
            <h2 className="v-modal-title" style={{ textAlign: "center" }}>
              Verify OTP
            </h2>
            <p
              style={{
                color: "#9CA89C",
                fontSize: 13,
                textAlign: "center",
                margin: "8px 0 20px",
                fontFamily: "Plus Jakarta Sans,sans-serif",
              }}
            >
              Code sent to{" "}
              <strong style={{ color: "#3b791e" }}>
                {formData.personalEmail || formData.email}
              </strong>
            </p>
            <input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                setOtpError("");
              }}
              maxLength={6}
              autoFocus
              className="v-form-input"
              style={{
                fontSize: "1.8rem",
                textAlign: "center",
                letterSpacing: "0.6rem",
                fontFamily: "monospace",
                marginBottom: 12,
              }}
            />
            {otpError && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "rgba(239,68,68,0.08)",
                  border: "1.5px solid rgba(239,68,68,0.2)",
                  borderRadius: 12,
                  marginBottom: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <X size={14} color="#ef4444" />
                <span
                  style={{ color: "#ef4444", fontSize: 13, fontWeight: 700 }}
                >
                  {otpError}
                </span>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                className="v-btn v-btn-secondary"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => {
                  setShowOtpModal(false);
                  setOtp("");
                  setOtpSent(false);
                  setOtpError("");
                }}
              >
                Cancel
              </button>
              <button
                className="v-btn v-btn-primary"
                style={{
                  flex: 1,
                  justifyContent: "center",
                  opacity: otp.length !== 6 ? 0.5 : 1,
                }}
                disabled={otp.length !== 6}
              >
                <Check size={14} /> Verify & Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
/* ===== INLINE STOCK INVENTORY MODULE ===== */
const StockInventoryContent = (() => {
  const C = {
    green: "#3b791e",
    greenDk: "#2c5c16",
    greenLt: "#f0f5e8",
    greenMid: "#c9dba0",
    teal: "#509820",
    lime: "#cac055",
    limeInk: "#24310C",
    ink: "#24700d",
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
    amber: "#d97706",
    amberBg: "#fff7ed",
    amberBorder: "#fed7aa",
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

  /* ── shared style atoms ── */
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
    transition: "border-color .15s",
  };
  const invLabelSt = {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    color: C.muted,
    marginBottom: 5,
    letterSpacing: "0.04em",
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
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
    color: C.ink,
    transition: "background .15s, border-color .15s",
  };
  const btnPrimarySt = {
    ...btnSt,
    background: C.green,
    color: C.white,
    border: "none",
    boxShadow: "0 10px 24px rgba(59,121,30,0.22)",
  };
  const btnAmberSt = {
    ...btnSt,
    background: `linear-gradient(135deg,#fbbf24,${C.warn})`,
    color: C.white,
    border: "none",
    boxShadow: "0 2px 10px rgba(217,119,6,0.30)",
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
    background: "transparent",
    transition: "background .12s, color .12s",
  };

  const capitalizeName = (str) => str.replace(/\b\w/g, (c) => c.toUpperCase());
  const normalizeName = (str) => str.trim().toLowerCase().replace(/s$/i, "");

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
    "gallons",
  ];
  const DOSAGE_FORMS = [
    "Tablet",
    "Capsule",
    "Liquid",
    "Injection",
    "Cream",
    "Ointment",
    "Syrup",
    "Other",
  ];
  const STORAGE_REQS = ["Room Temperature", "Refrigerated", "Frozen"];
  const FUEL_GRADES = [
    "Regular Gasoline",
    "Ethanol-Blended Gasoline",
    "Premium Gasoline",
    "Diesel",
    "Kerosene",
  ];
  const PAGE_SIZE = 15;
  const EXPIRY_WARN_DAYS = 30;

  const fmtTs = (d) =>
    new Date(d).toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Manila",
    });
  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-PH", {
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: "Asia/Manila",
        })
      : "—";

  /* ── validation helpers ── */
  function isValidDateStr(s) {
    if (!s) return true;
    const d = new Date(s);
    return !isNaN(d.getTime());
  }
  function isPositiveOrZeroNumber(v) {
    if (v === "" || v === null || v === undefined) return false;
    const n = parseFloat(v);
    return !isNaN(n) && n >= 0;
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
          background: isErr ? "#fef2f2" : "#f0fdf5",
          borderLeft: `5px solid ${isErr ? "#dc2626" : "#00897b"}`,
          border: `1px solid ${isErr ? "#fecaca" : "#b2dfdb"}`,
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
            background: isErr ? "#dc2626" : "#00897b",
            color: "#fff",
            boxShadow: `0 4px 10px ${isErr ? "rgba(220,38,38,0.4)" : "rgba(0,137,123,0.4)"}`,
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
              color: isErr ? "#7f1d1d" : "#0d2b1e",
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
  /* ── Lucide icon aliases/wrappers ── */
  const SearchIcon = Search;
  const EditIcon = Pencil;
  const TrashIcon = Trash2;
  const XIcon = X;
  const PlusIcon = Plus;
  const StoreIcon = Store;
  const FileIcon = FileText;
  const SortAscIcon = ArrowUp;
  const SortDescIcon = ArrowDown;
  const FilterIcon = Filter;
  const ChevronIcon = ({ size = 12, dir = "down", ...props }) =>
    dir === "up" ? (
      <ChevronUp size={size} {...props} />
    ) : (
      <ChevronDown size={size} {...props} />
    );
  const HistoryIcon = History;
  const RestoreIcon = RotateCcw;
  const ActivityIcon = Activity;
  const AlertCircleIcon = AlertCircle;
  const CheckCircleIcon = CheckCircle2;
  const InfoIcon = Info;
  const LoaderIcon = ({ size = 28, color = "currentColor" }) => (
    <LoaderCircle
      size={size}
      color={color}
      style={{ animation: "spin 0.9s linear infinite" }}
    />
  );
  const UploadIcon = UploadCloud;
  const ArrowLeftIcon = ArrowLeft;
  const ArrowRightIcon = ArrowRight;
  const TruckIcon = Truck;
  const PackageIcon = Package;

  /* ── Brand accent colors (for brand column text only — no bg pill) ── */
  function brandAccent(brandName) {
    if (!brandName) return { color: "#00695c" };
    const n = brandName.toLowerCase();
    if (n.includes("ipharma")) return { color: "#3949ab" };
    if (n.includes("coffee")) return { color: "#b45309" };
    if (n.includes("food caravan")) return { color: "#b91c1c" };
    if (n.includes("ifuel")) return { color: "#1565c0" };
    return { color: "#00695c" };
  }

  /* ── FIFO / FEFO helpers (shared by ReceiveStockModal, FifoQueue) ── */

  function computeExpiryStatus(exp_date, brand) {
    if (!exp_date) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const exp = new Date(exp_date);
    const msLeft = exp - now;
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
        topLabel: "EXPIRY DATE (FEFO KEY)",
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

  function computeNextOutCost(batches, brand, isPerishable) {
    const active = batches.filter((b) => Number(b.stock) > 0);
    if (active.length === 0) return null;
    const sorted = sortBatchesByMethod(active, brand, isPerishable);
    return Number(sorted[0].cost_per_unit) || 0;
  }

  function daysRemaining(exp_date) {
    if (!exp_date) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const exp = new Date(exp_date);
    return Math.round((exp - now) / 86400000);
  }

  const EXPIRY_STYLE = {
    expired: {
      border: "#fecaca",
      bg: "#fef2f2",
      badge: "#fecaca",
      badgeText: "#991b1b",
      label: "EXPIRED",
      dot: "#dc2626",
    },
    critical: {
      border: "#fed7aa",
      bg: "#fff7ed",
      badge: "#fed7aa",
      badgeText: "#9a3412",
      label: "CRITICAL",
      dot: "#ea580c",
    },
    warning: {
      border: "#fef08a",
      bg: "#fefce8",
      badge: "#fef08a",
      badgeText: "#854d0e",
      label: "EXPIRING",
      dot: "#ca8a04",
    },
    ok: {
      border: C.greenMid,
      bg: "#f9fefb",
      badge: null,
      badgeText: null,
      label: null,
      dot: C.green,
    },
  };

  const BRAND_DEFS = [
    { key: "coffee", label: "Coffee Spot", match: (n) => n.includes("coffee") },
    {
      key: "foodcaravan",
      label: "Food Caravan",
      match: (n) => n.includes("food caravan"),
    },
    { key: "ipharma", label: "iPharma", match: (n) => n.includes("ipharma") },
    { key: "ifuel", label: "iFuel", match: (n) => n.includes("ifuel") },
  ];

  function isPharmaBrand(brand) {
    return (brand || "").toLowerCase().includes("ipharma");
  }
  function isFuelBrand(brand) {
    return (brand || "").toLowerCase().includes("ifuel");
  }
  function isDirectProductBrand(brand) {
    return isPharmaBrand(brand) || isFuelBrand(brand);
  }

  // ── Category-based shelf-life validation ─────────────────────────────────────
  // IMPORTANT:
  // • iPharma expiry rules are based on the PRODUCT CATEGORY + manufacture date.
  // • iFuel expiry rules are based on the PRODUCT CATEGORY + manufacture date.
  // • Receiving date is still validated, but it is NOT the shelf-life base date.
  function normalizeShelfText(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[–—]/g, "-")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function parseLocalDateOnly(value) {
    if (!value) return null;
    const raw = String(value).slice(0, 10);
    const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) {
      const fallback = new Date(value);
      if (Number.isNaN(fallback.getTime())) return null;
      return new Date(
        fallback.getFullYear(),
        fallback.getMonth(),
        fallback.getDate(),
        12,
        0,
        0,
        0,
      );
    }
    const y = Number(m[1]),
      month = Number(m[2]),
      d = Number(m[3]);
    const date = new Date(y, month - 1, d, 12, 0, 0, 0);
    if (
      date.getFullYear() !== y ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== d
    )
      return null;
    return date;
  }

  function addMonthsClamped(dateValue, months) {
    const base =
      dateValue instanceof Date
        ? new Date(dateValue)
        : parseLocalDateOnly(dateValue);
    if (!base || Number.isNaN(base.getTime())) return null;

    const day = base.getDate();
    const target = new Date(
      base.getFullYear(),
      base.getMonth() + Number(months || 0),
      1,
      12,
      0,
      0,
      0,
    );
    const lastDay = new Date(
      target.getFullYear(),
      target.getMonth() + 1,
      0,
      12,
      0,
      0,
      0,
    ).getDate();
    target.setDate(Math.min(day, lastDay));
    return target;
  }

  function addDaysLocal(dateValue, days) {
    const base =
      dateValue instanceof Date
        ? new Date(dateValue)
        : parseLocalDateOnly(dateValue);
    if (!base || Number.isNaN(base.getTime())) return null;
    base.setDate(base.getDate() + Number(days || 0));
    return base;
  }

  function toDateInputValue(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  }

  /*
  iPharma category rules:
  - Medicine / Antibiotic / Vitamins & Supplements / other medicine-like
    categories: EXACTLY 36 months (3 years) from manufacture date.
  - First Aid / Medical Supplies / Bandages / Gauze / Hygiene:
    EXACTLY 9 months from manufacture date.
  - Health Devices / Equipment: expiry may be omitted when the manufacturer
    provides no expiry date.

  iFuel category rules:
  - Regular gasoline: 3–6 months from manufacture date.
  - Ethanol-blended gasoline: 1–3 months.
  - Premium gasoline: up to 9 months.
  - Diesel: up to 12 months.
*/
  function getCategoryShelfLifeRule(brand, category, grade = "") {
    const categoryKey = normalizeShelfText(category);
    const gradeKey = normalizeShelfText(grade);

    if (isPharmaBrand(brand)) {
      if (!categoryKey) {
        return {
          kind: "missing-category",
          allowNoExpiry: false,
          requiresManufactureDate: true,
          label: "iPharma category required",
        };
      }

      if (
        categoryKey.includes("health device") ||
        categoryKey.includes("medical device") ||
        categoryKey.includes("equipment")
      ) {
        return {
          kind: "manufacturer",
          allowNoExpiry: true,
          requiresManufactureDate: false,
          label: "Health device / equipment",
        };
      }

      if (
        categoryKey.includes("first aid") ||
        categoryKey.includes("medical suppl") ||
        categoryKey.includes("bandage") ||
        categoryKey.includes("gauze") ||
        categoryKey.includes("dressing") ||
        categoryKey.includes("hygiene")
      ) {
        return {
          kind: "exact",
          months: 9,
          allowNoExpiry: false,
          requiresManufactureDate: true,
          label: "9 months from manufacture date",
        };
      }

      // Medicine, Antibiotic, Vitamins & Supplements, and future medicine-like
      // iPharma categories use the 3-year shelf-life rule.
      return {
        kind: "exact",
        months: 36,
        allowNoExpiry: false,
        requiresManufactureDate: true,
        label: "3 years from manufacture date",
      };
    }

    if (isFuelBrand(brand)) {
      if (!categoryKey && !gradeKey) {
        return {
          kind: "missing-category",
          allowNoExpiry: false,
          requiresManufactureDate: true,
          label: "iFuel category required",
        };
      }

      // CATEGORY is authoritative. Grade is only a compatibility fallback for
      // older records that were saved before fuel categories were connected.
      const key = categoryKey || gradeKey;

      if (
        key.includes("ethanol") ||
        /\be10\b/.test(key) ||
        /\be15\b/.test(key) ||
        /\be85\b/.test(key)
      ) {
        return {
          kind: "range",
          minMonths: 1,
          maxMonths: 3,
          recommendedMonths: 3,
          allowNoExpiry: false,
          requiresManufactureDate: true,
          label: "Ethanol-blended gasoline · 1–3 months",
        };
      }

      if (key.includes("premium")) {
        return {
          kind: "max",
          maxMonths: 9,
          recommendedMonths: 9,
          allowNoExpiry: false,
          requiresManufactureDate: true,
          label: "Premium gasoline · up to 9 months",
        };
      }

      if (key.includes("diesel")) {
        return {
          kind: "max",
          maxMonths: 12,
          recommendedMonths: 12,
          allowNoExpiry: false,
          requiresManufactureDate: true,
          label: "Diesel · up to 12 months",
        };
      }

      if (
        key.includes("regular") ||
        key.includes("unleaded") ||
        key === "gasoline" ||
        key === "petrol" ||
        key.includes("regular gasoline")
      ) {
        return {
          kind: "range",
          minMonths: 3,
          maxMonths: 6,
          recommendedMonths: 6,
          allowNoExpiry: false,
          requiresManufactureDate: true,
          label: "Regular gasoline · 3–6 months",
        };
      }

      return {
        kind: "unconfigured-fuel",
        allowNoExpiry: false,
        requiresManufactureDate: true,
        label: "Fuel shelf life not configured for this category",
      };
    }

    return null;
  }

  function getExpiryBoundsFromManufacture(mfgDate, rule) {
    const mfg = parseLocalDateOnly(mfgDate);
    if (!mfg || !rule) {
      return {
        minDate: null,
        maxDate: null,
        recommendedDate: null,
        minStr: "",
        maxStr: "",
        recommendedStr: "",
      };
    }

    let minDate = null;
    let maxDate = null;
    let recommendedDate = null;

    if (rule.kind === "exact") {
      minDate = addMonthsClamped(mfg, rule.months);
      maxDate = minDate ? new Date(minDate) : null;
      recommendedDate = minDate ? new Date(minDate) : null;
    } else if (rule.kind === "range") {
      minDate = addMonthsClamped(mfg, rule.minMonths);
      maxDate = addMonthsClamped(mfg, rule.maxMonths);
      recommendedDate = addMonthsClamped(
        mfg,
        rule.recommendedMonths ?? rule.maxMonths,
      );
    } else if (rule.kind === "max") {
      minDate = addDaysLocal(mfg, 1);
      maxDate = addMonthsClamped(mfg, rule.maxMonths);
      recommendedDate = addMonthsClamped(
        mfg,
        rule.recommendedMonths ?? rule.maxMonths,
      );
    } else if (
      rule.kind === "manufacturer" ||
      rule.kind === "unconfigured-fuel"
    ) {
      minDate = addDaysLocal(mfg, 1);
    }

    return {
      minDate,
      maxDate,
      recommendedDate,
      minStr: toDateInputValue(minDate),
      maxStr: toDateInputValue(maxDate),
      recommendedStr: toDateInputValue(recommendedDate),
    };
  }

  function shelfLifeHelperText(rule, bounds, category) {
    if (!rule) return "";

    const categoryLabel = String(category || "").trim();

    if (rule.kind === "missing-category") {
      return "Assign a category to this product first. Expiry validation depends on the selected category.";
    }

    if (rule.kind === "exact") {
      if (!bounds?.recommendedStr) {
        return `${categoryLabel || "This category"} requires expiry ${rule.label}. Enter the manufacture date first.`;
      }
      return `${categoryLabel || "This category"}: expiry must be exactly ${rule.label}. Required date: ${fmtDate(bounds.recommendedStr)}.`;
    }

    if (rule.kind === "range") {
      if (!bounds?.minStr || !bounds?.maxStr) {
        return `${rule.label}. Enter the manufacture date first.`;
      }
      return `${rule.label}. Allowed expiry: ${fmtDate(bounds.minStr)} to ${fmtDate(bounds.maxStr)}.`;
    }

    if (rule.kind === "max") {
      if (!bounds?.maxStr) {
        return `${rule.label}. Enter the manufacture date first.`;
      }
      return `${rule.label}. Expiry must be after manufacture and no later than ${fmtDate(bounds.maxStr)}.`;
    }

    if (rule.kind === "manufacturer") {
      return "Use the manufacturer-provided expiry date. If the device/equipment has no expiry date, select “No expiry date”.";
    }

    if (rule.kind === "unconfigured-fuel") {
      return "This fuel category has no configured shelf-life rule. Use Regular Gasoline, Ethanol-Blended Gasoline, Premium Gasoline, or Diesel.";
    }

    return "";
  }

  function validateCategoryShelfLife({
    brand,
    category,
    grade,
    mfgDate,
    expiryDate,
    noExpiry = false,
  }) {
    const errors = [];
    const rule = getCategoryShelfLifeRule(brand, category, grade);

    if (!rule) return errors;

    if (rule.kind === "missing-category") {
      errors.push(
        `Assign a category to this ${isPharmaBrand(brand) ? "iPharma" : "iFuel"} product before receiving or editing stock.`,
      );
      return errors;
    }

    if (rule.kind === "unconfigured-fuel") {
      errors.push(
        `No fuel shelf-life validation is configured for category "${category || grade || "Unknown"}". Use Regular Gasoline, Ethanol-Blended Gasoline, Premium Gasoline, or Diesel.`,
      );
      return errors;
    }

    if (rule.requiresManufactureDate && !mfgDate) {
      errors.push(
        "Manufacture date is required because expiration is calculated from the manufacture date.",
      );
      return errors;
    }

    if (noExpiry) {
      if (!rule.allowNoExpiry) {
        errors.push(
          `${category || "This category"} requires an expiration date.`,
        );
      }
      return errors;
    }

    if (!expiryDate) {
      errors.push("Expiry date is required.");
      return errors;
    }

    const mfg = parseLocalDateOnly(mfgDate);
    const exp = parseLocalDateOnly(expiryDate);

    if (mfgDate && !mfg) {
      errors.push("Manufacture date is not a valid date.");
      return errors;
    }
    if (!exp) {
      errors.push("Expiry date is not a valid date.");
      return errors;
    }

    if (mfg && exp <= mfg) {
      errors.push("Expiry date must be after the manufacture date.");
      return errors;
    }

    const bounds = getExpiryBoundsFromManufacture(mfgDate, rule);

    if (rule.kind === "exact" && bounds.recommendedDate) {
      if (toDateInputValue(exp) !== bounds.recommendedStr) {
        errors.push(
          `${category || "This category"} expiry must be exactly ${rule.label}. Required date: ${fmtDate(bounds.recommendedStr)}.`,
        );
      }
    } else if (rule.kind === "range" && bounds.minDate && bounds.maxDate) {
      if (exp < bounds.minDate || exp > bounds.maxDate) {
        errors.push(
          `${rule.label}. Expiry must be between ${fmtDate(bounds.minStr)} and ${fmtDate(bounds.maxStr)}.`,
        );
      }
    } else if (rule.kind === "max" && bounds.maxDate) {
      if (exp > bounds.maxDate) {
        errors.push(
          `${rule.label}. Latest allowed expiry: ${fmtDate(bounds.maxStr)}.`,
        );
      }
    }

    return errors;
  }

  // Brand & Branch is the source of truth for iFuel/iPharma categories.
  // The API normally returns categories as an array, but this also safely
  // handles JSON/text values so Stock Inventory stays connected to it.
  function getBrandCategories(brandObj) {
    const raw = brandObj?.categories;
    if (Array.isArray(raw)) {
      return [
        ...new Set(raw.map((c) => String(c || "").trim()).filter(Boolean)),
      ];
    }
    if (typeof raw === "string" && raw.trim()) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return [
            ...new Set(
              parsed.map((c) => String(c || "").trim()).filter(Boolean),
            ),
          ];
        }
      } catch {}
      return [
        ...new Set(
          raw
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean),
        ),
      ];
    }
    return [];
  }

  // Brand is authoritative. Branch is used only as a legacy fallback when the
  // old row has no brand at all. This prevents shared branches such as
  // "Head Office" from leaking Coffee Spot products into iPharma/iFuel.
  function itemBelongsToBrand(item, brandDef, brandObj) {
    const storedBrand = String(item?.brand || item?.brand_name || "")
      .trim()
      .toLowerCase();
    if (storedBrand) return brandDef.match(storedBrand);

    // iFuel/iPharma are direct-product inventories and must always have an
    // explicit brand. Never infer them from Head Office or another shared branch.
    if (isDirectProductBrand(brandObj?.name || brandDef?.label || ""))
      return false;

    // Legacy fallback is retained only for non-direct brands whose old rows may
    // predate the brand field.
    const validBranches = (brandObj?.branches || [])
      .map((br) => (typeof br === "string" ? br : br?.name))
      .filter(Boolean);
    return !!item?.branch && validBranches.includes(item.branch);
  }

  const STOCK_CATEGORY_STORAGE_KEY = "franchisync_stock_product_categories_v2";

  function readStockCategoryMap() {
    if (typeof window === "undefined" || !window.localStorage) return {};
    try {
      const raw = window.localStorage.getItem(STOCK_CATEGORY_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : {};
    } catch {
      return {};
    }
  }

  function persistStockCategory(itemId, category) {
    if (itemId === null || itemId === undefined || itemId === "") return;
    if (typeof window === "undefined" || !window.localStorage) return;
    const value = String(category || "").trim();
    try {
      const map = readStockCategoryMap();
      if (value) map[String(itemId)] = value;
      else delete map[String(itemId)];
      window.localStorage.setItem(
        STOCK_CATEGORY_STORAGE_KEY,
        JSON.stringify(map),
      );
    } catch {}
  }

  function getPersistedStockCategory(itemId) {
    if (itemId === null || itemId === undefined || itemId === "") return "";
    return String(readStockCategoryMap()[String(itemId)] || "").trim();
  }

  function normalizeStockItem(row) {
    if (!row || typeof row !== "object") return row;

    const backendCategory = String(
      row.category ?? row.product_category ?? row.category_name ?? "",
    ).trim();

    // If the API already returns a category, it remains authoritative and we
    // cache it. If the current backend silently drops the category field on
    // /ingredients PUT/POST, use the last category explicitly selected for this
    // exact product instead of reverting the UI to "Uncategorized".
    if (backendCategory && row.id != null) {
      persistStockCategory(row.id, backendCategory);
    }

    const resolvedCategory =
      backendCategory || getPersistedStockCategory(row.id);

    return {
      ...row,
      brand: String(row.brand ?? row.brand_name ?? "").trim(),
      category: resolvedCategory,
      sku: row.sku || "",
    };
  }

  // iFuel and iPharma use Stock Inventory as the single product source of truth.
  // Menu Inventory reads these same records for product details; FIFO/FEFO and
  // batch/stock movement remain managed here in Stock Inventory.

  const DIRECT_OPERATIONS_RATE = 0.3;
  const DIRECT_PROFIT_RATE = 0.4;
  const computeDirectSellingPrice = (cost) => {
    const base = Number(cost || 0);
    return base > 0
      ? Math.round(
          base * (1 + DIRECT_OPERATIONS_RATE + DIRECT_PROFIT_RATE) * 100,
        ) / 100
      : 0;
  };

  /* small reusable bar for stock level / freshness */
  function MiniBar({ pct, color, track = "#eef6f1", height = 6 }) {
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

  /* ─────────────────────────────────────────────────────────────────────────
   UI MODAL
───────────────────────────────────────────────────────────────────────── */
  function UIModal({ modal, onClose, onConfirm }) {
    if (!modal) return null;
    const { type, title, message, lines, confirmLabel, cancelLabel } = modal;
    const iconMap = {
      error: <AlertCircleIcon size={26} color={C.red} />,
      success: <CheckCircleIcon size={26} color={C.green} />,
      info: <InfoIcon size={26} color="#1d4ed8" />,
      confirm: <AlertCircleIcon size={26} color={C.warn} />,
    };
    const hc = {
      error: { bg: C.redBg, border: "#fecaca", titleColor: "#991b1b" },
      success: { bg: C.greenLt, border: C.greenMid, titleColor: C.greenDk },
      info: { bg: "#eff6ff", border: "#bfdbfe", titleColor: "#1e3a8a" },
      confirm: { bg: C.warnBg, border: "#fed7aa", titleColor: "#9a3412" },
    }[type] || { bg: "#eff6ff", border: "#bfdbfe", titleColor: "#1e3a8a" };

    return (
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(13,43,30,0.45)",
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
            background: C.white,
            borderRadius: 16,
            width: "100%",
            maxWidth: 440,
            boxShadow: "0 24px 64px rgba(0,0,0,0.16)",
            border: `1px solid ${hc.border}`,
            fontFamily: "Plus Jakarta Sans,sans-serif",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: hc.bg,
              padding: "20px 24px 16px",
              borderBottom: `1px solid ${hc.border}`,
              display: "flex",
              alignItems: "flex-start",
              gap: 13,
            }}
          >
            <div style={{ flexShrink: 0, marginTop: 1 }}>{iconMap[type]}</div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: hc.titleColor,
                  marginBottom: 4,
                }}
              >
                {title}
              </div>
              {message && (
                <div
                  style={{
                    fontSize: 13,
                    color: C.ink,
                    lineHeight: 1.6,
                    opacity: 0.85,
                  }}
                >
                  {message}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                flexShrink: 0,
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: `1px solid ${hc.border}`,
                background: "transparent",
                cursor: "pointer",
                color: C.muted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <XIcon size={13} />
            </button>
          </div>
          {lines && lines.length > 0 && (
            <div
              style={{
                maxHeight: 220,
                overflowY: "auto",
                padding: "12px 24px",
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              {lines.map((l, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 12,
                    color: l.warn ? C.warn : C.muted,
                    padding: "3px 0",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 7,
                  }}
                >
                  <span
                    style={{
                      marginTop: 1,
                      flexShrink: 0,
                      color: l.warn ? C.warn : C.green,
                    }}
                  >
                    {l.warn ? "–" : "+"}
                  </span>
                  <span>{l.text}</span>
                </div>
              ))}
            </div>
          )}
          <div
            style={{
              padding: "14px 24px",
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
            }}
          >
            {type === "confirm" && (
              <button onClick={onClose} style={{ ...btnSt }}>
                {cancelLabel || "Cancel"}
              </button>
            )}
            {type === "confirm" ? (
              <button
                onClick={onConfirm}
                style={{
                  ...btnSt,
                  background: C.red,
                  color: "#fff",
                  border: "none",
                }}
              >
                {confirmLabel || "Confirm"}
              </button>
            ) : (
              <button onClick={onClose} style={{ ...btnPrimarySt }}>
                {confirmLabel || "OK"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── DELETE CONFIRM MODAL ── */
  function DeleteConfirmModal({ item, deleting, onConfirm, onCancel }) {
    if (!item) return null;
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
            background: C.white,
            borderRadius: 16,
            width: "100%",
            maxWidth: 420,
            boxShadow: "0 24px 64px rgba(0,0,0,0.16)",
            border: `1px solid #fecaca`,
            fontFamily: "Plus Jakarta Sans,sans-serif",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: C.redBg,
              padding: "20px 24px 16px",
              borderBottom: "1px solid #fecaca",
              display: "flex",
              alignItems: "flex-start",
              gap: 13,
            }}
          >
            <div style={{ flexShrink: 0, marginTop: 1 }}>
              <AlertCircleIcon size={26} color={C.red} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#991b1b",
                  marginBottom: 5,
                }}
              >
                Delete Ingredient
              </div>
              <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.6 }}>
                Are you sure you want to delete <strong>"{item.name}"</strong>?
              </div>
              <div
                style={{
                  marginTop: 8,
                  background: "#fff5f5",
                  border: "1px solid #fecaca",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 12,
                  color: "#7f1d1d",
                }}
              >
                This will move the ingredient to Delete History where it can be
                restored.
              </div>
            </div>
            <button
              onClick={onCancel}
              style={{
                flexShrink: 0,
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "1px solid #fecaca",
                background: "transparent",
                cursor: "pointer",
                color: C.muted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <XIcon size={13} />
            </button>
          </div>
          <div
            style={{
              padding: "12px 24px",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              gap: 20,
            }}
          >
            {[
              { label: "Branch", val: item.branch || "—" },
              { label: "Unit", val: item.unit },
              { label: "Stock", val: item.stock },
              {
                label: "Cost/Unit",
                val: `₱${Number(item.cost_per_unit || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              },
            ].map((x) => (
              <div key={x.label} style={{ fontSize: 12 }}>
                <div
                  style={{
                    color: C.muted,
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 3,
                  }}
                >
                  {x.label}
                </div>
                <div style={{ fontWeight: 700, color: C.ink }}>{x.val}</div>
              </div>
            ))}
          </div>
          <div
            style={{
              fontSize: 10.5,
              color: C.muted,
              marginTop: 3,
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.branch}
            </span>
            {(isDirectProductBrand(item.brand) || item.category) && (
              <>
                <span style={{ opacity: 0.45 }}>•</span>
                <span
                  style={{
                    color: item.category ? C.greenDk : C.warn,
                    fontWeight: 700,
                  }}
                >
                  {item.category || "Uncategorized"}
                </span>
              </>
            )}
            {item.sku && (
              <>
                <span style={{ opacity: 0.45 }}>•</span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 9.5,
                    color: "#9ca3af",
                  }}
                >
                  {item.sku}
                </span>
              </>
            )}
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
              style={{ ...btnSt, opacity: deleting ? 0.5 : 1 }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              style={{
                ...btnSt,
                background: C.red,
                color: "#fff",
                border: "none",
                boxShadow: "0 2px 8px rgba(220,38,38,0.25)",
                opacity: deleting ? 0.7 : 1,
                cursor: deleting ? "not-allowed" : "pointer",
              }}
            >
              {deleting ? (
                <>
                  <RefreshCw
                    size={13}
                    style={{ animation: "spin .8s linear infinite" }}
                  />{" "}
                  Deleting…
                </>
              ) : (
                <>
                  <TrashIcon size={13} /> Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── BATCH DELETE CONFIRM MODAL ── */
  function BatchDeleteConfirmModal({
    batch,
    ingredient,
    deleting,
    onConfirm,
    onCancel,
  }) {
    if (!batch) return null;
    const expStr = fmtDate(batch.exp_date);
    return (
      <div
        onClick={onCancel}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(13,43,30,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2700,
          padding: 20,
          backdropFilter: "blur(4px)",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: C.white,
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
              background: C.redBg,
              padding: "20px 24px 16px",
              borderBottom: "1px solid #fecaca",
              display: "flex",
              alignItems: "flex-start",
              gap: 13,
            }}
          >
            <div style={{ flexShrink: 0, marginTop: 1 }}>
              <AlertCircleIcon size={26} color={C.red} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#991b1b",
                  marginBottom: 5,
                }}
              >
                Delete Batch
              </div>
              <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.6 }}>
                Are you sure you want to delete{" "}
                <strong>Batch {batch.batch_number || "—"}</strong> of{" "}
                <strong>"{ingredient?.name}"</strong>?
              </div>
              <div
                style={{
                  marginTop: 8,
                  background: "#fff5f5",
                  border: "1px solid #fecaca",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 12,
                  color: "#7f1d1d",
                }}
              >
                This will move the batch to Batch Delete History where it can be
                restored. Ingredient stock totals will be recalculated.
              </div>
            </div>
            <button
              onClick={onCancel}
              style={{
                flexShrink: 0,
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "1px solid #fecaca",
                background: "transparent",
                cursor: "pointer",
                color: C.muted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <XIcon size={13} />
            </button>
          </div>
          <div
            style={{
              padding: "12px 24px",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            {[
              {
                label: "Stock",
                val: `${batch.stock ?? "—"} ${ingredient?.unit || ""}`,
              },
              { label: "Supplier", val: batch.supplier || "—" },
              { label: "Exp Date", val: expStr },
            ].map((x) => (
              <div key={x.label} style={{ fontSize: 12 }}>
                <div
                  style={{
                    color: C.muted,
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 3,
                  }}
                >
                  {x.label}
                </div>
                <div style={{ fontWeight: 700, color: C.ink }}>{x.val}</div>
              </div>
            ))}
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
              style={{ ...btnSt, opacity: deleting ? 0.5 : 1 }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              style={{
                ...btnSt,
                background: C.red,
                color: "#fff",
                border: "none",
                boxShadow: "0 2px 8px rgba(220,38,38,0.25)",
                opacity: deleting ? 0.7 : 1,
                cursor: deleting ? "not-allowed" : "pointer",
              }}
            >
              {deleting ? (
                <>
                  <RefreshCw
                    size={13}
                    style={{ animation: "spin .8s linear infinite" }}
                  />{" "}
                  Deleting…
                </>
              ) : (
                <>
                  <TrashIcon size={13} /> Delete Batch
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── BATCH TRANSFER HISTORY MODAL — Head Office batches only ── */
  function BatchTransferHistoryModal({ batch, ingredient, apiUrl, onClose }) {
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);

    useEffect(() => {
      let cancelled = false;
      setLoading(true);
      fetch(`${apiUrl}/ingredient-batches/${batch.id}/transfer-history`)
        .then((r) => r.json())
        .then((d) => {
          if (!cancelled) {
            setRows(Array.isArray(d) ? d : []);
            setLoading(false);
          }
        })
        .catch(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [batch.id, apiUrl]);

    const totalTransferred = rows.reduce(
      (s, r) => s + Number(r.quantity || 0),
      0,
    );

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
          zIndex: 2800,
          padding: 20,
          backdropFilter: "blur(4px)",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: C.white,
            borderRadius: 18,
            width: "100%",
            maxWidth: 560,
            maxHeight: "80vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            border: `1px solid ${C.border}`,
            fontFamily: "Plus Jakarta Sans,sans-serif",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "18px 24px",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#fbfcf8",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: C.ink,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <HistoryIcon size={14} /> Transfer History — Batch{" "}
                {batch.batch_number || "—"}
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                {ingredient.name} · Head Office
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                border: `1px solid ${C.border}`,
                background: C.white,
                cursor: "pointer",
                color: C.muted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <XIcon size={14} />
            </button>
          </div>

          <div
            style={{
              padding: "14px 24px",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              gap: 20,
              background: "#fafffe",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  color: C.muted,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Total Transferred
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: C.ink,
                  marginTop: 2,
                }}
              >
                {totalTransferred} {ingredient.unit}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 10,
                  color: C.muted,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Transfers
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: C.ink,
                  marginTop: 2,
                }}
              >
                {rows.length}
              </div>
            </div>
          </div>

          <div style={{ overflowY: "auto", flex: 1, padding: "8px 24px 20px" }}>
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "30px 0",
                  color: C.muted,
                  fontSize: 12.5,
                }}
              >
                Loading transfer history…
              </div>
            ) : rows.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "36px 0",
                  color: "#9ca3af",
                  fontSize: 13,
                  fontStyle: "italic",
                }}
              >
                No stock from this batch has been transferred to a branch yet.
              </div>
            ) : (
              rows.map((r, i) => (
                <div
                  key={r.id}
                  style={{
                    padding: "12px 0",
                    borderBottom:
                      i < rows.length - 1 ? `1px solid ${C.bg}` : "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <StoreIcon size={12} color={C.green} />
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          color: C.ink,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.destination_branch || "—"}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                      Order #{r.order_id} · {r.destination_brand || "—"} ·{" "}
                      {r.transferred_at ? fmtTs(r.transferred_at) : "—"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div
                      style={{ fontWeight: 800, fontSize: 14, color: C.ink }}
                    >
                      {r.quantity} {ingredient.unit}
                    </div>
                    <span
                      style={{
                        fontSize: 9.5,
                        fontWeight: 800,
                        padding: "2px 8px",
                        borderRadius: 20,
                        marginTop: 3,
                        display: "inline-block",
                        background: r.applied ? C.greenLt : C.amberBg,
                        color: r.applied ? C.greenDk : "#9a3412",
                        border: `1px solid ${r.applied ? C.greenMid : C.amberBorder}`,
                      }}
                    >
                      {r.applied ? "RECEIVED" : "IN TRANSIT"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── IMPORT LOADING MODAL ── */
  function ImportLoadingModal({ visible, progress }) {
    if (!visible) return null;
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(13,43,30,0.55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 3500,
          padding: 20,
          backdropFilter: "blur(6px)",
        }}
      >
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div
          style={{
            background: C.white,
            borderRadius: 18,
            padding: "32px 36px",
            width: "100%",
            maxWidth: 380,
            boxShadow: "0 28px 70px rgba(0,0,0,0.22)",
            border: `1px solid ${C.greenMid}`,
            fontFamily: "Plus Jakarta Sans,sans-serif",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: C.greenLt,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 18px",
            }}
          >
            <UploadIcon size={28} color={C.green} />
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: C.ink,
              marginBottom: 6,
            }}
          >
            Importing Excel
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
            Please wait while your data is being processed…
          </div>
          <div
            style={{
              background: C.greenLt,
              borderRadius: 999,
              height: 6,
              overflow: "hidden",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                background: `linear-gradient(90deg,${C.teal},${C.green})`,
                borderRadius: 999,
                height: "100%",
                width: `${progress.percent}%`,
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 12,
              color: C.muted,
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            {progress.label}
          </div>
          {progress.current > 0 && (
            <div style={{ fontSize: 11, color: C.muted, opacity: 0.7 }}>
              {progress.current} / {progress.total} rows processed
            </div>
          )}
          <div
            style={{
              marginTop: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: C.green,
            }}
          >
            <LoaderIcon size={16} color={C.green} />
            <span style={{ fontSize: 12, fontWeight: 700 }}>
              Do not close this window
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* ── BrandBranchFilter ── */
  function BrandBranchFilter({
    brands,
    activeBrand,
    activeBranch,
    onChangeBrand,
    onChangeBranch,
  }) {
    const [brandQ, setBrandQ] = useState("");
    const [branchQ, setBranchQ] = useState("");
    const [openB, setOpenB] = useState(false);
    const [openBr, setOpenBr] = useState(false);
    const brandRef = useRef(null);
    const branchRef = useRef(null);

    useEffect(() => {
      const fn = (e) => {
        if (brandRef.current && !brandRef.current.contains(e.target))
          setOpenB(false);
        if (branchRef.current && !branchRef.current.contains(e.target))
          setOpenBr(false);
      };
      document.addEventListener("mousedown", fn);
      return () => document.removeEventListener("mousedown", fn);
    }, []);

    const selectedBrand = brands.find((b) => b.id === activeBrand);
    const branchList = selectedBrand
      ? (selectedBrand.branches || []).map((br) =>
          typeof br === "string" ? br : br.name,
        )
      : [];
    const filteredBrands = brands.filter(
      (b) => !brandQ || b.name.toLowerCase().includes(brandQ.toLowerCase()),
    );
    const filteredBranches = branchList.filter(
      (br) => !branchQ || br.toLowerCase().includes(branchQ.toLowerCase()),
    );

    const dropSt = {
      position: "absolute",
      top: "calc(100% + 4px)",
      left: 0,
      right: 0,
      zIndex: 300,
      background: C.white,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      boxShadow: "0 8px 28px rgba(0,0,0,0.10)",
      maxHeight: 230,
      overflowY: "auto",
    };
    const optSt = (active) => ({
      padding: "9px 14px",
      cursor: "pointer",
      fontSize: 13,
      color: C.ink,
      fontWeight: active ? 700 : 500,
      background: active ? C.greenLt : "transparent",
      display: "flex",
      alignItems: "center",
      gap: 8,
    });

    return (
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div ref={brandRef} style={{ position: "relative", minWidth: 175 }}>
          <div
            onClick={() => {
              setOpenB((v) => !v);
              setBrandQ("");
            }}
            style={{
              ...invInputSt,
              display: "flex",
              alignItems: "center",
              gap: 7,
              cursor: "pointer",
              paddingRight: 30,
              userSelect: "none",
              color: activeBrand ? C.ink : C.muted,
            }}
          >
            <FilterIcon color={C.green} />
            <span
              style={{
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontSize: 13,
              }}
            >
              {selectedBrand ? selectedBrand.name : "All Brands"}
            </span>
            <ChevronIcon dir={openB ? "up" : "down"} />
          </div>
          {openB && (
            <div style={dropSt}>
              <div
                style={{
                  padding: "7px 9px",
                  borderBottom: `1px solid ${C.border}`,
                  position: "sticky",
                  top: 0,
                  background: C.white,
                }}
              >
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: C.muted,
                    }}
                  >
                    <SearchIcon size={11} />
                  </div>
                  <input
                    autoFocus
                    type="text"
                    value={brandQ}
                    onChange={(e) => setBrandQ(e.target.value)}
                    placeholder="Search brand…"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      ...invInputSt,
                      height: 30,
                      fontSize: 12,
                      paddingLeft: 26,
                    }}
                  />
                </div>
              </div>
              <div
                style={optSt(!activeBrand)}
                onMouseDown={() => {
                  onChangeBrand(null);
                  onChangeBranch(null);
                  setBrandQ("");
                  setOpenB(false);
                }}
              >
                All Brands
              </div>
              {filteredBrands.map((b) => (
                <div
                  key={b.id}
                  style={optSt(activeBrand === b.id)}
                  onMouseDown={() => {
                    onChangeBrand(b.id);
                    onChangeBranch(null);
                    setBrandQ("");
                    setOpenB(false);
                  }}
                >
                  {b.name}
                  <span
                    style={{ marginLeft: "auto", fontSize: 11, color: C.muted }}
                  >
                    {(b.branches || []).length} branches
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          ref={branchRef}
          style={{
            position: "relative",
            minWidth: 185,
            opacity: activeBrand ? 1 : 0.45,
          }}
        >
          <div
            onClick={() => {
              if (activeBrand) {
                setOpenBr((v) => !v);
                setBranchQ("");
              }
            }}
            style={{
              ...invInputSt,
              display: "flex",
              alignItems: "center",
              gap: 7,
              cursor: activeBrand ? "pointer" : "not-allowed",
              paddingRight: 30,
              userSelect: "none",
              color: activeBranch ? C.ink : C.muted,
            }}
          >
            <StoreIcon size={12} color={activeBrand ? C.green : C.muted} />
            <span
              style={{
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontSize: 13,
              }}
            >
              {activeBranch ||
                (activeBrand ? "All Branches" : "Select brand first")}
            </span>
          </div>
          {openBr && activeBrand && (
            <div style={dropSt}>
              <div
                style={{
                  padding: "7px 9px",
                  borderBottom: `1px solid ${C.border}`,
                  position: "sticky",
                  top: 0,
                  background: C.white,
                }}
              >
                <input
                  autoFocus
                  type="text"
                  value={branchQ}
                  onChange={(e) => setBranchQ(e.target.value)}
                  placeholder="Search branch…"
                  style={{ ...invInputSt, height: 30, fontSize: 12 }}
                />
              </div>
              <div
                style={optSt(!activeBranch)}
                onMouseDown={() => {
                  onChangeBranch(null);
                  setOpenBr(false);
                }}
              >
                All Branches
              </div>
              {filteredBranches.map((br) => (
                <div
                  key={br}
                  style={optSt(activeBranch === br)}
                  onMouseDown={() => {
                    onChangeBranch(br);
                    setOpenBr(false);
                  }}
                >
                  <StoreIcon size={11} color={C.green} /> {br}
                </div>
              ))}
            </div>
          )}
        </div>

        {(activeBrand || activeBranch) && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 10px 3px 8px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              background: C.greenLt,
              color: C.greenDk,
              border: `1px solid ${C.greenMid}`,
              cursor: "pointer",
            }}
            onClick={() => {
              onChangeBrand(null);
              onChangeBranch(null);
            }}
          >
            {activeBranch || selectedBrand?.name} <XIcon size={10} />
          </span>
        )}
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────
   Pagination
───────────────────────────────────────────────────────────────────────── */
  function Pagination({ page, setPage, total, pageSize }) {
    const totalPgs = Math.max(1, Math.ceil(total / pageSize));
    if (totalPgs <= 1) return null;
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 18px",
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
                background: C.white,
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
                background: C.white,
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ── DELETE HISTORY PANEL ── */
  function DeleteHistoryPanel({ history, restoringId, onRestore, onClose }) {
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
          zIndex: 2000,
          padding: 20,
          backdropFilter: "blur(4px)",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: C.white,
            borderRadius: 18,
            padding: "28px 32px",
            width: "100%",
            maxWidth: 680,
            maxHeight: "80vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            border: "1px solid rgba(0,168,76,0.15)",
            fontFamily: "Plus Jakarta Sans,sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: C.ink,
                  margin: 0,
                }}
              >
                Delete History
              </h2>
              {history.length > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: "#fee2e2",
                    color: C.red,
                  }}
                >
                  {history.length} deleted
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: `1px solid ${C.border}`,
                background: C.greenLt,
                cursor: "pointer",
                color: C.green,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <XIcon size={15} />
            </button>
          </div>
          {history.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 90px 90px 110px 100px",
                gap: 8,
                padding: "6px 0 10px",
                borderBottom: `2px solid ${C.greenLt}`,
                fontSize: 10,
                fontWeight: 700,
                color: C.muted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              <span>Ingredient</span>
              <span>Branch</span>
              <span>Stock</span>
              <span>Deleted At</span>
              <span></span>
            </div>
          )}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {history.length === 0 ? (
              <div
                style={{
                  padding: "40px 0",
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: 13,
                }}
              >
                No deleted ingredients yet.
              </div>
            ) : (
              history.map((entry, i) => {
                const d = entry.data || {};
                return (
                  <div
                    key={entry.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 90px 90px 110px 100px",
                      gap: 8,
                      alignItems: "center",
                      padding: "12px 0",
                      borderBottom:
                        i < history.length - 1 ? `1px solid ${C.bg}` : "none",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          color: C.ink,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {d.name}
                      </div>
                      <div
                        style={{ fontSize: 11, color: C.muted, marginTop: 2 }}
                      >
                        {d.brand || "—"}
                        {isDirectProductBrand(d.brand) || d.category
                          ? ` · ${d.category || "Uncategorized"}`
                          : ""}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: C.muted,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {d.branch}
                    </div>
                    <div
                      style={{ fontSize: 12, color: C.ink, fontWeight: 600 }}
                    >
                      {d.stock} {d.unit}
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>
                      {entry.deletedAt ? fmtTs(entry.deletedAt) : "—"}
                    </div>
                    <button
                      onClick={() => onRestore(entry)}
                      disabled={restoringId !== null}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "7px 12px",
                        borderRadius: 8,
                        border: `1.5px solid ${C.green}`,
                        background: C.greenLt,
                        color: C.greenDk,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor:
                          restoringId !== null ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                        whiteSpace: "nowrap",
                        opacity:
                          restoringId !== null
                            ? restoringId === entry.id
                              ? 0.85
                              : 0.4
                            : 1,
                      }}
                    >
                      {restoringId === entry.id ? (
                        <>
                          <RefreshCw
                            size={12}
                            style={{ animation: "spin 1s linear infinite" }}
                          />{" "}
                          Restoring…
                        </>
                      ) : (
                        <>
                          <RestoreIcon /> Restore
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── ACTIVITY LOG PANEL ── */
  function ActivityLogPanel({ log, onClose }) {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");

    const filtered = log.filter((entry) => {
      if (typeFilter !== "all" && entry.action !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !entry.ingredientName?.toLowerCase().includes(q) &&
          !(entry.performedBy || "").toLowerCase().includes(q) &&
          !(entry.branch || "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });

    const actionBadge = (action) => {
      const map = {
        add: { bg: "rgba(16,185,129,0.12)", color: "#059669", label: "Added" },
        edit: {
          bg: "rgba(59,130,246,0.12)",
          color: "#1d4ed8",
          label: "Edited",
        },
        import: {
          bg: "rgba(139,92,246,0.12)",
          color: "#7c3aed",
          label: "Imported",
        },
        receive: {
          bg: "rgba(245,158,11,0.14)",
          color: "#b45309",
          label: "Received",
        },
      };
      const s = map[action] || map.edit;
      return (
        <span
          style={{
            padding: "2px 9px",
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 700,
            background: s.bg,
            color: s.color,
            whiteSpace: "nowrap",
          }}
        >
          {s.label}
        </span>
      );
    };

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
          zIndex: 2000,
          padding: 20,
          backdropFilter: "blur(4px)",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: C.white,
            borderRadius: 18,
            padding: "28px 32px",
            width: "100%",
            maxWidth: 780,
            maxHeight: "82vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            border: "1px solid rgba(0,168,76,0.15)",
            fontFamily: "Plus Jakarta Sans,sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: C.ink,
                  margin: 0,
                }}
              >
                Activity Log
              </h2>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: C.greenLt,
                  color: C.greenDk,
                }}
              >
                {filtered.length} entries
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: `1px solid ${C.border}`,
                background: C.greenLt,
                cursor: "pointer",
                color: C.green,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <XIcon size={15} />
            </button>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={{ position: "relative", flex: "1 1 200px" }}>
              <div
                style={{
                  position: "absolute",
                  left: 9,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: C.muted,
                }}
              >
                <SearchIcon size={12} />
              </div>
              <input
                type="text"
                placeholder="Search ingredient, user, branch…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  ...invInputSt,
                  paddingLeft: 28,
                  height: 32,
                  fontSize: 12,
                }}
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ ...invInputSt, width: 130, height: 32, fontSize: 12 }}
            >
              <option value="all">All Actions</option>
              <option value="add">Added</option>
              <option value="edit">Edited</option>
              <option value="import">Imported</option>
              <option value="receive">Received</option>
            </select>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr 100px 120px 160px",
              gap: 8,
              padding: "6px 0 8px",
              borderBottom: `2px solid ${C.greenLt}`,
              fontSize: 10,
              fontWeight: 700,
              color: C.muted,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            <span>Action</span>
            <span>Ingredient</span>
            <span>Branch</span>
            <span>By</span>
            <span>Timestamp</span>
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: "40px 0",
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: 13,
                }}
              >
                No activity yet.
              </div>
            ) : (
              filtered.map((entry, i) => (
                <div
                  key={entry.id || i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px 1fr 100px 120px 160px",
                    gap: 8,
                    alignItems: "center",
                    padding: "11px 0",
                    borderBottom:
                      i < filtered.length - 1 ? `1px solid ${C.bg}` : "none",
                  }}
                >
                  <div>{actionBadge(entry.action)}</div>
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: C.ink,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {entry.ingredientName}
                    </div>
                    {entry.changes && (
                      <div
                        style={{
                          fontSize: 10,
                          color: C.muted,
                          marginTop: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {entry.changes}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: C.muted,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {entry.branch || "—"}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.ink,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {entry.performedBy || "System"}
                  </div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>
                    {entry.timestamp ? fmtTs(entry.timestamp) : "—"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────
   FIFO / FEFO QUEUE (right column of each brand card)
   Simple white rows, divided by a thin bottom line (green for the next-out
   batch, gray for the rest) instead of colored backgrounds.
───────────────────────────────────────────────────────────────────────── */
  function FifoQueue({
    product,
    batches,
    loading,
    onEditBatch,
    onDeleteBatch,
    onViewHistory,
    readOnly = false,
  }) {
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
            Select a product on the left
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 10,
            gap: 8,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: C.ink,
                fontFamily: "monospace",
                display: "flex",
                alignItems: "center",
                gap: 7,
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {product.sku || "—"}
              </span>
            </div>
            <div
              style={{
                fontSize: 11,
                color: C.muted,
                marginTop: 2,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 9.5, fontWeight: 700, color: C.ink }}>
                {product.name}
              </span>
              <span style={{ opacity: 0.45 }}>•</span>
              <span>
                {totalStock} {product.unit} · {sorted.length} active batch
                {sorted.length === 1 ? "" : "es"} · min {product.min_stock}
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 10px",
            borderRadius: 8,
            background: fifo.method === "FEFO" ? C.amberBg : C.greenLt,
            border: `1px solid ${fifo.method === "FEFO" ? C.amberBorder : C.greenMid}`,
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
              No batches yet for this product.
            </div>
          ) : (
            sorted.map((b, idx) => {
              const status = computeExpiryStatus(b.exp_date, product.brand);
              const ss = EXPIRY_STYLE[status] || EXPIRY_STYLE.ok;
              const isFirst = idx === 0;
              const isLast = idx === sorted.length - 1;
              const supplyStr = b.supply_date ? fmtTs(b.supply_date) : "—";
              const expStr = fmtDate(b.exp_date);
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
                    padding: "7px 4px",
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
                          ₱
                          {Number(b.cost_per_unit).toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
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
                    {b.received_by && (
                      <span>
                        Received by:{" "}
                        <strong style={{ color: C.ink }}>
                          {b.received_by}
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
                    <MiniBar pct={stockPct} color={C.green} />
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
                            <strong style={{ color: C.ink }}>
                              {b.ndc_code}
                            </strong>
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
                            <strong style={{ color: C.ink }}>
                              {b.tank_id}
                            </strong>
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
                            <strong style={{ color: C.ink }}>
                              {b.truck_id}
                            </strong>
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

                  {(!readOnly ||
                    (product.branch || "").trim().toLowerCase() ===
                      "head office") && (
                    <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                      {!readOnly && (
                        <>
                          <button
                            onClick={() => onEditBatch(b)}
                            className="edit-btn"
                            style={{
                              ...smallBtnSt,
                              border: `1px solid ${C.border}`,
                              color: C.green,
                              padding: "3px 8px",
                              fontSize: 10,
                            }}
                          >
                            <EditIcon size={9} /> Edit
                          </button>
                          <button
                            onClick={() => onDeleteBatch(b)}
                            className="del-btn"
                            style={{
                              ...smallBtnSt,
                              border: "1px solid #fecaca",
                              color: "#e53935",
                              padding: "3px 8px",
                              fontSize: 10,
                            }}
                          >
                            <TrashIcon size={9} /> Delete
                          </button>
                        </>
                      )}
                      {(product.branch || "").trim().toLowerCase() ===
                        "head office" && (
                        <button
                          onClick={() => onViewHistory(b)}
                          className="hist-btn"
                          style={{
                            ...smallBtnSt,
                            border: "1px solid #bbdefb",
                            color: "#1565c0",
                            padding: "3px 8px",
                            fontSize: 10,
                          }}
                        >
                          <HistoryIcon size={9} /> History
                        </button>
                      )}
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

  /* ─────────────────────────────────────────────────────────────────────────
   BRAND OVERVIEW CARD — landing screen, one per brand, clickable
───────────────────────────────────────────────────────────────────────── */
  function BrandOverviewCard({ brandDef, brandObj, items, onClick }) {
    const validBranches = (brandObj?.branches || []).map((br) =>
      typeof br === "string" ? br : br.name,
    );
    const brandItems = items.filter((i) =>
      itemBelongsToBrand(i, brandDef, brandObj),
    );
    const lowCount = brandItems.filter(
      (i) => Number(i.stock) < Number(i.min_stock),
    ).length;
    // Show the number of inventory items that currently have stock, not the
    // combined quantity of every item's units.
    const stockedItems = brandItems.filter(
      (i) => Number(i.stock || 0) > 0,
    ).length;
    const stockMetricLabel = "Stocked Items";
    const stockMetricValue = stockedItems;
    const branchCount = validBranches.length;

    return (
      <button
        type="button"
        onClick={onClick}
        style={{
          textAlign: "left",
          width: "100%",
          padding: 0,
          appearance: "none",
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 2px 10px rgba(50,109,32,.05)",
          cursor: "pointer",
          transition:
            "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
          fontFamily: "inherit",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = "0 14px 32px rgba(50,109,32,.12)";
          e.currentTarget.style.borderColor = C.greenMid;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "";
          e.currentTarget.style.boxShadow = "0 2px 10px rgba(50,109,32,.05)";
          e.currentTarget.style.borderColor = C.border;
        }}
      >
        <div
          style={{
            padding: "18px 18px 15px",
            borderBottom: `1px solid ${C.border}`,
            background: "#fbfcf8",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: C.ink,
              color: C.lime,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <StoreIcon size={19} color={C.lime} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: C.ink,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {brandDef.label}
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
              {branchCount} branch{branchCount === 1 ? "" : "es"} · Head Office
              Inventory
            </div>
          </div>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: C.bg,
              border: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: C.greenDk,
            }}
          >
            <ArrowRightIcon size={13} />
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 0,
            padding: "16px 18px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                color: C.muted,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: ".05em",
              }}
            >
              Products
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: C.ink,
                marginTop: 3,
              }}
            >
              {brandItems.length}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                color: C.muted,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: ".05em",
              }}
            >
              {stockMetricLabel}
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: C.ink,
                marginTop: 3,
              }}
            >
              {stockMetricValue}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                color: C.muted,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: ".05em",
              }}
            >
              Low
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: lowCount ? C.red : C.green,
                marginTop: 3,
              }}
            >
              {lowCount}
            </div>
          </div>
        </div>
      </button>
    );
  }

  /* ── Searchable branch filter — same UX pattern as MenuInventoryContent's BrandBranchFilter,
     but scoped to a single already-selected brand (BrandCard is itself the brand context) ── */
  function BranchOnlyFilter({ branches, activeBranch, onChangeBranch }) {
    const [branchQ, setBranchQ] = useState("");
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
      const fn = (e) => {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      };
      document.addEventListener("mousedown", fn);
      return () => document.removeEventListener("mousedown", fn);
    }, []);

    const filteredBranches = branches.filter(
      (br) => !branchQ || br.toLowerCase().includes(branchQ.toLowerCase()),
    );

    const dropSt = {
      position: "absolute",
      top: "calc(100% + 4px)",
      left: 0,
      right: 0,
      zIndex: 300,
      background: C.white,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      boxShadow: "0 8px 28px rgba(0,0,0,0.10)",
      maxHeight: 230,
      overflowY: "auto",
    };
    const optSt = (active) => ({
      padding: "9px 14px",
      cursor: "pointer",
      fontSize: 13,
      color: C.ink,
      fontWeight: active ? 700 : 500,
      background: active ? C.greenLt : "transparent",
      display: "flex",
      alignItems: "center",
      gap: 8,
    });

    return (
      <div ref={ref} style={{ position: "relative", minWidth: 150 }}>
        <div
          onClick={() => {
            setOpen((v) => !v);
            setBranchQ("");
          }}
          style={{
            ...invInputSt,
            height: 30,
            fontSize: 11,
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            paddingRight: 26,
            userSelect: "none",
            color: activeBranch ? C.ink : C.muted,
          }}
        >
          <StoreIcon size={11} color={C.green} />
          <span
            style={{
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {activeBranch || "All Branches"}
          </span>
          <ChevronIcon size={10} dir={open ? "up" : "down"} />
        </div>
        {open && (
          <div style={dropSt}>
            <div
              style={{
                padding: "6px 8px",
                borderBottom: `1px solid ${C.border}`,
                position: "sticky",
                top: 0,
                background: C.white,
              }}
            >
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: C.muted,
                  }}
                >
                  <SearchIcon size={11} />
                </div>
                <input
                  autoFocus
                  type="text"
                  value={branchQ}
                  onChange={(e) => setBranchQ(e.target.value)}
                  placeholder="Search branch…"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    ...invInputSt,
                    height: 28,
                    fontSize: 11,
                    paddingLeft: 26,
                  }}
                />
              </div>
            </div>
            <div
              style={optSt(!activeBranch)}
              onMouseDown={() => {
                onChangeBranch("");
                setOpen(false);
              }}
            >
              All Branches
            </div>
            {filteredBranches.map((br) => (
              <div
                key={br}
                style={optSt(activeBranch === br)}
                onMouseDown={() => {
                  onChangeBranch(br);
                  setOpen(false);
                }}
              >
                <StoreIcon size={11} color={C.green} /> {br}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────
   BRAND CARD — filters + (left, scrollable) product list + (right) FIFO/FEFO queue
   pass expanded=true for the single-brand full-width view
───────────────────────────────────────────────────────────────────────── */
  function BrandCard({
    brandDef,
    brandObj,
    items,
    apiUrl,
    onEdit,
    onDelete,
    onQuickAdd,
    onReceiveStock,
    onOpenDeleteHistory,
    deleteHistoryCount = 0,
    onBack,
    expanded = false,
    initialBranchFilter = "",
    initialStatusFilter = "",
    readOnly = false,
    userName,
    userRole,
    showUiModal,
    setToast,
    onItemsChanged,
    focusMutation = null,
    refreshToken = 0,
    restrictBranch = "",
  }) {
    const [search, setSearch] = useState("");
    const [branchF, setBranchF] = useState(initialBranchFilter);
    const [categoryF, setCategoryF] = useState("");
    const [unitF, setUnitF] = useState("");
    const [statusF, setStatusF] = useState(initialStatusFilter);
    const [selectedId, setSelectedId] = useState(null);
    const [batches, setBatches] = useState([]);

    const [editingBatch, setEditingBatch] = useState(null);
    const [savingBatch, setSavingBatch] = useState(false);
    const [deleteConfirmBatch, setDeleteConfirmBatch] = useState(null);
    const [deletingBatch, setDeletingBatch] = useState(false);
    const [batchLoading, setBatchLoading] = useState(false);
    const didSetDefaultBranch = useRef(false);

    const [transferHistoryBatch, setTransferHistoryBatch] = useState(null);

    const branchOptions = useMemo(() => {
      return (brandObj?.branches || []).map((br) =>
        typeof br === "string" ? br : br.name,
      );
    }, [brandObj]);

    const categoryOptions = useMemo(
      () => getBrandCategories(brandObj),
      [brandObj],
    );

    const brandItems = useMemo(
      () =>
        items
          .filter((i) => itemBelongsToBrand(i, brandDef, brandObj))
          .sort((a, b) =>
            String(a.name || "").localeCompare(String(b.name || "")),
          ),
      [items, brandDef, brandObj],
    );

    const filtered = useMemo(() => {
      const q = search.toLowerCase();
      return brandItems
        .filter((i) => {
          if (
            q &&
            !i.name.toLowerCase().includes(q) &&
            !String(i.category || "")
              .toLowerCase()
              .includes(q)
          )
            return false;
          if (branchF && i.branch !== branchF) return false;
          if (categoryF && i.category !== categoryF) return false;
          if (unitF && i.unit !== unitF) return false;
          if (statusF === "low" && Number(i.stock) >= Number(i.min_stock))
            return false;
          if (statusF === "ok" && Number(i.stock) < Number(i.min_stock))
            return false;
          return true;
        })
        .sort((a, b) => a.name.localeCompare(b.name));
    }, [brandItems, search, branchF, categoryF, unitF, statusF]);

    useEffect(() => {
      if (branchF && !branchOptions.includes(branchF)) setBranchF("");
    }, [branchF, branchOptions]);

    useEffect(() => {
      if (categoryF && !categoryOptions.includes(categoryF)) setCategoryF("");
    }, [categoryF, categoryOptions]);

    useEffect(() => {
      if (restrictBranch) {
        setBranchF(restrictBranch);
        didSetDefaultBranch.current = true;
        return;
      }
      if (initialBranchFilter) {
        setBranchF(initialBranchFilter);
        didSetDefaultBranch.current = true;
        return;
      }
      if (!didSetDefaultBranch.current && branchOptions.length > 0) {
        const headOffice = branchOptions.find(
          (b) => b.toLowerCase() === "head office",
        );
        if (headOffice) setBranchF(headOffice);
        didSetDefaultBranch.current = true;
      }
    }, [restrictBranch, initialBranchFilter, branchOptions]);

    useEffect(() => {
      setStatusF(initialStatusFilter);
    }, [initialStatusFilter]);

    // Keep a newly added/edited/received product visible even when the current
    // branch/category/status filter would otherwise hide the result immediately.
    useEffect(() => {
      const changed = focusMutation?.item;
      if (!changed || !itemBelongsToBrand(changed, brandDef, brandObj)) return;

      if (branchF && changed.branch !== branchF) setBranchF("");
      if (categoryF && String(changed.category || "") !== categoryF)
        setCategoryF("");

      const isLow = Number(changed.stock || 0) < Number(changed.min_stock || 0);
      if ((statusF === "low" && !isLow) || (statusF === "ok" && isLow))
        setStatusF("");

      if (changed.id != null) setSelectedId(changed.id);
    }, [focusMutation?.stamp, brandDef, brandObj]);

    useEffect(() => {
      if (selectedId && !brandItems.find((i) => i.id === selectedId))
        setSelectedId(null);
    }, [brandItems, selectedId]);

    const selected = brandItems.find((i) => i.id === selectedId) || null;

    const refreshBatches = useCallback(() => {
      if (!selectedId) {
        setBatches([]);
        return;
      }
      setBatchLoading(true);
      fetch(`${apiUrl}/ingredient-batches?ingredient_id=${selectedId}`)
        .then((r) => r.json())
        .then((d) => {
          setBatches(Array.isArray(d) ? d : []);
          setBatchLoading(false);
        })
        .catch(() => {
          setBatchLoading(false);
        });
    }, [selectedId, apiUrl]);

    const syncIngredientStock = async (ingredient) => {
      try {
        const res = await fetch(
          `${apiUrl}/ingredient-batches?ingredient_id=${ingredient.id}`,
        );
        const freshBatches = await res.json();
        const activeBatches = Array.isArray(freshBatches) ? freshBatches : [];
        const totalStock = activeBatches.reduce(
          (sum, b) => sum + Number(b.stock || 0),
          0,
        );
        const nextOutCost = computeNextOutCost(
          activeBatches,
          ingredient.brand,
          !!ingredient.perishable,
        );
        await fetch(`${apiUrl}/ingredients/${ingredient.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...ingredient,
            stock: totalStock,
            ...(nextOutCost !== null ? { cost_per_unit: nextOutCost } : {}),
          }),
        });
      } catch (err) {
        console.warn("Failed to sync ingredient stock:", err);
      }
    };

    const validateBatchForm = (form, ingredient) => {
      const pharma = isPharmaBrand(ingredient.brand);
      const fuel = isFuelBrand(ingredient.brand);
      const errors = [];

      if (!isPositiveOrZeroNumber(form.stock))
        errors.push("Count must be a valid number of 0 or more.");
      if (form.mfg_date && !isValidDateStr(form.mfg_date))
        errors.push("Manufacture date is not a valid date.");
      if (form.exp_date && !isValidDateStr(form.exp_date))
        errors.push("Expiry date is not a valid date.");
      if (form.supply_date && !isValidDateStr(form.supply_date))
        errors.push("Supply date is not a valid date.");

      if (
        form.mfg_date &&
        form.exp_date &&
        isValidDateStr(form.mfg_date) &&
        isValidDateStr(form.exp_date) &&
        new Date(form.mfg_date) > new Date(form.exp_date)
      ) {
        errors.push("Manufacture date cannot be after the expiry date.");
      }

      if (
        form.supply_date &&
        form.mfg_date &&
        isValidDateStr(form.supply_date) &&
        isValidDateStr(form.mfg_date) &&
        new Date(form.supply_date) < new Date(form.mfg_date)
      ) {
        errors.push(
          "Supply/receiving date cannot be before the manufacture date.",
        );
      }

      if (
        form.supply_date &&
        form.exp_date &&
        isValidDateStr(form.supply_date) &&
        isValidDateStr(form.exp_date) &&
        new Date(form.supply_date) > new Date(form.exp_date)
      ) {
        errors.push("Supply/receiving date cannot be after the expiry date.");
      }

      if (pharma || fuel) {
        errors.push(
          ...validateCategoryShelfLife({
            brand: ingredient.brand,
            category: ingredient.category,
            grade: form.grade,
            mfgDate: form.mfg_date,
            expiryDate: form.exp_date,
            noExpiry: !form.exp_date,
          }),
        );
      }

      if (form.exp_date && isValidDateStr(form.exp_date)) {
        if (
          computeExpiryStatus(form.exp_date, ingredient.brand) === "expired"
        ) {
          errors.push("This expiry date is already in the past.");
        }
      }

      if (pharma && form.controlled_substance && !form.lot_number) {
        errors.push("LOT Number is required for controlled substances.");
      }

      return [...new Set(errors)];
    };

    const saveBatch = async (form) => {
      const { batch, ingredient } = editingBatch;
      const errors = validateBatchForm(form, ingredient);
      if (errors.length > 0) {
        showUiModal({
          type: "error",
          title: "Please fix the following",
          lines: errors.map((t) => ({ text: t, warn: true })),
        });
        return;
      }
      setSavingBatch(true);
      const coords = await getBrowserLocation();
      const pharma = isPharmaBrand(ingredient.brand);
      const industryFields = {
        ...(pharma
          ? {
              lot_number: form.lot_number,
              ndc_code: form.ndc_code,
              dosage_form: form.dosage_form,
              strength: form.strength,
              storage_requirement: form.storage_requirement,
              controlled_substance: !!form.controlled_substance,
            }
          : {}),
        ...(isFuelBrand(ingredient.brand)
          ? {
              tank_id: form.tank_id,
              grade: form.grade,
              octane_rating: form.octane_rating,
              delivery_temp: form.delivery_temp,
              truck_id: form.truck_id,
              volume_correction: form.volume_correction,
            }
          : {}),
      };
      try {
        await fetch(`${apiUrl}/ingredient-batches/${batch.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            ...industryFields,
            performed_by: userName,
            performed_by_role: userRole || "Unknown",
            latitude: coords?.latitude,
            longitude: coords?.longitude,
          }),
        });
        await syncIngredientStock(ingredient);
        setEditingBatch(null);
        refreshBatches();
        onItemsChanged?.();
        setToast({
          type: "success",
          title: "Batch Updated",
          message: "The batch has been updated successfully.",
        });
      } catch {
        setToast({
          type: "error",
          title: "Connection Error",
          message: "Failed to save the batch.",
        });
      } finally {
        setSavingBatch(false);
      }
    };

    const confirmDeleteBatch = async () => {
      if (!deleteConfirmBatch) return;
      const { batch, ingredient } = deleteConfirmBatch;
      setDeletingBatch(true);
      try {
        await fetch(`${apiUrl}/ingredient-batch-delete-history`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            batch_data: batch,
            ingredient_id: ingredient.id,
            ingredient_name: ingredient.name,
            deleted_by: userName,
          }),
        });
        await fetch(`${apiUrl}/ingredient-batches/${batch.id}`, {
          method: "DELETE",
        });
        await syncIngredientStock(ingredient);
        refreshBatches();
        onItemsChanged?.();
        setToast({
          type: "success",
          title: "Batch Deleted",
          message: `Batch ${batch.batch_number || ""} has been deleted.`,
        });
      } catch {
        setToast({
          type: "error",
          title: "Connection Error",
          message: "Failed to delete the batch.",
        });
      } finally {
        setDeletingBatch(false);
        setDeleteConfirmBatch(null);
      }
    };

    useEffect(() => {
      if (!selectedId) {
        setBatches([]);
        return;
      }
      let cancelled = false;
      setBatchLoading(true);
      fetch(`${apiUrl}/ingredient-batches?ingredient_id=${selectedId}`)
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
    }, [selectedId, apiUrl, refreshToken]);

    const lowCount = brandItems.filter(
      (i) => Number(i.stock) < Number(i.min_stock),
    ).length;
    const listMaxHeight = expanded ? 700 : 480;

    return (
      <div
        style={{
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 2px 10px rgba(50,109,32,.05)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* header */}
        <div
          style={{
            padding: expanded ? "16px 22px" : "12px 18px",
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
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {onBack ? (
              <button
                onClick={onBack}
                title="Back to all brands"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  height: 34,
                  padding: "0 14px",
                  borderRadius: 9,
                  border: `1px solid ${C.border}`,
                  background: C.white,
                  color: C.greenDk,
                  fontSize: 13,
                  fontWeight: 800,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                <ArrowLeftIcon size={16} strokeWidth={2.5} />
              </button>
            ) : (
              <StoreIcon size={expanded ? 17 : 14} color={C.green} />
            )}
            <span style={{ fontWeight: 800, fontSize: expanded ? 17 : 14 }}>
              {brandDef.label}
            </span>
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 11,
            }}
          >
            <span style={{ opacity: 0.92 }}>
              {brandItems.length} item{brandItems.length === 1 ? "" : "s"}
              {lowCount > 0 ? ` · ${lowCount} low` : ""}
            </span>
            <button
              onClick={onOpenDeleteHistory}
              title={`View ${brandDef.label} delete history`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                height: 26,
                padding: "0 10px",
                borderRadius: 7,
                border: "1px solid #fecaca",
                background: C.white,
                color: C.red,
                fontSize: 11,
                fontWeight: 700,
                fontFamily: "inherit",
              }}
            >
              <HistoryIcon size={11} /> Delete History
              {deleteHistoryCount > 0 && (
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 800,
                    background: "#fee2e2",
                    color: C.red,
                    borderRadius: 20,
                    padding: "1px 6px",
                  }}
                >
                  {deleteHistoryCount}
                </span>
              )}
            </button>
            {!readOnly && (
              <>
                <button
                  onClick={() => onReceiveStock(brandDef, selected)}
                  title="Receive stock for this brand"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    height: 26,
                    padding: "0 11px",
                    borderRadius: 7,
                    border: `1px solid ${C.border}`,
                    background: C.white,
                    color: C.greenDk,
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "inherit",
                  }}
                >
                  <PlusIcon size={11} /> Receive Stock
                </button>
                <button
                  onClick={() => onQuickAdd(brandDef, branchF)}
                  title="Add a new ingredient to this brand"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    height: 26,
                    padding: "0 12px",
                    borderRadius: 7,
                    border: "none",
                    background: C.green,
                    color: C.white,
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                  }}
                >
                  <PlusIcon size={12} /> Add Item
                </button>
              </>
            )}
          </span>
        </div>

        {/* filter row (brand filter intentionally omitted — this card IS the brand filter) */}
        <div
          style={{
            padding: expanded ? "12px 18px" : "10px 14px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            background: "#fbfcf8",
          }}
        >
          <div
            style={{ position: "relative", flex: "1 1 160px", minWidth: 100 }}
          >
            <div
              style={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                color: C.muted,
              }}
            >
              <SearchIcon size={11} />
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              style={{
                ...invInputSt,
                height: 30,
                fontSize: 12,
                paddingLeft: 24,
              }}
            />
          </div>
          <BranchOnlyFilter
            branches={branchOptions}
            activeBranch={branchF}
            onChangeBranch={setBranchF}
          />
          {categoryOptions.length > 0 && (
            <select
              value={categoryF}
              onChange={(e) => setCategoryF(e.target.value)}
              style={{ ...invInputSt, height: 30, fontSize: 11, width: 150 }}
              title="Filter by Brand & Branch category"
            >
              <option value="">All Categories</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          <select
            value={unitF}
            onChange={(e) => setUnitF(e.target.value)}
            style={{ ...invInputSt, height: 30, fontSize: 11, width: 100 }}
          >
            <option value="">All Units</option>
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <select
            value={statusF}
            onChange={(e) => setStatusF(e.target.value)}
            style={{ ...invInputSt, height: 30, fontSize: 11, width: 110 }}
          >
            <option value="">All Status</option>
            <option value="low">Low Stock</option>
            <option value="ok">In Stock</option>
          </select>
        </div>

        {/* two columns: left = scrollable product list, right = scrollable FIFO/FEFO queue */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: expanded
              ? "minmax(360px,.95fr) minmax(430px,1.25fr)"
              : "1fr 1fr",
            minHeight: expanded ? 540 : 380,
            maxHeight: listMaxHeight,
          }}
        >
          <div
            style={{
              borderRight: `1px solid ${C.border}`,
              overflowY: "auto",
              maxHeight: listMaxHeight,
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
                No products found.
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
                    onClick={() => setSelectedId(item.id)}
                    style={{
                      padding: "10px 14px",
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
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12.5,
                          fontWeight: active ? 800 : 600,
                          color: C.ink,
                          fontFamily: "monospace",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.sku || "—"}
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
                        alignItems: "center",
                        gap: 6,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 9.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.name}
                      </span>
                      <span style={{ opacity: 0.45 }}>•</span>
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.branch}
                      </span>
                      {isDirectProductBrand(
                        item.brand || brandObj?.name || brandDef.label,
                      ) && (
                        <>
                          <span style={{ opacity: 0.45 }}>•</span>
                          <span
                            style={{
                              color: item.category ? C.greenDk : C.warn,
                              fontWeight: 700,
                            }}
                          >
                            {item.category || "Uncategorized"}
                          </span>
                        </>
                      )}
                    </div>
                    <div style={{ marginTop: 5 }}>
                      <MiniBar
                        pct={stockPct}
                        color={low ? C.warn : C.green}
                        height={4}
                      />
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 7 }}>
                      {!readOnly && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(item);
                            }}
                            className="edit-btn"
                            style={{
                              ...smallBtnSt,
                              height: 24,
                              padding: "0 9px",
                              fontSize: 10.5,
                              border: `1px solid ${C.border}`,
                              color: C.green,
                            }}
                          >
                            <EditIcon size={10} /> Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(item);
                            }}
                            className="del-btn"
                            style={{
                              ...smallBtnSt,
                              height: 24,
                              padding: "0 9px",
                              fontSize: 10.5,
                              border: "1px solid #fecaca",
                              color: "#e53935",
                            }}
                          >
                            <TrashIcon size={10} /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div
            style={{
              padding: expanded ? 17 : 14,
              overflowY: "auto",
              maxHeight: listMaxHeight,
              minHeight: 0,
            }}
          >
            <FifoQueue
              product={selected}
              batches={batches}
              loading={batchLoading}
              readOnly={readOnly}
              onEditBatch={(b) =>
                setEditingBatch({ batch: b, ingredient: selected })
              }
              onDeleteBatch={(b) =>
                setDeleteConfirmBatch({ batch: b, ingredient: selected })
              }
              onViewHistory={(b) =>
                setTransferHistoryBatch({ batch: b, ingredient: selected })
              }
            />
          </div>
        </div>
        {editingBatch && (
          <BatchEditModal
            ingredient={editingBatch.ingredient}
            batch={editingBatch.batch}
            saving={savingBatch}
            onClose={() => setEditingBatch(null)}
            onSave={saveBatch}
          />
        )}

        {deleteConfirmBatch && (
          <BatchDeleteConfirmModal
            batch={deleteConfirmBatch.batch}
            ingredient={deleteConfirmBatch.ingredient}
            deleting={deletingBatch}
            onConfirm={confirmDeleteBatch}
            onCancel={() => {
              if (!deletingBatch) setDeleteConfirmBatch(null);
            }}
          />
        )}

        {transferHistoryBatch && (
          <BatchTransferHistoryModal
            batch={transferHistoryBatch.batch}
            ingredient={transferHistoryBatch.ingredient}
            apiUrl={apiUrl}
            onClose={() => setTransferHistoryBatch(null)}
          />
        )}
      </div>
    );
  }

  function ReceiveStockModal({
    brandDef,
    brandItems,
    initialProduct,
    apiUrl,
    userName,
    userRole,
    onClose,
    onDone,
    showUiModal,
    setToast,
  }) {
    const nowLocal = () => {
      const d = new Date();
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 16);
    };

    const defaultBatchForm = () => ({
      stock: "",
      cost_batch: "",
      supplier: "",
      mfg_date: "",
      received_at: nowLocal(),
      exp_date: "",
      notes: "",
      lot_number: "",
      ndc_code: "",
      dosage_form: "",
      strength: "",
      storage_requirement: "",
      controlled_substance: false,
      tank_id: "",
      grade: "",
      octane_rating: "",
      delivery_temp: "",
      truck_id: "",
      volume_correction: "",
      noExpiry: false,
    });

    const [selectedIds, setSelectedIds] = useState(
      initialProduct?.id != null ? [initialProduct.id] : [],
    );
    const [activeIndex, setActiveIndex] = useState(0);
    const [formsById, setFormsById] = useState(() =>
      initialProduct?.id != null
        ? { [initialProduct.id]: defaultBatchForm() }
        : {},
    );
    const [savedIds, setSavedIds] = useState(() => new Set());
    const [saving, setSaving] = useState(false);
    const [productSearch, setProductSearch] = useState("");

    useEffect(() => {
      if (activeIndex >= selectedIds.length)
        setActiveIndex(Math.max(0, selectedIds.length - 1));
    }, [selectedIds, activeIndex]);

    const toggleProduct = (id) => {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
      setFormsById((prev) =>
        prev[id] ? prev : { ...prev, [id]: defaultBatchForm() },
      );
      setSavedIds((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    };

    const activeId = selectedIds[activeIndex];
    const product =
      brandItems.find((i) => String(i.id) === String(activeId)) || null;
    const form = formsById[activeId] || defaultBatchForm();
    const setF = (k, v) =>
      setFormsById((prev) => ({
        ...prev,
        [activeId]: { ...(prev[activeId] || defaultBatchForm()), [k]: v },
      }));

    const pharma = isPharmaBrand(product?.brand);
    const fuel = isFuelBrand(product?.brand);
    const directProduct = isDirectProductBrand(product?.brand);

    const qty = parseFloat(form.stock) || 0;
    const batchCost = parseFloat(form.cost_batch) || 0;
    const unitCost = qty > 0 && batchCost > 0 ? batchCost / qty : 0;

    const expiryRule = useMemo(
      () =>
        getCategoryShelfLifeRule(product?.brand, product?.category, form.grade),
      [product?.brand, product?.category, form.grade],
    );

    const expiryBounds = useMemo(
      () => getExpiryBoundsFromManufacture(form.mfg_date, expiryRule),
      [form.mfg_date, expiryRule],
    );

    const canUseNoExpiry = expiryRule
      ? !!expiryRule.allowNoExpiry
      : !pharma && !fuel;

    useEffect(() => {
      if (!canUseNoExpiry && form.noExpiry) setF("noExpiry", false);
    }, [canUseNoExpiry, form.noExpiry, activeId]);

    useEffect(() => {
      if (!product || form.noExpiry || !form.mfg_date || !expiryRule) return;
      const bounds = getExpiryBoundsFromManufacture(form.mfg_date, expiryRule);
      if (expiryRule.kind === "exact" && bounds.recommendedStr) {
        if (form.exp_date !== bounds.recommendedStr)
          setF("exp_date", bounds.recommendedStr);
        return;
      }
      if (
        (expiryRule.kind === "range" || expiryRule.kind === "max") &&
        bounds.recommendedStr &&
        !form.exp_date
      ) {
        setF("exp_date", bounds.recommendedStr);
      }
    }, [
      activeId,
      product?.id,
      form.mfg_date,
      form.noExpiry,
      expiryRule?.kind,
      expiryRule?.months,
      expiryRule?.minMonths,
      expiryRule?.maxMonths,
      expiryRule?.recommendedMonths,
    ]);

    const basicReceivedDateStr = useMemo(() => {
      if (!form.received_at || !isValidDateStr(form.received_at)) return "";
      const received = new Date(form.received_at);
      return [
        received.getFullYear(),
        String(received.getMonth() + 1).padStart(2, "0"),
        String(received.getDate()).padStart(2, "0"),
      ].join("-");
    }, [form.received_at]);

    const minExpiryDateStr = expiryRule
      ? expiryBounds.minStr
      : basicReceivedDateStr;
    const maxExpiryDateStr = expiryRule ? expiryBounds.maxStr : "";

    const syncIngredientStock = async (prod) => {
      const res = await fetch(
        `${apiUrl}/ingredient-batches?ingredient_id=${prod.id}`,
      );
      const freshBatches = await res.json();
      const activeBatches = Array.isArray(freshBatches) ? freshBatches : [];
      const totalStock = activeBatches.reduce(
        (sum, b) => sum + Number(b.stock || 0),
        0,
      );
      const nextOutCost = computeNextOutCost(
        activeBatches,
        prod.brand,
        !!prod.perishable,
      );

      const updateRes = await fetch(`${apiUrl}/ingredients/${prod.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...prod,
          stock: totalStock,
          ...(nextOutCost !== null ? { cost_per_unit: nextOutCost } : {}),
        }),
      });
      if (!updateRes.ok)
        throw new Error("Failed to sync product totals after receiving stock.");
    };

    const validateProductForm = (prod, f) => {
      const errors = [];
      if (!prod) {
        errors.push("Please select a product to receive stock for.");
        return errors;
      }
      const isPharma = isPharmaBrand(prod.brand);
      const isFuel = isFuelBrand(prod.brand);

      if (!isPositiveOrZeroNumber(f.stock) || parseFloat(f.stock) <= 0) {
        errors.push("Quantity received must be a number greater than 0.");
      }
      if (f.cost_batch !== "" && !isPositiveOrZeroNumber(f.cost_batch)) {
        errors.push("Total batch cost must be a valid number of 0 or more.");
      }
      if (
        f.cost_batch &&
        Number(f.cost_batch) > 0 &&
        (!f.stock || Number(f.stock) <= 0)
      ) {
        errors.push(
          "Enter the quantity received before the total batch cost, so cost per unit can be calculated.",
        );
      }
      if (f.mfg_date && !isValidDateStr(f.mfg_date))
        errors.push("Manufacture date is not a valid date.");
      if (f.received_at && !isValidDateStr(f.received_at))
        errors.push("Date & time received is not a valid date.");
      if (
        f.mfg_date &&
        f.received_at &&
        isValidDateStr(f.mfg_date) &&
        isValidDateStr(f.received_at) &&
        new Date(f.received_at) < new Date(f.mfg_date)
      ) {
        errors.push("Date received cannot be before the manufacture date.");
      }

      if (isPharma || isFuel) {
        errors.push(
          ...validateCategoryShelfLife({
            brand: prod.brand,
            category: prod.category,
            grade: f.grade,
            mfgDate: f.mfg_date,
            expiryDate: f.exp_date,
            noExpiry: f.noExpiry,
          }),
        );
      } else if (!f.noExpiry) {
        if (!f.exp_date) {
          errors.push("Expiry date is required.");
        } else if (!isValidDateStr(f.exp_date)) {
          errors.push("Expiry date is not a valid date.");
        } else if (
          f.received_at &&
          isValidDateStr(f.received_at) &&
          new Date(f.exp_date) < new Date(f.received_at)
        ) {
          errors.push("Expiry date cannot be earlier than the date received.");
        }
      }

      if (
        !f.noExpiry &&
        f.exp_date &&
        isValidDateStr(f.exp_date) &&
        f.received_at &&
        isValidDateStr(f.received_at) &&
        new Date(f.received_at) > new Date(f.exp_date)
      ) {
        errors.push("Date received cannot be after the expiry date.");
      }

      if (
        !f.noExpiry &&
        f.exp_date &&
        isValidDateStr(f.exp_date) &&
        computeExpiryStatus(f.exp_date, prod.brand) === "expired"
      ) {
        errors.push("Expiry date is already in the past.");
      }

      if (isPharma && f.controlled_substance && !f.lot_number) {
        errors.push("LOT Number is required for controlled substances.");
      }

      return [...new Set(errors)];
    };

    const buildBody = (prod, f, uName, uRole, coords) => {
      const isPharma = isPharmaBrand(prod.brand);
      const isFuel = isFuelBrand(prod.brand);
      const q = parseFloat(f.stock) || 0;
      const bc = parseFloat(f.cost_batch) || 0;
      const uc = q > 0 && bc > 0 ? bc / q : 0;
      return {
        ingredient_id: prod.id,
        stock: q,
        cost_per_unit: uc ? Math.round(uc * 100) / 100 : 0,
        supplier: f.supplier || null,
        mfg_date: f.mfg_date || null,
        supply_date: f.received_at
          ? new Date(f.received_at).toISOString()
          : null,
        exp_date: f.noExpiry ? null : f.exp_date || null,
        notes: f.notes || null,
        performed_by: uName,
        performed_by_role: uRole || "Unknown",
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        ...(isPharma
          ? {
              lot_number: f.lot_number || null,
              ndc_code: f.ndc_code || null,
              dosage_form: f.dosage_form || null,
              strength: f.strength || null,
              storage_requirement: f.storage_requirement || null,
              controlled_substance: !!f.controlled_substance,
            }
          : {}),
        ...(isFuel
          ? {
              tank_id: f.tank_id || null,
              grade: f.grade || null,
              octane_rating: f.octane_rating || null,
              delivery_temp: f.delivery_temp || null,
              truck_id: f.truck_id || null,
              volume_correction: f.volume_correction || null,
            }
          : {}),
      };
    };

    const saveAndContinue = () => {
      const errs = validateProductForm(product, form);
      if (errs.length > 0) {
        showUiModal({
          type: "error",
          title: "Please fix the following",
          lines: errs.map((t) => ({ text: t, warn: true })),
        });
        return;
      }
      const nextSaved = new Set(savedIds);
      nextSaved.add(activeId);
      setSavedIds(nextSaved);

      let nextIdx = -1;
      for (let i = activeIndex + 1; i < selectedIds.length; i++) {
        if (!nextSaved.has(selectedIds[i])) {
          nextIdx = i;
          break;
        }
      }
      if (nextIdx === -1) {
        for (let i = 0; i < selectedIds.length; i++) {
          if (!nextSaved.has(selectedIds[i])) {
            nextIdx = i;
            break;
          }
        }
      }
      if (nextIdx !== -1) setActiveIndex(nextIdx);
    };

    const submitAll = async () => {
      setSaving(true);
      const coords = await getBrowserLocation();
      const results = [];
      let lastProduct = null;

      for (const id of selectedIds) {
        const prod = brandItems.find((i) => String(i.id) === String(id));
        const f = formsById[id];
        if (!prod || !f) {
          results.push({
            ok: false,
            name: "Unknown product",
            reason: "missing data",
          });
          continue;
        }
        const body = buildBody(prod, f, userName, userRole, coords);
        try {
          const res = await fetch(`${apiUrl}/ingredient-batches`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const d = await res.json().catch(() => ({}));
          if (!res.ok || d?.success === false) {
            results.push({
              ok: false,
              name: prod.name,
              reason: d?.error || "failed to save",
            });
            continue;
          }
          await syncIngredientStock(prod);
          lastProduct = prod;
          results.push({ ok: true, name: prod.name });
        } catch (err) {
          results.push({
            ok: false,
            name: prod.name,
            reason: err?.message || "connection error",
          });
        }
      }

      setSaving(false);

      if (lastProduct) {
        await Promise.resolve(onDone?.(lastProduct));
        window.dispatchEvent(
          new CustomEvent("stock-inventory-updated", {
            detail: { ingredientId: lastProduct.id, brand: lastProduct.brand },
          }),
        );
      }

      const succeeded = results.filter((r) => r.ok);
      const failed = results.filter((r) => !r.ok);

      if (succeeded.length > 0 && failed.length === 0) {
        setToast({
          type: "success",
          title: "Stock Received",
          message:
            succeeded.length === 1
              ? `Batch logged for "${succeeded[0].name}".`
              : `Batches logged for ${succeeded.length} products.`,
        });
      } else if (succeeded.length > 0) {
        showUiModal({
          type: "info",
          title: "Received With Some Failures",
          message: `${succeeded.length} product(s) logged. ${failed.length} failed.`,
          lines: failed.map((f) => ({
            text: `${f.name}: ${f.reason}`,
            warn: true,
          })),
        });
      } else {
        showUiModal({
          type: "error",
          title: "Failed to Receive Stock",
          message: "None of the selected products were saved.",
          lines: failed.map((f) => ({
            text: `${f.name}: ${f.reason}`,
            warn: true,
          })),
        });
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (selectedIds.length === 0) {
        showUiModal({
          type: "error",
          title: "Please fix the following",
          lines: [{ text: "Select at least one product.", warn: true }],
        });
        return;
      }
      if (selectedIds.length === 1) {
        const errs = validateProductForm(product, form);
        if (errs.length > 0) {
          showUiModal({
            type: "error",
            title: "Please fix the following",
            lines: errs.map((t) => ({ text: t, warn: true })),
          });
          return;
        }
        await submitAll();
        return;
      }
      if (savedIds.size < selectedIds.length) {
        showUiModal({
          type: "error",
          title: "Please fix the following",
          lines: [
            {
              text: "Save each product before adding them to the queue.",
              warn: true,
            },
          ],
        });
        return;
      }
      await submitAll();
    };

    const multiMode = selectedIds.length >= 2;
    const filteredBrandItems = brandItems
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter(
        (i) =>
          !productSearch ||
          i.name.toLowerCase().includes(productSearch.toLowerCase()),
      );

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
          zIndex: 2200,
          padding: 20,
          backdropFilter: "blur(4px)",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: C.white,
            borderRadius: 20,
            width: "100%",
            maxWidth: 560,
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 24px 64px rgba(0,0,0,0.20)",
            fontFamily: "Plus Jakarta Sans,sans-serif",
          }}
        >
          <div
            style={{
              padding: "20px 26px",
              background: `linear-gradient(135deg,#fbbf24,${C.warn})`,
              color: "#fff",
              borderRadius: "20px 20px 0 0",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    letterSpacing: "0.02em",
                  }}
                >
                  RECEIVE STOCK
                </div>
                <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>
                  Log incoming inventory for {brandDef.label}
                  {multiMode
                    ? ` · ${selectedIds.length} products selected`
                    : ""}
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "#fff",
                  borderRadius: "50%",
                  width: 30,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <XIcon size={14} />
              </button>
            </div>
          </div>

          <form
            noValidate
            onSubmit={handleSubmit}
            style={{ padding: 24, display: "grid", gap: 14 }}
          >
            <div>
              <label style={invLabelSt}>
                Products *{" "}
                <span style={{ fontWeight: 400, color: C.muted }}>
                  (select one or more)
                </span>
              </label>
              <div style={{ position: "relative", marginBottom: 6 }}>
                <div
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: C.muted,
                  }}
                >
                  <SearchIcon size={12} />
                </div>
                <input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products…"
                  style={{ ...invInputSt, paddingLeft: 30 }}
                />
              </div>
              <div
                style={{
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 11,
                  padding: "8px 4px",
                  maxHeight: 180,
                  overflowY: "auto",
                }}
              >
                {filteredBrandItems.length === 0 ? (
                  <div
                    style={{
                      padding: "8px 10px",
                      fontSize: 12,
                      color: C.muted,
                    }}
                  >
                    No products found.
                  </div>
                ) : (
                  filteredBrandItems.map((i) => (
                    <label
                      key={i.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 10px",
                        cursor: "pointer",
                        fontSize: 13,
                        color: C.ink,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(i.id)}
                        onChange={() => toggleProduct(i.id)}
                      />
                      {i.name}{" "}
                      <span style={{ fontSize: 11, color: C.muted }}>
                        ({i.branch})
                      </span>
                    </label>
                  ))
                )}
              </div>
              {selectedIds.length > 0 && (
                <div style={{ fontSize: 11, color: C.muted, marginTop: 5 }}>
                  {selectedIds.length} product
                  {selectedIds.length === 1 ? "" : "s"} selected
                </div>
              )}
            </div>

            {selectedIds.length === 0 ? (
              <div
                style={{
                  padding: "20px 0",
                  textAlign: "center",
                  color: C.muted,
                  fontSize: 13,
                  fontStyle: "italic",
                }}
              >
                Select at least one product above to continue.
              </div>
            ) : (
              <>
                {multiMode && (
                  <div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                      {selectedIds.map((id, idx) => (
                        <div
                          key={id}
                          style={{
                            flex: 1,
                            height: 4,
                            borderRadius: 4,
                            background: savedIds.has(id)
                              ? C.green
                              : idx === activeIndex
                                ? C.amber
                                : C.border,
                          }}
                        />
                      ))}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 10,
                        gap: 8,
                      }}
                    >
                      <button
                        type="button"
                        disabled={activeIndex === 0}
                        onClick={() =>
                          setActiveIndex((i) => Math.max(0, i - 1))
                        }
                        style={{
                          ...smallBtnSt,
                          border: `1px solid ${C.border}`,
                          opacity: activeIndex === 0 ? 0.4 : 1,
                          minWidth: 0,
                          overflow: "hidden",
                        }}
                      >
                        <ArrowLeftIcon size={12} />
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {selectedIds[activeIndex - 1]
                            ? brandItems.find(
                                (x) => x.id === selectedIds[activeIndex - 1],
                              )?.name || ""
                            : ""}
                        </span>
                      </button>
                      <span
                        style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}
                      >
                        product {activeIndex + 1} of {selectedIds.length}
                      </span>
                      <button
                        type="button"
                        disabled={activeIndex === selectedIds.length - 1}
                        onClick={() =>
                          setActiveIndex((i) =>
                            Math.min(selectedIds.length - 1, i + 1),
                          )
                        }
                        style={{
                          ...smallBtnSt,
                          border: `1px solid ${C.border}`,
                          opacity:
                            activeIndex === selectedIds.length - 1 ? 0.4 : 1,
                          minWidth: 0,
                          overflow: "hidden",
                        }}
                      >
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {selectedIds[activeIndex + 1]
                            ? brandItems.find(
                                (x) => x.id === selectedIds[activeIndex + 1],
                              )?.name || ""
                            : ""}
                        </span>
                        <ArrowRightIcon size={12} />
                      </button>
                    </div>
                  </div>
                )}

                <div
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    color: C.muted,
                    letterSpacing: "0.06em",
                    borderBottom: `1px solid ${C.border}`,
                    paddingBottom: 6,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>BATCH DETAILS — {product?.name || "—"}</span>
                  {multiMode && savedIds.has(activeId) && (
                    <span
                      style={{
                        color: C.greenDk,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <CheckCircleIcon size={12} /> Saved
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div>
                    <label style={invLabelSt}>
                      Quantity ({product?.unit || "unit"}) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      style={invInputSt}
                      value={form.stock}
                      required
                      placeholder="0.00"
                      onChange={(e) => setF("stock", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={invLabelSt}>Total Batch Cost (₱)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      style={invInputSt}
                      value={form.cost_batch}
                      placeholder="e.g. 4000.00"
                      onChange={(e) => setF("cost_batch", e.target.value)}
                    />
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>
                      What you paid for this whole batch — not per unit
                    </div>
                  </div>
                </div>
                {batchCost > 0 && qty > 0 && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 13px",
                        borderRadius: 9,
                        background: C.bg,
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: C.muted,
                        }}
                      >
                        Cost / Unit
                      </div>
                      <div
                        style={{ fontSize: 10, color: C.muted, marginTop: 2 }}
                      >
                        ₱{batchCost.toFixed(2)} ÷ {qty}{" "}
                        {product?.unit || "unit"}
                      </div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 900,
                          color: C.ink,
                          marginTop: 4,
                        }}
                      >
                        ₱{unitCost.toFixed(2)}
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "10px 13px",
                        borderRadius: 9,
                        background: C.greenLt,
                        border: `1px solid ${C.greenMid}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: C.greenDk,
                        }}
                      >
                        {directProduct ? "Auto Selling Price" : "Shop Price"}
                      </div>
                      <div
                        style={{ fontSize: 10, color: C.muted, marginTop: 2 }}
                      >
                        {directProduct
                          ? "cost/unit + 30% operations + 40% profit"
                          : "cost/unit + 10% (weighted avg across batches)"}
                      </div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 900,
                          color: C.greenDk,
                          marginTop: 4,
                        }}
                      >
                        ₱
                        {(directProduct
                          ? computeDirectSellingPrice(unitCost)
                          : unitCost * 1.1
                        ).toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  <label style={invLabelSt}>Supplier</label>
                  <input
                    style={invInputSt}
                    value={form.supplier}
                    placeholder="Supplier name"
                    onChange={(e) => setF("supplier", e.target.value)}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div>
                    <label style={invLabelSt}>Manufacture Date</label>
                    <input
                      type="date"
                      style={invInputSt}
                      value={form.mfg_date}
                      onChange={(e) => setF("mfg_date", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={invLabelSt}>Date &amp; Time Received</label>
                    <input
                      type="datetime-local"
                      style={invInputSt}
                      value={form.received_at}
                      onChange={(e) => setF("received_at", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 5,
                    }}
                  >
                    <label style={{ ...invLabelSt, marginBottom: 0 }}>
                      {canUseNoExpiry ? "Expiry Date" : "Expiry Date *"}
                    </label>
                    {canUseNoExpiry && (
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: C.muted,
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={form.noExpiry}
                          onChange={(e) => {
                            setF("noExpiry", e.target.checked);
                            if (e.target.checked) setF("exp_date", "");
                          }}
                        />
                        No expiry date
                      </label>
                    )}
                  </div>

                  <input
                    type="date"
                    style={{
                      ...invInputSt,
                      opacity:
                        form.noExpiry ||
                        (!!expiryRule?.requiresManufactureDate &&
                          !form.mfg_date) ||
                        expiryRule?.kind === "missing-category" ||
                        expiryRule?.kind === "unconfigured-fuel"
                          ? 0.5
                          : 1,
                    }}
                    value={form.exp_date}
                    min={minExpiryDateStr || undefined}
                    max={maxExpiryDateStr || undefined}
                    required={!form.noExpiry}
                    disabled={
                      form.noExpiry ||
                      (!!expiryRule?.requiresManufactureDate &&
                        !form.mfg_date) ||
                      expiryRule?.kind === "missing-category" ||
                      expiryRule?.kind === "unconfigured-fuel"
                    }
                    onChange={(e) => setF("exp_date", e.target.value)}
                  />

                  <div
                    style={{
                      fontSize: 11,
                      color:
                        expiryRule?.kind === "missing-category" ||
                        expiryRule?.kind === "unconfigured-fuel"
                          ? C.warn
                          : C.muted,
                      marginTop: 5,
                      lineHeight: 1.45,
                    }}
                  >
                    {expiryRule ? (
                      shelfLifeHelperText(
                        expiryRule,
                        expiryBounds,
                        product?.category,
                      )
                    ) : (
                      <>
                        Expiry must not be earlier than the date received.
                        {minExpiryDateStr && (
                          <>
                            {" "}
                            Earliest allowed:{" "}
                            <strong style={{ color: C.ink }}>
                              {fmtDate(minExpiryDateStr)}
                            </strong>
                            .
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {pharma && (
                  <div
                    style={{
                      display: "grid",
                      gap: 12,
                      padding: 14,
                      background: "#eef2ff",
                      border: "1px solid #c7d2fe",
                      borderRadius: 10,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        color: "#3730a3",
                        letterSpacing: "0.06em",
                      }}
                    >
                      PHARMACY DETAILS
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 12,
                      }}
                    >
                      <div>
                        <label style={invLabelSt}>LOT Number</label>
                        <input
                          style={invInputSt}
                          value={form.lot_number}
                          onChange={(e) => setF("lot_number", e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={invLabelSt}>NDC Code</label>
                        <input
                          style={invInputSt}
                          value={form.ndc_code}
                          onChange={(e) => setF("ndc_code", e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={invLabelSt}>Dosage Form</label>
                        <select
                          style={invInputSt}
                          value={form.dosage_form}
                          onChange={(e) => setF("dosage_form", e.target.value)}
                        >
                          <option value="">Select…</option>
                          {DOSAGE_FORMS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={invLabelSt}>Strength</label>
                        <input
                          style={invInputSt}
                          value={form.strength}
                          placeholder="e.g. 500mg"
                          onChange={(e) => setF("strength", e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={invLabelSt}>Storage Requirement</label>
                        <select
                          style={invInputSt}
                          value={form.storage_requirement}
                          onChange={(e) =>
                            setF("storage_requirement", e.target.value)
                          }
                        >
                          <option value="">Select…</option>
                          {STORAGE_REQS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginTop: 18,
                        }}
                      >
                        <input
                          type="checkbox"
                          id={`controlled-${activeId}`}
                          checked={form.controlled_substance}
                          onChange={(e) =>
                            setF("controlled_substance", e.target.checked)
                          }
                        />
                        <label
                          htmlFor={`controlled-${activeId}`}
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#3730a3",
                            cursor: "pointer",
                          }}
                        >
                          Controlled substance
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {fuel && (
                  <div
                    style={{
                      display: "grid",
                      gap: 12,
                      padding: 14,
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      borderRadius: 10,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        color: "#1e40af",
                        letterSpacing: "0.06em",
                      }}
                    >
                      FUEL DETAILS
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 12,
                      }}
                    >
                      <div>
                        <label style={invLabelSt}>Tank ID</label>
                        <input
                          style={invInputSt}
                          value={form.tank_id}
                          onChange={(e) => setF("tank_id", e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={invLabelSt}>Grade</label>
                        <select
                          style={invInputSt}
                          value={form.grade}
                          onChange={(e) => setF("grade", e.target.value)}
                        >
                          <option value="">Select…</option>
                          {FUEL_GRADES.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={invLabelSt}>Octane Rating</label>
                        <input
                          style={invInputSt}
                          value={form.octane_rating}
                          placeholder="e.g. 95"
                          onChange={(e) =>
                            setF("octane_rating", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label style={invLabelSt}>Delivery Temp (°F)</label>
                        <input
                          type="number"
                          style={invInputSt}
                          value={form.delivery_temp}
                          onChange={(e) =>
                            setF("delivery_temp", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label style={invLabelSt}>Truck / Tanker ID</label>
                        <input
                          style={invInputSt}
                          value={form.truck_id}
                          onChange={(e) => setF("truck_id", e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={invLabelSt}>Net Volume @ 60°F</label>
                        <input
                          style={invInputSt}
                          value={form.volume_correction}
                          placeholder="API corrected volume"
                          onChange={(e) =>
                            setF("volume_correction", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label style={invLabelSt}>Notes</label>
                  <textarea
                    style={{
                      ...invInputSt,
                      height: 64,
                      padding: "8px 11px",
                      resize: "vertical",
                    }}
                    value={form.notes}
                    placeholder="Optional notes…"
                    onChange={(e) => setF("notes", e.target.value)}
                  />
                </div>

                {multiMode && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      padding: "10px 0",
                      borderTop: `1px solid ${C.border}`,
                    }}
                  >
                    {selectedIds.map((id, idx) => {
                      const p = brandItems.find((x) => x.id === id);
                      const isSaved = savedIds.has(id);
                      const isActive = idx === activeIndex;
                      return (
                        <button
                          type="button"
                          key={id}
                          onClick={() => setActiveIndex(idx)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 11,
                            padding: "3px 9px",
                            borderRadius: 20,
                            border: `1px solid ${isSaved ? C.greenMid : isActive ? C.amberBorder : C.border}`,
                            background: isSaved
                              ? C.greenLt
                              : isActive
                                ? C.amberBg
                                : C.white,
                            color: isSaved
                              ? C.greenDk
                              : isActive
                                ? C.warn
                                : C.muted,
                            cursor: "pointer",
                          }}
                        >
                          {isSaved ? (
                            <CheckCircleIcon size={11} />
                          ) : isActive ? (
                            <EditIcon size={11} />
                          ) : (
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                border: `1.5px dashed ${C.muted}`,
                              }}
                            />
                          )}
                          {p?.name || "—"}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div style={{ display: "flex", gap: 8 }}>
                  {multiMode && (
                    <button
                      type="button"
                      onClick={saveAndContinue}
                      disabled={saving}
                      style={{
                        ...btnAmberSt,
                        flex: 1,
                        justifyContent: "center",
                        height: 46,
                        fontSize: 13.5,
                        opacity: saving ? 0.6 : 1,
                        cursor: saving ? "not-allowed" : "pointer",
                      }}
                    >
                      <Check size={14} /> Save and continue
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={
                      saving ||
                      selectedIds.length === 0 ||
                      (multiMode && savedIds.size < selectedIds.length)
                    }
                    style={{
                      ...btnPrimarySt,
                      flex: 1,
                      justifyContent: "center",
                      height: 46,
                      fontSize: 13.5,
                      opacity:
                        saving ||
                        selectedIds.length === 0 ||
                        (multiMode && savedIds.size < selectedIds.length)
                          ? 0.5
                          : 1,
                      cursor:
                        saving ||
                        selectedIds.length === 0 ||
                        (multiMode && savedIds.size < selectedIds.length)
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    <PlusIcon size={14} />{" "}
                    {saving
                      ? "Saving…"
                      : multiMode
                        ? `Add all ${selectedIds.length} to queue`
                        : "Receive & Add to Queue"}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    );
  }
  /* ─────────────────────────────────────────────────────────────────────────
   BATCH DELETE HISTORY PANEL
───────────────────────────────────────────────────────────────────────── */
  function BatchDeleteHistoryPanel({
    history,
    restoringId,
    onRestore,
    onClose,
  }) {
    return (
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(13,43,30,0.55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 3000,
          padding: 20,
          backdropFilter: "blur(5px)",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: C.white,
            borderRadius: 20,
            padding: "26px 30px",
            width: "100%",
            maxWidth: 660,
            maxHeight: "80vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 24px 64px rgba(0,0,0,0.20)",
            border: "1px solid #fecaca",
            fontFamily: "Plus Jakarta Sans,sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: C.ink,
                  margin: 0,
                }}
              >
                Batch Delete History
              </h2>
              {history.length > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: "#fee2e2",
                    color: "#dc2626",
                  }}
                >
                  {history.length} deleted
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1px solid #fecaca",
                background: "#fef2f2",
                cursor: "pointer",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <XIcon size={14} />
            </button>
          </div>
          {history.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 70px 100px 130px 90px",
                gap: 8,
                padding: "6px 0 10px",
                borderBottom: "2px solid #fee2e2",
                fontSize: 10,
                fontWeight: 800,
                color: "#dc2626",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              <span>Batch No.</span>
              <span>Stock</span>
              <span>Exp Date</span>
              <span>Deleted At</span>
              <span></span>
            </div>
          )}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {history.length === 0 ? (
              <div style={{ padding: "44px 0", textAlign: "center" }}>
                <div
                  style={{
                    color: "#9ca3af",
                    fontSize: 13,
                    fontStyle: "italic",
                  }}
                >
                  No deleted batches yet.
                </div>
              </div>
            ) : (
              history.map((entry, i) => {
                const d = entry.data || {};
                const expStr = fmtDate(d.exp_date);
                return (
                  <div
                    key={entry.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 70px 100px 130px 90px",
                      gap: 8,
                      alignItems: "center",
                      padding: "12px 0",
                      borderBottom:
                        i < history.length - 1 ? "1px solid #fff0f0" : "none",
                    }}
                  >
                    <div>
                      <div
                        style={{ fontWeight: 700, fontSize: 13, color: C.ink }}
                      >
                        {d.batch_number || (
                          <span style={{ color: C.muted, fontStyle: "italic" }}>
                            No batch #
                          </span>
                        )}
                      </div>
                      {d.notes && (
                        <div
                          style={{ fontSize: 11, color: C.muted, marginTop: 1 }}
                        >
                          {d.notes}
                        </div>
                      )}
                    </div>
                    <div
                      style={{ fontSize: 13, fontWeight: 600, color: C.ink }}
                    >
                      {d.stock ?? "—"}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      {expStr}
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>
                      {entry.deletedAt ? fmtTs(entry.deletedAt) : "—"}
                    </div>
                    <button
                      onClick={() => onRestore(entry)}
                      disabled={restoringId !== null}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "7px 12px",
                        borderRadius: 9,
                        border: `1.5px solid ${C.green}`,
                        background: "#e0f2f1",
                        color: C.greenDk,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor:
                          restoringId !== null ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                        whiteSpace: "nowrap",
                        opacity:
                          restoringId !== null
                            ? restoringId === entry.id
                              ? 0.85
                              : 0.4
                            : 1,
                      }}
                    >
                      {restoringId === entry.id ? (
                        <>
                          <RefreshCw
                            size={12}
                            style={{ animation: "spin 1s linear infinite" }}
                          />{" "}
                          Restoring…
                        </>
                      ) : (
                        <>
                          <RestoreIcon /> Restore
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────
   BATCH EDIT MODAL — standalone modal (opened on top of BatchesModal) for
   editing a single batch's queuing details (expiry date, stock, etc).
───────────────────────────────────────────────────────────────────────── */
  function BatchEditModal({ ingredient, batch, onClose, onSave, saving }) {
    const pharma = isPharmaBrand(ingredient.brand);
    const fuel = isFuelBrand(ingredient.brand);
    const [noExpiry, setNoExpiry] = useState(!batch.exp_date);

    const toDatetimeLocal = (isoStr) => {
      if (!isoStr) return "";
      const d = new Date(isoStr);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 16);
    };

    const [form, setForm] = useState({
      stock: batch.stock || 0,
      mfg_date: batch.mfg_date ? batch.mfg_date.split("T")[0] : "",
      exp_date: batch.exp_date ? batch.exp_date.split("T")[0] : "",
      supply_date: toDatetimeLocal(batch.supply_date),
      notes: batch.notes || "",
      supplier: batch.supplier || "",
      cost_per_unit: batch.cost_per_unit || "",
      lot_number: batch.lot_number || "",
      ndc_code: batch.ndc_code || "",
      dosage_form: batch.dosage_form || "",
      strength: batch.strength || "",
      storage_requirement: batch.storage_requirement || "",
      controlled_substance: !!batch.controlled_substance,
      tank_id: batch.tank_id || "",
      grade: batch.grade || "",
      octane_rating: batch.octane_rating || "",
      delivery_temp: batch.delivery_temp || "",
      truck_id: batch.truck_id || "",
      volume_correction: batch.volume_correction || "",
    });

    const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const getExpiryStatus = (exp_date, brand) =>
      computeExpiryStatus(exp_date, brand);

    const editExpiryRule = useMemo(
      () =>
        getCategoryShelfLifeRule(
          ingredient.brand,
          ingredient.category,
          form.grade,
        ),
      [ingredient.brand, ingredient.category, form.grade],
    );

    const editExpiryBounds = useMemo(
      () => getExpiryBoundsFromManufacture(form.mfg_date, editExpiryRule),
      [form.mfg_date, editExpiryRule],
    );

    const canEditNoExpiry = editExpiryRule
      ? !!editExpiryRule.allowNoExpiry
      : !pharma && !fuel;

    useEffect(() => {
      if (!canEditNoExpiry && noExpiry) setNoExpiry(false);
    }, [canEditNoExpiry, noExpiry]);

    const submit = (e) => {
      e.preventDefault();
      onSave({
        ...form,
        exp_date: noExpiry ? "" : form.exp_date,
        supply_date: form.supply_date
          ? new Date(form.supply_date).toISOString()
          : null,
      });
    };

    return (
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(13,43,30,0.55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2600,
          padding: 20,
          backdropFilter: "blur(5px)",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: C.white,
            borderRadius: 18,
            width: "100%",
            maxWidth: 560,
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 24px 64px rgba(0,0,0,0.20)",
            fontFamily: "Plus Jakarta Sans,sans-serif",
          }}
        >
          <div
            style={{
              padding: "18px 24px",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>
                Edit Batch {batch.batch_number || ""}
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                {ingredient.name} · {ingredient.branch}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                border: `1px solid ${C.border}`,
                background: C.white,
                cursor: "pointer",
                color: C.muted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <XIcon size={14} />
            </button>
          </div>

          <form
            noValidate
            onSubmit={submit}
            style={{ padding: 22, display: "grid", gap: 14 }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div>
                <label style={invLabelSt}>Quantity *</label>
                <input
                  type="number"
                  min="0"
                  required
                  style={invInputSt}
                  value={form.stock}
                  onChange={(e) => setF("stock", e.target.value)}
                />
              </div>
              <div>
                <label style={invLabelSt}>Supplier</label>
                <input
                  style={invInputSt}
                  value={form.supplier}
                  placeholder="Supplier name"
                  onChange={(e) => setF("supplier", e.target.value)}
                />
              </div>
              <div>
                <label style={invLabelSt}>Cost/Unit (₱)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  style={invInputSt}
                  value={form.cost_per_unit}
                  onChange={(e) => setF("cost_per_unit", e.target.value)}
                />
              </div>
              <div>
                <label style={invLabelSt}>Mfg Date</label>
                <input
                  type="date"
                  style={invInputSt}
                  value={form.mfg_date}
                  onChange={(e) => setF("mfg_date", e.target.value)}
                />
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    marginBottom: 5,
                  }}
                >
                  <label style={{ ...invLabelSt, marginBottom: 0 }}>
                    {canEditNoExpiry ? "Exp Date" : "Exp Date *"}
                  </label>
                  {canEditNoExpiry && (
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 10.5,
                        fontWeight: 600,
                        color: C.muted,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={noExpiry}
                        onChange={(e) => {
                          setNoExpiry(e.target.checked);
                          if (e.target.checked) setF("exp_date", "");
                        }}
                      />
                      No expiry
                    </label>
                  )}
                </div>

                <input
                  type="date"
                  style={{
                    ...invInputSt,
                    opacity:
                      noExpiry ||
                      (!!editExpiryRule?.requiresManufactureDate &&
                        !form.mfg_date) ||
                      editExpiryRule?.kind === "missing-category" ||
                      editExpiryRule?.kind === "unconfigured-fuel"
                        ? 0.5
                        : 1,
                  }}
                  value={form.exp_date}
                  min={editExpiryBounds.minStr || undefined}
                  max={editExpiryBounds.maxStr || undefined}
                  required={!noExpiry}
                  disabled={
                    noExpiry ||
                    (!!editExpiryRule?.requiresManufactureDate &&
                      !form.mfg_date) ||
                    editExpiryRule?.kind === "missing-category" ||
                    editExpiryRule?.kind === "unconfigured-fuel"
                  }
                  onChange={(e) => setF("exp_date", e.target.value)}
                />

                {editExpiryRule && (
                  <div
                    style={{
                      marginTop: 5,
                      fontSize: 11,
                      lineHeight: 1.45,
                      color:
                        editExpiryRule.kind === "missing-category" ||
                        editExpiryRule.kind === "unconfigured-fuel"
                          ? C.warn
                          : C.muted,
                    }}
                  >
                    {shelfLifeHelperText(
                      editExpiryRule,
                      editExpiryBounds,
                      ingredient.category,
                    )}
                  </div>
                )}

                {form.exp_date &&
                  getExpiryStatus(form.exp_date, ingredient.brand) ===
                    "expired" && (
                    <div
                      style={{
                        marginTop: 5,
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.red,
                      }}
                    >
                      This expiry date is already in the past.
                    </div>
                  )}
              </div>
              <div>
                <label style={invLabelSt}>Supply Date &amp; Time</label>
                <input
                  type="datetime-local"
                  style={invInputSt}
                  value={form.supply_date}
                  onChange={(e) => setF("supply_date", e.target.value)}
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={invLabelSt}>Notes</label>
                <input
                  style={invInputSt}
                  value={form.notes}
                  placeholder="Optional notes…"
                  onChange={(e) => setF("notes", e.target.value)}
                />
              </div>
            </div>

            {pharma && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  padding: 14,
                  background: "#eef2ff",
                  border: "1px solid #c7d2fe",
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    gridColumn: "1 / -1",
                    fontSize: 10.5,
                    fontWeight: 800,
                    color: "#3730a3",
                    letterSpacing: "0.06em",
                  }}
                >
                  PHARMACY DETAILS
                </div>
                <div>
                  <label style={invLabelSt}>LOT Number</label>
                  <input
                    style={invInputSt}
                    value={form.lot_number}
                    onChange={(e) => setF("lot_number", e.target.value)}
                  />
                </div>
                <div>
                  <label style={invLabelSt}>NDC Code</label>
                  <input
                    style={invInputSt}
                    value={form.ndc_code}
                    onChange={(e) => setF("ndc_code", e.target.value)}
                  />
                </div>
                <div>
                  <label style={invLabelSt}>Dosage Form</label>
                  <select
                    style={invInputSt}
                    value={form.dosage_form}
                    onChange={(e) => setF("dosage_form", e.target.value)}
                  >
                    <option value="">Select…</option>
                    {DOSAGE_FORMS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={invLabelSt}>Strength</label>
                  <input
                    style={invInputSt}
                    value={form.strength}
                    placeholder="e.g. 500mg"
                    onChange={(e) => setF("strength", e.target.value)}
                  />
                </div>
                <div>
                  <label style={invLabelSt}>Storage</label>
                  <select
                    style={invInputSt}
                    value={form.storage_requirement}
                    onChange={(e) =>
                      setF("storage_requirement", e.target.value)
                    }
                  >
                    <option value="">Select…</option>
                    {STORAGE_REQS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 18,
                  }}
                >
                  <input
                    type="checkbox"
                    id="controlled-edit"
                    checked={form.controlled_substance}
                    onChange={(e) =>
                      setF("controlled_substance", e.target.checked)
                    }
                  />
                  <label
                    htmlFor="controlled-edit"
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#3730a3",
                      cursor: "pointer",
                    }}
                  >
                    Controlled substance
                  </label>
                </div>
              </div>
            )}

            {fuel && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  padding: 14,
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    gridColumn: "1 / -1",
                    fontSize: 10.5,
                    fontWeight: 800,
                    color: "#1e40af",
                    letterSpacing: "0.06em",
                  }}
                >
                  FUEL DETAILS
                </div>
                <div>
                  <label style={invLabelSt}>Tank ID</label>
                  <input
                    style={invInputSt}
                    value={form.tank_id}
                    onChange={(e) => setF("tank_id", e.target.value)}
                  />
                </div>
                <div>
                  <label style={invLabelSt}>Grade</label>
                  <select
                    style={invInputSt}
                    value={form.grade}
                    onChange={(e) => setF("grade", e.target.value)}
                  >
                    <option value="">Select…</option>
                    {FUEL_GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={invLabelSt}>Octane Rating</label>
                  <input
                    style={invInputSt}
                    value={form.octane_rating}
                    onChange={(e) => setF("octane_rating", e.target.value)}
                  />
                </div>
                <div>
                  <label style={invLabelSt}>Delivery Temp (°F)</label>
                  <input
                    type="number"
                    style={invInputSt}
                    value={form.delivery_temp}
                    onChange={(e) => setF("delivery_temp", e.target.value)}
                  />
                </div>
                <div>
                  <label style={invLabelSt}>Truck/Tanker ID</label>
                  <input
                    style={invInputSt}
                    value={form.truck_id}
                    onChange={(e) => setF("truck_id", e.target.value)}
                  />
                </div>
                <div>
                  <label style={invLabelSt}>Net Vol @ 60°F</label>
                  <input
                    style={invInputSt}
                    value={form.volume_correction}
                    onChange={(e) => setF("volume_correction", e.target.value)}
                  />
                </div>
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                paddingTop: 8,
                borderTop: `1px solid ${C.border}`,
              }}
            >
              <button type="button" onClick={onClose} style={btnSt}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{ ...btnPrimarySt, opacity: saving ? 0.6 : 1 }}
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function BatchesModal({
    ingredient,
    batches,
    loading,
    onClose,
    onRefresh,
    apiUrl,
    userName,
    userRole,
    showUiModal,
    setToast,
    readOnly = false,
  }) {
    const pharma = isPharmaBrand(ingredient.brand);
    const [editingBatch, setEditingBatch] = useState(null);
    const [savingEdit, setSavingEdit] = useState(false);
    const [batchDeleteHistory, setBatchDeleteHistory] = useState([]);
    const [showBatchHistory, setShowBatchHistory] = useState(false);
    const [deleteConfirmBatch, setDeleteConfirmBatch] = useState(null);
    const [deletingBatch, setDeletingBatch] = useState(false);
    const [restoringBatchId, setRestoringBatchId] = useState(null);

    const [historyBatch, setHistoryBatch] = useState(null);

    const fetchBatchHistory = useCallback(async () => {
      try {
        const res = await fetch(
          `${apiUrl}/ingredient-batch-delete-history?ingredient_id=${ingredient.id}`,
        );
        const data = await res.json();
        setBatchDeleteHistory(
          Array.isArray(data)
            ? data.map((row) => ({
                id: row.id,
                data: row.batch_data,
                deletedAt: row.deleted_at,
                deletedBy: row.deleted_by,
              }))
            : [],
        );
      } catch (err) {
        console.warn("Failed to fetch batch delete history:", err);
      }
    }, [apiUrl, ingredient.id]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
      fetchBatchHistory();
    }, [fetchBatchHistory]);

    const getExpiryStatus = (exp_date, brand) =>
      computeExpiryStatus(exp_date, brand);

    const statusStyle = {
      expired: {
        badgeText: "#991b1b",
        border: "#f3c9c9",
        label: "EXPIRED",
        dateColor: "#dc2626",
      },
      critical: {
        badgeText: "#9a3412",
        border: "#f0d3b2",
        label: "EXPIRING CRITICAL",
        dateColor: "#ea580c",
      },
      warning: {
        badgeText: "#854d0e",
        border: "#ecdca0",
        label: "EXPIRING SOON",
        dateColor: "#ca8a04",
      },
      ok: { badgeText: null, border: C.border, label: null, dateColor: C.ink },
    };

    const syncIngredientStock = async () => {
      try {
        const res = await fetch(
          `${apiUrl}/ingredient-batches?ingredient_id=${ingredient.id}`,
        );
        const freshBatches = await res.json();
        const activeBatches = Array.isArray(freshBatches) ? freshBatches : [];
        const totalStock = activeBatches.reduce(
          (sum, b) => sum + Number(b.stock || 0),
          0,
        );
        const nextOutCost = computeNextOutCost(
          activeBatches,
          ingredient.brand,
          !!ingredient.perishable,
        );
        await fetch(`${apiUrl}/ingredients/${ingredient.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...ingredient,
            stock: totalStock,
            ...(nextOutCost !== null ? { cost_per_unit: nextOutCost } : {}),
          }),
        });
        window.dispatchEvent(
          new CustomEvent("stock-inventory-updated", {
            detail: { ingredientId: ingredient.id, brand: ingredient.brand },
          }),
        );
      } catch (err) {
        console.warn("Failed to sync ingredient stock:", err);
      }
    };

    const validateBatchForm = (form) => {
      const fuel = isFuelBrand(ingredient.brand);
      const errors = [];

      if (!isPositiveOrZeroNumber(form.stock))
        errors.push("Count must be a valid number of 0 or more.");
      if (form.mfg_date && !isValidDateStr(form.mfg_date))
        errors.push("Manufacture date is not a valid date.");
      if (form.exp_date && !isValidDateStr(form.exp_date))
        errors.push("Expiry date is not a valid date.");
      if (form.supply_date && !isValidDateStr(form.supply_date))
        errors.push("Supply date is not a valid date.");

      if (
        form.mfg_date &&
        form.exp_date &&
        isValidDateStr(form.mfg_date) &&
        isValidDateStr(form.exp_date) &&
        new Date(form.mfg_date) > new Date(form.exp_date)
      ) {
        errors.push("Manufacture date cannot be after the expiry date.");
      }

      if (
        form.supply_date &&
        form.mfg_date &&
        isValidDateStr(form.supply_date) &&
        isValidDateStr(form.mfg_date) &&
        new Date(form.supply_date) < new Date(form.mfg_date)
      ) {
        errors.push(
          "Supply/receiving date cannot be before the manufacture date.",
        );
      }

      if (
        form.supply_date &&
        form.exp_date &&
        isValidDateStr(form.supply_date) &&
        isValidDateStr(form.exp_date) &&
        new Date(form.supply_date) > new Date(form.exp_date)
      ) {
        errors.push("Supply/receiving date cannot be after the expiry date.");
      }

      if (pharma || fuel) {
        errors.push(
          ...validateCategoryShelfLife({
            brand: ingredient.brand,
            category: ingredient.category,
            grade: form.grade,
            mfgDate: form.mfg_date,
            expiryDate: form.exp_date,
            noExpiry: !form.exp_date,
          }),
        );
      }

      if (form.exp_date && isValidDateStr(form.exp_date)) {
        const status = getExpiryStatus(form.exp_date, ingredient.brand);
        if (status === "expired") {
          errors.push("This expiry date is already in the past.");
        }
      }

      if (pharma && form.controlled_substance && !form.lot_number) {
        errors.push("LOT Number is required for controlled substances.");
      }

      return [...new Set(errors)];
    };

    const saveBatch = async (form) => {
      const errors = validateBatchForm(form);
      if (errors.length > 0) {
        showUiModal({
          type: "error",
          title: "Please fix the following",
          lines: errors.map((t) => ({ text: t, warn: true })),
        });
        return;
      }
      setSavingEdit(true);
      const coords = await getBrowserLocation();
      const industryFields = {
        ...(pharma
          ? {
              lot_number: form.lot_number,
              ndc_code: form.ndc_code,
              dosage_form: form.dosage_form,
              strength: form.strength,
              storage_requirement: form.storage_requirement,
              controlled_substance: !!form.controlled_substance,
            }
          : {}),
        ...(isFuelBrand(ingredient.brand)
          ? {
              tank_id: form.tank_id,
              grade: form.grade,
              octane_rating: form.octane_rating,
              delivery_temp: form.delivery_temp,
              truck_id: form.truck_id,
              volume_correction: form.volume_correction,
            }
          : {}),
      };
      const body = {
        ...form,
        ...industryFields,
        performed_by: userName,
        performed_by_role: userRole || "Unknown",
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      };
      try {
        await fetch(`${apiUrl}/ingredient-batches/${editingBatch.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        await syncIngredientStock();
        setEditingBatch(null);
        onRefresh();
        setToast({
          type: "success",
          title: "Batch Updated",
          message: "The batch has been updated successfully.",
        });
      } catch {
        setToast({
          type: "error",
          title: "Connection Error",
          message: "Failed to save the batch.",
        });
      } finally {
        setSavingEdit(false);
      }
    };

    // Delete now requires confirmation via BatchDeleteConfirmModal — see requestDeleteBatch / confirmDeleteBatch below.
    const deleteBatch = async (id) => {
      // Find the batch data before deleting
      const batchToDelete = batches.find((b) => b.id === id);
      await fetch(`${apiUrl}/ingredient-batch-delete-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch_data: batchToDelete,
          ingredient_id: ingredient.id,
          ingredient_name: ingredient.name,
          deleted_by: userName,
        }),
      });
      await fetch(`${apiUrl}/ingredient-batches/${id}`, { method: "DELETE" });
      await syncIngredientStock();
      await fetchBatchHistory();
      onRefresh();
    };

    // Step 1: user clicks "Delete" on a batch row — open confirmation modal instead of deleting immediately
    const requestDeleteBatch = (batch) => setDeleteConfirmBatch(batch);

    // Step 2: user confirms in the modal — perform the actual delete
    const confirmDeleteBatch = async () => {
      if (!deleteConfirmBatch) return;
      setDeletingBatch(true);
      try {
        await deleteBatch(deleteConfirmBatch.id);
        setToast({
          type: "success",
          title: "Batch Deleted",
          message: `Batch ${deleteConfirmBatch.batch_number || ""} moved to history.`,
        });
      } catch {
        setToast({
          type: "error",
          title: "Connection Error",
          message: "Failed to delete the batch.",
        });
      } finally {
        setDeletingBatch(false);
        setDeleteConfirmBatch(null);
      }
    };

    const restoreBatch = async (entry) => {
      setRestoringBatchId(entry.id);
      try {
        const d = entry.data || {};
        const res = await fetch(`${apiUrl}/ingredient-batches`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ingredient_id: ingredient.id,
            batch_number: d.batch_number || null,
            stock: d.stock || 0,
            mfg_date: d.mfg_date || null,
            exp_date: d.exp_date || null,
            supply_date: d.supply_date || null,
            cost_per_unit: d.cost_per_unit || 0,
            supplier: d.supplier || null,
            perishable: d.perishable || false,
            notes: d.notes || null,
          }),
        });
        const result = await res.json();
        if (result && (result.id || result.success)) {
          await fetch(`${apiUrl}/ingredient-batch-delete-history/${entry.id}`, {
            method: "DELETE",
          });
          await fetchBatchHistory();
          onRefresh();
          setToast({
            type: "success",
            title: "Batch Restored",
            message: `Batch ${d.batch_number || ""} has been restored.`,
          });
        } else {
          setToast({
            type: "error",
            title: "Restore Failed",
            message: "Failed to restore the batch.",
          });
        }
      } catch {
        setToast({
          type: "error",
          title: "Connection Error",
          message: "Failed to restore the batch.",
        });
      } finally {
        setRestoringBatchId(null);
      }
    };

    const fifo = getFifoMethod(ingredient.brand, ingredient.perishable);
    const sortedBatches = sortBatchesByMethod(
      batches,
      ingredient.brand,
      ingredient.perishable,
    );

    return (
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000,
          padding: 20,
          backdropFilter: "blur(4px)",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#fff",
            borderRadius: 20,
            width: "100%",
            maxWidth: 700,
            maxHeight: "88vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            fontFamily: "Plus Jakarta Sans,sans-serif",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "18px 24px",
              background: "linear-gradient(135deg,#00c853,#00897b)",
              color: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>
                Batches — {ingredient.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  opacity: 0.85,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                {ingredient.branch} · Total stock:{" "}
                {batches.reduce((s, b) => s + Number(b.stock || 0), 0)}{" "}
                {ingredient.unit}
                <button
                  onClick={() => setShowBatchHistory(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    background: "rgba(255,255,255,0.2)",
                    border: "1px solid rgba(255,255,255,0.4)",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                  }}
                >
                  <HistoryIcon size={11} /> Delete History
                  {batchDeleteHistory.length > 0 && (
                    <span
                      style={{
                        background: "#dc2626",
                        borderRadius: 20,
                        fontSize: 10,
                        fontWeight: 800,
                        padding: "1px 6px",
                      }}
                    >
                      {batchDeleteHistory.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close batch details"
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                color: "#fff",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <XIcon size={16} />
            </button>
          </div>

          {/* Body */}
          <div style={{ overflowY: "auto", flex: 1, padding: "8px 24px 24px" }}>
            {/* Batch list — plain white rows, separated by a thin line */}
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "24px 0",
                  color: "#5a7a65",
                }}
              >
                Loading batches…
              </div>
            ) : sortedBatches.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "#9ca3af",
                  fontSize: 13,
                  fontStyle: "italic",
                }}
              >
                No batches yet. Use <strong>Receive Stock</strong> to add the
                first one.
              </div>
            ) : (
              sortedBatches.map((batch, idx) => {
                const status = getExpiryStatus(
                  batch.exp_date,
                  ingredient.brand,
                );
                const ss = statusStyle[status] || statusStyle.ok;
                const isFirst = idx === 0;
                const isLast = idx === sortedBatches.length - 1;

                return (
                  <div
                    key={batch.id}
                    style={{
                      background: "#fff",
                      padding: "14px 4px",
                      borderBottom: isLast
                        ? "none"
                        : `1px solid ${isFirst ? C.greenMid : C.border}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: 13,
                            color: "#0d2b1e",
                          }}
                        >
                          Batch {batch.batch_number || "—"}
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
                            NEXT OUT
                          </span>
                        )}
                        {ss.label && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              color: ss.badgeText,
                              border: `1px solid ${ss.border}`,
                              padding: "2px 8px",
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
                          gap: 16,
                          fontSize: 12,
                          color: "#5a7a65",
                          flexWrap: "wrap",
                        }}
                      >
                        <span>
                          Stock:{" "}
                          <strong style={{ color: "#0d2b1e" }}>
                            {batch.stock}
                          </strong>
                        </span>
                        {batch.supplier && (
                          <span>
                            Supplier:{" "}
                            <strong style={{ color: "#0d2b1e" }}>
                              {batch.supplier}
                            </strong>
                          </span>
                        )}
                        {batch.exp_date && (
                          <span>
                            Exp:{" "}
                            <strong style={{ color: ss.dateColor }}>
                              {fmtDate(batch.exp_date)}
                            </strong>
                          </span>
                        )}
                        {batch.mfg_date && (
                          <span>Mfg: {fmtDate(batch.mfg_date)}</span>
                        )}
                        {batch.supply_date && (
                          <span>Supplied: {fmtDate(batch.supply_date)}</span>
                        )}
                        {batch.storage_location && (
                          <span>
                            Location:{" "}
                            <strong style={{ color: "#0d2b1e" }}>
                              {batch.storage_location}
                            </strong>
                          </span>
                        )}
                        {batch.received_by && (
                          <span>
                            By:{" "}
                            <strong style={{ color: "#0d2b1e" }}>
                              {batch.received_by}
                            </strong>
                          </span>
                        )}
                      </div>
                      {status === "expired" && (
                        <div
                          style={{
                            marginTop: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#dc2626",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          This batch has already expired.
                        </div>
                      )}
                      {batch.notes && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "#9ca3af",
                            marginTop: 4,
                          }}
                        >
                          {batch.notes}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      {!readOnly && (
                        <>
                          <button
                            onClick={() => setEditingBatch(batch)}
                            title="Edit batch"
                            className="edit-btn"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              height: 30,
                              padding: "0 12px",
                              borderRadius: 8,
                              border: "1px solid #d1eedd",
                              background: "#fff",
                              color: "#00897b",
                              fontSize: 12,
                              fontWeight: 700,
                              fontFamily: "inherit",
                            }}
                          >
                            <EditIcon size={12} /> Edit
                          </button>
                          <button
                            onClick={() => requestDeleteBatch(batch)}
                            title="Delete batch"
                            className="del-btn"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              height: 30,
                              padding: "0 12px",
                              borderRadius: 8,
                              border: "1px solid #ffcdd2",
                              background: "#fff",
                              color: "#e53935",
                              fontSize: 12,
                              fontWeight: 700,
                              fontFamily: "inherit",
                            }}
                          >
                            <TrashIcon size={12} /> Delete
                          </button>
                        </>
                      )}
                      {(ingredient.branch || "").trim().toLowerCase() ===
                        "head office" && (
                        <button
                          onClick={() => setHistoryBatch(batch)}
                          title="View transfer history"
                          className="hist-btn"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            height: 30,
                            padding: "0 12px",
                            borderRadius: 8,
                            border: "1px solid #bbdefb",
                            background: "#fff",
                            color: "#1565c0",
                            fontSize: 12,
                            fontWeight: 700,
                            fontFamily: "inherit",
                          }}
                        >
                          <HistoryIcon size={12} /> History
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {editingBatch && (
          <BatchEditModal
            ingredient={ingredient}
            batch={editingBatch}
            saving={savingEdit}
            onClose={() => setEditingBatch(null)}
            onSave={saveBatch}
          />
        )}

        {deleteConfirmBatch && (
          <BatchDeleteConfirmModal
            batch={deleteConfirmBatch}
            ingredient={ingredient}
            deleting={deletingBatch}
            onConfirm={confirmDeleteBatch}
            onCancel={() => {
              if (!deletingBatch) setDeleteConfirmBatch(null);
            }}
          />
        )}

        {showBatchHistory && (
          <BatchDeleteHistoryPanel
            history={batchDeleteHistory}
            restoringId={restoringBatchId}
            onRestore={restoreBatch}
            onClose={() => setShowBatchHistory(false)}
          />
        )}

        {historyBatch && (
          <BatchTransferHistoryModal
            batch={historyBatch}
            ingredient={ingredient}
            apiUrl={apiUrl}
            onClose={() => setHistoryBatch(null)}
          />
        )}
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────── */
  function StockInventoryContent({
    user,
    brands: propBrands = [],
    initialFocus = null,
  }) {
    const isAdmin =
      user?.role === "Super Admin" ||
      user?.role === "Sales Admin" ||
      user?.role === "Franchisee Operations Admin";
    const isReadOnly = user?.role === "Franchisee Operations Admin";
    const userBranch = user?.branch || "";
    const userName = user?.name || "Unknown";

    const [savingItem, setSavingItem] = useState(false);
    const [deletingItem, setDeletingItem] = useState(false);
    const [restoringId, setRestoringId] = useState(null);
    const [toast, setToast] = useState(null);

    const brandList = propBrands.length > 0 ? propBrands : [];

    const connectedBrandDefs = useMemo(
      () =>
        BRAND_DEFS.filter((bd) =>
          brandList.some((b) => bd.match((b.name || "").toLowerCase())),
        ),
      [brandList],
    );

    const ownBrandObj = useMemo(() => {
      if (isAdmin || !userBranch) return null;
      const accountBrand = String(
        user?.brand || user?.brand_name || user?.brandName || "",
      ).trim();
      if (accountBrand) {
        const exact = brandList.find(
          (b) =>
            String(b.name || "")
              .trim()
              .toLowerCase() === accountBrand.toLowerCase(),
        );
        if (exact) return exact;
      }
      const owners = brandList.filter((b) =>
        (b.branches || []).some(
          (br) =>
            String(typeof br === "string" ? br : br?.name || "")
              .trim()
              .toLowerCase() === userBranch.trim().toLowerCase(),
        ),
      );
      return owners.length === 1 ? owners[0] : null;
    }, [isAdmin, user, userBranch, brandList]);

    const ownBrandDef = useMemo(() => {
      if (isAdmin || !userBranch) return null;
      if (!ownBrandObj) return null;
      return (
        connectedBrandDefs.find((bd) =>
          bd.match((ownBrandObj.name || "").toLowerCase()),
        ) || null
      );
    }, [isAdmin, userBranch, ownBrandObj, connectedBrandDefs]);

    const visibleBrandDefs = isAdmin
      ? connectedBrandDefs
      : ownBrandDef
        ? [ownBrandDef]
        : [];

    const allBranches = useMemo(() => {
      const out = [];
      brandList.forEach((b) =>
        (b.branches || []).forEach((br) => {
          const name = typeof br === "string" ? br : br.name;
          if (!out.find((x) => x.branch === name))
            out.push({ brand: b.name, branch: name });
        }),
      );
      return out;
    }, [brandList]);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [brand, setBrand] = useState(null);
    const [branch, setBranch] = useState(null);
    const [unitFilter, setUnitFilter] = useState("");
    const [statusFilt, setStatusFilt] = useState("");
    const [page, setPage] = useState(0);
    const [sort, setSort] = useState({ col: "name", asc: true });
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);

    // navigation: null = landing grid; active cards come only from live Brand & Branch records
    const [activeBrandKey, setActiveBrandKey] = useState(null);
    const activeBrandDef =
      connectedBrandDefs.find((b) => b.key === activeBrandKey) || null;

    const currentBrandName = activeBrandDef
      ? brandList.find((b) =>
          activeBrandDef.match((b.name || "").toLowerCase()),
        )?.name || ""
      : "";

    const [uiModal, setUiModal] = useState(null);
    const showUiModal = useCallback((opts) => setUiModal(opts), []);
    const closeUiModal = useCallback(() => setUiModal(null), []);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [importLoading, setImportLoading] = useState(false);
    const [importProgress, setImportProgress] = useState({
      percent: 0,
      label: "Preparing…",
      current: 0,
      total: 0,
    });
    const [deleteHistory, setDeleteHistory] = useState([]);
    const [showDeleteHistory, setShowDeleteHistory] = useState(false);
    const [deleteHistoryBrandKey, setDeleteHistoryBrandKey] = useState(null);
    const [activityLog, setActivityLog] = useState([]);
    const [showActivityLog, setShowActivityLog] = useState(false);
    const [activeBatchIngredient, setActiveBatchIngredient] = useState(null);
    const [batches, setBatches] = useState([]);
    const [batchLoading, setBatchLoading] = useState(false);
    const [showValue, setShowValue] = useState(true);

    const [receiveTarget, setReceiveTarget] = useState(null);
    const [focusMutation, setFocusMutation] = useState(null);
    const [stockRefreshToken, setStockRefreshToken] = useState(0);

    const excelRef = useRef(null);

    const emptyForm = useCallback(
      () => ({
        name: "",
        branch: isAdmin ? "" : userBranch,
        branches: isAdmin ? [] : [userBranch],
        brand: "",
        category: "",
        unit: "pcs",
        min_stock: 0,
        cost_per_unit: "",
        perishable: false,
        listInShop: false,
        shopCategory: "",
        sku: "",
      }),
      [isAdmin, userBranch],
    );

    const [form, setForm] = useState(emptyForm);

    /* ── fetch ingredients ── */
    const fetchItems = useCallback(async () => {
      setLoading(true);
      try {
        const q =
          !isAdmin && userBranch
            ? `?branch=${encodeURIComponent(userBranch)}`
            : "";
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/ingredients${q}`,
        );
        const d = await res.json();
        const allRows = Array.isArray(d) ? d.map(normalizeStockItem) : [];
        const rows = isAdmin
          ? allRows
          : allRows.filter((item) => {
              const sameBranch =
                String(item.branch || "")
                  .trim()
                  .toLowerCase() === userBranch.trim().toLowerCase();
              const itemBrand = String(item.brand || "").trim();
              const sameBrand =
                !ownBrandObj?.name ||
                !itemBrand ||
                itemBrand.toLowerCase() === ownBrandObj.name.toLowerCase();
              return sameBranch && sameBrand;
            });
        setItems(rows);
        return rows;
      } catch {
        setItems([]);
        return [];
      } finally {
        setLoading(false);
      }
    }, [isAdmin, userBranch, ownBrandObj]);

    const fetchDeleteHistory = useCallback(async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/ingredient-delete-history`,
        );
        const data = await res.json();
        setDeleteHistory(
          Array.isArray(data)
            ? data.map((row) => ({
                id: row.id,
                data: normalizeStockItem(row.ingredient_data ?? row.data ?? {}),
                deletedAt: row.deleted_at ?? row.deletedAt,
                deletedBy: row.deleted_by ?? row.deletedBy,
              }))
            : [],
        );
      } catch (err) {
        console.error(err);
      }
    }, []);

    const fetchActivityLog = useCallback(async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/ingredient-activity-log`,
        );
        const data = await res.json();
        setActivityLog(
          Array.isArray(data)
            ? data.map((row) => ({
                id: row.id,
                action: row.action,
                ingredientName: row.ingredient_name ?? row.ingredientName,
                branch: row.branch,
                performedBy: row.performed_by ?? row.performedBy,
                role: row.role,
                changes: row.changes,
                timestamp: row.created_at ?? row.timestamp,
              }))
            : [],
        );
      } catch (err) {
        console.error(err);
      }
    }, []);

    useEffect(() => {
      if (
        activeBrandKey &&
        !visibleBrandDefs.some((bd) => bd.key === activeBrandKey)
      ) {
        setActiveBrandKey(null);
      }
    }, [activeBrandKey, visibleBrandDefs]);

    useEffect(() => {
      if (!isAdmin && ownBrandDef && activeBrandKey !== ownBrandDef.key) {
        setActiveBrandKey(ownBrandDef.key);
      }
    }, [isAdmin, ownBrandDef, activeBrandKey]);

    useEffect(() => {
      if (!initialFocus?.brand) return;
      const matchedDef = BRAND_DEFS.find((bd) =>
        bd.match(initialFocus.brand.toLowerCase()),
      );
      if (matchedDef) setActiveBrandKey(matchedDef.key);
    }, [initialFocus]);

    useEffect(() => {
      fetchItems();
    }, [fetchItems]);
    useEffect(() => {
      fetchDeleteHistory();
      fetchActivityLog();
    }, [fetchDeleteHistory, fetchActivityLog]);
    useEffect(() => {
      setPage(0);
    }, [search, brand, branch, unitFilter, statusFilt]);
    useEffect(() => {
      if (!activeBatchIngredient) return;
      setBatchLoading(true);
      fetch(
        `${process.env.REACT_APP_API_URL}/ingredient-batches?ingredient_id=${activeBatchIngredient.id}`,
      )
        .then((r) => r.json())
        .then((d) => {
          setBatches(Array.isArray(d) ? d : []);
          setBatchLoading(false);
        });
    }, [activeBatchIngredient]);

    const importExcel = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setImportLoading(true);
      setImportProgress({
        percent: 5,
        label: "Reading file…",
        current: 0,
        total: 0,
      });
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const coords = await getBrowserLocation();
          setImportProgress({
            percent: 15,
            label: "Parsing spreadsheet…",
            current: 0,
            total: 0,
          });
          const wb = XLSX.read(ev.target.result, { type: "array" });
          const rows_to_save = [];
          wb.SheetNames.forEach((sheetName) => {
            const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {
              defval: "",
            });
            rows.forEach((row) => {
              const name = capitalizeName(
                String(
                  row.name || row.Name || row["INGREDIENT NAME"] || "",
                ).trim(),
              );
              if (!name) return;
              const rowBranch =
                String(row.branch || row.Branch || "").trim() || "Unknown";
              const alreadyExists = items.some(
                (i) =>
                  normalizeName(i.name) === normalizeName(name) &&
                  i.branch.trim().toLowerCase() === rowBranch.toLowerCase(),
              );
              if (alreadyExists) return;
              const rawListInShop =
                row.list_in_shop ?? row["List In Shop"] ?? "";
              const listInShop =
                rawListInShop === 1 ||
                rawListInShop === true ||
                String(rawListInShop).trim().toLowerCase() === "1" ||
                String(rawListInShop).trim().toLowerCase() === "yes" ||
                String(rawListInShop).trim().toLowerCase() === "true";
              const rowBrand = String(row.brand || row.Brand || "").trim();
              const rowCategory = String(
                row.category || row.Category || "",
              ).trim();
              rows_to_save.push({
                name,
                branch: rowBranch,
                brand: rowBrand,
                category: rowCategory,
                unit: String(row.unit || row.Unit || "pcs").trim(),
                stock: parseFloat(row.stock || row.Stock || 0) || 0,
                min_stock:
                  parseFloat(row.min_stock || row["Min Stock"] || 0) || 0,
                cost_per_unit:
                  parseFloat(row.cost_per_unit || row["Cost/Unit"] || 0) || 0,
                listInShop,
                shopPrice:
                  parseFloat(row.shop_price || row["Shop Price"] || 0) || 0,
                shopUnit: String(
                  row.shop_unit || row["Shop Unit"] || "",
                ).trim(),
                shopCategory: String(
                  row.shop_category || row["Shop Category"] || "Coffee Spot",
                ).trim(),
              });
            });
          });

          setImportProgress({
            percent: 25,
            label: `Found ${rows_to_save.length} rows. Importing…`,
            current: 0,
            total: rows_to_save.length,
          });
          let saved = 0,
            shopSaved = 0,
            skipped = 0;
          const skippedNames = [];

          for (let idx = 0; idx < rows_to_save.length; idx++) {
            const item = rows_to_save[idx];
            setImportProgress({
              percent: 25 + Math.round(((idx + 1) / rows_to_save.length) * 65),
              label: `Saving "${item.name}"…`,
              current: idx + 1,
              total: rows_to_save.length,
            });
            try {
              const res = await fetch(
                `${process.env.REACT_APP_API_URL}/ingredients`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ...item,
                    performed_by: userName,
                    latitude: coords?.latitude,
                    longitude: coords?.longitude,
                    imported: true,
                  }),
                },
              );
              const d = await res.json();
              if (d.success) {
                saved++;
                if (item.listInShop && item.shopPrice > 0) {
                  try {
                    const checkRes = await fetch(
                      `${process.env.REACT_APP_API_URL}/shop-items`,
                    );
                    const checkData = await checkRes.json();
                    if (
                      !checkData.some(
                        (s) =>
                          s.name.trim().toLowerCase() ===
                            item.name.toLowerCase() &&
                          s.shop.trim().toLowerCase() ===
                            item.shopCategory.toLowerCase(),
                      )
                    ) {
                      const shopRes = await fetch(
                        `${process.env.REACT_APP_API_URL}/shop-items`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            name: item.name,
                            price: item.shopPrice,
                            unit: item.shopUnit,
                            stock: item.stock,
                            shop: item.shopCategory,
                            brand: item.brand || "",
                            image_url: "...",
                            is_visible: true,
                            performed_by_role: user?.role || "Unknown",
                            latitude: coords?.latitude,
                            longitude: coords?.longitude,
                          }),
                        },
                      );
                      if ((await shopRes.json()).success) shopSaved++;
                    }
                  } catch {}
                }
              } else {
                skipped++;
                skippedNames.push(item.name);
              }
            } catch {
              skipped++;
              skippedNames.push(item.name);
            }
          }

          setImportProgress({
            percent: 100,
            label: "Complete!",
            current: rows_to_save.length,
            total: rows_to_save.length,
          });
          await fetchItems();
          await fetchActivityLog();
          const summaryLines = [
            { text: `${rows_to_save.length} row(s) parsed from file` },
            { text: `${saved} ingredient(s) saved successfully` },
            ...(shopSaved > 0
              ? [{ text: `${shopSaved} item(s) also added to Mobile Shop` }]
              : []),
            ...(skipped > 0
              ? [
                  { text: `${skipped} item(s) failed or skipped`, warn: true },
                  ...skippedNames.map((n) => ({ text: n, warn: true })),
                ]
              : []),
          ];
          setTimeout(() => {
            setImportLoading(false);
            e.target.value = "";
            showUiModal({
              type: skipped > 0 ? "info" : "success",
              title: "Import Complete",
              message:
                skipped > 0
                  ? `${saved} ingredient(s) saved. ${skipped} item(s) were skipped.`
                  : `Successfully imported ${saved} ingredient(s).`,
              lines: summaryLines,
            });
          }, 400);
        } catch {
          setImportLoading(false);
          e.target.value = "";
          showUiModal({
            type: "error",
            title: "Import Failed",
            message: "An error occurred while processing the Excel file.",
          });
        }
      };
      reader.readAsArrayBuffer(file);
    };

    const filtered = useMemo(() => {
      const q = search.toLowerCase();
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const warnDate = new Date(now);
      warnDate.setDate(now.getDate() + EXPIRY_WARN_DAYS);
      return [...items]
        .filter((i) => {
          if (!isAdmin) {
            if (
              String(i.branch || "")
                .trim()
                .toLowerCase() !== userBranch.trim().toLowerCase()
            )
              return false;
            const itemBrand = String(i.brand || "").trim();
            if (
              ownBrandObj?.name &&
              itemBrand &&
              itemBrand.toLowerCase() !== ownBrandObj.name.toLowerCase()
            )
              return false;
          }
          if (
            q &&
            !i.name.toLowerCase().includes(q) &&
            !(i.branch || "").toLowerCase().includes(q)
          )
            return false;
          if (branch && i.branch !== branch) return false;
          else if (brand && !branch) {
            const b = brandList.find((x) => x.id === brand);
            if (b) {
              const names = (b.branches || []).map((br) =>
                typeof br === "string" ? br : br.name,
              );
              if (!names.includes(i.branch)) return false;
            }
          }
          if (unitFilter && i.unit !== unitFilter) return false;
          if (statusFilt === "low" && Number(i.stock) >= Number(i.min_stock))
            return false;
          if (statusFilt === "ok" && Number(i.stock) < Number(i.min_stock))
            return false;
          return true;
        })
        .sort((a, b) => {
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
    }, [
      items,
      search,
      brand,
      branch,
      unitFilter,
      statusFilt,
      sort,
      brandList,
      isAdmin,
      userBranch,
      ownBrandObj,
    ]);

    const lowCount = items.filter(
      (i) => Number(i.stock) < Number(i.min_stock),
    ).length;
    const totalValue = items.reduce(
      (s, i) => s + (i.cost_per_unit || 0) * (i.stock || 0),
      0,
    );
    const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const saveItem = async (e) => {
      e.preventDefault();
      const errors = [];
      if (!form.name || !form.name.trim())
        errors.push("Ingredient name is required.");
      if (!form.brand) errors.push("Brand is required.");
      if (isAdmin) {
        if (editing) {
          if (!form.branch) errors.push("Branch is required.");
        } else {
          if (form.branches.length === 0)
            errors.push("Select at least one branch.");
        }
      }

      {
        const selectedBrandObj = brandList.find(
          (b) =>
            (b.name || "").toLowerCase() === (form.brand || "").toLowerCase(),
        );
        const allowedCategories = getBrandCategories(selectedBrandObj);
        if (allowedCategories.length > 0) {
          if (!form.category) {
            errors.push(`Category is required for ${form.brand} products.`);
          } else if (
            !allowedCategories.some(
              (cat) =>
                cat.toLowerCase() === String(form.category).toLowerCase(),
            )
          ) {
            errors.push(
              `"${form.category}" is no longer an active ${form.brand} category. Select a category from Brand & Branch Management.`,
            );
          }
        }
      }
      if (!form.unit) errors.push("Unit is required.");
      if (!isPositiveOrZeroNumber(form.min_stock))
        errors.push("Minimum stock must be a valid number of 0 or more.");
      if (
        editing &&
        form.stock !== undefined &&
        form.stock !== "" &&
        !isPositiveOrZeroNumber(form.stock)
      ) {
        errors.push("Stock must be a valid number of 0 or more.");
      }
      if (errors.length > 0) {
        showUiModal({
          type: "error",
          title: "Please fix the following",
          lines: errors.map((t) => ({ text: t, warn: true })),
        });
        return;
      }

      setSavingItem(true);
      const coords = await getBrowserLocation();

      /* ── EDIT: update the original branch's record, and optionally create the
   same ingredient in newly-selected additional branches ── */
      if (editing) {
        if (
          form.branches.length === 0 ||
          !form.branches.includes(editing.branch)
        ) {
          setSavingItem(false);
          showUiModal({
            type: "error",
            title: "Please fix the following",
            lines: [
              { text: "The current branch can't be removed.", warn: true },
            ],
          });
          return;
        }

        const payload = {
          ...form,
          cost_per_unit: form.cost_per_unit,
          stock: form.stock ?? 0,
          branch: editing.branch,
          name: capitalizeName(form.name.trim()),
          performed_by: userName,
          performed_by_role: user?.role || "Unknown",
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          ...(!isAdmin ? { cost_per_unit: editing.cost_per_unit } : {}),
        };

        let editSucceeded = false;
        let updatedItem = null;

        try {
          const res = await fetch(
            `${process.env.REACT_APP_API_URL}/ingredients/${editing.id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            },
          );
          const d = await res.json();
          if (d.success) {
            editSucceeded = true;
            if (isDirectProductBrand(payload.brand) && editing.id != null) {
              persistStockCategory(editing.id, payload.category);
            }

            if (form.listInShop && form.cost_per_unit) {
              const computedShopPrice = isDirectProductBrand(form.brand)
                ? computeDirectSellingPrice(form.cost_per_unit)
                : Math.round(parseFloat(form.cost_per_unit) * 1.1 * 100) / 100;
              try {
                const ingredientId = editing.id;
                const shopRes = await fetch(
                  `${process.env.REACT_APP_API_URL}/shop-items`,
                );
                const shopData = await shopRes.json();
                const existingShopItem = Array.isArray(shopData)
                  ? shopData.find((s) => s.ingredient_id === ingredientId)
                  : null;
                const shopBody = {
                  name: payload.name,
                  price: computedShopPrice,
                  unit: form.unit || "",
                  shop: form.shopCategory,
                  brand: payload.brand || "",
                  performed_by: userName,
                  latitude: payload.latitude,
                  longitude: payload.longitude,
                };
                if (existingShopItem) {
                  await fetch(
                    `${process.env.REACT_APP_API_URL}/shop-items/${existingShopItem.id}`,
                    {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        ...existingShopItem,
                        ...shopBody,
                      }),
                    },
                  );
                } else {
                  await fetch(`${process.env.REACT_APP_API_URL}/shop-items`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      ...shopBody,
                      stock: 0,
                      image_url:
                        "https://placehold.co/150x150/e8f5e9/2e7d32?text=" +
                        encodeURIComponent(payload.name.slice(0, 8)),
                      is_visible: true,
                      branches: [],
                      ingredient_id: ingredientId,
                    }),
                  });
                }
              } catch {}
            }

            updatedItem = normalizeStockItem({
              ...(editing || {}),
              ...payload,
              ...(d.item || {}),
              id: d.item?.id ?? editing?.id,
              category:
                d.item?.category ?? payload.category ?? editing?.category ?? "",
              brand: d.item?.brand ?? payload.brand ?? editing?.brand ?? "",
            });
          }
        } catch {
          // handled below via editSucceeded flag
        }

        if (!editSucceeded) {
          setSavingItem(false);
          setToast({
            type: "error",
            title: "Failed to Save",
            message:
              "Failed to update the ingredient. Please check your connection.",
          });
          return;
        }

        /* Fan out to any newly-checked additional branches */
        const extraBranches = form.branches.filter((b) => b !== editing.branch);
        const results = [];

        for (const branchName of extraBranches) {
          const extraPayload = {
            ...form,
            cost_per_unit: 0,
            stock: 0,
            branch: branchName,
            name: capitalizeName(form.name.trim()),
            performed_by: userName,
            performed_by_role: user?.role || "Unknown",
            latitude: coords?.latitude,
            longitude: coords?.longitude,
          };

          const duplicate = items.find(
            (i) =>
              normalizeName(i.name) === normalizeName(extraPayload.name) &&
              i.branch.trim().toLowerCase() === branchName.trim().toLowerCase(),
          );
          if (duplicate) {
            results.push({
              ok: false,
              branch: branchName,
              reason: "already exists in this branch",
            });
            continue;
          }

          try {
            const res = await fetch(
              `${process.env.REACT_APP_API_URL}/ingredients`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(extraPayload),
              },
            );
            const d = await res.json();
            if (d.success) {
              if (
                isDirectProductBrand(extraPayload.brand) &&
                d.item?.id != null
              ) {
                persistStockCategory(d.item.id, extraPayload.category);
              }
              results.push({ ok: true, branch: branchName });
            } else {
              results.push({
                ok: false,
                branch: branchName,
                reason: d.error || "failed to save",
              });
            }
          } catch {
            results.push({
              ok: false,
              branch: branchName,
              reason: "connection error",
            });
          }
        }

        const freshRows = await fetchItems();
        await fetchActivityLog();

        const freshItem =
          freshRows.find((row) => String(row.id) === String(updatedItem.id)) ||
          updatedItem;
        setFocusMutation({
          item: freshItem,
          stamp: Date.now(),
          reason: "edit",
        });
        setStockRefreshToken((v) => v + 1);
        window.dispatchEvent(
          new CustomEvent("stock-inventory-updated", {
            detail: { ingredientId: freshItem.id, brand: freshItem.brand },
          }),
        );

        setSavingItem(false);
        closeModal();

        const succeeded = results.filter((r) => r.ok);
        const failed = results.filter((r) => !r.ok);

        if (extraBranches.length === 0) {
          setToast({
            type: "success",
            title: "Ingredient Updated",
            message: `"${payload.name}" has been updated.`,
          });
        } else if (failed.length === 0) {
          setToast({
            type: "success",
            title: "Ingredient Updated",
            message: `"${payload.name}" updated, and added to ${succeeded.length} more branch${succeeded.length === 1 ? "" : "es"}.`,
          });
        } else {
          showUiModal({
            type: "info",
            title: "Updated With Some Skips",
            message: `"${payload.name}" was updated. ${succeeded.length} additional branch${succeeded.length === 1 ? "" : "es"} were added, ${failed.length} were skipped.`,
            lines: failed.map((f) => ({
              text: `${f.branch}: ${f.reason}`,
              warn: true,
            })),
          });
        }
        return;
      }

      const targetBranches = isAdmin ? form.branches : [userBranch];
      const results = [];
      let lastCreatedItem = null;

      for (const branchName of targetBranches) {
        const payload = {
          ...form,
          cost_per_unit: 0,
          stock: 0,
          branch: branchName,
          name: capitalizeName(form.name.trim()),
          performed_by: userName,
          performed_by_role: user?.role || "Unknown",
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        };

        const duplicate = items.find(
          (i) =>
            normalizeName(i.name) === normalizeName(payload.name) &&
            i.branch.trim().toLowerCase() === branchName.trim().toLowerCase(),
        );
        if (duplicate) {
          results.push({
            ok: false,
            branch: branchName,
            reason: "already exists in this branch",
          });
          continue;
        }

        try {
          const res = await fetch(
            `${process.env.REACT_APP_API_URL}/ingredients`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            },
          );
          const d = await res.json();
          if (d.success) {
            if (isDirectProductBrand(payload.brand) && d.item?.id != null) {
              persistStockCategory(d.item.id, payload.category);
            }
            lastCreatedItem = normalizeStockItem({
              ...payload,
              ...(d.item || {}),
            });
            results.push({ ok: true, branch: branchName });
          } else {
            results.push({
              ok: false,
              branch: branchName,
              reason: d.error || "failed to save",
            });
          }
        } catch {
          results.push({
            ok: false,
            branch: branchName,
            reason: "connection error",
          });
        }
      }

      const succeeded = results.filter((r) => r.ok);
      const failed = results.filter((r) => !r.ok);

      const freshRows = await fetchItems();
      await fetchActivityLog();

      if (lastCreatedItem) {
        const freshItem =
          freshRows.find(
            (row) =>
              normalizeName(row.name) === normalizeName(lastCreatedItem.name) &&
              String(row.branch || "").toLowerCase() ===
                String(lastCreatedItem.branch || "").toLowerCase(),
          ) || lastCreatedItem;
        setFocusMutation({ item: freshItem, stamp: Date.now(), reason: "add" });
        setStockRefreshToken((v) => v + 1);
        window.dispatchEvent(
          new CustomEvent("stock-inventory-updated", {
            detail: { ingredientId: freshItem.id, brand: freshItem.brand },
          }),
        );
      }

      setSavingItem(false);

      if (succeeded.length > 0 && failed.length === 0) {
        closeModal();
        setToast({
          type: "success",
          title: "Ingredient Added",
          message:
            succeeded.length === 1
              ? `"${form.name.trim()}" has been added to ${succeeded[0].branch}.`
              : `"${form.name.trim()}" has been added to ${succeeded.length} branches.`,
        });
      } else if (succeeded.length > 0 && failed.length > 0) {
        closeModal();
        showUiModal({
          type: "info",
          title: "Added With Some Skips",
          message: `"${form.name.trim()}" was added to ${succeeded.length} branch${succeeded.length === 1 ? "" : "es"}. ${failed.length} branch${failed.length === 1 ? "" : "es"} were skipped.`,
          lines: failed.map((f) => ({
            text: `${f.branch}: ${f.reason}`,
            warn: true,
          })),
        });
      } else {
        showUiModal({
          type: "error",
          title: "Failed to Add Ingredient",
          message: `Could not add "${form.name.trim()}" to any of the selected branches.`,
          lines: failed.map((f) => ({
            text: `${f.branch}: ${f.reason}`,
            warn: true,
          })),
        });
      }
    };

    const handleDeleteItem = (item) => setDeleteTarget(item);

    const confirmDelete = async () => {
      if (!deleteTarget) return;
      const item = deleteTarget;
      setDeletingItem(true);
      try {
        const coords = await getBrowserLocation();
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/ingredients/${item.id}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              deleted_by: userName,
              performed_by_role: user?.role || "Unknown",
              latitude: coords?.latitude,
              longitude: coords?.longitude,
            }),
          },
        );
        const d = await res.json();
        if (d.success) {
          await fetch(
            `${process.env.REACT_APP_API_URL}/ingredient-delete-history`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ingredient_data: item,
                deleted_by: userName,
              }),
            },
          );
          await fetchItems();
          await fetchDeleteHistory();
          await fetchActivityLog();
          setStockRefreshToken((v) => v + 1);
          window.dispatchEvent(
            new CustomEvent("stock-inventory-updated", {
              detail: {
                ingredientId: item.id,
                brand: item.brand,
                deleted: true,
              },
            }),
          );
          setToast({
            type: "success",
            title: "Ingredient Deleted",
            message: `"${item.name}" moved to Delete History.`,
          });
        } else {
          setToast({
            type: "error",
            title: "Failed to Delete",
            message: d.error || "An unexpected error occurred.",
          });
        }
      } catch {
        setToast({
          type: "error",
          title: "Connection Error",
          message: "Failed to delete.",
        });
      } finally {
        setDeletingItem(false);
        setDeleteTarget(null);
      }
    };

    const handleRestore = async (entry) => {
      setRestoringId(entry.id);
      try {
        const d = entry.data;
        const coords = await getBrowserLocation();
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/ingredients`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: d.name,
              branch: d.branch,
              brand: d.brand,
              category: d.category || "",
              unit: d.unit,
              stock: d.stock,
              min_stock: d.min_stock,
              cost_per_unit: d.cost_per_unit,
              performed_by: userName,
              performed_by_role: user?.role || "Unknown",
              latitude: coords?.latitude,
              longitude: coords?.longitude,
              restored: true,
            }),
          },
        );
        const result = await res.json();
        if (result.success) {
          if (result.item?.id != null && d.category) {
            persistStockCategory(result.item.id, d.category);
          }
          await fetch(
            `${process.env.REACT_APP_API_URL}/ingredient-delete-history/${entry.id}`,
            { method: "DELETE" },
          );
          const freshRows = await fetchItems();
          await fetchDeleteHistory();
          await fetchActivityLog();
          const restoredItem =
            freshRows.find(
              (row) =>
                normalizeName(row.name) === normalizeName(d.name) &&
                String(row.branch || "").toLowerCase() ===
                  String(d.branch || "").toLowerCase(),
            ) || normalizeStockItem(d);
          setFocusMutation({
            item: restoredItem,
            stamp: Date.now(),
            reason: "restore",
          });
          setStockRefreshToken((v) => v + 1);
          window.dispatchEvent(
            new CustomEvent("stock-inventory-updated", {
              detail: {
                ingredientId: restoredItem.id,
                brand: restoredItem.brand,
                restored: true,
              },
            }),
          );
          setToast({
            type: "success",
            title: "Ingredient Restored",
            message: `"${d.name}" has been restored.`,
          });
        } else {
          setToast({
            type: "error",
            title: "Restore Failed",
            message: result.error || "Failed to restore.",
          });
        }
      } catch {
        setToast({
          type: "error",
          title: "Connection Error",
          message: "Failed to restore.",
        });
      } finally {
        setRestoringId(null);
      }
    };

    const openEdit = async (item) => {
      setEditing(item);
      let shopMatch = null;
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/shop-items`);
        const data = await res.json();
        if (Array.isArray(data)) {
          shopMatch = data.find((s) => s.ingredient_id === item.id) || null;
        }
      } catch {}
      setForm({
        name: item.name,
        brand: item.brand || "",
        branch: item.branch || "",
        branches: [item.branch || ""],
        category: item.category || "",
        unit: item.unit || "pcs",
        stock: item.stock,
        min_stock: item.min_stock,
        cost_per_unit: item.cost_per_unit || "",
        perishable: !!item.perishable,
        listInShop: !!shopMatch,
        shopCategory: shopMatch
          ? shopMatch.shop || item.brand || "Coffee Spot"
          : item.brand || "Coffee Spot",
        sku: item.sku || "",
      });
      setShowModal(true);
    };

    const closeModal = () => {
      setShowModal(false);
      setEditing(null);
      setForm(emptyForm());
    };

    const SortTh = ({ col, label, minW, align = "left" }) => {
      const active = sort.col === col;
      return (
        <th
          onClick={() => {
            setSort((s) => ({ col, asc: s.col === col ? !s.asc : true }));
            setPage(0);
          }}
          style={{
            padding: "11px 16px",
            textAlign: align,
            fontWeight: 600,
            fontSize: 12,
            color: active ? C.green : C.muted,
            letterSpacing: "0.02em",
            borderBottom: `1.5px solid ${C.border}`,
            cursor: "pointer",
            userSelect: "none",
            whiteSpace: "nowrap",
            background: "#fbfcf8",
            minWidth: minW,
          }}
        >
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
          >
            {label}
            {active ? (
              sort.asc ? (
                <SortAscIcon />
              ) : (
                <SortDescIcon />
              )
            ) : (
              <span style={{ opacity: 0.22 }}>
                <SortDescIcon />
              </span>
            )}
          </span>
        </th>
      );
    };

    const brandItemsFor = (brandDef) => {
      const brandObj = brandList.find((b) =>
        brandDef.match((b.name || "").toLowerCase()),
      );
      return items
        .filter((i) => itemBelongsToBrand(i, brandDef, brandObj))
        .sort((a, b) =>
          String(a.name || "").localeCompare(String(b.name || "")),
        );
    };

    const deleteHistoryForBrand = (brandDef) => {
      if (!brandDef) return [];
      const brandObj = brandList.find((b) =>
        brandDef.match((b.name || "").toLowerCase()),
      );

      return deleteHistory
        .filter((entry) =>
          itemBelongsToBrand(entry?.data || {}, brandDef, brandObj),
        )
        .sort((a, b) => {
          const byProduct = String(a?.data?.name || "").localeCompare(
            String(b?.data?.name || ""),
          );
          if (byProduct !== 0) return byProduct;
          return new Date(b?.deletedAt || 0) - new Date(a?.deletedAt || 0);
        });
    };

    return (
      <div
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.ink }}
      >
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .inv-row:hover td { background: #F6F7F1 !important; }
        .edit-btn:hover  { background: #f0f5e8 !important; color: #2c5c16 !important; }
        .del-btn:hover   { background: #fef2f2 !important; color: #dc2626 !important; }
        button:not(:disabled) { transition: filter .15s ease, transform .1s ease, background .15s ease, border-color .15s ease, box-shadow .15s ease; cursor: pointer; }
        button:not(:disabled):hover { filter: brightness(0.96); }
        button:not(:disabled):active { transform: translateY(1px); }
        select, input { transition: border-color .15s ease, box-shadow .15s ease; }
        select:hover:not(:disabled), input:hover:not(:disabled) { border-color: #3b791e !important; }
        select:focus, input:focus, textarea:focus { border-color: #3b791e !important; box-shadow: 0 0 0 3px rgba(59,121,30,0.12); }
        [role="button"] { transition: filter .15s ease, transform .12s ease; }
        [role="button"]:hover { filter: brightness(0.97); }
      `}</style>

        {/* Landing screen: cards mirror Brand & Branch; deleting a brand removes its inventory card immediately */}
        {!activeBrandDef ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: 14,
            }}
          >
            {visibleBrandDefs.map((bd) => (
              <BrandOverviewCard
                key={bd.key}
                brandDef={bd}
                brandObj={brandList.find((b) =>
                  bd.match((b.name || "").toLowerCase()),
                )}
                items={items}
                onClick={() => setActiveBrandKey(bd.key)}
              />
            ))}
            {visibleBrandDefs.length === 0 && (
              <div
                style={{
                  gridColumn: "1 / -1",
                  padding: "38px 20px",
                  textAlign: "center",
                  border: `1.5px dashed ${C.border}`,
                  borderRadius: 16,
                  color: C.muted,
                  fontSize: 13,
                }}
              >
                No active brands found. Add a brand in Brand &amp; Branch to
                create its Stock Inventory card.
              </div>
            )}
          </div>
        ) : (
          <>
            <BrandCard
              key={activeBrandDef.key}
              brandDef={activeBrandDef}
              brandObj={brandList.find((b) =>
                activeBrandDef.match((b.name || "").toLowerCase()),
              )}
              items={items}
              apiUrl={process.env.REACT_APP_API_URL}
              onEdit={openEdit}
              onDelete={handleDeleteItem}
              onManageBatches={(item) => {
                if (item) {
                  setActiveBatchIngredient(item);
                  setBatches([]);
                }
              }}
              onQuickAdd={(bd2, preferredBranch = "") => {
                setEditing(null);
                const matchedBrand = brandList.find((b) =>
                  bd2.match((b.name || "").toLowerCase()),
                );
                const brandCategories = getBrandCategories(matchedBrand);
                const allowedBranches = (matchedBrand?.branches || [])
                  .map((br) => (typeof br === "string" ? br : br?.name))
                  .filter(Boolean);
                const initialBranch = !isAdmin
                  ? userBranch
                  : preferredBranch && allowedBranches.includes(preferredBranch)
                    ? preferredBranch
                    : "";
                setForm({
                  ...emptyForm(),
                  branch: initialBranch,
                  branches: isAdmin
                    ? initialBranch
                      ? [initialBranch]
                      : []
                    : [userBranch], // ← new
                  brand: matchedBrand ? matchedBrand.name : "",
                  category:
                    brandCategories.length === 1 ? brandCategories[0] : "",
                  shopCategory: matchedBrand ? matchedBrand.name : "",
                });
                setShowModal(true);
              }}
              onReceiveStock={(bd2, product) =>
                setReceiveTarget({ brandDef: bd2, product })
              }
              onOpenDeleteHistory={() => {
                setDeleteHistoryBrandKey(activeBrandDef.key);
                setShowDeleteHistory(true);
              }}
              deleteHistoryCount={deleteHistoryForBrand(activeBrandDef).length}
              onBack={isAdmin ? () => setActiveBrandKey(null) : undefined}
              restrictBranch={!isAdmin ? userBranch : ""}
              initialBranchFilter={initialFocus?.branch || ""}
              initialStatusFilter={initialFocus?.lowStockOnly ? "low" : ""}
              expanded
              readOnly={isReadOnly}
              userName={userName}
              userRole={user?.role}
              showUiModal={showUiModal}
              setToast={setToast}
              onItemsChanged={async () => {
                await fetchItems();
                await fetchActivityLog();
                setStockRefreshToken((v) => v + 1);
              }}
              focusMutation={focusMutation}
              refreshToken={stockRefreshToken}
            />
          </>
        )}

        {/* ADD / EDIT MODAL */}
        {showModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
          >
            <div
              style={{
                background: C.white,
                borderRadius: 18,
                padding: "26px 26px 20px",
                width: 540,
                maxWidth: "95vw",
                maxHeight: "93vh",
                overflowY: "auto",
                boxShadow: "0 12px 48px rgba(0,0,0,0.16)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 800,
                    color: C.ink,
                  }}
                >
                  {editing ? "Edit Stock" : "Add Stock"}
                </h2>
                <button
                  onClick={closeModal}
                  style={{
                    background: "none",
                    border: "none",
                    color: C.muted,
                    padding: 4,
                  }}
                >
                  <XIcon size={18} />
                </button>
              </div>
              <form
                noValidate
                onSubmit={saveItem}
                style={{ display: "grid", gap: 14 }}
              >
                <div>
                  <label style={invLabelSt}>Ingredient Name *</label>
                  <input
                    style={invInputSt}
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        name: e.target.value.replace(/\b\w/g, (c) =>
                          c.toUpperCase(),
                        ),
                      }))
                    }
                    required
                    placeholder="e.g. Coffee Beans"
                  />
                </div>

                {editing && form.sku && (
                  <div>
                    <label style={invLabelSt}>SKU</label>
                    <div
                      style={{
                        ...invInputSt,
                        height: "auto",
                        padding: "9px 12px",
                        background: "#f5f5f5",
                        color: C.muted,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontFamily: "monospace",
                      }}
                    >
                      {form.sku}
                      <span
                        style={{
                          fontSize: 10,
                          color: C.muted,
                          fontWeight: 400,
                          fontFamily: "inherit",
                        }}
                      >
                        (auto-generated)
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label style={invLabelSt}>Brand</label>
                  <div
                    style={{
                      ...invInputSt,
                      height: "auto",
                      padding: "9px 12px",
                      background: "#f5f5f5",
                      color: C.muted,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {form.brand || currentBrandName || "—"}
                  </div>
                </div>

                {(() => {
                  const selectedBrandObj = brandList.find(
                    (b) =>
                      (b.name || "").toLowerCase() ===
                      String(form.brand || currentBrandName).toLowerCase(),
                  );
                  const categoryOptions = getBrandCategories(selectedBrandObj);
                  if (categoryOptions.length === 0) return null;
                  return (
                    <div>
                      <label style={invLabelSt}>Category *</label>
                      <select
                        style={invInputSt}
                        value={form.category || ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, category: e.target.value }))
                        }
                        required
                      >
                        <option value="">Select category…</option>
                        {categoryOptions.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <div
                        style={{
                          fontSize: 10.5,
                          color: C.muted,
                          marginTop: 5,
                          lineHeight: 1.45,
                        }}
                      >
                        Categories are synced from{" "}
                        <strong>Brand &amp; Branch Management</strong>. Add,
                        rename, or remove categories there.
                      </div>
                    </div>
                  );
                })()}

                {isAdmin ? (
                  <div>
                    <label style={invLabelSt}>
                      Branches *{" "}
                      <span style={{ fontWeight: 400, color: C.muted }}>
                        (select one or more)
                      </span>
                    </label>
                    {(() => {
                      const selectedBrandObj = brandList.find(
                        (b) => b.name === form.brand,
                      );
                      const filteredBranches = selectedBrandObj
                        ? (selectedBrandObj.branches || []).map((br) =>
                            typeof br === "string" ? br : br.name,
                          )
                        : [];
                      if (!form.brand) {
                        return (
                          <div
                            style={{
                              ...invInputSt,
                              height: "auto",
                              padding: "9px 12px",
                              background: "#f5f5f5",
                              color: C.muted,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            Select a brand first…
                          </div>
                        );
                      }
                      if (filteredBranches.length === 0) {
                        return (
                          <div
                            style={{
                              ...invInputSt,
                              height: "auto",
                              padding: "9px 12px",
                              background: "#f5f5f5",
                              color: C.muted,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            No branches found for this brand.
                          </div>
                        );
                      }
                      const lockedBranch = editing ? editing.branch : null;
                      const allSelected = filteredBranches.every((br) =>
                        form.branches.includes(br),
                      );
                      return (
                        <div
                          style={{
                            border: `1.5px solid ${C.border}`,
                            borderRadius: 11,
                            padding: "8px 4px",
                            maxHeight: 180,
                            overflowY: "auto",
                          }}
                        >
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "6px 10px",
                              cursor: "pointer",
                              fontSize: 12.5,
                              fontWeight: 700,
                              color: C.greenDk,
                              borderBottom: `1px solid ${C.border}`,
                              marginBottom: 4,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={allSelected}
                              onChange={(e) =>
                                setForm((f) => ({
                                  ...f,
                                  branches: e.target.checked
                                    ? filteredBranches
                                    : lockedBranch
                                      ? [lockedBranch]
                                      : [],
                                }))
                              }
                            />
                            Select all branches
                          </label>
                          {filteredBranches.map((br) => {
                            const locked = br === lockedBranch;
                            return (
                              <label
                                key={br}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  padding: "6px 10px",
                                  cursor: locked ? "default" : "pointer",
                                  fontSize: 13,
                                  color: C.ink,
                                  opacity: locked ? 0.75 : 1,
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={form.branches.includes(br)}
                                  disabled={locked}
                                  onChange={(e) =>
                                    setForm((f) => ({
                                      ...f,
                                      branches: e.target.checked
                                        ? [...f.branches, br]
                                        : f.branches.filter((x) => x !== br),
                                    }))
                                  }
                                />
                                {br}
                                {locked && (
                                  <span
                                    style={{
                                      fontSize: 10.5,
                                      fontWeight: 700,
                                      color: C.greenDk,
                                    }}
                                  >
                                    (current — can't remove)
                                  </span>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      );
                    })()}
                    {form.branches.length > 0 && (
                      <div
                        style={{ fontSize: 11, color: C.muted, marginTop: 5 }}
                      >
                        {editing
                          ? form.branches.length === 1
                            ? "Only updating the current branch."
                            : `Updating "${editing.branch}" and adding this ingredient to ${form.branches.length - 1} more branch${form.branches.length - 1 === 1 ? "" : "es"}: ${form.branches.filter((b) => b !== editing.branch).join(", ")}`
                          : `Will add this ingredient to ${form.branches.length} branch${form.branches.length === 1 ? "" : "es"}: ${form.branches.join(", ")}`}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label style={invLabelSt}>Branch</label>
                    <div
                      style={{
                        ...invInputSt,
                        height: "auto",
                        padding: "9px 12px",
                        background: "#f5f5f5",
                        color: C.muted,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {userBranch || "—"}
                    </div>
                  </div>
                )}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div>
                    <label style={invLabelSt}>Unit *</label>
                    <select
                      style={invInputSt}
                      value={form.unit}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, unit: e.target.value }))
                      }
                      required
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={invLabelSt}>Cost per Unit (₱)</label>
                    <div
                      style={{
                        ...invInputSt,
                        height: "auto",
                        padding: "9px 12px",
                        background: "#f5f5f5",
                        color: C.muted,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      ₱
                      {Number(form.cost_per_unit || 0).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      <span
                        style={{
                          fontSize: 10,
                          color: C.muted,
                          fontWeight: 400,
                          marginLeft: 4,
                        }}
                      >
                        {editing
                          ? "(from next-out batch)"
                          : "(set when you receive stock)"}
                      </span>
                    </div>
                    {!editing && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "#1e40af",
                          marginTop: 5,
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 5,
                        }}
                      >
                        <Info
                          size={14}
                          style={{ flexShrink: 0, marginTop: 1 }}
                        />
                        <span>
                          Cost starts at ₱0.00. Use{" "}
                          <strong>Receive Stock</strong> after saving this item
                          to log a batch.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {isDirectProductBrand(form.brand || currentBrandName) && (
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: 11,
                      background: C.greenLt,
                      border: `1px solid ${C.greenMid}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            color: C.greenDk,
                            textTransform: "uppercase",
                            letterSpacing: ".05em",
                          }}
                        >
                          Auto Selling Price
                        </div>
                        <div
                          style={{
                            fontSize: 10.5,
                            color: C.muted,
                            marginTop: 3,
                          }}
                        >
                          Cost per unit + 30% operations + 40% profit
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 900,
                          color: C.greenDk,
                        }}
                      >
                        ₱
                        {computeDirectSellingPrice(
                          form.cost_per_unit,
                        ).toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 9,
                    background: form.perishable ? C.greenLt : "#f7f7f7",
                    border: `1px solid ${form.perishable ? C.greenMid : C.border}`,
                  }}
                >
                  <div
                    onClick={() =>
                      setForm((f) => ({ ...f, perishable: !f.perishable }))
                    }
                    style={{
                      width: 40,
                      height: 22,
                      borderRadius: 11,
                      cursor: "pointer",
                      position: "relative",
                      background: form.perishable
                        ? `linear-gradient(135deg,${C.teal},${C.green})`
                        : "#e0e0e0",
                      transition: "background .2s",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 3,
                        left: form.perishable ? 21 : 3,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: "#fff",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                        transition: "left .2s",
                      }}
                    />
                  </div>
                  <label
                    style={{
                      ...invLabelSt,
                      marginBottom: 0,
                      cursor: "pointer",
                      flex: 1,
                    }}
                    onClick={() =>
                      setForm((f) => ({ ...f, perishable: !f.perishable }))
                    }
                  >
                    {isPharmaBrand(form.brand || currentBrandName)
                      ? "Medicine (perishable)"
                      : "Perishable (e.g. dairy, fresh items)"}
                    <span
                      style={{
                        fontWeight: 400,
                        color: C.muted,
                        display: "block",
                        fontSize: 10.5,
                        marginTop: 2,
                      }}
                    >
                      {isPharmaBrand(form.brand || currentBrandName)
                        ? form.perishable
                          ? "Uses FEFO queuing and shows pharmacy fields (LOT, NDC, dosage, controlled substance) when receiving stock."
                          : "Off = medical supply (e.g. bandages, gauze) — uses FIFO queuing, no dosage/LOT fields shown."
                        : "Uses FEFO (earliest expiry first) instead of FIFO for its batch queue."}
                    </span>
                  </label>
                </div>

                <div>
                  <label style={invLabelSt}>Minimum Stock *</label>
                  <input
                    type="number"
                    style={invInputSt}
                    value={form.min_stock}
                    min="0"
                    onChange={(e) =>
                      setForm((f) => ({ ...f, min_stock: e.target.value }))
                    }
                    required
                  />
                </div>

                {!editing && (
                  <div
                    style={{
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      borderRadius: 9,
                      padding: "10px 14px",
                      fontSize: 12,
                      color: "#1e40af",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                    }}
                  >
                    <span>
                      Stock starts at <strong>0</strong> and is automatically
                      calculated from batches. Use{" "}
                      <strong>Receive Stock</strong> on the ingredient row to
                      add stock.
                    </span>
                  </div>
                )}
                <div
                  style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: form.listInShop ? 14 : 0,
                    }}
                  >
                    <div
                      onClick={() =>
                        setForm((f) => ({ ...f, listInShop: !f.listInShop }))
                      }
                      style={{
                        width: 40,
                        height: 22,
                        borderRadius: 11,
                        cursor: "pointer",
                        position: "relative",
                        background: form.listInShop
                          ? `linear-gradient(135deg,${C.teal},${C.green})`
                          : "#e0e0e0",
                        transition: "background .2s",
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 3,
                          left: form.listInShop ? 21 : 3,
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          background: "#fff",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                          transition: "left .2s",
                        }}
                      />
                    </div>
                    <label
                      style={{
                        ...invLabelSt,
                        marginBottom: 0,
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setForm((f) => ({ ...f, listInShop: !f.listInShop }))
                      }
                    >
                      Also list in Mobile Shop Supplies
                    </label>
                  </div>
                  {form.listInShop && (
                    <div
                      style={{
                        display: "grid",
                        gap: 12,
                        marginTop: 14,
                        padding: "14px",
                        background: C.bg,
                        borderRadius: 10,
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
                        Shop price and unit are synced automatically from this
                        ingredient's cost and unit.
                      </p>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 12,
                        }}
                      >
                        <div>
                          <label style={invLabelSt}>Shop Price (₱)</label>
                          <div
                            style={{
                              ...invInputSt,
                              height: "auto",
                              padding: "9px 12px",
                              background: "#f5f5f5",
                              color: C.muted,
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            {form.cost_per_unit
                              ? `₱${(isDirectProductBrand(form.brand)
                                  ? computeDirectSellingPrice(
                                      form.cost_per_unit,
                                    )
                                  : parseFloat(form.cost_per_unit) * 1.1
                                ).toLocaleString("en-PH", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}`
                              : "—"}
                            <span
                              style={{
                                fontSize: 10,
                                color: C.muted,
                                fontWeight: 400,
                              }}
                            >
                              (cost + 10%)
                            </span>
                          </div>
                        </div>
                        <div>
                          <label style={invLabelSt}>Shop Unit</label>
                          <div
                            style={{
                              ...invInputSt,
                              height: "auto",
                              padding: "9px 12px",
                              background: "#f5f5f5",
                              color: C.muted,
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {form.unit || "—"}
                          </div>
                        </div>
                      </div>
                      <div>
                        <label style={invLabelSt}>Shop Category</label>
                        <select
                          style={invInputSt}
                          value={form.shopCategory}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              shopCategory: e.target.value,
                            }))
                          }
                        >
                          <option value="">Select category…</option>
                          {brandList.map((b) => (
                            <option key={b.id} value={b.name}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 8,
                    paddingTop: 14,
                    borderTop: `1px solid ${C.border}`,
                  }}
                >
                  <button type="button" onClick={closeModal} style={btnSt}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingItem}
                    style={{
                      ...btnPrimarySt,
                      opacity: savingItem ? 0.6 : 1,
                      cursor: savingItem ? "not-allowed" : "pointer",
                    }}
                  >
                    {savingItem ? "Saving…" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── RECEIVE STOCK MODAL ── */}
        {receiveTarget && (
          <ReceiveStockModal
            brandDef={receiveTarget.brandDef}
            brandItems={brandItemsFor(receiveTarget.brandDef)}
            initialProduct={receiveTarget.product}
            apiUrl={process.env.REACT_APP_API_URL}
            userName={userName}
            userRole={user?.role}
            onClose={() => setReceiveTarget(null)}
            onDone={async (receivedProduct) => {
              const freshRows = await fetchItems();
              await fetchActivityLog();
              const freshItem =
                freshRows.find(
                  (row) => String(row.id) === String(receivedProduct?.id),
                ) || receivedProduct;
              if (freshItem)
                setFocusMutation({
                  item: freshItem,
                  stamp: Date.now(),
                  reason: "receive",
                });
              setStockRefreshToken((v) => v + 1);
              setReceiveTarget(null);
            }}
            showUiModal={showUiModal}
            setToast={setToast}
          />
        )}

        {/* ── MANAGE BATCHES MODAL (edit expiry / delete queuing entries) ── */}
        {activeBatchIngredient && (
          <BatchesModal
            ingredient={activeBatchIngredient}
            batches={batches}
            loading={batchLoading}
            apiUrl={process.env.REACT_APP_API_URL}
            userName={userName}
            userRole={user?.role}
            showUiModal={showUiModal}
            setToast={setToast}
            readOnly={isReadOnly}
            onRefresh={() => {
              setBatchLoading(true);
              fetch(
                `${process.env.REACT_APP_API_URL}/ingredient-batches?ingredient_id=${activeBatchIngredient.id}`,
              )
                .then((r) => r.json())
                .then((d) => {
                  setBatches(Array.isArray(d) ? d : []);
                  setBatchLoading(false);
                });
              fetchItems();
            }}
            onClose={() => setActiveBatchIngredient(null)}
          />
        )}

        <Toast toast={toast} onClose={() => setToast(null)} />

        {/* ── DELETE CONFIRM MODAL ── */}
        <DeleteConfirmModal
          item={deleteTarget}
          deleting={deletingItem}
          onConfirm={confirmDelete}
          onCancel={() => {
            if (!deletingItem) setDeleteTarget(null);
          }}
        />

        {/* ── IMPORT LOADING MODAL ── */}
        <ImportLoadingModal visible={importLoading} progress={importProgress} />
        <UIModal
          modal={uiModal}
          onClose={closeUiModal}
          onConfirm={() => {
            if (uiModal?.onConfirm) uiModal.onConfirm();
            closeUiModal();
          }}
        />
        {showDeleteHistory && (
          <DeleteHistoryPanel
            history={deleteHistoryForBrand(
              BRAND_DEFS.find((bd) => bd.key === deleteHistoryBrandKey) ||
                activeBrandDef,
            )}
            restoringId={restoringId}
            onRestore={handleRestore}
            onClose={() => {
              setShowDeleteHistory(false);
              setDeleteHistoryBrandKey(null);
            }}
          />
        )}
        {showActivityLog && (
          <ActivityLogPanel
            log={activityLog}
            onClose={() => setShowActivityLog(false)}
            title="Stock Activity Log"
          />
        )}
      </div>
    );
  }

  return StockInventoryContent;
})();

/* ===== INLINE MENU INVENTORY MODULE ===== */
const MenuInventoryContent = (() => {
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
    amber: "#d97706",
    amberBg: "#fff7ed",
    amberBorder: "#fed7aa",
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
    transition: "border-color .15s",
  };
  const invLabelSt = {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    color: C.muted,
    marginBottom: 5,
    letterSpacing: "0.04em",
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
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
    color: C.ink,
    transition: "background .15s, border-color .15s",
  };
  const btnPrimarySt = {
    ...btnSt,
    background: C.green,
    color: C.white,
    border: "none",
    boxShadow: "0 10px 24px rgba(59,121,30,0.22)",
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
    background: "transparent",
    transition: "background .12s, color .12s",
  };

  const DEFAULT_PROFIT_MARGIN = 40;
  const DIRECT_OPERATIONS_MARGIN = 30;
  const DIRECT_PROFIT_MARGIN = 40;
  const computeDirectSellingPrice = (cost) => {
    const base = Number(cost || 0);
    return base > 0
      ? Math.round(
          base *
            (1 + DIRECT_OPERATIONS_MARGIN / 100 + DIRECT_PROFIT_MARGIN / 100) *
            100,
        ) / 100
      : 0;
  };
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

  const fmtPeso = (n) =>
    "₱" +
    Number(n || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const PAGE_SIZE = 20;
  const fmtTs = (d) =>
    new Date(d).toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  const FONT = "'Plus Jakarta Sans', sans-serif";

  const SortAscIcon = ChevronUp;
  const SortDescIcon = ChevronDown;

  const normalizeName = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[''']/g, "")
      .replace(/s$/, "");
  };
  const findDuplicate = (name, branch, existingItems) => {
    const normalizedNew = normalizeName(name);
    if (!normalizedNew) return null;
    return (
      existingItems.find((item) => {
        if (item.branch !== branch) return false;
        return normalizeName(item.name) === normalizedNew;
      }) || null
    );
  };

  // ─── Icons — Lucide React only ───────────────────────────────────────────────
  const SearchIcon = Search;
  const EditIcon = Pencil;
  const TrashIcon = Trash2;
  const XIcon = X;
  const PlusIcon = Plus;
  const StoreIcon = Store;
  const FileIcon = FileText;
  const TagIcon = Tag;
  const ChevronIcon = ({ size = 12, dir = "down", ...props }) =>
    dir === "up" ? (
      <ChevronUp size={size} {...props} />
    ) : (
      <ChevronDown size={size} {...props} />
    );
  const HistoryIcon = History;
  const RestoreIcon = RotateCcw;
  const ActivityIcon = Activity;
  const ArrowLeftIcon = ArrowLeft;
  const ArrowRightIcon = ArrowRight;
  const EyeIcon = Eye;
  const AlertCircleIcon = AlertCircle;

  const isPharmaBrandName = (name) =>
    String(name || "")
      .toLowerCase()
      .includes("ipharma");
  const isFuelBrandName = (name) =>
    String(name || "")
      .toLowerCase()
      .includes("ifuel");
  const isDirectBrandName = (name) =>
    isPharmaBrandName(name) || isFuelBrandName(name);

  const getBrandCategories = (brandObj) => {
    const raw = brandObj?.categories;
    if (Array.isArray(raw))
      return [
        ...new Set(raw.map((c) => String(c || "").trim()).filter(Boolean)),
      ];
    if (typeof raw === "string" && raw.trim()) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed))
          return [
            ...new Set(
              parsed.map((c) => String(c || "").trim()).filter(Boolean),
            ),
          ];
      } catch {}
      return [
        ...new Set(
          raw
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean),
        ),
      ];
    }
    return [];
  };

  const STOCK_CATEGORY_STORAGE_KEY = "franchisync_stock_product_categories_v2";

  const readStockCategoryMap = () => {
    if (typeof window === "undefined" || !window.localStorage) return {};
    try {
      const raw = window.localStorage.getItem(STOCK_CATEGORY_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : {};
    } catch {
      return {};
    }
  };

  const getPersistedStockCategory = (itemId) => {
    if (itemId === null || itemId === undefined || itemId === "") return "";
    return String(readStockCategoryMap()[String(itemId)] || "").trim();
  };

  const normalizeCatalogueStockItem = (row) => {
    const backendCategory = String(
      row?.category ?? row?.product_category ?? row?.category_name ?? "",
    ).trim();

    return {
      ...row,
      brand: String(row?.brand ?? row?.brand_name ?? "").trim(),
      // Uses the same exact product-category cache as Stock Inventory so direct
      // iFuel/iPharma catalogue cards cannot fall back to Uncategorized simply
      // because the current /ingredients API omitted category in its response.
      category: backendCategory || getPersistedStockCategory(row?.id),
    };
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

  // ─── MiniBar ───────────────────────────────────────────────────────────────────
  function MiniBar({ pct, color, track = "#eef6f1", height = 6 }) {
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

  // ─── Chip ──────────────────────────────────────────────────────────────────────
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

  // ─── BranchSearchSelect ───────────────────────────────────────────────────────
  function BranchSearchSelect({ value, onChange, allBranches }) {
    const [query, setQuery] = useState(value || "");
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
      setQuery(value || "");
    }, [value]);
    useEffect(() => {
      const fn = (e) => {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      };
      document.addEventListener("mousedown", fn);
      return () => document.removeEventListener("mousedown", fn);
    }, []);
    const filtered = allBranches.filter(
      ({ branch, brand }) =>
        !query ||
        branch.toLowerCase().includes(query.toLowerCase()) ||
        brand.toLowerCase().includes(query.toLowerCase()),
    );
    return (
      <div ref={ref} style={{ position: "relative" }}>
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: C.muted,
            }}
          >
            <SearchIcon size={12} />
          </div>
          <input
            type="text"
            value={query}
            placeholder="Search branch…"
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            style={{ ...invInputSt, paddingLeft: 30 }}
          />
        </div>
        {open && filtered.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 3px)",
              left: 0,
              right: 0,
              zIndex: 400,
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
              maxHeight: 190,
              overflowY: "auto",
            }}
          >
            {filtered.map(({ branch, brand }) => (
              <div
                key={branch}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(branch);
                  setQuery(branch);
                  setOpen(false);
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.bg)}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
                style={{
                  padding: "9px 13px",
                  cursor: "pointer",
                  fontSize: 13,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: 600, color: C.ink }}>{branch}</span>
                <span
                  style={{
                    fontSize: 11,
                    color: C.muted,
                    background: C.greenLt,
                    padding: "2px 8px",
                    borderRadius: 20,
                  }}
                >
                  {brand}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── Searchable single-branch filter — copied from Stock Inventory ───────────
  function BranchOnlyFilter({ branches, activeBranch, onChangeBranch }) {
    const [branchQ, setBranchQ] = useState("");
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
      const fn = (e) => {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      };
      document.addEventListener("mousedown", fn);
      return () => document.removeEventListener("mousedown", fn);
    }, []);

    const filteredBranches = branches.filter(
      (br) => !branchQ || br.toLowerCase().includes(branchQ.toLowerCase()),
    );

    const dropSt = {
      position: "absolute",
      top: "calc(100% + 4px)",
      left: 0,
      right: 0,
      zIndex: 300,
      background: C.white,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      boxShadow: "0 8px 28px rgba(0,0,0,0.10)",
      maxHeight: 230,
      overflowY: "auto",
    };
    const optSt = (active) => ({
      padding: "9px 14px",
      cursor: "pointer",
      fontSize: 13,
      color: C.ink,
      fontWeight: active ? 700 : 500,
      background: active ? C.greenLt : "transparent",
      display: "flex",
      alignItems: "center",
      gap: 8,
    });

    return (
      <div ref={ref} style={{ position: "relative", minWidth: 150 }}>
        <div
          onClick={() => {
            setOpen((v) => !v);
            setBranchQ("");
          }}
          style={{
            ...invInputSt,
            height: 30,
            fontSize: 11,
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            paddingRight: 26,
            userSelect: "none",
            color: activeBranch ? C.ink : C.muted,
          }}
        >
          <StoreIcon size={11} color={C.green} />
          <span
            style={{
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {activeBranch || "All Branches"}
          </span>
          <ChevronIcon size={10} dir={open ? "up" : "down"} />
        </div>
        {open && (
          <div style={dropSt}>
            <div
              style={{
                padding: "6px 8px",
                borderBottom: `1px solid ${C.border}`,
                position: "sticky",
                top: 0,
                background: C.white,
              }}
            >
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: C.muted,
                  }}
                >
                  <SearchIcon size={11} />
                </div>
                <input
                  autoFocus
                  type="text"
                  value={branchQ}
                  onChange={(e) => setBranchQ(e.target.value)}
                  placeholder="Search branch…"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    ...invInputSt,
                    height: 28,
                    fontSize: 11,
                    paddingLeft: 26,
                  }}
                />
              </div>
            </div>
            <div
              style={optSt(!activeBranch)}
              onMouseDown={() => {
                onChangeBranch("");
                setOpen(false);
              }}
            >
              All Branches
            </div>
            {filteredBranches.map((br) => (
              <div
                key={br}
                style={optSt(activeBranch === br)}
                onMouseDown={() => {
                  onChangeBranch(br);
                  setOpen(false);
                }}
              >
                <StoreIcon size={11} color={C.green} /> {br}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── CategorySelect ─────────────────────────────────────────────────────────
  function CategorySelect({ value, onChange, categories, onAddCategory }) {
    const [adding, setAdding] = useState(false);
    const [newCat, setNewCat] = useState("");
    const handleAdd = () => {
      const t = newCat.trim();
      if (!t) return;
      onAddCategory(t);
      onChange(t);
      setNewCat("");
      setAdding(false);
    };
    return (
      <div>
        <div style={{ display: "flex", gap: 6 }}>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ ...invInputSt, flex: 1 }}
          >
            <option value="">Select category…</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            style={{
              ...smallBtnSt,
              height: 38,
              width: 38,
              justifyContent: "center",
              border: `1px solid ${C.border}`,
              color: adding ? C.green : C.muted,
            }}
          >
            <TagIcon size={14} />
          </button>
        </div>
        {adding && (
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <input
              autoFocus
              type="text"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              placeholder="New category…"
              style={{ ...invInputSt, flex: 1 }}
            />
            <button
              type="button"
              onClick={handleAdd}
              style={{ ...btnPrimarySt, padding: "0 14px" }}
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setNewCat("");
              }}
              style={{
                ...smallBtnSt,
                height: 38,
                width: 38,
                justifyContent: "center",
                border: "1px solid #fecaca",
                color: C.red,
              }}
            >
              <XIcon size={13} />
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── DELETE CONFIRM MODAL — Stock Inventory's header-strip chrome ────────────
  function DeleteConfirmModal({
    target,
    onConfirm,
    onClose,
    deleting = false,
  }) {
    if (!target) return null;
    return (
      <div
        onClick={deleting ? undefined : onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(18,36,27,0.45)",
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
            background: C.white,
            borderRadius: 16,
            width: "100%",
            maxWidth: 420,
            boxShadow: "0 24px 64px rgba(0,0,0,0.16)",
            border: "1px solid #fecaca",
            fontFamily: FONT,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: C.redBg,
              padding: "20px 24px 16px",
              borderBottom: "1px solid #fecaca",
              display: "flex",
              alignItems: "flex-start",
              gap: 13,
            }}
          >
            <div style={{ flexShrink: 0, marginTop: 1 }}>
              <AlertCircleIcon size={26} color={C.red} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#991b1b",
                  marginBottom: 5,
                }}
              >
                Delete Item
              </div>
              <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.6 }}>
                Are you sure you want to delete <strong>"{target.name}"</strong>
                {target.branch ? (
                  <>
                    {" "}
                    from <strong>{target.branch}</strong>
                  </>
                ) : null}
                ?
              </div>
              {target.ingredientCount > 0 && (
                <div
                  style={{
                    marginTop: 8,
                    background: "#fff5f5",
                    border: "1px solid #fecaca",
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontSize: 12,
                    color: "#7f1d1d",
                  }}
                >
                  This item has {target.ingredientCount} linked ingredient
                  {target.ingredientCount !== 1 ? "s" : ""}.
                </div>
              )}
              <div style={{ marginTop: 8, fontSize: 11.5, color: C.muted }}>
                You can recover this from Delete History.
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={deleting}
              style={{
                flexShrink: 0,
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "1px solid #fecaca",
                background: "transparent",
                cursor: deleting ? "not-allowed" : "pointer",
                color: C.muted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <XIcon size={13} />
            </button>
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
              onClick={onClose}
              disabled={deleting}
              style={{ ...btnSt, opacity: deleting ? 0.5 : 1 }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              style={{
                ...btnSt,
                background: C.red,
                color: "#fff",
                border: "none",
                boxShadow: "0 2px 8px rgba(192,57,43,0.25)",
                opacity: deleting ? 0.7 : 1,
                cursor: deleting ? "not-allowed" : "pointer",
              }}
            >
              {deleting ? (
                <>
                  <RefreshCw
                    size={13}
                    style={{ animation: "spin .8s linear infinite" }}
                  />{" "}
                  Deleting…
                </>
              ) : (
                <>
                  <TrashIcon size={13} /> Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Delete History Panel — Stock Inventory's grid-row chrome ────────────────
  function InventoryDeleteHistoryPanel({
    history,
    onRestore,
    restoringId,
    onClose,
  }) {
    return (
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(18,36,27,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000,
          padding: 20,
          backdropFilter: "blur(4px)",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: C.white,
            borderRadius: 18,
            padding: "28px 32px",
            width: "100%",
            maxWidth: 780,
            maxHeight: "82vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            border: `1px solid ${C.greenMid}`,
            fontFamily: FONT,
          }}
        >
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: C.ink,
                  margin: 0,
                }}
              >
                Delete History
              </h2>
              {history.length > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: "#fee2e2",
                    color: C.red,
                  }}
                >
                  {history.length} deleted
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: `1px solid ${C.border}`,
                background: C.greenLt,
                cursor: "pointer",
                color: C.green,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <XIcon size={15} />
            </button>
          </div>

          {history.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 90px 70px 80px 110px 100px",
                gap: 8,
                padding: "6px 0 10px",
                borderBottom: `2px solid ${C.greenLt}`,
                fontSize: 10,
                fontWeight: 700,
                color: C.muted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              <span>Item</span>
              <span>Branch</span>
              <span>Stock</span>
              <span>Price</span>
              <span>Deleted At</span>
              <span></span>
            </div>
          )}

          <div style={{ overflowY: "auto", flex: 1 }}>
            {history.length === 0 ? (
              <div
                style={{
                  padding: "40px 0",
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: 13,
                  fontStyle: "italic",
                }}
              >
                No deleted items yet.
              </div>
            ) : (
              history.map((entry, i) => {
                const d = entry.inventory_data || {};
                const ings = entry.ingredients_data || [];
                return (
                  <div
                    key={entry.id}
                    style={{
                      padding: "14px 0",
                      borderBottom:
                        i < history.length - 1 ? `1px solid ${C.bg}` : "none",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 90px 70px 80px 110px 100px",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 13,
                            color: C.ink,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {d.name}
                        </div>
                        <div
                          style={{ fontSize: 11, color: C.muted, marginTop: 2 }}
                        >
                          {d.category}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: C.muted,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {d.branch}
                      </div>
                      <div
                        style={{ fontSize: 12, color: C.ink, fontWeight: 600 }}
                      >
                        {d.stock}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: C.green,
                          fontWeight: 700,
                        }}
                      >
                        {fmtPeso(d.price || 0)}
                      </div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>
                        {entry.deleted_at ? fmtTs(entry.deleted_at) : "—"}
                      </div>
                      <button
                        onClick={() => onRestore(entry)}
                        disabled={restoringId === entry.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "7px 12px",
                          borderRadius: 8,
                          border: `1.5px solid ${C.green}`,
                          background: C.greenLt,
                          color: C.greenDk,
                          fontSize: 12,
                          fontWeight: 700,
                          fontFamily: "inherit",
                          whiteSpace: "nowrap",
                          opacity: restoringId === entry.id ? 0.7 : 1,
                          cursor:
                            restoringId === entry.id
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        {restoringId === entry.id ? (
                          <RefreshCw
                            size={12}
                            style={{ animation: "spin 0.8s linear infinite" }}
                          />
                        ) : (
                          <RestoreIcon />
                        )}
                        {restoringId === entry.id ? "Restoring…" : "Restore"}
                      </button>
                    </div>
                    {ings.length > 0 && (
                      <div
                        style={{
                          marginTop: 8,
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 5,
                          paddingLeft: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            color: "#9ca3af",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            alignSelf: "center",
                          }}
                        >
                          Ingredients:
                        </span>
                        {ings.map((ing, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: 11,
                              padding: "2px 9px",
                              borderRadius: 20,
                              background: C.greenLt,
                              color: C.greenDk,
                              fontWeight: 600,
                              border: `1px solid ${C.greenMid}`,
                            }}
                          >
                            {ing.name} × {ing.qty_required} {ing.unit}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Activity Log Panel — Stock Inventory's grid-row chrome ──────────────────
  function InventoryActivityLogPanel({ log, onClose }) {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");

    const filtered = log.filter((entry) => {
      if (typeFilter !== "all" && entry.action !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !entry.itemName?.toLowerCase().includes(q) &&
          !(entry.performedBy || "").toLowerCase().includes(q) &&
          !(entry.branch || "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });

    const actionBadge = (action) => {
      const map = {
        add: { bg: "rgba(16,185,129,0.12)", color: "#059669", label: "Added" },
        edit: {
          bg: "rgba(59,130,246,0.12)",
          color: "#1d4ed8",
          label: "Edited",
        },
        import: {
          bg: "rgba(139,92,246,0.12)",
          color: "#7c3aed",
          label: "Imported",
        },
        delete: {
          bg: "rgba(239,68,68,0.12)",
          color: "#dc2626",
          label: "Deleted",
        },
      };
      const s = map[action] || map.edit;
      return (
        <span
          style={{
            padding: "2px 9px",
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 700,
            background: s.bg,
            color: s.color,
            whiteSpace: "nowrap",
          }}
        >
          {s.label}
        </span>
      );
    };

    return (
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(18,36,27,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000,
          padding: 20,
          backdropFilter: "blur(4px)",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: C.white,
            borderRadius: 18,
            padding: "28px 32px",
            width: "100%",
            maxWidth: 780,
            maxHeight: "82vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            border: `1px solid ${C.greenMid}`,
            fontFamily: FONT,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: C.ink,
                  margin: 0,
                }}
              >
                Activity Log
              </h2>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: C.greenLt,
                  color: C.greenDk,
                }}
              >
                {filtered.length} entries
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: `1px solid ${C.border}`,
                background: C.greenLt,
                cursor: "pointer",
                color: C.green,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <XIcon size={15} />
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={{ position: "relative", flex: "1 1 200px" }}>
              <div
                style={{
                  position: "absolute",
                  left: 9,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: C.muted,
                }}
              >
                <SearchIcon size={12} />
              </div>
              <input
                type="text"
                placeholder="Search item, user, branch…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  ...invInputSt,
                  paddingLeft: 28,
                  height: 32,
                  fontSize: 12,
                }}
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ ...invInputSt, width: 140, height: 32, fontSize: 12 }}
            >
              <option value="all">All Actions</option>
              <option value="add">Added</option>
              <option value="edit">Edited</option>
              <option value="import">Imported</option>
              <option value="delete">Deleted</option>
            </select>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr 100px 120px 160px",
              gap: 8,
              padding: "6px 0 8px",
              borderBottom: `2px solid ${C.greenLt}`,
              fontSize: 10,
              fontWeight: 700,
              color: C.muted,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            <span>Action</span>
            <span>Item</span>
            <span>Branch</span>
            <span>By</span>
            <span>Timestamp</span>
          </div>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: "40px 0",
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: 13,
                  fontStyle: "italic",
                }}
              >
                No activity yet.
              </div>
            ) : (
              filtered.map((entry, i) => (
                <div
                  key={entry.id || i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px 1fr 100px 120px 160px",
                    gap: 8,
                    alignItems: "center",
                    padding: "11px 0",
                    borderBottom:
                      i < filtered.length - 1 ? `1px solid ${C.bg}` : "none",
                  }}
                >
                  <div>{actionBadge(entry.action)}</div>
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: C.ink,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {entry.itemName}
                    </div>
                    {entry.changes && (
                      <div
                        style={{
                          fontSize: 10,
                          color: C.muted,
                          marginTop: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {entry.changes}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: C.muted,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {entry.branch || "—"}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.ink,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {entry.performedBy || "System"}
                  </div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>
                    {entry.timestamp ? fmtTs(entry.timestamp) : "—"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  function LogPagination({ page, totalPages, onChange }) {
    if (totalPages <= 1) return null;
    const pageBtn = (active, disabled) => ({
      minWidth: 32,
      height: 32,
      padding: "0 8px",
      borderRadius: 999,
      border: `1px solid ${active ? "transparent" : C.border}`,
      background: active ? C.green : C.white,
      color: active ? "#fff" : disabled ? "#cbd5c9" : C.ink,
      fontSize: 12.5,
      fontWeight: active ? 800 : 600,
      cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: FONT,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: active ? "0 3px 10px rgba(59,121,30,0.25)" : "none",
      transition:
        "transform .12s ease, box-shadow .12s ease, background .12s ease",
    });
    const pages = Array.from({ length: totalPages }, (_, i) => i).filter(
      (i) => Math.abs(i - page) <= 2 || i === 0 || i === totalPages - 1,
    );
    const withGaps = [];
    pages.forEach((p, idx) => {
      if (idx > 0 && p - pages[idx - 1] > 1) withGaps.push("gap");
      withGaps.push(p);
    });
    return (
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <button
          onClick={() => onChange(Math.max(0, page - 1))}
          disabled={page === 0}
          style={pageBtn(false, page === 0)}
        >
          ‹
        </button>
        {withGaps.map((p, i) =>
          p === "gap" ? (
            <span
              key={`gap-${i}`}
              style={{
                width: 20,
                textAlign: "center",
                color: "#94a3b8",
                fontSize: 12,
              }}
            >
              ···
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              style={pageBtn(p === page, false)}
            >
              {p + 1}
            </button>
          ),
        )}
        <button
          onClick={() => onChange(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}
          style={pageBtn(false, page >= totalPages - 1)}
        >
          ›
        </button>
      </div>
    );
  }

  // ─── Pagination — copied from Stock Inventory ─────────────────────────────────
  function Pagination({ page, setPage, total, pageSize }) {
    const totalPgs = Math.max(1, Math.ceil(total / pageSize));
    if (totalPgs <= 1) return null;
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 18px",
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
                background: C.white,
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
                  background: i === page ? C.green : C.white,
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
                background: C.white,
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── InventoryTable (kept for parity — same token-driven styling now) ────────
  function InventoryTable({ items, onEdit, onRequestDelete, deletingId }) {
    const [sort, setSort] = useState({ col: "name", asc: true });
    const [page, setPage] = useState(0);
    const [expandedRows, setExpanded] = useState({});

    useEffect(() => {
      setPage(0);
    }, [items]);

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

    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
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
            fontSize: 10.5,
            color: active ? C.green : C.muted,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            borderBottom: `2px solid ${C.greenLt}`,
            cursor: "pointer",
            userSelect: "none",
            whiteSpace: "nowrap",
            background: "#f8fffe",
            ...s,
          }}
        >
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
          >
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
          fontSize: 10.5,
          color: C.muted,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          borderBottom: `2px solid ${C.greenLt}`,
          whiteSpace: "nowrap",
          background: "#f8fffe",
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
            padding: "36px 0",
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
                <Th col="branch" label="Branch" style={{ minWidth: 130 }} />
                <Th col="stock" label="Stock" style={{ minWidth: 72 }} />
                <Th
                  col="min_stock"
                  label="Min Stock"
                  style={{ minWidth: 80 }}
                />
                <Th col="cost" label="Cost" style={{ minWidth: 90 }} />
                <Th col="price" label="Price" style={{ minWidth: 90 }} />
                <ThStatic label="Ingredients" style={{ minWidth: 140 }} />
                <th
                  style={{
                    padding: "9px 12px",
                    background: "#f8fffe",
                    borderBottom: `2px solid ${C.greenLt}`,
                    minWidth: 150,
                  }}
                />
              </tr>
            </thead>
            <tbody>
              {pageItems.map((item) => {
                const low = Number(item.stock) <= Number(item.min_stock);
                const isDeleting = deletingId === item.id;
                const ingredients = item.ingredients || [];
                const isExpanded = expandedRows[item.id];
                return (
                  <React.Fragment key={item.id}>
                    <tr
                      style={{
                        borderBottom: isExpanded ? "none" : `1px solid ${C.bg}`,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#fafcf7")
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
                            background: C.greenLt,
                            color: C.greenDk,
                          }}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          color: C.muted,
                          fontSize: 12,
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <StoreIcon size={11} color={C.green} /> {item.branch}
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
                                background: C.warnBg,
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
                        <div
                          style={{
                            display: "flex",
                            gap: 5,
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            onClick={() => onEdit(item)}
                            disabled={isDeleting}
                            style={{
                              ...smallBtnSt,
                              border: `1px solid ${C.border}`,
                              color: C.green,
                              opacity: isDeleting ? 0.5 : 1,
                              cursor: isDeleting ? "not-allowed" : "pointer",
                            }}
                          >
                            <EditIcon /> Edit
                          </button>
                          <button
                            onClick={() => onRequestDelete(item)}
                            disabled={isDeleting}
                            style={{
                              ...smallBtnSt,
                              border: "1px solid #fecaca",
                              color: C.red,
                              opacity: isDeleting ? 0.6 : 1,
                              cursor: isDeleting ? "not-allowed" : "pointer",
                            }}
                          >
                            {isDeleting && (
                              <RefreshCw
                                size={11}
                                style={{
                                  animation: "spin 0.8s linear infinite",
                                }}
                              />
                            )}
                            {isDeleting ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && ingredients.length > 0 && (
                      <tr style={{ borderBottom: `1px solid ${C.bg}` }}>
                        <td
                          colSpan={9}
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
                                <span
                                  style={{ color: C.green, fontWeight: 700 }}
                                >
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
        {totalPages > 1 && (
          <Pagination
            page={page}
            setPage={setPage}
            total={sorted.length}
            pageSize={PAGE_SIZE}
          />
        )}
      </div>
    );
  }

  // ─── Toast — same design, retuned to Stock Inventory's green/red tokens ──────
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
          background: isErr ? C.redBg : C.okBg,
          borderLeft: `5px solid ${isErr ? C.red : C.green}`,
          border: `1px solid ${isErr ? "#fecaca" : C.greenMid}`,
          borderLeftWidth: 5,
          boxShadow: "0 16px 40px rgba(0,0,0,0.24)",
          fontFamily: FONT,
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
            background: isErr ? C.red : C.green,
            color: "#fff",
            boxShadow: `0 4px 10px ${isErr ? "rgba(192,57,43,0.4)" : "rgba(59,121,30,0.4)"}`,
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
              color: isErr ? "#7f1d1d" : C.ink,
            }}
          >
            {toast.title}
          </div>
          {toast.message && (
            <div
              style={{
                fontSize: 12.5,
                color: isErr ? "#991b1b" : C.muted,
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
              color: isErr ? "#991b1b" : C.muted,
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

  // ─── BrandOverviewCard — Stock Inventory's ink-icon / 2-stat card ─────────────
  function BrandOverviewCard({
    brand,
    branchCount,
    itemCount,
    lowCount,
    onClick,
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{
          textAlign: "left",
          width: "100%",
          padding: 0,
          appearance: "none",
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 2px 10px rgba(50,109,32,.05)",
          cursor: "pointer",
          transition:
            "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
          fontFamily: "inherit",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = "0 14px 32px rgba(50,109,32,.12)";
          e.currentTarget.style.borderColor = C.greenMid;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "";
          e.currentTarget.style.boxShadow = "0 2px 10px rgba(50,109,32,.05)";
          e.currentTarget.style.borderColor = C.border;
        }}
      >
        <div
          style={{
            padding: "18px 18px 15px",
            borderBottom: `1px solid ${C.border}`,
            background: "#fbfcf8",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: C.ink,
              color: C.lime,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <StoreIcon size={19} color={C.lime} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: C.ink,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {brand.name}
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
              {branchCount} branch{branchCount === 1 ? "" : "es"}
            </div>
          </div>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: C.bg,
              border: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: C.greenDk,
            }}
          >
            <ArrowRightIcon size={13} />
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: 0,
            padding: "16px 18px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                color: C.muted,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: ".05em",
              }}
            >
              Items
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: C.ink,
                marginTop: 3,
              }}
            >
              {itemCount}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                color: C.muted,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: ".05em",
              }}
            >
              Low
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: lowCount ? C.red : C.green,
                marginTop: 3,
              }}
            >
              {lowCount}
            </div>
          </div>
        </div>
      </button>
    );
  }

  // ─── ItemDetailPanel ───────────────────────────────────────────────────────────
  function ItemDetailPanel({ item, onEdit, onRequestDelete, deletingId }) {
    if (!item) return null;

    const low = item.is_low;
    const isDeleting = deletingId === item.id;
    const ingredients = item.ingredients || [];
    const directProduct =
      item.product_type === "DIRECT" ||
      item.product_type === "FUEL" ||
      isDirectBrandName(item.brand);

    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 14,
            gap: 8,
          }}
        >
          <div
            style={{
              flex: 1,
              background: low ? C.warnBg : C.okBg,
              borderRadius: 10,
              padding: "10px 14px",
            }}
          >
            <div
              style={{
                fontSize: 9.5,
                fontWeight: 800,
                color: C.muted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 4,
              }}
            >
              {directProduct ? "Available Stock" : "Can Make"}
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: low ? C.warn : C.ink,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {item.available_stock != null ? item.available_stock : "—"}
              {low && (
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    color: C.warn,
                    background: C.warnBg,
                    padding: "2px 7px",
                    borderRadius: 20,
                  }}
                >
                  LOW
                </span>
              )}
            </div>
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: C.ink,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.name}
            </div>
            <div
              style={{
                fontSize: 11,
                color: C.muted,
                marginTop: 3,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <StoreIcon size={11} color={C.green} /> {item.branch}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            {directProduct ? (
              <span
                style={{
                  ...smallBtnSt,
                  border: `1px solid ${C.greenMid}`,
                  background: C.greenLt,
                  color: C.greenDk,
                  cursor: "default",
                }}
              >
                <Link2 size={11} /> Managed in Stock Inventory
              </span>
            ) : (
              <>
                <button
                  onClick={() => onEdit(item)}
                  disabled={isDeleting}
                  style={{
                    ...smallBtnSt,
                    border: `1px solid ${C.border}`,
                    color: C.green,
                    opacity: isDeleting ? 0.5 : 1,
                    cursor: isDeleting ? "not-allowed" : "pointer",
                  }}
                >
                  <EditIcon size={11} /> Edit
                </button>
                <button
                  onClick={() => onRequestDelete(item)}
                  disabled={isDeleting}
                  style={{
                    ...smallBtnSt,
                    border: "1px solid #fecaca",
                    color: C.red,
                    opacity: isDeleting ? 0.6 : 1,
                    cursor: isDeleting ? "not-allowed" : "pointer",
                  }}
                >
                  {isDeleting && (
                    <RefreshCw
                      size={11}
                      style={{ animation: "spin 0.8s linear infinite" }}
                    />
                  )}
                  {isDeleting ? (
                    "Deleting…"
                  ) : (
                    <>
                      <TrashIcon size={11} /> Delete
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
        {item.low_ingredients?.length > 0 && (
          <div style={{ fontSize: 11, color: C.warn, marginTop: 8 }}>
            Low on: {item.low_ingredients.join(", ")}
          </div>
        )}

        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.name}
            style={{
              width: "100%",
              maxWidth: 280,
              height: 170,
              objectFit: "cover",
              borderRadius: 12,
              border: `1px solid ${C.border}`,
              marginBottom: 14,
            }}
            onError={(e) => (e.target.style.display = "none")}
          />
        )}

        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div
            style={{
              flex: 1,
              background: C.greenLt,
              borderRadius: 10,
              padding: "10px 14px",
            }}
          >
            <div
              style={{
                fontSize: 9.5,
                fontWeight: 800,
                color: C.muted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 4,
              }}
            >
              {directProduct ? "Auto Selling Price" : "Price"}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.greenDk }}>
              {fmtPeso(item.price)}
            </div>
            {directProduct && (
              <div style={{ fontSize: 9.5, color: C.muted, marginTop: 3 }}>
                Cost + 30% operations + 40% profit
              </div>
            )}
          </div>
          {item.category && (
            <div
              style={{
                flex: 1,
                background: C.bg,
                borderRadius: 10,
                padding: "10px 14px",
              }}
            >
              <div
                style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  color: C.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 4,
                }}
              >
                Category
              </div>
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
                {item.category}
              </div>
            </div>
          )}
        </div>

        {directProduct && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,minmax(0,1fr))",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  color: C.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Cost / Unit
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: C.ink,
                  marginTop: 4,
                }}
              >
                {fmtPeso(item.cost_per_unit ?? item.cost)}
              </div>
            </div>
            <div
              style={{
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  color: C.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Unit
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: C.ink,
                  marginTop: 4,
                }}
              >
                {item.unit || "—"}
              </div>
            </div>
            <div
              style={{
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  color: C.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Minimum Stock
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: C.ink,
                  marginTop: 4,
                }}
              >
                {Number(item.min_stock || 0).toLocaleString("en-PH")}
              </div>
            </div>
          </div>
        )}

        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: C.muted,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: 8,
            }}
          >
            {directProduct ? "Stock Inventory Source" : "Ingredients"}
          </div>
          {directProduct ? (
            <div
              style={{
                background: C.greenLt,
                border: `1px solid ${C.greenMid}`,
                borderRadius: 11,
                padding: "11px 13px",
                display: "flex",
                alignItems: "flex-start",
                gap: 9,
              }}
            >
              <PackageCheck
                size={16}
                color={C.greenDk}
                style={{ marginTop: 1, flexShrink: 0 }}
              />
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>
                  {item.name}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: C.muted,
                    lineHeight: 1.5,
                    marginTop: 3,
                  }}
                >
                  {item.product_type === "FUEL"
                    ? "Same product as Stock Inventory. Inventory movement and costing follow the FIFO delivery queue; this page only displays the product details and calculated pricing."
                    : "Same product as Stock Inventory. Inventory movement and costing follow the FEFO batch queue; this page only displays the product details and calculated pricing."}
                </div>
              </div>
            </div>
          ) : ingredients.length === 0 ? (
            <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic" }}>
              No ingredients linked.
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {ingredients.map((ing, idx) => (
                <span
                  key={idx}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "5px 11px",
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
                  <span style={{ fontWeight: 800, color: C.greenDk }}>
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
          )}
        </div>
      </div>
    );
  }

  function ItemDetailModal({
    item,
    onClose,
    onEdit,
    onRequestDelete,
    deletingId,
  }) {
    if (!item) return null;
    return (
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(18,36,27,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000,
          padding: 20,
          backdropFilter: "blur(4px)",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: C.white,
            borderRadius: 18,
            padding: "26px 28px",
            width: "100%",
            maxWidth: 520,
            maxHeight: "86vh",
            overflowY: "auto",
            boxShadow: "0 24px 64px rgba(0,0,0,0.16)",
            border: `1px solid ${C.greenMid}`,
            fontFamily: FONT,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h2
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: C.ink,
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <EyeIcon size={15} /> Item Details
            </h2>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: `1px solid ${C.border}`,
                background: C.greenLt,
                cursor: "pointer",
                color: C.green,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <XIcon size={15} />
            </button>
          </div>
          <ItemDetailPanel
            item={item}
            onEdit={onEdit}
            onRequestDelete={onRequestDelete}
            deletingId={deletingId}
          />
        </div>
      </div>
    );
  }

  function MenuBrandListCard({ items, onEdit, onRequestDelete, deletingId }) {
    const [search, setSearch] = useState("");
    const [statusF, setStatusF] = useState("");
    const [selectedId, setSelectedId] = useState(null);

    const filtered = useMemo(() => {
      const q = search.toLowerCase();
      return items
        .filter((i) => {
          if (q && !i.name.toLowerCase().includes(q)) return false;
          if (statusF === "low" && Number(i.stock) > Number(i.min_stock))
            return false;
          if (statusF === "ok" && Number(i.stock) <= Number(i.min_stock))
            return false;
          return true;
        })
        .sort((a, b) => a.name.localeCompare(b.name));
    }, [items, search, statusF]);

    useEffect(() => {
      if (selectedId && !items.find((i) => i.id === selectedId))
        setSelectedId(null);
    }, [items, selectedId]);

    const selected = items.find((i) => i.id === selectedId) || null;

    return (
      <div>
        <div
          style={{
            padding: "10px 20px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            background: "#fbfcf8",
          }}
        >
          <div
            style={{ position: "relative", flex: "1 1 180px", minWidth: 140 }}
          >
            <div
              style={{
                position: "absolute",
                left: 9,
                top: "50%",
                transform: "translateY(-50%)",
                color: C.muted,
              }}
            >
              <SearchIcon size={12} />
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search item…"
              style={{
                ...invInputSt,
                height: 32,
                fontSize: 12,
                paddingLeft: 28,
              }}
            />
          </div>
          <select
            value={statusF}
            onChange={(e) => setStatusF(e.target.value)}
            style={{ ...invInputSt, height: 32, fontSize: 12, width: 120 }}
          >
            <option value="">All Status</option>
            <option value="low">Low Stock</option>
            <option value="ok">In Stock</option>
          </select>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            minHeight: 420,
            maxHeight: 560,
          }}
        >
          <div
            style={{
              borderRight: `1px solid ${C.border}`,
              overflowY: "auto",
              maxHeight: 560,
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
                No items found.
              </div>
            ) : (
              filtered.map((item) => {
                const low = item.is_low;
                const active = item.id === selectedId;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    style={{
                      padding: "11px 16px",
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
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
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
                        fontSize: 11,
                        color: C.muted,
                        marginTop: 3,
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.branch}
                      </span>
                      <span
                        style={{
                          fontWeight: 700,
                          color: C.greenDk,
                          flexShrink: 0,
                        }}
                      >
                        {fmtPeso(item.price)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div style={{ padding: 20, overflowY: "auto", maxHeight: 560 }}>
            {selected ? (
              <ItemDetailPanel
                item={selected}
                onEdit={onEdit}
                onRequestDelete={onRequestDelete}
                deletingId={deletingId}
              />
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
                }}
              >
                <div>
                  Select an item on the left
                  <br />
                  to view its stock link and pricing.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function computeAvailability(ingredients) {
    if (!ingredients || ingredients.length === 0)
      return { available: null, lowIngredients: [] };

    let minPortions = Infinity;
    const lowIngredients = [];

    for (const ing of ingredients) {
      const qtyRequired = parseFloat(ing.qty_required) || 0;
      const stock = parseFloat(ing.stock) || 0;
      if (qtyRequired <= 0) continue;

      const portions = Math.floor(stock / qtyRequired);
      if (portions < minPortions) minPortions = portions;

      if (ing.min_stock != null && stock <= parseFloat(ing.min_stock)) {
        lowIngredients.push(ing.name);
      }
    }

    return {
      available: minPortions === Infinity ? null : minPortions,
      lowIngredients,
    };
  }

  // ─── MenuBrandCard — header/filter row restyled flat like Stock Inventory's BrandCard ─
  function MenuBrandCard({
    brandName,
    items,
    branchOptions,
    categories,
    onEdit,
    onRequestDelete,
    deletingId,
    onQuickAdd,
    onBack,
    onOpenDeleteHistory,
    deleteHistoryCount,
    onImportExcel,
    excelRef,
  }) {
    const [search, setSearch] = useState("");
    const [branchF, setBranchF] = useState("");
    const [statusF, setStatusF] = useState("");
    const [categoryF, setCategoryF] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const didSetDefaultBranch = useRef(false);

    useEffect(() => {
      if (!didSetDefaultBranch.current && branchOptions.length > 0) {
        const headOffice = branchOptions.find(
          (b) => b.toLowerCase() === "head office",
        );
        if (headOffice) setBranchF(headOffice);
        didSetDefaultBranch.current = true;
      }
    }, [branchOptions]);

    const filtered = useMemo(() => {
      const q = search.toLowerCase();
      return items
        .filter((i) => {
          if (q && !i.name.toLowerCase().includes(q)) return false;
          if (branchF && i.branch !== branchF) return false;
          if (categoryF && i.category !== categoryF) return false;
          if (statusF === "low" && !i.is_low) return false;
          if (statusF === "ok" && i.is_low) return false;
          return true;
        })
        .sort((a, b) => a.name.localeCompare(b.name));
    }, [items, search, branchF, categoryF, statusF]);

    useEffect(() => {
      if (selectedId && !items.find((i) => i.id === selectedId))
        setSelectedId(null);
    }, [items, selectedId]);

    const selected = items.find((i) => i.id === selectedId) || null;
    const lowCount = items.filter((i) => i.is_low).length;
    const directBrand = isDirectBrandName(brandName);

    return (
      <div
        style={{
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 2px 10px rgba(50,109,32,.05)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* header — flat, matches Stock Inventory's BrandCard */}
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
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {onBack ? (
              <button
                onClick={onBack}
                title="Back to all brands"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  height: 34,
                  padding: "0 14px",
                  borderRadius: 9,
                  border: `1px solid ${C.border}`,
                  background: C.white,
                  color: C.greenDk,
                  fontSize: 13,
                  fontWeight: 800,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                <ArrowLeftIcon size={16} strokeWidth={2.5} />
              </button>
            ) : (
              <StoreIcon size={17} color={C.green} />
            )}
            <span style={{ fontWeight: 800, fontSize: 17 }}>{brandName}</span>
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 11,
            }}
          >
            <span style={{ opacity: 0.85, color: C.muted }}>
              {items.length} item{items.length === 1 ? "" : "s"}
              {lowCount > 0 ? ` · ${lowCount} low` : ""}
            </span>
            {directBrand ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  height: 28,
                  padding: "0 11px",
                  borderRadius: 8,
                  border: `1px solid ${C.greenMid}`,
                  background: C.greenLt,
                  color: C.greenDk,
                  fontSize: 10.5,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                }}
              >
                <Link2 size={12} /> Auto-synced from Stock Inventory
              </span>
            ) : (
              <button
                onClick={onQuickAdd}
                title="Add a new menu item"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  height: 26,
                  padding: "0 12px",
                  borderRadius: 7,
                  border: "none",
                  background: C.green,
                  color: C.white,
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  whiteSpace: "nowrap",
                }}
              >
                <PlusIcon size={12} /> Add Item
              </button>
            )}
          </span>
        </div>

        {/* filter row */}
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
            style={{ position: "relative", flex: "1 1 160px", minWidth: 100 }}
          >
            <div
              style={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                color: C.muted,
              }}
            >
              <SearchIcon size={11} />
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              style={{
                ...invInputSt,
                height: 30,
                fontSize: 12,
                paddingLeft: 24,
              }}
            />
          </div>
          <BranchOnlyFilter
            branches={branchOptions}
            activeBranch={branchF}
            onChangeBranch={setBranchF}
          />
          <select
            value={categoryF}
            onChange={(e) => setCategoryF(e.target.value)}
            style={{ ...invInputSt, height: 30, fontSize: 11, width: 140 }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={statusF}
            onChange={(e) => setStatusF(e.target.value)}
            style={{ ...invInputSt, height: 30, fontSize: 11, width: 110 }}
          >
            <option value="">All Status</option>
            <option value="low">Low Stock</option>
            <option value="ok">In Stock</option>
          </select>
          <div style={{ flex: 1 }} />
          {!directBrand && (
            <button
              onClick={onOpenDeleteHistory}
              style={{
                ...smallBtnSt,
                height: 30,
                padding: "0 11px",
                border: `1.5px solid ${C.red}`,
                color: C.red,
                gap: 5,
                background: C.white,
              }}
            >
              <HistoryIcon size={11} /> Delete History
              {deleteHistoryCount > 0 && (
                <span
                  style={{
                    background: C.red,
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 800,
                    padding: "1px 6px",
                    borderRadius: 20,
                  }}
                >
                  {deleteHistoryCount}
                </span>
              )}
            </button>
          )}
          {!directBrand && (
            <label
              style={{
                ...smallBtnSt,
                height: 30,
                padding: "0 11px",
                border: `1px solid ${C.border}`,
                cursor: "pointer",
                gap: 5,
                background: C.white,
              }}
            >
              <FileIcon size={11} /> Import Excel
              <input
                ref={excelRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={onImportExcel}
                style={{ display: "none" }}
              />
            </label>
          )}
        </div>

        {/* two columns: left = scrollable item list, right = scrollable ingredients panel */}
        <div
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
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: "30px 14px",
                  textAlign: "center",
                  color: C.muted,
                  fontSize: 12,
                }}
              >
                No items found.
              </div>
            ) : (
              filtered.map((item) => {
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
                    onClick={() => setSelectedId(item.id)}
                    style={{
                      padding: "10px 14px",
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
                        gap: 6,
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
                      style={{ fontSize: 10.5, color: C.muted, marginTop: 3 }}
                    >
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.branch}
                      </span>
                    </div>
                    <div style={{ marginTop: 5 }}>
                      <MiniBar
                        pct={stockPct}
                        color={low ? C.warn : C.green}
                        height={4}
                      />
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 7 }}>
                      {directBrand ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            height: 24,
                            padding: "0 9px",
                            fontSize: 10.5,
                            border: `1px solid ${C.greenMid}`,
                            borderRadius: 999,
                            background: C.greenLt,
                            color: C.greenDk,
                            fontWeight: 700,
                          }}
                        >
                          <Link2 size={10} /> Managed in Stock Inventory
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(item);
                            }}
                            className="edit-btn"
                            style={{
                              ...smallBtnSt,
                              height: 24,
                              padding: "0 9px",
                              fontSize: 10.5,
                              border: `1px solid ${C.border}`,
                              color: C.green,
                            }}
                          >
                            <EditIcon size={10} /> Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRequestDelete(item);
                            }}
                            className="del-btn"
                            style={{
                              ...smallBtnSt,
                              height: 24,
                              padding: "0 9px",
                              fontSize: 10.5,
                              border: "1px solid #fecaca",
                              color: C.red,
                            }}
                          >
                            <TrashIcon size={10} /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div
            style={{
              padding: 20,
              overflowY: "auto",
              maxHeight: 700,
              minHeight: 0,
            }}
          >
            {selected ? (
              <ItemDetailPanel
                item={selected}
                onEdit={onEdit}
                onRequestDelete={onRequestDelete}
                deletingId={deletingId}
              />
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
                  Select an item on the left
                  <br />
                  to view its product details.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Component ────────────────────────────────────────────────────────────
  function MenuInventoryContent({ user, brands: propBrands = [] }) {
    const isAdmin =
      user?.role === "Super Admin" || user?.role === "Sales Admin";
    const userBranch = user?.branch || "";
    const userName = user?.name || "Unknown";

    const [branchFilter, setBranchFilter] = useState("");

    const brandList = propBrands.length > 0 ? propBrands : [];
    const allBranches = useMemo(() => {
      const out = [];
      brandList.forEach((b) =>
        (b.branches || []).forEach((br) => {
          const name = typeof br === "string" ? br : br.name;
          if (!out.find((x) => x.branch === name))
            out.push({ brand: b.name, branch: name });
        }),
      );
      return out;
    }, [brandList]);

    // Only infer a brand from branch when that branch belongs to exactly ONE brand.
    // Shared branches such as Head Office must never decide product ownership.
    const branchToBrand = useMemo(() => {
      const owners = {};
      brandList.forEach((b) =>
        (b.branches || []).forEach((br) => {
          const name = typeof br === "string" ? br : br?.name;
          if (!name) return;
          if (!owners[name]) owners[name] = [];
          owners[name].push(b.name);
        }),
      );

      const map = {};
      Object.entries(owners).forEach(([branchName, brandNames]) => {
        const unique = [...new Set(brandNames.filter(Boolean))];
        if (unique.length === 1) map[branchName] = unique[0];
      });
      return map;
    }, [brandList]);

    // Franchisee/manager scope is authoritative: account brand first, then the
    // single brand that owns the assigned branch. Never default to another brand.
    const ownBrandName = useMemo(() => {
      if (isAdmin) return "";
      const accountBrand = String(
        user?.brand || user?.brand_name || user?.brandName || "",
      ).trim();
      if (accountBrand) {
        const exact = brandList.find(
          (b) =>
            String(b.name || "")
              .trim()
              .toLowerCase() === accountBrand.toLowerCase(),
        );
        if (exact) return exact.name;
      }
      return branchToBrand[userBranch] || "";
    }, [isAdmin, user, brandList, branchToBrand, userBranch]);

    const [inventory, setInventory] = useState([]);
    const [stockItems, setStockItems] = useState([]);
    const [catalogStockItems, setCatalogStockItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterBrandName, setFilterBrandName] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [brandBranchFilter, setBrandBranchFilter] = useState({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [activeScreen, setActiveScreen] = useState(
      isAdmin ? "brands" : "inventory",
    );
    const [filterBrand, setFilterBrand] = useState(null);

    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [restoringId, setRestoringId] = useState(null);
    const [toast, setToast] = useState(null);
    const showToast = (type, title, message) =>
      setToast({ type, title, message });

    const [deleteHistory, setDeleteHistory] = useState([]);
    const [showDeleteHistory, setShowDeleteHistory] = useState(false);
    const [activityLog, setActivityLog] = useState([]);
    const [showActivityLog, setShowActivityLog] = useState(false);

    const [ingSearch, setIngSearch] = useState("");
    const [ingQty, setIngQty] = useState("1");
    const [ingUnit, setIngUnit] = useState("");
    const [ingPicked, setIngPicked] = useState(null);
    const [ingDropOpen, setIngDropOpen] = useState(false);
    const ingRef = useRef(null);

    const emptyForm = useCallback(
      () => ({
        name: "",
        category: "",
        branch: isAdmin ? "" : userBranch,
        branches: isAdmin ? [] : [userBranch],
        brand: "",
        cost: "",
        price: "",
        ingredients: [],
        image_url: "",
      }),
      [isAdmin, userBranch],
    );

    const excelRef = useRef(null);

    const [formData, setFormData] = useState(emptyForm);
    const [formBrandId, setFormBrandId] = useState("");

    const inventoryCategories = useMemo(() => {
      return [
        ...new Set(
          brandList.flatMap((b) => b.categories || []).filter(Boolean),
        ),
      ].sort();
    }, [brandList]);

    const formBrand = useMemo(() => {
      if (!formData.branch) return null;
      return brandList.find((b) =>
        (b.branches || []).some(
          (br) => (typeof br === "string" ? br : br.name) === formData.branch,
        ),
      );
    }, [formData.branch, brandList]);

    const [formCategories, setFormCategories] = useState([]);
    useEffect(() => {
      const cats = formBrand?.categories || inventoryCategories;
      setFormCategories(cats.length ? cats : []);
    }, [formBrand, inventoryCategories]);

    useEffect(() => {
      const fn = (e) => {
        if (ingRef.current && !ingRef.current.contains(e.target))
          setIngDropOpen(false);
      };
      document.addEventListener("mousedown", fn);
      return () => document.removeEventListener("mousedown", fn);
    }, []);

    const fetchInventory = useCallback(async (branch) => {
      setLoading(true);
      try {
        const q = branch ? `?branch=${encodeURIComponent(branch)}` : "";
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/inventory${q}`,
        );
        const d = await res.json();
        setInventory(Array.isArray(d) ? d : []);
      } catch {
        setInventory([]);
      } finally {
        setLoading(false);
      }
    }, []);

    const fetchStockItems = useCallback(async (branch, brand) => {
      try {
        const params = new URLSearchParams();
        if (branch) params.set("branch", branch);
        if (brand) params.set("brand", brand);
        const q = params.toString() ? `?${params.toString()}` : "";
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/ingredients${q}`,
        );
        const d = await res.json();
        setStockItems(Array.isArray(d) ? d : []);
      } catch {
        setStockItems([]);
      }
    }, []);

    const fetchCatalogStockItems = useCallback(async () => {
      try {
        const params = new URLSearchParams();
        if (!isAdmin && userBranch) params.set("branch", userBranch);
        if (!isAdmin && ownBrandName) params.set("brand", ownBrandName);
        const q = params.toString() ? `?${params.toString()}` : "";
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/ingredients${q}`,
        );
        const d = await res.json();
        setCatalogStockItems(
          Array.isArray(d) ? d.map(normalizeCatalogueStockItem) : [],
        );
      } catch {
        setCatalogStockItems([]);
      }
    }, [isAdmin, userBranch, ownBrandName]);

    const fetchDeleteHistory = useCallback(async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/inventory-delete-history`,
        );
        const data = await res.json();
        setDeleteHistory(
          Array.isArray(data)
            ? data.map((row) => ({
                id: row.id,
                inventory_data: row.inventory_data,
                ingredients_data: row.ingredients_data || [],
                deleted_at: row.deleted_at,
                deleted_by: row.deleted_by,
              }))
            : [],
        );
      } catch (err) {
        console.error("Failed to fetch inventory delete history:", err);
      }
    }, []);

    useEffect(() => {
      if (!formData.branch && !formBrandId) return;
      const brandObj = brandList.find(
        (b) => String(b.id) === String(formBrandId),
      );
      fetchStockItems(formData.branch, brandObj?.name || "");
    }, [formData.branch, formBrandId, brandList, fetchStockItems]);

    const fetchActivityLog = useCallback(async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/menu-activity-log`,
        );
        const data = await res.json();
        setActivityLog(
          Array.isArray(data)
            ? data.map((row) => ({
                id: row.id,
                action: row.action,
                itemName: row.item_name ?? row.itemName,
                performedBy: row.performed_by ?? row.performedBy,
                branch: row.branch,
                role: row.role,
                changes: row.changes,
                location: row.location,
                timestamp: row.created_at ?? row.timestamp,
              }))
            : [],
        );
      } catch (err) {
        console.error("Failed to fetch menu activity log:", err);
      }
    }, []);

    useEffect(() => {
      if (!isAdmin) {
        fetchInventory(userBranch);
        return;
      }
      fetchInventory();
    }, [isAdmin, userBranch, fetchInventory]);

    useEffect(() => {
      fetchStockItems(isAdmin ? "" : userBranch, isAdmin ? "" : ownBrandName);
      fetchCatalogStockItems();
    }, [
      isAdmin,
      userBranch,
      ownBrandName,
      fetchStockItems,
      fetchCatalogStockItems,
    ]);
    useEffect(() => {
      const refreshDirectCatalogue = () => fetchCatalogStockItems();
      window.addEventListener("focus", refreshDirectCatalogue);
      window.addEventListener(
        "stock-inventory-updated",
        refreshDirectCatalogue,
      );
      return () => {
        window.removeEventListener("focus", refreshDirectCatalogue);
        window.removeEventListener(
          "stock-inventory-updated",
          refreshDirectCatalogue,
        );
      };
    }, [fetchCatalogStockItems]);
    useEffect(() => {
      fetchDeleteHistory();
      fetchActivityLog();
    }, [fetchDeleteHistory, fetchActivityLog]);

    const refetch = () => fetchInventory(isAdmin ? undefined : userBranch);

    const inventoryForCatalogue = useMemo(() => {
      /*
      ONE SOURCE OF TRUTH FOR DIRECT PRODUCTS
      ---------------------------------------
      iFuel and iPharma products DO NOT come from /inventory anymore.
      Their Menu Inventory catalogue is generated directly from Stock Inventory
      (/ingredients), so the product list is always exactly the same.

      - Add in Stock Inventory    -> appears here automatically
      - Update stock/cost there   -> details update here automatically
      - Delete from Stock Inventory -> disappears here automatically
      - No separate recipe/menu product record is required for iFuel/iPharma
    */

      const regularMenuItems = inventory
        .map((item) => {
          const itemBrand =
            item.brand || branchToBrand[item.branch] || "Unassigned";

          // Ignore old/stale iFuel and iPharma records that may still exist in
          // the Menu Inventory table. Direct products are rendered ONLY from
          // Stock Inventory below.
          if (isDirectBrandName(itemBrand)) return null;

          const brandObj = brandList.find((b) => b.name === itemBrand);
          const activeBranches = (brandObj?.branches || []).map((br) =>
            typeof br === "string" ? br : br.name,
          );

          // Brand & Branch remains authoritative for normal menu items too.
          if (brandObj && !activeBranches.includes(item.branch)) return null;

          return { ...item, brand: itemBrand };
        })
        .filter(Boolean);

      const directStockProducts = catalogStockItems
        .map((stock) => {
          // Stored brand is authoritative. Only fall back to branch when the
          // branch belongs to exactly one brand. Head Office is commonly shared,
          // so it cannot cause Coffee Spot/iPharma/iFuel products to mix.
          const itemBrand =
            String(stock.brand || "").trim() ||
            branchToBrand[stock.branch] ||
            "Unassigned";
          if (!isDirectBrandName(itemBrand)) return null;

          const brandObj = brandList.find((b) => b.name === itemBrand);
          if (!brandObj) return null;

          const activeBranches = (brandObj.branches || [])
            .map((br) => (typeof br === "string" ? br : br?.name))
            .filter(Boolean);
          if (!activeBranches.includes(stock.branch)) return null;

          const activeCategories = getBrandCategories(brandObj);
          const storedCategory = String(stock.category || "").trim();
          const canonicalCategory = activeCategories.find(
            (cat) => cat.toLowerCase() === storedCategory.toLowerCase(),
          );
          const displayCategory =
            canonicalCategory ||
            storedCategory ||
            (activeCategories.length === 1
              ? activeCategories[0]
              : "Uncategorized");

          const cost = Number(stock.cost_per_unit || 0);
          const availableStock = Number(stock.stock || 0);
          const minStock = Number(stock.min_stock || 0);
          const productType = isFuelBrandName(itemBrand) ? "FUEL" : "DIRECT";

          return {
            id: `stock-${stock.id}`,
            source_stock_id: stock.id,
            source_type: "STOCK_INVENTORY",
            read_only_catalogue: true,

            name: stock.name,
            brand: itemBrand,
            branch: stock.branch,
            category: displayCategory,
            image_url: stock.image_url || "",
            unit: stock.unit || (isFuelBrandName(itemBrand) ? "liters" : "pcs"),

            cost,
            cost_per_unit: cost,
            price: computeDirectSellingPrice(cost),
            operations_markup: DIRECT_OPERATIONS_MARGIN,
            profit_markup: DIRECT_PROFIT_MARGIN,

            stock: availableStock,
            available_stock: availableStock,
            min_stock: minStock,
            is_low: availableStock <= minStock,
            product_type: productType,

            ingredients: [
              {
                stock_item_id: stock.id,
                name: stock.name,
                qty_required: 1,
                unit: stock.unit,
                cost_per_unit: cost,
                stock: availableStock,
                min_stock: minStock,
              },
            ],
          };
        })
        .filter(Boolean)
        .sort((a, b) => {
          const byBrand = String(a.brand || "").localeCompare(
            String(b.brand || ""),
          );
          if (byBrand !== 0) return byBrand;
          const byCategory = String(a.category || "").localeCompare(
            String(b.category || ""),
          );
          if (byCategory !== 0) return byCategory;
          return String(a.name || "").localeCompare(String(b.name || ""));
        });

      const combined = [...regularMenuItems, ...directStockProducts];
      if (isAdmin) return combined;

      return combined.filter((item) => {
        const sameBranch =
          String(item.branch || "")
            .trim()
            .toLowerCase() === userBranch.trim().toLowerCase();
        const itemBrand = String(
          item.brand || branchToBrand[item.branch] || "",
        ).trim();
        const sameBrand =
          !ownBrandName ||
          itemBrand.toLowerCase() === ownBrandName.toLowerCase();
        return sameBranch && sameBrand;
      });
    }, [
      inventory,
      branchToBrand,
      brandList,
      catalogStockItems,
      isAdmin,
      userBranch,
      ownBrandName,
    ]);

    const filteredItems = useMemo(() => {
      const q = searchQuery.toLowerCase();
      return inventoryForCatalogue
        .filter((i) => {
          const itemBrand = i.brand || branchToBrand[i.branch] || "Unassigned";
          if (filterBrandName && itemBrand !== filterBrandName) return false;
          if (
            q &&
            !i.name.toLowerCase().includes(q) &&
            !String(i.category || "")
              .toLowerCase()
              .includes(q) &&
            !String(i.branch || "")
              .toLowerCase()
              .includes(q)
          )
            return false;
          if (filterCategory && i.category !== filterCategory) return false;
          if (filterStatus === "low" && Number(i.stock) > Number(i.min_stock))
            return false;
          if (filterStatus === "ok" && Number(i.stock) <= Number(i.min_stock))
            return false;
          return true;
        })
        .sort((a, b) =>
          String(a.name || "").localeCompare(String(b.name || "")),
        );
    }, [
      inventoryForCatalogue,
      searchQuery,
      filterCategory,
      filterStatus,
      filterBrandName,
      branchToBrand,
    ]);

    const filteredCategories = useMemo(() => {
      if (filterBrandName) {
        const brand = brandList.find((b) => b.name === filterBrandName);
        return brand?.categories || [];
      }
      return [
        ...new Set(
          brandList.flatMap((b) => b.categories || []).filter(Boolean),
        ),
      ].sort();
    }, [filterBrandName, brandList]);

    const brandGroups = useMemo(() => {
      const map = {};
      filteredItems.forEach((item) => {
        const brandName =
          item.brand || branchToBrand[item.branch] || "Unassigned";
        if (!map[brandName]) map[brandName] = [];
        map[brandName].push(item);
      });
      let names = brandList.map((b) => b.name).filter((n) => map[n]);
      if (map["Unassigned"]) names.push("Unassigned");
      if (filterBrandName) names = names.filter((n) => n === filterBrandName);
      return names.map((name) => ({
        name,
        items: (map[name] || []).slice().sort((a, b) => {
          const byCategory = String(a.category || "").localeCompare(
            String(b.category || ""),
          );
          if (byCategory !== 0) return byCategory;
          return String(a.name || "").localeCompare(String(b.name || ""));
        }),
      }));
    }, [filteredItems, branchToBrand, brandList, filterBrandName]);

    const UNIT_GROUPS = {
      g: { base: "kg", factor: 0.001 },
      kg: { base: "kg", factor: 1 },
      ml: { base: "liters", factor: 0.001 },
      liters: { base: "liters", factor: 1 },
      pcs: { base: "pcs", factor: 1 },
    };

    function convertUnit(quantity, fromUnit, toUnit) {
      if (fromUnit === toUnit) return quantity;
      const from = UNIT_GROUPS[fromUnit];
      const to = UNIT_GROUPS[toUnit];
      if (!from || !to || from.base !== to.base) return quantity; // fail-safe: don't crash the form
      return (quantity * from.factor) / to.factor;
    }

    const currentFormBrandName =
      formData.brand || branchToBrand[formData.branch] || "";
    const directStockSource = useMemo(() => {
      if (!isDirectBrandName(currentFormBrandName) || !formData.name)
        return null;
      return (
        stockItems.find(
          (stock) =>
            normalizeName(stock.name) === normalizeName(formData.name) &&
            (!formData.branch || stock.branch === formData.branch),
        ) || null
      );
    }, [currentFormBrandName, formData.name, formData.branch, stockItems]);

    const computedCost = useMemo(() => {
      if (isDirectBrandName(currentFormBrandName)) {
        return Number(directStockSource?.cost_per_unit || 0);
      }
      if (!formData.ingredients || formData.ingredients.length === 0) return 0;
      return formData.ingredients.reduce((total, ing) => {
        const stock = stockItems.find((s) => s.id === ing.stock_item_id);
        if (!stock) return total;
        const qtyInStockUnit = convertUnit(
          parseFloat(ing.qty_required || 0),
          ing.unit,
          stock.unit,
        );
        return total + parseFloat(stock.cost_per_unit || 0) * qtyInStockUnit;
      }, 0);
    }, [
      formData.ingredients,
      stockItems,
      currentFormBrandName,
      directStockSource,
    ]);

    useEffect(() => {
      const cost = computedCost.toFixed(2);
      const numericCost = parseFloat(cost) || 0;
      const price =
        numericCost > 0
          ? isDirectBrandName(currentFormBrandName)
            ? computeDirectSellingPrice(numericCost).toFixed(2)
            : (numericCost * (1 + DEFAULT_PROFIT_MARGIN / 100)).toFixed(2)
          : "";
      setFormData((prev) => ({
        ...prev,
        cost,
        price,
        ...(isDirectBrandName(currentFormBrandName) && directStockSource
          ? {
              stock: Number(directStockSource.stock || 0),
              minStock: Number(directStockSource.min_stock || 0),
            }
          : {}),
      }));
    }, [computedCost, currentFormBrandName, directStockSource]);

    const handleAddItem = async (e) => {
      e.preventDefault();
      const targetBranches = isAdmin ? formData.branches || [] : [userBranch];
      const requestedBrand =
        formData.brand || branchToBrand[targetBranches[0]] || "";
      if (isDirectBrandName(requestedBrand)) {
        showToast(
          "info",
          "Use Stock Inventory",
          "Add iFuel and iPharma products in Stock Inventory. Menu Inventory mirrors them automatically.",
        );
        return;
      }

      const missing = [];
      if (!formData.name?.trim()) missing.push("Name");
      if (!formData.category?.trim()) missing.push("Category");
      if (isAdmin && targetBranches.length === 0)
        missing.push("At least one branch");
      if (!formData.brand?.trim()) missing.push("Brand");
      if (formData.cost === "" || formData.cost == null) missing.push("Cost");
      if (formData.price === "" || formData.price == null)
        missing.push("Price");
      if (!formData.image_url?.trim()) missing.push("Image");
      const directProduct = isDirectBrandName(requestedBrand);
      if (
        directProduct &&
        (formData.minStock === "" || formData.minStock == null)
      )
        missing.push("Min stock");
      if (!directProduct) {
        if (!formData.ingredients || formData.ingredients.length === 0) {
          missing.push("At least one ingredient");
        } else {
          const badIngredient = formData.ingredients.some(
            (ing) => !ing.stock_item_id || !ing.qty_required || !ing.unit,
          );
          if (badIngredient)
            missing.push("All ingredient fields (item, quantity, unit)");
        }
      } else if (!directStockSource) {
        missing.push("Matching Stock Inventory source");
      }

      if (missing.length > 0) {
        showToast("error", "Missing required fields", missing.join(", "));
        return;
      }

      setSaving(true);
      const coords = await getBrowserLocation();
      const results = [];

      for (const branch of targetBranches) {
        const duplicate = findDuplicate(formData.name, branch, inventory);
        if (duplicate) {
          results.push({
            ok: false,
            branch,
            reason: "already exists in this branch",
          });
          continue;
        }

        const payload = {
          ...formData,
          branch,
          min_stock: formData.minStock,
          performed_by: userName,
          performed_by_role: user?.role || "Unknown",
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          ...(directProduct
            ? {
                product_type: isFuelBrandName(formData.brand)
                  ? "FUEL"
                  : "DIRECT",
              }
            : {}),
        };

        try {
          const res = await fetch(
            `${process.env.REACT_APP_API_URL}/inventory`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            },
          );
          const d = await res.json();
          if (d.success) {
            if (
              !directProduct &&
              formData.ingredients &&
              formData.ingredients.length > 0
            ) {
              const ingRes = await fetch(
                `${process.env.REACT_APP_API_URL}/inventory/${d.item.id}/ingredients`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ingredients: formData.ingredients.map((ing) => ({
                      ingredient_id: ing.stock_item_id,
                      quantity: ing.qty_required,
                      unit: ing.unit,
                    })),
                  }),
                },
              );
              const ingData = await ingRes.json();
              if (!ingData.success) {
                results.push({
                  ok: false,
                  branch,
                  reason: "ingredients failed to save",
                });
                continue;
              }
            }
            results.push({ ok: true, branch });
          } else {
            results.push({
              ok: false,
              branch,
              reason: d.error || "failed to save",
            });
          }
        } catch {
          results.push({ ok: false, branch, reason: "connection error" });
        }
      }

      await refetch();
      await fetchActivityLog();
      setSaving(false);

      const succeeded = results.filter((r) => r.ok);
      const failed = results.filter((r) => !r.ok);

      if (succeeded.length > 0 && failed.length === 0) {
        setShowAddModal(false);
        setFormData(emptyForm());
        setFormBrandId("");
        resetIngPicker();
        showToast(
          "success",
          "Item added",
          succeeded.length === 1
            ? `"${formData.name}" was added to ${succeeded[0].branch}.`
            : `"${formData.name}" was added to ${succeeded.length} branches.`,
        );
      } else if (succeeded.length > 0 && failed.length > 0) {
        setShowAddModal(false);
        setFormData(emptyForm());
        setFormBrandId("");
        resetIngPicker();
        showToast(
          "info",
          "Added with some skips",
          `Added to ${succeeded.length} branch${succeeded.length === 1 ? "" : "es"}. Skipped: ${failed.map((f) => `${f.branch} (${f.reason})`).join(", ")}`,
        );
      } else {
        showToast(
          "error",
          "Failed to add item",
          failed.map((f) => `${f.branch}: ${f.reason}`).join("; ") ||
            "Something went wrong.",
        );
      }
    };

    const handleEditItem = async (e) => {
      e.preventDefault();
      const originalBranch = editingItem.branch;
      const selectedBranches = isAdmin ? formData.branches || [] : [userBranch];

      if (isAdmin && !selectedBranches.includes(originalBranch)) {
        showToast(
          "error",
          "Please fix the following",
          "The current branch can't be removed.",
        );
        return;
      }

      const directProduct = isDirectBrandName(
        formData.brand || branchToBrand[originalBranch] || "",
      );
      const otherItems = inventory.filter((i) => i.id !== editingItem.id);
      const duplicate = findDuplicate(
        formData.name,
        originalBranch,
        otherItems,
      );
      if (duplicate) {
        showToast(
          "error",
          "Duplicate item",
          `"${duplicate.name}" already exists in this branch.`,
        );
        return;
      }

      setSaving(true);
      const coords = await getBrowserLocation();
      const payload = {
        ...formData,
        branch: originalBranch,
        min_stock: formData.minStock,
        performed_by: userName,
        performed_by_role: user?.role || "Unknown",
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        ...(directProduct
          ? {
              product_type: isFuelBrandName(formData.brand) ? "FUEL" : "DIRECT",
            }
          : {}),
      };

      let editSucceeded = false;

      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/inventory/${editingItem.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        const d = await res.json();
        if (d.success) {
          if (!directProduct) {
            const ingRes = await fetch(
              `${process.env.REACT_APP_API_URL}/inventory/${editingItem.id}/ingredients`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ingredients: (formData.ingredients || []).map((ing) => ({
                    ingredient_id: ing.stock_item_id,
                    quantity: ing.qty_required,
                    unit: ing.unit,
                  })),
                }),
              },
            );
            const ingData = await ingRes.json();
            if (!ingData.success) {
              setSaving(false);
              showToast(
                "error",
                "Ingredients not saved",
                ingData.error ||
                  "The item was updated but its ingredients failed to save.",
              );
              return;
            }
          }
          editSucceeded = true;
        }
      } catch {}

      if (!editSucceeded) {
        setSaving(false);
        showToast(
          "error",
          "Failed to update item",
          "Something went wrong. Please try again.",
        );
        return;
      }

      /* Fan out to newly-selected additional branches */
      const extraBranches = selectedBranches.filter(
        (b) => b !== originalBranch,
      );
      const results = [];

      for (const branch of extraBranches) {
        const duplicateInBranch = findDuplicate(
          formData.name,
          branch,
          inventory,
        );
        if (duplicateInBranch) {
          results.push({
            ok: false,
            branch,
            reason: "already exists in this branch",
          });
          continue;
        }

        const extraPayload = {
          ...formData,
          branch,
          min_stock: formData.minStock,
          performed_by: userName,
          performed_by_role: user?.role || "Unknown",
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          ...(directProduct
            ? {
                product_type: isFuelBrandName(formData.brand)
                  ? "FUEL"
                  : "DIRECT",
              }
            : {}),
        };

        try {
          const res = await fetch(
            `${process.env.REACT_APP_API_URL}/inventory`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(extraPayload),
            },
          );
          const d = await res.json();
          if (d.success) {
            if (
              !directProduct &&
              formData.ingredients &&
              formData.ingredients.length > 0
            ) {
              await fetch(
                `${process.env.REACT_APP_API_URL}/inventory/${d.item.id}/ingredients`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ingredients: formData.ingredients.map((ing) => ({
                      ingredient_id: ing.stock_item_id,
                      quantity: ing.qty_required,
                      unit: ing.unit,
                    })),
                  }),
                },
              );
            }
            results.push({ ok: true, branch });
          } else {
            results.push({
              ok: false,
              branch,
              reason: d.error || "failed to save",
            });
          }
        } catch {
          results.push({ ok: false, branch, reason: "connection error" });
        }
      }

      await refetch();
      await fetchActivityLog();
      setSaving(false);
      setShowEditModal(false);
      setEditingItem(null);
      setFormData(emptyForm());
      setFormBrandId("");
      resetIngPicker();

      const succeeded = results.filter((r) => r.ok);
      const failed = results.filter((r) => !r.ok);

      if (extraBranches.length === 0) {
        showToast("success", "Item updated", `"${formData.name}" was saved.`);
      } else if (failed.length === 0) {
        showToast(
          "success",
          "Item updated",
          `"${formData.name}" updated, and added to ${succeeded.length} more branch${succeeded.length === 1 ? "" : "es"}.`,
        );
      } else {
        showToast(
          "info",
          "Updated with some skips",
          `"${formData.name}" was updated. ${succeeded.length} additional branch${succeeded.length === 1 ? "" : "es"} added, ${failed.length} skipped: ${failed.map((f) => `${f.branch} (${f.reason})`).join(", ")}`,
        );
      }
    };

    const handleDeleteItem = async (id) => {
      setDeletingId(id);
      try {
        const coords = await getBrowserLocation();
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/inventory/${id}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              deleted_by: userName,
              performed_by_role: user?.role || "Unknown",
              latitude: coords?.latitude,
              longitude: coords?.longitude,
            }),
          },
        );
        const d = await res.json();
        if (d.success) {
          await refetch();
          await fetchDeleteHistory();
          await fetchActivityLog();
          showToast("success", "Item deleted", "The item was removed.");
        } else
          showToast(
            "error",
            "Failed to delete",
            d.error || "Something went wrong.",
          );
      } catch {
        showToast(
          "error",
          "Failed to delete",
          "Something went wrong. Please try again.",
        );
      } finally {
        setDeletingId(null);
      }
    };

    const handleRestore = async (entry) => {
      setRestoringId(entry.id);
      try {
        const d = entry.inventory_data;
        const ings = entry.ingredients_data || [];
        const coords = await getBrowserLocation();

        const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: d.name,
            category: d.category,
            branch: d.branch,
            brand: d.brand,
            stock: d.stock,
            min_stock: d.min_stock,
            cost: d.cost,
            price: d.price,
            performed_by: userName,
            performed_by_role: user?.role || "Unknown",
            latitude: coords?.latitude,
            longitude: coords?.longitude,
            restored: true,
          }),
        });
        const result = await res.json();
        if (result.success) {
          if (ings.length > 0) {
            await fetch(
              `${process.env.REACT_APP_API_URL}/inventory/${result.item.id}/ingredients`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ingredients: ings.map((ing) => ({
                    ingredient_id: ing.stock_item_id,
                    quantity: ing.qty_required,
                    unit: ing.unit,
                  })),
                }),
              },
            );
          }
          await fetch(
            `${process.env.REACT_APP_API_URL}/inventory-delete-history/${entry.id}`,
            { method: "DELETE" },
          );
          await refetch();
          await fetchDeleteHistory();
          await fetchActivityLog();
          showToast(
            "success",
            "Item restored",
            `"${d.name}" is back with ${ings.length} ingredient(s).`,
          );
        } else
          showToast(
            "error",
            "Failed to restore",
            result.error || "Something went wrong.",
          );
      } catch {
        showToast(
          "error",
          "Failed to restore",
          "Something went wrong. Please try again.",
        );
      } finally {
        setRestoringId(null);
      }
    };

    const openEditModal = (item) => {
      if (item?.read_only_catalogue || isDirectBrandName(item?.brand)) {
        showToast(
          "info",
          "Managed in Stock Inventory",
          "iFuel and iPharma product records are edited from Stock Inventory only.",
        );
        return;
      }
      setEditingItem(item);
      const branch = item.branch;
      const brandForItem = filterBrandName || branchToBrand[item.branch] || "";
      setFormData({
        name: item.name,
        category: item.category,
        branch,
        branches: [branch],
        brand: brandForItem,
        cost: item.cost || "",
        price: item.price,
        stock: item.stock ?? item.available_stock ?? 0,
        minStock: item.min_stock ?? 0,
        image_url: item.image_url || "",
        ingredients: (item.ingredients || []).map((ing) => ({
          stock_item_id: ing.stock_item_id || ing.id,
          name: ing.name,
          qty_required: ing.qty_required,
          unit: ing.unit,
        })),
      });
      const brandObj = brandList.find((b) => b.name === brandForItem);
      setFormBrandId(brandObj ? String(brandObj.id) : "");
      fetchStockItems(branch, brandForItem);
      setShowEditModal(true);
    };

    const openAddModal = () => {
      const branch = isAdmin ? "Head Office" : userBranch;
      const brandName = selectedBrandObj ? selectedBrandObj.name : "";
      setFormData({ ...emptyForm(), branch, brand: brandName });
      fetchStockItems(branch, brandName);
      setFormBrandId(selectedBrandObj ? String(selectedBrandObj.id) : "");
      setShowAddModal(true);
    };

    const handleInputChange = (e) => {
      let { name, value } = e.target;
      if (name === "name")
        value = value.replace(/\b\w/g, (c) => c.toUpperCase());
      setFormData((p) => ({ ...p, [name]: value }));
    };

    const resetIngPicker = () => {
      setIngSearch("");
      setIngQty("1");
      setIngUnit("");
      setIngPicked(null);
      setIngDropOpen(false);
    };

    const addIngredient = () => {
      if (!ingPicked) return;
      if (
        (formData.ingredients || []).find(
          (x) => x.stock_item_id === ingPicked.id,
        )
      ) {
        showToast(
          "error",
          "Already linked",
          "This stock item is already linked to the product.",
        );
        return;
      }
      setFormData((f) => ({
        ...f,
        ingredients: [
          ...(f.ingredients || []),
          {
            stock_item_id: ingPicked.id,
            name: ingPicked.name,
            qty_required: parseFloat(ingQty) || 1,
            unit: ingUnit || ingPicked.unit,
          },
        ],
      }));
      resetIngPicker();
    };

    const removeIngredient = (idx) =>
      setFormData((f) => ({
        ...f,
        ingredients: f.ingredients.filter((_, i) => i !== idx),
      }));
    const updateIngQty = (idx, qty) =>
      setFormData((f) => ({
        ...f,
        ingredients: f.ingredients.map((ing, i) =>
          i === idx ? { ...ing, qty_required: parseFloat(qty) || 0 } : ing,
        ),
      }));

    const ingFiltered = stockItems.filter((s) => {
      if (ingSearch && !s.name.toLowerCase().includes(ingSearch.toLowerCase()))
        return false;

      if (formData.branch) return s.branch === formData.branch;

      // No branch chosen yet (e.g. admin hasn't picked one) — fall back to brand.
      const brandName = formBrandId
        ? brandList.find((b) => String(b.id) === String(formBrandId))?.name
        : filterBrandName || "";
      if (brandName) return s.brand === brandName;

      return true;
    });

    const importExcel = (e) => {
      const file = e.target.files[0];
      const toTitleCase = (str) => str.replace(/\b\w/g, (c) => c.toUpperCase());
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const wb = XLSX.read(ev.target.result, { type: "array" });
        const items = [];
        wb.SheetNames.forEach((sheetName) => {
          const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {
            defval: "",
          });
          rows.forEach((row) => {
            const name = toTitleCase(
              String(row.name || row.Name || row["ITEM NAME"] || "").trim(),
            );
            if (!name) return;
            const category = toTitleCase(
              String(row.category || row.Category || "Other").trim(),
            );
            const cost = parseFloat(row.cost || row.Cost || 0) || 0;
            const rawPrice = parseFloat(row.price || row.Price || 0) || 0;
            const price =
              rawPrice > 0
                ? rawPrice
                : cost > 0
                  ? parseFloat((cost * 1.4).toFixed(2))
                  : 0;
            const stock = parseInt(row.stock || row.Stock || 0) || 0;
            const minStock =
              parseInt(row.min_stock || row["Min Stock"] || 0) || 0;
            const branch = String(row.branch || row.Branch || "").trim();
            const rawIng = String(
              row.ingredients || row.Ingredients || "",
            ).trim();
            const ingredients = rawIng
              ? rawIng
                  .split("|")
                  .map((seg) => {
                    const [ingName, qty, unit] = seg
                      .split(":")
                      .map((s) => s.trim());
                    return ingName
                      ? {
                          name: ingName,
                          qty_required: parseFloat(qty) || 1,
                          unit: unit || "",
                        }
                      : null;
                  })
                  .filter(Boolean)
              : [];
            items.push({
              name,
              category,
              branch: branch || "Unknown",
              cost,
              stock,
              min_stock: minStock,
              price,
              ingredients,
            });
          });
        });

        let currentInventory = [...inventory];
        let saved = 0,
          skipped = 0;
        const skippedNames = [];

        for (const item of items) {
          const combined = [...currentInventory];
          const duplicate = findDuplicate(item.name, item.branch, combined);
          if (duplicate) {
            skipped++;
            skippedNames.push(`${item.name} (${item.branch})`);
            continue;
          }

          try {
            const { ingredients, ...itemData } = item;
            const res = await fetch(
              `${process.env.REACT_APP_API_URL}/inventory`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(itemData),
              },
            );
            const d = await res.json();
            if (d.success) {
              saved++;
              currentInventory.push({ ...itemData, id: d.item.id });
              if (ingredients.length > 0) {
                const ingPayload = ingredients
                  .map((ing) => {
                    const match = stockItems.find(
                      (s) =>
                        s.name.toLowerCase() === ing.name.toLowerCase() &&
                        s.branch === itemData.branch,
                    );
                    return match
                      ? {
                          ingredient_id: match.id,
                          quantity: ing.qty_required,
                          unit: ing.unit || match.unit,
                        }
                      : null;
                  })
                  .filter(Boolean);
                if (ingPayload.length > 0) {
                  await fetch(
                    `${process.env.REACT_APP_API_URL}/inventory/${d.item.id}/ingredients`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ ingredients: ingPayload }),
                    },
                  );
                }
              }
            }
          } catch {}
        }

        e.target.value = "";
        const details =
          skipped > 0
            ? `Saved ${saved} item(s). Skipped ${skipped} duplicate(s): ${skippedNames.join(", ")}`
            : `Saved ${saved} item(s).`;
        showToast("success", "Import complete", details);
        await refetch();
        await fetchActivityLog();
      };
      reader.readAsArrayBuffer(file);
    };

    const renderIngredientPicker = () => (
      <div
        style={{
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: "14px 16px",
          marginTop: 4,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: C.muted,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            marginBottom: 10,
          }}
        >
          Ingredients Required
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 90px 90px auto",
            gap: 8,
            marginBottom: 10,
          }}
        >
          <div ref={ingRef} style={{ position: "relative" }}>
            <input
              style={invInputSt}
              value={ingSearch}
              onChange={(e) => {
                setIngSearch(e.target.value);
                setIngPicked(null);
                setIngDropOpen(true);
              }}
              onFocus={() => setIngDropOpen(true)}
              placeholder="Search stock ingredient…"
            />
            {ingDropOpen && ingFiltered.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 3px)",
                  left: 0,
                  right: 0,
                  zIndex: 500,
                  background: C.white,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  boxShadow: "0 6px 20px rgba(0,0,0,0.10)",
                  maxHeight: 160,
                  overflowY: "auto",
                }}
              >
                {ingFiltered.map((s) => (
                  <div
                    key={s.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setIngPicked(s);
                      setIngSearch(s.name);
                      setIngUnit(s.unit);
                      setIngDropOpen(false);
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = C.bg)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontSize: 12,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontWeight: 600, color: C.ink }}>
                      {s.name}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: C.muted,
                        background: C.greenLt,
                        padding: "2px 8px",
                        borderRadius: 20,
                      }}
                    >
                      {s.unit} · {s.branch}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <input
            type="number"
            style={invInputSt}
            value={ingQty}
            min="0"
            step="any"
            onChange={(e) => setIngQty(e.target.value)}
            placeholder="Qty"
          />
          <select
            style={invInputSt}
            value={ingUnit}
            onChange={(e) => setIngUnit(e.target.value)}
          >
            <option value="">unit</option>
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addIngredient}
            style={{
              ...btnPrimarySt,
              height: 38,
              padding: "0 14px",
              flexShrink: 0,
            }}
          >
            <PlusIcon /> Add
          </button>
        </div>
        {!formData.ingredients || formData.ingredients.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "12px 0",
              color: C.muted,
              fontSize: 12,
              fontStyle: "italic",
            }}
          >
            No ingredients linked yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {formData.ingredients.map((ing, idx) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 100px 70px auto",
                  gap: 8,
                  alignItems: "center",
                  background: C.white,
                  border: `1px solid ${C.border}`,
                  borderRadius: 9,
                  padding: "8px 12px",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>
                  {ing.name}
                </span>
                <input
                  type="number"
                  value={ing.qty_required}
                  min="0"
                  step="any"
                  onChange={(e) => updateIngQty(idx, e.target.value)}
                  style={{ ...invInputSt, textAlign: "center" }}
                />
                <select
                  value={ing.unit}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      ingredients: f.ingredients.map((row, i) =>
                        i === idx ? { ...row, unit: e.target.value } : row,
                      ),
                    }))
                  }
                  style={{
                    ...invInputSt,
                    height: 28,
                    fontSize: 11,
                    padding: "0 8px",
                  }}
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeIngredient(idx)}
                  style={{
                    ...smallBtnSt,
                    height: 28,
                    width: 28,
                    justifyContent: "center",
                    border: "1px solid #fecaca",
                    color: C.red,
                    flexShrink: 0,
                  }}
                >
                  <XIcon size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );

    const renderFormFields = () => {
      const currentBrandName =
        formData.brand || selectedBrandObj?.name || filterBrandName || "";
      const directProduct = isDirectBrandName(currentBrandName);
      const directSource = directStockSource;

      return (
        <>
          <div style={{ marginBottom: 13 }}>
            <label style={invLabelSt}>Item Name</label>
            {directProduct ? (
              showAddModal ? (
                <select
                  value={directStockSource?.id || ""}
                  onChange={(e) => {
                    const source = stockItems.find(
                      (stock) => String(stock.id) === String(e.target.value),
                    );
                    if (!source) {
                      setFormData((prev) => ({
                        ...prev,
                        name: "",
                        cost: "",
                        price: "",
                        stock: 0,
                        minStock: 0,
                      }));
                      return;
                    }
                    setFormData((prev) => ({
                      ...prev,
                      name: source.name,
                      branch: source.branch || prev.branch,
                      category:
                        String(source.category || "").trim() ||
                        (getBrandCategories(selectedBrandObj).length === 1
                          ? getBrandCategories(selectedBrandObj)[0]
                          : ""),
                      stock: Number(source.stock || 0),
                      minStock: Number(source.min_stock || 0),
                    }));
                  }}
                  style={invInputSt}
                >
                  <option value="">Select Stock Inventory product…</option>
                  {stockItems
                    .filter((stock) =>
                      isDirectBrandName(stock.brand || currentBrandName),
                    )
                    .map((stock) => (
                      <option key={stock.id} value={stock.id}>
                        {stock.name} ({stock.branch})
                      </option>
                    ))}
                </select>
              ) : (
                <div
                  style={{
                    ...invInputSt,
                    height: "auto",
                    minHeight: 38,
                    padding: "9px 12px",
                    background: "#f5f5f5",
                    color: C.ink,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {formData.name || "—"}
                </div>
              )
            ) : (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                style={invInputSt}
                placeholder="Product name"
              />
            )}
          </div>
          <div style={{ marginBottom: 13 }}>
            <label style={invLabelSt}>Product Image</label>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  placeholder="Paste image URL or upload below…"
                  value={formData.image_url || ""}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, image_url: e.target.value }))
                  }
                  style={invInputSt}
                />
              </div>
              <label style={{ ...btnSt, cursor: "pointer", flexShrink: 0 }}>
                <FileIcon size={13} /> Upload
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.append("image", file);
                    try {
                      const res = await fetch(
                        `${process.env.REACT_APP_API_URL}/api/upload-menu-image`,
                        {
                          method: "POST",
                          body: fd,
                        },
                      );
                      const d = await res.json();
                      if (d.url)
                        setFormData((p) => ({ ...p, image_url: d.url }));
                      else
                        showToast(
                          "error",
                          "Upload failed",
                          "The product image could not be uploaded.",
                        );
                    } catch {
                      showToast(
                        "error",
                        "Upload failed",
                        "The product image could not be uploaded.",
                      );
                    }
                  }}
                />
              </label>
            </div>

            {formData.image_url && (
              <div
                style={{
                  marginTop: 8,
                  position: "relative",
                  display: "inline-block",
                }}
              >
                <img
                  src={formData.image_url}
                  alt="preview"
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    borderRadius: 10,
                    border: `1px solid ${C.border}`,
                  }}
                  onError={(e) => (e.target.style.display = "none")}
                />
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, image_url: "" }))}
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    border: "none",
                    background: C.red,
                    color: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  <XIcon size={9} />
                </button>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 13 }}>
            <label style={invLabelSt}>Brand</label>
            <div
              style={{
                ...invInputSt,
                height: "auto",
                padding: "9px 12px",
                background: "#f5f5f5",
                color: C.muted,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
              }}
            >
              {currentBrandName || "—"}
            </div>
          </div>

          {isAdmin ? (
            <div style={{ marginBottom: 13 }}>
              <label style={invLabelSt}>
                Branches *{" "}
                <span style={{ fontWeight: 400, color: C.muted }}>
                  (select one or more)
                </span>
              </label>
              {(() => {
                const selectedBrandObjForBranch = brandList.find(
                  (b) => b.name === formData.brand,
                );
                const filteredBranches = selectedBrandObjForBranch
                  ? (selectedBrandObjForBranch.branches || []).map((br) =>
                      typeof br === "string" ? br : br.name,
                    )
                  : [];
                if (!formData.brand) {
                  return (
                    <div
                      style={{
                        ...invInputSt,
                        height: "auto",
                        padding: "9px 12px",
                        background: "#f5f5f5",
                        color: C.muted,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      Select a brand first…
                    </div>
                  );
                }
                if (filteredBranches.length === 0) {
                  return (
                    <div
                      style={{
                        ...invInputSt,
                        height: "auto",
                        padding: "9px 12px",
                        background: "#f5f5f5",
                        color: C.muted,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      No branches found for this brand.
                    </div>
                  );
                }
                const lockedBranch = showEditModal ? editingItem?.branch : null;
                const currentBranches = formData.branches || [];
                const allSelected = filteredBranches.every((br) =>
                  currentBranches.includes(br),
                );
                return (
                  <div
                    style={{
                      border: `1.5px solid ${C.border}`,
                      borderRadius: 11,
                      padding: "8px 4px",
                      maxHeight: 180,
                      overflowY: "auto",
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 10px",
                        cursor: "pointer",
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: C.greenDk,
                        borderBottom: `1px solid ${C.border}`,
                        marginBottom: 4,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) =>
                          setFormData((f) => ({
                            ...f,
                            branches: e.target.checked
                              ? filteredBranches
                              : lockedBranch
                                ? [lockedBranch]
                                : [],
                          }))
                        }
                      />
                      Select all branches
                    </label>
                    {filteredBranches.map((br) => {
                      const locked = br === lockedBranch;
                      return (
                        <label
                          key={br}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "6px 10px",
                            cursor: locked ? "default" : "pointer",
                            fontSize: 13,
                            color: C.ink,
                            opacity: locked ? 0.75 : 1,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={currentBranches.includes(br)}
                            disabled={locked}
                            onChange={(e) =>
                              setFormData((f) => ({
                                ...f,
                                branches: e.target.checked
                                  ? [...(f.branches || []), br]
                                  : (f.branches || []).filter((x) => x !== br),
                                branch: f.branch || br,
                              }))
                            }
                          />
                          {br}
                          {locked && (
                            <span
                              style={{
                                fontSize: 10.5,
                                fontWeight: 700,
                                color: C.greenDk,
                                marginLeft: 4,
                              }}
                            >
                              (current — can't remove)
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                );
              })()}
              {(formData.branches || []).length > 0 && (
                <div style={{ fontSize: 11, color: C.muted, marginTop: 5 }}>
                  {showEditModal
                    ? formData.branches.length === 1
                      ? "Only updating the current branch."
                      : `Updating "${editingItem?.branch}" and adding this item to ${formData.branches.length - 1} more branch${formData.branches.length - 1 === 1 ? "" : "es"}: ${formData.branches.filter((b) => b !== editingItem?.branch).join(", ")}`
                    : `Will add this item to ${formData.branches.length} branch${formData.branches.length === 1 ? "" : "es"}: ${formData.branches.join(", ")}`}
                </div>
              )}
            </div>
          ) : (
            <div style={{ marginBottom: 13 }}>
              <label style={invLabelSt}>Branch</label>
              <div
                style={{
                  ...invInputSt,
                  height: "auto",
                  padding: "9px 12px",
                  background: "#f5f5f5",
                  color: C.muted,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {userBranch || "—"}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 13 }}>
            <label style={invLabelSt}>Category</label>
            {directProduct ? (
              <div
                style={{
                  ...invInputSt,
                  height: "auto",
                  minHeight: 38,
                  padding: "9px 12px",
                  background: "#f5f5f5",
                  color: C.muted,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {formData.category || "Uncategorized"}
              </div>
            ) : (
              <CategorySelect
                value={formData.category}
                onChange={(val) =>
                  setFormData((p) => ({ ...p, category: val }))
                }
                categories={formCategories}
                onAddCategory={(cat) =>
                  setFormCategories((prev) =>
                    prev.includes(cat) ? prev : [...prev, cat],
                  )
                }
              />
            )}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: directProduct ? "1fr 1fr 1fr" : "1fr 1fr",
              gap: 10,
              marginBottom: 13,
            }}
          >
            <div>
              <label style={invLabelSt}>Product Cost (₱)</label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                readOnly
                style={{ ...invInputSt, background: "#f5f5f5", color: C.muted }}
              />
            </div>
            {directProduct && (
              <div>
                <label style={invLabelSt}>Operations Markup (%)</label>
                <input
                  type="number"
                  value={DIRECT_OPERATIONS_MARGIN}
                  readOnly
                  disabled
                  style={{
                    ...invInputSt,
                    background: "#f5f5f5",
                    color: C.muted,
                    cursor: "not-allowed",
                  }}
                />
              </div>
            )}
            <div>
              <label style={invLabelSt}>Profit Markup (%)</label>
              <input
                type="number"
                value={
                  directProduct ? DIRECT_PROFIT_MARGIN : DEFAULT_PROFIT_MARGIN
                }
                readOnly
                disabled
                style={{
                  ...invInputSt,
                  background: "#f5f5f5",
                  color: C.muted,
                  cursor: "not-allowed",
                }}
              />
            </div>
          </div>
          {formData.cost !== "" && parseFloat(formData.cost) > 0 && (
            <div
              style={{
                background: C.greenLt,
                border: `1px solid ${C.greenMid}`,
                borderRadius: 9,
                padding: "9px 13px",
                marginBottom: 13,
                fontSize: 12,
                display: "flex",
                gap: 8,
                alignItems: "center",
                color: C.ok,
                flexWrap: "wrap",
              }}
            >
              {directProduct ? (
                <>
                  Cost: <strong>{fmtPeso(formData.cost)}</strong> +{" "}
                  <strong>{DIRECT_OPERATIONS_MARGIN}% operations</strong> +{" "}
                  <strong>{DIRECT_PROFIT_MARGIN}% profit</strong> = Auto selling
                  price:{" "}
                  <strong style={{ color: C.green, fontSize: 13 }}>
                    {fmtPeso(formData.price)}
                  </strong>
                </>
              ) : (
                <>
                  Cost: <strong>{fmtPeso(formData.cost)}</strong> +{" "}
                  <strong>{DEFAULT_PROFIT_MARGIN}%</strong> = Selling price:{" "}
                  <strong style={{ color: C.green, fontSize: 13 }}>
                    {fmtPeso(formData.price)}
                  </strong>
                </>
              )}
            </div>
          )}
          <div style={{ marginBottom: 13 }}>
            <label style={invLabelSt}>
              {directProduct ? "Auto Selling Price (₱)" : "Selling Price (₱)"}
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={directProduct ? undefined : handleInputChange}
              readOnly={directProduct}
              step="0.01"
              min="0"
              style={{
                ...invInputSt,
                ...(directProduct
                  ? { background: "#f5f5f5", color: C.greenDk, fontWeight: 800 }
                  : {}),
              }}
              placeholder="Auto-calc"
            />
          </div>
          <div style={{ marginBottom: 13 }}>
            <label style={invLabelSt}>
              {directProduct ? "Stock Inventory Source" : "Ingredients"}
            </label>
            {directProduct ? (
              <div
                style={{
                  background: C.greenLt,
                  border: `1px solid ${C.greenMid}`,
                  borderRadius: 12,
                  padding: "13px 14px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                <PackageCheck
                  size={17}
                  color={C.greenDk}
                  style={{ marginTop: 1, flexShrink: 0 }}
                />
                <div>
                  <div
                    style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}
                  >
                    {directSource?.name || formData.name || "Linked stock item"}
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: C.muted,
                      lineHeight: 1.5,
                      marginTop: 3,
                    }}
                  >
                    {isPharmaBrandName(currentBrandName)
                      ? "Automatically linked to Stock Inventory. Cost and availability sync from batches, and completed sales deduct the earliest-expiring valid batch using FEFO."
                      : "Automatically linked to Stock Inventory. Cost and availability sync from fuel deliveries, and completed sales deduct FIFO delivery layers for costing using liter quantities."}
                  </div>
                </div>
              </div>
            ) : (
              renderIngredientPicker()
            )}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 8,
              paddingTop: 14,
              borderTop: `1px solid ${C.border}`,
            }}
          >
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                setFormData(emptyForm());
                setFormBrandId("");
                resetIngPicker();
              }}
              style={{
                ...btnSt,
                opacity: saving ? 0.5 : 1,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                ...btnPrimarySt,
                opacity: saving ? 0.6 : 1,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving && (
                <RefreshCw
                  size={13}
                  style={{ animation: "spin 0.8s linear infinite" }}
                />
              )}
              {saving ? (showEditModal ? "Saving…" : "Adding…") : "Save Item"}
            </button>
          </div>
        </>
      );
    };

    const selectedBrandObj =
      brandList.find((b) => b.id === filterBrand) || null;
    const currentCardDeleteHistory = useMemo(() => {
      const selectedBrandName = filterBrandName || selectedBrandObj?.name || "";
      const branchNames = new Set(
        (selectedBrandObj?.branches || []).map((br) =>
          typeof br === "string" ? br : br.name,
        ),
      );
      return deleteHistory.filter((entry) => {
        const d = entry?.inventory_data || {};
        if (selectedBrandName && d.brand === selectedBrandName) return true;
        if (selectedBrandName && d.branch && branchNames.has(d.branch))
          return true;
        if (!selectedBrandName && userBranch && d.branch === userBranch)
          return true;
        return false;
      });
    }, [deleteHistory, filterBrandName, selectedBrandObj, userBranch]);
    const anyFilter =
      filterBrandName || filterCategory || filterStatus || searchQuery;
    const clearAll = () => {
      setFilterBrandName("");
      setFilterCategory("");
      setFilterStatus("");
      setSearchQuery("");
    };

    const goBackToBrands = () => {
      setActiveScreen("brands");
      setFilterBrand(null);
      setFilterBrandName("");
      setBranchFilter("");
    };

    const openBrand = (brandId) => {
      const brandObj = brandList.find((b) => b.id === brandId);
      setFilterBrand(brandId);
      setFilterBrandName(brandObj ? brandObj.name : "");
      setBranchFilter("");
      setActiveScreen("inventory");
    };

    const fontImport = (
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes toastIn { from{opacity:0;transform:translateY(-6px);} to{opacity:1;transform:translateY(0);} }
    .inv-row:hover td { background: #F6F7F1 !important; }
    .edit-btn:hover  { background: ${C.greenLt} !important; color: ${C.greenDk} !important; }
    .del-btn:hover   { background: #fef2f2 !important; color: ${C.red} !important; }
    button:not(:disabled) { transition: filter .15s ease, transform .1s ease, background .15s ease, border-color .15s ease, box-shadow .15s ease; cursor: pointer; }
    button:not(:disabled):hover { filter: brightness(0.96); }
    button:not(:disabled):active { transform: translateY(1px); }
    select, input { transition: border-color .15s ease, box-shadow .15s ease; }
    select:hover:not(:disabled), input:hover:not(:disabled) { border-color: ${C.green} !important; }
    select:focus, input:focus, textarea:focus { border-color: ${C.green} !important; box-shadow: 0 0 0 3px rgba(59,121,30,0.12); }
  `}</style>
    );

    const branchOptionsForCard =
      isAdmin && selectedBrandObj
        ? (selectedBrandObj.branches || []).map((br) =>
            typeof br === "string" ? br : br.name,
          )
        : [];

    // ── Screen 1: Brand cards ─────────────────────────────────────────────────────
    if (activeScreen === "brands" && isAdmin) {
      return (
        <div style={{ fontFamily: FONT, color: C.ink }}>
          {fontImport}

          {loading && brandList.length === 0 ? (
            <div
              style={{
                padding: "52px 0",
                textAlign: "center",
                color: C.muted,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              Loading brands…
            </div>
          ) : brandList.length === 0 ? (
            <div
              style={{
                padding: "52px 0",
                textAlign: "center",
                color: C.muted,
                fontSize: 13,
                fontStyle: "italic",
              }}
            >
              No brands found.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                gap: 14,
              }}
            >
              {brandList.map((b) => {
                const branchNames = (b.branches || []).map((br) =>
                  typeof br === "string" ? br : br.name,
                );
                const brandItems = inventoryForCatalogue.filter(
                  (i) =>
                    (i.brand || branchToBrand[i.branch]) === b.name &&
                    branchNames.includes(i.branch),
                );
                return (
                  <BrandOverviewCard
                    key={b.id}
                    brand={b}
                    branchCount={branchNames.length}
                    itemCount={brandItems.length}
                    lowCount={
                      brandItems.filter(
                        (i) => Number(i.stock) <= Number(i.min_stock),
                      ).length
                    }
                    onClick={() => openBrand(b.id)}
                  />
                );
              })}
            </div>
          )}

          <Toast toast={toast} onClose={() => setToast(null)} />
        </div>
      );
    }

    // ── Screen 2: Row-list card (scoped to selected brand for admins) ─────────────
    return (
      <div style={{ fontFamily: FONT, color: C.ink }}>
        {fontImport}

        {loading ? (
          <div
            style={{
              padding: "52px 0",
              textAlign: "center",
              color: C.muted,
              fontSize: 14,
              fontWeight: 700,
              background: C.white,
              borderRadius: 18,
              border: `1px solid ${C.border}`,
            }}
          >
            Loading inventory…
          </div>
        ) : (
          <MenuBrandCard
            key={filterBrandName || "all"}
            brandName={filterBrandName || "All Items"}
            items={filteredItems}
            branchOptions={branchOptionsForCard}
            categories={filteredCategories}
            onEdit={openEditModal}
            onRequestDelete={setDeleteTarget}
            deletingId={deletingId}
            onQuickAdd={() => {
              const brandName = filterBrandName || "";
              const branch = isAdmin ? "" : userBranch;
              setFormData({
                ...emptyForm(),
                branch,
                branches: isAdmin ? [] : [userBranch],
                brand: brandName,
              });
              fetchStockItems(branch, brandName);
              setFormBrandId(filterBrand ? String(filterBrand) : "");
              setShowAddModal(true);
            }}
            onBack={isAdmin ? goBackToBrands : null}
            onOpenDeleteHistory={() => setShowDeleteHistory(true)}
            deleteHistoryCount={currentCardDeleteHistory.length}
            onImportExcel={importExcel}
            excelRef={excelRef}
          />
        )}

        {deleteTarget && !deleteTarget.read_only_catalogue && (
          <DeleteConfirmModal
            target={{
              name: deleteTarget.name,
              branch: deleteTarget.branch,
              ingredientCount: (deleteTarget.ingredients || []).length,
            }}
            deleting={deletingId === deleteTarget.id}
            onClose={() => {
              if (deletingId !== deleteTarget.id) setDeleteTarget(null);
            }}
            onConfirm={async () => {
              await handleDeleteItem(deleteTarget.id);
              setDeleteTarget(null);
            }}
          />
        )}

        {/* Add / Edit Modal */}
        {(showAddModal || showEditModal) && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(18,36,27,0.32)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAddModal(false);
                setShowEditModal(false);
                setFormData(emptyForm());
                resetIngPicker();
              }
            }}
          >
            <div
              style={{
                background: C.white,
                borderRadius: 18,
                padding: "26px 26px 20px",
                width: 540,
                maxWidth: "95vw",
                maxHeight: "93vh",
                overflowY: "auto",
                boxShadow: "0 12px 48px rgba(0,0,0,0.16)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 800,
                    color: C.ink,
                  }}
                >
                  {showAddModal ? "Add New Menu Item" : "Edit Menu Item"}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setFormData(emptyForm());
                    setFormBrandId("");
                    resetIngPicker();
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: C.muted,
                    padding: 4,
                  }}
                >
                  <XIcon size={18} />
                </button>
              </div>
              <form
                noValidate
                onSubmit={showAddModal ? handleAddItem : handleEditItem}
              >
                {renderFormFields()}
              </form>
            </div>
          </div>
        )}

        {showDeleteHistory && (
          <InventoryDeleteHistoryPanel
            history={currentCardDeleteHistory}
            onRestore={handleRestore}
            restoringId={restoringId}
            onClose={() => setShowDeleteHistory(false)}
          />
        )}

        {showActivityLog && (
          <InventoryActivityLogPanel
            log={activityLog}
            onClose={() => setShowActivityLog(false)}
          />
        )}

        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    );
  }

  return MenuInventoryContent;
})();

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
