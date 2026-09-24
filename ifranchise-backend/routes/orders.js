const express = require("express");
const router = express.Router();

const { authenticate, authorize } = require("../middleware/auth");
const {
  enforceInputScope,
  requireResourceScope,
  isGlobalScopeUser,
} = require("../middleware/resourceScope");

router.use(authenticate);

function enforceOrderListScope(req, res, next) {
  if (isGlobalScopeUser(req.user)) return next();

  if (!req.user.branch) {
    return res.status(403).json({
      error: "Your account has no branch scope assigned.",
    });
  }

  req.query.branch = req.user.branch;

  if (req.user.brand) {
    req.query.brand = req.user.brand;
  }

  if (req.user.role === "Franchisee") {
    req.query.userId = req.user.id;
  } else {
    delete req.query.userId;
  }

  next();
}

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

// ─────────────────────────────────────────────────────────────
// WEBSITE ACCOUNT
// ─────────────────────────────────────────────────────────────

async function websiteAccount(req, res, next) {
  try {
    const authenticatedId =
      req.user?.id || req.session?.user?.id || req.session?.userId;

    if (!authenticatedId) {
      return res.status(401).json({
        error: "Please sign in again to order supplies.",
      });
    }

    const result = await pool.query("SELECT * FROM users WHERE id=$1", [
      authenticatedId,
    ]);

    const account = result.rows[0];

    if (
      !account ||
      !["franchisee", "manager"].includes(
        String(account.role || "")
          .trim()
          .toLowerCase(),
      )
    ) {
      return res.status(403).json({
        error: "Supply ordering is available to franchisees and managers.",
      });
    }

    if (
      !account.brand ||
      !account.branch ||
      account.branch === HEAD_OFFICE_BRANCH
    ) {
      return res.status(403).json({
        error: "Your account must have an assigned brand and receiving branch.",
      });
    }

    req.websiteAccount = account;
    next();
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────
// UNIT HELPERS
// ─────────────────────────────────────────────────────────────

function websiteUnit(value) {
  const raw = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\./g, "");

  const aliases = {
    liters: "l",
    liter: "l",
    litres: "l",
    litre: "l",
    kilograms: "kg",
    kilogram: "kg",
    grams: "g",
    gram: "g",
    milliliters: "ml",
    milliliter: "ml",
    pieces: "pcs",
    piece: "pcs",
    pc: "pcs",
    bottles: "bottle",
    packs: "pack",
    boxes: "box",
    units: "unit",
  };

  return aliases[raw] || raw;
}

function unitFactor(from, to) {
  const a = websiteUnit(from);
  const b = websiteUnit(to);

  if (!a || !b) return null;
  if (a === b) return 1;

  const units = {
    l: ["volume", 1000],
    ml: ["volume", 1],
    kg: ["mass", 1000],
    g: ["mass", 1],
  };

  return units[a] && units[b] && units[a][0] === units[b][0]
    ? units[a][1] / units[b][1]
    : null;
}

const stockRound = (value) => Math.round(Number(value) * 1e6) / 1e6;

function websitePriceCents(value) {
  const number = Number(value);

  if (value == null || value === "" || !Number.isFinite(number) || number < 0) {
    throw new Error("Invalid supply price.");
  }

  const cents = Math.round(number * 100);

  if (!Number.isSafeInteger(cents)) {
    throw new Error("Supply price exceeds the supported limit.");
  }

  return cents;
}

const WEBSITE_SUPPLY_SQL = `
  SELECT
    si.id AS shop_item_id,
    si.name,
    si.price,
    si.unit,
    si.is_visible,
    si.ingredient_id,
    i.brand,
    i.branch,
    i.stock,
    i.name AS ingredient_name,
    i.unit AS stock_unit
  FROM shop_items si
  JOIN ingredients i
    ON i.id = si.ingredient_id
  WHERE i.branch=$1
    AND LOWER(TRIM(i.brand))=LOWER(TRIM($2))
    AND si.is_visible=TRUE
`;

// ─────────────────────────────────────────────────────────────
// WEBSITE ORDER SUPPLIES
// ─────────────────────────────────────────────────────────────

router.get("/website-order-supplies", websiteAccount, async (req, res) => {
  try {
    const { rows } = await pool.query(
      WEBSITE_SUPPLY_SQL + " ORDER BY si.name, si.id",
      [HEAD_OFFICE_BRANCH, req.websiteAccount.brand],
    );

    const local = await pool.query(
      `SELECT id, name, unit
         FROM ingredients
         WHERE branch=$1
           AND LOWER(TRIM(brand))=LOWER(TRIM($2))`,
      [req.websiteAccount.branch, req.websiteAccount.brand],
    );

    const supplies = await Promise.all(
      rows.map(async (row) => {
        const available =
          Number(await getAllocatableStock(pool, row.ingredient_id)) || 0;

        const factor = unitFactor(row.unit, row.stock_unit);
        const sameUnit = factor !== null;

        const validPrice =
          row.price != null &&
          row.price !== "" &&
          Number.isFinite(Number(row.price)) &&
          Number(row.price) >= 0;

        return {
          shop_item_id: row.shop_item_id,
          ingredient_id: row.ingredient_id,
          name: row.name,
          unit: row.unit,
          price: Number(row.price),

          stock: factor
            ? Math.max(0, Math.floor(stockRound(available / factor)))
            : 0,

          stock_unit: row.stock_unit,
          inventory_stock: Number(row.stock) || 0,
          inventory_per_order_unit: factor,
          brand: row.brand,

          orderable: sameUnit && validPrice,

          unavailable_reason: !sameUnit
            ? "San Juan must configure a compatible unit or an explicit package size before this item can be ordered."
            : !validPrice
              ? "Head Office must set a valid price."
              : "",

          branch_ingredient_ids: local.rows
            .filter(
              (item) =>
                String(item.name || "")
                  .trim()
                  .toLowerCase() ===
                  String(row.ingredient_name || row.name || "")
                    .trim()
                    .toLowerCase() &&
                unitFactor(item.unit, row.stock_unit) !== null,
            )
            .map((item) => item.id),
        };
      }),
    );

    res.json(supplies);
  } catch (err) {
    console.error("Website supplies:", err);

    res.status(500).json({
      error: "Unable to load Head Office supplies.",
    });
  }
});

// ─────────────────────────────────────────────────────────────
// WEBSITE REORDER PLAN
// ─────────────────────────────────────────────────────────────

router.get("/website-reorder-plan", websiteAccount, async (req, res) => {
  try {
    const account = req.websiteAccount;

    const result = await pool.query(
      `
        SELECT
          id,
          name,
          unit,
          stock,
          min_stock,
          reorder_level,
          target_stock
        FROM ingredients
        WHERE branch=$1
          AND LOWER(TRIM(brand))=LOWER(TRIM($2))
        ORDER BY name, id
        `,
      [account.branch, account.brand],
    );

    res.json(
      result.rows.map((item) => ({
        ...item,
        current_stock: Number(item.stock) || 0,

        reorder_level: Number(item.reorder_level ?? item.min_stock ?? 0),

        target_stock:
          item.target_stock == null ? null : Number(item.target_stock),

        low_stock:
          Number(item.stock) <=
          Number(item.reorder_level ?? item.min_stock ?? 0),
      })),
    );
  } catch (err) {
    console.error("Reorder plan:", err);

    res.status(500).json({
      error:
        "Unable to load reorder levels. Check that the Smart Reordering migration was installed.",
    });
  }
});

router.put("/website-reorder-plan/:id", websiteAccount, async (req, res) => {
  const { reorder_level, target_stock } = req.body;

  if (
    reorder_level == null ||
    target_stock == null ||
    reorder_level === "" ||
    target_stock === "" ||
    !Number.isFinite(Number(reorder_level)) ||
    !Number.isFinite(Number(target_stock)) ||
    Number(reorder_level) < 0 ||
    Number(target_stock) <= Number(reorder_level) ||
    Number(target_stock) > 1000000000
  ) {
    return res.status(400).json({
      error:
        "Use a non-negative reorder level and a target above the reorder level (maximum 1 billion).",
    });
  }

  try {
    const account = req.websiteAccount;

    const result = await pool.query(
      `
        UPDATE ingredients
        SET reorder_level=$1,
            target_stock=$2
        WHERE id=$3
          AND branch=$4
          AND LOWER(TRIM(brand))=LOWER(TRIM($5))
        RETURNING id
        `,
      [
        Number(reorder_level),
        Number(target_stock),
        req.params.id,
        account.branch,
        account.brand,
      ],
    );

    if (!result.rows.length) {
      return res.status(404).json({
        error: "Branch item not found.",
      });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({
      error: "Unable to save reorder levels.",
    });
  }
});

// ─────────────────────────────────────────────────────────────
// WEBSITE ORDER HISTORY
// ─────────────────────────────────────────────────────────────

router.get("/website-orders", websiteAccount, async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT
          o.*,
          u.name AS user_name,

          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'shop_item_id', oi.shop_item_id,
                  'name', si.name,
                  'quantity', oi.quantity,
                  'price', oi.price,
                  'unit', si.unit
                )
                ORDER BY oi.id
              )
              FROM order_items oi
              LEFT JOIN shop_items si
                ON si.id=oi.shop_item_id
              WHERE oi.order_id=o.id
            ),
            '[]'::json
          ) AS order_lines

        FROM orders o

        LEFT JOIN users u
          ON u.id=o.user_id

        WHERE o.branch=$1
          AND LOWER(TRIM(o.brand))=LOWER(TRIM($2))

        ORDER BY o.created_at DESC
        LIMIT 100
        `,
      [req.websiteAccount.branch, req.websiteAccount.brand],
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Website order history:", err);

    res.status(500).json({
      error: "Unable to load branch orders.",
    });
  }
});

// ─────────────────────────────────────────────────────────────
// WEBSITE CHECKOUT
// ─────────────────────────────────────────────────────────────

router.post("/website-orders", websiteAccount, async (req, res) => {
  const account = req.websiteAccount;

  const { items, phone, address, client_request_id } = req.body;

  if (!Array.isArray(items) || !items.length || items.length > 100) {
    return res.status(400).json({
      error: "Select between 1 and 100 supplies.",
    });
  }

  if (
    typeof phone !== "string" ||
    !/^[+\d\s()-]{7,25}$/.test(phone.trim()) ||
    phone.replace(/\D/g, "").length < 7
  ) {
    return res.status(400).json({
      error: "Enter a valid contact number.",
    });
  }

  if (
    typeof address !== "string" ||
    address.trim().length < 5 ||
    address.length > 1000
  ) {
    return res.status(400).json({
      error: "Enter the complete delivery address.",
    });
  }

  if (
    typeof client_request_id !== "string" ||
    !/^[a-zA-Z0-9-]{16,100}$/.test(client_request_id)
  ) {
    return res.status(400).json({
      error: "Invalid checkout reference. Reopen checkout and try again.",
    });
  }

  const paymentMethod =
    req.body.payment_method == null ? "cod" : req.body.payment_method;

  if (!["cod", "gcash"].includes(paymentMethod)) {
    return res.status(400).json({
      error: "Choose Cash on Delivery or GCash.",
    });
  }

  const gcashRef =
    paymentMethod === "gcash" && typeof req.body.gcash_ref === "string"
      ? req.body.gcash_ref.trim()
      : null;

  if (
    paymentMethod === "gcash" &&
    (!gcashRef || !/^[A-Za-z0-9-]{6,100}$/.test(gcashRef))
  ) {
    return res.status(400).json({
      error: "Enter a valid GCash transfer reference.",
    });
  }

  const quantities = new Map();

  for (const item of items) {
    const id = String(item.shop_item_id || "");
    const qty = Number(item.quantity);

    if (
      !/^\d+$/.test(id) ||
      !Number.isSafeInteger(qty) ||
      qty < 1 ||
      qty > 1000000
    ) {
      return res.status(400).json({
        error: "Use a whole-number quantity between 1 and 1,000,000.",
      });
    }

    quantities.set(id, (quantities.get(id) || 0) + qty);

    if (quantities.get(id) > 1000000) {
      return res.status(400).json({
        error: "Quantity exceeds the supported limit.",
      });
    }
  }

  const requested = [...quantities].sort((a, b) => a[0].localeCompare(b[0]));

  const fingerprint = require("crypto")
    .createHash("sha256")
    .update(
      JSON.stringify({
        items: requested,
        phone: phone.trim(),
        address: address.trim(),
        payment_method: paymentMethod,
        gcash_ref: gcashRef,
      }),
    )
    .digest("hex");

  let client;

  try {
    client = await pool.connect();

    await client.query("BEGIN");

    await client.query(
      `SELECT pg_advisory_xact_lock(
          hashtext($1),
          hashtext($2)
        )`,
      [String(account.id), client_request_id],
    );

    const existing = await client.query(
      `
        SELECT *
        FROM orders
        WHERE user_id=$1
          AND website_request_id=$2
        `,
      [account.id, client_request_id],
    );

    if (existing.rows.length) {
      const order = existing.rows[0];

      await client.query("ROLLBACK");

      if (order.website_request_hash !== fingerprint) {
        return res.status(409).json({
          error:
            "This checkout reference was already used. Start a new checkout.",
        });
      }

      return res.json({
        success: true,
        order,
        replayed: true,
      });
    }

    const supplies = await client.query(
      WEBSITE_SUPPLY_SQL + " AND si.id=ANY($3::int[]) FOR SHARE OF si, i",
      [HEAD_OFFICE_BRANCH, account.brand, requested.map(([id]) => id)],
    );

    const lines = [];
    const needed = new Map();
    let totalCents = 0;

    for (const [id, quantity] of requested) {
      const supply = supplies.rows.find(
        (row) => String(row.shop_item_id) === id,
      );

      if (!supply) {
        throw Object.assign(
          new Error(
            "A selected supply is hidden, unavailable, or belongs to another brand.",
          ),
          { status: 409 },
        );
      }

      const factor = unitFactor(supply.unit, supply.stock_unit);

      if (factor === null) {
        throw Object.assign(
          new Error(
            `${supply.name}: supply and stock units must match before ordering.`,
          ),
          { status: 409 },
        );
      }

      const cents = websitePriceCents(supply.price);

      const submitted = items.find((item) => String(item.shop_item_id) === id);

      if (
        submitted.price != null &&
        websitePriceCents(submitted.price) !== cents
      ) {
        throw Object.assign(
          new Error(
            `${supply.name}: the price changed. Refresh supplies and review checkout.`,
          ),
          { status: 409 },
        );
      }

      totalCents += cents * quantity;

      if (!Number.isSafeInteger(totalCents)) {
        throw Object.assign(
          new Error("Order total exceeds the supported limit."),
          { status: 400 },
        );
      }

      needed.set(
        supply.ingredient_id,
        stockRound((needed.get(supply.ingredient_id) || 0) + quantity * factor),
      );

      lines.push({
        shop_item_id: id,
        quantity,
        price: cents / 100,
        inventory_quantity: stockRound(quantity * factor),
        inventory_unit: supply.stock_unit,
        source_ingredient_id: supply.ingredient_id,
      });
    }

    for (const [id, quantity] of needed) {
      const available = await getAllocatableStock(client, id);

      if (quantity > available) {
        throw Object.assign(
          new Error(
            "A selected quantity exceeds available Head Office stock. Refresh supplies and adjust your order.",
          ),
          { status: 409 },
        );
      }
    }

    const result = await client.query(
      `
        INSERT INTO orders(
          user_id,
          phone,
          brand,
          branch,
          total_amount,
          status,
          address,
          order_source,
          website_request_id,
          website_request_hash,
          payment_method,
          gcash_ref
        )
        VALUES(
          $1,$2,$3,$4,$5,
          'pending',
          $6,
          'website',
          $7,$8,$9,$10
        )
        RETURNING *
        `,
      [
        account.id,
        phone.trim(),
        account.brand,
        account.branch,
        totalCents / 100,
        address.trim(),
        client_request_id,
        fingerprint,
        paymentMethod,
        gcashRef,
      ],
    );

    const order = result.rows[0];

    for (const line of lines) {
      await client.query(
        `
          INSERT INTO order_items(
            order_id,
            shop_item_id,
            quantity,
            price,
            inventory_quantity,
            inventory_unit,
            source_ingredient_id
          )
          VALUES($1,$2,$3,$4,$5,$6,$7)
          `,
        [
          order.id,
          line.shop_item_id,
          line.quantity,
          line.price,
          line.inventory_quantity,
          line.inventory_unit,
          line.source_ingredient_id,
        ],
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      order,
    });
  } catch (err) {
    if (client) {
      await client.query("ROLLBACK");
    }

    console.error("Website checkout:", err);

    res.status(err.status || 500).json({
      error: err.status
        ? err.message
        : "Unable to place order. Retry this checkout to check whether it was saved.",
    });
  } finally {
    client?.release();
  }
});

// ─────────────────────────────────────────────────────────────
// WEBSITE RECEIVE
// ─────────────────────────────────────────────────────────────

router.put("/website-orders/:id/received", websiteAccount, (req, res) => {
  req.body = {
    status: "received",
    performed_by: req.websiteAccount.name,
    performed_by_role: req.websiteAccount.role,
  };

  req.verifiedWebsiteReceipt = true;

  return updateOrderStatus(req, res);
});

// ─────────────────────────────────────────────────────────────
// GET ORDERS
// ─────────────────────────────────────────────────────────────

router.get(
  "/orders",
  authorize(
    "Super Admin",
    "Franchisee Operations Admin",
    "Sales Admin",
    "Manager",
    "Staff",
    "Franchisee",
  ),
  enforceOrderListScope,
  async (req, res) => {
    const { userId, branch, brand } = req.query;
    const role = req.user.role;

    try {
      let where = "";
      const params = [];

      const HQ_ROLES = [
        "Super Admin",
        "Franchisee Operations Admin",
        "Sales Admin",
      ];

      const RESTRICTED_ROLES = ["Manager", "Franchisee", "Staff"];

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
        details:
          process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },
);

router.get(
  "/orders/:id",
  authorize(
    "Super Admin",
    "Franchisee Operations Admin",
    "Sales Admin",
    "Manager",
    "Staff",
    "Franchisee",
  ),
  requireResourceScope({
    table: "orders",
    ownerColumn: "user_id",
    allowOwner: true,
  }),
  async (req, res) => {
    try {
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
          o.user_id,

          u.name AS user_name,

          CASE
            WHEN COUNT(oi.id) > 0 THEN
              json_agg(
                json_build_object(
                  'name', si.name,
                  'qty', oi.quantity,
                  'price', oi.price,
                  'unit', si.unit,
                  'image_url', si.image_url
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

        WHERE o.id = $1

        GROUP BY
          o.id,
          u.name,
          o.address
        `,
        [req.params.id],
      );

      if (!result.rows.length) {
        return res.status(404).json({
          error: "Order not found",
        });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error("GET /orders/:id error:", err);

      res.status(500).json({
        error: "Failed to fetch order",
      });
    }
  },
);

