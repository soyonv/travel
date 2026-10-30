// Fetches freely-licensed Bangladesh photography from Wikimedia Commons.
// Output: db/data/images.json with url, credit, license, and source page.
import { writeFileSync, mkdirSync } from "node:fs";

const TERMS = [
  ["cox-bazar", "Cox's Bazar beach Bangladesh"],
  ["sundarbans", "Sundarbans mangrove Bangladesh"],
  ["sylhet-tea", "Sylhet tea garden"],
  ["srimangal", "Srimangal tea plantation"],
  ["bandarban", "Bandarban hill Bangladesh"],
  ["sajek", "Sajek Valley"],
  ["rangamati", "Rangamati Kaptai lake"],
  ["kuakata", "Kuakata sea beach"],
  ["saint-martin", "Saint Martin Island Bangladesh"],
  ["old-dhaka", "Old Dhaka street"],
  ["paharpur", "Somapura Mahavihara Paharpur"],
  ["bagerhat", "Sixty Dome Mosque Bagerhat"],
  ["ahsan-manzil", "Ahsan Manzil Dhaka"],
  ["lalbagh", "Lalbagh Fort Dhaka"],
  ["jaflong", "Jaflong Sylhet"],
  ["ratargul", "Ratargul swamp forest"],
  ["tanguar-haor", "Tanguar Haor"],
  ["sonargaon", "Sonargaon Panam City"],
  ["mahasthangarh", "Mahasthangarh"],
  ["rangpur", "Rangpur Bangladesh"],
  ["padma", "Padma Bridge Bangladesh"],
  ["river-boat", "Bangladesh river boat"],
  ["village", "Bangladesh village rice field"],
  ["food", "Bangladeshi food biryani"],
  ["hilsa", "Hilsa fish Bangladesh"],
  ["chittagong", "Chittagong Bangladesh"],
  ["sundarbans-deer", "Spotted deer Sundarbans"],
  ["lawachara", "Lawachara National Park"],
  ["nilgiri", "Nilgiri Bandarban"],
  ["saint-martin-beach", "Saint Martin Bangladesh beach"],
  ["rickshaw", "Rickshaw Dhaka"],
  ["bogra", "Mahasthangarh Bogra"],
  ["sundarban-boat", "Sundarbans boat river"],
  ["tea-worker", "Tea plucking Bangladesh"],
  ["star-mosque", "Star Mosque Dhaka"],
  ["lalbagh-fort", "Lalbagh Fort"],
  ["buddhist-temple", "Buddhist temple Bangladesh"],
  ["sunset-beach", "Sunset Bay of Bengal"],
  ["hill-tract", "Chittagong Hill Tracts landscape"],
  ["haor", "Haor wetland Bangladesh"],
];

const API = "https://commons.wikimedia.org/w/api.php";

function stripHtml(value = "") {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function search(term) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: `filetype:bitmap ${term}`,
    gsrnamespace: "6",
    gsrlimit: "12",
    prop: "imageinfo",
    iiprop: "url|extmetadata|size|mime",
    iiurlwidth: "1800",
  });
  const res = await fetch(`${API}?${params}`, {
    headers: { "user-agent": "DiscoverBangladeshAI/1.0 (seed data; contact: dev@example.com)" },
  });
  if (!res.ok) throw new Error(`Commons ${res.status}`);
  const data = await res.json();
  const pages = Object.values(data?.query?.pages ?? {});
  const candidates = pages
    .map((page) => {
      const info = page.imageinfo?.[0];
      if (!info) return null;
      const meta = info.extmetadata ?? {};
      const license = stripHtml(meta.LicenseShortName?.value ?? "");
      const mime = info.mime ?? "";
      if (!/^image\/(jpeg|png|webp)$/.test(mime)) return null;
      if (info.width < 1100) return null;
      const allowed = /(CC0|CC BY|Public domain|PD|FAL)/i;
      if (!allowed.test(license)) return null;
      return {
        title: page.title.replace(/^File:/, ""),
        url: info.thumburl || info.url,
        page: info.descriptionurl,
        credit: stripHtml(meta.Artist?.value ?? "Wikimedia Commons contributor").slice(0, 90),
        license,
        width: info.thumbwidth ?? info.width,
        height: info.thumbheight ?? info.height,
      };
    })
    .filter(Boolean);
  return candidates;
}

const out = {};
for (const [key, term] of TERMS) {
  try {
    const results = await search(term);
    out[key] = results.slice(0, 4);
    console.log(key, "→", results.length, results[0]?.license ?? "");
  } catch (error) {
    console.error(key, "failed:", error.message);
    out[key] = [];
  }
  await new Promise((r) => setTimeout(r, 350));
}

mkdirSync("db/data", { recursive: true });
writeFileSync("db/data/images.json", JSON.stringify(out, null, 2));
console.log("written", Object.keys(out).length);
