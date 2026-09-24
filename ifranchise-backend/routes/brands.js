const express = require("express");
const router = express.Router();

const { authenticate, authorize } = require("../middleware/auth");
router.use(authenticate);
const pool = require("../db");
const { logActivity } = require("../utils/activityLogger");

router.get(
  "/brands",
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
      const brandsResult = await pool.query(
        "SELECT * FROM brands ORDER BY name",
      );
      const branchesResult = await pool.query(
        "SELECT * FROM branches ORDER BY name",
      );
      const brands = brandsResult.rows.map((brand) => ({
        ...brand,
        branches: branchesResult.rows.filter((br) => br.brand_id === brand.id),
      }));
      res.json(brands);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch brands" });
    }
  },
);

router.post(
  "/brands",
  authorize("Super Admin", "Franchisee Operations Admin"),
  async (req, res) => {
    try {
      const {
        name,
        region,
        contact_email,
        contact_phone,
        description,
        categories,
        performed_by,
        role,
        latitude,
        longitude,
        restored,
      } = req.body;
      if (!name?.trim())
        return res.status(400).json({ error: "Brand name is required" });
      const result = await pool.query(
        "INSERT INTO brands (name, region, contact_email, contact_phone, description, categories) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
        [
          name.trim(),
          region,
          contact_email,
          contact_phone,
          description,
          categories || [],
        ],
      );
      const brand = result.rows[0];

      await logActivity({
        action: restored ? "restore" : "create",
        itemName: brand.name,
        performedBy: performed_by || "System",
        details: {
          contact_email: brand.contact_email,
          contact_phone: brand.contact_phone,
          categories: brand.categories,
          ...(restored ? { note: "Restored from delete history" } : {}),
        },
        req,
        branch: brand.name,
        module: "Brand Management",
        latitude,
        longitude,
        role: role || "Unknown",
      });

      res.json({ success: true, brand });
    } catch (err) {
      if (err.code === "23505")
        return res.status(400).json({ error: "Brand already exists" });
      res.status(500).json({ error: "Failed to add brand" });
    }
  },
);

router.put(
  "/brands/:id",
  authorize("Super Admin", "Franchisee Operations Admin"),
  async (req, res) => {
    const {
      name,
      region,
      contact_email,
      contact_phone,
      description,
      categories,
      performed_by,
      role,
      latitude,
      longitude,
    } = req.body;
    try {
      const before = await pool.query("SELECT * FROM brands WHERE id=$1", [
        req.params.id,
      ]);
      const oldBrand = before.rows[0];

      const result = await pool.query(
        "UPDATE brands SET name=$1, region=$2, contact_email=$3, contact_phone=$4, description=$5, categories=$6 WHERE id=$7 RETURNING *",
        [
          name,
          region,
          contact_email,
          contact_phone,
          description,
          categories || [],
          req.params.id,
        ],
      );
      const brand = result.rows[0];

      await logActivity({
        action: "update",
        itemName: brand.name,
        performedBy: performed_by || "System",
        details: { from: oldBrand, to: brand },
        req,
        branch: brand.name,
        module: "Brand Management",
        latitude,
        longitude,
        role: role || "Unknown",
      });

      res.json({ success: true, brand });
    } catch (err) {
      res.status(500).json({ error: "Failed to update brand" });
    }
  },
);

router.delete(
  "/brands/:id",
  authorize("Super Admin", "Franchisee Operations Admin"),
  async (req, res) => {
    const { performed_by, role, latitude, longitude } = req.body || {};
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const existing = await client.query("SELECT * FROM brands WHERE id=$1", [
        req.params.id,
      ]);
      const brand = existing.rows[0];

      if (brand) {
        const branchRows = await client.query(
          "SELECT name FROM branches WHERE brand_id=$1",
          [brand.id],
        );
        const branchNames = branchRows.rows.map((r) => r.name);

        if (branchNames.length > 0) {
          await client.query(
            `DELETE FROM transactions WHERE branch IN (${branchNames.map((_, i) => `$${i + 1}`).join(",")})`,
            branchNames,
          );
          await client.query(
            `DELETE FROM inventory WHERE branch IN (${branchNames.map((_, i) => `$${i + 1}`).join(",")})`,
            branchNames,
          );
        }

        await client.query("DELETE FROM branches WHERE brand_id=$1", [
          brand.id,
        ]);
      }

      await client.query("DELETE FROM brands WHERE id=$1", [req.params.id]);
      await client.query("COMMIT");

      if (brand) {
        await logActivity({
          action: "delete",
          itemName: brand.name,
          performedBy: performed_by || "System",
          details: {
            contact_email: brand.contact_email,
            contact_phone: brand.contact_phone,
            note: "Cascaded: deleted associated branches, transactions, and inventory",
          },
          req,
          branch: brand.name,
          module: "Brand Management",
          latitude,
          longitude,
          role: role || "Unknown",
        });
      }

      res.json({ success: true });
    } catch (err) {
      await client.query("ROLLBACK");
      res.status(500).json({ error: "Failed to delete brand" });
    } finally {
      client.release();
    }
  },
);

router.get(
  "/branches",
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
      const result = await pool.query("SELECT * FROM branches ORDER BY name");
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch branches" });
    }
  },
);

