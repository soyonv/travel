import { describe, expect, it } from "vitest";
import { expandQuery, normalizeQuery } from "@/lib/search";

describe("normalizeQuery", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeQuery("  Cox's   Bazar ")).toBe("cox's bazar");
  });
});

describe("expandQuery", () => {
  it("maps common English misspellings and alternate names", () => {
    expect(expandQuery("chittagong")).toContain("Chattogram");
    expect(expandQuery("sundarban")).toContain("Sundarbans");
    expect(expandQuery("srimongol")).toContain("Srimangal");
    expect(expandQuery("barisal")).toContain("Barishal");
  });

  it("handles multi-word aliases", () => {
    expect(expandQuery("cox bazar")).toContain("Cox's Bazar");
    expect(expandQuery("old dhaka")).toContain("Old Dhaka");
  });

  it("maps Bangla search terms to English", () => {
    expect(expandQuery("সুন্দরবন")).toContain("Sundarbans");
    expect(expandQuery("কক্সবাজার")).toContain("Cox's Bazar");
    expect(expandQuery("খাবার")).toContain("food");
  });

  it("returns at most three fallbacks and never the exact original query", () => {
    const results = expandQuery("সিলেট sylhet");
    expect(results.length).toBeLessThanOrEqual(3);
    expect(results).not.toContain("সিলেট sylhet");
  });

  it("returns an empty list for unknown terms", () => {
    expect(expandQuery("qwertyuiop")).toEqual([]);
  });
});
