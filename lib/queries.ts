import { and, asc, desc, eq, inArray, like, ne, or, sql } from "drizzle-orm";
import type { Db } from "@/lib/db";
import { getBindings } from "@/lib/db";
import {
  announcements,
  articles,
  attractions,
  destinations,
  districts,
  experiences,
  faqs,
  listings,
  packages,
  savedArticles,
  savedDestinations,
  siteSettings,
  tripActivities,
  tripDays,
  trips,
  travelAlerts,
  type ArticleRow,
  type DestinationRow,
  type DistrictRow,
  type TripActivityRow,
  type TripDayRow,
  type TripRow,
} from "@/db/schema";

export type DestinationWithDistrict = DestinationRow & {
  districtName: string | null;
  districtSlug: string | null;
  division: string | null;
};

const destinationSelection = {
  id: destinations.id,
  slug: destinations.slug,
  nameEn: destinations.nameEn,
  nameBn: destinations.nameBn,
  districtId: destinations.districtId,
  region: destinations.region,
  category: destinations.category,
  summaryEn: destinations.summaryEn,
  summaryBn: destinations.summaryBn,
  descriptionMd: destinations.descriptionMd,
  highlights: destinations.highlights,
  bestTime: destinations.bestTime,
  seasonalNote: destinations.seasonalNote,
  lat: destinations.lat,
  lon: destinations.lon,
  heroImage: destinations.heroImage,
  imageCredit: destinations.imageCredit,
  imageCreditUrl: destinations.imageCreditUrl,
  featured: destinations.featured,
  verification: destinations.verification,
  verifiedAt: destinations.verifiedAt,
  sources: destinations.sources,
  createdAt: destinations.createdAt,
  updatedAt: destinations.updatedAt,
  districtName: districts.nameEn,
  districtSlug: districts.slug,
  division: districts.division,
};

export async function getFeaturedDestinations(db: Db, limit = 12): Promise<DestinationWithDistrict[]> {
  return db
    .select(destinationSelection)
    .from(destinations)
    .leftJoin(districts, eq(destinations.districtId, districts.id))
    .where(eq(destinations.featured, 1))
    .orderBy(asc(destinations.nameEn))
    .limit(limit);
}

export async function getDestinations(
  db: Db,
  options: {
    category?: string;
    region?: string;
    limit?: number;
    offset?: number;
    excludeSlug?: string;
    q?: string;
    order?: "name" | "featured";
  } = {},
): Promise<DestinationWithDistrict[]> {
  const filters = [];
  if (options.category) filters.push(eq(destinations.category, options.category));
  if (options.region) filters.push(eq(destinations.region, options.region));
  if (options.excludeSlug) filters.push(ne(destinations.slug, options.excludeSlug));
  if (options.q) {
    const pattern = `%${options.q.replace(/[%_]/g, "")}%`;
    filters.push(
      or(
        like(destinations.nameEn, pattern),
        like(destinations.nameBn, pattern),
        like(destinations.summaryEn, pattern),
        like(destinations.category, pattern),
        like(destinations.region, pattern),
      )!,
    );
  }

  return db
    .select(destinationSelection)
    .from(destinations)
    .leftJoin(districts, eq(destinations.districtId, districts.id))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(options.order === "featured" ? desc(destinations.featured) : asc(destinations.nameEn))
    .limit(options.limit ?? 60)
    .offset(options.offset ?? 0);
}

export async function getDestinationFacets(db: Db) {
  const [categories, regions] = await Promise.all([
    db
      .select({ value: destinations.category, count: sql<number>`count(*)` })
      .from(destinations)
      .groupBy(destinations.category)
      .orderBy(asc(destinations.category)),
    db
      .select({ value: destinations.region, count: sql<number>`count(*)` })
      .from(destinations)
      .groupBy(destinations.region)
      .orderBy(asc(destinations.region)),
  ]);
  return {
    categories: categories.map((row) => ({ value: row.value, count: Number(row.count) })),
    regions: regions.map((row) => ({ value: row.value, count: Number(row.count) })),
  };
}

export async function getRelatedDestinations(db: Db, destination: DestinationWithDistrict, limit = 3) {
  const rows = await db
    .select(destinationSelection)
    .from(destinations)
    .leftJoin(districts, eq(destinations.districtId, districts.id))
    .where(
      and(
        ne(destinations.id, destination.id),
        or(eq(destinations.category, destination.category), eq(destinations.region, destination.region)),
      ),
    )
    .orderBy(desc(destinations.featured), asc(destinations.nameEn))
    .limit(limit);
  return rows;
}

