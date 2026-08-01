const express = require("express");
const router = express.Router();
const pool = require("../db");
const { sendPushNotification } = require("../utils/pushNotif");

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
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "accepted", "rejected", "disposed"];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: "Invalid status value" });

    if (status === "accepted") {
      const itemsRes = await pool.query(
        `SELECT si.id, si.name, si.stock, oi.quantity
         FROM order_items oi
         JOIN shop_items si ON si.id = oi.shop_item_id
         WHERE oi.order_id = $1`,
        [req.params.id]
      );
      const insufficient = itemsRes.rows.filter(r => Number(r.stock) < Number(r.quantity));
      if (insufficient.length > 0) {
        return res.status(409).json({
          error: "Insufficient stock to accept this order",
          insufficientItems: insufficient.map(r => ({
            name: r.name,
            needed: Number(r.quantity),
            available: Number(r.stock),
          })),
        });
      }
    }

    const result = await pool.query("UPDATE orders SET status=$1 WHERE id=$2 RETURNING *", [status, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Order not found" });

    const order = result.rows[0];
    if (order?.user_id) {
      const statusLabels = {
        pending:  "Order Placed",
        accepted: "Order Accepted",
        disposed: "Order Fulfilled",
        rejected: "Order Rejected",
      };
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, body) VALUES ($1,$2,$3,$4)`,
        [order.user_id, `order_${status}`, statusLabels[status] || "Order Update", `Your order #${order.id} is now ${status}.`]
      );
      const userRow = await pool.query("SELECT push_token FROM users WHERE id=$1", [order.user_id]);
      const token = userRow.rows[0]?.push_token;
      if (token) await sendPushNotification(token, statusLabels[status] || "Order Update", `Your order #${req.params.id} is now ${status}.`);
    }

    res.json({ success: true, order: result.rows[0] });
  } catch (err) {
    console.error("PUT /orders/:id error:", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

router.get("/api/orders/counts", async (req, res) => {
  const { userId } = req.query;
  try {
    const toShip   = await pool.query("SELECT COUNT(*) FROM orders WHERE user_id=$1 AND status='pending'", [userId]);
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

module.exports = router;