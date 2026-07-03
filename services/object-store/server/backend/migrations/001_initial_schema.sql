-- 001_initial_schema.sql
-- S3-compatible object storage schema.

CREATE TABLE IF NOT EXISTS buckets (
    id          SERIAL PRIMARY KEY,
    name        TEXT UNIQUE NOT NULL,
    region      TEXT NOT NULL DEFAULT 'us-east-1',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS objects (
    id          BIGSERIAL PRIMARY KEY,
    bucket_id   INTEGER NOT NULL REFERENCES buckets(id)
                ON DELETE CASCADE,
    key         TEXT NOT NULL,
    etag        TEXT NOT NULL,
    size        BIGINT NOT NULL DEFAULT 0,
    content_type TEXT NOT NULL DEFAULT
                'application/octet-stream',
    storage_path TEXT NOT NULL,
    metadata    JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (bucket_id, key)
);

CREATE INDEX idx_objects_bucket_key
    ON objects (bucket_id, key);
CREATE INDEX idx_objects_prefix
    ON objects (bucket_id, key text_pattern_ops);

CREATE TABLE IF NOT EXISTS api_keys (
    id          SERIAL PRIMARY KEY,
    access_key  TEXT UNIQUE NOT NULL,
    secret_key  TEXT NOT NULL,
    owner       TEXT NOT NULL DEFAULT 'default',
    permissions TEXT NOT NULL DEFAULT 'read,write',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
