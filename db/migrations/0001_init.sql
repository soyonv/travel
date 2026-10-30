-- Discover Bangladesh AI — initial schema (SQLite / Cloudflare D1)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'editor', 'admin')),
  locale        TEXT NOT NULL DEFAULT 'en',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS password_resets (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at    TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS districts (
  id               TEXT PRIMARY KEY,
  slug             TEXT NOT NULL UNIQUE,
  name_en          TEXT NOT NULL,
  name_bn          TEXT NOT NULL,
  division         TEXT NOT NULL,
  tagline          TEXT,
  intro_en         TEXT NOT NULL,
  intro_bn         TEXT,
  image            TEXT,
  lat              REAL,
  lon              REAL,
  best_season      TEXT,
  daily_budget_bdt INTEGER,
  transport        TEXT,
  foods            TEXT,
  tips             TEXT,
  sources          TEXT,
  verified_at      TEXT,
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_districts_division ON districts(division);

CREATE TABLE IF NOT EXISTS destinations (
  id                TEXT PRIMARY KEY,
  slug              TEXT NOT NULL UNIQUE,
  name_en           TEXT NOT NULL,
  name_bn           TEXT NOT NULL,
  district_id       TEXT REFERENCES districts(id) ON DELETE SET NULL,
  region            TEXT NOT NULL,
  category          TEXT NOT NULL,
  summary_en        TEXT NOT NULL,
  summary_bn        TEXT,
  description_md    TEXT NOT NULL,
  highlights        TEXT,
  best_time         TEXT,
  seasonal_note     TEXT,
  lat               REAL,
  lon               REAL,
  hero_image        TEXT,
  image_credit      TEXT,
  image_credit_url  TEXT,
  featured          INTEGER NOT NULL DEFAULT 0,
  verification      TEXT NOT NULL DEFAULT 'seed',
  verified_at       TEXT,
  sources           TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_destinations_featured ON destinations(featured);
CREATE INDEX IF NOT EXISTS idx_destinations_category ON destinations(category);
CREATE INDEX IF NOT EXISTS idx_destinations_district ON destinations(district_id);

CREATE TABLE IF NOT EXISTS attractions (
  id             TEXT PRIMARY KEY,
  slug           TEXT NOT NULL UNIQUE,
  name_en        TEXT NOT NULL,
  name_bn        TEXT,
  district_id    TEXT REFERENCES districts(id) ON DELETE SET NULL,
  destination_id TEXT REFERENCES destinations(id) ON DELETE SET NULL,
  category       TEXT NOT NULL,
  description    TEXT NOT NULL,
  fee_note       TEXT,
  entry_fee_bdt  INTEGER,
  lat            REAL,
  lon            REAL,
  image          TEXT,
  verified_at    TEXT,
  sources        TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_attractions_district ON attractions(district_id);
CREATE INDEX IF NOT EXISTS idx_attractions_destination ON attractions(destination_id);

CREATE TABLE IF NOT EXISTS experiences (
  id          TEXT PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name_en     TEXT NOT NULL,
  name_bn     TEXT,
  summary     TEXT NOT NULL,
  icon        TEXT,
  image       TEXT,
  sort        INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS packages (
  id               TEXT PRIMARY KEY,
  slug             TEXT NOT NULL UNIQUE,
  title            TEXT NOT NULL,
  destination_id   TEXT REFERENCES destinations(id) ON DELETE SET NULL,
  summary          TEXT NOT NULL,
  duration_days    INTEGER NOT NULL,
  price_from_bdt   INTEGER,
  price_note       TEXT,
  group_size       TEXT,
  includes         TEXT,
  excludes         TEXT,
  operator_name    TEXT,
  operator_contact TEXT,
  operator_status  TEXT NOT NULL DEFAULT 'unverified',
  available_dates  TEXT,
  image            TEXT,
  status           TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);

CREATE TABLE IF NOT EXISTS listings (
  id              TEXT PRIMARY KEY,
  slug            TEXT NOT NULL UNIQUE,
  type            TEXT NOT NULL,
  name            TEXT NOT NULL,
  district_id     TEXT REFERENCES districts(id) ON DELETE SET NULL,
  address         TEXT,
  phone           TEXT,
  website         TEXT,
  description     TEXT,
  price_note      TEXT,
  verification    TEXT NOT NULL DEFAULT 'unverified',
  verified_at     TEXT,
  booking_url     TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_listings_type ON listings(type);
CREATE INDEX IF NOT EXISTS idx_listings_district ON listings(district_id);

CREATE TABLE IF NOT EXISTS article_categories (
  id   TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS articles (
  id             TEXT PRIMARY KEY,
  slug           TEXT NOT NULL UNIQUE,
  type           TEXT NOT NULL DEFAULT 'guide' CHECK (type IN ('guide', 'blog')),
  title          TEXT NOT NULL,
  title_bn       TEXT,
  excerpt        TEXT NOT NULL,
  body_md        TEXT NOT NULL,
  category       TEXT NOT NULL,
  tags           TEXT,
  hero_image     TEXT,
  author         TEXT NOT NULL,
  destination_id TEXT REFERENCES destinations(id) ON DELETE SET NULL,
  district_id    TEXT REFERENCES districts(id) ON DELETE SET NULL,
  status         TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  published_at   TEXT,
  updated_at     TEXT NOT NULL DEFAULT (datetime('now')),
  reading_minutes INTEGER NOT NULL DEFAULT 5
);
CREATE INDEX IF NOT EXISTS idx_articles_type_status ON articles(type, status);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at);

CREATE TABLE IF NOT EXISTS trips (
  id           TEXT PRIMARY KEY,
  user_id      TEXT REFERENCES users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  origin       TEXT,
  destination  TEXT,
  start_date   TEXT,
  end_date     TEXT,
  travelers    INTEGER NOT NULL DEFAULT 2,
  budget_bdt   INTEGER,
  style        TEXT,
  notes        TEXT,
  share_token  TEXT UNIQUE,
  is_public    INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id);

CREATE TABLE IF NOT EXISTS trip_days (
  id        TEXT PRIMARY KEY,
  trip_id   TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_index INTEGER NOT NULL,
  date      TEXT,
  title     TEXT,
  notes     TEXT
);
CREATE INDEX IF NOT EXISTS idx_trip_days_trip ON trip_days(trip_id);

CREATE TABLE IF NOT EXISTS trip_activities (
  id           TEXT PRIMARY KEY,
  day_id       TEXT NOT NULL REFERENCES trip_days(id) ON DELETE CASCADE,
  sort         INTEGER NOT NULL DEFAULT 0,
  time_label   TEXT,
  title        TEXT NOT NULL,
  kind         TEXT NOT NULL DEFAULT 'activity',
  duration_min INTEGER,
  cost_bdt     INTEGER,
  notes        TEXT,
  lat          REAL,
  lon          REAL
);
CREATE INDEX IF NOT EXISTS idx_trip_activities_day ON trip_activities(day_id);

CREATE TABLE IF NOT EXISTS saved_destinations (
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  destination_id TEXT NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, destination_id)
);

CREATE TABLE IF NOT EXISTS saved_articles (
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, article_id)
);

CREATE TABLE IF NOT EXISTS inquiries (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'general',
  status     TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'open', 'closed', 'spam')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id              TEXT PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE,
  locale          TEXT NOT NULL DEFAULT 'en',
  source          TEXT,
  consent_at      TEXT NOT NULL,
  unsubscribed_at TEXT
);

CREATE TABLE IF NOT EXISTS travel_alerts (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  severity   TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'caution', 'warning')),
  region     TEXT,
  source_url TEXT,
  source_name TEXT,
  starts_at  TEXT,
  ends_at    TEXT,
  active     INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS faqs (
  id       TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer   TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  sort     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS announcements (
  id         TEXT PRIMARY KEY,
  message_en TEXT NOT NULL,
  message_bn TEXT,
  link       TEXT,
  active     INTEGER NOT NULL DEFAULT 1,
  sort       INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS content_revisions (
  id          TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id   TEXT NOT NULL,
  snapshot    TEXT NOT NULL,
  editor_id   TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_revisions_entity ON content_revisions(entity_type, entity_id);

CREATE TABLE IF NOT EXISTS audit_logs (
  id          TEXT PRIMARY KEY,
  actor_id    TEXT,
  actor_email TEXT,
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   TEXT,
  detail      TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rate_limits (
  bucket       TEXT PRIMARY KEY,
  count        INTEGER NOT NULL DEFAULT 0,
  window_start INTEGER NOT NULL
);
