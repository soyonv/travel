import type { MetadataRoute } from "next";
import { getDbOrNull } from "@/lib/db";
import { getSlugsForSitemap } from "@/lib/queries";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 3600;

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/destinations", priority: 0.9, changeFrequency: "weekly" },
  { path: "/districts", priority: 0.9, changeFrequency: "monthly" },
  { path: "/attractions", priority: 0.8, changeFrequency: "monthly" },
  { path: "/experiences", priority: 0.8, changeFrequency: "monthly" },
  { path: "/packages", priority: 0.8, changeFrequency: "weekly" },
  { path: "/trip-planner", priority: 0.7, changeFrequency: "monthly" },
  { path: "/ai-travel-agent", priority: 0.7, changeFrequency: "monthly" },
  { path: "/budget-calculator", priority: 0.7, changeFrequency: "monthly" },
  { path: "/map", priority: 0.6, changeFrequency: "monthly" },
  { path: "/travel-guides", priority: 0.8, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
  { path: "/about", priority: 0.5, changeFrequency: "yearly" },
  { path: "/contact", priority: 0.4, changeFrequency: "yearly" },
  { path: "/faq", priority: 0.4, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.2, changeFrequency: "yearly" },
  { path: "/editorial-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/responsible-tourism", priority: 0.3, changeFrequency: "yearly" },
  { path: "/affiliate-disclosure", priority: 0.2, changeFrequency: "yearly" },
  { path: "/partners", priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: {
      languages: {
        en: absoluteUrl(route.path),
        bn: absoluteUrl(`${route.path}${route.path.includes("?") ? "&" : "?"}lang=bn`),
      },
    },
  }));

  const db = await getDbOrNull();
  if (!db) return staticEntries;

  try {
    const { destSlugs, distSlugs, attrSlugs, pkgSlugs, artSlugs } = await getSlugsForSitemap(db);

    const destinations: MetadataRoute.Sitemap = destSlugs.map((row) => ({
      url: absoluteUrl(`/destinations/${row.slug}`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    }));
    const districts: MetadataRoute.Sitemap = distSlugs.map((row) => ({
      url: absoluteUrl(`/districts/${row.slug}`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    }));
    const attractions: MetadataRoute.Sitemap = attrSlugs.map((row) => ({
      url: absoluteUrl(`/attractions/${row.slug}`),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    }));
    const packages: MetadataRoute.Sitemap = pkgSlugs.map((row) => ({
      url: absoluteUrl(`/packages/${row.slug}`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    }));
    const articles: MetadataRoute.Sitemap = artSlugs.map((row) => ({
      url: absoluteUrl(`/${row.type === "guide" ? "travel-guides" : "blog"}/${row.slug}`),
      lastModified: row.updatedAt ? new Date(row.updatedAt) : now,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    return [...staticEntries, ...destinations, ...districts, ...attractions, ...packages, ...articles];
  } catch {
    return staticEntries;
  }
}
