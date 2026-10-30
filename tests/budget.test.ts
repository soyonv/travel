import { describe, expect, it } from "vitest";
import { calculateBudget, clampInt } from "@/lib/budget";

const base = {
  days: 3,
  travelers: 2,
  style: "standard" as const,
  transport: "bus" as const,
  accommodation: "hotel" as const,
};

describe("calculateBudget", () => {
  it("charges accommodation per room for the nights, not per person", () => {
    const result = calculateBudget(base);
    const accommodation = result.lines.find((line) => line.key === "accommodation");
    expect(accommodation?.amount).toBe(2 * 1 * 3800);
    expect(result.nights).toBe(2);
  });

  it("uses two rooms for four travellers and three for five", () => {
    const four = calculateBudget({ ...base, travelers: 4 });
    const five = calculateBudget({ ...base, travelers: 5 });
    expect(four.lines.find((line) => line.key === "accommodation")?.amount).toBe(2 * 2 * 3800);
    expect(five.lines.find((line) => line.key === "accommodation")?.amount).toBe(2 * 3 * 3800);
  });

  it("derives group total and per-person figures from the subtotal plus 12% contingency", () => {
    const result = calculateBudget(base);
    const subtotal = result.lines
      .filter((line) => line.key !== "contingency")
      .reduce((sum, line) => sum + line.amount, 0);
    const contingency = result.lines.find((line) => line.key === "contingency");
    expect(contingency?.amount).toBe(Math.round(subtotal * 0.12));
    expect(result.groupTotal).toBe(subtotal + (contingency?.amount ?? 0));
    expect(result.perPerson).toBe(Math.round(result.groupTotal / 2));
    expect(result.perPersonPerDay).toBe(Math.round(result.groupTotal / 2 / 3));
  });

  it("adds guide and boat lines only when requested", () => {
    const without = calculateBudget(base);
    const withExtras = calculateBudget({ ...base, includeGuide: true, includeBoat: true });
    expect(without.lines.some((line) => line.key === "guide")).toBe(false);
    expect(withExtras.lines.some((line) => line.key === "guide")).toBe(true);
    expect(withExtras.lines.some((line) => line.key === "boat")).toBe(true);
    expect(withExtras.groupTotal).toBeGreaterThan(without.groupTotal);
  });

  it("increases with style and gives a single traveller the full room rate", () => {
    const budget = calculateBudget({ ...base, style: "budget" });
    const premium = calculateBudget({ ...base, style: "premium" });
    expect(premium.groupTotal).toBeGreaterThan(budget.groupTotal);

    const solo = calculateBudget({ ...base, travelers: 1 });
    expect(solo.lines.find((line) => line.key === "accommodation")?.amount).toBe(2 * 1 * 3800);
    expect(solo.perPerson).toBe(solo.groupTotal);
  });

  it("clamps out-of-range day and traveller counts", () => {
    const result = calculateBudget({ ...base, days: 99, travelers: 0 });
    expect(result.days).toBe(30);
    expect(result.travelers).toBe(1);
    expect(result.nights).toBe(29);
  });

  it("has a contingency that is always a whole number", () => {
    const result = calculateBudget({ ...base, travelers: 3, days: 7 });
    const contingency = result.lines.find((line) => line.key === "contingency");
    expect(Number.isInteger(contingency?.amount)).toBe(true);
  });
});

describe("clampInt", () => {
  it("rounds, clamps and falls back", () => {
    expect(clampInt(2.6, 1, 10)).toBe(3);
    expect(clampInt(0, 1, 10)).toBe(1);
    expect(clampInt(99, 1, 10)).toBe(10);
    expect(clampInt("nope", 4, 10)).toBe(4);
  });
});
