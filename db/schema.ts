import { index, integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at").notNull().default("now"),
  updatedAt: text("updated_at").notNull().default("now"),
};

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["user", "editor", "admin"] }).notNull().default("user"),
  locale: text("locale").notNull().default("en"),
  ...timestamps,
});

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").notNull().default("now"),
  },
  (table) => [index("idx_sessions_user").on(table.userId)],
);

export const passwordResets = sqliteTable("password_resets", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  usedAt: text("used_at"),
  createdAt: text("created_at").notNull().default("now"),
});

export const districts = sqliteTable("districts", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameBn: text("name_bn").notNull(),
  division: text("division").notNull(),
  tagline: text("tagline"),
  introEn: text("intro_en").notNull(),
  introBn: text("intro_bn"),
  image: text("image"),
  lat: real("lat"),
  lon: real("lon"),
  bestSeason: text("best_season"),
  dailyBudgetBdt: integer("daily_budget_bdt"),
  transport: text("transport"),
  foods: text("foods", { mode: "json" }).$type<string[]>(),
  tips: text("tips", { mode: "json" }).$type<string[]>(),
  sources: text("sources", { mode: "json" }).$type<SourceLink[]>(),
  verifiedAt: text("verified_at"),
  ...timestamps,
});

export const destinations = sqliteTable("destinations", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameBn: text("name_bn").notNull(),
  districtId: text("district_id"),
  region: text("region").notNull(),
  category: text("category").notNull(),
  summaryEn: text("summary_en").notNull(),
  summaryBn: text("summary_bn"),
  descriptionMd: text("description_md").notNull(),
  highlights: text("highlights", { mode: "json" }).$type<string[]>(),
  bestTime: text("best_time"),
  seasonalNote: text("seasonal_note"),
  lat: real("lat"),
  lon: real("lon"),
  heroImage: text("hero_image"),
  imageCredit: text("image_credit"),
  imageCreditUrl: text("image_credit_url"),
  featured: integer("featured").notNull().default(0),
  verification: text("verification").notNull().default("seed"),
  verifiedAt: text("verified_at"),
  sources: text("sources", { mode: "json" }).$type<SourceLink[]>(),
  ...timestamps,
});

export const attractions = sqliteTable("attractions", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameBn: text("name_bn"),
  districtId: text("district_id"),
  destinationId: text("destination_id"),
  category: text("category").notNull(),
  description: text("description").notNull(),
  feeNote: text("fee_note"),
  entryFeeBdt: integer("entry_fee_bdt"),
  lat: real("lat"),
  lon: real("lon"),
  image: text("image"),
  verifiedAt: text("verified_at"),
  sources: text("sources", { mode: "json" }).$type<SourceLink[]>(),
  ...timestamps,
});

export const experiences = sqliteTable("experiences", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameBn: text("name_bn"),
  summary: text("summary").notNull(),
  icon: text("icon"),
  image: text("image"),
  sort: integer("sort").notNull().default(0),
});

export const packages = sqliteTable("packages", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  destinationId: text("destination_id"),
  summary: text("summary").notNull(),
  durationDays: integer("duration_days").notNull(),
  priceFromBdt: integer("price_from_bdt"),
  priceNote: text("price_note"),
  groupSize: text("group_size"),
  includes: text("includes", { mode: "json" }).$type<string[]>(),
  excludes: text("excludes", { mode: "json" }).$type<string[]>(),
  operatorName: text("operator_name"),
  operatorContact: text("operator_contact"),
  operatorStatus: text("operator_status").notNull().default("unverified"),
  availableDates: text("available_dates", { mode: "json" }).$type<string[]>(),
  image: text("image"),
  status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
  ...timestamps,
});

export const listings = sqliteTable("listings", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  districtId: text("district_id"),
  address: text("address"),
  phone: text("phone"),
  website: text("website"),
  description: text("description"),
  priceNote: text("price_note"),
  verification: text("verification").notNull().default("unverified"),
  verifiedAt: text("verified_at"),
  bookingUrl: text("booking_url"),
  ...timestamps,
});

export const articleCategories = sqliteTable("article_categories", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
});

export const articles = sqliteTable("articles", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  type: text("type", { enum: ["guide", "blog"] }).notNull().default("guide"),
  title: text("title").notNull(),
  titleBn: text("title_bn"),
  excerpt: text("excerpt").notNull(),
  bodyMd: text("body_md").notNull(),
  category: text("category").notNull(),
  tags: text("tags", { mode: "json" }).$type<string[]>(),
  heroImage: text("hero_image"),
  author: text("author").notNull(),
  destinationId: text("destination_id"),
  districtId: text("district_id"),
  status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("published"),
  publishedAt: text("published_at"),
  updatedAt: text("updated_at").notNull().default("now"),
  readingMinutes: integer("reading_minutes").notNull().default(5),
});

