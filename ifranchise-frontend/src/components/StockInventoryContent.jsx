//copy here design

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import * as XLSX from "xlsx";

import {
  AlertTriangle,
  RefreshCw,
  Check,
  X,
  Search,
  Pencil,
  Trash2,
  Plus,
  Store,
  FileText,
  ArrowUp,
  ArrowDown,
  Filter,
  ChevronDown,
  ChevronUp,
  History,
  RotateCcw,
  Activity,
  AlertCircle,
  CheckCircle2,
  Info,
  LoaderCircle,
  UploadCloud,
  ArrowLeft,
  ArrowRight,
  Truck,
  Package,
} from "lucide-react";
import { adminModuleFetch } from "../utils/adminModuleFetch";

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
          fontFamily: "Montserrat,sans-serif",
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
          fontFamily: "Montserrat,sans-serif",
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
          background: C.white,
          borderRadius: 18,
          width: "100%",
          maxWidth: 560,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          border: `1px solid ${C.border}`,
          fontFamily: "Montserrat,sans-serif",
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
                  <div style={{ fontWeight: 800, fontSize: 14, color: C.ink }}>
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
          fontFamily: "Montserrat,sans-serif",
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
              style={{ fontSize: 16, fontWeight: 800, color: C.ink, margin: 0 }}
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
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
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
                  <div style={{ fontSize: 12, color: C.ink, fontWeight: 600 }}>
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
              style={{ fontSize: 16, fontWeight: 800, color: C.ink, margin: 0 }}
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

