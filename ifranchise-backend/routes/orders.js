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

// Only these roles may move an order into "received" — admin/HO side
// can ship it, but only the receiving branch confirms delivery.
const FRANCHISEE_ROLES = ["Franchisee", "Manager", "Staff"];

// Prefer relational order lines; legacy/demo imports store their item snapshot in orders.items.
router.get("/orders", async (req, res) => {
  const { userId, branch, brand, role } = req.query;
  try {
    let where = "";
    let params = [];

    if (userId) {
      // Existing behavior: customer-facing "my orders" lookup
      where = "WHERE o.user_id = $1";
      params = [userId];
    } else {
      // Full visibility: only these two roles may see every order, system-wide
      const HQ_ROLES = ["Super Admin", "Franchisee Operations Admin"];
      // Everyone else with staff access is locked to their own branch + brand
      const RESTRICTED_ROLES = [
        "Admin",
        "SuperAdmin",
        "HQ",
        "Manager",
        "Franchisee",
        "Staff",
      ];
      const STAFF_ROLES = [...HQ_ROLES, ...RESTRICTED_ROLES];

      if (!STAFF_ROLES.includes(role)) {
        return res
          .status(403)
          .json({ error: "userId or a valid staff role is required" });
      }
      const conditions = [];

      if (HQ_ROLES.includes(role)) {
        // HQ can optionally narrow the view, but nothing is required
        if (branch) {
          params.push(branch);
          conditions.push(`o.branch=$${params.length}`);
        }
        if (brand) {
          params.push(brand);
          conditions.push(`o.brand=$${params.length}`);
        }
      } else {
        // Every other role MUST be scoped — no branch/brand means no results,
        // never "everything," closing the loophole where omitting these
        // params silently granted system-wide visibility.
        if (!branch || !brand) {
          return res
            .status(403)
            .json({ error: "Branch and brand are required for this role." });
        }
        params.push(branch);
        conditions.push(`o.branch=$${params.length}`);
        params.push(brand);
        conditions.push(`o.brand=$${params.length}`);
      }

      if (conditions.length) where = "WHERE " + conditions.join(" AND ");
      // no branch/brand at all = every order in the system (e.g. HQ-wide view)
    }

    const result = await pool.query(
      `
  SELECT o.id, o.status, o.total_amount, o.created_at, o.received_at, o.phone, o.brand, o.branch, o.address,
    u.name AS user_name,
    CASE WHEN COUNT(oi.id) > 0 THEN
      json_agg(json_build_object(
        'shop_item_id', oi.shop_item_id,
        'name', si.name,
        'qty', oi.quantity,
        'price', oi.price,
        'stock', COALESCE(i.stock, si.stock),
        'unit', si.unit
      )) FILTER (WHERE oi.id IS NOT NULL)
    ELSE
      CASE WHEN jsonb_typeof(o.items::jsonb) = 'array'
        THEN o.items::jsonb::json ELSE '[]'::json END
    END AS items
  FROM orders o
  LEFT JOIN users u ON u.id=o.user_id
  LEFT JOIN order_items oi ON oi.order_id=o.id
  LEFT JOIN shop_items si ON si.id=oi.shop_item_id
  LEFT JOIN ingredients i ON i.id = si.ingredient_id
  ${where}
  GROUP BY o.id, u.name, o.address
  ORDER BY o.created_at DESC
`,
      params,
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.get("/orders/:id", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId is required" });
  try {
    const result = await pool.query(
      `
      SELECT o.id, o.status, o.total_amount, o.created_at, o.received_at, o.phone, o.brand, o.branch, o.address,
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

router.put("/orders/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const { status, performed_by, performed_by_role, latitude, longitude } =
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
    const currentStatus = currentRes.rows[0].status;

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
        `SELECT oi.shop_item_id, oi.quantity, si.name AS item_name, si.shop,
                si.ingredient_id, i.stock AS ingredient_stock, i.branch, i.brand, i.perishable
        FROM order_items oi
        JOIN shop_items si ON si.id = oi.shop_item_id
        LEFT JOIN ingredients i ON i.id = si.ingredient_id
        WHERE oi.order_id = $1`,
        [req.params.id],
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

      const neededByIngredient = new Map();
      for (const row of itemsRes.rows) {
        neededByIngredient.set(
          row.ingredient_id,
          (neededByIngredient.get(row.ingredient_id) || 0) +
            Number(row.quantity),
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
              (order_id, ingredient_id, source_batch_id, quantity, cost_per_unit, mfg_date, exp_date, supplier)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [
              req.params.id,
              row.ingredient_id,
              b.batch_id,
              b.quantity,
              b.cost_per_unit,
              b.mfg_date,
              b.exp_date,
              b.supplier,
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
        `SELECT t.*, i.name, i.brand, i.unit, i.perishable, i.min_stock,
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

      for (const t of transfersRes.rows) {
        let destRes = await client.query(
          `SELECT * FROM ingredients WHERE name=$1 AND brand=$2 AND branch=$3`,
          [t.name, t.brand, currentRes.rows[0].branch],
        );
        let dest;
        if (destRes.rows.length > 0) {
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
            t.quantity,
            t.mfg_date,
            t.exp_date,
            t.cost_per_unit,
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
      "UPDATE orders SET status=$1 WHERE id=$2 RETURNING *",
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