// ─────────────────────────────────────────────────────────────
// CREATE ORDER
// ─────────────────────────────────────────────────────────────

router.post(
  "/orders",
  authorize("Manager", "Staff", "Franchisee"),
  enforceInputScope(),
  async (req, res) => {
    const client = await pool.connect();

    const { phone, brand, branch, items, total_amount, address } = req.body;

    // Never trust a body-supplied user_id.
    // The authenticated account is authoritative.
    const user_id = req.user.id;

    if (!Array.isArray(items) || items.length === 0) {
      client.release();

      return res.status(400).json({
        error: "Order must contain at least one item",
      });
    }

    try {
      await client.query("BEGIN");

      const orderRes = await client.query(
        `
          INSERT INTO orders (
            user_id,
            phone,
            brand,
            branch,
            total_amount,
            status,
            address
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            'pending',
            $6
          )
          RETURNING *
          `,
        [user_id, phone, brand, branch, total_amount, address],
      );

      const order = orderRes.rows[0];

      for (const item of items) {
        await client.query(
          `
          INSERT INTO order_items (
            order_id,
            shop_item_id,
            quantity,
            price
          )
          VALUES ($1,$2,$3,$4)
          `,
          [order.id, item.shop_item_id, item.quantity, item.price],
        );
      }

      await client.query("COMMIT");

      res.json({
        success: true,
        order,
      });
    } catch (err) {
      await client.query("ROLLBACK");

      console.error("POST /orders error:", err);

      res.status(500).json({
        error: "Failed to create order",
      });
    } finally {
      client.release();
    }
  },
);

