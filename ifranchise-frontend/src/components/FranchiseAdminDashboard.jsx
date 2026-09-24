// FRANCHISEE ADMIN

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
import html2canvas from "html2canvas";
import StockInventoryContent from "./StockInventoryContent";
import ReceiptPrintTemplate from "./ReceiptPrintTemplate";
import logoIfranchise from "../assets/report/ifranchise-logo.png";
import logoSync from "../assets/report/franchsync-logo.png";
import { adminModuleFetch } from "../utils/adminModuleFetch";

import ifranchisejpg from "../assets/ifranchisejpg.jpg";
import franchisync from "../assets/report/franchsync-logo.png";
import sidebarLogo from "../assets/report/ifranchise-logo.png";

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
  ChevronLeft,
  Menu,
  ArrowUpAZ,
  ArrowDownAZ,
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

// ─────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────

const ADMIN_API_BASE = String(process.env.REACT_APP_API_URL || "")
  .trim()
  .replace(/;+$/, "")
  .replace(/\/+$/, "");

// ─────────────────────────────────────────────────────────────
// LIVE REFRESH
// ─────────────────────────────────────────────────────────────

function useAdminLiveRefresh(refresh, dependencies) {
  useEffect(() => {
    let stopped = false;
    let running = false;
    let queued = false;
    let timer;

    const run = async () => {
      if (stopped) return;

      if (running) {
        queued = true;
        return;
      }

      running = true;

      try {
        await refresh();
      } catch (error) {
        console.error("Dashboard refresh failed", error);
      } finally {
        running = false;

        if (queued && !stopped) {
          queued = false;
          timer = setTimeout(run, 300);
        }
      }
    };

    const schedule = () => {
      clearTimeout(timer);

      timer = setTimeout(run, 300);
    };

    const visible = () => {
      if (document.visibilityState !== "hidden") {
        schedule();
      }
    };

    run();

    const interval = setInterval(() => {
      if (document.visibilityState !== "hidden") {
        run();
      }
    }, 15000);

    window.addEventListener("franchisync:data-changed", schedule);

    window.addEventListener("focus", visible);

    window.addEventListener("online", visible);

    document.addEventListener("visibilitychange", visible);

    return () => {
      stopped = true;

      clearInterval(interval);
      clearTimeout(timer);

      window.removeEventListener("franchisync:data-changed", schedule);

      window.removeEventListener("focus", visible);

      window.removeEventListener("online", visible);

      document.removeEventListener("visibilitychange", visible);
    };
  }, dependencies);
}

// ─────────────────────────────────────────────────────────────
// SHARED COLORS
// ─────────────────────────────────────────────────────────────

const C = {
  green: "#3b791e",
  greenDk: "#2c5c16",
  greenLt: "#f0f5e8",
  greenMid: "#c9dba0",
  teal: "#509820",
  ink: "#12241B",
  muted: "#5C6B60",
  border: "#E1E6D8",
  bg: "#F6F7F1",
  white: "#ffffff",
  warn: "#b45309",
  warnBg: "#fff7ed",
  ok: "#2c5c16",
  okBg: "#f0f5e8",
};

const FONT = "'Plus Jakarta Sans', sans-serif";

const PAL = [
  "#3b791e",
  "#bdd43c",
  "#2c5c16",
  "#509820",
  "#c9dba0",
  "#d4a63c",
  "#547a46",
  "#89a66f",
  "#7a8e70",
  "#b0be9d",
];

const HEAD_OFFICE_BRANCH = "San Juan (Head Office)";

const ROLE_LABEL = "Franchisee Operations Admin";

// ─────────────────────────────────────────────────────────────
// UPDATED SHARED UI CSS
// ─────────────────────────────────────────────────────────────

