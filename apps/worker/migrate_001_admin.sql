-- v1.1 admin (20 Oct 2026)
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
ALTER TABLE users ADD COLUMN suspended INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN erased INTEGER DEFAULT 0;
CREATE TABLE IF NOT EXISTS admin_setup (token_hash TEXT PRIMARY KEY, expires INTEGER NOT NULL, used INTEGER DEFAULT 0, created TEXT);
CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY, at TEXT, admin_id INTEGER, action TEXT, target TEXT, detail TEXT);
CREATE TABLE IF NOT EXISTS refunds (id INTEGER PRIMARY KEY, at TEXT, admin_id INTEGER, kind TEXT, target TEXT, session_id TEXT, status TEXT, stripe_refund TEXT, note TEXT);