function FifoQueue({
  product,
  batches,
  loading,
  onEditBatch,
  onDeleteBatch,
  onViewHistory,
  readOnly = false,
}) {
  const productBranch = String(product?.branch || "")
    .trim()
    .toLowerCase();

  const canModifyBatch =
    !readOnly && productBranch === "san juan (head office)";
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
                      <strong style={{ color: C.ink }}>{b.received_by}</strong>
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

                {(canModifyBatch ||
                  productBranch === "san juan (head office)") && (
                  <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                    {canModifyBatch && (
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

                    {productBranch === "san juan (head office)" && (
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
          width: "100%",
          minHeight: 75,
          boxSizing: "border-box",
          flexShrink: 0,
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
            {branchCount} branch{branchCount === 1 ? "" : "es"}
          </div>
        </div>
        <div
          style={{
            width: 30,
            height: 30,
            flexShrink: 0,
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
          gridTemplateColumns: "repeat(3,minmax(0,1fr))",
          width: "100%",
          minHeight: 71,
          boxSizing: "border-box",
          gap: 8,
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

function BrandCard({
  brandDef,
  brandObj,
  items,
  item,
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
  const [branchF, setBranchF] = useState(
    restrictBranch || initialBranchFilter || "San Juan (Head Office)",
  );
  const HEAD_OFFICE_BRANCH = "San Juan (Head Office)";

  const normalizedUserRole = String(userRole || "")
    .trim()
    .toLowerCase();

  const canModifyItem = (item) => {
    if (!item) return false;

    const itemBranch = String(item?.branch || "")
      .trim()
      .toLowerCase();

    const normalizedRestrictedBranch = String(restrictBranch || "")
      .trim()
      .toLowerCase();

    if (
      normalizedUserRole === "franchisee operations admin" ||
      normalizedUserRole === "franchise operations admin" ||
      normalizedUserRole === "franchisor operations admin"
    ) {
      return false;
    }

    if (
      normalizedUserRole === "super admin" ||
      normalizedUserRole === "sales admin"
    ) {
      return itemBranch === HEAD_OFFICE_BRANCH.toLowerCase();
    }

    if (
      normalizedUserRole === "manager" ||
      normalizedUserRole === "franchisee"
    ) {
      return (
        !!normalizedRestrictedBranch &&
        itemBranch === normalizedRestrictedBranch
      );
    }

    return false;
  };

  const selectedBranchNormalized = String(branchF || "")
    .trim()
    .toLowerCase();

  const restrictedBranchNormalized = String(restrictBranch || "")
    .trim()
    .toLowerCase();

  const canEditSelectedBranch =
    ((normalizedUserRole === "super admin" ||
      normalizedUserRole === "sales admin") &&
      selectedBranchNormalized === HEAD_OFFICE_BRANCH.toLowerCase()) ||
    ((normalizedUserRole === "manager" ||
      normalizedUserRole === "franchisee") &&
      !!restrictedBranchNormalized &&
      selectedBranchNormalized === restrictedBranchNormalized);

  const branchReadOnly = readOnly || !canEditSelectedBranch;
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
    if (
      !restrictBranch &&
      branchOptions.length > 0 &&
      branchF &&
      !branchOptions.includes(branchF)
    ) {
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

  useEffect(() => {
    if (!selectedId) {
      setBatches([]);
      return;
    }

    let cancelled = false;
    setBatchLoading(true);

    adminModuleFetch(`${apiUrl}/ingredient-batches?ingredient_id=${selectedId}`)
      .then(async (r) => {
        if (!r.ok) {
          const data = await r.json().catch(() => ({}));
          throw new Error(
            data.message || data.error || "Failed to fetch batches",
          );
        }

        return r.json();
      })
      .then((d) => {
        if (!cancelled) {
          setBatches(Array.isArray(d) ? d : []);
          setBatchLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch ingredient batches:", err);

        if (!cancelled) {
          setBatches([]);
          setBatchLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId, apiUrl, refreshToken]);

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
        credentials: "include",
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
        credentials: "include",
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
        credentials: "include",
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
      .then(async (r) => {
        if (!r.ok) {
          const data = await r.json().catch(() => ({}));
          throw new Error(
            data.message || data.error || "Failed to fetch batches",
          );
        }

        return r.json();
      })
      .then((d) => {
        if (!cancelled) {
          setBatches(Array.isArray(d) ? d : []);
          setBatchLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch ingredient batches:", err);

        if (!cancelled) {
          setBatches([]);
          setBatchLoading(false);
        }
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
          {canModifyItem(selected) && (
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
          )}

          {canEditSelectedBranch && (
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
                title="Add a new item to this brand"
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
        <div style={{ position: "relative", flex: "1 1 160px", minWidth: 100 }}>
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
            style={{ ...invInputSt, height: 30, fontSize: 12, paddingLeft: 24 }}
          />
        </div>
        {restrictBranch ? (
          <div
            style={{
              ...invInputSt,
              height: 30,
              minWidth: 160,
              fontSize: 11,
              padding: "6px 10px",
              background: "#F6F7F1",
              color: C.ink,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "default",
            }}
            title="Assigned branch"
          >
            <StoreIcon size={12} color={C.green} />
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
                            color: item.category ? C.greenDk : C.warn,
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
                    {canModifyItem(item) && (
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
            readOnly={!selected || !canModifyItem(selected)}
            onEditBatch={(b) =>
              setEditingBatch({
                batch: b,
                ingredient: selected,
              })
            }
            onDeleteBatch={(b) =>
              setDeleteConfirmBatch({
                batch: b,
                ingredient: selected,
              })
            }
            onViewHistory={(b) =>
              setTransferHistoryBatch({
                batch: b,
                ingredient: selected,
              })
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
          background: C.white,
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
                  style={{ padding: "8px 10px", fontSize: 12, color: C.muted }}
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
                      onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
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
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
                      ₱{batchCost.toFixed(2)} ÷ {qty} {product?.unit || "unit"}
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
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
                      {directProduct
                        ? "cost ÷ 0.35 — 35% product, 45% ops, 20% profit"
                        : "cost/unit + 15% (weighted avg across batches)"}
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
                        : unitCost * 1.15
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
              style={{ fontSize: 16, fontWeight: 800, color: C.ink, margin: 0 }}
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
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>
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
                      border: `1.5px solid ${C.green}`,
                      background: "#e0f2f1",
                      color: C.greenDk,
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
          background: C.white,
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
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
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
  const normalizedUserRole = String(userRole || "")
    .trim()
    .toLowerCase();

  const ingredientBranch = String(ingredient?.branch || "")
    .trim()
    .toLowerCase();

  const isBatchWriteRole =
    normalizedUserRole === "super admin" ||
    normalizedUserRole === "sales admin";

  const canModifyBatch =
    !readOnly &&
    isBatchWriteRole &&
    ingredientBranch === "san juan (head office)";
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
    ok: { badgeText: null, border: C.border, label: null, dateColor: C.ink },
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
    if (!canModifyBatch) {
      showUiModal({
        type: "error",
        title: "Read Only Access",
        message:
          "Batches can only be edited by Super Admin or Sales Admin in San Juan (Head Office).",
      });
      return;
    }
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

  const requestDeleteBatch = (batch) => {
    if (!canModifyBatch) {
      showUiModal({
        type: "error",
        title: "Read Only Access",
        message:
          "Batches can only be deleted by Super Admin or Sales Admin in San Juan (Head Office).",
      });
      return;
    }

    setDeleteConfirmBatch(batch);
  };

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
                        style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}
                      >
                        {batch.notes}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {canModifyBatch && (
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
export default function StockInventoryContent({
  user,
  brands: propBrands = [],
  initialFocus = null,
}) {
  const normalizedRole = String(user?.role || "")
    .trim()
    .toLowerCase();

  const isSuperAdmin = normalizedRole === "super admin";
  const isSalesAdmin = normalizedRole === "sales admin";

  const isOperationsAdmin =
    normalizedRole === "franchisee operations admin" ||
    normalizedRole === "franchise operations admin" ||
    normalizedRole === "franchisor operations admin";

  const isFranchisee = normalizedRole === "franchisee";
  const isManager = normalizedRole === "manager";

  const userBranch = String(user?.branch || "").trim();

  const canViewAllInventory = isSuperAdmin || isSalesAdmin || isOperationsAdmin;

  const isAdmin = canViewAllInventory;

  const canRoleEditInventory =
    isSuperAdmin || isSalesAdmin || isManager || isFranchisee;

  const [activeBatchReadOnly, setActiveBatchReadOnly] = useState(true);

  const isReadOnly = isOperationsAdmin || !canRoleEditInventory;

  const userBrand = String(
    user?.brand || user?.brand_name || user?.brandName || "",
  ).trim();

  const userName = user?.name || "Unknown";

  const [savingItem, setSavingItem] = useState(false);
  const [deletingItem, setDeletingItem] = useState(false);
  const [restoringId, setRestoringId] = useState(null);
  const [toast, setToast] = useState(null);

  // Use brands from parent when available.
  // Otherwise Stock Inventory will load them directly from the backend.
  const [localBrands, setLocalBrands] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadBrands = async () => {
      try {
        const res = await adminModuleFetch(
          `${process.env.REACT_APP_API_URL}/brands`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch brands: ${res.status}`);
        }

        const data = await res.json();

        const loadedBrands = Array.isArray(data)
          ? data
          : Array.isArray(data?.brands)
            ? data.brands
            : [];

        if (!cancelled) {
          setLocalBrands(loadedBrands);
        }
      } catch (error) {
        console.error("Stock Inventory brand fetch error:", error);

        if (!cancelled) {
          setLocalBrands([]);
        }
      }
    };

    loadBrands();

    return () => {
      cancelled = true;
    };
  }, []);

  const brandList = localBrands;

  const connectedBrandDefs = useMemo(() => {
    const matched = BRAND_DEFS.filter((bd) =>
      brandList.some((b) => {
        const brandName = String(b?.name || "")
          .trim()
          .toLowerCase();

        return bd.match(brandName);
      }),
    ).sort((a, b) => a.label.localeCompare(b.label));

    return matched;
  }, [brandList]);

  const defaultBulkQtyForUnit = (unit) =>
    ["g", "ml"].includes(unit)
      ? 1000
      : unit === "liters"
        ? 200
        : unit === "kg"
          ? 50
          : ["pcs", "bottles"].includes(unit)
            ? 50
            : 1;

  const computeDisplayPrice = (cost, unit, bulkQtyOverride) => {
    const bulkQty =
      Number(bulkQtyOverride) > 0
        ? Number(bulkQtyOverride)
        : ["g", "ml"].includes(unit)
          ? 1000
          : unit === "liters"
            ? 200
            : unit === "kg"
              ? 50
              : ["pcs", "bottles"].includes(unit)
                ? 50
                : 1;
    return Math.round(Number(cost || 0) * bulkQty * 1.15 * 100) / 100;
  };

  const PACK_NAME_FOR_UNIT = {
    g: "kg",
    ml: "liters",
    liters: "drums",
    kg: "cylinders",
    pcs: "packs",
    bottles: "cases",
  };

  const bulkLabelFor = (unit, bulkQtyOverride) => {
    if (!unit) return "";
    const qty =
      Number(bulkQtyOverride) > 0
        ? Number(bulkQtyOverride)
        : ["g", "ml"].includes(unit)
          ? 1000
          : unit === "liters"
            ? 200
            : unit === "kg"
              ? 50
              : ["pcs", "bottles"].includes(unit)
                ? 50
                : 1;
    const packName = PACK_NAME_FOR_UNIT[unit] || `${unit} packs`;
    return `${packName} (${qty}${unit})`;
  };

  const markupLabelFor = () => "+ 15%";

  const ownBrandDef = useMemo(() => {
    if (isAdmin) return null;

    // Manager account brand is authoritative.
    let ownBrandObj = null;

    if (userBrand) {
      ownBrandObj = brandList.find(
        (brandObj) =>
          String(brandObj?.name || "")
            .trim()
            .toLowerCase() === userBrand.toLowerCase(),
      );
    }

    // Only use branch as fallback for older
    // accounts without a stored brand.
    if (!ownBrandObj && userBranch) {
      const matchingBrands = brandList.filter((brandObj) =>
        (brandObj.branches || []).some((branchObj) => {
          const branchName =
            typeof branchObj === "string" ? branchObj : branchObj?.name;

          return (
            String(branchName || "")
              .trim()
              .toLowerCase() === userBranch.toLowerCase()
          );
        }),
      );

      // Only infer when the branch belongs
      // to exactly one brand.
      if (matchingBrands.length === 1) {
        ownBrandObj = matchingBrands[0];
      }
    }

    if (!ownBrandObj) return null;

    return (
      connectedBrandDefs.find((brandDef) =>
        brandDef.match(String(ownBrandObj.name || "").toLowerCase()),
      ) || null
    );
  }, [isAdmin, userBrand, userBranch, brandList, connectedBrandDefs]);

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
    ? brandList.find((b) => activeBrandDef.match((b.name || "").toLowerCase()))
        ?.name || ""
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
      bulkQty: "",
      pcsPerStrip: "",
      stripsPerBox: "",
    }),
    [isAdmin, userBranch],
  );

  const [form, setForm] = useState(emptyForm);

  const fetchItems = useCallback(async () => {
    setLoading(true);

    try {
      let currentUser = user;

      // Recover the authenticated user from the JWT session
      // if the parent has not passed it yet.
      if (!currentUser) {
        const sessionRes = await adminModuleFetch(
          `${process.env.REACT_APP_API_URL}/session`,
          {
            credentials: "include",
          },
        );

        if (!sessionRes.ok) {
          throw new Error("Unable to get authenticated user.");
        }

        const sessionData = await sessionRes.json();
        currentUser = sessionData?.user;
      }

      if (!currentUser?.role) {
        throw new Error("User role is unavailable.");
      }

      const currentRole = String(currentUser.role || "")
        .trim()
        .toLowerCase();

      const currentIsAdmin =
        currentRole === "super admin" ||
        currentRole === "sales admin" ||
        currentRole === "franchisee operations admin" ||
        currentRole === "franchise operations admin" ||
        currentRole === "franchisor operations admin";

      const currentBranch = String(currentUser.branch || "").trim();

      const currentBrand = String(
        currentUser.brand ||
          currentUser.brand_name ||
          currentUser.brandName ||
          "",
      ).trim();

      const params = new URLSearchParams();

      if (!currentIsAdmin) {
        if (currentBranch) {
          params.set("branch", currentBranch);
        }

        if (currentBrand) {
          params.set("brand", currentBrand);
        }
      }

      const query = params.toString() ? `?${params.toString()}` : "";

      const res = await adminModuleFetch(
        `${process.env.REACT_APP_API_URL}/ingredients${query}`,
        {
          credentials: "include",
        },
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));

        throw new Error(
          errorData.message ||
            errorData.error ||
            `Failed to load inventory (${res.status})`,
        );
      }

      const d = await res.json();

      const rows = Array.isArray(d)
        ? d.map(normalizeStockItem).filter((item) => {
            if (currentIsAdmin) {
              return true;
            }

            const sameBranch =
              !currentBranch ||
              String(item.branch || "")
                .trim()
                .toLowerCase() === currentBranch.toLowerCase();

            const sameBrand =
              !currentBrand ||
              String(item.brand || "")
                .trim()
                .toLowerCase() === currentBrand.toLowerCase();

            return sameBranch && sameBrand;
          })
        : [];

      setItems(rows);

      return rows;
    } catch (err) {
      console.error("Failed to fetch stock inventory:", err);
      setItems([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchDeleteHistory = useCallback(async () => {
    try {
      const res = await adminModuleFetch(
        `${process.env.REACT_APP_API_URL}/ingredient-delete-history`,
        {
          credentials: "include",
        },
      );

      if (!res.ok) {
        throw new Error(
          `Failed to load ingredient delete history (${res.status})`,
        );
      }

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
      const res = await adminModuleFetch(
        `${process.env.REACT_APP_API_URL}/ingredient-activity-log`,
        {
          credentials: "include",
        },
      );

      if (!res.ok) {
        throw new Error(
          `Failed to load ingredient activity log (${res.status})`,
        );
      }

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

    adminModuleFetch(
      `${process.env.REACT_APP_API_URL}/ingredient-batches?ingredient_id=${activeBatchIngredient.id}`,
      {
        credentials: "include",
      },
    )
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load ingredient batches (${res.status})`);
        }

        return res.json();
      })
      .then((d) => {
        setBatches(Array.isArray(d) ? d : []);
      })
      .catch((err) => {
        console.error("Failed to fetch ingredient batches:", err);
        setBatches([]);
      })
      .finally(() => {
        setBatchLoading(false);
      });
  }, [activeBatchIngredient]);

  const importExcel = (e) => {
    const role = String(user?.role || "")
      .trim()
      .toLowerCase();

    const isSuperAdmin = role === "super admin";
    const isSalesAdmin = role === "sales admin";
    const isFranchiseeOperationsAdmin = role === "franchisee operations admin";

    const HEAD_OFFICE = "san juan (head office)";

    // Only Super Admin and Sales Admin can import.
    if (isFranchiseeOperationsAdmin || (!isSuperAdmin && !isSalesAdmin)) {
      e.target.value = "";

      showUiModal({
        type: "error",
        title: "Read Only Access",
        message:
          "Your account has read-only access and cannot import inventory records.",
      });

      return;
    }

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
        const readOnlyBranchRows = [];

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

            // Super Admin and Sales Admin may only import into Head Office.
            if (rowBranch.toLowerCase() !== HEAD_OFFICE) {
              readOnlyBranchRows.push({
                name,
                branch: rowBranch,
              });
              return;
            }

            const alreadyExists = items.some(
              (i) =>
                normalizeName(i.name) === normalizeName(name) &&
                String(i.branch || "")
                  .trim()
                  .toLowerCase() === rowBranch.toLowerCase(),
            );

            if (alreadyExists) return;

            const rawListInShop = row.list_in_shop ?? row["List In Shop"] ?? "";

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
              shopUnit: String(row.shop_unit || row["Shop Unit"] || "").trim(),
              shopCategory: String(
                row.shop_category || row["Shop Category"] || "Coffee Spot",
              ).trim(),
            });
          });
        });

        // If nothing can be imported because all rows belong to other branches.
        if (rows_to_save.length === 0 && readOnlyBranchRows.length > 0) {
          setImportLoading(false);
          e.target.value = "";

          showUiModal({
            type: "error",
            title: "Read Only Branch",
            message:
              "No records were imported. Stock Inventory can only be imported into San Juan (Head Office).",
            lines: readOnlyBranchRows.map((item) => ({
              text: `${item.name} — ${item.branch}`,
              warn: true,
            })),
          });

          return;
        }

        setImportProgress({
          percent: 25,
          label: `Found ${rows_to_save.length} rows. Importing…`,
          current: 0,
          total: rows_to_save.length,
        });

        let saved = 0;
        let shopSaved = 0;
        let skipped = 0;

        const skippedNames = [];

        for (let idx = 0; idx < rows_to_save.length; idx++) {
          const item = rows_to_save[idx];

          setImportProgress({
            percent:
              25 +
              Math.round(((idx + 1) / Math.max(rows_to_save.length, 1)) * 65),
            label: `Saving "${item.name}"…`,
            current: idx + 1,
            total: rows_to_save.length,
          });

          try {
            const res = await adminModuleFetch(
              `${process.env.REACT_APP_API_URL}/ingredients`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  ...item,
                  performed_by: userName,
                  performed_by_role: user?.role || "Unknown",
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
                  const checkRes = await adminModuleFetch(
                    `${process.env.REACT_APP_API_URL}/shop-items`,
                  );

                  const checkData = await checkRes.json();

                  const shopItems = Array.isArray(checkData) ? checkData : [];

                  const alreadyInShop = shopItems.some(
                    (s) =>
                      String(s.name || "")
                        .trim()
                        .toLowerCase() === item.name.toLowerCase() &&
                      String(s.shop || "")
                        .trim()
                        .toLowerCase() === item.shopCategory.toLowerCase(),
                  );

                  if (!alreadyInShop) {
                    const shopRes = await adminModuleFetch(
                      `${process.env.REACT_APP_API_URL}/shop-items`,
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          name: item.name,
                          price: item.shopPrice,
                          unit: item.shopUnit,
                          stock: item.stock,
                          shop: item.shopCategory,
                          brand: item.brand || "",
                          image_url: "...",
                          is_visible: true,
                          performed_by: userName,
                          performed_by_role: user?.role || "Unknown",
                          latitude: coords?.latitude,
                          longitude: coords?.longitude,
                        }),
                      },
                    );

                    const shopResult = await shopRes.json();

                    if (shopResult.success) {
                      shopSaved++;
                    }
                  }
                } catch (error) {
                  console.error(
                    "Failed to add imported item to Mobile Shop:",
                    error,
                  );
                }
              }
            } else {
              skipped++;
              skippedNames.push(item.name);
            }
          } catch (error) {
            console.error("Failed to import ingredient:", error);

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
          {
            text: `${rows_to_save.length} Head Office row(s) parsed from file`,
          },
          {
            text: `${saved} ingredient(s) saved successfully`,
          },

          ...(shopSaved > 0
            ? [
                {
                  text: `${shopSaved} item(s) also added to Mobile Shop`,
                },
              ]
            : []),

          ...(readOnlyBranchRows.length > 0
            ? [
                {
                  text: `${readOnlyBranchRows.length} row(s) skipped because the branch is read-only`,
                  warn: true,
                },
                ...readOnlyBranchRows.map((item) => ({
                  text: `${item.name} — ${item.branch}`,
                  warn: true,
                })),
              ]
            : []),

          ...(skipped > 0
            ? [
                {
                  text: `${skipped} item(s) failed or were skipped`,
                  warn: true,
                },
                ...skippedNames.map((name) => ({
                  text: name,
                  warn: true,
                })),
              ]
            : []),
        ];

        setTimeout(() => {
          setImportLoading(false);
          e.target.value = "";

          const totalSkipped = skipped + readOnlyBranchRows.length;

          showUiModal({
            type: totalSkipped > 0 ? "info" : "success",
            title: "Import Complete",
            message:
              totalSkipped > 0
                ? `${saved} ingredient(s) imported. ${totalSkipped} row(s) were skipped.`
                : `Successfully imported ${saved} ingredient(s).`,
            lines: summaryLines,
          });
        }, 400);
      } catch (error) {
        console.error("Excel import failed:", error);

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
  }, [items, search, brand, branch, unitFilter, statusFilt, sort, brandList]);

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

    const role = String(user?.role || "")
      .trim()
      .toLowerCase();

    const isSuperAdmin = role === "super admin";
    const isSalesAdmin = role === "sales admin";
    const isFranchiseeOperationsAdmin = role === "franchisee operations admin";

    // Franchisee Operations Admin is always read-only.
    if (isFranchiseeOperationsAdmin) {
      showUiModal({
        type: "error",
        title: "Read Only Access",
        message:
          "Franchisee Operations Admin has read-only access to Stock Inventory.",
      });
      return;
    }

    // Determine which branch is being modified.
    const targetBranch = editing
      ? editing.branch
      : form.branches?.length === 1
        ? form.branches[0]
        : null;

    // Super Admin and Sales Admin may modify Head Office only.
    if (
      (isSuperAdmin || isSalesAdmin) &&
      targetBranch &&
      String(targetBranch).trim().toLowerCase() !== "san juan (head office)"
    ) {
      showUiModal({
        type: "error",
        title: "Read Only Access",
        message:
          "Stock Inventory can only be modified in San Juan (Head Office). Other branches are read-only.",
      });
      return;
    }

    // When adding to multiple branches, prevent non-Head Office branches.
    if (
      (isSuperAdmin || isSalesAdmin) &&
      !editing &&
      Array.isArray(form.branches) &&
      form.branches.some(
        (branch) =>
          String(branch).trim().toLowerCase() !== "san juan (head office)",
      )
    ) {
      showUiModal({
        type: "error",
        title: "Read Only Access",
        message:
          "You can only add Stock Inventory records to San Juan (Head Office). Other branches are read-only.",
      });
      return;
    }

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

    if (isPharmaBrand(form.brand || currentBrandName)) {
      if (form.unit !== "pcs") {
        errors.push(
          "iPharma medicines must use pcs as the base inventory unit.",
        );
      }

      if (form.pcsPerStrip && Number(form.pcsPerStrip) < 1) {
        errors.push("Pieces per strip must be at least 1.");
      }

      if (form.stripsPerBox && !form.pcsPerStrip) {
        errors.push("Enter Pieces per Strip before setting Strips per Box.");
      }

      if (form.stripsPerBox && Number(form.stripsPerBox) < 1) {
        errors.push("Strips per box must be at least 1.");
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
            (cat) => cat.toLowerCase() === String(form.category).toLowerCase(),
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
          lines: [{ text: "The current branch can't be removed.", warn: true }],
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
        bulk_qty: form.bulkQty || null,
        extra_fields: {
          pcs_per_strip: form.pcsPerStrip || null,
          strips_per_box: form.stripsPerBox || null,
        },
        ...(!isAdmin ? { cost_per_unit: editing.cost_per_unit } : {}),
      };

      let editSucceeded = false;
      let updatedItem = null;

      try {
        const res = await adminModuleFetch(
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
              const shopRes = await adminModuleFetch(
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
                await adminModuleFetch(
                  `${process.env.REACT_APP_API_URL}/shop-items/${existingShopItem.id}`,
                  {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...existingShopItem, ...shopBody }),
                  },
                );
              } else {
                await adminModuleFetch(
                  `${process.env.REACT_APP_API_URL}/shop-items`,
                  {
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
                  },
                );
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
          bulk_qty: form.bulkQty || null,
          extra_fields: {
            pcs_per_strip: form.pcsPerStrip || null,
            strips_per_box: form.stripsPerBox || null,
          },
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
          const res = await adminModuleFetch(
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
      setFocusMutation({ item: freshItem, stamp: Date.now(), reason: "edit" });
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
        bulk_qty: form.bulkQty || null,
        extra_fields: {
          pcs_per_strip: form.pcsPerStrip || null,
          strips_per_box: form.stripsPerBox || null,
        },
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
        const res = await adminModuleFetch(
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

    const role = String(user?.role || "")
      .trim()
      .toLowerCase();

    const isSuperAdmin = role === "super admin";
    const isSalesAdmin = role === "sales admin";
    const isFranchiseeOperationsAdmin = role === "franchisee operations admin";

    // Franchisee Operations Admin can never delete.
    if (isFranchiseeOperationsAdmin) {
      showUiModal({
        type: "error",
        title: "Read Only Access",
        message:
          "Franchisee Operations Admin has read-only access to Stock Inventory.",
      });
      return;
    }

    // Super Admin and Sales Admin can delete from Head Office only.
    const itemBranch = String(item?.branch || "")
      .trim()
      .toLowerCase();

    if (
      (isSuperAdmin || isSalesAdmin) &&
      itemBranch !== "san juan (head office)"
    ) {
      showUiModal({
        type: "error",
        title: "Read Only Access",
        message:
          "Inventory can only be deleted from San Juan (Head Office). Other branches are read-only.",
      });
      return;
    }
    setDeletingItem(true);
    try {
      const coords = await getBrowserLocation();
      const res = await adminModuleFetch(
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
        await adminModuleFetch(
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
            detail: { ingredientId: item.id, brand: item.brand, deleted: true },
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
    const d = entry?.data;

    if (!d) {
      showUiModal({
        type: "error",
        title: "Restore Failed",
        message: "The deleted inventory record could not be found.",
      });
      return;
    }

    const role = String(user?.role || "")
      .trim()
      .toLowerCase();

    const isSuperAdmin = role === "super admin";
    const isSalesAdmin = role === "sales admin";
    const isFranchiseeOperationsAdmin = role === "franchisee operations admin";

    // Franchisee Operations Admin can never restore.
    if (isFranchiseeOperationsAdmin) {
      showUiModal({
        type: "error",
        title: "Read Only Access",
        message:
          "Franchisee Operations Admin has read-only access to Stock Inventory.",
      });
      return;
    }

    // Restore goes back to the branch stored in the deleted record.
    const restoredBranch = String(d.branch || "").trim();

    const canRestore =
      (isSuperAdmin || isSalesAdmin) &&
      restoredBranch.toLowerCase() === "san juan (head office)";

    if (!canRestore) {
      showUiModal({
        type: "error",
        title: "Read Only Access",
        message:
          "Inventory can only be restored to San Juan (Head Office). Other branches are read-only.",
      });
      return;
    }

    setRestoringId(entry.id);

    try {
      const coords = await getBrowserLocation();
      const res = await adminModuleFetch(
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
        await adminModuleFetch(
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
      const res = await adminModuleFetch(
        `${process.env.REACT_APP_API_URL}/shop-items`,
      );
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
      bulkQty: item.bulk_qty || "",
      pcsPerStrip: item.extra_fields?.pcs_per_strip || "",
      stripsPerBox: item.extra_fields?.strips_per_box || "",
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
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
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
      .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
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

  const previewShopPrice = isDirectProductBrand(form.brand || currentBrandName)
    ? computeDirectSellingPrice(form.cost_per_unit)
    : computeDisplayPrice(form.cost_per_unit, form.unit, form.bulkQty);

  const pharmaPcPrice = computeDirectSellingPrice(form.cost_per_unit);

  const pharmaStripPrice =
    Number(form.pcsPerStrip) > 0
      ? computeDirectSellingPrice(
          Number(form.cost_per_unit) * Number(form.pcsPerStrip),
        )
      : 0;

  const pharmaBoxPcs =
    Number(form.pcsPerStrip || 0) * Number(form.stripsPerBox || 0);

  const pharmaBoxPrice =
    pharmaBoxPcs > 0
      ? computeDirectSellingPrice(Number(form.cost_per_unit) * pharmaBoxPcs)
      : 0;

  const effectiveFormBranch = editing
    ? editing.branch
    : !isAdmin
      ? userBranch
      : form.branches.length === 1
        ? form.branches[0]
        : "";
  const canListInShop = isHeadOfficeBranch(effectiveFormBranch);

  useEffect(() => {
    if (!canListInShop && form.listInShop) {
      setForm((f) => ({ ...f, listInShop: false }));
    }
  }, [canListInShop]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.ink }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        div.stock-brand-overview-card {
          display: flex !important;
          flex-direction: column !important;
          align-items: stretch !important;
          justify-content: flex-start !important;
          width: 100% !important;
          min-width: 0 !important;
          max-width: none !important;
          height: auto !important;
          min-height: 148px !important;
          padding: 0 !important;
          gap: 0 !important;
          border-radius: 18px !important;
          white-space: normal !important;
          box-sizing: border-box !important;
        }
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
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))",
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
                const itemIsHeadOffice =
                  String(item.branch || "")
                    .trim()
                    .toLowerCase() === "san juan (head office)".toLowerCase();

                const canManage =
                  (isSuperAdmin || isSalesAdmin) && itemIsHeadOffice;

                setActiveBatchReadOnly(!canManage);
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
            readOnly={activeBatchReadOnly}
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
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 5 }}>
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
                  <label style={invLabelSt}>
                    {isPharmaBrand(form.brand || currentBrandName)
                      ? "Base Inventory Unit *"
                      : "Unit *"}
                  </label>

                  {isPharmaBrand(form.brand || currentBrandName) ? (
                    <>
                      <input
                        style={{
                          ...invInputSt,
                          background: C.bg,
                          cursor: "not-allowed",
                        }}
                        value="pcs"
                        readOnly
                      />

                      <div
                        style={{
                          fontSize: 10,
                          color: C.muted,
                          marginTop: 4,
                          lineHeight: 1.4,
                        }}
                      >
                        iPharma stock is tracked in individual pieces. Strip and
                        Box are derived from the packaging setup below.
                      </div>
                    </>
                  ) : (
                    <select
                      style={invInputSt}
                      value={form.unit}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          unit: e.target.value,
                        }))
                      }
                      required
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  )}
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
                      <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>
                        Cost starts at ₱0.00. Use <strong>Receive Stock</strong>{" "}
                        after saving this item to log a batch.
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
                        style={{ fontSize: 10.5, color: C.muted, marginTop: 3 }}
                      >
                        Cost ÷ 0.35 — 35% product, 45% ops, 20% profit
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

              {isPharmaBrand(form.brand || currentBrandName) && (
                <div
                  style={{
                    padding: 16,
                    border: `1px solid ${C.border}`,
                    borderRadius: 14,
                    background: C.bg,
                    marginTop: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: C.greenDk,
                      marginBottom: 4,
                    }}
                  >
                    Medicine Packaging
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: C.muted,
                      marginBottom: 14,
                    }}
                  >
                    Configure how individual pieces are grouped into strips and
                    boxes. Stock will remain recorded in pieces.
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <div>
                      <label style={invLabelSt}>Pieces per Strip</label>

                      <input
                        type="number"
                        min="1"
                        step="1"
                        style={invInputSt}
                        value={form.pcsPerStrip}
                        placeholder="e.g. 10"
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            pcsPerStrip: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label style={invLabelSt}>Strips per Box</label>

                      <input
                        type="number"
                        min="1"
                        step="1"
                        style={invInputSt}
                        value={form.stripsPerBox}
                        placeholder="e.g. 10"
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            stripsPerBox: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {isPharmaBrand(form.brand || currentBrandName) &&
                Number(form.cost_per_unit) > 0 && (
                  <div
                    style={{
                      marginTop: 12,
                      border: `1px solid ${C.border}`,
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "9px 12px",
                        background: C.bg,
                        fontSize: 11,
                        fontWeight: 800,
                        color: C.greenDk,
                      }}
                    >
                      POS Selling Prices
                    </div>

                    <div
                      style={{
                        padding: 12,
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 10,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 10, color: C.muted }}>Pc</div>
                        <strong>₱{pharmaPcPrice.toFixed(2)}</strong>
                      </div>

                      <div>
                        <div style={{ fontSize: 10, color: C.muted }}>
                          Strip
                        </div>
                        <strong>
                          {form.pcsPerStrip
                            ? `₱${pharmaStripPrice.toFixed(2)}`
                            : "—"}
                        </strong>
                      </div>

                      <div>
                        <div style={{ fontSize: 10, color: C.muted }}>Box</div>
                        <strong>
                          {pharmaBoxPcs ? `₱${pharmaBoxPrice.toFixed(2)}` : "—"}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}

              {isPharmaBrand(form.brand || currentBrandName) &&
                Number(form.pcsPerStrip) > 0 && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: C.greenLt,
                      border: `1px solid ${C.greenMid}`,
                      fontSize: 11,
                      color: C.greenDk,
                      lineHeight: 1.7,
                    }}
                  >
                    <strong>Packaging breakdown</strong>
                    <div>1 Pc = 1 piece</div>

                    <div>1 Strip = {Number(form.pcsPerStrip)} pieces</div>

                    {Number(form.stripsPerBox) > 0 && (
                      <div>
                        1 Box ={" "}
                        {Number(form.pcsPerStrip) * Number(form.stripsPerBox)}{" "}
                        pieces
                      </div>
                    )}
                  </div>
                )}

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
                    calculated from batches. Use <strong>Receive Stock</strong>{" "}
                    on the ingredient row to add stock.
                  </span>
                </div>
              )}
              {canListInShop && (
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
                          gridTemplateColumns: "1fr 1fr 1fr",
                          gap: 12,
                        }}
                      >
                        <div>
                          <label style={invLabelSt}>
                            Bulk Qty per Shop Item
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            style={invInputSt}
                            value={form.bulkQty}
                            placeholder={String(
                              defaultBulkQtyForUnit(form.unit),
                            )}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                bulkQty: e.target.value,
                              }))
                            }
                          />
                          <div
                            style={{
                              fontSize: 10,
                              color: C.muted,
                              marginTop: 4,
                            }}
                          >
                            How many {form.unit} go into one shop item (e.g.
                            1000g per shop-size bag). Leave blank to use the
                            default for this unit.
                          </div>
                        </div>
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
                              ? `₱${previewShopPrice.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : "—"}
                            <span
                              style={{
                                fontSize: 10,
                                color: C.muted,
                                fontWeight: 400,
                              }}
                            >
                              (cost × bulk qty + 15%)
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
              )}
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

            if (freshItem) {
              setFocusMutation({
                item: freshItem,
                stamp: Date.now(),
                reason: "receive",
              });
            }

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
          readOnly={activeBatchReadOnly}
          onRefresh={() => {
            setBatchLoading(true);
            adminModuleFetch(
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