export const trips = sqliteTable("trips", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  name: text("name").notNull(),
  origin: text("origin"),
  destination: text("destination"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  travelers: integer("travelers").notNull().default(2),
  budgetBdt: integer("budget_bdt"),
  style: text("style"),
  notes: text("notes"),
  shareToken: text("share_token").unique(),
  isPublic: integer("is_public").notNull().default(0),
  ...timestamps,
});

export const tripDays = sqliteTable("trip_days", {
  id: text("id").primaryKey(),
  tripId: text("trip_id").notNull(),
  dayIndex: integer("day_index").notNull(),
  date: text("date"),
  title: text("title"),
  notes: text("notes"),
});

export const tripActivities = sqliteTable("trip_activities", {
  id: text("id").primaryKey(),
  dayId: text("day_id").notNull(),
  sort: integer("sort").notNull().default(0),
  timeLabel: text("time_label"),
  title: text("title").notNull(),
  kind: text("kind").notNull().default("activity"),
  durationMin: integer("duration_min"),
  costBdt: integer("cost_bdt"),
  notes: text("notes"),
  lat: real("lat"),
  lon: real("lon"),
});

export const savedDestinations = sqliteTable(
  "saved_destinations",
  {
    userId: text("user_id").notNull(),
    destinationId: text("destination_id").notNull(),
    createdAt: text("created_at").notNull().default("now"),
  },
  (table) => [primaryKey({ columns: [table.userId, table.destinationId] })],
);

export const savedArticles = sqliteTable(
  "saved_articles",
  {
    userId: text("user_id").notNull(),
    articleId: text("article_id").notNull(),
    createdAt: text("created_at").notNull().default("now"),
  },
  (table) => [primaryKey({ columns: [table.userId, table.articleId] })],
);

export const inquiries = sqliteTable("inquiries", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("general"),
  status: text("status", { enum: ["new", "open", "closed", "spam"] }).notNull().default("new"),
  createdAt: text("created_at").notNull().default("now"),
});

export const newsletterSubscribers = sqliteTable("newsletter_subscribers", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  locale: text("locale").notNull().default("en"),
  source: text("source"),
  consentAt: text("consent_at").notNull(),
  unsubscribedAt: text("unsubscribed_at"),
});

export const travelAlerts = sqliteTable("travel_alerts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  severity: text("severity", { enum: ["info", "caution", "warning"] }).notNull().default("info"),
  region: text("region"),
  sourceUrl: text("source_url"),
  sourceName: text("source_name"),
  startsAt: text("starts_at"),
  endsAt: text("ends_at"),
  active: integer("active").notNull().default(1),
  createdAt: text("created_at").notNull().default("now"),
});

export const faqs = sqliteTable("faqs", {
  id: text("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull().default("general"),
  sort: integer("sort").notNull().default(0),
});

export const announcements = sqliteTable("announcements", {
  id: text("id").primaryKey(),
  messageEn: text("message_en").notNull(),
  messageBn: text("message_bn"),
  link: text("link"),
  active: integer("active").notNull().default(1),
  sort: integer("sort").notNull().default(0),
  createdAt: text("created_at").notNull().default("now"),
});

export const contentRevisions = sqliteTable("content_revisions", {
  id: text("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  snapshot: text("snapshot").notNull(),
  editorId: text("editor_id"),
  createdAt: text("created_at").notNull().default("now"),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  actorId: text("actor_id"),
  actorEmail: text("actor_email"),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  detail: text("detail"),
  createdAt: text("created_at").notNull().default("now"),
});

export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull().default("now"),
});

export const rateLimits = sqliteTable("rate_limits", {
  bucket: text("bucket").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: integer("window_start").notNull(),
});

export type SourceLink = { label: string; url: string; verifiedAt?: string };

export type UserRow = typeof users.$inferSelect;
export type DestinationRow = typeof destinations.$inferSelect;
export type DistrictRow = typeof districts.$inferSelect;
export type AttractionRow = typeof attractions.$inferSelect;
export type ExperienceRow = typeof experiences.$inferSelect;
export type PackageRow = typeof packages.$inferSelect;
export type ListingRow = typeof listings.$inferSelect;
export type ArticleRow = typeof articles.$inferSelect;
export type TripRow = typeof trips.$inferSelect;
export type TripDayRow = typeof tripDays.$inferSelect;
export type TripActivityRow = typeof tripActivities.$inferSelect;
export type TravelAlertRow = typeof travelAlerts.$inferSelect;
export type FaqRow = typeof faqs.$inferSelect;
export type AnnouncementRow = typeof announcements.$inferSelect;
export type InquiryRow = typeof inquiries.$inferSelect;
export type NewsletterRow = typeof newsletterSubscribers.$inferSelect;
