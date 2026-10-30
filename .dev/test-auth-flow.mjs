// Exercises the progressive-enhancement login form and protected routes.
const BASE = "http://127.0.0.1:3000";
const jar = new Map();

const decode = (value) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const cookieHeader = () => [...jar.entries()].map(([key, value]) => `${key}=${value}`).join("; ");

const saveCookies = (response) => {
  const raw = response.headers.getSetCookie?.() ?? [];
  for (const cookie of raw) {
    const [pair] = cookie.split(";");
    const index = pair.indexOf("=");
    jar.set(pair.slice(0, index), pair.slice(index + 1));
  }
};

const get = async (path, redirect = "manual") => {
  const response = await fetch(BASE + path, { redirect, headers: { cookie: cookieHeader() } });
  saveCookies(response);
  return response;
};

const page = await get("/login");
const html = await page.text();
const formStart = html.indexOf('<form class="space-y-3"');
const formEnd = html.indexOf("</form>", formStart);
const formHtml = html.slice(formStart, formEnd);

const fields = new Map();
const inputPattern = /<input\b[^>]*>/g;
let match;
while ((match = inputPattern.exec(formHtml)) !== null) {
  const tag = match[0];
  const name = /name="([^"]*)"/.exec(tag)?.[1];
  if (!name) continue;
  const value = /value="([^"]*)"/.exec(tag)?.[1] ?? "";
  fields.set(decode(name), decode(value));
}
console.log("hidden fields:", [...fields.keys()]);

fields.set("email", "test-admin@example.com");
fields.set("password", "TestPassword123");

const form = new FormData();
for (const [key, value] of fields) form.set(key, value);
const login = await fetch(BASE + "/login", {
  method: "POST",
  headers: { cookie: cookieHeader() },
  body: form,
  redirect: "manual",
});
saveCookies(login);
const loginHtml = await login.text();
console.log("login status:", login.status, "location:", login.headers.get("location"));
const errorMatch = /(do not match|Too many|Enter your|unavailable|Something went wrong|could not start)/i.exec(loginHtml);
console.log("login message:", errorMatch?.[0] ?? "none");
console.log("session cookie:", jar.has("db_session"));

const account = await get("/account");
console.log("account:", account.status, (await account.text()).includes("Test Admin") ? "renders user" : "user missing");

const admin = await get("/admin");
console.log("admin:", admin.status, (await admin.text()).includes("Content counts") ? "dashboard renders" : "no dashboard");

const adminDest = await get("/admin/destinations");
console.log("admin destinations:", adminDest.status);

const trips = await get("/account/trips");
console.log("account trips:", trips.status);

const exported = await fetch(BASE + "/api/account/export", { headers: { cookie: cookieHeader() } });
console.log("export:", exported.status, exported.headers.get("content-type"));
