CREATE TABLE IF NOT EXISTS enquiries (id INTEGER PRIMARY KEY AUTOINCREMENT, ref TEXT UNIQUE NOT NULL, created_at TEXT NOT NULL, type TEXT NOT NULL, name TEXT NOT NULL, org TEXT, email TEXT NOT NULL, item TEXT, message TEXT NOT NULL, consent INTEGER NOT NULL DEFAULT 1, ip_hash TEXT, country TEXT, status TEXT NOT NULL DEFAULT 'new', mailed INTEGER DEFAULT 0);
CREATE INDEX IF NOT EXISTS idx_enq_ip ON enquiries (ip_hash, created_at);-- v1.1.0 (21 Oct 2026): optional phone + call-back consent
ALTER TABLE enquiries ADD COLUMN phone TEXT;
ALTER TABLE enquiries ADD COLUMN callback INTEGER DEFAULT 0;
