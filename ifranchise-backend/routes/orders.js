const express = require("express");
const router = express.Router();
const pool = require("../db");
const { sendPushNotification } = require("../utils/pushNotif");
const { logActivity } = require("../utils/activityLogger");
const { recomputeProductCosts } = require("../utils/recomputeProductCosts");
const {
  allocateIngredientStock,
  syncIngredientFromBatches,
  getAllocatableStock,
} = require("../utils/inventoryAutomation");

// ── State machine ──────────────────────────────────────────────
const ALLOWED_TRANSITIONS = {
  pending: ["accepted", "rejected"],
  accepted: ["shipping", "rejected"],
  shipping: ["received"],
  received: [],
  rejected: [],
};

const HEAD_OFFICE_BRANCH = "San Juan (Head Office)";

const FRANCHISEE_ROLES = ["Franchisee", "Manager", "Staff"];

// Website ordering uses the signed-in account set by the existing login middleware.
// Mount this router AFTER session / token verification; never trust a body user_id.
async function websiteAccount(req, res, next) {
  try {
    const authenticatedId = req.user?.id || req.session?.user?.id || req.session?.userId;
    if (!authenticatedId) return res.status(401).json({ error: "Please sign in again to order supplies." });
    const result = await pool.query("SELECT * FROM users WHERE id=$1", [authenticatedId]);
    const account = result.rows[0];
    if (!account || !["franchisee", "manager"].includes(String(account.role || "").trim().toLowerCase())) {
      return res.status(403).json({ error: "Supply ordering is available to franchisees and managers." });
    }
    if (!account.brand || !account.branch || account.branch === HEAD_OFFICE_BRANCH) {
      return res.status(403).json({ error: "Your account must have an assigned brand and receiving branch." });
    }
    req.websiteAccount = account;
    next();
  } catch (err) { next(err); }
}

function websiteUnit(value) {
  const raw = String(value || "").trim().toLowerCase().replace(/\./g, "");
  const aliases = { liters:"l", liter:"l", litres:"l", litre:"l", kilograms:"kg", kilogram:"kg", grams:"g", gram:"g", milliliters:"ml", milliliter:"ml", pieces:"pcs", piece:"pcs", pc:"pcs", bottles:"bottle", packs:"pack", boxes:"box", units:"unit" };
  return aliases[raw] || raw;
}
// Convert measured units only. Unknown package sizes must never be guessed.
function unitFactor(from, to) {
  const a=websiteUnit(from), b=websiteUnit(to);
  if(!a||!b)return null;
  if(a===b)return 1;
  const units={l:["volume",1000],ml:["volume",1],kg:["mass",1000],g:["mass",1]};
  return units[a]&&units[b]&&units[a][0]===units[b][0]?units[a][1]/units[b][1]:null;
}
const stockRound = value => Math.round(Number(value)*1e6)/1e6;
function websitePriceCents(value) {
  const number = Number(value);
  if (value == null || value === "" || !Number.isFinite(number) || number < 0) throw new Error("Invalid supply price.");
  const cents = Math.round(number * 100);
  if (!Number.isSafeInteger(cents)) throw new Error("Supply price exceeds the supported limit.");
  return cents;
}
const WEBSITE_SUPPLY_SQL = `SELECT si.id AS shop_item_id, si.name, si.price, si.unit,
  si.is_visible, si.ingredient_id, i.brand, i.branch, i.stock, i.name AS ingredient_name, i.unit AS stock_unit
  FROM shop_items si JOIN ingredients i ON i.id=si.ingredient_id
  WHERE i.branch=$1 AND LOWER(TRIM(i.brand))=LOWER(TRIM($2)) AND si.is_visible=TRUE`;

