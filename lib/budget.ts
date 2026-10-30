/**
 * Cost model for Bangladesh trips.
 * All figures are planning estimates in BDT, not quotations. They are derived
 * from typical ranges for the chosen style and are labelled as estimates in the UI.
 */

export type TravelStyle = "budget" | "standard" | "premium";
export type TransportMode = "bus" | "train" | "flight" | "private_car" | "mixed";
export type AccommodationType = "hostel" | "guesthouse" | "hotel" | "resort" | "luxury";

export type BudgetInput = {
  days: number;
  travelers: number;
  style: TravelStyle;
  transport: TransportMode;
  accommodation: AccommodationType;
  includeGuide?: boolean;
  includeBoat?: boolean;
  activitiesPerDay?: number;
  destinationSlug?: string;
};

export type BudgetLine = {
  key: string;
  label: string;
  detail: string;
  amount: number;
  perPerson: boolean;
};

export type BudgetBreakdown = {
  lines: BudgetLine[];
  perPerson: number;
  groupTotal: number;
  perPersonPerDay: number;
  contingencyPercent: number;
  nights: number;
  travelers: number;
  days: number;
  style: TravelStyle;
  assumptions: string[];
};

const ACCOMMODATION_RATES: Record<TravelStyle, Record<AccommodationType, number>> = {
  budget: { hostel: 900, guesthouse: 1400, hotel: 2200, resort: 3200, luxury: 5200 },
  standard: { hostel: 1400, guesthouse: 2200, hotel: 3800, resort: 5200, luxury: 8200 },
  premium: { hostel: 2200, guesthouse: 3600, hotel: 6500, resort: 9500, luxury: 16000 },
};

const FOOD_RATES: Record<TravelStyle, number> = { budget: 700, standard: 1300, premium: 2600 };
const LOCAL_TRANSPORT_RATES: Record<TravelStyle, number> = { budget: 300, standard: 650, premium: 1400 };
const ACTIVITY_RATES: Record<TravelStyle, number> = { budget: 400, standard: 850, premium: 1800 };
const GUIDE_DAY_RATE: Record<TravelStyle, number> = { budget: 1500, standard: 2500, premium: 4500 };

const INTERCITY_RATES: Record<TransportMode, Record<TravelStyle, number>> = {
  bus: { budget: 1400, standard: 2200, premium: 3600 },
  train: { budget: 900, standard: 1800, premium: 3200 },
  flight: { budget: 6500, standard: 8000, premium: 11000 },
  private_car: { budget: 4200, standard: 6500, premium: 11000 },
  mixed: { budget: 2200, standard: 3800, premium: 7000 },
};

const MODE_LABEL: Record<TransportMode, string> = {
  bus: "Intercity coach (return)",
  train: "Intercity train (return)",
  flight: "Domestic flights (return)",
  private_car: "Private car with driver (return)",
  mixed: "Mixed intercity transport (return)",
};

const ACCOMMODATION_LABEL: Record<AccommodationType, string> = {
  hostel: "Hostel or dorm bed",
  guesthouse: "Guesthouse or homestay",
  hotel: "Standard hotel room",
  resort: "Resort or boutique stay",
  luxury: "Premium hotel or resort",
};

export function calculateBudget(input: BudgetInput): BudgetBreakdown {
  const days = clampInt(input.days, 1, 30);
  const travelers = clampInt(input.travelers, 1, 20);
  const nights = Math.max(0, days - 1);
  const style = input.style;
  const rooms = Math.ceil(travelers / 2);
  const activitiesPerDay = clampInt(input.activitiesPerDay ?? 2, 0, 6);

  // Accommodation is charged per room, split across the group.
  const roomRate = ACCOMMODATION_RATES[style][input.accommodation];
  const accommodationTotal = nights * rooms * roomRate;

  // Per-person items.
  const foodTotal = days * travelers * FOOD_RATES[style];
  const localTransportTotal = days * travelers * LOCAL_TRANSPORT_RATES[style];
  const activitiesTotal = days * travelers * activitiesPerDay * ACTIVITY_RATES[style];
  const intercityTotal = travelers * INTERCITY_RATES[input.transport][style];
  const guideTotal = input.includeGuide ? days * GUIDE_DAY_RATE[style] : 0;
  const boatTotal = input.includeBoat ? travelers * (style === "premium" ? 3500 : style === "standard" ? 2000 : 1200) : 0;

  const subtotal =
    accommodationTotal + foodTotal + localTransportTotal + activitiesTotal + intercityTotal + guideTotal + boatTotal;

  const contingencyPercent = 12;
  const contingency = Math.round(subtotal * (contingencyPercent / 100));
  const groupTotal = subtotal + contingency;

  const lines: BudgetLine[] = [
    {
      key: "accommodation",
      label: "Accommodation",
      detail: `${nights} night${nights === 1 ? "" : "s"} × ${rooms} room${rooms === 1 ? "" : "s"} · ${ACCOMMODATION_LABEL[input.accommodation]}`,
      amount: accommodationTotal,
      perPerson: false,
    },
    {
      key: "intercity",
      label: "Intercity transport",
      detail: `${MODE_LABEL[input.transport]} for ${travelers}`,
      amount: intercityTotal,
      perPerson: false,
    },
    {
      key: "food",
      label: "Food",
      detail: `${days} days × ${travelers} · local restaurants`,
      amount: foodTotal,
      perPerson: false,
    },
    {
      key: "local",
      label: "Local transport",
      detail: `CNG, rickshaw and shared transport for ${days} days`,
      amount: localTransportTotal,
      perPerson: false,
    },
    {
      key: "activities",
      label: "Attractions and activities",
      detail: `${activitiesPerDay} paid activit${activitiesPerDay === 1 ? "y" : "ies"} per day`,
      amount: activitiesTotal,
      perPerson: false,
    },
  ];

  if (input.includeGuide) {
    lines.push({
      key: "guide",
      label: "Local guide",
      detail: `${days} days with a licensed guide`,
      amount: guideTotal,
      perPerson: false,
    });
  }
  if (input.includeBoat) {
    lines.push({
      key: "boat",
      label: "Boat trip",
      detail: `One boat excursion for ${travelers}`,
      amount: boatTotal,
      perPerson: false,
    });
  }

  lines.push({
    key: "contingency",
    label: "Contingency",
    detail: `${contingencyPercent}% buffer for delays, detours and price changes`,
    amount: contingency,
    perPerson: false,
  });

  return {
    lines,
    perPerson: Math.round(groupTotal / travelers),
    groupTotal,
    perPersonPerDay: Math.round(groupTotal / travelers / days),
    contingencyPercent,
    nights,
    travelers,
    days,
    style,
    assumptions: [
      "Rooms are assumed to be shared two per room; solo travellers pay the full room rate.",
      "Intercity fares are modelled for a return trip and do not include peak-season surcharges.",
      "Entry tickets, permits and guide fees at protected areas vary and are not individually quoted here.",
      "Prices are estimates compiled from typical 2025–2026 ranges, not live quotes.",
    ],
  };
}

export function clampInt(value: number | string, min: number, max: number): number {
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return min;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}
