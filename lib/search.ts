/**
 * Search helpers: transliteration-tolerant aliases for Bangladesh place names.
 * Keeps search forgiving without a fuzzy-search dependency.
 */
const ALIASES: Record<string, string> = {
  "cox bazar": "Cox's Bazar",
  coxbazar: "Cox's Bazar",
  "cox's bazar": "Cox's Bazar",
  coxsbazar: "Cox's Bazar",
  chattagong: "Chattogram",
  chittagong: "Chattogram",
  chitagong: "Chattogram",
  chottogram: "Chattogram",
  comilla: "Cumilla",
  cumilla: "Cumilla",
  barisal: "Barishal",
  bogra: "Bogura",
  jessore: "Jashore",
  jashore: "Jashore",
  jhenidah: "Jhenaidah",
  srimongol: "Srimangal",
  sreemangal: "Srimangal",
  srimongal: "Srimangal",
  sylhet: "Sylhet",
  silet: "Sylhet",
  sundarban: "Sundarbans",
  sundarbans: "Sundarbans",
  sunderbans: "Sundarbans",
  sunderban: "Sundarbans",
  "saint martin": "Saint Martin",
  "st martin": "Saint Martin",
  sentmartin: "Saint Martin",
  "saint martins": "Saint Martin",
  rangamati: "Rangamati",
  rangama: "Rangamati",
  bandorban: "Bandarban",
  bandarban: "Bandarban",
  khagrachari: "Khagrachhari",
  khagrachhari: "Khagrachhari",
  kuakata: "Kuakata",
  sajek: "Sajek",
  "sajek valley": "Sajek",
  paharpur: "Paharpur",
  pahadpur: "Paharpur",
  bagerhat: "Bagerhat",
  bagherhat: "Bagerhat",
  "old dhaka": "Old Dhaka",
  purandhaka: "Old Dhaka",
  "puran dhaka": "Old Dhaka",
  netrokona: "Netrokona",
  netrakona: "Netrokona",
  moulvibazar: "Moulvibazar",
  maulvibazar: "Moulvibazar",
  sunamganj: "Sunamganj",
  sunamgonj: "Sunamganj",
  habiganj: "Habiganj",
  hobiganj: "Habiganj",
  noakhali: "Noakhali",
  laxmipur: "Lakshmipur",
  lakshmipur: "Lakshmipur",
  jhalakathi: "Jhalokathi",
  pirojpur: "Pirojpur",
  patuakhali: "Patuakhali",
  satkhira: "Satkhira",
  satkira: "Satkhira",
  narayanganj: "Narayanganj",
  narayangonj: "Narayanganj",
  gazipur: "Gazipur",
  tangail: "Tangail",
  mymensingh: "Mymensingh",
  momenshahi: "Mymensingh",
  rajshahi: "Rajshahi",
  rangpur: "Rangpur",
  dinajpur: "Dinajpur",
  nilphamari: "Nilphamari",
  kurigram: "Kurigram",
  haor: "Tanguar Haor",
  hawor: "Tanguar Haor",
  "tanguar haor": "Tanguar Haor",
  mangroves: "Sundarbans",
  beach: "Beaches",
  tea: "Srimangal",
  "tea garden": "Srimangal",
  birishiri: "Birishiri",
  ratargul: "Ratargul",
  jaflong: "Jaflong",
  bisnakandi: "Bichnakandi",
  bichnakandi: "Bichnakandi",
  "lawachara": "Lawachara",
};

/** Bengali-script and English synonyms mapped to canonical English terms. */
const SYNONYMS: Record<string, string[]> = {
  "কক্সবাজার": ["Cox's Bazar"],
  সুন্দরবন: ["Sundarbans"],
  সিলেট: ["Sylhet"],
  শ্রীমঙ্গল: ["Srimangal"],
  বান্দরবান: ["Bandarban"],
  সাজেক: ["Sajek"],
  রাঙ্গামাটি: ["Rangamati"],
  কুয়াকাটা: ["Kuakata"],
  "সেন্ট মার্টিন": ["Saint Martin"],
  "পুরনো ঢাকা": ["Old Dhaka"],
  পাহাড়পুর: ["Paharpur"],
  বাগেরহাট: ["Bagerhat"],
  ঢাকা: ["Dhaka"],
  চট্টগ্রাম: ["Chattogram"],
  খুলনা: ["Khulna"],
  রাজশাহী: ["Rajshahi"],
  বরিশাল: ["Barishal"],
  রংপুর: ["Rangpur"],
  ময়মনসিংহ: ["Mymensingh"],
  "হোটেল": ["listing", "hotel"],
  "ট্রেন": ["train", "railway"],
  "বাজেট": ["budget"],
  "ভিসা": ["visa"],
  "নিরাপত্তা": ["safety"],
  "খাবার": ["food"],
};

export function normalizeQuery(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").toLowerCase();
}

/** Returns extra search terms to try when the literal query is not enough. */
export function expandQuery(raw: string): string[] {
  const normalized = normalizeQuery(raw);
  const terms = new Set<string>();
  if (ALIASES[normalized]) terms.add(ALIASES[normalized]);
  for (const word of normalized.split(" ")) {
    if (ALIASES[word]) terms.add(ALIASES[word]);
  }
  const bangla = raw.trim();
  if (SYNONYMS[bangla]) for (const term of SYNONYMS[bangla]) terms.add(term);
  for (const [key, values] of Object.entries(SYNONYMS)) {
    if (bangla.includes(key)) values.forEach((term) => terms.add(term));
  }
  terms.delete(raw.trim());
  return [...terms].slice(0, 3);
}

export const POPULAR_SEARCHES = [
  "Cox's Bazar",
  "Sundarbans",
  "Sajek",
  "Srimangal tea",
  "Old Dhaka food",
  "সিলেট",
  "কুয়াকাটা",
  "Sundarbans permit",
  "কম খরচে ভ্রমণ",
  "Saint Martin",
];

export const SUGGESTED_SEARCHES = [
  "Cox's Bazar",
  "Sundarbans",
  "Sajek",
  "Srimangal tea",
  "Old Dhaka food",
  "সিলেট",
  "কুয়াকাটা",
  "Sundarbans permit",
];
