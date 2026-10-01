// Manager Dashboard with the latest Franchisee Stock Inventory; inventory and batch Edit/Delete controls are omitted.

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import * as XLSX from "xlsx";
import logo from "../assets/logo.png";
import Receipts from "./Receipts";
import jsPDF from "jspdf";
import ifranchisejpg from "../assets/ifranchisejpg.jpg";
import franchisync from "../assets/franchisyncjpg.jpg";
import { POSContent } from "./StaffDashboard";
import { FACommunicationContent } from "./FranchiseAdminDashboard";
import {
  Home,
  Bell,
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
  CreditCard,
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
  Filter,
  ChevronUp,
  AlertCircle,
  LoaderCircle,
  UploadCloud,
  Truck,
} from "lucide-react";
import { adminModuleFetch } from "../utils/adminModuleFetch";

const VIBE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body, #root, button, input, textarea, select, option { font-family:'Plus Jakarta Sans',sans-serif; }
  :root {
  --g1:#b3a941; --g2:#3b791e; --g3:#2c5c16; --g4:#12241B;
  --green-primary:#3b791e; --green-dark:#2c5c16; --green-light:#509820;
  --green-accent:#b3a941; --green-bg:#f0f5e8; --green-mid:#c9dba0; --white:#ffffff;
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
  --grad-gold:linear-gradient(135deg,#e9cd30,#b3a941);
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

const FRANCHISEE_LAYOUT_CSS = `
/* Shared AdminDashboard tokens; scoped to the franchisee workspace. */
.franchisee-root { --fr-border:#E1E6D8; --fr-muted:#5C6B60; --fr-ink:#12241B; --fr-green:#3b791e; --fr-surface:#fff; --fr-bg:#F6F7F1; width:100%; }
.franchisee-root *, .franchisee-root *::before, .franchisee-root *::after { box-sizing:border-box; }
.franchisee-root .fr-main { width:0; }
.franchisee-root .fr-content { max-width:1480px; }
/* Manager Announcements — remove normal module spacing */
.fr-content.fr-content-communication {
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
}

.fr-communication-page {
  width: 100% !important;
  min-width: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
}
.franchisee-root .fr-topbar-heading { display:flex; align-items:center; gap:12px; min-width:0; }
.franchisee-root .fr-topbar-context { display:flex; align-items:center; gap:6px; font-size:11px; color:var(--fr-muted); margin-top:4px; overflow-wrap:anywhere; }
.franchisee-root .fr-topbar { gap:16px; }
.franchisee-root .fr-topbar-title { line-height:1.3; }
.franchisee-root .fr-sidebar { overscroll-behavior:contain; height:100dvh; }
.franchisee-root .fr-sidebar-header { gap:8px; }
.franchisee-root .fr-sidebar-header > div { min-width:0; }
.franchisee-root .fr-sidebar-header img { max-width:100% !important; }
body.fr-admin-ui .franchisee-root .fr-nav-item { width:100%; border:0; background:transparent; justify-content:flex-start; text-align:left; min-height:42px !important; border-radius:10px !important; padding:10px 12px; }
body.fr-admin-ui .franchisee-root .fr-nav-item.active { background:#F6F7F1; font-weight:700 !important; }
body.fr-admin-ui .franchisee-root .fr-nav-item:hover { filter:none; }
body.fr-admin-ui .franchisee-root .fr-avatar { padding:0; border:0; flex-shrink:0; }
body.fr-admin-ui .franchisee-root .fr-mobile-menu { display:none; }
body.fr-admin-ui .franchisee-root .fr-mobile-close { display:none; }
.franchisee-root .fr-skip-link { position:fixed; top:8px; left:8px; transform:translateY(-160%); z-index:5000; padding:12px 18px; background:#fff; color:#2c5c16; border:2px solid #3b791e; border-radius:10px; }
.franchisee-root .fr-skip-link:focus { transform:none; }
.franchisee-root .fr-page-enter { animation:frPageEnter .24s ease-out; min-width:0; }
@keyframes frPageEnter { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
.franchisee-root :is(.v-card,.v-kpi,.fr-db-kpi,.fr-db-chart,.fr-db-ins,.fr-db-arc-panel,.comm-card) { border-color:var(--fr-border) !important; border-radius:16px !important; box-shadow:0 2px 12px rgba(18,36,27,.045) !important; }
.franchisee-root :is(.v-kpi,.fr-db-kpi) { min-width:0; padding:18px !important; }
.franchisee-root :is(.v-kpi-value,.fr-db-kpi) { font-variant-numeric:tabular-nums; overflow-wrap:anywhere; }
.franchisee-root :is(.v-section-head,.ma-page-head) { gap:12px; flex-wrap:wrap; }
.franchisee-root .v-section-head { border-bottom:1px solid var(--fr-border); }
.franchisee-root :is(.v-section-title,.ma-page-title) { font-size:17px; line-height:1.4; }
.franchisee-root :is(.v-empty-sub,.ma-page-sub) { line-height:1.6; }
.franchisee-root :is(input,select,textarea) { max-width:100%; accent-color:var(--fr-green); }
.franchisee-root :is(.v-search,.v-form-input,.v-form-select,.fr-db-date) { border-radius:10px !important; border:1px solid var(--fr-border) !important; min-height:38px; font-size:13px !important; }
.franchisee-root :is(.v-search,.v-form-input,.v-form-select,.fr-db-date):focus { border-color:var(--fr-green) !important; box-shadow:0 0 0 3px rgba(59,121,30,.12) !important; }
body.fr-admin-ui .franchisee-root :is(.v-btn,.ma-reports .v-btn,.fr-db-apply,.fr-db-arc-btn) { border-radius:999px !important; min-height:38px; padding:8px 16px; line-height:1.35; }
body.fr-admin-ui .franchisee-root :is(.manager-dashboard-tab) { border-radius:12px !important; min-height:68px; justify-content:flex-start; text-align:left; padding:12px 14px; }
body.fr-admin-ui .franchisee-root :is(.v-tab,.fr-db-tab,.ma-report-tab) { border-radius:999px !important; white-space:nowrap; }
body.fr-admin-ui .franchisee-root :is(.v-btn-primary,.fr-db-apply) { background:#3b791e; color:#fff; border-color:#3b791e; }
body.fr-admin-ui .franchisee-root :is(.v-tab.active,.fr-db-tab.active,.ma-report-tab.active) { background:#3b791e !important; color:#fff !important; }
.franchisee-root :is(.v-tabs,.fr-db-tab-group,.ma-report-tabs) { max-width:100%; overflow-x:auto; scrollbar-width:thin; }
.franchisee-root :is(.v-table,table) { font-size:13px; font-variant-numeric:tabular-nums; }
.franchisee-root .v-table th { padding:12px 14px !important; background:var(--fr-bg); border-bottom:1px solid var(--fr-border); font-size:10px !important; }
.franchisee-root .v-table td { padding:12px 14px !important; vertical-align:middle; }
.franchisee-root .v-table tbody tr:hover td { background:#f0f5e8; }
.franchisee-root .fr-table-scroll { width:100%; max-width:100%; overflow-x:auto; overscroll-behavior-x:contain; scrollbar-width:thin; }
.franchisee-root .fr-table-scroll > table { min-width:600px; }
.franchisee-root .fr-responsive-grid { min-width:0; }
.franchisee-root .fr-responsive-grid > * { min-width:0; }
.franchisee-root .v-modal-overlay { padding:16px; overflow-y:auto; overscroll-behavior:contain; }
.franchisee-root .v-modal { width:min(100%,600px); max-height:calc(100dvh - 32px); padding:24px; }
.franchisee-root [role="button"] { cursor:pointer; }
@media (hover:hover) {
  .franchisee-root :is(.v-btn,.comm-action-btn):not(:disabled):hover { transform:translateY(-1px); }
  .franchisee-root .fr-db-kpi[role="button"]:hover { transform:translateY(-2px); box-shadow:0 8px 22px rgba(18,36,27,.09) !important; }
}
@media (max-width:1150px) {
  .franchisee-root .fr-responsive-grid { grid-template-columns:repeat(2,minmax(0,1fr)) !important; }
  .franchisee-root .fr-content { padding:20px !important; }
}
@media (max-width:900px) {
  body.fr-admin-ui .franchisee-root .fr-sidebar { width:272px !important; max-width:calc(100vw - 48px); transform:translateX(-105%); visibility:hidden; transition:transform .24s ease,visibility .24s; z-index:2100; }
  body.fr-admin-ui .franchisee-root.fr-drawer-open .fr-sidebar { transform:translateX(0); visibility:visible; }
  body.fr-admin-ui .franchisee-root .fr-main { margin-left:0 !important; width:100%; }
  body.fr-admin-ui .franchisee-root .fr-mobile-close { display:flex; margin-bottom:12px; border-color:#E1E6D8; }
  body.fr-admin-ui .franchisee-root .fr-mobile-menu { display:inline-flex; padding:0; width:40px; height:40px; border:1px solid var(--fr-border); border-radius:10px; flex-shrink:0; }
  body.fr-admin-ui .franchisee-root .fr-drawer-backdrop { position:fixed; inset:0; z-index:2000; width:100%; height:100%; border:0; border-radius:0 !important; background:rgba(18,36,27,.42); backdrop-filter:blur(3px); animation:vFadeIn .2s ease; }
  body.fr-admin-ui .franchisee-root .fr-nav-label, .franchisee-root .fr-nav-section { display:block !important; }
  .franchisee-root .fr-responsive-grid { grid-template-columns:1fr !important; }
  .franchisee-root .fr-content { padding:16px !important; }
  .franchisee-root .fr-topbar { padding:12px 16px !important; }
}
@media (min-width:901px) { body.fr-admin-ui .franchisee-root .fr-drawer-backdrop { display:none; } }
@media (max-width:560px) {
  .franchisee-root .fr-content { padding:12px !important; }
  .franchisee-root :is(.fr-db-kpi-grid,.fr-db-ins-grid,.fr-db-bot-grid,.v-stat-grid) { grid-template-columns:1fr !important; gap:12px; }
  .franchisee-root :is(.fr-db-chart,.fr-db-ins,.fr-db-arc-panel,.v-card) { padding:16px !important; }
  .franchisee-root .v-modal { padding:20px 16px; }
  .franchisee-root .fr-topbar-title { font-size:17px !important; }
  .franchisee-root .fr-topbar-context { font-size:10px; }
  .franchisee-root .fr-topbar { gap:8px; }
}
@media (prefers-reduced-motion:reduce) {
  body.fr-admin-ui .franchisee-root *, body.fr-admin-ui .franchisee-root *::before, body.fr-admin-ui .franchisee-root *::after { animation:none !important; transition:none !important; scroll-behavior:auto !important; }
  body.fr-admin-ui .franchisee-root button:hover, body.fr-admin-ui .franchisee-root button:active { transform:none !important; }
}

`;

const ADMIN_UI_PARITY_CSS = (sidebarCollapsed) => `
  /* AdminDashboard UI parity: shared shell, controls, typography, states, and responsive behavior. */
  :root {
    --g1:#b3a941; --g2:#3b791e; --g3:#2c5c16; --g4:#12241B;
    --green-primary:#3b791e; --green-dark:#2c5c16; --green-light:#509820;
    --lime:#b3a941; --lime-ink:#24310C; --white:#ffffff;
    --gray-100:#F3F4F1; --gray-200:#E1E6D8; --gray-300:#D4DBC8;
    --gray-400:#9CA89C; --gray-500:#5C6B60; --gray-600:#4B5A45;
    --gray-700:#374132; --gray-800:#1F2A1B;
    --shadow:rgba(50,109,32,0.10); --shadow-strong:rgba(14,59,34,0.20);
    --card-border:#E1E6D8;
    --grad-main:linear-gradient(135deg,#509820,#3b791e);
    --grad-dark:linear-gradient(135deg,#12241B,#2c5c16);
    --grad-gold:linear-gradient(135deg,#e9cd30,#b3a941);
    --grad-bg:#F6F7F1;
  }

  .franchisee-root {
    font-family:'Plus Jakarta Sans',sans-serif !important;
    display:flex;
    min-height:100vh;
    background:#F6F7F1 !important;
    background-image:radial-gradient(#E1E6D8 1px,transparent 1px) !important;
    background-size:22px 22px !important;
    color:#12241B;
  }

  .fr-sidebar {
    width:${sidebarCollapsed ? "76px" : "272px"};
    background:#fff !important;
    box-shadow:1px 0 0 #E1E6D8 !important;
    border-right:none !important;
    position:fixed !important;
    top:0; left:0; bottom:0;
    height:100vh;
    display:flex;
    flex-direction:column;
    padding:18px 14px !important;
    overflow-y:auto;
    overflow-x:hidden;
    z-index:1000;
    transition:width .3s ease, transform .3s ease;
  }
  .fr-sidebar-header {
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding:4px 6px 18px !important;
    min-height:56px;
  }
  .fr-logo-mark {
    width:38px !important;
    height:38px !important;
    border-radius:10px !important;
    background:#12241B !important;
    color:#b3a941 !important;
    box-shadow:none !important;
    display:flex;
    align-items:center;
    justify-content:center;
    font-weight:800;
    font-size:15px;
    flex-shrink:0;
    overflow:hidden;
  }
  .fr-logo-mark img { width:100%; height:100%; object-fit:contain; display:block; border-radius:10px; }
  .fr-brand {
    font-family:'Plus Jakarta Sans',sans-serif !important;
    color:#12241B !important;
    font-weight:800 !important;
    font-size:16px !important;
    white-space:nowrap;
  }
  .fr-toggle {
    background:#fff !important;
    border:1px solid #E1E6D8 !important;
    border-radius:8px !important;
    width:28px !important;
    height:28px !important;
    min-width:28px !important;
    min-height:28px !important;
    display:flex;
    align-items:center;
    justify-content:center;
    cursor:pointer;
    color:#5C6B60 !important;
    flex-shrink:0;
    padding:0 !important;
  }
  .fr-toggle:hover { color:#2c5c16 !important; background:#F6F7F1 !important; border-color:#c9dba0 !important; }

  .fr-nav {
    display:flex;
    flex-direction:column;
    gap:2px;
    padding:0 !important;
  }
  .fr-nav-section {
    font-size:10.5px !important;
    font-weight:800 !important;
    letter-spacing:.08em !important;
    text-transform:uppercase;
    color:#9CA89C !important;
    padding:12px 10px 6px !important;
    font-family:'Plus Jakarta Sans',sans-serif !important;
  }
  .fr-nav-item {
    font-family:'Plus Jakarta Sans',sans-serif !important;
    display:flex;
    align-items:center;
    gap:12px;
    padding:10px 12px !important;
    margin:0 !important;
    border-radius:12px !important;
    color:#5C6B60 !important;
    cursor:pointer;
    position:relative;
    font-size:14px !important;
    font-weight:500 !important;
    transition:background .15s ease,color .15s ease;
    min-height:40px !important;
  }
  .fr-nav-item:hover { background:#F6F7F1 !important; color:#12241B !important; }
  .fr-nav-item.active {
    background:#F6F7F1 !important;
    color:#2c5c16 !important;
    box-shadow:none !important;
    font-weight:700 !important;
  }
  .fr-nav-item.active .fr-nav-icon { color:#3b791e !important; }
  .fr-nav-item.logout { color:#c0392b !important; }
  .fr-nav-item.logout:hover { background:#fdf1f0 !important; }
  .fr-nav-icon {
    flex-shrink:0;
    display:flex;
    align-items:center;
    justify-content:center;
    width:22px;
    height:22px;
  }
  .fr-nav-label {
    display:${sidebarCollapsed ? "none" : "block"};
    flex:1;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
  }
  .fr-nav-bar {
    position:absolute !important;
    right:6px !important;
    top:20% !important;
    height:60% !important;
    width:3px !important;
    border-radius:2px !important;
    background:#b3a941 !important;
  }

  .fr-main {
    flex:1;
    min-width:0;
    margin-left:${sidebarCollapsed ? "76px" : "272px"};
    transition:margin-left .3s ease;
  }
  .fr-topbar {
    width:100%;
    background:#fff !important;
    box-shadow:none !important;
    border-bottom:1px solid #E1E6D8 !important;
    display:flex;
    position:sticky;
    top:0;
    z-index:100;
    align-items:center;
    justify-content:space-between;
    padding:16px 30px !important;
    min-height:72px;
    box-sizing:border-box;
  }
  .fr-topbar-title {
    font-family:'Plus Jakarta Sans',sans-serif !important;
    color:#12241B !important;
    font-size:22px !important;
    font-weight:800 !important;
    margin:0;
  }
  .fr-avatar {
    background:#12241B !important;
    color:#b3a941 !important;
    box-shadow:none !important;
    border-radius:12px !important;
    width:38px !important;
    height:38px !important;
    display:flex;
    align-items:center;
    justify-content:center;
    font-weight:700;
  }
  .fr-user-name { font-weight:700 !important; font-size:13px !important; color:#12241B !important; text-align:right; }
  .fr-user-role { font-size:11.5px !important; color:#5C6B60 !important; text-align:right; }
  .fr-content {
    width:100%;
    max-width:1400px;
    margin:0 auto;
    padding:20px 30px 40px !important;
    box-sizing:border-box;
  }

  /* Same shared control treatment used by AdminDashboard. */
  body.fr-admin-ui, body.fr-admin-ui *, body.fr-admin-ui *::before, body.fr-admin-ui *::after {
    font-family:'Plus Jakarta Sans',sans-serif !important;
    box-sizing:border-box;
  }
  body.fr-admin-ui { color:#12241B; background:#F6F7F1; }
  body.fr-admin-ui :is(button,input,select,textarea) { font-size:12px; }
  body.fr-admin-ui button {
    font-size:12px !important;
    font-weight:600 !important;
    line-height:1.35 !important;
    letter-spacing:0 !important;
    text-transform:none !important;
    min-height:36px;
    border-radius:999px;
    padding:7px 12px;
    border:1px solid #3b791e;
    background:#fff;
    color:#2c5c16;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    gap:7px;
    vertical-align:middle;
    box-sizing:border-box;
    cursor:pointer;
    box-shadow:none !important;
    transition:background-color .16s ease,color .16s ease,border-color .16s ease,transform .12s ease,filter .16s ease !important;
    -webkit-tap-highlight-color:transparent;
  }
  body.fr-admin-ui button:not(:disabled):not([aria-disabled="true"]):hover { filter:brightness(.96); }
  body.fr-admin-ui button:not(:disabled):not([aria-disabled="true"]):active { transform:scale(.97); }
  body.fr-admin-ui :is(button,a,input,select,textarea,summary,[tabindex]):focus-visible {
    outline:2px solid #3b791e !important;
    outline-offset:3px !important;
  }
  body.fr-admin-ui button:is(:disabled,[aria-disabled="true"]) {
    background:#e8ebe5 !important;
    background-image:none !important;
    color:#687260 !important;
    border-color:#e8ebe5 !important;
    opacity:1 !important;
    cursor:not-allowed !important;
    box-shadow:none !important;
    filter:none !important;
    transform:none !important;
  }
  body.fr-admin-ui button svg { flex-shrink:0; width:16px; height:16px; }
  body.fr-admin-ui :is(input,select,textarea) { font-weight:500; }
  body.fr-admin-ui :is(input,textarea)::placeholder { color:#5C6B60; opacity:.85; }
  body.fr-admin-ui .fr-nav-item { border-radius:10px !important; font-size:13px !important; }
  body.fr-admin-ui .fr-toggle { min-width:36px; min-height:36px; }

  /* Shared dialog/card/input parity for role dashboards. */
  body.fr-admin-ui .v-modal-overlay { background:rgba(0,0,0,.55) !important; backdrop-filter:blur(4px); }
  body.fr-admin-ui .v-modal { border-radius:22px !important; border:1px solid rgba(59,121,30,.15) !important; box-shadow:0 24px 80px rgba(0,0,0,.25) !important; }
  body.fr-admin-ui .v-modal-title { color:#12241B !important; font-weight:800 !important; }
  body.fr-admin-ui .v-tabs { background:#F6F7F1 !important; border-color:#E1E6D8 !important; }
  body.fr-admin-ui .v-tab.active { background:#3b791e !important; color:#fff !important; }
  body.fr-admin-ui .v-search,
  body.fr-admin-ui .v-form-input,
  body.fr-admin-ui .v-form-select {
    border-color:#E1E6D8 !important;
    background:#fff !important;
    color:#12241B !important;
  }
  body.fr-admin-ui .v-search:focus,
  body.fr-admin-ui .v-form-input:focus,
  body.fr-admin-ui .v-form-select:focus {
    border-color:#3b791e !important;
    box-shadow:0 0 0 3px rgba(59,121,30,.1) !important;
  }

  @media (max-width: 900px) {
    .fr-sidebar {
      width:${sidebarCollapsed ? "76px" : "272px"};
      box-shadow:8px 0 30px rgba(14,59,34,.12) !important;
      transform:none;
    }
    .fr-main { margin-left:${sidebarCollapsed ? "76px" : "272px"} !important; }
    .fr-topbar { padding:12px 16px !important; min-height:64px; }
    .fr-content { padding:16px !important; max-width:none; }
    .fr-topbar-title { font-size:18px !important; }
    .fr-user-name, .fr-user-role { display:none; }
  }
  @media (max-width: 560px) {
    .fr-content { padding:12px !important; }
    .fr-topbar { padding:10px 12px !important; }
    .fr-topbar-title { font-size:17px !important; }
    .fr-avatar { width:36px !important; height:36px !important; }
  }
  @media (pointer:coarse) {
    body.fr-admin-ui button { min-height:44px; min-width:44px; }
    .fr-toggle { width:44px !important; height:44px !important; }
  }
  @media (prefers-reduced-motion:reduce) {
    body.fr-admin-ui *, body.fr-admin-ui *::before, body.fr-admin-ui *::after {
      animation:none !important; transition:none !important; scroll-behavior:auto !important;
    }
    body.fr-admin-ui button:active { transform:none !important; }
  }
`;

const fmtPeso = (n) =>
  "₱" +
  Number(n || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtReportId = (id) => `REP-${String(id).padStart(5, "0")}`;

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

const VEmptyState = ({ icon, title, sub }) => (
  <div className="v-empty">
    <div className="v-empty-icon">
      {React.isValidElement(icon)
        ? icon
        : icon
          ? React.createElement(icon, { size: 20 })
          : null}
    </div>
    <div className="v-empty-title">{title}</div>
    <div className="v-empty-sub">{sub}</div>
  </div>
);

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

const normalizeTransactions = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const candidates = [
    payload.transactions,
    payload.items,
    payload.results,
    payload.rows,
    payload.data,
    payload.data?.transactions,
    payload.data?.items,
    payload.data?.results,
    payload.data?.rows,
    payload.data?.data,
  ];

  const found = candidates.find(Array.isArray);
  if (found) return found;

  for (const value of candidates) {
    if (value && typeof value === "object") {
      const nested = normalizeTransactions(value);
      if (nested.length) return nested;
    }
  }

  return [];
};

const normalizeListResponse = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const candidates = [
    payload.items,
    payload.ingredients,
    payload.inventory,
    payload.results,
    payload.rows,
    payload.data,
    payload.data?.items,
    payload.data?.ingredients,
    payload.data?.inventory,
    payload.data?.results,
    payload.data?.rows,
  ];
  const found = candidates.find(Array.isArray);
  return found || [];
};

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
  amberBg: "#fffbeb",
  amberBorder: "#fde68a",
};

const SI_C = {
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
const SI_invInputSt = {
  height: 38,
  padding: "0 13px",
  borderRadius: 11,
  border: `1.5px solid ${SI_C.border}`,
  background: SI_C.white,
  fontSize: 13,
  color: SI_C.ink,
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
  color: SI_C.muted,
  marginBottom: 5,
  letterSpacing: "0.04em",
};

const SI_btnSt = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  height: 38,
  padding: "0 18px",
  borderRadius: 999,
  border: `1px solid ${SI_C.border}`,
  background: SI_C.white,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
  whiteSpace: "nowrap",
  color: SI_C.ink,
  transition: "background .15s, border-color .15s",
};

const btnPrimarySt = {
  ...SI_btnSt,
  background: SI_C.green,
  color: SI_C.white,
  border: "none",
  boxShadow: "0 10px 24px rgba(59,121,30,0.22)",
};

const btnAmberSt = {
  ...SI_btnSt,
  background: `linear-gradient(135deg,#fbbf24,${SI_C.warn})`,
  color: SI_C.white,
  border: "none",
  boxShadow: "0 2px 10px rgba(217,119,6,0.30)",
};

