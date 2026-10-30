// Creates (or promotes) an admin account in local D1 by default.
// Usage:
//   npm run admin:create -- you@example.com "Your Name" [password]
//   npm run admin:create -- you@example.com "Your Name" --remote
import { pbkdf2Sync, randomBytes, randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const remote = args.includes("--remote");
const positional = args.filter((value) => !value.startsWith("--"));
const [email, name, providedPassword] = positional;

if (!email || !name) {
  console.error('Usage: npm run admin:create -- you@example.com "Your Name" [password] [--remote]');
  process.exit(1);
}

const password = providedPassword || randomBytes(12).toString("base64url");
const iterations = 120_000;
const salt = randomBytes(16);
const hash = pbkdf2Sync(password, salt, iterations, 32, "sha256");
const hashString = `pbkdf2$${iterations}$${salt.toString("base64")}$${hash.toString("base64")}`;
const id = randomUUID();
const q = (value) => `'${String(value).replace(/'/g, "''")}'`;

const sql = [
  `INSERT INTO users (id, email, password_hash, name, role, locale, created_at, updated_at)`,
  `VALUES (${q(id)}, ${q(email.toLowerCase())}, ${q(hashString)}, ${q(name)}, 'admin', 'en', datetime('now'), datetime('now'))`,
  `ON CONFLICT(email) DO UPDATE SET role = 'admin', password_hash = excluded.password_hash, updated_at = datetime('now');`,
].join("\n");

mkdirSync(".seed", { recursive: true });
writeFileSync(".seed/admin.sql", sql);

const result = spawnSync(
  "npx",
  ["wrangler", "d1", "execute", "DB", remote ? "--remote" : "--local", "--file=.seed/admin.sql", "-c", "wrangler.jsonc"],
  { stdio: "inherit" },
);

if (result.status !== 0) {
  console.error("Could not apply the admin SQL. Check the wrangler output above.");
  process.exit(result.status ?? 1);
}

console.log(`\nAdmin ready: ${email}`);
if (providedPassword) {
  console.log("Password: the one you supplied.");
} else {
  console.log(`Generated password (shown once): ${password}`);
  console.log("Sign in, then change it from the account page.");
}
console.log(`Target: ${remote ? "remote D1" : "local D1"} — delete .seed/admin.sql when you are done.`);
