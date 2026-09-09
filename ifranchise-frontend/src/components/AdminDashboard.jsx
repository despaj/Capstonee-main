

// AdminDashboard — updated from the supplied September 9 file.
  import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
  import { Link, useNavigate } from 'react-router-dom';
  import * as XLSX from 'xlsx';
  import logo from '../assets/logo.png';
  import iFranchise_logo from '../assets/iFranchise_logo.png';
  import ifranchisejpg from '../assets/ifranchisejpg.jpg';
  import franchisync from '../assets/franchisyncjpg.jpg';
  import Receipts from './Receipts';
  import StockInventoryContent from './StockInventoryContent';
  import MenuInventoryContent from './MenuInventoryContent';
  import jsPDF from 'jspdf';
  import html2canvas from "html2canvas";
  import logoIfranchise from "../assets/report/ifranchise-logo.png";
  import logoSync from "../assets/report/franchsync-logo.png";
  import { supabase } from "../supabaseClient";

  import {
    Home, Box, FileText, FileCheck, Users, BarChart2, MessageCircle,
    User, ShoppingCart, LogOut, Search, Package, AlertTriangle,
    DollarSign, Grid3X3, ChevronDown, Plus, Pencil, Trash2, X, Check,
    Building2, Store, TrendingDown, TrendingUp, Layers, GitBranch, DoorOpen, Logout,
    Globe, MapPin, Phone, Mail, Edit2, Archive, Calendar, Pin, Megaphone,
    ArrowUpRight, ArrowDownRight, BarChart, RefreshCw, Eye, Clock, Info,
    Download, History, RotateCcw, UserPlus, CheckCircle, ChevronRight, XIcon, HistoryIcon,
    Lock, Unlock, CheckCircle2, Zap, Target, Activity, ArrowUp, ArrowDown, SearchIcon,
    Brain, PieChart, LineChart, ShieldCheck, Bell, Printer, CalendarClock,
  } from 'lucide-react';

  
  // Shared palette must be initialized before module-level style objects.
  const C = {
    green: "#3b791e", greenDk: "#2c5c16", greenMid: "#c9dba0",
    greenLt: "#f0f5e8", teal: "#509820", lime: "#b3a941",
    ink: "#347022", dark: "#12241B", muted: "#5C6B60",
    border: "#E1E6D8", bg: "#F6F7F1", white: "#ffffff",
    warn: "#b45309", warnBg: "#fff7ed", warnBorder: "#fed7aa",
    ok: "#2c5c16", okBg: "#f0f5e8",
    red: "#c0392b", redBg: "#fdf1f0", redBorder: "#f2c9c4",
  };

  const ADMIN_CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    :root {
      --g1:#bdd43c; --g2:#3b791e; --g3:#2c5c16; --g4:#12241B;
      --green-primary:#3b791e; --green-dark:#2c5c16; --green-light:#509820;
      --lime:#bdd43c; --lime-ink:#24310C; --white:#ffffff;
      --gray-100:#F3F4F1; --gray-200:#E1E6D8; --gray-300:#D4DBC8;
      --gray-400:#9CA89C; --gray-500:#6B7A65; --gray-600:#4B5A45;
      --gray-700:#374132; --gray-800:#1F2A1B;
      --shadow:rgba(50,109,32,0.10); --shadow-strong:rgba(14,59,34,0.20);
      --card-border:#E1E6D8;
      --grad-main:linear-gradient(135deg,#509820,#3b791e);
      --grad-dark:linear-gradient(135deg,#12241B,#2c5c16);
      --grad-gold:linear-gradient(135deg,#e9cd30,#bdd43c);
      --grad-bg:#F6F7F1;
    }

    /* ── Sidebar shell ── */
    .ad-sidebar {
      background:#fff;
      box-shadow: 1px 0 0 #E1E6D8;
      position: fixed;
      top: 0; left: 0; bottom: 0;
      display: flex;
      flex-direction: column;
      padding: 18px 14px;
      overflow-y: auto;
      z-index: 100;
    }

    .ad-sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 6px 18px;
    }

    .ad-logo-mark {
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 15px;
      flex-shrink: 0;
    }

    .ad-brand {
      font-size: 16px;
      white-space: nowrap;
    }

    .ad-toggle {
      background: none;
      border: 1px solid #E1E6D8;
      border-radius: 8px;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #5C6B60;
      flex-shrink: 0;
    }

    /* ── Section labels ("Main Menu" / "Account") ── */
    .ad-nav-section {
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #9CA89C;
      padding: 12px 10px 6px;
    }

    /* ── Nav ── */
    .ad-nav {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .ad-nav-item {
      font-family:'Plus Jakarta Sans',sans-serif;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 12px;
      color: #5C6B60;
      cursor: pointer;
      position: relative;
      font-size: 14px;
      font-weight: 500;
      transition: background .15s ease, color .15s ease;
    }
    .ad-nav-item:hover { background:#F6F7F1; color:#12241B; }
    .ad-nav-item.active {
      background:#F6F7F1;
      color:#2c5c16;
      box-shadow:none;
      font-weight:700;
    }
    .ad-nav-item.active .ad-nav-icon { color:#3b791e; }
    .ad-nav-item.logout { color:#c0392b; }
    .ad-nav-item.logout:hover { background:#fdf1f0; }

    .ad-nav-icon {
      flex-shrink:0;
      display:flex;
      align-items: center;
      justify-content:center;
      width:22px;
      height: 22px;
    }

    .ad-nav-label {
      flex: 1;
      white-space:nowrap;
      overflow:hidden;
      text-overflow:ellipsis;
    }

    .ad-nav-bar {
      position:absolute;
      right:6px;
      top:20%;
      height:60%;
      width:3px;
      border-radius:2px;
      background:#bdd43c;
    }

    /* ── Topbar ── */
    .ad-topbar {
      background:#fff;
      box-shadow:none;
      border-bottom:1px solid #E1E6D8;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 30px;
    }
    .ad-topbar-title { font-family:'Plus Jakarta Sans',sans-serif; color:#12241B; font-size: 22px; font-weight: 800; }
    .ad-avatar {
      background:#12241B; color:#bdd43c; box-shadow:none; border-radius:12px;
      width: 38px; height: 38px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700;
    }
    .ad-user-name { font-weight: 700; font-size: 13px; color: #12241B; text-align: right; }
    .ad-user-role { font-size: 11.5px; color: #5C6B60; text-align: right; }
  `;
  // ─── Shared style helpers ─────────────────────────────────────────────────────
  const invInputSt = {
    height:38, padding:"0 13px", borderRadius:11,
    border:`1.5px solid ${C.border}`, background:"#fff",
    fontSize:13, color:C.ink, outline:"none",
    fontFamily:"inherit", boxSizing:"border-box", width:"100%",
    transition:"border-color .2s ease, box-shadow .2s ease",
  };
  // focus state (wherever :focus is handled via onFocus/onBlur or CSS):
  //   borderColor: C.green, boxShadow:"0 0 0 3px rgba(59,121,30,0.12)"
  const btnSt = {
    display:"inline-flex", alignItems:"center", gap:6,
    height:38, padding:"0 18px", borderRadius:999,
    border:`1.5px solid ${C.border}`, background:C.white,
    fontSize:13, fontWeight:700, cursor:"pointer",
    fontFamily:"inherit", whiteSpace:"nowrap",
    color: C.green,
    transition:"all .2s cubic-bezier(.4,0,.2,1)",
  };
  const btnPrimarySt = {
    ...btnSt,
    background: C.green,
    color:C.white, border:"none",
    boxShadow:"0 10px 24px rgba(59,121,30,0.22)",
  };
  // hover (apply via onMouseEnter/Leave exactly as existing code already does):
  //   primary hover -> background:"#509820"
  //   ghost hover   -> borderColor:C.green, background:"#fbfdf6"
  const smallBtnSt = {
    display:"inline-flex", alignItems:"center", gap:4,
    height:28, padding:"0 12px", borderRadius:999,
    fontSize:12, fontWeight:600, cursor:"pointer",
    fontFamily:"inherit", background:C.white, border:`1px solid ${C.border}`,
  };
  const bmActionBtn = (variant = "default") => ({
    display:"inline-flex", alignItems:"center", gap:5,
    padding:"8px 20px", borderRadius:999, fontSize:13, fontWeight:700,
    cursor:"pointer", fontFamily:"inherit", border:"none",
    ...(variant === "primary"
      ? { background:C.green, color:"#fff", boxShadow:"0 10px 20px rgba(59,121,30,0.22)" }
      : variant === "danger"
      ? { background:"#fdf1f0", color:"#c0392b", border:`1px solid #f2c9c4` }
      : { background:"#F6F7F1", color:C.greenDk, border:`1.5px solid ${C.border}` }),
  });
  const fmtPeso = n => "₱" + Number(n||0).toLocaleString("en-PH", { minimumFractionDigits:2, maximumFractionDigits:2 });
  const fmtTs   = d => new Date(d).toLocaleString("en-PH", { month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit" });

  const TrashIcon = ({ size=14, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;

  const ActivityIcon = ({ size=14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  );

  const BmSection = ({ children, style = {} }) => (
    <div style={{
      background: C.white, border: `1px solid rgba(0,168,76,0.12)`,
      borderRadius: 18, boxShadow: "0 2px 14px rgba(0,140,60,0.07)",
      overflow: "hidden", marginBottom: 24, ...style,
    }}>
      {children}
    </div>
  );

  const BmSectionHeader = ({ title, subtitle, action }) => (
    <div style={{
      background: `linear-gradient(135deg,#2E7D32,#00897b)`,
      color: C.white, padding: "16px 22px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div>
        <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.3px" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {action && <div style={{ display: "flex", gap: 8 }}>{action}</div>}
    </div>
  );

  const BmStatCard = ({ label, value, sub, icon, bg }) => (
    <div style={{
      background: C.white, border: `1px solid rgba(0,168,76,0.12)`,
      borderRadius: 18, padding: "20px 22px",
      boxShadow: "0 2px 14px rgba(0,140,60,0.07)",
      transition: "transform .2s, box-shadow .2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,140,60,0.13)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 14px rgba(0,140,60,0.07)"; }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#5a7a65", marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0d2b1e" }}>{value}</div>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 13, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {icon}
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#5a7a65" }}>{sub}</span>
    </div>
  );

  const bmInput = {
    width: "100%", padding: "9px 12px", borderRadius: 10,
    border: "1.5px solid #b2dfdb", fontSize: 13, color: "#0d2b1e",
    background: "#f0fdf5", fontFamily: "inherit", outline: "none",
    boxSizing: "border-box",
  };
  const bmLabel = {
    display: "block", fontSize: 11, fontWeight: 800, color: "#2e6725",
    marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.07em",
  };

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
        if (
          wrapRef.current &&
          !wrapRef.current.contains(e.target)
        ) {
          setOpen(false);
        }
      };

      document.addEventListener("mousedown", handler);

      return () =>
        document.removeEventListener("mousedown", handler);
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
        const previousCount =
          previousCountsRef.current[n.id] || 0;

        const currentCount =
          n.count || 0;

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
          ])
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

    const visibleNotifications = (Array.isArray(notifications) ? notifications : [])
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
      0
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
              <liveNotif.icon
                size={19}
                strokeWidth={2.2}
                color="#2E7D32"
              />
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

                    border:
                      "1px solid #B9DDBF",

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

              border: `1px solid ${
                open
                  ? "#2E7D32"
                  : "#B9DDBF"
              }`,

              background: open
                ? "#E8F5EA"
                : "#EDF7EF",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              cursor: "pointer",

              transition:
                "all .2s ease",

              boxShadow: open
                ? "0 4px 14px rgba(46,125,50,.14)"
                : "0 2px 8px rgba(46,125,50,.07)",

              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor =
                "#2E7D32";

              e.currentTarget.style.background =
                "#E8F5EA";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor =
                open
                  ? "#2E7D32"
                  : "#B9DDBF";

              e.currentTarget.style.background =
                open
                  ? "#E8F5EA"
                  : "#EDF7EF";
            }}
          >
            <Bell
              size={19}
              color="#2E7D32"
              strokeWidth={2.1}
            />

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

                  background:
                    "linear-gradient(135deg,#ef4444,#dc2626)",

                  color: "#fff",

                  fontSize: 10,
                  fontWeight: 800,

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  border: "2px solid #fff",

                  fontFamily:
                    "'Plus Jakarta Sans',sans-serif", //dito

                  boxShadow:
                    "0 2px 6px rgba(220,38,38,.22)",
                }}
              >
                {totalCount > 99
                  ? "99+"
                  : totalCount}
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

                top:
                  "calc(100% + 10px)",

                right: 0,

                width: 370,

                height: 430,

                maxWidth:
                  "calc(100vw - 30px)",

                background: "#fff",

                borderRadius: 13,

                border:
                  "1px solid #C7E0CB",

                boxShadow:
                  "0 18px 45px rgba(15,23,42,.15)",

                overflow: "hidden",

                zIndex: 3000,

                fontFamily:
                  "'Plus Jakarta Sans',sans-serif",

                display: "flex",
                flexDirection: "column",

                animation:
                  "franchisyncDropdown .22s ease-out",
              }}
            >
              {/* HEADER */}

              <div
                style={{
                  padding: "15px 18px",

                  background:
                    "linear-gradient(135deg,#256529,#2E7D32)",

                  display: "flex",

                  justifyContent:
                    "space-between",

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

                      color:
                        "rgba(255,255,255,.78)",

                      marginTop: 3,
                    }}
                  >
                    {totalCount > 0
                      ? `${totalCount} ${
                          totalCount !== 1
                            ? "notifications"
                            : "notification"
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

                    border:
                      "1px solid rgba(255,255,255,.45)",

                    background:
                      "rgba(255,255,255,.15)",

                    color: "#fff",

                    cursor: "pointer",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    flexShrink: 0,

                    transition:
                      "all .2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "#fff";

                    e.currentTarget.style.color =
                      "#2E7D32";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255,255,255,.15)";

                    e.currentTarget.style.color =
                      "#fff";
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
                {loading &&
                notifications.length === 0 ? (
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

                        animation:
                          "notificationSpin .8s linear infinite",
                      }}
                    />

                    <div>
                      Loading notifications...
                    </div>
                  </div>
                ) : visibleNotifications.length ===
                  0 ? (
                  /* EMPTY */

                  <div
                    style={{
                      padding:
                        "45px 20px",

                      textAlign:
                        "center",
                    }}
                  >
                    <div
                      style={{
                        width: 46,
                        height: 46,

                        borderRadius: 10,

                        background:
                          "#EDF7EF",

                        border:
                          "1px solid #B9DDBF",

                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",

                        margin:
                          "0 auto 11px",
                      }}
                    >
                      <Check
                        size={20}
                        color="#2E7D32"
                      />
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
                  visibleNotifications.map(
                    (n, index) => (
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

                          padding:
                            "14px 18px",

                          cursor:
                            "pointer",

                          borderBottom:
                            index !==
                            visibleNotifications.length -
                              1
                              ? "1px solid #EEF3EF"
                              : "none",

                          alignItems:
                            "flex-start",

                          background:
                            "#fff",

                          transition:
                            "background .18s ease, transform .18s ease",
                        }}
                        onMouseEnter={(
                          e
                        ) => {
                          e.currentTarget.style.background =
                            "#F5FAF6";

                          e.currentTarget.style.transform =
                            "translateX(2px)";
                        }}
                        onMouseLeave={(
                          e
                        ) => {
                          e.currentTarget.style.background =
                            "#fff";

                          e.currentTarget.style.transform =
                            "translateX(0)";
                        }}
                      >
                        {/* ICON */}

                        <div
                          style={{
                            width: 38,
                            height: 38,

                            borderRadius: 9,

                            // Uniform FranchiSync icon style
                            background:
                              "#EDF7EF",

                            border:
                              "1px solid #B9DDBF",

                            display: "flex",

                            alignItems:
                              "center",

                            justifyContent:
                              "center",

                            flexShrink: 0,
                          }}
                        >
                          <n.icon
                            size={17}
                            strokeWidth={2}
                            color="#2E7D32"
                          />
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

                              justifyContent:
                                "space-between",

                              alignItems:
                                "flex-start",

                              gap: 8,
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 700,

                                fontSize: 12.75,

                                color:
                                  "#243128",

                                lineHeight: 1.4,

                                overflow:
                                  "hidden",

                                textOverflow:
                                  "ellipsis",

                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {n.title}
                            </span>

                            {n.count > 0 && (
                              <span
                                style={{
                                  flexShrink:
                                    0,

                                  minWidth:
                                    22,

                                  height: 21,

                                  padding:
                                    "0 6px",

                                  borderRadius:
                                    6,

                                  display:
                                    "flex",

                                  alignItems:
                                    "center",

                                  justifyContent:
                                    "center",

                                  fontSize:
                                    10,

                                  fontWeight:
                                    800,

                                  lineHeight:
                                    1,

                                  background:
                                    "#EDF7EF",

                                  color:
                                    "#2E7D32",

                                  border:
                                    "1px solid #B9DDBF",

                                  boxSizing:
                                    "border-box",
                                }}
                              >
                                {n.unreadCount >
                                99
                                  ? "99+"
                                  : n.unreadCount}
                              </span>
                            )}
                          </div>

                          <div
                            style={{
                              fontSize: 11.75,

                              color:
                                "#65736A",

                              marginTop: 4,

                              lineHeight:
                                1.45,
                            }}
                          >
                            {n.message}
                          </div>
                        </div>
                      </div>
                    )
                  )
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

  //////here dito wonwoo

  export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeModule, setActiveModule] = useState(() => {
      return sessionStorage.getItem('fr_activeModule') || 'dashboard';
    });
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
    const [showViewApplicationModal, setShowViewApplicationModal] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [preset, setPreset] = useState("month");
    const [stats, setStats] = useState(null);
    
    const [activityLog,     setActivityLog]     = useState([]);
    
    const [appDeleteHistory,     setAppDeleteHistory]     = useState([]);
    const handleLogout = () => setShowLogoutModal(true);
    const [transactions, setTransactions] = useState([]);
    const [searchQuery, setSearchQuery]     = useState("");
    const [inventoryFocus, setInventoryFocus] = useState(null);

    const getUserFromStorage = () => {
      const userString =
        localStorage.getItem('user') ||
        localStorage.getItem('rememberedUser') ||
        sessionStorage.getItem('user');
      if (userString) return JSON.parse(userString);
      return null;
    };

    const fetchAppDeleteHistory = async () => {
      try {
        const res  = await fetch(`${process.env.REACT_APP_API_URL}/application-delete-history`);
        const data = await res.json();
        const mapped = Array.isArray(data)
          ? data.map(row => ({
              id:        row.id,
              data:      row.application_data ?? row.data ?? {},
              deletedAt: row.deleted_at       ?? row.deletedAt,
            }))
          : [];
        setAppDeleteHistory(mapped);
      } catch (err) {
        console.error("Failed to fetch application delete history:", err);
      }
    };

    const fetchActivityLog = useCallback(async () => {
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/orders-activity-log`);
      const data = await res.json();
      setActivityLog(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Failed to fetch orders activity log:", err); }
  }, []);

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
        const stored = localStorage.getItem("user") || sessionStorage.getItem("user");
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
        setIsLoggingOut(false);
        setShowLogoutModal(false);
        window.location.href = "/admin-login";
      }
    };

    useEffect(() => {
      sessionStorage.setItem('fr_activeModule', activeModule);
    }, [activeModule]);

    useEffect(() => {
      fetch(`${process.env.REACT_APP_API_URL}/dashboard/stats?preset=${preset}`)
        .then(res => res.json()).then(data => setStats(data)).catch(err => console.error(err));
    }, [preset]);

    useEffect(() => {
      fetch(`${process.env.REACT_APP_API_URL}/transactions`)
        .then(res => res.json()).then(data => setTransactions(data))
        .catch(err => console.error("Failed to fetch transactions", err));
    }, []);

    const [user, setUser] = useState(getUserFromStorage);

    useEffect(() => {
      const currentUser = getUserFromStorage();
      if (!currentUser) navigate('/admin-login');
      else setUser(currentUser);
    }, []);

    const [brands, setBrands] = useState([]);
    useEffect(() => {
      fetch(`${process.env.REACT_APP_API_URL}/brands`)
        .then(res => res.json())
        .then(data => setBrands(Array.isArray(data) ? data : []))
        .catch(err => console.error("Failed to fetch brands:", err));
    }, []);
      const [notifications, setNotifications] = useState([]);
      const [notifLoading,  setNotifLoading]  = useState(false);

  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);

    try {
      const [appsRes, reportsRes, ingredientsRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/applications`),
        fetch(`${process.env.REACT_APP_API_URL}/reports?status=submitted`),
        // Use the exact same source as Head Office Inventory.
        fetch(`${process.env.REACT_APP_API_URL}/ingredients`),
      ]);

      const apps = appsRes.ok ? await appsRes.json() : [];
      const reports = reportsRes.ok ? await reportsRes.json() : [];
      const ingredients = ingredientsRes.ok ? await ingredientsRes.json() : [];

      const pendingApps = Array.isArray(apps)
        ? apps.filter(a => String(a.status || "").toLowerCase() === "pending")
        : [];

      const pendingReports = Array.isArray(reports) ? reports : [];

      // Keep this aligned with Head Office Inventory's low-stock rule.
      const lowStockItems = Array.isArray(ingredients)
        ? ingredients.filter(item => Number(item?.stock ?? 0) <= Number(item?.min_stock ?? 0))
        : [];

      const items = [];

      if (pendingApps.length > 0) {
        items.push({
          id: "applications",
          module: "applications",
          title: "Pending Applications",
          message: `${pendingApps.length} application${pendingApps.length !== 1 ? "s" : ""} awaiting review`,
          count: pendingApps.length,
          icon: FileCheck,
          bg: "#f0f5e8",
          color: "#3b791e",
          border: "#c9dba0",
        });
      }

      if (pendingReports.length > 0) {
        items.push({
          id: "reports",
          module: "reports",
          title: "Reports Under Review",
          message: `${pendingReports.length} report${pendingReports.length !== 1 ? "s" : ""} waiting for approval`,
          count: pendingReports.length,
          icon: FileText,
          bg: "#f0f5e8",
          color: "#3b791e",
          border: "#c9dba0",
        });
      }

      if (lowStockItems.length > 0) {
        // Group by brand + branch so the notification list stays readable.
        const grouped = {};

        lowStockItems.forEach(item => {
          const brandName = item.brand || "Unknown Brand";
          const branchName = item.branch || "Head Office";
          const key = `${brandName}|${branchName}`;

          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(item);
        });

        Object.entries(grouped).forEach(([key, groupItems]) => {
          const [brandName, branchName] = key.split("|");

          // Include units in the preview so the user knows how each item is measured.
          const preview = groupItems
            .slice(0, 3)
            .map(item => `${item.name || "Unnamed Product"} (${item.unit || "units"})`)
            .join(", ");

          let stockMessage;
          if (groupItems.length === 1) {
            stockMessage = `${preview} is running low.`;
          } else if (groupItems.length <= 3) {
            stockMessage = `${preview} are running low.`;
          } else {
            stockMessage = `${preview} and ${groupItems.length - 3} more are running low.`;
          }

          items.push({
            id: `head-office-low-stock-${brandName}-${branchName}`,
            module: "stockInventory",
            title: `${brandName} — Low Stock`,
            // Keep push/live notification concise. Full per-item quantities are inside Head Office Inventory.
            message: `${stockMessage} Suggested restock: View more inside items.`,
            count: groupItems.length,
            icon: AlertTriangle,
            bg: "#fffdf3",
            color: "#3b791e",
            border: "#bdd43c",
            suggestion: "Suggested restock: View more inside items.",
            lowStockItems: groupItems,
            navParams: {
              brand: brandName,
              branch: branchName,
              filterLowStock: true,
            },
          });
        });
      }

      setNotifications(items);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setNotifications([]);
    } finally {
      setNotifLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications, user?.id]);
    const [applications, setApplications] = useState([]);
    useEffect(() => {
    fetchApplications();
    fetchAppDeleteHistory();
    fetchActivityLog();
  }, [fetchActivityLog]);

    const fetchApplications = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/applications`);
        const data = await response.json();
        setApplications(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching applications:', error);
        alert('Failed to load applications');
      }
    };

    const handleDeleteApplication = async (id) => {
      if (window.confirm('Are you sure you want to delete this application?')) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/applications/${id}`, { method: 'DELETE' });
          const data = await response.json();
          if (data.success) {
            setApplications(applications.filter(app => app.id !== id));
            alert('Application deleted successfully!');
          } else alert(data.error || 'Failed to delete application');
        } catch (error) {
          console.error('Error deleting application:', error);
          alert('Failed to delete application');
        }
      }
    };

    const handleApproveApplication = async (id) => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/applications/${id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'approved' }),
        });
        const data = await response.json();
        if (data.success) {
          setApplications(applications.map(app => app.id === id ? { ...app, status: 'approved' } : app));
          alert('Application approved successfully!');
        } else alert(data.error || 'Failed to approve application');
      } catch (error) {
        console.error('Error approving application:', error);
        alert('Failed to approve application');
      }
    };

    const navigation = [
      { id: 'dashboard',      label: 'Dashboard',            icon: <Home size={20} />,         section: 'main' },
      { id: 'reports',        label: 'Sales & Reports',       icon: <BarChart2 size={20} />,    section: 'main' },
      { id: 'stockInventory', label: 'Stock Inventory',       icon: <Layers size={20} />,       section: 'main' },
      { id: 'inventory',      label: 'Product Catalogue',        icon: <Box size={20} />,          section: 'main' },
      { id: 'mobileShop',     label: 'Mobile Shop Supplies',  icon: <ShoppingCart size={20} />, section: 'main' },
      { id: 'mobileOrders',   label: 'Mobile Order Management',    icon: <Package size={20} />,      section: 'main' },
      { id: 'applications',   label: 'Franchisee Applications',     icon: <FileCheck size={20} />,    section: 'main' },
      { id: 'brandBranch',    label: 'Brands & Branches Management',        icon: <GitBranch size={20} />,    section: 'main' },
  
      { id: 'communication',  label: 'Announcements',         icon: <MessageCircle size={20} />,section: 'main' },
      { id: 'activityLog', label: 'System Activity Logs', icon: <Activity size={20} />, section: 'main' },
      { id: 'users',          label: 'User Management',       icon: <Users size={20} />,        section: 'main' },
      { id: 'profile',        label: 'Profile Settings',          icon: <User size={20} />,         section: 'account' },
      { id: 'logout',         label: 'Logout',                icon: <LogOut size={20} />,       section: 'account', action: handleLogout },
    ];

    const mainNav    = navigation.filter(n => n.section === 'main');
    const accountNav = navigation.filter(n => n.section === 'account');

    const handleCreateAccount   = (applicant) => { setSelectedApplicant(applicant); setShowCreateAccountModal(true); };
    const handleViewApplication = (applicant) => { setSelectedApplicant(applicant); setShowViewApplicationModal(true); };

    const moduleLabel = navigation.find(n => n.id === activeModule)?.label || 'Dashboard';

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    return (
      <div className="admin-dashboard-root">
        <style>{ADMIN_CSS}{`
          .admin-dashboard-root {
      font-family:'Plus Jakarta Sans',sans-serif;
      display:flex; min-height:100vh;
      background: #F6F7F1;
      background-image: radial-gradient(#E1E6D8 1px, transparent 1px);
      background-size: 22px 22px;
    }
    .ad-sidebar {
      width:${sidebarCollapsed ? '76px' : '272px'};
      transition: width 0.3s ease;
    }
    .ad-main {
      flex: 1;
      min-width: 0;
      margin-left:${sidebarCollapsed ? '76px' : '272px'};
      transition: margin-left 0.3s ease;
    }
      .ad-content {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px 30px 40px;
      box-sizing: border-box;
    }
  .ad-logo-mark {
    background: #12241B;           /* dark chip, not gradient */
    color:#bdd43c;
    box-shadow:none;
    border-radius:10px;
  }
  .ad-brand { font-family:'Plus Jakarta Sans',sans-serif; color:#12241B; font-weight:800; }
  .ad-nav-item {
    font-family:'Plus Jakarta Sans',sans-serif;
    border-radius:12px;
    color:#5C6B60;
  }
  .ad-nav-item:hover { background:#F6F7F1; color:#12241B; }
  .ad-nav-item.active {
    background:#F6F7F1;
    color:#2c5c16;
    box-shadow:none;                /* remove the inset ring */
    font-weight:700;
  }
  .ad-nav-item.active .ad-nav-icon { color:#3b791e; }
  .ad-nav-bar {
    background:#bdd43c;             /* lime active-rail, not gradient */
    width:3px;
  }
  .ad-nav-item.logout { color:#c0392b; }
  .ad-nav-item.logout:hover { background:#fdf1f0; }
          .ad-nav-icon { flex-shrink:0; display:flex; justify-content:center; width:22px; }
          .ad-nav-label {
            display:${sidebarCollapsed ? 'none' : 'block'};
            white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
          }
          .ad-nav-bar {
            position:absolute; right:0; top:20%; height:60%;
            width:3px; border-radius:2px; background:var(--grad-main);
          }
          .ad-main {
            flex:1;
            margin-left:${sidebarCollapsed ? '76px' : '272px'};
            transition:margin-left 0.3s ease;
          }
          
      .ad-topbar {
    width:100%;
    background:#fff;
    backdrop-filter:none;
    box-shadow:none;
    border-bottom:1px solid #E1E6D8;
    box-sizing:border-box;
  }
  .ad-topbar-title { font-family:'Plus Jakarta Sans',sans-serif; color:#12241B; }
  .ad-avatar { background:#12241B; color:#bdd43c; box-shadow:none; border-radius:12px; }
        `}</style>


      {/* ── SIDEBAR ── */}
      <aside className="ad-sidebar">
        <div className="ad-sidebar-header">
          {!sidebarCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src={logoSync} alt="FranchiSync" style={{ height: 50, width: 'auto', objectFit: 'contain' }} />
            </div>
          )}
          {sidebarCollapsed && (
            <img src={logoIfranchise} alt="iFranchise" style={{ height: 35, width: '10', objectFit: 'contain', margin: '10 auto', display: 'block' }} />
          )}
          {!sidebarCollapsed && (
            <button className="ad-toggle" onClick={() => setSidebarCollapsed(true)}>
              <X size={16} />
            </button>
          )}
        </div>

        {sidebarCollapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
            <button className="ad-toggle" onClick={() => setSidebarCollapsed(false)}>
              <ChevronRight size={16} />
            
            </button>
          </div>
      
        )}
      <nav className="ad-nav">
    {!sidebarCollapsed && <div className="ad-nav-section">Main Menu</div>}
    {mainNav.map(item => (
      <div
        key={item.id}
        className={`ad-nav-item${activeModule === item.id ? ' active' : ''}`}
        onClick={() => item.action ? item.action() : setActiveModule(item.id)}
      >
        <span className="ad-nav-icon">{item.icon}</span>
        <span className="ad-nav-label">{item.label}</span>
        {activeModule === item.id && <span className="ad-nav-bar" />}
      </div>
    ))}
    {!sidebarCollapsed && (
      <div className="ad-nav-section" style={{ marginTop: 8 }}>Account</div>
    )}
    {accountNav.map(item => (
      <div
        key={item.id}
        className={`ad-nav-item${item.id === 'logout' ? ' logout' : ''}${activeModule === item.id ? ' active' : ''}`}
        onClick={() => item.action ? item.action() : setActiveModule(item.id)}
      >
        <span className="ad-nav-icon">{item.icon}</span>
        <span className="ad-nav-label">{item.label}</span>
      </div>
    ))}
  </nav>
      </aside>

        {/* ── MAIN ── */}
        <main className="ad-main">
          <div className="ad-topbar">
            <div>
            
              <h1 className="ad-topbar-title">{moduleLabel}</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NotificationBell
              notifications={notifications}
              loading={notifLoading}
              onRefresh={fetchNotifications}
              onNavigate={(notification) => {
              setActiveModule(notification.module);
              if (notification.navParams) {
                setInventoryFocus({
                  brand: notification.navParams.brand,
                  branch: notification.navParams.branch,
                  lowStockOnly: notification.navParams.filterLowStock,
                });
              }
              }}
            />
              <div style={{ textAlign: 'right' }}>
                <div className="ad-user-name">{user?.name}</div>
                <div className="ad-user-role">Super Admin — {user?.branch}</div>
              </div>
              <div className="ad-avatar">
                {user?.name ? user.name.trim()[0].toUpperCase() : 'A'}
              </div>
            </div>
          </div>

          <div className="ad-content">
            {activeModule === 'dashboard'      && <DashboardContent transactions={transactions} brands={brands} user={user} />}
            {activeModule === 'activityLog' && <ActivityLogContent user={user} />}
            {activeModule === 'inventory'      && <MenuInventoryContent user={user} brands={brands} />}
            {activeModule === 'stockInventory' && <StockInventoryContent user={user} brands={brands}  initialFocus={inventoryFocus}/>}
            {activeModule === 'mobileShop'     && <MobileShopContent user={user} brands={brands}/>}
            {activeModule === 'mobileOrders'   && <MobileOrdersContent user={user} brands={brands}/>}
            {activeModule === 'receipts'       && <Receipts />}
            {activeModule === 'applications'   && (
              <ApplicationsContent
                user={user} brands={brands}
                applications={applications}
                onRefresh={fetchApplications}
                onView={handleViewApplication}
                onDelete={handleDeleteApplication}
                onApprove={handleApproveApplication}
                onCreateAccount={handleCreateAccount}
              />
            )}
            {activeModule === 'users'         && <UsersContent user={user} brands={brands} />}
            {activeModule === 'reports'       && <ReportsContent user={user} brands={brands} />}
            {activeModule === 'communication' && <CommunicationContent user={user} brands={brands}/>}
            {activeModule === 'brandBranch'   && <BrandManagementContent user={user} brands={brands} onBrandsChange={setBrands} />} 
            {activeModule === 'profile'       && <ProfileContent user={user} />}
          </div>
        </main>

        {showCreateAccountModal && (
          <CreateAccountModal
            applicant={selectedApplicant}
            onClose={() => { setShowCreateAccountModal(false); setSelectedApplicant(null); }}
          />
        )}

        {showLogoutModal && (
          <div
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:3000, backdropFilter:'blur(4px)' }}
            onClick={() => { if (!isLoggingOut) setShowLogoutModal(false); }}
          >
            <div
              style={{ background:C.white, borderRadius:22, padding:'32px 36px', maxWidth:400, width:'90%', textAlign:'center', boxShadow:'0 24px 80px rgba(0,0,0,0.25)', border:'1px solid rgba(0,168,76,0.15)', animation:'slideUp .25s ease' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ width:68, height:68, borderRadius:20, background:'linear-gradient(135deg,rgba(239,68,68,0.12),rgba(220,38,38,0.08))', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', border:'1.5px solid rgba(239,68,68,0.15)' }}>
                <LogOut size={28} color="#dc2626" strokeWidth={1.75} />
              </div>
              <h2 style={{ fontFamily:'Montserrat,sans-serif', fontSize:20, fontWeight:800, color:'#0d2b1e', marginBottom:8 }}>Log out?</h2>
              <p style={{ color:'#94a3b8', fontSize:13, marginBottom:28, lineHeight:1.6, fontFamily:'Poppins,sans-serif' }}>
                You'll need to sign in again to access your account.
              </p>
              <div style={{ display:'flex', gap:10 }}>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  disabled={isLoggingOut}
                  style={{ flex:1, padding:'11px 0', borderRadius:12, border:'1.5px solid #b2dfdb', background:'#f0fdf5', color:'#5a7a65', fontSize:13, fontWeight:700, cursor: isLoggingOut ? 'not-allowed' : 'pointer', fontFamily:'Montserrat,sans-serif', opacity: isLoggingOut ? 0.5 : 1 }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  disabled={isLoggingOut}
                  style={{ flex:1, padding:'11px 0', borderRadius:12, border:'none', background:'linear-gradient(135deg,#ef4444,#dc2626)', color:'#fff', fontSize:13, fontWeight:800, cursor: isLoggingOut ? 'not-allowed' : 'pointer', fontFamily:'Montserrat,sans-serif', boxShadow:'0 4px 14px rgba(239,68,68,.25)', display:'flex', alignItems:'center', justifyContent:'center', gap:7, opacity: isLoggingOut ? 0.85 : 1 }}
                >
                  {isLoggingOut
                    ? <><RefreshCw size={14} style={{ animation:'spin .8s linear infinite' }} /> Logging out…</>
                    : <><LogOut size={14} /> Log out</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {showViewApplicationModal && (
          <ViewApplicationModal
            application={selectedApplicant}
            onClose={() => { setShowViewApplicationModal(false); setSelectedApplicant(null); }}
          />
        )}

        <style>{`
          @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
          @keyframes spin { to{transform:rotate(360deg)} }
        `}</style>
      </div>
    );
  }

  const PAGE_SIZE = 20;

  const ACTION_META = {
    create:  { color: '#00695c', bg: '#e0f2f1', label: 'Create',  dot: '#00897b' },
    update:  { color: '#1565c0', bg: '#e3f2fd', label: 'Update',  dot: '#1e88e5' },
    delete:  { color: '#c62828', bg: '#ffebee', label: 'Delete',  dot: '#e53935' },
    restore: { color: '#6a1b9a', bg: '#f3e5f5', label: 'Restore', dot: '#8e24aa' },
    hide:    { color: '#5d4037', bg: '#efebe9', label: 'Hide',    dot: '#795548' },
    show:    { color: '#2e7d32', bg: '#e8f5e9', label: 'Show',    dot: '#43a047' },
    approve: { color: '#2e7d32', bg: '#e8f5e9', label: 'Approve', dot: '#43a047' },
    reject:  { color: '#bf360c', bg: '#fbe9e7', label: 'Reject',  dot: '#e64a19' },
    login:   { color: '#00695c', bg: '#e0f2f1', label: 'Login',   dot: '#00897b' },
    logout:  { color: '#5d4037', bg: '#efebe9', label: 'Logout',  dot: '#795548' },
    export:  { color: '#1565c0', bg: '#e3f2fd', label: 'Export',  dot: '#1e88e5' },
    print:   { color: '#37474f', bg: '#eceff1', label: 'Print',   dot: '#546e7a' },
    view:    { color: '#00695c', bg: '#e0f2f1', label: 'View',    dot: '#00897b' },
    import:  { color: '#6a1b9a', bg: '#f3e5f5', label: 'Import',  dot: '#8e24aa' },
  };

  const MODULES = [
    'Brand & Branch', 'User Management', 'Applications', 'Menu Inventory',
    'Stock Inventory', 'Mobile Shop', 'Reports', 'Announcements', 'Profile', 'Auth',
  ];

  const fmtRelative = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60000)    return 'Just now';
    if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(iso).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const fmtFull = (iso) =>
    new Date(iso).toLocaleString('en-PH', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });

  function StatCard({ label, value, sub, icon: Icon }) {
    return (
      <div
        style={{
          background:"#fff", border:`1px solid ${C.border}`,
          borderRadius:20, padding:"20px 22px",
          boxShadow:"0 2px 10px rgba(50,109,32,0.05)",
          transition:"transform .3s cubic-bezier(.4,0,.2,1), box-shadow .3s ease",
        }}
        onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 16px 32px rgba(50,109,32,0.12)"; }}
        onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 2px 10px rgba(50,109,32,0.05)"; }}
      >
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
          <div>
            <div style={{ fontSize:10.5, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.09em", color:C.muted, marginBottom:6 }}>{label}</div>
            <div style={{ fontSize:26, fontWeight:800, color:C.ink, letterSpacing:"-0.02em" }}>{value}</div>
          </div>
          <div style={{ width:42, height:42, borderRadius:12, background:C.ink, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon size={19} color={C.lime} />
          </div>
        </div>
        <div style={{ fontSize:11.5, color:C.muted, fontWeight:500 }}>{sub}</div>
      </div>
    );
  }
  /* ── Pill badge with a small status dot ── */
  function ActionBadge({ action }) {
    const m = ACTION_META[action] || { color: C.muted, bg: C.bg, label: action, dot: C.muted };
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 10px 3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
        background: m.bg, color: m.color, whiteSpace: 'nowrap',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot, flexShrink: 0 }} />
        {m.label}
      </span>
    );
  }

  /* ── Modern segmented pagination ── */
  function LogPagination({ page, totalPages, onChange }) {
    if (totalPages <= 1) return null;
    const pageBtn = (active, disabled) => ({
      minWidth: 32, height: 32, padding: '0 8px', borderRadius: 9,
      border: `1px solid ${active ? 'transparent' : C.border}`,
      background: active ? 'linear-gradient(135deg,#00c853,#00897b)' : C.white,
      color: active ? '#fff' : disabled ? '#cbd5c9' : C.ink,
      fontSize: 12.5, fontWeight: active ? 800 : 600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: FONT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: active ? '0 3px 10px rgba(0,180,90,0.28)' : 'none',
      transition: 'transform .12s ease, box-shadow .12s ease, background .12s ease',
    });
    const pages = Array.from({ length: totalPages }, (_, i) => i).filter(i => Math.abs(i - page) <= 2 || i === 0 || i === totalPages - 1);
    const withGaps = [];
    pages.forEach((p, idx) => {
      if (idx > 0 && p - pages[idx - 1] > 1) withGaps.push('gap');
      withGaps.push(p);
    });
    return (
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <button
          onClick={() => onChange(Math.max(0, page - 1))}
          disabled={page === 0}
          style={pageBtn(false, page === 0)}
          onMouseEnter={e => { if (page !== 0) e.currentTarget.style.background = C.greenLt; }}
          onMouseLeave={e => { if (page !== 0) e.currentTarget.style.background = C.white; }}
        >
          ‹
        </button>
        {withGaps.map((p, i) =>
          p === 'gap' ? (
            <span key={`gap-${i}`} style={{ width: 20, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>···</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              style={pageBtn(p === page, false)}
              onMouseEnter={e => { if (p !== page) e.currentTarget.style.background = C.greenLt; }}
              onMouseLeave={e => { if (p !== page) e.currentTarget.style.background = C.white; }}
            >
              {p + 1}
            </button>
          )
        )}
        <button
          onClick={() => onChange(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}
          style={pageBtn(false, page >= totalPages - 1)}
          onMouseEnter={e => { if (page < totalPages - 1) e.currentTarget.style.background = C.greenLt; }}
          onMouseLeave={e => { if (page < totalPages - 1) e.currentTarget.style.background = C.white; }}
        >
          ›
        </button>
      </div>
    );
  }
  // ─── Dashboard-specific constants ────────────────────────────────────────────
  const fmtAmt   = (n) => "₱" + Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtShort = (n) => { if (n >= 1_000_000) return "₱" + (n / 1_000_000).toFixed(1) + "M"; if (n >= 1_000) return "₱" + (n / 1_000).toFixed(0) + "k"; return "₱" + Number(n).toFixed(0); };
  const fmtPeso1  = (n) => "₱" + Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const fmt8     = (d) => d.toISOString().slice(0, 10);
  const FONT = "'Plus Jakarta Sans', sans-serif";
  const PAL      = ["#00c853","#00897b","#26a69a","#43a047","#66bb6a","#f59e0b","#1d4ed8","#7c3aed","#db2777","#ea580c"];

  function ComboChart({ barData = [], lineData = [], labels = [], height = 200 }) {
    const [tip, setTip] = useState(null);
    const ref = useRef(null);
    const W = 700, H = height, PL = 56, PR = 48, PT = 16, PB = 32;
    const pW = W - PL - PR, pH = H - PT - PB;
    const barSeries = Array.isArray(barData[0]) ? barData : [barData];
    const maxBar  = Math.max(...barSeries.flat(), 1) * 1.2;
    const maxLine = Math.max(...(lineData || []), 1) * 1.2;
    const minLine = Math.min(...(lineData || []), 0);
    const n = labels.length;
    const bW = Math.min(22, (pW / Math.max(n, 1)) - 6);

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
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({ y: PT + pH * (1 - t), label: fmtShort(t * maxBar) }));

    const handleMove = (e) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * W;
      let best = 0, bestD = Infinity;
      labels.forEach((_, i) => {
        const x = PL + (i / Math.max(n - 1, 1)) * pW;
        const d = Math.abs(x - mx);
        if (d < bestD) { bestD = d; best = i; }
      });
      setTip({ i: best, x: PL + (best / Math.max(n - 1, 1)) * pW, label: labels[best] });
    };

    return (
      <div style={{ position: "relative", cursor: "crosshair" }} onMouseMove={handleMove} onMouseLeave={() => setTip(null)}>
        <svg ref={ref} style={{ width: "100%", display: "block", overflow: "visible" }} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <defs>
            {barSeries.map((_, si) => (
              <linearGradient key={si} id={`cbg${si}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PAL[si]} stopOpacity="0.92" />
                <stop offset="100%" stopColor={PAL[si]} stopOpacity="0.55" />
              </linearGradient>
            ))}
            <linearGradient id="clgLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1d4ed8" /><stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          {yTicks.map((t, i) => (
            <g key={i}>
              <line x1={PL} y1={t.y} x2={W - PR} y2={t.y} stroke="#e8ede9" strokeWidth="1" strokeDasharray="4 3" />
              <text x={PL - 6} y={t.y + 4} textAnchor="end" fontSize="10" fill="#6b9070" fontFamily={FONT}>{t.label}</text>
            </g>
          ))}
          {labels.map((lbl, i) => {
            const groupW = pW / Math.max(n, 1);
            const groupX = PL + i * groupW + groupW / 2;
            return barSeries.map((series, si) => {
              const v  = series[i] || 0;
              const bH = (v / maxBar) * pH;
              const x  = groupX - ((barSeries.length / 2 - si) * (bW + 2)) - bW / 2;
              return (
                <rect key={`${i}-${si}`} x={x} y={PT + pH - bH} width={bW} height={bH} rx="4"
                  fill={`url(#cbg${si})`} opacity={tip?.i === i ? 1 : 0.82} />
              );
            });
          })}
          {labels.map((lbl, i) => (
            <text key={i} x={PL + (i / Math.max(n - 1, 1)) * pW} y={H - 4} textAnchor="middle" fontSize="10" fill="#6b9070" fontFamily={FONT}>{lbl}</text>
          ))}
          {linePath && <path d={linePath} fill="none" stroke="url(#clgLine)" strokeWidth="2.5" strokeLinecap="round" />}
          {linepts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={tip?.i === i ? 5 : 3} fill="#1d4ed8" stroke="#fff" strokeWidth="2" />
          ))}
          {tip && <line x1={tip.x} y1={PT} x2={tip.x} y2={PT + pH} stroke="#00c853" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />}
        </svg>
        {tip && (
          <div style={{ position: "absolute", bottom: 36, left: `${(tip.x / W) * 100}%`, transform: "translateX(-50%)", background: "#0d2b1e", color: "#fff", borderRadius: 10, padding: "8px 12px", pointerEvents: "none", whiteSpace: "nowrap", fontSize: 11, fontFamily: FONT, boxShadow: "0 4px 16px rgba(0,0,0,0.22)", zIndex: 10 }}>
            <div style={{ fontWeight: 800, marginBottom: 3, color: "#a7f3d0" }}>{tip.label}</div>
            {barSeries.map((s, si) => <div key={si} style={{ color: PAL[si] }}>{fmtShort(s[tip.i] || 0)}</div>)}
            {lineData?.[tip.i] != null && <div style={{ color: "#93c5fd" }}>GP%: {lineData[tip.i].toFixed(1)}%</div>}
          </div>
        )}
      </div>
    );
  }

  function HBarChart({ data = [] }) {
    const maxV = Math.max(...data.map(d => d.value), 1);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.map((d, i) => (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#0d2b1e", fontFamily: FONT }}>{d.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: PAL[i % PAL.length], fontFamily: FONT }}>{fmtShort(d.value)}</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "#f0fdf5", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 4, background: `linear-gradient(90deg,${PAL[i % PAL.length]},${PAL[(i + 2) % PAL.length]})`, width: `${(d.value / maxV) * 100}%`, transition: "width .6s ease" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  function DonutChartSVG({ segments = [], size = 140, innerRadius = 0.6, centerLabel = "", centerSub = "", showLegend = true }) {
    const [hover, setHover] = useState(null);
    const R = size / 2, cx = R, cy = R;
    const outerR = R - 4, innerR = outerR * innerRadius;
    const total  = segments.reduce((s, d) => s + (d.value || 0), 0) || 1;
  let cum = 0;
    const slices = segments.map((seg, i) => {
      let pct = (seg.value || 0) / total;
      const sa  = cum * 2 * Math.PI - Math.PI / 2;
      cum += pct;
      let ea  = cum * 2 * Math.PI - Math.PI / 2;

    
      if (pct >= 0.9999) ea -= 0.0001;

      const x1  = cx + outerR * Math.cos(sa), y1 = cy + outerR * Math.sin(sa);
      const x2  = cx + outerR * Math.cos(ea), y2 = cy + outerR * Math.sin(ea);
      const ix1 = cx + innerR * Math.cos(ea), iy1 = cy + innerR * Math.sin(ea);
      const ix2 = cx + innerR * Math.cos(sa), iy2 = cy + innerR * Math.sin(sa);
      const large = (ea - sa) > Math.PI ? 1 : 0;
      const mid   = sa + (ea - sa) / 2;
      return { ...seg, path: `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2} Z`, mid, pct, color: seg.color || PAL[i % PAL.length] };
    });
    const hov = hover !== null ? slices[hover] : null;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
          {slices.map((s, i) => (
            <path key={i} d={s.path} fill={s.color}
              opacity={hover === null ? 0.88 : hover === i ? 1 : 0.42}
              stroke="#fff" strokeWidth="2"
              transform={hover === i ? `translate(${Math.cos(s.mid) * 4} ${Math.sin(s.mid) * 4})` : ""}
              style={{ transition: "all .18s", cursor: "pointer" }}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
            />
          ))}
          {innerRadius > 0 && (
            <>
              <text x={cx} y={cy - 5} textAnchor="middle" fontSize="13" fontWeight="800" fill="#0d2b1e" fontFamily={FONT}>{hov ? Math.round(hov.pct * 100) + "%" : centerLabel || total.toLocaleString()}</text>
              <text x={cx} y={cy + 11} textAnchor="middle" fontSize="9.5" fill="#5a7a65" fontFamily={FONT}>{hov ? hov.label : (centerSub || "total")}</text>
            </>
          )}
        </svg>
        {showLegend && (
          <div style={{ display: "flex", flexDirection: "column", gap: 7, minWidth: 0 }}>
            {slices.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", opacity: hover === null ? 1 : hover === i ? 1 : 0.45, transition: "opacity .15s" }}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#0d2b1e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: FONT }}>{s.label}</div>
                  <div style={{ fontSize: 10, color: "#5a7a65", fontFamily: FONT }}>{Math.round(s.pct * 100)}% · {(s.value || 0).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function SparkBar({ values = [], color = "#00c853", height = 30 }) {
    if (!values.length) return null;
    const maxV = Math.max(...values, 1);
    return (
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height }}>
        {values.map((v, i) => (
          <div key={i} style={{ flex: 1, background: color, opacity: 0.4 + 0.6 * (i / values.length), borderRadius: 2, height: `${Math.max(4, (v / maxV) * height)}px` }} />
        ))}
      </div>
    );
  }
  function PanelCard({ children, style: s }) {
    return (
      <div style={{
        background:"#fff", border:`1px solid ${C.border}`, borderRadius:20,
        overflow:"hidden", boxShadow:"0 2px 10px rgba(50,109,32,0.05)",
        transition:"box-shadow .25s ease, transform .25s ease",
        ...s,
      }}>
        {children}
      </div>
    );
  }

  function CardHeader({ icon: Icon, title, sub, gradient, action }) {
    if (gradient) {
      return (
        <div style={{ background: gradient, padding: "13px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 33, height: 33, borderRadius: 9, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid rgba(255,255,255,0.28)" }}>
              <Icon size={17} color="#fff" />
            </div>
            <div>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 14, color: "#fff" }}>{title}</div>
              {sub && <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.65)", marginTop: 1 }}>{sub}</div>}
            </div>
          </div>
          {action}
        </div>
      );
    }
    return (
      <div style={{
        padding:"16px 20px", display:"flex", justifyContent:"space-between",
        alignItems:"center", borderBottom:`1px solid ${C.border}`, background:"#fff",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:34, height:34, borderRadius:10, background:C.ink,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <Icon size={16} color={C.lime} />
          </div>
          <div>
            <div style={{ fontFamily:FONT, fontWeight:800, fontSize:14, color:C.ink, letterSpacing:"-0.01em" }}>{title}</div>
            {sub && <div style={{ fontSize:10.5, color:C.muted, marginTop:1 }}>{sub}</div>}
          </div>
        </div>
        {action}
      </div>
    );
  }


  function ChartLabel({ children }) {
    return (
      <div style={{ fontSize: 10, fontWeight: 800, color: "#5a7a65", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10, display: "flex", alignItems: "center", gap: 5, fontFamily: FONT }}>
        {children}
      </div>
    );
  }

  function Eyebrow({ children }) {
    return (
      <span style={{
        display:"inline-flex", alignItems:"center", gap:7,
        fontSize:10.5, fontWeight:800, letterSpacing:"0.12em",
        textTransform:"uppercase", color:C.green,
      }}>
        <span style={{ width:6, height:6, borderRadius:"50%", background:C.lime,
          boxShadow:"0 0 0 3px rgba(189,212,60,0.3)" }} />
        {children}
      </span>
    );
  }
  function BulletItem({ text, color = "#00897b", size = "normal" }) {
    const fs = size === "small" ? 11 : 12.5;
    return (
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0, marginTop: fs === 11 ? 4 : 5 }} />
        <span style={{ fontSize: fs, color: "#0d2b1e", lineHeight: 1.6, fontFamily: FONT }}>{text}</span>
      </div>
    );
  }

  function SalesTrendSection({
    values, labels, kpiData, total, avg, peak, low, peakLabel, pctChange, trending,
    getRangeLabel, filterLabel, filterBrand, filterBranch, brands = [],
    transactionCount = 0, averageTransaction = 0, branchPerformance = [], brandPerformance = [],
    branchProfitability = [],
  }) {
    const panelRef = useRef(null);
    const [pdfBusy, setPdfBusy] = useState(false);

    const isFiltered = !!(filterBrand || filterBranch);

  const selectedBrandObj = useMemo(
      () => brands.find(b => String(b.id) === String(filterBrand)),
      [brands, filterBrand]
    );

    const catData = useMemo(() => {
      return Array.isArray(kpiData?.categoryBreakdown) ? kpiData.categoryBreakdown : [];
    }, [kpiData]);

    const brandBreakdownData = useMemo(() => {
      if (Array.isArray(kpiData?.brandBreakdown) && kpiData.brandBreakdown.length) {
        return kpiData.brandBreakdown;
      }
      return brandPerformance;
    }, [kpiData, brandPerformance]);
    

    const categoryPanelData  = isFiltered ? catData : brandBreakdownData;
    const categoryPanelTitle = isFiltered ? "Sales by Category" : "Sales by Brand";
  const CategoryPanelIcon  = isFiltered ? PieChart : Globe;

    const branchData = useMemo(() => {
      if (Array.isArray(kpiData?.branchBreakdown) && kpiData.branchBreakdown.length) {
        return kpiData.branchBreakdown.slice(0, 6).map(item => {
          const branchName = String(item?.branch || item?.label || "").trim();
          const brandMatch = brands.find(brand => (brand?.branches || []).some(br => String(typeof br === "string" ? br : (br?.name || br?.branch || br?.branch_name || "")).trim() === branchName));
          const brandName = item?.brand || item?.brand_name || brandMatch?.name || brandMatch?.brand || brandMatch?.brand_name || "Brand not set";
          return { ...item, label:`${branchName || item?.label || "Branch"} · ${brandName}`, branch:branchName, brand:brandName };
        });
      }
      return branchPerformance.slice(0, 6);
    }, [kpiData, branchPerformance, brands]);

    const branchAttentionItems = useMemo(() => {
      const rows = Array.isArray(branchProfitability)
        ? branchProfitability.filter(row => Number(row?.revenue || 0) > 0)
        : [];

      if (!rows.length) return [];

      const items = [];
      const usedBranches = new Set();

      const addItem = (row, config) => {
        const branchKey = `${row?.brand || "Unassigned Brand"}::${row?.branch || ""}`;
        if (!row?.branch || usedBranches.has(branchKey) || items.length >= 4) return;
        usedBranches.add(branchKey);
        items.push({
          branch: row.branch,
          brand: row.brand || "Unassigned Brand",
          ...config,
        });
      };

      // 1. Data quality comes first. A 100% margin caused by zero COGS should
      //    never be presented as a genuine high-margin success.
      rows
        .filter(row => Number(row.cogs || 0) <= 0)
        .sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0))
        .forEach(row => {
          addItem(row, {
            status: "DATA CHECK",
            tone: "info",
            title: "Verify cost data",
            detail: `${Number(row.margin || 0).toFixed(1)}% margin with no recorded COGS.`,
            action: "Confirm transaction cost-of-goods data before interpreting profitability.",
          });
        });

      // 2. Low-margin branches need management attention.
      rows
        .filter(row => Number(row.cogs || 0) > 0 && Number(row.margin || 0) < 25)
        .sort((a, b) => Number(a.margin || 0) - Number(b.margin || 0))
        .forEach(row => {
          addItem(row, {
            status: "MARGIN WATCH",
            tone: "warning",
            title: "Margin requires review",
            detail: `${Number(row.margin || 0).toFixed(1)}% margin on ${fmtAmt(row.revenue)} revenue.`,
            action: "Review product costs, pricing, discounts and sales mix.",
          });
        });

      // 3. High-margin branches may be good candidates for controlled growth.
      rows
        .filter(row => Number(row.cogs || 0) > 0 && Number(row.margin || 0) >= 40)
        .sort((a, b) => Number(b.margin || 0) - Number(a.margin || 0))
        .forEach(row => {
          addItem(row, {
            status: "GROWTH OPPORTUNITY",
            tone: "success",
            title: "Strong margin performance",
            detail: `${Number(row.margin || 0).toFixed(1)}% margin · ${fmtAmt(row.avgOrder)} average order.`,
            action: "Assess whether sales volume can be increased while preserving current margins.",
          });
        });

      // 4. Flag branches whose transaction volume is materially below the group.
      const avgTransactions =
        rows.reduce((sum, row) => sum + Number(row.transactions || 0), 0) /
        Math.max(rows.length, 1);

      rows
        .filter(row =>
          Number(row.transactions || 0) > 0 &&
          Number(row.transactions || 0) < Math.max(2, avgTransactions * 0.5)
        )
        .sort((a, b) => Number(a.transactions || 0) - Number(b.transactions || 0))
        .forEach(row => {
          addItem(row, {
            status: "LOW VOLUME",
            tone: "neutral",
            title: "Low transaction activity",
            detail: `${Number(row.transactions || 0).toLocaleString()} transaction${Number(row.transactions || 0) === 1 ? "" : "s"} · ${fmtAmt(row.avgOrder)} average order.`,
            action: "Review traffic, local demand and branch-level selling activity.",
          });
        });

      // 5. If space remains, surface one stable branch as a positive benchmark.
      rows
        .filter(row =>
          Number(row.cogs || 0) > 0 &&
          Number(row.margin || 0) >= 25 &&
          Number(row.margin || 0) < 40
        )
        .sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0))
        .forEach(row => {
          addItem(row, {
            status: "STABLE",
            tone: "healthy",
            title: "Healthy operating range",
            detail: `${Number(row.margin || 0).toFixed(1)}% margin · ${fmtAmt(row.revenue)} revenue.`,
            action: "Maintain performance and monitor for changes in cost or transaction volume.",
          });
        });

      return items.slice(0, 5);
    }, [branchProfitability]);

    const hasData = total > 0;
    const grossProfit = kpiData?.salesProfit ?? null;
    const txCount     = kpiData?.txCount ?? transactionCount ?? 0;
    const avgOrder    = kpiData?.avgOrder ?? averageTransaction ?? 0;

    const analysisBullets = useMemo(() => {
      if (!hasData) return [];
      const bullets = [];
      bullets.push(`Total revenue for ${getRangeLabel()} is ${fmtAmt(kpiData?.totalSales ?? total)} across ${filterLabel}.`);
      if (grossProfit != null) bullets.push(`Recorded gross profit is ${fmtAmt(grossProfit)}, a ${Math.round((grossProfit / Math.max((kpiData?.totalSales ?? total), 1)) * 100)}% margin.`);
      bullets.push(`${txCount.toLocaleString()} transactions processed with an average order of ${fmtAmt(avgOrder)}.`);
      bullets.push(`Revenue is ${trending ? "trending upward" : "trending downward"} at ${trending ? "+" : ""}${pctChange}% from start to end of period.`);
      bullets.push(`Peak revenue of ${fmtAmt(peak)} was recorded on ${peakLabel}, outperforming the period average by ${fmtAmt(peak - avg)}.`);
      if (low < avg * 0.5) bullets.push(`Lowest period at ${fmtAmt(low)} — significantly below average, consider investigating that interval.`);
      if (categoryPanelData.length) {
        const top = categoryPanelData[0];
        bullets.push(`${top.label} is the top-performing ${isFiltered ? "category" : "brand"} at ${fmtShort(top.value)} (${Math.round((top.value / total) * 100)}% of revenue).`);
      }
      if (branchData.length) {
        const topBranch = branchData[0];
        bullets.push(`${topBranch.label} leads branch revenue at ${fmtShort(topBranch.value)}.`);
      }
      return bullets;
    }, [hasData, total, grossProfit, txCount, avgOrder, trending, pctChange, peak, peakLabel, avg, low, categoryPanelData, branchData, kpiData, getRangeLabel, filterLabel, isFiltered]);

    // ── Print ──
    const handlePrint = () => {
      if (!panelRef.current) return;
      const printContents = panelRef.current.innerHTML;
      const win = window.open("", "_blank");
      if (!win) { alert("Please allow pop-ups to print this report."); return; }
      win.document.write(`
        <html>
          <head>
            <title>Sales_Trend_Analysis_${filterLabel.replace(/\s+/g, "_")}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
              * { box-sizing: border-box; font-family: 'Montserrat', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              html, body { margin: 0; background: #ffffff !important; }
              @media print { @page { margin: 14mm; } button { display: none !important; } }
            </style>
          </head>
          <body>${printContents}</body>
        </html>
      `);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); win.close(); }, 400);
    };

    // ── Download PDF ──
    const handleDownloadPDF = async () => {
      if (!panelRef.current) return;
      setPdfBusy(true);
      try {
        const margin = 30;
        const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
        const pageWidth    = pdf.internal.pageSize.getWidth();
        const pageHeight   = pdf.internal.pageSize.getHeight();
        const contentWidth = pageWidth - margin * 2;

        const canvas = await html2canvas(panelRef.current, {
          scale: 2, backgroundColor: "#ffffff", useCORS: true, windowWidth: panelRef.current.scrollWidth,
        });
        const imgData      = canvas.toDataURL("image/png");
        const imgHeight     = (canvas.height * contentWidth) / canvas.width;
        const pageContentH  = pageHeight - margin * 2 - 20;
        const totalPages    = Math.max(1, Math.ceil(imgHeight / pageContentH));

        for (let page = 0; page < totalPages; page++) {
          if (page > 0) pdf.addPage();
          const yOffset = margin - page * pageContentH;
          pdf.addImage(imgData, "PNG", margin, yOffset, contentWidth, imgHeight, undefined, "FAST");
          pdf.setDrawColor(224, 242, 241);
          pdf.line(margin, pageHeight - 26, pageWidth - margin, pageHeight - 26);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
          pdf.setTextColor(148, 163, 184);
          pdf.text(`Page ${page + 1} of ${totalPages}`, pageWidth - margin, pageHeight - 14, { align: "right" });
        }
        pdf.save(`Sales_Trend_Analysis_${filterLabel.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
      } catch (err) {
        console.error("PDF export failed:", err);
        alert("Could not generate PDF. Please try again.");
      } finally {
        setPdfBusy(false);
      }
    };

    return (
      <PanelCard style={{ marginBottom: 22 }}>
        <CardHeader
          icon={TrendingUp} title="Sales Trend Analysis" sub={`${getRangeLabel()} · ${filterLabel}`}
          action={
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handlePrint}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 9, border: "1.5px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.14)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
                <Printer size={13} /> Print
              </button>
              <button onClick={handleDownloadPDF} disabled={pdfBusy}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 9, border: "1.5px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.14)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: pdfBusy ? "not-allowed" : "pointer", fontFamily: FONT, opacity: pdfBusy ? 0.7 : 1 }}>
                <Download size={13} style={{ animation: pdfBusy ? "spin 0.8s linear infinite" : "none" }} />
                {pdfBusy ? "Preparing…" : "Download PDF"}
              </button>
            </div>
          }
        />
        <div ref={panelRef} style={{ padding: "18px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18, marginBottom: 14, alignItems: "stretch" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <ChartLabel><LineChart size={11} color="#00897b" /> Sales revenue over time · {getRangeLabel()}</ChartLabel>
              {hasData ? (
                <>
                  <DashboardLineGraph labels={labels} values={values} height={280} />
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, marginBottom: 14 }}>
                    <svg width={24} height={10}><line x1="0" y1="5" x2="24" y2="5" stroke="#3b791e" strokeWidth="3" /><circle cx="12" cy="5" r="3" fill="#fff" stroke="#3b791e" strokeWidth="2" /></svg>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: "#5a7a65", fontFamily: FONT }}>Actual sales revenue</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                    {[
                      { label: "Total Revenue", text: `Total revenue for ${getRangeLabel()} is ${fmtAmt(kpiData?.totalSales ?? total)} across ${filterLabel}.`, icon: TrendingUp, color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
                      ...(grossProfit != null ? [{ label: "Gross Profit", text: `Recorded gross profit is ${fmtAmt(grossProfit)}, a ${Math.round((grossProfit / Math.max((kpiData?.totalSales ?? total), 1)) * 100)}% margin.`, icon: BarChart2, color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" }] : []),
                      { label: "Period Trend",  text: `Revenue is ${trending ? "trending upward" : "trending downward"} at ${trending ? "+" : ""}${pctChange}% from start to end of period.`, icon: trending ? ArrowUpRight : ArrowDownRight, color: trending ? "#059669" : "#dc2626", bg: trending ? "#ecfdf5" : "#fef2f2", border: trending ? "#a7f3d0" : "#fecaca" },
                    ].map((card, i) => (
                      <div key={i} style={{ background: card.bg, border: `1px solid ${card.border}`, borderRadius: 11, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: "#fff", border: `1px solid ${card.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 2px 6px ${card.border}` }}>
                          <card.icon size={16} color={card.color} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 9.5, fontWeight: 800, color: card.color, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: FONT, marginBottom: 3 }}>{card.label}</div>
                          <div style={{ fontSize: 12.5, color: "#0d2b1e", lineHeight: 1.55, fontFamily: FONT }}>{card.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, minHeight: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fffe", borderRadius: 12, border: "1.5px dashed #b2dfdb" }}>
                  <BarChart2 size={28} color="#b2dfdb" />
                  <div style={{ fontWeight: 700, fontSize: 13, marginTop: 8, color: "#5a7a65", fontFamily: FONT, textAlign: "center", padding: "0 20px" }}>
                    No data found for {getRangeLabel()}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, fontFamily: FONT }}>Try a different range, brand, or branch</div>
                </div>
              )}
            </div>

            <div style={{ background: "linear-gradient(160deg,#f0fdf5,#eaf5ec)", border: "1px solid #c8e6c9", borderRadius: 14, padding: "16px 14px", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <div style={{ width: 3, height: 15, borderRadius: 2, background: "linear-gradient(180deg,#00c853,#00897b)" }} />
                <span style={{ fontSize: 10, fontWeight: 800, color: "#00695c", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: FONT }}>Period Analysis</span>
              </div>
              {hasData ? (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 12 }}>
                    {[
                      { label: "Peak",    value: fmtAmt(peak),                        sub: `on ${peakLabel}`,            color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
                      { label: "Low",     value: fmtAmt(low),                         sub: "Period min",                 color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
                      { label: "Average", value: fmtAmt(avg),                         sub: `${labels.length} pts`,       color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
                      { label: "Trend",   value: `${trending?"+":""}${pctChange}%`,   sub: trending?"Upward":"Downward", color: trending?"#059669":"#dc2626", bg: trending?"#ecfdf5":"#fef2f2", border: trending?"#a7f3d0":"#fecaca" },
                    ].map((s, i) => (
                      <div key={i} style={{ background: s.bg, borderRadius: 9, padding: "8px 9px", border: `1px solid ${s.border}` }}>
                        <div style={{ fontSize: 8.5, fontWeight: 800, color: "#5a7a65", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: FONT, marginBottom: 2 }}>{s.label}</div>
                        <div style={{ fontSize: 12.5, fontWeight: 800, color: s.color, fontFamily: FONT, lineHeight: 1.15 }}>{s.value}</div>
                        <div style={{ fontSize: 9, color: "#5a7a65", fontFamily: FONT, marginTop: 1 }}>{s.sub}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#5a7a65", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: FONT, marginBottom: 8 }}>Key Observations</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                    {analysisBullets.slice(3).map((text, i) => {
                      const dotColors = ["#7c3aed","#059669","#d97706","#dc2626","#00897b","#1d4ed8"];
                      const bgColors  = ["#f5f3ff","#ecfdf5","#fffbeb","#fef2f2","#f0fdf5","#eff6ff"];
                      const bdrColors = ["#ddd6fe","#a7f3d0","#fde68a","#fecaca","#d1eedd","#bfdbfe"];
                      const dc = dotColors[i % dotColors.length];
                      const bc = bgColors[i % bgColors.length];
                      const bd = bdrColors[i % bdrColors.length];
                      return (
                        <div key={i} style={{ background: bc, border: `1px solid ${bd}`, borderRadius: 9, padding: "8px 10px", display: "flex", alignItems: "flex-start", gap: 8 }}>
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: dc, flexShrink: 0, marginTop: 4 }} />
                          <span style={{ fontSize: 11, color: "#0d2b1e", lineHeight: 1.55, fontFamily: FONT }}>{text}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Info size={22} color="#b2dfdb" />
                  <p style={{ fontSize: 11.5, color: "#94a3b8", textAlign: "center", lineHeight: 1.6, margin: 0, fontFamily: FONT }}>Select a date range and branch to see analysis.</p>
                </div>
              )}
            </div>
          </div>

          {/* Period Summary column removed — 2-column spaced layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "#f8fffe", border: "1px solid #e0f2f1", borderRadius: 14, padding: "18px 20px" }}>
            <ChartLabel><CategoryPanelIcon size={11} color="#00897b" /> {categoryPanelTitle}</ChartLabel>
              {categoryPanelData.length > 0
                ? <DonutChartSVG segments={categoryPanelData.map((d, i) => ({ label: d.label, value: d.value, color: PAL[i % PAL.length] }))} size={150} centerLabel={hasData ? fmtShort(total) : "—"} centerSub="total" />
                : <div style={{ height: 130, display: "flex", alignItems: "center", justifyContent: "center", color: "#b2dfdb", fontFamily: FONT, fontSize: 12 }}>No data</div>
              }
            </div>
            <div style={{
              background: "#f8fffe",
              border: "1px solid #e0f2f1",
              borderRadius: 14,
              padding: "18px 20px"
            }}>
              <ChartLabel>
                <Target size={11} color="#00897b" />
                Branch Attention & Opportunities
              </ChartLabel>

              <div style={{
                fontSize: 10.5,
                color: "#789086",
                lineHeight: 1.5,
                marginTop: -3,
                marginBottom: 12,
                fontFamily: FONT
              }}>
                Priority observations from branch profitability and transaction data
              </div>

              {branchAttentionItems.length > 0 ? (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8
                }}>
                  {branchAttentionItems.map((item, index) => {
                    const tone = {
                      info: {
                        bg: "#eff6ff",
                        border: "#bfdbfe",
                        accent: "#2563eb",
                        badgeBg: "#dbeafe",
                        badgeText: "#1e40af",
                      },
                      warning: {
                        bg: "#fffbeb",
                        border: "#fde68a",
                        accent: "#d97706",
                        badgeBg: "#fef3c7",
                        badgeText: "#92400e",
                      },
                      success: {
                        bg: "#ecfdf5",
                        border: "#a7f3d0",
                        accent: "#059669",
                        badgeBg: "#d1fae5",
                        badgeText: "#047857",
                      },
                      neutral: {
                        bg: "#f8fafc",
                        border: "#e2e8f0",
                        accent: "#64748b",
                        badgeBg: "#f1f5f9",
                        badgeText: "#475569",
                      },
                      healthy: {
                        bg: "#f0f5e8",
                        border: "#c9dba0",
                        accent: "#3b791e",
                        badgeBg: "#e8f0dd",
                        badgeText: "#2c5c16",
                      },
                    }[item.tone] || {
                      bg: "#f8fafc",
                      border: "#e2e8f0",
                      accent: "#64748b",
                      badgeBg: "#f1f5f9",
                      badgeText: "#475569",
                    };

                    return (
                      <div
                        key={`${item.branch}-${index}`}
                        style={{
                          background: tone.bg,
                          border: `1px solid ${tone.border}`,
                          borderLeft: `3px solid ${tone.accent}`,
                          borderRadius: 10,
                          padding: "9px 10px"
                        }}
                      >
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                          marginBottom: 5
                        }}>
                          <div style={{
                            fontSize: 11.5,
                            fontWeight: 800,
                            color: "#102a1c",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontFamily: FONT
                          }}>
                            {item.branch}
                          </div>

                          <span style={{
                            flexShrink: 0,
                            fontSize: 8.5,
                            fontWeight: 800,
                            letterSpacing: ".05em",
                            textTransform: "uppercase",
                            padding: "2px 6px",
                            borderRadius: 20,
                            background: tone.badgeBg,
                            color: tone.badgeText,
                            fontFamily: FONT
                          }}>
                            {item.status}
                          </span>
                        </div>

                        <div style={{fontSize:9.5,fontWeight:700,color:"#789086",marginTop:-2,marginBottom:5,fontFamily:FONT}}>
                          {item.brand}
                        </div>

                        <div style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: "#334155",
                          lineHeight: 1.45,
                          fontFamily: FONT
                        }}>
                          {item.title}
                        </div>

                        <div style={{
                          fontSize: 10,
                          color: "#64748b",
                          lineHeight: 1.5,
                          marginTop: 2,
                          fontFamily: FONT
                        }}>
                          {item.detail}
                        </div>

                        <div style={{
                          fontSize: 9.7,
                          fontWeight: 700,
                          color: tone.accent,
                          lineHeight: 1.45,
                          marginTop: 4,
                          fontFamily: FONT
                        }}>
                          {item.action}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  height: 130,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  fontFamily: FONT,
                  fontSize: 11.5,
                  textAlign: "center",
                  lineHeight: 1.6,
                  padding: 16
                }}>
                  No branch profitability observations are available for this filter.
                </div>
              )}
            </div>
          </div>
        </div>
      </PanelCard>
    );
  }

  function PrescriptiveSection({ transactions, filterLabel, preset, total, values, labels = [], kpiData, showStockAnomalies = true }) {
    const [analysis, setAnalysis] = useState(null);
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState(null);
    const [lastRun,  setLastRun]  = useState(null);
    const [pdfBusy,  setPdfBusy]  = useState(false);

    const exportRef = useRef(null); // offscreen report layout used for Print + PDF

    const runAnalysis = async () => {
      if (!transactions?.length) { setError("No transaction data available."); return; }
      setLoading(true); setError(null);
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/ai/dashboard-analysis`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactions, preset, filterLabel }),
        });
        const data = await res.json();
        if (data.success) {
          setAnalysis(data.analysis);
          setLastRun(new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }));
        } else {
          setError(data.error || "Analysis failed.");
        }
      } catch { setError("Could not reach the AI service."); }
      finally { setLoading(false); }
    };

    const projRev = analysis?.projectedRevenue ?? null;
    const projChg = analysis?.projectedChange ?? null;
    const peakDay = analysis?.peakDay ?? null;
    const slowDay = analysis?.slowestDay ?? null;
    const conf = analysis?.confidence ?? null;

    // Prescriptive anomaly groups.
    // "ghost_sales" is the backend's existing anomalyType for a branch that
    // recorded sales while one or more inventory items are already at zero stock.
    const ghostStockAnomalies = useMemo(() => {
      const rows = Array.isArray(analysis?.stockAnomalies)
        ? analysis.stockAnomalies
        : [];

      return rows.filter((a) => {
        const type = String(a?.anomalyType ?? a?.type ?? "").toLowerCase();
        return type === "ghost_sales" || type === "ghost_stock";
      });
    }, [analysis]);

    // Preserve the other anomaly types instead of removing existing functionality.
    const otherStockAnomalies = useMemo(() => {
      const rows = Array.isArray(analysis?.stockAnomalies)
        ? analysis.stockAnomalies
        : [];

      return rows.filter((a) => {
        const type = String(a?.anomalyType ?? a?.type ?? "").toLowerCase();
        return type !== "ghost_sales" && type !== "ghost_stock";
      });
    }, [analysis]);

    const typeStyle = (type) => ({
      success: { borderColor: "#059669", bg: "#ecfdf5", color: "#065f46", badgeBg: "#d1fae5", dot: "#059669" },
      warning: { borderColor: "#d97706", bg: "#fffbeb", color: "#92400e", badgeBg: "#fef3c7", dot: "#f59e0b" },
      info:    { borderColor: "#2563eb", bg: "#eff6ff", color: "#1e40af", badgeBg: "#dbeafe", dot: "#3b82f6" },
    }[type] || { borderColor: "#6b7280", bg: "#f9fafb", color: "#374151", badgeBg: "#f3f4f6", dot: "#6b7280" });

    const preRunBullets = useMemo(() => {
      if (!total) return [];
      return [
        `${transactions?.length?.toLocaleString() ?? 0} transaction records are available to the AI service.`,
        `Recorded revenue represented by the selected dashboard series is ${fmtAmt(total)}.`,
        `The evidence charts below show the historical values supplied for analysis. AI forecasts only appear after Run AI Analysis is completed.`,
      ];
    }, [total, transactions]);

    // ── Print (opens the offscreen report layout in a new tab) ─────────────
    const handlePrint = () => {
      if (!exportRef.current) return;
      const printContents = exportRef.current.innerHTML;
      const win = window.open("", "_blank");
      if (!win) { alert("Please allow pop-ups to print this report."); return; }
    win.document.write(`
        <html>
          <head>
            <title>Prescriptive_Analysis_${filterLabel.replace(/\s+/g, "_")}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
              * { box-sizing: border-box; font-family: 'Montserrat', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              html, body { margin: 0; background: #ffffff !important; }
              @media print { @page { margin: 14mm; } button { display: none !important; } }
            </style>
          </head>
          <body>${printContents}</body>
        </html>
      `);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); win.close(); }, 400);
    };

    // ── Download as an actual PDF file (same layout as Print) ──────────────
    const handleDownloadPDF = async () => {
      if (!exportRef.current) return;
      setPdfBusy(true);
      try {
        const margin = 30; // pt
        const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
        const pageWidth    = pdf.internal.pageSize.getWidth();
        const pageHeight   = pdf.internal.pageSize.getHeight();
        const contentWidth = pageWidth - margin * 2;

        const canvas = await html2canvas(exportRef.current, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          windowWidth: exportRef.current.scrollWidth,
        });
        const imgData    = canvas.toDataURL("image/png");
        const imgHeight   = (canvas.height * contentWidth) / canvas.width;
        const pageContentH = pageHeight - margin * 2 - 20; // reserve a little for page number
        const totalPages   = Math.max(1, Math.ceil(imgHeight / pageContentH));

        for (let page = 0; page < totalPages; page++) {
          if (page > 0) pdf.addPage();
          const yOffset = margin - page * pageContentH;
          pdf.addImage(imgData, "PNG", margin, yOffset, contentWidth, imgHeight, undefined, "FAST");

          pdf.setDrawColor(224, 242, 241);
          pdf.line(margin, pageHeight - 26, pageWidth - margin, pageHeight - 26);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
          pdf.setTextColor(148, 163, 184);
          pdf.text(`Page ${page + 1} of ${totalPages}`, pageWidth - margin, pageHeight - 14, { align: "right" });
        }

        pdf.save(`Prescriptive_Analysis_${filterLabel.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
      } catch (err) {
        console.error("PDF export failed:", err);
        alert("Could not generate PDF. Please try again.");
      } finally {
        setPdfBusy(false);
      }
    };

    return (
      <PanelCard style={{ marginBottom: 22 }}>
        <CardHeader
          icon={Brain}
          title="AI Prescriptive Analysis"
          sub={`Powered by Groq · llama-3.3-70b${lastRun ? ` · Last run ${lastRun}` : ""}`}
          gradient="linear-gradient(135deg,#1e3a5f,#1d4ed8)"
          action={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={handlePrint}
                title="Print"
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 9, border: "1.5px solid rgba(255,255,255,0.3)", background: "rgba(0,200,83,0.22)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
                <Printer size={13} /> Print
              </button>
              <button onClick={handleDownloadPDF} disabled={pdfBusy}
                title="Download as PDF"
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 9, border: "1.5px solid rgba(255,255,255,0.3)", background: "rgba(0,200,83,0.22)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: pdfBusy ? "not-allowed" : "pointer", fontFamily: FONT, opacity: pdfBusy ? 0.7 : 1 }}>
                <Download size={13} style={{ animation: pdfBusy ? "spin 0.8s linear infinite" : "none" }} />
                {pdfBusy ? "Preparing…" : "Download PDF"}
              </button>
              <button onClick={runAnalysis} disabled={loading}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 9, border: "1.5px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.14)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: FONT }}>
                <Zap size={12} style={{ animation: loading ? "spin 0.8s linear infinite" : "none" }} />
                {loading ? "Analyzing…" : analysis ? "Re-run AI" : "Run AI Analysis"}
              </button>
            </div>
          }
        />

        {/* ── Live dashboard view (unchanged, compact) ── */}
        <div style={{ padding: "18px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,.8fr)", gap: 16, marginBottom: 20 }}>
            <div style={{ background: "#fff", border: "1px solid #dbeafe", borderRadius: 14, padding: "15px 16px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:8 }}>
                <div>
                  <div style={{ fontSize:12.5, fontWeight:800, color:"#1e3a5f", fontFamily:FONT }}>Historical Revenue Evidence</div>
                  <div style={{ fontSize:10.5, color:"#64748b", marginTop:2, fontFamily:FONT }}>Actual dashboard series used as evidence for the AI analysis</div>
                </div>
                <span style={{ fontSize:9.5, fontWeight:800, padding:"3px 8px", borderRadius:20, background:"#eff6ff", color:"#1d4ed8", fontFamily:FONT }}>SOURCE DATA</span>
              </div>
              <DashboardLineGraph labels={labels} values={values} height={210} />
            </div>
            <div style={{ background: "#fff", border: "1px solid #dbeafe", borderRadius: 14, padding: "15px 16px" }}>
              <div style={{ fontSize:12.5, fontWeight:800, color:"#1e3a5f", fontFamily:FONT }}>AI Output Evidence</div>
              <div style={{ fontSize:10.5, color:"#64748b", marginTop:2, marginBottom:12, fontFamily:FONT }}>Forecast fields stay empty until the AI returns them</div>
              {analysis ? (
                <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                  {[
                    ["Projected 7-Day Revenue", projRev != null ? fmtAmt(projRev) : "Not returned"],
                    ["Projected Change", projChg != null ? `${projChg >= 0 ? "+" : ""}${Number(projChg).toFixed(1)}%` : "Not returned"],
                    ["Peak Day", peakDay || "Not returned"],
                    ["Slowest Day", slowDay || "Not returned"],
                    ["Confidence", conf != null ? `${conf}%` : "Not returned"],
                  ].map(([label,value]) => <div key={label} style={{ display:"flex", justifyContent:"space-between", gap:12, padding:"9px 10px", borderRadius:9, background:"#f8fbff", border:"1px solid #e5edf8" }}><span style={{fontSize:10.5,color:"#64748b",fontWeight:700}}>{label}</span><strong style={{fontSize:11,color:"#1e3a5f",textAlign:"right"}}>{value}</strong></div>)}
                </div>
              ) : <div style={{ minHeight:180, display:"flex", alignItems:"center", justifyContent:"center", border:"1px dashed #bfdbfe", borderRadius:10, background:"#f8fbff", color:"#64748b", fontSize:11.5, textAlign:"center", padding:18 }}>Run AI Analysis to generate forecast evidence and recommendations.</div>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "linear-gradient(160deg,#eff6ff,#dbeafe)", border: "1px solid #bfdbfe", borderRadius: 14, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <div style={{ width: 3, height: 14, borderRadius: 2, background: "linear-gradient(180deg,#3b82f6,#1d4ed8)" }} />
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: FONT }}>
                    {analysis ? "AI Summary" : "Data Overview"} · {filterLabel}
                  </span>
                </div>
                {analysis ? (
                  <p style={{ fontSize: 12.5, color: "#0d2b1e", lineHeight: 1.75, margin: 0, fontFamily: FONT }}>{analysis.summary}</p>
                ) : (
                  <>
                    {preRunBullets.length > 0
                      ? preRunBullets.map((b, i) => <BulletItem key={i} text={b} color="#3b82f6" />)
                      : <p style={{ fontSize: 12, color: "#94a3b8", fontFamily: FONT, fontStyle: "italic" }}>Load transactions and run AI Analysis to generate insights.</p>
                    }
                    {error && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 9, marginTop: 8 }}>
                        <AlertTriangle size={13} color="#dc2626" />
                        <span style={{ fontSize: 11.5, color: "#dc2626", fontWeight: 600, fontFamily: FONT }}>{error}</span>
                      </div>
                    )}
                    {loading && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                        <div style={{ width: 18, height: 18, border: "2.5px solid #dbeafe", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "#5a7a65", fontFamily: FONT }}>Sending {transactions?.length} transactions to Groq…</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Ghost Stock Anomalies Across Branches — directly under AI Summary */}
              {analysis && showStockAnomalies && (
                <div style={{ background: "#fff", border: "1px solid #fecaca", borderRadius: 14, padding: "14px 15px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: ghostStockAnomalies.length > 0 ? 10 : 0, flexWrap: "wrap" }}>
                    <div style={{ width: 3, height: 14, borderRadius: 2, background: "#dc2626" }} />
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#dc2626",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontFamily: FONT
                    }}>
                      Ghost Stock Anomalies Across Branches
                    </span>

                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 20,
                      background: ghostStockAnomalies.length > 0 ? "#fee2e2" : "#f1f5f9",
                      color: ghostStockAnomalies.length > 0 ? "#991b1b" : "#64748b",
                      fontFamily: FONT
                    }}>
                      {ghostStockAnomalies.length}
                    </span>
                  </div>

                  <div style={{
                    marginBottom: 11,
                    padding: "10px 12px",
                    borderRadius: 9,
                    background: "#fff7f7",
                    border: "1px solid #fee2e2",
                    fontSize: 11.5,
                    color: "#7f1d1d",
                    lineHeight: 1.6,
                    fontFamily: FONT
                  }}>
                    <strong>What is a ghost stock anomaly?</strong>{" "}
                    A ghost stock anomaly occurs when a branch records sales while one or more related inventory items are already recorded as zero stock in the system. This means the sales record and inventory record may be out of sync and should be verified against stock movement records.
                  </div>

                  {ghostStockAnomalies.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {ghostStockAnomalies.map((a, i) => {
                        const severity = String(a?.severity || "critical").toLowerCase();
                        const severityColor =
                          severity === "critical"
                            ? "#dc2626"
                            : severity === "warning"
                              ? "#d97706"
                              : "#2563eb";

                        return (
                          <div
                            key={`${a?.branch || "branch"}-${i}`}
                            style={{
                              background: "linear-gradient(145deg,#fff7f7,#fef2f2)",
                              border: "1px solid #fecaca",
                              borderLeft: `4px solid ${severityColor}`,
                              borderRadius: 12,
                              padding: "13px 14px"
                            }}
                          >
                            <div style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 7,
                              marginBottom: 8,
                              flexWrap: "wrap"
                            }}>
                              <AlertTriangle size={13} color={severityColor} />

                              <span style={{
                                fontSize: 9.5,
                                fontWeight: 800,
                                padding: "2px 7px",
                                borderRadius: 20,
                                background: "#fee2e2",
                                color: "#991b1b",
                                textTransform: "uppercase",
                                fontFamily: FONT
                              }}>
                                Ghost Stock
                              </span>

                              <span style={{
                                fontSize: 12,
                                fontWeight: 800,
                                color: "#0d2b1e",
                                fontFamily: FONT
                              }}>
                                {a?.branch || "Unknown Branch"}
                              </span>

                              <span style={{
                                marginLeft: "auto",
                                fontSize: 9,
                                fontWeight: 800,
                                padding: "2px 7px",
                                borderRadius: 20,
                                background: severity === "critical" ? "#fee2e2" : severity === "warning" ? "#fef3c7" : "#dbeafe",
                                color: severity === "critical" ? "#991b1b" : severity === "warning" ? "#92400e" : "#1e40af",
                                textTransform: "uppercase",
                                fontFamily: FONT
                              }}>
                                {severity}
                              </span>
                            </div>

                            <BulletItem
                              text={a?.finding || "Sales activity was detected while related inventory is already recorded at zero stock."}
                              color={severityColor}
                              size="small"
                            />

                            <div style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 7,
                              padding: "8px 10px",
                              borderRadius: 8,
                              background: "rgba(255,255,255,0.78)",
                              border: "1px solid #fecaca",
                              marginTop: 7
                            }}>
                              <CheckCircle size={12} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                              <span style={{
                                fontSize: 11.5,
                                fontWeight: 600,
                                color: "#0d2b1e",
                                lineHeight: 1.55,
                                fontFamily: FONT
                              }}>
                                {a?.action || "Verify the branch's physical stock, reconcile recent sales against inventory movements, and correct the stock record before further replenishment decisions."}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "10px 11px",
                      borderRadius: 9,
                      background: "#f8fafc",
                      border: "1px dashed #cbd5e1"
                    }}>
                      <CheckCircle size={14} color="#059669" />
                      <span style={{
                        fontSize: 11.5,
                        color: "#64748b",
                        lineHeight: 1.55,
                        fontFamily: FONT
                      }}>
                        No ghost stock anomaly was detected in the branches included in this analysis.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Preserve non-ghost stock/sales anomalies below the ghost-stock section */}
              {analysis && showStockAnomalies && otherStockAnomalies.length > 0 && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 3, height: 14, borderRadius: 2, background: "#d97706" }} />
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#92400e",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontFamily: FONT
                    }}>
                      Other Stock vs Sales Anomalies
                    </span>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 20,
                      background: "#fef3c7",
                      color: "#92400e",
                      fontFamily: FONT
                    }}>
                      {otherStockAnomalies.length}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {otherStockAnomalies.map((a, i) => {
                      const cfg = {
                        low_stock_no_reorder: {
                          bg: "#fffbeb",
                          border: "#fde68a",
                          label: "Not Reordering",
                          labelBg: "#fef3c7",
                          labelColor: "#92400e",
                          dot: "#d97706"
                        },
                        dead_stock: {
                          bg: "#eff6ff",
                          border: "#bfdbfe",
                          label: "Dead Stock",
                          labelBg: "#dbeafe",
                          labelColor: "#1e40af",
                          dot: "#2563eb"
                        },
                      }[a?.anomalyType] || {
                        bg: "#f8fffe",
                        border: "#d1eedd",
                        label: "Anomaly",
                        labelBg: "#e0f2f1",
                        labelColor: "#00695c",
                        dot: "#00897b"
                      };

                      return (
                        <div key={i} style={{
                          background: cfg.bg,
                          border: `1px solid ${cfg.border}`,
                          borderRadius: 12,
                          padding: "13px 14px"
                        }}>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 7,
                            flexWrap: "wrap"
                          }}>
                            <span style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background: cfg.dot,
                              display: "inline-block"
                            }} />
                            <span style={{
                              fontSize: 9.5,
                              fontWeight: 800,
                              padding: "2px 7px",
                              borderRadius: 20,
                              background: cfg.labelBg,
                              color: cfg.labelColor,
                              textTransform: "uppercase",
                              fontFamily: FONT
                            }}>
                              {cfg.label}
                            </span>
                            <span style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#0d2b1e",
                              fontFamily: FONT
                            }}>
                              {a?.branch || "Unknown Branch"}
                            </span>
                          </div>

                          <BulletItem text={a?.finding} color={cfg.dot} size="small" />

                          {a?.action && (
                            <div style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 6,
                              padding: "7px 9px",
                              borderRadius: 7,
                              background: "rgba(255,255,255,0.65)",
                              border: `1px solid ${cfg.border}`,
                              marginTop: 6
                            }}>
                              <CheckCircle size={12} color={cfg.dot} style={{ flexShrink: 0, marginTop: 1 }} />
                              <span style={{
                                fontSize: 11.5,
                                fontWeight: 600,
                                color: "#0d2b1e",
                                lineHeight: 1.55,
                                fontFamily: FONT
                              }}>
                                {a.action}
                              </span>
                            </div>
                          )}
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
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 3, height: 14, borderRadius: 2, background: "linear-gradient(180deg,#00c853,#00897b)" }} />
                    <span style={{ fontSize: 10, fontWeight: 800, color: "#0d2b1e", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: FONT }}>Actionable Recommendations</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#e0f2f1", color: "#00695c", fontFamily: FONT }}>{analysis.recommendations.length}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {analysis.recommendations.map((rec, i) => {
                      const s = typeStyle(rec.type);
                      return (
                        <div key={i} style={{ background: s.bg, border: `1px solid ${s.borderColor}25`, borderRadius: 12, padding: "12px 12px 12px 16px", position: "relative", overflow: "hidden" }}>
                          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: s.borderColor, borderRadius: "4px 0 0 4px" }} />
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
                            <span style={{ fontSize: 9.5, fontWeight: 800, color: s.color, textTransform: "uppercase", letterSpacing: "0.07em", background: s.badgeBg, padding: "2px 7px", borderRadius: 20, fontFamily: FONT }}>{rec.branch || rec.type}</span>
                          </div>
                          <BulletItem text={rec.text} color={s.dot} size="small" />
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div style={{ background: "#fafbff", border: "1.5px dashed #dbeafe", borderRadius: 14, padding: "28px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 10 }}>
                  <Brain size={32} color="#bfdbfe" />
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#0d2b1e", fontFamily: FONT }}>Recommendations will appear here</div>
                  <p style={{ fontSize: 11.5, color: "#94a3b8", textAlign: "center", lineHeight: 1.65, margin: 0, fontFamily: FONT }}>
                    {transactions?.length
                      ? `${transactions.length} transactions ready. Click "Run AI Analysis" to generate prescriptive recommendations.`
                      : "Load transactions then run the AI analysis."
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── OFFSCREEN report layout — used only by Print & Download PDF ── */}
        <div style={{ position: "absolute", left: -99999, top: 0, width: 0, height: 0, overflow: "hidden" }}>
          <div ref={exportRef} style={{ width: 800, background: "#fff", padding: "44px 48px 36px", fontFamily: FONT, color: "#0d2b1e" }}>

            {/* Letterhead */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 18, marginBottom: 26, borderBottom: "4px solid #00c853" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <img src={logoIfranchise} alt="iFranchise Business Services Corp." style={{ height: 58, width: "auto" }} />
                <div style={{ width: 1, height: 44, background: "#d1eedd" }} />
                <img src={logoSync} alt="FranchiSync" style={{ height: 46, width: "auto" }} />
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#5a7a65", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  iFranchise Business Services Corp.
                </div>
                <div style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 2 }}>
                  {new Date().toLocaleString()}
                </div>
              </div>
            </div>

            {/* Title block */}
            <div style={{ marginBottom: 26 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#0d2b1e", letterSpacing: "-0.5px", lineHeight: 1.2 }}>
                AI Prescriptive Analysis Report
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#00897b", background: "#e0f2f1", padding: "4px 12px", borderRadius: 20 }}>
                  {filterLabel}
                </span>
                {lastRun && (
                  <span style={{ fontSize: 13, color: "#5a7a65", fontWeight: 600 }}>
                    AI run at {lastRun}
                  </span>
                )}
              </div>
            </div>

            {/* KPI summary grid — larger, readable */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 30 }}>
              {[
                { label: "Projected 7-Day Revenue", value: projRev ? fmtAmt(projRev) : "—", sub: projRev ? `${projChg >= 0 ? "+" : ""}${projChg.toFixed(1)}% vs prior period` : "Not yet calculated", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
                { label: "Peak Day Forecast",        value: peakDay || "—", sub: "Highest revenue day", color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
                { label: "Slowest Day Forecast",     value: slowDay || "—", sub: "Lowest revenue day", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
                { label: "Confidence Score",         value: conf ? `${conf}%` : "—", sub: conf ? (conf >= 80 ? "High confidence" : conf >= 60 ? "Medium confidence" : "Low — needs more data") : "Not yet calculated", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
              ].map((card, i) => (
                <div key={i} style={{ background: card.bg, border: `1.5px solid ${card.border}`, borderRadius: 14, padding: "18px 20px" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#5a7a65", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: card.color, lineHeight: 1.1 }}>{card.value}</div>
                  <div style={{ fontSize: 12.5, color: "#5a7a65", marginTop: 6 }}>{card.sub}</div>
                </div>
              ))}
            </div>

            {/* Executive summary */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                <div style={{ width: 5, height: 20, borderRadius: 3, background: "linear-gradient(180deg,#00c853,#00897b)" }} />
                <span style={{ fontSize: 16, fontWeight: 800, color: "#0d2b1e" }}>
                  {analysis ? "Executive Summary" : "Data Overview"}
                </span>
              </div>
              {analysis ? (
                <p style={{ fontSize: 14.5, lineHeight: 1.85, margin: 0, color: "#1a1a1a" }}>{analysis.summary}</p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 2, color: "#1a1a1a" }}>
                  {preRunBullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              )}
            </div>

            {/* Ghost Stock Anomalies Across Branches */}
            {analysis && showStockAnomalies && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                  <div style={{ width: 5, height: 20, borderRadius: 3, background: "#dc2626" }} />
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#0d2b1e" }}>
                    Ghost Stock Anomalies Across Branches
                  </span>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: ghostStockAnomalies.length > 0 ? "#fee2e2" : "#f1f5f9",
                    color: ghostStockAnomalies.length > 0 ? "#991b1b" : "#64748b"
                  }}>
                    {ghostStockAnomalies.length}
                  </span>
                </div>

                <div style={{
                  marginBottom: 14,
                  padding: "11px 13px",
                  borderRadius: 9,
                  background: "#fff7f7",
                  border: "1px solid #fee2e2",
                  fontSize: 12.5,
                  color: "#7f1d1d",
                  lineHeight: 1.65
                }}>
                  <strong>What is a ghost stock anomaly?</strong>{" "}
                  A ghost stock anomaly occurs when a branch records sales while one or more related inventory items are already recorded as zero stock in the system. This means the sales record and inventory record may be out of sync and should be verified against stock movement records.
                </div>

                {ghostStockAnomalies.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {ghostStockAnomalies.map((a, i) => (
                      <div
                        key={`${a?.branch || "branch"}-${i}`}
                        style={{
                          background: "#fef2f2",
                          border: "1.5px solid #fecaca",
                          borderLeft: "5px solid #dc2626",
                          borderRadius: 12,
                          padding: "16px 18px"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "3px 10px",
                            borderRadius: 20,
                            background: "#fff",
                            color: "#991b1b",
                            textTransform: "uppercase"
                          }}>
                            Ghost Stock
                          </span>
                          <span style={{ fontSize: 14, fontWeight: 700 }}>
                            {a?.branch || "Unknown Branch"}
                          </span>
                          <span style={{
                            marginLeft: "auto",
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "3px 10px",
                            borderRadius: 20,
                            background: "#fee2e2",
                            color: "#991b1b",
                            textTransform: "uppercase"
                          }}>
                            {a?.severity || "critical"}
                          </span>
                        </div>

                        <p style={{ fontSize: 13.5, lineHeight: 1.7, margin: "0 0 8px" }}>
                          {a?.finding || "Sales activity was detected while related inventory is recorded at zero stock."}
                        </p>

                        <div style={{
                          fontSize: 13,
                          fontWeight: 600,
                          background: "rgba(255,255,255,0.7)",
                          borderRadius: 8,
                          padding: "9px 12px"
                        }}>
                          → {a?.action || "Verify physical stock, reconcile inventory movements, and correct the branch stock record."}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    fontSize: 13,
                    color: "#64748b",
                    background: "#f8fafc",
                    border: "1px dashed #cbd5e1",
                    borderRadius: 10,
                    padding: "12px 14px"
                  }}>
                    No ghost stock anomaly was detected in the branches included in this analysis.
                  </div>
                )}
              </div>
            )}

            {/* Preserve other stock/sales anomalies in exported reports */}
            {analysis && showStockAnomalies && otherStockAnomalies.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                  <div style={{ width: 5, height: 20, borderRadius: 3, background: "#d97706" }} />
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#0d2b1e" }}>
                    Other Stock vs Sales Anomalies
                  </span>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: "#fef3c7",
                    color: "#92400e"
                  }}>
                    {otherStockAnomalies.length}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {otherStockAnomalies.map((a, i) => {
                    const cfg = {
                      low_stock_no_reorder: { bg: "#fffbeb", border: "#fde68a", label: "Not Reordering" },
                      dead_stock: { bg: "#eff6ff", border: "#bfdbfe", label: "Dead Stock" },
                    }[a?.anomalyType] || { bg: "#f8fffe", border: "#d1eedd", label: "Anomaly" };

                    return (
                      <div key={i} style={{
                        background: cfg.bg,
                        border: `1.5px solid ${cfg.border}`,
                        borderRadius: 12,
                        padding: "16px 18px"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "3px 10px",
                            borderRadius: 20,
                            background: "#fff",
                            textTransform: "uppercase"
                          }}>
                            {cfg.label}
                          </span>
                          <span style={{ fontSize: 14, fontWeight: 700 }}>
                            {a?.branch || "Unknown Branch"}
                          </span>
                        </div>

                        <p style={{ fontSize: 13.5, lineHeight: 1.7, margin: "0 0 8px" }}>
                          {a?.finding}
                        </p>

                        {a?.action && (
                          <div style={{
                            fontSize: 13,
                            fontWeight: 600,
                            background: "rgba(255,255,255,0.7)",
                            borderRadius: 8,
                            padding: "9px 12px"
                          }}>
                            → {a.action}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis?.recommendations?.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                  <div style={{ width: 5, height: 20, borderRadius: 3, background: "linear-gradient(180deg,#00c853,#00897b)" }} />
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#0d2b1e" }}>Actionable Recommendations</span>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#e0f2f1", color: "#00695c" }}>
                    {analysis.recommendations.length}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {analysis.recommendations.map((rec, i) => {
                    const s = typeStyle(rec.type);
                    return (
                      <div key={i} style={{ background: s.bg, border: `1.5px solid ${s.borderColor}40`, borderLeft: `5px solid ${s.borderColor}`, borderRadius: 10, padding: "14px 18px" }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: s.color, background: s.badgeBg, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase" }}>
                          {rec.branch || rec.type}
                        </span>
                        <p style={{ fontSize: 13.5, lineHeight: 1.75, margin: "8px 0 0" }}>{rec.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer */}
            <div style={{ marginTop: 36, paddingTop: 14, borderTop: "1.5px solid #e0f2f1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10.5, color: "#94a3b8" }}>
                Generated by FranchiSync · Franchise Business Services Corp.
              </span>
              <span style={{ fontSize: 10.5, color: "#94a3b8" }}>
                AI analysis powered by Groq
              </span>
            </div>
          </div>
        </div>
      </PanelCard>
    );
  }

  function SalesVsStockSection({ preset, appliedRange, rangeMode, filterBranch, filterBrand, selectedBrand, total, transactions = [] }) {
    const [data,    setData]    = useState(null);
    const [inventoryRows, setInventoryRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tab,     setTab]     = useState("top10");

    const fetchData = useCallback(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (rangeMode === "preset") params.set("preset", preset);
        else if (appliedRange) { params.set("from", appliedRange.from); params.set("to", appliedRange.to); }
        else params.set("preset", "month");
        if (filterBranch) params.set("branch", filterBranch);
        else if (filterBrand && selectedBrand) {
          const names = (selectedBrand.branches || []).map(br => typeof br === "string" ? br : br.name);
          if (names.length) params.set("branches", names.join(","));
        }
        const [analyticsRes, inventoryRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/dashboard/product-analytics?${params}`),
          fetch(`${process.env.REACT_APP_API_URL}/ingredients`),
        ]);
        const json = analyticsRes.ok ? await analyticsRes.json() : {};
        const inventoryJson = inventoryRes.ok ? await inventoryRes.json() : [];
        setData(json);
        setInventoryRows(Array.isArray(inventoryJson) ? inventoryJson : []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }, [preset, rangeMode, appliedRange, filterBranch, filterBrand, selectedBrand]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const top10     = data?.top10 ?? [];
    const fast      = data?.fastMoving ?? [];
    const slow      = data?.slowMoving ?? [];
    const totalSKUs = data?.totalProducts ?? 0;
    const fastCount = fast.length;
    const slowCount = slow.length;

    const stockEvidence = useMemo(() => {
      /*
        Build the stock charts from the SAME filtered transaction records used by
        the dashboard instead of relying only on top10/fast/slow lists.

        This fixes the empty charts when a sold product exists in transactions
        and inventory but was omitted from one of the analytics summary arrays.
      */

      const normalizeName = (value) =>
        String(value || "")
          .trim()
          .toLowerCase()
          .replace(/&/g, "and")
          .replace(/[^a-z0-9]+/g, "");

      const normalizeText = (value) =>
        String(value || "").trim().toLowerCase();

      const parseItems = (raw) => {
        if (Array.isArray(raw)) return raw;
        if (typeof raw === "string") {
          try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        return [];
      };

      // Number of days represented by the current dashboard filter.
      let periodDays = 30;

      if (rangeMode === "preset") {
        periodDays =
          preset === "day"
            ? 1
            : preset === "week"
              ? 7
              : preset === "year"
                ? 365
                : 30;
      } else if (appliedRange?.from && appliedRange?.to) {
        periodDays = Math.max(
          1,
          Math.ceil(
            (
              new Date(appliedRange.to + "T23:59:59") -
              new Date(appliedRange.from + "T00:00:00")
            ) / 864e5
          )
        );
      }

      /*
        Aggregate actual units sold from the already-filtered transactions.
        Store both an ID key and a normalized-name key because older transaction
        rows may not consistently contain the inventory/ingredient ID.
      */
      const soldById = new Map();
      const soldByName = new Map();

      (Array.isArray(transactions) ? transactions : []).forEach((tx) => {
        const txBranch = normalizeText(tx?.branch);

        parseItems(tx?.items).forEach((item) => {
          const qty = Number(
            item?.qty ??
            item?.quantity ??
            item?.quantity_sold ??
            0
          );

          if (!Number.isFinite(qty) || qty <= 0) return;

          const itemId =
            item?.ingredient_id ??
            item?.inventory_id ??
            item?.product_id ??
            item?.id ??
            null;

          const itemName =
            item?.name ??
            item?.product_name ??
            item?.item_name ??
            item?.title ??
            "";

          /*
            Include branch in the name key where possible so two branches selling
            products with the same name don't accidentally share sales quantities.
          */
          const nameKey = normalizeName(itemName);

          if (itemId != null && itemId !== "") {
            const idKey = `${txBranch}|${String(itemId)}`;
            soldById.set(idKey, (soldById.get(idKey) || 0) + qty);

            // Compatibility key for rows where inventory has no branch.
            const globalIdKey = `|${String(itemId)}`;
            soldById.set(globalIdKey, (soldById.get(globalIdKey) || 0) + qty);
          }

          if (nameKey) {
            const branchNameKey = `${txBranch}|${nameKey}`;
            soldByName.set(
              branchNameKey,
              (soldByName.get(branchNameKey) || 0) + qty
            );

            // Compatibility key for inventory records without a branch value.
            const globalNameKey = `|${nameKey}`;
            soldByName.set(
              globalNameKey,
              (soldByName.get(globalNameKey) || 0) + qty
            );
          }
        });
      });

      const selectedBranchNames =
        filterBrand && selectedBrand
          ? (selectedBrand.branches || [])
              .map((br) => typeof br === "string" ? br : br?.name)
              .filter(Boolean)
          : [];

      const inventoryInScope = (Array.isArray(inventoryRows) ? inventoryRows : [])
        .filter((inv) => {
          const invBranch = String(inv?.branch || "").trim();
          const invBrand = normalizeText(inv?.brand);

          if (filterBranch) {
            return invBranch === filterBranch;
          }

          if (filterBrand && selectedBrand) {
            const branchMatches =
              selectedBranchNames.length === 0 ||
              selectedBranchNames.includes(invBranch);

            const brandMatches =
              !invBrand ||
              invBrand === normalizeText(selectedBrand?.name);

            return branchMatches && brandMatches;
          }

          return true;
        });

      const rows = inventoryInScope
        .map((inv) => {
          const invBranch = normalizeText(inv?.branch);
          const invName = normalizeName(inv?.name);

          const invId =
            inv?.id ??
            inv?.ingredient_id ??
            inv?.inventory_id ??
            null;

          let sold = 0;

          if (invId != null && invId !== "") {
            sold =
              soldById.get(`${invBranch}|${String(invId)}`) ??
              soldById.get(`|${String(invId)}`) ??
              0;
          }

          // Fallback to normalized product name for older transactions.
          if (sold <= 0 && invName) {
            sold =
              soldByName.get(`${invBranch}|${invName}`) ??
              soldByName.get(`|${invName}`) ??
              0;
          }

          /*
            These two charts are sales-vs-stock charts, so only products that
            actually have sales in the selected period are meaningful.
          */
          if (!(sold > 0)) return null;

          const stock = Number(inv?.stock ?? 0);
          const reorder = Number(
            inv?.min_stock ??
            inv?.reorder_point ??
            inv?.minimum_stock ??
            0
          );

          const dailySales = sold / Math.max(periodDays, 1);
          const daysLeft = dailySales > 0 ? stock / dailySales : null;
          const ratio = sold > 0 ? stock / sold : null;

          let status = "OK";
          let recommendation = "Monitor stock level";

          if (
            stock <= reorder ||
            (daysLeft != null && daysLeft < 14)
          ) {
            status = "CRITICAL";
            recommendation = "Restock urgently";
          } else if (
            (daysLeft != null && daysLeft > 90) ||
            (ratio != null && ratio > 3)
          ) {
            status = "OVERSTOCK";
            recommendation = "Reduce ordering / promote";
          } else if (
            daysLeft != null &&
            daysLeft < 30
          ) {
            status = "WATCH";
            recommendation = "Reorder soon";
          }

          return {
            id: invId,
            name: inv?.name || "Unnamed Product",
            branch: inv?.branch || "Unassigned",
            brand: inv?.brand || "",
            stock,
            reorder,
            sold,
            daysLeft,
            ratio,
            status,
            recommendation,
            unit: inv?.unit || "units",
          };
        })
        .filter(Boolean);

      /*
        Put the products with the greatest sales first, while still keeping
        critical items visible near the top.
      */
      rows.sort((a, b) => {
        const priority = {
          CRITICAL: 0,
          WATCH: 1,
          OK: 2,
          OVERSTOCK: 3,
        };

        const p = (priority[a.status] ?? 9) - (priority[b.status] ?? 9);
        return p !== 0 ? p : b.sold - a.sold;
      });

      return rows.slice(0, 10);
    }, [
      transactions,
      inventoryRows,
      preset,
      rangeMode,
      appliedRange,
      filterBranch,
      filterBrand,
      selectedBrand,
    ]);

    const revenuePie = top10.slice(0, 5).map((p, i) => ({
      label: p.name.length > 14 ? p.name.slice(0, 14) + "…" : p.name,
      value: p.totalRevenue,
      color: PAL[i],
    }));
    const moverPie = totalSKUs > 0 ? [
      { label: "Fast Movers", value: fastCount,                                      color: "#059669" },
      { label: "Slow Movers", value: slowCount,                                      color: "#dc2626" },
      { label: "Normal",      value: Math.max(0, totalSKUs - fastCount - slowCount), color: "#94a3b8" },
    ].filter(d => d.value > 0) : [];

    const TABS = [
      { id: "top10",  label: "Top Products",   icon: BarChart2    },
      { id: "fast",   label: "Fast Movers",    icon: TrendingUp   },
      { id: "slow",   label: "Slow Movers",    icon: TrendingDown },
      { id: "buyers", label: "Top Performers", icon: Target       },
    ];
    const tabSt = (a) => ({
      padding: "6px 13px", borderRadius: 8, border: "none", fontSize: 11.5, fontWeight: 700,
      cursor: "pointer", fontFamily: FONT, transition: "all .15s", display: "inline-flex", alignItems: "center", gap: 5,
      background: a ? "linear-gradient(135deg,#00c853,#00897b)" : "transparent",
      color:      a ? "#fff" : "#5a7a65",
      boxShadow:  a ? "0 2px 8px rgba(0,180,90,.28)" : "none",
    });
    const RANK_COLORS = ["#f59e0b", "#94a3b8", "#cd7c2e"];

    const renderList = () => {
      const isBuyers = tab === "buyers";
      const list = isBuyers ? data?.topBuyers : tab === "top10" ? top10 : tab === "fast" ? fast : slow;
      if (!list?.length) return (
        <div style={{ padding: "28px 0", textAlign: "center", color: "#9ca3af", fontSize: 12, border: "1.5px dashed #d1eedd", borderRadius: 10, fontFamily: FONT }}>No data for this filter.</div>
      );
      const maxR = Math.max(1, ...list.map(p => isBuyers ? p.totalItems : p.totalRevenue));
      const maxQ = isBuyers ? maxR : Math.max(1, ...list.map(p => p.totalQty));
      return list.slice(0, 8).map((p, i) => (
        <div key={p.name}
          style={{ display: "grid", gridTemplateColumns: isBuyers ? "28px 1fr 70px 1fr" : "28px 1fr 65px 70px 1fr", gap: 8, alignItems: "center", padding: "8px 10px", borderBottom: "1px solid #f4fbf6", borderRadius: 7, transition: "background .1s", cursor: "default" }}
          onMouseEnter={e => e.currentTarget.style.background = "#f4fbf6"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: 7, background: i < 3 ? ["rgba(245,158,11,0.12)","rgba(148,163,184,0.15)","rgba(205,124,46,0.12)"][i] : "#f4f6f8", fontWeight: 800, fontSize: 11, color: i < 3 ? RANK_COLORS[i] : "#9ca3af", fontFamily: FONT }}>
            {i + 1}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: "#0d2b1e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: FONT }}>{p.name}</div>
            {!isBuyers && p.branchBreakdown && (
              <div style={{ fontSize: 9.5, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: FONT }}>
                {Object.entries(p.branchBreakdown).slice(0, 2).map(([br, q]) => `${br} · ${p.brand || p.brandName || selectedBrand?.name || "Brand not set"}: ${q}`).join(" | ")}
              </div>
            )}
          </div>
          {!isBuyers && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 800, fontSize: 11, color: "#0d2b1e", fontFamily: FONT }}>{p.totalQty?.toLocaleString()}</div>
              <div style={{ height: 3, borderRadius: 2, background: "#e8f5e9", marginTop: 2 }}>
                <div style={{ height: "100%", borderRadius: 2, width: `${(p.totalQty / maxQ) * 100}%`, background: PAL[i % PAL.length] }} />
              </div>
            </div>
          )}
          <div style={{ textAlign: "right", fontWeight: 700, fontSize: 12, color: "#00897b", fontFamily: FONT }}>
            {isBuyers ? p.totalItems?.toLocaleString() : fmtPeso1(p.totalRevenue)}
          </div>
          <div style={{ paddingLeft: 8 }}>
            {isBuyers
              ? <span style={{ background: "#e0f2f1", color: "#00695c", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, display: "inline-block", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: FONT }}>{p.topProduct}</span>
              : <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#f0fdf5", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 3, width: `${(p.totalRevenue / maxR) * 100}%`, background: `linear-gradient(90deg,${PAL[i % PAL.length]},${PAL[(i + 2) % PAL.length]})` }} />
                  </div>
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: "#94a3b8", minWidth: 28, textAlign: "right", fontFamily: FONT }}>{Math.round((p.totalRevenue / maxR) * 100)}%</span>
                </div>
            }
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
            <button onClick={fetchData} disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 9, border: "1.5px solid rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: FONT }}>
              <RefreshCw size={12} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
              {loading ? "Loading…" : "Refresh"}
            </button>
          }
        />
        <div style={{ padding: "18px 20px" }}>
          {stockEvidence.length > 0 && <div style={{background:"#fff",border:"1px solid #d1eedd",borderRadius:14,padding:"16px 18px",marginBottom:18,overflowX:"auto"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:13}}><span style={{width:4,height:18,borderRadius:4,background:"#22c55e"}}/><strong style={{fontSize:13,color:"#102a1c"}}>Inventory Recommendation Report</strong><span style={{fontSize:9.5,fontWeight:800,padding:"3px 8px",borderRadius:20,background:"#ecfdf5",color:"#15803d",border:"1px solid #bbf7d0"}}>ACTUAL STOCK + SALES</span></div>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:760,fontFamily:FONT}}><thead><tr>{["Product / Brand","Stock","Period Sales","Reorder Pt","Days Left","Status","Recommendation"].map(h=><th key={h} style={{padding:"8px 10px",textAlign:h==="Product / Brand"||h==="Recommendation"?"left":"center",fontSize:9.5,color:"#8290a3",textTransform:"uppercase",letterSpacing:".06em",borderBottom:"1px solid #d1eedd"}}>{h}</th>)}</tr></thead><tbody>{stockEvidence.map((r,i)=><tr key={`${r.name}-${r.branch}-${r.brand}`} style={{background:i%2?"#f5fcf7":"#fff"}}><td style={{padding:"10px",fontSize:11,color:"#183126"}}><div style={{fontWeight:800}}>{r.name}</div><div style={{fontSize:9.3,color:"#789086",fontWeight:650,marginTop:3}}>{r.brand || selectedBrand?.name || "Brand not set"}{r.branch&&r.branch!=="Unassigned"?` · ${r.branch}`:""}</div></td><td style={{padding:"10px",fontSize:11,textAlign:"center",fontWeight:800}}>{r.stock}</td><td style={{padding:"10px",fontSize:11,textAlign:"center"}}>{r.sold}</td><td style={{padding:"10px",fontSize:11,textAlign:"center"}}>{r.reorder}</td><td style={{padding:"10px",fontSize:11,textAlign:"center",fontWeight:800,color:r.status==="CRITICAL"?"#ef4444":"#334155"}}>{r.daysLeft==null?"—":`${Math.round(r.daysLeft)}d`}</td><td style={{padding:"10px",textAlign:"center"}}><span style={{fontSize:9,fontWeight:800,padding:"3px 8px",borderRadius:20,background:r.status==="CRITICAL"?"#fef2f2":r.status==="OVERSTOCK"?"#eff6ff":r.status==="WATCH"?"#fffbeb":"#ecfdf5",color:r.status==="CRITICAL"?"#ef4444":r.status==="OVERSTOCK"?"#2563eb":r.status==="WATCH"?"#d97706":"#15803d",border:"1px solid currentColor"}}>{r.status}</span></td><td style={{padding:"10px",fontSize:10.5,fontWeight:700,color:r.status==="CRITICAL"?"#ef4444":r.status==="OVERSTOCK"?"#2563eb":"#15803d"}}>{r.recommendation}</td></tr>)}</tbody></table>
          </div>}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 18 }}>
            {[
              { label: "SKUs Tracked",       value: totalSKUs || "—", color: "#0d2b1e", bg: "#f0fdf5",  border: "#d1eedd",  icon: Layers    },
              { label: "Fast Movers",         value: fastCount || "—", color: "#059669", bg: "#ecfdf5",  border: "#a7f3d0",  icon: TrendingUp },
              { label: "Slow Movers",         value: slowCount || "—", color: "#dc2626", bg: "#fef2f2",  border: "#fecaca",  icon: TrendingDown },
            { label: "Avg Units Sold / Product", value: data?.avgQty ? `${Number(data.avgQty).toLocaleString()} units` : "—", color: "#1e40af", bg: "#eff6ff", border: "#bfdbfe", icon: Activity },
            ].map((s, i) => (
              <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: "11px 13px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                  <s.icon size={11} color={s.color} />
                  <span style={{ fontSize: 9.5, fontWeight: 800, color: "#5a7a65", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: FONT }}>{s.label}</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: FONT }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18 }}>
            <div>
              <div style={{ display: "flex", gap: 3, background: "#f4f8f5", borderRadius: 11, padding: 4, marginBottom: 14, flexWrap: "wrap" }}>
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)} style={tabSt(tab === t.id)}>
                    <t.icon size={11} /> {t.label}
                  </button>
                ))}
              </div>
              {!loading && (top10.length > 0 || fast.length > 0 || slow.length > 0 || data?.topBuyers?.length > 0) && (
                <div style={{ display: "grid", gridTemplateColumns: tab === "buyers" ? "28px 1fr 70px 1fr" : "28px 1fr 65px 70px 1fr", gap: 8, padding: "7px 10px", borderBottom: "2px solid #e8f5e9", fontSize: 9.5, fontWeight: 800, color: "#00897b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4, fontFamily: FONT }}>
                  <span>#</span><span>Name</span>
                  {tab !== "buyers" && <span style={{ textAlign: "right" }}>Units</span>}
                  <span style={{ textAlign: "right" }}>{tab === "buyers" ? "Items" : "Revenue"}</span>
                  <span style={{ paddingLeft: 8 }}>{tab === "buyers" ? "Top Product" : "Share"}</span>
                </div>
              )}
              {loading
                ? <div style={{ padding: "36px 0", textAlign: "center" }}>
                    <div style={{ width: 28, height: 28, border: "3px solid #d1eedd", borderTopColor: "#00897b", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 10px" }} />
                    <div style={{ fontSize: 12, color: "#5a7a65", fontFamily: FONT }}>Loading…</div>
                  </div>
                : renderList()
              }
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "#f8fffe", border: "1px solid #e0f2f1", borderRadius: 14, padding: "13px 14px" }}>
                <ChartLabel><PieChart size={11} color="#00897b" /> Revenue Share (Top 5)</ChartLabel>
                {revenuePie.length > 0
                  ? <DonutChartSVG segments={revenuePie} size={120} />
                  : <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center", color: "#b2dfdb", fontSize: 12, fontFamily: FONT }}>—</div>
                }
              </div>
              <div style={{ background: "#f8fffe", border: "1px solid #e0f2f1", borderRadius: 14, padding: "13px 14px" }}>
                <ChartLabel><Activity size={11} color="#00897b" /> Product Velocity</ChartLabel>
                {moverPie.length > 0
                  ? <DonutChartSVG segments={moverPie} size={110} centerLabel={totalSKUs.toString()} centerSub="SKUs" />
                  : <div style={{ height: 90, display: "flex", alignItems: "center", justifyContent: "center", color: "#b2dfdb", fontSize: 12, fontFamily: FONT }}>—</div>
                }
              </div>
              <div style={{ background: "#f8fffe", border: "1px solid #e0f2f1", borderRadius: 14, padding: "13px 14px" }}>
                <ChartLabel><ShoppingCart size={11} color="#00897b" /> Stock Recommendations</ChartLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {[
                    { label: "Reorder Soon",  count: slowCount || 0,                                     color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: AlertTriangle },
                    { label: "Healthy Stock", count: Math.max(0, totalSKUs - slowCount - fastCount),     color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", icon: CheckCircle   },
                    { label: "High Demand",   count: fastCount || 0,                                     color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe", icon: TrendingUp    },
                  ].map((r, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, background: r.bg, border: `1px solid ${r.border}`, borderRadius: 9, padding: "8px 11px" }}>
                      <r.icon size={13} color={r.color} />
                      <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: "#0d2b1e", fontFamily: FONT }}>{r.label}</span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: r.color, fontFamily: FONT }}>{r.count}</span>
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

  function InfoModal({ modal, onClose, onConfirm }) {
    if (!modal) return null;
    const { type = "info", title, message, confirmLabel, cancelLabel, confirmTone = "danger" } = modal;

    const iconMap = {
      error: (
        <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ),
      success: (
        <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
      info: (
        <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      ),
      warning: (
        <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ),
      confirm: (
        <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ),
    };

    const hc = {
      error:   { bg: "#fef2f2", border: "#fecaca", titleColor: "#991b1b" },
      success: { bg: "#e8f5e9", border: "#c8e6c9", titleColor: "#00695c" },
      info:    { bg: "#eff6ff", border: "#bfdbfe", titleColor: "#1e3a8a" },
      warning: { bg: "#fffbeb", border: "#fed7aa", titleColor: "#92400e" },
      confirm: { bg: "#fffbeb", border: "#fed7aa", titleColor: "#92400e" },
    }[type] || { bg: "#eff6ff", border: "#bfdbfe", titleColor: "#1e3a8a" };

    return (
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(13,43,30,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 3000, padding: 20, backdropFilter: "blur(4px)",
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: "#fff", borderRadius: 16, width: "100%", maxWidth: 400,
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)", border: `1px solid ${hc.border}`,
            fontFamily: FONT, overflow: "hidden",
          }}
        >
          <div style={{ background: hc.bg, padding: "20px 24px 16px", borderBottom: `1px solid ${hc.border}`, display: "flex", alignItems: "flex-start", gap: 13 }}>
            <div style={{ flexShrink: 0, marginTop: 1 }}>{iconMap[type]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: hc.titleColor, marginBottom: 4, fontFamily: FONT }}>{title}</div>
              {message && (
                <div style={{ fontSize: 13, color: "#0d2b1e", lineHeight: 1.6, opacity: 0.85, fontFamily: FONT }}>{message}</div>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                flexShrink: 0, width: 26, height: 26, borderRadius: "50%",
                border: `1px solid ${hc.border}`, background: "transparent", cursor: "pointer",
                color: "#5a7a65", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div style={{ padding: "14px 24px", display: "flex", justifyContent: "flex-end", gap: 8 }}>
            {type === "confirm" && (
              <button
                onClick={onClose}
                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #b2dfdb", background: "#f0fdf5", color: "#5a7a65", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}
              >
                {cancelLabel || "Cancel"}
              </button>
            )}
            <button
              onClick={type === "confirm" ? onConfirm : onClose}
              style={{
                padding: "8px 18px", borderRadius: 8, border: "none",
                background: type === "confirm"
                  ? (confirmTone === "success" ? "linear-gradient(135deg,#2E7D32,#00897b)" : "linear-gradient(135deg,#ef4444,#dc2626)")
                  : "linear-gradient(135deg,#00c853,#00897b)",
                color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT,
              }}
            >
              {confirmLabel || "OK"}
            </button>
          </div>
        </div>
      </div>
    );
  }



  function DashboardLineGraph({ labels = [], values = [], height = 230 }) {
    const [hover, setHover] = useState(null);
    const W = 760, H = height, PL = 54, PR = 18, PT = 20, PB = 38;
    const safeValues = values.map(v => Number(v || 0));
    const max = Math.max(...safeValues, 1);
    const pW = W - PL - PR, pH = H - PT - PB;
    const x = i => labels.length <= 1 ? PL + pW / 2 : PL + (i / (labels.length - 1)) * pW;
    const y = v => PT + pH - (Number(v || 0) / max) * pH;
    const points = safeValues.map((v, i) => `${x(i)},${y(v)}`).join(" ");
    const tickIdx = labels.length <= 7 ? labels.map((_,i)=>i) : Array.from(new Set([0, ...Array.from({length:5},(_,i)=>Math.round((i+1)*(labels.length-1)/6)), labels.length-1]));
    const grid = [0,.25,.5,.75,1];

    if (!labels.length || !values.length) return <DashboardEmptyState message="No revenue data for the selected period." />;

    return (
      <div style={{ position:"relative", width:"100%" }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={height} role="img" aria-label="Revenue trend chart">
          {grid.map((g,i) => { const yy = PT + pH - g*pH; return (
            <g key={i}>
              <line x1={PL} y1={yy} x2={W-PR} y2={yy} stroke="#E8EEE5" strokeWidth="1" />
              <text x={PL-9} y={yy+4} textAnchor="end" fontSize="10" fill="#7A887B" fontFamily={FONT}>{fmtShort(max*g)}</text>
            </g>
          )})}
          <polyline points={points} fill="none" stroke="#3b791e" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          {safeValues.map((v,i)=>(
            <g key={i}>
              <circle cx={x(i)} cy={y(v)} r={hover===i?5:3.5} fill="#fff" stroke="#3b791e" strokeWidth="2.5" onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)} style={{cursor:"pointer"}} />
              <rect x={x(i)-10} y={PT} width="20" height={pH} fill="transparent" onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)} />
            </g>
          ))}
          {tickIdx.map(i => <text key={i} x={x(i)} y={H-12} textAnchor="middle" fontSize="10" fill="#7A887B" fontFamily={FONT}>{labels[i]}</text>)}
        </svg>
        {hover != null && (
          <div style={{ position:"absolute", top:8, right:10, background:"#12241B", color:"#fff", borderRadius:9, padding:"7px 10px", fontSize:11, fontWeight:700, boxShadow:"0 8px 20px rgba(18,36,27,.18)", pointerEvents:"none" }}>
            <div style={{opacity:.7, fontSize:9.5, marginBottom:2}}>{labels[hover]}</div>
            {fmtAmt(safeValues[hover])}
          </div>
        )}
      </div>
    );
  }

  function DashboardBarGraph({ labels = [], values = [], height = 230 }) {
    const [hover, setHover] = useState(null);
    const W = 760, H = height, PL = 46, PR = 16, PT = 20, PB = 38;
    const safeValues = values.map(v => Number(v || 0));
    const max = Math.max(...safeValues, 1);
    const pW = W-PL-PR, pH = H-PT-PB;
    const gap = 6;
    const bw = Math.max(4, (pW / Math.max(labels.length,1)) - gap);
    const tickIdx = labels.length <= 7 ? labels.map((_,i)=>i) : Array.from(new Set([0, ...Array.from({length:5},(_,i)=>Math.round((i+1)*(labels.length-1)/6)), labels.length-1]));
    const grid=[0,.25,.5,.75,1];
    if (!labels.length || !values.length) return <DashboardEmptyState message="No transaction data for the selected period." />;
    return (
      <div style={{position:"relative", width:"100%"}}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={height} role="img" aria-label="Transaction volume chart">
          {grid.map((g,i)=>{const yy=PT+pH-g*pH;return <g key={i}><line x1={PL} y1={yy} x2={W-PR} y2={yy} stroke="#E8EEE5"/><text x={PL-8} y={yy+4} textAnchor="end" fontSize="10" fill="#7A887B" fontFamily={FONT}>{Math.round(max*g)}</text></g>})}
          {safeValues.map((v,i)=>{
            const slot=pW/Math.max(labels.length,1); const xx=PL+i*slot+(slot-bw)/2; const hh=(v/max)*pH; const yy=PT+pH-hh;
            return <rect key={i} x={xx} y={yy} width={bw} height={Math.max(hh,1)} rx="4" fill={hover===i?"#2c5c16":"#c9dba0"} onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)} style={{cursor:"pointer"}}/>
          })}
          {tickIdx.map(i=>{const slot=pW/Math.max(labels.length,1);return <text key={i} x={PL+i*slot+slot/2} y={H-12} textAnchor="middle" fontSize="10" fill="#7A887B" fontFamily={FONT}>{labels[i]}</text>})}
        </svg>
        {hover != null && <div style={{position:"absolute",top:8,right:10,background:"#12241B",color:"#fff",borderRadius:9,padding:"7px 10px",fontSize:11,fontWeight:700,pointerEvents:"none"}}><div style={{opacity:.7,fontSize:9.5,marginBottom:2}}>{labels[hover]}</div>{safeValues[hover].toLocaleString()} transactions</div>}
      </div>
    );
  }

  function DashboardEmptyState({ message }) {
    return <div style={{height:230,display:"flex",alignItems:"center",justifyContent:"center",border:"1px dashed #D7E1D4",borderRadius:12,background:"#FAFCF8",color:"#7A887B",fontSize:12,fontWeight:600,textAlign:"center",padding:20}}>{message}</div>;
  }

  function DashboardRankBars({ data = [] }) {
    if (!data.length) return <DashboardEmptyState message="No branch sales data for the selected period." />;
    const max = Math.max(...data.map(d=>d.value),1);
    return <div style={{display:"flex",flexDirection:"column",gap:13,padding:"4px 0 2px"}}>
      {data.slice(0,6).map((d,i)=><div key={`${d.label}-${i}`}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:6}}>
          <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}><span style={{width:22,height:22,borderRadius:7,background:"#F1F5EC",color:"#3b791e",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,flexShrink:0}}>{i+1}</span><span style={{fontSize:12,fontWeight:700,color:"#243128",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.label}</span></div>
          <strong style={{fontSize:12,color:"#243128",whiteSpace:"nowrap"}}>{fmtAmt(d.value)}</strong>
        </div>
        <div style={{height:8,borderRadius:999,background:"#EEF2EA",overflow:"hidden"}}><div style={{height:"100%",width:`${(d.value/max)*100}%`,borderRadius:999,background:"linear-gradient(90deg,#3b791e,#bdd43c)"}}/></div>
      </div>)}
    </div>;
  }

  // ─── FranchiSync B2B Revenue Assurance Dashboard ────────────────────────────
  const B2B_DEFAULT_GROWTH_TARGET = 20;
  const B2B_FALLBACK_THRESHOLDS = {
    highOrderDropPct: 25,
    watchOrderDropPct: 10,
    posStableFloorPct: -5,
  };

  const b2bNum = (...values) => {
    for (const value of values) {
      const n = Number(value);
      if (value !== null && value !== undefined && value !== "" && Number.isFinite(n)) return n;
    }
    return 0;
  };

  const b2bNullableNum = (...values) => {
    for (const value of values) {
      if (value === null || value === undefined || value === "") continue;
      const n = Number(value);
      if (Number.isFinite(n)) return n;
    }
    return null;
  };

  const b2bArray = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch { return []; }
    }
    return [];
  };

  const b2bMonthKey = (value) => {
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  const b2bShiftMonth = (monthKey, delta) => {
    const [y, m] = String(monthKey || "").split("-").map(Number);
    if (!y || !m) return b2bMonthKey(new Date());
    return b2bMonthKey(new Date(y, m - 1 + delta, 1));
  };

  const b2bMonthLabel = (monthKey) => {
    const [y, m] = String(monthKey || "").split("-").map(Number);
    if (!y || !m) return monthKey || "—";
    return new Date(y, m - 1, 1).toLocaleDateString("en-PH", { month: "short", year: "numeric" });
  };

  const b2bDateOfOrder = (o) => o?.order_date || o?.created_at || o?.createdAt || o?.updated_at || null;
  const b2bDateOfTx = (tx) => tx?.date || tx?.created_at || tx?.createdAt || tx?.transaction_date || null;
  const b2bDateOfInventory = (row) => row?.snapshot_date || row?.counted_at || row?.stock_date || row?.as_of_date || row?.updated_at || null;
  const b2bOrderAmount = (o) => b2bNum(o?.net_amount, o?.total_amount, o?.total, o?.amount);
  const b2bTxAmount = (tx) => b2bNum(tx?.net_total, tx?.total, tx?.total_amount, tx?.grand_total);
  const b2bBranchName = (row) => String(row?.branch_name || row?.branch || row?.store_name || row?.store || "").trim();
  const b2bBrandName = (row) => String(row?.brand_name || row?.brand || "").trim();
  const b2bOrderItems = (o) => b2bArray(o?.items || o?.order_items || o?.orderItems);
  const b2bTxItems = (tx) => b2bArray(tx?.items || tx?.transaction_items || tx?.transactionItems);
  const b2bItemQty = (item) => b2bNum(item?.qty_received, item?.received_qty, item?.qty, item?.quantity, item?.quantity_sold);
  const b2bItemId = (item) => item?.product_id ?? item?.inventory_id ?? item?.ingredient_id ?? item?.shop_item_id ?? item?.id ?? null;
  const b2bItemName = (item) => String(item?.product_name || item?.item_name || item?.name || item?.title || (b2bItemId(item) != null ? `SKU ${b2bItemId(item)}` : "Unknown SKU")).trim();
  const b2bInventoryOpening = (item) => b2bNullableNum(item?.opening_stock, item?.openingStock, item?.beginning_stock, item?.beginningStock);
  const b2bInventoryClosing = (item) => b2bNullableNum(item?.closing_stock, item?.closingStock, item?.ending_stock, item?.endingStock, item?.on_hand, item?.current_stock, item?.stock);
  const b2bInventoryDisposal = (item) => b2bNullableNum(item?.disposed_qty, item?.disposal_qty, item?.disposed, item?.waste_qty, item?.waste);
  const b2bInventoryTransferIn = (item) => b2bNullableNum(item?.transfer_in, item?.transferIn, item?.transfers_in);
  const b2bInventoryTransferOut = (item) => b2bNullableNum(item?.transfer_out, item?.transferOut, item?.transfers_out);
  const b2bInventoryAdjustment = (item) => b2bNullableNum(item?.manual_adjustment, item?.adjustment_qty, item?.adjustment);
  const b2bKeyPart = (value) => String(value || "").trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "");
  const b2bSkuKey = (item, parentBrand, parentBranch) => [
    b2bKeyPart(parentBranch || b2bBranchName(item)),
    b2bKeyPart(parentBrand || b2bBrandName(item)),
    b2bKeyPart(b2bItemName(item)) || String(b2bItemId(item) ?? "unknown"),
  ].join("|");

  const b2bIsEarnedOrder = (o) => {
    const s = String(o?.status || "").toLowerCase();
    return ["received", "delivered", "fulfilled", "completed", "complete"].includes(s);
  };

  const b2bIsCompletedTx = (tx) => {
    if (tx?.is_voided || tx?.voided || String(tx?.status || "").toLowerCase() === "void") return false;
    const status = String(tx?.status || "").toLowerCase();
    if (!status) return true;
    return ["paid", "completed", "complete", "success", "successful"].includes(status);
  };

  function B2BRiskBadge({ risk }) {
    const normalized = String(risk || "Normal").toLowerCase();
    const high = normalized.includes("high") || normalized.includes("critical");
    const watch = normalized.includes("watch") || normalized.includes("medium") || normalized.includes("moderate");
    const label = high ? "High Risk" : watch ? "Watch" : "Normal";
    const style = high
      ? { color: "#b42318", background: "#fff1f0", border: "#fecdca" }
      : watch
        ? { color: "#b54708", background: "#fffaeb", border: "#fedf89" }
        : { color: "#2c5c16", background: "#f0f5e8", border: "#c9dba0" };
    return (
      <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 9px", borderRadius:20, border:`1px solid ${style.border}`, background:style.background, color:style.color, fontSize:10.5, fontWeight:800, whiteSpace:"nowrap" }}>
        <span style={{ width:6, height:6, borderRadius:"50%", background:style.color }} />
        {label}
      </span>
    );
  }

  const b2bMaskedValue = (value) => {
    const text = String(value ?? "");
    if (!text || text === "—") return "—";
    if (text.trim().startsWith("₱")) return "₱••••••";
    if (text.includes("%")) return "•••%";
    return "••••";
  };

  function B2BVisibilityIcon({ masked, size=15 }) {
    return masked ? (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    ) : (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  function B2BMetricCard({ label, value, note, icon: Icon, tone="green", onClick, loading=false, defaultMasked=false, maskable=true }) {
    const [masked, setMasked] = useState(defaultMasked);
    const tones = {
      green: { iconBg:"#eef7e9", icon:"#3b791e", accent:"#3b791e" },
      blue:  { iconBg:"#eff6ff", icon:"#2563eb", accent:"#2563eb" },
      amber: { iconBg:"#fff7ed", icon:"#b45309", accent:"#b45309" },
      red:   { iconBg:"#fef2f2", icon:"#c0392b", accent:"#c0392b" },
    };
    const t = tones[tone] || tones.green;
    const displayValue = loading ? "…" : masked ? b2bMaskedValue(value) : value;
    const open = () => { if (onClick) onClick(); };
    return (
      <div
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={onClick ? `Open ${label} breakdown` : label}
        onClick={open}
        onKeyDown={e=>{ if(onClick && (e.key==="Enter" || e.key===" ")){ e.preventDefault(); open(); } }}
        style={{ textAlign:"left", width:"100%", background:"#fff", border:"1px solid #E1E6D8", borderRadius:16, padding:"16px 17px", boxShadow:"0 2px 12px rgba(50,109,32,.06)", cursor:onClick?"pointer":"default", fontFamily:FONT, minHeight:126, transition:"transform .15s ease, box-shadow .15s ease", position:"relative", outline:"none" }}
        onMouseEnter={e=>{ if(onClick){ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(50,109,32,.10)"; } }}
        onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 2px 12px rgba(50,109,32,.06)"; }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10 }}>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:".07em", textTransform:"uppercase", color:"#6B7A65" }}>{label}</div>
            <div style={{ fontSize:21, fontWeight:850, color:"#12241B", marginTop:7, lineHeight:1.15, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {displayValue}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
            {maskable && (
              <button
                type="button"
                onClick={e=>{ e.stopPropagation(); setMasked(v=>!v); }}
                onKeyDown={e=>e.stopPropagation()}
                aria-label={masked ? `Show ${label}` : `Hide ${label}`}
                title={masked ? "Show value" : "Hide value"}
                style={{ width:29, height:29, borderRadius:9, border:"1px solid #DDE8DA", background:"#fff", color:"#64748b", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", padding:0 }}
              >
                <B2BVisibilityIcon masked={masked} size={14}/>
              </button>
            )}
            <div style={{ width:36, height:36, borderRadius:11, background:t.iconBg, color:t.icon, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {Icon ? <Icon size={17}/> : null}
            </div>
          </div>
        </div>
        <div style={{ marginTop:10, paddingTop:9, borderTop:"1px solid #EEF2EA", fontSize:10.5, lineHeight:1.45, color:"#6B7A65", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ flex:1 }}>{note}</span>
          {onClick && <span style={{ display:"inline-flex", alignItems:"center", gap:3, color:t.accent, fontSize:9.5, fontWeight:800, whiteSpace:"nowrap" }}>Breakdown <ChevronRight size={12}/></span>}
        </div>
      </div>
    );
  }

  function B2BSummaryMetricCard({ label, value, loading=false, color="#12241B", border="#E1E6D8", onClick }) {
    const [masked, setMasked] = useState(false);
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={e=>{ if(e.key==="Enter" || e.key===" "){ e.preventDefault(); onClick?.(); } }}
        style={{ background:"rgba(255,255,255,.82)", border:`1px solid ${border}`, borderRadius:11, padding:"10px 12px", cursor:"pointer", position:"relative", transition:"transform .15s ease, box-shadow .15s ease", outline:"none" }}
        onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 7px 18px rgba(18,36,27,.09)"; }}
        onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="none"; }}
      >
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
          <div style={{fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:".06em",color:"#71806F"}}>{label}</div>
          <button
            type="button"
            onClick={e=>{e.stopPropagation();setMasked(v=>!v);}}
            onKeyDown={e=>e.stopPropagation()}
            aria-label={masked ? `Show ${label}` : `Hide ${label}`}
            title={masked ? "Show value" : "Hide value"}
            style={{width:26,height:26,borderRadius:8,border:"1px solid #DDE8DA",background:"#fff",color:"#64748b",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:0}}
          >
            <B2BVisibilityIcon masked={masked} size={13}/>
          </button>
        </div>
        <div style={{fontSize:17,fontWeight:850,color,marginTop:4}}>{loading ? "…" : masked ? b2bMaskedValue(value) : value}</div>
        <div style={{fontSize:9.3,fontWeight:800,color:"#3b791e",marginTop:5,display:"flex",alignItems:"center",gap:3}}>View breakdown <ChevronRight size={11}/></div>
      </div>
    );
  }

  function B2BKpiBreakdown({
    metric,
    overview,
    branchRows = [],
    brandRows = [],
    skuRows = [],
    productRows = [],
    anomalies = [],
    month,
    growthTargetPct,
    onOpenBranch,
    onOpenBrand,
    onOpenSku,
  }) {
    const previousHq = Number(overview?.prevHqRevenue || 0);
    const previousPos = Number(overview?.prevPosRevenue || 0);
    const hqGrowth = previousHq > 0 ? ((Number(overview?.hqRevenue || 0) - previousHq) / previousHq) * 100 : null;
    const posGrowth = previousPos > 0 ? ((Number(overview?.posRevenue || 0) - previousPos) / previousPos) * 100 : null;
    const highRiskRows = branchRows.filter(r=>String(r.risk||"").toLowerCase().includes("high"));
    const watchRows = branchRows.filter(r=>/watch|medium|moderate/i.test(String(r.risk||"")));
    const varianceRows = skuRows.filter(r=>r.stockVariance!=null && Number(r.stockVariance)!==0);
    const suppliedUnits = brandRows.reduce((sum,r)=>sum+Number(r.suppliedQty||0),0);
    const soldUnits = brandRows.reduce((sum,r)=>sum+Number(r.soldQty||0),0);
    const endingUnits = brandRows.reduce((sum,r)=>sum+Number(r.endingStock||0),0);
    const revenueDifference = Number(overview?.posRevenue || 0) - Number(overview?.hqRevenue || 0);

    const metricMeta = {
      hqRevenue: {
        title:"HQ Supply Revenue",
        description:"Fulfilled and delivered Head Office supply orders for the active filters.",
        formula:"Sum of net amounts from fulfilled or delivered Head Office orders.",
      },
      hqPrevious: {
        title:"Previous-Month HQ Revenue",
        description:"The prior-month baseline used for growth and target calculations.",
        formula:"Sum of prior-month fulfilled or delivered Head Office supply orders.",
      },
      hqChange: {
        title:"HQ Month-on-Month Change",
        description:"Change in Head Office supply revenue compared with the previous month.",
        formula:"Current HQ revenue − previous HQ revenue; percentage uses previous HQ revenue as the base.",
      },
      posRevenue: {
        title:"Franchisee POS Revenue",
        description:"Paid and completed franchisee POS sales for the active filters.",
        formula:"Sum of net totals from non-voided, paid or completed POS transactions.",
      },
      target: {
        title:"Monthly Target",
        description:"The Head Office supply-revenue goal calculated from the prior month.",
        formula:`Previous HQ revenue × (1 + ${growthTargetPct}% growth target).`,
      },
      targetGap: {
        title:"Target Gap",
        description:"The remaining Head Office supply revenue required to reach the monthly target.",
        formula:"Maximum of zero or monthly target − current HQ supply revenue.",
      },
      coverage: {
        title:"HQ Order Coverage",
        description:"The portion of reported sell-through supported by authorized HQ stock flow.",
        formula:"Authorized HQ-supplied sellable units ÷ reported POS-sold units × 100.",
      },
      atRisk: {
        title:"At-Risk Branches",
        description:"Branches with high-risk or watch signals under the current filters.",
        formula:"Count of branches whose stock and supply risk rules return High Risk or Watch.",
      },
      unexplained: {
        title:"Unexplained Stock",
        description:"Stock variance that cannot yet be explained by authorized receipts, sales, disposal, or transfers.",
        formula:"Opening + HQ receipts + transfer in − POS sold − disposal − transfer out − recorded closing.",
      },
      sellThrough: {
        title:"Sell-through",
        description:"How much available sellable inventory was sold through POS.",
        formula:"POS-sold units ÷ sellable units available × 100.",
      },
    };
    const meta = metricMeta[metric] || metricMeta.hqRevenue;

    const summariesByMetric = {
      hqRevenue: [
        ["Current HQ Revenue", fmtAmt(overview?.hqRevenue), Package, "green", "Selected month"],
        ["Previous HQ Revenue", previousHq > 0 ? fmtAmt(previousHq) : "—", History, "blue", "Comparison baseline"],
        ["MoM Growth", hqGrowth==null ? "—" : `${hqGrowth>=0?"+":""}${hqGrowth.toFixed(1)}%`, TrendingUp, hqGrowth!=null&&hqGrowth<0?"red":"green", "Current vs previous"],
        ["POS Revenue", fmtAmt(overview?.posRevenue), ShoppingCart, "blue", "Sell-through context"],
      ],
      hqPrevious: [
        ["Previous HQ Revenue", previousHq > 0 ? fmtAmt(previousHq) : "—", History, "blue", "Prior month"],
        ["Current HQ Revenue", fmtAmt(overview?.hqRevenue), Package, "green", "Selected month"],
        ["Absolute Change", `${Number(overview?.hqRevenue||0)-previousHq>=0?"+":"−"}${fmtAmt(Math.abs(Number(overview?.hqRevenue||0)-previousHq))}`, Activity, "amber", "Current less previous"],
        ["MoM Growth", hqGrowth==null ? "—" : `${hqGrowth>=0?"+":""}${hqGrowth.toFixed(1)}%`, TrendingUp, hqGrowth!=null&&hqGrowth<0?"red":"green", "Percentage change"],
      ],
      hqChange: [
        ["Absolute Change", `${Number(overview?.hqRevenue||0)-previousHq>=0?"+":"−"}${fmtAmt(Math.abs(Number(overview?.hqRevenue||0)-previousHq))}`, Activity, "amber", "Current less previous"],
        ["MoM Growth", hqGrowth==null ? "—" : `${hqGrowth>=0?"+":""}${hqGrowth.toFixed(1)}%`, TrendingUp, hqGrowth!=null&&hqGrowth<0?"red":"green", "Previous month is base"],
        ["Current HQ Revenue", fmtAmt(overview?.hqRevenue), Package, "green", "Selected month"],
        ["Previous HQ Revenue", previousHq > 0 ? fmtAmt(previousHq) : "—", History, "blue", "Prior month"],
      ],
      posRevenue: [
        ["Current POS Revenue", fmtAmt(overview?.posRevenue), ShoppingCart, "blue", "Selected month"],
        ["Previous POS Revenue", previousPos > 0 ? fmtAmt(previousPos) : "—", History, "green", "Comparison baseline"],
        ["POS MoM Growth", posGrowth==null ? "—" : `${posGrowth>=0?"+":""}${posGrowth.toFixed(1)}%`, TrendingUp, posGrowth!=null&&posGrowth<0?"red":"green", "Current vs previous"],
        ["POS − HQ", `${revenueDifference>=0?"+":"−"}${fmtAmt(Math.abs(revenueDifference))}`, Activity, "amber", "Stock / supply risk signal"],
      ],
      target: [
        ["Monthly Target", fmtAmt(overview?.target), Target, "amber", `${growthTargetPct}% above previous HQ`],
        ["Current HQ Revenue", fmtAmt(overview?.hqRevenue), Package, "green", "Revenue attained"],
        ["Target Attainment", overview?.targetAttainment==null?"—":`${Number(overview.targetAttainment).toFixed(1)}%`, Activity, "blue", "Current ÷ target"],
        ["Target Gap", fmtAmt(overview?.targetGap), TrendingDown, Number(overview?.targetGap)>0?"red":"green", "Remaining requirement"],
      ],
      targetGap: [
        ["Target Gap", fmtAmt(overview?.targetGap), TrendingDown, Number(overview?.targetGap)>0?"red":"green", "Remaining requirement"],
        ["Monthly Target", fmtAmt(overview?.target), Target, "amber", "Goal"],
        ["Current HQ Revenue", fmtAmt(overview?.hqRevenue), Package, "green", "Actual"],
        ["Target Attainment", overview?.targetAttainment==null?"—":`${Number(overview.targetAttainment).toFixed(1)}%`, Activity, "blue", "Actual ÷ goal"],
      ],
      coverage: [
        ["HQ Order Coverage", overview?.coverage==null?"—":`${Number(overview.coverage).toFixed(1)}%`, ShieldCheck, overview?.coverage!=null&&overview.coverage<70?"red":"green", "Authorized supply coverage"],
        ["Branches With Coverage", branchRows.filter(r=>r.orderCoverage!=null).length.toLocaleString(), Store, "blue", "Evidence available"],
        ["Below 70%", branchRows.filter(r=>r.orderCoverage!=null&&r.orderCoverage<70).length.toLocaleString(), AlertTriangle, "red", "Needs review"],
        ["At-Risk Branches", Number(overview?.atRisk||0).toLocaleString(), AlertTriangle, "amber", "All active rules"],
      ],
      atRisk: [
        ["At-Risk Branches", Number(overview?.atRisk||0).toLocaleString(), AlertTriangle, Number(overview?.atRisk)>0?"red":"green", "High Risk + Watch"],
        ["High Risk", highRiskRows.length.toLocaleString(), AlertTriangle, "red", "Immediate review"],
        ["Watch", watchRows.length.toLocaleString(), Activity, "amber", "Monitor"],
        ["Normal", Math.max(0,branchRows.length-highRiskRows.length-watchRows.length).toLocaleString(), CheckCircle2, "green", "No current signal"],
      ],
      unexplained: [
        ["Unexplained Units", overview?.unexplained==null?"—":Number(overview.unexplained).toLocaleString(), Layers, Number(overview?.unexplained)>0?"red":"green", "Absolute variance"],
        ["Affected SKUs", varianceRows.length.toLocaleString(), Package, varianceRows.length?"red":"green", "Non-zero variance"],
        ["Positive Variance", varianceRows.filter(r=>Number(r.stockVariance)>0).length.toLocaleString(), ArrowUp, "amber", "Recorded excess"],
        ["Negative Variance", varianceRows.filter(r=>Number(r.stockVariance)<0).length.toLocaleString(), ArrowDown, "red", "Recorded shortage"],
      ],
      sellThrough: [
        ["Sell-through", overview?.sellThrough==null?"—":`${Number(overview.sellThrough).toFixed(1)}%`, Activity, "green", "Sold ÷ available"],
        ["Units Supplied", suppliedUnits.toLocaleString(), Package, "green", "HQ receipts"],
        ["Units Sold", soldUnits.toLocaleString(), ShoppingCart, "blue", "POS deductions"],
        ["Ending Stock", endingUnits.toLocaleString(), Layers, "amber", "Recorded closing"],
      ],
    };
    const summaries = summariesByMetric[metric] || summariesByMetric.hqRevenue;

    let rows = branchRows;
    let entity = "branch";
    let emptyMessage = "No branch evidence is available for this KPI and filter.";
    let columns = [
      ["Branch / Brand", "left", r=><><b>{r.branch}</b><div style={{fontSize:9,color:"#789086",marginTop:2}}>{r.brand || "Unassigned Brand"}</div></>],
      ["HQ Supply", "right", r=>fmtAmt(r.hqRevenue)],
      ["POS Revenue", "right", r=>fmtAmt(r.posRevenue)],
      ["MoM", "right", r=>r.vsLastMonth==null?"—":`${r.vsLastMonth>=0?"+":""}${r.vsLastMonth.toFixed(1)}%`],
      ["Risk", "right", r=><B2BRiskBadge risk={r.risk}/>],
    ];

    if (metric === "posRevenue") {
      rows = [...branchRows].sort((a,b)=>b.posRevenue-a.posRevenue);
      columns = [
        ["Branch / Brand", "left", r=><><b>{r.branch}</b><div style={{fontSize:9,color:"#789086",marginTop:2}}>{r.brand || "Unassigned Brand"}</div></>],
        ["POS Revenue", "right", r=>fmtAmt(r.posRevenue)],
        ["HQ Supply", "right", r=>fmtAmt(r.hqRevenue)],
        ["POS − HQ", "right", r=>`${r.posRevenue-r.hqRevenue>=0?"+":"−"}${fmtAmt(Math.abs(r.posRevenue-r.hqRevenue))}`],
        ["Risk", "right", r=><B2BRiskBadge risk={r.risk}/>],
      ];
    } else if (metric === "target" || metric === "targetGap") {
      rows = [...branchRows].sort((a,b)=>Number(b.targetGap||0)-Number(a.targetGap||0));
      columns = [
        ["Branch / Brand", "left", r=><><b>{r.branch}</b><div style={{fontSize:9,color:"#789086",marginTop:2}}>{r.brand || "Unassigned Brand"}</div></>],
        ["HQ Supply", "right", r=>fmtAmt(r.hqRevenue)],
        ["Target Attainment", "right", r=>r.targetPct==null?"—":`${r.targetPct.toFixed(1)}%`],
        ["Target Gap", "right", r=>r.targetGap==null?"—":fmtAmt(r.targetGap)],
        ["Risk", "right", r=><B2BRiskBadge risk={r.risk}/>],
      ];
    } else if (metric === "coverage") {
      rows = [...branchRows].sort((a,b)=>Number(a.orderCoverage??999)-Number(b.orderCoverage??999));
      columns = [
        ["Branch / Brand", "left", r=><><b>{r.branch}</b><div style={{fontSize:9,color:"#789086",marginTop:2}}>{r.brand || "Unassigned Brand"}</div></>],
        ["Coverage", "right", r=>r.orderCoverage==null?"—":`${r.orderCoverage.toFixed(1)}%`],
        ["HQ Supply", "right", r=>fmtAmt(r.hqRevenue)],
        ["Stock Variance", "right", r=>r.stockVariance==null?"—":`${r.stockVariance>0?"+":""}${r.stockVariance.toLocaleString()}`],
        ["Risk", "right", r=><B2BRiskBadge risk={r.risk}/>],
      ];
    } else if (metric === "atRisk") {
      rows = [...highRiskRows, ...watchRows];
      columns = [
        ["Branch / Brand", "left", r=><><b>{r.branch}</b><div style={{fontSize:9,color:"#789086",marginTop:2}}>{r.brand || "Unassigned Brand"}</div></>],
        ["Reason", "left", r=>r.reason||"No explanation returned."],
        ["HQ Supply", "right", r=>fmtAmt(r.hqRevenue)],
        ["POS Revenue", "right", r=>fmtAmt(r.posRevenue)],
        ["Risk", "right", r=><B2BRiskBadge risk={r.risk}/>],
      ];
      emptyMessage = "No branch is currently classified as High Risk or Watch.";
    } else if (metric === "unexplained") {
      rows = varianceRows;
      entity = "sku";
      columns = [
        ["SKU / Product", "left", r=><><b>{r.product}</b><div style={{fontSize:9,color:"#94a3b8",marginTop:2}}>{r.branch} · {r.brand}</div></>],
        ["Opening", "right", r=>r.openingStock==null?"—":r.openingStock.toLocaleString()],
        ["HQ Received", "right", r=>Number(r.suppliedQty||0).toLocaleString()],
        ["POS Sold", "right", r=>Number(r.soldQty||0).toLocaleString()],
        ["Closing", "right", r=>r.endingStock==null?"—":r.endingStock.toLocaleString()],
        ["Variance", "right", r=>`${r.stockVariance>0?"+":""}${Number(r.stockVariance).toLocaleString()}`],
      ];
      emptyMessage = "No SKU-level variance evidence is available. Link opening stock, HQ receipts, POS deductions, disposal, transfers, and recorded closing stock.";
    } else if (metric === "sellThrough") {
      rows = [...brandRows].sort((a,b)=>Number(b.sellThrough||0)-Number(a.sellThrough||0));
      entity = "brand";
      columns = [
        ["Brand", "left", r=>r.brand],
        ["Units Supplied", "right", r=>Number(r.suppliedQty||0).toLocaleString()],
        ["Units Sold", "right", r=>Number(r.soldQty||0).toLocaleString()],
        ["Ending Stock", "right", r=>r.endingStock==null?"—":Number(r.endingStock).toLocaleString()],
        ["Sell-through", "right", r=>r.sellThrough==null?"—":`${Number(r.sellThrough).toFixed(1)}%`],
      ];
      emptyMessage = "No brand sell-through evidence is available for the active filters.";
    }

    // POS/at-risk KPIs use sold-product evidence. Supply, target, and coverage
    // KPIs use the stock-flow SKU rows so unlike evidence is never mixed.
    if (metric === "posRevenue" || metric === "atRisk") {
      const evidenceKey = (row) => `${String(row?.brand || "").trim().toLowerCase()}::${String(row?.branch || "").trim().toLowerCase()}`;
      const riskBranchBrands = new Set([...highRiskRows, ...watchRows].map(evidenceKey));
      rows = metric === "atRisk"
        ? productRows.filter(row => riskBranchBrands.has(evidenceKey(row)))
        : productRows;
      entity = "product";
      columns = [
        ["SKU / Product", "left", r=><><b>{r.product}</b><div style={{fontSize:9,color:"#789086",marginTop:2}}>SKU {r.sku}</div></>],
        ["Brand / Branch", "left", r=><><b>{r.brand || "Brand not set"}</b><div style={{fontSize:9,color:"#789086",marginTop:2}}>{r.branch}</div></>],
        ["Units Sold", "right", r=>Number(r.soldQty||0).toLocaleString()],
        ["POS Revenue", "right", r=>fmtAmt(r.revenue)],
        ["Transactions", "right", r=>Number(r.transactionCount||0).toLocaleString()],
        ["Last Sale", "right", r=>r.lastSale ? new Date(r.lastSale).toLocaleDateString("en-PH") : "—"],
      ];
      emptyMessage = metric === "atRisk"
        ? "No sold SKU evidence is available for the currently flagged branches."
        : "No sold SKU evidence is available for the active filters and month.";
    } else if (metric !== "unexplained" && metric !== "sellThrough") {
      rows = skuRows;
      entity = "sku";
      columns = [
        ["SKU / Product", "left", r=><><b>{r.product}</b><div style={{fontSize:9,color:"#789086",marginTop:2}}>SKU {r.sku}</div></>],
        ["Brand / Branch", "left", r=><><b>{r.brand || "Brand not set"}</b><div style={{fontSize:9,color:"#789086",marginTop:2}}>{r.branch}</div></>],
        ["HQ Received", "right", r=>Number(r.suppliedQty||0).toLocaleString()],
        ["POS Sold", "right", r=>Number(r.soldQty||0).toLocaleString()],
        ["Recorded Stock", "right", r=>r.endingStock==null?"—":Number(r.endingStock).toLocaleString()],
        ["Variance", "right", r=>r.stockVariance==null?"—":`${Number(r.stockVariance)>0?"+":""}${Number(r.stockVariance).toLocaleString()}`],
      ];
      emptyMessage = "No SKU stock-flow evidence is available for the active filters and month.";
    }

    const openRow = row => {
      if (entity === "sku" || entity === "product") onOpenSku?.(row);
      else if (entity === "brand") onOpenBrand?.(row);
      else if (entity === "branch") onOpenBranch?.(row);
    };
    const th = {padding:"10px 11px",fontSize:9.5,fontWeight:800,textTransform:"uppercase",letterSpacing:".06em",color:"#71806F",background:"#F6FAF3",borderBottom:"1px solid #DDE8DA",whiteSpace:"nowrap"};
    const td = {padding:"11px",fontSize:10.8,color:"#334155",borderBottom:"1px solid #EEF3EC",verticalAlign:"top"};

    return (
      <div>
        <div style={{padding:"11px 13px",borderRadius:11,background:"#F6FAF3",border:"1px solid #DDE8DA",marginBottom:13}}>
          <div style={{fontSize:12,fontWeight:850,color:"#12241B"}}>{meta.title}</div>
          <div style={{fontSize:10.7,color:"#5C6B60",lineHeight:1.55,marginTop:4}}>{meta.description}</div>
          <div style={{fontSize:10,color:"#3b791e",fontWeight:750,lineHeight:1.5,marginTop:5}}><b>Formula:</b> {meta.formula}</div>
          <div style={{fontSize:9.7,color:"#82907F",marginTop:4}}>Scope: {b2bMonthLabel(month)} · current Brand, Branch, and Risk filters</div>
        </div>

        <div className="b2b-kpi-grid" style={{gridTemplateColumns:"repeat(4,minmax(0,1fr))",marginBottom:14}}>
          {summaries.map(([label,value,Icon,tone,note])=><B2BMetricCard key={label} label={label} value={value} icon={Icon} tone={tone} note={note}/>) }
        </div>

        <div style={{fontSize:11,fontWeight:850,color:"#12241B",marginBottom:8}}>Evidence breakdown</div>
        <div style={{overflowX:"auto",border:"1px solid #E7EEE4",borderRadius:13}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:760}}>
            <thead><tr>{columns.map(([label,align])=><th key={label} style={{...th,textAlign:align}}>{label}</th>)}</tr></thead>
            <tbody>
              {rows.length ? rows.slice(0,20).map((row,index)=>(
                <tr key={row.id ?? `${entity}-${index}`} onClick={()=>openRow(row)} style={{cursor:entity==="product"?"default":"pointer",background:index%2?"#FBFDF9":"#fff"}} onMouseEnter={e=>e.currentTarget.style.background="#F4F8F0"} onMouseLeave={e=>e.currentTarget.style.background=index%2?"#FBFDF9":"#fff"}>
                  {columns.map(([label,align,render])=><td key={label} style={{...td,textAlign:align}}>{render(row)}</td>)}
                </tr>
              )) : <tr><td colSpan={columns.length} style={{padding:28,textAlign:"center",fontSize:10.8,color:"#82907F",lineHeight:1.6}}>{emptyMessage}</td></tr>}
            </tbody>
          </table>
        </div>

        {metric === "atRisk" && anomalies.length > 0 && (
          <div style={{marginTop:13}}>
            <div style={{fontSize:11,fontWeight:850,color:"#12241B",marginBottom:8}}>Triggered anomaly rules</div>
            <div style={{display:"grid",gap:7}}>{anomalies.slice(0,10).map((a,i)=><div key={a.id??i} style={{padding:"9px 11px",borderRadius:10,border:"1px solid #E7EEE4",background:i%2?"#FBFDF9":"#fff"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}><b style={{fontSize:10.5,color:"#12241B"}}>{a.branch||a.brand||"Unassigned"}</b><B2BRiskBadge risk={a.severity}/></div><div style={{fontSize:10.2,color:"#5C6B60",marginTop:5,lineHeight:1.5}}><b>{a.rule}:</b> {a.reason}</div></div>)}</div>
          </div>
        )}
      </div>
    );
  }

  function B2BDualTrendChart({ data = [], onPointClick }) {
    const [hover, setHover] = useState(null);
    if (!data.length) return <DashboardEmptyState message="No HQ supply / POS trend data for the selected filters." />;
    const W = 760, H = 240, PL = 55, PR = 24, PT = 20, PB = 38;
    const pW = W - PL - PR, pH = H - PT - PB;
    const hasTarget = data.some(d => b2bNullableNum(d?.targetRevenue) != null && Number(d.targetRevenue) > 0);
    const maxV = Math.max(1, ...data.flatMap(d => [b2bNum(d.hqRevenue), b2bNum(d.posRevenue), b2bNum(d.targetRevenue)])) * 1.12;
    const point = (v, i) => ({ x:PL + (i / Math.max(1, data.length - 1)) * pW, y:PT + pH - (b2bNum(v) / maxV) * pH });
    const hqPts = data.map((d,i)=>point(d.hqRevenue,i));
    const posPts = data.map((d,i)=>point(d.posRevenue,i));
    const targetPts = data.map((d,i)=>point(d.targetRevenue,i));
    const pathOf = (pts) => pts.map((p,i)=>`${i===0?"M":"L"} ${p.x} ${p.y}`).join(" ");
    const ticks = [0,.25,.5,.75,1];
    return (
      <div style={{ position:"relative" }}>
        <div style={{ display:"flex", gap:14, alignItems:"center", marginBottom:8, fontSize:10.5, fontWeight:700, color:"#5C6B60" }}>
          <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:9,height:9,borderRadius:3,background:"#3b791e"}}/>HQ Supply Revenue</span>
          <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:9,height:9,borderRadius:3,background:"#2563eb"}}/>Franchisee POS Revenue</span>
          {hasTarget && <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:11,height:0,borderTop:"2px dashed #b45309"}}/>HQ Monthly Target</span>}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:240, display:"block" }}>
          {ticks.map(t=>{
            const y = PT + pH * (1-t);
            return <g key={t}><line x1={PL} y1={y} x2={W-PR} y2={y} stroke="#E9EEE6" strokeDasharray="4 4"/><text x={PL-8} y={y+4} textAnchor="end" fontSize="9.5" fill="#71806F" fontFamily={FONT}>{fmtShort(maxV*t)}</text></g>;
          })}
          <path d={pathOf(hqPts)} fill="none" stroke="#3b791e" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>
          <path d={pathOf(posPts)} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>
          {hasTarget && <path d={pathOf(targetPts)} fill="none" stroke="#b45309" strokeWidth="2.25" strokeDasharray="7 6" strokeLinejoin="round" strokeLinecap="round"/>}
          {data.map((d,i)=>{
            const h=hqPts[i], p=posPts[i];
            const isHover=hover===i;
            return <g key={d.month || d.label || i} onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)} onClick={()=>onPointClick?.(d)} style={{cursor:onPointClick?"pointer":"default"}}>
              <rect x={Math.max(PL,h.x-28)} y={PT} width={56} height={pH} fill="transparent" />
              <circle cx={h.x} cy={h.y} r={isHover?5:3.5} fill="#3b791e" stroke="#fff" strokeWidth="2"/>
              <circle cx={p.x} cy={p.y} r={isHover?5:3.5} fill="#2563eb" stroke="#fff" strokeWidth="2"/>
              <text x={h.x} y={H-10} textAnchor="middle" fontSize="9.5" fill="#71806F" fontFamily={FONT}>{d.label || b2bMonthLabel(d.month)}</text>
            </g>;
          })}
        </svg>
        {hover !== null && data[hover] && (
          <div style={{ position:"absolute", top:35, right:10, background:"#12241B", color:"#fff", borderRadius:10, padding:"9px 11px", fontSize:10.5, boxShadow:"0 10px 25px rgba(0,0,0,.16)", pointerEvents:"none" }}>
            <div style={{fontWeight:800,marginBottom:4}}>{data[hover].label || b2bMonthLabel(data[hover].month)}</div>
            <div style={{opacity:.78}}>HQ: {fmtAmt(data[hover].hqRevenue)}</div>
            <div style={{opacity:.78}}>POS: {fmtAmt(data[hover].posRevenue)}</div>
            {hasTarget && <div style={{opacity:.78}}>Target: {fmtAmt(data[hover].targetRevenue)}</div>}
          </div>
        )}
      </div>
    );
  }

  function B2BRevenueAssuranceDashboard({ transactions = [], brands = [], user, view="overview", onOpenSalesAi }) {
    const API = process.env.REACT_APP_API_URL || "";
    const [month, setMonth] = useState(() => b2bMonthKey(new Date()));
    const [branch, setBranch] = useState("");
    const [brand, setBrand] = useState("");
    const [risk, setRisk] = useState("all");
    const [growthTargetPct, setGrowthTargetPct] = useState(B2B_DEFAULT_GROWTH_TARGET);
    const [loading, setLoading] = useState(true);
    const [sourceMode, setSourceMode] = useState("aggregated");
    const [overviewApi, setOverviewApi] = useState(null);
    const [branchesApi, setBranchesApi] = useState([]);
    const [brandsApi, setBrandsApi] = useState([]);
    const [anomaliesApi, setAnomaliesApi] = useState([]);
    const [productsApi, setProductsApi] = useState([]);
    const [rawOrders, setRawOrders] = useState([]);
    const [rawInventory, setRawInventory] = useState([]);
    const [loadError, setLoadError] = useState("");
    const [drilldown, setDrilldown] = useState(null);

    const branchCatalog = useMemo(() => {
      const map = new Map();
      (brands || []).forEach(b => {
        const brandName = String(b?.name || b?.brand || b?.brand_name || b?.brandName || "").trim();
        (Array.isArray(b?.branches) ? b.branches : []).forEach(br => {
          const name = typeof br === "string" ? br : String(br?.name || br?.branch || br?.branch_name || br?.branchName || "").trim();
          if (!name) return;
          const current = map.get(name) || { name, id: typeof br === "object" ? (br?.id ?? br?.branch_id ?? name) : name, location:"", brandNames:[] };
          if (typeof br === "object") current.location = String(br?.location || br?.address || br?.city || current.location || "").trim();
          if (brandName && !current.brandNames.includes(brandName)) current.brandNames.push(brandName);
          map.set(name, current);
        });
      });
      return Array.from(map.values()).sort((a,b)=>a.name.localeCompare(b.name));
    }, [brands]);

    const resolveBranchBrand = useCallback((branchName, directBrand = "") => {
      const direct = String(directBrand || "").trim();
      if (direct && !/^unassigned|unknown|—$/i.test(direct)) return direct;
      const normalizedBranch = String(branchName || "").trim().toLowerCase();
      const catalogMatch = branchCatalog.find(item => String(item.name || "").trim().toLowerCase() === normalizedBranch);
      if (catalogMatch?.brandNames?.length) return catalogMatch.brandNames.join(", ");
      const transactionBrands = Array.from(new Set((transactions || [])
        .filter(tx => String(tx?.branch || tx?.branch_name || tx?.branchName || "").trim().toLowerCase() === normalizedBranch)
        .map(tx => String(tx?.brand || tx?.brand_name || tx?.brandName || tx?.franchise_brand || "").trim())
        .filter(Boolean)));
      return transactionBrands.join(", ") || "Brand not set";
    }, [branchCatalog, transactions]);

    const brandOptions = useMemo(() => (brands || []).map(b=>({ id:b?.id ?? b?.brand_id ?? b?.name, name:String(b?.name || b?.brand || "").trim() })).filter(b=>b.name).sort((a,b)=>a.name.localeCompare(b.name)), [brands]);
    const branchOptions = useMemo(() => {
      if (!brand) return branchCatalog;
      return branchCatalog.filter(br => br.brandNames.includes(brand));
    }, [branchCatalog, brand]);

    useEffect(() => {
      if (branch && !branchOptions.some(br=>br.name===branch)) setBranch("");
    }, [brand, branch, branchOptions]);

    const fetchJson = useCallback(async (url) => {
      const res = await fetch(url, { credentials:"include" });
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      if (json?.error) throw new Error(json.error);
      return json;
    }, []);

    const fetchRawOrdersFallback = useCallback(async () => {
      const params = new URLSearchParams();
      params.set("role", user?.role || "Super Admin");
      if (user?.branch && !["Super Admin", "Franchisee Operations Admin"].includes(user?.role)) params.set("branch", user.branch);
      if (user?.brand && !["Super Admin", "Franchisee Operations Admin"].includes(user?.role)) params.set("brand", user.brand);
      const data = await fetchJson(`${API}/orders?${params.toString()}`);
      return Array.isArray(data) ? data : [];
    }, [API, user, fetchJson]);

    const loadB2B = useCallback(async () => {
      if (!API) {
        setLoading(false);
        setLoadError("The API URL is not configured, so Mobile Orders and inventory cannot be loaded.");
        return;
      }
      setLoading(true);
      setLoadError("");
      const params = new URLSearchParams({ month });
      if (branch) params.set("branch", branch);
      if (brand) params.set("brand", brand);
      if (risk !== "all") params.set("risk", risk);
      params.set("growthTargetPct", String(growthTargetPct));

      const endpoints = [
        `${API}/dashboard/b2b/overview?${params.toString()}`,
        `${API}/dashboard/b2b/branches?${params.toString()}`,
        `${API}/dashboard/b2b/brands?${params.toString()}`,
        `${API}/dashboard/b2b/anomalies?${params.toString()}`,
        `${API}/dashboard/b2b/products?${params.toString()}`,
      ];

      const settled = await Promise.allSettled(endpoints.map(fetchJson));
      const hasCoreSummary = settled.slice(0,3).every(r=>r.status==="fulfilled");

      if (hasCoreSummary) {
        setSourceMode("aggregated");
        const o = settled[0].status === "fulfilled" ? settled[0].value : null;
        const br = settled[1].status === "fulfilled" ? settled[1].value : [];
        const bd = settled[2].status === "fulfilled" ? settled[2].value : [];
        const an = settled[3].status === "fulfilled" ? settled[3].value : [];
        const pr = settled[4].status === "fulfilled" ? settled[4].value : [];
        setOverviewApi(o?.data || o || null);
        setBranchesApi(Array.isArray(br) ? br : Array.isArray(br?.branches) ? br.branches : Array.isArray(br?.data) ? br.data : []);
        setBrandsApi(Array.isArray(bd) ? bd : Array.isArray(bd?.brands) ? bd.brands : Array.isArray(bd?.data) ? bd.data : []);
        setAnomaliesApi(Array.isArray(an) ? an : Array.isArray(an?.anomalies) ? an.anomalies : Array.isArray(an?.data) ? an.data : []);
        setProductsApi(Array.isArray(pr) ? pr : Array.isArray(pr?.products) ? pr.products : Array.isArray(pr?.data) ? pr.data : []);
        setRawOrders([]);
        setRawInventory([]);
      } else {
        setSourceMode("fallback");
        setOverviewApi(null); setBranchesApi([]); setBrandsApi([]); setAnomaliesApi([]); setProductsApi([]);
        const inventoryParams = new URLSearchParams();
        if (branch) inventoryParams.set("branch", branch);
        const [ordersResult, stockInventoryResult, posInventoryResult] = await Promise.allSettled([
          fetchRawOrdersFallback(),
          fetchJson(`${API}/ingredients${inventoryParams.toString() ? `?${inventoryParams.toString()}` : ""}`),
          fetchJson(`${API}/inventory${inventoryParams.toString() ? `?${inventoryParams.toString()}` : ""}`),
        ]);
        setRawOrders(ordersResult.status === "fulfilled" && Array.isArray(ordersResult.value) ? ordersResult.value : []);
        const stockPayload = stockInventoryResult.status === "fulfilled" ? stockInventoryResult.value : [];
        const posPayload = posInventoryResult.status === "fulfilled" ? posInventoryResult.value : [];
        const stockRows = Array.isArray(stockPayload) ? stockPayload : Array.isArray(stockPayload?.data) ? stockPayload.data : [];
        const posRows = Array.isArray(posPayload) ? posPayload : Array.isArray(posPayload?.data) ? posPayload.data : [];
        setRawInventory(stockRows.length ? stockRows : posRows);
        if (ordersResult.status === "rejected") {
          setLoadError("The B2B summary endpoints and the existing Mobile Order endpoint could not be loaded.");
        }
      }
      setLoading(false);
    }, [API, month, branch, brand, risk, growthTargetPct, fetchJson, fetchRawOrdersFallback]);

    useEffect(() => { loadB2B(); }, [loadB2B]);

    const fallback = useMemo(() => {
      const currentMonth = month;
      const prevMonth = b2bShiftMonth(month, -1);
      const monthMatches = (value, key) => b2bMonthKey(value) === key;
      const brandAllows = (name) => !brand || String(name || "") === brand;
      const branchAllows = (name) => !branch || String(name || "") === branch;

      const orders = rawOrders.filter(o => b2bIsEarnedOrder(o) && brandAllows(b2bBrandName(o)) && branchAllows(b2bBranchName(o)));
      const pos = (transactions || []).filter(tx => b2bIsCompletedTx(tx) && brandAllows(b2bBrandName(tx)) && branchAllows(b2bBranchName(tx)));
      const inventory = (rawInventory || []).filter(row => {
        if (!brandAllows(b2bBrandName(row)) || !branchAllows(b2bBranchName(row))) return false;
        if (currentMonth === b2bMonthKey(new Date())) return true;
        const snapshotDate = b2bDateOfInventory(row);
        if (snapshotDate) return monthMatches(snapshotDate, currentMonth);
        return false;
      });
      const currentOrders = orders.filter(o => monthMatches(b2bDateOfOrder(o), currentMonth));
      const prevOrders = orders.filter(o => monthMatches(b2bDateOfOrder(o), prevMonth));
      const currentTx = pos.filter(tx => monthMatches(b2bDateOfTx(tx), currentMonth));
      const prevTx = pos.filter(tx => monthMatches(b2bDateOfTx(tx), prevMonth));

      const hqRevenue = currentOrders.reduce((s,o)=>s+b2bOrderAmount(o),0);
      const prevHqRevenue = prevOrders.reduce((s,o)=>s+b2bOrderAmount(o),0);
      const posRevenue = currentTx.reduce((s,tx)=>s+b2bTxAmount(tx),0);
      const prevPosRevenue = prevTx.reduce((s,tx)=>s+b2bTxAmount(tx),0);
      const target = prevHqRevenue * (1 + growthTargetPct / 100);
      const attainment = target > 0 ? (hqRevenue / target) * 100 : null;
      const gap = Math.max(0, target - hqRevenue);

      const allBranchNames = new Set(branchCatalog.map(b=>b.name));
      currentOrders.forEach(o=>{ if(b2bBranchName(o)) allBranchNames.add(b2bBranchName(o)); });
      currentTx.forEach(tx=>{ if(b2bBranchName(tx)) allBranchNames.add(b2bBranchName(tx)); });
      inventory.forEach(row=>{ if(b2bBranchName(row)) allBranchNames.add(b2bBranchName(row)); });
      prevOrders.forEach(o=>{ if(b2bBranchName(o)) allBranchNames.add(b2bBranchName(o)); });
      prevTx.forEach(tx=>{ if(b2bBranchName(tx)) allBranchNames.add(b2bBranchName(tx)); });

      const branchRows = Array.from(allBranchNames).map(name => {
        const cat = branchCatalog.find(x=>x.name===name);
        const currO = currentOrders.filter(o=>b2bBranchName(o)===name);
        const prevO = prevOrders.filter(o=>b2bBranchName(o)===name);
        const currT = currentTx.filter(tx=>b2bBranchName(tx)===name);
        const prevT = prevTx.filter(tx=>b2bBranchName(tx)===name);
        const currI = inventory.filter(row=>b2bBranchName(row)===name);
        const hq = currO.reduce((s,o)=>s+b2bOrderAmount(o),0);
        const prevHq = prevO.reduce((s,o)=>s+b2bOrderAmount(o),0);
        const posV = currT.reduce((s,tx)=>s+b2bTxAmount(tx),0);
        const prevPos = prevT.reduce((s,tx)=>s+b2bTxAmount(tx),0);
        const suppliedQty = currO.flatMap(b2bOrderItems).reduce((s,i)=>s+b2bItemQty(i),0);
        const soldQty = currT.flatMap(b2bTxItems).reduce((s,i)=>s+b2bItemQty(i),0);
        const openingValues = currI.map(b2bInventoryOpening).filter(v=>v!=null);
        const closingValues = currI.map(b2bInventoryClosing).filter(v=>v!=null);
        const openingQty = openingValues.length ? openingValues.reduce((s,v)=>s+v,0) : null;
        const endingStock = closingValues.length ? closingValues.reduce((s,v)=>s+v,0) : null;
        const disposalQty = currI.reduce((s,i)=>s+b2bNum(b2bInventoryDisposal(i)),0);
        const transferInQty = currI.reduce((s,i)=>s+b2bNum(b2bInventoryTransferIn(i)),0);
        const transferOutQty = currI.reduce((s,i)=>s+b2bNum(b2bInventoryTransferOut(i)),0);
        const adjustmentQty = currI.reduce((s,i)=>s+b2bNum(b2bInventoryAdjustment(i)),0);
        const officialAvailable = Math.max(0, b2bNum(openingQty) + suppliedQty + transferInQty - disposalQty - transferOutQty + adjustmentQty);
        const orderCoverage = soldQty > 0 ? Math.min(100, (officialAvailable / soldQty) * 100) : null;
        const expectedClosing = openingQty != null && endingStock != null
          ? openingQty + suppliedQty + transferInQty - soldQty - disposalQty - transferOutQty + adjustmentQty
          : null;
        const stockVariance = expectedClosing == null ? null : endingStock - expectedClosing;
        const hqGrowth = prevHq > 0 ? ((hq-prevHq)/prevHq)*100 : (hq>0?100:0);
        const posGrowth = prevPos > 0 ? ((posV-prevPos)/prevPos)*100 : (posV>0?100:0);
        const targetV = prevHq * (1 + growthTargetPct/100);
        const targetPct = targetV > 0 ? (hq/targetV)*100 : null;
        let riskLabel = "Normal";
        let reason = "No revenue-leakage signal from available order/POS data.";
        if (posV > 0 && hq === 0) {
          riskLabel = "High Risk";
          reason = "Active POS sales with no fulfilled HQ supply order in the selected month. Verify carry-over stock, approved transfers, or possible outside sourcing.";
        } else if (stockVariance != null && stockVariance > 0) {
          riskLabel = "High Risk";
          reason = `${stockVariance.toLocaleString()} units are above the stock expected from opening balance, HQ receipts, POS sales, disposal, and transfers.`;
        } else if (stockVariance != null && stockVariance < 0) {
          riskLabel = "High Risk";
          reason = `${Math.abs(stockVariance).toLocaleString()} units are missing from the expected stock balance and require a physical count.`;
        } else if (openingQty != null && orderCoverage != null && orderCoverage < 70 && posV > 0) {
          riskLabel = "High Risk";
          reason = `Only ${orderCoverage.toFixed(1)}% of reported POS-sold units are supported by opening stock and authorized HQ stock flow.`;
        } else if (posGrowth >= B2B_FALLBACK_THRESHOLDS.posStableFloorPct && hqGrowth <= -B2B_FALLBACK_THRESHOLDS.highOrderDropPct) {
          riskLabel = "High Risk";
          reason = "POS is stable/up while HQ supply revenue dropped materially.";
        } else if (posGrowth >= B2B_FALLBACK_THRESHOLDS.posStableFloorPct && hqGrowth <= -B2B_FALLBACK_THRESHOLDS.watchOrderDropPct) {
          riskLabel = "Watch";
          reason = "POS is stable/up while HQ supply revenue is declining.";
        }
        const branchBrands = Array.from(new Set([
          ...(cat?.brandNames || []),
          ...currO.map(b2bBrandName),
          ...currT.map(b2bBrandName),
          ...currI.map(b2bBrandName),
        ].filter(Boolean)));
        return {
          id:cat?.id ?? name, branch:name, brand:resolveBranchBrand(name, branchBrands.join(", ")), location:cat?.location || "—", hqRevenue:hq, posRevenue:posV,
          vsLastMonth:hqGrowth, posGrowth, targetPct, orderCoverage, stockVariance,
          suppliedQty, soldQty, openingStock:openingQty, endingStock,
          risk:riskLabel, reason, targetGap:Math.max(0,targetV-hq), prevHqRevenue:prevHq,
        };
      }).filter(r=>!branch || r.branch===branch);

      const brandNames = new Set(brandOptions.map(b=>b.name));
      currentOrders.forEach(o=>{ if(b2bBrandName(o)) brandNames.add(b2bBrandName(o)); });
      currentTx.forEach(tx=>{ if(b2bBrandName(tx)) brandNames.add(b2bBrandName(tx)); });
      inventory.forEach(row=>{ if(b2bBrandName(row)) brandNames.add(b2bBrandName(row)); });
      const brandRows = Array.from(brandNames).map(name => {
        const currO = currentOrders.filter(o=>b2bBrandName(o)===name);
        const currT = currentTx.filter(tx=>b2bBrandName(tx)===name);
        const currI = inventory.filter(row=>b2bBrandName(row)===name);
        const hq = currO.reduce((s,o)=>s+b2bOrderAmount(o),0);
        const posV = currT.reduce((s,tx)=>s+b2bTxAmount(tx),0);
        const suppliedQty = currO.flatMap(b2bOrderItems).reduce((s,i)=>s+b2bItemQty(i),0);
        const soldQty = currT.flatMap(b2bTxItems).reduce((s,i)=>s+b2bItemQty(i),0);
        const openingValues = currI.map(b2bInventoryOpening).filter(v=>v!=null);
        const closingValues = currI.map(b2bInventoryClosing).filter(v=>v!=null);
        const openingStock = openingValues.length ? openingValues.reduce((s,v)=>s+v,0) : null;
        const endingStock = closingValues.length ? closingValues.reduce((s,v)=>s+v,0) : null;
        const disposalQty = currI.reduce((s,i)=>s+b2bNum(b2bInventoryDisposal(i)),0);
        const transferInQty = currI.reduce((s,i)=>s+b2bNum(b2bInventoryTransferIn(i)),0);
        const transferOutQty = currI.reduce((s,i)=>s+b2bNum(b2bInventoryTransferOut(i)),0);
        const adjustmentQty = currI.reduce((s,i)=>s+b2bNum(b2bInventoryAdjustment(i)),0);
        const expectedClosing = openingStock != null && endingStock != null
          ? openingStock + suppliedQty + transferInQty - soldQty - disposalQty - transferOutQty + adjustmentQty
          : null;
        const stockVariance = expectedClosing == null ? null : endingStock - expectedClosing;
        const availableQty = openingStock == null ? null : Math.max(0, openingStock + suppliedQty + transferInQty);
        const sellThrough = availableQty && availableQty > 0 ? (soldQty / availableQty) * 100 : null;
        return { id:brandOptions.find(b=>b.name===name)?.id ?? name, brand:name, hqRevenue:hq, posRevenue:posV, suppliedQty, soldQty, openingStock, endingStock, sellThrough, stockVariance };
      }).filter(r=>!brand || r.brand===brand).sort((a,b)=>b.hqRevenue-a.hqRevenue);

      const riskRows = branchRows.filter(r=>r.risk!=="Normal").map(r=>({
        id:`fallback-${r.branch}`,
        branch:r.branch,
        brand:r.brand,
        severity:r.risk,
        rule:r.hqRevenue===0 && r.posRevenue>0 ? "No Recent HQ Order + Active Sales" : "High POS, Low HQ Orders",
        reason:r.reason,
        gapValue:r.targetGap,
        recommendation:"Review the branch → brand → SKU breakdown and verify the source of replenishment.",
      }));

      const skuMap = new Map();
      const addSku = (item, kind, parentBrand, parentBranch) => {
        const resolvedBranch = parentBranch || b2bBranchName(item) || "—";
        const resolvedBrand = parentBrand || b2bBrandName(item) || "—";
        if (branch && resolvedBranch !== branch) return;
        if (brand && resolvedBrand !== brand) return;
        const id = b2bItemId(item);
        const name = b2bItemName(item);
        const key = b2bSkuKey(item, resolvedBrand, resolvedBranch);
        const row = skuMap.get(key) || { id:id ?? key, sku:id != null ? String(id) : "—", product:name, brand:resolvedBrand, branch:resolvedBranch, suppliedQty:0, soldQty:0, openingStock:null, endingStock:null, disposal:null, transferIn:null, transferOut:null, adjustment:null, transfers:null, stockVariance:null };
        if (kind==="supply") row.suppliedQty += b2bItemQty(item);
        if (kind==="sale") row.soldQty += b2bItemQty(item);
        if (kind==="inventory") {
          row.openingStock = b2bInventoryOpening(item);
          row.endingStock = b2bInventoryClosing(item);
          row.disposal = b2bInventoryDisposal(item);
          row.transferIn = b2bInventoryTransferIn(item);
          row.transferOut = b2bInventoryTransferOut(item);
          row.adjustment = b2bInventoryAdjustment(item);
          row.transfers = b2bNum(row.transferIn) + b2bNum(row.transferOut);
        }
        skuMap.set(key,row);
      };
      currentOrders.forEach(o=>b2bOrderItems(o).forEach(i=>addSku(i,"supply",b2bBrandName(o)||b2bBrandName(i),b2bBranchName(o)||b2bBranchName(i))));
      currentTx.forEach(tx=>b2bTxItems(tx).forEach(i=>addSku(i,"sale",b2bBrandName(tx)||b2bBrandName(i),b2bBranchName(tx)||b2bBranchName(i))));
      inventory.forEach(row=>addSku(row,"inventory",b2bBrandName(row),b2bBranchName(row)));
      const skuRows = Array.from(skuMap.values()).map(row=>{
        const hasFullBalance = row.openingStock != null && row.endingStock != null;
        const expectedClosing = hasFullBalance
          ? row.openingStock + row.suppliedQty + b2bNum(row.transferIn) - row.soldQty - b2bNum(row.disposal) - b2bNum(row.transferOut) + b2bNum(row.adjustment)
          : null;
        return { ...row, stockVariance:expectedClosing==null?null:row.endingStock-expectedClosing };
      }).sort((a,b)=>Math.abs(b.stockVariance||0)-Math.abs(a.stockVariance||0) || (b.soldQty+b.suppliedQty)-(a.soldQty+a.suppliedQty)).slice(0,25);

      const stockRiskRows = skuRows.filter(row=>row.stockVariance!=null && row.stockVariance!==0).map((row,index)=>({
        id:`stock-${row.id}-${index}`,
        branch:row.branch,
        brand:row.brand,
        sku:row.product,
        severity:"High Risk",
        rule:row.stockVariance>0 ? "Suspected Unofficial Supply" : "Ghost Stock / Shrinkage",
        reason:row.stockVariance>0
          ? `${row.stockVariance.toLocaleString()} recorded units are not explained by verified opening stock, HQ receipts, POS sales, disposal, and transfers.`
          : `${Math.abs(row.stockVariance).toLocaleString()} units expected by the stock ledger are missing from recorded closing stock.`,
        gapValue:null,
        recommendation:"Request a physical count, verify the source order or transfer, and review manual inventory adjustments.",
      }));

      const trend = [];
      for (let offset=-5; offset<=0; offset++) {
        const key = b2bShiftMonth(currentMonth, offset);
        const o = orders.filter(x=>monthMatches(b2bDateOfOrder(x),key)).reduce((s,x)=>s+b2bOrderAmount(x),0);
        const t = pos.filter(x=>monthMatches(b2bDateOfTx(x),key)).reduce((s,x)=>s+b2bTxAmount(x),0);
        const priorKey = b2bShiftMonth(key,-1);
        const priorHq = orders.filter(x=>monthMatches(b2bDateOfOrder(x),priorKey)).reduce((s,x)=>s+b2bOrderAmount(x),0);
        trend.push({ month:key, label:b2bMonthLabel(key).replace(/\s\d{4}$/,""), hqRevenue:o, posRevenue:t, targetRevenue:priorHq*(1+growthTargetPct/100) });
      }

      const suppliedUnits = brandRows.reduce((sum,row)=>sum+Number(row.suppliedQty||0),0);
      const soldUnits = brandRows.reduce((sum,row)=>sum+Number(row.soldQty||0),0);
      const openingUnits = brandRows.reduce((sum,row)=>sum+Number(row.openingStock||0),0);
      const hasOpeningEvidence = brandRows.some(row=>row.openingStock!=null);
      const coverage = soldUnits>0 ? Math.min(100,((suppliedUnits+(hasOpeningEvidence?openingUnits:0))/soldUnits)*100) : null;
      const unexplained = skuRows.filter(row=>row.stockVariance!=null).reduce((sum,row)=>sum+Math.abs(Number(row.stockVariance||0)),0);
      const sellThrough = hasOpeningEvidence && openingUnits+suppliedUnits>0 ? (soldUnits/(openingUnits+suppliedUnits))*100 : null;
      const allAnomalies = [...stockRiskRows,...riskRows];
      const atRisk = new Set(allAnomalies.map(row=>row.branch).filter(Boolean)).size;

      return { hqRevenue, prevHqRevenue, posRevenue, prevPosRevenue, target, attainment, gap, coverage, unexplained, sellThrough, atRisk, branchRows, brandRows, anomalies:allAnomalies, skuRows, trend };
    }, [month, branch, brand, rawOrders, rawInventory, transactions, branchCatalog, brandOptions, growthTargetPct, resolveBranchBrand]);

    const normalizedOverview = useMemo(() => {
      const o = overviewApi || {};
      const hqRevenue = b2bNullableNum(o?.hqSupplyRevenue, o?.hq_supply_revenue, o?.supplyRevenue, o?.franchisyncSupplyRevenue);
      const posRevenue = b2bNullableNum(o?.posRevenue, o?.pos_revenue, o?.franchiseePosRevenue, o?.franchisee_pos_revenue);
      const target = b2bNullableNum(o?.monthlyTarget, o?.monthly_target, o?.target);
      const targetGap = b2bNullableNum(o?.targetGap, o?.target_gap, target != null && hqRevenue != null ? Math.max(0,target-hqRevenue) : null);
      const targetAttainment = b2bNullableNum(o?.targetAttainment, o?.target_attainment, o?.targetAttainmentPct, o?.target_attainment_pct, target && hqRevenue != null ? hqRevenue/target*100 : null);
      const coverage = b2bNullableNum(o?.orderCoverage, o?.order_coverage, o?.coveragePct, o?.coverage_pct);
      const atRisk = b2bNullableNum(o?.atRiskBranches, o?.at_risk_branches, o?.riskCount, o?.risk_count);
      const unexplained = b2bNullableNum(o?.unexplainedStock, o?.unexplained_stock, o?.unexplainedStockUnits, o?.unexplained_stock_units);
      const sellThrough = b2bNullableNum(o?.sellThrough, o?.sell_through, o?.sellThroughPct, o?.sell_through_pct);
      const prevHqRevenue = b2bNullableNum(o?.previousHqSupplyRevenue, o?.previous_hq_supply_revenue, o?.prevHqRevenue, o?.prev_hq_revenue);
      const prevPosRevenue = b2bNullableNum(o?.previousPosRevenue, o?.previous_pos_revenue, o?.prevPosRevenue, o?.prev_pos_revenue);
      return {
        hqRevenue: hqRevenue ?? fallback.hqRevenue,
        posRevenue: posRevenue ?? fallback.posRevenue,
        target: target ?? fallback.target,
        targetGap: targetGap ?? fallback.gap,
        targetAttainment: targetAttainment ?? fallback.attainment,
        coverage: coverage ?? fallback.coverage,
        atRisk: atRisk ?? (sourceMode==="fallback" ? fallback.atRisk : 0),
        unexplained: unexplained ?? fallback.unexplained,
        sellThrough: sellThrough ?? fallback.sellThrough,
        prevHqRevenue: prevHqRevenue ?? fallback.prevHqRevenue,
        prevPosRevenue: prevPosRevenue ?? fallback.prevPosRevenue,
      };
    }, [overviewApi, fallback, sourceMode]);

    const branchRows = useMemo(() => {
      if (sourceMode === "fallback" || !branchesApi.length) {
        return fallback.branchRows.filter(r => risk === "all" || String(r.risk).toLowerCase().includes(risk.toLowerCase().replace("high-risk", "high")));
      }
      return branchesApi.map((r,i)=>({
        id:r?.branch_id ?? r?.id ?? r?.branch ?? i,
        branch:String(r?.branch_name || r?.branch || r?.name || "Unknown Branch"),
        brand:resolveBranchBrand(
          r?.branch_name || r?.branch || r?.name,
          r?.brand_name || r?.brand || r?.brandName
        ),
        location:String(r?.location || r?.address || "—"),
        hqRevenue:b2bNum(r?.hq_supply_revenue, r?.hqRevenue, r?.supply_revenue),
        posRevenue:b2bNum(r?.pos_revenue, r?.posRevenue, r?.franchisee_pos_revenue),
        vsLastMonth:b2bNullableNum(r?.mom_growth, r?.vs_last_month, r?.hq_growth_pct),
        targetPct:b2bNullableNum(r?.target_pct, r?.targetAttainment, r?.target_attainment_pct),
        targetGap:b2bNullableNum(r?.target_gap, r?.targetGap, r?.revenue_gap),
        prevHqRevenue:b2bNullableNum(r?.previous_hq_supply_revenue, r?.prevHqRevenue, r?.previous_revenue),
        orderCoverage:b2bNullableNum(r?.order_coverage, r?.coverage_pct, r?.orderCoverage),
        stockVariance:b2bNullableNum(r?.stock_variance, r?.stockVariance),
        risk:String(r?.risk || r?.risk_status || r?.anomaly_status || "Normal"),
        reason:String(r?.reason || r?.risk_reason || ""),
      })).filter(r=>(!branch||r.branch===branch)&&(!risk||risk==="all"||String(r.risk).toLowerCase().includes(risk.toLowerCase().replace("high-risk","high"))));
    }, [sourceMode, branchesApi, fallback.branchRows, resolveBranchBrand, branch, risk]);

    const brandRows = useMemo(() => {
      if (sourceMode === "fallback" || !brandsApi.length) return fallback.brandRows;
      return brandsApi.map((r,i)=>({
        id:r?.brand_id ?? r?.id ?? r?.brand ?? i,
        brand:String(r?.brand_name || r?.brand || r?.name || "Unknown Brand"),
        hqRevenue:b2bNum(r?.hq_supply_revenue, r?.hqRevenue, r?.supply_revenue),
        posRevenue:b2bNum(r?.pos_revenue, r?.posRevenue),
        suppliedQty:b2bNum(r?.supplied_qty, r?.qty_supplied, r?.quantity_supplied),
        soldQty:b2bNum(r?.sold_qty, r?.qty_sold, r?.quantity_sold),
        endingStock:b2bNullableNum(r?.ending_stock, r?.closing_stock, r?.on_hand),
        sellThrough:b2bNullableNum(r?.sell_through, r?.sell_through_pct),
        stockVariance:b2bNullableNum(r?.stock_variance, r?.stockVariance),
      })).filter(r=>!brand||r.brand===brand);
    }, [sourceMode, brandsApi, fallback.brandRows, brand]);

    const anomalies = useMemo(() => {
      const rows = sourceMode === "fallback" || !anomaliesApi.length
        ? fallback.anomalies
        : anomaliesApi.map((r,i)=>({
            id:r?.id ?? i,
            branch:String(r?.branch_name || r?.branch || "—"),
            brand:String(r?.brand_name || r?.brand || ""),
            sku:String(r?.sku || r?.product_name || ""),
            severity:String(r?.severity || r?.risk || "Watch"),
            rule:String(r?.rule || r?.rule_name || r?.anomaly || "Anomaly"),
            reason:String(r?.reason || r?.message || "Review supporting evidence."),
            gapValue:b2bNullableNum(r?.gap_value, r?.value_gap, r?.amount_gap),
            recommendation:String(r?.recommendation || "Review linked order, POS, and inventory evidence."),
          }));
      return rows.filter(r=>risk==="all" || String(r.severity).toLowerCase().includes(risk.toLowerCase().replace("high-risk","high")));
    }, [sourceMode, anomaliesApi, fallback.anomalies, risk]);

    const trendData = useMemo(() => {
      const o = overviewApi || {};
      const raw = b2bArray(o?.trend || o?.monthlyTrend || o?.monthly_trend || o?.revenueTrend || o?.revenue_trend);
      if (!raw.length) return fallback.trend;
      const mapped = raw.map((r,i)=>({
        month:String(r?.month || r?.period || ""),
        label:String(r?.label || (r?.month ? b2bMonthLabel(r.month).replace(/\s\d{4}$/,"|") : `M${i+1}`)).replace("|", ""),
        hqRevenue:b2bNum(r?.hq_supply_revenue, r?.hqRevenue, r?.supply_revenue),
        posRevenue:b2bNum(r?.pos_revenue, r?.posRevenue),
        targetRevenue:b2bNullableNum(r?.target_revenue, r?.targetRevenue, r?.monthly_target, r?.target),
      }));
      return mapped.map((row,index)=>({
        ...row,
        targetRevenue:row.targetRevenue ?? (index>0 ? mapped[index-1].hqRevenue*(1+growthTargetPct/100) : 0),
      }));
    }, [overviewApi, fallback.trend, growthTargetPct]);

    const skuRows = fallback.skuRows;

    const transactionProductEvidenceRows = useMemo(() => {
      const productMap = new Map();
      const parseItems = raw => {
        if (Array.isArray(raw)) return raw;
        if (typeof raw === "string") {
          try { const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed : []; }
          catch { return []; }
        }
        return [];
      };

      (transactions || []).forEach(tx => {
        if (!b2bIsCompletedTx(tx) || b2bMonthKey(b2bDateOfTx(tx)) !== month) return;
        const txBranch = b2bBranchName(tx) || String(tx?.branch || "Unassigned Branch");
        const txBrand = resolveBranchBrand(txBranch, b2bBrandName(tx));
        if (branch && txBranch !== branch) return;
        if (brand && !txBrand.split(",").map(value=>value.trim()).includes(brand)) return;

        const txItems = parseItems(tx?.items);
        const itemGrossTotal = txItems.reduce((sum, item) => {
          const qty = Number(item?.qty ?? item?.quantity ?? 0) || 0;
          return sum + (Number(item?.price ?? 0) || 0) * qty;
        }, 0);
        const transactionNetTotal = Number(tx?.total ?? tx?.total_amount ?? tx?.grand_total ?? 0) || 0;
        const netAllocationRatio = itemGrossTotal > 0 && transactionNetTotal > 0
          ? transactionNetTotal / itemGrossTotal
          : 1;

        txItems.forEach((item, itemIndex) => {
          const sku = String(item?.id ?? item?.inventory_id ?? item?.product_id ?? item?.sku ?? `ITEM-${itemIndex + 1}`);
          const product = String(item?.name || item?.product_name || item?.item_name || "Unnamed Product");
          const soldQty = Number(item?.qty ?? item?.quantity ?? 0) || 0;
          const grossLineRevenue = Number(item?.total ?? item?.line_total ?? 0) || (Number(item?.price ?? 0) || 0) * soldQty;
          const lineRevenue = grossLineRevenue * netAllocationRatio;
          const key = `${txBrand}::${txBranch}::${sku}::${product}`;
          const existing = productMap.get(key) || {
            id:key, sku, product, brand:txBrand, branch:txBranch,
            soldQty:0, revenue:0, transactionIds:new Set(), lastSale:null,
          };
          existing.soldQty += soldQty;
          existing.revenue += lineRevenue;
          existing.transactionIds.add(tx?.id ?? `${txBranch}-${tx?.created_at}`);
          const saleDate = b2bDateOfTx(tx);
          if (saleDate && (!existing.lastSale || new Date(saleDate) > new Date(existing.lastSale))) existing.lastSale = saleDate;
          productMap.set(key, existing);
        });
      });

      return Array.from(productMap.values())
        .map(row => ({ ...row, transactionCount:row.transactionIds.size, transactionIds:undefined }))
        .sort((a,b) => b.revenue-a.revenue || b.soldQty-a.soldQty);
    }, [transactions, month, branch, brand, resolveBranchBrand]);

    const productEvidenceRows = useMemo(() => {
      const rows = sourceMode === "aggregated" && productsApi.length
        ? productsApi.map((row, index) => ({
            id:row?.product_id ?? row?.id ?? index,
            productId:row?.product_id ?? row?.id ?? null,
            sku:String(row?.sku_name || row?.sku || row?.product_name || row?.name || "Unnamed Product"),
            product:String(row?.product_name || row?.name || row?.sku_name || "Unnamed Product"),
            brand:String(row?.brand_name || row?.brand || "Brand not set"),
            branch:String(row?.branch_name || row?.branch || "Unassigned Branch"),
            branchId:row?.branch_id ?? null,
            brandId:row?.brand_id ?? null,
            soldQty:b2bNum(row?.sold_qty, row?.quantity_sold),
            revenue:b2bNum(row?.line_revenue, row?.revenue, row?.net_revenue),
            transactionCount:b2bNum(row?.transaction_count, row?.transactions),
            lastSale:row?.last_sale || row?.lastSale || null,
          }))
        : transactionProductEvidenceRows;
      return [...rows].sort((a,b) =>
        String(a.brand).localeCompare(String(b.brand)) ||
        String(a.branch).localeCompare(String(b.branch)) ||
        String(a.product).localeCompare(String(b.product))
      );
    }, [sourceMode, productsApi, transactionProductEvidenceRows]);

    const sortedBranchRows = useMemo(() => [...branchRows].sort((a,b)=>{
      const rank = v => String(v||"").toLowerCase().includes("high") ? 3 : (String(v||"").toLowerCase().includes("watch") || String(v||"").toLowerCase().includes("medium")) ? 2 : 1;
      return (rank(b.risk)-rank(a.risk)) || ((b.targetGap||0)-(a.targetGap||0)) || (b.hqRevenue-a.hqRevenue);
    }), [branchRows]);

    const monthlyLeaders = useMemo(() => {
      const byHq = [...branchRows].sort((a,b)=>Number(b.hqRevenue||0)-Number(a.hqRevenue||0));
      const byPos = [...branchRows].sort((a,b)=>Number(b.posRevenue||0)-Number(a.posRevenue||0));
      const byBrand = [...brandRows].sort((a,b)=>Number(b.hqRevenue||0)-Number(a.hqRevenue||0));
      const leakage = [...branchRows].sort((a,b)=>{
        const aGap = Number(a.posRevenue||0)-Number(a.hqRevenue||0);
        const bGap = Number(b.posRevenue||0)-Number(b.hqRevenue||0);
        return bGap-aGap;
      });
      return { hqBranch:byHq[0]||null, posBranch:byPos[0]||null, hqBrand:byBrand[0]||null, leakageBranch:leakage[0]||null };
    }, [branchRows, brandRows]);

    const openKpi = (metric, title) => setDrilldown({
      type:"kpi",
      title:title || metric,
      loading:false,
      data:{ metric },
    });

    const openBranch = async (row) => {
      setDrilldown({ type:"branch", title:row.branch, loading:true, data:row });
      if (sourceMode === "aggregated") {
        try {
          const data = await fetchJson(`${API}/dashboard/b2b/branches/${encodeURIComponent(row.id)}?month=${encodeURIComponent(month)}`);
          setDrilldown({ type:"branch", title:row.branch, loading:false, data:{ ...row, ...(data?.data || data) } });
          return;
        } catch {}
      }
      setDrilldown({ type:"branch", title:row.branch, loading:false, data:row });
    };

    const openBrand = async (row) => {
      setDrilldown({ type:"brand", title:row.brand, loading:true, data:row });
      const selectedBranchRow = branch ? branchCatalog.find(b=>b.name===branch) : null;
      if (sourceMode === "aggregated" && selectedBranchRow) {
        try {
          const data = await fetchJson(`${API}/dashboard/b2b/branches/${encodeURIComponent(selectedBranchRow.id)}/brands/${encodeURIComponent(row.id)}?month=${encodeURIComponent(month)}`);
          setDrilldown({ type:"brand", title:row.brand, loading:false, data:{ ...row, ...(data?.data || data) } });
          return;
        } catch {}
      }
      setDrilldown({ type:"brand", title:row.brand, loading:false, data:row });
    };

    const openSku = async (row) => {
      setDrilldown({ type:"sku", title:row.product, loading:true, data:row });
      const selectedBranchRow = row?.branchId
        ? { id:row.branchId, name:row.branch }
        : branchCatalog.find(b=>b.name===row.branch && (!row.brand || b.brandNames.includes(row.brand)));
      if (sourceMode === "aggregated" && selectedBranchRow && (row?.productId ?? row?.id) != null) {
        try {
          const q = new URLSearchParams({ branchId:String(selectedBranchRow.id), productId:String(row?.productId ?? row.id), month });
          const data = await fetchJson(`${API}/dashboard/b2b/reconcile?${q.toString()}`);
          setDrilldown({ type:"sku", title:row.product, loading:false, data:{ ...row, ...(data?.data || data) } });
          return;
        } catch {}
      }
      setDrilldown({ type:"sku", title:row.product, loading:false, data:row, warning:"Full opening/receipt/POS/disposal/transfer/manual-adjustment evidence needs the B2B stock evidence endpoint and inventory movement references." });
    };

    const stockDataReady = normalizedOverview.coverage != null || normalizedOverview.unexplained != null || normalizedOverview.sellThrough != null || branchRows.some(r=>r.stockVariance!=null || r.orderCoverage!=null) || brandRows.some(r=>r.endingStock!=null || r.stockVariance!=null);
    const hqMoM = normalizedOverview.prevHqRevenue > 0 ? ((normalizedOverview.hqRevenue-normalizedOverview.prevHqRevenue)/normalizedOverview.prevHqRevenue)*100 : null;
    const posMoM = normalizedOverview.prevPosRevenue > 0 ? ((normalizedOverview.posRevenue-normalizedOverview.prevPosRevenue)/normalizedOverview.prevPosRevenue)*100 : null;
    const hasPreviousHqRevenue = Number(normalizedOverview.prevHqRevenue || 0) > 0;
    const hqRevenueDifference = Number(normalizedOverview.hqRevenue || 0) - Number(normalizedOverview.prevHqRevenue || 0);
    const hqRevenueDirection = !hasPreviousHqRevenue ? "neutral" : hqRevenueDifference > 0 ? "up" : hqRevenueDifference < 0 ? "down" : "same";
    const hqRevenueStatus = hqRevenueDirection === "up"
      ? { label:"REVENUE UP", title:"Head Office revenue is higher this month", color:"#2c5c16", bg:"#f0f5e8", border:"#c9dba0", icon:TrendingUp }
      : hqRevenueDirection === "down"
        ? { label:"REVENUE DOWN", title:"Head Office revenue is lower this month", color:"#b42318", bg:"#fef3f2", border:"#fecaca", icon:TrendingDown }
        : hqRevenueDirection === "same"
          ? { label:"NO CHANGE", title:"Head Office revenue is unchanged", color:"#7c5d12", bg:"#fffbeb", border:"#fde68a", icon:Activity }
          : { label:"NO BASELINE", title:"Head Office monthly comparison is not available yet", color:"#5C6B60", bg:"#F6F7F1", border:"#E1E6D8", icon:Info };
    const HqStatusIcon = hqRevenueStatus.icon;
    const isOverviewView = view === "overview";
    const isGhostView = view === "ghost";

    const franchisorActions = useMemo(() => {
      const items = [];
      const highRiskCount = branchRows.filter(r=>String(r.risk||"").toLowerCase().includes("high")).length;
      const topAnomaly = anomalies[0];
      const targetGap = Number(normalizedOverview.targetGap || 0);
      const unexplained = Number(normalizedOverview.unexplained || 0);
      const coverage = normalizedOverview.coverage;

      if (targetGap > 0) items.push({
        priority:"Revenue priority",
        tone:"amber",
        title:`Close the ${fmtAmt(targetGap)} HQ revenue gap`,
        evidence:`Current HQ supply revenue is ${normalizedOverview.targetAttainment==null?"below target":`${Math.max(0,100-normalizedOverview.targetAttainment).toFixed(1)}% short of target`}.`,
        action:"Review branches with weak ordering activity, confirm upcoming replenishment needs, and validate whether the target remains realistic.",
      });

      if (highRiskCount > 0 || Number(normalizedOverview.atRisk || 0) > 0) items.push({
        priority:"Loss investigation",
        tone:"red",
        title:`Investigate ${Math.max(highRiskCount,Number(normalizedOverview.atRisk||0))} at-risk branch${Math.max(highRiskCount,Number(normalizedOverview.atRisk||0))===1?"":"es"}`,
        evidence:topAnomaly?.reason || "Revenue, HQ ordering, or stock movement is inconsistent at one or more branches.",
        action:topAnomaly?.recommendation || "Open Ghost Stock / Revenue Leakage, start with the highest-risk branch, then reconcile the affected SKU records.",
      });

      if (unexplained > 0) items.push({
        priority:"Inventory control",
        tone:"red",
        title:`Reconcile ${unexplained.toLocaleString()} unexplained stock unit${unexplained===1?"":"s"}`,
        evidence:"Recorded closing stock does not fully agree with opening stock, HQ receipts, POS sales, disposal, and transfers.",
        action:"Require physical counts and source references before approving adjustments or new replenishment.",
      });

      if (coverage != null && coverage < 70) items.push({
        priority:"Supply assurance",
        tone:"amber",
        title:`Improve HQ order coverage from ${Number(coverage).toFixed(1)}%`,
        evidence:"A material portion of reported sell-through is not supported by authorized HQ stock flow.",
        action:"Verify external sourcing, missing receipts, unposted transfers, and delayed mobile-order acknowledgements.",
      });

      if (!items.length) items.push({
        priority:"Healthy position",
        tone:"green",
        title:"No immediate revenue or stock-control exception",
        evidence:"Current targets, risk rules, and available stock movement evidence show no material exception.",
        action:"Maintain controls, review the AI forecast, and continue monitoring changes by branch and SKU.",
      });

      return items.slice(0,3);
    }, [branchRows, anomalies, normalizedOverview]);

    const tableWrap = { overflowX:"auto", border:"1px solid #E7EEE4", borderRadius:13 };
    const th = { padding:"10px 11px", fontSize:9.5, fontWeight:800, textTransform:"uppercase", letterSpacing:".06em", color:"#71806F", background:"#F6FAF3", borderBottom:"1px solid #DDE8DA", whiteSpace:"nowrap" };
    const td = { padding:"11px", fontSize:11, color:"#334155", borderBottom:"1px solid #EEF3EC", whiteSpace:"nowrap" };
    const sectionCard = { background:"#fff", border:"1px solid #E1E6D8", borderRadius:18, padding:"18px 20px", boxShadow:"0 2px 14px rgba(50,109,32,.06)" };

    return (
      <div style={{ fontFamily:FONT, marginBottom:22 }}>
        <style>{`
          .b2b-kpi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.b2b-overview-kpi-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.b2b-two-col{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(300px,.8fr);gap:15px}.b2b-overview-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:14px}.b2b-filter-grid{display:grid;grid-template-columns:160px minmax(170px,1fr) minmax(170px,1fr) minmax(145px,.8fr) 125px;gap:10px;align-items:end}.b2b-brand-grid{display:grid;grid-template-columns:1fr;gap:12px}.b2b-hq-summary-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:13px}@media(max-width:1180px){.b2b-kpi-grid,.b2b-overview-kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.b2b-two-col,.b2b-overview-grid{grid-template-columns:1fr}.b2b-filter-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.franchisor-action-row{grid-template-columns:1fr 1fr!important}.franchisor-action-row>div:last-child{grid-column:1/-1}}@media(max-width:680px){.b2b-kpi-grid,.b2b-overview-kpi-grid,.b2b-filter-grid,.b2b-hq-summary-grid{grid-template-columns:1fr}.b2b-filter-grid button{width:100%}.franchisor-action-row{grid-template-columns:1fr!important}.franchisor-action-row>div:last-child{grid-column:auto}}
        `}</style>

        {isOverviewView && (
        <div style={{ ...sectionCard, marginBottom:14, padding:"17px 18px", border:`1px solid ${hqRevenueStatus.border}`, borderLeft:`5px solid ${hqRevenueStatus.color}`, background:hqRevenueStatus.bg }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:14, flexWrap:"wrap" }}>
            <div style={{ minWidth:260, flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:6 }}>
                <HqStatusIcon size={17} color={hqRevenueStatus.color}/>
                <span style={{ fontSize:10, fontWeight:850, letterSpacing:".08em", textTransform:"uppercase", color:hqRevenueStatus.color }}>Head Office Monthly Performance</span>
              </div>
              <div style={{ fontSize:18, fontWeight:850, color:"#12241B", lineHeight:1.25 }}>{hqRevenueStatus.title}</div>
              <div style={{ marginTop:5, fontSize:11.5, color:"#5C6B60", lineHeight:1.5 }}>
                {hasPreviousHqRevenue
                  ? <>This month is <b style={{color:hqRevenueStatus.color}}>{Math.abs(hqMoM || 0).toFixed(1)}% {hqRevenueDifference >= 0 ? "higher" : "lower"}</b> than last month based on total fulfilled/delivered Head Office supply orders.</>
                  : <>There is no previous-month Head Office supply revenue available yet for comparison.</>}
              </div>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <span style={{ padding:"6px 10px", borderRadius:999, background:"#fff", border:`1px solid ${hqRevenueStatus.border}`, color:hqRevenueStatus.color, fontSize:10, fontWeight:850 }}>{hqRevenueStatus.label}</span>
              <button onClick={loadB2B} disabled={loading} style={{ display:"inline-flex", alignItems:"center", gap:6, border:"1px solid #DDE8DA", background:"#fff", color:"#3b791e", borderRadius:9, padding:"7px 10px", fontSize:10.5, fontWeight:800, cursor:loading?"wait":"pointer" }}><RefreshCw size={12} style={{animation:loading?"spin .8s linear infinite":"none"}}/>Refresh</button>
            </div>
          </div>

          <div className="b2b-hq-summary-grid">
            <B2BSummaryMetricCard
              label="This Month"
              value={fmtAmt(normalizedOverview.hqRevenue)}
              loading={loading}
              border={hqRevenueStatus.border}
              onClick={()=>openKpi("hqRevenue", "Current HQ Supply Revenue")}
            />
            <B2BSummaryMetricCard
              label="Last Month"
              value={hasPreviousHqRevenue ? fmtAmt(normalizedOverview.prevHqRevenue) : "—"}
              loading={loading}
              border={hqRevenueStatus.border}
              onClick={()=>openKpi("hqPrevious", "Previous-Month HQ Supply Revenue")}
            />
            <B2BSummaryMetricCard
              label="Month-on-Month Change"
              value={hasPreviousHqRevenue ? `${hqRevenueDifference >= 0 ? "+" : "−"}${fmtAmt(Math.abs(hqRevenueDifference))}` : "—"}
              loading={loading}
              color={hqRevenueStatus.color}
              border={hqRevenueStatus.border}
              onClick={()=>openKpi("hqChange", "HQ Month-on-Month Change")}
            />
          </div>
        </div>
        )}

        <div style={{ ...sectionCard, padding:"15px 16px", marginBottom:14 }}>
          <div className="b2b-filter-grid">
            <label><span style={{fontSize:9.5,fontWeight:800,color:"#71806F",textTransform:"uppercase",letterSpacing:".06em"}}>Month</span><input type="month" value={month} onChange={e=>setMonth(e.target.value)} style={{...invInputSt,marginTop:5,height:37}}/></label>
            <label><span style={{fontSize:9.5,fontWeight:800,color:"#71806F",textTransform:"uppercase",letterSpacing:".06em"}}>Brand</span><select value={brand} onChange={e=>setBrand(e.target.value)} style={{...invInputSt,marginTop:5,height:37}}><option value="">All Brands</option>{brandOptions.map(b=><option key={b.id} value={b.name}>{b.name}</option>)}</select></label>
            <label><span style={{fontSize:9.5,fontWeight:800,color:"#71806F",textTransform:"uppercase",letterSpacing:".06em"}}>Branch / Brand / Location</span><select value={branch} onChange={e=>setBranch(e.target.value)} style={{...invInputSt,marginTop:5,height:37}}><option value="">All Branches</option>{branchOptions.map(b=><option key={b.id} value={b.name}>{b.name} — {b.brandNames?.join(", ") || "Unassigned Brand"}{b.location&&b.location!=="—"?` — ${b.location}`:""}</option>)}</select></label>
            {isGhostView && <label><span style={{fontSize:9.5,fontWeight:800,color:"#71806F",textTransform:"uppercase",letterSpacing:".06em"}}>Risk Status</span><select value={risk} onChange={e=>setRisk(e.target.value)} style={{...invInputSt,marginTop:5,height:37}}><option value="all">All Statuses</option><option value="high">High Risk</option><option value="watch">Watch</option><option value="normal">Normal</option></select></label>}
            {isOverviewView && <label><span style={{fontSize:9.5,fontWeight:800,color:"#71806F",textTransform:"uppercase",letterSpacing:".06em"}}>Target Growth %</span><input type="number" min="0" max="500" value={growthTargetPct} onChange={e=>setGrowthTargetPct(Math.max(0,Number(e.target.value)||0))} style={{...invInputSt,marginTop:5,height:37}}/></label>}
          </div>
        </div>

        {loadError && <div style={{ marginBottom:12, padding:"10px 12px", borderRadius:10, background:"#fef2f2", border:"1px solid #fecaca", color:"#991b1b", fontSize:11.5, display:"flex", gap:7, alignItems:"flex-start" }}><AlertTriangle size={14} style={{flexShrink:0,marginTop:1}}/>{loadError}</div>}
        {sourceMode === "fallback" && <div style={{ marginBottom:12, padding:"10px 12px", borderRadius:10, background:"#fffbeb", border:"1px solid #fde68a", color:"#92400e", fontSize:10.8, lineHeight:1.5, display:"flex", gap:7, alignItems:"flex-start" }}><Info size={14} style={{flexShrink:0,marginTop:1}}/><span>This view is using your existing Mobile Orders, POS transactions, and branch inventory endpoints. Exact historical ghost-stock proof still requires dated opening/closing counts and inventory movements linked to their source order, sale, disposal, or transfer.</span></div>}

        {isOverviewView && (
          <div style={{ ...sectionCard, marginBottom:15, padding:"18px 19px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:14, flexWrap:"wrap", marginBottom:13 }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:15, fontWeight:850, color:"#12241B" }}><Brain size={16} color="#3b791e"/> Franchisor Decision Summary</div>
                <div style={{ fontSize:10.8, color:"#6B7A65", marginTop:4 }}>What needs attention now, why it matters, and the next business action.</div>
              </div>
              <button onClick={onOpenSalesAi} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 11px", borderRadius:9, border:"1px solid #C9DBA0", background:"#F4F8F0", color:"#2c5c16", fontSize:10.5, fontWeight:850, cursor:"pointer", fontFamily:FONT }}>Open Sales &amp; AI Guidance <ChevronRight size={12}/></button>
            </div>
            <div style={{ display:"grid", gap:9 }}>
              {franchisorActions.map((item,index)=>{
                const tone = item.tone === "red"
                  ? { accent:"#c0392b", bg:"#fff7f7", border:"#f2c9c4", badge:"#fee2e2" }
                  : item.tone === "amber"
                    ? { accent:"#b45309", bg:"#fffbeb", border:"#fde68a", badge:"#fef3c7" }
                    : { accent:"#2c5c16", bg:"#f4f8f0", border:"#c9dba0", badge:"#eaf3df" };
                return <div className="franchisor-action-row" key={`${item.priority}-${index}`} style={{ display:"grid", gridTemplateColumns:"minmax(145px,.42fr) minmax(220px,.8fr) minmax(280px,1.25fr)", gap:13, padding:"12px 13px", borderRadius:12, border:`1px solid ${tone.border}`, borderLeft:`4px solid ${tone.accent}`, background:tone.bg, alignItems:"start" }}>
                  <div><span style={{ display:"inline-flex", padding:"4px 8px", borderRadius:20, background:tone.badge, color:tone.accent, fontSize:9.3, fontWeight:900, textTransform:"uppercase", letterSpacing:".055em" }}>{index + 1}. {item.priority}</span><div style={{ fontSize:12, fontWeight:850, color:"#12241B", marginTop:7, lineHeight:1.4 }}>{item.title}</div></div>
                  <div><div style={{ fontSize:9.2, fontWeight:850, color:"#71806F", textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>Evidence</div><div style={{ fontSize:10.7, color:"#526052", lineHeight:1.55 }}>{item.evidence}</div></div>
                  <div><div style={{ fontSize:9.2, fontWeight:850, color:tone.accent, textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>Recommended next step</div><div style={{ fontSize:10.8, color:"#26372B", lineHeight:1.55, fontWeight:650 }}>{item.action}</div></div>
                </div>;
              })}
            </div>
          </div>
        )}

        {isGhostView && (
          <div style={{ ...sectionCard, marginBottom:15, padding:"15px 17px", borderLeft:"5px solid #c0392b", background:"linear-gradient(135deg,#fff,#fff8f7)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:14, flexWrap:"wrap" }}>
              <div><div style={{ display:"flex", alignItems:"center", gap:7, fontSize:14.5, fontWeight:850, color:"#12241B" }}><ShieldCheck size={16} color="#c0392b"/> Loss Investigation Workflow</div><div style={{ fontSize:10.8, color:"#6B7A65", marginTop:4 }}>Start with a risk branch, identify the affected SKU, verify movement evidence, then assign the corrective action.</div></div>
              <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>{["1  Risk branch","2  Affected SKU","3  Movement evidence","4  Corrective action"].map((step,i)=><React.Fragment key={step}><span style={{ padding:"6px 9px", borderRadius:20, background:i===0?"#fee2e2":"#F6F7F1", color:i===0?"#991b1b":"#526052", border:`1px solid ${i===0?"#fecaca":"#DDE8DA"}`, fontSize:9.7, fontWeight:850 }}>{step}</span>{i<3&&<ChevronRight size={12} color="#94a3b8"/>}</React.Fragment>)}</div>
            </div>
          </div>
        )}

        {isOverviewView && (
        <div className="b2b-kpi-grid b2b-overview-kpi-grid" style={{marginBottom:12}}>
          <B2BMetricCard label="FranchiSync Supply Revenue" value={fmtAmt(normalizedOverview.hqRevenue)} icon={Package} tone="green" loading={loading} onClick={()=>openKpi("hqRevenue", "FranchiSync Supply Revenue")} note={`${hqMoM==null?"No prior-month baseline":`${hqMoM>=0?"+":""}${hqMoM.toFixed(1)}% vs last month`} · fulfilled/delivered HQ orders`} />
          <B2BMetricCard label="Target Gap" value={hasPreviousHqRevenue?fmtAmt(normalizedOverview.targetGap):"—"} icon={TrendingDown} tone={normalizedOverview.targetGap>0?"red":"green"} loading={loading} onClick={()=>openKpi("targetGap", "Target Gap")} note={!hasPreviousHqRevenue?"No previous-month baseline":normalizedOverview.targetGap>0?"HQ supply revenue still needed to hit target":"Target achieved for the selected month"} />
          <B2BMetricCard label="Franchisee POS Revenue" value={fmtAmt(normalizedOverview.posRevenue)} icon={ShoppingCart} tone="blue" loading={loading} onClick={()=>openKpi("posRevenue", "Franchisee POS Revenue")} note={`${posMoM==null?"No prior-month baseline":`${posMoM>=0?"+":""}${posMoM.toFixed(1)}% vs last month`} · paid/completed POS`} />
          <B2BMetricCard label="At-Risk Branches" value={Number(normalizedOverview.atRisk||0).toLocaleString()} icon={AlertTriangle} tone={normalizedOverview.atRisk>0?"red":"green"} loading={loading} onClick={()=>openKpi("atRisk", "At-Risk Branches")} note="High POS with weak HQ ordering or stock mismatch" />
        </div>
        )}

        {isGhostView && (
        <div className="b2b-kpi-grid" style={{marginBottom:15}}>
          <B2BMetricCard label="HQ Order Coverage" value={normalizedOverview.coverage==null?"—":`${normalizedOverview.coverage.toFixed(1)}%`} icon={ShieldCheck} tone={normalizedOverview.coverage!=null&&normalizedOverview.coverage<70?"red":"green"} loading={loading} onClick={()=>openKpi("coverage", "HQ Order Coverage")} note={normalizedOverview.coverage==null?"Requires authorized stock movement evidence":"Authorized HQ stock coverage of reported sell-through"} />
          <B2BMetricCard label="At-Risk Branches" value={Number(normalizedOverview.atRisk||0).toLocaleString()} icon={AlertTriangle} tone={normalizedOverview.atRisk>0?"red":"green"} loading={loading} onClick={()=>openKpi("atRisk", "At-Risk Branches")} note={`${anomalies.filter(a=>String(a.severity).toLowerCase().includes("high")).length} high-risk · ranked anomaly list`} />
          <B2BMetricCard label="Unexplained Stock" value={normalizedOverview.unexplained==null?"—":Number(normalizedOverview.unexplained).toLocaleString()} icon={Layers} tone={normalizedOverview.unexplained>0?"red":"green"} loading={loading} onClick={()=>openKpi("unexplained", "Unexplained Stock")} note={normalizedOverview.unexplained==null?"Requires opening/receipts/transfers/POS/disposal linkage":"Positive/negative stock variance requiring investigation"} />
        </div>
        )}

        {isOverviewView && <div style={{ ...sectionCard, marginBottom:15 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:12, flexWrap:"wrap" }}><div><div style={{fontSize:15,fontWeight:800,color:"#12241B"}}>6-Month Supply Revenue vs POS Revenue</div><div style={{fontSize:10.8,color:"#6B7A65",marginTop:3,lineHeight:1.5}}>Green is FranchiSync supply revenue, blue is franchisee POS revenue, and the dashed line is the HQ target. If POS stays high while supply revenue falls, inspect the affected branch. Click a month to focus the dashboard.</div></div><div style={{fontSize:10.5,color:"#5C6B60",fontWeight:700}}>{b2bMonthLabel(month)}</div></div>
          <B2BDualTrendChart data={trendData} onPointClick={d=>{ if(d?.month) setMonth(d.month); }} />
        </div>}

        {isOverviewView && (
        <div className="b2b-overview-grid" style={{marginBottom:15}}>
          <div style={sectionCard}>
            <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start",marginBottom:11,flexWrap:"wrap"}}>
              <div><div style={{fontSize:15,fontWeight:800,color:"#12241B"}}>Branch Performance</div><div style={{fontSize:10.8,color:"#6B7A65",marginTop:3}}>Supply and POS performance by branch, brand and location</div></div>
              <div style={{fontSize:9.8,color:"#5C6B60",textAlign:"right",lineHeight:1.5}}>Top HQ: <b style={{color:"#2c5c16"}}>{monthlyLeaders.hqBranch?`${monthlyLeaders.hqBranch.branch} · ${monthlyLeaders.hqBranch.brand}`:"—"}</b><br/>Highest POS: <b style={{color:"#2563eb"}}>{monthlyLeaders.posBranch?`${monthlyLeaders.posBranch.branch} · ${monthlyLeaders.posBranch.brand}`:"—"}</b></div>
            </div>
            <div style={tableWrap}><table style={{width:"100%",borderCollapse:"collapse",minWidth:650}}><thead><tr>{["Branch / Brand","HQ Supply","POS Revenue","Coverage","Status"].map((h,i)=><th key={h} style={{...th,textAlign:i===0?"left":"right"}}>{h}</th>)}</tr></thead><tbody>{[...branchRows].sort((a,b)=>Number(b.hqRevenue||0)-Number(a.hqRevenue||0)).slice(0,8).map((r,i)=><tr key={r.id} onClick={()=>openBranch(r)} style={{cursor:"pointer",background:i%2?"#FBFDF9":"#fff"}} onMouseEnter={e=>e.currentTarget.style.background="#F4F8F0"} onMouseLeave={e=>e.currentTarget.style.background=i%2?"#FBFDF9":"#fff"}><td style={{...td,color:"#12241B"}}><div style={{fontWeight:850}}>{r.branch}</div><div style={{fontSize:9.5,fontWeight:650,color:"#789086",marginTop:3}}>{r.brand||"Brand not set"}</div></td><td style={{...td,textAlign:"right",fontWeight:800,color:"#3b791e"}}>{fmtAmt(r.hqRevenue)}</td><td style={{...td,textAlign:"right",fontWeight:800,color:"#2563eb"}}>{fmtAmt(r.posRevenue)}</td><td style={{...td,textAlign:"right",fontWeight:750}}>{r.orderCoverage==null?"—":`${r.orderCoverage.toFixed(1)}%`}</td><td style={{...td,textAlign:"right"}}><B2BRiskBadge risk={r.risk}/></td></tr>)}{!branchRows.length&&<tr><td colSpan="5" style={{padding:26,textAlign:"center",fontSize:10.8,color:"#82907F"}}>No branch data for the selected month.</td></tr>}</tbody></table></div>
          </div>

          <div style={sectionCard}>
            <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start",marginBottom:11,flexWrap:"wrap"}}>
              <div><div style={{fontSize:15,fontWeight:800,color:"#12241B"}}>Brand Performance</div><div style={{fontSize:10.8,color:"#6B7A65",marginTop:3}}>Which brand earns the most for FranchiSync this month</div></div>
              <div style={{fontSize:9.8,color:"#5C6B60",textAlign:"right",lineHeight:1.5}}>Top brand: <b style={{color:"#2c5c16"}}>{monthlyLeaders.hqBrand?.brand||"—"}</b><br/>Largest POS–HQ gap: <b style={{color:"#b42318"}}>{monthlyLeaders.leakageBranch?`${monthlyLeaders.leakageBranch.branch} · ${monthlyLeaders.leakageBranch.brand}`:"—"}</b></div>
            </div>
            <div style={tableWrap}><table style={{width:"100%",borderCollapse:"collapse",minWidth:540}}><thead><tr>{["Brand","HQ Supply","POS Revenue","Supplied / Sold"].map((h,i)=><th key={h} style={{...th,textAlign:i===0?"left":"right"}}>{h}</th>)}</tr></thead><tbody>{[...brandRows].sort((a,b)=>Number(b.hqRevenue||0)-Number(a.hqRevenue||0)).slice(0,8).map((r,i)=><tr key={r.id} onClick={()=>openBrand(r)} style={{cursor:"pointer",background:i%2?"#FBFDF9":"#fff"}} onMouseEnter={e=>e.currentTarget.style.background="#F4F8F0"} onMouseLeave={e=>e.currentTarget.style.background=i%2?"#FBFDF9":"#fff"}><td style={{...td,fontWeight:800,color:"#12241B"}}>{r.brand}</td><td style={{...td,textAlign:"right",fontWeight:800,color:"#3b791e"}}>{fmtAmt(r.hqRevenue)}</td><td style={{...td,textAlign:"right",fontWeight:800,color:"#2563eb"}}>{fmtAmt(r.posRevenue)}</td><td style={{...td,textAlign:"right",fontWeight:750}}>{Number(r.suppliedQty||0).toLocaleString()} / {Number(r.soldQty||0).toLocaleString()}</td></tr>)}{!brandRows.length&&<tr><td colSpan="4" style={{padding:26,textAlign:"center",fontSize:10.8,color:"#82907F"}}>No brand data for the selected month.</td></tr>}</tbody></table></div>
          </div>
        </div>
        )}

        {isGhostView && (
        <div className="b2b-two-col" style={{marginBottom:15,gridTemplateColumns:"1fr"}}>
          <div style={sectionCard}>
            <div style={{ display:"flex", justifyContent:"space-between", gap:12, marginBottom:12, alignItems:"flex-start" }}><div><div style={{fontSize:15,fontWeight:800,color:"#12241B"}}>Loss Risk by Branch</div><div style={{fontSize:10.8,color:"#6B7A65",marginTop:3}}>Highest risk first. Use coverage and stock variance to locate the likely source of loss, then click a branch for evidence.</div></div><span style={{fontSize:10.5,fontWeight:800,color:"#3b791e"}}>{sortedBranchRows.length} branches</span></div>
            <div style={tableWrap}><table style={{width:"100%",borderCollapse:"collapse",minWidth:760}}><thead><tr>{["Branch / Brand","HQ Supply","POS Revenue","Order Coverage","Stock Variance","Risk"].map((h,i)=><th key={h} style={{...th,textAlign:i===0?"left":"right"}}>{h}</th>)}</tr></thead><tbody>{sortedBranchRows.length?sortedBranchRows.map((r,i)=><tr key={r.id} onClick={()=>openBranch(r)} style={{cursor:"pointer",background:i%2?"#FBFDF9":"#fff"}} onMouseEnter={e=>e.currentTarget.style.background="#F4F8F0"} onMouseLeave={e=>e.currentTarget.style.background=i%2?"#FBFDF9":"#fff"}><td style={{...td,color:"#12241B"}}><div style={{fontWeight:850}}>{r.branch}</div><div style={{fontSize:9.5,fontWeight:650,color:"#789086",marginTop:3}}>{r.brand||"Brand not set"}</div></td><td style={{...td,textAlign:"right",fontWeight:800,color:"#3b791e"}}>{fmtAmt(r.hqRevenue)}</td><td style={{...td,textAlign:"right",fontWeight:800,color:"#2563eb"}}>{fmtAmt(r.posRevenue)}</td><td style={{...td,textAlign:"right",fontWeight:700}}>{r.orderCoverage==null?"—":`${r.orderCoverage.toFixed(1)}%`}</td><td style={{...td,textAlign:"right",fontWeight:700,color:r.stockVariance==null?"#94a3b8":r.stockVariance===0?"#2c5c16":"#c0392b"}}>{r.stockVariance==null?"—":`${r.stockVariance>0?"+":""}${r.stockVariance.toLocaleString()} units`}</td><td style={{...td,textAlign:"right"}}><B2BRiskBadge risk={r.risk}/></td></tr>):<tr><td colSpan="6" style={{padding:28,textAlign:"center",color:"#94a3b8",fontSize:11.5}}>No branch risk data for the selected filters.</td></tr>}</tbody></table></div>
          </div>

          <div style={{...sectionCard,display:"none"}}>
            <div style={{fontSize:15,fontWeight:800,color:"#12241B"}}>Store Location View</div><div style={{fontSize:10.8,color:"#6B7A65",marginTop:3,marginBottom:13}}>Fast location scan · click a store to open branch detail</div>
            <div style={{display:"grid",gap:8,maxHeight:390,overflowY:"auto",paddingRight:2}}>{sortedBranchRows.length?sortedBranchRows.map((r,i)=><button key={r.id} onClick={()=>openBranch(r)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"10px 11px",border:"1px solid #E7EEE4",borderRadius:11,background:i%2?"#FBFDF9":"#fff",cursor:"pointer",fontFamily:FONT,textAlign:"left"}}><div style={{display:"flex",gap:8,alignItems:"flex-start",minWidth:0}}><MapPin size={14} color="#3b791e" style={{flexShrink:0,marginTop:1}}/><div style={{minWidth:0}}><div style={{fontSize:11,fontWeight:800,color:"#12241B",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.branch}</div><div style={{fontSize:9.5,color:"#8A9687",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.brand||"Brand not set"}</div></div></div><B2BRiskBadge risk={r.risk}/></button>):<DashboardEmptyState message="No store locations available."/>}</div>
          </div>
        </div>
        )}

        {drilldown && (
          <div onMouseDown={e=>{ if(e.target===e.currentTarget)setDrilldown(null); }} style={{position:"fixed",inset:0,zIndex:5000,background:"rgba(18,36,27,.58)",backdropFilter:"blur(5px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <div style={{width:"min(940px,96vw)",maxHeight:"88vh",overflowY:"auto",background:"#fff",borderRadius:20,border:"1px solid #DDE8DA",boxShadow:"0 30px 80px rgba(18,36,27,.28)",fontFamily:FONT}}>
              <div style={{position:"sticky",top:0,zIndex:2,background:"#fff",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,padding:"17px 20px",borderBottom:"1px solid #E7EEE4"}}><div><div style={{fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:".07em",color:"#6B7A65"}}>{drilldown.type} detail · {b2bMonthLabel(month)}</div><div style={{fontSize:18,fontWeight:850,color:"#12241B",marginTop:3}}>{drilldown.title}</div></div><button onClick={()=>setDrilldown(null)} style={{width:32,height:32,borderRadius:9,border:"1px solid #E1E6D8",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#5C6B60"}}><X size={15}/></button></div>
              <div style={{padding:20}}>
                {drilldown.loading ? <div style={{padding:40,textAlign:"center",color:"#6B7A65"}}><RefreshCw size={22} style={{animation:"spin .8s linear infinite"}}/><div style={{marginTop:8,fontSize:11.5}}>Loading drilldown evidence…</div></div> : (
                  <>
                    {drilldown.warning && <div style={{marginBottom:12,padding:"10px 12px",borderRadius:10,background:"#fffbeb",border:"1px solid #fde68a",color:"#92400e",fontSize:10.8,lineHeight:1.5}}>{drilldown.warning}</div>}
                    {drilldown.type === "branch" && <div><div className="b2b-kpi-grid" style={{gridTemplateColumns:"repeat(4,minmax(0,1fr))",marginBottom:14}}><B2BMetricCard label="HQ Supply Revenue" value={fmtAmt(b2bNullableNum(drilldown.data?.hq_supply_revenue,drilldown.data?.hqRevenue)??0)} icon={Package} note="Open complete HQ breakdown" onClick={()=>openKpi("hqRevenue","HQ Supply Revenue")}/><B2BMetricCard label="POS Revenue" value={fmtAmt(b2bNullableNum(drilldown.data?.pos_revenue,drilldown.data?.posRevenue)??0)} icon={ShoppingCart} tone="blue" note="Open complete POS breakdown" onClick={()=>openKpi("posRevenue","POS Revenue")}/><B2BMetricCard label="Target Attainment" value={b2bNullableNum(drilldown.data?.target_attainment_pct,drilldown.data?.targetPct)==null?"—":`${b2bNullableNum(drilldown.data?.target_attainment_pct,drilldown.data?.targetPct).toFixed(1)}%`} icon={Target} tone="amber" note="Open monthly target evidence" onClick={()=>openKpi("target","Target Attainment")}/><B2BMetricCard label="Order Coverage" value={b2bNullableNum(drilldown.data?.order_coverage,drilldown.data?.orderCoverage)==null?"—":`${b2bNullableNum(drilldown.data?.order_coverage,drilldown.data?.orderCoverage).toFixed(1)}%`} icon={ShieldCheck} note="Open stock-flow coverage" onClick={()=>openKpi("coverage","Order Coverage")}/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><div style={sectionCard}><div style={{fontSize:12,fontWeight:800,color:"#12241B",marginBottom:8}}>Why this branch is flagged</div><div style={{fontSize:10.8,color:"#5C6B60",lineHeight:1.6}}>{drilldown.data?.reason || drilldown.data?.risk_reason || "No anomaly explanation was returned for this branch."}</div><div style={{marginTop:10}}><B2BRiskBadge risk={drilldown.data?.risk || drilldown.data?.risk_status}/></div></div><div style={sectionCard}><div style={{fontSize:12,fontWeight:800,color:"#12241B",marginBottom:8}}>Branch context</div><div style={{fontSize:10.8,color:"#5C6B60",lineHeight:1.6}}>Branch: <b>{drilldown.data?.branch || drilldown.title}</b><br/>Brand: <b>{drilldown.data?.brand || "Unassigned Brand"}</b><br/>Location: <b>{drilldown.data?.location || "—"}</b><br/>Selected month: <b>{b2bMonthLabel(month)}</b></div></div></div></div>}
                    {drilldown.type === "brand" && <div><div className="b2b-kpi-grid" style={{gridTemplateColumns:"repeat(4,minmax(0,1fr))",marginBottom:14}}><B2BMetricCard label="HQ Supply Revenue" value={fmtAmt(b2bNullableNum(drilldown.data?.hq_supply_revenue,drilldown.data?.hqRevenue)??0)} icon={Package} note="Open complete HQ breakdown" onClick={()=>openKpi("hqRevenue","HQ Supply Revenue")}/><B2BMetricCard label="POS Revenue" value={fmtAmt(b2bNullableNum(drilldown.data?.pos_revenue,drilldown.data?.posRevenue)??0)} icon={ShoppingCart} tone="blue" note="Open complete POS breakdown" onClick={()=>openKpi("posRevenue","POS Revenue")}/><B2BMetricCard label="Qty Supplied" value={b2bNum(drilldown.data?.supplied_qty,drilldown.data?.suppliedQty).toLocaleString()} icon={Package} note="Open HQ order coverage" onClick={()=>openKpi("coverage","Quantity Supplied")}/><B2BMetricCard label="Qty Sold" value={b2bNum(drilldown.data?.sold_qty,drilldown.data?.soldQty).toLocaleString()} icon={TrendingUp} tone="blue" note="Open sell-through evidence" onClick={()=>openKpi("sellThrough","Quantity Sold")}/></div><div style={{fontSize:10.8,color:"#5C6B60",lineHeight:1.6}}>Click an SKU in the ghost stock evidence table for opening stock, HQ receipts, POS deductions, disposal, manual adjustment, closing stock and variance evidence.</div></div>}
                    {drilldown.type === "sku" && <div><div style={tableWrap}><table style={{width:"100%",borderCollapse:"collapse",minWidth:860}}><thead><tr><th style={{...th,textAlign:"left"}}>Product / Brand</th>{["Opening","HQ Receipts","POS Sold","Disposal / Waste","Transfer In","Transfer Out","Recorded Closing","Variance"].map(h=><th key={h} style={{...th,textAlign:"right"}}>{h}</th>)}</tr></thead><tbody><tr><td style={{...td,textAlign:"left"}}><b>{drilldown.data?.product || drilldown.data?.sku || "SKU"}</b><div style={{fontSize:9,color:"#789086",marginTop:2}}>{drilldown.data?.brand || "Brand not set"}{drilldown.data?.branch?` · ${drilldown.data.branch}`:""}</div></td><td style={{...td,textAlign:"right"}}>{b2bNullableNum(drilldown.data?.opening_stock,drilldown.data?.openingStock)==null?"—":b2bNullableNum(drilldown.data?.opening_stock,drilldown.data?.openingStock).toLocaleString()}</td><td style={{...td,textAlign:"right",fontWeight:800,color:"#3b791e"}}>{b2bNum(drilldown.data?.hq_received,drilldown.data?.received_qty,drilldown.data?.suppliedQty).toLocaleString()}</td><td style={{...td,textAlign:"right",fontWeight:800,color:"#2563eb"}}>{b2bNum(drilldown.data?.pos_sold,drilldown.data?.sold_qty,drilldown.data?.soldQty).toLocaleString()}</td><td style={{...td,textAlign:"right"}}>{b2bNullableNum(drilldown.data?.disposal,drilldown.data?.waste)==null?"—":b2bNum(drilldown.data?.disposal,drilldown.data?.waste).toLocaleString()}</td><td style={{...td,textAlign:"right"}}>{b2bNullableNum(drilldown.data?.transfer_in)==null?"—":b2bNum(drilldown.data?.transfer_in).toLocaleString()}</td><td style={{...td,textAlign:"right"}}>{b2bNullableNum(drilldown.data?.transfer_out)==null?"—":b2bNum(drilldown.data?.transfer_out).toLocaleString()}</td><td style={{...td,textAlign:"right"}}>{b2bNullableNum(drilldown.data?.closing_stock,drilldown.data?.endingStock)==null?"—":b2bNullableNum(drilldown.data?.closing_stock,drilldown.data?.endingStock).toLocaleString()}</td><td style={{...td,textAlign:"right",fontWeight:800,color:"#c0392b"}}>{b2bNullableNum(drilldown.data?.variance,drilldown.data?.stockVariance)==null?"—":b2bNullableNum(drilldown.data?.variance,drilldown.data?.stockVariance).toLocaleString()}</td></tr></tbody></table></div><div style={{marginTop:12,fontSize:10.5,color:"#6B7A65",lineHeight:1.55}}>Evidence endpoint should also return linked Mobile Order references, POS transactions, inventory movements, source/reference IDs, user/reason for manual adjustments, and before/after quantities.</div></div>}
                    {drilldown.type === "sku" && Array.isArray(drilldown.data?.ingredients) && (
                      <div style={{marginTop:14}}>
                        <div style={{fontSize:12.5,fontWeight:850,color:"#12241B",marginBottom:4}}>Specific ingredients for this product</div>
                        <div style={{fontSize:10.2,color:"#6B7A65",lineHeight:1.5,marginBottom:9}}>
                          {drilldown.data?.brand || "Brand not set"} · {drilldown.data?.branch || "Branch not set"} · {drilldown.data?.product || drilldown.data?.sku || "Product"}
                        </div>
                        <div style={tableWrap}>
                          <table style={{width:"100%",borderCollapse:"collapse",minWidth:760}}>
                            <thead><tr>{["Ingredient","Required usage","HQ received","Current stock","Unit","Variance"].map((label,index)=><th key={label} style={{...th,textAlign:index===0?"left":"right"}}>{label}</th>)}</tr></thead>
                            <tbody>
                              {drilldown.data.ingredients.length ? [...drilldown.data.ingredients]
                                .sort((a,b)=>String(a?.ingredient_name||"").localeCompare(String(b?.ingredient_name||"")))
                                .map((ingredient,index)=><tr key={ingredient?.ingredient_id ?? `${ingredient?.ingredient_name}-${index}`} style={{background:index%2?"#FBFDF9":"#fff"}}>
                                  <td style={{...td,textAlign:"left",fontWeight:800,color:"#12241B"}}>{ingredient?.ingredient_name || "Unnamed ingredient"}</td>
                                  <td style={{...td,textAlign:"right",fontWeight:800,color:"#2563eb"}}>{b2bNum(ingredient?.expected_pos_usage).toLocaleString()}</td>
                                  <td style={{...td,textAlign:"right",fontWeight:800,color:"#3b791e"}}>{b2bNum(ingredient?.hq_received).toLocaleString()}</td>
                                  <td style={{...td,textAlign:"right"}}>{b2bNullableNum(ingredient?.closing_stock)==null?"—":b2bNum(ingredient?.closing_stock).toLocaleString()}</td>
                                  <td style={{...td,textAlign:"right"}}>{ingredient?.unit || "—"}</td>
                                  <td style={{...td,textAlign:"right",fontWeight:800,color:b2bNullableNum(ingredient?.variance)==null?"#94a3b8":"#c0392b"}}>{b2bNullableNum(ingredient?.variance)==null?"—":b2bNum(ingredient?.variance).toLocaleString()}</td>
                                </tr>) : <tr><td colSpan="6" style={{padding:24,textAlign:"center",color:"#94a3b8",fontSize:10.8}}>No recipe ingredients are linked to this product for this brand and branch.</td></tr>}
                            </tbody>
                          </table>
                        </div>
                        <div style={{marginTop:9,fontSize:9.8,color:"#82907F",lineHeight:1.5}}>Required usage = POS units sold × recipe quantity. Ingredient rows are restricted to the selected product’s exact brand and branch.</div>
                      </div>
                    )}
                    {drilldown.type === "kpi" && (
                      <B2BKpiBreakdown
                        metric={drilldown.data?.metric}
                        overview={normalizedOverview}
                        branchRows={sortedBranchRows}
                        brandRows={brandRows}
                        skuRows={skuRows}
                        productRows={productEvidenceRows}
                        anomalies={anomalies}
                        month={month}
                        growthTargetPct={growthTargetPct}
                        onOpenBranch={openBranch}
                        onOpenBrand={openBrand}
                        onOpenSku={openSku}
                      />
                    )}
                    {drilldown.type === "anomaly" && <div style={{fontSize:11.5,color:"#5C6B60",lineHeight:1.65}}><B2BRiskBadge risk={drilldown.data?.severity}/><div style={{marginTop:12}}><b>Reason:</b> {drilldown.data?.reason}</div><div style={{marginTop:6}}><b>Recommended action:</b> {drilldown.data?.recommendation}</div></div>}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function OperationalKpiBreakdownModal({ detail, onClose, overview, branchRows = [], rangeLabel, filterLabel }) {
    if (!detail) return null;
    const id = detail.id;
    const rows = [...branchRows].sort((a,b)=>{
      if (id === "transactions") return Number(b.transactions||0)-Number(a.transactions||0);
      if (id === "averageSale") return Number(b.avgOrder||0)-Number(a.avgOrder||0);
      return Number(b.revenue||0)-Number(a.revenue||0);
    });
    const totalRevenue = Number(overview?.revenue || 0);
    const totalTransactions = Number(overview?.transactions || 0);
    const averageSale = Number(overview?.averageSale || 0);
    const activeBranches = Number(overview?.activeBranches || 0);
    const summaryCards = [
      ["Revenue", fmtAmt(totalRevenue), TrendingUp, "green", "Actual selected-period sales"],
      ["Transactions", totalTransactions.toLocaleString(), ShoppingCart, "blue", "Completed sales records"],
      ["Average Sale", fmtAmt(averageSale), BarChart2, "amber", "Revenue per transaction"],
      ["Active Branches", activeBranches.toLocaleString(), Store, "green", "Branches with recorded sales"],
    ];
    const descriptions = {
      revenue:"Actual POS revenue split by branch, including available cost and margin evidence.",
      transactions:"Completed POS transaction volume split by branch.",
      averageSale:"Average transaction value by branch, with volume and revenue context.",
      activeBranches:"All branches with sales activity inside the current dashboard scope.",
    };
    const columns = id === "transactions"
      ? [
          ["Branch / Brand","left",r=><><b>{r.branch}</b><div style={{fontSize:9,color:"#789086",marginTop:2}}>{r.brand || "Unassigned Brand"}</div></>],
          ["Transactions","right",r=>Number(r.transactions||0).toLocaleString()],
          ["Average Sale","right",r=>fmtAmt(r.avgOrder)],
          ["Revenue","right",r=>fmtAmt(r.revenue)],
        ]
      : id === "averageSale"
        ? [
            ["Branch / Brand","left",r=><><b>{r.branch}</b><div style={{fontSize:9,color:"#789086",marginTop:2}}>{r.brand || "Unassigned Brand"}</div></>],
            ["Average Sale","right",r=>fmtAmt(r.avgOrder)],
            ["Transactions","right",r=>Number(r.transactions||0).toLocaleString()],
            ["Revenue","right",r=>fmtAmt(r.revenue)],
          ]
        : id === "activeBranches"
          ? [
              ["Branch / Brand","left",r=><><b>{r.branch}</b><div style={{fontSize:9,color:"#789086",marginTop:2}}>{r.brand || "Unassigned Brand"}</div></>],
              ["Revenue","right",r=>fmtAmt(r.revenue)],
              ["Transactions","right",r=>Number(r.transactions||0).toLocaleString()],
              ["Avg. Sale","right",r=>fmtAmt(r.avgOrder)],
              ["Margin","right",r=>r.hasCogs?`${Number(r.margin||0).toFixed(1)}%`:"No COGS"],
            ]
          : [
              ["Branch / Brand","left",r=><><b>{r.branch}</b><div style={{fontSize:9,color:"#789086",marginTop:2}}>{r.brand || "Unassigned Brand"}</div></>],
              ["Revenue","right",r=>fmtAmt(r.revenue)],
              ["Revenue Share","right",r=>totalRevenue>0?`${(Number(r.revenue||0)/totalRevenue*100).toFixed(1)}%`:"—"],
              ["Gross Profit","right",r=>r.hasCogs?fmtAmt(r.grossProfit):"No COGS"],
              ["Margin","right",r=>r.hasCogs?`${Number(r.margin||0).toFixed(1)}%`:"—"],
            ];
    const th = {padding:"10px 11px",fontSize:9.5,fontWeight:800,textTransform:"uppercase",letterSpacing:".06em",color:"#71806F",background:"#F6FAF3",borderBottom:"1px solid #DDE8DA",whiteSpace:"nowrap"};
    const td = {padding:"11px",fontSize:10.8,color:"#334155",borderBottom:"1px solid #EEF3EC"};
    return (
      <div onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}} style={{position:"fixed",inset:0,zIndex:5100,background:"rgba(18,36,27,.58)",backdropFilter:"blur(5px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{width:"min(940px,96vw)",maxHeight:"88vh",overflowY:"auto",background:"#fff",borderRadius:20,border:"1px solid #DDE8DA",boxShadow:"0 30px 80px rgba(18,36,27,.28)",fontFamily:FONT}}>
          <div style={{position:"sticky",top:0,zIndex:2,background:"#fff",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,padding:"17px 20px",borderBottom:"1px solid #E7EEE4"}}>
            <div><div style={{fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:".07em",color:"#6B7A65"}}>Operational KPI detail · {rangeLabel}</div><div style={{fontSize:18,fontWeight:850,color:"#12241B",marginTop:3}}>{detail.label} Breakdown</div><div style={{fontSize:10.5,color:"#71806F",marginTop:3}}>{filterLabel}</div></div>
            <button onClick={onClose} style={{width:32,height:32,borderRadius:9,border:"1px solid #E1E6D8",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#5C6B60"}}><X size={15}/></button>
          </div>
          <div style={{padding:20}}>
            <div style={{padding:"10px 12px",borderRadius:10,background:"#F6FAF3",border:"1px solid #DDE8DA",fontSize:10.8,color:"#5C6B60",lineHeight:1.55,marginBottom:13}}>{descriptions[id] || descriptions.revenue} Values remain scoped to the active date, brand, and branch filters.</div>
            <div className="b2b-kpi-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12,marginBottom:14}}>{summaryCards.map(([label,value,Icon,tone,note])=><B2BMetricCard key={label} label={label} value={value} icon={Icon} tone={tone} note={note}/>)}</div>
            <div style={{fontSize:11,fontWeight:850,color:"#12241B",marginBottom:8}}>Branch breakdown</div>
            <div style={{overflowX:"auto",border:"1px solid #E7EEE4",borderRadius:13}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:720}}><thead><tr>{columns.map(([label,align])=><th key={label} style={{...th,textAlign:align}}>{label}</th>)}</tr></thead><tbody>{rows.length?rows.map((row,index)=><tr key={row.branch||index} style={{background:index%2?"#FBFDF9":"#fff"}}>{columns.map(([label,align,render])=><td key={label} style={{...td,textAlign:align}}>{render(row)}</td>)}</tr>):<tr><td colSpan={columns.length} style={{padding:28,textAlign:"center",fontSize:10.8,color:"#82907F"}}>No branch evidence is available for this KPI and filter.</td></tr>}</tbody></table></div>
          </div>
        </div>
      </div>
    );
  }

  function DashboardContent({ transactions, brands: propBrands = [], user }) {
    const today = new Date();

    const [rangeMode,    setRangeMode]    = useState("preset");
    const [preset,       setPreset]       = useState("month");
    const [customFrom,   setCustomFrom]   = useState(fmt8(new Date(today.getFullYear(), today.getMonth(), 1)));
    const [customTo,     setCustomTo]     = useState(fmt8(today));
    const [appliedRange, setAppliedRange] = useState(null);
    const [archives,     setArchives]     = useState(() => { try { return JSON.parse(localStorage.getItem("dashboardArchives") || "[]"); } catch { return []; } });
    const [showArchive,  setShowArchive]  = useState(false);
    const [viewArchive,  setViewArchive]  = useState(null);
    const [archiveYear,  setArchiveYear]  = useState(String(today.getFullYear()));

    const [filterBrand,    setFilterBrand]    = useState(null);
    const [filterBranch,   setFilterBranch]   = useState(null);
    const [brandDropOpen,  setBrandDropOpen]  = useState(false);
    const [branchDropOpen, setBranchDropOpen] = useState(false);
    const [brandQ,  setBrandQ]  = useState("");
    const [branchQ, setBranchQ] = useState("");
    const brandRef  = useRef(null);
    const branchRef = useRef(null);
    const [kpiData,    setKpiData]    = useState(null);
    const [kpiLoading, setKpiLoading] = useState(false);

    const [applyingRange, setApplyingRange] = useState(false);

    const [infoModal, setInfoModal] = useState(null);
    const showInfo = (opts) => setInfoModal(opts);
    const closeInfo = () => setInfoModal(null);

    const [toast, setToast] = useState(null);

    const [hiddenKpis, setHiddenKpis] = useState({}); // { [index]: true } = hidden
    const [operationalKpiDetail, setOperationalKpiDetail] = useState(null);
    const [analysisTab, setAnalysisTab] = useState("sales");
    const [dashboardTab, setDashboardTab] = useState("overview");

    useEffect(() => {
      const fn = (e) => {
        if (brandRef.current  && !brandRef.current.contains(e.target))  setBrandDropOpen(false);
        if (branchRef.current && !branchRef.current.contains(e.target)) setBranchDropOpen(false);
      };
      document.addEventListener("mousedown", fn);
      return () => document.removeEventListener("mousedown", fn);
    }, []);

    const brandList      = propBrands.length > 0 ? propBrands : [];
    const selectedBrand  = brandList.find(b => b.id === filterBrand);
    const branchList     = selectedBrand ? (selectedBrand.branches || []).map(br => typeof br === "string" ? br : br.name) : [];
    const filteredBrands   = brandList.filter(b => !brandQ || b.name.toLowerCase().includes(brandQ.toLowerCase()));
    const filteredBranches = branchList.filter(br => !branchQ || br.toLowerCase().includes(branchQ.toLowerCase()));

    const fetchKpis = useCallback(async () => {
      setKpiLoading(true);
      try {
        const params = new URLSearchParams();
        if (rangeMode === "preset") params.set("preset", preset);
        else if (appliedRange) { params.set("from", appliedRange.from); params.set("to", appliedRange.to); }
        else params.set("preset", "month");
        if (filterBranch) params.set("branch", filterBranch);
        else if (filterBrand && selectedBrand) {
          const bn = (selectedBrand.branches || []).map(br => typeof br === "string" ? br : br.name);
          if (bn.length) params.set("branches", bn.join(","));
        }
        const res = await fetch(`${process.env.REACT_APP_API_URL}/dashboard/stats?${params}`);
        const d   = await res.json();
        if (!d.error) setKpiData(d);
      } catch (err) { console.error(err); }
      finally { setKpiLoading(false); }
    }, [rangeMode, preset, appliedRange, filterBranch, filterBrand, selectedBrand]);

    useEffect(() => { if (!viewArchive) fetchKpis(); }, [fetchKpis, viewArchive]);

    const filterLabel = filterBranch ? filterBranch : filterBrand ? (selectedBrand?.name + " – All Branches") : "All Brands & Branches";

    const getRangeLabel = () => {
      if (viewArchive) return `Archive: ${viewArchive.year}`;
      if (rangeMode === "custom" && appliedRange) return `${appliedRange.from} → ${appliedRange.to}`;
      return { day: "Today", week: "This Week", month: "This Month", year: "This Year" }[preset] || "This Month";
    };

  const chartData = useMemo(() => {
    if (viewArchive) return viewArchive.chartData;
    let txList = transactions;
    if (filterBranch) txList = transactions.filter(tx => tx.branch === filterBranch);
    else if (filterBrand && selectedBrand) {
      const bn = (selectedBrand.branches || []).map(br => typeof br === "string" ? br : br.name);
      txList = transactions.filter(tx => bn.includes(tx.branch));
    }
    if (!txList.length) return { labels: [], values: [] };
    const now = new Date();
    const isCustom = rangeMode === "custom" && appliedRange;

  const filtered = txList.filter(tx => {
    const d = new Date(tx.created_at);
    if (isCustom) {
      const f = new Date(appliedRange.from + "T00:00:00");
      const t = new Date(appliedRange.to + "T23:59:59.999");
      return d >= f && d <= t;
    }
    if (preset === "day")   return d.toDateString() === now.toDateString();
    if (preset === "week")  { const s = new Date(now); s.setDate(now.getDate() - now.getDay()); s.setHours(0,0,0,0); const e = new Date(s); e.setDate(s.getDate()+6); e.setHours(23,59,59,999); return d >= s && d <= e; }
    if (preset === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (preset === "year")  return d.getFullYear() === now.getFullYear();
    return true;
  });

  if (isCustom) {
    const from = new Date(appliedRange.from + "T00:00:00");
    const to = new Date(appliedRange.to + "T23:59:59.999");
    const nw = Math.max(1, Math.ceil((to - from) / (7*864e5)) + 1);
    const labels = Array.from({ length: nw }, (_, i) => `W${i+1}`);
    const values = Array(nw).fill(0);
    filtered.forEach(tx => { const wi = Math.min(Math.floor((new Date(tx.created_at) - from) / (7*864e5)), nw-1); values[wi] += tx.total||0; });
    return { labels, values };
  }

  const groupedMap = new Map();
    const addToGroup = (key, label, amount) => {
      const prev = groupedMap.get(key) || { label, sortKey: key, value: 0 };
      prev.value += amount;
      groupedMap.set(key, prev);
    };

    if (preset === "day") {
      filtered.forEach(tx => {
        const d = new Date(tx.created_at);
        addToGroup(d.getHours(), `${d.getHours()}:00`, Number(tx.total||0));
      });
    } else if (preset === "week") {
      filtered.forEach(tx => {
        const d = new Date(tx.created_at);
        addToGroup(d.getDay(), d.toLocaleDateString("en-US",{weekday:"short"}), Number(tx.total||0));
      });
    } else if (preset === "month") {
      filtered.forEach(tx => {
        const d = new Date(tx.created_at);
        addToGroup(d.getDate(), `D${d.getDate()}`, Number(tx.total||0));
      });
    } else if (preset === "year") {
      filtered.forEach(tx => {
        const d = new Date(tx.created_at);
        addToGroup(d.getMonth(), d.toLocaleDateString("en-US",{month:"short"}), Number(tx.total||0));
      });
    }

    const sortedGroups = Array.from(groupedMap.values()).sort((a,b) => a.sortKey - b.sortKey);
    const labels = sortedGroups.map(e => e.label);
    return { labels, values: sortedGroups.map(e => e.value) };
  }, [transactions, preset, rangeMode, appliedRange, viewArchive, filterBranch, filterBrand, selectedBrand]);

  const filteredTransactions = useMemo(() => {
    let txList = transactions;
    if (filterBranch) txList = transactions.filter(tx => tx.branch === filterBranch);
    else if (filterBrand && selectedBrand) {
      const bn = (selectedBrand.branches || []).map(br => typeof br === "string" ? br : br.name);
      txList = transactions.filter(tx => bn.includes(tx.branch));
    }

    const isCustom = rangeMode === "custom" && appliedRange;
    const now = new Date();
    return txList.filter(tx => {
      const d = new Date(tx.created_at);
      if (isCustom) {
        const from = new Date(appliedRange.from + "T00:00:00");
        const to = new Date(appliedRange.to + "T23:59:59.999");
        return d >= from && d <= to;
      }
      if (preset === "day")   return d.toDateString() === now.toDateString();
      if (preset === "week")  { const s = new Date(now); s.setDate(now.getDate() - now.getDay()); s.setHours(0,0,0,0); const e = new Date(s); e.setDate(s.getDate()+6); e.setHours(23,59,59,999); return d >= s && d <= e; }
      if (preset === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (preset === "year")  return d.getFullYear() === now.getFullYear();
      return true;
    });
  }, [transactions, filterBranch, filterBrand, selectedBrand, rangeMode, appliedRange, preset]);

    const values = viewArchive
      ? (chartData?.values || [])
      : (kpiData?.revenueSeries?.length ? kpiData.revenueSeries : chartData.values);
    const chartLabels = viewArchive
      ? (chartData?.labels || [])
      : (kpiData?.revenueSeries?.length ? kpiData.revenueLabels : chartData.labels);  
    const total     = useMemo(() => values.reduce((a, b) => a + b, 0), [values]);
    const avg       = useMemo(() => values.length ? Math.round(total / values.length) : 0, [total, values.length]);
    const peak      = useMemo(() => values.length ? Math.max(...values) : 0, [values]);
    const low       = useMemo(() => values.length ? Math.min(...values) : 0, [values]);
  const peakLabel = values.length ? chartLabels[values.indexOf(peak)] : "—";
    const pctChange = values.length > 1 && values[0] > 0 ? (((values[values.length - 1] - values[0]) / values[0]) * 100).toFixed(1) : "0.0";
    const trending  = Number(pctChange) >= 0;

    const actualRevenue = useMemo(() => filteredTransactions.reduce((sum, tx) => sum + Number(tx.total || tx.total_amount || 0), 0), [filteredTransactions]);
    const transactionCount = viewArchive
      ? Number(viewArchive?.kpis?.transactionCount ?? 0)
      : filteredTransactions.length;
    const averageTransaction = viewArchive
      ? Number(viewArchive?.kpis?.avgOrder ?? viewArchive?.kpis?.avgSales ?? 0)
      : (transactionCount ? actualRevenue / transactionCount : 0);
    const activeBranchCount = viewArchive
      ? Number(viewArchive?.kpis?.activeBranchCount ?? 0)
      : new Set(filteredTransactions.map(tx => tx.branch).filter(Boolean)).size;

    const transactionCountSeries = useMemo(() => {
      if (viewArchive || !chartLabels.length) return [];
      const counts = Object.fromEntries(chartLabels.map(label => [label, 0]));
      const now = new Date();
      const isCustom = rangeMode === "custom" && appliedRange;
      let customFromDate = null;
      if (isCustom) customFromDate = new Date(appliedRange.from + "T00:00:00");

      filteredTransactions.forEach(tx => {
        const d = new Date(tx.created_at);
        let label;
        if (isCustom) {
          const wi = Math.max(0, Math.floor((d - customFromDate) / (7 * 864e5)));
          label = `W${wi + 1}`;
        } else if (preset === "day") label = `${d.getHours()}:00`;
        else if (preset === "week") label = d.toLocaleDateString("en-US", { weekday: "short" });
        else if (preset === "month") label = `D${d.getDate()}`;
        else if (preset === "year") label = d.toLocaleDateString("en-US", { month: "short" });
        if (label in counts) counts[label] += 1;
      });
      return chartLabels.map(label => counts[label] || 0);
    }, [filteredTransactions, chartLabels, preset, rangeMode, appliedRange, viewArchive]);

    const branchPerformance = useMemo(() => {
      if (viewArchive) return [];
      const grouped = {};
      filteredTransactions.forEach(tx => {
        const branch = tx.branch || "Unassigned";
        const brand = tx.brand || tx.brand_name || tx.franchise_brand || "Unassigned Brand";
        const key = `${brand}::${branch}`;
        grouped[key] = (grouped[key] || 0) + Number(tx.total || tx.total_amount || 0);
      });
      return Object.entries(grouped).map(([key, value]) => {
        const [brand, branch] = key.split("::");
        return { label:`${branch} · ${brand}`, value, branch, brand };
      }).sort((a,b) => b.value - a.value);
    }, [filteredTransactions, viewArchive]);

    const branchProfitability = useMemo(() => {
      if (viewArchive) return [];

      const grouped = {};

      filteredTransactions.forEach((tx) => {
        const branch = String(tx?.branch || "Unassigned").trim() || "Unassigned";
        const brand = String(tx?.brand || tx?.brand_name || tx?.franchise_brand || "Unassigned Brand").trim() || "Unassigned Brand";
        const groupKey = `${brand}::${branch}`;
        const revenue = Number(tx?.total ?? tx?.total_amount ?? tx?.grand_total ?? 0) || 0;

        let cogs = Number(
          tx?.cogs ??
          tx?.total_cogs ??
          tx?.cost_of_goods ??
          tx?.cost_of_goods_sold ??
          0
        );

        if (!Number.isFinite(cogs)) cogs = 0;

        if (cogs === 0) {
          let items = tx?.items;
          if (typeof items === "string") {
            try { items = JSON.parse(items); } catch { items = []; }
          }

          if (Array.isArray(items)) {
            const itemCogs = items.reduce((sum, item) => {
              const qty = Number(item?.qty ?? item?.quantity ?? 0) || 0;
              const unitCost = Number(
                item?.cost ??
                item?.unit_cost ??
                item?.unitCost ??
                item?.purchase_cost ??
                0
              ) || 0;
              const lineCogs = Number(
                item?.cogs ??
                item?.total_cost ??
                item?.cost_total ??
                0
              ) || 0;

              return sum + (lineCogs > 0 ? lineCogs : unitCost * qty);
            }, 0);

            if (itemCogs > 0) cogs = itemCogs;
          }
        }

        if (!grouped[groupKey]) {
          grouped[groupKey] = {
            branch,
            brand,
            revenue: 0,
            cogs: 0,
            transactions: 0,
            hasCogs: false,
          };
        }

        grouped[groupKey].revenue += revenue;
        grouped[groupKey].cogs += cogs;
        grouped[groupKey].transactions += 1;

        if (
          cogs > 0 ||
          tx?.cogs != null ||
          tx?.total_cogs != null ||
          tx?.cost_of_goods != null ||
          tx?.cost_of_goods_sold != null
        ) {
          grouped[groupKey].hasCogs = true;
        }
      });

      return Object.values(grouped)
        .map((row) => {
          const grossProfit = row.revenue - row.cogs;
          const margin = row.revenue > 0 ? (grossProfit / row.revenue) * 100 : 0;
          const avgOrder = row.transactions > 0 ? row.revenue / row.transactions : 0;

          return { ...row, grossProfit, margin, avgOrder };
        })
        .sort((a, b) =>
          (b.grossProfit - a.grossProfit) ||
          (b.revenue - a.revenue)
        );
    }, [filteredTransactions, viewArchive]);

    const brandPerformance = useMemo(() => {
      if (viewArchive) return [];
      const grouped = {};
      filteredTransactions.forEach(tx => {
        const brand = tx.brand || "Unassigned";
        grouped[brand] = (grouped[brand] || 0) + Number(tx.total || tx.total_amount || 0);
      });
      return Object.entries(grouped).map(([label, value]) => ({ label, value })).sort((a,b) => b.value - a.value);
    }, [filteredTransactions, viewArchive]);
    

  const getTransactionsForArchiveYear = (year) => {
    let txList = transactions;
    if (filterBranch) txList = transactions.filter(tx => tx.branch === filterBranch);
    else if (filterBrand && selectedBrand) {
      const branchNames = (selectedBrand.branches || []).map(br => typeof br === "string" ? br : br.name);
      txList = transactions.filter(tx => branchNames.includes(tx.branch));
    }
    return txList.filter(tx => {
      const d = new Date(tx.created_at);
      return !Number.isNaN(d.getTime()) && d.getFullYear() === year;
    });
  };

  const buildArchiveSnapshot = (year, yearTransactions) => {
    const labels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthlyValues = Array(12).fill(0);

    yearTransactions.forEach(tx => {
      const d = new Date(tx.created_at);
      if (Number.isNaN(d.getTime())) return;
      monthlyValues[d.getMonth()] += Number(tx.total || tx.total_amount || 0);
    });

    const revenue = monthlyValues.reduce((sum, value) => sum + Number(value || 0), 0);
    const transactionCount = yearTransactions.length;
    const averageOrder = transactionCount ? revenue / transactionCount : 0;
    const activeBranches = new Set(yearTransactions.map(tx => tx.branch).filter(Boolean)).size;
    const peakSales = monthlyValues.length ? Math.max(...monthlyValues) : 0;

    return {
      year,
      label: `Full Year ${year}`,
      savedAt: new Date().toLocaleString("en-PH"),
      filterLabel,
      chartData: { labels, values: monthlyValues },
      kpis: {
        totalSales: revenue,
        salesRevenue: revenue,
        avgSales: averageOrder,
        avgOrder: averageOrder,
        peakSales,
        transactionCount,
        activeBranchCount: activeBranches,
      },
    };
  };

  const saveArchive = (snapshot) => {
    const upd = [...archives, snapshot].sort((a, b) => b.year - a.year);
    setArchives(upd);
    localStorage.setItem("dashboardArchives", JSON.stringify(upd));
    setArchiveYear(String(snapshot.year));
    showInfo({
      type: "success",
      title: "Archive Saved",
      message: `${snapshot.label} was archived successfully with ${snapshot.kpis.transactionCount.toLocaleString()} transaction${snapshot.kpis.transactionCount === 1 ? "" : "s"}.`,
    });
  };

  const requestArchiveYear = () => {
    const year = parseInt(archiveYear, 10);
    if (Number.isNaN(year) || year < 2000 || year > 2100) {
      showInfo({ type: "warning", title: "Invalid Year", message: "Enter a valid year from 2000 to 2100." });
      return;
    }
    if (archives.some(a => Number(a.year) === year)) {
      showInfo({ type: "warning", title: "Already Archived", message: `Year ${year} is already archived.` });
      return;
    }

    const yearTransactions = getTransactionsForArchiveYear(year);
    if (yearTransactions.length === 0) {
      showInfo({
        type: "info",
        title: "No Data Found",
        message: `No sales data was found for ${year} under ${filterLabel}. Nothing was archived.`,
      });
      return;
    }

    const snapshot = buildArchiveSnapshot(year, yearTransactions);
    showInfo({
      type: "confirm",
      confirmTone: "success",
      title: `Archive ${year}?`,
      message: `Data found: ${snapshot.kpis.transactionCount.toLocaleString()} transaction${snapshot.kpis.transactionCount === 1 ? "" : "s"}, ${fmtAmt(snapshot.kpis.totalSales)} revenue, and ${snapshot.kpis.activeBranchCount.toLocaleString()} active branch${snapshot.kpis.activeBranchCount === 1 ? "" : "es"}. Confirm to save this yearly snapshot.`,
      confirmLabel: "Confirm Archive",
      cancelLabel: "Cancel",
      onConfirm: () => saveArchive(snapshot),
    });
  };

  const deleteArchive = (year) => {
    showInfo({
      type: "confirm",
      title: "Delete Archive?",
      message: `Are you sure you want to delete the archive for ${year}? This cannot be undone.`,
      confirmLabel: "Delete",
      onConfirm: () => {
        const upd = archives.filter(a => a.year !== year);
        setArchives(upd); localStorage.setItem("dashboardArchives", JSON.stringify(upd));
        if (viewArchive?.year === year) setViewArchive(null);
        closeInfo();
      },
    });
  };

  const applyCustomRange = async () => {
    if (!customFrom || !customTo) { showInfo({ type: "warning", title: "Missing Dates", message: "Please select both a start and end date." }); return; }
    if (customFrom > customTo) { showInfo({ type: "warning", title: "Invalid Range", message: "\"From\" cannot be after \"To\"." }); return; }

    let txList = transactions;
    if (filterBranch) txList = transactions.filter(tx => tx.branch === filterBranch);
    else if (filterBrand && selectedBrand) {
      const bn = (selectedBrand.branches || []).map(br => typeof br === "string" ? br : br.name);
      txList = transactions.filter(tx => bn.includes(tx.branch));
    }

    const from = new Date(customFrom + "T00:00:00");
    const to = new Date(customTo + "T23:59:59.999");

    const hasData = txList.some(tx => {
      const d = new Date(tx.created_at);
      return d >= from && d <= to;
    });

    if (!hasData) {
      showInfo({
        type: "error",
        title: "No Data Found",
        message: `No data found for the selected date range (${customFrom} → ${customTo})${filterLabel !== "All Brands & Branches" ? ` — ${filterLabel}` : ""}. Please choose a different date range.`,
      });
      return;
    }

    setApplyingRange(true);
    try {
      setRangeMode("custom");
      setAppliedRange({ from: customFrom, to: customTo });
      setViewArchive(null);

      // Fetch KPIs for this exact range right now, so the button reflects real completion
      setKpiLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("from", customFrom);
        params.set("to", customTo);
        if (filterBranch) params.set("branch", filterBranch);
        else if (filterBrand && selectedBrand) {
          const bn = (selectedBrand.branches || []).map(br => typeof br === "string" ? br : br.name);
          if (bn.length) params.set("branches", bn.join(","));
        }
        const res = await fetch(`${process.env.REACT_APP_API_URL}/dashboard/stats?${params}`);
        const d = await res.json();
        if (!d.error) setKpiData(d);
      } catch (err) {
        console.error(err);
      } finally {
        setKpiLoading(false);
      }

      setToast({ title: "Date Range Applied", message: `Showing data from ${customFrom} to ${customTo}.` });
    } finally {
      setApplyingRange(false);
    }
  };

    const filterInputSt = { height: 36, padding: "0 11px", borderRadius: 9, border: "1px solid #b2dfdb", background: "#f0fdf5", fontSize: 13, color: "#0d2b1e", outline: "none", fontFamily: FONT, boxSizing: "border-box", width: "100%" };
    const dropSt = { position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 400, background: "#fff", border: "1px solid #b2dfdb", borderRadius: 11, boxShadow: "0 8px 28px rgba(0,0,0,0.10)", maxHeight: 220, overflowY: "auto" };
    const optSt  = (a) => ({ padding: "9px 14px", cursor: "pointer", fontSize: 13, color: a ? "#00695c" : "#0d2b1e", fontWeight: a ? 700 : 500, background: a ? "#e0f2f1" : "transparent", display: "flex", alignItems: "center", gap: 8, fontFamily: FONT });
    const tabSt  = (a) => ({ padding: "6px 13px", borderRadius: 9, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT, transition: "all .15s", background: a ? "linear-gradient(135deg,#00c853,#00897b)" : "transparent", color: a ? "#fff" : "#5a7a65", boxShadow: a ? "0 2px 8px rgba(0,180,90,.35)" : "none" });

    return (
      <div style={{ fontFamily: FONT }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
          *, *::before, *::after { box-sizing: border-box; }
          @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
          @media(max-width:900px){.qa-dashboard-tabs{grid-template-columns:1fr!important}.qa-dashboard-tabs button{min-height:58px!important}}
        `}</style>

        {/* Archive banner */}
        {viewArchive && (
          <div style={{ background: "linear-gradient(135deg,#0d2b1e,#1a4a2e)", color: "#fff", borderRadius: 14, padding: "12px 20px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14, fontFamily: FONT }}>
              <Archive size={16} /> Viewing Archive: {viewArchive.year}
              <span style={{ opacity: 0.6, fontSize: 12, fontWeight: 400 }}>— saved {viewArchive.savedAt}</span>
            </span>
            <button onClick={() => setViewArchive(null)} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 8, padding: "5px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: FONT }}>
              <X size={12} /> Exit Archive View
            </button>
          </div>
        )}

        <div className="qa-dashboard-tabs" style={{ background:"#fff", border:"1px solid #DCE9DB", borderRadius:16, padding:7, marginBottom:16, display:"grid", gridTemplateColumns:"repeat(3,minmax(0,1fr))", gap:7, boxShadow:"0 2px 14px rgba(50,109,32,.06)" }}>
          {[
            { id:"overview", number:"01", label:"Overview", question:"What needs attention?", icon:Home },
            { id:"sales_ai", number:"02", label:"Sales Trend Analysis", question:"How are actual sales changing?", icon:LineChart },
            { id:"ghost", number:"03", label:"Ghost Stock / Revenue Leakage", question:"Where are losses coming from?", icon:ShieldCheck },
          ].map(tab=>{
            const active = dashboardTab === tab.id;
            const Icon = tab.icon;
            return <button key={tab.id} onClick={()=>{ setDashboardTab(tab.id); if(tab.id!=="sales_ai") setViewArchive(null); }} style={{ display:"flex", alignItems:"center", gap:10, minHeight:67, padding:"11px 13px", borderRadius:12, border:`1px solid ${active?"#A9C982":"transparent"}`, background:active?"linear-gradient(135deg,#F2F7EB,#EAF3DF)":"transparent", color:active?"#2c5c16":"#64748b", cursor:"pointer", textAlign:"left", fontFamily:FONT, boxShadow:active?"inset 0 0 0 1px rgba(59,121,30,.05)":"none" }}>
              <span style={{ width:34, height:34, borderRadius:10, flexShrink:0, display:"inline-flex", alignItems:"center", justifyContent:"center", background:active?"#3b791e":"#F1F5F2", color:active?"#fff":"#71806F" }}><Icon size={16}/></span>
              <span style={{ minWidth:0 }}><span style={{ display:"block", fontSize:9, fontWeight:900, letterSpacing:".08em", opacity:.72, marginBottom:2 }}>{tab.number}</span><span style={{ display:"block", fontSize:11.4, fontWeight:850, lineHeight:1.25 }}>{tab.label}</span><span style={{ display:"block", fontSize:9.4, color:active?"#5C6B60":"#94a3b8", fontWeight:650, marginTop:3, lineHeight:1.25 }}>{tab.question}</span></span>
            </button>;
          })}
        </div>

        {/* Overview and Ghost Stock share the B2B evidence source but render different decisions. */}
        {!viewArchive && (
          <div style={{display:dashboardTab==="sales_ai"?"none":"block"}}>
            <B2BRevenueAssuranceDashboard
              transactions={transactions}
              brands={propBrands}
              user={user}
              view={dashboardTab==="ghost"?"ghost":"overview"}
              onOpenSalesAi={()=>setDashboardTab("sales_ai")}
            />
          </div>
        )}

        {!viewArchive && dashboardTab === "ghost" && (
          <SalesVsStockSection
            preset={preset}
            appliedRange={appliedRange}
            rangeMode={rangeMode}
            filterBranch={filterBranch}
            filterBrand={filterBrand}
            selectedBrand={selectedBrand}
            total={total}
            transactions={filteredTransactions}
          />
        )}

        {!viewArchive && dashboardTab === "ghost" && (
          <div style={{ marginTop:18 }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"17px 18px", margin:"0 0 14px", borderRadius:14, background:"linear-gradient(135deg,#eff6ff,#f8fbff)", border:"1px solid #bfdbfe" }}>
              <span style={{ width:34, height:34, borderRadius:10, display:"inline-flex", alignItems:"center", justifyContent:"center", background:"#2563eb", color:"#fff", flexShrink:0 }}><Brain size={17}/></span>
              <div><div style={{ fontSize:14, fontWeight:850, color:"#1e3a5f" }}>AI Prescriptive Guidance</div><div style={{ fontSize:10.8, color:"#52627a", lineHeight:1.55, marginTop:4 }}>Use the detected ghost-stock and revenue-leakage evidence to generate prioritized corrective actions for the selected branches.</div></div>
            </div>
            <PrescriptiveSection transactions={filteredTransactions} filterLabel={filterLabel} preset={preset} total={total} values={values} labels={chartLabels} kpiData={kpiData} showStockAnomalies={false} />
          </div>
        )}

        <div style={{ display:dashboardTab==="sales_ai"?"flex":"none", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, margin:"4px 0 14px", color:"#5C6B60" }}>
          <div style={{ height:1, background:"#E1E6D8", flex:1 }} />
          <span style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:".08em", whiteSpace:"nowrap" }}>Sales &amp; AI Decision Workspace</span>
          <div style={{ height:1, background:"#E1E6D8", flex:1 }} />
        </div>

        {/* ── KPI Cards: visible across Sales Trend, Prescriptive, and Sales vs Stock ── */}
        <div style={{ order:2, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 18, animation: "fadeUp .35s ease" }}>
          {[
            { id:"revenue", label: "Revenue", value: viewArchive ? (viewArchive?.kpis?.totalSales ?? total) : (kpiData?.salesRevenue ?? actualRevenue), icon: TrendingUp, format: "money", note: "Actual sales in selected period" },
            { id:"transactions", label: "Transactions", value: transactionCount, icon: ShoppingCart, format: "count", note: "Completed sales records" },
            { id:"averageSale", label: "Average Sale", value: viewArchive ? averageTransaction : (kpiData?.avgOrder ?? averageTransaction), icon: BarChart2, format: "money", note: "Revenue per transaction" },
            { id:"activeBranches", label: "Active Branches", value: activeBranchCount, icon: Store, format: "count", note: "Branches with recorded sales" },
          ].map((k, i) => {
            const isHidden = !!hiddenKpis[i];
            return (
              <div key={k.id}
                role="button"
                tabIndex={0}
                aria-label={`Open ${k.label} breakdown`}
                onClick={()=>setOperationalKpiDetail({id:k.id,label:k.label})}
                onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setOperationalKpiDetail({id:k.id,label:k.label});}}}
                style={{ background: "#fff", border: "1px solid rgba(0,168,76,0.12)", borderRadius: 18, padding: "18px 20px", boxShadow: "0 2px 14px rgba(0,140,60,0.07)", position: "relative", overflow: "hidden", transition: "transform .2s, box-shadow .2s", cursor:"pointer", outline:"none" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,140,60,0.13)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 14px rgba(0,140,60,0.07)"; }}>
                  <button
                    onClick={e => {e.stopPropagation();setHiddenKpis(prev => ({ ...prev, [i]: !prev[i] }));}}
                    onKeyDown={e=>e.stopPropagation()}
                    style={{
                      position: "absolute", top: 14, right: 14,
                      background: "none", border: "none", cursor: "pointer",
                      color: "#1565c0", opacity: 0.6, padding: 2,
                      display: "flex", alignItems: "center",
                    }}
                    title={isHidden ? "Show value" : "Hide value"}
                  >
                    {!isHidden
                      ? <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      : <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    }
                  </button>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#5a7a65", marginBottom: 5, display: "flex", alignItems: "center", gap: 5, fontFamily: FONT }}>
                      <k.icon size={12} color="#00897b" /> {k.label}
                    </div>
                    {kpiLoading && k.value == null
                      ? <div style={{ fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 9, background: "#f0fdf5", border: "1.5px dashed #a7f3d0", color: "#5a7a65", display: "inline-block", fontFamily: FONT }}>Loading…</div>
                      : k.value != null
                        ? <div style={{ fontSize: 22, fontWeight: 800, color: "#0d2b1e", letterSpacing: "-0.5px", fontFamily: FONT }}>
                            {!isHidden ? (k.format === "money" ? fmtAmt(k.value) : Number(k.value).toLocaleString()) : (k.format === "money" ? "₱••••••••" : "••••")}
                          </div>
                        : <div style={{ fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 9, background: "#f0fdf5", border: "1.5px dashed #a7f3d0", color: "#5a7a65", display: "inline-block", fontFamily: FONT }}>— Pending</div>
                    }
                  </div>
                  <SparkBar values={values.slice(-7)} color="#00c853" height={28} />
                </div>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: "#94a3b8", fontFamily: FONT }}>{k.note}</div>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginTop:4 }}><div style={{ fontSize: 9.5, fontWeight: 600, color: "#A7B0A5", fontFamily: FONT }}>{getRangeLabel()} · {filterLabel}</div><span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:9.5,fontWeight:800,color:"#3b791e",whiteSpace:"nowrap"}}>Breakdown <ChevronRight size={11}/></span></div>
              </div>
            );
          })}
        </div>

        <OperationalKpiBreakdownModal
          detail={operationalKpiDetail}
          onClose={()=>setOperationalKpiDetail(null)}
          overview={{
            revenue:viewArchive ? (viewArchive?.kpis?.totalSales ?? total) : (kpiData?.salesRevenue ?? actualRevenue),
            transactions:transactionCount,
            averageSale:viewArchive ? averageTransaction : (kpiData?.avgOrder ?? averageTransaction),
            activeBranches:activeBranchCount,
          }}
          branchRows={branchProfitability}
          rangeLabel={getRangeLabel()}
          filterLabel={filterLabel}
        />

        {/* ── Filter + Date toolbar ── */}
        <div style={{ order:1, background: "#fff", border: "1px solid rgba(0,168,76,0.12)", borderRadius: 14, padding: "12px 16px", marginBottom: 14, boxShadow: "0 1px 8px rgba(0,140,60,0.05)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Brand dropdown */}
          <div ref={brandRef} style={{ position: "relative", minWidth: 170 }}>
            <div onClick={() => { setBrandDropOpen(v => !v); setBrandQ(""); }}
              style={{ ...filterInputSt, display: "flex", alignItems: "center", gap: 7, cursor: "pointer", paddingRight: 26, userSelect: "none", color: filterBrand ? "#0d2b1e" : "#5a7a65" }}>
              <Globe size={12} color="#00897b" />
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12 }}>{selectedBrand ? selectedBrand.name : "All Brands"}</span>
              <ChevronDown size={10} style={{ position: "absolute", right: 8, color: "#5a7a65" }} />
            </div>
            {brandDropOpen && (
              <div style={dropSt}>
                <div style={{ padding: "6px 8px", borderBottom: "1px solid #b2dfdb", position: "sticky", top: 0, background: "#fff" }}>
                  <div style={{ position: "relative" }}>
                    <Search size={10} style={{ position: "absolute", left: 7, top: "50%", transform: "translateY(-50%)", color: "#5a7a65" }} />
                    <input autoFocus type="text" value={brandQ} onChange={e => setBrandQ(e.target.value)} placeholder="Search…" onClick={e => e.stopPropagation()} style={{ ...filterInputSt, height: 28, fontSize: 11, paddingLeft: 24 }} />
                  </div>
                </div>
                <div style={optSt(!filterBrand)} onMouseDown={() => { setFilterBrand(null); setFilterBranch(null); setBrandDropOpen(false); }}>All Brands</div>
                {filteredBrands.map(b => (
                  <div key={b.id} style={optSt(filterBrand === b.id)} onMouseDown={() => { setFilterBrand(b.id); setFilterBranch(null); setBrandDropOpen(false); setBrandQ(""); }}>
                    <Store size={12} color="#00897b" /> {b.name}
                    <span style={{ marginLeft: "auto", fontSize: 10, color: "#5a7a65" }}>{(b.branches || []).length} branches</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Branch dropdown */}
          <div ref={branchRef} style={{ position: "relative", minWidth: 180, opacity: filterBrand ? 1 : 0.45 }}>
            <div onClick={() => { if (filterBrand) { setBranchDropOpen(v => !v); setBranchQ(""); } }}
              style={{ ...filterInputSt, display: "flex", alignItems: "center", gap: 7, cursor: filterBrand ? "pointer" : "not-allowed", paddingRight: 26, userSelect: "none", color: filterBranch ? "#0d2b1e" : "#5a7a65" }}>
              <Store size={12} color={filterBrand ? "#00897b" : "#5a7a65"} />
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12 }}>{filterBranch || (filterBrand ? "All Branches" : "Select brand first")}</span>
              {filterBrand && <ChevronDown size={10} style={{ position: "absolute", right: 8, color: "#5a7a65" }} />}
            </div>
            {branchDropOpen && filterBrand && (
              <div style={dropSt}>
                <div style={{ padding: "6px 8px", borderBottom: "1px solid #b2dfdb", position: "sticky", top: 0, background: "#fff" }}>
                  <div style={{ position: "relative" }}>
                    <Search size={10} style={{ position: "absolute", left: 7, top: "50%", transform: "translateY(-50%)", color: "#5a7a65" }} />
                    <input autoFocus type="text" value={branchQ} onChange={e => setBranchQ(e.target.value)} placeholder="Search…" onClick={e => e.stopPropagation()} style={{ ...filterInputSt, height: 28, fontSize: 11, paddingLeft: 24 }} />
                  </div>
                </div>
                <div style={optSt(!filterBranch)} onMouseDown={() => { setFilterBranch(null); setBranchDropOpen(false); }}>All Branches</div>
                {filteredBranches.map(br => (
                  <div key={br} style={optSt(filterBranch === br)} onMouseDown={() => { setFilterBranch(br); setBranchDropOpen(false); setBranchQ(""); }}>
                    <Store size={11} color="#00897b" /> {br}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active chips */}
          {(filterBrand || filterBranch) && (
            <>
              {filterBrand && !filterBranch && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#e0f2f1", color: "#00695c", border: "1px solid #b2dfdb", cursor: "pointer", fontFamily: FONT }}
                  onClick={() => { setFilterBrand(null); setFilterBranch(null); }}>
                  <Store size={10} /> {selectedBrand?.name} <X size={9} />
                </span>
              )}
              {filterBranch && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#e0f2f1", color: "#00695c", border: "1px solid #b2dfdb", cursor: "pointer", fontFamily: FONT }}
                  onClick={() => setFilterBranch(null)}>
                  <Store size={10} /> {filterBranch} <X size={9} />
                </span>
              )}
              <button onClick={() => { setFilterBrand(null); setFilterBranch(null); }} style={{ padding: "3px 9px", borderRadius: 20, border: "1px solid #d1d5db", background: "#f9fafb", color: "#6b7280", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Clear</button>
            </>
          )}

          <div style={{ width: 1, height: 24, background: "#e0ede2", margin: "0 4px" }} />

          {/* Preset tabs */}
          <div style={{ display: "flex", gap: 3, background: "#f0faf4", borderRadius: 10, padding: 3 }}>
            {["day","week","month","year"].map(p => (
              <button key={p} style={tabSt(rangeMode === "preset" && preset === p)} onClick={() => { setRangeMode("preset"); setPreset(p); setViewArchive(null); }}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          {/* Custom range */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Calendar size={12} color="#5a7a65" />
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} max={customTo} style={{ padding: "6px 9px", borderRadius: 8, border: "1.5px solid #b2dfdb", background: "#f0fdf5", fontSize: 11, fontFamily: FONT, color: "#0d2b1e", outline: "none" }} />
            <span style={{ color: "#5a7a65", fontSize: 11, fontFamily: FONT }}>to</span>
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} min={customFrom} max={fmt8(today)} style={{ padding: "6px 9px", borderRadius: 8, border: "1.5px solid #b2dfdb", background: "#f0fdf5", fontSize: 11, fontFamily: FONT, color: "#0d2b1e", outline: "none" }} />
          <button
            onClick={applyCustomRange}
            disabled={applyingRange}
            style={{
              padding: "6px 13px", borderRadius: 8, border: "none",
              background: "linear-gradient(135deg,#00c853,#00897b)",
              color: "#fff", fontSize: 11, fontWeight: 700,
              cursor: applyingRange ? "not-allowed" : "pointer",
              fontFamily: FONT, opacity: applyingRange ? 0.7 : 1,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {applyingRange ? (
              <>
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}>
                  <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
                  <path d="M21 12a9 9 0 0 0-9-9" />
                </svg>
                Applying…
              </>
            ) : "Apply"}
          </button>
          </div>

          {/* Archive */}
          <button onClick={() => setShowArchive(v => !v)} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, border: "1.5px solid #b2dfdb", background: showArchive ? "#e0f2f1" : "#fff", color: "#00695c", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
            <Archive size={13} /> Archives
            {archives.length > 0 && <span style={{ background: "#00897b", color: "#fff", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 800 }}>{archives.length}</span>}
          </button>
        </div>

        {/* Archive panel */}
        {showArchive && (
          <div style={{ order:3, background: "#fff", border: "1px solid rgba(0,168,76,0.15)", borderRadius: 16, padding: "18px 20px", boxShadow: "0 2px 16px rgba(0,140,60,0.08)", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 14, color: "#0d2b1e", display: "flex", alignItems: "center", gap: 7 }}>
                <Archive size={15} color="#00897b" /> Yearly Archives
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="number"
                  value={archiveYear}
                  onChange={e => setArchiveYear(e.target.value)}
                  min="2000"
                  max="2100"
                  placeholder="Year"
                  style={{ padding: "6px 9px", borderRadius: 8, border: "1.5px solid #b2dfdb", background: "#f0fdf5", fontSize: 12, fontFamily: FONT, color: "#0d2b1e", outline: "none", width: 86 }}
                />
                <button onClick={requestArchiveYear} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#2E7D32,#00897b)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
                  <Plus size={12} /> Archive Year
                </button>
              </div>
            </div>
            {archives.length === 0
              ? <div style={{ padding: "20px 0", textAlign: "center", color: "#94a3b8", fontSize: 13, fontFamily: FONT }}>No archives yet.</div>
              : archives.map(a => (
                <div key={a.year} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 13px", borderRadius: 9, border: "1px solid #e0f2f1", marginBottom: 7, background: "#f8fffe" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: "#0d2b1e", fontFamily: FONT }}>{a.label}</div>
                    <div style={{ fontSize: 10.5, color: "#5a7a65", marginTop: 2, fontFamily: FONT }}>Saved: {a.savedAt} · Total: {fmtAmt(a.kpis.totalSales)}</div>
                  </div>
                  <div style={{ display: "flex", gap: 7 }}>
                    <button onClick={() => { setViewArchive(viewArchive?.year === a.year ? null : a); setShowArchive(false); }} style={{ padding: "4px 11px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT, border: `1px solid ${viewArchive?.year === a.year ? "#00897b" : "#b2dfdb"}`, background: viewArchive?.year === a.year ? "#e0f2f1" : "#f8fffe", color: "#00695c" }}>
                      {viewArchive?.year === a.year ? "Viewing" : "View"}
                    </button>
                    <button onClick={() => deleteArchive(a.year)} style={{ padding: "4px 11px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT, border: "1px solid #fecaca", background: "#fff", color: "#ef4444" }}>Delete</button>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* ── Analysis workspace tabs ── */}
        <div style={{ display:"none" }}>
          {[
            { id:"sales", label:"Sales Trend", icon:TrendingUp },
            { id:"prescriptive", label:"Prescriptive Analysis", icon:Brain },
            { id:"stock", label:"Sales vs Stock", icon:Package },
          ].map(t => <button key={t.id} onClick={()=>setAnalysisTab(t.id)} style={{ position:"relative", minWidth:170, padding:"17px 16px 15px", border:"none", background:"transparent", color:analysisTab===t.id?"#139a43":"#94a3b8", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:FONT, display:"flex", alignItems:"center", justifyContent:"center", gap:7, whiteSpace:"nowrap" }}><t.icon size={14}/>{t.label}{analysisTab===t.id&&<span style={{position:"absolute",left:10,right:10,bottom:0,height:2.5,borderRadius:"4px 4px 0 0",background:"#22a447"}}/>}</button>)}
        </div>

        {false && analysisTab === "sales" && <>
          <div style={{ display:"grid", gridTemplateColumns:"minmax(0,1.65fr) minmax(330px,.85fr)", gap:16, marginBottom:16 }}>
            <div style={{ background:"#fff", border:"1px solid #E1E6D8", borderRadius:18, padding:"18px 20px", boxShadow:"0 2px 14px rgba(50,109,32,.06)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:12 }}><div><div style={{ fontSize:15, fontWeight:800, color:"#12241B" }}>Revenue Trend</div><div style={{ fontSize:11, color:"#6B7A65", marginTop:3 }}>Actual revenue movement · {getRangeLabel()}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:10,color:"#7A887B",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em"}}>Period revenue</div><div style={{fontSize:17,fontWeight:800,color:"#3b791e",marginTop:2}}>{fmtAmt(viewArchive ? (viewArchive?.kpis?.totalSales ?? total) : actualRevenue)}</div></div></div>
              <DashboardLineGraph labels={chartLabels} values={values} />
            </div>
            <div style={{ background:"#fff", border:"1px solid #E1E6D8", borderRadius:18, padding:"18px 20px", boxShadow:"0 2px 14px rgba(50,109,32,.06)" }}><div style={{fontSize:15,fontWeight:800,color:"#12241B"}}>Branch Performance</div><div style={{fontSize:11,color:"#6B7A65",marginTop:3,marginBottom:16}}>Ranked by actual revenue</div><DashboardRankBars data={branchPerformance}/></div>
          </div>
          <div style={{
            background:"#fff",
            border:"1px solid #E1E6D8",
            borderRadius:18,
            padding:"18px 20px",
            marginBottom:18,
            boxShadow:"0 2px 14px rgba(50,109,32,.06)"
          }}>
            <div style={{
              display:"flex",
              justifyContent:"space-between",
              alignItems:"flex-start",
              gap:12,
              marginBottom:16,
              flexWrap:"wrap"
            }}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <div style={{fontSize:15,fontWeight:800,color:"#12241B"}}>
                    Branch Profitability
                  </div>
                  {!viewArchive && (
                    <span style={{
                      fontSize:9.5,fontWeight:800,padding:"3px 8px",
                      borderRadius:20,background:"#ecfdf5",color:"#15803d",
                      border:"1px solid #bbf7d0",letterSpacing:".04em"
                    }}>
                      API DATA
                    </span>
                  )}
                </div>
                <div style={{fontSize:11,color:"#6B7A65",marginTop:4}}>
                  Revenue, gross profit, margin and transaction efficiency by branch
                </div>
              </div>

              {!viewArchive && (
                <div style={{textAlign:"right"}}>
                  <div style={{
                    fontSize:9.5,color:"#7A887B",fontWeight:700,
                    textTransform:"uppercase",letterSpacing:".06em"
                  }}>
                    Branches analyzed
                  </div>
                  <div style={{
                    fontSize:17,fontWeight:800,color:"#3b791e",marginTop:2
                  }}>
                    {branchProfitability.length.toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {branchProfitability.length > 0 ? (
              <div style={{
                overflowX:"auto",
                border:"1px solid #E7EEE4",
                borderRadius:13
              }}>
                <table style={{
                  width:"100%",
                  borderCollapse:"collapse",
                  minWidth:820,
                  fontFamily:FONT
                }}>
                  <thead>
                    <tr style={{background:"#F6FAF3"}}>
                      {[
                        { label:"Branch / Brand", align:"left" },
                        { label:"Revenue", align:"right" },
                        { label:"Gross Profit", align:"right" },
                        { label:"Margin", align:"center" },
                        { label:"Transactions", align:"center" },
                        { label:"Avg. Order", align:"right" },
                      ].map((h) => (
                        <th key={h.label} style={{
                          padding:"11px 13px",
                          textAlign:h.align,
                          fontSize:9.5,
                          color:"#71806F",
                          fontWeight:800,
                          textTransform:"uppercase",
                          letterSpacing:".065em",
                          borderBottom:"1px solid #DDE8DA",
                          whiteSpace:"nowrap"
                        }}>
                          {h.label}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {branchProfitability.map((row, index) => {
                      const hasProfitData = row.hasCogs;
                      const marginColor = !hasProfitData
                        ? "#94a3b8"
                        : row.margin >= 40
                          ? "#15803d"
                          : row.margin >= 25
                            ? "#3b791e"
                            : row.margin >= 15
                              ? "#d97706"
                              : "#dc2626";

                      const marginBg = !hasProfitData
                        ? "#f8fafc"
                        : row.margin >= 40
                          ? "#ecfdf5"
                          : row.margin >= 25
                            ? "#f0f5e8"
                            : row.margin >= 15
                              ? "#fffbeb"
                              : "#fef2f2";

                      const borderBottom = index === branchProfitability.length - 1
                        ? "none"
                        : "1px solid #EEF3EC";

                      return (
                        <tr key={row.branch} style={{
                          background:index % 2 === 0 ? "#fff" : "#FBFDF9"
                        }}>
                          <td style={{padding:"12px 13px",borderBottom}}>
                            <div style={{display:"flex",alignItems:"center",gap:9}}>
                              <span style={{
                                width:24,height:24,borderRadius:8,
                                background:"#F0F5E8",color:"#3b791e",
                                display:"inline-flex",alignItems:"center",
                                justifyContent:"center",fontSize:10,
                                fontWeight:800,flexShrink:0
                              }}>
                                {index + 1}
                              </span>
                              <span style={{minWidth:0}}>
                                <span style={{display:"block",fontSize:11.5,fontWeight:800,color:"#12241B",whiteSpace:"nowrap"}}>{row.branch}</span>
                                <span style={{display:"block",fontSize:9.4,fontWeight:650,color:"#789086",marginTop:2,whiteSpace:"nowrap"}}>{row.brand || "Unassigned Brand"}</span>
                              </span>
                            </div>
                          </td>

                          <td style={{
                            padding:"12px 13px",textAlign:"right",
                            fontSize:11.5,fontWeight:800,color:"#183126",
                            whiteSpace:"nowrap",borderBottom
                          }}>
                            {fmtAmt(row.revenue)}
                          </td>

                          <td style={{
                            padding:"12px 13px",textAlign:"right",
                            fontSize:11.5,fontWeight:800,
                            color:hasProfitData ? "#1d4ed8" : "#94a3b8",
                            whiteSpace:"nowrap",borderBottom
                          }}>
                            {hasProfitData ? fmtAmt(row.grossProfit) : "—"}
                          </td>

                          <td style={{
                            padding:"12px 13px",
                            textAlign:"center",
                            borderBottom
                          }}>
                            <span style={{
                              display:"inline-flex",
                              alignItems:"center",
                              justifyContent:"center",
                              minWidth:60,
                              padding:"4px 8px",
                              borderRadius:20,
                              background:marginBg,
                              color:marginColor,
                              border:`1px solid ${marginColor}25`,
                              fontSize:10.5,
                              fontWeight:800,
                              whiteSpace:"nowrap"
                            }}>
                              {hasProfitData ? `${row.margin.toFixed(1)}%` : "No COGS"}
                            </span>
                          </td>

                          <td style={{
                            padding:"12px 13px",textAlign:"center",
                            fontSize:11.5,fontWeight:700,color:"#334155",
                            borderBottom
                          }}>
                            {row.transactions.toLocaleString()}
                          </td>

                          <td style={{
                            padding:"12px 13px",textAlign:"right",
                            fontSize:11.5,fontWeight:800,color:"#3b791e",
                            whiteSpace:"nowrap",borderBottom
                          }}>
                            {fmtAmt(row.avgOrder)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{
                minHeight:180,display:"flex",alignItems:"center",
                justifyContent:"center",border:"1px dashed #D7E1D4",
                borderRadius:12,background:"#FAFCF8",color:"#7A887B",
                fontSize:12,fontWeight:600,textAlign:"center",padding:20
              }}>
                {viewArchive
                  ? "Branch profitability is not stored in this archived dashboard snapshot."
                  : "No branch transaction data is available for the selected filter."}
              </div>
            )}

            {!viewArchive &&
              branchProfitability.length > 0 &&
              branchProfitability.some(row => !row.hasCogs) && (
                <div style={{
                  marginTop:10,display:"flex",alignItems:"flex-start",gap:7,
                  padding:"9px 11px",borderRadius:9,background:"#fffaf0",
                  border:"1px solid #fde68a",color:"#92400e",
                  fontSize:10.5,lineHeight:1.55
                }}>
                  <Info size={13} style={{flexShrink:0,marginTop:1}} />
                  <span>
                    Gross Profit and Margin show “No COGS” when the transaction API
                    has no cost-of-goods value. Revenue, Transactions and Avg. Order
                    still come directly from the API.
                  </span>
                </div>
              )}
          </div>
        <SalesTrendSection values={values} labels={chartLabels} kpiData={kpiData} total={total} avg={avg} peak={peak} low={low} peakLabel={peakLabel} pctChange={pctChange} trending={trending} getRangeLabel={getRangeLabel} filterLabel={filterLabel} filterBrand={filterBrand} filterBranch={filterBranch} brands={brandList} transactionCount={transactionCount || 0} averageTransaction={averageTransaction} branchPerformance={branchPerformance} brandPerformance={brandPerformance} branchProfitability={branchProfitability} />
        </>}

        {false && analysisTab === "prescriptive" && <PrescriptiveSection transactions={filteredTransactions} filterLabel={filterLabel} preset={preset} total={total} values={values} labels={chartLabels} kpiData={kpiData} />}

        {false && analysisTab === "stock" && <SalesVsStockSection preset={preset} appliedRange={appliedRange} rangeMode={rangeMode} filterBranch={filterBranch} filterBrand={filterBrand} selectedBrand={selectedBrand} total={total} transactions={filteredTransactions} />}

        {dashboardTab === "sales_ai" && (
          <div style={{order:4}}>
            <div style={{ background:"linear-gradient(135deg,#F4F8F0,#fff)", border:"1px solid #DCE9DB", borderLeft:"5px solid #3b791e", borderRadius:14, padding:"14px 16px", marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:14, fontWeight:850, color:"#12241B" }}><LineChart size={16} color="#3b791e"/> Read the actual sales evidence first</div>
              <div style={{ fontSize:10.8, color:"#5C6B60", lineHeight:1.55, marginTop:5 }}>Use the actual revenue line, period summary, and branch profitability below to understand sales movement. Corrective recommendations are kept with the loss evidence in Ghost Stock / Revenue Leakage.</div>
            </div>

            <SalesTrendSection values={values} labels={chartLabels} kpiData={kpiData} total={total} avg={avg} peak={peak} low={low} peakLabel={peakLabel} pctChange={pctChange} trending={trending} getRangeLabel={getRangeLabel} filterLabel={filterLabel} filterBrand={filterBrand} filterBranch={filterBranch} brands={brandList} transactionCount={transactionCount || 0} averageTransaction={averageTransaction} branchPerformance={branchPerformance} brandPerformance={brandPerformance} branchProfitability={branchProfitability} />

          </div>
        )}
        </div>

        <InfoModal modal={infoModal} onClose={closeInfo} onConfirm={() => { if (infoModal?.onConfirm) infoModal.onConfirm(); }} />

        <Toast toast={toast} onClose={() => setToast(null)} />
          
      </div>
    );
  }

  function ActivityLogContent({ user }) {
    const [allLogs,     setAllLogs]     = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [page,        setPage]        = useState(0);

    const [search,   setSearch]   = useState('');
    const [fModule,  setFModule]  = useState('');
    const [fAction,  setFAction]  = useState('');
    const [fUser,    setFUser]    = useState('');
    const [fBranch,  setFBranch]  = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo,   setDateTo]   = useState('');

    const loadLogs = useCallback(async () => {
      setLoading(true);
      try {
        const endpoints = [
          'menu-activity-log', 'stockInv-activity-log', 'shop-activity-log',
          'orders-activity-log', 'users-activity-log', 'applications-activity-log',
          'reports-activity-log', 'announcements-activity-log', 'brands-activity-log',
        ];
        const results = await Promise.all(
          endpoints.map(url =>
            fetch(`${process.env.REACT_APP_API_URL}/${url}`)
              .then(r => r.json())
              .then(rows => (Array.isArray(rows) ? rows : []).map(row => ({
                id:          row.id,
                module:      row.module || 'General',
                action:      (row.action || 'update').toLowerCase(),
                user_name:   row.performed_by || 'Admin',
                role:        row.role || 'Unknown',
                description: row.item_name || row.action || '—',
                branch:      row.branch || '—',
                device:      row.device || '—',
                location:    row.location || '—',
                changes:     row.changes || null,
                created_at:  row.created_at,
                meta:        {},
              })))
              .catch(() => [])
          )
        );
        const merged = results.flat().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setAllLogs(merged);
      } catch (err) {
        console.error('Failed to load activity logs:', err);
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => { loadLogs(); }, [loadLogs]);

    const uniqueUsers    = useMemo(() => [...new Set(allLogs.map(l => l.user_name))].sort(), [allLogs]);
    const uniqueBranches = useMemo(() => [...new Set(allLogs.map(l => l.branch).filter(Boolean))].sort(), [allLogs]);

    const filtered = useMemo(() => {
      const q = search.toLowerCase();
      return allLogs.filter(l => {
        if (q && !l.description.toLowerCase().includes(q) && !l.user_name.toLowerCase().includes(q) && !l.module.toLowerCase().includes(q) && !l.action.toLowerCase().includes(q)) return false;
        if (fModule  && l.module    !== fModule)  return false;
        if (fAction  && l.action    !== fAction)  return false;
        if (fUser    && l.user_name !== fUser)    return false;
        if (fBranch  && l.branch    !== fBranch)  return false;
        if (dateFrom && new Date(l.created_at) < new Date(dateFrom)) return false;
        if (dateTo) {
          const t = new Date(dateTo);
          t.setHours(23, 59, 59);
          if (new Date(l.created_at) > t) return false;
        }
        return true;
      });
    }, [allLogs, search, fModule, fAction, fUser, fBranch, dateFrom, dateTo]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const pageItems  = useMemo(() => {
      const p = Math.min(page, totalPages - 1);
      return filtered.slice(p * PAGE_SIZE, (p + 1) * PAGE_SIZE);
    }, [filtered, page, totalPages]);

    const todayStr   = new Date().toISOString().slice(0, 10);
    const todayCount = allLogs.filter(l => l.created_at.startsWith(todayStr)).length;
    const userCount  = new Set(allLogs.map(l => l.user_name)).size;

    const hasFilters = search || fModule || fAction || fUser || fBranch || dateFrom || dateTo;

    const clearAll = () => {
      setSearch(''); setFModule(''); setFAction('');
      setFUser(''); setFBranch(''); setDateFrom(''); setDateTo('');
      setPage(0);
    };

    useEffect(() => { setPage(0); }, [search, fModule, fAction, fUser, fBranch, dateFrom, dateTo]);

    const exportCSV = () => {
      const header = ['Event ID', 'Timestamp', 'User', 'Role', 'Module', 'Action', 'Description', 'Branch', 'Location', 'Device'];
      const rows   = filtered.map(l => [
        `#LOG-${String(l.id).padStart(5, '0')}`,
        fmtFull(l.created_at),
        l.user_name, l.role, l.module, l.action, l.description,
        l.branch || '', l.location || '', l.device,
      ]);
      const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
      const a   = document.createElement('a');
      a.href    = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      a.download = `audit_log_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    };

    const exportPDF = () => {
      const doc   = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      let y       = 18;
      doc.setFillColor(13, 43, 30);
      doc.rect(0, 0, pageW, 28, 'F');
      doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
      doc.text('ACTIVITY AUDIT LOG', pageW / 2, 12, { align: 'center' });
      doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(160, 220, 190);
      doc.text(`Generated ${fmtFull(new Date().toISOString())} · ${filtered.length} events`, pageW / 2, 22, { align: 'center' });
      y = 36;
      filtered.slice(0, 200).forEach((l) => {
        if (y > 270) { doc.addPage(); y = 18; }
        doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 30, 30);
        doc.text(`#LOG-${String(l.id).padStart(5, '0')} · ${l.action.toUpperCase()} · ${l.module}`, 14, y);
        y += 5;
        doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80);
        doc.text(`${l.description}`, 14, y);
        y += 4;
        doc.setTextColor(140, 140, 140);
        doc.text(`${fmtFull(l.created_at)}  ·  ${l.user_name}  ·  ${l.branch || ''}  ·  ${l.location || ''}  ·  ${l.device}`, 14, y);
        y += 7;
        doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.2);
        doc.line(14, y - 2, pageW - 14, y - 2);
      });
      const total = doc.internal.getNumberOfPages();
      for (let i = 1; i <= total; i++) {
        doc.setPage(i); doc.setFontSize(7); doc.setTextColor(160, 160, 160);
        doc.text(`Page ${i} of ${total}  ·  iFranchise Admin Audit Log`, pageW / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' });
      }
      doc.save(`audit_log_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    const selSt = {
      height: 36, padding: '0 30px 0 11px', borderRadius: 9,
      border: `1px solid ${C.border}`, background: C.bg,
      fontSize: 12.5, color: C.ink, fontFamily: FONT,
      outline: 'none', appearance: 'none', cursor: 'pointer',
      transition: 'border-color .15s ease, box-shadow .15s ease',
    };

    // sticky header cell style — this is what keeps the column labels pinned
    // to the top of the scrollable card body ("Event ID / Timestamp / User..." row).
    // Given its own tinted background + shadow so it reads as a distinct bar,
    // not just text floating over the same white as the rows.
  const stickyTh = {
    position:'sticky', top:0, zIndex:5,
    padding:'13px 12px', textAlign:'left', fontWeight:800, fontSize:10.5,
    color:C.greenDk, letterSpacing:'0.08em', textTransform:'uppercase',
    background:'#F6F7F1',
    borderBottom:`2px solid ${C.border}`,
    boxShadow:'none',
    whiteSpace:'nowrap',
  };
    const stickyTheadRow = {
      boxShadow: '0 2px 0 rgba(0,140,60,0.05)',
    };

    const td = (i) => ({
      padding: '11px 12px', borderBottom: '1px solid #f0f8f0',
      background: i % 2 === 0 ? C.white : '#fafffe',
      fontSize: 12.5, verticalAlign: 'middle', color: C.ink,
      transition: 'background .12s ease',
    });

    return (
      <div style={{ fontFamily: FONT }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes rowIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
          .al-row-hover:hover td { background: #f0fdf5 !important; }
          .al-select:focus, .al-input:focus { border-color: #00897b !important; box-shadow: 0 0 0 3px rgba(0,137,123,0.1); }
          .al-toolbar-btn { transition: transform .12s ease, box-shadow .12s ease, filter .12s ease; }
          .al-toolbar-btn:hover { filter: brightness(0.97); transform: translateY(-1px); }
          .al-toolbar-btn:active { transform: translateY(0); }
        `}</style>

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 22 }}>
          <StatCard label="Total Events" value={allLogs.length} sub="All time"      color={C.ink}   icon={Activity} />
          <StatCard label="Today"        value={todayCount}     sub="Last 24 hours" color={C.green} icon={Clock}    />
          <StatCard label="Active Users" value={userCount}      sub="Unique actors" color="#1565c0" icon={User}     />
        </div>

        {/* ── Toolbar ── */}
        <div style={{ background: C.white, border: '1px solid rgba(0,168,76,0.13)', borderRadius: 16, padding: '14px 18px', marginBottom: 18, boxShadow: '0 1px 8px rgba(0,140,60,0.05)' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 220px' }}>
              <Search size={13} color={C.muted} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search events, users, modules…"
                className="al-input"
                style={{ ...selSt, paddingLeft: 30, width: '100%', appearance: 'auto' }}
              />
            </div>

            <select className="al-select" value={fModule} onChange={e => setFModule(e.target.value)} style={{ ...selSt, minWidth: 160 }}>
              <option value="">All modules</option>
              {MODULES.map(m => <option key={m}>{m}</option>)}
            </select>

            <select className="al-select" value={fAction} onChange={e => setFAction(e.target.value)} style={{ ...selSt, minWidth: 130 }}>
              <option value="">All actions</option>
              {Object.keys(ACTION_META).map(a => <option key={a} value={a}>{ACTION_META[a].label}</option>)}
            </select>

            <select className="al-select" value={fUser} onChange={e => setFUser(e.target.value)} style={{ ...selSt, minWidth: 150 }}>
              <option value="">All users</option>
              {uniqueUsers.map(u => <option key={u}>{u}</option>)}
            </select>

            <select className="al-select" value={fBranch} onChange={e => setFBranch(e.target.value)} style={{ ...selSt, minWidth: 140 }}>
              <option value="">All branches</option>
              {uniqueBranches.map(b => <option key={b}>{b}</option>)}
            </select>

            <input type="date" className="al-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ ...selSt, width: 145, appearance: 'auto' }} />
            <input type="date" className="al-input" value={dateTo}   onChange={e => setDateTo(e.target.value)}   style={{ ...selSt, width: 145, appearance: 'auto' }} />

            {hasFilters && (
              <button className="al-toolbar-btn" onClick={clearAll} style={{ height: 36, padding: '0 14px', borderRadius: 9, border: `1px solid ${C.border}`, background: C.white, color: C.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 5 }}>
                <X size={12} /> Clear
              </button>
            )}

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button className="al-toolbar-btn" onClick={exportCSV} style={{ height: 36, padding: '0 14px', borderRadius: 9, border: `1px solid ${C.border}`, background: C.white, color: C.green, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Download size={12} /> CSV
              </button>
              <button className="al-toolbar-btn" onClick={exportPDF} style={{ height: 36, padding: '0 14px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#00c853,#00897b)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 5, boxShadow: '0 2px 10px rgba(0,180,90,0.28)' }}>
                <FileText size={12} /> PDF
              </button>
              <button className="al-toolbar-btn" onClick={loadLogs} style={{ height: 36, padding: '0 14px', borderRadius: 9, border: `1px solid ${C.border}`, background: C.white, color: C.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 5 }}>
                <RefreshCw size={12} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} /> Refresh
              </button>
            </div>
          </div>
        </div>

        {/* ── Log panel ── */}
        <div style={{ background: C.white, border: '1px solid rgba(0,168,76,0.12)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 14px rgba(0,140,60,0.07)' }}>

          {/* Panel header */}
          <div style={{ background: 'linear-gradient(135deg,#2E7D32,#00897b)', padding: '13px 20px' }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>Audit Log</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.75)', marginTop: 2 }}>
              {filtered.length} event{filtered.length !== 1 ? 's' : ''} · page {Math.min(page + 1, totalPages)} of {totalPages}
            </div>
          </div>

          {/* Scrollable body — the <thead> below is sticky, so the column
              labels (Event ID / Timestamp / User / Module / Action /
              Description / Branch / Location / Device) stay pinned at the
              top of the card while the rows scroll underneath them. */}
          <div style={{ maxHeight: 600, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '48px 0', textAlign: 'center', color: C.muted, fontSize: 14 }}>
                <RefreshCw size={24} color={C.green} style={{ animation: 'spin 0.8s linear infinite', marginBottom: 10 }} />
                <div>Loading audit log…</div>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '48px 0', textAlign: 'center', color: C.muted, fontSize: 13, fontStyle: 'italic' }}>
                No events match your filters.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 900 }}>
                  <thead>
                    <tr style={stickyTheadRow}>
                      {['Event ID', 'Timestamp', 'User', 'Module', 'Action', 'Description', 'Branch', 'Location', 'Device'].map((h, i, arr) => (
                        <th
                          key={h}
                          style={{
                            ...stickyTh,
                            borderRight: i < arr.length - 1 ? '1px solid rgba(0,140,60,0.1)' : 'none',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((log, i) => (
                      <tr key={log.id} className="al-row-hover" style={{ animation: 'rowIn .22s ease both', animationDelay: `${Math.min(i, 12) * 15}ms` }}>
                        <td style={{ ...td(i), fontSize: 11, color: C.muted, fontFamily: 'monospace' }}>#LOG-{String(log.id).padStart(5, '0')}</td>
                        <td style={{ ...td(i), fontSize: 11, whiteSpace: 'nowrap' }}>{fmtFull(log.created_at)}</td>
                        <td style={{ ...td(i), fontWeight: 700 }}>
                          <div>{log.user_name}</div>
                          <div style={{ fontSize: 11, fontWeight: 400, color: C.muted }}>{log.role}</div>
                        </td>
                        <td style={td(i)}>
                          <span style={{ background: C.greenLt, color: C.greenDk, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{log.module}</span>
                        </td>
                        <td style={td(i)}><ActionBadge action={log.action} /></td>
                        <td style={{ ...td(i), maxWidth: 260 }}>
                          <div>{log.description}</div>
                          {log.meta?.field && (
                            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                              {log.meta.field}: <span style={{ color: '#c62828' }}>{log.meta.old}</span> → <span style={{ color: '#2e7d32' }}>{log.meta.new}</span>
                            </div>
                          )}
                        </td>
                        <td style={{ ...td(i), fontSize: 12, color: C.muted }}>{log.branch || '—'}</td>
                        <td style={{ ...td(i), fontSize: 12, color: C.muted }}>{log.location || '—'}</td>
                        <td style={{ ...td(i), fontSize: 11, color: C.muted, whiteSpace: 'nowrap' }}>{log.device}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderTop: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 12, color: C.muted }}>
              Showing{' '}
              <strong style={{ color: C.ink }}>{Math.min(page * PAGE_SIZE + 1, filtered.length)}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)}</strong>
              {' '}of{' '}
              <strong style={{ color: C.ink }}>{filtered.length}</strong>
            </span>
            <LogPagination page={Math.min(page, totalPages - 1)} totalPages={totalPages} onChange={setPage} />
          </div>
        </div>
      </div>
    );
  }

  //NO USE YET
  function DeleteConfirmModal({ target, onConfirm, onClose, deleting = false }) {
    const isBrand = target.type === "brand";
    return (
      <div onClick={deleting ? undefined : onClose} style={{ position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20, backdropFilter: "blur(4px)" }}>
        <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", width: "100%", maxWidth: 420, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", border: "1px solid rgba(0,168,76,0.15)", fontFamily: "Montserrat, sans-serif" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Trash2 size={22} color="#dc2626" />
          </div>
          <h2 style={{ textAlign: "center", fontSize: 17, fontWeight: 800, color: "#0d2b1e", marginBottom: 8 }}>Delete {isBrand ? "brand" : "branch"}?</h2>
          <p style={{ textAlign: "center", fontSize: 13, color: "#5a7a65", lineHeight: 1.6, marginBottom: 16 }}>
            You are about to delete <strong>"{target.name}"</strong>{isBrand ? " and all its associated data." : "."}
          </p>
          {isBrand && target.branchCount > 0 && (
            <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#c2410c", textAlign: "center", marginBottom: 16 }}>
              ⚠ This brand has {target.branchCount} {target.branchCount === 1 ? "branch" : "branches"}. All branches will also be deleted.
            </div>
          )}
          <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginBottom: 20 }}>You can recover this from Delete History.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button type="button" onClick={onClose} disabled={deleting} style={{ padding: "9px 22px", borderRadius: 10, border: "1px solid #b2dfdb", background: "#f0fdf5", color: "#5a7a65", fontSize: 13, fontWeight: 700, cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: deleting ? 0.5 : 1 }}>Cancel</button>
            <button type="button" onClick={onConfirm} disabled={deleting} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#dc2626,#ef4444)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 2px 10px rgba(220,38,38,0.35)", opacity: deleting ? 0.7 : 1 }}>
              {deleting ? <RefreshCw size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : <Trash2 size={14} />}
              {deleting ? "Deleting…" : `Delete ${isBrand ? "brand" : "branch"}`}
            </button>
          </div>
        </div>
      </div>
    );
  } 

  //BRANDS BRANCH

  function BrandDeleteHistoryPanel({ history, onRestore, restoringId, onClose }) {
    const fmt = (d) => new Date(d).toLocaleString("en-PH", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    return (
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20, backdropFilter: "blur(4px)" }}>
        <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", width: "100%", maxWidth: 580, maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", border: "1px solid rgba(0,168,76,0.15)", fontFamily: "Montserrat, sans-serif" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0d2b1e", margin: 0 }}>Delete History</h2>
              {history.length > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#fee2e2", color: "#dc2626" }}>{history.length} deleted</span>}
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid #b2dfdb", background: "#e0f2f1", cursor: "pointer", color: "#00695c", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} /></button>
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {history.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "#9ca3af", fontSize: 13, fontStyle: "italic" }}>No deleted items yet.</div>
            ) : history.map((entry, i) => (
              <div key={entry.id ?? i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < history.length - 1 ? "1px solid #f0f8f0" : "none" }}>
                <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap", background: entry.type === "brand" ? "rgba(59,130,246,0.1)" : "rgba(16,185,129,0.1)", color: entry.type === "brand" ? "#2563eb" : "#059669" }}>
                  {entry.type === "brand" ? "Brand" : "Branch"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#0d2b1e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{entry.name}</div>
                  <div style={{ fontSize: 11, color: "#5a7a65", marginTop: 2 }}>{fmt(entry.deletedAt)}{entry.type === "brand" && entry.data?.branches?.length > 0 ? ` · ${entry.data.branches.length} ${entry.data.branches.length === 1 ? "branch" : "branches"} included` : ""}{entry.type === "branch" && entry.brandName ? ` · ${entry.brandName}` : ""}</div>
                </div>
                <button
                  onClick={() => onRestore(entry)}
                  disabled={restoringId !== null}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "7px 14px", borderRadius: 9,
                    border: "1.5px solid #00897b",
                    background: restoringId === entry.id ? "#f0fdf5" : "#e0f2f1",
                    color: "#00695c", fontSize: 12, fontWeight: 700,
                    cursor: restoringId !== null ? "not-allowed" : "pointer",
                    fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0,
                    opacity: restoringId !== null ? (restoringId === entry.id ? 0.7 : 0.4) : 1,
                  }}
                >
                  {restoringId === entry.id ? (
                    <>
                      <RotateCcw size={12} style={{ animation: "spin 1s linear infinite" }} /> Restoring…
                    </>
                  ) : (
                    <>
                      <RotateCcw size={12} /> Restore
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function BrandFormFields({ form, setForm }) {
    const [catInput, setCatInput] = useState("");
    const f = (field) => ({ value: form[field], onChange: (e) => setForm((p) => ({ ...p, [field]: e.target.value })) });
    const inputSt = { width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #b2dfdb", fontSize: 13, color: "#0d2b1e", background: "#f0fdf5", fontFamily: "inherit", outline: "none", marginTop: 4, boxSizing: "border-box" };
    const lbl = { display: "block", fontSize: 11, fontWeight: 800, color: "#5a7a65", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.07em" };
    const addCategory = () => {
      const val = catInput.trim();
      if (!val) return;
      if ((form.categories || []).map((c) => c.toLowerCase()).includes(val.toLowerCase())) { alert(`"${val}" is already in the list.`); return; }
      setForm((f) => ({ ...f, categories: [...(f.categories || []), val] }));
      setCatInput("");
    };
    const removeCategory = (cat) => setForm((f) => ({ ...f, categories: f.categories.filter((c) => c !== cat) }));
    return (
      <div style={{ display: "grid", gap: 14 }}>
        <div><label style={lbl}>Brand Name *</label><input style={inputSt} {...f("name")} placeholder="Enter brand name" required /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={lbl}>Contact Email</label><input type="email" style={inputSt} {...f("contact_email")} placeholder="brand@example.com" /></div>
          <div>
            <label style={lbl}>Contact Phone</label>
            <input type="tel" style={inputSt} maxLength={11} value={form.contact_phone}
              onKeyDown={(e) => { const allowed = ["Backspace","Delete","ArrowLeft","ArrowRight","Tab","Home","End"]; const isShortcut = (e.ctrlKey||e.metaKey)&&["a","c","v","x","z","y"].includes(e.key.toLowerCase()); if (!/^\d$/.test(e.key)&&!allowed.includes(e.key)&&!isShortcut) e.preventDefault(); }}
              onChange={(e) => { const digits = e.target.value.replace(/\D/g,"").slice(0,11); setForm((prev) => ({...prev,contact_phone:digits})); }}
              placeholder="09XXXXXXXXX" />
          </div>
        </div>
        <div><label style={lbl}>Description</label><textarea style={{ ...inputSt, resize: "vertical", lineHeight: 1.5 }} {...f("description")} rows={3} placeholder="Brief description..." /></div>
        <div>
          <label style={lbl}>Categories</label>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <input style={{ ...inputSt, marginTop: 0, flex: 1 }} placeholder="e.g. Medicine, Supplement..." value={catInput} onChange={(e) => setCatInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCategory(); } }} />
            <button type="button" onClick={addCategory} style={{ padding: "9px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#2E7D32,#00897b)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}><Plus size={13} /> Add</button>
          </div>
          {(form.categories || []).length === 0
            ? <div style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic", marginTop: 6 }}>No categories yet.</div>
            : <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 8 }}>
                {form.categories.map((cat) => (
                  <span key={cat} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: "#e0f2f1", border: "1.5px solid #00897b", color: "#00695c", fontSize: 12, fontWeight: 700 }}>
                    {cat}
                    <button type="button" onClick={() => removeCategory(cat)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", color: "#00897b" }}><X size={12} /></button>
                  </span>
                ))}
              </div>
          }
        </div>
      </div>
    );
  }

  function BranchFormFields({ form, setForm, brands }) {
    const f = (field) => ({ value: form[field], onChange: (e) => setForm((p) => ({ ...p, [field]: e.target.value })) });
    const inputSt = { width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #b2dfdb", fontSize: 13, color: "#0d2b1e", background: "#f0fdf5", fontFamily: "inherit", outline: "none", marginTop: 4, boxSizing: "border-box" };
    const lbl = { display: "block", fontSize: 11, fontWeight: 800, color: "#5a7a65", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.07em" };
    return (
      <div style={{ display: "grid", gap: 14 }}>
        <div><label style={lbl}>Parent Brand *</label><select style={{ ...inputSt, appearance: "none", cursor: "pointer" }} {...f("brand_id")} required><option value="">Select brand</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
        <div><label style={lbl}>Branch Name *</label><input style={inputSt} {...f("name")} required /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={lbl}>Region *</label>
            <select style={{ ...inputSt, appearance: "none", cursor: "pointer" }} {...f("region")} required>
              <option value="">Select region</option>
              {["NCR","Region 3","Region 4A","Region 4B","Region 5","Region 7","Region 11"].map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          {String(form.brand_id) === brands.find((b) => b.name === "Coffee Spot")?.id?.toString() && (
            <div><label style={lbl}>Concept *</label><select style={{ ...inputSt, appearance: "none", cursor: "pointer" }} {...f("concept")}><option value="">Select concept</option><option>Full Store</option><option>Kiosk</option></select></div>
          )}
        </div>
        <div><label style={lbl}>Branch Manager</label><input style={inputSt} {...f("manager")} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={lbl}>Contact Number</label>
            <input type="tel" style={inputSt} maxLength={11} value={form.contact}
              onKeyDown={(e) => { const allowed = ["Backspace","Delete","ArrowLeft","ArrowRight","Tab","Home","End","Control"]; const isShortcut = (e.ctrlKey||e.metaKey)&&["a","c","v","x","z","y"].includes(e.key.toLowerCase()); if (!/^\d$/.test(e.key)&&!allowed.includes(e.key)&&!isShortcut) e.preventDefault(); }}
              onChange={(e) => { const digits = e.target.value.replace(/\D/g,"").slice(0,11); setForm((prev) => ({...prev,contact:digits})); }} />
          </div>
          <div><label style={lbl}>Address</label><input style={inputSt} {...f("address")} /></div>
        </div>
      </div>
    );
  }

  function BrandDeleteConfirmModal({ target, onConfirm, onClose, deleting }) {
    if (!target) return null;
    const isBrand = target.type === "brand";

    return (
      <div
        onClick={deleting ? undefined : onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2000, padding: 20, backdropFilter: "blur(4px)",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#fff", borderRadius: 20, padding: "28px 32px",
            width: "100%", maxWidth: 420,
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            border: "1px solid rgba(0,168,76,0.15)",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: "50%", background: "#fee2e2",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <Trash2 size={22} color="#dc2626" />
          </div>
          <h2 style={{ textAlign: "center", fontSize: 17, fontWeight: 800, color: "#0d2b1e", marginBottom: 8 }}>
            Delete {isBrand ? "brand" : "branch"}?
          </h2>
          <p style={{ textAlign: "center", fontSize: 13, color: "#5a7a65", lineHeight: 1.6, marginBottom: 6 }}>
            You are about to delete <strong>"{target.name}"</strong>
            {!isBrand && target.brandName ? ` under ${target.brandName}` : ""}.
          </p>
          {isBrand && target.branchCount > 0 && (
            <p style={{ textAlign: "center", fontSize: 12.5, color: "#dc2626", fontWeight: 600, lineHeight: 1.6, marginBottom: 6 }}>
              This will also remove {target.branchCount} associated branch{target.branchCount === 1 ? "" : "es"}.
            </p>
          )}
          <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginBottom: 20 }}>
            You can recover this from Delete History.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              type="button" onClick={onClose} disabled={deleting}
              style={{
                padding: "9px 22px", borderRadius: 10, border: "1px solid #b2dfdb",
                background: "#f0fdf5", color: "#5a7a65", fontSize: 13, fontWeight: 700,
                cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit",
              }}
            >
              Cancel
            </button>
            <button
              type="button" onClick={onConfirm} disabled={deleting}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 24px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg,#dc2626,#ef4444)",
                color: "#fff", fontSize: 13, fontWeight: 700,
                cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit",
                boxShadow: "0 2px 10px rgba(220,38,38,0.35)",
                opacity: deleting ? 0.7 : 1,
              }}
            >
              <Trash2 size={14} /> {deleting ? "Deleting…" : `Delete ${isBrand ? "Brand" : "Branch"}`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function BmModal({ title, onClose, onSubmit, saving = false, children }) {
    return (
      <div onClick={saving ? undefined : onClose} style={{ position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20, backdropFilter: "blur(4px)" }}>
        <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", width: "100%", maxWidth: 520, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", border: "1px solid rgba(0,168,76,0.15)", maxHeight: "92vh", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0d2b1e", margin: 0, fontFamily: "Montserrat,sans-serif" }}>{title}</h2>
            <button onClick={onClose} disabled={saving} style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid #b2dfdb", background: "#e0f2f1", cursor: saving ? "not-allowed" : "pointer", color: "#00695c", display: "flex", alignItems: "center", justifyContent: "center", opacity: saving ? 0.5 : 1 }}><X size={15} /></button>
          </div>
          <form onSubmit={onSubmit}>
            {children}
            <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
              <button type="button" onClick={onClose} disabled={saving} style={{ padding: "9px 22px", borderRadius: 10, border: "1px solid #b2dfdb", background: "#f0fdf5", color: "#5a7a65", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: saving ? 0.5 : 1 }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#2E7D32,#00897b)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 2px 10px rgba(0,180,90,0.35)", opacity: saving ? 0.7 : 1 }}>
                {saving ? <RefreshCw size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : <Check size={14} />}
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function BrandManagementContent({ user, brands: propBrands, onBrandsChange }) {
    const [brands,              setBrands]              = useState(propBrands || []);
    const [loading,             setLoading]             = useState(true);
    const [searchQuery,         setSearchQuery]         = useState("");
    const [filterRegion,        setFilterRegion]        = useState("all");
    const [filterBrand,         setFilterBrand]         = useState("all");
    const [showAddBrandModal,   setShowAddBrandModal]   = useState(false);
    const [showEditBrandModal,  setShowEditBrandModal]  = useState(false);
    const [showAddBranchModal,  setShowAddBranchModal]  = useState(false);
    const [showEditBranchModal, setShowEditBranchModal] = useState(false);
    const [selectedBrand,       setSelectedBrand]       = useState(null);
    const [selectedBranch,      setSelectedBranch]      = useState(null);
    const [deleteTarget,        setDeleteTarget]        = useState(null);
    const [deleting,            setDeleting]            = useState(false); 
    const [deletedHistory,      setDeletedHistory]      = useState([]);
    const [showHistory,         setShowHistory]         = useState(false);
    const [restoringId,         setRestoringId]         = useState(null); 
    const [alertModal,          setAlertModal]          = useState(null); 
    const emptyBrand  = { name: "", categories: [], contact_email: "", contact_phone: "", description: "" };
    const emptyBranch = { name: "", brand_id: "", region: "", manager: "", contact: "", address: "", concept: "" };
    const [brandForm,  setBrandForm]  = useState(emptyBrand);
    const [branchForm, setBranchForm] = useState(emptyBranch);

    const [activityLog,     setActivityLog]     = useState([]);

    const showAlert   = (message, type = "info") => setAlertModal({ title: message, type });
    const showLoading = (title) => setAlertModal({ type: "loading", title });
    const showSuccess = (title, message) => setAlertModal({ type: "success", title, message });
    const showError   = (title, message) => setAlertModal({ type: "error", title, message });

    const getBrowserLocation = () => {
      return new Promise((resolve) => {
        if (!navigator.geolocation) { resolve(null); return; }
        navigator.geolocation.getCurrentPosition(
          (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
          () => resolve(null),
          { timeout: 5000, maximumAge: 60000 }
        );
      });
    };

  const fetchActivityLog = useCallback(async () => {
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/brands-activity-log`);
      const data = await res.json();
      setActivityLog(Array.isArray(data) ? data.map(row => ({
        id:          row.id,
        action:      row.action,
        itemName:    row.item_name ?? row.itemName,
        branch:      row.branch,
        performedBy: row.performed_by ?? row.performedBy,
        role:        row.role,
        changes:     row.changes,
        timestamp:   row.created_at ?? row.timestamp,
      })) : []);
    } catch (err) { console.error("Failed to fetch brands activity log:", err); }
  }, []);

    const fetchDeleteHistory = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/brand-delete-history`);
        const data = await res.json();
        const normalized = Array.isArray(data) ? data.map(entry => ({ ...entry, brandName: entry.brand_name ?? null, deletedAt: entry.deleted_at ?? null, data: typeof entry.data === 'string' ? JSON.parse(entry.data) : (entry.data ?? {}) })) : [];
        setDeletedHistory(normalized);
      } catch (err) { console.error(err); }
    };

    const fetchBrands = async () => {
        setLoading(true);
        try {
          const res  = await fetch(`${process.env.REACT_APP_API_URL}/brands`);
          const data = await res.json();
          const list = Array.isArray(data) ? data : [];
          const sorted = [...list]
            .sort((a, b) => {
              if (a.name === "Head Office") return -1;
              if (b.name === "Head Office") return 1;
              return 0;
            })
            .map((b) => ({
              ...b,
              branches: [...(b.branches || [])].sort((x, y) => {
                if (x.name === "Head Office") return -1;
                if (y.name === "Head Office") return 1;
                return 0;
              }),
            }));
          setBrands(sorted);
          onBrandsChange?.(sorted);
        } catch (err) { console.error("Failed to fetch brands:", err); }
        finally { setLoading(false); }
      };

    useEffect(() => { fetchBrands(); fetchDeleteHistory(); fetchActivityLog(); }, [fetchActivityLog]);

  const handleAddBrand = async (e) => {
      e.preventDefault();
      const duplicate = brands.some((b) => b.name.trim().toLowerCase() === brandForm.name.trim().toLowerCase());
      if (duplicate) { showError("Duplicate brand", `A brand named "${brandForm.name}" already exists.`); return; }
      showLoading("Adding brand…");
      try {
        const coords = await getBrowserLocation();
        const res = await fetch(`${process.env.REACT_APP_API_URL}/brands`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...brandForm,
            performed_by: user?.name || "System",
            role: user?.role || "Unknown",
            latitude: coords?.latitude,
            longitude: coords?.longitude,
          }),
        });
        const data = await res.json();
        if (data.success) {
          await fetchBrands();
          await fetchActivityLog();
          setShowAddBrandModal(false);
          setBrandForm(emptyBrand);
          showSuccess("Brand added", `"${brandForm.name}" has been added.`);
        } else showError("Failed to add brand", data.error || "Something went wrong.");
      } catch { showError("Failed to add brand", "Something went wrong. Please try again."); }
    };

  const handleEditBrand = async (e) => {
      e.preventDefault();
      showLoading("Updating brand…");
      try {
        const coords = await getBrowserLocation();
        const res = await fetch(`${process.env.REACT_APP_API_URL}/brands/${selectedBrand.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...brandForm,
            performed_by: user?.name || "System",
            role: user?.role || "Unknown",
            latitude: coords?.latitude,
            longitude: coords?.longitude,
          }),
        });
        const data = await res.json();
        if (data.success) {
          await fetchBrands();
          await fetchActivityLog();
          setShowEditBrandModal(false);
          setSelectedBrand(null);
          showSuccess("Brand updated", `"${brandForm.name}" has been updated.`);
        } else showError("Failed to update brand", data.error || "Something went wrong.");
      } catch { showError("Failed to update brand", "Something went wrong. Please try again."); }
    };

  const handleDeleteBrand = async () => {
      if (!deleteTarget) return;
      const { id, name } = deleteTarget;
      const brand = brands.find((b) => b.id === id);
      const brandToSave = {
        name: brand.name,
        categories: brand.categories || [],
        contact_email: brand.contact_email || null,
        contact_phone: brand.contact_phone || null,
        description: brand.description || null,
        branches: (brand.branches || []).map(br => ({
          name: br.name, region: br.region || null, manager: br.manager || null,
          contact: br.contact || null, address: br.address || null, concept: br.concept || null,
        })),
      };
      setDeleting(true);
      showLoading("Deleting brand…");
      try {
        const coords = await getBrowserLocation();
        const res = await fetch(`${process.env.REACT_APP_API_URL}/brands/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            performed_by: user?.name || "System",
            role: user?.role || "Unknown",
            latitude: coords?.latitude,
            longitude: coords?.longitude,
          }),
        });
        const data = await res.json();
        if (data.success) {
          await fetch(`${process.env.REACT_APP_API_URL}/brand-delete-history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'brand', name, brand_name: null, data: brandToSave }),
          });
          await fetchBrands();
          await fetchDeleteHistory();
          await fetchActivityLog();
          showSuccess("Brand deleted", `"${name}" has been deleted.`);
        } else showError("Failed to delete brand", data.error || "Something went wrong.");
      } catch { showError("Failed to delete brand", "Something went wrong. Please try again."); }
      finally {
        setDeleting(false);
        setDeleteTarget(null);
      }
    };

  const handleAddBranch = async (e) => {
      e.preventDefault();
      const parentBrand = brands.find((b) => String(b.id) === String(branchForm.brand_id));
      const duplicate = parentBrand?.branches?.some((br) => br.name.trim().toLowerCase() === branchForm.name.trim().toLowerCase());
      if (duplicate) { showError("Duplicate branch", `A branch named "${branchForm.name}" already exists under this brand.`); return; }
      showLoading("Adding branch…");
      try {
        const coords = await getBrowserLocation();
        const res = await fetch(`${process.env.REACT_APP_API_URL}/branches`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...branchForm,
            performed_by: user?.name || "System",
            role: user?.role || "Unknown",
            latitude: coords?.latitude,
            longitude: coords?.longitude,
          }),
        });
        const data = await res.json();
        if (data.success) {
          await fetchBrands();
          await fetchActivityLog();
          setShowAddBranchModal(false);
          setBranchForm(emptyBranch);
          showSuccess("Branch added", `"${branchForm.name}" has been added.`);
        } else showError("Failed to add branch", data.error || "Something went wrong.");
      } catch { showError("Failed to add branch", "Something went wrong. Please try again."); }
    };

  const handleEditBranch = async (e) => {
      e.preventDefault();
      showLoading("Updating branch…");
      try {
        const coords = await getBrowserLocation();
        const res = await fetch(`${process.env.REACT_APP_API_URL}/branches/${selectedBranch.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...branchForm,
            performed_by: user?.name || "System",
            role: user?.role || "Unknown",
            latitude: coords?.latitude,
            longitude: coords?.longitude,
          }),
        });
        const text = await res.text();
        const data = JSON.parse(text);
        if (data.success) {
          await fetchBrands();
          await fetchActivityLog();
          setShowEditBranchModal(false);
          setSelectedBranch(null);
          showSuccess("Branch updated", `"${branchForm.name}" has been updated.`);
        } else showError("Failed to update branch", data.error || "Something went wrong.");
      } catch { showError("Failed to update branch", "Something went wrong. Please try again."); }
    };

  const handleDeleteBranch = async () => {
      if (!deleteTarget) return;
      const { id, name, brandName } = deleteTarget;
      const branch = brands.flatMap((b) => b.branches || []).find((br) => br.id === id);
      setDeleting(true);
      showLoading("Deleting branch…");
      try {
        const coords = await getBrowserLocation();
        const res = await fetch(`${process.env.REACT_APP_API_URL}/branches/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            performed_by: user?.name || "System",
            role: user?.role || "Unknown",
            latitude: coords?.latitude,
            longitude: coords?.longitude,
          }),
        });
        const data = await res.json();
        if (data.success) {
          await fetch(`${process.env.REACT_APP_API_URL}/brand-delete-history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'branch', name, brand_name: brandName, data: branch }),
          });
          await fetchBrands();
          await fetchDeleteHistory();
          await fetchActivityLog();
          showSuccess("Branch deleted", `"${name}" has been deleted.`);
        } else showError("Failed to delete branch", data.error || "Something went wrong.");
      } catch { showError("Failed to delete branch", "Something went wrong. Please try again."); }
      finally {
        setDeleting(false);
        setDeleteTarget(null);
      }
    };

  const handleRestore = async (entry) => {
      setRestoringId(entry.id);
      showLoading(entry.type === "brand" ? "Restoring brand…" : "Restoring branch…");
      try {
        const coords = await getBrowserLocation();
        if (entry.type === "brand") {
          const { branches, ...brandFields } = entry.data;
          const branchList = Array.isArray(branches) ? branches : [];
          const res = await fetch(`${process.env.REACT_APP_API_URL}/brands`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...brandFields,
              performed_by: user?.name || "System",
              role: user?.role || "Unknown",
              latitude: coords?.latitude,
              longitude: coords?.longitude,
              restored: true,
            }),
          });
          const data = await res.json();
          if (!data.success) { showError("Failed to restore brand", data.error || "Something went wrong."); return; }
          const newBrandId = data.brand?.id;
          for (const br of branchList) {
            const { id: _ignore, brand_id: _ignore2, ...branchFields } = br;
            await fetch(`${process.env.REACT_APP_API_URL}/branches`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: branchFields.name,
                region: branchFields.region || null,
                manager: branchFields.manager || null,
                contact: branchFields.contact || null,
                address: branchFields.address || null,
                concept: branchFields.concept || null,
                brand_id: newBrandId,
                performed_by: user?.name || "System",
                role: user?.role || "Unknown",
                latitude: coords?.latitude,
                longitude: coords?.longitude,
                restored: true,
              }),
            });
          }
          await fetch(`${process.env.REACT_APP_API_URL}/brand-delete-history/${entry.id}`, { method: 'DELETE' });
          await fetchBrands();
          await fetchDeleteHistory();
          await fetchActivityLog();
          showSuccess("Brand restored", `"${brandFields.name}" has been restored.`);
        } else {
          const parentBrand = brands.find((b) => b.name === entry.brandName);
          if (!parentBrand) { showError("Cannot restore branch", `Parent brand "${entry.brandName || 'unknown'}" was not found.`); return; }
          const { id: _id, brand_id: _bid, ...branchFields } = entry.data;
          const res = await fetch(`${process.env.REACT_APP_API_URL}/branches`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: branchFields.name,
              region: branchFields.region || null,
              manager: branchFields.manager || null,
              contact: branchFields.contact || null,
              address: branchFields.address || null,
              concept: branchFields.concept || null,
              brand_id: parentBrand.id,
              performed_by: user?.name || "System",
              role: user?.role || "Unknown",
              latitude: coords?.latitude,
              longitude: coords?.longitude,
              restored: true,
            }),
          });
          const data = await res.json();
          if (data.success) {
            await fetch(`${process.env.REACT_APP_API_URL}/brand-delete-history/${entry.id}`, { method: 'DELETE' });
            await fetchBrands();
            await fetchDeleteHistory();
            await fetchActivityLog();
            showSuccess("Branch restored", `"${branchFields.name}" has been restored.`);
          } else showError("Failed to restore branch", data.error || "Something went wrong.");
        }
      } catch (err) {
        console.error("Restore error:", err);
        showError("Failed to restore", err.message || "Something went wrong. Please try again.");
      } finally {
        setRestoringId(null);
      }
    };

    const totalBranches = brands.reduce((s, b) => s + (b.branches?.length || 0), 0);
    const allRegions    = [...new Set(brands.flatMap((b) => b.branches?.map((br) => br.region) || []).filter(Boolean))];
    const filteredBrands = brands.map((brand) => {
    const brandNameMatches = searchQuery && brand.name.toLowerCase().includes(searchQuery.toLowerCase());
    return {
      ...brand,
      branches: (brand.branches || []).filter((br) =>
        (!searchQuery || brandNameMatches || br.name.toLowerCase().includes(searchQuery.toLowerCase()) || (br.manager || "").toLowerCase().includes(searchQuery.toLowerCase())) &&
        (filterRegion === "all" || br.region === filterRegion)
      ),
    };
  }).filter((brand) => {
    if (filterBrand !== "all" && String(brand.id) !== String(filterBrand)) return false;
    if (filterRegion === "all" && searchQuery && !brand.name.toLowerCase().includes(searchQuery.toLowerCase()) && brand.branches.length === 0) return false;
    if (filterRegion !== "all" && brand.branches.length === 0) return false;
    return true;
  });

    const ConceptBadge = ({ concept }) => {
      const styles = { "Full Store": { bg: "rgba(16,185,129,0.1)", color: "#059669" }, "Kiosk": { bg: "rgba(59,130,246,0.1)", color: "#2563eb" } };
      const s = styles[concept] || { bg: "rgba(156,163,175,0.1)", color: "#6b7280" };
      return <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{concept || "—"}</span>;
    };

    const thSt = { padding: "9px 12px", textAlign: "left", fontWeight: 800, fontSize: 10.5, color: "#00897b", letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: "2px solid #d1eedd", background: "#f8fffe", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
    const tdSt = { padding: "11px 12px", borderBottom: "1px solid #f0f8f0", verticalAlign: "middle", overflow: "hidden" };

    return (
      <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
        <style>{`.bm-root * { font-family:'Montserrat',sans-serif !important; box-sizing:border-box; } .bm-stat { background:#fff; border:1px solid rgba(0,168,76,0.12); border-radius:18px; padding:20px 22px; box-shadow:0 2px 14px rgba(0,140,60,0.07); transition:transform .2s,box-shadow .2s; } .bm-stat:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,140,60,0.13); } .bm-brand-card { background:#fff; border:1px solid rgba(0,168,76,0.12); border-radius:18px; box-shadow:0 2px 14px rgba(0,140,60,0.07); margin-bottom:24px; overflow:hidden; } .bm-brand-header { background:linear-gradient(135deg,#2E7D32,#00897b); color:#fff; padding:16px 22px; display:flex; align-items:center; justify-content:space-between; } .bm-input { width:100%; padding:9px 12px; border-radius:10px; border:1.5px solid #b2dfdb; font-size:13px; color:#0d2b1e; background:#f0fdf5; font-family:inherit; outline:none; } .bm-input:focus { border-color:#00897b; box-shadow:0 0 0 2px rgba(0,137,123,0.12); } .bm-select { width:100%; padding:9px 12px; border-radius:10px; border:1.5px solid #b2dfdb; font-size:13px; color:#0d2b1e; background:#f0fdf5; font-family:inherit; outline:none; appearance:none; cursor:pointer; } .bm-branch-tr:hover td { background:#f6fef8 !important; } .bm-branch-tr:last-child td { border-bottom:none !important; } @keyframes bm-spin { to { transform: rotate(360deg); } }`}</style>
        <div className="bm-root">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
            {[
              { label: "Total Brands",   value: brands.length, icon: <Globe size={20} color="#065f46" />, bg: "linear-gradient(135deg,#d1fae5,#6ee7b7)", sub: "Registered brands" },
              { label: "Total Branches", value: totalBranches, icon: <Store size={20} color="#065f46" />, bg: "linear-gradient(135deg,#d1fae5,#a7f3d0)", sub: "Across all brands" },
            ].map((s, i) => (
              <div key={i} className="bm-stat">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#5a7a65", marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#0d2b1e" }}>{s.value}</div>
                  </div>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#5a7a65" }}>{s.sub}</span>
              </div>
            ))}
          </div>

          <div style={{ background:"#fff", border:"1px solid rgba(0,168,76,0.13)", borderRadius:16, padding:"14px 18px", marginBottom:18, boxShadow:"0 1px 8px rgba(0,140,60,0.05)" }}>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
              <div style={{ position:"relative" }}>
                <Search size={14} color="#5a7a65" style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)" }}/>
                <input type="text" placeholder="Search brands or branches..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bm-input" style={{ paddingLeft:32, width:260 }}/>
              </div>
              <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="bm-select" style={{ width:180 }}>
                <option value="all">All Brands</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)} className="bm-select" style={{ width:180 }}>
                <option value="all">All Regions</option>
                {allRegions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <div style={{ marginLeft:"auto", display:"flex", gap:10 }}>
                <button onClick={() => setShowHistory(true)} style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 18px", borderRadius:11, border:"1.5px solid #dc2626", background:"#fff", color:"#dc2626", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                  <History size={14}/> Delete History{deletedHistory.length > 0 ? ` (${deletedHistory.length})` : ""}
                </button>
                <button onClick={() => { setBranchForm(emptyBranch); setShowAddBranchModal(true); }} style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 18px", borderRadius:11, border:"1.5px solid #00897b", background:"#fff", color:"#00897b", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                  <Plus size={14}/> Add Branch
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: "48px 0", textAlign: "center", color: "#5a7a65", fontSize: 14, fontWeight: 600 }}>Loading brands & branches...</div>
          ) : filteredBrands.length === 0 ? (
            <div style={{ padding: "48px 0", textAlign: "center", color: "#5a7a65", fontSize: 14, fontWeight: 600 }}>No brands found. Add your first brand above.</div>
          ) : filteredBrands.map((brand) => (
            <div key={brand.id} className="bm-brand-card">
              <div className="bm-brand-header">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><Globe size={20} color="#fff" /></div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{brand.name}</div>
                    <div style={{ fontSize: 12, opacity: 0.8, display: "flex", alignItems: "center", gap: 10, marginTop: 2 }}>
                      {brand.contact_email && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Mail size={11} /> {brand.contact_email}</span>}
                      {brand.contact_phone && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Phone size={11} /> {brand.contact_phone}</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, opacity: 0.85, fontWeight: 600 }}>{brand.branches?.length || 0} {brand.branches?.length === 1 ? "branch" : "branches"}</span>
                  <button onClick={() => { setSelectedBrand(brand); setBrandForm({ name: brand.name, categories: brand.categories || [], contact_email: brand.contact_email, contact_phone: brand.contact_phone, description: brand.description }); setShowEditBrandModal(true); }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 8, border: "1.5px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}><Edit2 size={12} /> Edit Brand</button>
                  <button onClick={() => setDeleteTarget({ type: "brand", id: brand.id, name: brand.name, branchCount: brand.branches?.length || 0 })} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 8, border: "1.5px solid rgba(255,150,150,0.5)", background: "rgba(255,80,80,0.15)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}><Trash2 size={12} /> Delete</button>
                </div>
              </div>
              <div style={{ width: "100%" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, tableLayout: "fixed" }}>
                  <colgroup><col style={{ width: "20%" }} /><col style={{ width: "11%" }} /><col style={{ width: "16%" }} /><col style={{ width: "13%" }} /><col style={{ width: "22%" }} /><col style={{ width: "10%" }} /><col style={{ width: "8%" }} /></colgroup>
                  <thead><tr>{["Branch Name","Region","Manager","Contact","Address","Concept","Actions"].map((h) => <th key={h} style={thSt}>{h}</th>)}</tr></thead>
                  <tbody>
                    {(!brand.branches || brand.branches.length === 0) ? (
                      <tr><td colSpan={7} style={{ padding: "24px 20px", color: "#5a7a65", fontSize: 13, fontStyle: "italic", textAlign: "center", borderBottom: "none" }}>No branches yet.{" "}<span style={{ color: "#00897b", cursor: "pointer", textDecoration: "underline", fontWeight: 700 }} onClick={() => { setBranchForm({ ...emptyBranch, brand_id: brand.id }); setShowAddBranchModal(true); }}>Add the first branch</span></td></tr>
                    ) : brand.branches.map((branch) => (
                      <tr key={branch.id} className="bm-branch-tr">
                        <td style={{ ...tdSt, fontWeight: 700, color: "#0d2b1e", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{branch.name}</td>
                        <td style={{ ...tdSt, color: "#5a7a65", fontSize: 12, whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{branch.region}</td>
                        <td style={{ ...tdSt, color: "#0d2b1e", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{branch.manager || "—"}</td>
                        <td style={{ ...tdSt, color: "#5a7a65", fontSize: 12, whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{branch.contact || "—"}</td>
                        <td style={{ ...tdSt, color: "#5a7a65", fontSize: 12, whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{branch.address || "—"}</td>
                        <td style={tdSt}>{brand.name === "Coffee Spot" ? <ConceptBadge concept={branch.concept} /> : <span style={{ color: "#9ca3af", fontSize: 12 }}>—</span>}</td>
                        <td style={{ ...tdSt, whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                            <button title="Edit branch" onClick={() => { setSelectedBranch(branch); setBranchForm({ name: branch.name, brand_id: brand.id, region: branch.region, manager: branch.manager, contact: branch.contact, address: branch.address, concept: branch.concept || "" }); setShowEditBranchModal(true); }} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid #b2dfdb", background: "#e0f2f1", color: "#00695c", cursor: "pointer", flexShrink: 0 }}><Pencil size={13} /></button>
                            <button title="Delete branch" onClick={() => setDeleteTarget({ type: "branch", id: branch.id, name: branch.name, brandName: brand.name })} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid #fecaca", background: "#fff", color: "#ef4444", cursor: "pointer", flexShrink: 0 }}><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {showAddBrandModal   && <BmModal title="Add New Brand"  onClose={() => setShowAddBrandModal(false)}  onSubmit={handleAddBrand}><BrandFormFields  form={brandForm}  setForm={setBrandForm} /></BmModal>}
        {showEditBrandModal  && <BmModal title="Edit Brand"     onClose={() => { setShowEditBrandModal(false); setSelectedBrand(null); }} onSubmit={handleEditBrand}><BrandFormFields  form={brandForm}  setForm={setBrandForm} /></BmModal>}
        {showAddBranchModal  && <BmModal title="Add New Branch" onClose={() => setShowAddBranchModal(false)} onSubmit={handleAddBranch}><BranchFormFields form={branchForm} setForm={setBranchForm} brands={brands} /></BmModal>}
        {showEditBranchModal && <BmModal title="Edit Branch"    onClose={() => { setShowEditBranchModal(false); setSelectedBranch(null); }} onSubmit={handleEditBranch}><BranchFormFields form={branchForm} setForm={setBranchForm} brands={brands} /></BmModal>}

        <BrandDeleteConfirmModal
          target={deleteTarget}
          deleting={deleting}
          onConfirm={deleteTarget?.type === "brand" ? handleDeleteBrand : handleDeleteBranch}
          onClose={() => { if (!deleting) setDeleteTarget(null); }}
        />

        {showHistory && (
          <BrandDeleteHistoryPanel
            history={deletedHistory}
            onRestore={handleRestore}
            restoringId={restoringId}
            onClose={() => setShowHistory(false)}
          />
        )}

        <Toast toast={alertModal} onClose={() => setAlertModal(null)} />
      </div>
    );
  }

  function FranchiseeInventoryContent({ user, brands: propBrands = [] }) {
    const [ingredients, setIngredients] = useState([]);
    const [batchesByIngredient, setBatchesByIngredient] = useState({});
    const [loading, setLoading] = useState(true);
    const [batchLoadingId, setBatchLoadingId] = useState(null);
    const [activeBrand, setActiveBrand] = useState(null);
    const [activeBranch, setActiveBranch] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [search, setSearch] = useState("");

    const apiUrl = process.env.REACT_APP_API_URL;

    const fetchIngredients = useCallback(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/ingredients`);
        const data = await res.json();
        setIngredients(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch franchisee inventory:", err);
        setIngredients([]);
      } finally {
        setLoading(false);
      }
    }, [apiUrl]);

    useEffect(() => { fetchIngredients(); }, [fetchIngredients]);

    const branchNamesFor = useCallback((brandName) => {
      const brandObj = propBrands.find(b => normalize(b.name) === normalize(brandName));
      if (!brandObj) {
        return [...new Set(ingredients.filter(i => normalize(i.brand) === normalize(brandName)).map(i => i.branch).filter(Boolean))];
      }
      return (brandObj.branches || []).map(br => typeof br === "string" ? br : br.name).filter(Boolean);
    }, [propBrands, ingredients]);

    const availableBrands = useMemo(() => {
      const fromProps = propBrands.map(b => b.name).filter(Boolean);
      const fromItems = ingredients.map(i => i.brand).filter(Boolean);
      return [...new Set([...fromProps, ...fromItems])];
    }, [propBrands, ingredients]);

    const itemsForBrand = useCallback((brandName) =>
      ingredients.filter(i => normalize(i.brand) === normalize(brandName)), [ingredients]);

    const activeBrandItems = useMemo(() => {
      if (!activeBrand) return [];
      const q = search.trim().toLowerCase();
      return itemsForBrand(activeBrand).filter(item => {
        if (activeBranch && item.branch !== activeBranch) return false;
        if (q && !String(item.name || "").toLowerCase().includes(q) && !String(item.branch || "").toLowerCase().includes(q)) return false;
        return true;
      });
    }, [activeBrand, activeBranch, search, itemsForBrand]);

    const loadBatches = useCallback(async (ingredient, force = false) => {
      if (!ingredient?.id) return;
      setSelectedProduct(ingredient);
      if (!force && batchesByIngredient[ingredient.id]) return;
      setBatchLoadingId(ingredient.id);
      try {
        const res = await fetch(`${apiUrl}/ingredient-batches?ingredient_id=${ingredient.id}`);
        const data = await res.json();
        const active = (Array.isArray(data) ? data : []).filter(b => Number(b.stock || 0) > 0);
        const sorted = sortBatchesByMethod(active, ingredient.brand, ingredient.perishable);
        setBatchesByIngredient(prev => ({ ...prev, [ingredient.id]: sorted }));
      } catch (err) {
        console.error("Failed to load FIFO/FEFO batches:", err);
        setBatchesByIngredient(prev => ({ ...prev, [ingredient.id]: [] }));
      } finally {
        setBatchLoadingId(null);
      }
    }, [apiUrl, batchesByIngredient]);

    useEffect(() => {
      if (!activeBrand) return;
      if (selectedProduct && normalize(selectedProduct.brand) !== normalize(activeBrand)) setSelectedProduct(null);
    }, [activeBrand, selectedProduct]);

    useEffect(() => {
      if (!selectedProduct) return;
      const stillVisible = activeBrandItems.some(i => String(i.id) === String(selectedProduct.id));
      if (!stillVisible) setSelectedProduct(null);
    }, [activeBrandItems, selectedProduct]);

    const totalStock = (item) => Number(item?.stock || 0);
    const isLow = (item) => Number(item?.stock || 0) <= Number(item?.min_stock || 0);
    const money = (n) => `₱${Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits:2, maximumFractionDigits:2 })}`;
    const dateOnly = (d) => d ? new Date(d).toLocaleDateString("en-PH", { month:"short", day:"numeric", year:"numeric", timeZone:"Asia/Manila" }) : "—";

    const brandStats = (brandName) => {
      const rows = itemsForBrand(brandName);
      return {
        products: rows.length,
        stock: rows.reduce((s, i) => s + Number(i.stock || 0), 0),
        low: rows.filter(isLow).length,
        branches: new Set(rows.map(i => i.branch).filter(Boolean)).size,
      };
    };

    return (
      <div style={{ fontFamily:"'Montserrat', sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
          @keyframes spin { to { transform: rotate(360deg); } }
          .fr-brand-card { transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
          .fr-brand-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(50,109,32,.12) !important; border-color: #c9dba0 !important; }
          .fr-product-row { transition: background .12s ease, border-color .12s ea se; }
          .fr-product-row:hover { background:#f8faf5 !important; }
        `}</style>

        {!activeBrand ? (
          <>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, marginBottom:18 }}>
              <div>
                
                <div style={{ fontSize:12, fontWeight: 800, color:C.muted, marginTop:3 }}>Select a brand to view branch stock and its FIFO / FEFO consumption queue.</div>
              </div>
              <button onClick={fetchIngredients} style={{ ...smallBtnSt, height:36, padding:"0 14px", border:`1px solid ${C.border}`, background:C.white, color:C.green }}>
                <RefreshCw size={13} style={loading ? { animation:"spin .8s linear infinite" } : undefined}/> Refresh
              </button>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(235px, 1fr))", gap:16 }}>
              {availableBrands.map(brandName => {
                const st = brandStats(brandName);
                return (
                  <button key={brandName} className="fr-brand-card" onClick={() => { setActiveBrand(brandName); setActiveBranch(""); setSelectedProduct(null); setSearch(""); }}
                    style={{ textAlign:"left", background:C.white, border:`1px solid ${C.border}`, borderRadius:18, padding:0, overflow:"hidden", boxShadow:"0 2px 10px rgba(50,109,32,.05)", cursor:"pointer", fontFamily:"inherit" }}>
                    <div style={{ height:5, background:"linear-gradient(90deg,#bdd43c,#3b791e)" }}/>
                    <div style={{ padding:"18px 18px 16px" }}>
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontSize:15, fontWeight:800, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{brandName}</div>
                          <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>{st.branches} branch{st.branches===1?"":"es"}</div>
                        </div>
                        <div style={{ width:40, height:40, borderRadius:12, background:"#F6F7F1", display:"flex", alignItems:"center", justifyContent:"center", color:C.green }}>
                          <Building2 size={19}/>
                        </div>
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginTop:18 }}>
                        <div><div style={{ fontSize:10, color:C.muted, fontWeight:700, textTransform:"uppercase" }}>Products</div><div style={{ fontSize:18, fontWeight:800, color:C.ink, marginTop:3 }}>{st.products}</div></div>
                        <div><div style={{ fontSize:10, color:C.muted, fontWeight:700, textTransform:"uppercase" }}>Stock</div><div style={{ fontSize:18, fontWeight:800, color:C.ink, marginTop:3 }}>{st.stock}</div></div>
                        <div><div style={{ fontSize:10, color:C.muted, fontWeight:700, textTransform:"uppercase" }}>Low</div><div style={{ fontSize:18, fontWeight:800, color:st.low?C.red:C.green, marginTop:3 }}>{st.low}</div></div>
                      </div>
                    </div>
                  </button>
                );
              })}
              {!loading && availableBrands.length === 0 && (
                <div style={{ gridColumn:"1/-1", background:C.white, border:`1px solid ${C.border}`, borderRadius:18, padding:"50px 20px", textAlign:"center", color:C.muted }}>No franchisee inventory brands found.</div>
              )}
            </div>
          </>
        ) : (
          <>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, marginBottom:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                <button onClick={() => { setActiveBrand(null); setActiveBranch(""); setSelectedProduct(null); }} style={{ ...smallBtnSt, height:34, width:34, padding:0, justifyContent:"center", border:`1px solid ${C.border}`, background:C.white, color:C.greenDk }}>←</button>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:17, fontWeight:800, color:C.ink, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{activeBrand}</div>
                  <div style={{ fontSize:11.5, color:C.muted, marginTop:2 }}>Franchisee Inventory · FIFO / FEFO batch consumption</div>
                </div>
              </div>
              <button onClick={() => { fetchIngredients(); if (selectedProduct) loadBatches(selectedProduct, true); }} style={{ ...smallBtnSt, height:34, padding:"0 13px", border:`1px solid ${C.border}`, background:C.white, color:C.green }}>
                <RefreshCw size={12} style={loading || batchLoadingId ? { animation:"spin .8s linear infinite" } : undefined}/> Refresh
              </button>
            </div>

            <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:"12px 14px", marginBottom:14, display:"flex", gap:9, alignItems:"center", flexWrap:"wrap", boxShadow:"0 2px 8px rgba(50,109,32,.04)" }}>
              <div style={{ position:"relative", flex:"1 1 230px" }}>
                <Search size={13} color={C.muted} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)" }}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search product or branch…" style={{ ...invInputSt, height:36, paddingLeft:30 }}/>
              </div>
              <select value={activeBranch} onChange={e=>{ setActiveBranch(e.target.value); setSelectedProduct(null); }} style={{ ...invInputSt, width:220, height:36, cursor:"pointer" }}>
                <option value="">All Branches</option>
                {branchNamesFor(activeBrand).map(br => <option key={br} value={br}>{br}</option>)}
              </select>
              {(activeBranch || search) && <button onClick={()=>{setActiveBranch("");setSearch("");setSelectedProduct(null);}} style={{ ...smallBtnSt, height:36, border:`1px solid ${C.border}`, background:C.white, color:C.muted }}>Clear Filters</button>}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"minmax(360px, .95fr) minmax(430px, 1.25fr)", gap:14, alignItems:"stretch" }}>
              <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:18, overflow:"hidden", boxShadow:"0 2px 10px rgba(50,109,32,.05)", minHeight:520 }}>
                <div style={{ padding:"14px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:"#fbfcf8" }}>
                  <div>
                    <div style={{ fontSize:13.5, fontWeight:800, color:C.ink }}>Products</div>
                    <div style={{ fontSize:10.5, color:C.muted, marginTop:2 }}>Choose a product to inspect its queue</div>
                  </div>
                  <span style={{ fontSize:10.5, fontWeight:800, color:C.greenDk, background:"#f0f5e8", border:`1px solid ${C.greenMid}`, borderRadius:20, padding:"3px 9px" }}>{activeBrandItems.length}</span>
                </div>

                <div style={{ maxHeight:620, overflowY:"auto" }}>
                  {loading ? (
                    <div style={{ padding:"50px 20px", textAlign:"center", color:C.muted }}>Loading products…</div>
                  ) : activeBrandItems.length === 0 ? (
                    <div style={{ padding:"50px 20px", textAlign:"center", color:C.muted }}>No products match the selected filters.</div>
                  ) : activeBrandItems.map(item => {
                    const active = String(selectedProduct?.id) === String(item.id);
                    const fifo = getFifoMethod(item.brand, item.perishable);
                    return (
                      <div key={item.id} className="fr-product-row" role="button" onClick={()=>loadBatches(item)}
                        style={{ padding:"13px 15px", borderBottom:`1px solid ${C.bg}`, cursor:"pointer", background:active?"#f6f8ef":C.white, borderLeft:active?`3px solid ${C.lime}`:"3px solid transparent" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", gap:12, alignItems:"flex-start" }}>
                          <div style={{ minWidth:0, flex:1 }}>
                            <div style={{ fontSize:13, fontWeight:800, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</div>
                            <div style={{ fontSize:10.5, color:C.muted, marginTop:3, display:"flex", gap:8, flexWrap:"wrap" }}>
                              <span>{item.branch || "—"}</span><span>·</span><span>Min {item.min_stock ?? 0}</span><span>·</span><span>{money(item.cost_per_unit)}</span>
                            </div>
                          </div>
                          <div style={{ textAlign:"right", flexShrink:0 }}>
                            <div style={{ fontSize:14, fontWeight:800, color:isLow(item)?C.red:C.greenDk }}>{totalStock(item)} <span style={{ fontSize:10, fontWeight:600, color:C.muted }}>{item.unit}</span></div>
                            <span style={{ display:"inline-block", marginTop:5, padding:"2px 7px", borderRadius:20, fontSize:9.5, fontWeight:800, background:fifo.method==="FEFO"?"#fff7ed":"#f0f5e8", color:fifo.method==="FEFO"?"#9a3412":C.greenDk, border:`1px solid ${fifo.method==="FEFO"?"#fed7aa":C.greenMid}` }}>{fifo.method}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:18, overflow:"hidden", boxShadow:"0 2px 10px rgba(50,109,32,.05)", minHeight:520 }}>
                {!selectedProduct ? (
                  <div style={{ height:"100%", minHeight:520, display:"flex", alignItems:"center", justifyContent:"center", textAlign:"center", padding:30, color:C.muted }}>
                    <div>
                      <div style={{ width:52, height:52, borderRadius:16, background:"#F6F7F1", margin:"0 auto 12px", display:"flex", alignItems:"center", justifyContent:"center", color:C.green }}><Package size={23}/></div>
                      <div style={{ fontSize:13.5, fontWeight:800, color:C.ink }}>Select a product</div>
                      <div style={{ fontSize:11.5, marginTop:5, lineHeight:1.5 }}>Choose a product on the left to view its FIFO or FEFO batch consumption queue.</div>
                    </div>
                  </div>
                ) : (() => {
                  const fifo = getFifoMethod(selectedProduct.brand, selectedProduct.perishable);
                  const batches = batchesByIngredient[selectedProduct.id] || [];
                  const totalBatchStock = batches.reduce((s,b)=>s+Number(b.stock||0),0);
                  const isLoadingBatches = batchLoadingId === selectedProduct.id;
                  return (
                    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
                      <div style={{ padding:"15px 17px", borderBottom:`1px solid ${C.border}`, background:"#fbfcf8" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                          <div style={{ minWidth:0 }}>
                            <div style={{ fontSize:14, fontWeight:800, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{selectedProduct.name}</div>
                            <div style={{ fontSize:10.5, color:C.muted, marginTop:3 }}>{selectedProduct.branch || "—"} · {totalBatchStock} {selectedProduct.unit} · {batches.length} active batch{batches.length===1?"":"es"}</div>
                          </div>
                          <button onClick={()=>loadBatches(selectedProduct, true)} style={{ ...smallBtnSt, height:30, padding:"0 10px", border:`1px solid ${C.border}`, background:C.white, color:C.green }}><RefreshCw size={11} style={isLoadingBatches?{animation:"spin .8s linear infinite"}:undefined}/></button>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 10px", borderRadius:8, background:fifo.method==="FEFO"?"#fffbeb":"#f0f5e8", border:`1px solid ${fifo.method==="FEFO"?"#fde68a":C.greenMid}`, fontSize:10.5, color:fifo.method==="FEFO"?"#9a3412":C.greenDk, fontWeight:700, marginTop:11 }}>
                          <span>{fifo.method} QUEUE</span><span style={{ fontWeight:500, opacity:.85 }}>— {fifo.queueLabel}</span>
                        </div>
                      </div>

                      <div style={{ padding:"0 16px 16px", overflowY:"auto", flex:1 }}>
                        {isLoadingBatches ? (
                          <div style={{ textAlign:"center", padding:"42px 0", color:C.muted }}><RefreshCw size={18} style={{animation:"spin .8s linear infinite"}}/><div style={{fontSize:11.5,marginTop:8}}>Loading queue…</div></div>
                        ) : batches.length === 0 ? (
                          <div style={{ textAlign:"center", padding:"48px 20px", color:C.muted, fontSize:12 }}>No active batches recorded for this product.</div>
                        ) : batches.map((batch, index) => {
                          const nextOut = index === 0;
                          const keyDate = fifo.method === "FEFO" ? batch.exp_date : (batch.supply_date || batch.mfg_date || batch.created_at);
                          return (
                            <div key={batch.id || index} style={{ padding:"13px 2px", borderBottom:`1px solid ${nextOut?C.greenMid:C.border}` }}>
                              <div style={{ display:"grid", gridTemplateColumns:"42px 1.1fr .9fr .7fr", gap:10, alignItems:"center" }}>
                                <div style={{ width:30, height:30, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", background:nextOut?C.ink:"#F6F7F1", color:nextOut?C.lime:C.muted, fontSize:11, fontWeight:800 }}>{index+1}</div>
                                <div style={{ minWidth:0 }}>
                                  <div style={{ fontSize:11.5, fontWeight:800, color:C.ink }}>Batch {batch.batch_number || batch.lot_number || `#${index+1}`}</div>
                                  <div style={{ fontSize:10.5, color:C.muted, marginTop:2 }}>{fifo.method === "FEFO" ? "Expiry" : "Received"}: {dateOnly(keyDate)}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize:9.5, color:C.muted, fontWeight:700, textTransform:"uppercase" }}>Remaining</div>
                                  <div style={{ fontSize:12.5, fontWeight:800, color:C.ink, marginTop:2 }}>{Number(batch.stock||0)} {selectedProduct.unit}</div>
                                </div>
                                <div style={{ textAlign:"right" }}>
                                  {nextOut ? <span style={{ display:"inline-block", padding:"4px 8px", borderRadius:20, background:"#f0f5e8", border:`1px solid ${C.greenMid}`, color:C.greenDk, fontSize:9.5, fontWeight:900 }}>NEXT OUT</span> : <span style={{ fontSize:10.5, color:C.muted }}>Queued</span>}
                                </div>
                              </div>
                              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginTop:10, paddingLeft:42 }}>
                                <div><div style={{fontSize:9,color:C.muted,textTransform:"uppercase",fontWeight:700}}>Cost / Unit</div><div style={{fontSize:11.5,fontWeight:700,color:C.ink,marginTop:2}}>{money(batch.cost_per_unit)}</div></div>
                                <div><div style={{fontSize:9,color:C.muted,textTransform:"uppercase",fontWeight:700}}>Supplier</div><div style={{fontSize:11.5,fontWeight:700,color:C.ink,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{batch.supplier || "—"}</div></div>
                                <div><div style={{fontSize:9,color:C.muted,textTransform:"uppercase",fontWeight:700}}>{fifo.method==="FEFO"?"Expiry":"Supply Date"}</div><div style={{fontSize:11.5,fontWeight:700,color:C.ink,marginTop:2}}>{dateOnly(keyDate)}</div></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  function ShopDeleteHistoryPanel({ history, restoringId, onRestore, onClose }) {
    return (
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:20, backdropFilter:"blur(4px)" }}>
        <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:18, padding:"28px 32px", width:"100%", maxWidth:680, maxHeight:"80vh", display:"flex", flexDirection:"column", boxShadow:"0 24px 64px rgba(0,0,0,0.18)", border:"1px solid rgba(0,168,76,0.15)", fontFamily:"Montserrat,sans-serif" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <h2 style={{ fontSize:16, fontWeight:800, color:C.ink, margin:0 }}>Delete History</h2>
              {history.length > 0 && (
                <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:"#fee2e2", color:"#e53935" }}>{history.length} deleted</span>
              )}
            </div>
            <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:`1px solid ${C.border}`, background:"#e0f2f1", cursor:"pointer", color:C.green, display:"flex", alignItems:"center", justifyContent:"center" }}>
              ✕
            </button>
          </div>
          {history.length > 0 && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 100px 90px 110px 100px", gap:8, padding:"6px 0 10px", borderBottom:"2px solid #e0f2f1", fontSize:10, fontWeight:700, color:"#5a7a65", textTransform:"uppercase", letterSpacing:"0.06em" }}>
              <span>Item</span><span>Shop</span><span>Price</span><span>Deleted At</span><span></span>
            </div>
          )}
          <div style={{ overflowY:"auto", flex:1 }}>
            {history.length === 0 ? (
              <div style={{ padding:"40px 0", textAlign:"center", color:"#9ca3af", fontSize:13, fontStyle:"italic" }}>No deleted items yet.</div>
            ) : history.map((entry, i) => {
              const d = entry.data || {};
              return (
                <div key={entry.id} style={{ display:"grid", gridTemplateColumns:"1fr 100px 90px 110px 100px", gap:8, alignItems:"center", padding:"12px 0", borderBottom: i < history.length-1 ? "1px solid #f0f8f0" : "none" }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.name}</div>
                    <div style={{ fontSize:11, color:"#5a7a65", marginTop:2 }}>{d.brand || "—"}</div>
                  </div>
                  <div style={{ fontSize:12, color:"#5a7a65" }}>{d.shop}</div>
                  <div style={{ fontSize:12, color:C.green, fontWeight:700 }}>{fmtPeso(d.price || 0)}</div>
                  <div style={{ fontSize:11, color:"#9ca3af" }}>{entry.deletedAt ? new Date(entry.deletedAt).toLocaleString("en-PH", { month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit", timeZone:"Asia/Manila" }) : "—"}</div>
                  <button onClick={() => onRestore(entry)} disabled={restoringId !== null}
                    style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:8, border:"1.5px solid #00897b", background:"#e0f2f1", color:"#00695c", fontSize:12, fontWeight:700, cursor: restoringId !== null ? "not-allowed" : "pointer", fontFamily:"inherit", whiteSpace:"nowrap", opacity: restoringId !== null ? (restoringId === entry.id ? 0.85 : 0.4) : 1 }}>
                    {restoringId === entry.id ? "Restoring…" : "Restore"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  function ShopDeleteConfirmModal({ item, deleting, onConfirm, onCancel }) {
    if (!item) return null;
    return (
      <div onClick={onCancel} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2500, padding:20, backdropFilter:"blur(4px)" }}>
        <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:16, width:"100%", maxWidth:420, boxShadow:"0 24px 64px rgba(0,0,0,0.16)", border:"1px solid #fecaca", fontFamily:"Montserrat,sans-serif", overflow:"hidden" }}>
          <div style={{ background:"#fef2f2", padding:"20px 24px 16px", borderBottom:"1px solid #fecaca" }}>
            <div style={{ fontSize:15, fontWeight:800, color:"#991b1b", marginBottom:5 }}>Delete Item</div>
            <div style={{ fontSize:13, color:C.ink, lineHeight:1.6 }}>
              Are you sure you want to delete <strong>"{item.name}"</strong>?
            </div>
            <div style={{ marginTop:8, background:"#fff5f5", border:"1px solid #fecaca", borderRadius:8, padding:"8px 12px", fontSize:12, color:"#7f1d1d" }}>
              This will move the item to Delete History where it can be restored.
            </div>
          </div>
          <div style={{ padding:"12px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", gap:20 }}>
            <div style={{ fontSize:12 }}>
              <div style={{ color:C.muted, fontSize:10, fontWeight:700, textTransform:"uppercase", marginBottom:3 }}>Shop</div>
              <div style={{ fontWeight:700, color:C.ink }}>{item.shop}</div>
            </div>
            <div style={{ fontSize:12 }}>
              <div style={{ color:C.muted, fontSize:10, fontWeight:700, textTransform:"uppercase", marginBottom:3 }}>Price</div>
              <div style={{ fontWeight:700, color:C.ink }}>{fmtPeso(item.price)}</div>
            </div>
            <div style={{ fontSize:12 }}>
              <div style={{ color:C.muted, fontSize:10, fontWeight:700, textTransform:"uppercase", marginBottom:3 }}>Stock</div>
              <div style={{ fontWeight:700, color:C.ink }}>{item.stock ?? 0}</div>
            </div>
          </div>
          <div style={{ padding:"14px 24px", display:"flex", justifyContent:"flex-end", gap:8 }}>
            <button onClick={onCancel} disabled={deleting} style={{ padding:"8px 16px", borderRadius:8, border:`1px solid ${C.border}`, background:C.white, color:C.muted, fontWeight:700, fontSize:13, cursor: deleting ? "not-allowed" : "pointer", fontFamily:"inherit", opacity: deleting ? 0.5 : 1 }}>
              Cancel
            </button>
            <button onClick={onConfirm} disabled={deleting}
              style={{ padding:"8px 18px", borderRadius:8, border:"none", background:"#e53935", color:"#fff", fontWeight:700, fontSize:13, cursor: deleting ? "not-allowed" : "pointer", fontFamily:"inherit", opacity: deleting ? 0.7 : 1 }}>
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function ImportLoadingModal({ visible, progress }) {
    if (!visible) return null;
    return (
      <div style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:3500, padding:20, backdropFilter:"blur(6px)" }}>
        <div style={{ background:C.white, borderRadius:18, padding:"32px 36px", width:"100%", maxWidth:380, boxShadow:"0 28px 70px rgba(0,0,0,0.22)", border:"1px solid #c8e6c9", fontFamily:"Montserrat,sans-serif", textAlign:"center" }}>
          <div style={{ fontSize:16, fontWeight:800, color:C.ink, marginBottom:6 }}>Importing Excel</div>
          <div style={{ fontSize:13, color:C.muted, marginBottom:20 }}>Please wait while your data is being processed…</div>
          <div style={{ background:"#e8f5e9", borderRadius:999, height:6, overflow:"hidden", marginBottom:12 }}>
            <div style={{ background:`linear-gradient(90deg,${C.teal},${C.green})`, borderRadius:999, height:"100%", width:`${progress.percent}%`, transition:"width 0.4s ease" }}/>
          </div>
          <div style={{ fontSize:12, color:C.muted, fontWeight:600, marginBottom:6 }}>{progress.label}</div>
          {progress.current > 0 && (
            <div style={{ fontSize:11, color:C.muted, opacity:0.7 }}>{progress.current} / {progress.total} rows processed</div>
          )}
          <div style={{ marginTop:18, fontSize:12, fontWeight:700, color:C.green }}>Do not close this window</div>
        </div>
      </div>
    );
  }

  function UIModal({ modal, onClose, onConfirm }) {
    if (!modal) return null;
    const { type, title, message, confirmLabel, cancelLabel } = modal;
    const hc = {
      error:   { bg:"#fef2f2", border:"#fecaca", titleColor:"#991b1b" },
      success: { bg:"#e8f5e9", border:"#c8e6c9", titleColor:"#00695c" },
      info:    { bg:"#eff6ff", border:"#bfdbfe", titleColor:"#1e3a8a" },
      confirm: { bg:"#fef2f2", border:"#fecaca", titleColor:"#991b1b" },
    }[type] || { bg:"#eff6ff", border:"#bfdbfe", titleColor:"#1e3a8a" };

    return (
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:3000, padding:20, backdropFilter:"blur(4px)" }}>
        <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:16, width:"100%", maxWidth:420, boxShadow:"0 24px 64px rgba(0,0,0,0.16)", border:`1px solid ${hc.border}`, fontFamily:"Montserrat,sans-serif", overflow:"hidden" }}>
          <div style={{ background:hc.bg, padding:"20px 24px 16px", borderBottom:`1px solid ${hc.border}` }}>
            <div style={{ fontSize:15, fontWeight:800, color:hc.titleColor, marginBottom:4 }}>{title}</div>
            {message && <div style={{ fontSize:13, color:C.ink, lineHeight:1.6, opacity:0.85 }}>{message}</div>}
          </div>
          <div style={{ padding:"14px 24px", display:"flex", justifyContent:"flex-end", gap:8 }}>
            {type === "confirm" && (
              <button onClick={onClose} style={{ padding:"8px 16px", borderRadius:8, border:`1px solid ${C.border}`, background:C.white, color:C.muted, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                {cancelLabel || "Cancel"}
              </button>
            )}
            <button
              onClick={type === "confirm" ? onConfirm : onClose}
              style={{
                padding:"8px 18px", borderRadius:8, border:"none",
                background: type === "confirm" ? "#e53935" : `linear-gradient(135deg,${C.teal},${C.green})`,
                color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit",
              }}
            >
              {confirmLabel || "OK"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function Field({ label, error, children }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: "#2c3e50" }}>
          {label}
        </label>
        {children}
        {error && (
          <span style={{ fontSize: 12, color: "#e53935", fontWeight: 600 }}>
            {error}
          </span>
        )}
      </div>
    );
  }

  function UnlistBlockedModal({ item, onClose, onHideInstead }) {
    if (!item) return null;
    return (
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)", zIndex: 1150, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(3px)", animation: "fadeIn .15s ease" }}>
        <div onClick={(e) => e.stopPropagation()} className="msc-modal-card" style={{ background: C.white, borderRadius: 18, width: "100%", maxWidth: 420, boxShadow: "0 24px 70px rgba(0,0,0,0.28)", overflow: "hidden" }}>
          <div style={{ padding: "24px 24px 18px", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fff3e0", color: "#e65100", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <AlertIcon />
            </div>
            <div style={{ fontSize: 15.5, fontWeight: 900, color: C.ink, marginBottom: 6 }}>Can't Unlist This Item</div>
            <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
              <strong style={{ color: C.ink }}>{item.name}</strong> is linked to past orders and can't be removed from the Mobile Shop. Hide it instead — that keeps order history intact while taking it off the customer-facing shop.
            </div>
          </div>
          <div style={{ padding: "0 24px 22px", display: "flex", gap: 8 }}>
            <button onClick={onClose} className="msc-btn"
              style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, color: C.ink, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              Close
            </button>
            <button onClick={() => onHideInstead(item)} className="msc-btn"
              style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${C.teal},${C.green})`, color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(0,180,90,0.3)" }}>
              Hide Instead
            </button>
          </div>
        </div>
      </div>
    );
  }


  const normalize = (str) => (str || "").trim().toLowerCase();
  const MARKUP = 1.10; // shop price = stock cost + 10%

  /* ── tiny inline icons (no external deps beyond lucide's core set) ── */

  const EditIcon   = ({ size = 12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
  const EyeIcon    = ({ size = 12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
  const EyeOffIcon = ({ size = 12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.3 20.3 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a20.3 20.3 0 0 1-3.22 4.44" /><path d="M1 1l22 22" /><path d="M9.53 9.53a3 3 0 0 0 4.24 4.24" /></svg>;
  const BoxIcon    = ({ size = 28 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>;
  const CheckCircleIcon = ({ size = 13 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
  const AlertIcon  = ({ size = 22 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
  const TagIcon    = ({ size = 12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41 13.42 20.6a2 2 0 0 1-2.83 0L2.41 12.42A2 2 0 0 1 2 11V4a2 2 0 0 1 2-2h7a2 2 0 0 1 1.41.59l8.18 8.18a2 2 0 0 1 0 2.83Z" /><circle cx="7" cy="7" r="1" /></svg>;
  const ListIcon   = ({ size = 13 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>;
  const LayersIcon = ({ size = 13 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>;

  /* ── shared style atoms (mirrors Stock Inventory's system) ── */
  const msInputStyle = {
    width: "100%", height: 38, padding: "0 12px", borderRadius: 9,
    border: `1px solid ${C.border}`, marginTop: "0.3rem", fontSize: "0.85rem",
    color: C.ink, background: C.white, outline: "none", boxSizing: "border-box",
    fontFamily: "'Montserrat', sans-serif", transition: "border-color .15s, box-shadow .15s",
  };
  const readOnlyFieldStyle = {
    width: "100%", minHeight: 38, padding: "9px 12px", borderRadius: 9,
    border: `1px solid ${C.border}`, marginTop: "0.3rem", fontSize: "0.85rem",
    color: C.muted, background: "#f5f5f5", boxSizing: "border-box",
    fontFamily: "'Montserrat', sans-serif", fontWeight: 700, display: "flex", alignItems: "center",
  };
  const toolbarBtnSt = {
    display: "inline-flex", alignItems: "center", gap: 6,
    height: 38, padding: "0 16px", borderRadius: 9,
    fontSize: 13, fontWeight: 700, cursor: "pointer",
    fontFamily: "inherit", whiteSpace: "nowrap", border: "none",
  };

  const getBrowserLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
        () => resolve(null),
        { timeout: 5000, maximumAge: 60000 }
      );
    });
  };

  const computePrice = (cost) => (cost > 0 ? Math.round(cost * MARKUP * 100) / 100 : 0);
  const keyFor = (item) => (item.id != null ? `id-${item.id}` : `new-${normalize(item.brand)}-${normalize(item.name)}`);

  const placeholderImageFor = (name) =>
    `https://placehold.co/150x150/e8f5e9/2e7d32?text=${encodeURIComponent((name || "").slice(0, 8))}`;


  function MobileShopContent({ user, brands: propBrands = [] }) {
    const [activityLog,     setActivityLog]     = useState([]);
    const [shopItems,       setShopItems]       = useState([]); // listing overrides keyed to a stock product
    const [itemsLoading,    setItemsLoading]    = useState(true);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null); // item pending unlist confirmation (modal)
    const [deleteLoading,   setDeleteLoading]   = useState(false);
    const [editingItem,     setEditingItem]     = useState(null);
    const [editErrors,      setEditErrors]      = useState({});
    const [editLoading,     setEditLoading]     = useState(false);
    const [searchQuery,     setSearchQuery]     = useState("");
    const [filterShop,      setFilterShop]      = useState("all");
    const [stockItems,      setStockItems]      = useState([]);
    const [toast,           setToast]           = useState(null);
    const [selectedKeys,    setSelectedKeys]    = useState(() => new Set()); // multi-select for bulk listing
    const [bulkListing,     setBulkListing]     = useState(false);
    const [currentPage,     setCurrentPage]     = useState(1);

    const ITEMS_PER_PAGE = 10;
    const UNITS = ["pcs","kg","g","liters","ml","tbsp","tsp","cups","bottles","packs","bags","boxes","cans","gallons"];

  const computeDisplayPrice = (cost, unit) => {
    const bulkQty =
      ['g', 'ml'].includes(unit) ? 1000 :
      unit === 'L' ? 200 :
      unit === 'kg' ? 50 :
      unit === 'pc' ? 50 :
      1;
    return Math.round(Number(cost || 0) * bulkQty * 1.12 * 100) / 100;
  };

  const bulkLabelFor = (unit) => {
    if (unit === 'g') return 'kg';
    if (unit === 'ml') return 'L';
    if (unit === 'L') return 'drum (200L)';
    if (unit === 'kg') return 'cylinder (50kg)';
    if (unit === 'pc') return 'pack (50pcs)';
    return unit;
  };

  const markupLabelFor = () => '+ 12%';

    const fetchActivityLog = useCallback(async () => {
      try {
        const res  = await fetch(`${process.env.REACT_APP_API_URL}/shop-activity-log`);
        const data = await res.json();
        setActivityLog(Array.isArray(data) ? data.map(row => ({
          id: row.id, action: row.action,
          itemName: row.item_name ?? row.itemName,
          shop: row.shop,
          performedBy: row.performed_by ?? row.performedBy,
          role: row.role,
          changes: row.changes,
          timestamp: row.created_at ?? row.timestamp,
        })) : []);
      } catch (err) { console.error("Failed to fetch shop activity log:", err); }
    }, []);

    // Listing overrides for products that have been set up for the Mobile Shop.
    // Stock Inventory remains the source of the product list and live cost.
    const fetchShopItems = useCallback(async () => {
      setItemsLoading(true);
      try {
        const res  = await fetch(`${process.env.REACT_APP_API_URL}/shop-items`);
        const data = await res.json();
        setShopItems(Array.isArray(data) ? data : []);
      } catch {
        setShopItems([]);
      } finally {
        setItemsLoading(false);
      }
    }, []);

    // Stock Inventory ingredients — this is the single source of truth for
    // which products can appear in the Mobile Shop at all, and for cost.
    const fetchStockItems = useCallback(async () => {
      try {
        const res  = await fetch(`${process.env.REACT_APP_API_URL}/ingredients?branch=${encodeURIComponent("Head Office")}`);
        const data = await res.json();
        setStockItems(Array.isArray(data) ? data : []);
      } catch { setStockItems([]); }
    }, []);

    useEffect(() => {
      fetchShopItems();
      fetchStockItems();
      fetchActivityLog();
    }, [fetchShopItems, fetchStockItems, fetchActivityLog]);

    // Pull the live unit cost from Stock Inventory. The shop price is always
    // derived from this — never entered by hand — so it stays in sync
    // automatically whenever cost changes upstream.
    const getCostFor = useCallback((brandName, itemName) => {
      const b = normalize(brandName), n = normalize(itemName);
      const match = stockItems.find((i) => normalize(i.brand) === b && normalize(i.name) === n);
      return match ? Number(match.cost_per_unit || 0) : 0;
    }, [stockItems]);

    // Every unique (brand, product name) combination that exists in Stock
    // Inventory. This — and only this — determines what CAN show up here.
    const uniqueStockProducts = useMemo(() => {
      const seen = new Map();
      stockItems.forEach((si) => {
        if (!si.brand || !si.name) return;
        const key = `${normalize(si.brand)}|${normalize(si.name)}`;
        if (!seen.has(key)) seen.set(key, { brand: si.brand, name: si.name });
      });
      return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [stockItems]);

  const items = useMemo(() => {
    return uniqueStockProducts.map((sp) => {
      const match = shopItems.find(
        (i) => normalize(i.brand) === normalize(sp.brand) && normalize(i.name) === normalize(sp.name)
      );
      const liveCost = getCostFor(sp.brand, sp.name);
      return {
        id: match ? match.id : null,
        name: sp.name,
        brand: sp.brand,
        shop: match ? match.shop : sp.brand,
        cost: liveCost,
        price: match ? Number(match.price) : computeDisplayPrice(liveCost, sp.unit, sp.brand),
        unit: match ? match.unit : "",
        is_visible: match ? !!match.is_visible : false,
        listed: !!match,
      };
    });
  }, [uniqueStockProducts, shopItems, getCostFor]);

    const uniqueShops = [...new Set(items.map((i) => i.brand).filter(Boolean))].sort();

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      item.name?.toLowerCase().includes(q) ||
      item.brand?.toLowerCase().includes(q);
    if (!matchesQuery) return false;
    if (filterShop !== "all" && item.brand !== filterShop) return false;
    return true;
  });

    const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
    const pageStartIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = filteredItems.slice(pageStartIndex, pageStartIndex + ITEMS_PER_PAGE);
    const pageStartDisplay = filteredItems.length === 0 ? 0 : pageStartIndex + 1;
    const pageEndDisplay = Math.min(pageStartIndex + ITEMS_PER_PAGE, filteredItems.length);

    const visiblePages = useMemo(() => {
      const maxVisible = 5;
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      start = Math.max(1, end - maxVisible + 1);
      return Array.from({ length: end - start + 1 }, (_, index) => start + index);
    }, [currentPage, totalPages]);

    useEffect(() => {
      setCurrentPage(1);
    }, [searchQuery, filterShop]);

    useEffect(() => {
      setCurrentPage((page) => Math.min(page, totalPages));
    }, [totalPages]);

    // Clear out any selected keys that no longer exist in the current item set
    // (e.g. a product was removed from Stock Inventory).
    useEffect(() => {
      setSelectedKeys((prev) => {
        const validKeys = new Set(items.map(keyFor));
        let changed = false;
        const next = new Set();
        prev.forEach((k) => {
          if (validKeys.has(k)) next.add(k);
          else changed = true;
        });
        return changed ? next : prev;
      });
    }, [items]);

    const toggleSelect = (rowKey) => {
      setSelectedKeys((prev) => {
        const next = new Set(prev);
        if (next.has(rowKey)) next.delete(rowKey);
        else next.add(rowKey);
        return next;
      });
    };


    const selectedItems = items.filter((i) => selectedKeys.has(keyFor(i)));
    const selectedUnlistedCount = selectedItems.filter((i) => !i.listed).length;
    const allUnlistedCount = filteredItems.filter((i) => !i.listed).length;

    const validateEdit = () => {
      const errs = {};
      if (!editingItem.cost || editingItem.cost <= 0) errs.cost = "Set a cost for this product in Stock Inventory first";
      setEditErrors(errs);
      return Object.keys(errs).length === 0;
    };

    const openEditor = (item) => {
      setEditingItem({ ...item });
      setEditErrors({});
    };

    // Creates the listing (POST) the first time a product is edited, or
    // updates it (PUT) if a listing already exists. Stock is not part of
    // this payload's concern here — price is always synced live from
    // Stock Inventory, never entered manually.
  const saveEdit = async () => {
    if (editLoading || !validateEdit()) return;
    setEditLoading(true);
    const coords = await getBrowserLocation();
    const payload = {
      name: editingItem.name,
      unit: editingItem.unit || "",
      shop: editingItem.brand,
      brand: editingItem.brand,
      is_visible: editingItem.is_visible !== false,
      performed_by: user?.name || "System",
      performed_by_role: user?.role || "Unknown",
      latitude: coords?.latitude,
      longitude: coords?.longitude,
    };
      try {
        const url    = editingItem.id ? `${process.env.REACT_APP_API_URL}/shop-items/${editingItem.id}` : `${process.env.REACT_APP_API_URL}/shop-items`;
        const method = editingItem.id ? "PUT" : "POST";
        await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        setToast({
          type: "success",
          title: editingItem.id ? "Item Updated" : "Item Listed",
          message: editingItem.id
            ? `"${editingItem.name}" has been updated.`
            : `"${editingItem.name}" is now listed in the Mobile Shop.`,
        });
        setEditingItem(null);
        setEditErrors({});
        fetchShopItems();
        fetchActivityLog();
      } catch {
        setToast({ type: "error", title: "Connection Error", message: "Failed to save changes." });
      } finally {
        setEditLoading(false);
      }
    };

    // Bulk-list one or more not-yet-listed products in a single action.
  const bulkListItems = async (candidateItems) => {
    const toList = candidateItems.filter((i) => !i.listed);
      if (toList.length === 0) {
        setToast({ type: "error", title: "Nothing to List", message: "All selected items are already listed." });
        return;
      }
      setBulkListing(true);
      const coords = await getBrowserLocation();
      let success = 0, failed = 0;
  for (const it of toList) {
      const payload = {
        name: it.name,
        unit: it.unit || "",
        shop: it.brand,
        brand: it.brand,
        is_visible: true,
        performed_by: user?.name || "System",
        performed_by_role: user?.role || "Unknown",
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      };
        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL}/shop-items`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
          });
          if (res.ok) success++; else failed++;
        } catch { failed++; }
      }
      setBulkListing(false);
      setSelectedKeys(new Set());
      fetchShopItems();
      fetchActivityLog();
      setToast({
        type: failed > 0 ? "error" : "success",
        title: "Bulk Listing Complete",
        message: `${success} item${success === 1 ? "" : "s"} listed${failed > 0 ? `, ${failed} failed` : ""}.`,
      });
    };

    const deleteItem = async (item) => {
      if (!item.id) { setConfirmDeleteItem(null); return; }
      setDeleteLoading(true);
      const coords = await getBrowserLocation();
      try {
        await fetch(`${process.env.REACT_APP_API_URL}/shop-items/${item.id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deleted_by: user?.name || "System", performed_by_role: user?.role || "Unknown", latitude: coords?.latitude, longitude: coords?.longitude }),
        });
        setToast({ type: "success", title: "Listing Removed", message: `"${item.name}" is no longer listed in the Mobile Shop.` });
      } catch {
        setToast({ type: "error", title: "Connection Error", message: "Failed to remove the listing." });
      } finally {
        setDeleteLoading(false);
        setConfirmDeleteItem(null);
        fetchShopItems();
        fetchActivityLog();
      }
    };

    const toggleVisibility = async (item) => {
      if (!item.id) return; // nothing to toggle until it's listed
      const coords = await getBrowserLocation();
      try {
        await fetch(`${process.env.REACT_APP_API_URL}/shop-items/${item.id}/toggle`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ performed_by: user?.name || "System",performed_by_role: user?.role || "Unknown", latitude: coords?.latitude, longitude: coords?.longitude }),
        });
        fetchShopItems();
        fetchActivityLog();
      } catch {
        setToast({ type: "error", title: "Connection Error", message: "Failed to update visibility." });
      }
    };

    const [blockedUnlistItem, setBlockedUnlistItem] = useState(null);

    const forceHide = async (item) => {
      if (!item.id || item.is_visible === false) { setBlockedUnlistItem(null); return; }
      await toggleVisibility(item);
      setBlockedUnlistItem(null);
    };


    return (
      <div style={{ maxWidth: 1040, margin: "0 auto", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes riseIn { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
          .msc-row { cursor: pointer; transition: background .15s ease; }
          .msc-row:hover td { background: #f6fef8 !important; }
          .msc-row.selected td { background: ${C.greenLt} !important; }
          .msc-btn:not(:disabled):hover { filter: brightness(0.96); transform: translateY(-1px); }
          .msc-btn:not(:disabled):active { transform: translateY(0); }
          .msc-btn:disabled { opacity: 0.5; cursor: not-allowed; }
          .msc-btn { transition: filter .12s ease, transform .12s ease, box-shadow .12s ease; }
          .msc-icon-btn:hover { filter: brightness(0.94); }
          .msc-edit:hover { background:#dcedff !important; }
          .msc-del:hover  { background:#fddede !important; }
          .msc-hide:hover { background:${C.greenLt} !important; }
          select, input { transition: border-color .15s ease, box-shadow .15s ease; }
          select:focus, input:focus { border-color: ${C.green} !important; box-shadow: 0 0 0 3px rgba(0,137,123,0.12); }
          .msc-modal-card { animation: riseIn .18s cubic-bezier(.2,.8,.3,1); }
        `}</style>

        <Toast toast={toast} onClose={() => setToast(null)} />

        {/* ── Edit / List Modal ── */}
        {editingItem && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(3px)", animation: "fadeIn .15s ease" }}>
            <div className="msc-modal-card" style={{ background: C.white, borderRadius: 18, width: "100%", maxWidth: 560, boxShadow: "0 24px 70px rgba(0,0,0,0.28)", overflow: "hidden" }}>
              <div style={{ padding: "18px 24px", background: `linear-gradient(135deg,${C.teal},${C.green})`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                    <TagIcon size={15} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>{editingItem.id ? "Edit Listing" : "List Item"}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{editingItem.brand} · {editingItem.name}</div>
                  </div>
                </div>
                <button onClick={() => { setEditingItem(null); setEditErrors({}); }} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 16, cursor: "pointer", lineHeight: 1, padding: 6, borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              </div>
              <div style={{ padding: "22px 24px" }}>
                <div style={{ fontSize: 11.5, color: "#00695c", background: C.greenLt, border: `1px solid ${C.greenMid}`, borderRadius: 10, padding: "10px 13px", marginBottom: 16, lineHeight: 1.5 }}>
                  This product comes from <strong>Stock Inventory</strong>. Its name, brand, and price can't be edited here — the shop price is calculated automatically from Stock Inventory cost, bulk pack size, and brand markup.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
                  <Field label="Brand">
                    <div style={readOnlyFieldStyle}>{editingItem.brand}</div>
                  </Field>
                  <Field label="Item Name">
                    <div style={readOnlyFieldStyle}>{editingItem.name}</div>
                  </Field>
                  <Field label="Shop Price" error={editErrors.cost}>
                    <div style={{ ...readOnlyFieldStyle, background: editErrors.cost ? "#fdeeee" : C.greenLt, border: `1px solid ${editErrors.cost ? C.red : C.greenMid}`, color: editErrors.cost ? C.red : C.green, justifyContent: "space-between" }}>
                      <span style={{ fontSize: 15, fontWeight: 900 }}>{editingItem.cost > 0 ? fmtPeso(computeDisplayPrice(editingItem.cost, editingItem.unit, editingItem.brand)) : "—"}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: editErrors.cost ? C.red : "#00897b" }}>
                        {editingItem.cost > 0 ? `cost ${fmtPeso(editingItem.cost)} × ${bulkLabelFor(editingItem.unit, editingItem.brand)} ${markupLabelFor(editingItem.brand)}` : "no cost set"}
                      </span>
                    </div>
                  </Field>
                  <Field label="Unit (Optional)">
                    <select value={editingItem.unit || ""} onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                      style={msInputStyle}>
                      <option value="">Select unit…</option>
                      {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </Field>
                </div>

                <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", borderRadius: 10, background: editingItem.is_visible !== false ? C.greenLt : "#f7f7f7", border: `1px solid ${editingItem.is_visible !== false ? C.greenMid : C.border}` }}>
                  <div onClick={() => setEditingItem((f) => ({ ...f, is_visible: f.is_visible === false }))}
                    style={{ width: 40, height: 22, borderRadius: 11, cursor: "pointer", position: "relative", background: editingItem.is_visible !== false ? `linear-gradient(135deg,${C.teal},${C.green})` : "#e0e0e0", transition: "background .2s", flexShrink: 0 }}>
                    <div style={{ position: "absolute", top: 3, left: editingItem.is_visible !== false ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left .2s" }} />
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, cursor: "pointer" }} onClick={() => setEditingItem((f) => ({ ...f, is_visible: f.is_visible === false }))}>
                    Visible in Mobile Shop
                  </span>
                </div>

                <div style={{ marginTop: "1.4rem", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button onClick={() => { setEditingItem(null); setEditErrors({}); }} className="msc-btn"
                    style={{ padding: "10px 18px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, color: C.muted, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                    Cancel
                  </button>
                  <button onClick={saveEdit} disabled={editLoading} className="msc-btn"
                    style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: editLoading ? C.greenMid : `linear-gradient(135deg,${C.teal},${C.green})`, color: C.white, fontWeight: 800, fontSize: 13, cursor: editLoading ? "not-allowed" : "pointer", opacity: editLoading ? 0.7 : 1, boxShadow: "0 4px 14px rgba(0,180,90,0.3)", fontFamily: "inherit" }}>
                    {editLoading ? "Saving…" : editingItem.id ? "Save Changes" : "List Item"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Unlist Confirmation Modal ── */}
        {confirmDeleteItem && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(3px)", animation: "fadeIn .15s ease" }}>
            <div className="msc-modal-card" style={{ background: C.white, borderRadius: 18, width: "100%", maxWidth: 400, boxShadow: "0 24px 70px rgba(0,0,0,0.28)", overflow: "hidden" }}>
              <div style={{ padding: "24px 24px 18px", textAlign: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fdeeee", color: "#e53935", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <AlertIcon />
                </div>
                <div style={{ fontSize: 15.5, fontWeight: 900, color: C.ink, marginBottom: 6 }}>Unlist this item?</div>
                <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
                  <strong style={{ color: C.ink }}>{confirmDeleteItem.name}</strong> will be removed from the Mobile Shop. It'll stay in Stock Inventory and can be relisted anytime.
                </div>
              </div>
              <div style={{ padding: "0 24px 22px", display: "flex", gap: 8 }}>
                <button onClick={() => setConfirmDeleteItem(null)} disabled={deleteLoading} className="msc-btn"
                  style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, color: C.ink, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                  Cancel
                </button>
                <button onClick={() => deleteItem(confirmDeleteItem)} disabled={deleteLoading} className="msc-btn"
                  style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: deleteLoading ? "#ef9a9a" : "#e53935", color: "#fff", fontWeight: 800, fontSize: 13, cursor: deleteLoading ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(229,57,53,0.3)" }}>
                  {deleteLoading ? "Unlisting…" : "Yes, Unlist"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Shop Items Card ── */}
        <div style={{ background: C.white, borderRadius: 18, border: "1px solid rgba(0,168,76,0.12)", boxShadow: "0 4px 20px rgba(0,140,60,0.08)", overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", background: `linear-gradient(135deg,${C.teal},${C.green})`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", letterSpacing: "-0.01em" }}>Mobile Shop Supplies</div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.8)", fontWeight: 600, marginTop: 2 }}>Prices auto-set from cost, bulk size, and brand markup · click a row to select it for listing</div>
            </div>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: 700, background: "rgba(255,255,255,0.15)", padding: "5px 12px", borderRadius: 20 }}>{items.length} product{items.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Toolbar */}
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", background: "#fafffe" }}>
            <div style={{ position: "relative" }}>
              <Search size={13} color="#5a7a65" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text" placeholder="Search items…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: "8px 12px 8px 30px", borderRadius: 9, border: `1px solid ${C.border}`, fontSize: 13, background: C.white, fontFamily: "inherit", outline: "none", width: 220, height: 38, boxSizing: "border-box" }}
              />
            </div>
            <select value={filterShop} onChange={(e) => setFilterShop(e.target.value)}
              style={{ ...msInputStyle, marginTop: 0, width: 160 }}>
              <option value="all">All Shops</option>
              {uniqueShops.map((shop) => <option key={shop} value={shop}>{shop}</option>)}
            </select>
            {(searchQuery || filterShop !== "all") && (
              <button onClick={() => { setSearchQuery(""); setFilterShop("all"); }} className="msc-btn"
                style={{ height: 38, padding: "0 12px", borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: "#5a7a65" }}>
                Clear
              </button>
            )}

            <span style={{ display: "flex", gap: 8, marginLeft: "auto", flexWrap: "wrap" }}>
              <button
                onClick={() => bulkListItems(selectedItems)}
                disabled={bulkListing || selectedUnlistedCount === 0}
                className="msc-btn"
                title={selectedUnlistedCount === 0 ? "Click unlisted rows to select them" : "List all selected items"}
                style={{ ...toolbarBtnSt, border: `1.5px solid ${C.green}`, background: C.greenLt, color: C.greenDk }}>
                <ListIcon /> List Items{selectedUnlistedCount > 0 ? ` (${selectedUnlistedCount})` : ""}
              </button>
              <button
                onClick={() => bulkListItems(filteredItems)}
                disabled={bulkListing || allUnlistedCount === 0}
                className="msc-btn"
                title="List every currently unlisted item shown below"
                style={{ ...toolbarBtnSt, background: `linear-gradient(135deg,${C.teal},${C.green})`, color: "#fff", boxShadow: "0 3px 12px rgba(0,180,90,0.28)" }}>
                <LayersIcon /> {bulkListing ? "Listing…" : `List All Items${allUnlistedCount > 0 ? ` (${allUnlistedCount})` : ""}`}
              </button>
            </span>

            <span style={{ fontSize: 12, color: "#5a7a65", fontWeight: 600, width: "100%" }}>
              {filteredItems.length} of {items.length} products{selectedKeys.size > 0 ? ` · ${selectedKeys.size} selected` : ""}
            </span>
          </div>

          {itemsLoading ? (
            <div style={{ padding: "60px 0", textAlign: "center", color: C.muted, fontSize: 13 }}>
              <RefreshCw size={20} style={{ animation: "spin 0.9s linear infinite", marginBottom: 10 }} />
              <div>Loading shop items…</div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div style={{ padding: "56px 0", textAlign: "center", color: C.muted }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 10, opacity: 0.4 }}><BoxIcon /></div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>No products found</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Add products in Stock Inventory first — they will then appear here.</div>
            </div>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr>
                      {["Shop", "Item Name", "Price", "Unit", "Status", "Manage"].map((label, i) => (
                        <th key={i} style={{ padding: "11px 14px", textAlign: i === 5 ? "right" : "left", fontWeight: 800, fontSize: 10.5, color: "#00897b", letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap", background: "#f8fffe" }}>
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((item) => {
                      const rowKey = keyFor(item);
                      const isSelected = selectedKeys.has(rowKey);
                      return (
                        <tr
                          key={rowKey}
                          className={`msc-row${isSelected ? " selected" : ""}`}
                          onClick={() => toggleSelect(rowKey)}
                          aria-selected={isSelected}
                          title={isSelected ? "Click row to deselect" : "Click row to select"}
                          style={{ borderBottom: "1px solid #f0f8f0", opacity: item.listed ? 1 : 0.82 }}
                        >
                          <td style={{ padding: "11px 14px", borderLeft: `3px solid ${isSelected ? C.green : "transparent"}` }}>
                            <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#e0f2f1", color: "#00695c" }}>{item.brand}</span>
                          </td>
                          <td style={{ padding: "11px 14px", fontWeight: 700, color: C.ink }}>{item.name}</td>
                          <td style={{ padding: "11px 14px" }}>
                            {item.cost > 0 ? (
                              <div>
                                <div style={{ fontWeight: 800, color: C.green }}>{fmtPeso(item.price)}</div>
                                <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>cost {fmtPeso(item.cost)} + 12%</div>
                              </div>
                            ) : (
                              <span style={{ fontStyle: "italic", fontWeight: 500, color: C.muted, fontSize: 12 }}>no cost set</span>
                            )}
                          </td>
                          <td style={{ padding: "11px 14px", color: C.muted, fontSize: 12 }}>{item.unit || <span style={{ fontStyle: "italic" }}>—</span>}</td>
                          <td style={{ padding: "11px 14px" }}>
                            {item.listed ? (
                              <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: item.is_visible ? "#e0f2f1" : "#fce4ec", color: item.is_visible ? "#00695c" : "#c62828" }}>
                                {item.is_visible ? "Visible" : "Hidden"}
                              </span>
                            ) : (
                              <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#f1f1f1", color: "#8a8a8a" }}>
                                Not Listed
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "11px 14px" }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
                              <button onClick={() => openEditor(item)} className="msc-btn msc-icon-btn msc-edit" title={item.listed ? "Edit listing" : "List this item"}
                                style={{ ...smallBtnSt, border: "1px solid #bbdefb", color: "#1565c0", background: "#e3f2fd" }}>
                                <EditIcon /> {item.listed ? "Edit" : "List"}
                              </button>
                              {item.listed && (
                                <>
                                  <button onClick={() => toggleVisibility(item)} className="msc-btn msc-icon-btn msc-hide" title={item.is_visible ? "Hide from shop" : "Show in shop"}
                                    style={{ ...smallBtnSt, border: `1px solid ${C.border}`, color: C.green }}>
                                    {item.is_visible ? <EyeOffIcon /> : <EyeIcon />}
                                  </button>
                                  <button onClick={() => setConfirmDeleteItem(item)} className="msc-btn msc-icon-btn msc-del" title="Unlist"
                                    style={{ ...smallBtnSt, border: "1px solid #ffcdd2", color: "#e53935", background: C.white }}>
                                    <TrashIcon />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ padding: "14px 18px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", background: "#fafffe" }}>
                <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>
                  Showing {pageStartDisplay}-{pageEndDisplay} of {filteredItems.length}
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="msc-btn"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    style={{ padding: "7px 10px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, color: C.ink, fontSize: 11.5, fontWeight: 700, fontFamily: "inherit" }}
                  >
                    First
                  </button>
                  <button
                    type="button"
                    className="msc-btn"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    style={{ padding: "7px 10px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, color: C.ink, fontSize: 11.5, fontWeight: 700, fontFamily: "inherit" }}
                  >
                    Previous
                  </button>

                  {visiblePages.map((page) => (
                    <button
                      type="button"
                      key={page}
                      className="msc-btn"
                      onClick={() => setCurrentPage(page)}
                      style={{
                        minWidth: 32,
                        padding: "7px 9px",
                        borderRadius: 8,
                        border: `1px solid ${page === currentPage ? C.green : C.border}`,
                        background: page === currentPage ? C.greenLt : C.white,
                        color: page === currentPage ? C.greenDk : C.ink,
                        fontSize: 11.5,
                        fontWeight: 800,
                        fontFamily: "inherit",
                      }}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="msc-btn"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    style={{ padding: "7px 10px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, color: C.ink, fontSize: 11.5, fontWeight: 700, fontFamily: "inherit" }}
                  >
                    Next
                  </button>
                  <button
                    type="button"
                    className="msc-btn"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    style={{ padding: "7px 10px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, color: C.ink, fontSize: 11.5, fontWeight: 700, fontFamily: "inherit" }}
                  >
                    Last
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }


  function generateTempPassword(length = 10) {
    const groups = [
      "ABCDEFGHJKLMNPQRSTUVWXYZ",
      "abcdefghjkmnpqrstuvwxyz",
      "123456789",
      "!@#$",
    ];
    const chars = groups.join("");
    const password = [
      ...groups.map(group => group[Math.floor(Math.random() * group.length)]),
      ...Array.from({ length: Math.max(length - groups.length, 0) }, () => chars[Math.floor(Math.random() * chars.length)]),
    ];
    return password.sort(() => Math.random() - 0.5).join("");
  }

  function ApplicationConfirmModal({ app, onConfirm, onClose, deleting }) {
    if (!app) return null;
    return (
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2000, padding: 20, backdropFilter: "blur(4px)",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#fff", borderRadius: 20, padding: "28px 32px",
            width: "100%", maxWidth: 420,
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            border: "1px solid rgba(0,168,76,0.15)",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: "50%", background: "#fee2e2",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <Trash2 size={22} color="#dc2626" />
          </div>
          <h2 style={{ textAlign: "center", fontSize: 17, fontWeight: 800, color: "#0d2b1e", marginBottom: 8 }}>
            Delete application?
          </h2>
          <p style={{ textAlign: "center", fontSize: 13, color: "#5a7a65", lineHeight: 1.6, marginBottom: 16 }}>
            You are about to delete the application from <strong>"{app.name}"</strong>{app.email ? ` (${app.email})` : ""}.
          </p>
          <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginBottom: 20 }}>
            You can recover this from Delete History.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              type="button" onClick={onClose} disabled={deleting}
              style={{
                padding: "9px 22px", borderRadius: 10, border: "1px solid #b2dfdb",
                background: "#f0fdf5", color: "#5a7a65", fontSize: 13, fontWeight: 700,
                cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit",
              }}
            >
              Cancel
            </button>
            <button
              type="button" onClick={onConfirm} disabled={deleting}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 24px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg,#dc2626,#ef4444)",
                color: "#fff", fontSize: 13, fontWeight: 700,
                cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit",
                boxShadow: "0 2px 10px rgba(220,38,38,0.35)",
                opacity: deleting ? 0.7 : 1,
              }}
            >
              <Trash2 size={14} /> {deleting ? "Deleting…" : "Delete Application"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function ApplicationsDeleteConfirmModal({ target, onConfirm, onClose, deleting = false }) {
    return (
      <div
        onClick={deleting ? undefined : onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2000, padding: 20, backdropFilter: "blur(4px)",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#fff", borderRadius: 20, padding: "28px 32px",
            width: "100%", maxWidth: 420,
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            border: "1px solid rgba(0,168,76,0.15)",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: "50%", background: "#fee2e2",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <Trash2 size={22} color="#dc2626" />
          </div>
          <h2 style={{ textAlign: "center", fontSize: 17, fontWeight: 800, color: "#0d2b1e", marginBottom: 8 }}>
            Delete application?
          </h2>
          <p style={{ textAlign: "center", fontSize: 13, color: "#5a7a65", lineHeight: 1.6, marginBottom: 16 }}>
            You are about to delete <strong>"{target.name}"</strong>
          </p>
          <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginBottom: 20 }}>
            You can recover this from Delete History.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              type="button" onClick={onClose} disabled={deleting}
              style={{
                padding: "9px 22px", borderRadius: 10, border: "1px solid #b2dfdb",
                background: "#f0fdf5", color: "#5a7a65", fontSize: 13, fontWeight: 700,
                cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit",
                opacity: deleting ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type="button" onClick={onConfirm} disabled={deleting}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 24px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg,#dc2626,#ef4444)",
                color: "#fff", fontSize: 13, fontWeight: 700,
                cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit",
                boxShadow: "0 2px 10px rgba(220,38,38,0.35)",
                opacity: deleting ? 0.7 : 1,
              }}
            >
              {deleting ? <RefreshCw size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : <Trash2 size={14} />}
              {deleting ? "Deleting…" : "Delete Application"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function ApplicationsContent({user, applications: initialApps, brands: propBrands = []  }) {

    const [activityLog,     setActivityLog]     = useState([]);
    const [applications, setApplications] = useState(initialApps || []);
    const [viewApp,      setViewApp]      = useState(null);
    const [accountApp,   setAccountApp]   = useState(null);
    const [alertModal, setAlertModal] = useState(null);
    
    const showAlert = (title, message, type = "info") =>
    setAlertModal({ title, message, type });

    const [menuApp, setMenuApp] = useState(null);
    const [appDeleteHistory,     setAppDeleteHistory]     = useState([]);
    const [showAppDeleteHistory, setShowAppDeleteHistory] = useState(false);
    const [role, setRole] = useState("franchisee"); 

    const [filterStatus,    setFilterStatus]    = useState("all");
    const [filterFranchise, setFilterFranchise] = useState("all");
    const [searchQuery,     setSearchQuery]     = useState("");
    const [restoringId, setRestoringId] = useState(null);
    
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);    
    const [processingId, setProcessingId] = useState(null);
    const [scheduleApp, setScheduleApp] = useState(null);
    const [rescheduleApp, setRescheduleApp] = useState(null);

    const [now, setNow] = useState(Date.now())

    const handleDelete = (id) => {
    const app = applications.find(a => a.id === id);
    if (app) setDeleteTarget(app);
  };

    const fetchActivityLog = useCallback(async () => {
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/applications-activity-log`);
      const data = await res.json();
      setActivityLog(Array.isArray(data) ? data.map(row => ({
        id: row.id, action: row.action,
        ingredientName: row.ingredient_name ?? row.ingredientName,
        branch: row.branch,
        performedBy: row.performed_by ?? row.performedBy,
        role: row.role,  
        changes: row.changes,
        timestamp: row.created_at ?? row.timestamp,
      })) : []);
    } catch (err) { console.error("Failed to fetch orders activity log:", err); }
  }, []);

  const normalizeApp = (row) => ({
    ...row,
    appointmentDate:     row.appointment_date     ?? row.appointmentDate,
    appointmentLocation: row.appointment_location ?? row.appointmentLocation,
    appointmentNotes:    row.appointment_notes    ?? row.appointmentNotes,
    appointmentStatus:   row.appointment_status   ?? row.appointmentStatus,
    accountCreatedAt:    row.account_created_at   ?? row.accountCreatedAt,
  });

    const fetchApplications = async () => {
      try {
        const res  = await fetch(`${process.env.REACT_APP_API_URL}/applications`);
        const data = await res.json();
        setApplications(Array.isArray(data) ? data.map(normalizeApp) : []);
      } catch (err) {
        console.error("Failed to fetch applications:", err);
      }
    };

    const getBrowserLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
        () => resolve(null),
        { timeout: 5000, maximumAge: 60000 }
      );
    });
  };

  const handleExportCSV = () => {
    if (filteredApps.length === 0) {
      setAlertModal({ title: "No applications to export", type: "error" });
      return;
    }

    const headers = [
      "Applicant Name", "Email", "Phone", "Franchise Interest",
      "Date Applied", "Status", "Payment Mode", "Civil Status",
      "Gender", "Nationality", "Address", "Employment Type",
      "Monthly Income", "Employer Name",
    ];

    const escapeCSV = (val) => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const fmtDate = (d) =>
      d ? new Date(d).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric", timeZone: "Asia/Manila" }) : "";

    const rows = filteredApps.map(app => [
      app.name, app.email, app.phone, app.franchise,
      fmtDate(app.date), app.status, app.paymentMode, app.civilStatus,
      app.gender, app.nationality, app.address, app.employmentType,
      app.income, app.employerName,
    ].map(escapeCSV).join(","));

    const csvContent = [headers.map(escapeCSV).join(","), ...rows].join("\n");

    // Add BOM so Excel opens UTF-8 (₱ sign, etc.) correctly
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const today = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `applications_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setAlertModal({ title: `Exported ${filteredApps.length} application${filteredApps.length !== 1 ? "s" : ""}`, type: "success" });
  };

  const FRANCHISE_ALIASES = {
    "Coffee Spot": ["Coffee Spot", "Coffee Spot Full Store"],
  };

  const filteredApps = applications.filter(app => {
    const q = searchQuery.toLowerCase();
    if (q && !app.name?.toLowerCase().includes(q) &&
            !app.email?.toLowerCase().includes(q) &&
            !app.phone?.toLowerCase().includes(q)) return false;
    if (filterStatus    !== "all" && app.status    !== filterStatus)    return false;
    if (filterFranchise !== "all") {
    const matches = FRANCHISE_ALIASES[filterFranchise] || [filterFranchise];
    if (!matches.includes(app.franchise)) return false;
  }
    return true;
  });

  const handlePrintApplication = (app) => {
    if (!app) return;
    const fmt = (d) => d ? new Date(d).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" }) : "";
    const printWindow = window.open('', '_blank', 'width=800,height=1000');
    if (!printWindow) return;

    const line = (val) => val || "";

    printWindow.document.write(`
      <html>
        <head>
          <title>Application - ${app.name || ""}</title>
          <style>
            @page { margin: 24px; }
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              color: #111;
              font-size: 12px;
            }
            .sheet {
              border: 2px solid #000;
              padding: 20px 24px;
            }
            .header {
              text-align: center;
              margin-bottom: 14px;
            }
            .header .company {
              font-size: 18px;
              font-weight: 800;
              letter-spacing: 0.05em;
            }
            .header .tagline {
              font-size: 9px;
              color: #555;
              letter-spacing: 0.1em;
            }
            .header .addr {
              font-size: 9px;
              color: #333;
              margin-top: 2px;
            }
            .top-row {
              display: flex;
              justify-content: space-between;
              margin: 14px 0 10px;
            }
            .fill {
              border-bottom: 1px solid #000;
              display: inline-block;
              min-width: 160px;
              padding: 0 4px;
              font-weight: 600;
            }
            .section-bar {
              background: #000;
              color: #fff;
              text-align: center;
              font-weight: 800;
              letter-spacing: 0.08em;
              padding: 4px 0;
              font-size: 11px;
              margin: 14px 0 10px;
            }
            .row {
              display: flex;
              gap: 24px;
              margin-bottom: 10px;
              flex-wrap: wrap;
            }
            .field {
              display: flex;
              align-items: baseline;
              gap: 6px;
            }
            .label {
              white-space: nowrap;
            }
            .checkbox-row {
              display: flex;
              gap: 18px;
              flex-wrap: wrap;
              margin-bottom: 10px;
            }
            .box {
              display: inline-block;
              width: 10px;
              height: 10px;
              border: 1px solid #000;
              margin-right: 4px;
              vertical-align: middle;
            }
            .full-line {
              border-bottom: 1px solid #000;
              flex: 1;
              padding: 0 4px;
              font-weight: 600;
            }
            .declaration {
              font-size: 10px;
              line-height: 1.5;
              margin-top: 16px;
              text-align: justify;
            }
            .sign-row {
              display: flex;
              justify-content: space-between;
              margin-top: 50px;
            }
            .sign-block {
              width: 45%;
              text-align: center;
            }
            .sign-line {
              border-top: 1px solid #000;
              padding-top: 4px;
              font-size: 10px;
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="header">
              <div class="company">iFRANCHISE</div>
              <div class="tagline">BUSINESS SERVICES CORP.</div>
              <div class="addr">Unit 206 Blk 113 Building, #53 Connecticut Street, Greenhills, San Juan City</div>
            </div>

            <div class="top-row">
              <div class="field"><span class="label">DATE:</span><span class="fill">${fmt(app.date)}</span></div>
              <div class="field"><span class="label">MODE OF PAYMENT:</span><span class="fill">${line(app.paymentMode)}</span></div>
            </div>
            <div class="field" style="margin-bottom:10px;">
              <span class="label">CHOSEN CONCEPT:</span><span class="full-line">${line(app.franchise)}</span>
            </div>

            <div class="section-bar">APPLICANT INFORMATION</div>

            <div class="field" style="margin-bottom:6px;">
              <span class="label">Franchise App's Name:</span><span class="full-line">${line(app.name)}</span>
            </div>
            <div class="row">
              <div class="field"><span class="label">Date of Birth:</span><span class="fill">${fmt(app.dob)}</span></div>
            </div>

            <div class="checkbox-row">
              <span class="label">Civil Status:</span>
              <span><span class="box">${app.civilStatus === "Married" ? "✓" : ""}</span>Married</span>
              <span><span class="box">${app.civilStatus === "Single" ? "✓" : ""}</span>Single</span>
              <span><span class="box">${app.civilStatus === "Widowed" ? "✓" : ""}</span>Widowed</span>
              <span><span class="box">${app.civilStatus === "Separated" ? "✓" : ""}</span>Separated</span>
              <span class="field"><span class="label">No. of Dependents:</span><span class="fill">${line(app.dependents)}</span></span>
            </div>

            <div class="checkbox-row">
              <span class="label">Nationality:</span>
              <span><span class="box">${app.nationality === "Filipino" ? "✓" : ""}</span>Filipino</span>
              <span><span class="box">${app.nationality && app.nationality !== "Filipino" ? "✓" : ""}</span>Others: ${app.nationality && app.nationality !== "Filipino" ? line(app.nationality) : ""}</span>
              <span class="field"><span class="label">Gender:</span><span class="fill">${line(app.gender)}</span></span>
            </div>

            <div class="field" style="margin-bottom:6px;">
              <span class="label">Present Address:</span><span class="full-line">${line(app.address)}</span>
            </div>

            <div class="row">
              <div class="field"><span class="label">Telephone No. / Mobile:</span><span class="fill">${line(app.phone)}</span></div>
            </div>
            <div class="field" style="margin-bottom:10px;">
              <span class="label">Email Address:</span><span class="full-line">${line(app.email)}</span>
            </div>

            <div class="section-bar">EMPLOYMENT</div>

            <div class="checkbox-row">
              <span class="label">EMPLOYMENT:</span>
              <span><span class="box">${app.employmentType === "Private Sector" ? "✓" : ""}</span>Private Sector</span>
              <span><span class="box">${app.employmentType === "Government" ? "✓" : ""}</span>Government</span>
              <span><span class="box">${app.employmentType === "Self Employed" ? "✓" : ""}</span>Self Employed</span>
              <span class="field"><span class="label">Years w/ Present Employer/Business:</span><span class="fill">${line(app.yearsEmployer)}</span></span>
            </div>

            <div class="row">
              <div class="field"><span class="label">Employer/Business:</span><span class="fill">${line(app.employerName)}</span></div>
              <div class="field"><span class="label">Position:</span><span class="fill">${line(app.position)}</span></div>
            </div>

            <div class="field" style="margin-bottom:10px;">
              <span class="label">Business Address:</span><span class="full-line">${line(app.businessAddress)}</span>
            </div>

            <div class="row">
              <div class="field"><span class="label">Nature of Business:</span><span class="fill">${line(app.businessNature)}</span></div>
              <div class="field"><span class="label">Monthly Income:</span><span class="fill">${app.income ? "₱" + Number(app.income).toLocaleString() : ""}</span></div>
            </div>

            <div class="declaration">
              I/We certify that all the above information are true and correct to the best of my/our knowledge. I/We authorize you to verify and investigate
              the above information from whatever sources you may consider appropriate. In addition, I/We hereby expressly and unconditionally
              authorize iFRANCHISE BUSINESS SERVICES CORP. to disclose to any iFRANCHISE subsidiary, affiliate and accredited financing company
              any information regarding me/us. Lastly, We/I hereby acknowledge that the Operation Guidelines and Franchise Agreement has been discussed to me/us.
            </div>

            <div class="sign-row">
              <div class="sign-block">
                <div class="sign-line">Signature of Applicant</div>
              </div>
              <div class="sign-block">
                <div class="sign-line">${fmt(app.dateSigned) || "Date"}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

    const fetchAppDeleteHistory = async () => {
      try {
        const res  = await fetch(`${process.env.REACT_APP_API_URL}/application-delete-history`);
        const data = await res.json();
        const mapped = Array.isArray(data)
          ? data.map(row => ({
              id:        row.id,
              data:      row.application_data ?? row.data ?? {},
              deletedAt: row.deleted_at       ?? row.deletedAt,
            }))
          : [];
        setAppDeleteHistory(mapped);
      } catch (err) {
        console.error("Failed to fetch application delete history:", err);
      }
    };

    useEffect(() => {
      fetchApplications();
      fetchAppDeleteHistory();
      fetchActivityLog();
    }, []);

    useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 15000); // check every 15s
    return () => clearInterval(tick);
  }, []);

    useEffect(() => {
    if (!alertModal) return;
    const timer = setTimeout(() => {
      setAlertModal(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [alertModal]);
    

  const handleApprove = async (id) => {
    if (processingId) return;
    setProcessingId(id);
    setAlertModal({ title: "Approving application…", type: "loading" });
    try {
      const coords = await getBrowserLocation();
      await fetch(`${process.env.REACT_APP_API_URL}/applications/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "approved",
          performed_by: user?.name || "System",
          role: user?.role || "Unknown",
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        }),
      });
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: "approved" } : a));
      setMenuApp(prev => prev?.id === id ? { ...prev, status: "approved" } : prev);
      await fetchActivityLog();
      setAlertModal({ title: "Application approved", type: "success" });
    } catch {
      setAlertModal({ title: "Failed to approve", message: "Please try again.", type: "error" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveAndCreateAccount = async (app) => {
    if (app.status !== "approved") {
      await handleApprove(app.id);
    }
    setAccountApp({ ...app, status: "approved" });
  };

  const handleReject = async (id) => {
    if (processingId) return;
    setProcessingId(id);
    setAlertModal({ title: "Rejecting application…", type: "loading" });
    try {
      const coords = await getBrowserLocation();
      const res = await fetch(`${process.env.REACT_APP_API_URL}/applications/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "rejected",
          performed_by: user?.name || "System",
          role: user?.role || "Unknown",
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setAlertModal({ title: "Failed to reject", message: data.error || "Please try again.", type: "error" }); return; }

      const app = applications.find(a => a.id === id);
      if (app?.email) {
        await fetch(`${process.env.REACT_APP_API_URL}/send-rejection`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: app.email, name: app.name }),
        });
      }

      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: "rejected" } : a));
      setMenuApp(prev => prev?.id === id ? { ...prev, status: "rejected" } : prev);
      await fetchActivityLog();
      setAlertModal({ title: "Application rejected", type: "success" });
    } catch {
      setAlertModal({ title: "Failed to reject", message: "Please try again.", type: "error" });
    } finally {
      setProcessingId(null);
    }
  };

  const interviewPending = (app) => {
    if (!app.appointmentDate) return false;
    const interviewEndsAt = new Date(app.appointmentDate).getTime() + 1 * 60 * 1000;
    return now < interviewEndsAt;
  };

  const handleSendScheduleOptions = async (app, { optionADate, optionBDate, optionCDate }) => {
    if (processingId) return;
    setProcessingId(app.id);
    setAlertModal({ title: "Sending interview options…", type: "loading" });
    try {
      const coords = await getBrowserLocation();
      const res = await fetch(`${process.env.REACT_APP_API_URL}/applications/${app.id}/schedule-options`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionADate, optionBDate, optionCDate,
          performed_by: user?.name || "System",
          role: user?.role || "Unknown",
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setAlertModal({ title: "Failed to send options", message: data.error || "Please try again.", type: "error" });
        return;
      }

      if (app.email) {
        await fetch(`${process.env.REACT_APP_API_URL}/send-schedule-options`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: app.email, name: app.name, optionADate, optionBDate, optionCDate, token: data.appointmentToken }),
        });
      }

      const normalizedApp = normalizeApp(data.application);
      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, ...normalizedApp } : a));
      setViewApp(prev => prev?.id === app.id ? { ...prev, ...normalizedApp } : prev);
      setMenuApp(prev => prev?.id === app.id ? { ...prev, ...normalizedApp } : prev);
      await fetchActivityLog();
      setScheduleApp(null);
      setAlertModal({ title: "Interview options sent", type: "success" });
    } catch {
      setAlertModal({ title: "Failed to send options", message: "Please try again.", type: "error" });
    } finally {
      setProcessingId(null);
    }
  };

  // ⚠️ TEMPORARY — testing only, remove once the client-facing reschedule page exists
  const handleTestRequestReschedule = async (app) => {
    if (!app.appointmentToken) {
      setAlertModal({ title: "No appointment token", message: "Schedule an interview first.", type: "error" });
      return;
    }
    setAlertModal({ title: "Simulating client reschedule request…", type: "loading" });
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/public/appointments/${app.appointmentToken}/reschedule-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!data.success) {
        setAlertModal({ title: "Failed", message: data.error || "Please try again.", type: "error" });
        return;
      }
      await fetchApplications();
      setViewApp(prev => prev ? { ...prev, appointmentStatus: "reschedule_requested" } : prev);
      await fetchActivityLog();
      setAlertModal({ title: "Reschedule request simulated", type: "success" });
    } catch {
      setAlertModal({ title: "Failed", message: "Please try again.", type: "error" });
    }
  };

  const confirmDeleteApplication = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setAlertModal({ title: "Deleting application…", type: "loading" });
    try {
      const coords = await getBrowserLocation();
      const res = await fetch(`${process.env.REACT_APP_API_URL}/applications/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deleted_by: user?.name || "System",
          role: user?.role || "Unknown",
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setApplications(prev => prev.filter(a => a.id !== deleteTarget.id));
        await fetchAppDeleteHistory();
        await fetchActivityLog();
        setAlertModal({ title: `"${deleteTarget.name}" deleted`, type: "success" });
      } else {
        setAlertModal({ title: "Failed to delete", message: data.error || "Please try again.", type: "error" });
      }
    } catch {
      setAlertModal({ title: "Failed to delete", message: "Please try again.", type: "error" });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleRestoreApplication = async (entry) => {
    setRestoringId(entry.id);
    setAlertModal({ title: "Restoring application…", type: "loading" });
    try {
      const d = entry.data;
      const coords = await getBrowserLocation();
      const res = await fetch(`${process.env.REACT_APP_API_URL}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: d.name, email: d.email, phone: d.phone, franchise: d.franchise,
          paymentMode: d.payment_mode, dob: d.dob, civilStatus: d.civil_status,
          gender: d.gender, nationality: d.nationality, address: d.address,
          dependents: d.dependents, spouseName: d.spouse_name, spouseOccupation: d.spouse_occupation,
          employmentType: d.employment_type, yearsEmployer: d.years_employer, income: d.income,
          employerName: d.employer_name, businessAddress: d.business_address,
          position: d.position, businessNature: d.business_nature,
          signature: d.signature, dateSigned: d.date_signed,
          performed_by: user?.name || "System",
          role: user?.role || "Unknown",
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          restored: true,
        }),
      });
      const result = await res.json();
      if (result.success) {
        await fetch(`${process.env.REACT_APP_API_URL}/application-delete-history/${entry.id}`, { method: "DELETE" });
        await fetchAppDeleteHistory();
        await fetchApplications();
        await fetchActivityLog();
        setAlertModal({ title: `"${d.name}" restored`, type: "success" });
      } else {
        setAlertModal({ title: "Failed to restore", message: result.error || "Please try again.", type: "error" });
      }
    } catch (err) {
      console.error("Restore error:", err);
      setAlertModal({ title: "Failed to restore", message: "Please try again.", type: "error" });
    } finally {
      setRestoringId(null);
    }
  };
    // ── Status badge ─────────────────────────────────────────────────────────
    const StatusBadge = ({ status }) => {
      const map = {
        pending:   { bg: "rgba(245,158,11,0.1)",  color: "#d97706" },
        scheduled: { bg: "rgba(37,99,235,0.1)",   color: "#2563eb" },
        approved:  { bg: "rgba(16,185,129,0.1)",  color: "#059669" },
        rejected:  { bg: "rgba(239,68,68,0.1)",   color: "#dc2626" },
      };
      const s = map[status] || map["pending"];
      return (
        <span style={{
          background: s.bg, color: s.color,
          padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
        }}>
          {status?.toUpperCase()}
        </span>
      );
    };

    const DeleteHistoryModal = () => {
      if (!showAppDeleteHistory) return null;

      const fmt = (d) =>
        new Date(d).toLocaleString("en-PH", {
          month: "short", day: "numeric", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        });

        <style>{`
    @keyframes toast-slide-in {
      from { transform: translateX(30px); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
  `}</style>

      return (
        <div
          onClick={() => setShowAppDeleteHistory(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(13,43,30,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 2000, padding: 20, backdropFilter: "blur(4px)",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 20, padding: "28px 32px",
              width: "100%", maxWidth: 680, maxHeight: "80vh",
              display: "flex", flexDirection: "column",
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
              border: "1px solid rgba(0,168,76,0.15)",
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 18,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0d2b1e", margin: 0 }}>
                  Application Delete History
                </h2>
                {appDeleteHistory.length > 0 && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 10px",
                    borderRadius: 20, background: "#fee2e2", color: "#dc2626",
                  }}>
                    {appDeleteHistory.length} deleted
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowAppDeleteHistory(false)}
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  border: "1px solid #b2dfdb", background: "#e0f2f1",
                  cursor: "pointer", color: "#00695c",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* List */}
            <div style={{ overflowY: "auto", flex: 1 }}>
              {appDeleteHistory.length === 0 ? (
                <div style={{
                  padding: "40px 0", textAlign: "center",
                  color: "#9ca3af", fontSize: 13, fontStyle: "italic",
                }}>
                  No deleted applications yet.
                </div>
              ) : appDeleteHistory.map((entry, i) => {
                const app = entry.data || {};
                return (
                  <div
                    key={entry.id}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 0",
                      borderBottom: i < appDeleteHistory.length - 1
                        ? "1px solid #f0f8f0" : "none",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 700, fontSize: 13, color: "#0d2b1e",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {app.name || "—"}
                      </div>
                      <div style={{ fontSize: 11, color: "#5a7a65", marginTop: 2 }}>
                        {app.email} · {app.franchise}
                      </div>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                        Deleted: {entry.deletedAt ? fmt(entry.deletedAt) : "—"}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRestoreApplication(entry)}
                      disabled={restoringId !== null}
                      style={{
                        display: "flex", alignItems: "center", gap: 5,
                        padding: "7px 14px", borderRadius: 9,
                        border: "1.5px solid #00897b",
                        background: restoringId === entry.id ? "#f0fdf5" : "#e0f2f1",
                        color: "#00695c", fontSize: 12, fontWeight: 700,
                        cursor: restoringId !== null ? "not-allowed" : "pointer",
                        fontFamily: "inherit", whiteSpace: "nowrap",
                        opacity: restoringId !== null ? (restoringId === entry.id ? 0.7 : 0.4) : 1,
                      }}
                    >
                      {restoringId === entry.id ? (
                        <>
                          <RotateCcw size={12} style={{ animation: "spin 1s linear infinite" }} /> Restoring…
                        </>
                      ) : (
                        <>
                          <RotateCcw size={12} /> Restore
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
      <>
        <DeleteHistoryModal />

        <ApplicationConfirmModal
          app={deleteTarget}
          deleting={deleting}
          onConfirm={confirmDeleteApplication}
          onClose={() => { if (!deleting) setDeleteTarget(null); }}
        />

      {deleteTarget && (
        <ApplicationsDeleteConfirmModal
          target={deleteTarget}
          deleting={deleting}
          onConfirm={confirmDeleteApplication}
          onClose={() => { if (!deleting) setDeleteTarget(null); }}
        />
      )}

        {/* ── View Application Modal ── */}
        {viewApp && ( 
          <>
      {console.log("viewApp:", JSON.stringify(viewApp, null, 2))}
          <div onClick={() => setViewApp(null)} style={{
            position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 2000, padding: 20,
          }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: C.white, borderRadius: 20,
            padding: "59px 47px 40px",   // ← more top padding so header clears the X
            width: "100%", maxWidth: 680,
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            border: "1px solid rgba(0,168,76,0.15)",
            maxHeight: "90vh", overflowY: "auto",
            fontFamily: "Montserrat, sans-serif",
            position: "relative",
          }}>
          <button onClick={() => setViewApp(null)} style={{
            position: "absolute", top: 14, right: 14,
            width: 32, height: 32, borderRadius: "50%",
            border: "1px solid #b2dfdb", background: "#e0f2f1",
            cursor: "pointer", color: "#00695c",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1,
          }}>
            <X size={15} />
          </button>

    {/* Header row: title + Print/Create Account, on its own line below the X */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "Montserrat,sans-serif", fontSize: 18, fontWeight: 800, color: "#0d2b1e", margin: 0 }}>
                Application Details
              </h2>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => handlePrintApplication(viewApp)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 16px", borderRadius: 9,
                    border: "1.5px solid #b2dfdb", background: "#f0fdf5",
                    color: "#5a7a65", fontSize: 12, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  <Printer size={13} /> Print
                </button>
              </div>
            </div>

              {/* Section Helper */}
              {(() => {
                const Section = ({ title, children }) => (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{
                      fontSize: 10, fontWeight: 800, color: "#00897b", letterSpacing: "0.1em",
                      textTransform: "uppercase", marginBottom: 10, paddingBottom: 6,
                      borderBottom: "1.5px solid #e0f2f1",
                    }}>{title}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
                      {children}
                    </div>
                  </div>
                );

                const Field = ({ label, value, full }) => (
                  <div style={{ gridColumn: full ? "1 / -1" : "auto" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{label}</div>
                    <div style={{
                      fontSize: 13, fontWeight: 600, color: value ? "#0d2b1e" : "#9ca3af",
                      padding: "7px 10px", background: "#f8fffe", borderRadius: 8,
                      border: "1px solid #e0f2f1", fontStyle: value ? "normal" : "italic",
                    }}>
                      {value || "—"}
                    </div>
                  </div>
                );

              const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric", timeZone: "Asia/Manila" }) : null;

                return (
                  <>
  {viewApp.franchise === "iPharma Mart" ? (
    // ── iPharma-specific view ──
    <>
      <Section title="Basic Information">
        <Field label="First Name"         value={viewApp.firstName} />
        <Field label="Last Name"          value={viewApp.lastName}/>
        <Field label="M.I."               value={viewApp.middleInitial || "N/A"} />
        <Field label="Suffix"             value={viewApp.suffix || "N/A"} />
        <Field label="Email Address"      value={viewApp.email} />
        <Field label="Phone Number"       value={viewApp.phone} />
        <Field label="Date Signed"        value={fmtDate(viewApp.dateSigned)} />
      </Section>

      <Section title="Personal Information">
        <Field label="Date of Birth"      value={fmtDate(viewApp.dob)} />
        <Field label="Marital Status"     value={viewApp.maritalStatus || viewApp.civil_status} />
        <Field label="No. of Dependents"  value={viewApp.dependents?.toString()} />
        <Field label="TIN"                value={viewApp.tin} />
        <Field label="ID Type Used"       value={viewApp.idType} />
        <Field label="Address"            value={viewApp.address}           full />
      </Section>

      {(viewApp.spouseName || viewApp.spouseOccupation) && (
        <Section title="Spouse Information">
          <Field label="Spouse Name"       value={viewApp.spouseName} />
          <Field label="Spouse Occupation" value={viewApp.spouseOccupation} />
          <Field label="Spouse Date of Birth" value={fmtDate(viewApp.spouseDob)} />
        </Section>
      )}

      {viewApp.education?.length > 0 && (
        <Section title="Educational Background">
          {viewApp.education.map((e, i) => (
            <React.Fragment key={i}>
              <Field label={`Degree #${i+1}`}  value={e.degree} />
              <Field label="School"            value={e.school} />
              <Field label="Course"            value={e.course} />
              <Field label="Year Graduated"    value={e.yearGrad?.toString()} />
            </React.Fragment>
          ))}
        </Section>
      )}

      <Section title="Business Interest">
        <Field label="Extent of Involvement"  value={viewApp.involvement}    full />
        <Field label="Equity Owned (%)"       value={viewApp.equity} />
        <Field label="Cash Investment (₱)"    value={viewApp.investment ? `₱${Number(viewApp.investment).toLocaleString()}` : null} />
        <Field label="Source of Funds"        value={viewApp.fundSource} />
        <Field label="Other Businesses"       value={viewApp.otherBusiness}  full />
        <Field label="Preferred Location"     value={viewApp.location}       full />
      </Section>

      <Section title="Declaration">
        <Field label="Family Dependence"      value={viewApp.familyDepend}   full />
        <Field label="Market Area"            value={viewApp.marketArea}     full />
        <Field label="Target Start Date"      value={fmtDate(viewApp.startDate)} />
      </Section>
    </>
  ) : (
    // ── Regular franchise view (existing fields) ──
    <>
      <Section title="Basic Information">
        <Field label="First Name"         value={viewApp.firstName}/>
        <Field label="Last Name"          value={viewApp.lastName}/>
        <Field label="M.I."               value={viewApp.middleInitial || "N/A"} />
        <Field label="Suffix"             value={viewApp.suffix || "N/A"} />
        <Field label="Email Address"      value={viewApp.email} />
        <Field label="Phone Number"       value={viewApp.phone} />
        <Field label="Franchise Interest" value={viewApp.franchise} />
        <Field label="Payment Mode"       value={viewApp.paymentMode} />
        <Field label="Date Signed"        value={fmtDate(viewApp.dateSigned)} />
      </Section>

      <Section title="Personal Information">
        <Field label="Date of Birth"      value={fmtDate(viewApp.dob)} />
        <Field label="Civil Status"       value={viewApp.civilStatus} />
        <Field label="Gender"             value={viewApp.gender} />
        <Field label="Nationality"        value={viewApp.nationality} />
        <Field label="No. of Dependents"  value={viewApp.dependents?.toString()} />
        <Field label="ID Type Used"       value={viewApp.idType} />
        <Field label="Address"            value={viewApp.address}           full />
      </Section>

      {(viewApp.spouseName || viewApp.spouseOccupation) && (
        <Section title="Spouse Information">
          <Field label="Spouse Name"       value={viewApp.spouseName} />
          <Field label="Spouse Occupation" value={viewApp.spouseOccupation} />
        </Section>
      )}

      <Section title="Employment Information">
        <Field label="Employment Type"    value={viewApp.employmentType} />
        <Field label="Years w/ Employer"  value={viewApp.yearsEmployer?.toString()} />
        <Field label="Monthly Income"     value={viewApp.income ? `₱${Number(viewApp.income).toLocaleString()}` : null} />
        <Field label="Position"           value={viewApp.position} />
        <Field label="Company Name"       value={viewApp.employerName}      full />
        <Field label="Business Address"   value={viewApp.businessAddress}   full />
        <Field label="Nature of Business" value={viewApp.businessNature} />
      </Section>
    </>
  )}
                    
                      <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 10, fontWeight: 800, color: "#00897b",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  marginBottom: 10, paddingBottom: 6,
                  borderBottom: "1.5px solid #e0f2f1",
                }}>Required Documents</div>

                {/* Letter of Intent */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Letter of Intent (PDF)</div>
                  {viewApp.letterOfIntent ? (
                    <button
                        onClick={() => {
                          let base64 = viewApp.letterOfIntent;
                          
                          // Strip the data URL prefix if present
                          if (base64.includes(",")) {
                            base64 = base64.split(",")[1];
                          }
                          
                          const byteCharacters = atob(base64);
                          const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
                          const byteArray = new Uint8Array(byteNumbers);
                          const blob = new Blob([byteArray], { type: "application/pdf" });
                          const url = URL.createObjectURL(blob);
                          window.open(url, "_blank");
                        }}
                        style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "10px 14px", borderRadius: 8,
                            border: "1.5px solid #b2dfdb", background: "#e0f2f1",
                            color: "#00695c", fontSize: 13, fontWeight: 700,
                            cursor: "pointer", fontFamily: "inherit", width: "fit-content",
                          }}
                      >
                      <FileText size={15} /> View Letter of Intent
                        </button>
                  ) : (
                    <div style={{ fontSize: 13, color: "#9ca3af", fontStyle: "italic", padding: "7px 10px", background: "#f8fffe", borderRadius: 8, border: "1px solid #e0f2f1" }}>
                      No Letter of Intent uploaded
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>ID Attachment</div>
                  {viewApp.idImage ? (
                    <img
                      src={viewApp.idImage}
                      alt="Government ID"
                      style={{
                        maxWidth: "100%", maxHeight: 200,
                        borderRadius: 10, border: "1.5px solid #b2dfdb",
                        objectFit: "contain", background: "#f8fffe",
                      }}
                    />
                  ) : viewApp.idType ? (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "10px 14px", borderRadius: 8,
                      border: "1.5px solid #a5d6a7", background: "#e8f5e9",
                      fontSize: 13, fontWeight: 600, color: "#1b5e20",
                    }}>
                      <CheckCircle2 size={15} color="#2E7D32" />
                      ID Verified — {viewApp.idType}
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: "#9ca3af", fontStyle: "italic", padding: "7px 10px", background: "#f8fffe", borderRadius: 8, border: "1px solid #e0f2f1" }}>
                      No ID attached
                    </div>
                  )}
                </div>
              </div>
  {viewApp.appointmentDate && (
    <Section title="Interview Appointment">
      <Field
        label="Date & Time"
        value={new Date(viewApp.appointmentDate).toLocaleString("en-PH", {
          dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila",
        })}
      />
      <Field
        label="Status"
        value={
          viewApp.appointmentStatus === "reschedule_requested"
            ? "Reschedule Requested"
            : interviewPending(viewApp) ? "Awaiting / In Progress" : "Completed"
        }
      />
      <Field label="Location / Mode" value={viewApp.appointmentLocation} full />
      <Field label="Notes" value={viewApp.appointmentNotes} full />
    </Section>
  )}
  {/* ⚠️ TEMPORARY TEST BUTTON REMOVED — redundant now that the real button
      below does the same thing without a disabled lock */}
                  </>
                );
              })()}

  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8, paddingTop: 16, borderTop: "1.5px solid #e0f2f1" }}>
  {interviewPending(viewApp) || !viewApp.appointmentDate ? (
    <button
      onClick={() => setScheduleApp(viewApp)}
      disabled={processingId !== null}
      style={{
        display: "flex", alignItems: "center", gap: 7,
        padding: "10px 22px", borderRadius: 10,
        border: "1.5px solid #b2dfdb", background: "#e0f2f1",
        color: "#00695c", fontSize: 13, fontWeight: 700,
        cursor: processingId !== null ? "not-allowed" : "pointer",
        fontFamily: "inherit",
      }}
    >
      <CalendarClock size={15} /> {viewApp.appointmentDate ? "Resend Interview Options" : "Send Interview Options"}
    </button>
  ) : (
                  <>
                    <button
                      onClick={async () => { await handleReject(viewApp.id); setViewApp(prev => prev ? { ...prev, status: "rejected" } : prev); }}
                      disabled={viewApp.status === "rejected" || processingId !== null}
                      style={{
                        display: "flex", alignItems: "center", gap: 7,
                        padding: "10px 22px", borderRadius: 10, border: "none",
                        background: viewApp.status === "rejected" ? "#e0e0e0" : "linear-gradient(135deg,#ef4444,#dc2626)",
                        color: viewApp.status === "rejected" ? "#9e9e9e" : "#fff",
                        fontSize: 13, fontWeight: 700,
                        cursor: (viewApp.status === "rejected" || processingId !== null) ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                        opacity: viewApp.status === "rejected" ? 0.6 : 1,
                      }}
                    >
                      <X size={14} /> {viewApp.status === "rejected" ? "Already Rejected" : "Reject"}
                    </button>
                                    <button
                      onClick={async () => {
                        await handleApproveAndCreateAccount(viewApp);
                        setViewApp(prev => prev ? { ...prev, status: "approved" } : prev);
                      }}
                      disabled={processingId !== null || !!viewApp.accountCreatedAt}
                      style={{
                        display: "flex", alignItems: "center", gap: 7,
                        padding: "10px 22px", borderRadius: 10, border: "none",
                        background: viewApp.accountCreatedAt ? "#e0e0e0" : "linear-gradient(135deg,#00c853,#00897b)",
                        color: viewApp.accountCreatedAt ? "#9e9e9e" : "#fff",
                        fontSize: 13, fontWeight: 700,
                        cursor: (processingId !== null || viewApp.accountCreatedAt) ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                        boxShadow: "0 2px 10px rgba(0,180,90,0.3)",
                        opacity: (processingId !== null || viewApp.accountCreatedAt) ? 0.6 : 1,
                      }}
                    >
                      <UserPlus size={14} /> {viewApp.accountCreatedAt ? "Account Created" : viewApp.status === "approved" ? "Create Account" : "Approve & Create Account"}
                    </button>
                  </>
                )}
              </div>
              </div>
          </div>
          </>
        )}

        <Toast toast={alertModal} onClose={() => setAlertModal(null)} />

        {accountApp && (
          <CreateAccountModal
            applicant={accountApp}
            user={user}
            defaultRole="franchisee"
            roles={['Franchisee']}    
            onClose={() => setAccountApp(null)}
            onAlert={(message, type) => setAlertModal({ message, type })}
            onCreated={(updatedApp) => {
              const normalized = normalizeApp(updatedApp);
              setApplications(prev => prev.map(a => a.id === normalized.id ? { ...a, ...normalized } : a));
              setViewApp(prev => prev?.id === normalized.id ? { ...prev, ...normalized } : prev);
              setMenuApp(prev => prev?.id === normalized.id ? { ...prev, ...normalized } : prev);
            }}
          />
        )}

        {/* ── Actions Menu Modal ── */}
        {menuApp && (
          <div onClick={() => setMenuApp(null)} style={{
            position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 2000, padding: 20,
          }}>
            <div onClick={e => e.stopPropagation()} style={{
              background: "#fff", borderRadius: 20, padding: "28px 32px",
              width: "100%", maxWidth: 420,
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
              border: "1px solid rgba(0,168,76,0.15)",
              fontFamily: "Montserrat, sans-serif",
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 20,
              }}>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0d2b1e", margin: 0 }}>
                  Actions
                </h2>
                <button onClick={() => setMenuApp(null)} style={{
                  width: 32, height: 32, borderRadius: "50%",
                  border: "1px solid #b2dfdb", background: "#e0f2f1",
                  cursor: "pointer", color: "#00695c",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <X size={15} />
                </button>
              </div>
              <p style={{ fontSize: 13, color: "#5a7a65", marginBottom: 20 }}>
                Applicant:{" "}
                <strong style={{ color: "#0d2b1e" }}>{menuApp.name}</strong>
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  onClick={() => { setViewApp(menuApp); setMenuApp(null); showAlert("Viewing application", null, "success"); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "12px 16px", borderRadius: 11,
                    border: "1.5px solid #b2dfdb", background: "#e0f2f1",
                    color: "#00695c", fontSize: 13, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  <Eye size={15} /> View Application Details
                </button>
                <button
                  onClick={async () => {
                    await handleApproveAndCreateAccount(menuApp);
                    setMenuApp(null);
                  }}
                  disabled={processingId !== null || !!menuApp.accountCreatedAt}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "12px 16px", borderRadius: 11, border: "none",
                    background: menuApp.accountCreatedAt ? "#e0e0e0" : "linear-gradient(135deg,#00c853,#00897b)",
                    color: menuApp.accountCreatedAt ? "#9e9e9e" : "#fff",
                    fontSize: 13, fontWeight: 700,
                    cursor: (processingId !== null || menuApp.accountCreatedAt) ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    opacity: (processingId !== null || menuApp.accountCreatedAt) ? 0.6 : 1,
                  }}
                >
                  <UserPlus size={15} />
                  {menuApp.accountCreatedAt ? "Account Created" : menuApp.status === "approved" ? "Create Account" : "Approve & Create Account"}
                </button>
                <button
                  onClick={() => { handleApprove(menuApp.id); setMenuApp(null); }}
                  disabled={menuApp.status === "approved" ||  processingId !== null}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "12px 16px", borderRadius: 11, border: "none",
                    background: menuApp.status === "approved"
                      ? "#e0e0e0"
                      : "linear-gradient(135deg,#00c853,#00897b)",
                    color: menuApp.status === "approved" ? "#9e9e9e" : "#fff",
                    fontSize: 13, fontWeight: 700,
                    cursor: menuApp.status === "approved" ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    opacity: menuApp.status === "approved" ? 0.6 : 1,
                  }}
                >
                  <Check size={15} />
                  {menuApp.status === "approved" ? "Already Approved" : "Approve Application"}
                </button>
              <button
                  onClick={() => { handleReject(menuApp.id); setMenuApp(null); }}
                  disabled={menuApp.status === "rejected" || processingId !== null}
                  style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "12px 16px", borderRadius: 11, border: "none",
                      background: menuApp.status === "rejected"
                      ? "#e0e0e0"
                      : "linear-gradient(135deg,#ef4444,#dc2626)",
                      color: menuApp.status === "rejected" ? "#9e9e9e" : "#fff",
                      fontSize: 13, fontWeight: 700,
                      cursor: menuApp.status === "rejected" ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      opacity: menuApp.status === "rejected" ? 0.6 : 1,
                  }}
                  >
                  <X size={15} />
                  {menuApp.status === "rejected" ? "Already Rejected" : "Reject Application"}
                  </button>

                              </div>
                          </div>
                          </div>
                  )}

        {/* ── Main content ── */}
        <div style={{ fontFamily: "'Montserrat', sans-serif" }}>

          {/* Stat cards */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4,1fr)",
            gap: 16, marginBottom: 24,
          }}>
            {[
              {
                label: "Total Applications", value: applications.length,
                icon: <FileCheck size={20} color="#065f46" />,
                bg: "linear-gradient(135deg,#d1fae5,#6ee7b7)", sub: "All time",
              },
              {
                label: "Pending Review",
                value: applications.filter(a => a.status === "pending").length,
                icon: <AlertTriangle size={20} color="#92400e" />,
                bg: "linear-gradient(135deg,#fef9c3,#fde68a)", sub: "Awaiting action",
              },
              {
                label: "Approved",
                value: applications.filter(a => a.status === "approved").length,
                icon: <Check size={20} color="#065f46" />,
                bg: "linear-gradient(135deg,#d1fae5,#a7f3d0)", sub: "Successful",
              },
              {
                label: "Rejected",
                value: applications.filter(a => a.status === "rejected").length,
                icon: <X size={20} color="#7f1d1d" />,
                bg: "linear-gradient(135deg,#fee2e2,#fca5a5)", sub: "Not approved",
              },
            ].map((s, i) => <BmStatCard key={i} {...s} />)}
          </div>

          {/* Filter bar */}
          <div style={{ background:"#fff", border:"1px solid rgba(0,168,76,0.13)", borderRadius:16, padding:"14px 18px", marginBottom:18, boxShadow:"0 1px 8px rgba(0,140,60,0.05)" }}>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>

              {/* Search */}
              <div style={{ position:"relative" }}>
                <Search size={13} color="#5a7a65" style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)" }}/>
                <input
                  type="text"
                  placeholder="Search name, email, phone…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ padding:"9px 12px 9px 30px", borderRadius:10, border:"1.5px solid #b2dfdb", fontSize:13, color:"#0d2b1e", background:"#f0fdf5", fontFamily:"inherit", outline:"none", width:240 }}
                />
                {searchQuery && (
                  <div onClick={() => setSearchQuery("")} style={{ position:"absolute", right:9, top:"50%", transform:"translateY(-50%)", cursor:"pointer", color:"#5a7a65" }}>
                    <X size={12}/>
                  </div>
                )}
              </div>

              {/* Status */}
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                style={{ padding:"9px 12px", borderRadius:10, border:"1.5px solid #b2dfdb", fontSize:13, background:"#f0fdf5", fontFamily:"inherit", outline:"none", cursor:"pointer" }}>
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
              </select>

              {/* Franchise Interest */}
              <select value={filterFranchise} onChange={e => setFilterFranchise(e.target.value)}
                style={{ padding:"9px 12px", borderRadius:10, border:"1.5px solid #b2dfdb", fontSize:13, background:"#f0fdf5", fontFamily:"inherit", outline:"none", cursor:"pointer" }}>
                <option value="all">All Franchises</option>
                <option value="Food Caravan">Food Caravan</option>
                <option value="Coffee Spot">Coffee Spot</option>
                <option value="iPharma Mart">iPharma Mart</option>
                <option value="iFuel">iFuel</option>
              </select>

              {/* Clear */}
              {(searchQuery || filterStatus !== "all" || filterFranchise !== "all") && (
                <button
                  onClick={() => { setSearchQuery(""); setFilterStatus("all"); setFilterFranchise("all"); }}
                  style={{ padding:"9px 14px", borderRadius:10, border:"1.5px solid #b2dfdb", background:"#fff", color:"#5a7a65", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                  Clear filters
                </button>
              )}

              {/* Result count pushed right */}
              <span style={{ marginLeft:"auto", fontSize:12, color:"#5a7a65", fontWeight:600 }}>
                {filteredApps.length} of {applications.length} application{applications.length !== 1 ? "s" : ""}
              </span>

            </div>
          </div>

          {/* Table card */}
          <div style={{
            background: C.white,
            border: "1px solid rgba(0,168,76,0.12)",
            borderRadius: 18,
            boxShadow: "0 2px 14px rgba(0,140,60,0.07)",
            overflow: "hidden",
          }}>
            {/* Table header bar */}
            <div style={{
              background: "linear-gradient(135deg,#2E7D32,#00897b)",
              padding: "16px 22px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>
                Applicants
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                {/* Export CSV */}
                <button
                  onClick={handleExportCSV}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 16px", borderRadius: 9,
                    border: "1.5px solid rgba(255,255,255,0.4)",
                    background: "rgba(255,255,255,0.12)",
                    color: "#fff", fontSize: 12, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  Export CSV
                </button>

                {/* Delete History button — fixed: moved outside table markup */}
                <button
                  onClick={() => setShowAppDeleteHistory(true)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 16px", borderRadius: 9,
                    border: "1.5px solid rgba(255,255,255,0.4)",
                    background: "rgba(255,255,255,0.10)",
                    color: "#fff", fontSize: 12, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  <History size={13} /> Delete History
                  {appDeleteHistory.length > 0 && (
                    <span style={{
                      background: "#dc2626", color: "#fff",
                      fontSize: 10, fontWeight: 800,
                      padding: "1px 7px", borderRadius: 20,
                    }}>
                      {appDeleteHistory.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
            

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%", borderCollapse: "collapse",
                fontSize: 13, minWidth: 900,
              }}>
                <thead>
                  <tr>
                    {[
                      "Applicant Name", "Email", "Phone",
                      "Franchise Interest", "Date Applied", "Status", "Actions",
                    ].map(h => (
                      <th key={h} style={{
                        padding: "9px 14px", textAlign: "left",
                        fontWeight: 800, fontSize: 10.5, color: "#00897b",
                        letterSpacing: "0.07em", textTransform: "uppercase",
                        borderBottom: `1px solid ${C.border}`,
                        background: "#f8fffe", whiteSpace: "nowrap",
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{
                        padding: "40px 0", textAlign: "center",
                        color: "#9ca3af", fontSize: 13, fontStyle: "italic",
                      }}>
                        No applications found.
                      </td>
                    </tr>
                  ) : filteredApps.map(app => (
                    <tr
                      key={app.id}
                      style={{ borderBottom: `1px solid #f0f8f0` }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f6fef8"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0d2b1e" }}>
                        {app.name}
                      </td>
                      <td style={{ padding: "12px 14px", color: "#5a7a65", fontSize: 12 }}>
                        {app.email}
                      </td>
                      <td style={{ padding: "12px 14px", color: "#5a7a65", fontSize: 12 }}>
                        {app.phone}
                      </td>
                      <td style={{ padding: "12px 14px", color: "#0d2b1e", fontWeight: 600 }}>
                        {app.franchise}
                      </td>
                      <td style={{ padding: "12px 14px", color: "#5a7a65", fontSize: 12 }}>
                        {app.date ? new Date(app.date).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric", timeZone: "Asia/Manila" }) : "—"}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <StatusBadge status={app.status} />
                        {app.appointmentDate && (
                          <div style={{ fontSize: 11, color: app.appointmentStatus === "reschedule_requested" ? "#d97706" : "#5a7a65", marginTop: 4 }}>
                            {app.appointmentStatus === "reschedule_requested" ? "Reschedule requested" : `Interview: ${new Date(app.appointmentDate).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" })}`}
                          </div>

                        )}
                      </td>
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {/* Actions menu */}
  <button
    onClick={() => setViewApp(app)}
    style={{
      ...smallBtnSt,
      border: "1.5px solid #b2dfdb",
      background: "#e0f2f1", color: "#00695c",
      height: 28, padding: "0 12px",
    }}
    title="View"
  >
    <Eye size={11} />
  </button>
                          {/* Delete */}
                        <button
                            onClick={() => handleDelete(app.id)}
                            style={{ ...smallBtnSt, border: "1.5px solid #fecaca", background: "#fee2e2", color: "#dc2626", height: 28, padding: "0 12px" }}
                            title="Delete"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

  {scheduleApp && (
    <ScheduleOptionsModal
      applicant={scheduleApp}
      sending={processingId === scheduleApp.id}
      onClose={() => { if (processingId === null) setScheduleApp(null); }}
      onSend={(fields) => handleSendScheduleOptions(scheduleApp, fields)}
    />
  )}
        </div>
      </>
    );
  }

  function ScheduleOptionsModal({ applicant, onClose, onSend, sending }) {
    const handleSubmit = (e) => {
      e.preventDefault();
      const form = e.target;
      if (!form.optionADate.value || !form.optionBDate.value || !form.optionCDate.value) return;
      onSend({
        optionADate: new Date(form.optionADate.value).toISOString(),
        optionBDate: new Date(form.optionBDate.value).toISOString(),
        optionCDate: new Date(form.optionCDate.value).toISOString(),
      });
    };

    return (
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
        <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 460, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid rgba(0,168,76,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h2 style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 18, fontWeight: 800, color: '#0d2b1e', margin: 0 }}>
              Send Interview Time Options
            </h2>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #b2dfdb', background: '#e0f2f1', cursor: 'pointer', color: '#00695c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={15} />
            </button>
          </div>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
            Applicant: <strong style={{ color: '#0d2b1e' }}>{applicant?.name}</strong>
          </p>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>Option A — Date & Time</label>
              <input name="optionADate" type="datetime-local" required style={{ ...bmInput, marginTop: 4 }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>Option B — Date & Time</label>
              <input name="optionBDate" type="datetime-local" required style={{ ...bmInput, marginTop: 4 }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={bmLabel}>Option C — Date & Time</label>
              <input name="optionCDate" type="datetime-local" required style={{ ...bmInput, marginTop: 4 }} />
            </div>
            <p style={{ fontSize: 11, color: C.muted, marginBottom: 18 }}>
              The applicant will get an email with all three times and picks whichever works for them — no separate confirmation step needed from you.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={onClose} disabled={sending} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button type="submit" disabled={sending}
                style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center', padding: '10px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2E7D32,#00897b)', color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', boxShadow: '0 2px 10px rgba(0,180,90,0.35)', opacity: sending ? 0.6 : 1, cursor: sending ? "not-allowed" : "pointer" }}>
                {sending ? "Sending…" : "Send Options"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function RescheduleOptionsModal({ applicant, onClose, onSend, sending }) {
    const handleSubmit = (e) => {
      e.preventDefault();
      const form = e.target;
      if (!form.optionADate.value || !form.optionBDate.value) return;
      onSend({
        optionADate: new Date(form.optionADate.value).toISOString(),
        optionBDate: new Date(form.optionBDate.value).toISOString(),
      });
    };

    return (
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
        <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 460, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid rgba(0,168,76,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h2 style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 18, fontWeight: 800, color: '#0d2b1e', margin: 0 }}>
              Send Reschedule Options
            </h2>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #b2dfdb', background: '#e0f2f1', cursor: 'pointer', color: '#00695c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={15} />
            </button>
          </div>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
            Applicant: <strong style={{ color: '#0d2b1e' }}>{applicant?.name}</strong>
          </p>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>Option A — Date & Time</label>
              <input name="optionADate" type="datetime-local" required style={{ ...bmInput, marginTop: 4 }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={bmLabel}>Option B — Date & Time</label>
              <input name="optionBDate" type="datetime-local" required style={{ ...bmInput, marginTop: 4 }} />
            </div>
            <p style={{ fontSize: 11, color: C.muted, marginBottom: 18 }}>
              The applicant gets an email with both options and picks the one that works for them.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={onClose} disabled={sending} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button type="submit" disabled={sending}
                style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center', padding: '10px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2E7D32,#00897b)', color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', boxShadow: '0 2px 10px rgba(0,180,90,0.35)', opacity: sending ? 0.6 : 1, cursor: sending ? "not-allowed" : "pointer" }}>
                {sending ? "Sending…" : "Send Options"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function CreateAccountModal({ applicant, user, onClose, onAlert, onCreated, roles}) {
    const [sending, setSending] = useState(false);
    const [brands, setBrands] = useState([]);
    const [selectedBrandId, setSelectedBrandId] = useState('');
    const [brandsLoading, setBrandsLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState(roles?.[0] || 'Franchisee');

    useEffect(() => {
      fetch(`${process.env.REACT_APP_API_URL}/brands`).then(r => r.json())
        .then(d => setBrands(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setBrandsLoading(false));
    }, []);

    const getBrowserLocation = () => new Promise((resolve) => {
      if (!navigator.geolocation) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
        () => resolve(null),
        { timeout: 5000, maximumAge: 60000 }
      );
    });

    const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const firstName = form.firstName.value;
    const lastName = form.lastName.value;
    const middleInitial = form.middleInitial.value;
    const suffix = form.suffix.value;
    const name = [firstName, middleInitial ? middleInitial + "." : "", lastName, suffix].filter(Boolean).join(" ");
    const email = form.email.value, phone = form.phone.value;
      const role = selectedRole;    
      const branch = form.branch.value.trim();
      const selectedBrand = brands.find(b => String(b.id) === String(selectedBrandId));
      const brand = selectedBrand?.name || '';
      const tempPassword = generateTempPassword();
      setSending(true);
      try {
        const coords = await getBrowserLocation();

        // Create the account first — if the email is a duplicate, we bail
        // out before ever touching branches, so no orphan branch is created.
        const res = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name, firstName, lastName, middleInitial: middleInitial || null, suffix: suffix || null,
            email, password: tempPassword, role, brand, branch,
            performed_by: user?.name || 'System',
            performed_by_role: user?.role || 'Unknown',
            latitude: coords?.latitude,
            longitude: coords?.longitude,
          }),
        });
        if (!res.ok) { const err = await res.json(); 
          
          if (err.error === "Email already exists" || err.error?.includes("duplicate key") || err.error?.includes("users_email_key") || err.code === "23505") {
            onAlert(`An account with the email "${email}" already exists. Please use a different email or check existing accounts.`, 'error');
            } else {
              onAlert(err.error || 'Failed to create account.', 'error');
            }
            return;
          }

        // The applicant is the new franchisee — their assigned branch doesn't
        // exist yet, so create it under the selected brand now that the
        // account itself succeeded.
        const branchRes = await fetch(`${process.env.REACT_APP_API_URL}/branches`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: branch,
            brand_id: selectedBrandId,
            performed_by: user?.name || 'System',
            role: user?.role || 'Unknown',
            latitude: coords?.latitude,
            longitude: coords?.longitude,
          }),
        });
        if (!branchRes.ok) {
          const branchErr = await branchRes.json();
          onAlert(`Account was created, but the branch could not be created: ${branchErr.error || 'unknown error'}. Please add the branch manually.`, 'error');
          return;
        }

        await fetch(`${process.env.REACT_APP_API_URL}/send-credentials`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: email, name, password: tempPassword }),
        });

        // Isolated on purpose: the account and branch already exist at this
        // point. If marking account-created fails (network blip, stale
        // deploy), we still want the success alert, the modal close, and a
        // locally-disabled button — not a false "something went wrong".
        let markedApplication = null;
        try {
          const markedRes = await fetch(`${process.env.REACT_APP_API_URL}/applications/${applicant?.id}/account-created`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              performed_by: user?.name || 'System',
              role: user?.role || 'Unknown',
              latitude: coords?.latitude,
              longitude: coords?.longitude,
            }),
          });
          if (markedRes.ok) {
            const markedData = await markedRes.json();
            markedApplication = markedData.application || null;
          } else {
            console.error('Failed to mark account-created:', await markedRes.text());
          }
        } catch (markErr) {
          console.error('account-created request failed:', markErr);
        }

        onAlert(`Account created and credentials sent to ${email}!`, 'success');
        onCreated?.(markedApplication || { id: applicant?.id, account_created_at: new Date().toISOString() });
        onClose();
      } catch { onAlert('Something went wrong. Please try again.', 'error'); }
      finally { setSending(false); }
    };

    return (
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
        <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 500, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid rgba(0,168,76,0.15)', maxHeight: '92vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h2 style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 18, fontWeight: 800, color: '#0d2b1e', margin: 0 }}>Create Franchisee Account</h2>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #b2dfdb', background: '#e0f2f1', cursor: 'pointer', color: '#00695c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={15} /></button>
          </div>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Creating account for: <strong style={{ color: '#0d2b1e' }}>{applicant?.name}</strong></p>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
    <div style={{ flex: 2 }}>
      <label style={bmLabel}>Last Name</label>
      <input name="lastName" type="text" defaultValue={applicant?.lastName} required style={{ ...bmInput, marginTop: 4 }} />
    </div>
    <div style={{ flex: 2 }}>
      <label style={bmLabel}>First Name</label>
      <input name="firstName" type="text" defaultValue={applicant?.firstName} required style={{ ...bmInput, marginTop: 4 }} />
    </div>
    <div style={{ flex: 1 }}>
      <label style={bmLabel}>M.I.</label>
      <input name="middleInitial" type="text" maxLength={1} defaultValue={applicant?.middleInitial} style={{ ...bmInput, marginTop: 4 }} />
    </div>
    <div style={{ flex: 1 }}>
      <label style={bmLabel}>Suffix</label>
      <input name="suffix" type="text" defaultValue={applicant?.suffix} style={{ ...bmInput, marginTop: 4 }} />
    </div>
  </div>
  {[['Email Address', 'email', 'email', applicant?.email], ['Phone Number', 'phone', 'tel', applicant?.phone]].map(([label, name, type, def]) => (
    <div key={name} style={{ marginBottom: 14 }}>
      <label style={bmLabel}>{label}</label>
      <input name={name} type={type} defaultValue={def} required style={{ ...bmInput, marginTop: 4 }} />
    </div>
  ))}
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>Role</label>
              {roles && roles.length > 1 ? (
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              required
              style={{ ...bmInput, marginTop: 4, appearance: 'none', cursor: 'pointer' }}
            >
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          ) : (
            <input
              value={selectedRole}
              disabled
              style={{ ...bmInput, marginTop: 4, background: '#f5f5f5', cursor: 'not-allowed', opacity: 0.7 }}
            />
          )}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>Brand</label>
              <select value={selectedBrandId} onChange={e => setSelectedBrandId(e.target.value)} required disabled={brandsLoading} style={{ ...bmInput, marginTop: 4, appearance: 'none', cursor: 'pointer' }}>
                <option value="">{brandsLoading ? 'Loading…' : 'Select Brand'}</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={bmLabel}>Assigned Branch</label>
              <input
                name="branch" type="text" required
                disabled={!selectedBrandId}
                placeholder={!selectedBrandId ? 'Select a brand first' : 'e.g. Coffee Spot — Katipunan'}
                style={{ ...bmInput, marginTop: 4, cursor: !selectedBrandId ? 'not-allowed' : 'text', background: !selectedBrandId ? '#f5f5f5' : bmInput.background }}
              />
              <p style={{ fontSize: 10.5, color: C.muted, marginTop: 4 }}>This is a new branch — it'll be created under the selected brand automatically.</p>
            </div>
            <p style={{ fontSize: 11, color: C.muted, marginBottom: 18 }}>A temporary password will be auto-generated and emailed to the applicant.</p>
          <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={onClose} disabled={sending} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button type="submit" disabled={sending}
                style={{ display:'flex', alignItems:'center', gap:6, flex: 1, justifyContent:'center', padding:'10px 0', borderRadius:10, border:'none', background:'linear-gradient(135deg,#2E7D32,#00897b)', color:'#fff', fontSize:13, fontWeight:700, fontFamily:'inherit', boxShadow:'0 2px 10px rgba(0,180,90,0.35)',
                opacity: sending ? 0.6 : 1, cursor: sending ? "not-allowed" : "pointer" }}>
                {sending && <RefreshCw size={13} style={{ animation:"spin 0.8s linear infinite" }}/>}
                {sending ? "Creating…" : "✉ Create & Send"}
              </button> 
          </div>
          </form>
        </div>
      </div>
    );
  }

  // REPORTS

  const REPORT_STATUS = {
    pending:   { label:"Pending",      bg:"#faeeda", color:"#633806", dot:"#BA7517" },
    approved:  { label:"Acknowledged",     bg:"#eaf3de", color:"#27500a", dot:"#3B6D11" },
  };

  const API = process.env.REACT_APP_API_URL || "";

  function Chip({ label, color, bg, onRemove }) {
    return (
      <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:700, color, background:bg }}>
        {label} <X size={9} style={{ cursor:"pointer", marginLeft:2 }} onClick={onRemove}/>
      </span>
    );
  }

  function ReportsContent({ user, brands: propBrands = [] }) {
    const [reports,      setReports]      = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [refreshing,   setRefreshing]   = useState(false);  
    const [error,        setError]        = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [search,       setSearch]       = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [brandBranchFilter, setBrandBranchFilter] = useState({});

    const [activityLog,     setActivityLog]     = useState([]);

    const [viewReport,    setViewReport]    = useState(null);
    const [approveReport, setApproveReport] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
    const [logoB64, setlogoB64] = useState(null);
    const [iFranchise_logoB64, setiFranchise_logoB64] = useState(null);

    const [filterBrand,  setFilterBrand]  = useState(null); 
    const [filterBranch, setFilterBranch] = useState(null);

    const [alertModal, setAlertModal] = useState(null);

    const showAlert = (title, message, type = "info") => setAlertModal({ title, message, type });

    const getBrowserLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
        () => resolve(null),
        { timeout: 5000, maximumAge: 60000 }
      );
    });
  };

    const fetchActivityLog = useCallback(async () => {
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/reports-activity-log`);
      const data = await res.json();
      setActivityLog(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Failed to fetch orders activity log:", err); }
  }, []);

  const logActivity = useCallback(async (action, itemName, branchName, changes = null) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/shop-activity-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          item_name: itemName,
          branch: branchName,
          performed_by: user?.name || "System",
          role: user?.role || "Unknown",
          changes,
        }),
      });
    } catch (err) { console.warn("Activity log failed (non-fatal):", err); }
  }, [user]);

    const fetchReports = useCallback(async () => {
      if (reports.length === 0) {
        setInitialLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filterStatus !== "all") params.set("status", filterStatus);
        if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());

        const res  = await fetch(`${API}/reports?${params}`);
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.error("fetchReports:", err);
        setError("Failed to load reports. Please try again.");
      } finally {
        setInitialLoading(false);
        setRefreshing(false);
      }
    }, [filterStatus, debouncedSearch]);

    useEffect(() => { fetchReports(); fetchActivityLog(); }, [fetchReports, fetchActivityLog]);

    useEffect(() => {
      loadImageAsBase64(franchisync).then(setlogoB64).catch(err => console.warn("Failed to load left logo:", err));
      loadImageAsBase64Circular(ifranchisejpg).then(setiFranchise_logoB64).catch(err => console.warn("Failed to load right logo:", err));
    }, []);

    useEffect(() => {
      const timer = setTimeout(() => setDebouncedSearch(search), 400);
      return () => clearTimeout(timer);
    }, [search]);

    const fmtDate = (iso) => new Date(iso).toLocaleString("en-PH", {
      month:"short", day:"numeric", year:"numeric",
      hour:"numeric", minute:"2-digit", hour12:true,
    });

    // ── Sync open modals when reports state changes ─────────────────
    const syncModals = (updated) => {
      setViewReport    (prev => prev    ? (updated.find(r => r.id === prev.id)    || prev) : null);
      setApproveReport (prev => prev    ? (updated.find(r => r.id === prev.id)    || prev) : null);
    };

    const patchReport = (updated) => {
      setReports(prev => {
        const next = prev.map(r => r.id === updated.id ? updated : r);
        syncModals(next);
        return next;
      });
    };

    const brandList = useMemo(() => {
    const map = {};
    reports.forEach(r => {
      if (!map[r.brand]) map[r.brand] = { id: r.brand, name: r.brand, branches: [] };
      if (!map[r.brand].branches.includes(r.branch)) {
        map[r.brand].branches.push(r.branch);
      }
    });
    return Object.values(map);
  }, [reports]);

  const handleApprove = async (report) => {
    setActionLoading(true);
    try {
      const coords = await getBrowserLocation();
      const res = await fetch(`${process.env.REACT_APP_API_URL}/reports/${report.id}/approve`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          performedBy: user?.name || "System",
          role: user?.role || "Unknown",
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      await fetchReports();
      await fetchActivityLog();
      setViewReport(null);
      setApproveReport(null);
      setPdfPreviewUrl(null);
      showAlert("Report Acknowledged", `Report #${report.id} has been acknowledged.`, "success");
    } catch {
      showAlert("Acknowledgment Failed", "Something went wrong while approving this report.", "error");
    } finally {
      setActionLoading(false);
    }
  };

    // ── Export CSV ─────────────────────────
    const handleExport = (brand) => {
      const params = new URLSearchParams();
      if (brand)                    params.set("brand",  brand);
      if (filterStatus !== "all")   params.set("status", filterStatus);
      window.open(`${API}/reports/export?${params}`, "_blank");
    };

    const allBrands = useMemo(() => {
      return [...new Set(
        reports
          .filter(r => !filterBrand  || r.brand  === filterBrand)
          .filter(r => !filterBranch || r.branch === filterBranch)
          .map(r => r.brand)
      )];
    }, [reports, filterBrand, filterBranch]);

      const getBrandBranches = (brand) =>
        [...new Set(reports.filter(r => r.brand === brand).map(r => r.branch))];

      const getBrandReports = (brand) => {
        const branchFilter = brandBranchFilter[brand] || "all";
        return reports.filter(r => {
          if (r.brand !== brand) return false;
          if (branchFilter !== "all" && r.branch !== branchFilter) return false;
          if (filterBranch && r.branch !== filterBranch) return false; // ← new
          if (filterStatus !== "all" && r.status !== filterStatus) return false;
          if (search) {
            const q = search.toLowerCase();
            if (!String(r.id).toLowerCase().includes(q) &&
                !r.submittedBy.toLowerCase().includes(q)) return false;
          }
          return true;
        });
      };

    const counts = {
      total:     reports.length,
      pending:   reports.filter(r => r.status === "pending").length,
      reviewed:  reports.filter(r => r.status === "submitted").length, 
      approved:  reports.filter(r => r.status === "approved").length,
    };

  const downloadReport = (report) => {
    const doc = generatePdfDoc(report);
    const safePeriod = (report.period||'').replace(/→/g,'to').replace(/[^\x00-\x7F]/g,'');
    doc.save(`report_${(report.branch||'').replace(/\s+/g,'_')}_${safePeriod.replace(/[^a-z0-9]/gi,'_')}.pdf`);
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

  const generatePdfDoc = (report) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentW = pageW - margin * 2;
    let y = 0;

    const addPage = () => { doc.addPage(); y = margin; };
    const checkY = (needed = 8) => { if (y + needed > pageH - margin) addPage(); };

    const writeLine = (text, fontSize = 10, style = 'normal', color = [30,30,30], indent = 0) => {
      doc.setFontSize(fontSize); doc.setFont('helvetica', style); doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, contentW - indent);
      lines.forEach(line => { checkY(fontSize * 0.45 + 2); doc.text(line, margin + indent, y); y += fontSize * 0.45 + 1.5; });
    };
    const writeDivider = (color = [180,180,180]) => {
      checkY(6); doc.setDrawColor(...color); doc.setLineWidth(0.3);
      doc.line(margin, y, pageW - margin, y); y += 4;
    };

    y = margin;
    doc.setFillColor(22, 73, 51);
    doc.rect(0, 0, pageW, 2.5, 'F');

    const logoW = 12;    // iFranchise logo, kept in its natural rectangular shape
    const logoH = 12;
    const wideLogoW = 34;
    const wideLogoH = 12;
    const gap = 6;
    const logoY = 8;
    const totalWidth = logoW + gap + wideLogoW;
    const startX = (pageW - totalWidth) / 2;
    try {
      if (iFranchise_logoB64) {
        doc.addImage(iFranchise_logoB64, 'PNG', startX, logoY, logoW, logoH);
      }
      if (logoB64) {
        doc.addImage(logoB64, 'PNG', startX + logoW + gap, logoY, wideLogoW, wideLogoH);
      }
    } catch (err) {
      console.warn('Failed to add logos to PDF:', err);
    }

    // Small report-ID badge, top-right corner
    const badgeText = `REP-${String(report.id).padStart(5, '0')}`;
    doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
    const badgeW = doc.getTextWidth(badgeText) + 10;
    doc.setDrawColor(13, 43, 30); doc.setLineWidth(0.4);
    doc.roundedRect(pageW - margin - badgeW, 8, badgeW, 8, 2, 2, 'S');
    doc.setTextColor(13, 43, 30);
    doc.text(badgeText, pageW - margin - badgeW / 2, 13, { align: 'center' });

    doc.setFontSize(15); doc.setFont('helvetica', 'bold'); doc.setTextColor(13, 43, 30);
    doc.text('SALES & PERFORMANCE REPORT', pageW / 2, 30, { align: 'center' });

    // Small decorative rule under the title
    const ruleWidth = 46;
    doc.setDrawColor(22, 73, 51);
    doc.setLineWidth(0.6);
    doc.line(pageW / 2 - ruleWidth / 2, 33.5, pageW / 2 + ruleWidth / 2, 33.5);

    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(90, 122, 101);
    const safePeriod = (report.period||'').replace(/→/g,'to').replace(/[^\x00-\x7F]/g,'');
    doc.text('CONFIDENTIAL — FOR INTERNAL USE ONLY', pageW / 2, 38.5, { align: 'center' });

    // Thin rule closing off the header from the body
    doc.setDrawColor(220, 230, 225);
    doc.setLineWidth(0.3);
    doc.line(margin, 42, pageW - margin, 42);

    y = 50;

    const cleanContent = (report.content || '').replace(/₱/g,'PHP ').replace(/→/g,'to')
      .replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"')
      .replace(/\u2013/g,'-').replace(/\u2014/g,'--').replace(/[═─━]+/g,'')
      .replace(/[^\x00-\x7F]/g,'').replace(/\n{3,}/g,'\n\n').trim();

    if (!cleanContent) {
      writeLine('No report content available.', 10, 'normal', [100,100,100]);
    } else {
      cleanContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) { y += 3; return; }
        if (/^(I{1,3}V?|VI{0,3}|VII)\.\s+\S/.test(trimmed)) {
          checkY(14); y += 4;
          doc.setFillColor(0,137,123); doc.rect(margin, y - 4, 3, 9, 'F');
          doc.setFontSize(11); doc.setFont('helvetica','bold'); doc.setTextColor(13,43,30);
          doc.text(trimmed, margin + 6, y + 2); y += 8; writeDivider([0,137,123]);
        } else if (/^\d+\.\s+/.test(trimmed)) {
          checkY(8);
          const parts = trimmed.split(/(?<=^\d+\.)\s+/);
          const num = parts[0]; const rest = parts.slice(1).join(' ');
          doc.setFontSize(9.5); doc.setFont('helvetica','bold'); doc.setTextColor(0,137,123);
          doc.text(num.replace('.',''), margin + 2, y);
          doc.setFont('helvetica','normal'); doc.setTextColor(40,40,40);
          const wrapped = doc.splitTextToSize(rest, contentW - 10);
          wrapped.forEach((wl, i) => { if (i > 0) checkY(6); doc.text(wl, margin + 9, y); y += 5.5; });
        } else {
          writeLine(trimmed, 9.5, 'normal', [50,50,50]);
          y += 1;
        }
      });
    }

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFillColor(22, 73, 51);
      doc.rect(0, pageH - 12, pageW, 0.6, 'F'); // thin accent line above footer bar
      doc.setFillColor(245, 247, 245);
      doc.rect(0, pageH - 11.4, pageW, 11.4, 'F');
      doc.setFontSize(7.5); doc.setFont('helvetica','normal'); doc.setTextColor(120,140,130);
      doc.text(`${report.branch} Branch  |  ${safePeriod}`, margin, pageH - 5);
      doc.text(`Page ${i} of ${totalPages}`, pageW - margin, pageH - 5, { align: 'right' });
    }

    return doc; // return doc instead of calling .save()
  };

    // ── Sub-components (unchanged styling) ─────────────────────────
    const StatusBadge = ({ status }) => {
      const s = REPORT_STATUS[status] || REPORT_STATUS.pending;
      return (
        <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, background:s.bg, color:s.color }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:s.dot, display:"inline-block" }}/>
          {s.label}
        </span>
      );
    };

    const handleViewReport = (report) => {
      const doc = generatePdfDoc(report);
      const url = doc.output('bloburl');
      setViewReport(report);
      setPdfPreviewUrl(url);
    };

    const ModalShell = ({ title, subtitle, icon, onClose, children, maxWidth=500 }) => (
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:20 }}>
        <div onClick={e => e.stopPropagation()} style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth, boxShadow:"0 24px 64px rgba(0,0,0,0.18)", border:"1px solid rgba(0,168,76,0.15)", maxHeight:"92vh", overflowY:"auto" }}>
          <div style={{ background:"linear-gradient(135deg,#2E7D32,#00897b)", borderRadius:"20px 20px 0 0", padding:"16px 22px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:9 }}>
              {icon}
              <div>
                <div style={{ fontWeight:800, fontSize:15, color:"#fff" }}>{title}</div>
                {subtitle && <div style={{ fontSize:11, color:"rgba(255,255,255,0.75)", marginTop:1 }}>{subtitle}</div>}
              </div>
            </div>
            <button onClick={onClose} style={{ width:30, height:30, borderRadius:"50%", border:"1.5px solid rgba(255,255,255,0.4)", background:"rgba(255,255,255,0.15)", cursor:"pointer", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <X size={14}/>
            </button>
          </div>
          <div style={{ padding:"22px 24px" }}>{children}</div>
        </div>
      </div>
    );

    const ReportMetaGrid = ({ report }) => (
      <>
        <div style={{ marginBottom:16, padding:"12px 14px", background:"#f0fdf5", borderRadius:12, border:"1px solid #d1eedd" }}>
          <div style={{ fontSize:10.5, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5a7a65", marginBottom:5 }}>Submitted By</div>
          <div style={{ fontWeight:800, fontSize:14, color:"#0d2b1e" }}>{report.submittedBy}</div>
          <div style={{ fontSize:12, color:"#5a7a65", marginTop:1 }}>{report.role}</div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          {[{ label:"Brand", value:report.brand },{ label:"Branch", value:report.branch },
            { label:"Period", value:fmtPeriod(report.period) },{ label:"Submitted", value:fmtDate(report.submittedAt) }
          ].map(({ label, value }) => (
            <div key={label} style={{ padding:"10px 12px", background:"#f8fffe", borderRadius:10, border:"1px solid #e0f2f1" }}>
              <div style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5a7a65", marginBottom:3 }}>{label}</div>
              <div style={{ fontWeight:700, fontSize:13, color:"#0d2b1e" }}>{value}</div>
            </div>
          ))}
        </div>
      </>
    );

    if (initialLoading) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 0", gap:14 }}>
      <div style={{ width:36, height:36, border:"3px solid #d1eedd", borderTopColor:"#00897b", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
      <div style={{ fontSize:13, fontWeight:700, color:"#5a7a65" }}>Loading reports…</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

    if (error) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 0", gap:12 }}>
      <div style={{ fontSize:13, fontWeight:700, color:"#dc2626" }}>{error}</div>
      <button onClick={fetchReports} style={{ padding:"9px 22px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#2E7D32,#00897b)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
        Retry
      </button>
    </div>
  );

    // ── Render ──────────────────────────────────────────────────────
    return (
      <div style={{ fontFamily:"'Montserrat',sans-serif" }}>

        {viewReport && (
          <ModalShell
            title={`Report #${viewReport.id}`}
            subtitle={viewReport.brand + " · " + viewReport.branch}
            icon={<FileText size={16} color="#fff"/>}
            onClose={() => { setViewReport(null); setPdfPreviewUrl(null); }}
            maxWidth={680}
          >
            <ReportMetaGrid report={viewReport}/>

            {/* PDF shows immediately — no click needed */}
            <div style={{ marginBottom: 16, borderRadius: 12, overflow: "hidden", border: "1px solid #d1eedd" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", background: "#f0fdf5", borderBottom: "1px solid #d1eedd" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#00897b" }}>
                  REP-{String(viewReport.id).padStart(5, '0')} · {fmtPeriod(viewReport.period)}
                </span>
                <button
                  onClick={() => downloadReport(viewReport)}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#2E7D32,#00897b)", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  <Download size={11}/> Download
                </button>
              </div>
              {pdfPreviewUrl && (
                <iframe
                  src={pdfPreviewUrl}
                  style={{ width: "100%", height: 500, border: "none", display: "block" }}
                  title="Report PDF Preview"
                />
              )}
            </div>

            {viewReport.remark && (
              <div style={{ marginBottom: 16, padding: "12px 14px", background: "#fff3e0", borderRadius: 12, border: "1px solid #ffcc80" }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "#e65100", marginBottom: 4 }}>Return Remark</div>
                <div style={{ fontSize: 13, color: "#bf360c" }}>{viewReport.remark}</div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <StatusBadge status={viewReport.status}/>
              <div style={{ display: "flex", gap: 8 }}>
                {viewReport.status !== "approved" && (
                  <button
                    onClick={() => setApproveReport(viewReport)}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#2E7D32,#00897b)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: actionLoading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: actionLoading ? 0.7 : 1, boxShadow: "0 2px 10px rgba(0,180,90,0.35)" }}>
                    {actionLoading ? <RefreshCw size={13} style={{ animation: "spin 0.8s linear infinite" }}/> : <Check size={14}/>} Acknowledge
                  </button>
                )}
                <button
                  onClick={() => { setViewReport(null); setPdfPreviewUrl(null); }}
                  style={{ padding: "8px 20px", borderRadius: 10, border: "1px solid #b2dfdb", background: "#f0fdf5", color: "#5a7a65", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  Close
                </button>
              </div>
            </div>
          </ModalShell>
        )}

        {/* APPROVE modal */}
        {approveReport && (
          <ModalShell title={`Acknowledge Report #${approveReport.id}`} subtitle={approveReport.brand + " · " + approveReport.branch} icon={<Check size={16} color="#fff"/>} onClose={() => setApproveReport(null)} maxWidth={440}>
            <ReportMetaGrid report={approveReport}/>
            <div style={{ padding:"14px 16px", borderRadius:12, background:"linear-gradient(135deg,#d1fae5,#e0f2f1)", border:"1px solid #a7f3d0", marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
              <Check size={18} color="#00897b"/>
              <div>
                <div style={{ fontWeight:800, fontSize:13, color:"#0d2b1e" }}>Confirm Acknowledgment</div>
                <div style={{ fontSize:12, color:"#5a7a65", marginTop:2 }}>This will mark the report as acknowledged. This action cannot be undone.</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button onClick={() => setApproveReport(null)} style={{ padding:"9px 20px", borderRadius:10, border:"1px solid #b2dfdb", background:"#f0fdf5", color:"#5a7a65", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
              <button onClick={() => handleApprove(approveReport)} disabled={actionLoading}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 22px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#2E7D32,#00897b)", color:"#fff", fontSize:13, fontWeight:700, cursor:actionLoading?"not-allowed":"pointer", fontFamily:"inherit", opacity:actionLoading?0.7:1, boxShadow:"0 2px 10px rgba(0,180,90,0.35)" }}>
                {actionLoading ? <RefreshCw size={13} style={{ animation:"spin 0.8s linear infinite" }}/> : <Check size={14}/>} Acknowledge Report
              </button>
            </div>
          </ModalShell>
        )}
        
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
          <BmStatCard label="Total Reports" value={counts.total}    icon={<FileText size={20} color="#065f46"/>}      bg="linear-gradient(135deg,#d1fae5,#6ee7b7)" sub="All submissions"  />
          <BmStatCard label="Under Review" value={counts.reviewed} icon={<Search size={20} color="#1e40af"/>} bg="linear-gradient(135deg,#dbeafe,#93c5fd)" sub="Awaiting admin approval" />
          <BmStatCard label="Reviewed"      value={counts.reviewed} icon={<Search size={20} color="#1e40af"/>}        bg="linear-gradient(135deg,#dbeafe,#93c5fd)"  sub="Under evaluation" />
          <BmStatCard label="Acknowledged"  value={counts.approved} icon={<Check size={20} color="#065f46"/>}         bg="linear-gradient(135deg,#d1fae5,#a7f3d0)" sub="Completed"        />
        </div>

  <div style={{ background:"#fff", border:"1px solid rgba(0,168,76,0.13)", borderRadius:16, padding:"14px 18px", marginBottom:18, boxShadow:"0 1px 8px rgba(0,140,60,0.05)" }}>
    <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>

      {/* Search */}
      <div style={{ position:"relative", flex:"1 1 220px", minWidth:180 }}>
        <Search size={13} color="#5a7a65" style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)" }}/>
        <input type="text" placeholder="Search ID or submitter..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...bmInput, paddingLeft:30, height:36, width:"100%" }}/>
        {search && (
          <div onClick={() => setSearch("")} style={{ position:"absolute", right:9, top:"50%", transform:"translateY(-50%)", cursor:"pointer", color:"#5a7a65" }}>
            <X size={12}/>
          </div>
        )}
      </div>

      {/* Status */}
      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
        style={{ ...bmInput, height:36, width:"auto", appearance:"none", cursor:"pointer" }}>
        <option value="all">All Statuses</option>
        {Object.entries(REPORT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
      </select>

      {/* Brand + Branch (the fancy component) */}
      <BrandBranchFilter
        brands={brandList}
        activeBrand={filterBrand}
        activeBranch={filterBranch}
        onChangeBrand={id  => { setFilterBrand(id);  setFilterBranch(null); }}
        onChangeBranch={val => setFilterBranch(val)}
      />

      {/* Export + Refresh pushed right */}
      <button onClick={() => handleExport(filterBrand || null)}
        style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6, padding:"7px 16px", borderRadius:10, border:"1.5px solid #b2dfdb", background:"#f0fdf5", color:"#00695c", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
        <Download size={13}/> Export CSV
      </button>
  <button
    onClick={fetchReports}
    disabled={refreshing}
    style={{
      display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:10,
      border:"1.5px solid #b2dfdb", background:"#fff", color:"#5a7a65",
      fontSize:12, fontWeight:700, fontFamily:"inherit",
      cursor: refreshing ? "not-allowed" : "pointer",
      opacity: refreshing ? 0.6 : 1,
    }}
  >
    <RefreshCw size={13} style={refreshing ? { animation:"spin 0.8s linear infinite" } : undefined}/>
    {refreshing ? "Refreshing…" : "Refresh"}
  </button>
    </div>

    {/* Active filter chips — mirrors inventory pattern */}
    {(search || filterStatus !== "all" || filterBrand || filterBranch) && (
      <div style={{ display:"flex", alignItems:"center", gap:7, marginTop:10, paddingTop:10, borderTop:"1px solid #d1eedd", flexWrap:"wrap" }}>
        <span style={{ fontSize:11, color:"#5a7a65", fontWeight:600 }}>Active:</span>
        {search       && <Chip label={`"${search}"`}        color="#3949ab" bg="#e8eaf6" onRemove={() => setSearch("")}/>}
        {filterStatus !== "all" && <Chip label={REPORT_STATUS[filterStatus]?.label} color="#00695c" bg="#e0f2f1" onRemove={() => setFilterStatus("all")}/>}
        {filterBrand && !filterBranch && <Chip label={brandList.find(b => b.id === filterBrand)?.name} color="#00695c" bg="#e8f5e9" onRemove={() => { setFilterBrand(null); setFilterBranch(null); }}/>}
        {filterBranch && <Chip label={filterBranch} color="#00695c" bg="#e0f7fa" onRemove={() => setFilterBranch(null)}/>}
        <button
          onClick={() => { setSearch(""); setFilterStatus("all"); setFilterBrand(null); setFilterBranch(null); }}
          style={{ height:24, padding:"0 10px", borderRadius:7, border:"1px solid #d1eedd", background:"#fff", color:"#5a7a65", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit", marginLeft:"auto" }}>
          Clear all
        </button>
      </div>
    )}
  </div>

        {/* One BmSection per brand */}
        {allBrands.length === 0 ? (
          <div style={{ padding:"60px 0", textAlign:"center", color:"#5a7a65", fontSize:13, fontStyle:"italic" }}>
            No reports found.
          </div>
        ) : allBrands.map(brand => {
          const branches     = getBrandBranches(brand);
          const activeBranch = brandBranchFilter[brand] || "all";
          const brandReports = getBrandReports(brand);

          return (
            <BmSection key={brand}>
              <BmSectionHeader
                title={brand}
                icon={<Globe size={16} color="#fff"/>}
                right={
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.8)", textTransform:"uppercase", letterSpacing:"0.07em" }}>Branch</span>
                      <select value={activeBranch} onChange={e => setBrandBranchFilter(prev => ({ ...prev, [brand]: e.target.value }))}
                        style={{ height:30, padding:"0 10px", borderRadius:8, border:"1.5px solid rgba(255,255,255,0.4)", background:"rgba(255,255,255,0.15)", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", outline:"none", appearance:"none" }}>
                        <option value="all" style={{ color:"#0d2b1e", background:"#fff" }}>All branches</option>
                        {branches.map(b => <option key={b} value={b} style={{ color:"#0d2b1e", background:"#fff" }}>{b}</option>)}
                      </select>
                    </div>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.7)", fontWeight:600 }}>
                      {brandReports.length} report{brandReports.length !== 1 ? "s" : ""}
                    </span>
                    {/* Per-brand export */}
                    <button onClick={() => handleExport(brand)}
                      style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:8, border:"1.5px solid rgba(255,255,255,0.4)", background:"rgba(255,255,255,0.15)", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                      <Download size={11}/> Export
                    </button>
                  </div>
                }
              />
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13, minWidth:780 }}>
                  <thead>
                    <tr>
                      {["Report #","Submitted By","Role","Branch","Period","Date Submitted","Status",""].map(h => (
                        <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontWeight:800, fontSize:10.5, color:"#00897b", letterSpacing:"0.07em", textTransform:"uppercase", borderBottom:"1px solid #d1eedd", background:"#f8fffe", whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {brandReports.length === 0 ? (
                      <tr><td colSpan={8} style={{ padding:"36px 0", textAlign:"center", color:"#5a7a65", fontSize:13, fontStyle:"italic" }}>No reports match the current filters.</td></tr>
                    ) : brandReports.map(report => (
                      <tr key={report.id}
                        onMouseEnter={e => e.currentTarget.style.background="#f6fef8"}
                        onMouseLeave={e => e.currentTarget.style.background="transparent"}
                        style={{ borderBottom:"1px solid #f0f8f0" }}>
                        <td style={{ padding:"11px 14px", fontWeight:800, color:"#0d2b1e", fontSize:12 }}>
                          REP-{String(report.id).padStart(5, '0')}  {/* ← was #{report.id} */}
                        </td>
                        <td style={{ padding:"11px 14px", fontWeight:700, color:"#0d2b1e" }}>{report.submittedBy}</td>
                        <td style={{ padding:"11px 14px" }}>
                          <span style={{ padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:700, background:"rgba(0,137,123,0.1)", color:"#00695c" }}>{report.role}</span>
                        </td>
                        <td style={{ padding:"11px 14px", fontSize:12, color:"#5a7a65" }}>{report.branch}</td>
                        <td style={{ padding:"11px 14px", fontSize:12, color:"#5a7a65", whiteSpace:"nowrap" }}>{fmtPeriod(report.period)}</td>
                        <td style={{ padding:"11px 14px", fontSize:11, color:"#5a7a65", whiteSpace:"nowrap" }}>{fmtDate(report.submittedAt)}</td>
                        <td style={{ padding:"11px 14px" }}><StatusBadge status={report.status}/></td>
                        <td style={{ padding:"11px 14px" }}>
                          <button
                            onClick={() => handleViewReport(report)}
                            style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:9, border:"1.5px solid #b2dfdb", background:"#e0f2f1", color:"#00695c", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                            <Eye size={13}/> View Report
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </BmSection>
          );
        })}

        <Toast toast={alertModal} onClose={() => setAlertModal(null)} />

      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // USERS 
  // ─────────────────────────────────────────────────────────────────────────────
  function AlertModal({ message, onClose, type = "info" }) {
    const isError = type === "error";
    const isSuccess = type === "success";

    const iconBg = isError ? "#fee2e2" : isSuccess ? "#d1fae5" : "#dbeafe";
    const iconColor = isError ? "#dc2626" : isSuccess ? "#059669" : "#2563eb";
    const Icon = isError ? Trash2 : isSuccess ? Check : Info;

    return (
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 3000, padding: 20, backdropFilter: "blur(4px)",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#fff", borderRadius: 20, padding: "28px 32px",
            width: "100%", maxWidth: 380,
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            border: "1px solid rgba(0,168,76,0.15)",
            fontFamily: "Montserrat, sans-serif",
            textAlign: "center",
          }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: "50%", background: iconBg,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <Icon size={22} color={iconColor} />
          </div>
          <p style={{ fontSize: 14, color: "#0d2b1e", lineHeight: 1.6, marginBottom: 20, fontWeight: 600 }}>
            {message}
          </p>
          <button
            onClick={onClose}
            style={{
              padding: "9px 28px", borderRadius: 10,
              border: "none", background: "linear-gradient(135deg,#2E7D32,#00897b)",
              color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 2px 10px rgba(0,180,90,0.35)",
            }}
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  function UserDeleteHistoryPanel({ history, onRestore, restoringId, onClose }) {
  const fmt = (d) =>
    new Date(d).toLocaleString("en-PH", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
      timeZone: "Asia/Manila",
    });

    return (
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2000, padding: 20, backdropFilter: "blur(4px)",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#fff", borderRadius: 20, padding: "28px 32px",
            width: "100%", maxWidth: 620, maxHeight: "80vh",
            display: "flex", flexDirection: "column",
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            border: "1px solid rgba(0,168,76,0.15)",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
        <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0d2b1e", margin: 0 }}>
                Delete History
              </h2>
              {history.length > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                  background: "#fee2e2", color: "#dc2626",
                }}>
                  {history.length} deleted
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: "50%",
                border: "1px solid #b2dfdb", background: "#e0f2f1",
                cursor: "pointer", color: "#00695c",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Column headers */}
          {history.length > 0 && (
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 80px 90px 90px",
              gap: 8, padding: "6px 0 10px",
              borderBottom: "2px solid #e0f2f1",
              fontSize: 10, fontWeight: 800, color: "#00897b",
              textTransform: "uppercase", letterSpacing: "0.07em",
            }}>
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Deleted At</span>
              <span></span>
            </div>
          )}

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {history.length === 0 ? (
              <div style={{
                padding: "40px 0", textAlign: "center",
                color: "#9ca3af", fontSize: 13, fontStyle: "italic",
              }}>
                No deleted users yet.
              </div>
            ) : (
              history.map((entry, i) => (
                <div
                  key={entry.id ?? i}
                  style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr 80px 90px 90px",
                    gap: 8, alignItems: "center",
                    padding: "12px 0",
                    borderBottom: i < history.length - 1 ? "1px solid #f0f8f0" : "none",
                  }}
                >
                  {/* Name */}
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#0d2b1e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {entry.data.name}
                  </div>
                  {/* Email */}
                  <div style={{ fontSize: 12, color: "#5a7a65", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {entry.data.email}
                  </div>
                  {/* Role badge */}
                  <span style={{
                    fontSize: 10, fontWeight: 800, padding: "3px 8px",
                    borderRadius: 20, background: "#e0f2f1", color: "#00695c",
                    whiteSpace: "nowrap", textAlign: "center",
                  }}>
                    {entry.data.role}
                  </span>
                  {/* Date */}
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>
                    {fmt(entry.deletedAt)}
                  </div>
                  {/* Restore */}
                  <button
                    type="button"
                    onClick={() => onRestore(entry)}
                    disabled={restoringId !== null}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "7px 14px", borderRadius: 9,
                      border: "1.5px solid #00897b",
                      background: restoringId === entry.id ? "#f0fdf5" : "#e0f2f1",
                      color: "#00695c", fontSize: 12, fontWeight: 700,
                      cursor: restoringId !== null ? "not-allowed" : "pointer",
                      fontFamily: "inherit", whiteSpace: "nowrap",
                      opacity: restoringId !== null ? (restoringId === entry.id ? 0.7 : 0.4) : 1,
                    }}
                  >
                      {restoringId === entry.id ? (
                      <>
                        <RotateCcw size={12} style={{ animation: "spin 1s linear infinite" }} /> Restoring…
                      </>
                    ) : (
                      <>
                        <RotateCcw size={12} /> Restore
                      </>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

    const PasswordValidation = ({ errors }) => (
      <div style={{ marginTop:8, fontSize:12, padding:'10px 14px', background:'#f0fdf5', borderRadius:10, border:'1.5px solid #b2dfdb' }}>
        <div style={{ marginBottom:6, fontWeight:700, color:'#0d2b1e', fontSize:11, textTransform:'uppercase', letterSpacing:'0.06em' }}>Password must contain:</div>
        {[['minLength','At least 8 characters'],['uppercase','Uppercase letter (A-Z)'],['lowercase','Lowercase letter (a-z)'],['number','Number (0-9)'],['specialChar','Special character (!@#$%^&*...)']].map(([key,text]) => (
          <div key={key} style={{ color:errors.includes(key)?'#dc2626':'#059669', marginBottom:3, fontSize:12, display:'flex', alignItems:'center', gap:6, fontWeight:600 }}>
            <span>{errors.includes(key)?'✗':'✓'}</span> {text}
          </div>
        ))}
      </div>
    );

    const UserModal = ({
      title, onSubmit, onClose, isEdit,
      formData, handleInputChange, setFormData,
      selectedBrandId, setSelectedBrandId,
      brands, branches, brandsLoading,
      showPassword, setShowPassword,
      showPasswordValidation, passwordErrors,
      handleGeneratePassword, pwChange, saving,
    }) => (
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(13,43,30,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:20 }}>
        <div onClick={e => e.stopPropagation()} style={{ background:C.white, borderRadius:20, padding:'28px 32px', width:'100%', maxWidth:500, boxShadow:'0 24px 64px rgba(0,0,0,0.18)', border:'1px solid rgba(0,168,76,0.15)', maxHeight:'92vh', overflowY:'auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
            <h2 style={{ fontFamily:'Montserrat,sans-serif', fontSize:18, fontWeight:800, color:'#0d2b1e', margin:0 }}>{title}</h2>
            <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid #b2dfdb', background:'#e0f2f1', cursor:'pointer', color:'#00695c', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={15}/></button>
          </div>
          <form onSubmit={onSubmit}>
    <div style={{ display:'flex', gap:10, marginBottom:14 }}>
      <div style={{ flex:2 }}>
        <label style={bmLabel}>Last Name</label>
        <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} style={{ ...bmInput, marginTop:4 }} />
      </div>
      <div style={{ flex:2 }}>
        <label style={bmLabel}>First Name</label>
        <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} style={{ ...bmInput, marginTop:4 }} />
      </div>
      <div style={{ flex:1 }}>
        <label style={bmLabel}>M.I.</label>
        <input type="text" name="middleInitial" maxLength={1} value={formData.middleInitial} onChange={handleInputChange} style={{ ...bmInput, marginTop:4 }} />
      </div>
      <div style={{ flex:1 }}>
        <label style={bmLabel}>Suffix</label>
        <input type="text" name="suffix" value={formData.suffix} onChange={handleInputChange} style={{ ...bmInput, marginTop:4 }} />
      </div>
    </div>
    <div style={{ marginBottom:14 }}>
      <label style={bmLabel}>Email Address</label>
      <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={{ ...bmInput, marginTop:4 }} />
    </div>

    <div style={{ marginBottom:14 }}>
      <label style={bmLabel}>Role</label>
      <select name="role" value={formData.role} onChange={handleInputChange} required style={{ ...bmInput, marginTop:4, appearance:'none', cursor:'pointer' }}>
        <option value="">Select Role</option>
        {['Super Admin', 'Franchisee Operations Admin', 'Sales Admin', 'Franchisee'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
              <div style={{ marginBottom:14 }}>
                <label style={bmLabel}>Brand</label>
                <select
                  value={selectedBrandId}
                  onChange={e => { setSelectedBrandId(e.target.value); setFormData(p => ({ ...p, branch:'' })); }}
                  required={!isEdit}
                  disabled={brandsLoading}
                  style={{ ...bmInput, marginTop:4, appearance:'none', cursor:'pointer' }}>
                  <option value="">{brandsLoading ? "Loading brands…" : "Select Brand"}</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={bmLabel}>Branch</label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  required
                  disabled={!selectedBrandId}
                  style={{ ...bmInput, marginTop:4, appearance:'none', cursor:'pointer' }}>
                  <option value="">
                    {!selectedBrandId ? "Select a brand first" : branches.length === 0 ? "No branches available" : "Select Branch"}
                  </option>
                  {branches.map(br => <option key={br.id ?? br.name} value={br.name ?? br}>{br.name ?? br}</option>)}
                </select>
              </div>
            {isEdit ? (
            <div style={{ marginBottom:14 }}>
    <label style={bmLabel}>New Password (leave blank to keep)</label>
    <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:4 }}>
      <input type={showPassword?"text":"password"} name="password" value={formData.password} onChange={pwChange}
        placeholder="Leave blank to keep current"
        style={{ ...bmInput, flex:1, fontFamily:'monospace', letterSpacing:'0.05em' }} />
      <button type="button" onClick={() => setShowPassword(v=>!v)}
        style={{ ...smallBtnSt, border:'1.5px solid #b2dfdb', background:'#e0f2f1', color:'#00695c', height:36, padding:'0 12px', flexShrink:0 }}>
        {showPassword?"Hide":"Show"}
      </button>
    </div>
    {showPasswordValidation && <PasswordValidation errors={passwordErrors}/>}
  </div>
            ) : (
            <div style={{ marginBottom:14 }}>
              <p style={{ fontSize:11, color:C.muted, margin:0 }}>A temporary password will be auto-generated and emailed to the user upon account creation.</p>
            </div>
            )}
            <div style={{ display:'flex', gap:10, marginTop:22, justifyContent:'flex-end' }}>
              <button type="button" onClick={onClose} disabled={saving} style={{ padding:'9px 22px', borderRadius:10, border:'1px solid #b2dfdb', background:'#f0fdf5', color:'#5a7a65', fontSize:13, fontWeight:700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily:'inherit' }}>Cancel</button>
            <button type="submit" disabled={saving}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 24px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#2E7D32,#00897b)', color:'#fff', fontSize:13, fontWeight:700, fontFamily:'inherit', boxShadow:'0 2px 10px rgba(0,180,90,0.35)',
                opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer" }}>
                {saving && <RefreshCw size={13} style={{ animation:"spin 0.8s linear infinite" }}/>}
                {saving ? (isEdit ? "Saving…" : "Adding…") : (isEdit ? "Save Changes" : "Add User")}
            </button>
            </div>
          </form>
        </div>
      </div>
    );

  function UserConfirmModal({ user, onConfirm, onClose, deleting }) {
    if (!user) return null;
    return (
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2000, padding: 20, backdropFilter: "blur(4px)",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#fff", borderRadius: 20, padding: "28px 32px",
            width: "100%", maxWidth: 420,
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            border: "1px solid rgba(0,168,76,0.15)",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: "50%", background: "#fee2e2",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <Trash2 size={22} color="#dc2626" />
          </div>
          <h2 style={{ textAlign: "center", fontSize: 17, fontWeight: 800, color: "#0d2b1e", marginBottom: 8 }}>
            Delete user?
          </h2>
          <p style={{ textAlign: "center", fontSize: 13, color: "#5a7a65", lineHeight: 1.6, marginBottom: 16 }}>
            You are about to delete <strong>"{user.name}"</strong> ({user.email}).
          </p>
          <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginBottom: 20 }}>
            You can recover this from Delete History.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              type="button" onClick={onClose} disabled={deleting}
              style={{
                padding: "9px 22px", borderRadius: 10, border: "1px solid #b2dfdb",
                background: "#f0fdf5", color: "#5a7a65", fontSize: 13, fontWeight: 700,
                cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit",
              }}
            >
              Cancel
            </button>
              <button
                type="button" onClick={onConfirm} disabled={deleting}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "9px 24px", borderRadius: 10, border: "none",
                  background: "linear-gradient(135deg,#dc2626,#ef4444)",
                  color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "inherit",
                  boxShadow: "0 2px 10px rgba(220,38,38,0.35)",
                  opacity: deleting ? 0.6 : 1, cursor: deleting ? "not-allowed" : "pointer",
                }}
              >
                {deleting && <RefreshCw size={13} style={{ animation: "spin 0.8s linear infinite" }} />}
                {deleting ? "Deleting…" : "Delete User"}
              </button>
          </div>
        </div>
      </div>
    );
  }

  function UsersContent({ user, brands: propBrands = [] }) {
    const [activityLog,     setActivityLog]     = useState([]);
    const [users,        setUsers]        = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal,setShowEditModal]= useState(false);
    const [editingUser,  setEditingUser]  = useState(null);
    const [formData,     setFormData]     = useState({ name:'', email:'', role:'', branch:'', password:'' });
    const [showPasswordValidation, setShowPasswordValidation] = useState(false);
    const [passwordErrors,         setPasswordErrors]         = useState([]);
    const [showPassword,           setShowPassword]           = useState(false);
    const [brands,         setBrands]         = useState([]);
    const [selectedBrandId,setSelectedBrandId] = useState("");
    const [branches,       setBranches]       = useState([]);
    const [brandsLoading,  setBrandsLoading]  = useState(true);
    const [filterRole,   setFilterRole]   = useState('all');
    const [filterBrandF, setFilterBrandF] = useState('all');
    const [filterBranchF,setFilterBranchF]= useState('all');
    const [searchQuery,  setSearchQuery]  = useState('');

    const [deleteTarget,      setDeleteTarget]      = useState(null); 
    const [deleting,          setDeleting]          = useState(false);
    const [restoringId,       setRestoringId]       = useState(null);
    const [deleteHistory,     setDeleteHistory]     = useState([]); 
    const [showDeleteHistory, setShowDeleteHistory] = useState(false);
    const [alertModal,        setAlertModal]        = useState(null);  
    const [saving, setSaving] = useState(false);

    const showAlert = (message, type = "info") =>
    setAlertModal({ title: message, type });

    const showLoading = (title) => setAlertModal({ type: 'loading', title });
    const showSuccess = (title, message) => setAlertModal({ type: 'success', title, message });
    const showError   = (title, message) => setAlertModal({ type: 'error', title, message });

    const getBrowserLocation = () => {
      return new Promise((resolve) => {
        if (!navigator.geolocation) { resolve(null); return; }
        navigator.geolocation.getCurrentPosition(
          (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
          () => resolve(null),
          { timeout: 5000, maximumAge: 60000 }
        );
      });
    };

    const fetchActivityLog = useCallback(async () => {
      try {
        const res  = await fetch(`${process.env.REACT_APP_API_URL}/users-activity-log`);
        const data = await res.json();
        setActivityLog(Array.isArray(data) ? data : []);
      } catch (err) { console.error("Failed to fetch orders activity log:", err); }
    }, []);

  const logActivity = useCallback(async (action, itemName, branchName, changes = null) => {
  try {
    await fetch(`${process.env.REACT_APP_API_URL}/shop-activity-log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        item_name: itemName,
        branch: branchName,
        performed_by: user?.name || "System",
        role: user?.role || "Unknown",
        changes,
      }),
    });
  } catch (err) { console.warn("Activity log failed (non-fatal):", err); }
  }, [user]);

    useEffect(() => { fetchUsers();  fetchActivityLog(); }, [fetchActivityLog]);

    useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res  = await fetch(`${process.env.REACT_APP_API_URL}/brands`);
        const data = await res.json();
        setBrands(Array.isArray(data) ? data : []);
      } catch (err) { console.error("Failed to fetch brands:", err); }
      finally { setBrandsLoading(false); }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    if (!selectedBrandId) { setBranches([]); return; }
    const brand = brands.find(b => String(b.id) === String(selectedBrandId));
    setBranches(brand?.branches || []);
  }, [selectedBrandId, brands]);

    const fetchUsers = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users`);
        const data = await response.json();
        console.log("users from API:", data);
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        showAlert("Failed to load users.", "error");
      }
    };
    const fetchDeleteHistory = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/delete-history`);
    const data = await res.json();
    setDeleteHistory(Array.isArray(data) ? data : []);
  };

  useEffect(() => { fetchDeleteHistory(); }, []);

    const handleSendCredentials = async (user) => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/send-credentials`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: user.email,
            name: user.name,
            password: "—", 
          }),
        });
        const data = await response.json();
        if (data.success) {
          showAlert(`Credentials sent to ${user.email}!`, "success");
        } else {
          showAlert(data.error || "Failed to send credentials.", "error");
        }
      } catch (error) {
        console.error("Error sending credentials:", error);
        showAlert("Failed to send credentials.", "error");
      }
    };

    const validatePasswordStrength = (password) => {
      const errors = [];
      if (password.length < 8) errors.push("minLength");
      if (!/[A-Z]/.test(password)) errors.push("uppercase");
      if (!/[a-z]/.test(password)) errors.push("lowercase");
      if (!/\d/.test(password))    errors.push("number");
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push("specialChar");
      return { isValid: errors.length === 0, errors };
    };

  const handleAddUser = async (e) => {
  e.preventDefault();
  const tempPassword = generateTempPassword();
  const passwordCheck = validatePasswordStrength(tempPassword);
  if (!passwordCheck.isValid) {
    showAlert("Password must contain:\n• At least 8 characters\n• 1 uppercase letter\n• 1 lowercase letter\n• 1 number\n• 1 special character", "error");
    return;
  }

  setSaving(true);

  const selectedBrand = brands.find(b => String(b.id) === String(selectedBrandId));
  const coords = await getBrowserLocation();
  const fullName = [formData.firstName, formData.middleInitial ? formData.middleInitial + "." : "", formData.lastName, formData.suffix].filter(Boolean).join(" ");
  const payload = {
    ...formData,
    password: tempPassword,
    brand: selectedBrand?.name || "",
    performed_by: user?.name || "System",
    performed_by_role: user?.role || "Unknown", 
    latitude: coords?.latitude,
    longitude: coords?.longitude,
  };
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (data.success) {
      await fetch(`${process.env.REACT_APP_API_URL}/send-credentials`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: formData.email, name: formData.name, password: tempPassword }),
      });
      await fetchUsers();
      await fetchActivityLog();
      setShowAddModal(false);
      resetForm();
      showSuccess("User added", `"${formData.name}" was added and credentials were sent.`);  // ← was showAlert("User added & credentials sent!", "success")
    } else {
      showError("Failed to add user", data.error || "Something went wrong.");  // ← was showAlert(data.error || "Failed to add user.", "error")
    }
  } catch (error) {
    console.error("Error adding user:", error);
    showError("Failed to add user", "Something went wrong. Please try again.");
  } finally {
    setSaving(false);
  }
  };

  const handleEditUser = async (e) => {
  e.preventDefault();

  if (formData.password) {
    const passwordCheck = validatePasswordStrength(formData.password);
    if (!passwordCheck.isValid) {
      showAlert("Password must contain:\n• At least 8 characters\n• 1 uppercase letter\n• 1 lowercase letter\n• 1 number\n• 1 special character", "error");
      return;
    }
  }

  setSaving(true); 
  const selectedBrand = brands.find(b => String(b.id) === String(selectedBrandId));
  const coords = await getBrowserLocation();
  const fullName = [formData.firstName, formData.middleInitial ? formData.middleInitial + "." : "", formData.lastName, formData.suffix].filter(Boolean).join(" ");
  const payload = {
    ...formData,
    brand: selectedBrand?.name || formData.brand || "",
    performed_by: user?.name || "System",
    performed_by_role: user?.role || "Unknown",  
    latitude: coords?.latitude,
    longitude: coords?.longitude,
  };
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${editingUser.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (data.success) {
      await fetchUsers();
      await fetchActivityLog();
      setShowEditModal(false);
      setEditingUser(null);
      resetForm();
      showSuccess("User updated", `"${formData.name}" was saved.`);
    } else {
      showError("Failed to update user", data.error || "Something went wrong.");
    }
  } catch (error) {
    console.error("Error updating user:", error);
    showError("Failed to update user", "Something went wrong. Please try again.");
  } finally {
    setSaving(false);
  }
  };

    const handleDeleteUser = (user) => setDeleteTarget(user);

  const confirmDelete = async () => {
  if (!deleteTarget) return;
  setDeleting(true);
  const targetUser = deleteTarget;
  try {
    const coords = await getBrowserLocation();
    const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${targetUser.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deleted_by: user?.name || "System", performed_by_role: user?.role || "Unknown", latitude: coords?.latitude, longitude: coords?.longitude }),
    });
    const data = await response.json();
    if (data.success) {
      await fetch(`${process.env.REACT_APP_API_URL}/delete-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_data: targetUser }),
      });
      await fetchDeleteHistory();
      await fetchUsers();
      await fetchActivityLog();
      showSuccess("User deleted", `"${targetUser.name}" was removed.`);
    } else {
      showError("Failed to delete user", data.error || "Something went wrong.");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    showError("Failed to delete user", "Something went wrong. Please try again.");
  } finally {
    setDeleting(false);
    setDeleteTarget(null);
  }
  };
    
  const handleRestore = async (entry) => {
  setRestoringId(entry.id);
  try {
    const coords = await getBrowserLocation();
    const d = entry.user_data || entry.data || {};

    const res = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: d.name,
        email: d.email,
        role: d.role,
        branch: d.branch,
        brand: d.brand || "",
        password: d.password, 
        performed_by: user?.name || "System",
        performed_by_role: user?.role || "Unknown",
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        restored: true,
      }),
    });
    const data = await res.json();

    if (data.success) {
      await fetch(`${process.env.REACT_APP_API_URL}/delete-history/${entry.id}`, { method: "DELETE" });
      await fetchDeleteHistory();
      await fetchUsers();
      await fetchActivityLog();
      showSuccess("User restored", `"${d.name}" is back.`);
    } else {
      showError("Failed to restore user", data.error || "Something went wrong.");
    }
  } catch (err) {
    console.error("Restore error:", err);
    showError("Failed to restore user", "Something went wrong. Please try again.");
  } finally {
    setRestoringId(null);
  }
  };

    const openEditModal = (user) => {
      setEditingUser(user);
      setFormData({
    firstName: user.firstName || '', lastName: user.lastName || '',
    middleInitial: user.middleInitial || '', suffix: user.suffix || '',
    name: user.name, email: user.email, role: user.role, branch: user.branch, password: '', brand: user.brand || ''
  });
      const ownerBrand = brands.find(b =>       // ← add from here
        (b.branches || []).some(br => (br.name ?? br) === user.branch)
      );
      setSelectedBrandId(ownerBrand ? String(ownerBrand.id) : "");  // ← to here
      setShowEditModal(true);
      setShowPassword(false);
    };
    const resetForm = () => {
      setFormData({ firstName:'', lastName:'', middleInitial:'', suffix:'', name:'', email:'', role:'', branch:'', password:'', brand:'' });
      setShowPasswordValidation(false);
      setPasswordErrors([]);
      setShowPassword(false);
      setSelectedBrandId("");
      setBranches([]);
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const formatted = name === "name"
          ? value.replace(/\b\w/g, c => c.toUpperCase())
          : value;
        setFormData(prev => ({ ...prev, [name]: formatted }));
      };

    const handleGeneratePassword = () => {
      const generated = generateTempPassword();
      setFormData(prev => ({ ...prev, password: generated }));
      setShowPasswordValidation(true);
      setPasswordErrors([]);
    };

    const filterBrandBranches = filterBrandF === 'all' ? [] :
    (brands.find(b => String(b.id) === String(filterBrandF))?.branches || []);

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    if (filterRole   !== 'all' && u.role   !== filterRole)   return false;
    if (filterBrandF !== 'all' && u.brand  !== brands.find(b => String(b.id) === String(filterBrandF))?.name) return false;
    if (filterBranchF !== 'all' && u.branch !== filterBranchF) return false;
    return true;
  });

    const pwChange = (e) => {
      handleInputChange(e);
      const v = e.target.value;
      if (v) { setShowPasswordValidation(true); setPasswordErrors(validatePasswordStrength(v).errors); }
      else   { setShowPasswordValidation(false); setPasswordErrors([]); }
    };

    return (
      <div style={{ fontFamily:"'Montserrat', sans-serif" }}>


        {/* Stat Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
          {[
            { label:'Total Users',    value:users.length,                                                    icon:<Users size={20} color="#065f46"/>,  bg:'linear-gradient(135deg,#d1fae5,#6ee7b7)', sub:'All accounts' },
            { label:'Super Admin', value:users.filter(u=>u.role==='Super Admin').length,                icon:<User size={20} color="#065f46"/>,   bg:'linear-gradient(135deg,#d1fae5,#a7f3d0)', sub:'Admin access' },
            { label:'Franchisee Operations Admin', value:users.filter(u=>u.role==='Franchisee Operations Admin').length,                icon:<User size={20} color="#065f46"/>,   bg:'linear-gradient(135deg,#d1fae5,#a7f3d0)', sub:'Admin access' },
            { label:'Sales Admin', value:users.filter(u=>u.role==='Sales Admin').length,                icon:<User size={20} color="#065f46"/>,   bg:'linear-gradient(135deg,#d1fae5,#a7f3d0)', sub:'Admin access' },
            { label:'Franchisees',    value:users.filter(u=>u.role==='Franchisee').length,                   icon:<Store size={20} color="#065f46"/>,  bg:'linear-gradient(135deg,#dbeafe,#93c5fd)', sub:'Branch owners' },
            { label:'Staff',          value:users.filter(u=>u.role==='Staff'||u.role==='Manager').length,    icon:<Users size={20} color="#92400e"/>,  bg:'linear-gradient(135deg,#fef9c3,#fde68a)', sub:'Operational' },
          ].map((s, i) => <BmStatCard key={i} {...s} />)}
        </div>

        <div style={{ background:"#fff", border:"1px solid rgba(0,168,76,0.13)", borderRadius:16, padding:"14px 18px", marginBottom:18, boxShadow:"0 1px 8px rgba(0,140,60,0.05)" }}>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>

          {/* Search */}
          <div style={{ position:"relative" }}>
            <Search size={14} color="#5a7a65" style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)" }}/>
            <input
              type="text"
              placeholder="Search name or email…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ padding:"9px 12px 9px 32px", borderRadius:10, border:"1.5px solid #b2dfdb", fontSize:13, color:"#0d2b1e", background:"#f0fdf5", fontFamily:"inherit", outline:"none", width:240 }}
            />
          </div>

          {/* Role */}
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
            style={{ padding:"9px 12px", borderRadius:10, border:"1.5px solid #b2dfdb", fontSize:13, background:"#f0fdf5", fontFamily:"inherit", outline:"none", cursor:"pointer" }}>
            <option value="all">All Roles</option>
            {['Super Admin','Franchisee Operations Admin', 'Sales Admin', 'Franchisee','Manager','Staff'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          {/* Brand */}
          <select value={filterBrandF} onChange={e => { setFilterBrandF(e.target.value); setFilterBranchF('all'); }}
            style={{ padding:"9px 12px", borderRadius:10, border:"1.5px solid #b2dfdb", fontSize:13, background:"#f0fdf5", fontFamily:"inherit", outline:"none", cursor:"pointer" }}>
            <option value="all">All Brands</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>

          {/* Branch */}
          <select value={filterBranchF} onChange={e => setFilterBranchF(e.target.value)} disabled={filterBrandF === 'all'}
            style={{ padding:"9px 12px", borderRadius:10, border:"1.5px solid #b2dfdb", fontSize:13, background: filterBrandF === 'all' ? '#f5f5f5' : '#f0fdf5', fontFamily:"inherit", outline:"none", cursor: filterBrandF === 'all' ? 'not-allowed' : 'pointer', opacity: filterBrandF === 'all' ? 0.5 : 1 }}>
            <option value="all">{filterBrandF === 'all' ? 'Select brand first' : 'All Branches'}</option>
            {filterBrandBranches.map(br => <option key={br.id ?? br.name} value={br.name ?? br}>{br.name ?? br}</option>)}
          </select>

          {/* Clear */}
          {(searchQuery || filterRole !== 'all' || filterBrandF !== 'all' || filterBranchF !== 'all') && (
            <button
              onClick={() => { setSearchQuery(''); setFilterRole('all'); setFilterBrandF('all'); setFilterBranchF('all'); }}
              style={{ padding:"9px 14px", borderRadius:10, border:"1.5px solid #b2dfdb", background:"#fff", color:"#5a7a65", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
              Clear filters
            </button>
          )}

        </div>
      </div>

        {/* Table card */}
        <div style={{ background:C.white, border:'1px solid rgba(0,168,76,0.12)', borderRadius:18, boxShadow:'0 2px 14px rgba(0,140,60,0.07)', overflow:'hidden' }}>
          <div style={{ background:'linear-gradient(135deg,#2E7D32,#00897b)', padding:'16px 22px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontWeight:800, fontSize:15, color:'#fff' }}>User Accounts</span>
            <div style={{ display:'flex', gap:8 }}>
              {/* Delete History button */}
              <button
                onClick={() => setShowDeleteHistory(true)}
                style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:9, border:'1.5px solid rgba(255,255,255,0.4)', background:'rgba(255,255,255,0.10)', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}
              >
                <History size={13}/> Delete History
                {deleteHistory.length > 0 && (
                  <span style={{ background:'#dc2626', color:'#fff', fontSize:10, fontWeight:800, padding:'1px 7px', borderRadius:20, marginLeft:2 }}>
                    {deleteHistory.length}
                  </span>
                )}
              </button>
              <button onClick={() => setShowAddModal(true)}
                style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 18px', borderRadius:9, border:'1.5px solid rgba(255,255,255,0.4)', background:'rgba(255,255,255,0.12)', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                <Plus size={14}/> Add New User
              </button>
            </div>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr>
                  {['Name','Email','Role','Brand', 'Branch','Actions'].map(h => (
                    <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontWeight:800, fontSize:10.5, color:'#00897b', letterSpacing:'0.07em', textTransform:'uppercase', borderBottom:`1px solid ${C.border}`, background:'#f8fffe' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} style={{ borderBottom:`1px solid #f0f8f0` }}
                    onMouseEnter={e => e.currentTarget.style.background="#f6fef8"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <td style={{ padding:'12px 14px', fontWeight:700, color:'#0d2b1e' }}>{user.name}</td>
                    <td style={{ padding:'12px 14px', color:'#5a7a65', fontSize:12 }}>{user.email}</td>
                    <td style={{ padding:'12px 14px' }}>
                      <span style={{ background:'#e0f2f1', color:'#00695c', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>{user.role}</span>
                    </td>
                    <td style={{ padding:'12px 14px', color:'#5a7a65', fontSize:12 }}>{user.brand || '—'}</td>
                    <td style={{ padding:'12px 14px', color:'#5a7a65', fontSize:12 }}>{user.branch}</td>
                  
                    <td style={{ padding:'12px 14px' }}>
    <div style={{ display:'flex', gap:6 }}>
      <button onClick={() => openEditModal(user)} style={{ ...smallBtnSt, border:'1.5px solid #b2dfdb', background:'#e0f2f1', color:'#00695c', height:28, padding:'0 12px' }}>
        <Pencil size={11}/>
      </button>
      <button onClick={() => handleSendCredentials(user)} title="Resend Credentials" style={{ ...smallBtnSt, border:'1.5px solid #bfdbfe', background:'#dbeafe', color:'#2563eb', height:28, padding:'0 12px' }}>
        <Mail size={11}/>
      </button>
      <button onClick={() => handleDeleteUser(user)} style={{ ...smallBtnSt, border:'1.5px solid #fecaca', background:'#fee2e2', color:'#dc2626', height:28, padding:'0 12px' }}>
        <Trash2 size={11}/>
      </button>
    </div>
  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showAddModal && (
          <CreateAccountModal
            applicant={null}
            roles={['Super Admin', 'Franchisee Operations Admin', 'Sales Admin', 'Franchisee']}
            saving={saving}
            onClose={() => { setShowAddModal(false); resetForm(); }}
            onAlert={(message, type) => setAlertModal({ title: message, type })}
          />
        )}

        {showEditModal && (
          <UserModal
            key="edit"
            title="Edit User"
            onSubmit={handleEditUser}
            saving={saving}
            onClose={() => { setShowEditModal(false); setEditingUser(null); resetForm(); }}
            isEdit={true}
            formData={formData}
            setFormData={setFormData}
            handleInputChange={handleInputChange}
            selectedBrandId={selectedBrandId}
            setSelectedBrandId={setSelectedBrandId}
            brands={brands}
            branches={branches}
            brandsLoading={brandsLoading}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showPasswordValidation={showPasswordValidation}
            passwordErrors={passwordErrors}
            handleGeneratePassword={handleGeneratePassword}
            pwChange={pwChange}
          />
        )}

        {showDeleteHistory && (
          <UserDeleteHistoryPanel
            history={deleteHistory}
            restoringId={restoringId}          
            onRestore={handleRestore}
            onClose={() => setShowDeleteHistory(false)}
          />
        )}

        <UserConfirmModal
          user={deleteTarget}
          deleting={deleting}
          onConfirm={confirmDelete}
          onClose={() => { if (!deleting) setDeleteTarget(null); }}
        />

        <Toast toast={alertModal} onClose={() => setAlertModal(null)} />
          
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ANNOUNCEMENT — 
  // ─────────────────────────────────────────────────────────────────────────────
  function CommunicationContent({ user, brands: propBrands = [] }){
    const [announcements, setAnnouncements] = useState([]);
    const [pinnedIds, setPinnedIds]         = useState(new Set());
    const [fetching, setFetching]           = useState(true);
    const [modalVisible, setModalVisible]   = useState(false);
    const [editing, setEditing]             = useState(null);
    const [selectedTab, setSelectedTab]     = useState("all");
    const [title, setTitle]                 = useState("");
    const [content, setContent]             = useState("");
    const [imageUrl, setImageUrl]           = useState("");
    const [imageError, setImageError]       = useState(false);
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery]     = useState("");
    const [viewingItem, setViewingItem]     = useState(null);
    const [deleteHistory, setDeleteHistory] = useState([]);
    
    const [activityLog,     setActivityLog]     = useState([]);

    const [alertModal,   setAlertModal]   = useState(null);
    const [confirmModal, setConfirmModal] = useState(null);
    const showAlert   = (message, type = "info") => setAlertModal({ message, type });
    const showConfirm = (message, onConfirm, itemName = "") => setConfirmModal({ message, onConfirm, itemName });

    // const [commUser] = useState(() => {
    //   try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
    // });

    const isAdminUser = (u) => u?.role === "Franchisee Operations Admin";

    const PIN_KEY = "announcement_pins";
    useEffect(() => {
      try {
        const raw = localStorage.getItem(PIN_KEY);
        if (raw) setPinnedIds(new Set(JSON.parse(raw)));
      } catch {}
    }, []);

    const persistPins = (newSet) => {
      try { localStorage.setItem(PIN_KEY, JSON.stringify([...newSet])); } catch {}
    };

  const fetchDeleteHistory = async () => {
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/announcements/delete-history`);
      const data = await res.json();

      setDeleteHistory(Array.isArray(data) ? data.map(e => ({
        id:        e.id,
        deletedAt: e.deleted_at,
        data: {
          title:      e.title,
          content:    e.content,
          image_url:  e.image_url,
          created_by: e.created_by,
        }
      })) : []);
    } catch (err) { console.error(err); }
  };

  const fetchActivityLog = useCallback(async () => {
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/announcements-activity-log`);
      const data = await res.json();
      setActivityLog(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Failed to fetch orders activity log:", err); }
  }, []);

  const logActivity = useCallback(async (action, itemName, branchName, changes = null) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/shop-activity-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          item_name: itemName,
          branch: branchName,
          performed_by: user?.name || "System",
          role: user?.role || "Unknown",
          changes,
        }),
      });
    } catch (err) { console.warn("Activity log failed (non-fatal):", err); }
  }, [user]);

  useEffect(() => { fetchAnnouncements(); fetchDeleteHistory(); fetchActivityLog(); }, [fetchActivityLog]);

    const fetchAnnouncements = async () => {
      setFetching(true);
      try {
        const res  = await fetch(`${process.env.REACT_APP_API_URL}/announcements`);
        const data = await res.json();
        setAnnouncements(Array.isArray(data) ? data : []);
      } catch (err) { console.error("Fetch error:", err); setAnnouncements([]); }
      finally { setFetching(false); }
    };
    useEffect(() => { fetchAnnouncements(); }, []);

    const mergedAnnouncements = announcements.map(a => ({
      ...a,
      pinned: pinnedIds.has(String(a.id)),
    }));

    const handlePin = (item) => {
      if (!isAdminUser(user)) return;
      console.log("DEBUG user:", user);
      const id = String(item.id);
      setPinnedIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        persistPins(next);
        return next;
      });
      setViewingItem(prev =>
        prev && String(prev.id) === id ? { ...prev, pinned: !prev.pinned } : prev
      );
    };

      const handlePermanentDelete = (entry) => {
    showConfirm(
      `Permanently delete "${entry.data.title}"? This cannot be undone.`,
      async () => {
        try {
          await fetch(`${process.env.REACT_APP_API_URL}/announcements/delete-history/${entry.id}`, {
            method: "DELETE"
          });
          fetchDeleteHistory();
          showAlert(`"${entry.data.title}" permanently deleted.`, "success");
        } catch (err) {
          showAlert("Failed to permanently delete.", "error");
        }
      },
      entry.data.title
    );
  };

    const handleSave = async (e) => {
      e.preventDefault();
      console.log("DEBUG handleSave user:", user, "title:", title, "content:", content);
      if (!isAdminUser(user)) { showAlert("Only administrators can post announcements.", "error"); return; }
      if (!title.trim() || !content.trim()) { showAlert("Please fill in the title and content fields.", "error"); return; }
      try {
        const url    = editing
          ? `${process.env.REACT_APP_API_URL}/announcements/${editing.id}`
          : `${process.env.REACT_APP_API_URL}/announcements`;
        const method = editing ? "PUT" : "POST";
        const res    = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title, content,
            image_url: imageUrl.trim() || null,
            userId: user.id, role: user.role,
          }),
        });
        const data = await res.json();
        if (!res.ok) { showAlert(data.error || "Failed to save.", "error"); return; }
        setModalVisible(false); setEditing(null); setTitle(""); setContent(""); setImageUrl(""); setImageError(false);
        fetchAnnouncements();
        await logActivity(editing ? "edit" : "add", title, null, editing ? "Updated announcement" : null);
        showAlert(editing ? "Announcement updated successfully!" : "Announcement posted successfully!", "success");
      } catch (err) {
        console.error("Save error:", err);
        showAlert("Failed to save announcement.", "error");
      }
    };

    const handleDelete = (item) => {
      if (!isAdminUser(user)) return;
      showConfirm(`You are about to delete this announcement. You can recover it from Delete History.`, async () => {
        try {
          const res  = await fetch(`${process.env.REACT_APP_API_URL}/announcements/${item.id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, role: user.role }),
          });
          const data = await res.json();
          if (!res.ok) { showAlert(data.error || "Delete failed.", "error"); return; }
          const strId = String(item.id);
          if (pinnedIds.has(strId)) {
            setPinnedIds(prev => { const next = new Set(prev); next.delete(strId); persistPins(next); return next; });
          }
          if (viewingItem?.id === item.id) setViewingItem(null);
          fetchAnnouncements();
          await logActivity("delete", item.title, null);

          fetchDeleteHistory();
          showAlert(`"${item.title}" has been deleted.`, "success");
        } catch (err) {
          console.error(err);
          showAlert("Failed to delete announcement.", "error");
        }
      }, item.title);
    };

    const handleRestore = async (entry) => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/announcements`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: entry.data.title,
            content: entry.data.content,
            image_url: entry.data.image_url || null,
            userId: user.id, role: user.role,
          }),
        });
        const data = await res.json();
        if (!res.ok) { showAlert(data.error || "Failed to restore.", "error"); return; }

        await fetch(`${process.env.REACT_APP_API_URL}/announcements/delete-history/${entry.id}`, {
          method: "DELETE"
        });

        fetchAnnouncements();
        await logActivity("add", entry.data.title, null, "Restored from delete history");
        fetchDeleteHistory();
        showAlert(`"${entry.data.title}" has been restored!`, "success");
      } catch (err) {
        console.error(err);
        showAlert("Failed to restore announcement.", "error");
      }
    };

    const handleEdit = (item) => {
      if (!isAdminUser(user)) return;
      setEditing(item);
      setTitle(item.title);
      setContent(item.content);
      setImageUrl(item.image_url || "");
      setImageError(false);
      setModalVisible(true);
    };

    const now          = new Date();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const tabFiltered = (() => {
      let list;
      switch (selectedTab) {
        case "recent":        list = mergedAnnouncements.filter(a => new Date(a.created_at) >= sevenDaysAgo); break;
        case "pinned":        list = mergedAnnouncements.filter(a => a.pinned); break;
        case "deleteHistory": list = []; break;
        default:              list = mergedAnnouncements;
      }
      return [...list].sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.created_at) - new Date(a.created_at);
      });
    })();

    const filtered = searchQuery.trim()
      ? tabFiltered.filter(a =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : tabFiltered;

    const tabBadge = {
      all:           mergedAnnouncements.length,
      recent:        mergedAnnouncements.filter(a => new Date(a.created_at) >= sevenDaysAgo).length,
      pinned:        pinnedIds.size,
      deleteHistory: deleteHistory.length,
    };

    const getInitials = (t = "") =>
      t.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("");

    const isRecent = (item) => new Date() - new Date(item.created_at) < 7 * 24 * 60 * 60 * 1000;

    const fmt = (d) => new Date(d).toLocaleString("en-PH", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

    // ── Styles ──
    const commStyles = {
      root: { fontFamily: "'Montserrat', sans-serif", display: "flex", flexDirection: "column", height: "100%" },
      header: { background: "linear-gradient(135deg,#2E7D32,#00897b)", padding: "20px 24px 28px", borderRadius: "18px 18px 0 0", position: "relative", overflow: "hidden" },
      headerTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
      eyebrow: { fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.6)", letterSpacing: "0.25em", marginBottom: 4 },
      headerTitle: { fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.4px" },
      liveChip: { display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.18)", borderRadius: 20, padding: "5px 11px", border: "1px solid rgba(255,255,255,0.3)" },
      liveDot: { width: 7, height: 7, borderRadius: "50%", background: "#d4df33", boxShadow: "0 0 0 3px rgba(212,223,51,0.3)" },
      liveTxt: { fontSize: 9, fontWeight: 800, color: "#d4df33", letterSpacing: "0.15em" },
      searchBarWrap: { display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.18)", borderRadius: 12, padding: "9px 13px", marginTop: 12, border: "1px solid rgba(255,255,255,0.25)" },
      searchInput: { flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 13, fontFamily: "inherit" },
      tabsRow: { display: "flex", gap: 7, padding: "14px 20px", background: "#fff", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap" },
      tabBase: { display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 13px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", border: "none", transition: "all .15s" },
      badge: { padding: "1px 7px", borderRadius: 10, fontSize: 10, fontWeight: 800 },
      listArea: { flex: 1, overflowY: "auto", padding: "20px 20px 24px", background: "#f8fffe" },
      sectionLabel: { display: "flex", alignItems: "center", gap: 8, marginBottom: 14 },
      labelAccent: { width: 4, height: 16, borderRadius: 2, background: "linear-gradient(135deg,#00897b,#4CAF50)", flexShrink: 0 },
      labelTxt: { fontSize: 11, fontWeight: 800, color: "#0d2b1e", letterSpacing: "0.08em", textTransform: "uppercase" },
      card: (pinned) => ({ display: "flex", background: "#fff", borderRadius: 18, marginBottom: 10, border: `1px solid ${pinned ? "#FFE082" : C.border}`, boxShadow: pinned ? "0 3px 14px rgba(249,168,37,0.18)" : "0 2px 10px rgba(0,140,60,0.07)", overflow: "hidden", cursor: "pointer", transition: "transform .15s, box-shadow .15s" }),
      cardAccentBar: (pinned) => ({ width: 4, flexShrink: 0, background: pinned ? "linear-gradient(180deg,#F9A825,#FFC107)" : "linear-gradient(180deg,#00897b,#4CAF50)" }),
      cardBody: { flex: 1, padding: "13px 15px 11px" },
      cardHeaderRow: { display: "flex", alignItems: "flex-start", gap: 10 },
      initialsChip: (pinned) => ({ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: pinned ? "linear-gradient(135deg,#F9A825,#E65100)" : "linear-gradient(135deg,#2E7D32,#00897b)", fontSize: 13, fontWeight: 900, color: "#fff" }),
      cardMeta: { flex: 1, minWidth: 0 },
      cardTitleRow: { display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", marginBottom: 3 },
      cardTitle: { fontSize: 14, fontWeight: 800, color: "#0d2b1e" },
      cardDate: { fontSize: 10, color: "#8AAD96", fontFamily: "monospace" },
      cardContent: { fontSize: 12.5, color: "#5a7a65", lineHeight: 1.65, marginTop: 9, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
      tapHint: { display: "flex", alignItems: "center", gap: 3, marginTop: 7, fontSize: 10, color: "#8AAD96" },
      pinnedBadge: { display: "inline-flex", alignItems: "center", gap: 3, background: "#FFF8E1", borderRadius: 6, padding: "2px 6px", border: "1px solid #FFE082", fontSize: 8, fontWeight: 800, color: "#F9A825" },
      recentBadge: { background: "#E0F2F1", borderRadius: 6, padding: "2px 6px", border: "1px solid #B2DFDB", fontSize: 8, fontWeight: 800, color: "#00695c" },
      cardActions: { display: "flex", gap: 5, flexShrink: 0, alignItems: "flex-start" },
      actionBtn: (variant) => ({ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.border}`, background: "#f0fdf5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: variant === "delete" ? "#e53935" : variant === "pin" ? "#F9A825" : "#00695c" }),
      emptyState: { display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0 40px", gap: 10, textAlign: "center" },
      emptyIcon: { fontSize: 40, marginBottom: 4 },
      emptyTitle: { fontSize: 15, fontWeight: 800, color: "#0d2b1e" },
      emptySub: { fontSize: 12, color: "#8AAD96", maxWidth: 260, lineHeight: 1.6 },
    };
  const emptyIcon =
    selectedTab === "pinned" ? <Pin size={18} /> :
    selectedTab === "recent" ? <Clock size={18} /> :
    <Megaphone size={18} />;
    const emptyTitle = searchQuery ? "No results found" : selectedTab === "pinned" ? "Nothing pinned yet" : selectedTab === "recent" ? "No recent announcements" : "No announcements yet";
    const emptySub   = searchQuery ? "Try a different search term." : selectedTab === "pinned" ? "Administrators can pin important announcements." : selectedTab === "recent" ? "Announcements from the last 7 days appear here." : "Check back later.";

    return (
      <div style={commStyles.root}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
          .comm-card:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 20px rgba(0,140,60,0.12) !important; }
          .comm-action-btn:hover { opacity: 0.78; }
          .comm-tab:hover { background: #e8fdf0 !important; color: #00695c !important; }
          .comm-del-row:hover { background: #f6fef8 !important; }
        `}</style>

        {/* ── HEADER ── */}
        <div style={commStyles.header}>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, opacity: 0.15, background: "radial-gradient(ellipse at 30% 100%, #fff 0%, transparent 60%)", pointerEvents: "none" }} />
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
                onClick={() => { setSearchVisible(v => !v); setSearchQuery(""); }}
                style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid rgba(255,255,255,0.3)", background: searchVisible ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.18)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16 }}>
                {searchVisible ? "✕" : <Search size={16} color="#fff" />}
              </button>
              {isAdminUser(user) && (
                <button
                  onClick={() => { setEditing(null); setTitle(""); setContent(""); setImageUrl(""); setImageError(false); setModalVisible(true); }}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  <Plus size={14} /> New
                </button>
              )}
            </div>
          </div>
          {searchVisible && (
            <div style={commStyles.searchBarWrap}>
              <Search size={14} color="rgba(255,255,255,0.7)" />
              <input autoFocus type="text" placeholder="Search announcements…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={commStyles.searchInput} />
              {searchQuery && <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: 16, lineHeight: 1 }}>✕</button>}
            </div>
          )}
        </div>

        {/* ── TABS ── */}
        <div style={commStyles.tabsRow}>
          {[
            { key: "all",           label: "All" },
            { key: "recent",        label: "Recent" },
            { key: "pinned",        label: "Pinned" },
            ...(isAdminUser(user) ? [{ key: "deleteHistory", label: "🗑 Delete History" }] : []),
          ].map(({ key, label }) => {
            const active = selectedTab === key;
            const isDelTab = key === "deleteHistory";
            return (
              <button
                key={key}
                className={active ? "" : "comm-tab"}
                onClick={() => setSelectedTab(key)}
                style={{
                  ...commStyles.tabBase,
                  background: active
                    ? isDelTab ? "linear-gradient(135deg,#dc2626,#ef4444)" : "linear-gradient(135deg,#2E7D32,#00897b)"
                    : isDelTab ? "#fee2e2" : "#e8f5e9",
                  color: active ? "#fff" : isDelTab ? "#dc2626" : "#5a7a65",
                  border: active ? "none" : `1px solid ${isDelTab ? "#fecaca" : C.border}`,
                  boxShadow: active ? (isDelTab ? "0 2px 8px rgba(220,38,38,0.28)" : "0 2px 8px rgba(0,180,90,0.28)") : "none",
                }}>
                {label}
                {tabBadge[key] > 0 && (
                  <span style={{
                    ...commStyles.badge,
                    background: active ? "rgba(255,255,255,0.28)" : isDelTab ? "#fecaca" : C.greenMid,
                    color: active ? "#fff" : isDelTab ? "#dc2626" : "#2E7D32",
                  }}>
                    {tabBadge[key]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── LIST / DELETE HISTORY ── */}
        <div style={commStyles.listArea}>

          {/* ── DELETE HISTORY TAB ── */}
          {selectedTab === "deleteHistory" ? (
            <>
              <div style={commStyles.sectionLabel}>
                <div style={commStyles.labelAccent} />
                <span style={commStyles.labelTxt}>Delete History</span>
                {deleteHistory.length > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: "#fee2e2", color: "#dc2626" }}>{deleteHistory.length} deleted</span>
                )}
              </div>

              {deleteHistory.length === 0 ? (
                <div style={commStyles.emptyState}>
                  <div style={commStyles.emptyIcon}>🗑</div>
                  <div style={commStyles.emptyTitle}>No deleted announcements</div>
                  <div style={commStyles.emptySub}>Deleted announcements will appear here and can be restored.</div>
                </div>
              ) : (
                <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,140,60,0.07)" }}>
                  {/* column headers */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 160px 200px", gap: 8, padding: "10px 16px", borderBottom: `2px solid #e0f2f1`, fontSize: 10, fontWeight: 800, color: "#00897b", textTransform: "uppercase", letterSpacing: "0.07em", background: "#f8fffe" }}>
                    <span>Title</span>
                    <span>Content Preview</span>
                    <span>Deleted At</span>
                    <span></span>
                  </div>
                  {deleteHistory.map((entry, i) => (
                    <div
                      key={i}
                      className="comm-del-row"
                      style={{ display: "grid", gridTemplateColumns: "1fr 140px 160px 200px", gap: 8, alignItems: "center", padding: "12px 16px", borderBottom: i < deleteHistory.length - 1 ? `1px solid #f0f8f0` : "none", transition: "background .15s" }}
                    >
                      {/* Title + image indicator */}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#0d2b1e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.data.title}</div>
                        {entry.data.image_url && (
                          <span style={{ fontSize: 9, background: "#e0f2f1", color: "#00695c", padding: "1px 6px", borderRadius: 6, fontWeight: 700, marginTop: 3, display: "inline-block" }}>🖼 Has Image</span>
                        )}
                      </div>
                      {/* Content preview */}
                      <div style={{ fontSize: 11, color: "#5a7a65", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.data.content}</div>
                      {/* Date */}
                      <div style={{ fontSize: 10, color: "#9ca3af" }}>{fmt(entry.deletedAt)}</div>
                      {/* Restore */}
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-start" }}>
                        <button
                          onClick={() => handleRestore(entry)}
                          style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 10px", borderRadius: 9, border: "1.5px solid #00897b", background: "#e0f2f1", color: "#00695c", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
                        >
                          <RotateCcw size={11} /> Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(entry)}
                          style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 10px", borderRadius: 9, border: "1.5px solid #fecaca", background: "#fee2e2", color: "#dc2626", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
                        >
                          <Trash2 size={11} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* ── NORMAL LIST ── */}
              <div style={commStyles.sectionLabel}>
                <div style={commStyles.labelAccent} />
                <span style={commStyles.labelTxt}>
                  {searchQuery ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${searchQuery}"` : selectedTab === "recent" ? "Last 7 Days" : selectedTab === "pinned" ? "Pinned Announcements" : "All Announcements"}
                </span>
              </div>

              {fetching ? (
                <div style={{ padding: "48px 0", textAlign: "center", color: "#5a7a65", fontSize: 13, fontStyle: "italic" }}>Loading announcements…</div>
              ) : filtered.length === 0 ? (
                <div style={commStyles.emptyState}>
                  <div style={commStyles.emptyIcon}>{emptyIcon}</div>
                  <div style={commStyles.emptyTitle}>{emptyTitle}</div>
                  <div style={commStyles.emptySub}>{emptySub}</div>
                </div>
              ) : filtered.map(item => {
                const pinned = !!item.pinned;
                const recent = isRecent(item);
                return (
                  <div
                    key={item.id}
                    className="comm-card"
                    style={commStyles.card(pinned)}
                    onClick={() => setViewingItem(prev => prev?.id === item.id ? null : item)}
                  >
                    <div style={commStyles.cardAccentBar(pinned)} />
                    <div style={commStyles.cardBody}>
                      <div style={commStyles.cardHeaderRow}>
                        <div style={commStyles.initialsChip(pinned)}>{getInitials(item.title)}</div>
                        <div style={commStyles.cardMeta}>
                          <div style={commStyles.cardTitleRow}>
                            <span style={commStyles.cardTitle}>{item.title}</span>
                            {pinned && <span style={commStyles.pinnedBadge}>🔖 PINNED</span>}
                            {recent && !pinned && <span style={commStyles.recentBadge}>NEW</span>}
                            {item.image_url && <span style={{ background: "#e0f2f1", color: "#00695c", borderRadius: 6, padding: "2px 6px", fontSize: 8, fontWeight: 800, border: "1px solid #b2dfdb" }}>🖼 IMG</span>}
                          </div>
                          <div style={commStyles.cardDate}>{new Date(item.created_at).toLocaleString()}</div>
                        </div>
                        {isAdminUser(user) && (
                          <div style={commStyles.cardActions} onClick={e => e.stopPropagation()}>
                            <button className="comm-action-btn" style={commStyles.actionBtn("pin")} onClick={() => handlePin(item)} title={pinned ? "Unpin" : "Pin"}>
                              {pinned ? <span style={{ fontSize: 12 }}>🔖</span> : <span style={{ fontSize: 12 }}>📌</span>}
                            </button>
                            <button className="comm-action-btn" style={commStyles.actionBtn("edit")} onClick={() => handleEdit(item)} title="Edit">
                              <Pencil size={12} />
                            </button>
                            <button className="comm-action-btn" style={commStyles.actionBtn("delete")} onClick={() => handleDelete(item)} title="Delete">
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
              })}
            </>
          )}
        </div>

        {/* ── FULL VIEW PANEL ── */}
        {viewingItem && (
          <div onClick={() => setViewingItem(null)} style={{ position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 580, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", border: "1px solid rgba(0,168,76,0.15)", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ background: viewingItem.pinned ? "linear-gradient(135deg,#F9A825,#E65100)" : "linear-gradient(135deg,#2E7D32,#00897b)", borderRadius: "20px 20px 0 0", padding: "20px 22px 28px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, opacity: 0.12, background: "radial-gradient(ellipse at 50% 100%, #fff 0%, transparent 70%)" }} />
                <button onClick={() => setViewingItem(null)} style={{ position: "absolute", top: 14, right: 14, width: 32, height: 32, borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.2)", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X size={15} />
                </button>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, paddingRight: 40 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#fff", flexShrink: 0, border: "1.5px solid rgba(255,255,255,0.35)" }}>
                    {getInitials(viewingItem.title)}
                  </div>
                  <div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                      {viewingItem.pinned && <span style={{ background: "rgba(255,255,255,0.25)", padding: "2px 8px", borderRadius: 8, fontSize: 9, fontWeight: 900, color: "#fff", letterSpacing: "0.08em" }}>🔖 PINNED</span>}
                      {isRecent(viewingItem) && <span style={{ background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: 8, fontSize: 9, fontWeight: 900, color: "#fff" }}>NEW</span>}
                    </div>
                    <div style={{ fontSize: 19, fontWeight: 900, color: "#fff", lineHeight: 1.3, letterSpacing: "-0.3px" }}>{viewingItem.title}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", marginTop: 4, fontFamily: "monospace" }}>{new Date(viewingItem.created_at).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div style={{ padding: "22px 24px 28px" }}>
                {/* Image display */}
                {viewingItem.image_url && (
                  <div style={{ marginBottom: 18, borderRadius: 14, overflow: "hidden", border: `1px solid ${C.border}` }}>
                    <img
                      src={viewingItem.image_url}
                      alt="Announcement"
                      style={{ width: "100%", maxHeight: 280, objectFit: "cover", display: "block" }}
                      onError={e => { e.target.style.display = "none"; }}
                    />
                  </div>
                )}
                <p style={{ fontSize: 14.5, color: "#1A3A2A", lineHeight: 1.75, margin: 0 }}>{viewingItem.content}</p>

                {isAdminUser(user) && (
                  <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
                    <button onClick={() => handlePin(viewingItem)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: viewingItem.pinned ? "none" : "1.5px solid #FFE082", background: viewingItem.pinned ? "#F9A825" : "#FFF8E1", color: viewingItem.pinned ? "#fff" : "#F9A825" }}>
                      {viewingItem.pinned ? "🔖 Unpin" : "📌 Pin"}
                    </button>
                    <button onClick={() => { handleEdit(viewingItem); setViewingItem(null); }} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "none", background: "linear-gradient(135deg,#2E7D32,#00897b)", color: "#fff" }}>
                      <Pencil size={13} /> Edit
                    </button>
                    <button onClick={() => { handleDelete(viewingItem); }} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "1.5px solid #fecaca", background: "#fee2e2", color: "#dc2626" }}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── CREATE / EDIT MODAL ── */}
        {isAdminUser(user) && modalVisible && (
          <div onClick={() => setModalVisible(false)} style={{ position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2500, padding: 20 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", border: "1px solid rgba(0,168,76,0.15)", overflow: "hidden", maxHeight: "92vh", overflowY: "auto" }}>
              <div style={{ background: "linear-gradient(135deg,#2E7D32,#00897b)", padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 900, fontSize: 15, color: "#fff" }}>{editing ? "Edit Announcement" : "New Announcement"}</span>
                <button onClick={() => setModalVisible(false)} style={{ width: 30, height: 30, borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.18)", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X size={14} />
                </button>
              </div>
              <form onSubmit={handleSave} style={{ padding: "22px 24px" }}>

                {/* Title */}
                <div style={{ marginBottom: 16 }}>
                  <label style={bmLabel}>Title</label>
                  <input type="text" placeholder="Announcement title…" value={title} onChange={e => setTitle(e.target.value)} required style={{ ...bmInput, marginTop: 4 }} />
                </div>

                {/* Content */}
                <div style={{ marginBottom: 16 }}>
                  <label style={bmLabel}>Content</label>
                  <textarea placeholder="Write your announcement…" value={content} onChange={e => setContent(e.target.value)} required rows={4} style={{ ...bmInput, marginTop: 4, resize: "vertical", lineHeight: 1.65 }} />
                </div>

                {/* Image URL */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ ...bmLabel, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Image URL <span style={{ color: "#9ca3af", fontWeight: 400 }}>(Optional)</span></span>
                    {imageUrl && (
                      <button type="button" onClick={() => { setImageUrl(""); setImageError(false); }}
                        style={{ fontSize: 11, background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontWeight: 700 }}>
                        ✕ Remove
                      </button>
                    )}
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={e => { setImageUrl(e.target.value); setImageError(false); }}
                    style={{ ...bmInput, marginTop: 4 }}
                  />
                  {/* Live preview */}
                  {imageUrl && !imageError && (
                    <div style={{ marginTop: 10, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}`, position: "relative" }}>
                      <img
                        src={imageUrl}
                        alt="Preview"
                        style={{ width: "100%", maxHeight: 180, objectFit: "cover", display: "block" }}
                        onError={() => setImageError(true)}
                      />
                      <div style={{ position: "absolute", top: 6, left: 6, background: "rgba(0,0,0,0.45)", borderRadius: 6, padding: "2px 8px", fontSize: 9, fontWeight: 800, color: "#fff", letterSpacing: "0.05em" }}>PREVIEW</div>
                    </div>
                  )}
                  {imageUrl && imageError && (
                    <div style={{ marginTop: 8, padding: "9px 12px", background: "#fee2e2", borderRadius: 10, border: "1px solid #fecaca", fontSize: 12, color: "#dc2626", fontWeight: 600 }}>
                      ⚠ Could not load image. Check the URL and try again.
                    </div>
                  )}
                  {!imageUrl && (
                    <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Paste a direct link to an image (jpg, png, gif, webp…)</p>
                  )}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" onClick={() => setModalVisible(false)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1.5px solid #b2dfdb", background: "#f0fdf5", color: "#5a7a65", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                  <button type="submit" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#2E7D32,#00897b)", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 10px rgba(0,180,90,0.35)" }}>
                    <Check size={14} /> Save Announcement
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── ALERT MODAL ── */}
        {alertModal && (
          <AlertModal message={alertModal.message} type={alertModal.type} onClose={() => setAlertModal(null)} />
        )}

        {/* ── CONFIRM / DELETE MODAL ── */}
        {confirmModal && (
          <div onClick={() => setConfirmModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(13,43,30,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000, padding: 20, backdropFilter: "blur(4px)" }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", width: "100%", maxWidth: 420, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", border: "1px solid rgba(0,168,76,0.15)", fontFamily: "Montserrat, sans-serif" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Trash2 size={22} color="#dc2626" />
              </div>
              <h2 style={{ textAlign: "center", fontSize: 17, fontWeight: 800, color: "#0d2b1e", marginBottom: 8 }}>Delete Announcement?</h2>
              {confirmModal.itemName && (
                <p style={{ textAlign: "center", fontSize: 13, color: "#5a7a65", lineHeight: 1.6, marginBottom: 8 }}>
                  You are about to delete <strong>"{confirmModal.itemName}"</strong>.
                </p>
              )}
              <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginBottom: 24 }}>You can recover this from Delete History.</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button type="button" onClick={() => setConfirmModal(null)}
                  style={{ padding: "9px 22px", borderRadius: 10, border: "1px solid #b2dfdb", background: "#f0fdf5", color: "#5a7a65", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  Cancel
                </button>
                <button type="button" onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#dc2626,#ef4444)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 10px rgba(220,38,38,0.35)" }}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MOBILE ORDERS — e-commerce-style order review & fulfillment.
  // One place to act on an order: open it, see everything, act with guardrails.
  // Disposing an order deducts stock straight from the FIFO/FEFO batch queue
  // used by Stock Inventory, so both modules always agree on what's on hand.
  // No payment step — this only tracks the order → stock lifecycle.
  // ────────────────────────────────────────────────────────────────────────────

  const STATUS_CONFIG = {
    pending:  { label:"Incoming",  bg:"#faeeda", color:"#633806", dot:"#BA7517" },
    accepted: { label:"Accepted",  bg:"#e6f1fb", color:"#0c447c", dot:"#185FA5" },
    disposed: { label:"Fulfilled", bg:"#eaf3de", color:"#27500a", dot:"#3B6D11" },
    rejected: { label:"Rejected",  bg:"#fcebeb", color:"#501313", dot:"#A32D2D" },
  };

  const REJECT_REASONS = [
    "Out of stock",
    "Customer requested cancellation",
    "Unable to fulfill in time",
    "Duplicate order",
    "Other",
  ];

  /* ── FIFO / FEFO helpers — copied from Stock Inventory process ── */
  function isPharmaBrand(brand) { return (brand || "").toLowerCase().includes("ipharma"); }

  function getFifoMethod(brand, isPerishable) {
    const isPharma = (brand || "").toLowerCase().includes("ipharma") && isPerishable;

    if (isPharma || isPerishable) {
      return {
        method: "FEFO",
        topLabel: "▲ EXPIRY DATE (FEFO KEY)",
        queueLabel: isPharma
          ? "nearest expiry dispensed first — FDA compliance & patient safety"
          : "nearest expiry dispensed first — reduce spoilage waste",
      };
    }

    return {
      method: "FIFO",
      topLabel: "◄ NEXT OUT",
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

      const da = new Date(a.supply_date || a.mfg_date || a.created_at || 0).getTime();
      const db = new Date(b.supply_date || b.mfg_date || b.created_at || 0).getTime();
      return da - db;
    });
  }

  function computeNextOutCost(batches, brand, isPerishable) {
    const active = batches.filter(b => Number(b.stock) > 0);
    if (active.length === 0) return null;
    const sorted = sortBatchesByMethod(active, brand, isPerishable);
    return Number(sorted[0].cost_per_unit) || 0;
  }

  const normalizeName = (str) => (str || "").trim().toLowerCase().replace(/s$/i, "");

  function normalizeOrder(o) {
    return {
      id: `ORD-${String(o.id).padStart(4, "0")}`,
      _dbId: o.id,
      customer: o.user_name ?? `User #${o.user_id}`,
      phone: o.phone ?? "",
      brand: o.brand ?? "",
      branch: o.branch ?? "",
      address: o.address ?? "",
      items: Array.isArray(o.items) ? o.items : [],
      total: o.total_amount,
      status: o.status ?? "pending",
      createdAt: o.created_at,
    };
  }

  function timeAgo(iso) {
    if (!iso) return "—";
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString("en-PH", { month:"short", day:"numeric" });
  }

  const fmtDate = (iso) => new Date(iso).toLocaleString("en-PH", { month:"short", day:"numeric", hour:"numeric", minute:"2-digit", hour12:true });

  const fmtPeriod = (period) => {
    if (!period) return "—";

    const parts = period.split("→").map(p => p.trim());

    const formatPart = (p) => {
      const d = new Date(p);
      if (isNaN(d.getTime())) return p; 
      return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
    };

    return parts.map(formatPart).join(" → ");
  };

  const itemImage = (item) => item.image || item.image_url || item.photo || item.photo_url || null;

  const primaryBtn = {
    padding:"10px 18px", borderRadius:10, border:"none",
    background:`linear-gradient(135deg,${C.green},${C.greenDk})`,
    color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer",
    fontFamily:"inherit", boxShadow:"0 2px 10px rgba(59,121,30,0.25)"
  };
  const ghostBtn   = { padding:"10px 18px", borderRadius:10, border:`1px solid ${C.border}`, background:"#fff", color:C.muted, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" };
  const dangerBtn  = { padding:"10px 18px", borderRadius:10, border:"none", background:`linear-gradient(135deg,#ef4444,${C.red})`, color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 2px 10px rgba(220,38,38,0.22)" };
  const dangerTextBtn = { padding:"9px 14px", borderRadius:10, border:`1px solid ${C.redBorder}`, background:C.redBg, color:C.red, fontWeight:700, fontSize:12.5, cursor:"pointer", fontFamily:"inherit" };
  const printBtn = { padding:"10px 16px", borderRadius:10, border:`1.5px solid ${C.green}`, background:"#fff", color:C.greenDk, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", display:"inline-flex", alignItems:"center", gap:6 };

  function StatusBadge({ status, size="md" }) {
    const s = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const small = size === "sm";
    return (
      <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding: small ? "2px 8px" : "4px 11px", borderRadius:20, fontSize: small ? 10.5 : 12, fontWeight:800, background:s.bg, color:s.color, whiteSpace:"nowrap" }}>
        <span style={{ width:6, height:6, borderRadius:"50%", background:s.dot, display:"inline-block" }} />
        {s.label}
      </span>
    );
  }

  function Toast({ toast, onClose }) {
    useEffect(() => {
      if (!toast) return;
      if (toast.type === "loading") return;
      const t = setTimeout(onClose, 4000);
      return () => clearTimeout(t);
    }, [toast, onClose]);

    if (!toast) return null;
    const isErr = toast.type === "error";
    const isLoading = toast.type === "loading";

    return (
      <div style={{
        position:"fixed", top:22, right:22, zIndex:4000, display:"flex", alignItems:"flex-start", gap:12,
        maxWidth:380, padding:"16px 18px", borderRadius:14,
        background: isErr ? "#fef2f2" : "#f0fdf5",
        borderLeft: `5px solid ${isErr ? "#dc2626" : "#00897b"}`,
        border: `1px solid ${isErr ? "#fecaca" : "#b2dfdb"}`,
        borderLeftWidth: 5,
        boxShadow: "0 16px 40px rgba(0,0,0,0.24)",
        fontFamily:"'Montserrat',sans-serif",
        animation:"toastIn .22s ease",
      }}>
        <div style={{
          flexShrink:0, width:32, height:32, borderRadius:"50%", display:"flex",
          alignItems:"center", justifyContent:"center",
          background: isErr ? "#dc2626" : "#00897b", color:"#fff",
          boxShadow: `0 4px 10px ${isErr ? "rgba(220,38,38,0.4)" : "rgba(0,137,123,0.4)"}`,
        }}>
          {isErr
            ? <AlertTriangle size={16}/>
            : isLoading
              ? <RefreshCw size={16} style={{ animation:"spin 0.8s linear infinite" }}/>
              : <Check size={16}/>}
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:14, fontWeight:800, color: isErr ? "#7f1d1d" : "#0d2b1e" }}>
            {toast.title}
          </div>
          {toast.message && (
            <div style={{ fontSize:12.5, color: isErr ? "#991b1b" : "#3f5f4f", marginTop:3, lineHeight:1.4 }}>
              {toast.message}
            </div>
          )}
        </div>

        {!isLoading && (
          <button onClick={onClose} style={{
            background:"none", border:"none",
            color: isErr ? "#991b1b" : "#3f5f4f",
            cursor:"pointer", padding:2, flexShrink:0,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <X size={14}/>
          </button>
        )}
      </div>
    );
  }

  function OrderStepper({ status }) {
    const steps = [
      { key:"pending",  label:"Placed" },
      { key:"accepted", label:"Accepted" },
      { key:"disposed", label:"Fulfilled" },
    ];
    const rejected = status === "rejected";
    const activeIdx = rejected ? 0 : steps.findIndex(s => s.key === status);

    return (
      <div style={{ display:"flex", alignItems:"center", padding:"14px 4px 4px" }}>
        {steps.map((s, i) => {
          const done = !rejected && i < activeIdx;
          const current = !rejected && i === activeIdx;
          const isLast = i === steps.length - 1;
          const showAsRejectedTail = rejected && i > 0;
          return (
            <React.Fragment key={s.key}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, minWidth:64 }}>
                <div style={{
                  width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:11, fontWeight:800,
                  background: showAsRejectedTail ? "#f3f4f6" : (done || current) ? `linear-gradient(135deg,${C.teal},${C.green})` : "#eef6f1",
                  color: showAsRejectedTail ? "#9ca3af" : (done || current) ? "#fff" : "#9db8a8",
                  border: current ? `2px solid ${C.green}` : "none",
                  transition:"background .25s ease, color .25s ease",
                }}>
                  {done ? <Check size={13}/> : i + 1}
                </div>
                <span style={{ fontSize:10.5, fontWeight:700, color: showAsRejectedTail ? "#9ca3af" : (done||current) ? C.ink : "#9db8a8", whiteSpace:"nowrap" }}>{s.label}</span>
              </div>
              {!isLast && (
                <div style={{ flex:1, height:2, margin:"0 2px 18px", background: (!rejected && i < activeIdx) ? C.green : "#e5efe8", transition:"background .25s ease" }} />
              )}
            </React.Fragment>
          );
        })}
        {rejected && (
          <div style={{ marginLeft:10, display:"flex", alignItems:"center", gap:6, color:C.red, fontSize:11.5, fontWeight:800 }}>
            <X size={14}/> Rejected
          </div>
        )}
      </div>
    );
  }

  /* ── Reason picker used for Reject / Cancel — required field, validated ── */
  function ReasonForm({ title, confirmLabel, danger, onCancel, onConfirm, saving }) {
    const [reason, setReason] = useState("");
    const [note, setNote] = useState("");
    const [touched, setTouched] = useState(false);
    const valid = reason !== "";

    return (
      <div style={{ background:C.redBg, border:`1px solid ${C.redBorder}`, borderRadius:12, padding:14, animation:"cardIn .18s ease" }}>
        <div style={{ fontSize:12.5, fontWeight:800, color:"#7f1d1d", marginBottom:10 }}>{title}</div>
        <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#7f1d1d", marginBottom:5 }}>Reason *</label>
        <select value={reason} onChange={e => setReason(e.target.value)} onBlur={() => setTouched(true)}
          style={{ width:"100%", height:36, borderRadius:8, border:`1px solid ${touched && !valid ? C.red : "#fecaca"}`, padding:"0 10px", fontSize:12.5, fontFamily:"inherit", marginBottom: touched && !valid ? 4 : 10, background:"#fff" }}>
          <option value="">Select a reason…</option>
          {REJECT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        {touched && !valid && <div style={{ fontSize:11, color:C.red, fontWeight:700, marginBottom:10 }}>Please choose a reason before continuing.</div>}
        <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#7f1d1d", marginBottom:5 }}>Note (optional)</label>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add any extra context…"
          style={{ width:"100%", height:56, borderRadius:8, border:"1px solid #fecaca", padding:"8px 10px", fontSize:12.5, fontFamily:"inherit", resize:"vertical", marginBottom:12, background:"#fff", boxSizing:"border-box" }}/>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
          <button onClick={onCancel} disabled={saving} style={ghostBtn}>Back</button>
        <button
          onClick={() => { if (!valid) { setTouched(true); return; } onConfirm(reason, note); }}
          disabled={saving}
          style={{ ...dangerBtn, opacity: saving ? 0.6 : 1, display:"inline-flex", alignItems:"center", gap:6 }}>
          {saving && <RefreshCw size={12} style={{ animation:"spin 0.8s linear infinite" }}/>}
          {saving ? "Saving…" : confirmLabel}
        </button>
        </div>
      </div>
    );
  }

  function OrderCard({ order, onOpen, stockInfo, onAccept, acceptDisabled, accepting, onShip, shipDisabled, shipping }) {
    const isPending = order.status === "pending";
    const isAccepted = order.status === "accepted";
    const shortItems = (stockInfo?.results || []).filter(r => !r.sufficient);
    const insufficient = isPending && stockInfo && !stockInfo.checking && shortItems.length > 0;

  const statusStyle = {
      pending:  { bg:"#fff7ed", border:"#fed7aa", color:"#9a3412", label:"Incoming" },
      accepted: { bg:C.greenLt, border:C.greenMid, color:C.greenDk, label:"To Ship" }, 
      shipping: { bg:"#eff6ff", border:"#bfdbfe", color:"#1d4ed8", label:"Shipping" },
      received: { bg:C.greenLt, border:C.greenMid, color:C.greenDk, label:"Delivered" },
      rejected: { bg:C.redBg,  border:C.redBorder, color:"#7f1d1d", label:"Rejected" },
    }[order.status] || { bg:"#f3f4f6", border:"#e5e7eb", color:"#374151", label:order.status };

    return (
      <div
        onClick={() => onOpen(order)}
        style={{
          background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:14,
          cursor:"pointer", display:"flex", flexDirection:"column", gap:10,
          boxShadow:"0 1px 4px rgba(0,0,0,0.04)", transition:"box-shadow .15s, transform .15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.09)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontWeight:800, fontSize:14, color:C.ink }}>#{order.id}</div>
            <div style={{ fontSize:11.5, color:C.muted, marginTop:2 }}>{fmtDate(order.createdAt)}</div>
          </div>
          <span style={{ fontSize:10, fontWeight:800, padding:"3px 9px", borderRadius:20, background:statusStyle.bg, color:statusStyle.color, border:`1px solid ${statusStyle.border}`, whiteSpace:"nowrap" }}>
            {statusStyle.label}
          </span>
        </div>

        {(order.brand || order.branch) && (
          <div style={{ fontSize:13, fontWeight:800, color:C.ink, display:"flex", alignItems:"center", gap:5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            <Store size={13} color={C.green}/> {order.brand || "—"}{order.branch ? ` · ${order.branch}` : ""}
          </div>
        )}

        <div style={{ fontSize:11.5, color:C.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {order.customer}
        </div>

        <div style={{ fontSize:11.5, color:C.muted }}>
          {order.items.length} item{order.items.length !== 1 ? "s" : ""} · <span style={{ fontWeight:700, color:C.green }}>{fmtPeso1(order.total)}</span>
        </div>

        {isPending && stockInfo?.checking && (
          <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:C.muted }}>
            <RefreshCw size={11} style={{ animation:"spin 0.8s linear infinite" }}/> Checking stock…
          </div>
        )}

        {insufficient && (
          <div style={{ display:"flex", gap:6, alignItems:"flex-start", background:C.warnBg, border:`1px solid ${C.warnBorder}`, borderRadius:8, padding:"7px 9px", fontSize:10.5, color:"#9a3412" }}>
            <AlertTriangle size={12} style={{ flexShrink:0, marginTop:1 }}/>
            <span>Insufficient stock for {shortItems.length} item{shortItems.length !== 1 ? "s" : ""}</span>
          </div>
        )}

        {isPending && (
          <button
            onClick={(e) => { e.stopPropagation(); onAccept(order); }}
            disabled={acceptDisabled}
            style={{
              ...primaryBtn,
              opacity: acceptDisabled ? 0.5 : 1,
              cursor: acceptDisabled ? "not-allowed" : "pointer",
              display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6,
              padding:"8px 0", fontSize:12,
            }}
          >
            {accepting && <RefreshCw size={12} style={{ animation:"spin 0.8s linear infinite" }}/>}
            {accepting ? "Accepting…" : insufficient ? "Insufficient Stock" : "Accept"}
          </button>
        )}

        {isAccepted && (
          <button
            onClick={(e) => { e.stopPropagation(); onShip(order); }}
            disabled={shipDisabled}
            style={{ ...primaryBtn, opacity: shipDisabled ? 0.5 : 1, cursor: shipDisabled ? "not-allowed" : "pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, padding:"8px 0", fontSize:12 }}
          >
            {shipping && <RefreshCw size={12} style={{ animation:"spin 0.8s linear infinite" }}/>}
            {shipping ? "Shipping…" : "Ship Order"}
          </button>
        )}

        {/* NEW — read-only states, no action available on admin side */}
        {order.status === "shipping" && (
          <div style={{ textAlign:"center", fontSize:11.5, fontWeight:700, color:"#1d4ed8", padding:"6px 0" }}>
            Awaiting branch confirmation…
          </div>
        )}
        {order.status === "received" && (
          <div style={{ textAlign:"center", fontSize:11.5, fontWeight:700, color:C.green, padding:"6px 0" }}>
            Delivered
          </div>
        )}
      </div>
    );
  }

  /* ── Half-page receipt slip — 8.5in × 4.25in landscape, sized for manual receipt pads ── */
  function ReceiptSlip({ order }) {
    return (
      <div className="receipt-page" style={{
        width:"8.5in", height:"4.25in", padding:"0.28in 0.4in", boxSizing:"border-box",
        fontFamily:"'Courier New', Courier, monospace", color:"#000", background:"#fff",
        display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", borderBottom:"1px dashed #000", paddingBottom:6, marginBottom:6 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:800 }}>{order.brand || "Order Receipt"}</div>
            <div style={{ fontSize:10 }}>{order.branch}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:13, fontWeight:800 }}>#{order.id}</div>
            <div style={{ fontSize:10 }}>{fmtDate(order.createdAt)}</div>
          </div>
        </div>
        <div style={{ fontSize:11, marginBottom:6, lineHeight:1.5 }}>
          <div><b>Customer:</b> {order.customer}</div>
          <div><b>Phone:</b> {order.phone || "—"}</div>
          {order.address && <div><b>Address:</b> {order.address}</div>}
        </div>
        <div style={{ flex:1, overflow:"hidden" }}>
          <table style={{ width:"100%", fontSize:10.5, borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:"1px solid #000" }}>
                <th style={{ textAlign:"left", padding:"2px 0" }}>Item</th>
                <th style={{ textAlign:"center", padding:"2px 0", width:40 }}>Qty</th>
                <th style={{ textAlign:"right", padding:"2px 0", width:70 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, i) => (
                <tr key={i}>
                  <td style={{ padding:"1.5px 0" }}>{it.name}</td>
                  <td style={{ textAlign:"center" }}>{it.qty}</td>
                  <td style={{ textAlign:"right" }}>{fmtPeso1(it.price * it.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ borderTop:"1px dashed #000", paddingTop:6, display:"flex", justifyContent:"space-between", fontWeight:800, fontSize:13 }}>
          <span>TOTAL</span>
          <span>{fmtPeso1(order.total)}</span>
        </div>
        <div style={{ fontSize:9, textAlign:"center", marginTop:5, color:"#333" }}>Thank you for your order!</div>
      </div>
    );
  }

  function OrderDrawer({ order, onClose, onAccept, onReject, onPrint, stockInfo, acceptDisabled, accepting, onShip, shipDisabled, shipping }) {
    const [mode, setMode] = useState(null);
    const [rejecting, setRejecting] = useState(false);
    const [printing, setPrinting] = useState(false);

    useEffect(() => { setMode(null); }, [order?.id]);

    if (!order) return null;

    const doPrint = async () => {
      setPrinting(true);
      onPrint([order]);
      setTimeout(() => setPrinting(false), 400);
    };

    const doReject = async (reason, note) => {
      setRejecting(true);
      try { await onReject(order, reason, note); setMode(null); } finally { setRejecting(false); }
    };

    const shortItems = (stockInfo?.results || []).filter(r => !r.sufficient);
    const showStockWarning = order.status === "pending" && stockInfo && !stockInfo.checking && shortItems.length > 0;

    return (
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.5)", zIndex:2500, display:"flex", justifyContent:"flex-end", animation:"overlayIn .18s ease" }}>
        <div onClick={e => e.stopPropagation()}
          style={{ width:460, maxWidth:"94vw", height:"100%", background:C.white, boxShadow:"-12px 0 40px rgba(0,0,0,0.18)", display:"flex", flexDirection:"column", fontFamily:"'Montserrat',sans-serif", animation:"drawerIn .22s cubic-bezier(.2,.8,.2,1)" }}>

          {/* Header */}
          <div style={{ padding:"18px 22px", background:`linear-gradient(135deg,${C.teal},${C.green})`, color:"#fff", flexShrink:0 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontSize:17, fontWeight:800 }}>Order #{order.id}</div>
                <div style={{ fontSize:11.5, opacity:0.85, marginTop:2 }}>Placed {fmtDate(order.createdAt)}</div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                {["accepted", "shipping", "received"].includes(order.status) && (
                  <button onClick={doPrint} disabled={printing} style={{ ...printBtn, opacity: printing ? 0.6 : 1 }}>
                    {printing ? <RefreshCw size={14} style={{ animation:"spin 0.8s linear infinite" }}/> : <Printer size={14}/>} Print Receipt
                  </button>
                )}
                <button onClick={onClose} style={{ width:30, height:30, borderRadius:"50%", border:"1.5px solid rgba(255,255,255,0.4)", background:"rgba(255,255,255,0.15)", cursor:"pointer", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <X size={14}/>
                </button>
              </div>
            </div>
            <OrderStepper status={order.status}/>
          </div>

          {/* Body */}
          <div style={{ flex:1, overflowY:"auto", padding:"18px 22px" }}>

            {/* Customer */}
            <SectionCard title="Customer">
              {(order.brand || order.branch) && (
                <div style={{ fontSize:15, fontWeight:800, color:C.ink, display:"flex", alignItems:"center", gap:6 }}>
                  <Store size={14} color={C.green}/> {order.brand || "—"}{order.branch ? ` · ${order.branch}` : ""}
                </div>
              )}
              <div style={{ fontSize:12.5, color:C.muted, marginTop: (order.brand || order.branch) ? 4 : 0 }}>{order.customer}</div>
              <div style={{ fontSize:12.5, color:C.muted, marginTop:2, display:"flex", alignItems:"center", gap:5 }}><Phone size={12}/> {order.phone || "—"}</div>
            </SectionCard>

            {order.address && (
              <SectionCard title="Delivery Address" tint="amber">
                <div style={{ display:"flex", gap:7, alignItems:"flex-start" }}>
                  <MapPin size={13} color="#8a6a00" style={{ marginTop:1, flexShrink:0 }}/>
                  <div style={{ fontSize:13, fontWeight:600, color:C.ink }}>{order.address}</div>
                </div>
              </SectionCard>
            )}

            {/* Items — with live per-item stock availability inline, no separate check step */}
            <SectionCard title={`Items (${order.items.length})`}>
              {order.items.length === 0 ? (
                <div style={{ fontSize:12, color:C.muted, fontStyle:"italic" }}>No item details available.</div>
              ) : (
                <div style={{ display:"grid", gap:6 }}>
                  {order.items.map((item, i) => {
                    const r = stockInfo?.results?.[i];
                    const showBadge = order.status === "pending" && r;
                    return (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"space-between", padding:"7px 10px", borderRadius:8, background:i%2===0?"#f8fffe":"#fff", border:`1px solid ${C.greenLt}` }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                          <div style={{ width:36, height:36, borderRadius:8, overflow:"hidden", flexShrink:0, background:"#f0f0f0", display:"flex", alignItems:"center", justifyContent:"center" }}>
                            {itemImage(item) ? <img src={itemImage(item)} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : <Package size={16} color={C.muted}/>}
                          </div>
                          <div style={{ minWidth:0 }}>
                            <div style={{ fontWeight:700, fontSize:12.5, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</div>
                            <div style={{ fontSize:11, color:C.muted }}>
                              Qty {item.qty}
                              {showBadge && (
                                <span style={{ marginLeft:6, fontWeight:700, color: !r.matched ? "#991b1b" : r.sufficient ? "#27500a" : "#9a3412" }}>
                                  · {!r.matched ? "unmatched" : `${r.available ?? 0} available`}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                          {showBadge && (
                            <span style={{ fontSize:9.5, fontWeight:800, padding:"3px 8px", borderRadius:20,
                              color: !r.matched ? "#991b1b" : r.sufficient ? "#27500a" : "#9a3412",
                              background: !r.matched ? "#fee2e2" : r.sufficient ? "#eaf3de" : "#fef3c7" }}>
                              {!r.matched ? "UNMATCHED" : r.sufficient ? "OK" : "SHORT"}
                            </span>
                          )}
                          <div style={{ fontWeight:700, fontSize:12.5, color:C.green }}>{fmtPeso1(item.price * item.qty)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", borderRadius:10, background:"linear-gradient(135deg,#d1fae5,#e0f2f1)", marginTop:8 }}>
                <div style={{ fontWeight:800, fontSize:13, color:C.ink }}>Total</div>
                <div style={{ fontWeight:800, fontSize:16, color:C.green }}>{fmtPeso1(order.total)}</div>
              </div>
            </SectionCard>

            {/* ── Actions ── */}
            <div style={{ marginTop:6 }}>
              {order.status === "pending" && mode !== "reject" && (
                <div>
                  {stockInfo?.checking && (
                    <div style={{ display:"flex", gap:7, alignItems:"center", background:C.bg, border:`1px solid ${C.border}`, borderRadius:9, padding:"9px 11px", marginBottom:10, fontSize:11.5, color:C.muted }}>
                      <RefreshCw size={13} style={{ animation:"spin 0.8s linear infinite" }}/>
                      Checking stock availability…
                    </div>
                  )}
                  {showStockWarning && (
                    <div style={{ display:"flex", gap:7, alignItems:"flex-start", background:C.warnBg, border:`1px solid ${C.warnBorder}`, borderRadius:9, padding:"9px 11px", marginBottom:10, fontSize:11.5, color:"#9a3412" }}>
                      <AlertTriangle size={13} style={{ flexShrink:0, marginTop:1 }}/>
                      <div>
                        <div style={{ fontWeight:700, marginBottom:2 }}>Can't accept — insufficient stock</div>
                        {shortItems.map((s, i) => (
                          <div key={i}>
                            {s.name}: {s.matched ? `need ${s.qty}, have ${s.available ?? 0}` : "not linked to a stock item"}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{ display:"flex", gap:10 }}>
                    <button onClick={() => onAccept(order)} disabled={acceptDisabled}
                      style={{ ...primaryBtn, flex:1,
                        opacity: acceptDisabled ? 0.5 : 1,
                        cursor: acceptDisabled ? "not-allowed" : "pointer",
                        display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                      {accepting && <RefreshCw size={13} style={{ animation:"spin 0.8s linear infinite" }}/>}
                      {accepting ? "Accepting…" : showStockWarning ? "Insufficient Stock" : "Accept Order"}
                    </button>
                    <button onClick={() => setMode("reject")} style={dangerTextBtn}>Reject</button>
                  </div>
                </div>
              )}
              {order.status === "pending" && mode === "reject" && (
                <ReasonForm title="Reject this order" confirmLabel="Reject Order" saving={rejecting}
                  onCancel={() => setMode(null)} onConfirm={doReject}/>
              )}

              {/* Accepted = shipping. No dispose step — stock was already deducted on accept. */}
              {order.status === "accepted" && mode !== "reject" && (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <div style={{ display:"flex", gap:8, alignItems:"flex-start", background:C.greenLt, border:`1px solid ${C.greenMid}`, borderRadius:10, padding:"11px 13px", fontSize:12.5, color:C.greenDk }}>
                    <Check size={15} style={{ flexShrink:0, marginTop:1 }}/>
                    <span>Stock was deducted on accept. Ready to send out for delivery.</span>
                  </div>
                  <div style={{ display:"flex", gap:10 }}>
                    <button onClick={() => onShip(order)} disabled={shipDisabled}
                      style={{ ...primaryBtn, flex:1, opacity: shipDisabled ? 0.5 : 1, cursor: shipDisabled ? "not-allowed" : "pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                      {shipping && <RefreshCw size={13} style={{ animation:"spin 0.8s linear infinite" }}/>}
                      {shipping ? "Shipping…" : "Ship Order"}
                    </button>
                    <button onClick={() => onPrint([order])} style={printBtn}>
                      <Printer size={14}/>
                    </button>
                    <button onClick={() => setMode("reject")} style={dangerTextBtn}>Cancel</button>
                  </div>
                </div>
              )}
              {order.status === "accepted" && mode === "reject" && (
                <ReasonForm title="Cancel this order" confirmLabel="Cancel Order" saving={rejecting}
                  onCancel={() => setMode(null)} onConfirm={doReject}/>
              )}

              {/* NEW — shipping: admin side is read-only, waiting on the branch */}
              {order.status === "shipping" && (
                <div style={{ display:"flex", gap:8, alignItems:"flex-start", background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:10, padding:"11px 13px", fontSize:12.5, color:"#1d4ed8", animation:"cardIn .2s ease" }}>
                  <RefreshCw size={15} style={{ flexShrink:0, marginTop:1 }}/>
                  <span>Out for delivery. Waiting for the branch to confirm receipt.</span>
                </div>
              )}

              {/* NEW — received: terminal, read-only */}
              {order.status === "received" && (
                <div style={{ display:"flex", gap:8, alignItems:"flex-start", background:C.greenLt, border:`1px solid ${C.greenMid}`, borderRadius:10, padding:"11px 13px", fontSize:12.5, color:C.greenDk, animation:"cardIn .2s ease" }}>
                  <Check size={15} style={{ flexShrink:0, marginTop:1 }}/>
                  <span>Delivered and confirmed received by the branch.</span>
                </div>
              )}

              {order.status === "rejected" && (
                <div style={{ display:"flex", gap:8, alignItems:"flex-start", background:C.redBg, border:`1px solid ${C.redBorder}`, borderRadius:10, padding:"11px 13px", fontSize:12.5, color:"#7f1d1d", animation:"cardIn .2s ease" }}>
                  <X size={15} style={{ flexShrink:0, marginTop:1 }}/>
                  <span>This order was rejected. No stock was deducted.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function SectionCard({ title, children, tint }) {
    const bg = tint === "amber" ? "#fffdf0" : "#f8fffe";
    const border = tint === "amber" ? "#e8d5a3" : C.greenLt;
    return (
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:10.5, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.06em", color:C.muted, marginBottom:7 }}>{title}</div>
        <div style={{ padding:"12px 13px", background:bg, borderRadius:12, border:`1px solid ${border}` }}>{children}</div>
      </div>
    );
  }

  function MobileOrdersContent({ user, brands: propBrands = [] }) {
    const apiUrl   = process.env.REACT_APP_API_URL;
    const userName = user?.name || "Admin";

    const [activityLog,     setActivityLog]     = useState([]);

    const [orders,      setOrders]      = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error,       setError]       = useState(null);
    const [refreshingOrders, setRefreshingOrders] = useState(false);

    const [search,       setSearch]       = useState("");
    const [statusFilter, setStatusFilter] = useState("pending");
    const [filterBrand,  setFilterBrand]  = useState("");
    const [filterBranch, setFilterBranch] = useState("");
    const [viewOrder,    setViewOrder]    = useState(null);
    const [toast,        setToast]        = useState(null);
    const [printQueue,   setPrintQueue]   = useState([]);
    const [massAccepting, setMassAccepting] = useState(false);
    const [acceptingId,   setAcceptingId]   = useState(null);

    const [shippingId, setShippingId] = useState(null);

    const [stockAvailability, setStockAvailability] = useState({});

    const showToast = (type, title, message) => setToast({ type, title, message });

    /* ── printing ── */
  const triggerPrint = (ordersToPrint, onDone) => {
    if (!ordersToPrint || ordersToPrint.length === 0) { onDone?.(); return; }
    setPrintQueue(ordersToPrint);
    setTimeout(() => {
      window.print();
      setPrintQueue([]);
      onDone?.();
    }, 80);
  };

    /* ── activity log ── */
    const fetchActivityLog = useCallback(async () => {
      try {
        const res  = await fetch(`${apiUrl}/orders-activity-log`);
        const data = await res.json();
        setActivityLog(Array.isArray(data) ? data : []);
      } catch (err) { console.error("Failed to fetch orders activity log:", err); }
    }, [apiUrl]);

    const handleRefreshClick = async () => {
      setRefreshingOrders(true);
      showToast("loading", "Refreshing orders…");
      await fetchOrders({ silent: true });
      setToast(null);
      setRefreshingOrders(false);
    };

  const fetchOrders = async ({ silent = false } = {}) => {
    if (!silent) setLoadingData(true);
    setError(null);
    try {
      const HQ_ROLES = ["Super Admin", "Franchisee Operations Admin"];
      const params = new URLSearchParams({ role: user?.role || "" });
      if (!HQ_ROLES.includes(user?.role)) {
        if (user?.branch) params.set("branch", user.branch);
        if (user?.brand)  params.set("brand", user.brand);
      }

      const res = await fetch(`${apiUrl}/orders?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(data.map(normalizeOrder));
    } catch (err) {
      setError(err.message);
    } finally {
      if (!silent) setLoadingData(false);
    }
  };

    const fetchIngredients = useCallback(async () => {
      try {
        const res = await fetch(`${apiUrl}/ingredients`);
        const d = await res.json();
        setIngredients(Array.isArray(d) ? d : []);
      } catch (err) { console.warn("Failed to fetch ingredients:", err); }
    }, [apiUrl]);

    useEffect(() => { fetchOrders(); fetchActivityLog(); fetchIngredients(); }, [fetchActivityLog, fetchIngredients]);

    /* ── NEW: automatic stock availability for all pending orders ──
      Runs whenever the order list changes — no button click needed.
      Caps each item's availability at the linked ingredient's real batch stock,
      same logic the old manual "check stock" step used, just automatic + upfront. */
    const fetchShopItemsMap = async () => {
      const res = await fetch(`${apiUrl}/shop-items`);
      const data = await res.json();
      const map = {};
      (Array.isArray(data) ? data : []).forEach(i => { map[i.id] = i; });
      return map;
    };

    const fetchBatchesFor = async (ingredientId) => {
      const res = await fetch(`${apiUrl}/ingredient-batches?ingredient_id=${ingredientId}`);
      const d = await res.json();
      return Array.isArray(d) ? d : [];
    };

  /* ── automatic stock availability, sourced entirely from Stock Inventory
      (ingredients/ingredient_batches). shop_items.stock is just a mirror of
      this now — never treated as authoritative. ── */
    const refreshStockAvailability = useCallback(async (orderList) => {
      const pendingOrders = orderList.filter(o => o.status === "pending");
      if (pendingOrders.length === 0) return;

      setStockAvailability(prev => {
        const next = { ...prev };
        pendingOrders.forEach(o => { next[o.id] = { ...(next[o.id] || {}), checking: true }; });
        return next;
      });

      let shopItemsMap;
      try {
        shopItemsMap = await fetchShopItemsMap(); // still needed to resolve shop_item_id -> ingredient_id
      } catch {
        return;
      }

      const batchStockCache = {}; // shared across orders in this pass
      const getIngredientStock = async (ingredientId) => {
        if (batchStockCache[ingredientId] != null) return batchStockCache[ingredientId];
        const batches = await fetchBatchesFor(ingredientId);
        const total = batches.reduce((s, b) => s + Number(b.stock || 0), 0);
        batchStockCache[ingredientId] = total;
        return total;
      };

      for (const order of pendingOrders) {
        const neededByItem = {};
        order.items.forEach(item => {
          if (item.shop_item_id == null) return;
          neededByItem[item.shop_item_id] = (neededByItem[item.shop_item_id] || 0) + Number(item.qty || 0);
        });

        const results = [];
        for (const item of order.items) {
          const si = item.shop_item_id != null ? shopItemsMap[item.shop_item_id] : null;

          // No linked ingredient = can't be fulfilled, same as backend now enforces.
          if (!si || !si.ingredient_id) { results.push({ ...item, matched:false, available:0, sufficient:false }); continue; }

          const available = await getIngredientStock(si.ingredient_id);
          const totalNeeded = neededByItem[item.shop_item_id];
          results.push({ ...item, matched:true, available, sufficient: available >= totalNeeded });
        }

        const ok = results.every(r => r.sufficient);
        setStockAvailability(prev => ({ ...prev, [order.id]: { checking:false, ok, results } }));
      }
    }, [apiUrl]);

    useEffect(() => {
      if (orders.length > 0) refreshStockAvailability(orders);
    }, [orders, refreshStockAvailability]);

    const advanceStatus = async (order, nextUiStatus, changeNote) => {
        const coords = await getBrowserLocation(); // reuse the helper used elsewhere in this app
        try {
          const res = await fetch(`${apiUrl}/orders/${order._dbId}`, {
            method:"PUT", headers:{ "Content-Type":"application/json" }, credentials:"include",
            body: JSON.stringify({
              status: nextUiStatus,
              performed_by: userName,
              performed_by_role: user?.role || "Unknown",
              latitude: coords?.latitude,
              longitude: coords?.longitude,
            }),
          });
          if (!res.ok) {
            let detail = "";
            try { detail = (await res.json()).error || detail; } catch { detail = await res.text().catch(() => ""); }
            throw new Error(detail || `Update failed (${res.status})`);
          }
          setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status:nextUiStatus } : o));
          setViewOrder(v => (v && v.id === order.id) ? { ...v, status:nextUiStatus } : v);
          await fetchActivityLog();
        } catch (err) {
          showToast("error", "Couldn't update order", err.message);
          throw err;
        }
      };

      const acceptOrderWithDeduction = async (order) => {
      const availability = stockAvailability[order.id];
      if (!availability?.ok) {
        const short = (availability?.results || []).filter(r => !r.sufficient);
        const list = short.map(i => `${i.name} (need ${i.qty}, have ${i.available ?? 0})`).join(", ");
        showToast("error", "Not enough stock", list || "Insufficient stock for this order.");
        return false;
      }

      try {
        await advanceStatus(order, "accepted", `Accepted — stock deducted, moved to shipping`);
        return true;
      } catch (err) {
        showToast("error", "Couldn't accept order", err.message || "Something went wrong accepting this order.");
        return false;
      }
    };

    const handleAccept = async (order) => {
      setAcceptingId(order.id);
      try {
        const ok = await acceptOrderWithDeduction(order);
        if (ok) showToast("success", "Order accepted", `#${order.id} is now shipping.`);
      } catch (err) {
        showToast("error", "Couldn't accept order", err.message);
      } finally {
        setAcceptingId(null);
      }
    };

    const handleReject = async (order, reason, note) => {
      try {
        const changeNote = `${order.status === "accepted" ? "Cancelled" : "Rejected"} — ${reason}${note ? `: ${note}` : ""}`;
        await advanceStatus(order, "rejected", changeNote);
        showToast("success", "Order rejected", `#${order.id} was marked as rejected.`);
      } catch {}
    };

    const handleShip = async (order) => {
      setShippingId(order.id);
      try {
        await advanceStatus(order, "shipping", "Marked as shipping");
        showToast("success", "Order shipped", `#${order.id} is on its way.`);
      } catch (err) {
        showToast("error", "Couldn't ship order", err.message);
      } finally {
        setShippingId(null);
      }
    };

  const handleMassAcceptAndPrint = async () => {
    const pendingOrders = orders.filter(o => o.status === "pending" && stockAvailability[o.id]?.ok);
    const skipped = orders.filter(o => o.status === "pending" && !stockAvailability[o.id]?.ok).length;
    if (pendingOrders.length === 0) {
      showToast("error", "Nothing to accept", skipped > 0 ? `${skipped} order(s) skipped — insufficient stock.` : "No incoming orders.");
      return;
    }
    setMassAccepting(true);
    showToast("loading", "Accepting orders…", `Processing ${pendingOrders.length} order(s)`);
    const accepted = [];
    for (const o of pendingOrders) {
      try {
        const ok = await acceptOrderWithDeduction(o);
        if (ok) accepted.push({ ...o, status: "accepted" });
      } catch {}
    }
    setMassAccepting(false);

    if (accepted.length > 0) {
      showToast("success", "Orders accepted", `${accepted.length} accepted${skipped ? `, ${skipped} skipped (low stock)` : ""} — sending to print.`);
      triggerPrint(accepted, () => { fetchOrders({ silent: true }); });
    } else {
      setToast(null);
      await fetchOrders({ silent: true });
    }
  };

    const selectedBrandObj = propBrands.find(b => String(b.id) === filterBrand);
    const branchOptions = selectedBrandObj ? (selectedBrandObj.branches || []).map(br => typeof br === "string" ? br : br.name) : [];

    const filtered = orders.filter(o => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (filterBranch && o.branch !== filterBranch) return false;
      else if (filterBrand && selectedBrandObj && !branchOptions.includes(o.branch)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!o.id.toLowerCase().includes(q) && !o.customer.toLowerCase().includes(q)) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const counts = {
      total:    orders.length,
      pending:  orders.filter(o => o.status === "pending").length,
      accepted: orders.filter(o => o.status === "accepted").length,
      shipping: orders.filter(o => o.status === "shipping").length,
      received: orders.filter(o => o.status === "received").length,
      rejected: orders.filter(o => o.status === "rejected").length,
    };

    const FILTER_CHIPS = [
      { key:"all",      label:"All Orders",      count:counts.total },
      { key:"pending",  label:"Incoming Orders", count:counts.pending },
      { key:"accepted", label:"To Ship",         count:counts.accepted },
      { key:"shipping", label:"Shipping",        count:counts.shipping },
      { key:"received", label:"Delivered",       count:counts.received },
      { key:"rejected", label:"Rejected",        count:counts.rejected },
    ];

    if (loadingData) return (
      <div style={{ padding:60, textAlign:"center", color:C.muted, fontFamily:"'Montserrat',sans-serif" }}>Loading orders…</div>
    );
    if (error) return (
      <div style={{ padding:40, textAlign:"center", fontFamily:"'Montserrat',sans-serif" }}>
        <div style={{ color:C.red, marginBottom:12 }}>{error}</div>
        <button onClick={fetchOrders} style={{ padding:"8px 20px", borderRadius:8, border:`1px solid ${C.border}`, background:C.greenLt, color:C.greenDk, fontWeight:700, cursor:"pointer" }}>Retry</button>
      </div>
    );

    return (
      <div style={{ fontFamily:"'Montserrat',sans-serif" }}>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes cardIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
          @keyframes drawerIn { from { transform:translateX(100%); } to { transform:translateX(0); } }
          @keyframes overlayIn { from { opacity:0; } to { opacity:1; } }
          @keyframes toastIn { from { opacity:0; transform:translateY(10px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
          button:not(:disabled) { transition: filter .15s ease, transform .1s ease; }
          button:not(:disabled):hover { filter: brightness(0.96); }
          button:not(:disabled):active { transform: translateY(1px); }
          select:focus, input:focus, textarea:focus { border-color: ${C.green} !important; box-shadow: 0 0 0 3px rgba(0,137,123,0.12); outline:none; }
          #print-area { display:none; }
          @media print {
            body * { visibility: hidden; }
            #print-area, #print-area * { visibility: visible; }
            #print-area { display:block !important; position: fixed; top:0; left:0; }
            .receipt-page { page-break-after: always; }
            @page { size: 8.5in 4.25in; margin: 0; }
          }
        `}</style>

        <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:18 }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10, alignItems:"center",
            background:"#fff", border:`1px solid ${C.border}`, borderRadius:12, padding:10 }}>
            <div style={{ position:"relative", flex:"1 1 220px", minWidth:200 }}>
              <Search size={15} color={C.muted} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order # or customer name…"
                style={{ width:"100%", height:38, padding:"0 14px 0 36px", borderRadius:10, border:`1px solid ${C.border}`, fontSize:13, fontFamily:"inherit", boxSizing:"border-box" }}/>
            </div>

                      <select value={filterBrand} onChange={e => { setFilterBrand(e.target.value); setFilterBranch(""); }}
              style={{ height:38, padding:"0 12px", borderRadius:10, border:`1px solid ${C.border}`,
                fontSize:12.5, fontWeight:700, color:C.ink, fontFamily:"inherit", background:"#fff", cursor:"pointer" }}>
              <option value="">All Brands</option>
              {propBrands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} disabled={!filterBrand}
              style={{ height:38, padding:"0 12px", borderRadius:10, border:`1px solid ${C.border}`,
                fontSize:12.5, fontWeight:700, color:C.ink, fontFamily:"inherit", background: filterBrand ? "#fff" : "#f3f4f6",
                cursor: filterBrand ? "pointer" : "not-allowed", opacity: filterBrand ? 1 : 0.6 }}>
              <option value="">All Branches</option>
              {branchOptions.map(br => (
                <option key={br} value={br}>{br}</option>
              ))}
            </select>

            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ height:38, padding:"0 12px", borderRadius:10, border:`1px solid ${C.border}`,
                fontSize:12.5, fontWeight:700, color:C.ink, fontFamily:"inherit", background:"#fff", cursor:"pointer" }}>
              {FILTER_CHIPS.map(c => (
                <option key={c.key} value={c.key}>{c.label} ({c.count})</option>
              ))}
            </select>

            <button onClick={handleRefreshClick} disabled={refreshingOrders}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 14px", borderRadius:10, border:`1px solid ${C.border}`,
                background:C.greenLt, color:C.greenDk, fontWeight:700, fontSize:12, cursor: refreshingOrders ? "not-allowed" : "pointer", fontFamily:"inherit", opacity: refreshingOrders ? 0.6 : 1 }}>
              <RefreshCw size={13} style={ refreshingOrders ? { animation:"spin 0.8s linear infinite" } : undefined }/> Refresh
            </button>
          </div>

          <div style={{ display:"flex", justifyContent:"flex-end", gap:8, flexWrap:"wrap" }}>
            <button onClick={handleMassAcceptAndPrint} disabled={massAccepting || counts.pending === 0}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 14px", borderRadius:10, border:"none",
                background: (massAccepting || counts.pending === 0) ? "#e5e7eb" : `linear-gradient(135deg,${C.teal},${C.green})`,
                color: (massAccepting || counts.pending === 0) ? "#9ca3af" : "#fff",
                fontWeight:700, fontSize:12, cursor: (massAccepting || counts.pending === 0) ? "not-allowed" : "pointer", fontFamily:"inherit" }}>
              {massAccepting ? <RefreshCw size={13} style={{ animation:"spin 0.8s linear infinite" }}/> : <Printer size={13}/>}
              {massAccepting ? "Accepting…" : `Accept & Print All (${orders.filter(o => o.status === "pending" && stockAvailability[o.id]?.ok).length})`}
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"70px 20px", background:"#fff", borderRadius:18, border:`1px dashed ${C.border}`, animation:"cardIn .2s ease" }}>
            <Package size={34} color={C.muted} style={{ opacity:0.5, marginBottom:10 }}/>
            <div style={{ fontSize:14, fontWeight:700, color:C.ink, marginBottom:4 }}>No orders here</div>
            <div style={{ fontSize:12.5, color:C.muted }}>
              {statusFilter === "all" ? "New orders will show up here as soon as customers place them." : "Try a different filter or search term."}
            </div>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(250px, 1fr))", gap:14 }}>
            {filtered.map((order, i) => (
              <div key={order.id} style={{ animation:"cardIn .28s ease both", animationDelay:`${Math.min(i,10)*30}ms` }}>
                <OrderCard
                  order={order}
                  onOpen={setViewOrder}
                  stockInfo={stockAvailability[order.id]}
                  onAccept={handleAccept}
                  acceptDisabled={acceptingId === order.id || (order.status === "pending" && !stockAvailability[order.id]?.ok)}
                  accepting={acceptingId === order.id}
                  onShip={handleShip}
                  shipDisabled={shippingId === order.id}
                  shipping={shippingId === order.id} 
                />
              </div>
            ))}
          </div>
        )}

        {viewOrder && (
          <OrderDrawer
            order={orders.find(o => o.id === viewOrder.id) || viewOrder}
            onClose={() => setViewOrder(null)}
            onAccept={handleAccept}
            onReject={handleReject}
            onPrint={triggerPrint}
            stockInfo={stockAvailability[viewOrder.id]}
            acceptDisabled={acceptingId === viewOrder.id || (viewOrder.status === "pending" && !stockAvailability[viewOrder.id]?.ok)}
            accepting={acceptingId === viewOrder.id}
            onShip={handleShip}
            shipDisabled={shippingId === viewOrder.id}
            shipping={shippingId === viewOrder.id}
          />
        )}

        <Toast toast={toast} onClose={() => setToast(null)}/>

        <div id="print-area">
          {printQueue.map(o => <ReceiptSlip key={o.id} order={o} />)}
        </div>
      </div>
    );
  }

  function ProfileContent({ user }) {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [formData, setFormData] = useState({ firstName:'', lastName:'', middleInitial:'', suffix:'', name:'', email:'', role:'', branch:'', password:'' });
    const [showOtpModal,     setShowOtpModal]     = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [otp,              setOtp]              = useState('');
    const [otpSent,          setOtpSent]          = useState(false);
    const [otpError,         setOtpError]         = useState('');
    const [passwordErrors,   setPasswordErrors]   = useState([]);
    const [showPasswordValidation, setShowPasswordValidation] = useState(false);
    const [showCurrentPw,    setShowCurrentPw]    = useState(false);
    const [showNewPw,        setShowNewPw]        = useState(false);
    const [showConfirmPw,    setShowConfirmPw]    = useState(false);
    const [fieldErrors,      setFieldErrors]      = useState({});

    // ── UI modal state ──
    const [alertModal,   setAlertModal]   = useState(null);
    const [confirmModal, setConfirmModal] = useState(null);

    const showAlert   = (message, type = "info") => setAlertModal({ message, type });
    const showConfirm = (message, onConfirm)     => setConfirmModal({ message, onConfirm });

    const formDataRef = React.useRef(formData);
    useEffect(() => {
    setFormData(prev => ({
      ...prev,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      middleInitial: user.middleInitial || '',
      suffix: user.suffix || '',
      name: user.name || '',
      email: user.email || '',
      role: user.role || '',
      personalEmail: user.personalEmail || '',
    }));
  }, [user]);
    const handleInputChange = React.useCallback((e) => {
      const { name, value } = e.target;
      formDataRef.current = { ...formDataRef.current, [name]: value };
      setFormData(prev => ({ ...prev, [name]: value }));

      // Clear field error on change
      setFieldErrors(prev => ({ ...prev, [name]: '' }));

      if (name === 'newPassword') {
        if (value) {
          setShowPasswordValidation(true);
          setPasswordErrors(validatePasswordStrength(value).errors);
        } else {
          setShowPasswordValidation(false);
          setPasswordErrors([]);
        }
      }
      if (name === 'confirmPassword') {
        // live match feedback handled by fieldErrors below
      }
    }, []);

    const validatePasswordStrength = (password) => {
      const errors = [];
      if (password.length < 8)                                                        errors.push('minLength');
      if (!/[A-Z]/.test(password))                                                    errors.push('uppercase');
      if (!/[a-z]/.test(password))                                                    errors.push('lowercase');
      if (!/\d/.test(password))                                                       errors.push('number');
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))                  errors.push('specialChar');
      return { isValid: errors.length === 0, errors };
    };

    const sendOtp = async () => {
      try {
        const emailToSend = formData.personalEmail || formData.email;
        const response = await fetch(`${process.env.REACT_APP_API_URL}/send-otp-password-change`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailToSend }),
        });
        const data = await response.json();
        if (data.success) { setOtpSent(true); showAlert(`OTP has been sent to ${emailToSend}`, "success"); }
        else showAlert(data.message || data.error || 'Failed to send OTP.', "error");
      } catch (error) {
        console.error("Error sending OTP:", error);
        showAlert("Failed to send OTP. Please try again.", "error");
      }
    };

    const verifyOtpAndChangePassword = async () => {
      try {
        setOtpError('');
        const emailToVerify = formData.personalEmail || formData.email;
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${user.id}/password`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentPassword: formData.currentPassword, newPassword: formData.newPassword, email: emailToVerify, otp: otp.trim() }),
        });
        const data = await response.json();
        if (data.success) {
          setShowOtpModal(false);
          setShowSuccessModal(true);
          localStorage.removeItem('user');
          localStorage.removeItem('tempUser');
          setTimeout(() => { window.location.href = '/admin-login'; }, 3000);
        } else {
          setOtpError(data.error || 'Failed to change password');
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
      const isPasswordChange = formData.currentPassword || formData.newPassword || formData.confirmPassword;

      if (isPasswordChange) {
        if (!formData.currentPassword) errs.currentPassword = 'Please enter your current password.';
        if (!formData.newPassword)     errs.newPassword     = 'Please enter a new password.';
        else {
          const pv = validatePasswordStrength(formData.newPassword);
          if (!pv.isValid) errs.newPassword = 'Password does not meet all requirements.';
        }
        if (!formData.confirmPassword) {
          errs.confirmPassword = 'Please confirm your new password.';
        } else if (formData.newPassword !== formData.confirmPassword) {
          errs.confirmPassword = 'Passwords do not match.';
        }
        if (!formData.personalEmail && !formData.email) errs.personalEmail = 'An email is required to receive OTP.';

        if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
        sendOtp();
        setShowOtpModal(true);
      } else {
        updateProfile();
      }
    };

    const updateProfile = async () => {
    try {
      const fullName = [formData.firstName, formData.middleInitial ? formData.middleInitial + "." : "", formData.lastName, formData.suffix].filter(Boolean).join(" ");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${user.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
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
      });
        const data = await response.json();
        if (data.success) {
          showAlert('Profile updated successfully!', 'success');
          const updatedUser = { ...user, name: fullName, firstName: formData.firstName, lastName: formData.lastName, middleInitial: formData.middleInitial, suffix: formData.suffix, email: formData.email };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setIsUnlocked(false);
        } else {
          showAlert(data.error || 'Failed to update profile.', 'error');
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        showAlert("Failed to update profile. Please try again.", "error");
      }
    };

    const handleCancel = () => {
    showConfirm('Discard all unsaved changes?', () => {
      setFormData({
        firstName: user.firstName || '', lastName: user.lastName || '',
        middleInitial: user.middleInitial || '', suffix: user.suffix || '',
        name: user.name, email: user.email, personalEmail: '', role: user.role,
        currentPassword: '', newPassword: '', confirmPassword: '',
      });
      setOtp(''); setOtpSent(false); setShowOtpModal(false);
      setShowPasswordValidation(false); setPasswordErrors([]);
      setFieldErrors({}); setIsUnlocked(false);
    });
  };

  const initials = user.name
      ? user.name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
      : '?';

    // ── Shared input style ──
    const inputStyle = (disabled) => ({
      ...bmInput,
      marginTop: 4,
      background: disabled ? '#f5f8f5' : '#fff',
      color: disabled ? '#9ca3af' : '#0d2b1e',
      cursor: disabled ? 'not-allowed' : 'text',
      border: disabled ? '1.5px solid #e5e7eb' : '1.5px solid #b2dfdb',
    });

    const PwChecklist = () => (
      <div style={{ marginTop: 8, fontSize: 12, padding: '10px 14px', background: '#f0fdf5', borderRadius: 10, border: '1.5px solid #b2dfdb' }}>
        <div style={{ marginBottom: 6, fontWeight: 700, color: '#0d2b1e', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password must contain:</div>
        {[
          ['minLength',   'At least 8 characters'],
          ['uppercase',   'Uppercase letter (A-Z)'],
          ['lowercase',   'Lowercase letter (a-z)'],
          ['number',      'Number (0-9)'],
          ['specialChar', 'Special character (!@#$%^&*...)'],
        ].map(([key, text]) => (
          <div key={key} style={{ color: passwordErrors.includes(key) ? '#dc2626' : '#059669', marginBottom: 3, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
            <span>{passwordErrors.includes(key) ? '✗' : '✓'}</span> {text}
          </div>
        ))}
      </div>
    );

    const FieldError = ({ name }) => fieldErrors[name]
      ? <span style={{ fontSize: 11, color: '#dc2626', marginTop: 4, display: 'block', fontWeight: 600 }}>{fieldErrors[name]}</span>
      : null;

    const EyeToggle = ({ show, onToggle, disabled }) => (
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', color: '#5a7a65', display: 'flex', alignItems: 'center', padding: 0 }}
      >
        {show
          ? <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          : <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        }
      </button>
    );

    return (
      <div style={{ fontFamily: "'Montserrat', sans-serif" }}>

        {/* ── Account Overview Card ── */}
        <div style={{ background: C.white, border: '1px solid rgba(0,168,76,0.12)', borderRadius: 18, boxShadow: '0 2px 14px rgba(0,140,60,0.07)', overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ background: 'linear-gradient(135deg,#2E7D32,#00897b)', padding: '16px 22px' }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>Account Overview</span>
          </div>
          <div style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 22 }}>
            <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg,#d1fae5,#6ee7b7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#00695c', flexShrink: 0, letterSpacing: 1, border: '2.5px solid #a7f3d0' }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 20, color: '#0d2b1e', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
              <div style={{ fontSize: 13, color: '#5a7a65', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#5a7a65" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>
                {user.email}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(0,137,123,0.1)', color: '#00695c', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{user.role}</span>
                {user.branch && <span style={{ background: '#f0fdf5', color: '#0d2b1e', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: '1.5px solid #b2dfdb' }}>{user.branch}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, textAlign: 'right' }}>
              <div style={{ padding: '8px 16px', borderRadius: 12, background: '#f0fdf5', border: '1.5px solid #b2dfdb' }}>
                <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#5a7a65', marginBottom: 2 }}>Account Status</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#059669', display: 'inline-block' }}/>
                  <span style={{ fontWeight: 800, fontSize: 13, color: '#059669' }}>Active</span>
                </div>
              </div>
              {user.branch && (
                <div style={{ padding: '8px 16px', borderRadius: 12, background: '#f0fdf5', border: '1.5px solid #b2dfdb' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#5a7a65', marginBottom: 2 }}>Branch</div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#0d2b1e' }}>{user.branch}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Lock/Unlock Banner ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isUnlocked ? '#f0fdf5' : '#f5f8f5', border: `1.5px solid ${isUnlocked ? '#b2dfdb' : '#e5e7eb'}`, borderRadius: 14, padding: '12px 20px', marginBottom: 20, transition: 'all 0.2s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isUnlocked ? <Unlock size={18} /> : <Lock size={18} />}
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#0d2b1e' }}>{isUnlocked ? 'Editing Enabled' : 'Profile Locked'}</div>
              <div style={{ fontSize: 11, color: '#5a7a65' }}>{isUnlocked ? 'Make your changes and save when done.' : 'Click Unlock to edit your profile.'}</div>
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
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 18px', borderRadius: 10, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              background: isUnlocked ? 'linear-gradient(135deg,#dc2626,#ef4444)' : 'linear-gradient(135deg,#2E7D32,#00897b)',
              color: '#fff', boxShadow: isUnlocked ? '0 2px 8px rgba(220,38,38,0.3)' : '0 2px 8px rgba(0,180,90,0.3)',
            }}
          >
            {isUnlocked ? '✕ Cancel' : ' Unlock'}
          </button>
        </div>

        {/* ── Two-column: Personal Info + Change Password ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

          {/* ── Personal Information Card ── */}
          <div style={{ background: C.white, border: '1px solid rgba(0,168,76,0.12)', borderRadius: 18, boxShadow: '0 2px 14px rgba(0,140,60,0.07)', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg,#2E7D32,#00897b)', padding: '16px 22px' }}>
              <span style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>Personal Information</span>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '22px 24px' }}>

              {/* Name */}
  <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
    <div style={{ flex: 2 }}>
      <label style={bmLabel}>Last Name</label>
      <input
        type="text" name="lastName" value={formData.lastName}
        onChange={handleInputChange}
        disabled={!isUnlocked}
        style={inputStyle(!isUnlocked)}
      />
    </div>
    <div style={{ flex: 2 }}>
      <label style={bmLabel}>First Name</label>
      <input
        type="text" name="firstName" value={formData.firstName}
        onChange={handleInputChange}
        disabled={!isUnlocked}
        style={inputStyle(!isUnlocked)}
      />
    </div>
    <div style={{ flex: 1 }}>
      <label style={bmLabel}>M.I.</label>
      <input
        type="text" name="middleInitial" maxLength={1} value={formData.middleInitial}
        onChange={handleInputChange}
        disabled={!isUnlocked}
        style={inputStyle(!isUnlocked)}
      />
    </div>
    <div style={{ flex: 1 }}>
      <label style={bmLabel}>Suffix</label>
      <input
        type="text" name="suffix" value={formData.suffix}
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
                  type="email" name="email" value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isUnlocked}
                  style={inputStyle(!isUnlocked)}
                />
                <FieldError name="email" />
              </div>

              {/* Personal Email */}
              <div style={{ marginBottom: 14 }}>
                <label style={bmLabel}>Personal Email <span style={{ color: '#9ca3af', fontWeight: 400 }}>(Optional)</span></label>
                <input
                  type="email" name="personalEmail" value={formData.personalEmail}
                  onChange={handleInputChange}
                  placeholder="your.personal@email.com"
                  disabled={!isUnlocked}
                  style={inputStyle(!isUnlocked)}
                />
                <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>OTP for password changes will be sent here</p>
                <FieldError name="personalEmail" />
              </div>

              {/* Role (always locked) */}
              <div style={{ marginBottom: 14 }}>
                <label style={bmLabel}>Role</label>
                <input
                  type="text" name="role" value={formData.role}
                  disabled
                  style={{ ...inputStyle(true), background: '#f0f0f0' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="submit"
                  disabled={!isUnlocked}
                  style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: isUnlocked ? 'linear-gradient(135deg,#2E7D32,#00897b)' : '#d1d5db', color: '#fff', fontSize: 13, fontWeight: 800, cursor: isUnlocked ? 'pointer' : 'not-allowed', fontFamily: 'inherit', boxShadow: isUnlocked ? '0 2px 10px rgba(0,180,90,0.28)' : 'none', opacity: isUnlocked ? 1 : 0.6 }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* ── Change Password Card ── */}
          <div style={{ background: C.white, border: '1px solid rgba(0,168,76,0.12)', borderRadius: 18, boxShadow: '0 2px 14px rgba(0,140,60,0.07)', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg,#2E7D32,#00897b)', padding: '16px 22px' }}>
              <span style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>Change Password</span>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '22px 24px' }}>
              <div style={{ background: isUnlocked ? '#f0fdf5' : '#f5f8f5', borderRadius: 12, padding: '12px 16px', marginBottom: 20, border: `1.5px solid ${isUnlocked ? C.border : '#e5e7eb'}`, fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 8 }}>
                {isUnlocked ? 'An OTP will be sent to your email for verification' : 'Unlock your profile to change your password'}
              </div>

              {/* Current Password */}
              <div style={{ marginBottom: 14 }}>
                <label style={bmLabel}>Current Password</label>
                <div style={{ position: 'relative', marginTop: 4 }}>
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder={isUnlocked ? 'Enter current password' : '••••••••'}
                    disabled={!isUnlocked}
                    style={{ ...inputStyle(!isUnlocked), paddingRight: 40 }}
                  />
                  <EyeToggle show={showCurrentPw} onToggle={() => setShowCurrentPw(v => !v)} disabled={!isUnlocked} />
                </div>
                <FieldError name="currentPassword" />
              </div>

              {/* New Password */}
              <div style={{ marginBottom: 14 }}>
                <label style={bmLabel}>New Password</label>
                <div style={{ position: 'relative', marginTop: 4 }}>
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder={isUnlocked ? 'Enter new password' : '••••••••'}
                    disabled={!isUnlocked}
                    style={{ ...inputStyle(!isUnlocked), paddingRight: 40 }}
                  />
                  <EyeToggle show={showNewPw} onToggle={() => setShowNewPw(v => !v)} disabled={!isUnlocked} />
                </div>
                {isUnlocked && showPasswordValidation && <PwChecklist />}
                <FieldError name="newPassword" />
              </div>

              {/* Confirm New Password */}
              <div style={{ marginBottom: 14 }}>
                <label style={bmLabel}>Confirm New Password</label>
                <div style={{ position: 'relative', marginTop: 4 }}>
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder={isUnlocked ? 'Confirm new password' : '••••••••'}
                    disabled={!isUnlocked}
                    style={{ ...inputStyle(!isUnlocked), paddingRight: 40 }}
                  />
                  <EyeToggle show={showConfirmPw} onToggle={() => setShowConfirmPw(v => !v)} disabled={!isUnlocked} />
                </div>
                {/* Live match indicator */}
                {isUnlocked && formData.confirmPassword && (
                  <div style={{ fontSize: 11, marginTop: 4, fontWeight: 600, color: formData.newPassword === formData.confirmPassword ? '#059669' : '#dc2626', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {formData.newPassword === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </div>
                )}
                <FieldError name="confirmPassword" />
              </div>

              <button
                type="submit"
                disabled={!isUnlocked}
                style={{ width: '100%', padding: '10px 0', borderRadius: 10, border: 'none', background: isUnlocked ? 'linear-gradient(135deg,#2E7D32,#00897b)' : '#d1d5db', color: '#fff', fontSize: 13, fontWeight: 800, cursor: isUnlocked ? 'pointer' : 'not-allowed', fontFamily: 'inherit', boxShadow: isUnlocked ? '0 2px 10px rgba(0,180,90,0.28)' : 'none', opacity: isUnlocked ? 1 : 0.6 }}
              >
                Update Password
              </button>
            </form>
          </div>
        </div>

        {/* ── OTP Modal ── */}
        {showOtpModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 440, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid rgba(0,168,76,0.15)' }}>
              <div style={{ textAlign: 'center', marginBottom: 22 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#d1fae5,#6ee7b7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '1.6rem' }}>🔑</div>
                <h2 style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 18, fontWeight: 800, color: '#0d2b1e', marginBottom: 6 }}>Verify OTP</h2>
                <p style={{ fontSize: 13, color: C.muted }}>Code sent to <strong style={{ color: '#0d2b1e' }}>{formData.personalEmail || formData.email}</strong></p>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={bmLabel}>Enter 6-Digit OTP</label>
                <input
                  type="text" placeholder="000000" value={otp}
                  onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 6); setOtp(v); setOtpError(''); }}
                  maxLength={6} autoFocus
                  style={{ ...bmInput, marginTop: 6, fontSize: 24, textAlign: 'center', letterSpacing: '0.6rem', fontFamily: 'monospace' }}
                />
              </div>
              {otpSent && !otpError && (
                <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.08)', borderRadius: 10, border: '1px solid #a7f3d0', color: '#059669', fontSize: 12, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
                  OTP sent successfully
                </div>
              )}
              {otpError && (
                <div style={{ padding: '10px 14px', background: '#fee2e2', borderRadius: 10, border: '1.5px solid #fecaca', color: '#dc2626', fontSize: 12, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
                  Please try again {otpError}
                </div>
              )}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <button type="button" onClick={sendOtp} style={{ background: 'none', border: 'none', color: '#00897b', cursor: 'pointer', fontSize: 12, fontWeight: 700, textDecoration: 'underline' }}>Resend OTP</button>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => { setShowOtpModal(false); setOtp(''); setOtpSent(false); setOtpError(''); }}
                  style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Cancel
                </button>
                <button type="button" onClick={verifyOtpAndChangePassword} disabled={otp.length !== 6}
                  style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2E7D32,#00897b)', color: '#fff', fontSize: 13, fontWeight: 800, cursor: otp.length !== 6 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: otp.length !== 6 ? 0.5 : 1 }}>
                  Verify & Change
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Success Modal ── */}
        {showSuccessModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
            <div style={{ background: C.white, borderRadius: 20, padding: '40px 36px', maxWidth: 420, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid rgba(0,168,76,0.15)' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#d1fae5,#6ee7b7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '2.2rem' }}>✅</div>
              <h2 style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 22, fontWeight: 800, color: '#0d2b1e', marginBottom: 10 }}>Password Changed!</h2>
              <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>Your password has been updated successfully.<br />You'll be redirected to login shortly.</p>
              <div style={{ background: '#f0fdf5', borderRadius: 12, padding: '10px 16px', fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                💡 Use your new password on the next login
              </div>
            </div>
          </div>
        )}

        {/* ── Alert Modal ── */}
        {alertModal && (
          <AlertModal message={alertModal.message} type={alertModal.type} onClose={() => setAlertModal(null)} />
        )}

        {/* ── Confirm Modal ── */}
        {confirmModal && (
          <div onClick={() => setConfirmModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(13,43,30,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: 20, backdropFilter: 'blur(4px)' }}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 400, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid rgba(0,168,76,0.15)', fontFamily: 'Montserrat, sans-serif', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>↩</div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0d2b1e', marginBottom: 8 }}>Discard Changes?</h2>
              <p style={{ fontSize: 13, color: '#5a7a65', lineHeight: 1.6, marginBottom: 24 }}>{confirmModal.message}</p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button type="button" onClick={() => setConfirmModal(null)}
                  style={{ padding: '9px 22px', borderRadius: 10, border: '1px solid #b2dfdb', background: '#f0fdf5', color: '#5a7a65', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Keep Editing
                </button>
                <button type="button" onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#c2410c,#ea580c)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 10px rgba(194,65,12,0.35)' }}>
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GCASH QR CONFIRMATION MODAL
  // ─────────────────────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────
  // PAYMONGO GCASH MODAL  — auto-confirms when payment is detected
  // ─────────────────────────────────────────────────────────────────────────────
  function GCashQRModal({ totalAmt, onConfirm, onCancel, fmtPHP }) {
    const [step,       setStep]       = React.useState("loading"); 
    // steps: loading | ready | polling | paid | error
    const [qrUrl,      setQrUrl]      = React.useState("");
    const [linkId,     setLinkId]     = React.useState("");
    const [refNo,      setRefNo]      = React.useState("");
    const [gcashRef,   setGcashRef]   = React.useState("");
    const [errorMsg,   setErrorMsg]   = React.useState("");
    const [countdown,  setCountdown]  = React.useState(180); // 3 min timeout
    const pollRef  = React.useRef(null);
    const timerRef = React.useRef(null);

    // ── Create payment link on mount ──────────────────────────────────────────
    React.useEffect(() => {
      const create = async () => {
        try {
          const res  = await fetch(`${process.env.REACT_APP_API_URL}/paymongo/create-gcash`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount:      totalAmt,
              description: 'iFranchise POS Payment',
              orderId:     Date.now(),
            }),
          });
          const data = await res.json();
          if (!data.success) {
            setErrorMsg(data.error || 'Failed to create payment link.');
            setStep('error');
            return;
          }

          // Generate QR from the checkout URL using a free QR API
          const qr = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.checkoutUrl)}`;
          setQrUrl(qr);
          setLinkId(data.linkId);
          setRefNo(data.referenceNo);
          setStep('ready');
          startPolling(data.linkId);
          startCountdown();
        } catch (err) {
          setErrorMsg('Could not reach payment server.');
          setStep('error');
        }
      };
      create();
      return () => { clearInterval(pollRef.current); clearInterval(timerRef.current); };
    }, []);

    const startPolling = (id) => {
      pollRef.current = setInterval(async () => {
        try {
          const res  = await fetch(`${process.env.REACT_APP_API_URL}/paymongo/link-status/${id}`);
          const data = await res.json();
          if (data.status === 'paid') {
            clearInterval(pollRef.current);
            clearInterval(timerRef.current);
            setGcashRef(data.gcashRef || refNo);
            setStep('paid');
            setTimeout(() => onConfirm(data.gcashRef || refNo), 1500);
          }
        } catch {}
      }, 3000); // poll every 3 seconds
    };

    const startCountdown = () => {
      timerRef.current = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            clearInterval(timerRef.current);
            clearInterval(pollRef.current);
            setStep('error');
            setErrorMsg('Payment window expired. Please try again.');
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    };

    const handleRetry = () => {
      clearInterval(pollRef.current);
      clearInterval(timerRef.current);
      setStep('loading');
      setCountdown(180);
      setErrorMsg('');
    };

    const fmtCountdown = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

    return (
      <div
        onClick={e => { if (e.target===e.currentTarget) onCancel(); }}
        style={{
          position:'fixed', inset:0,
          background:'rgba(0,0,0,0.65)',
          display:'flex', alignItems:'center', justifyContent:'center',
          zIndex:4000, padding:20,
          backdropFilter:'blur(6px)',
        }}
      >
        <div style={{
          background:'#fff', borderRadius:24,
          width:'100%', maxWidth:400,
          overflow:'hidden',
          boxShadow:'0 32px 80px rgba(0,0,0,0.3)',
          fontFamily:"'Plus Jakarta Sans',sans-serif",
          animation:'gcashSlideUp .25s cubic-bezier(.22,1,.36,1)',
        }}>
          <style>{`
            @keyframes gcashSlideUp {
              from{opacity:0;transform:translateY(28px) scale(0.97);}
              to{opacity:1;transform:translateY(0) scale(1);}
            }
            @keyframes spin { to{transform:rotate(360deg);} }
            @keyframes paidPop {
              0%{transform:scale(0.8);opacity:0;}
              70%{transform:scale(1.1);}
              100%{transform:scale(1);opacity:1;}
            }
          `}</style>

          {/* Header */}
          <div style={{
            background:'linear-gradient(135deg,#007acc,#0057a8)',
            padding:'18px 22px',
            display:'flex', justifyContent:'space-between', alignItems:'center',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:34, height:34, borderRadius:9, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:17, color:'#007acc' }}>G</div>
              <div>
                <div style={{ fontWeight:900, fontSize:15, color:'#fff' }}>GCash via PayMongo</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)' }}>
                  {step==='loading' && 'Generating payment link…'}
                  {step==='ready'   && `Waiting for payment · ${fmtCountdown(countdown)}`}
                  {step==='polling' && `Checking payment · ${fmtCountdown(countdown)}`}
                  {step==='paid'    && 'Payment confirmed ✓'}
                  {step==='error'   && 'Payment failed'}
                </div>
              </div>
            </div>
            <button onClick={onCancel} style={{ width:28, height:28, borderRadius:'50%', border:'1.5px solid rgba(255,255,255,0.4)', background:'rgba(255,255,255,0.15)', cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>×</button>
          </div>

          {/* Amount bar */}
          <div style={{ background:'#f0f7ff', padding:'12px 22px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #e5e7eb' }}>
            <div style={{ fontSize:11, fontWeight:800, color:'#5a7a65', textTransform:'uppercase', letterSpacing:'0.07em' }}>Amount</div>
            <div style={{ fontSize:22, fontWeight:900, color:'#0057a8' }}>{fmtPHP(totalAmt)}</div>
          </div>

          {/* Body */}
          <div style={{ padding:'22px 24px 24px', textAlign:'center' }}>

            {/* LOADING */}
            {step==='loading' && (
              <div style={{ padding:'32px 0' }}>
                <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="#007acc" strokeWidth={2} style={{ animation:'spin 0.8s linear infinite', marginBottom:12 }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                <div style={{ fontSize:14, color:'#5a7a65', fontWeight:600 }}>Creating payment link…</div>
              </div>
            )}

            {/* READY — show QR */}
            {(step==='ready' || step==='polling') && qrUrl && (
              <>
                <div style={{ fontSize:13, color:'#374151', fontWeight:600, marginBottom:14 }}>
                  Ask the customer to scan this QR code with their GCash app
                </div>

                {/* QR code */}
                <div style={{
                  width:200, height:200, margin:'0 auto 14px',
                  border:'3px solid #007acc', borderRadius:16,
                  overflow:'hidden', position:'relative',
                }}>
                  <img src={qrUrl} alt="PayMongo GCash QR" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                  {/* Animated scanning line */}
                  <div style={{
                    position:'absolute', top:0, left:0, right:0, height:2,
                    background:'linear-gradient(90deg,transparent,#007acc,transparent)',
                    animation:'scanLine 2s linear infinite',
                  }}/>
                </div>
                <style>{`
                  @keyframes scanLine {
                    0%   { top:0; }
                    100% { top:196px; }
                  }
                `}</style>

                {/* Ref number */}
                {refNo && (
                  <div style={{ fontSize:11, color:'#9ca3af', marginBottom:12 }}>
                    Ref # <strong style={{ color:'#374151', fontFamily:'monospace' }}>{refNo}</strong>
                  </div>
                )}

                {/* Countdown */}
                <div style={{
                  display:'inline-flex', alignItems:'center', gap:6,
                  background: countdown < 30 ? '#fee2e2' : '#f0f7ff',
                  border:`1px solid ${countdown < 30 ? '#fecaca' : '#bfdbfe'}`,
                  borderRadius:20, padding:'5px 14px',
                  fontSize:12, fontWeight:700,
                  color: countdown < 30 ? '#dc2626' : '#1e40af',
                  marginBottom:16,
                }}>
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Expires in {fmtCountdown(countdown)}
                </div>

                {/* Polling indicator */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, fontSize:12, color:'#5a7a65' }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#007acc" strokeWidth={2} style={{ animation:'spin 1.2s linear infinite', flexShrink:0 }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Waiting for payment confirmation…
                </div>
              </>
            )}

            {/* PAID */}
            {step==='paid' && (
              <div style={{ padding:'24px 0', animation:'paidPop .4s ease' }}>
                <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#059669,#047857)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', boxShadow:'0 4px 20px rgba(5,150,105,0.4)' }}>
                  <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div style={{ fontWeight:900, fontSize:18, color:'#0d2b1e', marginBottom:6 }}>Payment Received!</div>
                <div style={{ fontSize:13, color:'#5a7a65', marginBottom:10 }}>
                  {fmtPHP(totalAmt)} via GCash
                </div>
                {gcashRef && (
                  <div style={{ background:'#f0fdf5', border:'1px solid #d1eedd', borderRadius:10, padding:'8px 14px', fontSize:12, fontWeight:700, color:'#00695c', fontFamily:'monospace', letterSpacing:'0.05em' }}>
                    Ref: {gcashRef}
                  </div>
                )}
                <div style={{ marginTop:12, fontSize:12, color:'#9ca3af' }}>Processing transaction…</div>
              </div>
            )}

            {/* ERROR */}
            {step==='error' && (
              <div style={{ padding:'24px 0' }}>
                <div style={{ width:60, height:60, borderRadius:'50%', background:'#fee2e2', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                  <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth={2.5} strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                </div>
                <div style={{ fontWeight:800, fontSize:15, color:'#0d2b1e', marginBottom:6 }}>Payment Failed</div>
                <div style={{ fontSize:13, color:'#5a7a65', marginBottom:20 }}>{errorMsg}</div>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={onCancel} style={{ flex:1, padding:'10px 0', borderRadius:10, border:'1.5px solid #d1d5db', background:'#f9fafb', color:'#6b7280', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                  <button onClick={handleRetry} style={{ flex:1, padding:'10px 0', borderRadius:10, border:'none', background:'linear-gradient(135deg,#007acc,#0057a8)', color:'#fff', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}>Try Again</button>
                </div>
              </div>
            )}

            {/* Cancel button (ready/polling states) */}
            {(step==='ready' || step==='polling') && (
              <button
                onClick={onCancel}
                style={{ marginTop:14, width:'100%', padding:'10px 0', borderRadius:10, border:'1.5px solid #d1d5db', background:'#f9fafb', color:'#6b7280', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}
              >
                Cancel payment
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
  // ─────────────────────────────────────────────────────────────────────────────
  // POS
  // ─────────────────────────────────────────────────────────────────────────────

  function POSContent({ user, brands: propBrands = [] }) {
    const isAdmin    = user?.role === "Administrator";
    const userBranch = user?.branch || "";
      const [filterBrand, setFilterBrand] = React.useState(null);
    const brandList = propBrands.length > 0 ? propBrands : [
      { id: "ipharma",     name: "iPharma",      branches: ["Main Branch","Alabang","Makati","Pasay","Paranaque"] },
      { id: "coffeespot",  name: "Coffee Spot",  branches: ["HQ","BGC Branch","Ortigas","Cubao"] },
    ];
  // Color palette
  const C_teal  = "#14b8a6";
  const C_green = "#22c55e";
  const C_bg    = "#f8fafc";
  const C_white = "#ffffff";
  const C_muted = "#64748b";
  const C_ink   = "#0f172a";
  const C_warn  = "#f59e0b";
  const C_ok    = "#16a34a";
    const [menuItems,        setMenuItems]        = React.useState([]);
    const [cart,             setCart]             = React.useState([]);
    const [transactions,     setTransactions]     = React.useState([]);
    const [voidedTx,         setVoidedTx]         = React.useState([]);
    const [loadingTx,        setLoadingTx]        = React.useState(false);
    const [activeBranch,     setActiveBranch]     = React.useState(isAdmin ? "" : userBranch);
    const [searchProduct,    setSearchProduct]    = React.useState("");
    const [txSearch,         setTxSearch]         = React.useState("");
    const [txDateFrom,       setTxDateFrom]       = React.useState("");
    const [txDateTo,         setTxDateTo]         = React.useState("");
    const [activeTab,        setActiveTab]        = React.useState("cashier");
  const [paymentMethod,     setPaymentMethod]     = React.useState("Cash");
  const [cashReceived,      setCashReceived]      = React.useState("");
  const [isSplitPayment,    setIsSplitPayment]    = React.useState(false);
  const [splitGcashAmt,     setSplitGcashAmt]     = React.useState("");
  const [splitCashAmt,      setSplitCashAmt]      = React.useState("");
  const [splitGcashPaid,    setSplitGcashPaid]    = React.useState(false);
  const [splitGcashRef,     setSplitGcashRef]     = React.useState("");
  const [showGCashModal,    setShowGCashModal]    = React.useState(false);
  const [gcashRefNumber,    setGcashRefNumber]    = React.useState("");
  const [gcashPaymentAmt,   setGcashPaymentAmt]   = React.useState(0);
    const [discountPct,      setDiscountPct]      = React.useState(0);
    const [discountType,        setDiscountType]        = React.useState("None");
    const [showDiscountAuth,    setShowDiscountAuth]     = React.useState(false);
    const [pendingDiscount,     setPendingDiscount]      = React.useState(null);
    const [discountAuthInput,   setDiscountAuthInput]    = React.useState("");
    const [discountAuthErr,     setDiscountAuthErr]      = React.useState("");
    const [customDiscountInput, setCustomDiscountInput]  = React.useState("");
    const [vatEnabled,       setVatEnabled]       = React.useState(false);
    const [showReceiptModal, setShowReceiptModal] = React.useState(false);
    const [lastReceipt,      setLastReceipt]      = React.useState(null);
    const [processing,       setProcessing]       = React.useState(false);
    const [txPage,           setTxPage]           = React.useState(0);
    const [voidPage,         setVoidPage]         = React.useState(0);
    const [noteInput,        setNoteInput]        = React.useState("");
    const [activeShop,       setActiveShop]       = React.useState("Coffee Spot");

    // Void feature state
    const [selectedTxId,     setSelectedTxId]     = React.useState(null);
    const [showVoidModal,    setShowVoidModal]     = React.useState(false);
    const [voidPassword,     setVoidPassword]     = React.useState("");
    const [voidPasswordErr,  setVoidPasswordErr]  = React.useState("");
    const [voidProcessing,   setVoidProcessing]   = React.useState(false);

    // Retrieve from voided
    const [selectedVoidId,   setSelectedVoidId]   = React.useState(null);
    const [showRetrieveModal,setShowRetrieveModal]= React.useState(false);
    const [retrievePassword, setRetrievePassword] = React.useState("");
    const [retrievePasswordErr,setRetrievePasswordErr] = React.useState("");
    const [retrieveProcessing, setRetrieveProcessing] = React.useState(false);

    const MANAGER_PASSWORD = "Admin123";
    const VAT_RATE         = 0.12;
    const TX_PAGE_SIZE     = 20;
    const fmtPHP = n => "₱" + Number(n||0).toLocaleString("en-PH", { minimumFractionDigits:2, maximumFractionDigits:2 });

    const fetchProducts = React.useCallback(async () => {
      try {
        const branchQ = activeBranch ? `?branch=${encodeURIComponent(activeBranch)}` : "";
        const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory${branchQ}`);
        const data = await res.json();
        setMenuItems(Array.isArray(data) ? data : []);
      } catch { setMenuItems([]); }
    }, [activeBranch]);

    const fetchTransactions = React.useCallback(async () => {
      setLoadingTx(true);
      try {
        const q   = activeBranch ? `?branch=${encodeURIComponent(activeBranch)}` : "";
        const res = await fetch(`${process.env.REACT_APP_API_URL}/transactions${q}`);
        const d   = await res.json();
        setTransactions(Array.isArray(d) ? d : []);
      } catch { setTransactions([]); }
      finally { setLoadingTx(false); }
    }, [activeBranch]);

    const fetchVoidedTransactions = React.useCallback(async () => {
      try {
        const q   = activeBranch ? `?branch=${encodeURIComponent(activeBranch)}` : "";
        const res = await fetch(`${process.env.REACT_APP_API_URL}/transactions/voided${q}`);
        const d   = await res.json();
        setVoidedTx(Array.isArray(d) ? d : []);
      } catch { setVoidedTx([]); }
    }, [activeBranch]);

    React.useEffect(() => { fetchProducts(); },           [fetchProducts]);
    React.useEffect(() => { fetchTransactions(); },       [fetchTransactions]);
    React.useEffect(() => { fetchVoidedTransactions(); }, [fetchVoidedTransactions]);
    React.useEffect(() => { setTxPage(0); },  [txSearch, txDateFrom, txDateTo]);
    React.useEffect(() => { setVoidPage(0); }, [txSearch, txDateFrom, txDateTo]);
    // Deselect when switching tabs
    React.useEffect(() => { setSelectedTxId(null); setSelectedVoidId(null); }, [activeTab]);

    const allProducts = React.useMemo(() => {
      if (!activeBranch) return [];
      const menu = menuItems
        .filter(m => m.branch === activeBranch)
        .map(m => ({ ...m, source: "menu", displayName: m.name }));
      const q = searchProduct.toLowerCase();
      return menu.filter(p => !q || p.displayName.toLowerCase().includes(q) || (p.category||"").toLowerCase().includes(q));
    }, [menuItems, activeBranch, searchProduct]);

    const addToCart = (product) => {
      setCart(prev => {
        const existing = prev.find(c => c.id === product.id && c.source === product.source);
        if (existing) return prev.map(c => c.id === product.id && c.source === product.source ? { ...c, qty: c.qty+1 } : c);
        return [...prev, { ...product, qty: 1 }];
      });
    };

    const updateQty = (id, source, delta) => {
      setCart(prev => prev.map(c => c.id===id && c.source===source ? { ...c, qty: Math.max(0, c.qty+delta) } : c).filter(c => c.qty > 0));
    };

    const removeFromCart = (id, source) => setCart(prev => prev.filter(c => !(c.id===id && c.source===source)));
    
  const clearCart = () => {
    setCart([]);
    setCashReceived("");
    setDiscountPct(0);
    setDiscountType("None");
    setNoteInput("");
    setCustomDiscountInput("");
    setShowDiscountAuth(false);
    setPendingDiscount(null);
    setGcashRefNumber("");
    setGcashPaymentAmt(0);
    setIsSplitPayment(false);
    setSplitGcashAmt("");
    setSplitCashAmt("");
    setSplitGcashPaid(false);
    setSplitGcashRef("");
  };
    const confirmDiscountAuth = () => {
    if (discountAuthInput !== MANAGER_PASSWORD) {
      setDiscountAuthErr("Incorrect manager password.");
      return;
    }
    if (pendingDiscount.label === "Others") {
      const pct = parseFloat(customDiscountInput);
      if (!pct || pct <= 0 || pct > 100) {
        setDiscountAuthErr("Enter a valid discount % (1–100).");
        return;
      }
      setDiscountPct(pct);
      setDiscountType("Others");
    } else {
      setDiscountPct(pendingDiscount.pct);
      setDiscountType(pendingDiscount.label);
    }
    setShowDiscountAuth(false);
    setDiscountAuthInput("");
    setDiscountAuthErr("");
    setCustomDiscountInput("");
    setPendingDiscount(null);
  };

    const subtotal      = cart.reduce((s, c) => s + (c.price||0)*c.qty, 0);
    const discountAmt   = subtotal * (discountPct/100);
    const discountedAmt = subtotal - discountAmt;
    const vatAmt        = vatEnabled ? discountedAmt * VAT_RATE : 0;
    const totalAmt      = discountedAmt + vatAmt;
    const changeDue     = paymentMethod==="Cash" ? Math.max(0, parseFloat(cashReceived||0) - totalAmt) : 0;
    const cashShortfall = paymentMethod==="Cash" && cashReceived!=="" ? parseFloat(cashReceived||0) - totalAmt : 0;

    const processSale = async () => {
    if (cart.length === 0) { alert("Cart is empty."); return; }
    if (!activeBranch && isAdmin) { alert("Please select a branch first."); return; }

    // ── Split payment validation ────────────────────────────────────────────
    if (isSplitPayment) {
      const gcash   = parseFloat(splitGcashAmt) || 0;
      const cash    = parseFloat(splitCashAmt)  || 0;
      const covered = Math.abs((gcash + cash) - totalAmt) < 0.01;

      if (!covered) {
        alert(`Split amounts must add up to exactly ${fmtPHP(totalAmt)}.\nCurrent total: ${fmtPHP(gcash + cash)}`);
        return;
      }
      if (gcash > 0 && !splitGcashPaid) {
        alert("Please complete the GCash payment first before processing.");
        return;
      }
    } else {
      // Normal single payment validation
      if (paymentMethod==="Cash" && parseFloat(cashReceived||0) < totalAmt) {
        alert("Cash received is less than total amount.");
        return;
      }
      if (paymentMethod==="GCash" && !gcashRefNumber) {
        setShowGCashModal(true);
        return;
      }
    }

    setProcessing(true);
    try {
      const payload = {
        branch:         activeBranch || userBranch,
        cashier:        user?.name || "Staff",
        shop:           activeShop,
        // payment method label
        payment_method: isSplitPayment ? "Split" : paymentMethod,
        // split details
        is_split:       isSplitPayment,
        split_gcash_amt: isSplitPayment ? (parseFloat(splitGcashAmt)||0) : null,
        split_cash_amt:  isSplitPayment ? (parseFloat(splitCashAmt)||0)  : null,
        gcash_ref:      isSplitPayment ? splitGcashRef : (paymentMethod==="GCash" ? gcashRefNumber : null),
        // cash fields
        cash_received:  isSplitPayment
          ? (parseFloat(splitCashAmt)||0)
          : (paymentMethod==="Cash" ? parseFloat(cashReceived) : totalAmt),
        discount_pct:   discountPct,
        subtotal,
        discount_amt:   discountAmt,
        vat_enabled:    vatEnabled,
        vat_amt:        vatAmt,
        total:          totalAmt,
        change_due:     isSplitPayment
          ? Math.max(0, (parseFloat(splitCashAmt)||0) - (totalAmt - (parseFloat(splitGcashAmt)||0)))
          : changeDue,
        note:           noteInput,
        items: cart.map(c => ({
          id: c.id, source: c.source, name: c.displayName,
          price: c.price, qty: c.qty, subtotal: c.price*c.qty,
        })),
      };
    
        const res = await fetch(`${process.env.REACT_APP_API_URL}/transactions`, {
          method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)
        });
        const d = await res.json();
        if (d.success) {
          setLastReceipt({ ...payload, id: d.id, date: new Date().toLocaleString() });
          setShowReceiptModal(true);
          clearCart(); fetchTransactions(); fetchProducts();
        } else alert(d.error || "Failed to process sale");
      } catch { alert("Failed to process sale. Check server connection."); }
      finally { setProcessing(false); }
    };

    const openVoidModal = () => {
      if (!selectedTxId) return;
      const tx = transactions.find(t => t.id === selectedTxId);
      if (tx) {
        const createdAt = new Date(tx.created_at);
        const hoursDiff = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
        if (hoursDiff > 24) {
          alert("This transaction can no longer be voided. Void window is 24 hours from the time of sale.");
          return;
        }
      }
      setVoidPassword(""); setVoidPasswordErr(""); setShowVoidModal(true);
    };

    const confirmVoid = async () => {
      if (voidPassword !== MANAGER_PASSWORD) {
        setVoidPasswordErr("Incorrect manager password."); return;
      }
      setVoidProcessing(true);
      
      const tx = transactions.find(t => t.id === selectedTxId);
      if (tx) {
        const voidedEntry = { 
          ...tx, 
          voided_at: new Date().toISOString(), 
          voided_by: user?.name || "Manager" 
        };
        setTransactions(prev => prev.filter(t => t.id !== selectedTxId));
        setVoidedTx(prev => [voidedEntry, ...prev]);
      }
      
      setShowVoidModal(false);
      setSelectedTxId(null);

      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/transactions/${selectedTxId}/void`, {
          method: "POST", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voided_by: user?.name || "Manager", reason: "Manual void" }),
        });
        const d = await res.json();
        if (d.success) {
          setTimeout(() => {
            fetchTransactions();
            fetchVoidedTransactions();
          }, 500);
        }
      } catch {
      } finally { 
        setVoidProcessing(false); 
      }
    };

    const openRetrieveModal = () => {
      if (!selectedVoidId) return;
      setRetrievePassword(""); setRetrievePasswordErr(""); setShowRetrieveModal(true);
    };

    const confirmRetrieve = async () => {
      if (retrievePassword !== MANAGER_PASSWORD) {
        setRetrievePasswordErr("Incorrect manager password."); return;
      }
      setRetrieveProcessing(true);
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/transactions/${selectedVoidId}/retrieve`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ retrieved_by: user?.name||"Manager" }),
        });
        const d = await res.json();
        if (d.success) {
          setShowRetrieveModal(false); setSelectedVoidId(null);
          fetchTransactions(); fetchVoidedTransactions();
        } else {
          // Optimistic fallback
          const tx = voidedTx.find(t => t.id === selectedVoidId);
          if (tx) {
            const { voided_at, voided_by, ...restored } = tx;
            setVoidedTx(prev => prev.filter(t => t.id !== selectedVoidId));
            setTransactions(prev => [restored, ...prev]);
          }
          setShowRetrieveModal(false); setSelectedVoidId(null);
        }
      } catch {
        const tx = voidedTx.find(t => t.id === selectedVoidId);
        if (tx) {
          const { voided_at, voided_by, ...restored } = tx;
          setVoidedTx(prev => prev.filter(t => t.id !== selectedVoidId));
          setTransactions(prev => [restored, ...prev]);
        }
        setShowRetrieveModal(false); setSelectedVoidId(null);
      }
      finally { setRetrieveProcessing(false); }
    };

    const filteredTx = React.useMemo(() => {
      const q = txSearch.toLowerCase();
      return transactions.filter(tx => {
        if (q && !String(tx.id).includes(q) && !(tx.cashier||"").toLowerCase().includes(q) && !(tx.branch||"").toLowerCase().includes(q)) return false;
        if (txDateFrom && tx.created_at < txDateFrom) return false;
        if (txDateTo   && tx.created_at > txDateTo+"T23:59:59") return false;
        return true;
      });
    }, [transactions, txSearch, txDateFrom, txDateTo]);

    const filteredVoidedTx = React.useMemo(() => {
      const q = txSearch.toLowerCase();
      return voidedTx.filter(tx => {
        if (q && !String(tx.id).includes(q) && !(tx.cashier||"").toLowerCase().includes(q) && !(tx.branch||"").toLowerCase().includes(q)) return false;
        if (txDateFrom && (tx.voided_at||tx.created_at) < txDateFrom) return false;
        if (txDateTo   && (tx.voided_at||tx.created_at) > txDateTo+"T23:59:59") return false;
        return true;
      });
    }, [voidedTx, txSearch, txDateFrom, txDateTo]);

    const txTotalPages   = Math.max(1, Math.ceil(filteredTx.length/TX_PAGE_SIZE));
    const txPageItems    = filteredTx.slice(txPage*TX_PAGE_SIZE, (txPage+1)*TX_PAGE_SIZE);
    const voidTotalPages = Math.max(1, Math.ceil(filteredVoidedTx.length/TX_PAGE_SIZE));
    const voidPageItems  = filteredVoidedTx.slice(voidPage*TX_PAGE_SIZE, (voidPage+1)*TX_PAGE_SIZE);

    const todayStr     = new Date().toISOString().slice(0,10);
    const todaySales   = transactions.filter(tx => (tx.created_at||"").startsWith(todayStr));
    const todayRevenue = todaySales.reduce((s, tx) => s + Number(tx.total||0), 0);
    const todayCount   = todaySales.length;
    const todayAvg     = todayCount > 0 ? todayRevenue/todayCount : 0;

    const allBranches = React.useMemo(() => {
      const out = [];
      brandList.forEach(b => (b.branches||[]).forEach(br => {
        const name = typeof br==="string" ? br : br.name;
        if (!out.includes(name)) out.push(name);
      }));
      return out;
    }, [brandList]);

    const printReceipt = () => window.print();

    // ── PAGINATION ────────────────────────────────────────────────────────────
    const POSPagination = ({ page, setPage, total, pageSize }) => {
      const totalPgs = Math.max(1, Math.ceil(total/pageSize));
      if (totalPgs <= 1) return null;
      return (
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 16px", borderTop:`1px solid ${C.border}`, background:"#f9fefb" }}>
          <span style={{ fontSize:12, color:C.muted }}>
            Showing <strong style={{ color:C.ink }}>{(page*pageSize+1).toLocaleString()}–{Math.min((page+1)*pageSize,total).toLocaleString()}</strong> of <strong style={{ color:C.ink }}>{total.toLocaleString()}</strong>
          </span>
          <div style={{ display:"flex", gap:4 }}>
            {[{l:"«",a:()=>setPage(0),d:page===0},{l:"‹",a:()=>setPage(p=>Math.max(0,p-1)),d:page===0}].map(({l,a,d})=>(
              <button key={l} onClick={a} disabled={d} style={{ ...smallBtnSt, height:30, width:30, justifyContent:"center", border:`1px solid ${C.border}`, opacity:d?0.35:1 }}>{l}</button>
            ))}
            {Array.from({length:totalPgs},(_,i)=>i).filter(i=>Math.abs(i-page)<=2).map(i=>(
              <button key={i} onClick={()=>setPage(i)} style={{ ...smallBtnSt, height:30, minWidth:30, justifyContent:"center", fontWeight:i===page?800:600, border:i===page?"none":`1px solid ${C.border}`, background:i===page?`linear-gradient(135deg,${C.teal},${C.green})`:C.white, color:i===page?C.white:C.ink }}>{i+1}</button>
            ))}
            {[{l:"›",a:()=>setPage(p=>Math.min(totalPgs-1,p+1)),d:page>=totalPgs-1},{l:"»",a:()=>setPage(totalPgs-1),d:page>=totalPgs-1}].map(({l,a,d})=>(
              <button key={l} onClick={a} disabled={d} style={{ ...smallBtnSt, height:30, width:30, justifyContent:"center", border:`1px solid ${C.border}`, opacity:d?0.35:1 }}>{l}</button>
            ))}
          </div>
        </div>
      );
    };

    // ── TX TABLE (shared between history and voided) ──────────────────────────
    const TxTable = ({ items, selectedId, onSelect, isVoided = false }) => (
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr>
              {["","#","Date", isVoided ? "Voided At" : null, isVoided ? "Voided By" : null, "Branch","Shop","Cashier","Items","Subtotal","Discount","VAT","Total","Payment","Status"].filter(Boolean).map(h=>(
                <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontWeight:800, fontSize:10.5, color:"#00897b", letterSpacing:"0.07em", textTransform:"uppercase", borderBottom:`1px solid ${C.border}`, background:"#f8fffe", whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(tx=>{
              const isSelected = selectedId === tx.id;
              return (
                <tr key={tx.id}
                  onClick={()=>onSelect(isSelected ? null : tx.id)}
                  style={{ borderBottom:`1px solid #f0f8f0`, cursor:"pointer", background: isSelected ? "#e8f5e9" : "transparent", transition:"background .1s" }}
                  onMouseEnter={e=>{ if (!isSelected) e.currentTarget.style.background="#f6fef8"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background = isSelected ? "#e8f5e9" : "transparent"; }}>
                  {/* Checkbox col */}
                  <td style={{ padding:"10px 10px 10px 14px" }}>
                    <div style={{ width:16, height:16, borderRadius:4, border:`2px solid ${isSelected ? C.green : C.border}`, background: isSelected ? C.green : C.white, display:"flex", alignItems:"center", justifyContent:"center", transition:"all .1s" }}>
                      {isSelected && <svg width={10} height={10} viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                  </td>
                  <td style={{ padding:"10px 12px", fontWeight:700, color:C.muted, fontSize:12 }}>#{tx.id}</td>
                  <td style={{ padding:"10px 12px", color:C.muted, fontSize:12, whiteSpace:"nowrap" }}>
                    {new Date(tx.created_at).toLocaleString("en-PH",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}
                  </td>
                  {isVoided && (
                    <td style={{ padding:"10px 12px", color:"#c62828", fontSize:12, whiteSpace:"nowrap" }}>
                      {tx.voided_at ? new Date(tx.voided_at).toLocaleString("en-PH",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}) : "—"}
                    </td>
                  )}
                  {isVoided && (
                    <td style={{ padding:"10px 12px", color:C.muted, fontSize:12 }}>{tx.voided_by || "—"}</td>
                  )}
                  <td style={{ padding:"10px 12px", color:C.muted, fontSize:12 }}>{tx.branch}</td>
                  <td style={{ padding:"10px 12px" }}>
                    <span style={{ padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:600, background:tx.shop==="Coffee Spot"?"#fff8e1":"#e0f2f1", color:tx.shop==="Coffee Spot"?"#f57f17":"#00695c" }}>{tx.shop}</span>
                  </td>
                  <td style={{ padding:"10px 12px", color:C.ink, fontWeight:600, fontSize:12 }}>{tx.cashier}</td>
                  <td style={{ padding:"10px 12px", color:C.muted, fontSize:12 }}>{(tx.items||[]).length} item{(tx.items||[]).length!==1?"s":""}</td>
                  <td style={{ padding:"10px 12px", color:C.muted }}>{fmtPHP(tx.subtotal)}</td>
                  <td style={{ padding:"10px 12px" }}>
                    {tx.discount_pct>0 ? <span style={{ color:C.warn, fontWeight:700 }}>−{tx.discount_pct}%</span> : <span style={{ color:C.muted }}>—</span>}
                  </td>
                  <td style={{ padding:"10px 12px" }}>
                    {tx.vat_enabled ? <span style={{ color:"#1565c0", fontWeight:700 }}>+{fmtPHP(tx.vat_amt)}</span> : <span style={{ color:C.muted }}>—</span>}
                  </td>
                  <td style={{ padding:"10px 12px", fontWeight:800, color: isVoided ? C.muted : C.green }}>{fmtPHP(tx.total)}</td>
                  <td style={{ padding:"10px 12px" }}>
                    <span style={{ padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:600,
                      background:tx.payment_method==="Cash"?"#e8f5e9":tx.payment_method==="GCash"?"#e3f2fd":"#f3e5f5",
                      color:tx.payment_method==="Cash"?"#2e7d32":tx.payment_method==="GCash"?"#1565c0":"#6a1b9a" }}>
                      {tx.payment_method}
                    </span>
                  </td>
                  <td style={{ padding:"10px 12px" }}>
                    {isVoided ? (
                      <span style={{ padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:600, background:"rgba(229,57,53,0.1)", color:"#c62828" }}>Voided</span>
                    ) : (
                      <span style={{ padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:600, background:"rgba(16,185,129,0.1)", color:"#059669" }}>Completed</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );

    const ManagerModal = ({ title, subtitle, icon, actionLabel, actionColor, password, setPassword, error, onConfirm, onClose, processing }) => (
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:3000 }}
        onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
        <div style={{ background:C.white, borderRadius:20, padding:"28px 32px", width:360, maxWidth:"95vw", boxShadow:"0 16px 64px rgba(0,0,0,0.25)" }}>
          <div style={{ textAlign:"center", marginBottom:20 }}>
            <div style={{ fontSize:"2.5rem", marginBottom:8 }}>{icon}</div>
            <div style={{ fontWeight:900, fontSize:18, color:C.ink }}>{title}</div>
            <div style={{ fontSize:13, color:C.muted, marginTop:6, lineHeight:1.5 }}>{subtitle}</div>
          </div>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>Manager Password</div>
            <input
              type="password"
              placeholder="Enter password…"
              value={password}
              onChange={e=>{ setPassword(e.target.value); }}
              onKeyDown={e=>{ if(e.key==="Enter") onConfirm(); }}
              autoFocus
              style={{ ...invInputSt, fontSize:15, letterSpacing:"0.15em" }}
            />
            {error && <div style={{ marginTop:6, fontSize:12, color:C.red, fontWeight:700 }}>⚠ {error}</div>}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={onClose} style={{ ...btnSt, flex:1, justifyContent:"center" }}>Cancel</button>
            <button onClick={onConfirm} disabled={processing}
              style={{ flex:1, height:36, border:"none", borderRadius:9, fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"inherit",
                background:`linear-gradient(135deg,${actionColor||C.red},${actionColor ? actionColor+"cc" : "#b71c1c"})`,
                color:C.white, opacity:processing?0.7:1, justifyContent:"center", display:"flex", alignItems:"center", gap:6 }}>
              {processing ? "Processing…" : actionLabel}
            </button>
          </div>
        </div>
      </div>
    );

    return (
      <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", background:"linear-gradient(140deg,#e8f5e9 0%,#f0faf4 45%,#e0f2f1 100%)", minHeight:"100vh", padding:"24px 30px 48px" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
          @media print { body > * { display: none !important; } .pos-receipt-print { display: block !important; } }
        `}</style>

        {/* ── KPI CARDS ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:18 }}>
          {[
            { label:"Today's Revenue",     value:fmtPHP(todayRevenue), sub:"All transactions today",   accent:C.green },
            { label:"Transactions Today",  value:todayCount,           sub:"Completed sales",           accent:"#1565c0" },
            { label:"Average Order Value", value:fmtPHP(todayAvg),     sub:"Per transaction",           accent:"#6a1b9a" },
            { label:"Items in Cart",       value:cart.reduce((s,c)=>s+c.qty,0), sub:"Current session", accent:C.warn },
          ].map((s,i)=>(
            <div key={i} style={{ background:C.white, border:`1px solid rgba(0,168,76,0.13)`, borderRadius:14, padding:"14px 18px", boxShadow:"0 1px 6px rgba(0,140,60,0.05)" }}>
              <div style={{ fontSize:10, fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase", color:s.accent, marginBottom:5 }}>{s.label}</div>
              <div style={{ fontSize:22, fontWeight:800, color:C.ink, lineHeight:1.15 }}>{s.value}</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── TAB BAR + VOID BUTTON ROW ── */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div style={{ display:"flex", gap:4, background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:5, width:"fit-content", boxShadow:"0 1px 6px rgba(0,140,60,0.05)" }}>
            {[
              { id:"cashier", label:"Cashier" },
              { id:"history", label:"Transaction History", count: transactions.length },
              { id:"voided",  label:"Recently Voided",     count: voidedTx.length, countColor:"#c62828", countBg:"rgba(229,57,53,0.15)" },
            ].map(tab=>(
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                style={{ padding:"8px 22px", borderRadius:10, border:"none", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                  background:activeTab===tab.id?`linear-gradient(135deg,${C.teal},${C.green})`:"transparent",
                  color:activeTab===tab.id?C.white:C.muted,
                  boxShadow:activeTab===tab.id?"0 2px 10px rgba(0,180,90,0.28)":"none", transition:"all .15s" }}>
                {tab.label}
                {tab.count > 0 && (
                  <span style={{ marginLeft:7, background: tab.countBg || "rgba(255,255,255,0.25)", color: tab.countColor || (activeTab===tab.id ? C.white : C.muted), padding:"1px 8px", borderRadius:20, fontSize:11 }}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* VOID BUTTON — visible only on history/voided tabs */}
          {activeTab === "history" && (() => {
            const selectedTx = transactions.find(t => t.id === selectedTxId);
            const isExpired = selectedTx
              ? (Date.now() - new Date(selectedTx.created_at).getTime()) / (1000 * 60 * 60) > 24
              : false;
            const canVoid = selectedTxId && !isExpired;

            return (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <button
                  onClick={openVoidModal}
                  disabled={!selectedTxId}
                  style={{
                    display: "flex", alignItems: "center", gap: 7, height: 38, padding: "0 18px",
                    border: "none", borderRadius: 10, fontSize: 13, fontWeight: 800,
                    cursor: selectedTxId && !isExpired ? "pointer" : "not-allowed", fontFamily: "inherit",
                    background: canVoid
                      ? "linear-gradient(135deg,#e53935,#b71c1c)"
                      : "#e0e0e0",
                    color: canVoid ? C.white : "#9e9e9e",
                    boxShadow: canVoid ? "0 3px 12px rgba(229,57,53,0.35)" : "none",
                    transition: "all .15s", opacity: selectedTxId ? 1 : 0.7,
                  }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4h6v2"/>
                  </svg>
                  {isExpired ? "Void Expired" : "Void Transaction"}
                  {selectedTxId && (
                    <span style={{ background: "rgba(255,255,255,0.2)", padding: "1px 7px", borderRadius: 12, fontSize: 11 }}>
                      #{selectedTxId}
                    </span>
                  )}
                </button>
                {isExpired && (
                  <span style={{ fontSize: 11, color: "#c62828", fontWeight: 600 }}>
                    ⚠ Past 24-hour void window
                  </span>
                )}  
              </div>
            );
          })()}

          {activeTab === "voided" && (
            <button
              onClick={openRetrieveModal}
              disabled={!selectedVoidId}
              style={{ display:"flex", alignItems:"center", gap:7, height:38, padding:"0 18px", border:"none", borderRadius:10,
                fontSize:13, fontWeight:800, cursor: selectedVoidId ? "pointer" : "not-allowed", fontFamily:"inherit",
                background: selectedVoidId ? `linear-gradient(135deg,${C.teal},${C.green})` : "#e0e0e0",
                color: selectedVoidId ? C.white : "#9e9e9e",
                boxShadow: selectedVoidId ? "0 3px 12px rgba(0,180,90,0.35)" : "none",
                transition:"all .15s", opacity: selectedVoidId ? 1 : 0.7 }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.41"/></svg>
              Retrieve Transaction
              {selectedVoidId && <span style={{ background:"rgba(255,255,255,0.2)", padding:"1px 7px", borderRadius:12, fontSize:11 }}>#{selectedVoidId}</span>}
            </button>
          )}
        </div>

        {/* ── CASHIER TAB ── */}
        {activeTab === "cashier" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:18, alignItems:"start" }}>
            {/* Products panel */}
            <div>
              <div style={{ background:C.white, border:`1px solid rgba(0,168,76,0.13)`, borderRadius:16, padding:"14px 18px", marginBottom:14, boxShadow:"0 1px 8px rgba(0,140,60,0.05)" }}>
                <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                  {isAdmin && (
                    <BrandBranchFilter
                      brands={brandList}
                      activeBrand={filterBrand}
                      activeBranch={activeBranch}
                      onChangeBrand={id => {
                        setFilterBrand(id);
                        setActiveBranch("");
                      }}
                      onChangeBranch={val => setActiveBranch(val || "")}
                    />
                  )}
                  <div style={{ position:"relative", flex:"1 1 200px" }}>
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    <input type="text" placeholder="Search products…" value={searchProduct} onChange={e=>setSearchProduct(e.target.value)} style={{ ...invInputSt, paddingLeft:30 }}/>
                  </div>
                </div>
              </div>

              {allProducts.length === 0 ? (
                <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:"48px 0", textAlign:"center", color:C.muted }}>
                  <div style={{ fontSize:"2rem", marginBottom:10 }}></div>
                  <div style={{ fontWeight:700, fontSize:14 }}>
                    {!activeBranch ? "Select a branch to view products" : "No products found for this branch"}
                  </div>
                  <div style={{ fontSize:12, marginTop:4 }}>
                    {!activeBranch
                      ? "Choose a branch from the dropdown above to load its menu."
                      : "Add items via Menu Inventory and assign them to this branch."}
                  </div>
                </div>
              ) : (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12 }}>
                  {allProducts.map(product => {
                    const inCart = cart.find(c=>c.id===product.id && c.source===product.source);
                    return (
                      <div key={`${product.source}-${product.id}`} onClick={()=>addToCart(product)}
                        style={{ background:C.white, border:`2px solid ${inCart?C.green:C.border}`, borderRadius:14, padding:"14px 12px", cursor:"pointer", transition:"all .15s",
                          boxShadow:inCart?"0 4px 16px rgba(0,180,90,0.18)":"0 1px 6px rgba(0,140,60,0.05)", position:"relative" }}
                        onMouseEnter={e=>{if(!inCart)e.currentTarget.style.borderColor=C.teal;}}
                        onMouseLeave={e=>{if(!inCart)e.currentTarget.style.borderColor=C.border;}}>
                        {inCart && (
                          <div style={{ position:"absolute", top:8, right:8, background:`linear-gradient(135deg,${C.teal},${C.green})`, color:C.white, borderRadius:20, fontSize:11, fontWeight:800, padding:"2px 8px" }}>×{inCart.qty}</div>
                        )}
                        {product.image_url ? (
                          <img src={product.image_url} alt="" style={{ width:"100%", height:130, objectFit:"cover", borderRadius:9, marginBottom:10 }} onError={e=>e.target.style.display="none"}/>
                        ) : (
                          <div style={{ width:"100%", height:130, borderRadius:9, background:`linear-gradient(135deg,${C.greenLt},${C.greenMid})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem", marginBottom:10 }}>🛒</div>
                        )}
                        <div style={{ fontWeight:700, fontSize:13, color:C.ink, marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{product.displayName}</div>
                        {product.category && <div style={{ fontSize:11, color:C.muted, marginBottom:6 }}>{product.category}</div>}
                        <div style={{ fontWeight:800, fontSize:15, color:C.green }}>{fmtPHP(product.price)}</div>
                        {product.stock !== undefined && (
                          <div style={{ fontSize:10, color:product.stock<=5?C.warn:C.muted, marginTop:3, fontWeight:600 }}>Stock: {product.stock}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ position:"sticky", top:80 }}>
              <div style={{ background:C.white, border:`1px solid rgba(0,168,76,0.13)`, borderRadius:18, boxShadow:"0 2px 18px rgba(0,140,60,0.09)", overflow:"hidden" }}>
                <div style={{ padding:"14px 18px", background:`linear-gradient(135deg,${C.teal},${C.green})`, display:"flex", justifyContent:"space-between", alignItems:"center", color:C.white }}>
                  <span style={{ fontWeight:800, fontSize:14 }}>🛒 Order Cart</span>
                  {cart.length > 0 && (
                    <button onClick={clearCart} style={{ background:"rgba(255,255,255,0.2)", border:"none", color:C.white, borderRadius:8, padding:"4px 12px", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Clear</button>
                  )}
                </div>
                <div style={{ maxHeight:280, overflowY:"auto", padding:cart.length===0?"0":"8px 0" }}>
                  {cart.length === 0 ? (
                    <div style={{ padding:"32px 0", textAlign:"center", color:C.muted, fontSize:13 }}>
                      <div style={{ fontSize:"2rem", marginBottom:8 }}></div>
                      Tap a product to add it
                    </div>
                  ) : cart.map(item=>(
                    <div key={`${item.source}-${item.id}`} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 16px", borderBottom:`1px solid #f0fdf5` }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:700, fontSize:13, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.displayName}</div>
                        <div style={{ fontSize:11, color:C.muted }}>{fmtPHP(item.price)} each</div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
                        <button onClick={()=>updateQty(item.id,item.source,-1)} style={{ width:26, height:26, borderRadius:7, border:`1px solid ${C.border}`, background:C.bg, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:C.ink }}>−</button>
                        <span style={{ fontSize:13, fontWeight:800, color:C.ink, minWidth:20, textAlign:"center" }}>{item.qty}</span>
                        <button onClick={()=>updateQty(item.id,item.source,+1)} style={{ width:26, height:26, borderRadius:7, border:`1px solid ${C.border}`, background:C.bg, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:C.green }}>+</button>
                      </div>
                      <div style={{ minWidth:60, textAlign:"right", fontWeight:800, fontSize:13, color:C.green }}>{fmtPHP(item.price*item.qty)}</div>
                      <button onClick={()=>removeFromCart(item.id,item.source)} style={{ background:"none", border:"none", color:"#e53935", cursor:"pointer", padding:2, fontSize:16, lineHeight:1 }}>×</button>
                    </div>
                  ))}
                </div>

                <div style={{ padding:"14px 18px", borderTop:`1px solid ${C.border}` }}>
                {/* Discount */}
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:6 }}>Discount</label>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {[
                      { label:"None",           pct:0,  requiresAuth:false },
                      { label:"PWD",            pct:20, requiresAuth:true  },
                      { label:"Senior Citizen", pct:20, requiresAuth:true  },
                      { label:"Others",         pct:null, requiresAuth:true },
                    ].map(d => {
                      const isActive = d.pct !== null
                        ? discountPct === d.pct && discountType === d.label
                        : discountType === "Others";
                      return (
                        <button key={d.label}
                          onClick={() => {
                            if (d.label === "None") {
                              setDiscountPct(0);
                              setDiscountType("None");
                              setShowDiscountAuth(false);
                              setCustomDiscountInput("");
                            } else {
                              setPendingDiscount(d);
                              setDiscountAuthInput("");
                              setDiscountAuthErr("");
                              setCustomDiscountInput("");
                              setShowDiscountAuth(true);
                            }
                          }}
                          style={{ height:32, padding:"0 14px", borderRadius:8, border:"none", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                            background:isActive ? `linear-gradient(135deg,${C.teal},${C.green})` : C.bg,
                            color:isActive ? C.white : C.muted }}>
                          {d.label}{d.pct !== null && d.label !== "None" ? ` (${d.pct}%)` : ""}
                        </button>
                      );
                    })}
                  </div>

                  {/* Active discount badge */}
                  {discountType && discountType !== "None" && discountPct > 0 && (
                    <div style={{ marginTop:6, fontSize:12, color:C.ok, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ background:C.okBg, border:`1px solid ${C.greenMid}`, borderRadius:20, padding:"2px 10px" }}>
                        {discountType} — {discountPct}% off
                      </span>
                      <button onClick={()=>{ setDiscountPct(0); setDiscountType("None"); }}
                        style={{ background:"none", border:"none", cursor:"pointer", color:"#e53935", fontSize:13, fontWeight:800, padding:0 }}>×</button>
                    </div>
                  )}
                </div>

                {/* Discount Auth Modal */}
                {showDiscountAuth && pendingDiscount && (
                  <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:3000 }}
                    onClick={e=>{ if(e.target===e.currentTarget){ setShowDiscountAuth(false); } }}>
                    <div style={{ background:C.white, borderRadius:18, padding:"26px 28px", width:340, maxWidth:"95vw", boxShadow:"0 16px 48px rgba(0,0,0,0.22)" }}>
                      <div style={{ fontWeight:800, fontSize:16, color:C.ink, marginBottom:4 }}>
                        {pendingDiscount.label} Discount
                      </div>
                      <div style={{ fontSize:12, color:C.muted, marginBottom:16 }}>
                        Manager authorization required to apply this discount.
                      </div>

                      {/* Custom % input for Others */}
                      {pendingDiscount.label === "Others" && (
                        <div style={{ marginBottom:12 }}>
                          <div style={{ fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:5 }}>Custom Discount %</div>
                          <input
                            type="number" min="1" max="100"
                            placeholder="e.g. 15"
                            value={customDiscountInput}
                            onChange={e => setCustomDiscountInput(e.target.value)}
                            style={{ ...invInputSt }}
                          />
                        </div>
                      )}

                      <div style={{ marginBottom:16 }}>
                        <div style={{ fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:5 }}>Manager Password</div>
                        <input
                          type="password"
                          placeholder="Enter password…"
                          value={discountAuthInput}
                          onChange={e=>{ setDiscountAuthInput(e.target.value); setDiscountAuthErr(""); }}
                          onKeyDown={e=>{ if(e.key==="Enter") confirmDiscountAuth(); }}
                          autoFocus
                          style={{ ...invInputSt }}
                        />
                        {discountAuthErr && (
                          <div style={{ marginTop:5, fontSize:12, color:"#e53935", fontWeight:700 }}>⚠ {discountAuthErr}</div>
                        )}
                      </div>

                      <div style={{ display:"flex", gap:8 }}>
                        <button onClick={()=>setShowDiscountAuth(false)}
                          style={{ ...btnSt, flex:1, justifyContent:"center" }}>Cancel</button>
                        <button onClick={confirmDiscountAuth}
                          style={{ ...btnPrimarySt, flex:1, justifyContent:"center" }}>Apply Discount</button>
                      </div>
                    </div>
                  </div>
                )} 
                  {/* VAT toggle */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                    <label style={{ fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em" }}>VAT (12%)</label>
                    <div onClick={()=>setVatEnabled(v=>!v)}
                      style={{ width:44, height:24, borderRadius:12, cursor:"pointer", position:"relative", background:vatEnabled?`linear-gradient(135deg,${C.teal},${C.green})`:"#e0e0e0", transition:"background .2s", flexShrink:0 }}>
                      <div style={{ position:"absolute", top:3, left:vatEnabled?23:3, width:18, height:18, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.2)", transition:"left .2s" }}/>
                    </div>
                  </div>
                  {/* Totals */}
                  <div style={{ background:C.bg, borderRadius:10, padding:"12px 14px", marginBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:C.muted, marginBottom:5 }}>
                      <span>Subtotal</span><span style={{ fontWeight:700 }}>{fmtPHP(subtotal)}</span>
                    </div>
                    {discountPct > 0 && (
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:C.warn, marginBottom:5 }}>
                        <span>Discount ({discountPct}%)</span><span style={{ fontWeight:700 }}>−{fmtPHP(discountAmt)}</span>
                      </div>
                    )}
                    {vatEnabled && (
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#1565c0", marginBottom:5 }}>
                        <span>VAT (12%)</span><span style={{ fontWeight:700 }}>+{fmtPHP(vatAmt)}</span>
                      </div>
                    )}
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:15, color:C.ink, fontWeight:800, paddingTop:8, borderTop:`1px solid ${C.border}` }}>
                      <span>Total</span><span style={{ color:C.green }}>{fmtPHP(totalAmt)}</span>
                    </div>
                  </div>
                  {/* ── Payment Method ── */}
  <div style={{ marginBottom:10 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
      <label style={{ fontSize:11, fontWeight:800, color:C_muted, textTransform:"uppercase", letterSpacing:"0.07em" }}>
        Payment Method
      </label>
      {/* Split toggle */}
      <button
        onClick={() => {
          setIsSplitPayment(v => !v);
          setSplitGcashAmt("");
          setSplitCashAmt("");
          setSplitGcashPaid(false);
          setSplitGcashRef("");
          setGcashRefNumber("");
          setCashReceived("");
        }}
        style={{
          display:"flex", alignItems:"center", gap:5,
          padding:"3px 10px", borderRadius:20, border:"none",
          background: isSplitPayment
            ? "linear-gradient(135deg,#007acc,#0057a8)"
            : "#f0f0f0",
          color: isSplitPayment ? "#fff" : "#5a7a65",
          fontSize:11, fontWeight:700, cursor:"pointer",
          fontFamily:"inherit",
        }}
      >
        ✂ {isSplitPayment ? "Split ON" : "Split Payment"}
      </button>
    </div>

    {/* ── NORMAL (non-split) payment buttons ── */}
    {!isSplitPayment && (
      <div style={{ display:"flex", gap:6 }}>
        {["Cash","GCash","Others"].map(m => (
          <button
            key={m}
            onClick={() => {
              setPaymentMethod(m);
              if (m!=="GCash") setGcashRefNumber("");
            }}
            style={{
              flex:1, height:32, border:"none", borderRadius:8,
              fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
              background: paymentMethod===m
                ? `linear-gradient(135deg,${C_teal},${C_green})`
                : C_bg,
              color: paymentMethod===m ? C_white : C_muted,
              transition:"all .12s",
            }}
          >{m}</button>
        ))}
      </div>
    )}

    {/* GCash ref badge (non-split) */}
    {!isSplitPayment && paymentMethod==="GCash" && gcashRefNumber && (
      <div style={{
        marginTop:8, display:"flex", alignItems:"center", justifyContent:"space-between",
        background:"#e8f4ff", border:"1px solid #bfdbfe",
        borderRadius:8, padding:"6px 12px",
      }}>
        <div>
          <div style={{ fontSize:10, fontWeight:800, color:"#1e40af", textTransform:"uppercase", letterSpacing:"0.06em" }}>GCash Ref #</div>
          <div style={{ fontSize:13, fontWeight:700, color:"#1e40af", fontFamily:"monospace", letterSpacing:"0.05em" }}>{gcashRefNumber}</div>
        </div>
        <button onClick={() => setGcashRefNumber("")} style={{ background:"none", border:"none", cursor:"pointer", color:"#93c5fd", fontSize:16 }}>×</button>
      </div>
    )}

    {/* ── SPLIT payment panel ── */}
    {isSplitPayment && (
      <div style={{ background:"#f8fffe", border:"1.5px solid #b2dfdb", borderRadius:12, padding:"14px 14px 10px", marginTop:4 }}>

        {/* Remaining indicator */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <span style={{ fontSize:11, fontWeight:700, color:"#5a7a65" }}>
            Total to split:
          </span>
          <span style={{ fontSize:14, fontWeight:800, color:"#0d2b1e" }}>
            {fmtPHP(totalAmt)}
          </span>
        </div>

        {/* GCash leg */}
        <div style={{
          background: splitGcashPaid ? "#e8f5e9" : "#fff",
          border:`1.5px solid ${splitGcashPaid ? "#00897b" : "#bfdbfe"}`,
          borderRadius:10, padding:"10px 12px", marginBottom:8,
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:22, height:22, borderRadius:6, background:"linear-gradient(135deg,#007acc,#0057a8)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:12, color:"#fff" }}>G</div>
              <span style={{ fontSize:12, fontWeight:700, color:"#1e40af" }}>GCash amount</span>
            </div>
            {splitGcashPaid && (
              <span style={{ fontSize:11, fontWeight:700, color:"#059669", background:"#d1fae5", padding:"2px 8px", borderRadius:20 }}>
                ✓ Paid
              </span>
            )}
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ position:"relative", flex:1 }}>
              <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:13, fontWeight:700, color:"#5a7a65" }}>₱</span>
              <input
                type="number"
                placeholder="0.00"
                value={splitGcashAmt}
                disabled={splitGcashPaid}
                onChange={e => {
                  const val = e.target.value;
                  setSplitGcashAmt(val);
                  // Auto-fill cash remainder
                  const gcash = parseFloat(val) || 0;
                  const remaining = Math.max(0, totalAmt - gcash);
                  setSplitCashAmt(remaining > 0 ? remaining.toFixed(2) : "");
                }}
                style={{
                  ...invInputSt,
                  paddingLeft:24,
                  opacity: splitGcashPaid ? 0.6 : 1,
                  cursor: splitGcashPaid ? "not-allowed" : "text",
                }}
              />
            </div>
            {!splitGcashPaid ? (
              <button
                onClick={() => {
                  const gcash = parseFloat(splitGcashAmt);
                  if (!gcash || gcash <= 0) { alert("Enter a valid GCash amount."); return; }
                  if (gcash > totalAmt) { alert("GCash amount cannot exceed total."); return; }
                  if (gcash < 100) { alert("Minimum GCash amount via PayMongo is ₱100."); return; }
                  setGcashPaymentAmt(gcash);
                  setShowGCashModal(true);
                }}
                style={{
                  padding:"0 14px", height:36, borderRadius:9, border:"none",
                  background:"linear-gradient(135deg,#007acc,#0057a8)",
                  color:"#fff", fontSize:12, fontWeight:700,
                  cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap",
                  flexShrink:0,
                }}
              >
                Pay GCash
              </button>
            ) : (
              <button
                onClick={() => {
                  setSplitGcashPaid(false);
                  setSplitGcashRef("");
                  setGcashRefNumber("");
                  // recalc cash
                  setSplitCashAmt("");
                }}
                style={{ padding:"0 10px", height:36, borderRadius:9, border:"1px solid #fecaca", background:"#fee2e2", color:"#dc2626", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", flexShrink:0 }}
              >
                Redo
              </button>
            )}
          </div>
          {splitGcashPaid && splitGcashRef && (
            <div style={{ marginTop:5, fontSize:11, color:"#00695c", fontFamily:"monospace", fontWeight:600 }}>
              Ref: {splitGcashRef}
            </div>
          )}
        </div>

        {/* Cash leg */}
        <div style={{ background:"#fff", border:"1.5px solid #d1eedd", borderRadius:10, padding:"10px 12px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
            <div style={{ width:22, height:22, borderRadius:6, background:"linear-gradient(135deg,#2E7D32,#00897b)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:900, color:"#fff" }}>₱</div>
            <span style={{ fontSize:12, fontWeight:700, color:"#2E7D32" }}>Cash amount</span>
          </div>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:13, fontWeight:700, color:"#5a7a65" }}>₱</span>
            <input
              type="number"
              placeholder="0.00"
              value={splitCashAmt}
              onChange={e => setSplitCashAmt(e.target.value)}
              style={{ ...invInputSt, paddingLeft:24 }}
            />
          </div>
        </div>

        {/* Split summary */}
        {(parseFloat(splitGcashAmt)||0) + (parseFloat(splitCashAmt)||0) > 0 && (() => {
          const gcash     = parseFloat(splitGcashAmt) || 0;
          const cash      = parseFloat(splitCashAmt)  || 0;
          const covered   = gcash + cash;
          const shortfall = totalAmt - covered;
          const change    = covered - totalAmt;
          return (
            <div style={{ marginTop:10, padding:"8px 10px", background: Math.abs(shortfall) < 0.01 ? "#e8f5e9" : shortfall > 0 ? "#fff3e0" : "#e8f5e9", borderRadius:8, fontSize:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", color:"#5a7a65", marginBottom:2 }}>
                <span>GCash</span><span style={{ fontWeight:700 }}>{fmtPHP(gcash)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", color:"#5a7a65", marginBottom:4 }}>
                <span>Cash</span><span style={{ fontWeight:700 }}>{fmtPHP(cash)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", borderTop:"1px solid rgba(0,0,0,0.06)", paddingTop:4 }}>
                <span style={{ fontWeight:800, color: shortfall > 0.01 ? "#e65100" : "#2e7d32" }}>
                  {shortfall > 0.01 ? `⚠ Short by` : change > 0.01 ? "Change due" : "✓ Exact"}
                </span>
                <span style={{ fontWeight:800, color: shortfall > 0.01 ? "#e65100" : "#2e7d32" }}>
                  {shortfall > 0.01 ? fmtPHP(shortfall) : change > 0.01 ? fmtPHP(change) : ""}
                </span>
              </div>
            </div>
          );
        })()}
      </div>
    )}
  </div>

  {/* Cash received (normal non-split Cash mode) */}
  {!isSplitPayment && paymentMethod==="Cash" && (
    <div style={{ marginBottom:10 }}>
      <div style={{ fontSize:11, fontWeight:800, color:C_muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>Cash Received</div>
      <input
        type="number" value={cashReceived}
        onChange={e => setCashReceived(e.target.value)}
        placeholder="0.00"
        style={{ ...invInputSt, fontSize:16, fontWeight:800, textAlign:"right", color:C_ink }}
      />
      {cashReceived!=="" && (
        <div style={{ marginTop:6, fontSize:13, fontWeight:700, textAlign:"right", color:cashShortfall<0?C_warn:C_ok }}>
          {cashShortfall<0?`⚠ Short by ${fmtPHP(Math.abs(cashShortfall))}`:`Change: ${fmtPHP(changeDue)}`}
        </div>
      )}
    </div>
  )}

  {/* Note */}
  <div style={{ marginBottom:12 }}>
    <textarea
      value={noteInput}
      onChange={e => setNoteInput(e.target.value)}
      placeholder="Order note (optional)…"
      rows={2}
      style={{ ...invInputSt, height:"auto", padding:"8px 11px", resize:"none", lineHeight:1.5 }}
    />
  </div>

  {/* ── Charge button ── */}
  <button
    onClick={processSale}
    disabled={processing || cart.length===0}
    style={{
      width:"100%", height:46, border:"none", borderRadius:12,
      fontSize:15, fontWeight:900,
      cursor: cart.length===0||processing ? "not-allowed" : "pointer",
      fontFamily:"inherit",
      background: cart.length===0 ? "#e0e0e0"
        : isSplitPayment
          ? (() => {
              const gcash = parseFloat(splitGcashAmt)||0;
              const cash  = parseFloat(splitCashAmt)||0;
              const ok    = Math.abs((gcash+cash) - totalAmt) < 0.01 && (!gcash || splitGcashPaid);
              return ok ? `linear-gradient(135deg,${C_teal},${C_green})` : "#e0e0e0";
            })()
          : paymentMethod==="GCash" && !gcashRefNumber
            ? "linear-gradient(135deg,#007acc,#0057a8)"
            : `linear-gradient(135deg,${C_teal},${C_green})`,
      color: cart.length===0 ? "#9e9e9e" : C_white,
      boxShadow: cart.length===0 ? "none" : "0 4px 16px rgba(0,180,90,0.35)",
      transition:"all .15s", opacity:processing?0.7:1,
    }}
  >
    {processing ? "Processing…"
      : isSplitPayment
        ? (() => {
            const gcash = parseFloat(splitGcashAmt)||0;
            const cash  = parseFloat(splitCashAmt)||0;
            const covered = Math.abs((gcash+cash) - totalAmt) < 0.01;
            const gcashDone = !gcash || splitGcashPaid;
            if (!covered) return `Enter amounts totalling ${fmtPHP(totalAmt)}`;
            if (!gcashDone) return "Complete GCash payment first";
            return `💳 Charge ${fmtPHP(totalAmt)} (Split)`;
          })()
        : paymentMethod==="GCash" && !gcashRefNumber
          ? `💳 Scan GCash QR — ${fmtPHP(totalAmt)}`
          : `💳 Charge ${fmtPHP(totalAmt)}`}
  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TRANSACTION HISTORY TAB ── */}
        {activeTab === "history" && (
          <>
            <div style={{ background:C.white, border:`1px solid rgba(0,168,76,0.13)`, borderRadius:16, padding:"14px 18px", marginBottom:18, boxShadow:"0 1px 8px rgba(0,140,60,0.05)" }}>
              <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                <div style={{ position:"relative", flex:"1 1 200px" }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <input type="text" placeholder="Search ID, cashier, branch…" value={txSearch} onChange={e=>setTxSearch(e.target.value)} style={{ ...invInputSt, paddingLeft:30 }}/>
                </div>
                <input type="date" value={txDateFrom} onChange={e=>setTxDateFrom(e.target.value)} style={{ ...invInputSt, width:150 }}/>
                <input type="date" value={txDateTo}   onChange={e=>setTxDateTo(e.target.value)}   style={{ ...invInputSt, width:150 }}/>
                {(txSearch||txDateFrom||txDateTo) && (
                  <button onClick={()=>{setTxSearch("");setTxDateFrom("");setTxDateTo("");}} style={{ ...smallBtnSt, height:36, border:`1px solid ${C.border}`, color:C.muted }}>Clear</button>
                )}
              </div>
            </div>

            {selectedTxId && (
              <div style={{ background:"#fff8e1", border:"1px solid #ffe082", borderRadius:10, padding:"9px 16px", marginBottom:12, display:"flex", alignItems:"center", gap:8, fontSize:13 }}>
                <span style={{ fontSize:"1rem" }}>☑️</span>
                <span style={{ color:"#5d4037", fontWeight:700 }}>Transaction <strong>#{selectedTxId}</strong> selected.</span>
                <span style={{ color:C.muted }}>Click the red <strong>Void Transaction</strong> button to void it, or click the row again to deselect.</span>
              </div>
            )}

            <div style={{ background:C.white, border:`1px solid rgba(0,168,76,0.12)`, borderRadius:18, overflow:"hidden", boxShadow:"0 2px 18px rgba(0,140,60,0.07)" }}>
              <div style={{ padding:"11px 18px", background:`linear-gradient(135deg,${C.teal},${C.green})`, display:"flex", justifyContent:"space-between", alignItems:"center", color:C.white }}>
                <span style={{ fontWeight:800, fontSize:13 }}> Transaction History</span>
                <span style={{ fontSize:12, opacity:0.9 }}>{filteredTx.length} records · click a row to select</span>
              </div>

              {loadingTx ? (
                <div style={{ padding:"52px 0", textAlign:"center", color:C.muted, fontSize:14, fontWeight:700 }}>Loading transactions…</div>
              ) : filteredTx.length === 0 ? (
                <div style={{ padding:"52px 0", textAlign:"center", color:C.muted, fontSize:13, fontStyle:"italic" }}>No transactions found.</div>
              ) : (
                <>
                  <TxTable items={txPageItems} selectedId={selectedTxId} onSelect={setSelectedTxId} isVoided={false}/>
                  <POSPagination page={txPage} setPage={setTxPage} total={filteredTx.length} pageSize={TX_PAGE_SIZE}/>
                </>
              )}
            </div>
          </>
        )}

        {/* ── RECENTLY VOIDED TAB ── */}
        {activeTab === "voided" && (
          <>
            <div style={{ background:C.white, border:`1px solid rgba(0,168,76,0.13)`, borderRadius:16, padding:"14px 18px", marginBottom:18, boxShadow:"0 1px 8px rgba(0,140,60,0.05)" }}>
              <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                <div style={{ position:"relative", flex:"1 1 200px" }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <input type="text" placeholder="Search ID, cashier, branch…" value={txSearch} onChange={e=>setTxSearch(e.target.value)} style={{ ...invInputSt, paddingLeft:30 }}/>
                </div>
                <input type="date" value={txDateFrom} onChange={e=>setTxDateFrom(e.target.value)} style={{ ...invInputSt, width:150 }}/>
                <input type="date" value={txDateTo}   onChange={e=>setTxDateTo(e.target.value)}   style={{ ...invInputSt, width:150 }}/>
                {(txSearch||txDateFrom||txDateTo) && (
                  <button onClick={()=>{setTxSearch("");setTxDateFrom("");setTxDateTo("");}} style={{ ...smallBtnSt, height:36, border:`1px solid ${C.border}`, color:C.muted }}>Clear</button>
                )}
              </div>
            </div>

            {selectedVoidId && (
              <div style={{ background:"#e8f5e9", border:`1px solid ${C.greenMid}`, borderRadius:10, padding:"9px 16px", marginBottom:12, display:"flex", alignItems:"center", gap:8, fontSize:13 }}>
                <span style={{ fontSize:"1rem" }}></span>
                <span style={{ color:"#1b5e20", fontWeight:700 }}>Voided transaction <strong>#{selectedVoidId}</strong> selected.</span>
                <span style={{ color:C.muted }}>Click <strong>Retrieve Transaction</strong> to restore it to transaction history.</span>
              </div>
            )}

            <div style={{ background:C.white, border:"1px solid rgba(229,57,53,0.15)", borderRadius:18, overflow:"hidden", boxShadow:"0 2px 18px rgba(229,57,53,0.07)" }}>
              <div style={{ padding:"11px 18px", background:"linear-gradient(135deg,#e53935,#b71c1c)", display:"flex", justifyContent:"space-between", alignItems:"center", color:C.white }}>
                <span style={{ fontWeight:800, fontSize:13 }}>Recently Voided</span>
                <span style={{ fontSize:12, opacity:0.9 }}>{filteredVoidedTx.length} voided records · click a row to select for retrieval</span>
              </div>

              {filteredVoidedTx.length === 0 ? (
                <div style={{ padding:"52px 0", textAlign:"center", color:C.muted, fontSize:13, fontStyle:"italic" }}>No voided transactions found.</div>
              ) : (
                <>
                  <TxTable items={voidPageItems} selectedId={selectedVoidId} onSelect={setSelectedVoidId} isVoided={true}/>
                  <POSPagination page={voidPage} setPage={setVoidPage} total={filteredVoidedTx.length} pageSize={TX_PAGE_SIZE}/>
                </>
              )}
            </div>
          </>
        )}

        {/* ── RECEIPT MODAL ── */}
        {showReceiptModal && lastReceipt && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000 }}
            onClick={e=>{ if(e.target===e.currentTarget) setShowReceiptModal(false); }}>
            <div style={{ background:C.white, borderRadius:20, padding:"28px 32px", width:380, maxWidth:"95vw", maxHeight:"92vh", overflowY:"auto", boxShadow:"0 16px 64px rgba(0,0,0,0.25)" }}>
              <div className="pos-receipt-print">
                <div style={{ textAlign:"center", marginBottom:20 }}>
                  <div style={{ fontWeight:900, fontSize:18, color:C.ink }}>iFranchise POS</div>
                  <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{lastReceipt.branch} · {lastReceipt.shop}</div>
                  <div style={{ fontSize:11, color:C.muted }}>{lastReceipt.date}</div>
                  <div style={{ fontSize:11, color:C.muted }}>Cashier: {lastReceipt.cashier}</div>
                </div>
                <div style={{ borderTop:`2px dashed ${C.border}`, borderBottom:`2px dashed ${C.border}`, padding:"12px 0", marginBottom:12 }}>
                  {(lastReceipt.items||[]).map((item,i)=>(
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:5 }}>
                      <span style={{ color:C.ink, fontWeight:600 }}>{item.name} <span style={{ color:C.muted, fontWeight:400 }}>×{item.qty}</span></span>
                      <span style={{ fontWeight:700, color:C.ink }}>{fmtPHP(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize:13, marginBottom:4, display:"flex", justifyContent:"space-between" }}>
                  <span style={{ color:C.muted }}>Subtotal</span><span style={{ fontWeight:700 }}>{fmtPHP(lastReceipt.subtotal)}</span>
                </div>
                {lastReceipt.discount_pct>0 && (
                  <div style={{ fontSize:13, marginBottom:4, display:"flex", justifyContent:"space-between" }}>
                    <span style={{ color:C.warn }}>Discount ({lastReceipt.discount_pct}%)</span>
                    <span style={{ fontWeight:700, color:C.warn }}>−{fmtPHP(lastReceipt.discount_amt)}</span>
                  </div>
                )}
                {lastReceipt.vat_enabled && (
                  <div style={{ fontSize:13, marginBottom:4, display:"flex", justifyContent:"space-between" }}>
                    <span style={{ color:"#1565c0" }}>VAT (12%)</span>
                    <span style={{ fontWeight:700, color:"#1565c0" }}>+{fmtPHP(lastReceipt.vat_amt)}</span>
                  </div>
                )}
                <div style={{ fontSize:16, fontWeight:900, display:"flex", justifyContent:"space-between", borderTop:`1px solid ${C.border}`, paddingTop:8, marginBottom:8 }}>
                  <span style={{ color:C.ink }}>TOTAL</span><span style={{ color:C.green }}>{fmtPHP(lastReceipt.total)}</span>
                </div>
                <div style={{ fontSize:13, display:"flex", justifyContent:"space-between", color:C.muted, marginBottom:2 }}>
                  <span>Payment</span><span style={{ fontWeight:700, color:C.ink }}>{lastReceipt.payment_method}</span>
                </div>
                {lastReceipt.payment_method === "GCash" && lastReceipt.gcash_ref && (
                  <div style={{ fontSize:12, display:"flex", justifyContent:"space-between", color:C.muted, marginBottom:2 }}>
                    <span>GCash Ref #</span>
                    <span style={{ fontWeight:700, fontFamily:"monospace", color:C.ink, letterSpacing:"0.05em" }}>
                      {lastReceipt.gcash_ref}
                    </span>
                  </div>
                )}
                {lastReceipt.payment_method==="Cash" && (
                  <>
                    <div style={{ fontSize:13, display:"flex", justifyContent:"space-between", color:C.muted, marginBottom:2 }}>
                      <span>Cash Received</span><span style={{ fontWeight:700 }}>{fmtPHP(lastReceipt.cash_received)}</span>
                    </div>
                    <div style={{ fontSize:13, display:"flex", justifyContent:"space-between", color:C.muted }}>
                      <span>Change</span><span style={{ fontWeight:800, color:C.green }}>{fmtPHP(lastReceipt.change_due)}</span>
                    </div>
                  </>
                )}
                {lastReceipt.is_split && (
    <div style={{ fontSize:12, background:"#f0fdf5", borderRadius:8, padding:"8px 10px", marginTop:6, marginBottom:4 }}>
      <div style={{ display:"flex", justifyContent:"space-between", color:"#5a7a65", marginBottom:3 }}>
        <span>GCash</span>
        <span style={{ fontWeight:700 }}>{fmtPHP(lastReceipt.split_gcash_amt)}</span>
      </div>
      {lastReceipt.gcash_ref && (
        <div style={{ fontSize:11, color:"#00695c", fontFamily:"monospace", marginBottom:3 }}>
          Ref: {lastReceipt.gcash_ref}
        </div>
      )}
      <div style={{ display:"flex", justifyContent:"space-between", color:"#5a7a65" }}>
        <span>Cash</span>
        <span style={{ fontWeight:700 }}>{fmtPHP(lastReceipt.split_cash_amt)}</span>
      </div>
    </div>
  )}
                {lastReceipt.note && <div style={{ marginTop:10, fontSize:12, color:C.muted, fontStyle:"italic" }}>Note: {lastReceipt.note}</div>}
                <div style={{ textAlign:"center", marginTop:16, fontSize:11, color:C.muted }}>Thank you for your purchase! 🎉</div>
              </div>
              <div style={{ display:"flex", gap:8, marginTop:20 }}>
                <button onClick={printReceipt} style={{ ...btnSt, flex:1, justifyContent:"center" }}>🖨️ Print</button>
                <button onClick={()=>setShowReceiptModal(false)} style={{ ...btnPrimarySt, flex:1, justifyContent:"center" }}>Done</button>
              </div>
            </div>
          </div>
        )}

        {/* ── VOID CONFIRMATION MODAL ── */}
        {showVoidModal && (
          <ManagerModal
            title="Void Transaction"
            subtitle={`You are about to void transaction #${selectedTxId}. This action requires manager authorization.`}
            icon="🗑️"
            actionLabel="Confirm Void"
            actionColor="#e53935"
            password={voidPassword}
            setPassword={setVoidPassword}
            error={voidPasswordErr}
            onConfirm={confirmVoid}
            onClose={()=>{ setShowVoidModal(false); setVoidPassword(""); setVoidPasswordErr(""); }}
            processing={voidProcessing}
          />
        )}

        {/* ── RETRIEVE CONFIRMATION MODAL ── */}
        {showRetrieveModal && (
          <ManagerModal
            title="Retrieve Transaction"
            subtitle={`You are about to restore voided transaction #${selectedVoidId} back to Transaction History. Manager authorization required.`}
            icon="♻️"
            actionLabel="Confirm Retrieve"
            actionColor={C.green}
            password={retrievePassword}
            setPassword={setRetrievePassword}
            error={retrievePasswordErr}
            onConfirm={confirmRetrieve}
            onClose={()=>{ setShowRetrieveModal(false); setRetrievePassword(""); setRetrievePasswordErr(""); }}
            processing={retrieveProcessing}
          />
        )}

      {showGCashModal && (
    <GCashQRModal
      totalAmt={isSplitPayment ? (parseFloat(splitGcashAmt)||0) : totalAmt}
      fmtPHP={fmtPHP}
      onConfirm={refNum => {
        setShowGCashModal(false);
        if (isSplitPayment) {
          // Split mode — mark GCash leg as done
          setSplitGcashPaid(true);
          setSplitGcashRef(refNum);
          setGcashRefNumber(refNum);
        } else {
          // Normal GCash — proceed to charge
          setGcashRefNumber(refNum);
          setTimeout(() => processSale(), 100);
        }
      }}
      onCancel={() => {
        setShowGCashModal(false);
        setGcashPaymentAmt(0);
      }}
    />
  )}
      </div>
    );
  }

  // ─── Add this entire block above function POSContent ─────────────────────────
  function BrandBranchFilter({ brands, activeBrand, activeBranch, onChangeBrand, onChangeBranch }) {
    const [brandQ, setBrandQ]   = React.useState("");
    const [branchQ, setBranchQ] = React.useState("");
    const [openB, setOpenB]     = React.useState(false);
    const [openBr, setOpenBr]   = React.useState(false);
    const brandRef  = React.useRef(null);
    const branchRef = React.useRef(null);

    React.useEffect(() => {
      const fn = e => {
        if (brandRef.current  && !brandRef.current.contains(e.target))  setOpenB(false);
        if (branchRef.current && !branchRef.current.contains(e.target)) setOpenBr(false);
      };
      document.addEventListener("mousedown", fn);
      return () => document.removeEventListener("mousedown", fn);
    }, []);

    const selectedBrand    = brands.find(b => b.id === activeBrand);
    const branchList       = selectedBrand ? (selectedBrand.branches||[]).map(br=>typeof br==="string"?br:br.name) : [];
    const filteredBrands   = brands.filter(b => !brandQ || b.name.toLowerCase().includes(brandQ.toLowerCase()));
    const filteredBranches = branchList.filter(br => !branchQ || br.toLowerCase().includes(branchQ.toLowerCase()));
    const dropSt = { position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:300, background:C.white, border:`1px solid ${C.border}`, borderRadius:11, boxShadow:"0 8px 28px rgba(0,0,0,0.10)", maxHeight:230, overflowY:"auto" };
    const optSt  = active => ({ padding:"9px 14px", cursor:"pointer", fontSize:13, color:active?C.greenDk:C.ink, fontWeight:active?700:500, background:active?C.greenLt:"transparent", display:"flex", alignItems:"center", gap:8 });

    return (
      <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
        <div ref={brandRef} style={{ position:"relative", minWidth:170 }}>
          <div onClick={()=>{setOpenB(v=>!v);setBrandQ("");}} style={{ ...invInputSt, display:"flex", alignItems:"center", gap:7, cursor:"pointer", paddingRight:30, userSelect:"none", color:activeBrand?C.ink:C.muted }}>
            <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:13 }}>{selectedBrand?selectedBrand.name:"All Brands"}</span>
          </div>
          {openB && (
            <div style={dropSt}>
              <div style={{ padding:"7px 9px", borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, background:C.white }}>
                <input autoFocus type="text" value={brandQ} onChange={e=>setBrandQ(e.target.value)} placeholder="Search brand…" onClick={e=>e.stopPropagation()} style={{ ...invInputSt, height:30, fontSize:12 }}/>
              </div>
              <div style={optSt(!activeBrand)} onMouseDown={()=>{onChangeBrand(null);onChangeBranch(null);setBrandQ("");setOpenB(false);}}>All Brands</div>
              {filteredBrands.map(b=>(
                <div key={b.id} style={optSt(activeBrand===b.id)} onMouseDown={()=>{onChangeBrand(b.id);onChangeBranch(null);setBrandQ("");setOpenB(false);}}>
                  {b.name} <span style={{ marginLeft:"auto", fontSize:11, color:C.muted }}>{(b.branches||[]).length} branches</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div ref={branchRef} style={{ position:"relative", minWidth:190, opacity:activeBrand?1:0.45 }}>
          <div onClick={()=>{if(activeBrand){setOpenBr(v=>!v);setBranchQ("");}}} style={{ ...invInputSt, display:"flex", alignItems:"center", gap:7, cursor:activeBrand?"pointer":"not-allowed", paddingRight:30, userSelect:"none", color:activeBranch?C.ink:C.muted }}>
            <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:13 }}>{activeBranch||(activeBrand?"All Branches":"Select brand first")}</span>
          </div>
          {openBr && activeBrand && (
            <div style={dropSt}>
              <div style={{ padding:"7px 9px", borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, background:C.white }}>
                <input autoFocus type="text" value={branchQ} onChange={e=>setBranchQ(e.target.value)} placeholder="Search branch…" style={{ ...invInputSt, height:30, fontSize:12 }}/>
              </div>
              <div style={optSt(!activeBranch)} onMouseDown={()=>{onChangeBranch(null);setOpenBr(false);}}>All Branches</div>
              {filteredBranches.map(br=>(
                <div key={br} style={optSt(activeBranch===br)} onMouseDown={()=>{onChangeBranch(br);setOpenBr(false);}}>{br}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  function ActionDropdown({ application, onView, onAddAccount, onApprove, onDelete }) {
    const [open, setOpen]         = useState(false);
    const [menuPos, setMenuPos]   = useState({ top: 0, left: 0 });
    const btnRef                  = useRef(null);
    const menuRef                 = useRef(null);
  
    // Position the dropdown relative to the button without shifting page layout
    const openMenu = () => {
      if (btnRef.current) {
        const rect = btnRef.current.getBoundingClientRect();
        const menuH = 180; // approximate menu height
        const spaceBelow = window.innerHeight - rect.bottom;
        const top = spaceBelow >= menuH
          ? rect.bottom + window.scrollY + 4
          : rect.top  + window.scrollY - menuH - 4;
        // keep menu on-screen horizontally
        const left = Math.min(rect.left + window.scrollX, window.innerWidth - 180);
        setMenuPos({ top, left });
      }
      setOpen((v) => !v);
    };
  
    // Close on outside click
    useEffect(() => {
      if (!open) return;
      const handler = (e) => {
        if (
          menuRef.current  && !menuRef.current.contains(e.target) &&
          btnRef.current   && !btnRef.current.contains(e.target)
        ) setOpen(false);
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [open]);
  
    const menuItems = [
      { icon: <Eye size={13} />,         label: "View Application", color: "#0d2b1e", action: onView },
      { icon: <UserPlus size={13} />,    label: "Add Account",      color: "#2563eb", action: onAddAccount },
      { icon: <CheckCircle size={13} />, label: "Approve",          color: "#059669", action: onApprove },
      { icon: <Trash2 size={13} />,      label: "Delete",           color: "#dc2626", action: onDelete, danger: true },
    ];
  
    return (
      <>
        {/* Pencil trigger button */}
        <button
          ref={btnRef}
          onClick={openMenu}
          title="Actions"
          style={{
            width: 32, height: 32,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 8,
            border: open ? "1.5px solid #00897b" : "1px solid #b2dfdb",
            background: open ? "#e0f2f1" : "#fff",
            color: open ? "#00695c" : "#5a7a65",
            cursor: "pointer", flexShrink: 0,
            transition: "all .15s",
          }}
        >
          <Pencil size={13} />
        </button>
  
        {/* Portal-style fixed menu — does NOT push layout */}
        {open && (
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top:  menuPos.top,
              left: menuPos.left,
              zIndex: 3000,
              background: "#fff",
              border: "1px solid #d1eedd",
              borderRadius: 12,
              boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
              padding: "6px 0",
              minWidth: 180,
              maxHeight: 220,
              overflowY: "auto",
            }}
          >
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => { setOpen(false); item.action?.(); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 9,
                  padding: "9px 14px",
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: 700,
                  color: item.color,
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                  textAlign: "left",
                  borderTop: item.danger ? "1px solid #fee2e2" : "none",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = item.danger ? "#fff5f5" : "#f0fdf5"}
                onMouseLeave={(e) => e.currentTarget.style.background = "none"}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        )}
      </>
    );
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // SHARED MODAL SHELL  (stable — no layout shift)
  // ─────────────────────────────────────────────────────────────────────────────
  function ModalShell({ onClose, maxWidth = 700, children }) {
    // Lock body scroll while open
    useEffect(() => {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }, []);
  
    return (
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(13,43,30,0.52)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2000, padding: 20,
          backdropFilter: "blur(3px)",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: C.white,
            borderRadius: 20,
            padding: "28px 32px",
            width: "100%", maxWidth,
            maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            border: "1px solid rgba(0,168,76,0.15)",
            fontFamily: "'Plus Jakarta Sans',sans-serif",
          }}
        >
          {children}
        </div>
      </div>
    );
  }
  
  // ─── Shared modal header ──────────────────────────────────────────────────────
  function ModalHeader({ title, onClose }) {
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: C.dark, margin: 0 }}>{title}</h2>
        <button
          onClick={onClose}
          style={{
            width: 32, height: 32, borderRadius: "50%",
            border: "1px solid #b2dfdb", background: "#e0f2f1",
            cursor: "pointer", color: "#00695c",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <X size={15} />
        </button>
      </div>
    );
  }
  
  // ─── Shared footer buttons ────────────────────────────────────────────────────
  function ModalFooter({ onClose, onConfirm, confirmLabel, confirmIcon, confirmStyle, closeLabel = "Cancel" }) {
    return (
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
        <button
          onClick={onClose}
          style={{
            padding: "9px 22px", borderRadius: 10,
            border: "1.5px solid #b2dfdb", background: "#f0fdf5",
            color: "#5a7a65", fontSize: 13, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          {closeLabel}
        </button>
        {onConfirm && (
          <button
            onClick={onConfirm}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 24px", borderRadius: 10, border: "none",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              fontFamily: "inherit",
              ...(confirmStyle || {
                background: "linear-gradient(135deg,#2E7D32,#00897b)",
                color: "#fff",
                boxShadow: "0 2px 10px rgba(0,180,90,0.35)",
              }),
            }}
          >
            {confirmIcon}
            {confirmLabel}
          </button>
        )}
      </div>
    );
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // VIEW APPLICATION MODAL
  // ─────────────────────────────────────────────────────────────────────────────
  function ViewApplicationModal({ application, onClose }) {
    if (!application) return null;
    const isIPharma = application.franchise === "iPharma Mart";
  
    return (
      <ModalShell onClose={onClose} maxWidth={700}>
        <ModalHeader title="📋 Franchise Application Details" onClose={onClose} />
  
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 22 }}>
          Application ID: <strong>#{application.id}</strong> · Status:{" "}
          <span
            style={{
              background: application.status === "approved" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
              color:      application.status === "approved" ? "#059669" : "#d97706",
              padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
            }}
          >
            {application.status?.toUpperCase()}
          </span>
        </p>
  
        <div style={{ padding: "1rem 0" }}>
          <AppSection title="Basic Information">
            <AppGrid2>
              <AppField label="Date Applied"   value={application.date} />
              <AppField label="Payment Mode"   value={application.paymentMode} />
              <div style={{ gridColumn: "1/-1" }}>
                <AppField label="Chosen Concept" value={application.franchise} highlight />
              </div>
            </AppGrid2>
          </AppSection>
  
          <AppSection title="Applicant Information">
            <AppGrid2>
              <AppField label="Last Name" value={application.lastName} />
  <AppField label="First Name" value={application.firstName} />
  <AppField label="M.I." value={application.middleInitial || "N/A"} />
  <AppField label="Suffix" value={application.suffix || "N/A"} />
              <AppField label="Date of Birth"      value={application.dob} />
              <AppField label="Civil Status"       value={application.civilStatus} />
              {!isIPharma && (
                <>
                  <AppField label="Gender"      value={application.gender} />
                  <AppField label="Nationality" value={application.nationality} />
                </>
              )}
              <AppField label="No. of Dependents" value={application.dependents || "N/A"} />
              <AppField label="Mobile Number"     value={application.phone} />
              {isIPharma && application.telephone && (
                <AppField label="Telephone" value={application.telephone} />
              )}
              <div style={{ gridColumn: "1/-1" }}>
                <AppField label="Email Address"   value={application.email} />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <AppField label="Present Address" value={application.address} />
              </div>
            </AppGrid2>
          </AppSection>
  
          {isIPharma && application.education && (
            <AppSection title="Education">
              <AppField label="Educational Background" value={application.education} />
            </AppSection>
          )}
  
          {application.spouseName && (
            <AppSection title="Spouse Information">
              <AppGrid2>
                <AppField label="Spouse Name"          value={application.spouseName} />
                <AppField label="Spouse Occupation"    value={application.spouseOccupation} />
                {isIPharma && application.spouseDob && (
                  <AppField label="Spouse Date of Birth" value={application.spouseDob} />
                )}
              </AppGrid2>
            </AppSection>
          )}
  
          {!isIPharma && (
            <AppSection title="Employment Information">
              <AppGrid2>
                <AppField label="Employment Type"       value={application.employmentType} />
                <AppField label="Years with Employer"   value={`${application.yearsEmployer} years`} />
                <AppField label="Monthly Income"        value={`₱${parseInt(application.income).toLocaleString()}`} highlight />
                <AppField label="Position"              value={application.position} />
                <div style={{ gridColumn: "1/-1" }}>
                  <AppField label="Employer / Business Name" value={application.employerName} />
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <AppField label="Business Address" value={application.businessAddress} />
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <AppField label="Nature of Business" value={application.businessNature} />
                </div>
              </AppGrid2>
            </AppSection>
          )}
        </div>
  
        <ModalFooter
          onClose={onClose}
          closeLabel="Close"
          onConfirm={() => window.print()}
          confirmLabel="Print Application"
          confirmIcon={<span style={{ fontSize: 14 }}>🖨️</span>}
        />
      </ModalShell>
    );
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // ADD ACCOUNT MODAL  — validation modal before creating account
  // ─────────────────────────────────────────────────────────────────────────────
  export function AddAccountModal({ application, onClose, onConfirm }) {
    if (!application) return null;
    return (
      <ModalShell onClose={onClose} maxWidth={440}>
        <ModalHeader title="Create Franchisee Account" onClose={onClose} />
  
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
          You are about to create a system account for:
        </p>
  
        {/* Applicant card */}
        <div
          style={{
            background: "#f0fdf5", border: "1px solid #b2dfdb",
            borderRadius: 12, padding: "14px 16px", marginBottom: 20,
          }}
        >
          <p style={{ fontWeight: 800, fontSize: 14, color: C.dark, marginBottom: 4 }}>{application.name}</p>
          <p style={{ fontSize: 12, color: C.muted }}>{application.email}</p>
          <p style={{ fontSize: 12, color: C.muted }}>{application.franchise}</p>
        </div>
  
        <div
          style={{
            background: "#eff6ff", border: "1px solid #bfdbfe",
            borderRadius: 10, padding: "10px 14px", fontSize: 12,
            color: "#1d4ed8", marginBottom: 6,
          }}
        >
          ℹ️ A temporary password will be sent to the applicant's email address.
        </div>
  
        <ModalFooter
          onClose={onClose}
          onConfirm={onConfirm}
          confirmLabel="Create Account"
          confirmIcon={<UserPlus size={14} />}
        />
      </ModalShell>
    );
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // APPROVE MODAL  — validation modal before approving
  // ─────────────────────────────────────────────────────────────────────────────
  export function ApproveModal({ application, onClose, onConfirm }) {
    if (!application) return null;
    return (
      <ModalShell onClose={onClose} maxWidth={440}>
        <ModalHeader title="Approve Application" onClose={onClose} />
  
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
          Review the applicant details before approving:
        </p>
  
        <div
          style={{
            background: "#f0fdf5", border: "1px solid #b2dfdb",
            borderRadius: 12, padding: "14px 16px", marginBottom: 16,
          }}
        >
          <p style={{ fontWeight: 800, fontSize: 14, color: C.dark, marginBottom: 6 }}>{application.name}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
            {[
              ["ID",        `#${application.id}`],
              ["Franchise", application.franchise],
              ["Date",      application.date],
              ["Payment",   application.paymentMode],
            ].map(([lbl, val]) => (
              <div key={lbl}>
                <span style={{ fontSize: 10, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{lbl}</span>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.dark, marginTop: 2 }}>{val}</p>
              </div>
            ))}
          </div>
        </div>
  
        <div
          style={{
            background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)",
            borderRadius: 10, padding: "10px 14px", fontSize: 12,
            color: "#065f46", marginBottom: 6,
          }}
        >
          ✅ Approving will mark this application as <strong>Approved</strong> and notify the applicant.
        </div>
  
        <ModalFooter
          onClose={onClose}
          onConfirm={onConfirm}
          confirmLabel="Approve Application"
          confirmIcon={<CheckCircle size={14} />}
          confirmStyle={{
            background: "linear-gradient(135deg,#059669,#10b981)",
            color: "#fff",
            boxShadow: "0 2px 10px rgba(5,150,105,0.35)",
          }}
        />
      </ModalShell>
    );
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE VALIDATION MODAL
  // ─────────────────────────────────────────────────────────────────────────────
  export function DeleteApplicationModal({ application, onClose, onConfirm }) {
    if (!application) return null;
    return (
      <ModalShell onClose={onClose} maxWidth={420}>
        {/* Icon */}
        <div
          style={{
            width: 52, height: 52, borderRadius: "50%", background: "#fee2e2",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <Trash2 size={22} color="#dc2626" />
        </div>
  
        <h2 style={{ textAlign: "center", fontSize: 17, fontWeight: 800, color: C.dark, marginBottom: 8 }}>
          Delete Application?
        </h2>
        <p style={{ textAlign: "center", fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>
          You are about to delete the application from{" "}
          <strong style={{ color: C.dark }}>"{application.name}"</strong> (#{application.id}).
        </p>
  
        <div
          style={{
            background: "#fff7ed", border: "1px solid #fed7aa",
            borderRadius: 10, padding: "10px 14px",
            fontSize: 12, color: "#c2410c", textAlign: "center", marginBottom: 16,
          }}
        >
          ⚠ This action cannot be undone from the main list, but you can recover it from the <strong>Deleted</strong> tab.
        </div>
  
        <ModalFooter
          onClose={onClose}
          onConfirm={onConfirm}
          confirmLabel="Delete Application"
          confirmIcon={<Trash2 size={14} />}
          confirmStyle={{
            background: "linear-gradient(135deg,#dc2626,#ef4444)",
            color: "#fff",
            boxShadow: "0 2px 10px rgba(220,38,38,0.35)",
          }}
        />
      </ModalShell>
    );
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // RESTORE VALIDATION MODAL
  // ─────────────────────────────────────────────────────────────────────────────
  export function RestoreApplicationModal({ application, onClose, onConfirm }) {
    if (!application) return null;
    return (
      <ModalShell onClose={onClose} maxWidth={420}>
        <div
          style={{
            width: 52, height: 52, borderRadius: "50%", background: "#d1fae5",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <RotateCcw size={22} color="#059669" />
        </div>
  
        <h2 style={{ textAlign: "center", fontSize: 17, fontWeight: 800, color: C.dark, marginBottom: 8 }}>
          Restore Application?
        </h2>
        <p style={{ textAlign: "center", fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>
          Restore the application from{" "}
          <strong style={{ color: C.dark }}>"{application.name}"</strong> (#{application.id}) back to the active list?
        </p>
  
        <div
          style={{
            background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)",
            borderRadius: 10, padding: "10px 14px",
            fontSize: 12, color: "#065f46", textAlign: "center", marginBottom: 6,
          }}
        >
          ✅ The application will be moved back to the <strong>active</strong> applications list.
        </div>
  
        <ModalFooter
          onClose={onClose}
          onConfirm={onConfirm}
          confirmLabel="Restore Application"
          confirmIcon={<RotateCcw size={14} />}
          confirmStyle={{
            background: "linear-gradient(135deg,#2E7D32,#00897b)",
            color: "#fff",
            boxShadow: "0 2px 10px rgba(0,180,90,0.35)",
          }}
        />
      </ModalShell>
    );
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // DELETED APPLICATIONS TAB / PANEL
  // ─────────────────────────────────────────────────────────────────────────────
  export function DeletedApplicationsTab({ deletedItems, onRestore }) {
    const [restoreTarget, setRestoreTarget] = useState(null);
    const [viewTarget,    setViewTarget]    = useState(null);
  
    const fmt = (d) =>
      new Date(d).toLocaleString("en-PH", {
        month: "short", day: "numeric", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
  
    const handleConfirmRestore = () => {
      onRestore?.(restoreTarget);
      setRestoreTarget(null);
    };
  
    const thSt = {
      padding: "9px 12px", textAlign: "left", fontWeight: 800, fontSize: 10.5,
      color: "#00897b", letterSpacing: "0.07em", textTransform: "uppercase",
      borderBottom: "2px solid #d1eedd", background: "#f8fffe",
      whiteSpace: "nowrap",
    };
    const tdSt = {
      padding: "11px 12px", borderBottom: "1px solid #f0f8f0",
      verticalAlign: "middle", fontSize: 13,
    };
  
    return (
      <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: C.dark, margin: 0 }}>Deleted Applications</h2>
            <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
              {deletedItems.length} deleted {deletedItems.length === 1 ? "record" : "records"} · Restore to move back to active list
            </p>
          </div>
          {deletedItems.length > 0 && (
            <span
              style={{
                fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 20,
                background: "#fee2e2", color: "#dc2626",
              }}
            >
              {deletedItems.length} deleted
            </span>
          )}
        </div>
  
        {deletedItems.length === 0 ? (
          <div
            style={{
              padding: "48px 0", textAlign: "center",
              color: C.muted, fontSize: 14, fontStyle: "italic",
              background: "#f8fffe", borderRadius: 16,
              border: "1px dashed #b2dfdb",
            }}
          >
            No deleted applications.
          </div>
        ) : (
          <div
            style={{
              background: "#fff", border: "1px solid rgba(0,168,76,0.12)",
              borderRadius: 18, boxShadow: "0 2px 14px rgba(0,140,60,0.07)",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "6%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "12%" }} />
              </colgroup>
              <thead>
                <tr>
                  {["ID", "Name", "Franchise", "Status", "Deleted At", "Reason", "Actions"].map((h) => (
                    <th key={h} style={thSt}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deletedItems.map((item) => (
                  <tr
                    key={item.id}
                    style={{ cursor: "default" }}
                    onMouseEnter={(e) => { [...e.currentTarget.cells].forEach((c) => (c.style.background = "#fef2f2")); }}
                    onMouseLeave={(e) => { [...e.currentTarget.cells].forEach((c) => (c.style.background = "")); }}
                  >
                    <td style={{ ...tdSt, color: C.muted, fontSize: 12 }}>#{item.id}</td>
                    <td style={{ ...tdSt, fontWeight: 700, color: C.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</td>
                    <td style={{ ...tdSt, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.franchise}</td>
                    <td style={tdSt}>
                      <span
                        style={{
                          fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 20,
                          background: item.status === "approved" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                          color:      item.status === "approved" ? "#059669" : "#d97706",
                        }}
                      >
                        {item.status?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ ...tdSt, color: C.muted, fontSize: 11 }}>{fmt(item.deletedAt)}</td>
                    <td style={{ ...tdSt, color: "#9ca3af", fontSize: 12, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.deleteReason || "—"}
                    </td>
                    <td style={tdSt}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {/* View */}
                        <button
                          title="View application"
                          onClick={() => setViewTarget(item)}
                          style={{
                            width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                            borderRadius: 8, border: "1px solid #b2dfdb", background: "#e0f2f1",
                            color: "#00695c", cursor: "pointer", flexShrink: 0,
                          }}
                        >
                          <Eye size={13} />
                        </button>
                        {/* Restore */}
                        <button
                          title="Restore application"
                          onClick={() => setRestoreTarget(item)}
                          style={{
                            width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                            borderRadius: 8, border: "1.5px solid #00897b", background: "#f0fdf5",
                            color: "#00695c", cursor: "pointer", flexShrink: 0,
                          }}
                        >
                          <RotateCcw size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
  
        {/* Restore confirmation modal */}
        {restoreTarget && (
          <RestoreApplicationModal
            application={restoreTarget}
            onClose={() => setRestoreTarget(null)}
            onConfirm={handleConfirmRestore}
          />
        )}
  
        {/* View modal from deleted tab */}
        {viewTarget && (
          <ViewApplicationModal
            application={viewTarget}
            onClose={() => setViewTarget(null)}
          />
        )}
      </div>
    );
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // FIELD / SECTION / GRID helpers (unchanged API, kept here for self-containment)
  // ─────────────────────────────────────────────────────────────────────────────
  export function AppSection({ title, children }) {
    return (
      <div style={{ marginBottom: "2rem" }}>
        <h3
          style={{
            fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 13,
            color: "#00897b", textTransform: "uppercase", letterSpacing: "0.08em",
            marginBottom: 12, paddingBottom: 8, borderBottom: `2px solid ${C.border}`,
          }}
        >
          {title}
        </h3>
        {children}
      </div>
    );
  }
  
  export function AppGrid2({ children }) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {children}
      </div>
    );
  }
  
  export function AppField({ label, value, highlight, large }) {
    return (
      <div>
        <p
          style={{
            fontSize: 11, fontWeight: 800, color: "#5a7a65",
            textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4,
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontWeight: highlight || large ? 800 : 600,
            fontSize: large ? 15 : 13,
            color: highlight ? "#00897b" : C.dark,
          }}
        >
          {value}
        </p>
      </div>
    );
  }
  // ─── Exports ──────────────────────────────────────────────────────────────────
  export { ActionDropdown,  POSContent };