const VIBE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  * {
    margin:0;
    padding:0;
    box-sizing:border-box;
  }

  html,
  body,
  #root,
  button,
  input,
  textarea,
  select,
  option {
    font-family:'Plus Jakarta Sans',sans-serif;
  }

  :root {
    --g1:#b3a941;
    --g2:#3b791e;
    --g3:#2c5c16;
    --g4:#12241B;

    --green-primary:#3b791e;
    --green-dark:#2c5c16;
    --green-light:#509820;
    --green-accent:#b3a941;
    --green-bg:#f0f5e8;
    --green-mid:#c9dba0;

    --white:#ffffff;
    --off-white:#F6F7F1;

    --gray-100:#F3F4F1;
    --gray-200:#E1E6D8;
    --gray-300:#D4DBC8;
    --gray-400:#9CA89C;
    --gray-500:#6B7A65;
    --gray-600:#4B5A45;
    --gray-700:#374132;
    --gray-800:#1F2A1B;

    --text-dark:#12241B;
    --text-gray:#5C6B60;

    --shadow:rgba(59,121,30,0.07);
    --shadow-strong:rgba(59,121,30,0.16);

    --blue:#3B82F6;
    --red:#dc2626;
    --orange:#d97706;
    --success:#2e7d32;

    --card-border:#E1E6D8;

    --teal:#509820;
    --ink:#12241B;
    --muted:#5C6B60;
    --border:#E1E6D8;
    --bg:#F6F7F1;

    --warn:#d97706;
    --warn-bg:#fffbeb;

    --ok:#2e7d32;
    --ok-bg:#f0f5e8;

    --red-bg:#fef2f2;

    --amber:#f59e0b;
    --amber-bg:#fffbeb;
    --amber-border:#fde68a;

    --grad-main:
      linear-gradient(
        135deg,
        #509820,
        #3b791e
      );

    --grad-dark:
      linear-gradient(
        135deg,
        #12241B,
        #2c5c16
      );

    --grad-gold:
      linear-gradient(
        135deg,
        #e9cd30,
        #b3a941
      );

    --grad-bg:#F6F7F1;

    --grad-blue:
      linear-gradient(
        135deg,
        #3b82f6,
        #1d4ed8
      );

    --grad-orange:
      linear-gradient(
        135deg,
        #f59e0b,
        #d97706
      );

    --grad-red:
      linear-gradient(
        135deg,
        #ef4444,
        #dc2626
      );

    --grad-purple:
      linear-gradient(
        135deg,
        #8b5cf6,
        #7c3aed
      );
  }

  .v-card {
    background:#fff;
    border:1px solid #E1E6D8;
    border-radius:18px;
    box-shadow:
      0 2px 14px
      rgba(59,121,30,0.07);
    transition:
      box-shadow .2s;
    overflow:hidden;
  }

  .v-card:hover {
    box-shadow:
      0 8px 24px
      rgba(59,121,30,0.10);
  }

  .v-kpi {
    background:#fff;
    border:1px solid #E1E6D8;
    border-radius:18px;
    padding:20px 22px;
    box-shadow:
      0 2px 14px
      rgba(59,121,30,0.07);
    transition:
      box-shadow .2s;
    position:relative;
    overflow:hidden;
  }

  .v-kpi::before {
    content:'';
    position:absolute;
    top:-32px;
    right:-32px;
    width:96px;
    height:96px;
    border-radius:50%;
    background:
      rgba(189,212,60,0.10);
    pointer-events:none;
  }

  .v-kpi:hover {
    box-shadow:
      0 8px 24px
      rgba(59,121,30,0.10);
  }

  .v-kpi-label {
    font-size:10.5px;
    font-weight:800;
    text-transform:uppercase;
    letter-spacing:.09em;
    color:#5C6B60;
    margin-bottom:8px;
    font-family:
      'Plus Jakarta Sans',
      sans-serif;
  }

  .v-kpi-value {
    font-family:
      'Plus Jakarta Sans',
      sans-serif;
    font-size:26px;
    font-weight:800;
    color:#12241B;
  }

  .v-kpi-sub {
    font-size:11px;
    font-weight:600;
    color:#7A8878;
    margin-top:4px;
    font-family:
      'Plus Jakarta Sans',
      sans-serif;
  }

  .v-kpi-icon {
    width:44px;
    height:44px;
    border-radius:14px;
    display:flex;
    align-items:center;
    justify-content:center;
    flex-shrink:0;
  }

  .v-kpi-icon.green {
    background:#f0f5e8;
    color:#3b791e;
  }

  .v-kpi-icon.blue {
    background:
      rgba(59,130,246,0.1);
    color:#3b82f6;
  }

  .v-kpi-icon.orange {
    background:#fffbeb;
    color:#d97706;
  }

  .v-kpi-icon.red {
    background:#fef2f2;
    color:#dc2626;
  }

  .v-kpi-icon.purple {
    background:
      rgba(139,92,246,0.1);
    color:#8b5cf6;
  }

  .v-section-head {
    display:flex;
    justify-content:
      space-between;
    align-items:center;
    margin-bottom:20px;
    padding-bottom:16px;
    border-bottom:
      2px solid
      rgba(59,121,30,0.1);
  }

  .v-section-title {
    font-family:
      'Plus Jakarta Sans',
      sans-serif;
    font-size:16px;
    font-weight:800;
    color:#12241B;
    display:flex;
    align-items:center;
    gap:10px;
  }

  .v-section-title-accent {
    width:6px;
    height:24px;
    border-radius:3px;
    background:
      var(--grad-main);
  }

  .v-btn {
    height:38px;
    padding:0 18px;
    border-radius:999px;
    border:
      1.5px solid #E1E6D8;
    font-weight:700;
    cursor:pointer;
    transition:all .15s;
    font-family:
      'Plus Jakarta Sans',
      sans-serif;
    font-size:13px;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    gap:7px;
    background:#fff;
    color:#2c5c16;
  }

  .v-btn-primary {
    background:#3b791e;
    color:#fff;
    border-color:#3b791e;
    box-shadow:
      0 10px 24px
      rgba(59,121,30,.20);
  }

  .v-btn-primary:hover {
    background:#509820;
  }

  .v-btn-secondary {
    background:#fff;
    color:#2c5c16;
    border:
      1.5px solid #E1E6D8;
  }

  .v-btn-secondary:hover {
    background:#F6F7F1;
    border-color:#c9dba0;
  }

  .v-btn-danger {
    background:var(--grad-red);
    color:#fff;
    box-shadow:
      0 4px 14px
      rgba(239,68,68,.25);
  }

  .v-btn-danger:hover {
    transform:
      translateY(-2px);
    box-shadow:
      0 8px 24px
      rgba(239,68,68,.35);
  }

  .v-btn-ghost {
    background:transparent;
    color:#3b791e;
    border:
      1.5px solid
      rgba(59,121,30,0.3);
  }

  .v-btn-ghost:hover {
    background:
      rgba(59,121,30,0.08);
  }

  .v-btn-blue {
    background:var(--grad-blue);
    color:#fff;
    box-shadow:
      0 4px 14px
      rgba(59,130,246,.3);
  }

  .v-btn-blue:hover {
    transform:
      translateY(-2px);
    box-shadow:
      0 8px 24px
      rgba(59,130,246,.4);
  }

  .v-btn-sm {
    padding:6px 14px;
    font-size:12px;
    border-radius:8px;
  }

  .v-badge {
    padding:4px 12px;
    border-radius:20px;
    font-size:11px;
    font-weight:700;
    display:inline-flex;
    align-items:center;
    gap:4px;
    font-family:
      'Plus Jakarta Sans',
      sans-serif;
  }

  .v-badge::before {
    content:'';
    width:6px;
    height:6px;
    border-radius:50%;
    background:currentColor;
    opacity:.7;
  }

  .v-badge-green {
    background:
      rgba(59,121,30,0.12);
    color:#2c5c16;
  }

  .v-badge-orange {
    background:
      rgba(217,119,6,0.12);
    color:#d97706;
  }

  .v-badge-red {
    background:
      rgba(220,38,38,0.12);
    color:#dc2626;
  }

  .v-badge-blue {
    background:
      rgba(59,130,246,0.12);
    color:#2563eb;
  }

  .v-badge-purple {
    background:
      rgba(139,92,246,0.12);
    color:#7c3aed;
  }

  .v-table {
    width:100%;
    border-collapse:collapse;
  }

  .v-table th {
    text-align:left;
    padding:12px 16px;
    font-family:
      'Plus Jakarta Sans',
      sans-serif;
    font-size:10.5px;
    font-weight:800;
    text-transform:uppercase;
    letter-spacing:.08em;
    color:#5C6B60;
    background:
      rgba(59,121,30,0.05);
    border-bottom:
      2px solid
      rgba(59,121,30,0.1);
  }

  .v-table th:first-child {
    border-radius:
      12px 0 0 0;
  }

  .v-table th:last-child {
    border-radius:
      0 12px 0 0;
  }

  .v-table td {
    padding:14px 16px;
    border-bottom:
      1px solid
      rgba(59,121,30,0.07);
    color:#374151;
    font-size:13.5px;
    transition:
      background .15s;
    font-family:
      'Plus Jakarta Sans',
      sans-serif;
  }

  .v-table tr:hover td {
    background:
      rgba(0,200,83,0.03);
  }

  .v-table tr:last-child td {
    border-bottom:none;
  }

  .v-search-wrap {
    position:relative;
  }

  .v-search-wrap svg {
    position:absolute;
    left:13px;
    top:50%;
    transform:
      translateY(-50%);
    color:#94a3b8;
    pointer-events:none;
  }

  .v-search {
    width:100%;
    height:38px;
    padding:
      0 14px 0 38px;
    border:
      1.5px solid #E1E6D8;
    border-radius:11px;
    font-family:
      'Plus Jakarta Sans',
      sans-serif;
    font-size:13px;
    color:#12241B;
    background:#fff;
    transition:all .15s;
    outline:none;
  }

  .v-search::placeholder {
    color:#7A8878;
  }

  .v-search:focus {
    border-color:#3b791e;
    box-shadow:
      0 0 0 3px
      rgba(59,121,30,0.1);
    background:#fff;
  }

  .v-form-group {
    margin-bottom:18px;
  }

  .v-form-label {
    display:block;
    font-weight:700;
    font-size:11.5px;
    text-transform:uppercase;
    letter-spacing:.07em;
    color:#5C6B60;
    margin-bottom:7px;
    font-family:
      'Plus Jakarta Sans',
      sans-serif;
  }

  .v-form-input,
  .v-form-select {
    width:100%;
    min-height:38px;
    padding:9px 13px;
    border:
      1.5px solid #E1E6D8;
    border-radius:11px;
    font-family:
      'Plus Jakarta Sans',
      sans-serif;
    font-size:13px;
    color:#12241B;
    background:#fff;
    outline:none;
    transition:all .15s;
  }

  .v-form-input:focus,
  .v-form-select:focus {
    border-color:#3b791e;
    box-shadow:
      0 0 0 3px
      rgba(59,121,30,0.1);
    background:#fff;
  }

  .v-form-input:disabled {
    background:
      var(--gray-100);
    color:
      var(--gray-500);
    cursor:not-allowed;
  }

  .v-modal-overlay {
    position:fixed;
    inset:0;
    background:
      rgba(13,43,30,0.5);
    display:flex;
    align-items:center;
    justify-content:center;
    z-index:2000;
    animation:
      vFadeIn .2s ease;
    backdrop-filter:blur(4px);
  }

  .v-modal {
    background:#fff;
    padding:2rem;
    border-radius:18px;
    max-width:500px;
    width:90%;
    max-height:90vh;
    overflow-y:auto;
    box-shadow:
      0 24px 80px
      rgba(0,0,0,0.25);
    animation:
      vSlideUp .25s ease;
    border:
      1px solid
      rgba(59,121,30,0.15);
  }

  .v-modal-title {
    font-family:
      'Plus Jakarta Sans',
      sans-serif;
    font-size:18px;
    font-weight:800;
    color:#12241B;
    margin-bottom:6px;
  }

  .v-tabs {
    display:flex;
    gap:3px;
    background:#F6F7F1;
    border:
      1px solid #E1E6D8;
    border-radius:12px;
    padding:4px;
    width:fit-content;
    margin-bottom:22px;
  }

  .v-tab {
    padding:8px 20px;
    border-radius:9px;
    border:none;
    font-size:13px;
    font-weight:700;
    cursor:pointer;
    transition:all .15s;
    font-family:
      'Plus Jakarta Sans',
      sans-serif;
    color:#5C6B60;
    background:transparent;
  }

  .v-tab.active {
    background:#3b791e;
    color:#fff;
    box-shadow:none;
  }

  .v-tab:hover:not(.active) {
    background:
      rgba(59,121,30,0.1);
    color:#12241B;
  }

  .v-stat-grid {
    display:grid;
    grid-template-columns:
      repeat(
        auto-fit,
        minmax(220px,1fr)
      );
    gap:16px;
    margin-bottom:22px;
  }

  .v-empty {
    text-align:center;
    padding:60px 20px;
    color:#94a3b8;
  }

  .v-empty-icon {
    width:56px;
    height:56px;
    margin:
      0 auto 16px;
    border-radius:16px;
    display:flex;
    align-items:center;
    justify-content:center;
    background:#f0f5e8;
    color:#3b791e;
  }

  .v-empty-title {
    font-family:
      'Plus Jakarta Sans',
      sans-serif;
    font-size:1.1rem;
    font-weight:800;
    color:#5C6B60;
    margin-bottom:8px;
  }

  .v-empty-sub {
    font-size:13px;
    line-height:1.6;
    font-family:
      'Plus Jakarta Sans',
      sans-serif;
  }

  .v-dot {
    width:8px;
    height:8px;
    border-radius:50%;
    flex-shrink:0;
  }

  .v-dot-green {
    background:#509820;
    box-shadow:
      0 0 6px #509820;
  }

  .v-dot-red {
    background:#ef4444;
    box-shadow:
      0 0 6px #ef4444;
  }

  .v-dot-orange {
    background:#f59e0b;
    box-shadow:
      0 0 6px #f59e0b;
  }

  .v-dot-blue {
    background:#3b82f6;
    box-shadow:
      0 0 6px #3b82f6;
  }

  .placeholder-pill {
    display:inline-block;
    padding:5px 12px;
    border-radius:8px;

    background:
      linear-gradient(
        90deg,
        rgba(59,121,30,0.06) 25%,
        rgba(59,121,30,0.12) 50%,
        rgba(59,121,30,0.06) 75%
      );

    background-size:
      200% 100%;

    animation:
      shimmer 2s infinite;

    border:
      1.5px dashed
      rgba(59,121,30,0.25);

    color:#5C6B60;
    font-size:12px;
    font-weight:700;

    font-family:
      'Plus Jakarta Sans',
      sans-serif;

    margin-top:4px;
  }

  .v-pw-box {
    margin-top:10px;
    padding:12px 14px;

    background:
      rgba(59,121,30,0.04);

    border:
      1.5px solid
      rgba(59,121,30,0.15);

    border-radius:12px;
    font-size:12px;
  }

  .v-pw-rule {
    display:flex;
    align-items:center;
    gap:7px;
    padding:3px 0;
    font-weight:600;

    font-family:
      'Plus Jakarta Sans',
      sans-serif;
  }

  .v-pw-rule.pass {
    color:#3b791e;
  }

  .v-pw-rule.fail {
    color:#ef4444;
  }

  @keyframes vFadeIn {
    from {
      opacity:0;
    }

    to {
      opacity:1;
    }
  }

  @keyframes vSlideUp {
    from {
      opacity:0;
      transform:
        translateY(24px);
    }

    to {
      opacity:1;
      transform:
        translateY(0);
    }
  }

  @keyframes spin {
    to {
      transform:
        rotate(360deg);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity:1;
    }

    50% {
      opacity:.4;
    }
  }

  @keyframes shimmer {
    0% {
      background-position:
        -200% 0;
    }

    100% {
      background-position:
        200% 0;
    }
  }
