/**
 * HTTP smoke test for the running dev server.
 * Usage: node .dev/smoke.mjs [baseUrl]
 */
const base = process.argv[2] ?? "http://127.0.0.1:3000";

const routes = [
  "/",
  "/destinations",
  "/destinations/coxs-bazar",
  "/districts",
  "/districts/dhaka",
  "/attractions",
  "/experiences",
  "/packages",
  "/packages/sundarbans-weekender",
  "/trip-planner",
  "/ai-travel-agent",
  "/budget-calculator",
  "/map",
  "/search?q=coxs",
  "/travel-guides",
  "/blog",
  "/about",
  "/contact",
  "/faq",
  "/privacy",
  "/terms",
  "/cookies",
  "/editorial-policy",
  "/responsible-tourism",
  "/affiliate-disclosure",
  "/partners",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/sitemap.xml",
  "/robots.txt",
  "/api/health",
  "/api/search?q=sylhet",
  "/this-page-does-not-exist",
  "/account",
  "/account/trips",
  "/admin",
];

const expect = {
  "/this-page-does-not-exist": 404,
  "/account": "redirect",
  "/account/trips": "redirect",
  "/admin": "redirect",
  "/sitemap.xml": 200,
  "/robots.txt": 200,
};

let failures = 0;
for (const route of routes) {
  let status = 0;
  let body = "";
  try {
    const res = await fetch(base + route, { redirect: "manual" });
    status = res.status;
    body = await res.text();
  } catch (error) {
    console.log(`FAIL ${route} — request error: ${error.message}`);
    failures += 1;
    continue;
  }
  const wanted = expect[route];
  // Next streams a 200 whose RSC payload carries NEXT_REDIRECT when a server
  // component redirects mid-stream; the browser navigates immediately.
  const redirected = status === 307 || status === 308 || /NEXT_REDIRECT|http-equiv="refresh"/i.test(body);
  const ok = wanted === "redirect" ? redirected : wanted ? status === wanted : status === 200;
  const errorMention = /Application error|digest:|Internal Server Error/i.test(body.replace(/NEXT_REDIRECT/g, ""));
  if (!ok || errorMention) {
    failures += 1;
    console.log(`FAIL ${route} — status ${status}${errorMention ? " (error content)" : ""}`);
  } else {
    console.log(`ok   ${route} ${status} ${body.length}b`);
  }
}

// Content assertions on the homepage.
const home = await (await fetch(base + "/")).text();
const checks = [
  ["hero headline", /Extraordinary<\/span>[\s\S]{0,80}Bangladesh/],
  ["featured destination link", /href="\/destinations\/coxs-bazar"/],
  ["districts section", /64/],
  ["BanglaVoyage AI", /BanglaVoyage AI/],
];
for (const [label, re] of checks) {
  if (re.test(home)) console.log(`ok   home: ${label}`);
  else {
    failures += 1;
    console.log(`FAIL home: ${label} missing`);
  }
}

const dest = await (await fetch(base + "/destinations/coxs-bazar")).text();
for (const [label, re] of [
  ["destination name", /Cox/],
  ["source link", /tourismboard\.gov\.bd|beautifulbangladesh\.gov\.bd|wikipedia\.org/],
  ["json-ld", /application\/ld\+json/],
]) {
  if (re.test(dest)) console.log(`ok   destination: ${label}`);
  else {
    failures += 1;
    console.log(`FAIL destination: ${label} missing`);
  }
}

const plan = await fetch(base + "/api/plan", {
  method: "POST",
  headers: { "content-type": "application/json", origin: base },
  body: JSON.stringify({ destinationSlug: "sylhet", days: 3, travelers: 2, budgetBdt: 20000, style: "standard" }),
});
const planBody = await plan.text();
if (plan.ok) console.log(`ok   /api/plan ${plan.status} ${planBody.slice(0, 120)}`);
else {
  failures += 1;
  console.log(`FAIL /api/plan ${plan.status} ${planBody.slice(0, 300)}`);
}

const csrf = await fetch(base + "/api/plan", {
  method: "POST",
  headers: { "content-type": "application/json", origin: "https://evil.example" },
  body: "{}",
});
if (csrf.status === 403) console.log("ok   /api/plan rejects foreign origin");
else {
  failures += 1;
  console.log(`FAIL /api/plan foreign origin returned ${csrf.status}: ${(await csrf.text()).slice(0, 300)}`);
}

console.log(failures === 0 ? "\nSMOKE: all checks passed" : `\nSMOKE: ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
