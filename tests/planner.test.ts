import { describe, expect, it } from "vitest";
import { planInputSchema, planSchema, resolveDays } from "@/lib/planner";

describe("resolveDays", () => {
  it("prefers an explicit date range", () => {
    const input = planInputSchema.parse({ startDate: "2026-11-01", endDate: "2026-11-04", days: 9 });
    expect(resolveDays(input)).toBe(4);
  });

  it("falls back to the days field when dates are absent", () => {
    expect(resolveDays(planInputSchema.parse({ days: 5 }))).toBe(5);
  });

  it("respects the supported range and rejects values outside it", () => {
    expect(resolveDays(planInputSchema.parse({ days: 21 }))).toBe(21);
    expect(resolveDays(planInputSchema.parse({ days: 1 }))).toBe(1);
    expect(planInputSchema.safeParse({ days: 60 }).success).toBe(false);
    expect(planInputSchema.safeParse({ days: 0 }).success).toBe(false);
  });

  it("ignores reversed dates", () => {
    expect(resolveDays(planInputSchema.parse({ startDate: "2026-11-04", endDate: "2026-11-01", days: 3 }))).toBe(3);
  });
});

describe("planInputSchema", () => {
  it("rejects impossible traveller numbers", () => {
    expect(planInputSchema.safeParse({ travelers: 0 }).success).toBe(false);
    expect(planInputSchema.safeParse({ travelers: 21 }).success).toBe(false);
  });

  it("defaults to sensible values", () => {
    const parsed = planInputSchema.parse({});
    expect(parsed.travelers).toBe(2);
    expect(parsed.style).toBe("standard");
    expect(parsed.accommodation).toBe("hotel");
    expect(parsed.lang).toBe("en");
  });
});

describe("planSchema", () => {
  const validPlan = {
    title: "Three days in Sylhet",
    summary: "A practical outline for tea country and wetlands with estimated costs.",
    destinationSlug: "sylhet",
    destinationName: "Sylhet",
    days: [
      {
        day: 1,
        date: "2026-11-01",
        title: "Arrival",
        base: "Sylhet",
        activities: [
          {
            time: "09:00",
            title: "Train from Dhaka",
            kind: "travel",
            durationMin: 420,
            costBdt: 900,
            notes: "Estimate",
          },
        ],
        notes: "",
      },
    ],
    budget: {
      transport: 1800,
      accommodation: 3800,
      food: 2600,
      localTransport: 1300,
      activities: 1700,
      contingency: 1344,
      total: 12544,
      perPerson: 6272,
    },
    tips: [],
    sources: [],
    estimateNotice: "Estimates only.",
  };

  it("accepts a well-formed plan", () => {
    expect(planSchema.safeParse(validPlan).success).toBe(true);
  });

  it("rejects an empty itinerary", () => {
    expect(planSchema.safeParse({ ...validPlan, days: [] }).success).toBe(false);
  });

  it("rejects a negative cost", () => {
    const plan = structuredClone(validPlan);
    plan.budget.total = -5;
    expect(planSchema.safeParse(plan).success).toBe(false);
  });

  it("rejects a stop without a title", () => {
    const plan = structuredClone(validPlan);
    plan.days[0].activities[0].title = "";
    expect(planSchema.safeParse(plan).success).toBe(false);
  });
});