// ─────────────────────────────────────────────────────────────
// UPDATE ORDER STATUS
// ─────────────────────────────────────────────────────────────

async function updateOrderStatus(req, res) {
  const client = await pool.connect();

  try {
    let { status, latitude, longitude } = req.body;

    // Never trust performed_by or performed_by_role
    // from the frontend.
    let performed_by = req.user.name;
    let performed_by_role = req.user.role;

    const validStatuses = [
      "pending",
      "accepted",
      "shipping",
      "received",
      "rejected",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status value",
      });
    }

    await client.query("BEGIN");

    const currentRes = await client.query(
      `
        SELECT *
        FROM orders
        WHERE id=$1
        FOR UPDATE
        `,
      [req.params.id],
    );

    if (!currentRes.rows.length) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        error: "Order not found",
      });
    }

    const currentOrder = currentRes.rows[0];

    const currentStatus = currentOrder.status;

    // ─────────────────────────────────────────────────────────
    // ROLE / RESOURCE CHECK
    // ─────────────────────────────────────────────────────────

    const isHQ = [
      "Super Admin",
      "Franchisee Operations Admin",
      "Sales Admin",
    ].includes(req.user.role);

    const isReceiver =
      ["Franchisee", "Manager", "Staff"].includes(req.user.role) &&
      req.user.branch === currentOrder.branch &&
      String(req.user.brand || "")
        .trim()
        .toLowerCase() ===
        String(currentOrder.brand || "")
          .trim()
          .toLowerCase();

    // Head Office handles:
    // pending -> accepted
    // accepted -> shipping
    // pending/accepted -> rejected
    if (["accepted", "shipping", "rejected"].includes(status) && !isHQ) {
      await client.query("ROLLBACK");

      return res.status(403).json({
        error: "Only Head Office staff can perform this action.",
      });
    }

    // Only the branch receiving the
    // order can mark it received.
    if (status === "received" && !isReceiver) {
      await client.query("ROLLBACK");

      return res.status(403).json({
        error: "Only the receiving branch can mark an order as received.",
      });
    }

    // ─────────────────────────────────────────────────────────
    // STATE TRANSITION GUARD
    // ─────────────────────────────────────────────────────────

    const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];

    if (!allowedNext.includes(status)) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        error: `Order is "${currentStatus}" — cannot move to "${status}".`,
      });
    }

    // ─────────────────────────────────────────────────────────
    // ACCEPT ORDER
    // Reserve/deduct Head Office stock using FIFO/FEFO
    // ─────────────────────────────────────────────────────────

    if (status === "accepted") {
      const itemsRes = await client.query(
        `
          SELECT
            oi.shop_item_id,
            oi.quantity,
            oi.inventory_quantity,
            oi.inventory_unit,
            oi.source_ingredient_id,

            si.unit AS sale_unit,
            si.name AS item_name,
            si.shop,

            i.id AS ingredient_id,
            i.unit AS stock_unit,
            i.stock AS ingredient_stock,
            i.branch,
            i.brand,
            i.perishable

          FROM order_items oi

          JOIN shop_items si
            ON si.id =
               oi.shop_item_id

          LEFT JOIN ingredients i
            ON i.id =
               si.ingredient_id
           AND i.branch = $2

          WHERE oi.order_id = $1
          `,
        [req.params.id, HEAD_OFFICE_BRANCH],
      );

      // All ordered items must still
      // be linked to inventory.
      const unlinked = itemsRes.rows.filter((row) => !row.ingredient_id);

      if (unlinked.length) {
        await client.query("ROLLBACK");

        return res.status(409).json({
          error:
            "Some items are no longer linked to Stock Inventory and can't be fulfilled",

          items: unlinked.map((row) => row.item_name),
        });
      }

      // ───────────────────────────────────────────────────────
      // Calculate actual inventory quantity needed.
      //
      // Website orders preserve the inventory quantity/unit
      // that existed during checkout.
      // ───────────────────────────────────────────────────────

      const neededByIngredient = new Map();

      for (const row of itemsRes.rows) {
        let requiredQuantity = Number(row.quantity);

        if (currentOrder.order_source === "website") {
          if (row.inventory_quantity != null) {
            if (
              String(row.source_ingredient_id) !== String(row.ingredient_id) ||
              websiteUnit(row.inventory_unit) !== websiteUnit(row.stock_unit)
            ) {
              throw Object.assign(
                new Error(
                  "A supply's inventory link or unit changed after checkout. Restore its original configuration before accepting.",
                ),
                {
                  status: 409,
                },
              );
            }

            requiredQuantity = Number(row.inventory_quantity);
          } else if (
            websiteUnit(row.sale_unit) !== websiteUnit(row.stock_unit)
          ) {
            throw Object.assign(
              new Error(
                "This older order has no unit conversion snapshot. Reject it and ask the branch to reorder.",
              ),
              {
                status: 409,
              },
            );
          }
        }

        row.requiredQuantity = requiredQuantity;

        neededByIngredient.set(
          row.ingredient_id,
          (neededByIngredient.get(row.ingredient_id) || 0) + requiredQuantity,
        );
      }

      // ───────────────────────────────────────────────────────
      // Check stock BEFORE allocating.
      // ───────────────────────────────────────────────────────

      const insufficient = [];

      for (const [ingredientId, needed] of neededByIngredient.entries()) {
        const row = itemsRes.rows.find(
          (item) => item.ingredient_id === ingredientId,
        );

        const available = await getAllocatableStock(client, ingredientId);

        if (available < needed) {
          insufficient.push({
            name: row.item_name,
            needed,
            available,
          });
        }
      }

      if (insufficient.length) {
        await client.query("ROLLBACK");

        return res.status(409).json({
          error: "Insufficient stock to accept this order",

          insufficientItems: insufficient,
        });
      }

      // ───────────────────────────────────────────────────────
      // Allocate stock.
      // One allocation per ingredient even when multiple
      // order lines reference the same ingredient.
      // ───────────────────────────────────────────────────────

      const processed = new Set();

      for (const row of itemsRes.rows) {
        if (processed.has(row.ingredient_id)) {
          continue;
        }

        processed.add(row.ingredient_id);

        const qty = neededByIngredient.get(row.ingredient_id);

        const allocation = await allocateIngredientStock(
          client,
          row.ingredient_id,
          qty,
          {
            apply: true,
          },
        );

        // Save exactly which Head Office batches
        // were reserved for this order.
        for (const batch of allocation.allocations) {
          await client.query(
            `
            INSERT INTO order_stock_transfers (
              order_id,
              ingredient_id,
              source_batch_id,
              quantity,
              cost_per_unit,
              mfg_date,
              exp_date,
              supplier,
              source_unit
            )
            VALUES (
              $1,$2,$3,$4,$5,
              $6,$7,$8,$9
            )
            `,
            [
              req.params.id,
              row.ingredient_id,
              batch.batch_id,
              batch.quantity,
              batch.cost_per_unit,
              batch.mfg_date,
              batch.exp_date,
              batch.supplier,
              row.stock_unit,
            ],
          );
        }

        await logActivity({
          action: "deduct",

          itemName: row.item_name,

          performedBy: performed_by,

          details: {
            note: `-${qty} reserved for Order #${req.params.id}`,

            rotation_method: allocation.rotation_method,

            batches: allocation.allocations.map((batch) => ({
              batch_number: batch.batch_number,

              quantity: batch.quantity,
            })),
          },

          req,

          branch: row.branch,

          module: "Stock Inventory",

          latitude,
          longitude,

          role: performed_by_role,
        });
      }
    }

    // ─────────────────────────────────────────────────────────
    // REJECT AN ACCEPTED ORDER
    //
    // Return reserved batches to Head Office inventory.
    // ─────────────────────────────────────────────────────────

    if (status === "rejected" && currentStatus === "accepted") {
      const reserved = await client.query(
        `
          SELECT *
          FROM order_stock_transfers
          WHERE order_id=$1
            AND applied=FALSE
          FOR UPDATE
          `,
        [req.params.id],
      );

      const touched = new Set();

      for (const transfer of reserved.rows) {
        await client.query(
          `
          UPDATE ingredient_batches
          SET
            stock = stock + $1,
            updated_at = NOW()
          WHERE id=$2
          `,
          [Number(transfer.quantity || 0), transfer.source_batch_id],
        );

        touched.add(transfer.ingredient_id);
      }

      await client.query(
        `
        DELETE FROM order_stock_transfers
        WHERE order_id=$1
          AND applied=FALSE
        `,
        [req.params.id],
      );

      for (const ingredientId of touched) {
        await syncIngredientFromBatches(client, ingredientId);
      }
    }

    // ─────────────────────────────────────────────────────────
    // RECEIVE ORDER
    //
    // Transfer the reserved Head Office batches into the
    // receiving branch's Stock Inventory.
    // ─────────────────────────────────────────────────────────

    if (status === "received") {
      const transfersRes = await client.query(
        `
        SELECT
          t.*,
          i.name,
          i.brand,
          COALESCE(
            t.source_unit,
            i.unit
          ) AS unit,
          i.perishable,
          i.min_stock,

          sb.lot_number,
          sb.ndc_code,
          sb.dosage_form,
          sb.strength,
          sb.storage_requirement,
          sb.controlled_substance,
          sb.tank_id,
          sb.grade,
          sb.octane_rating,
          sb.delivery_temp,
          sb.truck_id,
          sb.volume_correction

        FROM order_stock_transfers t

        JOIN ingredients i
          ON i.id = t.ingredient_id

        LEFT JOIN ingredient_batches sb
          ON sb.id = t.source_batch_id

        WHERE t.order_id = $1
          AND t.applied = FALSE
        `,
        [req.params.id],
      );

      const touchedIngredientIds = new Set();

      // Prevent two received orders from simultaneously
      // creating duplicate destination inventory items.
      await client.query(
        `
        SELECT pg_advisory_xact_lock(
          hashtext($1),
          hashtext($2)
        )
        `,
        [String(currentOrder.brand), String(currentOrder.branch)],
      );

      for (const transfer of transfersRes.rows) {
        let destRes = await client.query(
          `
          SELECT *
          FROM ingredients
          WHERE LOWER(TRIM(name)) =
                LOWER(TRIM($1))
            AND LOWER(TRIM(brand)) =
                LOWER(TRIM($2))
            AND branch = $3
          FOR UPDATE
          `,
          [transfer.name, transfer.brand, currentOrder.branch],
        );

        let dest;

        if (destRes.rows.length > 0) {
          if (destRes.rows.length !== 1) {
            throw Object.assign(
              new Error(
                "Multiple destination items match this supply. Resolve the duplicate inventory records before receipt.",
              ),
              {
                status: 409,
              },
            );
          }

          dest = destRes.rows[0];
        } else {
          const created = await client.query(
            `
            INSERT INTO ingredients (
              name,
              branch,
              brand,
              unit,
              stock,
              min_stock,
              cost_per_unit,
              extra_fields,
              perishable
            )
            VALUES (
              $1,
              $2,
              $3,
              $4,
              0,
              $5,
              0,
              '{}'::jsonb,
              $6
            )
            RETURNING *
            `,
            [
              transfer.name,
              currentOrder.branch,
              transfer.brand,
              transfer.unit,
              Number(transfer.min_stock || 0),
              transfer.perishable,
            ],
          );

          dest = created.rows[0];
        }

        // ─────────────────────────────────────────────────────
        // Convert the transferred quantity into the
        // destination inventory unit.
        // ─────────────────────────────────────────────────────

        const destinationFactor = unitFactor(transfer.unit, dest.unit);

        if (destinationFactor === null) {
          throw Object.assign(
            new Error(
              "The receiving item's unit is incompatible with the source batch. Correct its unit before confirming receipt.",
            ),
            {
              status: 409,
            },
          );
        }

        const receivedQuantity = stockRound(
          Number(transfer.quantity) * destinationFactor,
        );

        const receivedCost = Number(transfer.cost_per_unit) / destinationFactor;

        // ─────────────────────────────────────────────────────
        // Generate the next destination batch number.
        // ─────────────────────────────────────────────────────

        const countRes = await client.query(
          `
          SELECT
            (
              SELECT COUNT(*)
              FROM ingredient_batches
              WHERE ingredient_id=$1
            )
            +
            (
              SELECT COUNT(*)
              FROM ingredient_batch_delete_history
              WHERE ingredient_id=$1
            ) AS total
          `,
          [dest.id],
        );

        const total = parseInt(countRes.rows[0].total, 10) || 0;

        const letter = String.fromCharCode(65 + Math.floor(total / 999));

        const num = (total % 999) + 1;

        const batch_number = `${letter}${String(num).padStart(3, "0")}`;

        // ─────────────────────────────────────────────────────
        // Add transferred batch to receiving branch.
        // ─────────────────────────────────────────────────────

        await client.query(
          `
          INSERT INTO ingredient_batches (
            ingredient_id,
            batch_number,
            stock,
            mfg_date,
            exp_date,
            supply_date,
            cost_per_unit,
            supplier,
            perishable,
            notes,

            lot_number,
            ndc_code,
            dosage_form,
            strength,
            storage_requirement,
            controlled_substance,

            tank_id,
            grade,
            octane_rating,
            delivery_temp,
            truck_id,
            volume_correction
          )
          VALUES (
            $1,$2,$3,$4,$5,
            NOW(),
            $6,$7,$8,$9,
            $10,$11,$12,$13,$14,$15,
            $16,$17,$18,$19,$20,$21
          )
          `,
          [
            dest.id,
            batch_number,
            receivedQuantity,
            transfer.mfg_date,
            transfer.exp_date,
            receivedCost,
            transfer.supplier || "Head Office Transfer",
            transfer.perishable,

            `Auto-transferred from Order #${req.params.id}`,

            transfer.lot_number || null,
            transfer.ndc_code || null,
            transfer.dosage_form || null,
            transfer.strength || null,
            transfer.storage_requirement || null,
            !!transfer.controlled_substance,

            transfer.tank_id || null,
            transfer.grade || null,
            transfer.octane_rating || null,

            transfer.delivery_temp == null
              ? null
              : Number(transfer.delivery_temp),

            transfer.truck_id || null,

            transfer.volume_correction == null
              ? null
              : Number(transfer.volume_correction),
          ],
        );

        // Mark this reserved transfer as received/applied.
        await client.query(
          `
          UPDATE order_stock_transfers
          SET applied = TRUE
          WHERE id = $1
          `,
          [transfer.id],
        );

        touchedIngredientIds.add(dest.id);
      }

      // Recalculate destination ingredient totals
      // from their batches.
      for (const ingredientId of touchedIngredientIds) {
        await syncIngredientFromBatches(client, ingredientId);

        // Keep product costing synchronized with inventory.
        try {
          await recomputeProductCosts(client, ingredientId);
        } catch (costError) {
          console.error(
            `Failed to recompute product cost for ingredient ${ingredientId}:`,
            costError,
          );
        }
      }
    }

    // ─────────────────────────────────────────────────────────
    // UPDATE ORDER STATUS
    // ─────────────────────────────────────────────────────────

    const result = await client.query(
      `
      UPDATE orders
      SET
        status = $1,

        received_at =
          CASE
            WHEN $1 = 'received'
              THEN NOW()
            ELSE received_at
          END

      WHERE id = $2

      RETURNING *
      `,
      [status, req.params.id],
    );

    const order = result.rows[0];

    // ─────────────────────────────────────────────────────────
    // ACTIVITY LOG
    // ─────────────────────────────────────────────────────────

    const ACTION_LABELS = {
      accepted: "accept",
      shipping: "ship",
      received: "receive",
      rejected: "reject",
    };

    await logActivity({
      action: ACTION_LABELS[status] || "update",

      itemName: `Order #${order.id}`,

      performedBy: performed_by,

      details: {
        note: `Status changed to "${status}"`,
      },

      req,

      branch: order.branch,

      module: "Orders",

      latitude,
      longitude,

      role: performed_by_role,
    });

    // ─────────────────────────────────────────────────────────
    // DATABASE NOTIFICATION
    // ─────────────────────────────────────────────────────────

    const statusLabels = {
      pending: "Order Placed",
      accepted: "Order Accepted",
      shipping: "Order Shipped",
      received: "Order Delivered",
      rejected: "Order Rejected",
    };

    if (order?.user_id) {
      await client.query(
        `
        INSERT INTO notifications (
          user_id,
          type,
          title,
          body
        )
        VALUES ($1,$2,$3,$4)
        `,
        [
          order.user_id,

          `order_${status}`,

          statusLabels[status] || "Order Update",

          `Your order #${order.id} is now ${status}.`,
        ],
      );
    }

    // Finish database transaction first.
    await client.query("COMMIT");

    // ─────────────────────────────────────────────────────────
    // PUSH NOTIFICATION
    //
    // Failure here must NOT make a successfully saved
    // order update look like it failed.
    // ─────────────────────────────────────────────────────────

    try {
      if (order?.user_id) {
        const userRow = await pool.query(
          `
          SELECT push_token
          FROM users
          WHERE id=$1
          `,
          [order.user_id],
        );

        const token = userRow.rows[0]?.push_token;

        if (token) {
          await sendPushNotification(
            token,

            statusLabels[status] || "Order Update",

            `Your order #${req.params.id} is now ${status}.`,
          );
        }
      }
    } catch (notificationError) {
      console.error(
        "Order saved; push notification failed:",
        notificationError,
      );
    }

    return res.json({
      success: true,
      order,
    });
  } catch (err) {
    // Rollback can fail if COMMIT already happened,
    // so keep it protected.
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Order rollback error:", rollbackError);
    }

    console.error("PUT /orders/:id error:", err);

    return res.status(err.status || 500).json({
      error: err.status ? err.message : "Failed to update order status",
    });
  } finally {
    client.release();
  }
}

