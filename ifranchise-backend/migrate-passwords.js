require("dotenv").config();
const pool = require("./db");
const bcrypt = require("bcrypt");

function isBcryptHash(str) {
  return typeof str === "string" && /^\$2[aby]\$\d{2}\$/.test(str);
}

async function migratePasswords() {
  const result = await pool.query("SELECT id, password FROM users");

  for (const row of result.rows) {
    if (isBcryptHash(row.password)) {
      console.log(`Skipping user ${row.id} — already hashed`);
      continue;
    }

    const hashed = await bcrypt.hash(row.password, 10);
    await pool.query("UPDATE users SET password=$1 WHERE id=$2", [
      hashed,
      row.id,
    ]);
    console.log(`Rehashed password for user ${row.id}`);
  }

  console.log("Migration complete.");
  process.exit(0);
}

migratePasswords().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