`;

const ADMIN_UI_PARITY_CSS = (sidebarCollapsed) => `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .fr-detail-dialog {
    animation:adDetailEnter .18s ease-out;
  }

  .fr-detail-dialog button,
  .fr-detail-dialog summary {
    transition:
      transform .14s ease,
      background-color .14s ease,
      box-shadow .14s ease;
  }

  .fr-detail-dialog button:not(:disabled):hover {
    box-shadow:
      0 2px 7px
      rgba(44,92,22,.12);
  }

  .fr-detail-dialog button:not(:disabled):active,
  .fr-detail-dialog summary:active {
    transform:scale(.97);
  }

  .fr-detail-dialog button:focus-visible,
  .fr-detail-dialog summary:focus-visible {
    outline:2px solid #3b791e;
    outline-offset:3px;
  }

  .fr-detail-dialog button:disabled {
    opacity:.45;
    cursor:not-allowed;
  }

  .fr-evidence-view,
  .fr-detail-dialog details[open] .fr-order-lines {
    animation:
      adEvidenceEnter .16s ease-out;
  }

  @keyframes adDetailEnter {
    from {
      opacity:0;
      transform:
        translateY(6px)
        scale(.99);
    }

    to {
      opacity:1;
      transform:none;
    }
  }

  @keyframes adEvidenceEnter {
    from {
      opacity:0;
      transform:
        translateY(4px);
    }

    to {
      opacity:1;
      transform:none;
    }
  }

  @media (prefers-reduced-motion:reduce) {
    .fr-detail-dialog,
    .fr-detail-dialog *,
    .fr-evidence-view {
      animation:none!important;
      transition:none!important;
      transform:none!important;
    }
  }

  * {
    margin:0;
    padding:0;
    box-sizing:border-box;
  }

  :root {
    --g1:#b3a941;
    --g2:#3b791e;
    --g3:#2c5c16;
    --g4:#12241B;

    --green-primary:#3b791e;
    --green-dark:#2c5c16;
    --green-light:#509820;

    --lime:#b3a941;
    --lime-ink:#24310C;
    --white:#ffffff;

    --gray-100:#F3F4F1;
    --gray-200:#E1E6D8;
    --gray-300:#D4DBC8;
    --gray-400:#9CA89C;
    --gray-500:#5C6B60;
    --gray-600:#4B5A45;
    --gray-700:#374132;
    --gray-800:#1F2A1B;

    --shadow:
      rgba(50,109,32,0.10);

    --shadow-strong:
      rgba(14,59,34,0.20);

    --card-border:#E1E6D8;

    --grad-main:
      linear-gradient(
        135deg,
        #509820,
        #3b791e
      );

    --grad-dark:
      linear-gradient(
        135deg,
        #12241B,
        #2c5c16
      );

    --grad-gold:
      linear-gradient(
        135deg,
        #e9cd30,
        #b3a941
      );

    --grad-bg:#F6F7F1;
  }

  /* ─────────────────────────────
     SIDEBAR
     ───────────────────────────── */

  .fr-sidebar {
    background:#fff;
    box-shadow:
      1px 0 0 #E1E6D8;

    position:fixed;
    top:0;
    left:0;
    bottom:0;

    display:flex;
    flex-direction:column;

    padding:18px 14px;
    overflow-y:auto;
    z-index:100;
  }

  .fr-sidebar-header {
    display:flex;
    align-items:center;
    justify-content:
      space-between;

    padding:
      4px 6px 18px;
  }

  .fr-logo-mark {
    width:38px;
    height:38px;

    display:flex;
    align-items:center;
    justify-content:center;

    font-weight:800;
    font-size:15px;
    flex-shrink:0;
  }

  .fr-brand {
    font-size:16px;
    white-space:nowrap;
  }

  .fr-toggle {
    background:none;
    border:
      1px solid #E1E6D8;

    border-radius:8px;

    width:28px;
    height:28px;

    display:flex;
    align-items:center;
    justify-content:center;

    cursor:pointer;
    color:#5C6B60;
    flex-shrink:0;
  }

  /* ─────────────────────────────
     NAVIGATION
     ───────────────────────────── */

  .fr-nav-section {
    font-size:10.5px;
    font-weight:800;
    letter-spacing:.08em;
    text-transform:uppercase;
    color:#9CA89C;

    padding:
      12px 10px 6px;
  }

  .fr-nav {
    display:flex;
    flex-direction:column;
    gap:2px;
  }

  .fr-nav-item {
    font-family:
      'Plus Jakarta Sans',
      sans-serif;

    display:flex;
    align-items:center;
    gap:12px;

    padding:10px 12px;
    border-radius:12px;

    color:#5C6B60;
    cursor:pointer;

    position:relative;

    font-size:14px;
    font-weight:500;

    transition:
      background .15s ease,
      color .15s ease;
  }

  .fr-nav-item:hover {
    background:#F6F7F1;
    color:#12241B;
  }

  .fr-nav-item.active {
    background:#F6F7F1;
    color:#2c5c16;
    box-shadow:none;
    font-weight:700;
  }

  .fr-nav-item.active .fr-nav-icon {
    color:#3b791e;
  }

  .fr-nav-item.logout {
    color:#c0392b;
  }

  .fr-nav-item.logout:hover {
    background:#fdf1f0;
  }

  .fr-nav-icon {
    flex-shrink:0;

    display:flex;
    align-items:center;
    justify-content:center;

    width:22px;
    height:22px;
  }

  .fr-nav-label {
    flex:1;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
  }

  .fr-nav-bar {
    position:absolute;
    right:6px;
    top:20%;

    height:60%;
    width:3px;

    border-radius:2px;
    background:#b3a941;
  }

  /* ─────────────────────────────
     TOP BAR
     ───────────────────────────── */

  .fr-topbar {
    background:#fff;
    box-shadow:none;

    border-bottom:
      1px solid #E1E6D8;

    display:flex;

    position:sticky;
    top:0;
    z-index:10;

    align-items:center;
    justify-content:
      space-between;

    padding:16px 30px;
  }

  .fr-topbar-title {
    font-family:
      'Plus Jakarta Sans',
      sans-serif;

    color:#12241B;
    font-size:22px;
    font-weight:800;
  }

  .fr-avatar {
    background:#12241B;
    color:#b3a941;

    box-shadow:none;
    border-radius:12px;

    width:38px;
    height:38px;

    display:flex;
    align-items:center;
    justify-content:center;

    font-weight:700;
  }

  .fr-user-name {
    font-weight:700;
    font-size:13px;
    color:#12241B;
    text-align:right;
  }

  .fr-user-role {
    font-size:11.5px;
    color:#5C6B60;
    text-align:right;
  }

  .fr-branch-change-row {
    transition:
      background-color .15s ease;
  }

  .fr-branch-change-row:hover,
  .fr-branch-change-row:focus-visible {
    background:#f0f5e8!important;
  }

  .fr-branch-change-row:active {
    background:#e3edd6;
  }

  /* ─────────────────────────────
     SHARED ADMIN UI
     ───────────────────────────── */

  body.fr-admin-ui,
  body.fr-admin-ui *,
  body.fr-admin-ui *::before,
  body.fr-admin-ui *::after {
    font-family:
      'Plus Jakarta Sans',
      sans-serif!important;

    box-sizing:border-box;
  }

  body.fr-admin-ui {
    color:#12241B;
    background:#F6F7F1;
  }

  body.fr-admin-ui
  :is(
    button,
    input,
    select,
    textarea
  ) {
    font-size:12px;
  }

  body.fr-admin-ui button {
    font-size:12px!important;
    font-weight:600!important;
    line-height:1.35!important;

    letter-spacing:0!important;
    text-transform:none!important;

    min-height:36px;

    border-radius:
      999px!important;

    padding:7px 8px;

    border:
      1px solid #3b791e;

    background:#fff;
    color:#2c5c16;

    display:inline-flex;
    align-items:center;
    justify-content:center;
    gap:7px;

    vertical-align:middle;
    box-sizing:border-box;

    cursor:pointer;

    box-shadow:none!important;

    transition:
      background-color .16s ease,
      color .16s ease,
      border-color .16s ease,
      transform .12s ease,
      filter .16s ease!important;

    -webkit-tap-highlight-color:
      transparent;
  }

  body.fr-admin-ui
  button:not(:disabled):not(
    [aria-disabled="true"]
  ):hover {
    filter:brightness(.96);
  }

  body.fr-admin-ui
  button:not(:disabled):not(
    [aria-disabled="true"]
  ):active {
    transform:scale(.97);
  }

  body.fr-admin-ui
  :is(
    button,
    a,
    input,
    select,
    textarea,
    summary,
    [tabindex]
  ):focus-visible {
    outline:
      2px solid #3b791e!important;

    outline-offset:
      3px!important;
  }

  body.fr-admin-ui
  button:is(
    :disabled,
    [aria-disabled="true"]
  ) {
    background:#e8ebe5!important;
    background-image:none!important;

    color:#687260!important;
    border-color:#e8ebe5!important;

    opacity:1!important;
    cursor:not-allowed!important;

    box-shadow:none!important;
    filter:none!important;
    transform:none!important;
  }

  body.fr-admin-ui button svg {
    flex-shrink:0;
    width:16px;
    height:16px;
  }

  body.fr-admin-ui
  :is(
    input,
    select,
    textarea
  ) {
    font-weight:500;
  }

  body.fr-admin-ui
  :is(
    input,
    textarea
  )::placeholder {
    color:#5C6B60;
    opacity:.85;
  }

  body.fr-admin-ui
  .fr-nav-item {
    border-radius:
      10px!important;

    font-size:
      13px!important;
  }

  body.fr-admin-ui
  .fr-toggle {
    min-width:36px;
    min-height:36px;
  }

  body.fr-admin-ui
  .franchisee-root {
    background:
      #F6F7F1!important;

    background-image:
      none!important;
  }

  @media (pointer:coarse) {
    body.fr-admin-ui button {
      min-height:44px;
      min-width:44px;
    }
  }

  @media (
    prefers-reduced-motion:reduce
  ) {
    body.fr-admin-ui *,
    body.fr-admin-ui *::before,
    body.fr-admin-ui *::after {
      animation:none!important;
      transition:none!important;
      scroll-behavior:
        auto!important;
    }

    body.fr-admin-ui
    button:active {
      transform:none!important;
    }
  }

  /* ─────────────────────────────
     MAIN LAYOUT
     ───────────────────────────── */

  .franchisee-root {
    display:flex;
    min-height:100vh;

    color:#12241B;
    background:#F6F7F1;
  }

  .fr-sidebar {
    width:${sidebarCollapsed ? "76px" : "272px"};

    height:100dvh;
    overflow-x:hidden;

    z-index:1000;

    transition:
      width .3s ease,
      transform .3s ease;
  }

  .fr-main {
    flex:1;
    min-width:0;

    margin-left:${sidebarCollapsed ? "76px" : "272px"};

    transition:
      margin-left .3s ease;
  }

  .fr-content {
    width:100%;
    max-width:1400px;

    margin:0 auto;

    padding:
      20px 30px 40px;

    min-width:0;
  }

  .fr-sidebar-header img {
    max-width:100%;
  }

  .fr-logo-mark {
    background:transparent;
    margin:auto;
  }

  .fr-logo-mark img {
    width:35px;
    height:35px;
    object-fit:contain;
  }

  .fr-nav-label {
    display:${sidebarCollapsed ? "none" : "block"};

    text-align:left;
  }

  .fr-topbar {
    min-height:72px;
    z-index:100;
    gap:12px;
  }

  .fr-topbar-heading {
    display:flex;
    align-items:center;
    gap:10px;
    min-width:0;
  }

  .fr-topbar-title {
    overflow-wrap:anywhere;
  }

  body.fr-admin-ui
  button.fr-nav-item {
    width:100%;

    justify-content:${sidebarCollapsed ? "center" : "flex-start"};

    text-align:left;

    border:0;
    background:transparent;
    color:#5C6B60;

    padding:10px 12px;
    gap:12px;

    min-height:40px;
  }

  body.fr-admin-ui
  button.fr-nav-item.active {
    background:#F6F7F1;
    color:#2c5c16;

    font-weight:
      700!important;
  }

  body.fr-admin-ui
  button.fr-nav-item:hover {
    background:#F6F7F1;
    color:#12241B;
  }

  body.fr-admin-ui
  .fr-nav-item.logout {
    color:#c0392b;
  }

  body.fr-admin-ui
  .fr-nav-item.logout:hover {
    background:#fdf1f0;
  }

  body.fr-admin-ui
  .fr-nav-icon svg {
    width:20px;
    height:20px;
  }

  body.fr-admin-ui
  .fr-avatar {
    background:#12241B;
    color:#b3a941;

    border:0;

    border-radius:
      12px!important;

    flex-shrink:0;
  }

  body.fr-admin-ui
  .fr-mobile-menu {
    display:none;
  }

  .fr-sidebar-backdrop {
    display:none;
  }

  /* ─────────────────────────────
     MOBILE
     ───────────────────────────── */

  @media(max-width:900px) {
    .fr-sidebar {
      width:272px;

      max-width:
        calc(100vw - 48px);

      transform:
        translateX(${sidebarCollapsed ? "-100%" : "0"});

      visibility:${sidebarCollapsed ? "hidden" : "visible"};

      box-shadow:
        8px 0 30px
        rgba(14,59,34,.12);
    }

    .fr-main {
      margin-left:0;
      width:100%;
    }

    .fr-nav-label {
      display:block;
    }

    body.fr-admin-ui
    button.fr-nav-item {
      justify-content:
        flex-start;
    }

    .fr-sidebar-backdrop {
      display:block;
      position:fixed;
      inset:0;

      background:
        rgba(18,36,27,.42);

      z-index:999;
    }

    body.fr-admin-ui
    .fr-mobile-menu {
      display:inline-flex;

      width:38px;
      height:38px;

      padding:0;
      flex-shrink:0;
    }

    .fr-topbar {
      padding:12px 16px;
      min-height:64px;
    }

    .fr-content {
      padding:16px;
    }

    .fr-topbar-title {
      font-size:18px;
    }

    .fr-user-name,
    .fr-user-role {
      display:none;
    }
  }

  @media(max-width:560px) {
    .fr-content {
      padding:12px;
    }

    .fr-topbar {
      padding:10px 12px;
    }

    .fr-topbar-title {
      font-size:17px;
    }
  }
