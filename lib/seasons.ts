export type SeasonGuide = {
  month: number;
  label: string;
  season: "Dry season" | "Hot season" | "Monsoon" | "Post-monsoon";
  weather: string;
  temperature: string;
  picks: { name: string; slug: string }[];
  note: string;
  caution: string | null;
};

export const SEASONS: SeasonGuide[] = [
  {
    month: 1,
    label: "January",
    season: "Dry season",
    weather: "Cool, dry and clear across most of the country. The most reliable month for long journeys.",
    temperature: "12–26°C",
    picks: [
      { name: "Sundarbans", slug: "sundarbans" },
      { name: "Cox's Bazar", slug: "coxs-bazar" },
      { name: "Bagerhat", slug: "bagerhat" },
    ],
    note: "Peak winter: book transport and rooms ahead, especially on weekends and holidays.",
    caution: "Dense fog can delay early flights and trains in the north.",
  },
  {
    month: 2,
    label: "February",
    season: "Dry season",
    weather: "Still cool and dry, with the best light of the year for photography.",
    temperature: "15–29°C",
    picks: [
      { name: "Srimangal", slug: "srimangal" },
      { name: "Bandarban", slug: "bandarban" },
      { name: "Paharpur", slug: "paharpur" },
    ],
    note: "A strong month for tea country and heritage sites before the heat builds.",
    caution: null,
  },
  {
    month: 3,
    label: "March",
    season: "Hot season",
    weather: "Warming quickly. Mornings and evenings remain comfortable; midday is hard.",
    temperature: "20–33°C",
    picks: [
      { name: "Rangamati", slug: "rangamati" },
      { name: "Kuakata", slug: "kuakata" },
      { name: "Old Dhaka", slug: "old-dhaka" },
    ],
    note: "Start early, take a long midday break and keep water with you.",
    caution: "Pre-monsoon storms can bring short, intense rain and wind.",
  },
  {
    month: 4,
    label: "April",
    season: "Hot season",
    weather: "Hot and humid with frequent afternoon thunderstorms (kalbaishakhi).",
    temperature: "24–35°C",
    picks: [
      { name: "Sylhet", slug: "sylhet" },
      { name: "Sajek Valley", slug: "sajek-valley" },
      { name: "Sundarbans", slug: "sundarbans" },
    ],
    note: "Many Bangladeshis travel for Eid and Bengali New Year — expect full hotels and buses.",
    caution: "Lightning during storms is a genuine risk; shelter indoors, not under trees.",
  },
  {
    month: 5,
    label: "May",
    season: "Hot season",
    weather: "The hottest stretch, breaking into the first monsoon rains late in the month.",
    temperature: "25–36°C",
    picks: [
      { name: "Srimangal", slug: "srimangal" },
      { name: "Bandarban", slug: "bandarban" },
      { name: "Cox's Bazar", slug: "coxs-bazar" },
    ],
    note: "Mango season peaks — Chapainawabganj and Rajshahi orchards are busy.",
    caution: "Heat exhaustion is a real risk; plan indoor or shaded activities at midday.",
  },
  {
    month: 6,
    label: "June",
    season: "Monsoon",
    weather: "Monsoon arrives properly. Waterfalls and wetlands fill, roads begin to flood.",
    temperature: "25–33°C",
    picks: [
      { name: "Ratargul & Sylhet", slug: "sylhet" },
      { name: "Tanguar Haor", slug: "sylhet" },
      { name: "Srimangal", slug: "srimangal" },
    ],
    note: "The Sundarbans is normally closed to tourists from about 1 June. Hill roads become unstable.",
    caution: "Confirm the current Sundarbans closure and hill-road conditions with officials before travelling.",
  },
  {
    month: 7,
    label: "July",
    season: "Monsoon",
    weather: "Heavy rain, high humidity, dramatic skies and full rivers.",
    temperature: "26–32°C",
    picks: [
      { name: "Tanguar Haor", slug: "sylhet" },
      { name: "Ratargul", slug: "sylhet" },
      { name: "Old Dhaka", slug: "old-dhaka" },
    ],
    note: "A good month for wetland and city travel; a poor month for long hill drives.",
    caution: "Flooding can cut roads with little warning. Build buffer days into any itinerary.",
  },
  {
    month: 8,
    label: "August",
    season: "Monsoon",
    weather: "Monsoon continues. Haors and rivers are at their fullest.",
    temperature: "26–32°C",
    picks: [
      { name: "Tanguar Haor", slug: "sylhet" },
      { name: "Srimangal", slug: "srimangal" },
      { name: "Old Dhaka", slug: "old-dhaka" },
    ],
    note: "Fewer visitors and lower prices, at the cost of schedule reliability.",
    caution: "The Sundarbans is usually still closed. Check before paying any operator.",
  },
  {
    month: 9,
    label: "September",
    season: "Monsoon",
    weather: "Rain eases. Rivers remain high and the countryside is at its greenest.",
    temperature: "25–32°C",
    picks: [
      { name: "Sylhet", slug: "sylhet" },
      { name: "Rangamati", slug: "rangamati" },
      { name: "Kuakata", slug: "kuakata" },
    ],
    note: "A good shoulder month if you can tolerate occasional downpours.",
    caution: null,
  },
  {
    month: 10,
    label: "October",
    season: "Post-monsoon",
    weather: "Clearing skies, calm water and comfortable temperatures returning.",
    temperature: "22–31°C",
    picks: [
      { name: "Sundarbans", slug: "sundarbans" },
      { name: "Bandarban", slug: "bandarban" },
      { name: "Old Dhaka", slug: "old-dhaka" },
    ],
    note: "Durga Puja brings remarkable displays in Dhaka's old neighbourhoods.",
    caution: null,
  },
  {
    month: 11,
    label: "November",
    season: "Dry season",
    weather: "Dry, clear and increasingly cool — arguably the best all-round travel month.",
    temperature: "18–29°C",
    picks: [
      { name: "Cox's Bazar", slug: "coxs-bazar" },
      { name: "Sajek Valley", slug: "sajek-valley" },
      { name: "Paharpur", slug: "paharpur" },
    ],
    note: "Sundarbans boating restarts in many zones; confirm permits and zone access.",
    caution: null,
  },
  {
    month: 12,
    label: "December",
    season: "Dry season",
    weather: "Cool mornings, clear skies and excellent conditions for everything except swimming.",
    temperature: "13–27°C",
    picks: [
      { name: "Kuakata", slug: "kuakata" },
      { name: "Bagerhat", slug: "bagerhat" },
      { name: "Srimangal", slug: "srimangal" },
    ],
    note: "Peak season for domestic tourism, especially around 16 December and the New Year.",
    caution: "Beach water is cold and currents remain dangerous despite calm weather.",
  },
];