router.post("/branches", authorize("Super Admin"), async (req, res) => {
  try {
    const {
      name,
      brand_id,
      region,
      manager,
      contact,
      address,
      concept,
      performed_by,
      role,
      latitude,
      longitude,
      restored,
    } = req.body;
    if (!name?.trim())
      return res.status(400).json({ error: "Branch name is required" });
    const result = await pool.query(
      "INSERT INTO branches (name, brand_id, region, manager, contact, address, concept) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
      [
        name.trim(),
        brand_id,
        region,
        manager,
        contact,
        address,
        concept || null,
      ],
    );
    const branch = result.rows[0];
    const brandRes = await pool.query("SELECT name FROM brands WHERE id=$1", [
      brand_id,
    ]);
    const brandName = brandRes.rows[0]?.name || null;

    await logActivity({
      action: restored ? "restore" : "create",
      itemName: branch.name,
      performedBy: performed_by || "System",
      details: {
        region: branch.region,
        manager: branch.manager,
        brand: brandName,
        ...(restored ? { note: "Restored from delete history" } : {}),
      },
      req,
      branch: brandName,
      module: "Brand Management",
      latitude,
      longitude,
      role: role || "Unknown",
    });

    res.json({ success: true, branch });
  } catch (err) {
    if (err.code === "23505")
      return res.status(400).json({ error: "Branch already exists" });
    res.status(500).json({ error: "Failed to add branch" });
  }
});

router.put("/branches/:id", authorize("Super Admin"), async (req, res) => {
  const {
    name,
    brand_id,
    region,
    manager,
    contact,
    address,
    role,
    concept,
    performed_by,
    latitude,
    longitude,
  } = req.body;
  try {
    const before = await pool.query("SELECT * FROM branches WHERE id=$1", [
      req.params.id,
    ]);
    const oldBranch = before.rows[0];

    const result = await pool.query(
      "UPDATE branches SET name=$1, brand_id=$2, region=$3, manager=$4, contact=$5, address=$6, concept=$7 WHERE id=$8 RETURNING *",
      [
        name,
        brand_id,
        region,
        manager,
        contact,
        address,
        concept || null,
        req.params.id,
      ],
    );
    const branch = result.rows[0];
    const brandRes = await pool.query("SELECT name FROM brands WHERE id=$1", [
      brand_id,
    ]);
    const brandName = brandRes.rows[0]?.name || null;

    await logActivity({
      action: "update",
      itemName: branch.name,
      performedBy: performed_by || "System",
      details: { from: oldBranch, to: branch },
      req,
      branch: brandName,
      module: "Brand Management",
      latitude,
      longitude,
      role: role || "Unknown",
    });

    res.json({ success: true, branch });
  } catch (err) {
    res
      .status(500)
      .json({ error: err.message, code: err.code, detail: err.detail });
  }
});

router.delete("/branches/:id", authorize("Super Admin"), async (req, res) => {
  const { performed_by, role, latitude, longitude } = req.body || {};
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existing = await client.query("SELECT * FROM branches WHERE id=$1", [
      req.params.id,
    ]);
    const branch = existing.rows[0];

    if (branch) {
      await client.query("DELETE FROM transactions WHERE branch=$1", [
        branch.name,
      ]);
      await client.query("DELETE FROM inventory WHERE branch=$1", [
        branch.name,
      ]);
    }

    await client.query("DELETE FROM branches WHERE id=$1", [req.params.id]);
    await client.query("COMMIT");

    if (branch) {
      const brandRes = await pool.query("SELECT name FROM brands WHERE id=$1", [
        branch.brand_id,
      ]);
      const brandName = brandRes.rows[0]?.name || null;
      await logActivity({
        action: "delete",
        itemName: branch.name,
        performedBy: performed_by || "System",
        details: {
          region: branch.region,
          manager: branch.manager,
          note: "Cascaded: deleted associated transactions and inventory",
        },
        req,
        branch: brandName,
        module: "Brand Management",
        latitude,
        longitude,
        role: role || "Unknown",
      });
    }

    res.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Failed to delete branch" });
  } finally {
    client.release();
  }
});

router.get(
  "/brand-delete-history",
  authorize("Super Admin", "Franchisee Operations Admin"),
  async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT * FROM brand_delete_history ORDER BY deleted_at DESC",
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch brand delete history" });
    }
  },
);

router.post(
  "/brand-delete-history",
  authorize("Super Admin"),
  async (req, res) => {
    try {
      const { type, name, brand_name, data } = req.body;
      await pool.query(
        "INSERT INTO brand_delete_history (type, name, brand_name, data) VALUES ($1,$2,$3,$4)",
        [type, name, brand_name || null, JSON.stringify(data)],
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to save brand delete history" });
    }
  },
);

router.delete(
  "/brand-delete-history/:id",
  authorize("Super Admin"),
  async (req, res) => {
    try {
      await pool.query("DELETE FROM brand_delete_history WHERE id=$1", [
        req.params.id,
      ]);
      res.json({ success: true });
    } catch (err) {
      res
        .status(500)
        .json({ error: "Failed to delete from brand delete history" });
    }
  },
);

router.get(
  "/brands-activity-log",
  authorize("Super Admin", "Franchisee Operations Admin"),
  async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT * FROM users_activity_log WHERE module = $1 ORDER BY created_at DESC",
        ["Brand Management"],
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch brand activity log" });
    }
  },
);

module.exports = router;