router.get("/website-order-supplies", websiteAccount, async (req, res) => {
  try {
    const { rows } = await pool.query(WEBSITE_SUPPLY_SQL + " ORDER BY si.name, si.id", [HEAD_OFFICE_BRANCH, req.websiteAccount.brand]);
    const local = await pool.query("SELECT id,name,unit FROM ingredients WHERE branch=$1 AND LOWER(TRIM(brand))=LOWER(TRIM($2))", [req.websiteAccount.branch, req.websiteAccount.brand]);
    const supplies = await Promise.all(rows.map(async row => {
      const available=Number(await getAllocatableStock(pool,row.ingredient_id))||0;
      const factor = unitFactor(row.unit,row.stock_unit);
      const sameUnit = factor !== null;
      const validPrice = row.price != null && row.price !== "" && Number.isFinite(Number(row.price)) && Number(row.price) >= 0;
      return { shop_item_id:row.shop_item_id, ingredient_id:row.ingredient_id, name:row.name,
        unit:row.unit, price:Number(row.price), stock:factor?Math.max(0, Math.floor(stockRound(available/factor))):0, stock_unit:row.stock_unit, inventory_stock:Number(row.stock)||0, inventory_per_order_unit:factor,
        brand:row.brand, orderable:sameUnit && validPrice,
        unavailable_reason:!sameUnit ? "San Juan must configure a compatible unit or an explicit package size before this item can be ordered." : !validPrice ? "Head Office must set a valid price." : "",
        branch_ingredient_ids:local.rows.filter(item => String(item.name || "").trim().toLowerCase() === String(row.ingredient_name || row.name || "").trim().toLowerCase() && unitFactor(item.unit,row.stock_unit)!==null).map(item => item.id)
      };
    }));
    res.json(supplies);
  } catch (err) { console.error("Website supplies:", err); res.status(500).json({error:"Unable to load Head Office supplies."}); }
});

router.get("/website-reorder-plan", websiteAccount, async(req,res)=>{
  try {
    const a=req.websiteAccount;
    const result=await pool.query(`SELECT id,name,unit,stock,min_stock,reorder_level,target_stock FROM ingredients
      WHERE branch=$1 AND LOWER(TRIM(brand))=LOWER(TRIM($2)) ORDER BY name,id`,[a.branch,a.brand]);
    res.json(result.rows.map(i=>({...i,current_stock:Number(i.stock)||0,
      reorder_level:Number(i.reorder_level??i.min_stock??0),
      target_stock:i.target_stock==null?null:Number(i.target_stock),
      low_stock:Number(i.stock)<=Number(i.reorder_level??i.min_stock??0)})));
  } catch(err){console.error("Reorder plan:",err);res.status(500).json({error:"Unable to load reorder levels. Check that the Smart Reordering migration was installed."});}
});
router.put("/website-reorder-plan/:id", websiteAccount, async(req,res)=>{
  const {reorder_level,target_stock}=req.body;
  if(reorder_level==null||target_stock==null||reorder_level===""||target_stock===""||
     !Number.isFinite(Number(reorder_level))||!Number.isFinite(Number(target_stock))||
     Number(reorder_level)<0||Number(target_stock)<=Number(reorder_level)||Number(target_stock)>1000000000)
    return res.status(400).json({error:"Use a non-negative reorder level and a target above the reorder level (maximum 1 billion)."});
  try{
    const a=req.websiteAccount;
    const result=await pool.query(`UPDATE ingredients SET reorder_level=$1,target_stock=$2
      WHERE id=$3 AND branch=$4 AND LOWER(TRIM(brand))=LOWER(TRIM($5)) RETURNING id`,
      [Number(reorder_level),Number(target_stock),req.params.id,a.branch,a.brand]);
    if(!result.rows.length)return res.status(404).json({error:"Branch item not found."});
    res.json({success:true});
  }catch(err){res.status(500).json({error:"Unable to save reorder levels."});}
});

router.get("/website-orders", websiteAccount, async (req, res) => {
  try {
    const result = await pool.query(`SELECT o.*, u.name AS user_name,
      COALESCE((SELECT json_agg(json_build_object('shop_item_id',oi.shop_item_id,'name',si.name,'quantity',oi.quantity,'price',oi.price,'unit',si.unit) ORDER BY oi.id)
      FROM order_items oi LEFT JOIN shop_items si ON si.id=oi.shop_item_id WHERE oi.order_id=o.id),'[]'::json) AS order_lines
      FROM orders o LEFT JOIN users u ON u.id=o.user_id
      WHERE o.branch=$1 AND LOWER(TRIM(o.brand))=LOWER(TRIM($2)) ORDER BY o.created_at DESC LIMIT 100`,
      [req.websiteAccount.branch,req.websiteAccount.brand]);
    res.json(result.rows);
  } catch (err) { console.error("Website order history:",err); res.status(500).json({error:"Unable to load branch orders."}); }
});

