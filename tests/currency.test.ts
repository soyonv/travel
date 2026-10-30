import { describe, expect, it } from "vitest";
import { convertFromBdt, formatMoney, isCurrencyCode } from "@/lib/currency";

describe("currency helpers", () => {
  it("returns BDT unchanged", () => {
    expect(convertFromBdt(12500, "BDT")).toBe(12500);
  });

  it("converts using the fixed reference rate", () => {
    expect(Math.round(convertFromBdt(12200, "USD"))).toBe(100);
  });

  it("formats taka without decimals and other currencies with a symbol", () => {
    expect(formatMoney(12500, "BDT")).toContain("12,500");
    expect(formatMoney(12500, "BDT").startsWith("৳")).toBe(true);
    expect(formatMoney(12200, "USD").startsWith("$")).toBe(true);
  });

  it("validates currency codes", () => {
    expect(isCurrencyCode("USD")).toBe(true);
    expect(isCurrencyCode("XYZ")).toBe(false);
  });

  it("handles non-finite input without throwing", () => {
    expect(formatMoney(Number.NaN, "BDT")).toBe("৳0");
  });
});
