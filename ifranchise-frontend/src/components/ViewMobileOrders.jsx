// ── placeholder order data ────────────────────────────────────────────────────
const PLACEHOLDER_ORDERS = [
  { id:"ORD-0041", customer:"Maria Santos",    phone:"09171234567", brand:"iPharma",    branch:"Alabang",     items:[{name:"Vitamin C 500mg",qty:2,price:120},{name:"Biogesic",qty:1,price:80},{name:"Strepsils",qty:2,price:75}], total:1240, status:"pending",   createdAt:"2026-04-27T14:14:00" },
  { id:"ORD-0040", customer:"Juan dela Cruz",  phone:"09281234567", brand:"Coffee Spot",branch:"BGC",         items:[{name:"Espresso (Large)",qty:1,price:350}],                                                                 total:350,  status:"pending",   createdAt:"2026-04-27T13:58:00" },
  { id:"ORD-0039", customer:"Rosa Reyes",      phone:"09391234567", brand:"iPharma",    branch:"Main Branch", items:[{name:"Ibuprofen",qty:3,price:90},{name:"Cough Syrup",qty:1,price:200},{name:"Antacid",qty:2,price:60}],   total:3800, status:"accepted",  createdAt:"2026-04-27T11:30:00" },
  { id:"ORD-0038", customer:"Carlo Mendoza",   phone:"09451234567", brand:"Coffee Spot",branch:"Alabang",     items:[{name:"Latte",qty:1,price:280},{name:"Croissant",qty:1,price:400}],                                        total:680,  status:"in_transit",createdAt:"2026-04-26T16:05:00" },
  { id:"ORD-0037", customer:"Lena Villanueva", phone:"09561234567", brand:"iPharma",    branch:"BGC",         items:[{name:"Metformin",qty:2,price:150},{name:"Losartan",qty:2,price:120}],                                     total:2150, status:"received",  createdAt:"2026-04-26T10:22:00" },
  { id:"ORD-0036", customer:"Dante Cruz",      phone:"09671234567", brand:"Coffee Spot",branch:"BGC",         items:[{name:"Cold Brew",qty:2,price:320}],                                                                       total:640,  status:"received",  createdAt:"2026-04-25T09:10:00" },
];

const STATUS_CONFIG = {
  pending:    { label:"Pending",    bg:"#faeeda", color:"#633806", dot:"#BA7517" },
  accepted:   { label:"Accepted",   bg:"#e1f5ee", color:"#085041", dot:"#0F6E56" },
  in_transit: { label:"In Transit", bg:"#e6f1fb", color:"#0c447c", dot:"#185FA5" },
  received:   { label:"Received",   bg:"#eaf3de", color:"#27500a", dot:"#3B6D11" },
  rejected:   { label:"Rejected",   bg:"#fcebeb", color:"#501313", dot:"#A32D2D" },
};

const STATUS_FLOW = {
  pending:    { nextAction:"Accept",   nextStatus:"accepted",   secondAction:"Reject", secondStatus:"rejected" },
  accepted:   { nextAction:"Ship",     nextStatus:"in_transit" },
  in_transit: { nextAction:"Mark Received", nextStatus:"received" },
};