router.post("/website-orders", websiteAccount, async (req, res) => {
  const account = req.websiteAccount;
  const {items, phone, address, client_request_id} = req.body;
  if (!Array.isArray(items) || !items.length || items.length > 100) return res.status(400).json({error:"Select between 1 and 100 supplies."});
  if (typeof phone !== "string" || !/^[+\d\s()-]{7,25}$/.test(phone.trim()) || phone.replace(/\D/g,"").length < 7) return res.status(400).json({error:"Enter a valid contact number."});
  if (typeof address !== "string" || address.trim().length < 5 || address.length > 1000) return res.status(400).json({error:"Enter the complete delivery address."});
  if (typeof client_request_id !== "string" || !/^[a-zA-Z0-9-]{16,100}$/.test(client_request_id)) return res.status(400).json({error:"Invalid checkout reference. Reopen checkout and try again."});
  const paymentMethod = req.body.payment_method == null ? "cod" : req.body.payment_method;
  if (!["cod","gcash"].includes(paymentMethod)) return res.status(400).json({error:"Choose Cash on Delivery or GCash."});
  const gcashRef = paymentMethod === "gcash" && typeof req.body.gcash_ref === "string" ? req.body.gcash_ref.trim() : null;
  if (paymentMethod === "gcash" && (!gcashRef || !/^[A-Za-z0-9-]{6,100}$/.test(gcashRef))) return res.status(400).json({error:"Enter a valid GCash transfer reference."});
  // Client references are recorded for manual review, never treated as proof of payment.
  const quantities = new Map();
  for (const item of items) {
    const id=String(item.shop_item_id || ""); const qty=Number(item.quantity);
    if (!/^\d+$/.test(id) || !Number.isSafeInteger(qty) || qty<1 || qty>1000000) return res.status(400).json({error:"Use a whole-number quantity between 1 and 1,000,000."});
    quantities.set(id,(quantities.get(id)||0)+qty);
    if(quantities.get(id)>1000000)return res.status(400).json({error:"Quantity exceeds the supported limit."});
  }
  const requested=[...quantities].sort((a,b)=>a[0].localeCompare(b[0]));
  const fingerprint=require("crypto").createHash("sha256").update(JSON.stringify({items:requested,phone:phone.trim(),address:address.trim(),payment_method:paymentMethod,gcash_ref:gcashRef})).digest("hex");
  let client;
  try {
    client=await pool.connect();
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1),hashtext($2))",[String(account.id),client_request_id]);
    const existing=await client.query("SELECT * FROM orders WHERE user_id=$1 AND website_request_id=$2",[account.id,client_request_id]);
    if(existing.rows.length){
      const order=existing.rows[0];
      await client.query("ROLLBACK");
      if(order.website_request_hash!==fingerprint)return res.status(409).json({error:"This checkout reference was already used. Start a new checkout."});
      return res.json({success:true,order,replayed:true});
    }
    const supplies=await client.query(WEBSITE_SUPPLY_SQL+" AND si.id=ANY($3::int[]) FOR SHARE OF si, i",[HEAD_OFFICE_BRANCH,account.brand,requested.map(([id])=>id)]);
    const lines=[];const needed=new Map();let totalCents=0;
    for(const [id,quantity] of requested){
      const supply=supplies.rows.find(row=>String(row.shop_item_id)===id);
      if(!supply)throw Object.assign(new Error("A selected supply is hidden, unavailable, or belongs to another brand."),{status:409});
      const factor=unitFactor(supply.unit,supply.stock_unit);
      if(factor===null)throw Object.assign(new Error(`${supply.name}: supply and stock units must match before ordering.`),{status:409});
      const cents=websitePriceCents(supply.price);
      const submitted=items.find(item=>String(item.shop_item_id)===id);
      if(submitted.price!=null && websitePriceCents(submitted.price)!==cents)throw Object.assign(new Error(`${supply.name}: the price changed. Refresh supplies and review checkout.`),{status:409});
      totalCents+=cents*quantity;
      if(!Number.isSafeInteger(totalCents))throw Object.assign(new Error("Order total exceeds the supported limit."),{status:400});
      needed.set(supply.ingredient_id,stockRound((needed.get(supply.ingredient_id)||0)+quantity*factor));
      lines.push({shop_item_id:id,quantity,price:cents/100,inventory_quantity:stockRound(quantity*factor),inventory_unit:supply.stock_unit,source_ingredient_id:supply.ingredient_id});
    }
    for(const [id,quantity] of needed){
      const available=await getAllocatableStock(client,id);
      if(quantity>available)throw Object.assign(new Error("A selected quantity exceeds available Head Office stock. Refresh supplies and adjust your order."),{status:409});
    }
    const result=await client.query(`INSERT INTO orders(user_id,phone,brand,branch,total_amount,status,address,order_source,website_request_id,website_request_hash,payment_method,gcash_ref)
      VALUES($1,$2,$3,$4,$5,'pending',$6,'website',$7,$8,$9,$10) RETURNING *`,[account.id,phone.trim(),account.brand,account.branch,totalCents/100,address.trim(),client_request_id,fingerprint,paymentMethod,gcashRef]);
    const order=result.rows[0];
    for(const line of lines)await client.query("INSERT INTO order_items(order_id,shop_item_id,quantity,price,inventory_quantity,inventory_unit,source_ingredient_id) VALUES($1,$2,$3,$4,$5,$6,$7)",[order.id,line.shop_item_id,line.quantity,line.price,line.inventory_quantity,line.inventory_unit,line.source_ingredient_id]);
    await client.query("COMMIT");
    res.status(201).json({success:true,order});
  }catch(err){if(client)await client.query("ROLLBACK");console.error("Website checkout:",err);res.status(err.status||500).json({error:err.status ? err.message : "Unable to place order. Retry this checkout to check whether it was saved."});}
  finally{client?.release();}
});

