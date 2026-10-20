-- apps.bucklerfamily.estate D1 schema (cedwyn-apps) — Sion's Tab agent, 20 Oct 2026
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, pw TEXT NOT NULL, name TEXT, created TEXT,
  pending_ref TEXT, parcel TEXT, location TEXT, lat REAL, lon REAL, geo_label TEXT,
  sub_status TEXT DEFAULT 'none', sub_session TEXT UNIQUE, sub_at TEXT, camp_slug TEXT UNIQUE, sub_emailed INTEGER DEFAULT 0, sub_mail_error TEXT,
  hubspot_sub INTEGER DEFAULT 0, test INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS enquiries (id INTEGER PRIMARY KEY, ref TEXT UNIQUE NOT NULL, user_id INTEGER NOT NULL, parcel TEXT, title_no TEXT, country TEXT,
  year_lost TEXT, happened TEXT, contact_name TEXT, contact_email TEXT, contact_phone TEXT, status TEXT NOT NULL DEFAULT 'pending',
  session_id TEXT UNIQUE, created TEXT, paid_at TEXT, score INTEGER, grade TEXT, score_notes TEXT, emailed INTEGER DEFAULT 0, mail_error TEXT,
  hubspot INTEGER DEFAULT 0, test INTEGER DEFAULT 0);
CREATE INDEX IF NOT EXISTS enq_user ON enquiries(user_id);
CREATE TABLE IF NOT EXISTS rl (k TEXT PRIMARY KEY, n INTEGER, exp INTEGER);
CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT);