function MobileOrdersContent() {
  const [orders,       setOrders]       = useState(PLACEHOLDER_ORDERS);
  const [filterBrand,  setFilterBrand]  = useState("all");
  const [filterBranch, setFilterBranch] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search,       setSearch]       = useState("");
  const [viewOrder,    setViewOrder]    = useState(null);

  const allBrands   = [...new Set(orders.map(o => o.brand))];
  const allBranches = [...new Set(orders.map(o => o.branch))];

  const fmtPeso = (n) => "₱" + Number(n||0).toLocaleString("en-PH", { minimumFractionDigits:2, maximumFractionDigits:2 });
  const fmtDate = (iso) => new Date(iso).toLocaleString("en-PH", { month:"short", day:"numeric", hour:"numeric", minute:"2-digit", hour12:true });

  const advanceStatus = (id, nextStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: nextStatus } : o));
  };

  const filtered = orders.filter(o => {
    if (filterBrand  !== "all" && o.brand  !== filterBrand)  return false;
    if (filterBranch !== "all" && o.branch !== filterBranch) return false;
    if (filterStatus !== "all" && o.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!o.id.toLowerCase().includes(q) && !o.customer.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const counts = {
    total:      orders.length,
    pending:    orders.filter(o => o.status === "pending").length,
    in_transit: orders.filter(o => o.status === "in_transit").length,
    received:   orders.filter(o => o.status === "received").length,
  };

  const StatusBadge = ({ status }) => {
    const s = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
      <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, background:s.bg, color:s.color }}>
        <span style={{ width:6, height:6, borderRadius:"50%", background:s.dot, display:"inline-block" }} />
        {s.label}
      </span>
    );
  };

  const ActionButtons = ({ order }) => {
    const flow = STATUS_FLOW[order.status];
    if (!flow) return <span style={{ fontSize:11, color:"#5a7a65", fontWeight:600 }}>Completed</span>;
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        <button
          onClick={() => advanceStatus(order.id, flow.nextStatus)}
          style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", border:"none", background:"linear-gradient(135deg,#2E7D32,#00897b)", color:"#fff" }}>
          <Check size={11} /> {flow.nextAction}
        </button>
        {flow.secondAction && (
          <button
            onClick={() => advanceStatus(order.id, flow.secondStatus)}
            style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", border:"1px solid #fecaca", background:"#fff", color:"#dc2626" }}>
            <X size={11} /> {flow.secondAction}
          </button>
        )}
      </div>
    );
  };

  return (
    <div style={{ fontFamily:"'Montserrat',sans-serif" }}>
      {/* View modal */}
      {viewOrder && (
        <div onClick={() => setViewOrder(null)}
          style={{ position:"fixed", inset:0, background:"rgba(13,43,30,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:20 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:480, boxShadow:"0 24px 64px rgba(0,0,0,0.18)", border:"1px solid rgba(0,168,76,0.15)", maxHeight:"92vh", overflowY:"auto" }}>
            <div style={{ background:"linear-gradient(135deg,#2E7D32,#00897b)", borderRadius:"20px 20px 0 0", padding:"16px 22px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                <Package size={16} color="#fff" />
                <div>
                  <div style={{ fontWeight:800, fontSize:15, color:"#fff" }}>Order #{viewOrder.id}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.75)", marginTop:1 }}>{fmtDate(viewOrder.createdAt)}</div>
                </div>
              </div>
              <button onClick={() => setViewOrder(null)}
                style={{ width:30, height:30, borderRadius:"50%", border:"1.5px solid rgba(255,255,255,0.4)", background:"rgba(255,255,255,0.15)", cursor:"pointer", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <X size={14} />
              </button>
            </div>
            <div style={{ padding:"22px 24px" }}>
              {/* Customer */}
              <div style={{ marginBottom:18, padding:"12px 14px", background:"#f0fdf5", borderRadius:12, border:"1px solid #d1eedd" }}>
                <div style={{ fontSize:10.5, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5a7a65", marginBottom:6 }}>Customer</div>
                <div style={{ fontWeight:800, fontSize:14, color:"#0d2b1e" }}>{viewOrder.customer}</div>
                <div style={{ fontSize:12, color:"#5a7a65", marginTop:2 }}>{viewOrder.phone}</div>
              </div>
              {/* Brand / Branch */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
                {[{ label:"Brand", value:viewOrder.brand },{ label:"Branch", value:viewOrder.branch }].map(({ label, value }) => (
                  <div key={label} style={{ padding:"10px 12px", background:"#f8fffe", borderRadius:10, border:"1px solid #e0f2f1" }}>
                    <div style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5a7a65", marginBottom:3 }}>{label}</div>
                    <div style={{ fontWeight:700, fontSize:13, color:"#0d2b1e" }}>{value}</div>
                  </div>
                ))}
              </div>
              {/* Items */}
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:10.5, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5a7a65", marginBottom:8 }}>Order Items</div>
                {viewOrder.items.map((item, i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px", borderRadius:8, background: i%2===0?"#f8fffe":"#fff", border:"1px solid #e0f2f1", marginBottom:4 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13, color:"#0d2b1e" }}>{item.name}</div>
                      <div style={{ fontSize:11, color:"#5a7a65" }}>Qty: {item.qty}</div>
                    </div>
                    <div style={{ fontWeight:700, fontSize:13, color:"#00897b" }}>{fmtPeso(item.price * item.qty)}</div>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", borderRadius:10, background:"linear-gradient(135deg,#d1fae5,#e0f2f1)", marginTop:8 }}>
                  <div style={{ fontWeight:800, fontSize:13, color:"#0d2b1e" }}>Total</div>
                  <div style={{ fontWeight:800, fontSize:16, color:"#00897b" }}>{fmtPeso(viewOrder.total)}</div>
                </div>
              </div>
              {/* Status & Action */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <StatusBadge status={viewOrder.status} />
                <div style={{ display:"flex", gap:8 }}>
                  <ActionButtons order={viewOrder} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:11, fontWeight:500, letterSpacing:"0.16em", textTransform:"uppercase", color:"#00897b", marginBottom:4 }}>Orders</div>
        <h1 style={{ fontSize:26, fontWeight:800, color:"#0d2b1e", margin:0 }}>Mobile Orders</h1>
      </div>

      {/* Stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        <BmStatCard label="Total Orders"  value={counts.total}      icon={<Package size={20} color="#065f46"/>}        bg="linear-gradient(135deg,#d1fae5,#6ee7b7)" sub="All time" />
        <BmStatCard label="Pending"       value={counts.pending}    icon={<AlertTriangle size={20} color="#92400e"/>}   bg="linear-gradient(135deg,#fef9c3,#fde68a)" sub="Awaiting action" />
        <BmStatCard label="In Transit"    value={counts.in_transit} icon={<TrendingUp size={20} color="#1e40af"/>}      bg="linear-gradient(135deg,#dbeafe,#93c5fd)"  sub="On the way" />
        <BmStatCard label="Received"      value={counts.received}   icon={<Check size={20} color="#065f46"/>}           bg="linear-gradient(135deg,#d1fae5,#a7f3d0)" sub="Completed" />
      </div>

      <BmSection>
        <BmSectionHeader
          title="Order List"
          icon={<Package size={16} color="#fff" />}
        />

        {/* Filters */}
        <div style={{ padding:"12px 16px", borderBottom:"1px solid #f0f8f0", display:"flex", gap:10, flexWrap:"wrap", alignItems:"center", background:"#f8fffe" }}>
          <div style={{ position:"relative" }}>
            <Search size={13} color="#5a7a65" style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search order # or customer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...bmInput, paddingLeft:30, width:220, height:34 }}
            />
          </div>
          {[
            { label:"Brand",  value:filterBrand,  set:setFilterBrand,  options:allBrands },
            { label:"Branch", value:filterBranch, set:setFilterBranch, options:allBranches },
            { label:"Status", value:filterStatus, set:setFilterStatus, options:["pending","accepted","in_transit","received","rejected"], labelMap: k => STATUS_CONFIG[k]?.label || k },
          ].map(({ label, value, set, options, labelMap }) => (
            <div key={label} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:10.5, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5a7a65" }}>{label}</span>
              <select value={value} onChange={e => set(e.target.value)}
                style={{ ...bmInput, width:"auto", height:34, paddingRight:12, appearance:"none", cursor:"pointer" }}>
                <option value="all">All</option>
                {options.map(o => <option key={o} value={o}>{labelMap ? labelMap(o) : o}</option>)}
              </select>
            </div>
          ))}
          <span style={{ marginLeft:"auto", fontSize:12, color:"#5a7a65", fontWeight:600 }}>{filtered.length} order{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Table */}
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13, minWidth:900 }}>
            <thead>
              <tr>
                {["Order #","Customer","Brand","Branch","Items","Total","Date Placed","Status","Actions"].map(h => (
                  <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontWeight:800, fontSize:10.5, color:"#00897b", letterSpacing:"0.07em", textTransform:"uppercase", borderBottom:"1px solid #d1eedd", background:"#f8fffe", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding:"48px 0", textAlign:"center", color:"#5a7a65", fontSize:13, fontStyle:"italic" }}>
                    No orders match the current filters.
                  </td>
                </tr>
              ) : filtered.map(order => (
                <tr key={order.id}
                  onMouseEnter={e => e.currentTarget.style.background="#f6fef8"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}
                  style={{ borderBottom:"1px solid #f0f8f0" }}>
                  <td style={{ padding:"11px 14px", fontWeight:800, color:"#0d2b1e", fontSize:12 }}>#{order.id}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ fontWeight:700, color:"#0d2b1e", fontSize:13 }}>{order.customer}</div>
                    <div style={{ fontSize:11, color:"#5a7a65" }}>{order.phone}</div>
                  </td>
                  <td style={{ padding:"11px 14px" }}>
                    <span style={{ padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:700, background:"#e0f2f1", color:"#00695c" }}>{order.brand}</span>
                  </td>
                  <td style={{ padding:"11px 14px", fontSize:12, color:"#5a7a65" }}>{order.branch}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <button
                      onClick={() => setViewOrder(order)}
                      style={{ ...bmActionBtn, borderColor:"#b2dfdb", background:"#e0f2f1", color:"#00695c", fontSize:11 }}>
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""} →
                    </button>
                  </td>
                  <td style={{ padding:"11px 14px", fontWeight:800, color:"#00897b" }}>{fmtPeso(order.total)}</td>
                  <td style={{ padding:"11px 14px", fontSize:11, color:"#5a7a65", whiteSpace:"nowrap" }}>{fmtDate(order.createdAt)}</td>
                  <td style={{ padding:"11px 14px" }}><StatusBadge status={order.status} /></td>
                  <td style={{ padding:"11px 14px" }}><ActionButtons order={order} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BmSection>
    </div>
  );
}