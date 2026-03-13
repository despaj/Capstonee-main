import { getDB } from "./localDB";

export function insertUser(user) {
  const db = getDB();

  db.run(
    "INSERT INTO users (id, name, email, role, branch) VALUES (?, ?, ?, ?, ?)",
    [user.id, user.name, user.email, user.role, user.branch]
  );
}