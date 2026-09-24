import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from "react";
import { ShoppingCart, ShoppingBag, X, Plus, Trash2, RefreshCw, Package, CheckCircle2, AlertTriangle } from "lucide-react";

const money = value => `₱${Number(value || 0).toLocaleString("en-PH", {minimumFractionDigits:2,maximumFractionDigits:2})}`;
const paymentLabel = method => method === "gcash" ? "GCash" : "Cash on Delivery";
const paymentState = method => method === "gcash" ? "Awaiting verification" : "Due on delivery";
const statusName = {pending:"Pending",accepted:"Accepted",shipping:"Shipping",received:"Received",rejected:"Rejected"};
const requestId = () => typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `web-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
const readSaved = (storage, key, fallback) => { try { return JSON.parse(storage.getItem(key) || "null") || fallback; } catch { return fallback; } };
const unitKey = value => { const raw=String(value||"").toLowerCase().trim().replace(/\./g,"");return ({liters:"l",liter:"l",litres:"l",litre:"l",milliliters:"ml",milliliter:"ml",kilograms:"kg",kilogram:"kg",grams:"g",gram:"g",pieces:"pcs",piece:"pcs",pc:"pcs"})[raw]||raw; };
const fullUnit = value => ({l:"Liters",ml:"Milliliters",kg:"Kilograms",g:"Grams",pcs:"Pieces",bottle:"Bottles",pack:"Packs",box:"Boxes"})[unitKey(value)]||value;
const quantityText = (value,unit) => `${Number(value||0).toLocaleString("en-PH",{maximumFractionDigits:6})} ${fullUnit(unit)}`;
const convertUnits = (value,from,to) => {const a=unitKey(from),b=unitKey(to);if(a===b)return Number(value);const u={l:["v",1000],ml:["v",1],kg:["m",1000],g:["m",1]};return u[a]&&u[b]&&u[a][0]===u[b][0]?Number(value)*u[a][1]/u[b][1]:null;};
const suggested = (item,supply) => {if(!item||item.target_stock==null)return null;const gap=Math.max(0,Number(item.target_stock)-Number(item.current_stock??item.stock));const needed=convertUnits(gap,item.unit,supply.unit);return needed==null?null:Math.min(1000000,Math.max(0,Math.floor(supply.stock)),Math.ceil(Math.round(needed*1e6)/1e6));};
const css = `
.wso-toolbar{
  display:flex;
  align-items:center;
  justify-content:flex-end;
  flex-wrap:wrap;
  gap:8px;
  margin:0;
  padding:0;
  font-family:'Plus Jakarta Sans',sans-serif;
}
.wso-toolbar.wso-toolbar-embedded{
  width:auto;
  margin:0;
  padding:0;
  gap:7px;
}
.wso-toolbar.wso-toolbar-embedded button{
  height:36px;
  min-height:36px;
  white-space:nowrap;
}
.wso-toolbar button{
  min-height:36px;
}
.wso-overlay{
  position:fixed;
  inset:0;
  z-index:4200;
  background:rgba(18,36,27,.46);
  backdrop-filter:blur(6px);
  display:flex;
  align-items:center;
  justify-content:center;
  padding:18px;
}
.wso-dialog{
  font-family:'Plus Jakarta Sans',sans-serif!important;
  background:#fff;
  color:#12241B;
  width:min(780px,100%);
  max-height:calc(100dvh - 36px);
  border:1px solid #E1E6D8;
  border-radius:20px;
  box-shadow:0 28px 80px rgba(18,36,27,.20);
  display:flex;
  flex-direction:column;
  animation:wso-in .2s ease-out;
  overflow:hidden;
}
.wso-dialog *{box-sizing:border-box}
.wso-head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:14px;
  padding:18px 20px 14px;
  background:#fbfcf8;
  border-bottom:1px solid #E1E6D8;
}
.wso-head-copy{
  min-width:0;
  display:flex;
  align-items:flex-start;
  gap:11px;
}
.wso-head-icon{
  width:36px;
  height:36px;
  border-radius:10px;
  border:1px solid #c9dba0;
  background:#f0f5e8;
  color:#3b791e;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  flex:0 0 auto;
}
.wso-head h2{
  margin:0;
  font-size:17px;
  line-height:1.25;
  letter-spacing:-.01em;
}
.wso-sub{
  font-size:11.5px;
  color:#5C6B60;
  line-height:1.5;
  margin:4px 0 0;
}
.wso-context{
  display:inline-flex;
  align-items:center;
  gap:6px;
  margin-top:6px;
  padding:4px 9px;
  border:1px solid #E1E6D8;
  border-radius:999px;
  background:#fff;
  color:#5C6B60;
  font-size:10px;
  font-weight:700;
}
.wso-close{
  width:34px!important;
  min-height:34px!important;
  height:34px;
  padding:0!important;
  border-radius:10px!important;
  color:#5C6B60!important;
  flex:0 0 auto;
}
.wso-close:hover{background:#F6F7F1!important;color:#12241B!important}
.wso-progress{
  display:flex;
  align-items:center;
  gap:6px;
  padding:0 20px 14px;
  background:#fbfcf8;
}
.wso-progress-step{
  display:inline-flex;
  align-items:center;
  gap:6px;
  padding:5px 8px;
  border-radius:999px;
  background:#F6F7F1;
  color:#5C6B60;
  border:1px solid transparent;
  font-size:9.5px;
  font-weight:800;
}
.wso-progress-step.active{
  background:#f0f5e8;
  color:#2c5c16;
  border-color:#c9dba0;
}
.wso-progress-step.done{
  color:#2c5c16;
}
.wso-progress-dot{
  width:6px;
  height:6px;
  border-radius:50%;
  background:currentColor;
}
.wso-body{
  padding:18px 20px;
  overflow-y:auto;
  min-height:0;
  background:#fff;
}
.wso-foot{
  display:flex;
  align-items:center;
  justify-content:flex-end;
  gap:10px;
  padding:14px 20px;
  border-top:1px solid #E1E6D8;
  background:#fbfcf8;
}
.wso-row{
  border:1px solid #E1E6D8;
  border-radius:13px;
  padding:14px;
  margin-bottom:10px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:14px;
  flex-wrap:wrap;
  background:#fff;
  transition:box-shadow .16s ease,border-color .16s ease,transform .16s ease,background .16s ease;
}
.wso-row:hover{
  border-color:#cfdcc0;
  background:#fbfdf8;
  box-shadow:0 6px 18px rgba(50,109,32,.06);
}
.wso-row h3{
  font-size:13px;
  line-height:1.35;
  margin:0 0 4px;
}
.wso-row strong{font-variant-numeric:tabular-nums}
.wso-row-head{
  display:flex;
  align-items:center;
  gap:7px;
  flex-wrap:wrap;
}
.wso-availability{
  display:inline-flex;
  align-items:center;
  gap:5px;
  padding:3px 7px;
  border-radius:999px;
  background:#f0f5e8;
  color:#2c5c16;
  border:1px solid #c9dba0;
  font-size:9px;
  font-weight:800;
}
.wso-availability-dot{
  width:5px;
  height:5px;
  border-radius:50%;
  background:#3b791e;
}
.wso-actions{
  display:flex;
  gap:8px;
  align-items:center;
  flex-wrap:wrap;
}
.wso-qty{
  display:flex;
  align-items:center;
  gap:7px;
  color:#5C6B60;
  font-size:11px;
  font-weight:700;
}
.wso-dialog input,
.wso-dialog textarea,
.wso-dialog select{
  font:inherit;
  font-size:12.5px;
  border:1px solid #E1E6D8;
  border-radius:9px;
  padding:10px 11px;
  background:#fff;
  color:#12241B;
  width:100%;
  transition:border-color .15s ease,box-shadow .15s ease;
}
.wso-dialog input:focus,
.wso-dialog textarea:focus,
.wso-dialog select:focus{
  outline:none;
  border-color:#3b791e;
  box-shadow:0 0 0 3px rgba(59,121,30,.10);
}
.wso-qty input{width:76px;text-align:center}
.wso-field{
  display:block;
  margin:14px 0;
  font-size:11px;
  font-weight:800;
  color:#12241B;
}
.wso-field input,
.wso-field textarea,
.wso-field select{margin-top:6px;font-weight:400}
.wso-error{
  display:flex;
  align-items:flex-start;
  gap:8px;
  background:#fdf1f0;
  color:#c0392b;
  border:1px solid #f2c9c4;
  padding:11px 12px;
  border-radius:10px;
  font-size:11px;
  margin-bottom:12px;
}
.wso-notice{
  display:flex;
  align-items:flex-start;
  gap:8px;
  background:#f0f5e8;
  color:#2c5c16;
  border:1px solid #c9dba0;
  padding:11px 12px;
  border-radius:10px;
  font-size:11px;
  margin-bottom:12px;
}
.wso-empty{
  padding:40px 16px;
  text-align:center;
  color:#5C6B60;
  font-size:12px;
  border:1px dashed #E1E6D8;
  border-radius:13px;
  background:#fbfcf8;
}
.wso-pill{
  border-radius:999px;
  padding:5px 9px;
  background:#f0f5e8;
  color:#2c5c16;
  border:1px solid #c9dba0;
  font-size:10px;
  font-weight:800;
}
.wso-steps{
  display:flex;
  gap:5px;
  flex-wrap:wrap;
  margin-top:12px;
}
.wso-step{
  font-size:9px;
  padding:5px 8px;
  background:#F6F7F1;
  color:#5C6B60;
  border-radius:7px;
}
.wso-step.done{
  background:#f0f5e8;
  color:#2c5c16;
}
.wso-section-title{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  margin:0 0 10px;
}
.wso-section-title h3{
  margin:0;
  font-size:13px;
}
.wso-info-card{
  display:flex;
  align-items:flex-start;
  gap:10px;
  padding:12px;
  margin-bottom:12px;
  border:1px solid #E1E6D8;
  border-radius:12px;
  background:#fbfcf8;
}
.wso-info-card-icon{
  width:30px;
  height:30px;
  border-radius:9px;
  background:#f0f5e8;
  color:#3b791e;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  flex:0 0 auto;
}
.wso-total{
  font-size:18px;
  font-weight:800;
  font-variant-numeric:tabular-nums;
}
.wso-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:12px;
}
.wso-payment-card{
  border:1px solid #E1E6D8;
  border-radius:13px;
  padding:12px;
  background:#fbfcf8;
}
.wso-payment-card legend{
  padding:0 5px;
  font-size:10px;
  font-weight:800;
  color:#5C6B60;
}
.wso-payment-buttons{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:8px;
}
.wso-dialog button,
.wso-toolbar button{
  font-family:inherit;
  min-height:36px;
  border:1px solid #E1E6D8;
  border-radius:999px;
  padding:8px 12px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  background:#fff;
  color:#2c5c16;
  cursor:pointer;
  font-size:11px;
  font-weight:700;
  transition:transform .14s ease,background .14s ease,border-color .14s ease,box-shadow .14s ease,filter .14s ease;
}
.wso-dialog button:hover,
.wso-toolbar button:hover{
  border-color:#c9dba0;
  background:#fbfdf8;
  box-shadow:0 4px 12px rgba(50,109,32,.06);
}
.wso-dialog button:active,
.wso-toolbar button:active{
  transform:translateY(1px);
}
.wso-dialog button.wso-primary,
.wso-toolbar button.wso-primary{
  background:#3b791e;
  color:#fff;
  border-color:#3b791e;
  box-shadow:0 4px 12px rgba(59,121,30,.12);
}
.wso-dialog button.wso-primary:hover,
.wso-toolbar button.wso-primary:hover{
  background:#2f6717;
  border-color:#2f6717;
  filter:none;
}
.wso-dialog button:disabled{
  opacity:.55;
  cursor:not-allowed;
  box-shadow:none;
}
.wso-dialog :focus-visible{
  outline:2px solid #3b791e;
  outline-offset:3px;
}
@keyframes wso-in{
  from{opacity:0;transform:translateY(8px) scale(.99)}
  to{opacity:1;transform:none}
}
@media(max-width:560px){
  .wso-overlay{padding:10px}
  .wso-dialog{max-height:calc(100dvh - 20px);border-radius:16px}
  .wso-body,.wso-head{padding:14px}
  .wso-progress{padding:0 14px 12px;overflow-x:auto}
  .wso-progress-step{white-space:nowrap}
  .wso-foot{padding:12px 14px}
  .wso-grid{grid-template-columns:1fr}
  .wso-payment-buttons{grid-template-columns:1fr}
  .wso-actions{width:100%}
  .wso-actions>button{flex:1}
  .wso-row{align-items:flex-start}
}
@media(prefers-reduced-motion:reduce){
  .wso-dialog,.wso-dialog *{animation:none!important;transition:none!important}
}
`;
// Reuse this component in ManagerDashboard with the same ref.openItem(item) integration.
const WebSupplyOrders = forwardRef(function WebSupplyOrders({user, apiUrl=process.env.REACT_APP_API_URL, onReceived, smartPanel=false, onPlan, embedded=false}, ref) {
  const identity = `${user?.id || "guest"}:${user?.brand || ""}:${user?.branch || ""}`;
  const cartKey=`franchisync:web-cart:${identity}`, draftKey=`franchisync:web-checkout:${identity}`;
  const allowed=["franchisee","manager"].includes(String(user?.role || "").trim().toLowerCase());
  const [cart,setCart]=useState(()=>readSaved(localStorage,cartKey,[]));
  const [draft,setDraft]=useState(()=>readSaved(sessionStorage,draftKey,null));
  const [view,setView]=useState(null), [supplies,setSupplies]=useState([]), [loading,setLoading]=useState(false), [error,setError]=useState("");
  const [target,setTarget]=useState(null), [quantities,setQuantities]=useState({}), [orders,setOrders]=useState([]), [busy,setBusy]=useState(false);
  const [phone,setPhone]=useState(user?.phone || ""), [address,setAddress]=useState(user?.address || "");
  const [checkout,setCheckout]=useState(null), [success,setSuccess]=useState(null), [confirmReceive,setConfirmReceive]=useState(null);
  const [payment,setPayment]=useState("cod"), [gcashRef,setGcashRef]=useState(""), [receipt,setReceipt]=useState(null), [selected,setSelected]=useState({});
  const [plan,setPlan]=useState([]),[planError,setPlanError]=useState(""),[catalogueSearch,setCatalogueSearch]=useState(""),[search,setSearch]=useState(""),[lowOnly,setLowOnly]=useState(true),[levelEdits,setLevelEdits]=useState({}),[savingLevel,setSavingLevel]=useState(null);
  const dialogRef=useRef(null), submitting=useRef(false), currentIdentity=useRef(identity);
  const api=useCallback(async (path,options={})=>{
    const response=await fetch(`${String(apiUrl || "").replace(/\/$/,"")}${path}`,{credentials:"include",...options,headers:{"Content-Type":"application/json",...options.headers}});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw Object.assign(new Error(data.error || "The request failed. Please try again."), {status:response.status});
    return data;
  },[apiUrl]);
  useEffect(()=>{if(currentIdentity.current!==identity){currentIdentity.current=identity;setCart(readSaved(localStorage,cartKey,[]));setDraft(readSaved(sessionStorage,draftKey,null));setView(null);setSupplies([]);setCheckout(null);}},[identity,cartKey,draftKey]);
  const saveCart=next=>{setCart(next);try{localStorage.setItem(cartKey,JSON.stringify(next));}catch{}};
  const saveDraft=next=>{setDraft(next);try{if(next)sessionStorage.setItem(draftKey,JSON.stringify(next));else sessionStorage.removeItem(draftKey);}catch{}};
  const loadSupplies=useCallback(async()=>{setLoading(true);try{const data=await api("/website-order-supplies");setSupplies(Array.isArray(data)?data:[]);return data;}catch(e){setError(e.message);return [];}finally{setLoading(false);}},[api]);
  const loadOrders=useCallback(async()=>{setLoading(true);try{const data=await api("/website-orders");setOrders(Array.isArray(data)?data:[]);}catch(e){setError(e.message);}finally{setLoading(false);}},[api]);
  const loadPlan=useCallback(async()=>{try{const data=await api("/website-reorder-plan");const list=Array.isArray(data)?data:[];setPlan(list);onPlan?.(list);setPlanError("");return list;}catch(e){setPlanError(e.message);return [];}},[api,onPlan]);
  useEffect(()=>{loadPlan();if(smartPanel)loadSupplies();const id=setInterval(()=>{if(document.visibilityState==="visible"){loadPlan();if(smartPanel)loadSupplies();}},30000);return()=>clearInterval(id);},[loadPlan,loadSupplies,smartPanel]);
  const saveLevels=async(item)=>{if(savingLevel!=null)return;setSavingLevel(item.id);setPlanError("");try{const edit=levelEdits[item.id]||{};await api(`/website-reorder-plan/${encodeURIComponent(item.id)}`,{method:"PUT",body:JSON.stringify({reorder_level:edit.reorder_level??item.reorder_level,target_stock:edit.target_stock??item.target_stock})});await loadPlan();window.dispatchEvent(new Event("stock-inventory-updated"));}catch(e){setPlanError(e.message);}finally{setSavingLevel(null);}};
  const open=(next)=>{setError("");setSuccess(null);setConfirmReceive(null);setView(next);if(next==="orders")loadOrders();else {loadSupplies();loadPlan();}};
  useImperativeHandle(ref,()=>({openItem(item){if(!allowed)return;setTarget(item);setQuantities({});open("supply");}}));
  useEffect(()=>{if(view!=="orders")return;const id=setInterval(()=>{if(document.visibilityState==="visible")loadOrders();},30000);return()=>clearInterval(id);},[view,loadOrders]);
  useEffect(()=>{
    if(!view)return;const previous=document.activeElement;const oldOverflow=document.body.style.overflow;document.body.style.overflow="hidden";
    const node=dialogRef.current;const list=()=>Array.from(node.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [tabindex="0"]')).filter(el=>el.getClientRects().length);
    (list()[0]||node).focus();
    const key=e=>{if(e.key==="Escape"&&!submitting.current){setView(null);}if(e.key==="Tab"){const items=list();if(!items.length){e.preventDefault();node.focus();return;}const first=items[0],last=items[items.length-1];if(e.shiftKey&&(document.activeElement===first||!node.contains(document.activeElement))){e.preventDefault();last.focus();}else if(!e.shiftKey&&(document.activeElement===last||!node.contains(document.activeElement))){e.preventDefault();first.focus();}}};
    document.addEventListener("keydown",key);return()=>{document.body.style.overflow=oldOverflow;document.removeEventListener("keydown",key);if(previous?.isConnected)previous.focus();};
  },[view]);
  const targetPlan=target?(plan.find(i=>String(i.id)===String(target.id))||target):null;
  const qtyFor=s=>quantities[s.shop_item_id]??Math.max(1,suggested(targetPlan,s)??1);
  const candidates=target?supplies.filter(s=>(s.branch_ingredient_ids||[]).some(id=>String(id)===String(target.id))):supplies.filter(s=>String(s.name).toLowerCase().includes(catalogueSearch.toLowerCase()));
  const lines=cart.map(line=>({...line,supply:supplies.find(s=>String(s.shop_item_id)===String(line.shop_item_id))}));
  const cartCount=cart.reduce((n,line)=>n+Number(line.quantity||0),0);
  const lineValid=(s,q)=>s?.orderable && Number.isInteger(Number(q)) && Number(q)>0 && Number(q)<=Math.min(Number(s.stock),1000000);
  const add=(s)=>{const q=Number(qtyFor(s));const old=cart.find(l=>String(l.shop_item_id)===String(s.shop_item_id));if(!lineValid(s,q+(old?.quantity||0))){setError("Choose a valid quantity within available Head Office stock.");return;}saveCart(old?cart.map(l=>String(l.shop_item_id)===String(s.shop_item_id)?{...l,quantity:l.quantity+q}:l):[...cart,{shop_item_id:s.shop_item_id,quantity:q}]);setSuccess(`${s.name} added to cart.`);setError("");};
  const review=(mode,s)=>{
    if(draft){setError("Resume the previous checkout first so the same order is not submitted twice.");return;}
    const chosen=mode==="buy"?[{shop_item_id:s.shop_item_id,quantity:Number(qtyFor(s)),supply:s}]:lines.filter(line=>selected[line.shop_item_id]!==false);
    if(!chosen.length||chosen.some(l=>!lineValid(l.supply,l.quantity))){setError("Review quantities and remove unavailable supplies before checkout.");return;}
    setCheckout({mode,items:chosen.map(l=>({shop_item_id:l.shop_item_id,quantity:l.quantity,price:l.supply.price,name:l.supply.name,unit:l.supply.unit}))});setError("");setSuccess(null);setPayment("cod");setGcashRef("");setView("checkout");
  };
  const resume=()=>{setCheckout({mode:draft.mode,items:draft.items});setPhone(draft.phone);setAddress(draft.address);setPayment(draft.payment_method||"cod");setGcashRef(draft.gcash_ref||"");setError("");setView("checkout");};
  const confirmCheckout=()=>{
    if(draft){place();return;}
    if(!/^[+\d\s()-]{7,25}$/.test(phone.trim())||phone.replace(/\D/g,"").length<7||address.trim().length<5){setError("Enter a valid contact number and complete delivery address.");return;}
    setError("");setView("payment");
  };
  const place=async()=>{
    if(submitting.current)return;
    if(!checkout)return;
    if(!draft&&(!/^[+\d\s()-]{7,25}$/.test(phone.trim())||phone.replace(/\D/g,"").length<7||address.trim().length<5)){setError("Enter a valid contact number and complete delivery address.");return;}
    if(!draft&&payment==="gcash"&&!/^[A-Za-z0-9-]{6,100}$/.test(gcashRef.trim())){setError("Enter the reference from your completed GCash transfer (6–100 letters, numbers or hyphens).");return;}
    const pending=draft||{...checkout,phone:phone.trim(),address:address.trim(),payment_method:payment,gcash_ref:payment==="gcash"?gcashRef.trim():null,client_request_id:requestId()};
    // Persist the exact request before sending; retrying a timeout cannot create a second order.
    saveDraft(pending);submitting.current=true;setBusy(true);setError("");
    try{
      const data=await api("/website-orders",{method:"POST",body:JSON.stringify(pending)});
      if(!data.success||!data.order?.id)throw new Error("No order confirmation received. Retry this checkout.");
      if(pending.mode==="cart")saveCart(cart.map(line=>({...line,quantity:line.quantity-(pending.items.find(p=>String(p.shop_item_id)===String(line.shop_item_id))?.quantity||0)})).filter(line=>line.quantity>0));
      setReceipt({...data.order,items:pending.items,address:pending.address,phone:pending.phone,payment_method:pending.payment_method||"cod",gcash_ref:pending.gcash_ref,total_amount:data.order.total_amount??pending.items.reduce((n,l)=>n+Math.round(l.price*100)*l.quantity,0)/100});
      saveDraft(null);setCheckout(null);setSuccess(`Order #${data.order.id} placed. Head Office will review it.`);setView("receipt");window.dispatchEvent(new Event("franchisync:data-changed"));
    }catch(e){if([400,403,409].includes(e.status))saveDraft(null);setError(e.message);setView("checkout");}finally{submitting.current=false;setBusy(false);}
  };
  const receive=async(order)=>{if(submitting.current)return;submitting.current=true;setBusy(true);setError("");try{await api(`/website-orders/${encodeURIComponent(order.id)}/received`,{method:"PUT",body:"{}"});setConfirmReceive(null);setSuccess(`Order #${order.id} received. Branch stock has been updated.`);await loadOrders();await loadPlan();onReceived?.();window.dispatchEvent(new Event("stock-inventory-updated"));window.dispatchEvent(new Event("franchisync:data-changed"));}catch(e){setError(e.message);await loadOrders();}finally{submitting.current=false;setBusy(false);}};
  if(!allowed)return null;
  return <><style>{css}</style><div className={`wso-toolbar${embedded ? " wso-toolbar-embedded" : ""}`}>
    {draft&&<button onClick={resume}>Resume checkout</button>}
    <button onClick={()=>{setTarget(null);open("supply");}}><ShoppingBag size={15}/>+ Order Supplies</button>
    <button onClick={()=>open("orders")}><Package size={15}/>Supply Orders</button>
    <button className="wso-primary" onClick={()=>open("cart")}><ShoppingCart size={15}/>Cart ({cartCount})</button>
  </div>{smartPanel&&<section className="wso-dialog" style={{width:"100%",maxHeight:"none",boxShadow:"none"}} aria-label="Smart Reordering"><header className="wso-head"><div><h2>Smart Reordering</h2><p className="wso-sub">{user?.brand} · {user?.branch} · Supplier: San Juan (Head Office)</p><p className="wso-sub">Set your stock levels, review suggested quantities, then place your order.</p></div><button onClick={()=>{loadPlan();loadSupplies();}}><RefreshCw size={14}/>Refresh</button></header><div className="wso-body">{planError&&<div role="alert" className="wso-error">{planError}</div>}{error&&!view&&<div role="alert" className="wso-error">{error}</div>}<div className="wso-grid"><input aria-label="Search reorder items" placeholder="Search branch supplies" value={search} onChange={e=>setSearch(e.target.value)}/><label className="wso-actions"><input style={{width:18}} type="checkbox" checked={lowOnly} onChange={e=>setLowOnly(e.target.checked)}/>Low Stock only</label></div><p className="wso-sub">Suggestions = target stock − current stock, rounded up to whole ordering units and limited to San Juan availability. Check Supply Orders for deliveries already on the way.</p>{plan.filter(i=>(!lowOnly||i.low_stock)&&i.name.toLowerCase().includes(search.toLowerCase())).map(item=>{const matches=supplies.filter(s=>(s.branch_ingredient_ids||[]).some(id=>String(id)===String(item.id)));const primary=matches.length===1?matches[0]:null;const qty=primary?suggested(item,primary):null;const edit=levelEdits[item.id]||{};return <article className="wso-row" key={item.id} style={{marginTop:12,alignItems:"start"}}><div style={{flex:"1 1 240px"}}><div className="wso-actions"><h3>{item.name}</h3>{item.low_stock&&<span className="wso-pill" style={{background:"#fdf1f0",color:"#c0392b"}}>Low Stock</span>}</div><p className="wso-sub">Current stock: {quantityText(item.current_stock,item.unit)}</p><p className="wso-sub">{primary?`San Juan available: ${quantityText(primary.stock,primary.unit)}`:matches.length?"Choose a San Juan listing when you reorder.":"No compatible visible San Juan listing found."}</p><p className="wso-sub">{item.target_stock==null?"Set a target stock level to enable a suggestion.":qty==null?"A compatible supply listing is needed for a suggestion.":`Suggested order: ${quantityText(qty,primary.unit)}`}</p>{qty===0&&<p className="wso-sub">Target is already met or San Juan has no whole ordering units available.</p>}</div><div style={{flex:"1 1 260px"}}><div className="wso-grid">{["reorder_level","target_stock"].map(field=><label className="wso-field" key={field}>{field==="reorder_level"?"Reorder level":"Target stock"} ({fullUnit(item.unit)})<input type="number" min="0" step="any" aria-label={`${field} for ${item.name}`} value={edit[field]??item[field]??""} onChange={e=>setLevelEdits(prev=>({...prev,[item.id]:{...prev[item.id],[field]:e.target.value}}))}/></label>)}</div><div className="wso-actions"><button disabled={savingLevel!=null} onClick={()=>saveLevels(item)}>{savingLevel===item.id?"Saving…":"Save levels"}</button><button className="wso-primary" disabled={loading||!matches.some(s=>s.orderable&&s.stock>=1)||!!draft} onClick={()=>{setTarget(item);setQuantities({});open("supply");}}><ShoppingCart size={14}/>{item.low_stock?"Reorder":"Order Item"}</button></div></div></article>;})}{!planError&&!plan.filter(i=>(!lowOnly||i.low_stock)&&i.name.toLowerCase().includes(search.toLowerCase())).length&&<p className="wso-empty">No matching branch items. Turn off Low Stock only to configure other items, or use + Order Supplies for a new product.</p>}</div></section>}{view&&<div className="wso-overlay" onClick={e=>{if(e.target===e.currentTarget&&!busy)setView(null);}}><section className="wso-dialog" role="dialog" aria-modal="true" aria-labelledby="wso-title" ref={dialogRef} tabIndex={-1}>
    <header className="wso-head">
        <div className="wso-head-copy">
          <span className="wso-head-icon"><ShoppingBag size={17}/></span>
          <div>
            <h2 id="wso-title">{view==="receipt"?"Order Receipt":view==="payment"?"Confirm Order":view==="cart"?"Supply Cart":view==="checkout"?"Review Order":view==="orders"?"Supply Orders":target?`Reorder ${target.name}`:"Head Office Supplies"}</h2>
            <p className="wso-sub">{user?.brand} · {user?.branch}</p>
            <span className="wso-context">Supplier · San Juan (Head Office)</span>
          </div>
        </div>
        <button className="wso-close" aria-label="Close supply ordering" onClick={()=>setView(null)} disabled={busy}><X size={17}/></button>
      </header>
      {view!=="orders"&&view!=="receipt"&&<div className="wso-progress" aria-label="Order progress">
        {[
          ["supply","Supplies",1],
          ["cart","Cart",2],
          ["checkout","Review",3],
          ["payment","Confirm",4]
        ].map(([key,label,num])=>{
          const order={supply:1,cart:2,checkout:3,payment:4}[view]||1;
          return <span key={key} className={`wso-progress-step ${order===num?"active":order>num?"done":""}`}>
            <span className="wso-progress-dot"/>{label}
          </span>;
        })}
      </div>}
    <div className="wso-body">{error&&<div className="wso-error" role="alert"><AlertTriangle size={15}/> {error}</div>}{success&&<div className="wso-notice" role="status">{success}</div>}
      {loading&&<p className="wso-sub" role="status">Refreshing…</p>}
      {view==="supply"&&<><div className="wso-info-card"><span className="wso-info-card-icon"><Package size={15}/></span><div><strong style={{fontSize:11.5}}>Order directly from San Juan</strong><p className="wso-sub">Choose a supply, set the quantity, then use Add to Cart or Buy Now. Your branch stock updates after the delivery is confirmed.</p></div></div>{!target&&<label className="wso-field">Search San Juan supplies<input placeholder="Find a new product" value={catalogueSearch} onChange={e=>setCatalogueSearch(e.target.value)}/></label>}{!loading&&!candidates.length&&<div className="wso-empty">{target?"No matching visible Head Office supply is linked to this item. Ask Head Office to check its shop listing.":"No visible supplies are available for your brand."}</div>}{candidates.map(s=><div className="wso-row" key={s.shop_item_id}><div><div className="wso-row-head"><h3>{s.name}</h3>{s.orderable&&<span className="wso-availability"><span className="wso-availability-dot"/>Available</span>}</div><p className="wso-sub">{money(s.price)} / {fullUnit(s.unit)} · {quantityText(s.stock,s.unit)} available at San Juan</p>{targetPlan&&<p className="wso-sub">Current: {quantityText(targetPlan.current_stock??targetPlan.stock,targetPlan.unit)} · {targetPlan.target_stock==null?"Set a target in Smart Reordering for a suggested quantity.":`Target: ${quantityText(targetPlan.target_stock,targetPlan.unit)} · Suggested: ${quantityText(suggested(targetPlan,s),s.unit)}`}</p>}{!s.orderable&&<p className="wso-sub">{s.unavailable_reason}</p>}</div><div className="wso-actions"><label className="wso-qty">Quantity <input aria-label={`Quantity for ${s.name}`} type="number" min="1" max={Math.min(s.stock,1000000)} step="1" value={qtyFor(s)} onChange={e=>setQuantities(q=>({...q,[s.shop_item_id]:e.target.value}))}/></label><button disabled={!lineValid(s,qtyFor(s))||!!draft} onClick={()=>add(s)}><Plus size={14}/>Add to Cart</button><button className="wso-primary" disabled={!lineValid(s,qtyFor(s))||!!draft} onClick={()=>review("buy",s)}>Buy Now</button></div></div>)}<p className="wso-sub">Supplier: San Juan (Head Office). Availability is checked again at acceptance. Your branch stock increases only after you confirm receipt.</p></>}
      {view==="cart"&&<>{!cart.length&&<div className="wso-empty">Your cart is empty. Choose an item from Stock Inventory or Browse Supplies.</div>}{lines.map(line=><div className="wso-row" key={line.shop_item_id}><div><label className="wso-actions"><input style={{width:16}} type="checkbox" aria-label={`Select ${line.supply?.name||"supply"}`} checked={selected[line.shop_item_id]!==false} disabled={!!draft} onChange={e=>setSelected(prev=>({...prev,[line.shop_item_id]:e.target.checked}))}/><h3>{line.supply?.name||"Unavailable supply"}</h3></label><p className="wso-sub">{line.supply?`${money(line.supply.price)} / ${line.supply.unit}`:"Remove this item or refresh supplies."}</p></div><div className="wso-actions"><label className="wso-qty">Quantity <input type="number" aria-label={`Cart quantity for ${line.supply?.name||line.shop_item_id}`} min="1" max={line.supply?.stock||1} step="1" value={line.quantity} disabled={!!draft} onChange={e=>saveCart(cart.map(l=>String(l.shop_item_id)===String(line.shop_item_id)?{...l,quantity:e.target.value===""?"":Number(e.target.value)}:l))}/></label><strong>{money((line.supply?.price||0)*Number(line.quantity||0))}</strong><button aria-label={`Remove ${line.supply?.name||"supply"}`} disabled={!!draft} onClick={()=>saveCart(cart.filter(l=>String(l.shop_item_id)!==String(line.shop_item_id)))}><Trash2 size={14}/></button></div></div>)}</>}
      {view==="checkout"&&checkout&&<>{checkout.items.map(line=><div className="wso-row" key={line.shop_item_id}><div><h3>{line.name}</h3><p className="wso-sub">{line.quantity} {line.unit} × {money(line.price)}</p></div><strong>{money(Math.round(line.price*100)*line.quantity/100)}</strong></div>)}<div className="wso-grid"><label className="wso-field">Contact number<input autoComplete="tel" maxLength={25} disabled={busy||!!draft} value={phone} onChange={e=>setPhone(e.target.value)}/></label><label className="wso-field">Receiving branch<input readOnly value={user?.branch||""}/></label></div><label className="wso-field">Complete delivery address<textarea rows={3} maxLength={1000} autoComplete="street-address" disabled={busy||!!draft} value={address} onChange={e=>setAddress(e.target.value)}/></label><fieldset className="wso-payment-card" disabled={busy||!!draft}><legend>Payment method</legend><div className="wso-payment-buttons">{["cod","gcash"].map(method=><button key={method} type="button" aria-pressed={payment===method} className={payment===method?"wso-primary":""} onClick={()=>setPayment(method)}>{paymentLabel(method)}</button>)}</div>{payment==="gcash"&&<p className="wso-sub">Submit the reference from an existing transfer to Head Office. Payment remains awaiting verification.</p>}</fieldset><p className="wso-sub">Review the supply quantities and delivery details before placing your order.</p>{draft&&<div className="wso-notice">This checkout has already been sent. Retry to retrieve its confirmation safely; the same checkout reference is reused.</div>}</>}
      {view==="payment"&&checkout&&<><div className="wso-notice">Payment: <strong>{paymentLabel(payment)}</strong></div><p className="wso-sub">Deliver to {address} · {phone}</p>{payment==="cod"?<p>Confirm this order and pay on delivery.</p>:<><p className="wso-sub">Use the GCash recipient details provided by Head Office. This form records your transfer reference; it does not initiate or verify a payment.</p><label className="wso-field">GCash reference<input value={gcashRef} maxLength={100} disabled={busy} onChange={e=>setGcashRef(e.target.value.trim())}/></label></>}<p className="wso-sub">Your order will appear in Head Office Supply Order Management.</p></>}
      {view==="receipt"&&receipt&&<><div className="wso-notice"><CheckCircle2 size={16}/> Order #{receipt.id} submitted</div><p className="wso-sub">{user?.name} · {user?.branch}</p><p className="wso-sub">{receipt.created_at?new Date(receipt.created_at).toLocaleString("en-PH"):"Just now"}</p><p className="wso-sub">{receipt.address} · {receipt.phone}</p>{receipt.items.map(line=><div className="wso-row" key={line.shop_item_id}><div><h3>{line.name}</h3><p className="wso-sub">{line.quantity} {line.unit} × {money(line.price)}</p></div><strong>{money(Math.round(line.price*100)*line.quantity/100)}</strong></div>)}<p>Payment: <strong>{paymentLabel(receipt.payment_method)}</strong></p><p className="wso-sub">{paymentState(receipt.payment_method)}</p>{receipt.gcash_ref&&<p className="wso-sub">GCash reference: {receipt.gcash_ref}</p>}<strong className="wso-total">{money(receipt.total_amount)}</strong><p className="wso-sub">This is an order acknowledgement. Payment status is shown separately from order status.</p></>}
      {view==="orders"&&<>{!loading&&!orders.length&&<div className="wso-empty">No supply orders for this branch yet.</div>}{orders.map(order=><article className="wso-row" key={order.id} style={{display:"block"}}><div style={{display:"flex",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}><h3>Order #{order.id}</h3><span className="wso-pill">{statusName[order.status]||order.status} · {order.order_source==="website"?"Website":"Mobile"}</span></div><p className="wso-sub">{new Date(order.created_at).toLocaleString("en-PH")} · {order.user_name}</p><p className="wso-sub">{order.address} · {order.phone}</p>{order.payment_method&&<p className="wso-sub">{paymentLabel(order.payment_method)} · {paymentState(order.payment_method)}{order.gcash_ref?` · Ref: ${order.gcash_ref}`:""}</p>}<div className="wso-steps">{["pending","accepted","shipping","received"].map((step,index)=><span key={step} className={`wso-step ${["pending","accepted","shipping","received"].indexOf(order.status)>=index?"done":""}`}>{statusName[step]}</span>)}</div><ul style={{paddingLeft:20,fontSize:12}}>{(order.order_lines||[]).map((line,index)=><li key={index}>{line.name||"Supply"} — {line.quantity} {line.unit} × {money(line.price)}</li>)}</ul><div className="wso-actions" style={{justifyContent:"space-between"}}><strong>{money(order.total_amount)}</strong>{order.status==="shipping"&&(confirmReceive===order.id?<><span className="wso-sub">Confirm all listed supplies have arrived?</span><button disabled={busy} onClick={()=>setConfirmReceive(null)}>Not yet</button><button className="wso-primary" disabled={busy} onClick={()=>receive(order)}>{busy?"Confirming…":"Yes, received"}</button></>:<button className="wso-primary" disabled={busy} onClick={()=>setConfirmReceive(order.id)}><CheckCircle2 size={14}/>Confirm Receipt</button>)}</div></article>)}</>}
    </div><footer className="wso-foot">{view==="receipt"?<><button onClick={()=>setView(null)}>Close receipt</button><button className="wso-primary" onClick={()=>open("orders")}>Go to Orders</button></>:view==="payment"?<><button disabled={busy} onClick={()=>{setError("");setView("checkout");}}>Back</button><strong className="wso-total">{money((checkout?.items||[]).reduce((n,l)=>n+Math.round(l.price*100)*l.quantity,0)/100)}</strong><button className="wso-primary" disabled={busy} onClick={place}>{busy?"Placing order…":payment==="gcash"?"Submit Reference & Order":"Confirm & Place Order"}</button></>:view==="checkout"?<><strong className="wso-total">{money((checkout?.items||[]).reduce((total,line)=>total+Math.round(line.price*100)*line.quantity,0)/100)}</strong><button className="wso-primary" disabled={busy} onClick={confirmCheckout}>{busy?"Placing order…":draft?"Retry Confirmation":"Continue"}</button></>:view==="cart"?<><strong className="wso-total">{money(lines.filter(line=>selected[line.shop_item_id]!==false).reduce((total,line)=>total+Math.round((line.supply?.price||0)*100)*Number(line.quantity||0),0)/100)}</strong><button className="wso-primary" disabled={loading||!cart.length||!!draft} onClick={()=>review("cart")}>Review Order</button></>:<button disabled={loading||busy} onClick={()=>{setError("");view==="orders"?loadOrders():loadSupplies();}}><RefreshCw size={14}/>Refresh</button>}</footer>
  </section></div>}</>;
});
export default WebSupplyOrders;