`;

// ─────────────────────────────────────────────────────────────
// MODULE UI PARITY
// ─────────────────────────────────────────────────────────────

const FR_MODULE_PARITY_CSS = `
  /* Admin surface, controls and typography,
     shared by every franchisee module. */

  body.fr-admin-ui
  .fr-content {
    --fr-card-shadow:
      0 2px 12px
      rgba(50,109,32,.06);
  }

  body.fr-admin-ui
  .v-card,
  body.fr-admin-ui
  .v-kpi {
    border-color:
      #E1E6D8!important;

    background:
      #fff!important;

    box-shadow:
      var(--fr-card-shadow)!important;
  }

  body.fr-admin-ui
  .v-card {
    border-radius:
      18px!important;
  }

  body.fr-admin-ui
  .v-kpi {
    border-radius:
      16px!important;

    padding:16px 17px;
    min-width:0;
  }

  body.fr-admin-ui
  .v-kpi::before {
    display:none;
  }

  body.fr-admin-ui
  .v-kpi-label {
    color:#5C6B60;
    font-size:10px;
    letter-spacing:.07em;
  }

  body.fr-admin-ui
  .v-kpi-value {
    font-size:26px;
    color:#12241B;
    overflow-wrap:anywhere;
  }

  body.fr-admin-ui
  .v-kpi-icon {
    width:36px;
    height:36px;
    border-radius:11px;
  }

  body.fr-admin-ui
  .v-kpi-icon.green {
    background:#eef7e9;
    color:#3b791e;
  }

  body.fr-admin-ui
  .v-kpi-icon.blue {
    background:#eff6ff;
    color:#2563eb;
  }

  body.fr-admin-ui
  .v-kpi-icon.orange {
    background:#fff7ed;
    color:#b45309;
  }

  body.fr-admin-ui
  .v-kpi-icon.red {
    background:#fdf1f0;
    color:#c0392b;
  }

  body.fr-admin-ui
  .v-section-head {
    gap:14px;
    flex-wrap:wrap;

    border-bottom:
      1px solid #E1E6D8;
  }

  body.fr-admin-ui
  .v-section-title {
    font-size:14px;
    color:#347022;
  }

  body.fr-admin-ui
  .v-section-title-accent {
    display:none;
  }

  body.fr-admin-ui
  .v-btn-primary {
    background:
      #3b791e!important;

    color:#fff!important;

    border-color:
      #3b791e!important;
  }

  body.fr-admin-ui
  .v-btn-primary:not(
    :disabled
  ):hover {
    background:
      #509820!important;
  }

  body.fr-admin-ui
  .v-btn-secondary,
  body.fr-admin-ui
  .v-btn-ghost {
    background:#fff;
    color:#2c5c16;
    border-color:#E1E6D8;
  }

  body.fr-admin-ui
  .v-btn-danger {
    background:#c0392b;
    color:#fff;
    border-color:#c0392b;
  }

  body.fr-admin-ui
  .v-btn-blue {
    background:#f0f5e8;
    color:#2c5c16;
    border-color:#c9dba0;
  }

  body.fr-admin-ui
  .v-form-input,
  body.fr-admin-ui
  .v-form-select,
  body.fr-admin-ui
  .v-search {
    min-height:38px;

    border-radius:
      11px!important;

    border:
      1.5px solid
      #E1E6D8!important;

    color:
      #347022!important;

    background:
      #fff!important;

    font-size:
      13px!important;
  }

  body.fr-admin-ui
  .v-form-input:focus,
  body.fr-admin-ui
  .v-form-select:focus,
  body.fr-admin-ui
  .v-search:focus {
    border-color:
      #3b791e!important;

    box-shadow:
      0 0 0 3px
      rgba(59,121,30,.1)!important;
  }

  body.fr-admin-ui
  .v-form-input:disabled {
    background:
      #F3F4F1!important;

    color:
      #5C6B60!important;
  }

  body.fr-admin-ui
  .v-table th {
    background:
      #f0f5e8!important;

    color:
      #5C6B60!important;

    border-bottom:
      1px solid
      #E1E6D8!important;

    padding:
      12px 14px!important;

    font-size:
      10px!important;

    text-align:
      left!important;
  }

  body.fr-admin-ui
  .v-table td {
    padding:
      12px 14px!important;

    font-size:
      12px!important;

    border-color:#E1E6D8;
  }

  body.fr-admin-ui
  .v-table tbody
  tr:hover td {
    background:#F6F7F1;
  }

  body.fr-admin-ui
  .v-table {
    min-width:600px;
  }

  body.fr-admin-ui
  .v-tabs {
    max-width:100%;
    flex-wrap:wrap;
  }

  body.fr-admin-ui
  .v-tab {
    background:transparent;
    border:0;
    color:#5C6B60;
  }

  body.fr-admin-ui
  .v-tab.active {
    background:#3b791e;
    color:#fff;
  }

  body.fr-admin-ui
  .v-modal-overlay {
    padding:16px;

    background:
      rgba(0,0,0,.55);
  }

  body.fr-admin-ui
  .v-modal {
    border-radius:22px;

    max-width:
      calc(100vw - 32px);

    max-height:
      calc(100dvh - 32px);

    overscroll-behavior:
      contain;
  }

  body.fr-admin-ui
  .fr-db-kpi {
    border:
      1px solid #E1E6D8;

    border-radius:16px;

    padding:16px 17px;

    box-shadow:
      var(--fr-card-shadow);

    min-height:126px;
    min-width:0;
  }

  body.fr-admin-ui
  .fr-db-kpi-grid {
    grid-template-columns:
      repeat(
        4,
        minmax(0,1fr)
      );

    gap:12px;
  }

  body.fr-admin-ui
  .fr-db-chart,
  body.fr-admin-ui
  .fr-db-ins {
    border-color:#E1E6D8;
    border-radius:20px;

    box-shadow:
      0 2px 10px
      rgba(50,109,32,.05);
  }

  body.fr-admin-ui
  .manager-dashboard-tab {
    justify-content:flex-start;
    text-align:left;

    min-height:67px;
    padding:11px 13px;
  }

  body.fr-admin-ui
  .fr-db-tab.active,
  body.fr-admin-ui
  .fr-db-apply {
    background:#3b791e;
    color:#fff;
  }

  body.fr-admin-ui
  .ma-page-title {
    color:#347022;
    font-size:20px;
  }

  body.fr-admin-ui
  .ma-page-icon {
    background:#347022;
    color:#b3a941;
    box-shadow:none;
  }

  body.fr-admin-ui
  .ma-reports .v-btn {
    border-radius:
      999px!important;
  }

  body.fr-admin-ui
  .fa-communications {
    border:
      1px solid #E1E6D8;

    border-radius:18px;
    overflow:hidden;
  }

  body.fr-admin-ui
  .fa-communications
  input::placeholder {
    color:
      rgba(255,255,255,.75);
  }

  body.fr-admin-ui
  .fa-communications
  .comm-card:hover {
    transform:
      translateY(-2px);

    box-shadow:
      0 6px 20px
      rgba(0,140,60,.12)!important;
  }

  body.fr-admin-ui
  .fr-content input,
  body.fr-admin-ui
  .fr-content select {
    max-width:100%;
    min-width:0;
  }

  body.fr-admin-ui
  .fr-content textarea {
    max-width:100%;
  }

  body.fr-admin-ui
  .fr-content
  [data-fr-grid] > * {
    min-width:0;
  }

  body.fr-admin-ui
  button.fr-eye-toggle,
  body.fr-admin-ui
  button.fr-eye-toggle:disabled {
    position:absolute;

    right:6px;
    top:50%;

    transform:
      translateY(-50%)!important;

    width:32px;
    height:32px;

    min-height:32px;
    min-width:32px;

    padding:0;

    border:
      0!important;

    background:
      transparent!important;

    color:
      #5C6B60!important;
  }

  @media(max-width:1100px) {
    body.fr-admin-ui
    .fr-db-kpi-grid,
    body.fr-admin-ui
    .ma-reports
    .v-stat-grid {
      grid-template-columns:
        repeat(
          2,
          minmax(0,1fr)
        );
    }
  }

  @media(max-width:700px) {
    body.fr-admin-ui
    .fr-content
    [data-fr-grid="responsive"] {
      grid-template-columns:
        1fr!important;
    }

    body.fr-admin-ui
    .fr-content
    .v-stat-grid,
    body.fr-admin-ui
    .fr-db-kpi-grid {
      grid-template-columns:
        repeat(
          2,
          minmax(0,1fr)
        )!important;

      gap:10px;
    }

    body.fr-admin-ui
    .fr-db-ins-grid,
    body.fr-admin-ui
    .fr-db-bot-grid {
      grid-template-columns:1fr;
    }

    body.fr-admin-ui
    .manager-dashboard-tabs {
      grid-template-columns:1fr;
    }

    body.fr-admin-ui
    .fa-header-top,
    body.fr-admin-ui
    .ma-page-head {
      flex-wrap:wrap;
      gap:14px;
    }

    body.fr-admin-ui
    .v-section-head {
      align-items:flex-start;
    }

    body.fr-admin-ui
    .v-modal {
      padding:20px;
      width:100%;
    }

    body.fr-admin-ui
    .fr-content
    .v-kpi {
      padding:14px;
    }

    body.fr-admin-ui
    .v-kpi-value {
      font-size:22px;
    }

    body.fr-admin-ui
    .fr-db-chart {
      padding:16px 12px;
    }

    body.fr-admin-ui
    .fr-db-view-banner {
      gap:10px;
      flex-wrap:wrap;
    }

    body.fr-admin-ui
    .ma-report-tabs {
      flex-wrap:wrap;
      overflow:visible;
    }

    body.fr-admin-ui
    .ma-report-tab {
      flex:1 1 180px;
      justify-content:flex-start;
    }

    body.fr-admin-ui
    .fr-profile-overview {
      display:grid!important;

      grid-template-columns:
        56px minmax(0,1fr);

      gap:16px!important;

      padding:
        20px!important;
    }

    body.fr-admin-ui
    .fr-profile-overview
    > :first-child {
      width:56px!important;
      height:56px!important;
    }

    body.fr-admin-ui
    .fr-profile-overview
    > :nth-child(2)
    > :first-child {
      white-space:
        normal!important;

      overflow-wrap:
        anywhere;

      font-size:
        18px!important;
    }

    body.fr-admin-ui
    .fr-profile-overview
    > :nth-child(2)
    > :nth-child(2) {
      overflow-wrap:anywhere;

      font-size:
        11px!important;
    }

    body.fr-admin-ui
    .fr-profile-overview
    > :last-child {
      grid-column:1/-1;

      display:grid!important;

      grid-template-columns:
        1fr 1fr;
    }

    body.fr-admin-ui
    .fr-profile-name-fields {
      display:grid!important;

      grid-template-columns:
        1fr 1fr;
    }

    body.fr-admin-ui
    .fr-inventory-master-detail,
    body.fr-admin-ui
    .fr-menu-master-detail {
      grid-template-columns:
        1fr!important;

      min-height:
        0!important;

      max-height:
        none!important;
    }

    body.fr-admin-ui
    .fr-inventory-master-detail
    > :first-child,
    body.fr-admin-ui
    .fr-menu-master-detail
    > :first-child {
      max-height:
        300px!important;

      border-right:
        0!important;

      border-bottom:
        1px solid #E1E6D8;
    }

    body.fr-admin-ui
    .fr-inventory-master-detail
    > :last-child,
    body.fr-admin-ui
    .fr-menu-master-detail
    > :last-child {
      min-height:
        200px!important;

      max-height:
        none!important;
    }
  }

  @media(max-width:380px) {
    body.fr-admin-ui
    .fr-content
    .v-stat-grid,
    body.fr-admin-ui
    .fr-db-kpi-grid {
      grid-template-columns:
        1fr!important;
    }
  }

  @media(
    prefers-reduced-motion:reduce
  ) {
    body.fr-admin-ui
    .franchisee-root * {
      animation:none!important;
      transition:none!important;
    }

    body.fr-admin-ui
    .franchisee-root
    [role="button"]:hover,
    body.fr-admin-ui
    .comm-card:hover {
      transform:none!important;
    }
  }
