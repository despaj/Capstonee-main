const express = require("express");
const router = express.Router();
const pool = require("../db");
const { sendPushNotification } = require("../utils/pushNotif");
const { logActivity } = require("../utils/activityLogger");

// ── State machine ──────────────────────────────────────────────
const ALLOWED_TRANSITIONS = {
  pending:  ["accepted", "rejected"],
  accepted: ["shipping", "rejected"],
  shipping: ["received"],
  received: [],
  rejected: [],
};

// Only these roles may move an order into "received" — admin/HO side
// can ship it, but only the receiving branch confirms delivery.
const FRANCHISEE_ROLES = ["Franchisee", "Manager", "Staff"];

router.get("/orders", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.id, o.status, o.total_amount, o.created_at, o.phone, o.brand, o.branch, o.address,
        u.name AS user_name,
        COALESCE(json_agg(json_build_object('shop_item_id', oi.shop_item_id, 'name',si.name,'qty',oi.quantity,'price',oi.price,'stock',si.stock)) FILTER (WHERE oi.id IS NOT NULL),'[]') AS items
      FROM orders o
      LEFT JOIN users u ON u.id=o.user_id
      LEFT JOIN order_items oi ON oi.order_id=o.id
      LEFT JOIN shop_items si ON si.id=oi.shop_item_id
      GROUP BY o.id, u.name, o.address
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.id, o.status, o.total_amount, o.created_at, o.phone, o.brand, o.branch, o.address,
        u.name AS user_name,
        COALESCE(json_agg(json_build_object('name',si.name,'qty',oi.quantity,'price',oi.price,'unit',si.unit,'image_url',si.image_url)) FILTER (WHERE oi.id IS NOT NULL),'[]') AS items
      FROM orders o
      LEFT JOIN users u ON u.id=o.user_id
      LEFT JOIN order_items oi ON oi.order_id=o.id
      LEFT JOIN shop_items si ON si.id=oi.shop_item_id
      WHERE o.id=$1
      GROUP BY o.id, u.name, o.address
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Order not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

router.post("/orders", async (req, res) => {
  const client = await pool.connect();
  const { user_id, phone, brand, branch, items, total_amount, address } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    client.release();
    return res.status(400).json({ error: "Order must contain at least one item" });
  }
  try {
    await client.query("BEGIN");
    const orderRes = await client.query(
      `INSERT INTO orders (user_id, phone, brand, branch, total_amount, status, address) VALUES ($1,$2,$3,$4,$5,'pending',$6) RETURNING *`,
      [user_id, phone, brand, branch, total_amount, address]
    );
    const order = orderRes.rows[0];
    for (const item of items) {
      await client.query(`INSERT INTO order_items (order_id, shop_item_id, quantity, price) VALUES ($1,$2,$3,$4)`, [order.id, item.shop_item_id, item.quantity, item.price]);
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

router.put("/orders/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const { status, performed_by, performed_by_role, latitude, longitude } = req.body;
    console.log("PUT /orders/:id body:", req.body);
    const validStatuses = ["pending", "accepted", "shipping", "received", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    await client.query("BEGIN");

    const currentRes = await client.query("SELECT * FROM orders WHERE id=$1 FOR UPDATE", [req.params.id]);
    if (currentRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Order not found" });
    }
    const currentStatus = currentRes.rows[0].status;

    // ── Transition guard: no skipping steps, no going backwards ──
    const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowedNext.includes(status)) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        error: `Order is "${currentStatus}" — cannot move to "${status}".`,
      });
    }

    // ── "received" can only be confirmed by the receiving branch ──
    if (status === "received" && !FRANCHISEE_ROLES.includes(performed_by_role)) {
      await client.query("ROLLBACK");
      return res.status(403).json({ error: "Only the receiving branch can mark an order as received." });
    }

    if (status === "accepted") {
      const itemsRes = await client.query(
        `SELECT oi.shop_item_id, oi.quantity, si.name AS item_name, si.shop,
                si.ingredient_id, i.stock AS ingredient_stock, i.branch, i.brand, i.perishable
        FROM order_items oi
        JOIN shop_items si ON si.id = oi.shop_item_id
        LEFT JOIN ingredients i ON i.id = si.ingredient_id
        WHERE oi.order_id = $1`,
        [req.params.id]
      );

      const unlinked = itemsRes.rows.filter(r => !r.ingredient_id);
      if (unlinked.length > 0) {
        await client.query("ROLLBACK");
        return res.status(409).json({
          error: "Some items are no longer linked to Stock Inventory and can't be fulfilled",
          items: unlinked.map(r => r.item_name),
        });
      }

      const neededByIngredient = new Map();
      for (const row of itemsRes.rows) {
        neededByIngredient.set(
          row.ingredient_id,
          (neededByIngredient.get(row.ingredient_id) || 0) + Number(row.quantity)
        );
      }

      const insufficient = [];
      for (const row of itemsRes.rows) {
        const needed = neededByIngredient.get(row.ingredient_id);
        if (Number(row.ingredient_stock) < needed && !insufficient.some(i => i.name === row.item_name)) {
          insufficient.push({ name: row.item_name, needed, available: Number(row.ingredient_stock) });
        }
      }
      if (insufficient.length > 0) {
        await client.query("ROLLBACK");
        return res.status(409).json({
          error: "Insufficient stock to accept this order",
          insufficientItems: insufficient,
        });
      }

      // Deduct once per ingredient (not per shop_items row) so a shared
      // ingredient isn't double-deducted, using the same FIFO/FEFO batch
      // logic Stock Inventory uses elsewhere.
      const processed = new Set();
      for (const row of itemsRes.rows) {
        if (processed.has(row.ingredient_id)) continue;
        processed.add(row.ingredient_id);

        const qty = neededByIngredient.get(row.ingredient_id);
        const isFefo = (row.brand || "").toLowerCase().includes("ipharma") || !!row.perishable;

        const batchesRes = await client.query(
          `SELECT * FROM ingredient_batches WHERE ingredient_id=$1 AND stock > 0`,
          [row.ingredient_id]
        );
        const sortedBatches = [...batchesRes.rows].sort((a, b) => {
          if (isFefo) {
            const da = a.exp_date ? new Date(a.exp_date).getTime() : Infinity;
            const db = b.exp_date ? new Date(b.exp_date).getTime() : Infinity;
            return da - db;
          }
          const da = new Date(a.supply_date || a.mfg_date || a.created_at || 0).getTime();
          const db = new Date(b.supply_date || b.mfg_date || b.created_at || 0).getTime();
          return da - db;
        });

        const totalAvailable = sortedBatches.reduce((s, b) => s + Number(b.stock || 0), 0);
        if (totalAvailable < qty) {
          await client.query("ROLLBACK");
          return res.status(409).json({ error: `Insufficient batch stock for "${row.item_name}"` });
        }

        let remaining = qty;
        for (const b of sortedBatches) {
          if (remaining <= 0) break;
          const take = Math.min(remaining, Number(b.stock));
          await client.query(`UPDATE ingredient_batches SET stock = stock - $1, updated_at=NOW() WHERE id=$2`, [take, b.id]);
          remaining -= take;
        }

        const totals = await client.query(
          `SELECT COALESCE(SUM(stock),0) AS total_stock, MIN(exp_date) FILTER (WHERE exp_date IS NOT NULL) AS earliest_exp
           FROM ingredient_batches WHERE ingredient_id=$1`,
          [row.ingredient_id]
        );
        const { total_stock, earliest_exp } = totals.rows[0];

        await client.query(
          `UPDATE ingredients SET stock=$1, extra_fields=extra_fields || jsonb_build_object('exp_date',$2::text), updated_at=NOW() WHERE id=$3`,
          [total_stock, earliest_exp || null, row.ingredient_id]
        );

        await client.query(`UPDATE shop_items SET stock=$1 WHERE ingredient_id=$2`, [total_stock, row.ingredient_id]);

        await logActivity({
          action: "deduct",
          itemName: row.item_name,
          performedBy: performed_by || "System",
          details: { note: `-${qty} deducted for Order #${req.params.id}` },
          req,
          branch: row.branch,
          module: "Stock Inventory",
          latitude,
          longitude,
          role: performed_by_role || "Unknown",
        });
      }
    }

    const result = await client.query("UPDATE orders SET status=$1 WHERE id=$2 RETURNING *", [status, req.params.id]);
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
      pending:  "Order Placed",
      accepted: "Order Accepted",
      shipping: "Order Shipped",
      received: "Order Delivered",
      rejected: "Order Rejected",
    };

    if (order?.user_id) {
      await client.query(
        `INSERT INTO notifications (user_id, type, title, body) VALUES ($1,$2,$3,$4)`,
        [order.user_id, `order_${status}`, statusLabels[status] || "Order Update", `Your order #${order.id} is now ${status}.`]
      );
    }

    await client.query("COMMIT");

    if (order?.user_id) {
      const userRow = await pool.query("SELECT push_token FROM users WHERE id=$1", [order.user_id]);
      const token = userRow.rows[0]?.push_token;
      if (token) await sendPushNotification(token, statusLabels[status] || "Order Update", `Your order #${req.params.id} is now ${status}.`);
    }

    res.json({ success: true, order });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("PUT /orders/:id error:", err);
    res.status(500).json({ error: "Failed to update order status" });
  } finally {
    client.release();
  }
});

router.get("/api/orders/counts", async (req, res) => {
  const { userId } = req.query;
  try {
    // "To Ship" on the franchisee side covers both pending (awaiting HO
    // accept) and accepted (accepted, not yet shipped) — same visual state.
    const toShip   = await pool.query(
      "SELECT COUNT(*) FROM orders WHERE user_id=$1 AND status IN ('pending','accepted')", [userId]
    );
    const shipping = await pool.query("SELECT COUNT(*) FROM orders WHERE user_id=$1 AND status='shipping'", [userId]);
    const received = await pool.query("SELECT COUNT(*) FROM orders WHERE user_id=$1 AND status='received'", [userId]);
    res.json({
      toShip:   parseInt(toShip.rows[0].count),
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
      ["Orders"]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /orders-activity-log error:", err);
    res.status(500).json({ error: "Failed to fetch orders activity log" });
  }
});

module.exports = router;