export async function getDestinationBySlug(db: Db, slug: string): Promise<DestinationWithDistrict | null> {
  const rows = await db
    .select(destinationSelection)
    .from(destinations)
    .leftJoin(districts, eq(destinations.districtId, districts.id))
    .where(eq(destinations.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getDestinationsByDistrict(db: Db, districtId: string): Promise<DestinationWithDistrict[]> {
  return db
    .select(destinationSelection)
    .from(destinations)
    .leftJoin(districts, eq(destinations.districtId, districts.id))
    .where(eq(destinations.districtId, districtId))
    .orderBy(asc(destinations.nameEn));
}

export async function getDestinationOptions(db: Db) {
  return db
    .select({ id: destinations.id, slug: destinations.slug, nameEn: destinations.nameEn, nameBn: destinations.nameBn, category: destinations.category })
    .from(destinations)
    .orderBy(asc(destinations.nameEn));
}

export async function getDistricts(db: Db): Promise<DistrictRow[]> {
  return db.select().from(districts).orderBy(asc(districts.nameEn));
}

export async function getDistrictAttractionCounts(db: Db) {
  const rows = await db
    .select({ districtId: attractions.districtId, count: sql<number>`count(*)` })
    .from(attractions)
    .groupBy(attractions.districtId);
  return new Map(rows.filter((row) => row.districtId).map((row) => [row.districtId as string, Number(row.count)]));
}

export async function getDistrictBySlug(db: Db, slug: string): Promise<DistrictRow | null> {
  const rows = await db.select().from(districts).where(eq(districts.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getAttractionsByDistrict(db: Db, districtId: string) {
  return db.select().from(attractions).where(eq(attractions.districtId, districtId)).orderBy(asc(attractions.nameEn));
}

export async function getAttractionsByDestination(db: Db, destinationId: string) {
  return db.select().from(attractions).where(eq(attractions.destinationId, destinationId)).orderBy(asc(attractions.nameEn));
}

export async function getAttractions(
  db: Db,
  options: { limit?: number; offset?: number; category?: string; q?: string } = {},
) {
  const filters = [];
  if (options.category) filters.push(eq(attractions.category, options.category));
  if (options.q) {
    const pattern = `%${options.q.replace(/[%_]/g, "")}%`;
    filters.push(or(like(attractions.nameEn, pattern), like(attractions.description, pattern))!);
  }
  return db
    .select({
      attraction: attractions,
      districtName: districts.nameEn,
      districtSlug: districts.slug,
    })
    .from(attractions)
    .leftJoin(districts, eq(attractions.districtId, districts.id))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(asc(attractions.nameEn))
    .limit(options.limit ?? 60)
    .offset(options.offset ?? 0);
}

export async function getAttractionFacets(db: Db) {
  const rows = await db
    .select({ value: attractions.category, count: sql<number>`count(*)` })
    .from(attractions)
    .groupBy(attractions.category)
    .orderBy(asc(attractions.category));
  const [total] = await db.select({ count: sql<number>`count(*)` }).from(attractions);
  return {
    total: Number(total?.count ?? 0),
    categories: rows.map((row) => ({ value: row.value, count: Number(row.count) })),
  };
}

export async function getAttractionsForMap(db: Db, limit = 250) {
  return db
    .select({
      slug: attractions.slug,
      name: attractions.nameEn,
      category: attractions.category,
      lat: attractions.lat,
      lon: attractions.lon,
      districtName: districts.nameEn,
    })
    .from(attractions)
    .leftJoin(districts, eq(attractions.districtId, districts.id))
    .limit(limit);
}

export async function getAttractionBySlug(db: Db, slug: string) {
  const rows = await db
    .select({
      attraction: attractions,
      districtName: districts.nameEn,
      districtSlug: districts.slug,
      division: districts.division,
      destinationSlug: destinations.slug,
      destinationName: destinations.nameEn,
    })
    .from(attractions)
    .leftJoin(districts, eq(attractions.districtId, districts.id))
    .leftJoin(destinations, eq(attractions.destinationId, destinations.id))
    .where(eq(attractions.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getExperiences(db: Db) {
  return db.select().from(experiences).orderBy(asc(experiences.sort));
}

export async function getPackages(db: Db, options: { limit?: number; destinationId?: string } = {}) {
  const filters = [eq(packages.status, "published")];
  if (options.destinationId) filters.push(eq(packages.destinationId, options.destinationId));
  return db
    .select({
      pkg: packages,
      destinationSlug: destinations.slug,
      destinationName: destinations.nameEn,
    })
    .from(packages)
    .leftJoin(destinations, eq(packages.destinationId, destinations.id))
    .where(and(...filters))
    .orderBy(asc(packages.durationDays), asc(packages.title))
    .limit(options.limit ?? 30);
}

export async function getPackageBySlug(db: Db, slug: string) {
  const rows = await db
    .select({
      pkg: packages,
      destinationSlug: destinations.slug,
      destinationName: destinations.nameEn,
    })
    .from(packages)
    .leftJoin(destinations, eq(packages.destinationId, destinations.id))
    .where(eq(packages.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getListings(db: Db, options: { type?: string; districtId?: string; limit?: number } = {}) {
  const filters = [];
  if (options.type) filters.push(eq(listings.type, options.type));
  if (options.districtId) filters.push(eq(listings.districtId, options.districtId));
  return db
    .select({ listing: listings, districtName: districts.nameEn })
    .from(listings)
    .leftJoin(districts, eq(listings.districtId, districts.id))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(asc(listings.name))
    .limit(options.limit ?? 60);
}

export async function getArticleFacets(db: Db) {
  const rows = await db
    .select({ category: articles.category, type: articles.type, count: sql<number>`count(*)` })
    .from(articles)
    .where(eq(articles.status, "published"))
    .groupBy(articles.category, articles.type)
    .orderBy(asc(articles.category));
  return rows.map((row) => ({ category: row.category, type: row.type, count: Number(row.count) }));
}

export async function getArticlesByDistrict(db: Db, districtId: string, limit = 3) {
  return db
    .select()
    .from(articles)
    .where(and(eq(articles.status, "published"), eq(articles.districtId, districtId)))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
}

export async function getArticles(
  db: Db,
  options: {
    type?: "guide" | "blog";
    category?: string;
    limit?: number;
    offset?: number;
    districtId?: string;
    excludeSlug?: string;
  } = {},
): Promise<ArticleRow[]> {
  if (options.excludeSlug !== undefined) {
    const filters = [eq(articles.status, "published")];
    if (options.type) filters.push(eq(articles.type, options.type));
    filters.push(ne(articles.slug, options.excludeSlug));
    return db
      .select()
      .from(articles)
      .where(and(...filters))
      .orderBy(desc(articles.publishedAt))
      .limit(options.limit ?? 24);
  }

  const filters = [eq(articles.status, "published")];
  if (options.type) filters.push(eq(articles.type, options.type));
  if (options.category) filters.push(eq(articles.category, options.category));
  if (options.districtId) filters.push(eq(articles.districtId, options.districtId));
  return db
    .select()
    .from(articles)
    .where(and(...filters))
    .orderBy(desc(articles.publishedAt))
    .limit(options.limit ?? 24)
    .offset(options.offset ?? 0);
}

export async function getArticleBySlug(db: Db, slug: string): Promise<ArticleRow | null> {
  const rows = await db
    .select()
    .from(articles)
    .where(and(eq(articles.slug, slug), eq(articles.status, "published")))
    .limit(1);
  return rows[0] ?? null;
}

export async function getRelatedArticles(db: Db, article: ArticleRow, limit = 3): Promise<ArticleRow[]> {
  const rows = await db
    .select()
    .from(articles)
    .where(and(eq(articles.status, "published"), ne(articles.id, article.id), eq(articles.type, article.type)))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
  if (rows.length >= limit) return rows;
  const filler = await db
    .select()
    .from(articles)
    .where(and(eq(articles.status, "published"), ne(articles.id, article.id)))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
  const seen = new Set(rows.map((r) => r.id));
  for (const row of filler) {
    if (rows.length >= limit) break;
    if (!seen.has(row.id)) {
      rows.push(row);
      seen.add(row.id);
    }
  }
  return rows;
}

export async function getArticleCategories(db: Db) {
  return db.select().from(articles).groupBy(articles.category).orderBy(asc(articles.category));
}

export async function getAlerts(db: Db) {
  return db.select().from(travelAlerts).where(eq(travelAlerts.active, 1)).orderBy(desc(travelAlerts.severity));
}

export async function getAnnouncements(db: Db) {
  return db
    .select()
    .from(announcements)
    .where(eq(announcements.active, 1))
    .orderBy(asc(announcements.sort));
}

export async function getFaqs(db: Db) {
  return db.select().from(faqs).orderBy(asc(faqs.sort));
}

export async function getSettings(db: Db): Promise<Record<string, string>> {
  const rows = await db.select().from(siteSettings);
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

export async function getSiteStats(db: Db) {
  const [districtCount] = await db.select({ count: sql<number>`count(*)` }).from(districts);
  const [destinationCount] = await db.select({ count: sql<number>`count(*)` }).from(destinations);
  const [attractionCount] = await db.select({ count: sql<number>`count(*)` }).from(attractions);
  const [articleCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(eq(articles.status, "published"));
  return {
    districts: Number(districtCount?.count ?? 0),
    destinations: Number(destinationCount?.count ?? 0),
    attractions: Number(attractionCount?.count ?? 0),
    articles: Number(articleCount?.count ?? 0),
  };
}

export async function getMapPoints(db: Db) {
  const dests = await db
    .select({
      slug: destinations.slug,
      name: destinations.nameEn,
      nameBn: destinations.nameBn,
      category: destinations.category,
      lat: destinations.lat,
      lon: destinations.lon,
      summary: destinations.summaryEn,
      image: destinations.heroImage,
      kind: sql<string>`'destination'`,
    })
    .from(destinations);
  const districtPoints = await db
    .select({
      slug: districts.slug,
      name: districts.nameEn,
      nameBn: districts.nameBn,
      category: districts.division,
      lat: districts.lat,
      lon: districts.lon,
      summary: districts.tagline,
      image: districts.image,
      kind: sql<string>`'district'`,
    })
    .from(districts);
  return [...dests, ...districtPoints].filter((p) => typeof p.lat === "number" && typeof p.lon === "number");
}

type SearchRow = {
  kind: string;
  title: string;
  subtitle: string | null;
  href: string;
  image: string | null;
  extra: string | null;
  slugtype?: string | null;
};

/** Searches across all public content using parameterised LIKE queries. */
export async function searchAll(term: string, limitPerType = 6): Promise<SearchRow[]> {
  const bindings = await getBindings();
  const db = bindings.DB as
    | { prepare: (sql: string) => { bind: (...values: unknown[]) => { all: <T>() => Promise<{ results: T[] }> } } }
    | undefined;
  if (!db) return [];

  const raw = term.trim();
  if (raw.length < 2) return [];
  const like = `%${raw.replace(/[%_]/g, "")}%`;

  const run = async (sqlText: string, values: unknown[]): Promise<SearchRow[]> => {
    try {
      const result = await db.prepare(sqlText).bind(...values).all<SearchRow>();
      return result.results ?? [];
    } catch {
      return [];
    }
  };

  const [dest, dist, attr, pkgs, arts, lsts, exps] = await Promise.all([
    run(
      `SELECT 'Destination' AS kind, name_en AS title, summary_en AS subtitle, '/destinations/' || slug AS href, hero_image AS image, category AS extra
       FROM destinations WHERE name_en LIKE ?1 OR name_bn LIKE ?1 OR summary_en LIKE ?1 OR category LIKE ?1 OR region LIKE ?1
       ORDER BY featured DESC, name_en LIMIT ?2`,
      [like, limitPerType],
    ),
    run(
      `SELECT 'District' AS kind, name_en AS title, tagline AS subtitle, '/districts/' || slug AS href, image, division AS extra
       FROM districts WHERE name_en LIKE ?1 OR name_bn LIKE ?1 OR division LIKE ?1 OR intro_en LIKE ?1
       ORDER BY name_en LIMIT ?2`,
      [like, limitPerType],
    ),
    run(
      `SELECT 'Attraction' AS kind, name_en AS title, description AS subtitle, '/attractions/' || slug AS href, image, category AS extra
       FROM attractions WHERE name_en LIKE ?1 OR name_bn LIKE ?1 OR description LIKE ?1
       ORDER BY name_en LIMIT ?2`,
      [like, limitPerType],
    ),
    run(
      `SELECT 'Package' AS kind, title, summary AS subtitle, '/packages/' || slug AS href, image, 'Trip template' AS extra
       FROM packages WHERE status = 'published' AND (title LIKE ?1 OR summary LIKE ?1)
       ORDER BY duration_days LIMIT ?2`,
      [like, limitPerType],
    ),
    run(
      `SELECT 'Article' AS kind, title, excerpt AS subtitle,
              '/blog/' || slug AS href, hero_image AS image, category AS extra, type AS slugtype
       FROM articles WHERE status = 'published' AND (title LIKE ?1 OR excerpt LIKE ?1 OR body_md LIKE ?1 OR title_bn LIKE ?1)
       ORDER BY published_at DESC LIMIT ?2`,
      [like, limitPerType],
    ),
    run(
      `SELECT 'Listing' AS kind, name AS title, description AS subtitle, '/packages#directory' AS href, NULL AS image, type AS extra
       FROM listings WHERE name LIKE ?1 OR description LIKE ?1
       ORDER BY name LIMIT ?2`,
      [like, limitPerType],
    ),
    run(
      `SELECT 'Experience' AS kind, name_en AS title, summary AS subtitle, '/experiences#' || slug AS href, image, 'Experience' AS extra
       FROM experiences WHERE name_en LIKE ?1 OR summary LIKE ?1
       ORDER BY sort LIMIT ?2`,
      [like, limitPerType],
    ),
  ]);

  // Guides live under /travel-guides; blog posts under /blog.
  const articleHrefs = arts.map((row) => ({
    ...row,
    href: row.slugtype === "guide" ? row.href.replace("/blog/", "/travel-guides/") : row.href,
  }));

  return [...dest, ...dist, ...attr, ...pkgs, ...articleHrefs, ...lsts, ...exps].slice(0, 40);
}

export async function getGuideSlugs(db: Db) {
  return db
    .select({ slug: articles.slug, updatedAt: articles.updatedAt })
    .from(articles)
    .where(eq(articles.status, "published"));
}

export async function getSlugsForSitemap(db: Db) {
  const [destSlugs, distSlugs, attrSlugs, pkgSlugs, artSlugs] = await Promise.all([
    db.select({ slug: destinations.slug }).from(destinations),
    db.select({ slug: districts.slug }).from(districts),
    db.select({ slug: attractions.slug }).from(attractions),
    db.select({ slug: packages.slug }).from(packages).where(eq(packages.status, "published")),
    db.select({ slug: articles.slug, type: articles.type, updatedAt: articles.updatedAt }).from(articles).where(eq(articles.status, "published")),
  ]);
  return { destSlugs, distSlugs, attrSlugs, pkgSlugs, artSlugs };
}

export type TripWithDays = TripRow & {
  days: (TripDayRow & { activities: TripActivityRow[] })[];
};

async function hydrateTrip(db: Db, trip: TripRow): Promise<TripWithDays> {
  const days = await db.select().from(tripDays).where(eq(tripDays.tripId, trip.id)).orderBy(asc(tripDays.dayIndex));
  const activities = days.length
    ? await db
        .select()
        .from(tripActivities)
        .where(inArray(tripActivities.dayId, days.map((day) => day.id)))
        .orderBy(asc(tripActivities.sort))
    : [];
  return {
    ...trip,
    days: days.map((day) => ({ ...day, activities: activities.filter((activity) => activity.dayId === day.id) })),
  };
}

export async function getTripsForUser(db: Db, userId: string): Promise<TripWithDays[]> {
  const rows = await db.select().from(trips).where(eq(trips.userId, userId)).orderBy(desc(trips.updatedAt));
  return Promise.all(rows.map((trip) => hydrateTrip(db, trip)));
}

export async function getTripForUser(db: Db, tripId: string, userId: string): Promise<TripWithDays | null> {
  const rows = await db
    .select()
    .from(trips)
    .where(and(eq(trips.id, tripId), eq(trips.userId, userId)))
    .limit(1);
  return rows[0] ? hydrateTrip(db, rows[0]) : null;
}

export async function getSharedTrip(db: Db, token: string): Promise<TripWithDays | null> {
  const rows = await db.select().from(trips).where(eq(trips.shareToken, token)).limit(1);
  const trip = rows[0];
  if (!trip || trip.isPublic !== 1) return null;
  return hydrateTrip(db, trip);
}

export async function getSavedDestinations(db: Db, userId: string) {
  return db
    .select(destinationSelection)
    .from(savedDestinations)
    .innerJoin(destinations, eq(savedDestinations.destinationId, destinations.id))
    .leftJoin(districts, eq(destinations.districtId, districts.id))
    .where(eq(savedDestinations.userId, userId))
    .orderBy(desc(savedDestinations.createdAt));
}

export async function getSavedArticles(db: Db, userId: string) {
  return db
    .select({ article: articles })
    .from(savedArticles)
    .innerJoin(articles, eq(savedArticles.articleId, articles.id))
    .where(and(eq(savedArticles.userId, userId), eq(articles.status, "published")))
    .orderBy(desc(savedArticles.createdAt));
}

export async function getSavedDestinationIds(db: Db, userId: string) {
  const rows = await db
    .select({ id: savedDestinations.destinationId })
    .from(savedDestinations)
    .where(eq(savedDestinations.userId, userId));
  return new Set(rows.map((row) => row.id));
}

export async function getSavedArticleIds(db: Db, userId: string) {
  const rows = await db
    .select({ id: savedArticles.articleId })
    .from(savedArticles)
    .where(eq(savedArticles.userId, userId));
  return new Set(rows.map((row) => row.id));
}

export async function getDestinationsByIds(db: Db, ids: string[]) {
  if (!ids.length) return [];
  return db.select().from(destinations).where(inArray(destinations.id, ids));
}