// ─────────────────────────────────────────────────────────────
// STANDARD ORDER STATUS UPDATE
// ─────────────────────────────────────────────────────────────

router.put(
  "/orders/:id",
  authorize(
    "Super Admin",
    "Franchisee Operations Admin",
    "Sales Admin",
    "Manager",
    "Staff",
    "Franchisee",
  ),
  requireResourceScope({
    table: "orders",
    ownerColumn: "user_id",
    allowOwner: true,
  }),
  updateOrderStatus,
);

// ─────────────────────────────────────────────────────────────
// ORDER COUNTS
// ─────────────────────────────────────────────────────────────

router.get(
  "/api/orders/counts",
  authorize(
    "Super Admin",
    "Franchisee Operations Admin",
    "Sales Admin",
    "Manager",
    "Staff",
    "Franchisee",
  ),
  async (req, res) => {
    try {
      let targetUserId;

      // Franchisees can only request their own counts.
      if (req.user.role === "Franchisee") {
        targetUserId = req.user.id;
      } else {
        targetUserId = req.query.userId || req.user.id;
      }

      const toShip = await pool.query(
        `
        SELECT COUNT(*)
        FROM orders
        WHERE user_id=$1
          AND status IN (
            'pending',
            'accepted'
          )
        `,
        [targetUserId],
      );

      const shipping = await pool.query(
        `
        SELECT COUNT(*)
        FROM orders
        WHERE user_id=$1
          AND status='shipping'
        `,
        [targetUserId],
      );

      const received = await pool.query(
        `
        SELECT COUNT(*)
        FROM orders
        WHERE user_id=$1
          AND status='received'
        `,
        [targetUserId],
      );

      res.json({
        toShip: parseInt(toShip.rows[0].count, 10) || 0,

        shipping: parseInt(shipping.rows[0].count, 10) || 0,

        received: parseInt(received.rows[0].count, 10) || 0,
      });
    } catch (err) {
      console.error("GET /api/orders/counts error:", err);

      res.status(500).json({
        error: "Failed to fetch order counts",
      });
    }
  },
);

// ─────────────────────────────────────────────────────────────
// ORDERS ACTIVITY LOG
// ─────────────────────────────────────────────────────────────

router.get(
  "/orders-activity-log",
  authorize("Super Admin", "Franchisee Operations Admin", "Manager"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT *
        FROM users_activity_log
        WHERE module = $1
        ORDER BY created_at DESC
        LIMIT 300
        `,
        ["Orders"],
      );

      res.json(result.rows);
    } catch (err) {
      console.error("GET /orders-activity-log error:", err);

      res.status(500).json({
        error: "Failed to fetch orders activity log",
      });
    }
  },
);

module.exports = router;