`;

// ─────────────────────────────────────────────────────────────
// FORMATTERS / CONSTANTS
// ─────────────────────────────────────────────────────────────

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
    {
      key: "batch_number",
      label: "Batch No.",
      type: "text",
      width: 110,
    },
    {
      key: "mfg_date",
      label: "Mfg Date",
      type: "date",
      width: 110,
    },
    {
      key: "exp_date",
      label: "Exp Date",
      type: "date",
      width: 110,
    },
    {
      key: "supply_date",
      label: "Supply Date",
      type: "date",
      width: 110,
    },
  ],

  "Coffee Spot": [
    {
      key: "batch_number",
      label: "Batch No.",
      type: "text",
      width: 110,
    },
    {
      key: "mfg_date",
      label: "Mfg Date",
      type: "date",
      width: 110,
    },
    {
      key: "exp_date",
      label: "Exp Date",
      type: "date",
      width: 110,
    },
    {
      key: "supply_date",
      label: "Supply Date",
      type: "date",
      width: 110,
    },
    {
      key: "perishable",
      label: "Perishable",
      type: "yesno",
      width: 100,
    },
  ],

  "Food Caravan": [
    {
      key: "batch_number",
      label: "Batch No.",
      type: "text",
      width: 110,
    },
    {
      key: "mfg_date",
      label: "Mfg Date",
      type: "date",
      width: 110,
    },
    {
      key: "exp_date",
      label: "Exp Date",
      type: "date",
      width: 110,
    },
    {
      key: "supply_date",
      label: "Supply Date",
      type: "date",
      width: 110,
    },
    {
      key: "perishable",
      label: "Perishable",
      type: "yesno",
      width: 100,
    },
  ],

  iFuel: [
    {
      key: "fuel_type",
      label: "Type",
      type: "text",
      width: 100,
    },
    {
      key: "tank_number",
      label: "Tank No.",
      type: "text",
      width: 90,
    },
    {
      key: "exp_date",
      label: "Exp Date",
      type: "date",
      width: 110,
    },
    {
      key: "supply_date",
      label: "Supply Date",
      type: "date",
      width: 110,
    },
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
    if (brandName.trim().toLowerCase() === key.toLowerCase()) {
      return BRAND_EXTRA_FIELDS[key];
    }
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

  if (!value || value === "") {
    return (
      <span
        style={{
          color: "#94a3b8",
          fontSize: 12,
        }}
      >
        —
      </span>
    );
  }

  if (field.type === "date") {
    try {
      return (
        <span
          style={{
            fontSize: 13,
          }}
        >
          {new Date(value).toLocaleDateString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      );
    } catch {
      return (
        <span
          style={{
            fontSize: 13,
          }}
        >
          {value}
        </span>
      );
    }
  }

  if (field.key === "gallons_delivered") {
    return (
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#1565c0",
        }}
      >
        {Number(value).toLocaleString()} gal
      </span>
    );
  }

  return (
    <span
      style={{
        fontSize: 13,
      }}
    >
      {value}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// PASSWORD VALIDATION
// ─────────────────────────────────────────────────────────────

const validatePw = (pw) => {
  const errs = [];

  if (pw.length < 8) {
    errs.push("minLength");
  }

  if (!/[A-Z]/.test(pw)) {
    errs.push("uppercase");
  }

  if (!/[a-z]/.test(pw)) {
    errs.push("lowercase");
  }

  if (!/\d/.test(pw)) {
    errs.push("number");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) {
    errs.push("special");
  }

  return {
    valid: errs.length === 0,
    errs,
  };
};

// ─────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────

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
      <div
        style={{
          flex: 1,
        }}
      >
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
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
    }}
  >
    <div className="v-section-title-accent" />

    <span className="v-section-title">
      {icon && (
        <span
          style={{
            color: "#3b791e",
          }}
        >
          {icon}
        </span>
      )}

      {children}
    </span>
  </div>
);

const VEmptyState = ({ icon, title, sub }) => {
  const renderedIcon = React.isValidElement(icon)
    ? icon
    : icon
      ? React.createElement(icon, {
          size: 30,
        })
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
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
          }}
        >
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

// ─────────────────────────────────────────────────────────────
// USER STORAGE
// ─────────────────────────────────────────────────────────────

const getUserFromStorage = () => {
  try {
    const userString =
      localStorage.getItem("user") ||
      localStorage.getItem("rememberedUser") ||
      sessionStorage.getItem("user");

    if (!userString || userString === "undefined" || userString === "null") {
      return null;
    }

    const parsed = JSON.parse(userString);

    if (!parsed || typeof parsed !== "object" || !parsed.name) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export default function FranchiseeDashboard({ onLogout }) {
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

  const navigate = useNavigate();

  const [activeModule, setActiveModule] = useState(() => {
    return sessionStorage.getItem("fr_activeModule") || "dashboard";
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 900px)").matches,
  );

  const menuButtonRef = useRef(null);
  const sidebarRef = useRef(null);

  // ───────────────────────────────────────────────────────────
  // RESPONSIVE SIDEBAR
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    const media = window.matchMedia("(max-width: 900px)");

    const closeOnResize = () => {
      if (media.matches) {
        setSidebarCollapsed(true);
      }
    };

    media.addEventListener("change", closeOnResize);

    return () => media.removeEventListener("change", closeOnResize);
  }, []);

  useEffect(() => {
    if (sidebarCollapsed || !window.matchMedia("(max-width: 900px)").matches) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    sidebarRef.current?.querySelector("button")?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setSidebarCollapsed(true);

        menuButtonRef.current?.focus();
      }

      if (event.key !== "Tab") {
        return;
      }

      const controls = [
        ...(sidebarRef.current?.querySelectorAll("button:not(:disabled)") ||
          []),
      ];

      const first = controls[0];
      const last = controls[controls.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      document.removeEventListener("keydown", onKeyDown);

      menuButtonRef.current?.focus();
    };
  }, [sidebarCollapsed]);

  // ───────────────────────────────────────────────────────────
  // STATE
  // ───────────────────────────────────────────────────────────

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [transactions, setTransactions] = useState([]);

  const [brands, setBrands] = useState([]);

  const [user, setUser] = useState(getUserFromStorage);

  // ───────────────────────────────────────────────────────────
  // SAVE ACTIVE MODULE
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    sessionStorage.setItem("fr_activeModule", activeModule);
  }, [activeModule]);

  // ───────────────────────────────────────────────────────────
  // FETCH DASHBOARD DATA
  //
  // Uses adminModuleFetch so authenticated requests use the
  // same session/authentication handling as the other modules.
  // ───────────────────────────────────────────────────────────

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await adminModuleFetch(`${ADMIN_API_BASE}/transactions`);

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions (${response.status})`);
      }

      const data = await response.json();

      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      const response = await adminModuleFetch(`${ADMIN_API_BASE}/brands`);

      if (!response.ok) {
        throw new Error(`Failed to fetch brands (${response.status})`);
      }

      const data = await response.json();

      setBrands(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    }
  }, []);

  const refreshDashboardData = useCallback(async () => {
    await Promise.all([fetchTransactions(), fetchBrands()]);
  }, [fetchTransactions, fetchBrands]);

  useAdminLiveRefresh(refreshDashboardData, [refreshDashboardData]);

  // ───────────────────────────────────────────────────────────
  // LOGOUT
  // ───────────────────────────────────────────────────────────

  const handleLogout = () => setShowLogoutModal(true);

  const confirmLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      const stored =
        localStorage.getItem("user") || sessionStorage.getItem("user");

      const userId = stored ? JSON.parse(stored)?.id : null;

      const response = await adminModuleFetch(`${ADMIN_API_BASE}/logout`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          userId,
        }),

        credentials: "include",
      });

      if (!response.ok) {
        console.warn(`Logout request returned ${response.status}`);
      }
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

      if (typeof onLogout === "function") {
        onLogout();
      }

      window.location.href = "/admin-login";
    }
  };

  // ───────────────────────────────────────────────────────────
  // NAVIGATION
  // ───────────────────────────────────────────────────────────

  const navigation = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Home size={20} />,
      section: "main",
    },
    {
      id: "reports",
      label: "Sales & Reports",
      icon: <BarChart2 size={20} />,
      section: "main",
    },
    {
      id: "stockInventory",
      label: "Stock Inventory",
      icon: <Layers size={20} />,
      section: "main",
    },
    {
      id: "menuInventory",
      label: "Product Catalogue",
      icon: <Box size={20} />,
      section: "main",
    },
    {
      id: "communication",
      label: "Announcements",
      icon: <MessageCircle size={20} />,
      section: "main",
    },
    {
      id: "staff",
      label: "User Management",
      icon: <Users size={20} />,
      section: "main",
    },
    {
      id: "profile",
      label: "Profile Settings",
      icon: <User size={20} />,
      section: "account",
    },
    {
      id: "logout",
      label: "Logout",
      icon: <LogOut size={20} />,
      section: "account",
      action: handleLogout,
    },
  ];

  const mainNav = navigation.filter((item) => item.section === "main");

  const accountNav = navigation.filter((item) => item.section === "account");

  const selectNavigation = (item) => {
    if (item.action) {
      item.action();
    } else {
      setActiveModule(item.id);
    }

    if (window.matchMedia("(max-width: 900px)").matches) {
      setSidebarCollapsed(true);
    }
  };

  const moduleLabel =
    navigation.find((n) => n.id === activeModule)?.label || "Dashboard";

  // ───────────────────────────────────────────────────────────
  // UI
  // ───────────────────────────────────────────────────────────

  return (
    <div className="franchisee-root">
      <style>{VIBE_CSS}</style>

      <style>{ADMIN_UI_PARITY_CSS(sidebarCollapsed)}</style>

      {/* ───────────────────────
          SIDEBAR BACKDROP
          ─────────────────────── */}

      {!sidebarCollapsed && (
        <div
          className="fr-sidebar-backdrop"
          onClick={() => setSidebarCollapsed(true)}
          aria-hidden="true"
        />
      )}

      {/* ───────────────────────
          SIDEBAR
          ─────────────────────── */}

      <aside
        id="fr-navigation"
        ref={sidebarRef}
        className="fr-sidebar"
        aria-label="Main navigation"
      >
        <div className="fr-sidebar-header">
          {!sidebarCollapsed && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
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
            <div
              className="fr-logo-mark"
              style={{
                margin: "0 auto",
              }}
            >
              <img src={sidebarLogo} alt="iFranchise" />
            </div>
          )}

          {!sidebarCollapsed && (
            <button
              className="fr-toggle"
              type="button"
              aria-label="Collapse navigation"
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
              type="button"
              aria-label="Expand navigation"
              onClick={() => setSidebarCollapsed(false)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        <nav className="fr-nav">
          {!sidebarCollapsed && <div className="fr-nav-section">Main Menu</div>}

          {mainNav.map((item) => (
            <button
              type="button"
              aria-current={activeModule === item.id ? "page" : undefined}
              aria-label={item.label}
              key={item.id}
              className={`fr-nav-item ${
                activeModule === item.id ? "active" : ""
              }`}
              onClick={() => selectNavigation(item)}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="fr-nav-icon">{item.icon}</span>

              <span className="fr-nav-label">{item.label}</span>

              {activeModule === item.id && <span className="fr-nav-bar" />}
            </button>
          ))}

          {!sidebarCollapsed && (
            <div
              className="fr-nav-section"
              style={{
                marginTop: 8,
              }}
            >
              Account
            </div>
          )}

          {accountNav.map((item) => (
            <button
              type="button"
              aria-current={activeModule === item.id ? "page" : undefined}
              aria-label={item.label}
              key={item.id}
              className={`fr-nav-item ${
                activeModule === item.id ? "active" : ""
              } ${item.id === "logout" ? "logout" : ""}`}
              onClick={() => selectNavigation(item)}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="fr-nav-icon">{item.icon}</span>

              <span className="fr-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* ───────────────────────
          MAIN
          ─────────────────────── */}

      <main className="fr-main">
        <div className="fr-topbar">
          <div className="fr-topbar-heading">
            <button
              ref={menuButtonRef}
              className="fr-mobile-menu"
              type="button"
              aria-label="Open navigation"
              aria-expanded={!sidebarCollapsed}
              aria-controls="fr-navigation"
              onClick={() => setSidebarCollapsed(false)}
            >
              <Menu size={20} />
            </button>

            <h1 className="fr-topbar-title">{moduleLabel}</h1>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                textAlign: "right",
              }}
            >
              <div className="fr-user-name">{user?.name}</div>

              <div className="fr-user-role">Franchisee — {user?.branch}</div>
            </div>

            <button
              type="button"
              className="fr-avatar"
              aria-label="Open Profile Settings"
              onClick={() => setActiveModule("profile")}
            >
              {(user?.name || "F")[0]}
            </button>
          </div>
        </div>

        {/* ─────────────────────
            MODULE CONTENT
            ───────────────────── */}

        <div className={`fr-content fr-module-${activeModule}`}>
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

          {activeModule === "receipts" && <Receipts />}

          {activeModule === "reports" && (
            <FrReportsContent user={user} transactions={transactions} />
          )}

          {activeModule === "staff" && <FrStaffManagementContent user={user} />}

          {activeModule === "communication" && <FrCommunicationContent />}

          {activeModule === "profile" && <FrProfileContent user={user} />}
        </div>
      </main>

      {/* ───────────────────────
          LOGOUT MODAL
          ─────────────────────── */}

      {showLogoutModal && (
        <div
          className="v-modal-overlay"
          style={{
            zIndex: 3000,
          }}
          onClick={() => {
            if (!isLoggingOut) {
              setShowLogoutModal(false);
            }
          }}
        >
          <div
            className="v-modal"
            style={{
              maxWidth: 400,
              textAlign: "center",
            }}
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
              className="v-modal-title"
              style={{
                textAlign: "center",
              }}
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

            <div
              style={{
                display: "flex",
                gap: 10,
              }}
            >
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
                    <RefreshCw size={14} className="fr-spin" />
                    Logging out…
                  </>
                ) : (
                  <>
                    <LogOut size={14} />
                    Log out
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{FR_MODULE_PARITY_CSS}</style>

      <style>{`
        @keyframes fr-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .fr-spin {
          animation:
            fr-spin .8s
            linear infinite;
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD FORMATTERS
// ─────────────────────────────────────────────────────────────

const fmtAmt = (n) =>
  "₱" +
  Number(n || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtShort = (n) => {
  if (n >= 1_000_000) {
    return "₱" + (n / 1_000_000).toFixed(1) + "M";
  }

  if (n >= 1_000) {
    return "₱" + (n / 1_000).toFixed(0) + "k";
  }

  return "₱" + Number(n).toFixed(0);
};

const fmtPeso1 = (n) =>
  "₱" +
  Number(n || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

const fmt8 = (d) => d.toISOString().slice(0, 10);

// NOTE:
// FONT and PAL were already declared in Part 1.
// Do NOT redeclare them here.

// ─────────────────────────────────────────────────────────────
// PRODUCT ANALYTICS
// ─────────────────────────────────────────────────────────────

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

  const [tab, setTab] = React.useState("top10");

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

      if (filterBrand) {
        params.set("brand", filterBrand);
      }

      const [analyticsRes, inventoryRes] = await Promise.all([
        adminModuleFetch(
          `${ADMIN_API_BASE}/dashboard/product-analytics?${params.toString()}`,
        ),

        adminModuleFetch(`${ADMIN_API_BASE}/ingredients`),
      ]);

      if (!analyticsRes.ok) {
        throw new Error(
          `Product analytics request failed (${analyticsRes.status})`,
        );
      }

      const json = await analyticsRes.json();

      const inventoryJson = inventoryRes.ok ? await inventoryRes.json() : [];

      setData({
        ...json,

        inventory: Array.isArray(inventoryJson) ? inventoryJson : [],
      });
    } catch (err) {
      console.error("Product analytics error:", err);

      setData(null);
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

  useAdminLiveRefresh(fetch_, [fetch_]);

  const fmtProductPeso = (n) =>
    "₱" +
    Number(n || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const TABS = [
    {
      id: "top10",
      label: "Top Products",
    },
    {
      id: "fast",
      label: "Fast Movers",
    },
    {
      id: "slow",
      label: "Slow Movers",
    },
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
      {/* HEADER */}

      <div
        style={{
          display: "flex",

          justifyContent: "space-between",

          alignItems: "center",

          marginBottom: 18,

          gap: 12,

          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,

              borderRadius: 10,

              background: "linear-gradient(135deg,#509820,#3b791e)",

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
                fontFamily: FONT,

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
          type="button"
          onClick={fetch_}
          disabled={loading}
          className="v-btn v-btn-secondary"
        >
          <RefreshCw size={12} className={loading ? "fr-spin" : ""} />

          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {/* SUMMARY */}

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
            {
              label: "Total Products",
              value: data.totalProducts,
            },
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

              value: `${data.avgQty || 0} units`,

              color: "#1e40af",

              bg: "#dbeafe",
            },
          ].map((chip, i) => (
            <div
              key={i}
              style={{
                padding: "6px 14px",

                borderRadius: 20,

                background: chip.bg || "#F6F7F1",

                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <span
                style={{
                  fontSize: 10,

                  fontWeight: 800,

                  color: chip.color || "#2c5c16",

                  textTransform: "uppercase",

                  letterSpacing: "0.06em",
                }}
              >
                {chip.label}:{" "}
              </span>

              <span
                style={{
                  fontSize: 13,

                  fontWeight: 800,

                  color: chip.color || "#12241B",
                }}
              >
                {chip.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* TABS */}

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
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
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
                tab === item.id
                  ? "linear-gradient(135deg,#509820,#3b791e)"
                  : "transparent",

              color: tab === item.id ? "#fff" : "#5C6B60",

              boxShadow:
                tab === item.id ? "0 2px 8px rgba(59,121,30,.28)" : "none",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* LOADING */}

      {loading && (
        <div
          style={{
            padding: "32px 0",

            textAlign: "center",

            color: "#5C6B60",

            fontSize: 13,
          }}
        >
          <RefreshCw size={20} color="#3b791e" className="fr-spin" />

          <div
            style={{
              marginTop: 8,
            }}
          >
            Loading product analytics…
          </div>
        </div>
      )}

      {/* PRODUCT LIST */}

      {!loading &&
        data &&
        (() => {
          const list =
            tab === "top10"
              ? data.top10
              : tab === "fast"
                ? data.fastMoving
                : data.slowMoving;

          if (!Array.isArray(list) || !list.length) {
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
          }

          const maxRevenue = Math.max(
            1,

            ...list.map((product) => Number(product.totalRevenue || 0)),
          );

          return (
            <div>
              <div
                data-fr-grid="responsive"
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

                <span
                  style={{
                    textAlign: "right",
                  }}
                >
                  Units
                </span>

                <span
                  style={{
                    textAlign: "right",
                  }}
                >
                  Revenue
                </span>

                <span
                  style={{
                    paddingLeft: 8,
                  }}
                >
                  Sales Bar
                </span>
              </div>

              {list.map((product, index) => (
                <div
                  data-fr-grid="responsive"
                  key={`${product.name}-${index}`}
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
                >
                  <span
                    style={{
                      fontSize: 11,

                      fontWeight: 800,

                      color:
                        index < 3
                          ? ["#f59e0b", "#94a3b8", "#cd7c2e"][index]
                          : "#9ca3af",
                    }}
                  >
                    {index + 1}
                  </span>

                  <div
                    style={{
                      minWidth: 0,
                    }}
                  >
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
                      {product.name}
                    </div>

                    <div
                      style={{
                        fontSize: 10,

                        color: "#5C6B60",

                        marginTop: 1,
                      }}
                    >
                      {Object.entries(product.branchBreakdown || {})
                        .slice(0, 2)
                        .map(([branch, qty]) => `${branch}: ${qty}`)
                        .join(" · ")}
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
                    {Number(product.totalQty || 0).toLocaleString()}
                  </span>

                  <span
                    style={{
                      textAlign: "right",

                      fontWeight: 700,

                      fontSize: 12,

                      color: "#3b791e",
                    }}
                  >
                    {fmtProductPeso(product.totalRevenue)}
                  </span>

                  <div
                    style={{
                      paddingLeft: 8,
                    }}
                  >
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

                          width: `${
                            (Number(product.totalRevenue || 0) / maxRevenue) *
                            100
                          }%`,

                          background: BAR_COLORS[index % BAR_COLORS.length],

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
