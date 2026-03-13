import initSqlJs from "sql.js";

let db;

export async function initDB() {
  const SQL = await initSqlJs({
    locateFile: (file) => `${process.env.PUBLIC_URL}/${file}`,
  });

  db = new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      role TEXT,
      branch TEXT,
      password_hash TEXT
    );
  `);

  console.log("Local SQLite ready ✅");
}

export function getDB() {
  if (!db) throw new Error("DB not initialized yet.");
  return db;
}

// Called after successful online login to cache the user
export function cacheUser(user, passwordHash) {
  const database = getDB();
  database.run(
    `INSERT INTO users (id, name, email, role, branch, password_hash)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET
       name=excluded.name,
       role=excluded.role,
       branch=excluded.branch,
       password_hash=excluded.password_hash`,
    [user.id, user.name, user.email, user.role, user.branch || "", passwordHash]
  );
}

// Called during offline login
export function findUserOffline(email, passwordHash) {
  const database = getDB();
  const result = database.exec(
    "SELECT id, name, email, role, branch FROM users WHERE email = ? AND password_hash = ?",
    [email, passwordHash]
  );

  if (result.length === 0 || result[0].values.length === 0) return null;

  const [id, name, userEmail, role, branch] = result[0].values[0];
  return { id, name, email: userEmail, role, branch };
}