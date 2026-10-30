// Builds db/data/media.json: normalized 1600px Commons URLs plus attribution.
import { readFileSync, writeFileSync } from "node:fs";

const raw = JSON.parse(readFileSync("db/data/images.json", "utf8"));

const pick = {
  "coxs-bazar": ["cox-bazar", 0],
  sundarbans: ["sundarbans", 2],
  sylhet: ["sylhet-tea", 0],
  srimangal: ["srimangal", 0],
  bandarban: ["bandarban", 1],
  sajek: ["sajek", 1],
  rangamati: ["rangamati", 2],
  kuakata: ["kuakata", 0],
  "saint-martin": ["saint-martin-beach", 1],
  "old-dhaka": ["old-dhaka", 1],
  paharpur: ["paharpur", 0],
  bagerhat: ["bagerhat", 1],
  "tanguar-haor": ["tanguar-haor", 1],
  ratargul: ["ratargul", 0],
  jaflong: ["jaflong", 0],
  sonargaon: ["sonargaon", 0],
  mahasthangarh: ["mahasthangarh", 2],
  "padma-bridge": ["padma", 1],
  "river-boat": ["river-boat", 0],
  "village-field": ["village", 0],
  "food-kacchi": ["food", 0],
  hilsa: ["hilsa", 0],
  rickshaw: ["rickshaw", 1],
  lawachara: ["lawachara", 2],
  nilgiri: ["nilgiri", 0],
  "tea-worker": ["tea-worker", 0],
  "star-mosque": ["star-mosque", 0],
  lalbagh: ["lalbagh", 0],
  "ahsan-manzil": ["ahsan-manzil", 0],
  "buddha-dhatu": ["buddhist-temple", 3],
  "hill-path": ["hill-tract", 0],
  "sundarbans-deer": ["sundarbans-deer", 0],
  "sundarban-boat": ["sundarban-boat", 0],
  beach: ["cox-bazar", 1],
  "saint-martin-beach": ["saint-martin", 0],
  "tea-garden": ["sylhet-tea", 2],
  forest: ["lawachara", 2],
  heritage: ["bagerhat", 3],
  hills: ["bandarban", 2],
  river: ["river-boat", 3],
  food: ["food", 2],
  culture: ["old-dhaka", 2],
  "mahasthangarh-alt": ["mahasthangarh", 3],
};

function normalize(url) {
  const clean = url.split("?")[0].replace("thumb.wikimedia.org", "upload.wikimedia.org");
  return {
    url: clean.replace(/\/(\d+)px-/, "/1280px-"),
    large: clean.replace(/\/(\d+)px-/, "/1920px-"),
  };
}

const media = {};
for (const [key, [source, index]] of Object.entries(pick)) {
  const entry = raw?.[source]?.[index];
  if (!entry) {
    console.warn("missing", key);
    continue;
  }
  const normalized = normalize(entry.url);
  media[key] = {
    url: normalized.url,
    large: normalized.large,
    credit: entry.credit,
    license: entry.license,
    page: entry.page,
    title: entry.title,
  };
}

writeFileSync("db/data/media.json", JSON.stringify(media, null, 2));
console.log("media entries:", Object.keys(media).length);
