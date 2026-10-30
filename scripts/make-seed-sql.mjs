// Builds .seed/seed.sql from db/data/*.json for Cloudflare D1.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const read = (file) => JSON.parse(readFileSync(`db/data/${file}`, "utf8"));
const media = read("media.json");
const destinations = read("destinations.json");
const districts = read("districts.json");
const attractions = read("attractions.json");
const experiences = read("experiences.json");
const packages = read("packages.json");
const listings = read("listings.json");
const articles = read("articles.json");
const alerts = read("alerts.json");
const faqs = read("faqs.json");
const misc = read("misc.json");

const q = (value) => {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
};
const j = (value) => q(value == null ? null : JSON.stringify(value));
const img = (key) => (key && media[key] ? media[key].url : null);
const credit = (key) => (key && media[key] ? media[key].credit : null);
const creditUrl = (key) => (key && media[key] ? media[key].page : null);

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);

const lines = ["PRAGMA foreign_keys = ON;"];
const districtIds = new Map(districts.map((d) => [d.slug, `dist-${d.slug}`]));
const destIds = new Map(destinations.map((d) => [d.slug, d.id]));

// ---------------------------------------------------------------- districts
for (const d of districts) {
  lines.push(`INSERT OR REPLACE INTO districts
    (id, slug, name_en, name_bn, division, tagline, intro_en, lat, lon, best_season, daily_budget_bdt, transport, foods, tips, sources, verified_at)
    VALUES (${[
      q(districtIds.get(d.slug)),
      q(d.slug),
      q(d.nameEn),
      q(d.nameBn),
      q(d.division),
      q(d.tagline),
      q(d.intro),
      d.lat ?? "NULL",
      d.lon ?? "NULL",
      q(d.best),
      d.budget ?? "NULL",
      q(d.transport),
      j(d.foods ?? []),
      j(d.tips ?? []),
      j(d.sources ?? []),
      "NULL",
    ].join(", ")});`);
}

// -------------------------------------------------------------- destinations
for (const d of destinations) {
  lines.push(`INSERT OR REPLACE INTO destinations
    (id, slug, name_en, name_bn, district_id, region, category, summary_en, summary_bn, description_md, highlights, best_time, seasonal_note, lat, lon, hero_image, image_credit, image_credit_url, featured, verification, verified_at, sources)
    VALUES (${[
      q(d.id),
      q(d.slug),
      q(d.nameEn),
      q(d.nameBn),
      q(districtIds.get(d.district) ?? null),
      q(d.region),
      q(d.category),
      q(d.summaryEn),
      q(d.summaryBn),
      q(d.descriptionMd),
      j(d.highlights ?? []),
      q(d.bestTime),
      q(d.seasonalNote),
      d.lat ?? "NULL",
      d.lon ?? "NULL",
      q(img(d.image)),
      q(credit(d.image)),
      q(creditUrl(d.image)),
      d.featured ? 1 : 0,
      q(d.verification ?? "seed"),
      q(d.verifiedAt ?? null),
      j(d.sources ?? []),
    ].join(", ")});`);
}

// --------------------------------------------------------------- attractions
for (const a of attractions) {
  lines.push(`INSERT OR REPLACE INTO attractions
    (id, slug, name_en, name_bn, district_id, destination_id, category, description, fee_note, entry_fee_bdt, lat, lon, image, verified_at, sources)
    VALUES (${[
      q(a.id),
      q(a.slug),
      q(a.nameEn),
      q(a.nameBn),
      q(districtIds.get(a.district) ?? null),
      q(a.destination ? destIds.get(a.destination) ?? null : null),
      q(a.category),
      q(a.description),
      q(a.feeNote),
      a.entryFeeBdt ?? "NULL",
      a.lat ?? "NULL",
      a.lon ?? "NULL",
      q(img(a.image)),
      q(a.verifiedAt ?? null),
      j(a.sources ?? []),
    ].join(", ")});`);
}

// District highlights become lighter attraction records (skipping duplicates).
const existing = new Set(attractions.map((a) => `${a.district}:${a.nameEn}`));
for (const d of districts) {
  for (const [index, h] of (d.highlights ?? []).entries()) {
    if (existing.has(`${d.slug}:${h.name}`)) continue;
    const slug = `${d.slug}-${slugify(h.name)}`.slice(0, 90);
    const categoryMap = {
      heritage: "History & Heritage",
      nature: "Nature & Waterfalls",
      nature: "Nature & Waterfalls",
      museum: "History & Heritage",
      family: "Family Travel",
      culture: "Religious & Cultural",
      market: "Food & Culture",
      food: "Food & Culture",
      adventure: "Hills & Adventure",
      landmark: "History & Heritage",
    };
    lines.push(`INSERT OR IGNORE INTO attractions
      (id, slug, name_en, name_bn, district_id, destination_id, category, description, fee_note, lat, lon, image, sources)
      VALUES (${[
        q(`attr-${slug}`),
        q(slug),
        q(h.name),
        "NULL",
        q(districtIds.get(d.slug)),
        "NULL",
        q(categoryMap[h.kind] ?? "Nature & Waterfalls"),
        q(h.note),
        q("Entry fees and hours are not verified — confirm locally before travelling."),
        "NULL",
        "NULL",
        q(img("village-field")),
        "NULL",
      ].join(", ")});`);
  }
}