// Reuse the same transfer, notification and status-transition code as mobile.
router.put("/website-orders/:id/received", websiteAccount, (req,res) => {
  req.body={status:"received",performed_by:req.websiteAccount.name,performed_by_role:req.websiteAccount.role};
  req.verifiedWebsiteReceipt=true;
  return updateOrderStatus(req,res);
});


router.get("/orders", async (req, res) => {
  const { userId, branch, brand, role } = req.query;

  try {
    let where = "";
    const params = [];

    const HQ_ROLES = ["Super Admin", "Franchisee Operations Admin"];

    const RESTRICTED_ROLES = [
      "Admin",
      "SuperAdmin",
      "HQ",
      "Manager",
      "Franchisee",
      "Staff",
    ];

    const STAFF_ROLES = [...HQ_ROLES, ...RESTRICTED_ROLES];

    if (userId) {
      params.push(userId);
      where = `WHERE o.user_id = $${params.length}`;
    } else {
      if (!STAFF_ROLES.includes(role)) {
        return res.status(403).json({
          error: "userId or a valid staff role is required",
        });
      }

      const conditions = [];

      // Super Admin / Operations Admin:
      // may see all orders and optionally filter.
      if (HQ_ROLES.includes(role)) {
        if (branch) {
          params.push(branch);
          conditions.push(`o.branch = $${params.length}`);
        }

        if (brand) {
          params.push(brand);
          conditions.push(`o.brand = $${params.length}`);
        }
      } else {
        // Manager / Franchisee / Staff must be scoped.
        if (!branch || !brand) {
          return res.status(403).json({
            error: "Branch and brand are required for this role.",
          });
        }

        params.push(branch);
        conditions.push(`o.branch = $${params.length}`);

        params.push(brand);
        conditions.push(`o.brand = $${params.length}`);
      }

      if (conditions.length > 0) {
        where = `WHERE ${conditions.join(" AND ")}`;
      }
    }

    params.push(HEAD_OFFICE_BRANCH);
    const hoParam = `$${params.length}`;

    const result = await pool.query(
      `
        SELECT
          o.id,
          o.order_source,
          o.payment_method,
          o.gcash_ref,
          o.status,
          o.total_amount,
          o.created_at,
          o.received_at,
          o.phone,
          o.brand,
          o.branch,
          o.address,

          u.name AS user_name,

          CASE
            WHEN COUNT(oi.id) > 0 THEN
              json_agg(
                json_build_object(
                  'shop_item_id', oi.shop_item_id,
                  'name', si.name,
                  'qty', oi.quantity,
                  'price', oi.price,
                  'stock', COALESCE(i.stock, si.stock),
                  'unit', si.unit
                )
              ) FILTER (WHERE oi.id IS NOT NULL)

            ELSE
              CASE
                WHEN jsonb_typeof(o.items::jsonb) = 'array'
                  THEN o.items::jsonb::json
                ELSE '[]'::json
              END
          END AS items

        FROM orders o

        LEFT JOIN users u
          ON u.id = o.user_id

        LEFT JOIN order_items oi
          ON oi.order_id = o.id

        LEFT JOIN shop_items si
          ON si.id = oi.shop_item_id

        LEFT JOIN ingredients i
          ON i.id = si.ingredient_id
         AND i.branch = ${hoParam}

        ${where}

        GROUP BY
          o.id,
          u.name,
          o.address

        ORDER BY
          o.created_at DESC
      `,
      params,
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET /orders error:", err);

    res.status(500).json({
      error: "Failed to fetch orders",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

router.get("/orders/:id", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId is required" });
  try {
    const result = await pool.query(
      `
      SELECT o.id, o.order_source, o.payment_method, o.gcash_ref, o.status, o.total_amount, o.created_at, o.received_at, o.phone, o.brand, o.branch, o.address,
        o.user_id,
        u.name AS user_name,
        CASE WHEN COUNT(oi.id) > 0 THEN
          json_agg(json_build_object('name',si.name,'qty',oi.quantity,'price',oi.price,'unit',si.unit,'image_url',si.image_url)) FILTER (WHERE oi.id IS NOT NULL)
        ELSE
          CASE WHEN jsonb_typeof(o.items::jsonb) = 'array'
            THEN o.items::jsonb::json ELSE '[]'::json END
        END AS items
      FROM orders o
      LEFT JOIN users u ON u.id=o.user_id
      LEFT JOIN order_items oi ON oi.order_id=o.id
      LEFT JOIN shop_items si ON si.id=oi.shop_item_id
      WHERE o.id=$1
      GROUP BY o.id, u.name, o.address
    `,
      [req.params.id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Order not found" });

    const order = result.rows[0];

    // Owner can always view their own order. Otherwise, only staff roles may view it.
    if (String(order.user_id) !== String(userId)) {
      const requester = await pool.query("SELECT role FROM users WHERE id=$1", [
        userId,
      ]);
      const role = requester.rows[0]?.role;
      const STAFF_ROLES = ["Admin", "SuperAdmin", "HQ", "Manager"]; // adjust to your actual role names
      if (!STAFF_ROLES.includes(role)) {
        return res
          .status(403)
          .json({ error: "You don't have access to this order" });
      }
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

router.post("/orders", async (req, res) => {
  const client = await pool.connect();
  const { user_id, phone, brand, branch, items, total_amount, address } =
    req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    client.release();
    return res
      .status(400)
      .json({ error: "Order must contain at least one item" });
  }
  try {
    await client.query("BEGIN");
    const orderRes = await client.query(
      `INSERT INTO orders (user_id, phone, brand, branch, total_amount, status, address) VALUES ($1,$2,$3,$4,$5,'pending',$6) RETURNING *`,
      [user_id, phone, brand, branch, total_amount, address],
    );
    const order = orderRes.rows[0];
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, shop_item_id, quantity, price) VALUES ($1,$2,$3,$4)`,
        [order.id, item.shop_item_id, item.quantity, item.price],
      );
    }
    await client.query("COMMIT");
    res.json({ success: true, order });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Failed to create order" });
  } finally {
    client.release();
  }
});

async function updateOrderStatus(req, res) {
  const client = await pool.connect();
  try {
    let { status, performed_by, performed_by_role, latitude, longitude } =
      req.body;
    console.log("PUT /orders/:id body:", req.body);
    const validStatuses = [
      "pending",
      "accepted",
      "shipping",
      "received",
      "rejected",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    await client.query("BEGIN");

    const currentRes = await client.query(
      "SELECT * FROM orders WHERE id=$1 FOR UPDATE",
      [req.params.id],
    );
    if (currentRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Order not found" });
    }
    const currentOrder = currentRes.rows[0];
    if (currentOrder.order_source === "website") {
      const signedId=req.user?.id || req.session?.user?.id || req.session?.userId;
      if (!signedId) { await client.query("ROLLBACK"); return res.status(401).json({error:"Sign in to update website orders."}); }
      const verified=await client.query("SELECT * FROM users WHERE id=$1",[signedId]);
      const actor=verified.rows[0];
      const isHQ=["Super Admin","Franchisee Operations Admin"].includes(actor?.role);
      const isReceiver=["Franchisee","Manager"].includes(actor?.role) && actor.branch===currentOrder.branch && String(actor.brand).trim().toLowerCase()===String(currentOrder.brand).trim().toLowerCase();
      if ((status==="received" && !isReceiver) || (status!=="received" && !isHQ)) { await client.query("ROLLBACK"); return res.status(403).json({error:"Your account cannot perform this order action."}); }
      performed_by=actor.name; performed_by_role=actor.role;
      if(status==="received")req.websiteAccount=actor;
    }
    // Website receipt always comes from a verified signed-in branch account.
    if (req.verifiedWebsiteReceipt || (currentOrder.order_source === "website" && status === "received")) {
      const account = req.websiteAccount;
      if (!account || account.branch !== currentOrder.branch || String(account.brand).trim().toLowerCase() !== String(currentOrder.brand).trim().toLowerCase()) {
        await client.query("ROLLBACK");
        return res.status(403).json({error:"Sign in to the receiving branch and confirm delivery from Supply Orders."});
      }
    }
    const currentStatus = currentOrder.status;

    // ── Transition guard: no skipping steps, no going backwards ──
    const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowedNext.includes(status)) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        error: `Order is "${currentStatus}" — cannot move to "${status}".`,
      });
    }

    const HQ_ROLES = ["Franchisee Operations Admin", "Super Admin"];
    if (
      ["accepted", "shipping", "rejected"].includes(status) &&
      !HQ_ROLES.includes(performed_by_role)
    ) {
      await client.query("ROLLBACK");
      return res
        .status(403)
        .json({ error: "Only Head Office staff can perform this action." });
    }

    if (
      status === "received" &&
      !FRANCHISEE_ROLES.includes(performed_by_role)
    ) {
      await client.query("ROLLBACK");
      return res.status(403).json({
        error: "Only the receiving branch can mark an order as received.",
      });
    }

    if (status === "accepted") {
      const itemsRes = await client.query(
        `SELECT oi.shop_item_id, oi.quantity, oi.inventory_quantity, oi.inventory_unit, oi.source_ingredient_id, si.unit AS sale_unit, si.name AS item_name, si.shop,
                i.id AS ingredient_id, i.unit AS stock_unit, i.stock AS ingredient_stock, i.branch, i.brand, i.perishable
        FROM order_items oi
        JOIN shop_items si ON si.id = oi.shop_item_id
        LEFT JOIN ingredients i ON i.id = si.ingredient_id AND i.branch = $2
        WHERE oi.order_id = $1`,
        [req.params.id, HEAD_OFFICE_BRANCH],
      );

      const unlinked = itemsRes.rows.filter((r) => !r.ingredient_id);
      if (unlinked.length > 0) {
        await client.query("ROLLBACK");
        return res.status(409).json({
          error:
            "Some items are no longer linked to Stock Inventory and can't be fulfilled",
          items: unlinked.map((r) => r.item_name),
        });
      }

      for(const row of itemsRes.rows){
        row.requiredQuantity=Number(row.quantity);
        if(currentOrder.order_source==="website"){
          if(row.inventory_quantity!=null){
            if(String(row.source_ingredient_id)!==String(row.ingredient_id)||websiteUnit(row.inventory_unit)!==websiteUnit(row.stock_unit))
              throw Object.assign(new Error("A supply's inventory link or unit changed after checkout. Restore its original configuration before accepting."),{status:409});
            row.requiredQuantity=Number(row.inventory_quantity);
          }else if(websiteUnit(row.sale_unit)!==websiteUnit(row.stock_unit)){
            throw Object.assign(new Error("This older order has no unit conversion snapshot. Reject it and ask the branch to reorder."),{status:409});
          }
        }
      }
      const neededByIngredient = new Map();
      for (const row of itemsRes.rows) {
        neededByIngredient.set(
          row.ingredient_id,
          (neededByIngredient.get(row.ingredient_id) || 0) +
            row.requiredQuantity,
        );
      }

      const insufficient = [];
      for (const [ingredientId, needed] of neededByIngredient.entries()) {
        const row = itemsRes.rows.find((r) => r.ingredient_id === ingredientId);
        const available = await getAllocatableStock(client, ingredientId);
        if (available < needed) {
          insufficient.push({ name: row.item_name, needed, available });
        }
      }
      if (insufficient.length > 0) {
        await client.query("ROLLBACK");
        return res.status(409).json({
          error: "Insufficient stock to accept this order",
          insufficientItems: insufficient,
        });
      }

      const processed = new Set();
      for (const row of itemsRes.rows) {
        if (processed.has(row.ingredient_id)) continue;
        processed.add(row.ingredient_id);

        const qty = neededByIngredient.get(row.ingredient_id);
        const allocation = await allocateIngredientStock(
          client,
          row.ingredient_id,
          qty,
          { apply: true },
        );

        for (const b of allocation.allocations) {
          await client.query(
            `INSERT INTO order_stock_transfers
              (order_id, ingredient_id, source_batch_id, quantity, cost_per_unit, mfg_date, exp_date, supplier, source_unit)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
            [
              req.params.id,
              row.ingredient_id,
              b.batch_id,
              b.quantity,
              b.cost_per_unit,
              b.mfg_date,
              b.exp_date,
              b.supplier,
              row.stock_unit,
            ],
          );
        }

        await logActivity({
          action: "deduct",
          itemName: row.item_name,
          performedBy: performed_by || "System",
          details: {
            note: `-${qty} reserved for Order #${req.params.id}`,
            rotation_method: allocation.rotation_method,
            batches: allocation.allocations.map((b) => ({
              batch_number: b.batch_number,
              quantity: b.quantity,
            })),
          },
          req,
          branch: row.branch,
          module: "Stock Inventory",
          latitude,
          longitude,
          role: performed_by_role || "Unknown",
        });
      }
    }

    // If Head Office rejects an already accepted order, release the batches that
    // were reserved/deducted at acceptance so Stock Inventory stays accurate.
    if (status === "rejected" && currentStatus === "accepted") {
      const reserved = await client.query(
        `SELECT * FROM order_stock_transfers WHERE order_id=$1 AND applied=FALSE FOR UPDATE`,
        [req.params.id],
      );
      const touched = new Set();
      for (const t of reserved.rows) {
        await client.query(
          `UPDATE ingredient_batches SET stock=stock+$1, updated_at=NOW() WHERE id=$2`,
          [Number(t.quantity || 0), t.source_batch_id],
        );
        touched.add(t.ingredient_id);
      }
      await client.query(
        `DELETE FROM order_stock_transfers WHERE order_id=$1 AND applied=FALSE`,
        [req.params.id],
      );
      for (const ingredientId of touched) {
        await syncIngredientFromBatches(client, ingredientId);
      }
    }

    if (status === "received") {
      const transfersRes = await client.query(
        `SELECT t.*, i.name, i.brand, COALESCE(t.source_unit,i.unit) AS unit, i.perishable, i.min_stock,
                sb.lot_number, sb.ndc_code, sb.dosage_form, sb.strength,
                sb.storage_requirement, sb.controlled_substance,
                sb.tank_id, sb.grade, sb.octane_rating, sb.delivery_temp,
                sb.truck_id, sb.volume_correction
         FROM order_stock_transfers t
         JOIN ingredients i ON i.id = t.ingredient_id
         LEFT JOIN ingredient_batches sb ON sb.id = t.source_batch_id
         WHERE t.order_id = $1 AND t.applied = FALSE`,
        [req.params.id],
      );

      const touchedIngredientIds = new Set();

      // Serialize new-item creation and batch numbering across orders for one branch/brand.
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1),hashtext($2))",[String(currentOrder.brand),String(currentOrder.branch)]);
      for (const t of transfersRes.rows) {
        let destRes = await client.query(
          `SELECT * FROM ingredients WHERE LOWER(TRIM(name))=LOWER(TRIM($1)) AND LOWER(TRIM(brand))=LOWER(TRIM($2)) AND branch=$3 FOR UPDATE`,
          [t.name, t.brand, currentRes.rows[0].branch],
        );
        let dest;
        if (destRes.rows.length > 0) {
          if(destRes.rows.length!==1)throw Object.assign(new Error("Multiple destination items match this supply. Resolve the duplicate inventory records before receipt."),{status:409});
          dest = destRes.rows[0];
        } else {
          const created = await client.query(
            `INSERT INTO ingredients (name, branch, brand, unit, stock, min_stock, cost_per_unit, extra_fields, perishable)
             VALUES ($1,$2,$3,$4,0,$5,0,'{}'::jsonb,$6) RETURNING *`,
            [
              t.name,
              currentRes.rows[0].branch,
              t.brand,
              t.unit,
              Number(t.min_stock || 0),
              t.perishable,
            ],
          );
          dest = created.rows[0];
        }

        const destinationFactor=unitFactor(t.unit,dest.unit);
        if(destinationFactor===null)throw Object.assign(new Error("The receiving item's unit is incompatible with the source batch. Correct its unit before confirming receipt."),{status:409});
        const receivedQuantity=stockRound(Number(t.quantity)*destinationFactor);
        const receivedCost=Number(t.cost_per_unit)/destinationFactor;
        const countRes = await client.query(
          `SELECT
            (SELECT COUNT(*) FROM ingredient_batches WHERE ingredient_id=$1) +
            (SELECT COUNT(*) FROM ingredient_batch_delete_history WHERE ingredient_id=$1) AS total`,
          [dest.id],
        );
        const total = parseInt(countRes.rows[0].total) || 0;
        const letter = String.fromCharCode(65 + Math.floor(total / 999));
        const num = (total % 999) + 1;
        const batch_number = `${letter}${String(num).padStart(3, "0")}`;

        await client.query(
          `INSERT INTO ingredient_batches
            (ingredient_id, batch_number, stock, mfg_date, exp_date, supply_date, cost_per_unit, supplier, perishable, notes,
             lot_number, ndc_code, dosage_form, strength, storage_requirement, controlled_substance,
             tank_id, grade, octane_rating, delivery_temp, truck_id, volume_correction)
           VALUES ($1,$2,$3,$4,$5,NOW(),$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
          [
            dest.id,
            batch_number,
            receivedQuantity,
            t.mfg_date,
            t.exp_date,
            receivedCost,
            t.supplier || "Head Office Transfer",
            t.perishable,
            `Auto-transferred from Order #${req.params.id}`,
            t.lot_number || null,
            t.ndc_code || null,
            t.dosage_form || null,
            t.strength || null,
            t.storage_requirement || null,
            !!t.controlled_substance,
            t.tank_id || null,
            t.grade || null,
            t.octane_rating || null,
            t.delivery_temp == null ? null : Number(t.delivery_temp),
            t.truck_id || null,
            t.volume_correction == null ? null : Number(t.volume_correction),
          ],
        );

        await client.query(
          `UPDATE order_stock_transfers SET applied=TRUE WHERE id=$1`,
          [t.id],
        );
        touchedIngredientIds.add(dest.id);
      }

      for (const ingId of touchedIngredientIds) {
        await syncIngredientFromBatches(client, ingId);
      }
    }

    const result = await client.query(
      "UPDATE orders SET status=$1, received_at=CASE WHEN $1='received' THEN NOW() ELSE received_at END WHERE id=$2 RETURNING *",
      [status, req.params.id],
    );
    const order = result.rows[0];

    const ACTION_LABELS = {
      accepted: "accept",
      shipping: "ship",
      received: "receive",
      rejected: "reject",
    };
    await logActivity({
      action: ACTION_LABELS[status] || "update",
      itemName: `Order #${order.id}`,
      performedBy: performed_by || "System",
      details: { note: `Status changed to "${status}"` },
      req,
      branch: order.branch,
      module: "Orders",
      latitude,
      longitude,
      role: performed_by_role || "Unknown",
    });

    const statusLabels = {
      pending: "Order Placed",
      accepted: "Order Accepted",
      shipping: "Order Shipped",
      received: "Order Delivered",
      rejected: "Order Rejected",
    };

    if (order?.user_id) {
      await client.query(
        `INSERT INTO notifications (user_id, type, title, body) VALUES ($1,$2,$3,$4)`,
        [
          order.user_id,
          `order_${status}`,
          statusLabels[status] || "Order Update",
          `Your order #${order.id} is now ${status}.`,
        ],
      );
    }

    await client.query("COMMIT");

    try {
    if (order?.user_id) {
      const userRow = await pool.query(
        "SELECT push_token FROM users WHERE id=$1",
        [order.user_id],
      );
      const token = userRow.rows[0]?.push_token;
      if (token)
        await sendPushNotification(
          token,
          statusLabels[status] || "Order Update",
          `Your order #${req.params.id} is now ${status}.`,
        );
    }

    } catch (notificationError) { console.error("Order saved; push notification failed:", notificationError); }

    res.json({ success: true, order });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("PUT /orders/:id error:", err);
    res.status(err.status||500).json({ error: err.status?err.message:"Failed to update order status" });
  } finally {
    client.release();
  }
}
router.put("/orders/:id", updateOrderStatus);

router.get("/api/orders/counts", async (req, res) => {
  const { userId } = req.query;
  try {
    const toShip = await pool.query(
      "SELECT COUNT(*) FROM orders WHERE user_id=$1 AND status IN ('pending','accepted')",
      [userId],
    );
    const shipping = await pool.query(
      "SELECT COUNT(*) FROM orders WHERE user_id=$1 AND status='shipping'",
      [userId],
    );
    const received = await pool.query(
      "SELECT COUNT(*) FROM orders WHERE user_id=$1 AND status='received'",
      [userId],
    );
    res.json({
      toShip: parseInt(toShip.rows[0].count),
      shipping: parseInt(shipping.rows[0].count),
      received: parseInt(received.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order counts" });
  }
});

router.get("/orders-activity-log", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM users_activity_log
       WHERE module = $1
       ORDER BY created_at DESC
       LIMIT 300`,
      ["Orders"],
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /orders-activity-log error:", err);
    res.status(500).json({ error: "Failed to fetch orders activity log" });
  }
});

module.exports = router;
