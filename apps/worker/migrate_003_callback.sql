-- 21 Oct 2026 (Sion's Tab agent): call-back consent on eligibility checks
ALTER TABLE enquiries ADD COLUMN callback INTEGER DEFAULT 0;