// -------------------------------------------------------------- experiences
for (const e of experiences) {
  lines.push(`INSERT OR REPLACE INTO experiences (id, slug, name_en, name_bn, summary, icon, image, sort)
    VALUES (${[q(e.id), q(e.slug), q(e.nameEn), q(e.nameBn), q(e.summary), q(e.icon), q(img(e.image)), e.sort ?? 0].join(", ")});`);
}

// ----------------------------------------------------------------- packages
for (const p of packages) {
  lines.push(`INSERT OR REPLACE INTO packages
    (id, slug, title, destination_id, summary, duration_days, price_from_bdt, price_note, group_size, includes, excludes, operator_name, operator_contact, operator_status, available_dates, image, status)
    VALUES (${[
      q(p.id),
      q(p.slug),
      q(p.title),
      q(p.destination ? destIds.get(p.destination) ?? null : null),
      q(p.summary),
      p.durationDays,
      p.priceFromBdt ?? "NULL",
      q(p.priceNote),
      q(p.groupSize),
      j(p.includes ?? []),
      j(p.excludes ?? []),
      q(p.operatorName ?? null),
      q(p.operatorContact ?? null),
      q(p.operatorStatus ?? "unverified"),
      j(p.availableDates ?? []),
      q(img(p.image)),
      q(p.status ?? "published"),
    ].join(", ")});`);
}

// ----------------------------------------------------------------- listings
for (const l of listings) {
  lines.push(`INSERT OR REPLACE INTO listings
    (id, slug, type, name, district_id, address, phone, website, description, price_note, verification, verified_at, booking_url)
    VALUES (${[
      q(l.id),
      q(l.slug),
      q(l.type),
      q(l.name),
      q(l.district ? districtIds.get(l.district) ?? null : null),
      q(l.address),
      q(l.phone),
      q(l.website),
      q(l.description),
      q(l.priceNote),
      q(l.verification ?? "unverified"),
      q(l.verifiedAt ?? null),
      q(l.bookingUrl ?? null),
    ].join(", ")});`);
}

// ----------------------------------------------------------------- articles
for (const a of articles) {
  lines.push(`INSERT OR REPLACE INTO articles
    (id, slug, type, title, title_bn, excerpt, body_md, category, tags, hero_image, author, destination_id, district_id, status, published_at, updated_at, reading_minutes)
    VALUES (${[
      q(a.id),
      q(a.slug),
      q(a.type ?? "guide"),
      q(a.title),
      q(a.titleBn ?? null),
      q(a.excerpt),
      q(a.bodyMd),
      q(a.category),
      j(a.tags ?? []),
      q(img(a.image)),
      q(a.author),
      q(a.destination ? destIds.get(a.destination) ?? null : null),
      q(a.district ? districtIds.get(a.district) ?? null : null),
      q("published"),
      q(a.publishedAt ?? null),
      q(a.publishedAt ?? new Date().toISOString()),
      a.readingMinutes ?? 5,
    ].join(", ")});`);
}

const categories = [...new Set(articles.map((a) => a.category))];
for (const name of categories) {
  lines.push(
    `INSERT OR IGNORE INTO article_categories (id, slug, name) VALUES (${q(`cat-${slugify(name)}`)}, ${q(slugify(name))}, ${q(name)});`,
  );
}

// ------------------------------------------------------------------- alerts
for (const a of alerts) {
  lines.push(`INSERT OR REPLACE INTO travel_alerts
    (id, title, body, severity, region, source_url, source_name, active)
    VALUES (${[q(a.id), q(a.title), q(a.body), q(a.severity), q(a.region), q(a.sourceUrl), q(a.sourceName), a.active ?? 1].join(", ")});`);
}

// --------------------------------------------------------------------- faqs
for (const f of faqs) {
  lines.push(`INSERT OR REPLACE INTO faqs (id, question, answer, category, sort)
    VALUES (${[q(f.id), q(f.question), q(f.answer), q(f.category), f.sort ?? 0].join(", ")});`);
}

// ------------------------------------------------------------- announcements
for (const a of misc.announcements) {
  lines.push(`INSERT OR REPLACE INTO announcements (id, message_en, message_bn, link, active, sort)
    VALUES (${[q(a.id), q(a.messageEn), q(a.messageBn), q(a.link), a.active ?? 1, a.sort ?? 0].join(", ")});`);
}

// ------------------------------------------------------------------ settings
for (const [key, value] of Object.entries(misc.settings)) {
  lines.push(`INSERT OR REPLACE INTO site_settings (key, value) VALUES (${q(key)}, ${q(value)});`);
}



mkdirSync(".seed", { recursive: true });
writeFileSync(".seed/seed.sql", lines.join("\n"));
console.log(
  `seed.sql written: ${districts.length} districts, ${destinations.length} destinations, ${attractions.length} curated attractions, ${experiences.length} experiences, ${packages.length} packages, ${listings.length} listings, ${articles.length} articles`,
);
