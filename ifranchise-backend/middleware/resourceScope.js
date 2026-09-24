const pool = require("../db");

// These roles already have cross-branch visibility in the existing RBAC policy.
const GLOBAL_SCOPE_ROLES = new Set([
  "Super Admin",
  "Franchisee Operations Admin",
  "Sales Admin",
]);

function isGlobalScopeUser(user) {
  return !!user && GLOBAL_SCOPE_ROLES.has(user.role);
}

function sameValue(a, b) {
  if (a == null || a === "" || b == null || b === "") return true;
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

function requireUserScope(req, res, next) {
  if (isGlobalScopeUser(req.user)) return next();
  if (!req.user?.branch) {
    return res.status(403).json({ message: "Your account has no branch scope assigned." });
  }
  next();
}

function enforceInputScope({ branchField = "branch", brandField = "brand" } = {}) {
  return (req, res, next) => {
    if (isGlobalScopeUser(req.user)) return next();

    const userBranch = req.user?.branch;
    const userBrand = req.user?.brand;
    if (!userBranch) {
      return res.status(403).json({ message: "Your account has no branch scope assigned." });
    }

    const suppliedBranch = req.body?.[branchField];
    const suppliedBrand = req.body?.[brandField];

    if (suppliedBranch && !sameValue(suppliedBranch, userBranch)) {
      return res.status(403).json({ message: "You cannot write data for another branch." });
    }
    if (suppliedBrand && userBrand && !sameValue(suppliedBrand, userBrand)) {
      return res.status(403).json({ message: "You cannot write data for another brand." });
    }

    if (req.body && branchField) req.body[branchField] = userBranch;
    if (req.body && brandField && userBrand) req.body[brandField] = userBrand;
    next();
  };
}

function enforceQueryScope({ branchField = "branch", brandField = "brand" } = {}) {
  return (req, res, next) => {
    if (isGlobalScopeUser(req.user)) return next();

    const userBranch = req.user?.branch;
    const userBrand = req.user?.brand;
    if (!userBranch) {
      return res.status(403).json({ message: "Your account has no branch scope assigned." });
    }

    const suppliedBranch = req.query?.[branchField];
    const suppliedBrand = req.query?.[brandField];
    if (suppliedBranch && !sameValue(suppliedBranch, userBranch)) {
      return res.status(403).json({ message: "You cannot access another branch." });
    }
    if (suppliedBrand && userBrand && !sameValue(suppliedBrand, userBrand)) {
      return res.status(403).json({ message: "You cannot access another brand." });
    }

    req.query[branchField] = userBranch;
    if (brandField && userBrand) req.query[brandField] = userBrand;
    next();
  };
}

function requireResourceScope({
  table,
  idColumn = "id",
  branchColumn = "branch",
  brandColumn = "brand",
  ownerColumn = null,
  allowOwner = false,
}) {
  const allowedTables = new Set(["inventory", "ingredients", "shop_items", "transactions", "orders", "receipts"]);
  if (!allowedTables.has(table)) throw new Error(`Unsupported scoped table: ${table}`);

  return async (req, res, next) => {
    try {
      const columns = [idColumn];
      if (branchColumn) columns.push(branchColumn);
      if (brandColumn) columns.push(brandColumn);
      if (ownerColumn) columns.push(ownerColumn);

      const result = await pool.query(
        `SELECT ${columns.join(", ")} FROM ${table} WHERE ${idColumn}=$1`,
        [req.params.id],
      );
      if (!result.rows.length) return res.status(404).json({ message: "Resource not found" });

      const resource = result.rows[0];
      req.scopedResource = resource;

      if (isGlobalScopeUser(req.user)) return next();
      if (allowOwner && ownerColumn && String(resource[ownerColumn]) === String(req.user.id)) return next();

      if (!req.user?.branch || !sameValue(resource[branchColumn], req.user.branch)) {
        return res.status(403).json({ message: "You do not have access to this branch resource." });
      }
      if (brandColumn && req.user?.brand && !sameValue(resource[brandColumn], req.user.brand)) {
        return res.status(403).json({ message: "You do not have access to this brand resource." });
      }
      next();
    } catch (err) {
      console.error("Resource scope check failed:", err);
      res.status(500).json({ message: "Authorization check failed" });
    }
  };
}

module.exports = {
  isGlobalScopeUser,
  requireUserScope,
  enforceInputScope,
  enforceQueryScope,
  requireResourceScope,
};