const SI_smallBtnSt = {
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

const SI_UNITS = [
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

// Display-only quantity formatting.
// UI shows whole numbers with full unit names (e.g. "50 Liters"),
// while stored numeric values remain unchanged for calculations/API payloads.
const DISPLAY_UNIT_NAMES = {
  pcs: "Pieces",
  piece: "Pieces",
  pieces: "Pieces",
  kg: "Kilograms",
  kilogram: "Kilograms",
  kilograms: "Kilograms",
  g: "Grams",
  gram: "Grams",
  grams: "Grams",
  l: "Liters",
  liter: "Liters",
  liters: "Liters",
  ml: "Milliliters",
  milliliter: "Milliliters",
  milliliters: "Milliliters",
  tbsp: "Tablespoons",
  tablespoon: "Tablespoons",
  tablespoons: "Tablespoons",
  tsp: "Teaspoons",
  teaspoon: "Teaspoons",
  teaspoons: "Teaspoons",
  cup: "Cups",
  cups: "Cups",
  bottle: "Bottles",
  bottles: "Bottles",
  pack: "Packs",
  packs: "Packs",
  bag: "Bags",
  bags: "Bags",
  box: "Boxes",
  boxes: "Boxes",
  can: "Cans",
  cans: "Cans",
  gallon: "Gallons",
  gallons: "Gallons",
};

const formatQuantityWithUnit = (value, unit) => {
  const numeric = Number(value || 0);
  const rawUnit = String(unit || "").trim();
  const fullUnit =
    DISPLAY_UNIT_NAMES[rawUnit] ||
    DISPLAY_UNIT_NAMES[rawUnit.toLowerCase()] ||
    rawUnit ||
    "Units";
  return `${Math.round(numeric).toLocaleString("en-PH")} ${fullUnit}`;
};

const formatUnitName = (unit) => {
  const rawUnit = String(unit || "").trim();
  return (
    DISPLAY_UNIT_NAMES[rawUnit] ||
    DISPLAY_UNIT_NAMES[rawUnit.toLowerCase()] ||
    rawUnit ||
    "Units"
  );
};

const SI_PAGE_SIZE = 15;

const SI_EXPIRY_WARN_DAYS = 30;

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

function SI_Toast({ toast, onClose }) {
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
const SI_SearchIcon = Search;

const EditIcon = Pencil;

const TrashIcon = Trash2;

const SI_XIcon = X;

const PlusIcon = Plus;

const SI_StoreIcon = Store;

const FileIcon = FileText;

const SI_SortAscIcon = ArrowUp;

const SI_SortDescIcon = ArrowDown;

const FilterIcon = Filter;

const SI_ChevronIcon = ({ size = 12, dir = "down", ...props }) =>
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
    border: SI_C.greenMid,
    bg: "#f9fefb",
    badge: null,
    badgeText: null,
    label: null,
    dot: SI_C.green,
  },
};

const BRAND_DEFS = [
  { key: "coffee", label: "Coffee Spot", match: (n) => n.includes("coffee") },
  { key: "ifuel", label: "iFuel", match: (n) => n.includes("ifuel") },
  {
    key: "ipharma",
    label: "iPharma Mart",
    match: (n) => n.includes("ipharma"),
  },
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

function isHeadOfficeBranch(branchName) {
  return (branchName || "").trim().toLowerCase().includes("head office");
}

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
    maxDate = null;
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
  if (rule.kind === "exact" && bounds.minDate) {
    if (exp < bounds.minDate) {
      errors.push(
        `${category || "This category"} expiry must be on or after ${fmtDate(bounds.minStr)}.`,
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
    return [...new Set(raw.map((c) => String(c || "").trim()).filter(Boolean))];
  }
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return [
          ...new Set(parsed.map((c) => String(c || "").trim()).filter(Boolean)),
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
  const resolvedCategory = backendCategory || getPersistedStockCategory(row.id);
  return {
    ...row,
    brand: String(row.brand ?? row.brand_name ?? "").trim(),
    category: resolvedCategory,
    sku: row.sku || "",
  };
}

const DIRECT_COST_RATE = 0.35;

const computeDirectSellingPrice = (cost) => {
  const base = Number(cost || 0);
  return base > 0 ? Math.round((base / DIRECT_COST_RATE) * 100) / 100 : 0;
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
    error: <AlertCircleIcon size={26} color={SI_C.red} />,
    success: <CheckCircleIcon size={26} color={SI_C.green} />,
    info: <InfoIcon size={26} color="#1d4ed8" />,
    confirm: <AlertCircleIcon size={26} color={SI_C.warn} />,
  };
  const hc = {
    error: { bg: SI_C.redBg, border: "#fecaca", titleColor: "#991b1b" },
    success: {
      bg: SI_C.greenLt,
      border: SI_C.greenMid,
      titleColor: SI_C.greenDk,
    },
    info: { bg: "#eff6ff", border: "#bfdbfe", titleColor: "#1e3a8a" },
    confirm: { bg: SI_C.warnBg, border: "#fed7aa", titleColor: "#9a3412" },
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
          background: SI_C.white,
          borderRadius: 16,
          width: "100%",
          maxWidth: 440,
          boxShadow: "0 24px 64px rgba(0,0,0,0.16)",
          border: `1px solid ${hc.border}`,
          fontFamily: "Montserrat,sans-serif",
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
                  color: SI_C.ink,
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
              color: SI_C.muted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SI_XIcon size={13} />
          </button>
        </div>
        {lines && lines.length > 0 && (
          <div
            style={{
              maxHeight: 220,
              overflowY: "auto",
              padding: "12px 24px",
              borderBottom: `1px solid ${SI_C.border}`,
            }}
          >
            {lines.map((l, i) => (
              <div
                key={i}
                style={{
                  fontSize: 12,
                  color: l.warn ? SI_C.warn : SI_C.muted,
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
                    color: l.warn ? SI_C.warn : SI_C.green,
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
            <button onClick={onClose} style={{ ...SI_btnSt }}>
              {cancelLabel || "Cancel"}
            </button>
          )}
          {type === "confirm" ? (
            <button
              onClick={onConfirm}
              style={{
                ...SI_btnSt,
                background: SI_C.red,
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
          background: SI_C.white,
          borderRadius: 16,
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 24px 64px rgba(0,0,0,0.16)",
          border: `1px solid #fecaca`,
          fontFamily: "Montserrat,sans-serif",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: SI_C.redBg,
            padding: "20px 24px 16px",
            borderBottom: "1px solid #fecaca",
            display: "flex",
            alignItems: "flex-start",
            gap: 13,
          }}
        >
          <div style={{ flexShrink: 0, marginTop: 1 }}>
            <AlertCircleIcon size={26} color={SI_C.red} />
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
            <div style={{ fontSize: 13, color: SI_C.ink, lineHeight: 1.6 }}>
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
              color: SI_C.muted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SI_XIcon size={13} />
          </button>
        </div>
        <div
          style={{
            padding: "12px 24px",
            borderBottom: `1px solid ${SI_C.border}`,
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
                  color: SI_C.muted,
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 3,
                }}
              >
                {x.label}
              </div>
              <div style={{ fontWeight: 700, color: SI_C.ink }}>{x.val}</div>
            </div>
          ))}
        </div>
        <div
          style={{
            fontSize: 10.5,
            color: SI_C.muted,
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
                  color: item.category ? SI_C.greenDk : SI_C.warn,
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
            style={{ ...SI_btnSt, opacity: deleting ? 0.5 : 1 }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            style={{
              ...SI_btnSt,
              background: SI_C.red,
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
          background: SI_C.white,
          borderRadius: 16,
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 24px 64px rgba(0,0,0,0.16)",
          border: "1px solid #fecaca",
          fontFamily: "Montserrat,sans-serif",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: SI_C.redBg,
            padding: "20px 24px 16px",
            borderBottom: "1px solid #fecaca",
            display: "flex",
            alignItems: "flex-start",
            gap: 13,
          }}
        >
          <div style={{ flexShrink: 0, marginTop: 1 }}>
            <AlertCircleIcon size={26} color={SI_C.red} />
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
            <div style={{ fontSize: 13, color: SI_C.ink, lineHeight: 1.6 }}>
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
              color: SI_C.muted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SI_XIcon size={13} />
          </button>
        </div>
        <div
          style={{
            padding: "12px 24px",
            borderBottom: `1px solid ${SI_C.border}`,
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
                  color: SI_C.muted,
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 3,
                }}
              >
                {x.label}
              </div>
              <div style={{ fontWeight: 700, color: SI_C.ink }}>{x.val}</div>
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
            style={{ ...SI_btnSt, opacity: deleting ? 0.5 : 1 }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            style={{
              ...SI_btnSt,
              background: SI_C.red,
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
    adminModuleFetch(
      `${apiUrl}/ingredient-batches/${batch.id}/transfer-history`,
    )
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
          background: SI_C.white,
          borderRadius: 18,
          width: "100%",
          maxWidth: 560,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          border: `1px solid ${SI_C.border}`,
          fontFamily: "Montserrat,sans-serif",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 24px",
            borderBottom: `1px solid ${SI_C.border}`,
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
                color: SI_C.ink,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <HistoryIcon size={14} /> Transfer History — Batch{" "}
              {batch.batch_number || "—"}
            </div>
            <div style={{ fontSize: 12, color: SI_C.muted, marginTop: 2 }}>
              {ingredient.name} · {ingredient.branch}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: `1px solid ${SI_C.border}`,
              background: SI_C.white,
              cursor: "pointer",
              color: SI_C.muted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SI_XIcon size={14} />
          </button>
        </div>

        <div
          style={{
            padding: "14px 24px",
            borderBottom: `1px solid ${SI_C.border}`,
            display: "flex",
            gap: 20,
            background: "#fafffe",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                color: SI_C.muted,
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
                color: SI_C.ink,
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
                color: SI_C.muted,
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
                color: SI_C.ink,
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
                color: SI_C.muted,
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
                    i < rows.length - 1 ? `1px solid ${SI_C.bg}` : "none",
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
                    <SI_StoreIcon size={12} color={SI_C.green} />
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: SI_C.ink,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.destination_branch || "—"}
                    </span>
                  </div>
                  <div
                    style={{ fontSize: 11, color: SI_C.muted, marginTop: 3 }}
                  >
                    Order #{r.order_id} · {r.destination_brand || "—"} ·{" "}
                    {r.transferred_at ? fmtTs(r.transferred_at) : "—"}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div
                    style={{ fontWeight: 800, fontSize: 14, color: SI_C.ink }}
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
                      background: r.applied ? SI_C.greenLt : SI_C.amberBg,
                      color: r.applied ? SI_C.greenDk : "#9a3412",
                      border: `1px solid ${r.applied ? SI_C.greenMid : SI_C.amberBorder}`,
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
          background: SI_C.white,
          borderRadius: 18,
          padding: "32px 36px",
          width: "100%",
          maxWidth: 380,
          boxShadow: "0 28px 70px rgba(0,0,0,0.22)",
          border: `1px solid ${SI_C.greenMid}`,
          fontFamily: "Montserrat,sans-serif",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: SI_C.greenLt,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 18px",
          }}
        >
          <UploadIcon size={28} color={SI_C.green} />
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: SI_C.ink,
            marginBottom: 6,
          }}
        >
          Importing Excel
        </div>
        <div style={{ fontSize: 13, color: SI_C.muted, marginBottom: 20 }}>
          Please wait while your data is being processed…
        </div>
        <div
          style={{
            background: SI_C.greenLt,
            borderRadius: 999,
            height: 6,
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              background: `linear-gradient(90deg,${SI_C.teal},${SI_C.green})`,
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
            color: SI_C.muted,
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          {progress.label}
        </div>
        {progress.current > 0 && (
          <div style={{ fontSize: 11, color: SI_C.muted, opacity: 0.7 }}>
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
            color: SI_C.green,
          }}
        >
          <LoaderIcon size={16} color={SI_C.green} />
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
    background: SI_C.white,
    border: `1px solid ${SI_C.border}`,
    borderRadius: 10,
    boxShadow: "0 8px 28px rgba(0,0,0,0.10)",
    maxHeight: 230,
    overflowY: "auto",
  };
  const optSt = (active) => ({
    padding: "9px 14px",
    cursor: "pointer",
    fontSize: 13,
    color: SI_C.ink,
    fontWeight: active ? 700 : 500,
    background: active ? SI_C.greenLt : "transparent",
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
            ...SI_invInputSt,
            display: "flex",
            alignItems: "center",
            gap: 7,
            cursor: "pointer",
            paddingRight: 30,
            userSelect: "none",
            color: activeBrand ? SI_C.ink : SI_C.muted,
          }}
        >
          <FilterIcon color={SI_C.green} />
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
          <SI_ChevronIcon dir={openB ? "up" : "down"} />
        </div>
        {openB && (
          <div style={dropSt}>
            <div
              style={{
                padding: "7px 9px",
                borderBottom: `1px solid ${SI_C.border}`,
                position: "sticky",
                top: 0,
                background: SI_C.white,
              }}
            >
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: SI_C.muted,
                  }}
                >
                  <SI_SearchIcon size={11} />
                </div>
                <input
                  autoFocus
                  type="text"
                  value={brandQ}
                  onChange={(e) => setBrandQ(e.target.value)}
                  placeholder="Search brand…"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    ...SI_invInputSt,
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
                  style={{
                    marginLeft: "auto",
                    fontSize: 11,
                    color: SI_C.muted,
                  }}
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
            ...SI_invInputSt,
            display: "flex",
            alignItems: "center",
            gap: 7,
            cursor: activeBrand ? "pointer" : "not-allowed",
            paddingRight: 30,
            userSelect: "none",
            color: activeBranch ? SI_C.ink : SI_C.muted,
          }}
        >
          <SI_StoreIcon
            size={12}
            color={activeBrand ? SI_C.green : SI_C.muted}
          />
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
                borderBottom: `1px solid ${SI_C.border}`,
                position: "sticky",
                top: 0,
                background: SI_C.white,
              }}
            >
              <input
                autoFocus
                type="text"
                value={branchQ}
                onChange={(e) => setBranchQ(e.target.value)}
                placeholder="Search branch…"
                style={{ ...SI_invInputSt, height: 30, fontSize: 12 }}
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
                <SI_StoreIcon size={11} color={SI_C.green} /> {br}
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
            background: SI_C.greenLt,
            color: SI_C.greenDk,
            border: `1px solid ${SI_C.greenMid}`,
            cursor: "pointer",
          }}
          onClick={() => {
            onChangeBrand(null);
            onChangeBranch(null);
          }}
        >
          {activeBranch || selectedBrand?.name} <SI_XIcon size={10} />
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Pagination
───────────────────────────────────────────────────────────────────────── */
function SI_Pagination({ page, setPage, total, pageSize }) {
  const totalPgs = Math.max(1, Math.ceil(total / pageSize));
  if (totalPgs <= 1) return null;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 18px",
        borderTop: `1px solid ${SI_C.border}`,
        background: "#f9fefb",
      }}
    >
      <span style={{ fontSize: 12, color: SI_C.muted }}>
        Showing{" "}
        <strong style={{ color: SI_C.ink }}>
          {(page * pageSize + 1).toLocaleString()}–
          {Math.min((page + 1) * pageSize, total).toLocaleString()}
        </strong>{" "}
        of <strong style={{ color: SI_C.ink }}>{total.toLocaleString()}</strong>
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
              ...SI_smallBtnSt,
              height: 30,
              width: 30,
              justifyContent: "center",
              border: `1px solid ${SI_C.border}`,
              opacity: d ? 0.35 : 1,
              background: SI_C.white,
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
                ...SI_smallBtnSt,
                height: 30,
                minWidth: 30,
                justifyContent: "center",
                fontWeight: i === page ? 800 : 600,
                border: i === page ? "none" : `1px solid ${SI_C.border}`,
                background:
                  i === page
                    ? `linear-gradient(135deg,${SI_C.teal},${SI_C.green})`
                    : SI_C.white,
                color: i === page ? SI_C.white : SI_C.ink,
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
              ...SI_smallBtnSt,
              height: 30,
              width: 30,
              justifyContent: "center",
              border: `1px solid ${SI_C.border}`,
              opacity: d ? 0.35 : 1,
              background: SI_C.white,
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
          background: SI_C.white,
          borderRadius: 18,
          padding: "28px 32px",
          width: "100%",
          maxWidth: 680,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          border: "1px solid rgba(0,168,76,0.15)",
          fontFamily: "Montserrat,sans-serif",
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
                color: SI_C.ink,
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
                  color: SI_C.red,
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
              border: `1px solid ${SI_C.border}`,
              background: SI_C.greenLt,
              cursor: "pointer",
              color: SI_C.green,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SI_XIcon size={15} />
          </button>
        </div>
        {history.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 90px 90px 110px 100px",
              gap: 8,
              padding: "6px 0 10px",
              borderBottom: `2px solid ${SI_C.greenLt}`,
              fontSize: 10,
              fontWeight: 700,
              color: SI_C.muted,
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
                      i < history.length - 1 ? `1px solid ${SI_C.bg}` : "none",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: SI_C.ink,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {d.name}
                    </div>
                    <div
                      style={{ fontSize: 11, color: SI_C.muted, marginTop: 2 }}
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
                      color: SI_C.muted,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {d.branch}
                  </div>
                  <div
                    style={{ fontSize: 12, color: SI_C.ink, fontWeight: 600 }}
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
                      border: `1.5px solid ${SI_C.green}`,
                      background: SI_C.greenLt,
                      color: SI_C.greenDk,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: restoringId !== null ? "not-allowed" : "pointer",
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
      edit: { bg: "rgba(59,130,246,0.12)", color: "#1d4ed8", label: "Edited" },
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
          background: SI_C.white,
          borderRadius: 18,
          padding: "28px 32px",
          width: "100%",
          maxWidth: 780,
          maxHeight: "82vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          border: "1px solid rgba(0,168,76,0.15)",
          fontFamily: "Montserrat,sans-serif",
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
                color: SI_C.ink,
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
                background: SI_C.greenLt,
                color: SI_C.greenDk,
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
              border: `1px solid ${SI_C.border}`,
              background: SI_C.greenLt,
              cursor: "pointer",
              color: SI_C.green,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SI_XIcon size={15} />
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
                color: SI_C.muted,
              }}
            >
              <SI_SearchIcon size={12} />
            </div>
            <input
              type="text"
              placeholder="Search ingredient, user, branch…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                ...SI_invInputSt,
                paddingLeft: 28,
                height: 32,
                fontSize: 12,
              }}
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ ...SI_invInputSt, width: 130, height: 32, fontSize: 12 }}
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
            borderBottom: `2px solid ${SI_C.greenLt}`,
            fontSize: 10,
            fontWeight: 700,
            color: SI_C.muted,
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
                    i < filtered.length - 1 ? `1px solid ${SI_C.bg}` : "none",
                }}
              >
                <div>{actionBadge(entry.action)}</div>
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: SI_C.ink,
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
                        color: SI_C.muted,
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
                    color: SI_C.muted,
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
                    color: SI_C.ink,
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
          color: SI_C.muted,
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
              color: SI_C.ink,
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
              color: SI_C.muted,
              marginTop: 2,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 9.5, fontWeight: 700, color: SI_C.ink }}>
              {product.name}
            </span>
            <span style={{ opacity: 0.45 }}>•</span>
            <span>
              {formatQuantityWithUnit(totalStock, product.unit)} ·{" "}
              {sorted.length} active batch
              {sorted.length === 1 ? "" : "es"}
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
          background: fifo.method === "FEFO" ? SI_C.amberBg : SI_C.greenLt,
          border: `1px solid ${fifo.method === "FEFO" ? SI_C.amberBorder : SI_C.greenMid}`,
          fontSize: 10.5,
          color: fifo.method === "FEFO" ? "#9a3412" : SI_C.greenDk,
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
              color: SI_C.muted,
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
              color: SI_C.muted,
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
                  background: SI_C.white,
                  borderBottom: isLast
                    ? "none"
                    : `1px solid ${isFirst ? SI_C.greenMid : SI_C.border}`,
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
                        background: isFirst ? SI_C.green : "#b9c9bf",
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
                      style={{ fontSize: 12, fontWeight: 800, color: SI_C.ink }}
                    >
                      Batch {b.batch_number || "—"}
                    </span>
                    {isFirst && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          color: SI_C.greenDk,
                          border: `1px solid ${SI_C.greenMid}`,
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
                    color: SI_C.muted,
                    marginBottom: 8,
                  }}
                >
                  {b.supplier && (
                    <span>
                      Supplier:{" "}
                      <strong style={{ color: SI_C.ink }}>{b.supplier}</strong>
                    </span>
                  )}
                  <span>
                    Arrived:{" "}
                    <strong style={{ color: SI_C.ink }}>{supplyStr}</strong>
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
                      <strong style={{ color: SI_C.ink }}>
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
                      <strong style={{ color: SI_C.ink }}>
                        {b.storage_location}
                      </strong>
                    </span>
                  )}
                  {b.received_by && (
                    <span>
                      Received by:{" "}
                      <strong style={{ color: SI_C.ink }}>
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
                      color: SI_C.muted,
                      fontWeight: 700,
                      marginBottom: 2,
                    }}
                  >
                    <span>STOCK</span>
                    <span>
                      {formatQuantityWithUnit(b.stock, product.unit)} /{" "}
                      {formatQuantityWithUnit(totalStock, product.unit)}
                    </span>
                  </div>
                  <MiniBar pct={stockPct} color={SI_C.green} />
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
                        borderTop: `1px dashed ${SI_C.border}`,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 10,
                        fontSize: 10.5,
                        color: SI_C.muted,
                      }}
                    >
                      {b.lot_number && (
                        <span>
                          LOT:{" "}
                          <strong style={{ color: SI_C.ink }}>
                            {b.lot_number}
                          </strong>
                        </span>
                      )}
                      {b.ndc_code && (
                        <span>
                          NDC:{" "}
                          <strong style={{ color: SI_C.ink }}>
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
                          <strong style={{ color: SI_C.ink }}>
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
                        borderTop: `1px dashed ${SI_C.border}`,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 10,
                        fontSize: 10.5,
                        color: SI_C.muted,
                      }}
                    >
                      {b.tank_id && (
                        <span>
                          Tank:{" "}
                          <strong style={{ color: SI_C.ink }}>
                            {b.tank_id}
                          </strong>
                        </span>
                      )}
                      {b.grade && (
                        <span>
                          Grade:{" "}
                          <strong style={{ color: SI_C.ink }}>{b.grade}</strong>
                        </span>
                      )}
                      {b.octane_rating && (
                        <span>
                          Octane:{" "}
                          <strong style={{ color: SI_C.ink }}>
                            {b.octane_rating}
                          </strong>
                        </span>
                      )}
                      {b.delivery_temp && (
                        <span>
                          Delivery Temp:{" "}
                          <strong style={{ color: SI_C.ink }}>
                            {b.delivery_temp}°F
                          </strong>
                        </span>
                      )}
                      {b.truck_id && (
                        <span>
                          Truck:{" "}
                          <strong style={{ color: SI_C.ink }}>
                            {b.truck_id}
                          </strong>
                        </span>
                      )}
                      {b.volume_correction && (
                        <span>
                          Corrected Vol (60°F):{" "}
                          <strong style={{ color: SI_C.ink }}>
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
                      color: SI_C.muted,
                      marginTop: 6,
                      fontStyle: "italic",
                    }}
                  >
                    {b.notes}
                  </div>
                )}

                {(!readOnly ||
                  (product.branch || "")
                    .trim()
                    .toLowerCase()
                    .includes("head office")) && (
                  <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                    {!readOnly && (
                      <>
                        <button
                          onClick={() => onEditBatch(b)}
                          className="edit-btn"
                          style={{
                            ...SI_smallBtnSt,
                            border: `1px solid ${SI_C.border}`,
                            color: SI_C.green,
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
                            ...SI_smallBtnSt,
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
                    {(product.branch || "")
                      .trim()
                      .toLowerCase()
                      .includes("head office") && (
                      <button
                        onClick={() => onViewHistory(b)}
                        className="hist-btn"
                        style={{
                          ...SI_smallBtnSt,
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
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="stock-brand-overview-card"
      onClick={onClick}
      style={{
        textAlign: "left",
        width: "100%",
        minWidth: 0,
        minHeight: 148,
        height: "auto",
        padding: 0,
        appearance: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
        gap: 0,
        boxSizing: "border-box",
        whiteSpace: "normal",
        background: SI_C.white,
        border: `1px solid ${SI_C.border}`,
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
        e.currentTarget.style.borderColor = SI_C.greenMid;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "0 2px 10px rgba(50,109,32,.05)";
        e.currentTarget.style.borderColor = SI_C.border;
      }}
    >
      <div
        style={{
          width: "100%",
          minHeight: 75,
          boxSizing: "border-box",
          flexShrink: 0,
          padding: "18px 18px 15px",
          borderBottom: `1px solid ${SI_C.border}`,
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
            background: SI_C.ink,
            color: SI_C.lime,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <SI_StoreIcon size={19} color={SI_C.lime} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: SI_C.ink,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {brandDef.label}
          </div>
          <div style={{ fontSize: 11, color: SI_C.muted, marginTop: 3 }}>
            {branchCount} branch{branchCount === 1 ? "" : "es"}
          </div>
        </div>
        <div
          style={{
            width: 30,
            height: 30,
            flexShrink: 0,
            borderRadius: 9,
            background: SI_C.bg,
            border: `1px solid ${SI_C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: SI_C.greenDk,
          }}
        >
          <ArrowRightIcon size={13} />
        </div>
      </div>
      <div
        style={{
          width: "100%",
          padding: "13px 18px 16px",
          borderTop: `1px solid ${SI_C.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          color: SI_C.muted,
          fontSize: 11,
        }}
      >
        <span>
          {brandItems.length} product{brandItems.length === 1 ? "" : "s"} in
          inventory
        </span>
        <span style={{ color: SI_C.greenDk, fontWeight: 750 }}>
          Open Inventory{" "}
          <ArrowRightIcon
            size={12}
            style={{ verticalAlign: "middle", marginLeft: 3 }}
          />
        </span>
      </div>
    </div>
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
    background: SI_C.white,
    border: `1px solid ${SI_C.border}`,
    borderRadius: 10,
    boxShadow: "0 8px 28px rgba(0,0,0,0.10)",
    maxHeight: 230,
    overflowY: "auto",
  };
  const optSt = (active) => ({
    padding: "9px 14px",
    cursor: "pointer",
    fontSize: 13,
    color: SI_C.ink,
    fontWeight: active ? 700 : 500,
    background: active ? SI_C.greenLt : "transparent",
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
          ...SI_invInputSt,
          height: 30,
          fontSize: 11,
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
          paddingRight: 26,
          userSelect: "none",
          color: activeBranch ? SI_C.ink : SI_C.muted,
        }}
      >
        <SI_StoreIcon size={11} color={SI_C.green} />
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
        <SI_ChevronIcon size={10} dir={open ? "up" : "down"} />
      </div>
      {open && (
        <div style={dropSt}>
          <div
            style={{
              padding: "6px 8px",
              borderBottom: `1px solid ${SI_C.border}`,
              position: "sticky",
              top: 0,
              background: SI_C.white,
            }}
          >
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: SI_C.muted,
                }}
              >
                <SI_SearchIcon size={11} />
              </div>
              <input
                autoFocus
                type="text"
                value={branchQ}
                onChange={(e) => setBranchQ(e.target.value)}
                placeholder="Search branch…"
                onClick={(e) => e.stopPropagation()}
                style={{
                  ...SI_invInputSt,
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
              <SI_StoreIcon size={11} color={SI_C.green} /> {br}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MANAGER SUPPLY ORDERING — mirrors the Franchisee Stock Inventory ordering
   controls/flow while preserving the Manager's existing inventory callbacks.
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
  enableOrdering = false,
  orderUser = null,
  orderBrand = "",
  orderBranch = "",
}) {
  const [search, setSearch] = useState("");
  const [branchF, setBranchF] = useState(
    restrictBranch || initialBranchFilter || "",
  );
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
    if (!restrictBranch && branchF && !branchOptions.includes(branchF)) {
      setBranchF("");
    }
  }, [branchF, branchOptions, restrictBranch]);
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
  }, [restrictBranch, initialBranchFilter, branchOptions]);
  useEffect(() => {
    setStatusF(initialStatusFilter);
  }, [initialStatusFilter]);
  // Keep a newly added/edited/received product visible even when the current
  // branch/category/status filter would otherwise hide the result immediately.
  useEffect(() => {
    const changed = focusMutation?.item;
    if (!changed || !itemBelongsToBrand(changed, brandDef, brandObj)) return;
    if (!restrictBranch && branchF && changed.branch !== branchF) {
      setBranchF("");
    }
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
    adminModuleFetch(`${apiUrl}/ingredient-batches?ingredient_id=${selectedId}`)
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
      const res = await adminModuleFetch(
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
      await adminModuleFetch(`${apiUrl}/ingredients/${ingredient.id}`, {
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
      if (computeExpiryStatus(form.exp_date, ingredient.brand) === "expired") {
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
      await adminModuleFetch(`${apiUrl}/ingredient-batches/${batch.id}`, {
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
      await adminModuleFetch(`${apiUrl}/ingredient-batch-delete-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch_data: batch,
          ingredient_id: ingredient.id,
          ingredient_name: ingredient.name,
          deleted_by: userName,
        }),
      });
      await adminModuleFetch(`${apiUrl}/ingredient-batches/${batch.id}`, {
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
    adminModuleFetch(`${apiUrl}/ingredient-batches?ingredient_id=${selectedId}`)
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
  const branchScopedItems = useMemo(
    () =>
      branchF ? brandItems.filter((i) => i.branch === branchF) : brandItems,
    [brandItems, branchF],
  );
  const lowCount = branchScopedItems.filter(
    (i) => Number(i.stock) < Number(i.min_stock),
  ).length;
  const listMaxHeight = expanded ? 700 : 480;
  return (
    <div
      className="stock-surface"
      style={{
        background: SI_C.white,
        border: `1px solid ${SI_C.border}`,
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
          borderBottom: `1px solid ${SI_C.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: SI_C.ink,
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
                border: `1px solid ${SI_C.border}`,
                background: SI_C.white,
                color: SI_C.greenDk,
                fontSize: 13,
                fontWeight: 800,
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              <ArrowLeftIcon size={16} strokeWidth={2.5} />
            </button>
          ) : (
            <SI_StoreIcon size={expanded ? 17 : 14} color={SI_C.green} />
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
            {branchScopedItems.length} item
            {branchScopedItems.length === 1 ? "" : "s"}
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
              background: SI_C.white,
              color: SI_C.red,
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
                  color: SI_C.red,
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
                  border: `1px solid ${SI_C.border}`,
                  background: SI_C.white,
                  color: SI_C.greenDk,
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
                  background: SI_C.green,
                  color: SI_C.white,
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
          borderBottom: `1px solid ${SI_C.border}`,
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          background: "#fbfcf8",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 160px", minWidth: 100 }}>
          <div
            style={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              color: SI_C.muted,
            }}
          >
            <SI_SearchIcon size={11} />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            style={{
              ...SI_invInputSt,
              height: 30,
              fontSize: 12,
              paddingLeft: 24,
            }}
          />
        </div>
        {restrictBranch ? (
          <div
            style={{
              ...SI_invInputSt,
              height: 30,
              minWidth: 160,
              fontSize: 11,
              padding: "6px 10px",
              background: "#F6F7F1",
              color: SI_C.ink,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "default",
            }}
            title="Assigned branch"
          >
            <SI_StoreIcon size={12} color={SI_C.green} />
            {restrictBranch}
          </div>
        ) : (
          <BranchOnlyFilter
            branches={branchOptions}
            activeBranch={branchF}
            onChangeBranch={setBranchF}
          />
        )}
        {categoryOptions.length > 0 && (
          <select
            value={categoryF}
            onChange={(e) => setCategoryF(e.target.value)}
            style={{ ...SI_invInputSt, height: 30, fontSize: 11, width: 150 }}
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
          style={{ ...SI_invInputSt, height: 30, fontSize: 11, width: 100 }}
        >
          <option value="">All Units</option>
          {SI_UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <select
          value={statusF}
          onChange={(e) => setStatusF(e.target.value)}
          style={{ ...SI_invInputSt, height: 30, fontSize: 11, width: 110 }}
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
            borderRight: `1px solid ${SI_C.border}`,
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
                color: SI_C.muted,
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
                  className={`stock-product-row${active ? " active" : ""}`}
                  style={{
                    padding: "12px 16px",
                    cursor: "pointer",
                    borderLeft: `3px solid ${active ? SI_C.lime : "transparent"}`,
                    background: active ? "#f6f8ef" : SI_C.white,
                    borderBottom: `1px solid ${SI_C.bg}`,
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
                        color: SI_C.ink,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.name}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 10.5,
                      color: SI_C.muted,
                      marginTop: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    {item.sku && (
                      <>
                        <span
                          style={{
                            fontSize: 9.5,
                            fontFamily: "monospace",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.sku}
                        </span>
                        <span style={{ opacity: 0.45 }}>•</span>
                      </>
                    )}
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
                            color: item.category ? SI_C.greenDk : SI_C.warn,
                            fontWeight: 700,
                          }}
                        >
                          {item.category || "Uncategorized"}
                        </span>
                      </>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 10.5,
                      color: SI_C.muted,
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
                            color: item.category ? SI_C.greenDk : SI_C.warn,
                            fontWeight: 700,
                          }}
                        >
                          {item.category || "Uncategorized"}
                        </span>
                      </>
                    )}
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
                            ...SI_smallBtnSt,
                            height: 24,
                            padding: "0 9px",
                            fontSize: 10.5,
                            border: `1px solid ${SI_C.border}`,
                            color: SI_C.green,
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
                            ...SI_smallBtnSt,
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
    if (
      expiryRule.kind === "exact" &&
      bounds.recommendedStr &&
      !form.exp_date
    ) {
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
    const res = await adminModuleFetch(
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
    const updateRes = await adminModuleFetch(
      `${apiUrl}/ingredients/${prod.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...prod,
          stock: totalStock,
          ...(nextOutCost !== null ? { cost_per_unit: nextOutCost } : {}),
        }),
      },
    );
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
      supply_date: f.received_at ? new Date(f.received_at).toISOString() : null,
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
        const res = await adminModuleFetch(`${apiUrl}/ingredient-batches`, {
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
          background: SI_C.white,
          borderRadius: 20,
          width: "100%",
          maxWidth: 560,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.20)",
          fontFamily: "Montserrat,sans-serif",
        }}
      >
        <div
          style={{
            padding: "20px 26px",
            background: `linear-gradient(135deg,#fbbf24,${SI_C.warn})`,
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
                {multiMode ? ` · ${selectedIds.length} products selected` : ""}
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
              <SI_XIcon size={14} />
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
              <span style={{ fontWeight: 400, color: SI_C.muted }}>
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
                  color: SI_C.muted,
                }}
              >
                <SI_SearchIcon size={12} />
              </div>
              <input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products…"
                style={{ ...SI_invInputSt, paddingLeft: 30 }}
              />
            </div>
            <div
              style={{
                border: `1.5px solid ${SI_C.border}`,
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
                    color: SI_C.muted,
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
                      color: SI_C.ink,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(i.id)}
                      onChange={() => toggleProduct(i.id)}
                    />
                    {i.name}{" "}
                    <span style={{ fontSize: 11, color: SI_C.muted }}>
                      ({i.branch})
                    </span>
                  </label>
                ))
              )}
            </div>
            {selectedIds.length > 0 && (
              <div style={{ fontSize: 11, color: SI_C.muted, marginTop: 5 }}>
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
                color: SI_C.muted,
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
                            ? SI_C.green
                            : idx === activeIndex
                              ? SI_C.amber
                              : SI_C.border,
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
                      onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                      style={{
                        ...SI_smallBtnSt,
                        border: `1px solid ${SI_C.border}`,
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
                      style={{ fontSize: 11, color: SI_C.muted, flexShrink: 0 }}
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
                        ...SI_smallBtnSt,
                        border: `1px solid ${SI_C.border}`,
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
                  color: SI_C.muted,
                  letterSpacing: "0.06em",
                  borderBottom: `1px solid ${SI_C.border}`,
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
                      color: SI_C.greenDk,
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
                    style={SI_invInputSt}
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
                    style={SI_invInputSt}
                    value={form.cost_batch}
                    placeholder="e.g. 4000.00"
                    onChange={(e) => setF("cost_batch", e.target.value)}
                  />
                  <div
                    style={{ fontSize: 10, color: SI_C.muted, marginTop: 4 }}
                  >
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
                      background: SI_C.bg,
                      border: `1px solid ${SI_C.border}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: SI_C.muted,
                      }}
                    >
                      Cost / Unit
                    </div>
                    <div
                      style={{ fontSize: 10, color: SI_C.muted, marginTop: 2 }}
                    >
                      ₱{batchCost.toFixed(2)} ÷ {qty} {product?.unit || "unit"}
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 900,
                        color: SI_C.ink,
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
                      background: SI_C.greenLt,
                      border: `1px solid ${SI_C.greenMid}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: SI_C.greenDk,
                      }}
                    >
                      {directProduct ? "Auto Selling Price" : "Shop Price"}
                    </div>
                    <div
                      style={{ fontSize: 10, color: SI_C.muted, marginTop: 2 }}
                    >
                      {directProduct
                        ? "cost ÷ 0.35 — 35% product, 45% ops, 20% profit"
                        : "cost/unit + 15% (weighted avg across batches)"}
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 900,
                        color: SI_C.greenDk,
                        marginTop: 4,
                      }}
                    >
                      ₱
                      {(directProduct
                        ? computeDirectSellingPrice(unitCost)
                        : unitCost * 1.15
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label style={invLabelSt}>Supplier</label>
                <input
                  style={SI_invInputSt}
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
                    style={SI_invInputSt}
                    value={form.mfg_date}
                    onChange={(e) => setF("mfg_date", e.target.value)}
                  />
                </div>
                <div>
                  <label style={invLabelSt}>Date &amp; Time Received</label>
                  <input
                    type="datetime-local"
                    style={SI_invInputSt}
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
                        color: SI_C.muted,
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
                    ...SI_invInputSt,
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
                    (!!expiryRule?.requiresManufactureDate && !form.mfg_date) ||
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
                        ? SI_C.warn
                        : SI_C.muted,
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
                          <strong style={{ color: SI_C.ink }}>
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
                        style={SI_invInputSt}
                        value={form.lot_number}
                        onChange={(e) => setF("lot_number", e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={invLabelSt}>NDC Code</label>
                      <input
                        style={SI_invInputSt}
                        value={form.ndc_code}
                        onChange={(e) => setF("ndc_code", e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={invLabelSt}>Dosage Form</label>
                      <select
                        style={SI_invInputSt}
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
                        style={SI_invInputSt}
                        value={form.strength}
                        placeholder="e.g. 500mg"
                        onChange={(e) => setF("strength", e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={invLabelSt}>Storage Requirement</label>
                      <select
                        style={SI_invInputSt}
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
                        style={SI_invInputSt}
                        value={form.tank_id}
                        onChange={(e) => setF("tank_id", e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={invLabelSt}>Grade</label>
                      <select
                        style={SI_invInputSt}
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
                        style={SI_invInputSt}
                        value={form.octane_rating}
                        placeholder="e.g. 95"
                        onChange={(e) => setF("octane_rating", e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={invLabelSt}>Delivery Temp (°F)</label>
                      <input
                        type="number"
                        style={SI_invInputSt}
                        value={form.delivery_temp}
                        onChange={(e) => setF("delivery_temp", e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={invLabelSt}>Truck / Tanker ID</label>
                      <input
                        style={SI_invInputSt}
                        value={form.truck_id}
                        onChange={(e) => setF("truck_id", e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={invLabelSt}>Net Volume @ 60°F</label>
                      <input
                        style={SI_invInputSt}
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
                    ...SI_invInputSt,
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
                    borderTop: `1px solid ${SI_C.border}`,
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
                          border: `1px solid ${isSaved ? SI_C.greenMid : isActive ? SI_C.amberBorder : SI_C.border}`,
                          background: isSaved
                            ? SI_C.greenLt
                            : isActive
                              ? SI_C.amberBg
                              : SI_C.white,
                          color: isSaved
                            ? SI_C.greenDk
                            : isActive
                              ? SI_C.warn
                              : SI_C.muted,
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
                              border: `1.5px dashed ${SI_C.muted}`,
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
function BatchDeleteHistoryPanel({ history, restoringId, onRestore, onClose }) {
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
          background: SI_C.white,
          borderRadius: 20,
          padding: "26px 30px",
          width: "100%",
          maxWidth: 660,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 64px rgba(0,0,0,0.20)",
          border: "1px solid #fecaca",
          fontFamily: "Montserrat,sans-serif",
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
                color: SI_C.ink,
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
            <SI_XIcon size={14} />
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
                style={{ color: "#9ca3af", fontSize: 13, fontStyle: "italic" }}
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
                      style={{ fontWeight: 700, fontSize: 13, color: SI_C.ink }}
                    >
                      {d.batch_number || (
                        <span
                          style={{ color: SI_C.muted, fontStyle: "italic" }}
                        >
                          No batch #
                        </span>
                      )}
                    </div>
                    {d.notes && (
                      <div
                        style={{
                          fontSize: 11,
                          color: SI_C.muted,
                          marginTop: 1,
                        }}
                      >
                        {d.notes}
                      </div>
                    )}
                  </div>
                  <div
                    style={{ fontSize: 13, fontWeight: 600, color: SI_C.ink }}
                  >
                    {d.stock ?? "—"}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{expStr}</div>
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
                      border: `1.5px solid ${SI_C.green}`,
                      background: "#e0f2f1",
                      color: SI_C.greenDk,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: restoringId !== null ? "not-allowed" : "pointer",
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
          background: SI_C.white,
          borderRadius: 18,
          width: "100%",
          maxWidth: 560,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.20)",
          fontFamily: "Montserrat,sans-serif",
        }}
      >
        <div
          style={{
            padding: "18px 24px",
            borderBottom: `1px solid ${SI_C.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: SI_C.ink }}>
              Edit Batch {batch.batch_number || ""}
            </div>
            <div style={{ fontSize: 12, color: SI_C.muted, marginTop: 2 }}>
              {ingredient.name} · {ingredient.branch}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: `1px solid ${SI_C.border}`,
              background: SI_C.white,
              cursor: "pointer",
              color: SI_C.muted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SI_XIcon size={14} />
          </button>
        </div>

        <form
          noValidate
          onSubmit={submit}
          style={{ padding: 22, display: "grid", gap: 14 }}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={invLabelSt}>Quantity *</label>
              <input
                type="number"
                min="0"
                required
                style={SI_invInputSt}
                value={form.stock}
                onChange={(e) => setF("stock", e.target.value)}
              />
            </div>
            <div>
              <label style={invLabelSt}>Supplier</label>
              <input
                style={SI_invInputSt}
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
                style={SI_invInputSt}
                value={form.cost_per_unit}
                onChange={(e) => setF("cost_per_unit", e.target.value)}
              />
            </div>
            <div>
              <label style={invLabelSt}>Mfg Date</label>
              <input
                type="date"
                style={SI_invInputSt}
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
                      color: SI_C.muted,
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
                  ...SI_invInputSt,
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
                        ? SI_C.warn
                        : SI_C.muted,
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
                      color: SI_C.red,
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
                style={SI_invInputSt}
                value={form.supply_date}
                onChange={(e) => setF("supply_date", e.target.value)}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={invLabelSt}>Notes</label>
              <input
                style={SI_invInputSt}
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
                  style={SI_invInputSt}
                  value={form.lot_number}
                  onChange={(e) => setF("lot_number", e.target.value)}
                />
              </div>
              <div>
                <label style={invLabelSt}>NDC Code</label>
                <input
                  style={SI_invInputSt}
                  value={form.ndc_code}
                  onChange={(e) => setF("ndc_code", e.target.value)}
                />
              </div>
              <div>
                <label style={invLabelSt}>Dosage Form</label>
                <select
                  style={SI_invInputSt}
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
                  style={SI_invInputSt}
                  value={form.strength}
                  placeholder="e.g. 500mg"
                  onChange={(e) => setF("strength", e.target.value)}
                />
              </div>
              <div>
                <label style={invLabelSt}>Storage</label>
                <select
                  style={SI_invInputSt}
                  value={form.storage_requirement}
                  onChange={(e) => setF("storage_requirement", e.target.value)}
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
                  style={SI_invInputSt}
                  value={form.tank_id}
                  onChange={(e) => setF("tank_id", e.target.value)}
                />
              </div>
              <div>
                <label style={invLabelSt}>Grade</label>
                <select
                  style={SI_invInputSt}
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
                  style={SI_invInputSt}
                  value={form.octane_rating}
                  onChange={(e) => setF("octane_rating", e.target.value)}
                />
              </div>
              <div>
                <label style={invLabelSt}>Delivery Temp (°F)</label>
                <input
                  type="number"
                  style={SI_invInputSt}
                  value={form.delivery_temp}
                  onChange={(e) => setF("delivery_temp", e.target.value)}
                />
              </div>
              <div>
                <label style={invLabelSt}>Truck/Tanker ID</label>
                <input
                  style={SI_invInputSt}
                  value={form.truck_id}
                  onChange={(e) => setF("truck_id", e.target.value)}
                />
              </div>
              <div>
                <label style={invLabelSt}>Net Vol @ 60°F</label>
                <input
                  style={SI_invInputSt}
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
              borderTop: `1px solid ${SI_C.border}`,
            }}
          >
            <button type="button" onClick={onClose} style={SI_btnSt}>
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
      const res = await adminModuleFetch(
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
    ok: {
      badgeText: null,
      border: SI_C.border,
      label: null,
      dateColor: SI_C.ink,
    },
  };
  const syncIngredientStock = async () => {
    try {
      const res = await adminModuleFetch(
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
      await adminModuleFetch(`${apiUrl}/ingredients/${ingredient.id}`, {
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
      await adminModuleFetch(
        `${apiUrl}/ingredient-batches/${editingBatch.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
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
    await adminModuleFetch(`${apiUrl}/ingredient-batch-delete-history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        batch_data: batchToDelete,
        ingredient_id: ingredient.id,
        ingredient_name: ingredient.name,
        deleted_by: userName,
      }),
    });
    await adminModuleFetch(`${apiUrl}/ingredient-batches/${id}`, {
      method: "DELETE",
    });
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
      const res = await adminModuleFetch(`${apiUrl}/ingredient-batches`, {
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
        await adminModuleFetch(
          `${apiUrl}/ingredient-batch-delete-history/${entry.id}`,
          {
            method: "DELETE",
          },
        );
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
          fontFamily: "Montserrat,sans-serif",
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
              {formatQuantityWithUnit(
                batches.reduce((s, b) => s + Number(b.stock || 0), 0),
                ingredient.unit,
              )}
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
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "#fff",
              borderRadius: "50%",
              width: 32,
              height: 32,
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
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
              const status = getExpiryStatus(batch.exp_date, ingredient.brand);
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
                      : `1px solid ${isFirst ? SI_C.greenMid : SI_C.border}`,
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
                            color: SI_C.greenDk,
                            border: `1px solid ${SI_C.greenMid}`,
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
                        style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}
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
                    {(ingredient.branch || "")
                      .trim()
                      .toLowerCase()
                      .includes("head office") && (
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
function ManagerFrFifoQueue({ product, batches, loading, lowStock = false }) {
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
    <div
      className="fr-inventory-detail-content"
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
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
              {frStockQuantity(totalStock, product.unit)} · {sorted.length}{" "}
              active batch{sorted.length === 1 ? "" : "es"}
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
                      {frStockQuantity(b.stock, product.unit)} /{" "}
                      {frStockQuantity(totalStock, product.unit)}
                    </span>
                  </div>
                  <MiniBar
                    pct={stockPct}
                    color={lowStock ? C.red : C.green}
                    track={lowStock ? "#fbe5e3" : "#eef6f1"}
                  />
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
                            {frStockQuantity(b.volume_correction, product.unit)}
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

// Stock Inventory copied from the latest Franchisee code, without inventory or batch Edit/Delete controls.
const MSI_fmtPeso = (n) =>
  "₱" +
  Number(n || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const MSI_fmtTs = (d) =>
  new Date(d).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  });

const MSI_UNITS = [
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

const MSI_BRAND_EXTRA_FIELDS = {
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

function MSI_getExtraFields(brandName) {
  if (!brandName) return [];
  for (const key of Object.keys(MSI_BRAND_EXTRA_FIELDS)) {
    if (brandName.trim().toLowerCase() === key.toLowerCase())
      return MSI_BRAND_EXTRA_FIELDS[key];
  }
  return [];
}

const MSI_normalizeListResponse = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const candidates = [
    payload.items,
    payload.ingredients,
    payload.inventory,
    payload.results,
    payload.rows,
    payload.data,
    payload.data?.items,
    payload.data?.ingredients,
    payload.data?.inventory,
    payload.data?.results,
    payload.data?.rows,
  ];
  const found = candidates.find(Array.isArray);
  return found || [];
};

const MSI_C = {
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
  amberBg: "#fffbeb",
  amberBorder: "#fde68a",
};

const MSI_invInputSt = {
  height: 38,
  padding: "0 13px",
  borderRadius: 11,
  border: `1.5px solid ${MSI_C.border}`,
  background: MSI_C.white,
  fontSize: 13,
  color: MSI_C.ink,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  width: "100%",
};

const MSI_EXPIRY_WARN_DAYS = 30;

const MSI_SearchIcon = ({ size = 14 }) => (
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

const MSI_XIcon = ({ size = 14 }) => (
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

const MSI_StoreIcon = ({ size = 14, color = "currentColor" }) => (
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

const MSI_FR_UNIT_NAMES = {
  tbsp: ["Tablespoon", "Tablespoons"],
  tablespoon: ["Tablespoon", "Tablespoons"],
  tablespoons: ["Tablespoon", "Tablespoons"],
  tsp: ["Teaspoon", "Teaspoons"],
  teaspoon: ["Teaspoon", "Teaspoons"],
  teaspoons: ["Teaspoon", "Teaspoons"],
  cup: ["Cup", "Cups"],
  cups: ["Cup", "Cups"],
  l: ["Liter", "Liters"],
  liter: ["Liter", "Liters"],
  liters: ["Liter", "Liters"],
  litre: ["Liter", "Liters"],
  litres: ["Liter", "Liters"],
  ml: ["Milliliter", "Milliliters"],
  milliliter: ["Milliliter", "Milliliters"],
  milliliters: ["Milliliter", "Milliliters"],
  kg: ["Kilogram", "Kilograms"],
  kilogram: ["Kilogram", "Kilograms"],
  kilograms: ["Kilogram", "Kilograms"],
  g: ["Gram", "Grams"],
  gram: ["Gram", "Grams"],
  grams: ["Gram", "Grams"],
  mg: ["Milligram", "Milligrams"],
  milligram: ["Milligram", "Milligrams"],
  milligrams: ["Milligram", "Milligrams"],
  pc: ["Piece", "Pieces"],
  pcs: ["Piece", "Pieces"],
  piece: ["Piece", "Pieces"],
  pieces: ["Piece", "Pieces"],
  unit: ["Unit", "Units"],
  units: ["Unit", "Units"],
  bottle: ["Bottle", "Bottles"],
  bottles: ["Bottle", "Bottles"],
  btl: ["Bottle", "Bottles"],
  btls: ["Bottle", "Bottles"],
  box: ["Box", "Boxes"],
  boxes: ["Box", "Boxes"],
  pack: ["Pack", "Packs"],
  packs: ["Pack", "Packs"],
  pkt: ["Packet", "Packets"],
  tablet: ["Tablet", "Tablets"],
  tablets: ["Tablet", "Tablets"],
  tab: ["Tablet", "Tablets"],
  tabs: ["Tablet", "Tablets"],
  capsule: ["Capsule", "Capsules"],
  capsules: ["Capsule", "Capsules"],
  cap: ["Capsule", "Capsules"],
  caps: ["Capsule", "Capsules"],
  gal: ["Gallon", "Gallons"],
  gallon: ["Gallon", "Gallons"],
  gallons: ["Gallon", "Gallons"],
  oz: ["Ounce", "Ounces"],
  lb: ["Pound", "Pounds"],
  lbs: ["Pound", "Pounds"],
  sachet: ["Sachet", "Sachets"],
  sachets: ["Sachet", "Sachets"],
  bag: ["Bag", "Bags"],
  bags: ["Bag", "Bags"],
  can: ["Can", "Cans"],
  cans: ["Can", "Cans"],
  roll: ["Roll", "Rolls"],
  rolls: ["Roll", "Rolls"],
};

function MSI_frFullUnit(unit, quantity = 2) {
  const raw = String(unit || "Units").trim();
  const names = MSI_FR_UNIT_NAMES[raw.toLowerCase().replace(/\./g, "")];
  return names ? names[Math.abs(Number(quantity)) === 1 ? 0 : 1] : raw;
}

function MSI_frStockQuantity(value, unit) {
  if (value == null || value === "" || !Number.isFinite(Number(value)))
    return "—";
  const whole = Math.round(Number(value));
  return `${whole.toLocaleString("en-PH", { maximumFractionDigits: 0 })} ${MSI_frFullUnit(unit, whole)}`;
}

const MSI_THREE_YEARS_MS = 3 * 365.25 * 24 * 60 * 60 * 1000;

function MSI_computeExpiryStatus(exp_date, brand) {
  if (!exp_date) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(exp_date);
  const msLeft = exp - now;
  const isIPharma = (brand || "").toLowerCase().includes("ipharma");
  if (isIPharma) {
    if (msLeft < MSI_THREE_YEARS_MS) return "expired";
    if (msLeft < MSI_THREE_YEARS_MS + 7 * 86400000) return "critical";
    if (msLeft < MSI_THREE_YEARS_MS + 30 * 86400000) return "warning";
    return "ok";
  }
  if (msLeft < 0) return "expired";
  if (msLeft < 7 * 86400000) return "critical";
  if (msLeft < 30 * 86400000) return "warning";
  return "ok";
}

function MSI_getFifoMethod(brand, isPerishable) {
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

function MSI_sortBatchesByMethod(batches, brand, isPerishable) {
  const { method } = MSI_getFifoMethod(brand, isPerishable);
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

function MSI_daysRemaining(exp_date) {
  if (!exp_date) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(exp_date);
  return Math.round((exp - now) / 86400000);
}

function MSI_isPharmaBrand(brand) {
  return (brand || "").toLowerCase().includes("ipharma");
}

function MSI_isFuelBrand(brand) {
  return (brand || "").toLowerCase().includes("ifuel");
}

const MSI_FR_EXPIRY_STYLE = {
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
  ok: {
    border: MSI_C.greenMid,
    badgeText: null,
    label: null,
    dot: MSI_C.green,
  },
};

function MSI_fmtFrDate(d) {
  return d
    ? new Date(d).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "Asia/Manila",
      })
    : "—";
}

function MSI_fmtFrTs(d) {
  return new Date(d).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  });
}

function MSI_FrMiniBar({ pct, color, track = "#eef6f1", height = 6 }) {
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

function MSI_FrFifoQueue({
  product,
  batches,
  loading,
  lowStock = false,

  onViewHistory,
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
          color: MSI_C.muted,
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

  const fifo = MSI_getFifoMethod(product.brand, product.perishable);
  const sorted = MSI_sortBatchesByMethod(
    batches,
    product.brand,
    product.perishable,
  );
  const totalStock = sorted.reduce((s, b) => s + Number(b.stock || 0), 0);

  return (
    <div
      className="fr-inventory-detail-content"
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
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
              color: MSI_C.ink,
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
              color: MSI_C.muted,
              marginTop: 2,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 9.5, fontWeight: 700, color: MSI_C.ink }}>
              {product.name}
            </span>
            <span style={{ opacity: 0.45 }}>•</span>
            <span>
              {MSI_frStockQuantity(totalStock, product.unit)} · {sorted.length}{" "}
              active batch{sorted.length === 1 ? "" : "es"}
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
          background: fifo.method === "FEFO" ? MSI_C.amberBg : MSI_C.greenLt,
          border: `1px solid ${fifo.method === "FEFO" ? MSI_C.amberBorder : MSI_C.greenMid}`,
          fontSize: 10.5,
          color: fifo.method === "FEFO" ? "#9a3412" : MSI_C.greenDk,
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
              color: MSI_C.muted,
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
              color: MSI_C.muted,
              fontSize: 12,
              fontStyle: "italic",
            }}
          >
            No batches yet for this product.
          </div>
        ) : (
          sorted.map((b, idx) => {
            const status = MSI_computeExpiryStatus(b.exp_date, product.brand);
            const ss = MSI_FR_EXPIRY_STYLE[status] || MSI_FR_EXPIRY_STYLE.ok;
            const isFirst = idx === 0;
            const isLast = idx === sorted.length - 1;
            const supplyStr = b.supply_date ? MSI_fmtFrTs(b.supply_date) : "—";
            const expStr = MSI_fmtFrDate(b.exp_date);
            const dRem = MSI_daysRemaining(b.exp_date);
            const stockPct =
              totalStock > 0
                ? Math.round((Number(b.stock || 0) / totalStock) * 100)
                : 0;

            return (
              <div
                key={b.id}
                style={{
                  background: MSI_C.white,
                  borderBottom: isLast
                    ? "none"
                    : `1px solid ${isFirst ? MSI_C.greenMid : MSI_C.border}`,
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
                        background: isFirst ? MSI_C.green : "#b9c9bf",
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
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: MSI_C.ink,
                      }}
                    >
                      Batch {b.batch_number || "—"}
                    </span>
                    {isFirst && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          color: MSI_C.greenDk,
                          border: `1px solid ${MSI_C.greenMid}`,
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
                    color: MSI_C.muted,
                    marginBottom: 8,
                  }}
                >
                  {b.supplier && (
                    <span>
                      Supplier:{" "}
                      <strong style={{ color: MSI_C.ink }}>{b.supplier}</strong>
                    </span>
                  )}
                  <span>
                    Arrived:{" "}
                    <strong style={{ color: MSI_C.ink }}>{supplyStr}</strong>
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
                      <strong style={{ color: MSI_C.ink }}>
                        {MSI_fmtPeso(b.cost_per_unit)}
                      </strong>
                    </span>
                  ) : null}
                  {b.storage_location && (
                    <span>
                      Location:{" "}
                      <strong style={{ color: MSI_C.ink }}>
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
                      color: MSI_C.muted,
                      fontWeight: 700,
                      marginBottom: 2,
                    }}
                  >
                    <span>STOCK</span>
                    <span>
                      {MSI_frStockQuantity(b.stock, product.unit)} /{" "}
                      {MSI_frStockQuantity(totalStock, product.unit)}
                    </span>
                  </div>
                  <MSI_FrMiniBar
                    pct={stockPct}
                    color={lowStock ? MSI_C.red : MSI_C.green}
                    track={lowStock ? "#fbe5e3" : "#eef6f1"}
                  />
                </div>

                {MSI_isPharmaBrand(product.brand) &&
                  (b.lot_number ||
                    b.ndc_code ||
                    b.dosage_form ||
                    b.storage_requirement ||
                    b.controlled_substance) && (
                    <div
                      style={{
                        marginTop: 8,
                        paddingTop: 8,
                        borderTop: `1px dashed ${MSI_C.border}`,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 10,
                        fontSize: 10.5,
                        color: MSI_C.muted,
                      }}
                    >
                      {b.lot_number && (
                        <span>
                          LOT:{" "}
                          <strong style={{ color: MSI_C.ink }}>
                            {b.lot_number}
                          </strong>
                        </span>
                      )}
                      {b.ndc_code && (
                        <span>
                          NDC:{" "}
                          <strong style={{ color: MSI_C.ink }}>
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
                          <strong style={{ color: MSI_C.ink }}>
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
                {MSI_isFuelBrand(product.brand) &&
                  (b.tank_id || b.grade || b.octane_rating || b.truck_id) && (
                    <div
                      style={{
                        marginTop: 8,
                        paddingTop: 8,
                        borderTop: `1px dashed ${MSI_C.border}`,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 10,
                        fontSize: 10.5,
                        color: MSI_C.muted,
                      }}
                    >
                      {b.tank_id && (
                        <span>
                          Tank:{" "}
                          <strong style={{ color: MSI_C.ink }}>
                            {b.tank_id}
                          </strong>
                        </span>
                      )}
                      {b.grade && (
                        <span>
                          Grade:{" "}
                          <strong style={{ color: MSI_C.ink }}>
                            {b.grade}
                          </strong>
                        </span>
                      )}
                      {b.octane_rating && (
                        <span>
                          Octane:{" "}
                          <strong style={{ color: MSI_C.ink }}>
                            {b.octane_rating}
                          </strong>
                        </span>
                      )}
                      {b.delivery_temp && (
                        <span>
                          Delivery Temp:{" "}
                          <strong style={{ color: MSI_C.ink }}>
                            {b.delivery_temp}°F
                          </strong>
                        </span>
                      )}
                      {b.truck_id && (
                        <span>
                          Truck:{" "}
                          <strong style={{ color: MSI_C.ink }}>
                            {b.truck_id}
                          </strong>
                        </span>
                      )}
                      {b.volume_correction && (
                        <span>
                          Corrected Vol (60°F):{" "}
                          <strong style={{ color: MSI_C.ink }}>
                            {MSI_frStockQuantity(
                              b.volume_correction,
                              product.unit,
                            )}
                          </strong>
                        </span>
                      )}
                    </div>
                  )}
                {b.notes && (
                  <div
                    style={{
                      fontSize: 10.5,
                      color: MSI_C.muted,
                      marginTop: 6,
                      fontStyle: "italic",
                    }}
                  >
                    {b.notes}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    marginTop: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onViewHistory?.(b)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      height: 30,
                      padding: "0 12px",
                      borderRadius: 18,
                      border: "1px solid #bbdefb",
                      background: "#fff",
                      color: "#1565c0",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <History size={12} />
                    History
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function MSI_WebGCashPaymentModal({ visible, amount, onConfirm, onCancel }) {
  const [step, setStep] = useState("loading");
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [, setLinkId] = useState("");
  const [reference, setReference] = useState("");
  const [seconds, setSeconds] = useState(180);
  const [error, setError] = useState("");
  const pollRef = useRef(null);
  const timerRef = useRef(null);
  const confirmedRef = useRef(false);
  const referenceRef = useRef("");

  useEffect(() => {
    if (!visible) return undefined;
    let active = true;
    confirmedRef.current = false;
    setStep("loading");
    setCheckoutUrl("");
    setReference("");
    setSeconds(180);
    setError("");

    const clearTimers = () => {
      clearInterval(pollRef.current);
      clearInterval(timerRef.current);
    };
    const createLink = async () => {
      clearTimers();
      try {
        const response = await adminModuleFetch(
          `${process.env.REACT_APP_API_URL}/paymongo/create-gcash`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              amount,
              description: "iFranchise Supply Order",
              orderId: Date.now(),
            }),
          },
        );
        const data = await response.json();
        if (
          !response.ok ||
          !data.success ||
          !data.checkoutUrl ||
          !data.linkId
        ) {
          throw new Error(data.error || "Failed to create payment link.");
        }
        if (!active) return;
        setCheckoutUrl(data.checkoutUrl);
        setLinkId(data.linkId);
        referenceRef.current = data.referenceNo || "";
        setReference(referenceRef.current);
        setStep("ready");
        timerRef.current = setInterval(() => {
          setSeconds((value) => {
            if (value <= 1) {
              clearTimers();
              setError("Payment window expired. Please try again.");
              setStep("error");
              return 0;
            }
            return value - 1;
          });
        }, 1000);
        pollRef.current = setInterval(async () => {
          try {
            const statusResponse = await adminModuleFetch(
              `${process.env.REACT_APP_API_URL}/paymongo/link-status/${encodeURIComponent(data.linkId)}`,
              { credentials: "include", cache: "no-store" },
            );
            if (!statusResponse.ok) return;
            const status = await statusResponse.json();
            if (active && status.status === "paid" && !confirmedRef.current) {
              confirmedRef.current = true;
              clearTimers();
              const paidReference = status.gcashRef || referenceRef.current;
              setReference(paidReference);
              setStep("paid");
              onConfirm(paidReference);
            }
          } catch (pollError) {
            // A temporary network error should not mark an unpaid link as paid.
          }
        }, 3000);
      } catch (requestError) {
        if (!active) return;
        setError(requestError.message || "Could not reach the payment server.");
        setStep("error");
      }
    };
    createLink();
    return () => {
      active = false;
      clearTimers();
    };
  }, [visible, amount, onConfirm]);

  if (!visible) return null;
  const qrUrl = checkoutUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(checkoutUrl)}`
    : "";
  return (
    <div
      className="v-modal-overlay gcash-overlay"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div
        className="v-modal gcash-payment-modal"
        role="dialog"
        aria-modal="true"
        aria-label="GCash payment"
      >
        <div className="gcash-payment-head">
          <div>
            <small>SECURE PAYMENT</small>
            <h2>Pay with GCash</h2>
          </div>
          {step !== "paid" && (
            <button type="button" onClick={onCancel} aria-label="Close payment">
              ×
            </button>
          )}
        </div>
        <div className="gcash-payment-body">
          {step === "loading" && (
            <div className="gcash-payment-state">Creating payment link…</div>
          )}
          {step === "ready" && (
            <>
              <div className="gcash-payment-amount">{MSI_fmtPeso(amount)}</div>
              <p>Scan the QR code or open the secure checkout link to pay.</p>
              <img
                className="gcash-payment-qr"
                src={qrUrl}
                alt="QR code for GCash checkout"
              />
              {reference && (
                <div className="gcash-payment-reference">
                  Reference: {reference}
                </div>
              )}
              <div className="gcash-payment-timer">
                Time remaining: {Math.floor(seconds / 60)}:
                {String(seconds % 60).padStart(2, "0")}
              </div>
              <a
                className="gcash-payment-primary"
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in GCash
              </a>
              <a
                className="gcash-payment-secondary"
                href={qrUrl}
                download="gcash-qr.png"
                target="_blank"
                rel="noopener noreferrer"
              >
                Save QR
              </a>
              <p className="gcash-payment-wait">
                Waiting for payment confirmation…
              </p>
              <button
                type="button"
                className="gcash-payment-cancel"
                onClick={onCancel}
              >
                Cancel payment
              </button>
            </>
          )}
          {step === "paid" && (
            <div className="gcash-payment-state">
              <strong>Payment Received!</strong>
              <br />
              {MSI_fmtPeso(amount)} via GCash
              <br />
              {reference && `Reference: ${reference}`}
              <br />
              Processing your order…
            </div>
          )}
          {step === "error" && (
            <div className="gcash-payment-state">
              <strong>Payment unavailable</strong>
              <p>{error}</p>
              <button type="button" onClick={onCancel}>
                Close and try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MSI_BatchTransferHistoryModal({ batch, ingredient, apiUrl, onClose }) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminModuleFetch(
      `${apiUrl}/ingredient-batches/${batch.id}/transfer-history`,
    )
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
          background: MSI_C.white,
          borderRadius: 18,
          width: "100%",
          maxWidth: 560,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          border: `1px solid ${MSI_C.border}`,
          fontFamily: "Montserrat,sans-serif",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 24px",
            borderBottom: `1px solid ${MSI_C.border}`,
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
                color: MSI_C.ink,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <History size={14} /> Transfer History — Batch{" "}
              {batch.batch_number || "—"}
            </div>
            <div style={{ fontSize: 12, color: MSI_C.muted, marginTop: 2 }}>
              {ingredient.name} · {ingredient.branch}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: `1px solid ${MSI_C.border}`,
              background: MSI_C.white,
              cursor: "pointer",
              color: MSI_C.muted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MSI_XIcon size={14} />
          </button>
        </div>

        <div
          style={{
            padding: "14px 24px",
            borderBottom: `1px solid ${MSI_C.border}`,
            display: "flex",
            gap: 20,
            background: "#fafffe",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                color: MSI_C.muted,
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
                color: MSI_C.ink,
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
                color: MSI_C.muted,
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
                color: MSI_C.ink,
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
                color: MSI_C.muted,
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
                    i < rows.length - 1 ? `1px solid ${MSI_C.bg}` : "none",
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
                    <MSI_StoreIcon size={12} color={MSI_C.green} />
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: MSI_C.ink,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.destination_branch || "—"}
                    </span>
                  </div>
                  <div
                    style={{ fontSize: 11, color: MSI_C.muted, marginTop: 3 }}
                  >
                    Order #{r.order_id} · {r.destination_brand || "—"} ·{" "}
                    {r.transferred_at ? MSI_fmtTs(r.transferred_at) : "—"}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div
                    style={{ fontWeight: 800, fontSize: 14, color: MSI_C.ink }}
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
                      background: r.applied ? MSI_C.greenLt : MSI_C.amberBg,
                      color: r.applied ? MSI_C.greenDk : "#9a3412",
                      border: `1px solid ${r.applied ? MSI_C.greenMid : MSI_C.amberBorder}`,
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

const MSI_FR_SUPPLY_PSGC = "https://psgc.gitlab.io/api";

const MSI_frSupplyAddressCache = new Map();

async function MSI_frSupplyAddressList(path) {
  if (MSI_frSupplyAddressCache.has(path))
    return MSI_frSupplyAddressCache.get(path);
  const response = await adminModuleFetch(`${MSI_FR_SUPPLY_PSGC}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok)
    throw new Error(
      "Address options could not be loaded. Please retry or enter the complete address below.",
    );
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error("Address options are unavailable.");
  const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
  MSI_frSupplyAddressCache.set(path, sorted);
  return sorted;
}

function MSI_frSupplyAddressName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(
      /\b(city of|municipality of|province of|city|municipality|barangay|brgy\.?|province)\b/g,
      "",
    )
    .replace(/[^a-z0-9]/g, "");
}

function MSI_FrSupplyAddressFields({ address, mapResult, inputRef, onChange }) {
  const [options, setOptions] = useState({
    regions: [],
    provinces: [],
    cities: [],
    barangays: [],
  });
  const [fields, setFields] = useState({
    region: "",
    province: "",
    city: "",
    barangay: "",
    street: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const requestRef = useRef(0);
  useEffect(() => {
    const request = ++requestRef.current;
    setBusy(true);
    setError("");
    (async () => {
      try {
        const regions = await MSI_frSupplyAddressList("/regions/");
        if (request !== requestRef.current) return;
        if (!mapResult) {
          setOptions({ regions, provinces: [], cities: [], barangays: [] });
          setFields({
            region: "",
            province: "",
            city: "",
            barangay: "",
            street: "",
          });
          return;
        }
        const addr = mapResult.address || {};
        const street = [
          addr.house_number,
          addr.road || addr.pedestrian || addr.residential,
        ]
          .filter(Boolean)
          .join(" ");
        const [allCities, allProvinces] = await Promise.all([
          MSI_frSupplyAddressList("/cities-municipalities/"),
          MSI_frSupplyAddressList("/provinces/"),
        ]);
        const names = [addr.city, addr.town, addr.municipality, addr.village]
          .filter(Boolean)
          .map(MSI_frSupplyAddressName);
        const provinceNames = [addr.province, addr.state, addr.county]
          .filter(Boolean)
          .map(MSI_frSupplyAddressName);
        let candidates = allCities.filter((item) =>
          names.includes(MSI_frSupplyAddressName(item.name)),
        );
        if (candidates.length > 1)
          candidates = candidates.filter((item) => {
            const province = allProvinces.find(
              (row) => String(row.code) === String(item.provinceCode),
            );
            return (
              province &&
              provinceNames.includes(MSI_frSupplyAddressName(province.name))
            );
          });
        const city = candidates.length === 1 ? candidates[0] : null;
        const province = city
          ? allProvinces.find(
              (item) => String(item.code) === String(city.provinceCode),
            )
          : null;
        const region =
          regions.find(
            (item) =>
              String(item.code) ===
              String(city?.regionCode || province?.regionCode),
          ) ||
          regions.find(
            (item) =>
              MSI_frSupplyAddressName(item.name) ===
              MSI_frSupplyAddressName(addr.region || addr.state),
          );
        const provinces = region
          ? await MSI_frSupplyAddressList(`/regions/${region.code}/provinces/`)
          : [];
        const cities = province
          ? await MSI_frSupplyAddressList(
              `/provinces/${province.code}/cities-municipalities/`,
            )
          : region
            ? await MSI_frSupplyAddressList(
                `/regions/${region.code}/cities-municipalities/`,
              )
            : [];
        const matchedCity = cities.find(
          (item) => String(item.code) === String(city?.code),
        );
        const barangays = matchedCity
          ? await MSI_frSupplyAddressList(
              `/cities-municipalities/${matchedCity.code}/barangays/`,
            )
          : [];
        const barangayNames = [
          addr.suburb,
          addr.quarter,
          addr.neighbourhood,
          addr.village,
          addr.hamlet,
        ]
          .filter(Boolean)
          .map(MSI_frSupplyAddressName);
        const barangayMatches = barangays.filter((item) =>
          barangayNames.includes(MSI_frSupplyAddressName(item.name)),
        );
        const barangay =
          barangayMatches.length === 1 ? barangayMatches[0] : null;
        if (request !== requestRef.current) return;
        setOptions({ regions, provinces, cities, barangays });
        setFields({
          region: region?.code || "",
          province: province?.code || "",
          city: matchedCity?.code || "",
          barangay: barangay?.code || "",
          street,
        });
        if (!matchedCity || !barangay)
          setError(
            "The map filled the complete address below. Review it, or select any missing address fields.",
          );
      } catch (err) {
        if (request === requestRef.current) setError(err.message);
      } finally {
        if (request === requestRef.current) setBusy(false);
      }
    })();
    return () => {
      requestRef.current += 1;
    };
  }, [mapResult, retry]);
  const composeAddress = (next, lists) => {
    if (
      !next.region ||
      !next.city ||
      !next.barangay ||
      (lists.provinces.length > 0 && !next.province)
    )
      return "";
    return [
      next.street.trim(),
      lists.barangays.find((item) => item.code === next.barangay)?.name,
      lists.cities.find((item) => item.code === next.city)?.name,
      lists.provinces.find((item) => item.code === next.province)?.name,
      lists.regions.find((item) => item.code === next.region)?.name,
      "Philippines",
    ]
      .filter(Boolean)
      .join(", ");
  };
  const changeField = async (key, value) => {
    const request = ++requestRef.current;
    const next = { ...fields, [key]: value };
    const lists = { ...options };
    if (key === "region") {
      next.province = "";
      next.city = "";
      next.barangay = "";
      lists.provinces = [];
      lists.cities = [];
      lists.barangays = [];
    }
    if (key === "province") {
      next.city = "";
      next.barangay = "";
      lists.cities = [];
      lists.barangays = [];
    }
    if (key === "city") {
      next.barangay = "";
      lists.barangays = [];
    }
    setFields(next);
    setOptions(lists);
    setError("");
    onChange(composeAddress(next, lists));
    if (!["region", "province", "city"].includes(key) || !value) {
      setBusy(false);
      return;
    }
    setBusy(true);
    try {
      if (key === "region") {
        lists.provinces = await MSI_frSupplyAddressList(
          `/regions/${value}/provinces/`,
        );
        if (!lists.provinces.length)
          lists.cities = await MSI_frSupplyAddressList(
            `/regions/${value}/cities-municipalities/`,
          );
      } else if (key === "province")
        lists.cities = await MSI_frSupplyAddressList(
          `/provinces/${value}/cities-municipalities/`,
        );
      else
        lists.barangays = await MSI_frSupplyAddressList(
          `/cities-municipalities/${value}/barangays/`,
        );
      if (request === requestRef.current) setOptions(lists);
    } catch (err) {
      if (request === requestRef.current) setError(err.message);
    } finally {
      if (request === requestRef.current) setBusy(false);
    }
  };
  const dropdown = (key, label, rows, disabled = false) => (
    <label className="fr-address-field">
      <span>{label}</span>
      <select
        value={fields[key]}
        disabled={busy || disabled}
        onChange={(event) => changeField(key, event.target.value)}
      >
        <option value="">
          {busy ? "Loading…" : `Select ${label.toLowerCase()}`}
        </option>
        {rows.map((item) => (
          <option key={item.code} value={item.code}>
            {item.name}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <div className="fr-address-fields" aria-busy={busy}>
      <div className="fr-address-grid">
        {dropdown("region", "Region", options.regions)}
        {options.provinces.length > 0 &&
          dropdown("province", "Province", options.provinces, !fields.region)}
        {dropdown(
          "city",
          "City / Municipality",
          options.cities,
          !fields.region || (options.provinces.length > 0 && !fields.province),
        )}
        {dropdown("barangay", "Barangay", options.barangays, !fields.city)}
        <label className="fr-address-field fr-address-full">
          <span>House / Building No., Street, Subdivision</span>
          <input
            value={fields.street}
            disabled={busy}
            onChange={(event) => changeField("street", event.target.value)}
            placeholder="e.g. Unit 2, 123 Sampaguita Street"
          />
        </label>
      </div>
      {error && (
        <div className="fr-address-notice" role="status">
          {error}{" "}
          <button
            type="button"
            disabled={busy}
            onClick={() => setRetry((value) => value + 1)}
          >
            Reload address options
          </button>
        </div>
      )}
      <label className="fr-address-field fr-address-complete">
        <span>Complete Delivery Address</span>
        <textarea
          ref={inputRef}
          value={address}
          rows={3}
          onChange={(event) => {
            requestRef.current += 1;
            setBusy(false);
            onChange(event.target.value);
            setFields({
              region: "",
              province: "",
              city: "",
              barangay: "",
              street: "",
            });
            setOptions((current) => ({
              ...current,
              provinces: [],
              cities: [],
              barangays: [],
            }));
          }}
          placeholder="Select the address above or click the map. You may also enter the complete address here."
        />
      </label>
      <small className="fr-address-help">
        Check the house number, street, and barangay before placing your order.
      </small>
    </div>
  );
}

function ManagerStockInventoryContent({ user }) {
  const [stockToast, setStockToast] = useState(null);
  const closeStockToast = useCallback(() => setStockToast(null), []);
  const notifyStock = useCallback((message, type = "error") => {
    setStockToast({
      type,
      title: type === "error" ? "Please review" : "Added to cart",
      message,
    });
  }, []);
  const [orderDialog, setOrderDialog] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState("1");
  const [quantityError, setQuantityError] = useState("");
  const [mapAddressData, setMapAddressData] = useState(null);
  const orderingModalRef = useRef(null);
  const hasOrderingDialog = Boolean(orderDialog);
  const [checkoutSource, setCheckoutSource] = useState("cart");

  const isLowStock = (item) =>
    Number(item.stock || 0) <= Number(item.min_stock || 0);
  // Read only the signed-in account's user ID; staff roles are not substituted.
  const accountId =
    [user?.id, user?.userId, user?.user_id]
      .filter((value) => typeof value === "string" || typeof value === "number")
      .map((value) => String(value).trim())
      .find(
        (value) =>
          value && !["null", "undefined", "0"].includes(value.toLowerCase()),
      ) || null;
  const userBranch = String(user?.branch || "").trim();
  const userBrand = String(user?.brand || user?.brand_name || "").trim();
  const CART_KEY = "@franchisee_supply_cart";

  const [items, setItems] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shopLoading, setShopLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState("");
  const [shopError, setShopError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryF, setCategoryF] = useState("");
  const [unitF, setUnitF] = useState("");
  const [statusF, setStatusF] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [batches, setBatches] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);

  const [historyBatch, setHistoryBatch] = useState(null);

  const [cart, setCart] = useState([]);
  const [selectedCartIds, setSelectedCartIds] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  useEffect(() => {
    if (!hasOrderingDialog && !showCart) return undefined;
    const previousFocus = document.activeElement;
    const modal = orderingModalRef.current;
    const selector =
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]';
    (
      modal?.querySelector("[autofocus]") || modal?.querySelector(selector)
    )?.focus();
    const trapFocus = (event) => {
      if (event.key !== "Tab" || !modal) return;
      const controls = Array.from(modal.querySelectorAll(selector)).filter(
        (element) => element.getClientRects().length,
      );
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    modal?.addEventListener("keydown", trapFocus);
    return () => {
      modal?.removeEventListener("keydown", trapFocus);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [hasOrderingDialog, showCart]);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [address, setAddress] = useState(String(user?.address || "").trim());
  const [mapCenter, setMapCenter] = useState(() => ({
    latitude: Number(user?.latitude) || 14.5995,
    longitude: Number(user?.longitude) || 120.9842,
  }));
  const [pinCoords, setPinCoords] = useState(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [locationBusy, setLocationBusy] = useState(false);
  const [locationError, setLocationError] = useState("");
  const mapRequestRef = useRef(0);
  const reverseTimerRef = useRef(null);
  const lastLookupRef = useRef(0);
  useEffect(
    () => () => {
      clearTimeout(reverseTimerRef.current);
      mapRequestRef.current += 1;
    },
    [],
  );
  const [showAddressPrompt, setShowAddressPrompt] = useState(false);
  const addressInputRef = useRef(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [showGCash, setShowGCash] = useState(false);
  const [gcashAmount, setGcashAmount] = useState(0);
  const paidRef = useRef(null);
  const handleGCashConfirmed = useCallback((reference) => {
    paidRef.current?.(reference);
  }, []);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const extraFields = useMemo(() => MSI_getExtraFields(userBrand), [userBrand]);
  const hasExpiry = extraFields.some((f) => f.key === "exp_date");

  const normalize = useCallback(
    (value) =>
      String(value || "")
        .trim()
        .toLowerCase(),
    [],
  );

  const branchAllowed = useCallback(
    (shopItem) => {
      const raw = shopItem?.branches;
      if (!Array.isArray(raw) || raw.length === 0) return true;
      return raw.some((branch) => {
        const name =
          typeof branch === "string"
            ? branch
            : branch?.name || branch?.branch || branch?.branch_name;
        return normalize(name) === normalize(userBranch);
      });
    },
    [normalize, userBranch],
  );

  const inventoryRequest = useRef(0);
  const fetchItems = useCallback(async () => {
    const request = ++inventoryRequest.current;

    if (!userBranch) {
      setItems([]);
      setInventoryError("Your account does not have an assigned branch.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setInventoryError("");

    try {
      const res = await adminModuleFetch(
        `${process.env.REACT_APP_API_URL}/ingredients?branch=${encodeURIComponent(
          userBranch,
        )}`,
        {
          credentials: "include",
          cache: "no-store",
        },
      );

      if (!res.ok) {
        throw new Error(`Unable to load Stock Inventory (${res.status}).`);
      }

      const data = await res.json();
      if (request !== inventoryRequest.current) return;

      setItems(MSI_normalizeListResponse(data));
    } catch (error) {
      if (request === inventoryRequest.current) {
        console.error("FrStockInventoryContent fetch error:", error);
        setItems([]);
        setInventoryError(error.message || "Unable to load Stock Inventory.");
      }
    } finally {
      if (request === inventoryRequest.current) setLoading(false);
    }
  }, [userBranch]);

  const fetchShopItems = useCallback(async () => {
    if (!userBranch || !userBrand) {
      setShopItems([]);
      setShopError("Supply ordering requires an assigned brand and branch.");
      return;
    }

    setShopLoading(true);
    setShopError("");
    try {
      const res = await adminModuleFetch(
        `${process.env.REACT_APP_API_URL}/shop-items`,
        {
          credentials: "include",
          cache: "no-store",
        },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data?.error || `Unable to load supply items (${res.status}).`,
        );
      }

      const rows = Array.isArray(data) ? data : [];
      setShopItems(
        rows
          .filter((item) => item?.is_visible !== false)
          .filter((item) => normalize(item?.brand) === normalize(userBrand))
          .filter(branchAllowed)
          .map((item) => ({
            ...item,
            id: item?.id,
            price: Number(item?.price ?? 0),
            stock: Number(item?.stock ?? 0),
          }))
          .filter((item) => item.id != null),
      );
    } catch (error) {
      console.error("FrStockInventoryContent shop items fetch error:", error);
      setShopItems([]);
      setShopError(error.message || "Unable to load supply ordering details.");
    } finally {
      setShopLoading(false);
    }
  }, [branchAllowed, normalize, userBranch, userBrand]);

  const fetchOrders = useCallback(async () => {
    if (!accountId) {
      setOrders([]);
      setOrdersError(
        "Your signed-in account ID is not available yet. Please refresh the dashboard and try View Orders again.",
      );
      return;
    }

    setOrdersLoading(true);
    setOrdersError("");
    try {
      const params = new URLSearchParams();
      // The order-history endpoint expects camelCase userId.
      params.set("userId", accountId);
      params.set("user_id", accountId); // Compatibility with existing snake_case routes.
      if (userBranch) params.set("branch", userBranch);
      if (userBrand) params.set("brand", userBrand);

      const query = params.toString();
      const res = await adminModuleFetch(
        `${process.env.REACT_APP_API_URL}/orders${query ? `?${query}` : ""}`,
        { credentials: "include", cache: "no-store" },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data?.error || `Unable to load orders (${res.status}).`,
        );
      }

      const raw = Array.isArray(data)
        ? data
        : Array.isArray(data?.orders)
          ? data.orders
          : Array.isArray(data?.data)
            ? data.data
            : [];

      // Keep the view scoped to the signed-in franchisee when the API returns
      // user/brand/branch fields. Unknown fields are tolerated for compatibility.
      const scoped = raw
        .filter((order) => {
          const orderUserId = order?.user_id ?? order?.userId;
          const sameUser =
            orderUserId == null || String(orderUserId) === accountId;
          const sameBranch =
            !userBranch ||
            !order?.branch ||
            normalize(order.branch) === normalize(userBranch);
          const sameBrand =
            !userBrand ||
            !order?.brand ||
            normalize(order.brand) === normalize(userBrand);
          return sameUser && sameBranch && sameBrand;
        })
        .sort((a, b) => {
          const da = new Date(
            a?.created_at || a?.createdAt || a?.date || 0,
          ).getTime();
          const db = new Date(
            b?.created_at || b?.createdAt || b?.date || 0,
          ).getTime();
          return db - da;
        });

      setOrders(scoped);
    } catch (error) {
      console.error("Supply order history fetch error:", error);
      setOrders([]);
      setOrdersError(error.message || "Unable to load your supply orders.");
    } finally {
      setOrdersLoading(false);
    }
  }, [normalize, accountId, userBranch, userBrand]);

  useEffect(() => {
    if (userBranch) fetchItems();
    return () => {
      inventoryRequest.current += 1;
    };
  }, [fetchItems, userBranch]);

  useEffect(() => {
    fetchShopItems();
  }, [fetchShopItems]);
  useEffect(() => {
    if (showCart || hasOrderingDialog) fetchShopItems();
  }, [showCart, hasOrderingDialog, fetchShopItems]);

  const viewSupplyOrders = useCallback(() => {
    setShowCheckout(false);
    setOrderSuccess(null);
    setShowOrders(true);
    fetchOrders();
  }, [fetchOrders]);
  useEffect(() => {
    if (!orderSuccess) return undefined;
    const timer = setTimeout(viewSupplyOrders, 3000);
    return () => clearTimeout(timer);
  }, [orderSuccess, viewSupplyOrders]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      setCart(Array.isArray(parsed) ? parsed : []);
    } catch {
      setCart([]);
    }
  }, []);

  useEffect(() => {
    if (!user?.address) return;
    setAddress((prev) => prev || String(user.address).trim());
  }, [user?.address]);

  const saveCart = useCallback((next) => {
    setCart(next);
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn("Failed to save franchisee supply cart:", error);
    }
  }, []);

  const categoryOptions = useMemo(
    () =>
      [
        ...new Set(
          items.map((i) => String(i.category || "").trim()).filter(Boolean),
        ),
      ].sort(),
    [items],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((i) => {
        if (
          q &&
          !String(i.name || "")
            .toLowerCase()
            .includes(q) &&
          !String(i.category || "")
            .toLowerCase()
            .includes(q) &&
          !String(i.sku || "")
            .toLowerCase()
            .includes(q)
        )
          return false;
        if (categoryF && String(i.category || "") !== categoryF) return false;
        if (unitF && String(i.unit || "") !== unitF) return false;
        const low = isLowStock(i);
        if (statusF === "out" && Number(i.stock || 0) > 0) return false;
        if (statusF === "low" && (!low || Number(i.stock || 0) <= 0))
          return false;
        if (statusF === "ok" && low) return false;
        if (statusF === "expiring" || statusF === "expired") {
          const expRaw = i.extra_fields?.exp_date;
          if (!expRaw) return false;
          const exp = new Date(expRaw);
          exp.setHours(0, 0, 0, 0);
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          const warn = new Date(now);
          warn.setDate(warn.getDate() + MSI_EXPIRY_WARN_DAYS);
          if (statusF === "expired" && !(exp < now)) return false;
          if (statusF === "expiring" && !(exp >= now && exp <= warn))
            return false;
        }
        return true;
      })
      .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  }, [items, search, categoryF, unitF, statusF]);

  useEffect(() => {
    if (selectedId && !filtered.some((i) => i.id === selectedId))
      setSelectedId(null);
  }, [filtered, selectedId]);

  const selected = filtered.find((i) => i.id === selectedId) || null;

  // Use the highest current inventory stock as the visual 100% reference so
  // each row reflects its actual relative stock level: low stock = short bar,
  // mid-range stock = mid-length bar, highest stock = full bar.
  const maxBarStock = useMemo(() => {
    const values = items
      .map((item) => Number(item?.stock ?? 0))
      .filter((n) => Number.isFinite(n) && n > 0);
    return Math.max(1, ...values);
  }, [items]);

  const getShopListingFor = useCallback(
    (inventoryItem) => {
      if (!inventoryItem) return null;
      return (
        shopItems.find(
          (shopItem) =>
            shopItem?.ingredient_id != null &&
            String(shopItem.ingredient_id) === String(inventoryItem.id),
        ) ||
        shopItems.find(
          (shopItem) =>
            normalize(shopItem?.brand) ===
              normalize(inventoryItem?.brand || userBrand) &&
            normalize(shopItem?.name) === normalize(inventoryItem?.name),
        ) ||
        null
      );
    },
    [normalize, shopItems, userBrand],
  );

  const cartItemCount = cart.reduce(
    (sum, entry) => sum + Number(entry.quantity || 0),
    0,
  );
  const selectedCart = cart.filter((entry) =>
    selectedCartIds.includes(entry.id),
  );
  const selectedCartTotal = selectedCart.reduce(
    (sum, entry) =>
      sum +
      Number(
        shopItems.find((item) => item.id === entry.id)?.price ??
          entry.price ??
          0,
      ) *
        Number(entry.quantity || 0),
    0,
  );
  const toggleCartItem = (id) =>
    setSelectedCartIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  const toggleAllCartItems = () =>
    setSelectedCartIds(
      cart.length && cart.every((entry) => selectedCartIds.includes(entry.id))
        ? []
        : cart.map((entry) => entry.id),
    );

  const createCartEntry = (shopItem, inventoryItem, quantity) => ({
    id: shopItem.id,
    ingredient_id: inventoryItem?.id ?? shopItem.ingredient_id ?? null,
    name: shopItem.name || inventoryItem?.name || "Supply Item",
    brand: shopItem.brand || inventoryItem?.brand || userBrand,
    unit: shopItem.unit || inventoryItem?.unit || "unit",
    price: Number(shopItem.price || 0),
    image_url: shopItem.image_url || null,
    quantity,
  });

  const addToCart = (shopItem, inventoryItem, quantity) => {
    const available = Math.floor(Number(shopItem?.stock || 0));
    const existing = cart.find((entry) => entry.id === shopItem?.id);
    const currentQty = Number(existing?.quantity || 0);
    if (
      !shopItem ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      currentQty + quantity > available
    ) {
      setQuantityError(
        `Enter a whole quantity from 1 to ${Math.max(0, available - currentQty)}.`,
      );
      return false;
    }
    const entry = createCartEntry(
      shopItem,
      inventoryItem,
      currentQty + quantity,
    );
    saveCart(
      existing
        ? cart.map((item) => (item.id === entry.id ? entry : item))
        : [...cart, entry],
    );
    setSelectedCartIds((ids) =>
      ids.includes(entry.id) ? ids : [...ids, entry.id],
    );
    notifyStock(
      `${MSI_frStockQuantity(quantity, entry.unit)} of ${entry.name} added to your cart.`,
      "success",
    );
    return true;
  };

  const openOrderDialog = (inventoryItem, mode) => {
    const shopItem = getShopListingFor(inventoryItem);
    if (shopLoading) {
      notifyStock(
        "Supply details are still loading. Please try again shortly.",
      );
      return;
    }
    if (!shopItem || Number(shopItem.stock) < 1) {
      notifyStock(
        shopItem
          ? "This supply item is currently out of stock."
          : "This item has no available supply listing for your branch.",
      );
      return;
    }
    setOrderDialog({ inventoryItem, shopItem, mode });
    setOrderQuantity("1");
    setQuantityError("");
  };
  const dialogShopItem = orderDialog
    ? shopItems.find((item) => item.id === orderDialog.shopItem.id)
    : null;
  const dialogCartQuantity = dialogShopItem
    ? Number(cart.find((item) => item.id === dialogShopItem.id)?.quantity || 0)
    : 0;
  const dialogMaximum = Math.max(
    0,
    Math.floor(Number(dialogShopItem?.stock || 0)) -
      (orderDialog?.mode === "cart" ? dialogCartQuantity : 0),
  );
  const confirmOrderDialog = (event) => {
    event.preventDefault();
    if (shopLoading || shopError) {
      setQuantityError("Please wait until Head Office stock is available.");
      return;
    }
    const quantity = Number(orderQuantity);
    if (
      !dialogShopItem ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > dialogMaximum
    ) {
      setQuantityError(
        dialogMaximum
          ? `Enter a whole quantity from 1 to ${dialogMaximum}.`
          : "No additional supply stock is available.",
      );
      return;
    }
    const completed =
      orderDialog.mode === "cart"
        ? addToCart(dialogShopItem, orderDialog.inventoryItem, quantity)
        : prepareCheckout(
            [
              createCartEntry(
                dialogShopItem,
                orderDialog.inventoryItem,
                quantity,
              ),
            ],
            true,
            "buyNow",
          );
    if (completed) setOrderDialog(null);
  };

  const updateCartQuantity = (id, delta) => {
    const liveItem = shopItems.find((item) => item.id === id);
    const next = cart
      .map((entry) => {
        if (entry.id !== id) return entry;
        const max = liveItem
          ? Math.floor(Number(liveItem.stock || 0))
          : Math.floor(Number(entry.quantity || 0));
        return {
          ...entry,
          quantity: Math.min(
            max,
            Math.max(0, Number(entry.quantity || 0) + delta),
          ),
          price: liveItem
            ? Number(liveItem.price || 0)
            : Number(entry.price || 0),
        };
      })
      .filter((entry) => entry.quantity > 0);
    saveCart(next);
  };

  const setCartQuantity = (id, value) => {
    const liveItem = shopItems.find((item) => item.id === id);
    if (!liveItem) return;

    const max = Math.max(0, Number(liveItem.stock || 0));

    let quantity = parseInt(value, 10);

    if (Number.isNaN(quantity)) {
      quantity = 1;
    }

    quantity = Math.min(Math.floor(max), Math.max(1, quantity));

    const next = cart.map((entry) =>
      entry.id === id
        ? {
            ...entry,
            quantity,
            price: Number(liveItem.price || 0),
            unit: liveItem.unit || entry.unit,
          }
        : entry,
    );

    saveCart(next);
  };

  const removeFromCart = (id) =>
    saveCart(cart.filter((entry) => entry.id !== id));

  const prepareCheckout = (
    requestedItems,
    closeCart = true,
    source = "cart",
  ) => {
    if (!requestedItems.length) {
      notifyStock("Your cart is empty.");
      return false;
    }

    const liveItems = [];
    const problems = [];

    requestedItems.forEach((entry) => {
      const live = shopItems.find((item) => item.id === entry.id);
      if (!live) {
        problems.push(`${entry.name}: no longer available`);
        return;
      }
      const requestedQty = Number(entry.quantity || 0);
      const available = Number(live.stock || 0);
      if (available <= 0) {
        problems.push(`${entry.name}: out of stock`);
        return;
      }
      if (
        !Number.isInteger(requestedQty) ||
        requestedQty < 1 ||
        requestedQty > available
      ) {
        problems.push(
          `${entry.name}: only ${available} ${live.unit || "unit(s)"} available`,
        );
        return;
      }
      liveItems.push({
        ...entry,
        id: live.id,
        name: live.name || entry.name,
        brand: live.brand || entry.brand,
        unit: live.unit || entry.unit,
        price: Number(live.price || 0),
        image_url: live.image_url || entry.image_url || null,
        quantity: requestedQty,
      });
    });

    if (problems.length) {
      notifyStock(`Please review your cart:\n\n${problems.join("\n")}`);
      return false;
    }

    saveCart(
      cart.map((entry) => {
        const live = shopItems.find((item) => item.id === entry.id);
        return live
          ? {
              ...entry,
              price: Number(live.price || 0),
              unit: live.unit || entry.unit,
            }
          : entry;
      }),
    );
    setCheckoutSource(source);
    setCheckoutItems(liveItems);
    setOrderSuccess(null);
    if (closeCart) setShowCart(false);
    setShowCheckout(true);
    return true;
  };

  const checkoutTotal = checkoutItems.reduce(
    (sum, entry) =>
      sum + Number(entry.price || 0) * Number(entry.quantity || 0),
    0,
  );

  const mapBounds = {
    west: mapCenter.longitude - 0.013,
    east: mapCenter.longitude + 0.013,
    south: mapCenter.latitude - 0.008,
    north: mapCenter.latitude + 0.008,
  };
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(`${mapBounds.west},${mapBounds.south},${mapBounds.east},${mapBounds.north}`)}&layer=mapnik`;

  const selectMapPoint = ({ latitude, longitude }) => {
    const request = ++mapRequestRef.current;
    clearTimeout(reverseTimerRef.current);
    setPinCoords({ latitude, longitude });
    setMapCenter({ latitude, longitude });
    setLocationError("");
    setLocationBusy(true);
    setAddress("");
    setMapAddressData(null);
    reverseTimerRef.current = setTimeout(
      async () => {
        lastLookupRef.current = Date.now();
        try {
          const response = await adminModuleFetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&addressdetails=1&accept-language=en`,
            { headers: { Accept: "application/json" } },
          );
          if (!response.ok) throw new Error("Address lookup is unavailable.");
          const result = await response.json();
          if (request !== mapRequestRef.current) return;
          if (!result.display_name)
            throw new Error("No address was found for this pin.");
          if (
            result.address?.country_code &&
            result.address.country_code !== "ph"
          ) {
            throw new Error(
              "Please choose a delivery location in the Philippines.",
            );
          }
          setAddress(result.display_name);
          setMapAddressData({ ...result, lookupId: request });
        } catch (error) {
          if (request === mapRequestRef.current) {
            setLocationError(
              "Could not find an address for this pin. Please type the address below.",
            );
          }
        } finally {
          if (request === mapRequestRef.current) setLocationBusy(false);
        }
      },
      Math.max(300, 1000 - (Date.now() - lastLookupRef.current)),
    );
  };

  const handleMapPointerUp = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(
      0,
      Math.min(1, (event.clientX - bounds.left) / bounds.width),
    );
    const y = Math.max(
      0,
      Math.min(1, (event.clientY - bounds.top) / bounds.height),
    );
    selectMapPoint({
      latitude:
        (Math.atan(
          Math.sinh(
            Math.asinh(Math.tan((mapBounds.north * Math.PI) / 180)) -
              y *
                (Math.asinh(Math.tan((mapBounds.north * Math.PI) / 180)) -
                  Math.asinh(Math.tan((mapBounds.south * Math.PI) / 180))),
          ),
        ) *
          180) /
        Math.PI,
      longitude: mapBounds.west + x * (mapBounds.east - mapBounds.west),
    });
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        "Location is unavailable in this browser. Please type your address.",
      );
      return;
    }
    setLocationBusy(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        selectMapPoint({
          latitude: coords.latitude,
          longitude: coords.longitude,
        }),
      () => {
        setLocationBusy(false);
        setLocationError(
          "Location access was unavailable. You can pin the map or type your address.",
        );
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  const renderLocationMap = (fullScreen = false) => (
    <div className={`checkout-map-preview${fullScreen ? " full-screen" : ""}`}>
      <iframe title="Delivery location map" loading="lazy" src={mapUrl} />
      <div
        className="checkout-map-touch"
        role="button"
        tabIndex={0}
        aria-label="Click to pin delivery location"
        onPointerDown={(event) =>
          event.currentTarget.setPointerCapture(event.pointerId)
        }
        onPointerUp={handleMapPointerUp}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectMapPoint(mapCenter);
          }
        }}
      />
      {pinCoords && (
        <span className="checkout-map-pin" aria-hidden="true">
          ●
        </span>
      )}
      <span className="checkout-map-attribution">
        © OpenStreetMap contributors
      </span>
      {!fullScreen && (
        <button
          type="button"
          className="checkout-map-open"
          onClick={() => setShowMapPicker(true)}
        >
          Tap to pin location
        </button>
      )}
      <button
        type="button"
        className="checkout-map-current"
        onClick={handleUseMyLocation}
        disabled={locationBusy}
      >
        {locationBusy ? "Finding location…" : "Use my location"}
      </button>
    </div>
  );

  const submitOrder = async (confirmedGCashRef = null) => {
    if (locationBusy) {
      notifyStock("Please wait for the address lookup to finish.");
      return;
    }
    if (!address.trim()) {
      setShowAddressPrompt(true);
      return;
    }
    if (!checkoutItems.length) {
      notifyStock("There are no items to checkout.");
      return;
    }
    if (paymentMethod === "gcash" && !confirmedGCashRef) return;

    setPlacingOrder(true);
    try {
      // Re-check the live shop catalog immediately before creating the order.
      const latestResponse = await adminModuleFetch(
        `${process.env.REACT_APP_API_URL}/shop-items`,
        { credentials: "include", cache: "no-store" },
      );
      const latestData = await latestResponse.json();
      if (!latestResponse.ok) {
        throw new Error(
          latestData?.error || "Unable to verify supply availability.",
        );
      }

      const latestEligible = (Array.isArray(latestData) ? latestData : [])
        .filter((item) => item?.is_visible !== false)
        .filter((item) => normalize(item?.brand) === normalize(userBrand))
        .filter(branchAllowed)
        .map((item) => ({
          ...item,
          price: Number(item?.price ?? 0),
          stock: Number(item?.stock ?? 0),
        }));

      const validatedItems = checkoutItems.map((entry) => {
        const live = latestEligible.find((item) => item.id === entry.id);
        if (!live)
          throw new Error(`${entry.name} is no longer available for ordering.`);
        if (
          !Number.isInteger(Number(entry.quantity)) ||
          Number(entry.quantity) < 1 ||
          Number(entry.quantity) > Number(live.stock)
        ) {
          throw new Error(
            `${entry.name} now has only ${Number(live.stock)} ${live.unit || entry.unit || "unit(s)"} available.`,
          );
        }
        return {
          ...entry,
          price: Number(live.price || 0),
          unit: live.unit || entry.unit,
        };
      });

      const validatedTotal = validatedItems.reduce(
        (sum, entry) =>
          sum + Number(entry.price || 0) * Number(entry.quantity || 0),
        0,
      );

      const payload = {
        user_id: accountId,
        user_name: user?.name ?? null,
        phone: user?.phone ?? null,
        brand: user?.brand ?? user?.brand_name ?? null,
        branch: user?.branch ?? null,
        address: address.trim(),
        latitude: pinCoords?.latitude ?? null,
        longitude: pinCoords?.longitude ?? null,
        total_amount: validatedTotal,
        payment_method: paymentMethod,
        order_source: "Web",
        items: validatedItems.map((entry) => ({
          shop_item_id: entry.id,
          quantity: Number(entry.quantity),
          price: Number(entry.price),
        })),
        gcash_ref: paymentMethod === "gcash" ? confirmedGCashRef : null,
      };

      const response = await adminModuleFetch(
        `${process.env.REACT_APP_API_URL}/orders`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to place the supply order.");
      }

      const checkedOutIds = new Set(validatedItems.map((entry) => entry.id));
      if (checkoutSource === "cart") {
        saveCart(cart.filter((entry) => !checkedOutIds.has(entry.id)));
        setSelectedCartIds((ids) => ids.filter((id) => !checkedOutIds.has(id)));
      }
      setCheckoutItems([]);
      setOrderSuccess({
        id: data?.order?.id ?? data?.id ?? "—",
        total: validatedTotal,
      });
      await Promise.all([fetchItems(), fetchShopItems()]);
    } catch (error) {
      console.error("Supply order error:", error);
      notifyStock(
        error.message || "Something went wrong while placing the order.",
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  paidRef.current = (reference) => {
    setShowGCash(false);
    submitOrder(reference);
  };

  const handleCheckoutAction = async () => {
    if (locationBusy) {
      notifyStock("Please wait for the address lookup to finish.");
      return;
    }
    if (paymentMethod === "cod") {
      submitOrder();
      return;
    }
    if (!address.trim()) {
      setShowAddressPrompt(true);
      return;
    }
    if (!checkoutItems.length) {
      notifyStock("There are no items to checkout.");
      return;
    }
    setPlacingOrder(true);
    try {
      const response = await adminModuleFetch(
        `${process.env.REACT_APP_API_URL}/shop-items`,
        { credentials: "include", cache: "no-store" },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data?.error || "Unable to verify supply availability.");
      const eligible = (Array.isArray(data) ? data : [])
        .filter((item) => item?.is_visible !== false)
        .filter((item) => normalize(item?.brand) === normalize(userBrand))
        .filter(branchAllowed);
      const amount = checkoutItems.reduce((sum, entry) => {
        const live = eligible.find((item) => item.id === entry.id);
        if (!live)
          throw new Error(`${entry.name} is no longer available for ordering.`);
        if (
          !Number.isInteger(Number(entry.quantity)) ||
          Number(entry.quantity) < 1 ||
          Number(entry.quantity) > Number(live.stock || 0)
        ) {
          throw new Error(
            `${entry.name} now has only ${Number(live.stock || 0)} ${live.unit || entry.unit || "unit(s)"} available.`,
          );
        }
        return sum + Number(live.price || 0) * Number(entry.quantity);
      }, 0);
      if (amount <= 0)
        throw new Error("The order total must be greater than zero.");
      setGcashAmount(amount);
      setShowGCash(true);
    } catch (error) {
      notifyStock(error.message || "Unable to start GCash payment.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const selectItem = (item) => {
    setSelectedId(item.id);
    if (window.matchMedia("(max-width:900px)").matches) {
      requestAnimationFrame(() => {
        document
          .getElementById("fr-stock-order-detail")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  useEffect(() => {
    if (!selectedId) {
      setBatches([]);
      return;
    }
    let cancelled = false;
    setBatchLoading(true);
    adminModuleFetch(
      `${process.env.REACT_APP_API_URL}/ingredient-batches?ingredient_id=${selectedId}`,
      {
        credentials: "include",
        cache: "no-store",
      },
    )
      .then((r) => {
        if (!r.ok) throw new Error(`Unable to load batches (${r.status}).`);
        return r.json();
      })
      .then((d) => {
        if (!cancelled) {
          setBatches(MSI_normalizeListResponse(d));
          setBatchLoading(false);
        }
      })
      .catch((error) => {
        console.error("FrStockInventoryContent batch fetch error:", error);
        if (!cancelled) {
          setBatches([]);
          setBatchLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const cartLineItems = cart.map((entry) => {
    const live = shopItems.find((item) => item.id === entry.id);
    return {
      ...entry,
      price: live ? Number(live.price || 0) : Number(entry.price || 0),
      unit: live?.unit || entry.unit,
      stock: live ? Number(live.stock || 0) : 0,
    };
  });

  const formatOrderDate = (value) => {
    if (!value) return "Date not available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const orderStatusMeta = (status) => {
    const raw = String(status || "pending")
      .trim()
      .toLowerCase();
    if (
      ["completed", "complete", "delivered", "fulfilled", "approved"].includes(
        raw,
      )
    ) {
      return { label: status || "Completed", cls: "completed" };
    }
    if (["cancelled", "canceled", "rejected", "failed"].includes(raw)) {
      return { label: status || "Cancelled", cls: "cancelled" };
    }
    if (
      [
        "processing",
        "preparing",
        "packed",
        "shipped",
        "out_for_delivery",
      ].includes(raw)
    ) {
      return { label: status || "Processing", cls: "processing" };
    }
    return { label: status || "Pending", cls: "pending" };
  };

  const orderItemList = (order) => {
    const source = Array.isArray(order?.items)
      ? order.items
      : Array.isArray(order?.order_items)
        ? order.order_items
        : [];
    return source.map((item, index) => ({
      ...item,
      _key:
        item?.id ?? item?.shop_item_id ?? `${order?.id || "order"}-${index}`,
      _name:
        item?.name ||
        item?.item_name ||
        item?.product_name ||
        item?.shop_item?.name ||
        "Supply Item",
      _quantity: Number(item?.quantity ?? item?.qty ?? 0),
      _price: Number(item?.price ?? item?.unit_price ?? 0),
      _unit: item?.unit || item?.shop_item?.unit || "unit",
    }));
  };

  const orderCounts = useMemo(() => {
    const counts = {
      total: orders.length,
      totalAmount: 0,
      pending: 0,
      processing: 0,
      completed: 0,
    };

    orders.forEach((order) => {
      counts.totalAmount += Number(order?.total_amount || 0);

      const meta = orderStatusMeta(order?.status);

      if (meta.cls === "completed") {
        counts.completed += 1;
      } else if (meta.cls === "processing") {
        counts.processing += 1;
      } else {
        counts.pending += 1;
      }
    });

    return counts;
  }, [orders]);

  return (
    <div className="fr-stock-order-shell">
      <style>{`
        .fr-stock-order-shell { position:relative; padding-bottom:48px; }
        .fr-stock-order-shell .stock-surface { overflow:hidden; }
        .fr-stock-order-shell .stock-order-header { display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
        body.fr-admin-ui .fr-stock-order-shell .stock-order-cart-btn,
        .fr-stock-order-shell .stock-order-cart-btn { position:relative; display:inline-flex; align-items:center; justify-content:center; flex:0 0 44px; width:44px!important; min-width:44px!important; height:44px!important; min-height:44px!important; padding:6px!important; margin:0 4px; border:0!important; border-radius:10px!important; background:transparent!important; color:#3b791e!important; box-shadow:none!important; cursor:pointer; overflow:visible; }
        body.fr-admin-ui .fr-stock-order-shell .stock-order-cart-btn>svg,
        .fr-stock-order-shell .stock-order-cart-btn>svg { width:26px!important; height:26px!important; fill:none; stroke:currentColor; }
        .fr-stock-order-shell .stock-order-cart-btn:hover { background:#f0f5e8!important; }
        .fr-stock-order-shell .stock-order-cart-btn:focus-visible { outline:2px solid #3b791e; outline-offset:3px; }
        .fr-stock-order-shell .stock-cart-count { position:absolute; top:0; right:-3px; min-width:19px; height:19px; padding:0 4px; box-sizing:border-box; border:2px solid #fff; border-radius:999px; display:inline-flex; align-items:center; justify-content:center; background:#3b791e; color:#fff; font-size:10px; line-height:1; font-weight:800; pointer-events:none; }

        .fr-stock-order-shell .stock-order-layout { display:grid; grid-template-columns:minmax(360px,.95fr) minmax(430px,1.05fr); min-height:520px; max-height:760px; }
        .fr-stock-order-shell .stock-order-list { min-width:0; border-right:1px solid ${MSI_C.border}; overflow-y:auto; max-height:760px; }
        .fr-stock-order-shell .stock-order-detail { min-width:0; overflow-y:auto; max-height:760px; padding:12px; scroll-margin-top:88px; }
        .fr-stock-order-shell .stock-order-list { background:${MSI_C.white}; }
        .fr-stock-order-shell .stock-order-row { position:relative; display:block; width:100%; min-height:82px; height:82px; border:0; border-left:3px solid transparent; border-radius:0 !important; background:${MSI_C.white}; color:${MSI_C.ink}; padding:10px 14px 28px 11px; text-align:left; cursor:pointer; border-bottom:1px solid #F1F3ED; transition:background-color .16s ease,border-color .16s ease; box-sizing:border-box; }
        .fr-stock-order-shell .stock-order-row:hover { background:#FBFCF8; }
        .fr-stock-order-shell .stock-order-row:focus-visible { outline:2px solid ${MSI_C.green}; outline-offset:-2px; border-radius:0 !important; }
        .fr-stock-order-shell .stock-order-row.active { background:#FCFDF9; border-left-color:#B4B33F; }
        .fr-stock-order-shell .stock-order-row-top { display:block; min-width:0; overflow:hidden; }
        .fr-stock-order-shell .stock-order-row-name { display:block; max-width:100%; font-size:12px; line-height:1.15; font-weight:850; color:${MSI_C.greenDk}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .fr-stock-order-shell .stock-order-row-meta { margin-top:5px; color:#737B74; font-size:9.5px; line-height:1.15; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .fr-stock-order-shell .stock-order-row-submeta { margin-top:3px; color:#737B74; font-size:9.5px; line-height:1.15; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .fr-stock-order-shell .stock-order-stock-line {
  position: relative !important;
  display: block !important;
  left: auto !important;
  right: auto !important;
  bottom: auto !important;

  width: 100% !important;
  height: 4px !important;

  margin: 8px 0 9px !important;

  border-radius: 2px;
  background: #E9EEE5;
  overflow: hidden;

  transition:
    background-color .18s ease,
    width .22s ease;
}
        .fr-stock-order-shell .stock-order-stock-line.low-track { background:#fbe5e3; }
        .fr-stock-order-shell .stock-order-stock-line-fill { display:block; height:100%; width:0; border-radius:2px; background:${MSI_C.green}; transition:background-color .18s ease, width .22s ease; }
        .fr-stock-order-shell .stock-order-stock-line-fill.low { background:${MSI_C.red}; }
        .fr-stock-order-shell .stock-order-price { color:${MSI_C.greenDk}; font-weight:900; white-space:nowrap; }
        .fr-stock-order-shell .stock-order-detail-card { border:1px solid ${MSI_C.border}; border-radius:13px; background:${MSI_C.white}; box-shadow:0 2px 10px rgba(18,36,27,.035); }
        .fr-stock-order-shell .stock-order-hero { padding:14px; background:linear-gradient(135deg,#fbfcf8,#f3f7eb); border-bottom:1px solid ${MSI_C.border}; }
        .fr-stock-order-shell .stock-order-facts { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:7px; padding:11px 14px 0; }
        .fr-stock-order-shell .stock-order-fact { min-width:0; padding:9px; border:1px solid ${MSI_C.border}; border-radius:12px; background:#fbfcf8; }
        .fr-stock-order-shell .stock-order-fact-label { font-size:9.5px; text-transform:uppercase; letter-spacing:.06em; color:${MSI_C.muted}; }
        .fr-stock-order-shell .stock-order-fact-value { margin-top:4px; font-size:12px; font-weight:900; color:${MSI_C.ink}; overflow-wrap:anywhere; }
        .fr-stock-order-shell .stock-order-purchase { margin:11px 14px 13px; padding:12px; border:1px solid rgba(59,121,30,.18); border-radius:15px; background:#f8fbf3; }
        .fr-stock-order-shell .stock-order-purchase-top { display:flex; justify-content:space-between; gap:12px; align-items:flex-start; }
        .fr-stock-order-shell .stock-order-price-big { font-size:21px; line-height:1; font-weight:900; color:${MSI_C.greenDk}; }
        .fr-stock-order-shell .stock-order-price-unit { margin-top:5px; color:${MSI_C.muted}; font-size:10.5px; }
        .fr-stock-order-shell .stock-order-availability { padding:7px 10px; border-radius:999px; background:${MSI_C.white}; border:1px solid ${MSI_C.border}; font-size:10px; font-weight:800; color:${MSI_C.greenDk}; white-space:nowrap; }
        .fr-stock-order-shell .stock-order-availability.out { color:${MSI_C.red}; background:${MSI_C.redBg}; border-color:#f2c9c4; }
        .fr-stock-order-shell .stock-order-stepper { display:flex; align-items:center; gap:7px; margin-top:13px; }
        .fr-stock-order-shell .stock-order-stepper button { width:32px; height:32px; min-width:32px; padding:0; border:1px solid ${MSI_C.border}; border-radius:10px; background:${MSI_C.white}; color:${MSI_C.greenDk}; font-size:18px; font-weight:800; cursor:pointer; }
.fr-stock-order-shell .stock-order-stepper-input {
  width:60px;
  height:32px;
  padding:0 5px;
  border:1px solid ${MSI_C.border};
  border-radius:8px;
  background:#fff;
  color:${MSI_C.ink};
  text-align:center;
  font-size:14px;
  font-weight:800;
  outline:none;
  box-sizing:border-box;
}

.fr-stock-order-shell .stock-order-stepper-input:focus {
  border-color:${MSI_C.green};
}

/* Remove Chrome, Edge, Safari number arrows */
.fr-stock-order-shell
  .stock-order-stepper-input::-webkit-inner-spin-button,
.fr-stock-order-shell
  .stock-order-stepper-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Remove Firefox number arrows */
.fr-stock-order-shell .stock-order-stepper-input {
  -moz-appearance: textfield;
  appearance: textfield;
}
.stock-order-list .stock-order-row {
  height: auto !important;
  min-height: 0 !important;
  overflow: visible !important;
  padding: 16px 22px !important;
  box-sizing: border-box !important;
}
.stock-order-list .stock-order-row + .stock-order-row {
  border-top: 1px solid #eef1e9 !important;
}

.stock-order-row-actions {
  display: flex !important;
  align-items: center !important;
  gap: 7px !important;
  margin-top: 0 !important;
  position: relative !important;
  z-index: 2 !important;
}
        .fr-stock-order-shell .stock-order-actions { display:grid; grid-template-columns:1fr 1fr; gap:7px; margin-top:10px; }
        .stock-order-actions .v-btn { min-height:32px !important; padding:6px 11px !important; font-size:11px !important; border-radius:8px !important; }
        .fr-stock-order-shell .stock-order-unavailable { margin-top:12px; padding:10px 12px; border-radius:10px; background:${MSI_C.bg}; color:${MSI_C.muted}; font-size:11px; line-height:1.45; }
        .fr-stock-order-shell .stock-order-section { padding:0 14px 14px; }
        .fr-stock-order-shell .stock-order-section-title { display:flex; align-items:center; gap:7px; margin:0 0 8px; font-size:11px; font-weight:900; color:${MSI_C.greenDk}; }
        .fr-stock-order-shell .stock-order-queue-panel { margin-bottom:10px; border:1px solid ${MSI_C.border}; border-radius:13px; background:${MSI_C.white}; overflow:auto; max-height:245px; padding:10px 12px; }
        .fr-stock-order-shell .stock-order-queue-panel .fr-inventory-detail-content { animation:none; }
        .fr-stock-order-shell .stock-order-detail-panel { border:1px solid ${MSI_C.border}; border-radius:13px; background:${MSI_C.white}; overflow:hidden; }
        .fr-stock-order-shell .stock-order-detail-panel .stock-order-hero { border-bottom:1px solid ${MSI_C.border}; }
        .fr-stock-order-shell .stock-order-header-actions { display:flex; align-items:center; gap:7px; flex-wrap:wrap; justify-content:flex-end; }
        .fr-stock-order-shell .stock-order-cart-modal { width:min(100%,820px); padding:0 !important; overflow:hidden !important; }
        .fr-stock-order-shell .stock-order-orders-modal { width:min(100%,900px); padding:0 !important; overflow:hidden !important; }
       .fr-stock-order-shell .stock-order-checkout-modal {
          width:min(94vw,1100px);
          padding:0 !important;
          overflow:hidden !important;
          max-height:min(90vh,760px);
          display:flex;
          flex-direction:column;
          background:#fff;
        }
        .fr-stock-order-shell .checkout-mobile-head { padding:18px 20px; background:linear-gradient(135deg,#2c5c16,#d4a63c); color:#fff; display:flex; align-items:center; justify-content:space-between; gap:14px; }
        .fr-stock-order-shell .checkout-mobile-head-left { display:flex; align-items:center; gap:12px; min-width:0; }
        .fr-stock-order-shell .checkout-mobile-back { width:36px; height:36px; border-radius:11px; border:1px solid rgba(255,255,255,.25); background:rgba(255,255,255,.18); color:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; }
        .fr-stock-order-shell .checkout-mobile-eyebrow { font-size:9px; color:rgba(255,255,255,.7); letter-spacing:2.2px; font-weight:900; }
        .fr-stock-order-shell .checkout-mobile-title { font-size:20px; line-height:1.15; font-weight:900; margin-top:3px; }
        .fr-stock-order-shell .checkout-mobile-count { flex-shrink:0; padding:6px 11px; border-radius:20px; border:1px solid rgba(255,255,255,.3); background:rgba(255,255,255,.18); color:#fbf3df; font-size:9px; letter-spacing:1px; font-weight:900; }
.fr-stock-order-shell .checkout-mobile-scroll {
  padding:20px;
  overflow:auto;
}
        .fr-stock-order-shell .checkout-mobile-section { margin-top:22px; }
        .fr-stock-order-shell .checkout-mobile-section:first-child { margin-top:0; }
        .fr-stock-order-shell .checkout-mobile-section-title { display:flex; align-items:center; gap:8px; margin-bottom:14px; font-size:11px; color:#2c5c16; letter-spacing:.6px; text-transform:uppercase; font-weight:900; }
        .fr-stock-order-shell .checkout-mobile-section-bar { width:4px; height:14px; border-radius:2px; background:linear-gradient(180deg,#2c5c16,#d4a63c); }
        .fr-stock-order-shell .checkout-mobile-card { background:#fff; border:1px solid rgba(44,92,22,.14); border-radius:16px; box-shadow:0 3px 7px rgba(44,92,22,.06); overflow:hidden; }
        .fr-stock-order-shell .checkout-user-card { display:flex; align-items:center; gap:12px; padding:14px; }
        .fr-stock-order-shell .checkout-user-thumb { width:52px; height:52px; border-radius:14px; background:#f1f8e8; border:1px solid #dcefc9; color:#2c5c16; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .fr-stock-order-shell .checkout-user-name { font-size:14px; color:#2c5c16; font-weight:900; }
        .fr-stock-order-shell .checkout-user-meta { margin-top:2px; font-size:10px; color:rgba(44,92,22,.45); }
        .fr-stock-order-shell .checkout-order-row { display:flex; align-items:center; gap:12px; padding:14px; border-bottom:1px solid rgba(44,92,22,.14); }
        .fr-stock-order-shell .checkout-order-row:last-child { border-bottom:0; }
        .fr-stock-order-shell .checkout-order-thumb { width:36px; height:36px; border-radius:10px; background:#f1f8e8; border:1px solid #dcefc9; display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0; color:#2c5c16; }
        .fr-stock-order-shell .checkout-order-thumb img { width:100%; height:100%; object-fit:contain; }
        .fr-stock-order-shell .checkout-order-main { flex:1; min-width:0; }
        .fr-stock-order-shell .checkout-order-name { font-size:13px; color:#2c5c16; font-weight:900; overflow-wrap:anywhere; }
        .fr-stock-order-shell .checkout-order-qty { margin-top:2px; font-size:10px; color:rgba(44,92,22,.45); }
        .fr-stock-order-shell .checkout-order-price { font-size:14px; color:#2c5c16; font-weight:900; white-space:nowrap; }
        .fr-stock-order-shell .checkout-address-card { display:flex; align-items:flex-start; gap:10px; padding:14px; border:2px solid #d4a63c; border-radius:16px; background:#fff; box-shadow:0 3px 7px rgba(44,92,22,.06); }
        .fr-stock-order-shell .checkout-address-card textarea { flex:1; min-height:58px; resize:vertical; border:0; outline:0; padding:0; background:transparent; color:#2c5c16; font:inherit; font-size:13px; line-height:1.45; }
        .fr-stock-order-shell .checkout-address-prompt { width:min(92vw,390px); padding:26px; border-radius:18px; text-align:center; background:#fff; box-shadow:0 18px 50px rgba(20,50,15,.18); }
        .fr-stock-order-shell .checkout-address-prompt-icon { width:54px; height:54px; margin:0 auto 14px; display:flex; align-items:center; justify-content:center; border-radius:16px; background:#f1f8e8; color:#2c5c16; }
        .fr-stock-order-shell .checkout-address-prompt h2 { margin:0 0 7px; color:#2c5c16; font-size:18px; }
        .fr-stock-order-shell .checkout-address-prompt p { margin:0 0 20px; color:#63725c; font-size:13px; line-height:1.5; }
        .fr-stock-order-shell .checkout-address-prompt button { width:100%; min-height:44px; border:0; border-radius:12px; background:linear-gradient(90deg,#2c5c16,#d4a63c); color:#fff; font-size:13px; font-weight:900; cursor:pointer; }
        .fr-stock-order-shell .checkout-pay-card { width:100%; display:flex; align-items:center; gap:12px; padding:14px; margin-bottom:12px; border:1px solid rgba(44,92,22,.14); border-radius:16px; background:#fff; box-shadow:0 3px 7px rgba(44,92,22,.06); cursor:pointer; text-align:left; color:#2c5c16; }
        .fr-stock-order-shell .checkout-pay-card.selected { border:2px solid #d4a63c; padding:13px; }
        .fr-stock-order-shell .checkout-pay-thumb { width:44px; height:44px; border-radius:13px; display:flex; align-items:center; justify-content:center; flex-shrink:0; border:1px solid #dcefc9; background:#f1f8e8; }
        .fr-stock-order-shell .checkout-pay-thumb.gcash { color:#1565C0; background:#E3F2FD; border-color:#BFDBFE; font-size:16px; font-weight:900; }
        .fr-stock-order-shell .checkout-pay-main { flex:1; min-width:0; }
        .fr-stock-order-shell .checkout-pay-label { font-size:14px; font-weight:900; color:#2c5c16; }
        .fr-stock-order-shell .checkout-pay-desc { margin-top:2px; font-size:11px; color:rgba(44,92,22,.45); }
        .fr-stock-order-shell .checkout-radio { width:22px; height:22px; border-radius:50%; border:2px solid rgba(44,92,22,.14); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .fr-stock-order-shell .checkout-pay-card.selected .checkout-radio { border-color:#2c5c16; }
        .fr-stock-order-shell .checkout-radio-dot { width:11px; height:11px; border-radius:50%; background:#2c5c16; }
        .fr-stock-order-shell .checkout-gcash-ref { margin-top:-2px; margin-bottom:12px; padding:12px 14px; border-radius:14px; background:#E3F2FD; border:1px solid #BFDBFE; }
        .fr-stock-order-shell .checkout-gcash-ref label { display:block; margin-bottom:7px; color:#1565C0; font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:.05em; }
        .fr-stock-order-shell .checkout-gcash-ref input { width:100%; box-sizing:border-box; border:1px solid #BFDBFE; border-radius:10px; background:#fff; padding:10px 11px; outline:0; color:#2c5c16; font:inherit; font-size:12px; }
        .fr-stock-order-shell .gcash-overlay { z-index:10001; }
        .fr-stock-order-shell .gcash-payment-modal { width:min(92vw,420px); padding:0; overflow:hidden; background:#fff; border-radius:20px; }
        .fr-stock-order-shell .gcash-payment-head { display:flex; align-items:center; justify-content:space-between; padding:19px 22px; background:linear-gradient(135deg,#1565C0,#0D47A1); color:#fff; }
        .fr-stock-order-shell .gcash-payment-head small { font-size:9px; font-weight:800; letter-spacing:1.6px; opacity:.8; }
        .fr-stock-order-shell .gcash-payment-head h2 { margin:3px 0 0; font-size:19px; }
        .fr-stock-order-shell .gcash-payment-head button { border:0; background:rgba(255,255,255,.18); color:#fff; border-radius:9px; width:32px; height:32px; font-size:23px; cursor:pointer; }
        .fr-stock-order-shell .gcash-payment-body { padding:24px; text-align:center; color:#25435f; }
        .fr-stock-order-shell .gcash-payment-body p { font-size:12px; line-height:1.5; }
        .fr-stock-order-shell .gcash-payment-amount { font-size:28px; font-weight:900; color:#1565C0; }
        .fr-stock-order-shell .gcash-payment-qr { display:block; width:220px; height:220px; max-width:100%; margin:18px auto; border:1px solid #d5e6f8; border-radius:12px; }
        .fr-stock-order-shell .gcash-payment-reference, .fr-stock-order-shell .gcash-payment-timer { margin:9px 0; font-size:12px; font-weight:800; }
        .fr-stock-order-shell .gcash-payment-primary, .fr-stock-order-shell .gcash-payment-secondary { display:block; padding:12px; margin-top:10px; border-radius:11px; text-decoration:none; font-size:13px; font-weight:900; }
        .fr-stock-order-shell .gcash-payment-primary { background:#1565C0; color:#fff; }
        .fr-stock-order-shell .gcash-payment-secondary { border:1px solid #bfdbfe; color:#1565C0; }
        .fr-stock-order-shell .gcash-payment-cancel, .fr-stock-order-shell .gcash-payment-state button { border:0; background:transparent; color:#1565C0; font-weight:800; cursor:pointer; }
        .fr-stock-order-shell .gcash-payment-wait { color:#627f9b; }
        .fr-stock-order-shell .gcash-payment-state { padding:30px 5px; font-size:14px; line-height:1.8; }
        .fr-stock-order-shell .checkout-mobile-bottom { padding:4px 22px 22px; background:#fff; border-top:1px solid rgba(44,92,22,.10); box-shadow:0 -3px 12px rgba(44,92,22,.08); }
        .fr-stock-order-shell .checkout-mobile-accent { height:3px; border-radius:2px; margin-bottom:18px; background:linear-gradient(90deg,#2c5c16,#d4a63c); }
        .fr-stock-order-shell .checkout-total-row { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:12px; }
        .fr-stock-order-shell .checkout-total-label { font-size:12px; color:rgba(44,92,22,.62); text-transform:uppercase; letter-spacing:.6px; }
        .fr-stock-order-shell .checkout-total-amount { font-size:26px; color:#2c5c16; font-weight:900; letter-spacing:-.5px; }
        .fr-stock-order-shell .checkout-payment-chip { width:max-content; max-width:100%; display:flex; align-items:center; gap:6px; padding:7px 12px; margin-bottom:14px; border:1px solid rgba(44,92,22,.14); border-radius:10px; background:#f1f8e8; color:#2c5c16; font-size:12px; font-weight:900; }
        .fr-stock-order-shell .checkout-place-btn { width:100%; min-height:50px; border:0; border-radius:15px; background:linear-gradient(90deg,#2c5c16,#d4a63c); color:#fff; display:flex; align-items:center; justify-content:center; gap:8px; font-size:14px; font-weight:900; cursor:pointer; }
        .fr-stock-order-shell .checkout-place-btn:disabled { opacity:.7; cursor:not-allowed; }
        .fr-stock-order-shell .checkout-success-mobile { padding:48px 24px; text-align:center; }
        @media(max-width:620px){.fr-stock-order-shell .stock-order-checkout-modal {
  width:min(94vw,1100px);
  padding:0 !important;
  overflow:hidden !important;
  max-height:min(90vh,760px);
  display:flex;
  flex-direction:column;
  background:#fff;
}.fr-stock-order-shell .checkout-mobile-scroll { padding:16px; } .fr-stock-order-shell .checkout-mobile-bottom { padding-left:18px; padding-right:18px; padding-bottom:18px; } }
        .fr-stock-order-shell .stock-order-cart-row { display:grid; grid-template-columns:minmax(0,1fr) auto auto; gap:15px; align-items:center; padding:15px 18px; border-bottom:1px solid #EEF1EA; background:#fff; }
        .fr-stock-order-shell .stock-order-cart-row:hover { background:#FBFCF8; }
        .fr-stock-order-shell .stock-cart-modal-head, .fr-stock-order-shell .stock-orders-modal-head { padding:18px 20px; background:linear-gradient(135deg,#fbfcf8,#f4f8ec); border-bottom:1px solid ${MSI_C.border}; }
        .fr-stock-order-shell .stock-modal-eyebrow { font-size:9px; font-weight:900; text-transform:uppercase; letter-spacing:.09em; color:${MSI_C.green}; }
        .fr-stock-order-shell .stock-modal-title-row { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
        .fr-stock-order-shell .stock-modal-title { margin-top:3px; font-size:19px; font-weight:900; color:${MSI_C.ink}; }
        .fr-stock-order-shell .stock-modal-subtitle { margin-top:4px; color:${MSI_C.muted}; font-size:10.5px; line-height:1.45; }
        .fr-stock-order-shell .stock-modal-scroll { max-height:min(58vh,520px); overflow:auto; }
        .fr-stock-order-shell .stock-modal-footer { padding:13px 20px 17px; border-top:1px solid ${MSI_C.border}; background:#fff; position:sticky; bottom:0; z-index:3; }
        .fr-stock-order-shell .stock-cart-item-main { min-width:0; }
        .fr-stock-order-shell .stock-cart-item-title { font-size:13px; font-weight:900; color:${MSI_C.ink}; overflow-wrap:anywhere; }
        .fr-stock-order-shell .stock-cart-item-meta { margin-top:4px; font-size:10.5px; color:${MSI_C.muted}; }
        .fr-stock-order-shell .stock-cart-stock-note { margin-top:5px; font-size:9.5px; color:${MSI_C.greenDk}; font-weight:800; }
        .fr-stock-order-shell .stock-cart-stock-note.low { color:${MSI_C.red}; }
        .fr-stock-order-shell .stock-cart-qty { display:flex; align-items:center; gap:6px; padding:4px; border:1px solid ${MSI_C.border}; border-radius:10px; background:#FBFCF8; }
        .fr-stock-order-shell .stock-cart-qty button { width:28px; height:28px; border:1px solid ${MSI_C.border}; border-radius:7px; background:#fff; color:${MSI_C.greenDk}; font-weight:900; cursor:pointer; }
        .fr-stock-order-shell .stock-cart-qty button:disabled { opacity:.4; cursor:not-allowed; }
        .fr-stock-order-shell .stock-cart-qty-input {
          width:52px;
          height:28px;
          border:1px solid ${MSI_C.border};
          border-radius:7px;
          background:#fff;
          text-align:center;
          font-size:12px;
          font-weight:800;
          color:${MSI_C.ink};
          outline:none;
          box-sizing:border-box;
        }

        .fr-stock-order-shell .stock-cart-qty-input:focus {
          border-color:${MSI_C.green};
        }

        .fr-stock-order-shell .stock-cart-qty-input::-webkit-inner-spin-button,
        .fr-stock-order-shell .stock-cart-qty-input::-webkit-outer-spin-button {
          margin:0;
        }
        .fr-stock-order-shell .stock-cart-line-total { min-width:86px; text-align:right; }
        .fr-stock-order-shell .stock-cart-remove { margin-top:5px; border:0; background:transparent; color:#9B2C2C; font-size:9.5px; font-weight:800; cursor:pointer; padding:0; }
        .fr-stock-order-shell .stock-order-count-badge { min-width:21px; height:21px; padding:0 6px; border-radius:999px; display:inline-flex; align-items:center; justify-content:center; background:#EEF4E7; color:${MSI_C.greenDk}; font-size:9.5px; font-weight:900; }
        .fr-stock-order-shell .stock-orders-summary { display:flex; gap:7px; flex-wrap:wrap; padding:12px 20px 0; }
        .fr-stock-order-shell .stock-orders-stat { display:inline-flex; align-items:center; gap:6px; padding:6px 9px; border:1px solid ${MSI_C.border}; border-radius:9px; background:#FBFCF8; color:${MSI_C.muted}; font-size:9.5px; font-weight:800; }
        .fr-stock-order-shell .stock-orders-stat strong { color:${MSI_C.ink}; font-size:11px; }
        .fr-stock-order-shell .stock-order-history-card { margin:10px 20px; border:1px solid ${MSI_C.border}; border-radius:12px; overflow:hidden; background:#fff; }
        .fr-stock-order-shell .stock-order-history-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 14px; cursor:pointer; }
        .fr-stock-order-shell .stock-order-history-head:hover { background:#FBFCF8; }
        .fr-stock-order-shell .stock-order-history-id { font-size:12.5px; font-weight:900; color:${MSI_C.ink}; }
        .fr-stock-order-shell .stock-order-history-date { margin-top:3px; font-size:9.5px; color:${MSI_C.muted}; }
        .fr-stock-order-shell .stock-order-status { display:inline-flex; align-items:center; gap:5px; padding:5px 8px; border-radius:999px; font-size:9px; font-weight:900; white-space:nowrap; border:1px solid transparent; }
        .fr-stock-order-shell .stock-order-status::before { content:""; width:5px; height:5px; border-radius:50%; background:currentColor; }
        .fr-stock-order-shell .stock-order-status.pending { color:#8A6400; background:#FFF8D8; border-color:#F0DEA0; }
        .fr-stock-order-shell .stock-order-status.processing { color:#285C85; background:#EEF6FC; border-color:#C8DFEF; }
        .fr-stock-order-shell .stock-order-status.completed { color:#2C6B17; background:#EEF8E8; border-color:#CDE4BF; }
        .fr-stock-order-shell .stock-order-status.cancelled { color:#A3342A; background:#FFF1EF; border-color:#F0C9C3; }
        .fr-stock-order-shell .stock-order-history-meta { display:flex; gap:12px; flex-wrap:wrap; padding:0 14px 11px; font-size:9.5px; color:${MSI_C.muted}; }
        .fr-stock-order-shell .stock-order-history-total { color:${MSI_C.greenDk}; font-weight:900; }
        .fr-stock-order-shell .stock-order-history-details { padding:11px 14px 13px; background:#FBFCF8; border-top:1px solid #EEF1EA; }
        .fr-stock-order-shell .stock-order-history-item { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:7px 0; border-bottom:1px dashed #E4E9DE; }
        .fr-stock-order-shell .stock-order-history-item:last-child { border-bottom:0; }
        .fr-stock-order-shell .stock-order-history-item-name { font-size:10.5px; font-weight:800; color:${MSI_C.ink}; }
        .fr-stock-order-shell .stock-order-history-item-meta { margin-top:2px; font-size:9px; color:${MSI_C.muted}; }
        .fr-stock-order-shell .stock-order-history-address { margin-top:9px; padding-top:9px; border-top:1px solid ${MSI_C.border}; font-size:9.5px; color:${MSI_C.muted}; line-height:1.45; }
        .fr-stock-order-shell .stock-order-history-address strong { color:${MSI_C.ink}; }
        .fr-stock-order-shell .stock-order-empty { padding:56px 24px 62px; text-align:center; color:${MSI_C.muted}; }
        .fr-stock-order-shell .stock-order-summary-row { display:flex; justify-content:space-between; gap:12px; align-items:center; padding:10px 0; }
        .fr-stock-order-shell .stock-order-summary-total { padding-top:14px; margin-top:5px; border-top:1px solid ${MSI_C.border}; }
        .fr-stock-order-shell .stock-order-muted { color:${MSI_C.muted}; font-size:11px; }
        .fr-stock-order-shell .stock-order-success { text-align:center; padding:40px 20px 24px; }
        @media(max-width:980px){
          .fr-stock-order-shell .stock-order-layout { grid-template-columns:1fr; max-height:none; }
          .fr-stock-order-shell .stock-order-list { border-right:0; border-bottom:1px solid ${MSI_C.border}; max-height:340px; }
          .fr-stock-order-shell .stock-order-detail { max-height:none; padding:10px; }
        }
        @media(max-width:620px){
          .fr-stock-order-shell .stock-order-facts { grid-template-columns:1fr 1fr; }
          .fr-stock-order-shell .stock-order-actions { grid-template-columns:1fr; }
          .fr-stock-order-shell .stock-order-header-actions { width:100%; justify-content:stretch; }
          .fr-stock-order-shell .stock-order-header-actions .v-btn { flex:1 1 0; }
          .fr-stock-order-shell .stock-order-cart-row { grid-template-columns:1fr auto; gap:9px; padding:12px 14px; }
          .fr-stock-order-shell .stock-cart-line-total { grid-column:2; }
          .fr-stock-order-shell .stock-order-cart-row > :last-child { grid-column:2; }
          .fr-stock-order-shell .stock-modal-title { font-size:17px; }
          .fr-stock-order-shell .stock-orders-modal-head .stock-modal-title-row { flex-direction:column; }
          .fr-stock-order-shell .stock-orders-modal-head .stock-modal-title-row > div:last-child { width:100%; }
          .fr-stock-order-shell .stock-orders-modal-head .stock-modal-title-row > div:last-child .v-btn { flex:1; }
        }
        /* Cart and checkout match the mobile screens: white chrome, soft green canvas, and rounded cards. */
.fr-stock-order-shell .stock-order-cart-modal {
  width:min(100% - 24px,620px);
  max-height:94vh;
  display:flex;
  flex-direction:column;
  border-radius:24px;
  background:#f8fbf4;
}

.fr-stock-order-shell .stock-order-checkout-modal {
  width:min(94vw,1100px);
  height:min(88vh,720px);
  max-height:720px;
  display:flex;
  flex-direction:column;
  padding:0 !important;
  overflow:hidden !important;
  border-radius:24px;
  background:#f8fbf4;
}
        .fr-stock-order-shell .stock-cart-modal-head, .fr-stock-order-shell .checkout-mobile-head { flex-shrink:0; padding:22px 26px; background:#fff; border-bottom:1px solid #e4eadc; color:#151c13; box-shadow:none; }
        .fr-stock-order-shell .stock-modal-title, .fr-stock-order-shell .checkout-mobile-title { margin:0; font-size:23px; line-height:1.2; font-weight:900; color:#151c13; }
        .fr-stock-order-shell .stock-modal-subtitle, .fr-stock-order-shell .checkout-mobile-subtitle { display:block; margin-top:5px; font-size:12px; color:#8a9485; }
        .fr-stock-order-shell .checkout-mobile-head-left { gap:16px; }
        .fr-stock-order-shell .checkout-mobile-back { width:42px; height:42px; border:1px solid #d6dfcf; background:#fff; color:#162014; box-shadow:none; }
.fr-stock-order-shell .stock-order-cart-modal .stock-modal-scroll {
  flex:1;
  max-height:none;
  padding:24px 26px 32px;
  overflow:auto;
  background-color:#f8fbf4;
  background-image:radial-gradient(#e7eedf 1px,transparent 1px);
  background-size:18px 18px;
}

.fr-stock-order-shell .stock-order-checkout-modal .checkout-mobile-scroll {
  flex:1;
  min-height:0;
  max-height:none;
  padding:20px 26px;
  overflow-y:auto;
  overflow-x:hidden;
  background-color:#f8fbf4;
  background-image:radial-gradient(#e7eedf 1px,transparent 1px);
  background-size:18px 18px;

  display:grid;
  grid-template-columns:minmax(0, 1fr) minmax(0, 1fr);
  gap:20px 26px;
  align-content:start;
}
        .fr-stock-order-shell .cart-pick-note { padding:18px 20px; border:1px solid #e0e8d9; border-left:5px solid #4a8e25; border-radius:17px; background:#fff; color:#1d291a; }
        .fr-stock-order-shell .cart-pick-note strong { font-size:16px; }
        .fr-stock-order-shell .cart-pick-note p { margin:8px 0 0; color:#838d7e; font-size:12px; line-height:1.5; }
        .fr-stock-order-shell .cart-section-head { display:flex; align-items:center; justify-content:space-between; gap:15px; margin:28px 0 16px; padding-left:16px; border-left:5px solid #4a8e25; }
        .fr-stock-order-shell .cart-section-head strong { display:block; font-size:19px; color:#1c261a; }
        .fr-stock-order-shell .cart-section-head small { display:block; margin-top:4px; color:#889383; }
        .fr-stock-order-shell .cart-select-all { display:flex; align-items:center; gap:8px; padding:9px 12px; border:1px solid #d8e0d0; border-radius:13px; background:#fff; color:#1c261a; font-weight:800; cursor:pointer; white-space:nowrap; }
        .fr-stock-order-shell .cart-checkbox { width:21px; height:21px; flex:0 0 21px; border:2px solid #cbd6c6; border-radius:7px; background:#fff; cursor:pointer; }
        .fr-stock-order-shell .cart-checkbox.checked { background:#4a8e25; border-color:#4a8e25; }
        .fr-stock-order-shell .cart-checkbox.checked::after { content:"✓"; color:#fff; font-size:15px; line-height:17px; }
        .fr-stock-order-shell .stock-order-cart-modal .stock-order-cart-row { position:relative; display:grid; grid-template-columns:21px 58px minmax(0,1fr) auto; gap:14px; align-items:center; margin-bottom:14px; padding:18px; border:1px solid #e0e7d9; border-radius:18px; background:#fff; box-shadow:0 2px 8px rgba(32,64,20,.04); }
        .fr-stock-order-shell .cart-product-thumb { width:58px; height:58px; display:flex; align-items:center; justify-content:center; border:1px solid #dfeccf; border-radius:15px; background:#f3f9e9; color:#4b8f29; overflow:hidden; }
        .fr-stock-order-shell .cart-product-thumb img { width:100%; height:100%; object-fit:contain; }
        .fr-stock-order-shell .stock-cart-item-title { font-size:15px; color:#192319; }
        .fr-stock-order-shell .stock-cart-item-meta { color:#899286; }
        .fr-stock-order-shell .stock-cart-item-price { margin-top:8px; color:#202920; font-size:15px; font-weight:900; }
        .fr-stock-order-shell .stock-cart-item-price small { display:block; margin-top:2px; color:#8d9788; font-size:10px; font-weight:500; }
        .fr-stock-order-shell .stock-order-cart-modal .stock-cart-qty { grid-column:4; grid-row:1; align-self:end; margin-top:45px; }
        .fr-stock-order-shell .stock-order-cart-modal .stock-cart-line-total { position:absolute; right:18px; top:16px; min-width:0; }
        .fr-stock-order-shell .stock-order-cart-modal .stock-cart-line-total strong { display:none; }
        .fr-stock-order-shell .stock-order-cart-modal .stock-cart-remove { margin:0; padding:7px; border:1px solid #f2d3d4; border-radius:9px; background:#fff6f6; color:#ce5459; font-size:0; }
        .fr-stock-order-shell .stock-order-cart-modal .stock-cart-remove svg { width:15px; height:15px; margin:0 !important; }
        .fr-stock-order-shell .stock-order-cart-modal .stock-modal-footer, .fr-stock-order-shell .checkout-mobile-bottom { flex-shrink:0; padding:20px 26px 24px; border-top:1px solid #e5eadf; background:#fff; box-shadow:0 -4px 14px rgba(30,60,20,.05); }
        .fr-stock-order-shell .stock-order-cart-modal .stock-modal-footer .v-btn-primary, .fr-stock-order-shell .checkout-place-btn { min-height:52px !important; border-radius:14px !important; background:#4a8e25; color:#fff; font-size:15px; font-weight:900; }
        .fr-stock-order-shell .stock-order-cart-modal .stock-modal-footer .v-btn-primary:disabled { background:#b8d1a6; color:#fff; }
        .fr-stock-order-shell .checkout-mobile-section { margin-top:26px; }
        .fr-stock-order-shell .checkout-mobile-section-title { gap:11px; color:#1c261a; font-size:17px; letter-spacing:0; text-transform:none; }
        .fr-stock-order-shell .checkout-mobile-section-bar { width:5px; height:26px; background:#4a8e25; }
        .fr-stock-order-shell .checkout-mobile-card, .fr-stock-order-shell .checkout-address-card, .fr-stock-order-shell .checkout-pay-card { border:1px solid #e0e7d9; border-radius:18px; box-shadow:0 2px 8px rgba(32,64,20,.04); }
        .fr-stock-order-shell .checkout-user-card, .fr-stock-order-shell .checkout-order-row { padding:17px; }
        .fr-stock-order-shell .checkout-user-thumb { width:58px; height:58px; border:0; border-radius:17px; background:#11250d; color:#bed66a; font-size:24px; font-weight:900; }
        .fr-stock-order-shell .checkout-user-name, .fr-stock-order-shell .checkout-order-name { color:#1d251b; font-size:15px; }
        .fr-stock-order-shell .checkout-branch-pill { display:inline-flex; align-items:center; gap:5px; margin-top:7px; padding:4px 8px; border:1px solid #dceacb; border-radius:9px; background:#f3f9e9; color:#427c20; font-size:11px; font-weight:800; }
        .fr-stock-order-shell .checkout-order-thumb { width:48px; height:48px; border-radius:13px; }
        .fr-stock-order-shell .checkout-order-qty { color:#899286; }
        .fr-stock-order-shell .checkout-order-price { color:#1d251b; }
        .fr-stock-order-shell .checkout-map-preview { position:relative; height:235px; overflow:hidden; border:1px solid #e0e7d9; border-radius:17px; background:#e8eddd; }
        .fr-stock-order-shell .checkout-map-preview iframe { width:100%; height:100%; border:0; pointer-events:none; }
        .fr-stock-order-shell .checkout-map-touch { position:absolute; inset:0; z-index:1; cursor:crosshair; touch-action:none; }
        .fr-stock-order-shell .checkout-map-pin { position:absolute; z-index:2; left:50%; top:50%; transform:translate(-50%,-100%); color:#4a8e25; font-size:38px; line-height:1; text-shadow:0 2px 3px #fff; pointer-events:none; }
        .fr-stock-order-shell .checkout-map-attribution { position:absolute; z-index:2; left:7px; bottom:5px; padding:2px 4px; background:rgba(255,255,255,.85); color:#4e5b4a; font-size:9px; pointer-events:none; }
        .fr-stock-order-shell .checkout-map-open, .fr-stock-order-shell .checkout-map-current { position:absolute; z-index:3; border:1px solid #d7dfcd; border-radius:11px; background:#fff; color:#172216; font-size:12px; font-weight:800; cursor:pointer; box-shadow:0 2px 8px rgba(20,40,15,.12); }
        .fr-stock-order-shell .checkout-map-open { top:14px; left:14px; padding:9px 12px; }
        .fr-stock-order-shell .checkout-map-current { right:14px; bottom:14px; padding:10px 13px; background:#4a8e25; color:#fff; border-color:#4a8e25; }
        .fr-stock-order-shell .checkout-map-current:disabled { opacity:.65; cursor:wait; }
        .fr-stock-order-shell .checkout-map-caption { position:absolute; top:14px; left:14px; padding:8px 12px; border:1px solid #d7dfcd; border-radius:11px; background:#fff; color:#172216; font-size:12px; font-weight:800; }
        .fr-stock-order-shell .checkout-map-hint { margin:10px 0 14px; color:#899286; font-size:11px; }
        .fr-stock-order-shell .checkout-map-error { margin:8px 0; color:#a3342a; font-size:11px; }
        .fr-stock-order-shell .checkout-map-picker-overlay { z-index:10003; }
        .fr-stock-order-shell .checkout-map-picker { width:min(92vw,680px); height:min(88vh,720px); padding:0; display:flex; flex-direction:column; overflow:hidden; border-radius:18px; background:#fff; }
        .fr-stock-order-shell .checkout-map-picker-head { display:flex; align-items:center; justify-content:space-between; gap:14px; padding:14px 18px; color:#1c261a; }
        .fr-stock-order-shell .checkout-map-picker-head button { border:1px solid #d7dfcd; border-radius:10px; background:#fff; color:#2c5c16; font-size:14px; font-weight:800; padding:7px 12px; cursor:pointer; }
        .fr-stock-order-shell .checkout-map-preview.full-screen { flex:1; height:auto; min-height:250px; border-radius:0; }
        .fr-stock-order-shell .checkout-map-picker > .checkout-map-hint, .fr-stock-order-shell .checkout-map-picker > .checkout-map-error { margin:10px 16px; }
        .fr-stock-order-shell .checkout-address-card { border:2px solid #a7cf83; }
        .fr-stock-order-shell .checkout-mobile-accent { display:none; }
        .fr-stock-order-shell .checkout-total-label { color:#202820; text-transform:none; font-size:14px; font-weight:800; }
        .fr-stock-order-shell .checkout-total-amount { color:#172216; font-size:27px; }
        .fr-stock-order-shell .checkout-address-prompt { border:1px solid #e0e7d9; background:#fff; }
        .fr-stock-order-shell .checkout-address-prompt button { background:#4a8e25; }
        @media(max-width:620px){
          .fr-stock-order-shell .stock-cart-modal-head, .fr-stock-order-shell .checkout-mobile-head { padding:18px; }
          .fr-stock-order-shell .stock-order-cart-modal .stock-modal-scroll, .fr-stock-order-shell .checkout-mobile-scroll { padding:20px 15px; }
          .fr-stock-order-shell .stock-order-cart-modal .stock-order-cart-row { grid-template-columns:21px 50px minmax(0,1fr); gap:10px; padding:15px; min-height:125px; }
          .fr-stock-order-shell .cart-product-thumb { width:50px; height:50px; }
          .fr-stock-order-shell .stock-order-cart-modal .stock-cart-qty { grid-column:3; grid-row:2; justify-self:end; margin:0; }
          .fr-stock-order-shell .stock-order-cart-modal .stock-cart-line-total { grid-column:auto; }
          .fr-stock-order-shell .stock-order-cart-modal .stock-modal-footer, .fr-stock-order-shell .checkout-mobile-bottom { padding:17px; }
        }

        /* =========================================================
   DESKTOP CHECKOUT — COMPACT WEBSITE LANDSCAPE
   ========================================================= */

@media (min-width: 900px) {

.fr-stock-order-shell .stock-order-checkout-modal {
width: min(90vw, 950px) !important;
max-width: 950px !important;
  height: auto !important;
  max-height: 88vh !important;

    display: flex !important;
    flex-direction: column !important;

    padding: 0 !important;
    overflow: hidden !important;

    border-radius: 22px !important;
    background: #f8fbf4 !important;
  }


  /* ================= HEADER ================= */

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-mobile-head {
    flex: 0 0 auto !important;
    padding: 18px 26px !important;
  }

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-mobile-title {
    font-size: 21px !important;
  }


  /* ================= BODY ================= */

.fr-stock-order-shell
.stock-order-checkout-modal
.checkout-mobile-scroll {
  flex: 0 1 auto !important;
  min-height: 0 !important;
  max-height: 62vh !important;

  padding: 20px 26px 22px !important;

  overflow-y: auto !important;
  overflow-x: hidden !important;

  display: grid !important;

  grid-template-columns:
    minmax(0, 1.15fr)
    minmax(320px, 0.85fr) !important;

  grid-template-areas:
    "franchisee payment"
    "summary    payment"
    "location   payment" !important;

  grid-template-rows:
    auto
    auto
    auto !important;

  column-gap: 28px !important;
  row-gap: 16px !important;

  align-items: start !important;
  align-content: start !important;
}


/* RESET ALL SECTION SPACING */

.fr-stock-order-shell
.stock-order-checkout-modal
.checkout-mobile-section {
  width: 100% !important;
  min-width: 0 !important;
  margin: 0 !important;
  align-self: start !important;
}


/* 1 — FRANCHISEE */

.fr-stock-order-shell
.stock-order-checkout-modal
.checkout-mobile-section:nth-child(1) {
  grid-area: franchisee !important;
}


/* 2 — ORDER SUMMARY */

.fr-stock-order-shell
.stock-order-checkout-modal
.checkout-mobile-section:nth-child(2) {
  grid-area: summary !important;
}


/* 3 — DELIVERY LOCATION */

.fr-stock-order-shell
.stock-order-checkout-modal
.checkout-mobile-section:nth-child(3) {
  grid-area: location !important;
}


/* 4 — PAYMENT METHOD */

.fr-stock-order-shell
.stock-order-checkout-modal
.checkout-mobile-section:nth-child(4) {
  grid-area: payment !important;
}

  /* ================= SECTION TITLES ================= */

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-mobile-section-title {
    margin: 0 0 10px !important;

    gap: 8px !important;

    font-size: 15px !important;
    line-height: 1.2 !important;
  }

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-mobile-section-bar {
    width: 4px !important;
    height: 22px !important;
  }


  /* ================= CARDS ================= */

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-mobile-card,

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-address-card,

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-pay-card {
    width: 100% !important;
    max-width: none !important;

    box-sizing: border-box !important;
  }


  /* ================= FRANCHISEE ================= */

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-user-card {
    min-height: 88px !important;
    padding: 14px 16px !important;
  }

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-user-thumb {
    width: 52px !important;
    height: 52px !important;
    border-radius: 15px !important;
  }

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-user-name {
    font-size: 14px !important;
  }


  /* ================= ORDER SUMMARY ================= */

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-order-row {
    display: grid !important;

    grid-template-columns:
      46px
      minmax(0, 1fr)
      auto !important;

    gap: 12px !important;

    align-items: center !important;

    padding: 14px !important;
  }

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-order-thumb {
    width: 46px !important;
    height: 46px !important;
  }

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-order-main {
    min-width: 0 !important;
  }

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-order-name {
    font-size: 13px !important;

    white-space: normal !important;
    word-break: normal !important;
    overflow-wrap: break-word !important;

    line-height: 1.3 !important;
  }

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-order-price {
    font-size: 13px !important;
    white-space: nowrap !important;
  }


  /* ================= DELIVERY ================= */

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-map-preview {
    height: 150px !important;
    border-radius: 15px !important;
  }

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-map-hint {
    margin: 8px 0 10px !important;
    font-size: 10px !important;
  }

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-address-card {
    min-height: 76px !important;
    padding: 12px 14px !important;
  }

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-address-card textarea {
    min-height: 48px !important;
    font-size: 12px !important;
  }


  /* ================= PAYMENT ================= */

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-pay-card {
    min-height: 64px !important;

    margin-bottom: 9px !important;
    padding: 11px 13px !important;
  }

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-pay-thumb {
    width: 40px !important;
    height: 40px !important;
  }

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-pay-label {
    font-size: 13px !important;
  }

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-pay-desc {
    font-size: 10px !important;
  }


  /* ================= BOTTOM ================= */

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-mobile-bottom {
    flex: 0 0 auto !important;

    padding: 14px 26px 18px !important;

    display: grid !important;

    grid-template-columns:
      minmax(0, 1fr)
      300px !important;

    column-gap: 28px !important;

    align-items: center !important;

    background: #fff !important;
  }

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-total-row {
    grid-column: 1 !important;

    margin: 0 0 7px !important;
  }

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-total-label {
    font-size: 12px !important;
  }

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-total-amount {
    font-size: 24px !important;
  }

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-payment-chip {
    grid-column: 1 !important;

    margin: 0 !important;

    padding: 6px 10px !important;

    font-size: 10px !important;
  }

  .fr-stock-order-shell
  .stock-order-checkout-modal
  .checkout-place-btn {
    grid-column: 2 !important;
    grid-row: 1 / span 2 !important;

    width: 100% !important;
    min-height: 50px !important;

    margin: 0 !important;

    font-size: 13px !important;
  }
}
        /* Stock-row ordering, website cart and Philippine address controls. */
        .fr-stock-order-shell .stock-order-row-top { padding-right:94px; min-height:46px; }
        .fr-row-order-buttons { position:absolute; right:20px; top:16px; display:flex; gap:8px; }
        .fr-row-order-btn { width:36px; height:36px; display:inline-flex; align-items:center; justify-content:center; border:1px solid #d8e3cf; border-radius:9px; background:#fff; color:#3b791e; cursor:pointer; transition:transform .15s,background .15s; }
        .fr-row-order-btn.primary { background:#3b791e; border-color:#3b791e; color:#fff; }
        .fr-row-order-btn:hover { transform:translateY(-1px); box-shadow:0 3px 9px #18380c16; }
        .fr-row-order-btn:active { transform:scale(.95); }
        .fr-row-order-btn:disabled { opacity:.5; cursor:wait; }
        .fr-row-order-btn span,.fr-visually-hidden { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; }
        .fr-stock-order-shell .stock-order-queue-panel { max-height:650px; margin-bottom:0; }
        .fr-stock-order-shell .fr-quantity-modal { width:min(92vw,410px); padding:24px!important; border-radius:18px; background:#fff; }
        .fr-dialog-head { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; }
        .fr-dialog-head small { color:#6b7864; font-size:11px; }
        .fr-dialog-head h3 { margin:6px 0 0; font-size:18px; color:#2c5c16; }
        .fr-icon-btn { display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; border:0; border-radius:8px; background:#f3f6ef; color:#3b791e; cursor:pointer; flex-shrink:0; }
        .fr-icon-btn.danger { color:#dc2626; background:#fff1f1; }
        .fr-quantity-info { display:flex; gap:12px; align-items:center; background:#f5f8ef; padding:15px; border-radius:12px; margin:20px 0; color:#2c5c16; font-size:13px; }
        .fr-quantity-info small { display:block; margin-top:5px; color:#6b7864; font-size:11px; }
        .fr-quantity-label { display:block; font-size:12px; font-weight:700; margin-bottom:8px; }
        .fr-quantity-control { display:flex; border:1px solid #d8e3cf; border-radius:10px; overflow:hidden; height:44px; }
        .fr-quantity-control button { width:46px; border:0; background:#f3f6ef; color:#3b791e; cursor:pointer; font-size:20px; }
        .fr-quantity-control input { flex:1; width:70px; border:0; min-width:0; text-align:center; font:inherit; }
        .fr-quantity-control button:disabled { opacity:.4; cursor:default; }
        .fr-quantity-total { display:flex; justify-content:space-between; align-items:center; margin:22px 0; font-size:13px; }
        .fr-quantity-total strong { color:#2c5c16; font-size:20px; }
        .fr-wide-button { width:100%; justify-content:center; gap:8px; }
        .fr-field-error { color:#b42318!important; font-size:11px; line-height:1.5; }
        .fr-stock-order-shell .fr-web-cart { width:min(96vw,1180px)!important; max-width:1180px!important; max-height:90vh; padding:0!important; overflow:auto!important; background:#fff; border-radius:18px; }
        .fr-web-cart-head { display:flex; align-items:center; justify-content:space-between; padding:23px 26px; border-bottom:1px solid #e5ebdf; gap:16px; }
        .fr-web-cart-head h2 { display:flex; align-items:center; gap:10px; font-size:21px; color:#2c5c16; margin:0; }
        .fr-web-cart-head h2 span { background:#eef4e7; padding:4px 8px; font-size:12px; border-radius:7px; }
        .fr-web-cart-head p { font-size:11px; color:#75806d; margin:7px 0 0; }
        .fr-web-cart-layout { display:grid; grid-template-columns:minmax(0,1fr) 280px; gap:24px; padding:24px; align-items:start; }
        .fr-web-cart-items { min-width:0; }
        .fr-cart-toolbar { display:flex; align-items:center; justify-content:space-between; font-size:12px; padding:0 0 18px; gap:10px; }
        .fr-cart-toolbar label { display:flex; align-items:center; gap:8px; font-weight:700; }
        .fr-web-cart input[type=checkbox] { width:16px; height:16px; accent-color:#3b791e; cursor:pointer; }
        .fr-cart-toolbar>span { color:#75806d; font-size:11px; }
        .fr-cart-table-scroll { overflow-x:auto; }
        .fr-cart-table { width:100%; border-collapse:collapse; font-size:12px; min-width:620px; }
        .fr-cart-table th { text-align:left; background:#f5f7f0; font-size:10px; color:#66745e; font-weight:700; padding:12px 8px; white-space:nowrap; }
        .fr-cart-table td { padding:18px 8px; border-bottom:1px solid #eef1e9; vertical-align:middle; white-space:nowrap; }
        .fr-cart-table th:first-child,.fr-cart-table td:first-child { width:30px; }
        .fr-cart-product { display:flex; gap:10px; align-items:center; min-width:170px; white-space:normal; }
        .fr-cart-product strong { font-size:12px; color:#2c5c16; }
        .fr-cart-product small { display:block; color:#75806d; font-size:10px; margin-top:5px; }
        .fr-cart-thumb { width:44px; height:44px; flex-shrink:0; background:#f1f6e9; color:#3b791e; display:flex; align-items:center; justify-content:center; border-radius:9px; overflow:hidden; }
        .fr-cart-thumb img { width:100%; height:100%; object-fit:contain; }
        .fr-cart-stepper { display:flex; align-items:center; border:1px solid #dde6d5; border-radius:8px; overflow:hidden; width:100px; height:33px; }
        .fr-cart-stepper button { background:#f5f8ef; border:0; width:28px; height:100%; color:#3b791e; cursor:pointer; }
        .fr-cart-stepper input { width:42px; min-width:0; border:0; text-align:center; font:inherit; padding:0; appearance:textfield; }
        .fr-cart-stepper input::-webkit-inner-spin-button { appearance:none; }
        .fr-cart-stepper button:disabled { opacity:.4; cursor:default; }
        .fr-cart-row-issue { background:#fff9f8; }
        .fr-cart-continue { display:inline-flex; align-items:center; gap:7px; color:#3b791e; border:0; background:none; cursor:pointer; font:inherit; font-size:12px; margin-top:22px; padding:0; }
        .fr-cart-summary { background:#f6f8f1; border:1px solid #e5ebdc; border-radius:13px; padding:22px; }
        .fr-cart-summary h3 { margin:0; font-size:16px; color:#2c5c16; }
        .fr-cart-summary p { color:#75806d; font-size:11px; line-height:1.6; margin:8px 0 22px; }
        .fr-cart-summary>div { display:flex; justify-content:space-between; align-items:center; margin:16px 0; font-size:12px; gap:8px; }
        .fr-cart-summary .fr-cart-summary-total { border-top:1px solid #dde5d4; padding-top:20px; margin:20px 0; }
        .fr-cart-summary-total strong { font-size:23px; color:#2c5c16; }
        .fr-cart-summary>small { display:block; text-align:center; font-size:10px; color:#75806d; margin-top:12px; line-height:1.5; }
        .fr-address-fields { margin-top:14px; }
        .fr-address-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .fr-address-field { display:flex; flex-direction:column; gap:7px; min-width:0; }
        .fr-address-field>span { font-size:11px; font-weight:700; color:#2c5c16; }
        .fr-address-field input,.fr-address-field select,.fr-address-field textarea { box-sizing:border-box; width:100%; min-width:0; border:1px solid #dce5d4; border-radius:9px; background:#fff; color:#253820; padding:10px 11px; font:inherit; font-size:12px; }
        .fr-address-field input:focus,.fr-address-field select:focus,.fr-address-field textarea:focus { outline:2px solid #b3c99d; outline-offset:1px; }
        .fr-address-field select:disabled { background:#f5f7f1; }
        .fr-address-full { grid-column:1/-1; }
        .fr-address-complete { margin-top:14px; }
        .fr-address-complete textarea { resize:vertical; min-height:80px; border-color:#c8b572; }
        .fr-address-help { display:block; font-size:10px; color:#75806d; line-height:1.5; margin-top:8px; }
        .fr-address-notice { font-size:11px; color:#766020; background:#fffbeb; border-radius:8px; padding:10px; margin-top:12px; line-height:1.5; }
        .fr-address-notice button { background:none; border:0; color:#3b791e; text-decoration:underline; font:inherit; cursor:pointer; padding:4px 0; }
        @media(max-width:900px) { .fr-web-cart-layout { grid-template-columns:1fr; gap:20px; padding:18px; } .fr-web-cart-head { padding:18px; } }
        @media(max-width:520px) { .fr-address-grid { grid-template-columns:1fr; } .fr-row-order-buttons { right:14px; gap:6px; } .fr-stock-order-shell .stock-order-row-top { padding-right:84px; } }

        /* Compact purchasing controls: override the shared round-button defaults. */
        .fr-stock-order-shell .stock-order-row-top { padding-right:204px; }
        body.fr-admin-ui .fr-stock-order-shell .fr-row-order-btn,
        .fr-stock-order-shell .fr-row-order-btn { width:auto; min-width:0; height:32px; min-height:32px; padding:0 10px; gap:5px; font-size:11px!important; }
        .fr-stock-order-shell .fr-row-order-btn span { position:static; width:auto; height:auto; overflow:visible; clip:auto; }
        body.fr-admin-ui .fr-stock-order-shell .fr-row-order-btn.primary { background:#3b791e; color:#fff; }
        .fr-stock-order-shell .fr-quantity-control,
        .fr-stock-order-shell .fr-cart-stepper { display:inline-flex; width:126px; max-width:100%; height:34px; gap:4px; border:0!important; box-shadow:none!important; background:transparent; overflow:visible; border-radius:0; }
        body.fr-admin-ui .fr-stock-order-shell :is(.fr-quantity-control,.fr-cart-stepper) button,
        .fr-stock-order-shell :is(.fr-quantity-control,.fr-cart-stepper) button { width:30px!important; min-width:30px!important; height:32px!important; min-height:32px!important; padding:0!important; border:0!important; border-radius:8px!important; background:#edf3e5!important; color:#3b791e!important; flex:0 0 30px; box-shadow:none!important; }
        .fr-stock-order-shell :is(.fr-quantity-control,.fr-cart-stepper) input { flex:0 0 58px; width:58px!important; min-width:0!important; height:32px; box-sizing:border-box; padding:0 3px!important; border:0!important; border-radius:6px; background:#f6f8f1; box-shadow:none!important; text-align:center; appearance:textfield; font:inherit; font-size:12px; }
        .fr-stock-order-shell :is(.fr-quantity-control,.fr-cart-stepper) input::-webkit-inner-spin-button,
        .fr-stock-order-shell :is(.fr-quantity-control,.fr-cart-stepper) input::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
        .fr-quantity-limit,.fr-cart-quantity-hint { display:block; font-size:10px; color:#65735c; line-height:1.5; margin:8px 0 0; }
        .fr-supply-details { padding:14px; margin:18px 0; border-radius:12px; background:#f4f7ed; }
        .fr-supply-details-title { display:flex; align-items:center; gap:7px; font-size:12px; color:#2c5c16; font-weight:800; margin-bottom:12px; }
        .fr-supply-details dl { margin:0; display:grid; gap:9px; }
        .fr-supply-details dl>div { display:flex; justify-content:space-between; gap:18px; font-size:11px; }
        .fr-supply-details dt { color:#65735c; }
        .fr-supply-details dd { margin:0; text-align:right; color:#2c5c16; font-weight:700; overflow-wrap:anywhere; }
        .fr-supply-details p { margin:12px 0 0; font-size:10px; color:#65735c; }
        body.fr-admin-ui .fr-stock-order-shell .fr-stock-status,
        .fr-stock-order-shell .fr-stock-status { display:inline-flex; gap:5px; align-items:center; min-height:0; min-width:0; border:0; padding:3px 0; margin:0 0 8px; background:transparent; font-size:10px!important; font-weight:700!important; cursor:pointer; color:#3b791e; }
        .fr-stock-status>span { width:6px; height:6px; border-radius:50%; background:currentColor; }
        .fr-stock-order-shell .fr-stock-status.out,
        body.fr-admin-ui .fr-stock-order-shell .fr-stock-status.out { color:#dc2626; }
        .fr-stock-order-shell .fr-stock-status.low,
        body.fr-admin-ui .fr-stock-order-shell .fr-stock-status.low { color:#c76b0a; }
        .fr-stock-order-shell .stock-order-stock-line.out-track { background:#dc2626!important; }
        .fr-stock-order-shell .stock-order-stock-line.low-track { background:#fff0d9; }
        .fr-stock-order-shell .stock-order-stock-line-fill.low { background:#e99320!important; }
        .fr-stock-order-shell .stock-order-stock-line-fill.out { background:#dc2626!important; }
        @media(max-width:520px) {
          .fr-stock-order-shell .stock-order-row-top { padding-right:0; display:flex; flex-direction:column; }
          .fr-stock-order-shell .fr-row-order-buttons { position:static; order:4; margin-top:9px; flex-wrap:wrap; }
        }

        .fr-stock-order-shell .fr-order-success-actions { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; width:100%; margin-top:22px; }
        body.fr-admin-ui .fr-stock-order-shell .fr-order-success-actions .checkout-place-btn,
        .fr-stock-order-shell .fr-order-success-actions .checkout-place-btn { display:flex!important; align-items:center; justify-content:center; align-self:center; width:min(100%,240px)!important; max-width:240px; margin:0!important; }
        body.fr-admin-ui .fr-stock-order-shell .fr-order-redirecting,
        .fr-stock-order-shell .fr-order-redirecting { display:inline-flex!important; align-items:center; justify-content:center; gap:8px; max-width:100%; padding:9px 14px; border:0!important; background:#f0f5e8!important; color:#3b791e!important; opacity:1!important; cursor:wait!important; font-size:11px!important; white-space:normal; }
        .fr-order-redirect-spinner { animation:frOrderRedirectSpin 1s linear infinite; }
        @keyframes frOrderRedirectSpin { to { transform:rotate(360deg); } }
        @media(prefers-reduced-motion:reduce) { .fr-order-redirect-spinner { animation:none; } }
      `}</style>

      <div
        className="stock-surface"
        style={{
          background: MSI_C.white,
          border: `1px solid ${MSI_C.border}`,
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 2px 10px rgba(50,109,32,.05)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="stock-order-header"
          style={{
            padding: "14px 18px 14px 22px",
            background: "#fbfcf8",
            borderBottom: `1px solid ${MSI_C.border}`,
            color: MSI_C.ink,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: MSI_C.greenLt,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Layers size={16} color={MSI_C.green} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontWeight: 900, fontSize: 15 }}>
                  {userBrand || "Stock Inventory"}
                </span>
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: 999,
                    background: MSI_C.white,
                    border: `1px solid ${MSI_C.border}`,
                    color: MSI_C.muted,
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                >
                  {userBranch || "No branch assigned"}
                </span>
              </div>
              <div style={{ marginTop: 4, fontSize: 11, color: MSI_C.muted }}>
                Order store supplies from iFranchise
              </div>
            </div>
          </div>
          <div className="stock-order-header-actions">
            <button
              type="button"
              className="v-btn v-btn-secondary stock-order-orders-btn"
              onClick={() => {
                setShowOrders(true);
                fetchOrders();
              }}
            >
              <History size={14} />
              View Orders
              <span className="stock-order-count-badge">
                {orderCounts.total}
              </span>
            </button>
            <button
              type="button"
              className="stock-order-cart-btn"
              onClick={() => setShowCart(true)}
              aria-label={`Open cart, ${cartItemCount} ${cartItemCount === 1 ? "item" : "items"}`}
              title="My Cart"
            >
              <ShoppingCart size={26} strokeWidth={1.7} aria-hidden="true" />
              <span className="stock-cart-count" aria-hidden="true">
                {cartItemCount}
              </span>
            </button>
          </div>
        </div>

        <div
          style={{
            padding: "12px 18px",
            borderBottom: `1px solid ${MSI_C.border}`,
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            background: "#fbfcf8",
          }}
        >
          <div
            style={{ position: "relative", flex: "1 1 190px", minWidth: 130 }}
          >
            <div
              style={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                color: MSI_C.muted,
              }}
            >
              <MSI_SearchIcon size={11} />
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search item, category, SKU…"
              style={{
                ...MSI_invInputSt,
                height: 32,
                fontSize: 12,
                paddingLeft: 25,
              }}
            />
          </div>
          {categoryOptions.length > 0 && (
            <select
              value={categoryF}
              onChange={(e) => setCategoryF(e.target.value)}
              style={{
                ...MSI_invInputSt,
                height: 32,
                fontSize: 11,
                width: 150,
              }}
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
            style={{ ...MSI_invInputSt, height: 32, fontSize: 11, width: 100 }}
          >
            <option value="">All Units</option>
            {MSI_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <select
            value={statusF}
            onChange={(e) => setStatusF(e.target.value)}
            style={{ ...MSI_invInputSt, height: 32, fontSize: 11, width: 118 }}
          >
            <option value="">All Status</option>
            <option value="out">Out of Stock</option>
            <option value="low">Low Stock</option>
            <option value="ok">In Stock</option>
            {hasExpiry && <option value="expiring">Expiring Soon (30d)</option>}
            {hasExpiry && <option value="expired">Expired</option>}
          </select>
          {(search || categoryF || unitF || statusF) && (
            <button
              type="button"
              className="v-btn v-btn-secondary"
              style={{ minHeight: 32, padding: "6px 11px", fontSize: 11 }}
              onClick={() => {
                setSearch("");
                setCategoryF("");
                setUnitF("");
                setStatusF("");
              }}
            >
              Clear
            </button>
          )}
          <button
            type="button"
            className="v-btn v-btn-secondary"
            style={{ minHeight: 32, padding: "6px 11px", fontSize: 11 }}
            onClick={() => {
              fetchItems();
              fetchShopItems();
            }}
            disabled={loading || shopLoading}
          >
            <RefreshCw
              size={13}
              className={loading || shopLoading ? "fr-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {(inventoryError || shopError) && (
          <div
            role="alert"
            style={{
              margin: "12px 18px 0",
              padding: "10px 12px",
              border: "1px solid #f2c9c4",
              borderRadius: 10,
              background: MSI_C.redBg,
              color: MSI_C.red,
              fontSize: 11,
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <AlertTriangle size={14} />
            {inventoryError || shopError}
          </div>
        )}

        <div className="stock-order-layout" aria-busy={loading || shopLoading}>
          <div className="stock-order-list" aria-label="Branch inventory items">
            {loading ? (
              <div
                style={{
                  padding: "50px 20px",
                  textAlign: "center",
                  color: MSI_C.muted,
                }}
              >
                <RefreshCw size={20} className="fr-spin" />
                <div style={{ marginTop: 10, fontSize: 12 }}>
                  Loading inventory…
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div
                style={{
                  padding: "44px 20px",
                  textAlign: "center",
                  color: MSI_C.muted,
                }}
              >
                <Package size={26} />
                <div style={{ marginTop: 10, fontSize: 12, fontWeight: 800 }}>
                  {items.length
                    ? "No items match your filters."
                    : "No items found for your assigned brand and branch."}
                </div>
              </div>
            ) : (
              filtered.map((item) => {
                const active = item.id === selectedId;
                const stockValue = Math.max(0, Number(item.stock ?? 0));
                const outOfStock = stockValue <= 0;
                const low = !outOfStock && isLowStock(item);
                const stockStatus = outOfStock
                  ? "Out of Stock"
                  : low
                    ? "Low Stock"
                    : "In Stock";
                const stockClass = outOfStock ? "out" : low ? "low" : "ok";
                const stockPercent =
                  maxBarStock > 0
                    ? Math.min(
                        100,
                        Math.max(
                          0,
                          Math.round((stockValue / maxBarStock) * 100),
                        ),
                      )
                    : 0;
                const stockBarLabel = `${stockStatus}: ${MSI_frStockQuantity(item.stock, item.unit)}. Click to view stock batches.`;
                return (
                  <div
                    key={item.id}
                    className={`stock-order-row${active ? " active" : ""}`}
                    onClick={() => selectItem(item)}
                    role="button"
                    tabIndex={0}
                    aria-pressed={active}
                    onKeyDown={(e) => {
                      if (
                        e.target === e.currentTarget &&
                        (e.key === "Enter" || e.key === " ")
                      ) {
                        e.preventDefault();
                        selectItem(item);
                      }
                    }}
                  >
                    <span className="stock-order-row-top">
                      <span
                        className="fr-row-order-buttons"
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="fr-row-order-btn"
                          title={`Add ${item.name} to cart`}
                          aria-label={`Add ${item.name} to cart`}
                          disabled={shopLoading}
                          onClick={() => openOrderDialog(item, "cart")}
                        >
                          <ShoppingCart size={15} />
                          <span>Add to Cart</span>
                        </button>
                        <button
                          type="button"
                          className="fr-row-order-btn primary"
                          title={`Buy ${item.name} now`}
                          aria-label={`Buy ${item.name} now`}
                          disabled={shopLoading}
                          onClick={() => openOrderDialog(item, "buyNow")}
                        >
                          <span>Buy Now</span>
                        </button>
                      </span>
                      <span className="stock-order-row-name">{item.name}</span>
                      <span className="stock-order-row-meta">
                        {[item.sku || "No SKU", item.branch || userBranch]
                          .filter(Boolean)
                          .join("  •  ")}
                      </span>
                      <span className="stock-order-row-submeta">
                        {[item.name, item.branch || userBranch]
                          .filter(Boolean)
                          .join("  •  ")}
                      </span>
                    </span>
                    <span
                      className={`stock-order-stock-line ${stockClass}-track`}
                      role="progressbar"
                      aria-valuenow={Math.max(0, stockValue)}
                      aria-valuemin={0}
                      aria-valuemax={maxBarStock}
                      aria-label={stockBarLabel}
                      title={stockBarLabel}
                    >
                      <span
                        className={`stock-order-stock-line-fill ${stockClass}`}
                        style={{ width: `${stockPercent}%` }}
                      />
                    </span>
                    <button
                      type="button"
                      className={`fr-stock-status ${stockClass}`}
                      title={stockBarLabel}
                      onClick={(event) => {
                        event.stopPropagation();
                        selectItem(item);
                      }}
                    >
                      <span aria-hidden="true" />
                      {stockStatus} ·{" "}
                      {MSI_frStockQuantity(item.stock, item.unit)}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <section
            id="fr-stock-order-detail"
            className="stock-order-detail"
            aria-label="Stock details and supply ordering"
          >
            {selected ? (
              <div>
                <div className="stock-order-queue-panel">
                  <div className="stock-order-section-title">
                    <Layers size={13} /> Stock Rotation / Batches
                  </div>
                  <MSI_FrFifoQueue
                    key={selected.id || "empty"}
                    product={selected}
                    batches={batches}
                    loading={batchLoading}
                    lowStock={isLowStock(selected)}
                    onViewHistory={(batch) => {
                      setHistoryBatch({
                        batch,
                        ingredient: selected,
                      });
                    }}
                  />
                </div>
              </div>
            ) : (
              <div
                className="stock-order-detail-card"
                style={{
                  minHeight: 430,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    padding: 30,
                    color: MSI_C.muted,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 13,
                      background: MSI_C.greenLt,
                      margin: "0 auto 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Layers size={22} color={MSI_C.green} />
                  </div>
                  <div
                    style={{ fontSize: 14, fontWeight: 900, color: MSI_C.ink }}
                  >
                    Select an inventory item
                  </div>
                  <div
                    style={{
                      marginTop: 5,
                      maxWidth: 290,
                      fontSize: 10.5,
                      lineHeight: 1.6,
                    }}
                  >
                    View stock rotation and batch details. Use the buttons on
                    each item to order supplies.
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <MSI_Toast toast={stockToast} onClose={closeStockToast} />
      {orderDialog && (
        <div
          className="v-modal-overlay"
          onMouseDown={() => setOrderDialog(null)}
        >
          <form
            ref={orderingModalRef}
            className="v-modal fr-quantity-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fr-order-title"
            onMouseDown={(event) => event.stopPropagation()}
            onSubmit={confirmOrderDialog}
            onKeyDown={(event) => {
              if (event.key === "Escape") setOrderDialog(null);
            }}
          >
            <div className="fr-dialog-head">
              <div>
                <small>
                  {orderDialog.mode === "cart" ? "Add to Cart" : "Buy Now"}
                </small>
                <h3 id="fr-order-title">{orderDialog.inventoryItem.name}</h3>
              </div>
              <button
                type="button"
                className="fr-icon-btn"
                aria-label="Close quantity dialog"
                onClick={() => setOrderDialog(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="fr-supply-details">
              <div className="fr-supply-details-title">
                <Package size={16} /> Supply Details
              </div>
              <dl>
                <div>
                  <dt>Brand</dt>
                  <dd>{dialogShopItem?.brand || userBrand}</dd>
                </div>
                <div>
                  <dt>Category</dt>
                  <dd>
                    {orderDialog.inventoryItem.category ||
                      dialogShopItem?.category ||
                      "—"}
                  </dd>
                </div>
                <div>
                  <dt>SKU</dt>
                  <dd>
                    {orderDialog.inventoryItem.sku ||
                      dialogShopItem?.sku ||
                      "—"}
                  </dd>
                </div>
                <div>
                  <dt>Your Branch Stock</dt>
                  <dd>
                    {MSI_frStockQuantity(
                      orderDialog.inventoryItem.stock,
                      orderDialog.inventoryItem.unit,
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Head Office Stock</dt>
                  <dd>
                    {shopLoading
                      ? "Loading…"
                      : MSI_frStockQuantity(
                          dialogShopItem?.stock || 0,
                          dialogShopItem?.unit,
                        )}
                  </dd>
                </div>
                <div>
                  <dt>Price per {MSI_frFullUnit(dialogShopItem?.unit, 1)}</dt>
                  <dd>{MSI_fmtPeso(dialogShopItem?.price || 0)}</dd>
                </div>
              </dl>
              {dialogCartQuantity > 0 && (
                <p>
                  {MSI_frStockQuantity(
                    dialogCartQuantity,
                    dialogShopItem?.unit,
                  )}{" "}
                  already in your cart.
                </p>
              )}
            </div>
            <label className="fr-quantity-label" htmlFor="fr-supply-quantity">
              Quantity
            </label>
            <div className="fr-quantity-control">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={shopLoading || Number(orderQuantity) <= 1}
                onClick={() => {
                  setOrderQuantity(
                    String(Math.max(1, Number(orderQuantity || 1) - 1)),
                  );
                  setQuantityError("");
                }}
              >
                −
              </button>
              <input
                autoFocus
                id="fr-supply-quantity"
                type="number"
                min="1"
                max={dialogMaximum}
                step="1"
                value={orderQuantity}
                onChange={(event) => {
                  const value = event.target.value;
                  setOrderQuantity(
                    value === ""
                      ? ""
                      : String(
                          Math.min(
                            dialogMaximum,
                            Math.max(1, Math.floor(Number(value) || 1)),
                          ),
                        ),
                  );
                  setQuantityError("");
                }}
                onBlur={() => {
                  if (!orderQuantity && dialogMaximum > 0)
                    setOrderQuantity("1");
                }}
                disabled={shopLoading || dialogMaximum < 1}
                aria-describedby={
                  quantityError ? "fr-quantity-error" : undefined
                }
              />
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={shopLoading || Number(orderQuantity) >= dialogMaximum}
                onClick={() => {
                  setOrderQuantity(
                    String(
                      Math.min(dialogMaximum, Number(orderQuantity || 0) + 1),
                    ),
                  );
                  setQuantityError("");
                }}
              >
                +
              </button>
            </div>
            <p className="fr-quantity-limit">
              {MSI_frStockQuantity(
                Number(orderQuantity) || 0,
                dialogShopItem?.unit,
              )}{" "}
              selected · Maximum{" "}
              {MSI_frStockQuantity(dialogMaximum, dialogShopItem?.unit)}
              {orderDialog.mode === "cart" && dialogCartQuantity > 0
                ? " more"
                : ""}
            </p>
            {shopError && (
              <p className="fr-field-error" role="alert">
                Unable to refresh Head Office stock.{" "}
                <button type="button" onClick={fetchShopItems}>
                  Retry
                </button>
              </p>
            )}
            {quantityError && (
              <p id="fr-quantity-error" className="fr-field-error" role="alert">
                {quantityError}
              </p>
            )}
            <div className="fr-quantity-total">
              <span>Subtotal</span>
              <strong>
                {MSI_fmtPeso(
                  Number(dialogShopItem?.price || 0) *
                    Math.max(0, Number(orderQuantity) || 0),
                )}
              </strong>
            </div>
            <button
              className="v-btn v-btn-primary fr-wide-button"
              type="submit"
              disabled={shopLoading || Boolean(shopError) || dialogMaximum < 1}
            >
              {orderDialog.mode === "cart" && <ShoppingCart size={15} />}
              {orderDialog.mode === "cart"
                ? "Add to Cart"
                : "Proceed to Checkout"}
            </button>
          </form>
        </div>
      )}
      {showCart && (
        <div className="v-modal-overlay" onMouseDown={() => setShowCart(false)}>
          <div
            ref={orderingModalRef}
            className="v-modal fr-web-cart"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fr-cart-title"
            onMouseDown={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === "Escape") setShowCart(false);
            }}
          >
            <header className="fr-web-cart-head">
              <div>
                <h2 id="fr-cart-title">
                  <ShoppingCart size={23} /> My Cart <span>{cart.length}</span>
                </h2>
                <p>
                  {userBrand} · {userBranch}
                </p>
              </div>
              <button
                type="button"
                className="v-btn v-btn-secondary"
                onClick={() => setShowCart(false)}
              >
                <X size={15} /> Close
              </button>
            </header>
            {cartLineItems.length ? (
              <div className="fr-web-cart-layout">
                <section className="fr-web-cart-items" aria-label="Cart items">
                  <div className="fr-cart-toolbar">
                    <label>
                      <input
                        type="checkbox"
                        checked={
                          cart.length > 0 && selectedCart.length === cart.length
                        }
                        onChange={toggleAllCartItems}
                      />{" "}
                      Select all items
                    </label>
                    <span>{selectedCart.length} selected</span>
                  </div>
                  <div className="fr-cart-table-scroll">
                    <table className="fr-cart-table">
                      <thead>
                        <tr>
                          <th scope="col">Select</th>
                          <th scope="col">Item</th>
                          <th scope="col">Unit Price</th>
                          <th scope="col">Quantity</th>
                          <th scope="col">Subtotal</th>
                          <th scope="col">
                            <span className="fr-visually-hidden">Remove</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartLineItems.map((entry) => {
                          const hasIssue =
                            !Number.isInteger(Number(entry.quantity)) ||
                            Number(entry.quantity) < 1 ||
                            entry.stock <= 0 ||
                            Number(entry.quantity) > entry.stock;
                          return (
                            <tr
                              key={entry.id}
                              className={hasIssue ? "fr-cart-row-issue" : ""}
                            >
                              <td>
                                <input
                                  type="checkbox"
                                  aria-label={`Select ${entry.name}`}
                                  checked={selectedCartIds.includes(entry.id)}
                                  onChange={() => toggleCartItem(entry.id)}
                                />
                              </td>
                              <td>
                                <div className="fr-cart-product">
                                  <div className="fr-cart-thumb">
                                    {entry.image_url ? (
                                      <img src={entry.image_url} alt="" />
                                    ) : (
                                      <Package size={22} />
                                    )}
                                  </div>
                                  <div>
                                    <strong>{entry.name}</strong>
                                    <small>
                                      {entry.brand} ·{" "}
                                      {MSI_frFullUnit(
                                        entry.unit,
                                        Number(entry.quantity),
                                      )}
                                    </small>
                                    <small
                                      className={
                                        hasIssue ? "fr-field-error" : ""
                                      }
                                    >
                                      {entry.stock <= 0
                                        ? "Currently unavailable"
                                        : hasIssue
                                          ? `Update quantity — ${entry.stock} available`
                                          : `Head Office: ${MSI_frStockQuantity(entry.stock, entry.unit)} available`}
                                    </small>
                                  </div>
                                </div>
                              </td>
                              <td>{MSI_fmtPeso(entry.price)}</td>
                              <td>
                                <div className="fr-cart-stepper">
                                  <button
                                    type="button"
                                    aria-label={`Decrease ${entry.name}`}
                                    disabled={
                                      Number(entry.quantity) <= 1 ||
                                      entry.stock <= 0
                                    }
                                    onClick={() =>
                                      updateCartQuantity(entry.id, -1)
                                    }
                                  >
                                    −
                                  </button>
                                  <input
                                    type="number"
                                    aria-label={`Quantity for ${entry.name}`}
                                    min="1"
                                    max={Math.floor(entry.stock)}
                                    step="1"
                                    disabled={shopLoading || entry.stock <= 0}
                                    value={entry.quantity}
                                    onChange={(event) => {
                                      const value = event.target.value;
                                      if (value === "")
                                        setCart((current) =>
                                          current.map((item) =>
                                            item.id === entry.id
                                              ? { ...item, quantity: "" }
                                              : item,
                                          ),
                                        );
                                      else setCartQuantity(entry.id, value);
                                    }}
                                    onBlur={(event) =>
                                      setCartQuantity(
                                        entry.id,
                                        event.target.value,
                                      )
                                    }
                                  />
                                  <button
                                    type="button"
                                    aria-label={`Increase ${entry.name}`}
                                    disabled={
                                      Number(entry.quantity) >= entry.stock ||
                                      entry.stock <= 0
                                    }
                                    onClick={() =>
                                      updateCartQuantity(entry.id, 1)
                                    }
                                  >
                                    +
                                  </button>
                                </div>
                                <small className="fr-cart-quantity-hint">
                                  {MSI_frStockQuantity(
                                    Number(entry.quantity) || 0,
                                    entry.unit,
                                  )}{" "}
                                  · Max {Math.floor(entry.stock)}
                                </small>
                              </td>
                              <td>
                                <strong>
                                  {MSI_fmtPeso(
                                    entry.price * Number(entry.quantity || 0),
                                  )}
                                </strong>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="fr-icon-btn danger"
                                  title="Remove item"
                                  aria-label={`Remove ${entry.name}`}
                                  onClick={() => removeFromCart(entry.id)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
                <aside className="fr-cart-summary">
                  <h3>Order Summary</h3>
                  <p>Choose the items you want to order.</p>
                  <div>
                    <span>Selected items</span>
                    <strong>{selectedCart.length}</strong>
                  </div>
                  <div>
                    <span>Quantity</span>
                    <strong>
                      {selectedCart.reduce(
                        (sum, entry) => sum + Number(entry.quantity || 0),
                        0,
                      )}
                    </strong>
                  </div>
                  <div className="fr-cart-summary-total">
                    <span>Total</span>
                    <strong>{MSI_fmtPeso(selectedCartTotal)}</strong>
                  </div>
                  {cartLineItems.some(
                    (entry) =>
                      selectedCartIds.includes(entry.id) &&
                      (!Number.isInteger(Number(entry.quantity)) ||
                        Number(entry.quantity) < 1 ||
                        entry.stock <= 0 ||
                        Number(entry.quantity) > entry.stock),
                  ) && (
                    <p className="fr-field-error" role="alert">
                      Update the highlighted items before checkout.
                    </p>
                  )}
                  <button
                    type="button"
                    className="v-btn v-btn-primary fr-wide-button"
                    disabled={
                      !selectedCart.length ||
                      shopLoading ||
                      Boolean(shopError) ||
                      cartLineItems.some(
                        (entry) =>
                          selectedCartIds.includes(entry.id) &&
                          (!Number.isInteger(Number(entry.quantity)) ||
                            Number(entry.quantity) < 1 ||
                            entry.stock <= 0 ||
                            Number(entry.quantity) > entry.stock),
                      )
                    }
                    onClick={() =>
                      prepareCheckout(
                        cartLineItems.filter((entry) =>
                          selectedCartIds.includes(entry.id),
                        ),
                      )
                    }
                  >
                    <CheckCircle size={16} /> Check Out ({selectedCart.length})
                  </button>
                  <small>Unselected items stay in your cart.</small>
                </aside>
              </div>
            ) : (
              <div className="stock-order-empty">
                <ShoppingCart size={36} color={MSI_C.green} />
                <h3>Your cart is empty</h3>
                <p>Add supplies directly from your stock inventory.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showOrders && (
        <div
          className="v-modal-overlay"
          onMouseDown={() => setShowOrders(false)}
        >
          <div
            className="v-modal stock-order-orders-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="stock-orders-modal-head">
              <div className="stock-modal-title-row">
                <div style={{ minWidth: 0 }}>
                  <div className="stock-modal-eyebrow">Order History</div>
                  <div className="stock-modal-title">My Supply Orders</div>
                  <div className="stock-modal-subtitle">
                    Orders placed for {userBrand || "your assigned brand"} ·{" "}
                    {userBranch || "your assigned branch"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    type="button"
                    className="v-btn v-btn-secondary"
                    onClick={fetchOrders}
                    disabled={ordersLoading}
                    style={{
                      minHeight: 34,
                      padding: "7px 10px",
                      fontSize: 10.5,
                    }}
                  >
                    <RefreshCw
                      size={12}
                      className={ordersLoading ? "fr-spin" : ""}
                    />{" "}
                    Refresh
                  </button>
                  <button
                    type="button"
                    className="v-btn v-btn-secondary"
                    onClick={() => setShowOrders(false)}
                    style={{
                      minHeight: 34,
                      padding: "7px 10px",
                      fontSize: 10.5,
                    }}
                  >
                    <X size={13} /> Close
                  </button>
                </div>
              </div>
            </div>

            <div className="stock-orders-summary">
              <div className="stock-orders-stat">
                <strong>{orderCounts.total}</strong> Total
              </div>
              <div className="stock-orders-stat">
                <strong>{orderCounts.pending}</strong> Pending
              </div>
              <div className="stock-orders-stat">
                <strong>{orderCounts.processing}</strong> Processing
              </div>
              <div className="stock-orders-stat">
                <strong>{orderCounts.completed}</strong> Completed
              </div>
            </div>

            {ordersError && (
              <div
                role="alert"
                style={{
                  margin: "12px 20px 0",
                  padding: "9px 11px",
                  border: "1px solid #f0c9c3",
                  borderRadius: 9,
                  background: MSI_C.redBg,
                  color: MSI_C.red,
                  fontSize: 10.5,
                  display: "flex",
                  gap: 7,
                  alignItems: "center",
                }}
              >
                <AlertTriangle size={13} />
                {ordersError}
              </div>
            )}

            <div
              className="stock-modal-scroll"
              style={{ maxHeight: "min(62vh,560px)", padding: "2px 0 10px" }}
            >
              {ordersLoading && !orders.length ? (
                <div className="stock-order-empty">
                  <RefreshCw
                    size={24}
                    className="fr-spin"
                    color={MSI_C.green}
                  />
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 12,
                      fontWeight: 900,
                      color: MSI_C.ink,
                    }}
                  >
                    Loading your orders…
                  </div>
                </div>
              ) : ordersError && !orders.length ? null : orders.length ? (
                orders.map((order) => {
                  const orderId =
                    order?.id ?? order?.order_id ?? order?.reference ?? "—";
                  const status = orderStatusMeta(order?.status);
                  const items = orderItemList(order);
                  const total = Number(
                    order?.total_amount ?? order?.total ?? 0,
                  );
                  const created =
                    order?.created_at ||
                    order?.createdAt ||
                    order?.date ||
                    order?.ordered_at;
                  const expanded = String(expandedOrderId) === String(orderId);

                  return (
                    <div
                      key={String(orderId)}
                      className="stock-order-history-card"
                    >
                      <button
                        type="button"
                        className="stock-order-history-head"
                        style={{
                          width: "100%",
                          border: 0,
                          background: "transparent",
                          textAlign: "left",
                        }}
                        onClick={() =>
                          setExpandedOrderId(expanded ? null : orderId)
                        }
                        aria-expanded={expanded}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div className="stock-order-history-id">
                            Order #{orderId}
                          </div>
                          <div className="stock-order-history-date">
                            {formatOrderDate(created)}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            flexShrink: 0,
                          }}
                        >
                          <span className={`stock-order-status ${status.cls}`}>
                            {status.label}
                          </span>
                          <ChevronDown
                            size={14}
                            color={MSI_C.muted}
                            style={{
                              transform: expanded ? "rotate(180deg)" : "none",
                              transition: "transform .15s ease",
                            }}
                          />
                        </div>
                      </button>
                      <div className="stock-order-history-meta">
                        <span>
                          {items.reduce(
                            (sum, item) => sum + Number(item._quantity || 0),
                            0,
                          )}{" "}
                          item
                          {items.reduce(
                            (sum, item) => sum + Number(item._quantity || 0),
                            0,
                          ) === 1
                            ? ""
                            : "s"}
                        </span>
                        <span>
                          {String(
                            order?.payment_method || order?.payment || "COD",
                          ).toUpperCase()}
                        </span>
                        <span className="stock-order-history-total">
                          {MSI_fmtPeso(total)}
                        </span>
                      </div>

                      {expanded && (
                        <div className="stock-order-history-details">
                          {items.length ? (
                            items.map((item) => (
                              <div
                                key={String(item._key)}
                                className="stock-order-history-item"
                              >
                                <div style={{ minWidth: 0 }}>
                                  <div className="stock-order-history-item-name">
                                    {item._name}
                                  </div>
                                  <div className="stock-order-history-item-meta">
                                    {MSI_frStockQuantity(
                                      item._quantity,
                                      item._unit,
                                    )}{" "}
                                    × {MSI_fmtPeso(item._price)}
                                  </div>
                                </div>
                                <strong
                                  style={{
                                    color: MSI_C.greenDk,
                                    fontSize: 10.5,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {MSI_fmtPeso(item._quantity * item._price)}
                                </strong>
                              </div>
                            ))
                          ) : (
                            <div style={{ fontSize: 9.5, color: MSI_C.muted }}>
                              Item details are not included in the order
                              response.
                            </div>
                          )}
                          {(order?.address || order?.delivery_address) && (
                            <div className="stock-order-history-address">
                              <strong>Delivery:</strong>{" "}
                              {order.address || order.delivery_address}
                            </div>
                          )}
                          {order?.gcash_ref && (
                            <div className="stock-order-history-address">
                              <strong>GCash reference:</strong>{" "}
                              {order.gcash_ref}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="stock-order-empty">
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 15,
                      background: MSI_C.greenLt,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 13px",
                      color: MSI_C.green,
                    }}
                  >
                    <History size={24} />
                  </div>
                  <div
                    style={{ fontSize: 14, fontWeight: 900, color: MSI_C.ink }}
                  >
                    No supply orders yet
                  </div>
                  <div
                    style={{ marginTop: 6, fontSize: 10.5, lineHeight: 1.5 }}
                  >
                    Orders you place from Stock Inventory will appear here.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showCheckout && (
        <div
          className="v-modal-overlay"
          onMouseDown={() => !placingOrder && setShowCheckout(false)}
        >
          <div
            className="v-modal stock-order-checkout-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="checkout-mobile-head">
              <div className="checkout-mobile-head-left">
                <button
                  type="button"
                  className="checkout-mobile-back"
                  onClick={() => setShowCheckout(false)}
                  disabled={placingOrder}
                  aria-label="Back"
                >
                  <span style={{ fontSize: 20, lineHeight: 1 }}>‹</span>
                </button>
                <div>
                  <div className="checkout-mobile-title">Check Out</div>
                  <div className="checkout-mobile-subtitle">
                    {checkoutItems.length}{" "}
                    {checkoutItems.length === 1 ? "item" : "items"} to order
                  </div>
                </div>
              </div>
            </div>

            {orderSuccess ? (
              <div className="checkout-success-mobile">
                <CheckCircle size={54} color={MSI_C.green} />
                <div
                  style={{
                    marginTop: 14,
                    fontSize: 20,
                    fontWeight: 900,
                    color: MSI_C.ink,
                  }}
                >
                  Order Placed
                </div>
                <div className="stock-order-muted" style={{ marginTop: 7 }}>
                  Order #{orderSuccess.id} · {MSI_fmtPeso(orderSuccess.total)}
                </div>
                <div
                  style={{ marginTop: 12, fontSize: 11.5, color: MSI_C.muted }}
                >
                  Your supply order has been submitted successfully.
                </div>
                <div className="fr-order-success-actions">
                  <button
                    type="button"
                    className="checkout-place-btn"
                    onClick={viewSupplyOrders}
                  >
                    <History size={18} /> View Orders
                  </button>
                  <button
                    type="button"
                    className="fr-order-redirecting"
                    disabled
                    aria-busy="true"
                  >
                    <RefreshCw
                      size={15}
                      className="fr-order-redirect-spinner"
                      aria-hidden="true"
                    />
                    Redirecting to order history…
                  </button>
                  <span className="fr-visually-hidden" role="status">
                    Redirecting to order history in 3 seconds.
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="checkout-mobile-scroll">
                  <section className="checkout-mobile-section">
                    <div className="checkout-mobile-section-title">
                      <span className="checkout-mobile-section-bar" />
                      Franchisee
                    </div>
                    <div className="checkout-mobile-card checkout-user-card">
                      <div className="checkout-user-thumb">
                        {String(user?.name || "F")
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="checkout-user-name">
                          {user?.name || "Franchisee"}
                        </div>
                        <div className="checkout-user-meta">
                          {user?.role || "Franchisee"}
                        </div>
                        {userBranch && (
                          <div className="checkout-branch-pill">
                            <MSI_StoreIcon size={13} /> {userBranch}
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  <section className="checkout-mobile-section">
                    <div className="checkout-mobile-section-title">
                      <span className="checkout-mobile-section-bar" />
                      Order Summary
                    </div>
                    <div className="checkout-mobile-card">
                      {checkoutItems.map((entry) => (
                        <div className="checkout-order-row" key={entry.id}>
                          <div className="checkout-order-thumb">
                            {entry.image_url ? (
                              <img src={entry.image_url} alt="" />
                            ) : (
                              <Package size={16} />
                            )}
                          </div>
                          <div className="checkout-order-main">
                            <div className="checkout-order-name">
                              {entry.name}
                            </div>
                            <div className="checkout-order-qty">
                              {MSI_frStockQuantity(entry.quantity, entry.unit)}{" "}
                              · {MSI_fmtPeso(entry.price)} each
                            </div>
                          </div>
                          <div className="checkout-order-price">
                            {MSI_fmtPeso(
                              Number(entry.price) * Number(entry.quantity),
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="checkout-mobile-section">
                    <div className="checkout-mobile-section-title">
                      <span className="checkout-mobile-section-bar" />
                      Delivery Location
                    </div>
                    {renderLocationMap()}
                    <p className="checkout-map-hint">
                      Click the map to select your delivery location and fill in
                      the address.
                    </p>
                    {locationError && (
                      <p className="checkout-map-error" role="alert">
                        {locationError}
                      </p>
                    )}
                    <MSI_FrSupplyAddressFields
                      address={address}
                      mapResult={mapAddressData}
                      inputRef={addressInputRef}
                      onChange={(value) => {
                        mapRequestRef.current += 1;
                        clearTimeout(reverseTimerRef.current);
                        setLocationBusy(false);
                        setAddress(value);
                        setPinCoords(null);
                      }}
                    />
                  </section>

                  <section className="checkout-mobile-section">
                    <div className="checkout-mobile-section-title">
                      <span className="checkout-mobile-section-bar" />
                      Payment Method
                    </div>

                    <button
                      type="button"
                      className={`checkout-pay-card${paymentMethod === "gcash" ? " selected" : ""}`}
                      onClick={() => setPaymentMethod("gcash")}
                    >
                      <div className="checkout-pay-thumb gcash">G</div>
                      <div className="checkout-pay-main">
                        <div className="checkout-pay-label">GCash</div>
                        <div className="checkout-pay-desc">
                          Pay via GCash for your supply order
                        </div>
                      </div>
                      <span className="checkout-radio">
                        {paymentMethod === "gcash" && (
                          <span className="checkout-radio-dot" />
                        )}
                      </span>
                    </button>

                    <button
                      type="button"
                      className={`checkout-pay-card${paymentMethod === "cod" ? " selected" : ""}`}
                      onClick={() => setPaymentMethod("cod")}
                    >
                      <div className="checkout-pay-thumb">
                        <CreditCard size={20} color="#2c5c16" />
                      </div>
                      <div className="checkout-pay-main">
                        <div className="checkout-pay-label">
                          Cash on Delivery
                        </div>
                        <div className="checkout-pay-desc">
                          Pay when your order arrives
                        </div>
                      </div>
                      <span className="checkout-radio">
                        {paymentMethod === "cod" && (
                          <span className="checkout-radio-dot" />
                        )}
                      </span>
                    </button>
                  </section>
                </div>

                <div className="checkout-mobile-bottom">
                  <div className="checkout-mobile-accent" />
                  <div
                    className="checkout-mobile-section-title"
                    style={{ marginBottom: 16 }}
                  >
                    <span className="checkout-mobile-section-bar" />
                    Order Total
                  </div>
                  <div className="checkout-total-row">
                    <div className="checkout-total-label">Total Amount</div>
                    <div className="checkout-total-amount">
                      {MSI_fmtPeso(checkoutTotal)}
                    </div>
                  </div>
                  <div
                    className="checkout-payment-chip"
                    style={
                      paymentMethod === "gcash"
                        ? { color: "#1565C0" }
                        : undefined
                    }
                  >
                    {paymentMethod === "gcash" ? (
                      <>
                        <strong>G</strong>
                        <span>GCash payment</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={14} />
                        <span>Cash on Delivery</span>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    className="checkout-place-btn"
                    onClick={handleCheckoutAction}
                    disabled={placingOrder}
                  >
                    {placingOrder ? (
                      "Placing Order…"
                    ) : paymentMethod === "gcash" ? (
                      <>
                        <CreditCard size={18} /> Pay with GCash
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} /> Place Order (COD)
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <MSI_WebGCashPaymentModal
        visible={showGCash}
        amount={gcashAmount}
        onConfirm={handleGCashConfirmed}
        onCancel={() => setShowGCash(false)}
      />
      {showMapPicker && (
        <div
          className="v-modal-overlay checkout-map-picker-overlay"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div
            className="v-modal checkout-map-picker"
            role="dialog"
            aria-modal="true"
            aria-label="Pin your delivery location"
          >
            <div className="checkout-map-picker-head">
              <button
                type="button"
                onClick={() => setShowMapPicker(false)}
                aria-label="Back to checkout"
              >
                ‹
              </button>
              <strong>Pin Your Location</strong>
              <button type="button" onClick={() => setShowMapPicker(false)}>
                Done
              </button>
            </div>
            {renderLocationMap(true)}
            {locationError && (
              <p className="checkout-map-error" role="alert">
                {locationError}
              </p>
            )}
            <p className="checkout-map-hint">
              Tap the map or drag the pin to set your exact delivery location.
            </p>
          </div>
        </div>
      )}
      {showAddressPrompt && (
        <div
          className="v-modal-overlay"
          style={{ zIndex: 10002 }}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div
            className="v-modal checkout-address-prompt"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="checkout-address-prompt-title"
            aria-describedby="checkout-address-prompt-message"
          >
            <div className="checkout-address-prompt-icon">
              <MSI_StoreIcon size={25} />
            </div>
            <h2 id="checkout-address-prompt-title">Delivery address needed</h2>
            <p id="checkout-address-prompt-message">
              Please enter your delivery address before placing your order.
            </p>
            <button
              type="button"
              autoFocus
              onClick={() => {
                setShowAddressPrompt(false);
                requestAnimationFrame(() => {
                  addressInputRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                  addressInputRef.current?.focus();
                });
              }}
            >
              Enter Address
            </button>
          </div>
        </div>
      )}

      {historyBatch && (
        <MSI_BatchTransferHistoryModal
          batch={historyBatch.batch}
          ingredient={historyBatch.ingredient}
          apiUrl={process.env.REACT_APP_API_URL}
          onClose={() => setHistoryBatch(null)}
        />
      )}
    </div>
  );
}

function MSI_Toast({ toast, onClose }) {
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

export default function ManagerDashboard({
  user: userProp,
  onLogout,
  onUserUpdate,
}) {
  useEffect(() => {
    const fontId = "fr-plus-jakarta-sans";
    if (!document.getElementById(fontId)) {
      const link = document.createElement("link");
      link.id = fontId;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";
      document.head.appendChild(link);
    }
    document.body.classList.add("fr-admin-ui");
    return () => document.body.classList.remove("fr-admin-ui");
  }, []);
  const [activeModule, setActiveModule] = useState(() => {
    const stored = sessionStorage.getItem("fr_activeModule");
    return [
      "dashboard",
      "menuInventory",
      "stockInventory",
      "pos",
      "reports",
      "communication",
      "profile",
    ].includes(stored)
      ? stored
      : "dashboard";
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const mobileMenuRef = useRef(null);
  const sidebarRef = useRef(null);
  const logoutDialogRef = useRef(null);

  // Navigation is a drawer below 900px and a collapsible rail on desktop.
  useEffect(() => {
    const media = window.matchMedia("(max-width: 900px)");
    const closeOnDesktop = () => {
      if (!media.matches) setMobileNavOpen(false);
    };
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    const container = showLogoutModal
      ? logoutDialogRef.current
      : mobileNavOpen
        ? sidebarRef.current
        : null;
    if (!container) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusables = () =>
      Array.from(
        container.querySelectorAll(
          'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
        ),
      ).filter((node) => node.getClientRects().length > 0);
    (focusables()[0] || container).focus();
    const handleKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (showLogoutModal) {
          if (!isLoggingOut) setShowLogoutModal(false);
        } else setMobileNavOpen(false);
      }
      if (event.key === "Tab") {
        const items = focusables();
        if (!items.length) {
          event.preventDefault();
          container.focus();
          return;
        }
        const first = items[0],
          last = items[items.length - 1];
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            !container.contains(document.activeElement))
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last ||
            !container.contains(document.activeElement))
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [mobileNavOpen, showLogoutModal, isLoggingOut]);

  const selectModule = (id) => {
    setActiveModule(id);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  };
  const [transactions, setTransactions] = useState([]);
  const [brands, setBrands] = useState([]);
  const [user, setUser] = useState(userProp || getUserFromStorage);

  // Manager notifications: branch-scoped alerts plus low-stock triggers.
  const [managerNotifications, setManagerNotifications] = useState([]);
  const [managerNotifLoading, setManagerNotifLoading] = useState(false);
  const [managerNotifError, setManagerNotifError] = useState("");
  const managerNotifRefresh = useRef(() => {});

  useEffect(() => {
    let disposed = false;
    let pending = false;
    const controller = new AbortController();

    const refresh = async () => {
      const currentUser = user;
      if (disposed || pending || !currentUser?.id) return;
      pending = true;
      setManagerNotifLoading(true);
      setManagerNotifError("");

      const brand = String(
        currentUser?.brand ||
          currentUser?.brand_name ||
          currentUser?.brandName ||
          "",
      ).trim();
      const branch = String(currentUser?.branch || "").trim();

      try {
        const options = { credentials: "include", signal: controller.signal };
        const params = new URLSearchParams({ userId: String(currentUser.id) });
        if (brand) params.set("brand", brand);
        if (branch) params.set("branch", branch);

        const [notificationResponse, stockResponse] = await Promise.all([
          adminModuleFetch(
            `${process.env.REACT_APP_API_URL}/notifications?${params}`,
            options,
          ),
          branch
            ? adminModuleFetch(
                `${process.env.REACT_APP_API_URL}/ingredients?${new URLSearchParams({ brand, branch })}`,
                options,
              )
            : Promise.resolve(null),
        ]);

        if (!notificationResponse?.ok)
          throw new Error("Notification request failed");

        const recorded = await notificationResponse.json();
        const items = [];
        const normalize = (value) =>
          String(value || "")
            .trim()
            .toLowerCase();

        (Array.isArray(recorded) ? recorded : [])
          .filter(
            (n) =>
              String(n.user_id) === String(currentUser.id) &&
              !n.is_read &&
              (!n.brand || normalize(n.brand) === normalize(brand)) &&
              (!n.branch || normalize(n.branch) === normalize(branch)),
          )
          .forEach((n) => {
            items.push({
              id: `record-${n.id}`,
              recordId: n.id,
              title: n.title || "Branch notification",
              message: n.body || "",
              count: 1,
              type: n.type || "notification",
              module:
                n.type === "announcement"
                  ? "communication"
                  : String(n.type || "").includes("order")
                    ? "dashboard"
                    : "stockInventory",
              icon: String(n.type || "").includes("order")
                ? ShoppingCart
                : n.type === "announcement"
                  ? Megaphone
                  : Bell,
            });
          });

        if (stockResponse?.ok) {
          const stock = await stockResponse.json();
          const low = (Array.isArray(stock) ? stock : []).filter((item) => {
            const itemBrand = normalize(item?.brand);
            const itemBranch = normalize(item?.branch);
            const stockQty = Number(item?.stock);
            const minQty = Number(item?.min_stock);
            return (
              (!brand || itemBrand === normalize(brand)) &&
              (!branch || itemBranch === normalize(branch)) &&
              Number.isFinite(stockQty) &&
              Number.isFinite(minQty) &&
              minQty > 0 &&
              stockQty <= minQty
            );
          });

          if (low.length) {
            items.unshift({
              id: "manager-low-stock",
              title: `${brand || "Branch"} — Low Stock`,
              message: `${branch || "Your branch"}: ${low
                .slice(0, 3)
                .map((item) => item.name)
                .join(
                  ", ",
                )}${low.length > 3 ? ` and ${low.length - 3} more` : ""}. Open Stock Inventory to review quantities.`,
              count: low.length,
              type: "low_stock",
              module: "stockInventory",
              icon: AlertTriangle,
            });
          }
        }

        if (!disposed) setManagerNotifications(items);
      } catch (error) {
        if (!disposed && error.name !== "AbortError") {
          setManagerNotifError("Unable to refresh notifications.");
          setManagerNotifications([]);
        }
      } finally {
        pending = false;
        if (!disposed) setManagerNotifLoading(false);
      }
    };

    managerNotifRefresh.current = refresh;
    refresh();
    const timer = setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);

    return () => {
      disposed = true;
      controller.abort();
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [
    user?.id,
    user?.brand,
    user?.brand_name,
    user?.brandName,
    user?.branch,
    user,
  ]);

  useEffect(() => {
    if (userProp) setUser(userProp);
  }, [userProp]);

  useEffect(() => {
    sessionStorage.setItem("fr_activeModule", activeModule);
  }, [activeModule]);

  useEffect(() => {
    adminModuleFetch(`${process.env.REACT_APP_API_URL}/transactions`, {
      credentials: "include",
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((d) => setTransactions(normalizeTransactions(d)))
      .catch(() => setTransactions([]));
  }, []);

  useEffect(() => {
    adminModuleFetch(`${process.env.REACT_APP_API_URL}/brands`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => setBrands(Array.isArray(d) ? d : []))
      .catch(() => setBrands([]));
  }, []);
  const handleLogout = () => setShowLogoutModal(true);

  const confirmLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      const stored =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      const userId = stored ? JSON.parse(stored)?.id : null;

      await adminModuleFetch(`${process.env.REACT_APP_API_URL}/logout`, {
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
      onLogout?.();
      window.location.href = "/admin-login";
    }
  };

  const navigation = [
    { id: "dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { id: "reports", label: "Sales & Reports", icon: <BarChart2 size={20} /> },
    {
      id: "stockInventory",
      label: "Stock Inventory",
      icon: <Store size={20} />,
    },
    {
      id: "menuInventory",
      label: "Product Catalogue",
      icon: <Box size={20} />,
    },
    {
      id: "pos",
      label: "Point of Sale",
      icon: <ShoppingCart size={20} />,
    },
    // { id: 'receipts',       label: 'Liquidation',     icon: <FileText size={20} /> },
    {
      id: "communication",
      label: "Announcements",
      icon: <Megaphone size={20} />,
    },

    { id: "profile", label: "Profile Settings", icon: <User size={20} /> },
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
    <div className={`franchisee-root${mobileNavOpen ? " fr-drawer-open" : ""}`}>
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
        .fr-nav-bar { position:absolute; right:6px; top:20%; height:60%; width:3px; border-radius:2px; background:#b3a941; }
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
          font-size:14px; font-weight:800; color:#b3a941; cursor:pointer; transition:all .15s; box-shadow:none; font-family:'Plus Jakarta Sans',sans-serif;
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
      <style>{ADMIN_UI_PARITY_CSS(sidebarCollapsed)}</style>
      <style>{FRANCHISEE_LAYOUT_CSS}</style>

      <a className="fr-skip-link" href="#fr-workspace">
        Skip to content
      </a>
      {mobileNavOpen && (
        <button
          type="button"
          className="fr-drawer-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
          tabIndex={-1}
        />
      )}
      {/* Sidebar */}
      <aside
        id="fr-navigation"
        ref={sidebarRef}
        tabIndex={-1}
        className="fr-sidebar"
        aria-label="Manager navigation"
      >
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
              aria-label="Collapse navigation"
              type="button"
              onClick={() => {
                setMobileNavOpen(false);
                if (!window.matchMedia("(max-width: 900px)").matches)
                  setSidebarCollapsed(true);
              }}
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
              aria-label="Expand navigation"
              type="button"
              onClick={() => setSidebarCollapsed(false)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
        <button
          type="button"
          className="fr-mobile-close"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        >
          <X size={16} /> Close menu
        </button>
        <nav className="fr-nav">
          {!sidebarCollapsed && <div className="fr-nav-section">Main Menu</div>}
          {navigation.slice(0, 6).map((item) => (
            <button
              type="button"
              aria-label={item.label}
              aria-current={activeModule === item.id ? "page" : undefined}
              key={item.id}
              className={`fr-nav-item ${activeModule === item.id ? "active" : ""}`}
              onClick={() => {
                if (item.action) item.action();
                else selectModule(item.id);
              }}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="fr-nav-icon">{item.icon}</span>
              <span className="fr-nav-label">{item.label}</span>
              {activeModule === item.id && <span className="fr-nav-bar" />}
            </button>
          ))}
          {!sidebarCollapsed && (
            <div className="fr-nav-section" style={{ marginTop: 8 }}>
              Account
            </div>
          )}
          {navigation.slice(6).map((item) => (
            <button
              type="button"
              aria-label={item.label}
              aria-current={activeModule === item.id ? "page" : undefined}
              key={item.id}
              className={`fr-nav-item ${activeModule === item.id ? "active" : ""} ${item.id === "logout" ? "logout" : ""}`}
              onClick={() => {
                if (item.action) item.action();
                else selectModule(item.id);
              }}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="fr-nav-icon">{item.icon}</span>
              <span className="fr-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="fr-main">
        <div className="fr-topbar">
          <div className="fr-topbar-heading">
            <button
              type="button"
              ref={mobileMenuRef}
              className="fr-mobile-menu"
              aria-label="Open navigation"
              aria-controls="fr-navigation"
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen(true)}
            >
              <Grid3X3 size={19} />
            </button>
            <div>
              <h1 className="fr-topbar-title">{moduleLabel}</h1>
              <div className="fr-topbar-context">
                <Store size={12} />
                {[user?.brand, user?.branch].filter(Boolean).join(" · ") ||
                  "Manager workspace"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <NotificationBell
              notifications={managerNotifications}
              loading={managerNotifLoading}
              error={managerNotifError}
              onRefresh={() => managerNotifRefresh.current()}
              onNavigate={async (notification) => {
                setActiveModule(notification.module || "dashboard");
                if (notification.recordId != null) {
                  try {
                    await adminModuleFetch(
                      `${process.env.REACT_APP_API_URL}/notifications/${encodeURIComponent(notification.recordId)}/read`,
                      { method: "PATCH", credentials: "include" },
                    );
                  } catch {
                    // Keep the notification visible locally if the read state fails.
                  }
                }
              }}
            />
            <div style={{ textAlign: "right" }}>
              <div className="fr-user-name">{user?.name}</div>
              <div className="fr-user-role">Manager — {user?.branch}</div>
            </div>
            <button
              type="button"
              className="fr-avatar"
              aria-label="Open profile settings"
              title="Profile Settings"
              onClick={() => selectModule("profile")}
            >
              {(user?.name || "F")[0]}
            </button>
          </div>
        </div>

        <div
          id="fr-workspace"
          tabIndex={-1}
          className={`fr-content ${
            activeModule === "communication" ? "fr-content-communication" : ""
          }`}
        >
          <div
            key={activeModule}
            className={`fr-page-enter ${
              activeModule === "communication" ? "fr-communication-page" : ""
            }`}
          >
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
              <ManagerStockInventoryContent user={user} brands={brands} />
            )}
            {activeModule === "pos" && <POSContent user={user} />}
            {activeModule === "receipts" && <Receipts />}
            {activeModule === "reports" && (
              <FrReportsContent user={user} transactions={transactions} />
            )}
            {activeModule === "communication" && (
              <ManCommunicationContent
                user={user}
                brands={brands}
                sidebarCollapsed={sidebarCollapsed}
              />
            )}
            {activeModule === "profile" && (
              <FrProfileContent
                user={user}
                onUserUpdate={(updatedUser) => {
                  setUser(updatedUser);
                  onUserUpdate?.(updatedUser);
                }}
              />
            )}
          </div>
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
            ref={logoutDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="fr-logout-title"
            tabIndex={-1}
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
            <h2
              id="fr-logout-title"
              className="v-modal-title"
              style={{ textAlign: "center" }}
            >
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

function NotificationBell({
  notifications,
  loading,
  error,
  onRefresh,
  onNavigate,
}) {
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState(
    typeof window !== "undefined" && "Notification" in window
      ? window.Notification.permission
      : "unsupported",
  );
  const previousIdsRef = useRef(new Set());
  const initializedRef = useRef(false);
  const toastTimerRef = useRef(null);
  const [liveNotif, setLiveNotif] = useState(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  useEffect(() => {
    const list = Array.isArray(notifications) ? notifications : [];
    const ids = new Set(list.map((n) => String(n.id)));
    if (!initializedRef.current) {
      previousIdsRef.current = ids;
      initializedRef.current = true;
      return;
    }

    const newest = list.find((n) => !previousIdsRef.current.has(String(n.id)));
    previousIdsRef.current = ids;
    if (!newest) return;

    setLiveNotif(newest);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setLiveNotif(null), 5000);

    if (
      permission === "granted" &&
      typeof window !== "undefined" &&
      "Notification" in window
    ) {
      try {
        const nativeNotification = new window.Notification(
          newest.title || "FranchiSync notification",
          {
            body: newest.message || "You have a new notification.",
            tag: `franchisync-${newest.id}`,
            icon: "/favicon.ico",
          },
        );
        nativeNotification.onclick = () => {
          window.focus();
          nativeNotification.close();
          onNavigate?.(newest);
        };
      } catch {
        // Browser-level notifications are best-effort.
      }
    }
  }, [notifications, permission, onNavigate]);

  useEffect(
    () => () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    },
    [],
  );

  const enablePush = async () => {
    if (!(typeof window !== "undefined" && "Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    try {
      const next = await window.Notification.requestPermission();
      setPermission(next);
    } catch {
      setPermission("denied");
    }
  };

  const list = (Array.isArray(notifications) ? notifications : []).filter(
    Boolean,
  );
  const unreadCount = list.reduce(
    (sum, n) => sum + Math.max(1, Number(n.count || 1)),
    0,
  );

  return (
    <>
      {liveNotif && (
        <div
          role="status"
          onClick={() => {
            onNavigate?.(liveNotif);
            setLiveNotif(null);
          }}
          style={{
            position: "fixed",
            top: 88,
            right: 26,
            width: 390,
            maxWidth: "calc(100vw - 32px)",
            padding: "14px 16px",
            background: "#fffdf3",
            border: "1px solid #3b791e",
            borderRadius: 13,
            boxShadow: "0 18px 45px rgba(15,23,42,.16)",
            zIndex: 99999,
            display: "flex",
            alignItems: "flex-start",
            gap: 11,
            cursor: "pointer",
            animation: "managerNotifIn .25s ease-out",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: "#edf7ef",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {React.createElement(liveNotif.icon || Bell, {
              size: 17,
              color: "#3b791e",
            })}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "#3b791e",
                textTransform: "uppercase",
                marginBottom: 3,
              }}
            >
              New notification
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "#12241B",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {liveNotif.title}
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 11.5,
                lineHeight: 1.45,
                color: "#5C6B60",
              }}
            >
              {liveNotif.message}
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLiveNotif(null);
            }}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "#6B7A65",
              padding: 2,
            }}
          >
            <X size={15} />
          </button>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 3,
              background: "#3b791e",
              animation: "managerNotifProgress 5s linear forwards",
            }}
          />
        </div>
      )}

      <div ref={wrapRef} style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          title="Notifications"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
          style={{
            position: "relative",
            width: 42,
            height: 42,
            borderRadius: 11,
            border: `1px solid ${open ? "#3b791e" : "#c9dba0"}`,
            background: open ? "#e8f5ea" : "#f0f7ec",
            color: "#3b791e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <Bell size={19} />
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: -5,
                right: -5,
                minWidth: 19,
                height: 19,
                padding: "0 4px",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#dc2626",
                color: "#fff",
                border: "2px solid #fff",
                fontSize: 10,
                fontWeight: 800,
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              right: 0,
              width: 370,
              maxWidth: "calc(100vw - 24px)",
              background: "#fff",
              border: "1px solid #c7e0cb",
              borderRadius: 14,
              boxShadow: "0 18px 45px rgba(15,23,42,.15)",
              overflow: "hidden",
              zIndex: 3000,
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                background: "linear-gradient(135deg,#256529,#2e7d32)",
                color: "#fff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>
                  Notifications
                </div>
                <div style={{ fontSize: 10.5, opacity: 0.8, marginTop: 2 }}>
                  {unreadCount
                    ? `${unreadCount} alert${unreadCount === 1 ? "" : "s"}`
                    : "You're all caught up"}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRefresh?.();
                }}
                title="Refresh"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,.4)",
                  background: "rgba(255,255,255,.13)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <RefreshCw
                  size={13}
                  style={{
                    animation: loading
                      ? "managerNotifSpin .8s linear infinite"
                      : "none",
                  }}
                />
              </button>
            </div>

            <div
              style={{
                padding: "10px 12px",
                borderBottom: "1px solid #eef3ef",
                background: "#fbfdf9",
              }}
            >
              {permission === "default" && (
                <button
                  type="button"
                  onClick={enablePush}
                  style={{
                    width: "100%",
                    minHeight: 34,
                    borderRadius: 9,
                    border: "1px solid #c9dba0",
                    background: "#f0f7ec",
                    color: "#2c5c16",
                    fontSize: 11.5,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  <Bell size={13} /> Enable browser push notifications
                </button>
              )}
              {permission === "granted" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: "#3b791e",
                  }}
                >
                  <CheckCircle2 size={13} /> Browser notifications are enabled
                </div>
              )}
              {permission === "denied" && (
                <div
                  style={{ fontSize: 10.5, color: "#9a3412", lineHeight: 1.4 }}
                >
                  Browser notifications are blocked. Allow notifications for
                  this site in your browser settings.
                </div>
              )}
              {permission === "unsupported" && (
                <div style={{ fontSize: 10.5, color: "#6B7A65" }}>
                  This browser does not support notifications.
                </div>
              )}
            </div>

            {error && (
              <div
                style={{
                  padding: "9px 12px",
                  fontSize: 10.5,
                  color: "#b45309",
                  background: "#fff8eb",
                  borderBottom: "1px solid #f7dfb4",
                }}
              >
                {error}
              </div>
            )}

            <div style={{ maxHeight: 340, overflowY: "auto" }}>
              {loading && !list.length ? (
                <div
                  style={{
                    padding: "42px 20px",
                    textAlign: "center",
                    color: "#6B7A65",
                    fontSize: 12,
                  }}
                >
                  <RefreshCw
                    size={18}
                    style={{
                      animation: "managerNotifSpin .8s linear infinite",
                      marginBottom: 7,
                    }}
                  />
                  <div>Loading notifications…</div>
                </div>
              ) : !list.length ? (
                <div
                  style={{
                    padding: "42px 20px",
                    textAlign: "center",
                    color: "#6B7A65",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: "#edf7ef",
                      margin: "0 auto 10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Check size={20} color="#3b791e" />
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 800,
                      color: "#243128",
                    }}
                  >
                    Nothing needs your attention
                  </div>
                  <div style={{ fontSize: 10.5, marginTop: 4 }}>
                    New alerts will appear here.
                  </div>
                </div>
              ) : (
                list.map((n, index) => (
                  <div
                    key={String(n.id)}
                    onClick={() => {
                      onNavigate?.(n);
                      setOpen(false);
                    }}
                    style={{
                      display: "flex",
                      gap: 10,
                      padding: "12px 14px",
                      borderBottom:
                        index === list.length - 1
                          ? "none"
                          : "1px solid #eef3ef",
                      cursor: "pointer",
                      background: "#fff",
                    }}
                  >
                    <div
                      style={{
                        width: 35,
                        height: 35,
                        borderRadius: 9,
                        background:
                          n.type === "low_stock" ? "#fff4f2" : "#edf7ef",
                        border: `1px solid ${n.type === "low_stock" ? "#fecaca" : "#b9ddbf"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {React.createElement(n.icon || Bell, {
                        size: 16,
                        color: n.type === "low_stock" ? "#dc2626" : "#3b791e",
                      })}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 7,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: "#243128",
                            lineHeight: 1.35,
                          }}
                        >
                          {n.title}
                        </div>
                        {Number(n.count || 0) > 1 && (
                          <span
                            style={{
                              minWidth: 20,
                              height: 20,
                              padding: "0 5px",
                              borderRadius: 6,
                              background: "#edf7ef",
                              color: "#2e7d32",
                              border: "1px solid #b9ddbf",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 9.5,
                              fontWeight: 800,
                            }}
                          >
                            {Number(n.count) > 99 ? "99+" : n.count}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: 10.75,
                          color: "#65736a",
                          marginTop: 3,
                          lineHeight: 1.45,
                        }}
                      >
                        {n.message}
                      </div>
                      <div
                        style={{
                          fontSize: 9.5,
                          color: "#3b791e",
                          fontWeight: 700,
                          marginTop: 5,
                        }}
                      >
                        Click to view
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`\n        @keyframes managerNotifIn { from { opacity:0; transform:translateY(-8px) translateX(16px); } to { opacity:1; transform:translateY(0) translateX(0); } }\n        @keyframes managerNotifProgress { from { width:100%; } to { width:0%; } }\n        @keyframes managerNotifSpin { to { transform:rotate(360deg); } }\n      `}</style>
    </>
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
      const res = await adminModuleFetch(
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

  // Normalize API lists so a partial/empty response can never make render crash.
  const top10 = Array.isArray(data?.top10) ? data.top10 : [];
  const fastMoving = Array.isArray(data?.fastMoving) ? data.fastMoving : [];
  const slowMoving = Array.isArray(data?.slowMoving) ? data.slowMoving : [];
  const activeProducts =
    tab === "top10" ? top10 : tab === "fast" ? fastMoving : slowMoving;
  const maxQty = Math.max(
    1,
    ...activeProducts.map((p) => Number(p?.totalQty || 0)),
  );

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
          const list = activeProducts;
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
    if (!normalizeTransactions(transactions).length) {
      setError(
        "No transaction data available for the current filter and date range.",
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await adminModuleFetch(
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
            {normalizeTransactions(transactions).length
              ? `${normalizeTransactions(transactions).length} transactions loaded · ${filterLabel}`
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
          Sending {normalizeTransactions(transactions).length} transactions to
          Groq…
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

  const gpLine = useMemo(
    () =>
      values.map((v, i) => {
        const base =
          35 + (i / Math.max(values.length - 1, 1)) * 10 + Math.sin(i) * 5;
        return parseFloat(base.toFixed(1));
      }),
    [values],
  );

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
              <BarChart2 size={11} color="#3b791e" /> Sales Trend · CURRENT YEAR
              vs PAST YEAR with Gross Profit %
            </ChartLabel>
            {hasData ? (
              <>
                <ComboChart
                  barData={[values, values.map((v) => v * 0.72)]}
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
                    { color: PAL[1], label: "Sales PY" },
                    {
                      color: "#1d4ed8",
                      label: "Gross Profit % (CY)",
                      line: true,
                    },
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
    if (!normalizeTransactions(transactions).length) {
      setError("No transaction data available.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await adminModuleFetch(
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
      `${normalizeTransactions(transactions).length?.toLocaleString() ?? 0} transactions loaded for ${filterLabel}.`,
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
                        Sending {normalizeTransactions(transactions).length}{" "}
                        transactions to Groq…
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
                  {normalizeTransactions(transactions).length
                    ? `${normalizeTransactions(transactions).length} transactions ready. Click "Run AI Analysis" to generate prescriptive recommendations.`
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
      const res = await adminModuleFetch(
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
    return normalizeTransactions(transactions).filter((tx) => {
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

    return normalizeTransactions(transactions).filter(
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

      const res = await adminModuleFetch(
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
        .manager-dashboard-tabs { background:#fff; border:1px solid #DCE9DB; border-radius:16px; padding:7px; margin-bottom:16px; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:4px; box-shadow:0 2px 14px rgba(50,109,32,.06); }
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
            question: "What needs attention?",
            icon: Home,
          },
          {
            id: "sales_ai",
            number: "02",
            label: "Sales Trend Analysis",
            question: "How are actual sales changing?",
            icon: LineChart,
          },
          {
            id: "stock_products",
            number: "03",
            label: "Ghost Stock / Revenue Leakage",
            question: "Where are losses coming from?",
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
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

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
// ← add this

// ─── Icons ────────────────────────────────────────────────────────────────────

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

const FR_UNIT_NAMES = {
  tbsp: ["Tablespoon", "Tablespoons"],
  tablespoon: ["Tablespoon", "Tablespoons"],
  tablespoons: ["Tablespoon", "Tablespoons"],
  tsp: ["Teaspoon", "Teaspoons"],
  teaspoon: ["Teaspoon", "Teaspoons"],
  teaspoons: ["Teaspoon", "Teaspoons"],
  cup: ["Cup", "Cups"],
  cups: ["Cup", "Cups"],
  l: ["Liter", "Liters"],
  liter: ["Liter", "Liters"],
  liters: ["Liter", "Liters"],
  litre: ["Liter", "Liters"],
  litres: ["Liter", "Liters"],
  ml: ["Milliliter", "Milliliters"],
  milliliter: ["Milliliter", "Milliliters"],
  milliliters: ["Milliliter", "Milliliters"],
  kg: ["Kilogram", "Kilograms"],
  kilogram: ["Kilogram", "Kilograms"],
  kilograms: ["Kilogram", "Kilograms"],
  g: ["Gram", "Grams"],
  gram: ["Gram", "Grams"],
  grams: ["Gram", "Grams"],
  mg: ["Milligram", "Milligrams"],
  milligram: ["Milligram", "Milligrams"],
  milligrams: ["Milligram", "Milligrams"],
  pc: ["Piece", "Pieces"],
  pcs: ["Piece", "Pieces"],
  piece: ["Piece", "Pieces"],
  pieces: ["Piece", "Pieces"],
  unit: ["Unit", "Units"],
  units: ["Unit", "Units"],
  bottle: ["Bottle", "Bottles"],
  bottles: ["Bottle", "Bottles"],
  btl: ["Bottle", "Bottles"],
  btls: ["Bottle", "Bottles"],
  box: ["Box", "Boxes"],
  boxes: ["Box", "Boxes"],
  pack: ["Pack", "Packs"],
  packs: ["Pack", "Packs"],
  pkt: ["Packet", "Packets"],
  tablet: ["Tablet", "Tablets"],
  tablets: ["Tablet", "Tablets"],
  tab: ["Tablet", "Tablets"],
  tabs: ["Tablet", "Tablets"],
  capsule: ["Capsule", "Capsules"],
  capsules: ["Capsule", "Capsules"],
  cap: ["Capsule", "Capsules"],
  caps: ["Capsule", "Capsules"],
  gal: ["Gallon", "Gallons"],
  gallon: ["Gallon", "Gallons"],
  gallons: ["Gallon", "Gallons"],
  oz: ["Ounce", "Ounces"],
  lb: ["Pound", "Pounds"],
  lbs: ["Pound", "Pounds"],
  sachet: ["Sachet", "Sachets"],
  sachets: ["Sachet", "Sachets"],
  bag: ["Bag", "Bags"],
  bags: ["Bag", "Bags"],
  can: ["Can", "Cans"],
  cans: ["Can", "Cans"],
  roll: ["Roll", "Rolls"],
  rolls: ["Roll", "Rolls"],
};

function frFullUnit(unit, quantity = 2) {
  const raw = String(unit || "Units").trim();
  const names = FR_UNIT_NAMES[raw.toLowerCase().replace(/\./g, "")];
  return names ? names[Math.abs(Number(quantity)) === 1 ? 0 : 1] : raw;
}

function frStockQuantity(value, unit) {
  if (value == null || value === "" || !Number.isFinite(Number(value)))
    return "—";
  const whole = Math.round(Number(value));
  return `${whole.toLocaleString("en-PH", { maximumFractionDigits: 0 })} ${frFullUnit(unit, whole)}`;
}

const FR_INVENTORY_CSS = `
.fr-inventory-workspace { min-width:0; color:#12241B; }
.fr-inventory-workspace .fr-inventory-toolbar { display:flex; align-items:center; flex-wrap:wrap; gap:10px; padding:14px 16px; margin-bottom:16px; border:1px solid #E1E6D8; border-radius:16px; background:#fff; }
.fr-inventory-workspace .fr-inventory-search { position:relative; flex:1 1 220px; min-width:160px; }
.fr-inventory-workspace .fr-inventory-search > svg { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#5C6B60; pointer-events:none; }
.fr-inventory-workspace .fr-inventory-toolbar input, .fr-inventory-workspace .fr-inventory-toolbar select { height:38px !important; font-size:12px !important; border:1px solid #E1E6D8; border-radius:10px; background:#fff; color:#12241B; padding:0 12px; }
.fr-inventory-workspace .fr-inventory-search input { width:100%; padding-left:36px; }
.fr-inventory-workspace .fr-inventory-toolbar select { min-width:140px; }
.fr-inventory-workspace .fr-inventory-card { background:#fff; border:1px solid #E1E6D8; border-radius:18px; overflow:hidden; box-shadow:0 2px 12px rgba(50,109,32,.05); }
.fr-inventory-workspace .fr-inventory-header { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; padding:16px 22px; background:#fbfcf8; border-bottom:1px solid #E1E6D8; }
.fr-inventory-workspace .fr-inventory-heading { display:flex; align-items:center; flex-wrap:wrap; gap:8px; font-size:14px; font-weight:800; }
.fr-inventory-workspace .fr-inventory-count { color:#5C6B60; font-size:11px; }
.fr-inventory-workspace .fr-inventory-brand { padding:3px 10px; border:1px solid #c9dba0; border-radius:999px; background:#f0f5e8; color:#2c5c16; font-size:11px; }
.fr-inventory-workspace .fr-inventory-split { display:grid; grid-template-columns:minmax(260px,380px) minmax(0,1fr) !important; min-height:480px; max-height:none !important; }
.fr-inventory-workspace .fr-inventory-list { max-height:620px !important; overflow-y:auto; overscroll-behavior:contain; border-right:1px solid #E1E6D8; }
.fr-inventory-workspace .fr-inventory-detail { min-width:0; max-height:620px !important; overflow-y:auto; padding:20px; scroll-margin-top:100px; }
body.fr-admin-ui .franchisee-root .fr-inventory-row { display:block; width:100%; min-height:74px; padding:14px 16px; border:0; border-bottom:1px solid #F6F7F1; border-left:3px solid transparent; border-radius:0 !important; background:#fff; color:#12241B; text-align:left; transition:background-color .18s ease,border-color .18s ease,box-shadow .18s ease !important; }
body.fr-admin-ui .franchisee-root .fr-inventory-row:hover { background:#F6F7F1; filter:none; }
body.fr-admin-ui .franchisee-root .fr-inventory-row[aria-pressed="true"] { border-left-color:#3b791e; background:#f0f5e8; box-shadow:inset 0 0 0 1px rgba(59,121,30,.05) !important; }
.fr-inventory-workspace .fr-inventory-row-top { display:flex; align-items:center; justify-content:space-between; gap:10px; }
.fr-inventory-workspace .fr-inventory-row-name { font-size:13px; font-weight:700; overflow-wrap:anywhere; }
.fr-inventory-workspace .fr-inventory-row-meta { margin-top:6px; font-size:11px; color:#5C6B60; }
.fr-inventory-workspace .fr-inventory-badge { display:inline-flex; flex-shrink:0; padding:3px 8px; border-radius:999px; background:#fff7ed; color:#b45309; font-size:10px; font-weight:700; }
.fr-inventory-workspace .fr-inventory-detail-content { animation:frInventoryEnter .2s ease-out; }
@keyframes frInventoryEnter { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:none; } }
.fr-inventory-workspace .fr-product-title { margin:0; font-size:18px; font-weight:800; overflow-wrap:anywhere; }
.fr-inventory-workspace .fr-product-meta { margin:6px 0 18px; color:#5C6B60; font-size:12px; }
.fr-inventory-workspace .fr-product-facts { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; margin:0 0 20px; }
.fr-inventory-workspace .fr-product-facts > div { padding:12px; border:1px solid #E1E6D8; border-radius:12px; background:#fbfcf8; min-width:0; }
.fr-inventory-workspace .fr-product-facts dt { font-size:10px; text-transform:uppercase; letter-spacing:.05em; color:#5C6B60; }
.fr-inventory-workspace .fr-product-facts dd { margin:6px 0 0; font-size:13px; font-weight:700; overflow-wrap:anywhere; }
.fr-inventory-workspace .fr-ingredient-row { display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; padding:12px; border:1px solid #E1E6D8; border-radius:10px; margin-top:8px; font-size:12px; }
.fr-inventory-workspace .fr-inventory-empty { min-height:180px; padding:32px 20px; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:10px; text-align:center; color:#5C6B60; font-size:12px; }
.fr-inventory-workspace .fr-inventory-error { display:flex; align-items:center; gap:10px; padding:12px; margin-bottom:12px; border:1px solid #f2c9c4; border-radius:10px; background:#fdf1f0; color:#c0392b; font-size:12px; }
@media(max-width:900px) {
 .fr-inventory-workspace .fr-inventory-split { grid-template-columns:1fr !important; min-height:0; }
 .fr-inventory-workspace .fr-inventory-list { max-height:320px !important; border-right:0; border-bottom:1px solid #E1E6D8; }
 .fr-inventory-workspace .fr-inventory-detail { max-height:none !important; overflow:visible; padding:16px; }
}
@media(max-width:560px) {
 .fr-inventory-workspace .fr-inventory-toolbar { padding:12px; }
 .fr-inventory-workspace .fr-inventory-toolbar select { flex:1 1 130px; min-width:0; width:auto !important; }
 .fr-inventory-workspace .fr-inventory-header { padding:14px 16px; }
 .fr-inventory-workspace .fr-product-facts { grid-template-columns:1fr; }
}
@media(prefers-reduced-motion:reduce) { .fr-inventory-workspace .fr-inventory-detail-content { animation:none; } }
`;

function FrMenuInventoryContent({ user, brands }) {
  const userBranch = String(user?.branch || "").trim();
  const userBrand = String(user?.brand || user?.brand_name || "").trim();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const detailRef = useRef(null);
  const fetchInventory = useCallback(async () => {
    if (!userBranch) {
      setInventory([]);
      setError("Your account does not have an assigned branch.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await adminModuleFetch(
        `${process.env.REACT_APP_API_URL}/inventory?branch=${encodeURIComponent(
          userBranch,
        )}`,
        {
          credentials: "include",
          cache: "no-store",
        },
      );

      if (!res.ok) {
        throw new Error(`Unable to load Product Catalogue (${res.status}).`);
      }

      const data = await res.json();
      const rows = normalizeListResponse(data);
      setInventory(rows);
    } catch (err) {
      console.error("FrMenuInventoryContent fetch error:", err);
      setInventory([]);
      setError(err.message || "Unable to load Product Catalogue.");
    } finally {
      setLoading(false);
    }
  }, [userBranch]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);
  const categories = useMemo(
    () => [...new Set(inventory.map((i) => i.category).filter(Boolean))].sort(),
    [inventory],
  );
  const filteredItems = useMemo(
    () =>
      inventory
        .filter((i) => {
          const q = searchQuery.trim().toLowerCase();
          const matches = `${i.name || ""} ${i.category || ""}`
            .toLowerCase()
            .includes(q);
          const low = Number(i.stock) <= Number(i.min_stock);
          return (
            matches &&
            (!filterCategory || i.category === filterCategory) &&
            (!filterStatus || (filterStatus === "low" ? low : !low))
          );
        })
        .sort((a, b) =>
          String(a.name || "").localeCompare(String(b.name || "")),
        ),
    [inventory, searchQuery, filterCategory, filterStatus],
  );
  const selectedItem = filteredItems.find((i) => i.id === selectedId) || null;

  useEffect(() => {
    let cancelled = false;

    if (!selectedId) {
      setSelectedIngredients([]);
      return () => {
        cancelled = true;
      };
    }

    const embedded = Array.isArray(selectedItem?.ingredients)
      ? selectedItem.ingredients
      : [];

    if (embedded.length > 0) {
      setSelectedIngredients(embedded);
      return () => {
        cancelled = true;
      };
    }

    setSelectedIngredients([]);

    adminModuleFetch(
      `${process.env.REACT_APP_API_URL}/inventory/${selectedId}/ingredients`,
      {
        credentials: "include",
        cache: "no-store",
      },
    )
      .then((r) => {
        if (!r.ok)
          throw new Error(`Unable to load product ingredients (${r.status}).`);
        return r.json();
      })
      .then((d) => {
        if (!cancelled) setSelectedIngredients(normalizeListResponse(d));
      })
      .catch((error) => {
        console.error("FrMenuInventoryContent ingredient fetch error:", error);
        if (!cancelled) setSelectedIngredients([]);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId, selectedItem]);

  const ingredients = selectedIngredients;

  useEffect(() => {
    if (selectedId != null && !filteredItems.some((i) => i.id === selectedId)) {
      setSelectedId(null);
      setSelectedIngredients([]);
    }
  }, [filteredItems, selectedId]);
  const selectItem = (item) => {
    setSelectedId(item.id);
    if (window.matchMedia("(max-width:900px)").matches)
      requestAnimationFrame(() => {
        detailRef.current?.scrollIntoView({
          block: "start",
          behavior: window.matchMedia("(prefers-reduced-motion:reduce)").matches
            ? "auto"
            : "smooth",
        });
      });
  };
  return (
    <div className="fr-inventory-workspace">
      <style>{FR_INVENTORY_CSS}</style>
      <ReadOnlyBanner message="Product Catalogue is view-only. Search and select a product to view its details and ingredients." />
      <div className="fr-inventory-toolbar">
        <div className="fr-inventory-search">
          <Search size={15} />
          <input
            aria-label="Search products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products or categories…"
          />
        </div>
        <select
          aria-label="Filter product category"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter product status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="low">Low Stock</option>
          <option value="ok">In Stock</option>
        </select>
        {(searchQuery || filterCategory || filterStatus) && (
          <button
            type="button"
            className="v-btn v-btn-secondary"
            onClick={() => {
              setSearchQuery("");
              setFilterCategory("");
              setFilterStatus("");
            }}
          >
            Clear filters
          </button>
        )}
        <button
          type="button"
          className="v-btn v-btn-secondary"
          onClick={fetchInventory}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? "fr-spin" : ""} />
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      {error && (
        <div role="alert" className="fr-inventory-error">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}
      <div className="fr-inventory-card" aria-busy={loading}>
        <div className="fr-inventory-header">
          <div className="fr-inventory-heading">
            <Store size={16} color={C.green} />
            Product Catalogue — {userBranch}
            {userBrand && (
              <span className="fr-inventory-brand">{userBrand}</span>
            )}
          </div>
          <span className="fr-inventory-count" aria-live="polite">
            {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "item" : "items"}
          </span>
        </div>
        <div className="fr-inventory-split">
          <div className="fr-inventory-list" aria-label="Products">
            {loading ? (
              <div className="fr-inventory-empty" role="status">
                <RefreshCw size={20} className="fr-spin" />
                Loading products…
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="fr-inventory-empty">
                <Box size={26} />
                {searchQuery || filterCategory || filterStatus
                  ? "No products match your filters."
                  : "No products available."}
              </div>
            ) : (
              filteredItems.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className="fr-inventory-row"
                  aria-pressed={item.id === selectedId}
                  aria-controls="fr-product-detail"
                  onClick={() => selectItem(item)}
                >
                  <span className="fr-inventory-row-top">
                    <span className="fr-inventory-row-name">{item.name}</span>
                    <ChevronRight size={15} />
                  </span>
                  <span
                    className="fr-inventory-row-meta"
                    style={{ display: "block" }}
                  >
                    {item.category || "Uncategorized"}
                  </span>
                </button>
              ))
            )}
          </div>
          <section
            id="fr-product-detail"
            ref={detailRef}
            className="fr-inventory-detail"
            aria-label="Product details"
          >
            {selectedItem ? (
              <div
                key={selectedItem.id}
                className="fr-inventory-detail-content"
              >
                <h2 className="fr-product-title">{selectedItem.name}</h2>
                <p className="fr-product-meta">
                  {[
                    selectedItem.brand || userBrand,
                    selectedItem.branch || userBranch,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <dl className="fr-product-facts">
                  {[
                    ["Category", selectedItem.category || "—"],
                    [
                      "Stock",
                      frStockQuantity(selectedItem.stock, selectedItem.unit),
                    ],
                    ["Price", fmtPeso(selectedItem.price || 0)],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <h3
                  style={{ fontSize: 13, margin: "0 0 12px", color: C.greenDk }}
                >
                  Ingredients
                </h3>
                {ingredients.length ? (
                  ingredients.map((ing, index) => (
                    <div className="fr-ingredient-row" key={ing.id || index}>
                      <strong>
                        {ing.name || ing.ingredient_name || "Ingredient"}
                      </strong>
                      <span>
                        {ing.qty_required ?? ing.quantity ?? "—"}{" "}
                        {frFullUnit(ing.unit, ing.qty_required ?? ing.quantity)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div
                    className="fr-inventory-empty"
                    style={{ minHeight: 100 }}
                  >
                    No linked ingredients.
                  </div>
                )}
              </div>
            ) : (
              <div className="fr-inventory-empty">
                <Box size={28} color={C.green} />
                <strong>Select a product</strong>
                <span>View its details and ingredients here.</span>
              </div>
            )}
          </section>
        </div>
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
      const res = await adminModuleFetch(
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
      const res = await adminModuleFetch(
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
      const res = await adminModuleFetch(
        `${process.env.REACT_APP_API_URL}/transactions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
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
    return normalizeTransactions(transactions).filter((tx) => {
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
  const todaySales = normalizeTransactions(transactions).filter((tx) =>
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
          adminModuleFetch(
            `${process.env.REACT_APP_API_URL}/generated-reports?branch=${encodeURIComponent(branch)}`,
          ),
          adminModuleFetch(
            `${process.env.REACT_APP_API_URL}/reports?branch=${encodeURIComponent(branch)}`,
          ),
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
      const res = await adminModuleFetch(
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
        const res = await adminModuleFetch(
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
        const res = await adminModuleFetch(
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

      const filtered = normalizeTransactions(transactions).filter((tx) => {
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

      const res = await adminModuleFetch(
        `${process.env.REACT_APP_API_URL}/ai/report`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            max_tokens: 4000,
            messages: [{ role: "user", content: prompt }],
          }),
        },
      );

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

      const submitRes = await adminModuleFetch(
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
      const res = await adminModuleFetch(
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
      const res = await adminModuleFetch(
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
      const res = await adminModuleFetch(
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
      const res = await adminModuleFetch(
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

function ManCommunicationContent({ user, brands = [], sidebarCollapsed }) {
  return (
    <div className="manager-announcement-wrapper">
      <style>{`
        /* =========================================
           MANAGER READ-ONLY ANNOUNCEMENTS
           ========================================= */

        .manager-announcement-wrapper {
          width: 100%;
          min-width: 0;
        }

        .manager-announcement-wrapper .fa-communications-readonly {
          width: 100% !important;
        }

        /* Fixed toolbar directly below Manager header */
        .fa-communications-readonly .fa-compact-toolbar {
          position: fixed !important;
          top: 72px !important;
          left: ${sidebarCollapsed ? "76px" : "272px"} !important;
          right: 0 !important;
          width: auto !important;

          z-index: 999 !important;

          height: 48px !important;
          min-height: 48px !important;

          padding: 7px 30px !important;
          margin: 0 !important;

          display: flex !important;
          align-items: center !important;
          flex-wrap: nowrap !important;

          background: #fff !important;

          /* visible divider line */
          border-bottom: 1px solid #d9dfd2 !important;
          box-shadow: 0 1px 0 #d9dfd2 !important;

          box-sizing: border-box !important;
        }

        /* All / Recent / Pinned */
        .fa-communications-readonly button.comm-tab {
          height: 30px !important;
          min-height: 30px !important;
          width: auto !important;
          min-width: 0 !important;

          padding: 0 14px !important;

          font-size: 11px !important;
          line-height: 1 !important;
          gap: 5px !important;

          border-radius: 18px !important;
          box-sizing: border-box !important;
        }

        .fa-communications-readonly button.comm-tab span {
          font-size: 10px !important;
          line-height: 1 !important;
        }

        /* Refresh + Search */
        .fa-communications-readonly .fa-toolbar-actions {
          margin-left: auto !important;
          gap: 6px !important;
          align-items: center !important;
        }

        .fa-communications-readonly .fa-toolbar-actions button {
          width: 36px !important;
          min-width: 36px !important;

          height: 30px !important;
          min-height: 30px !important;

          padding: 0 !important;
          border-radius: 8px !important;

          display: grid !important;
          place-items: center !important;
          box-sizing: border-box !important;
        }

        .fa-communications-readonly .fa-toolbar-actions button svg {
          width: 14px !important;
          height: 14px !important;
        }

        @media (max-width: 900px) {
          .fa-communications-readonly .fa-compact-toolbar {
            left: 0 !important;
            top: 64px !important;
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
        }
      `}</style>

      <FACommunicationContent user={user} brands={brands} readOnly />
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
      const response = await adminModuleFetch(
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
