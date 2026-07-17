-- Scope every bucket lookup to the authenticated API-key owner.
-- Existing development buckets belong to the seeded default owner.

ALTER TABLE buckets
    ADD COLUMN IF NOT EXISTS owner TEXT NOT NULL DEFAULT 'admin';

CREATE INDEX IF NOT EXISTS idx_buckets_owner_name
    ON buckets (owner, name);
