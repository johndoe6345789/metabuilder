-- 001_email.sql
-- Email accounts (IMAP/SMTP settings) and synced messages.

CREATE TABLE IF NOT EXISTS email_accounts (
    id              SERIAL PRIMARY KEY,
    tenant_id       TEXT NOT NULL,
    account_name    TEXT NOT NULL,
    email_address   TEXT NOT NULL,

    imap_host       TEXT,
    imap_port       INTEGER NOT NULL DEFAULT 993,
    imap_encryption TEXT NOT NULL DEFAULT 'tls',
    imap_username   TEXT,
    imap_password   TEXT,

    smtp_host       TEXT,
    smtp_port       INTEGER NOT NULL DEFAULT 587,
    smtp_encryption TEXT NOT NULL DEFAULT 'tls',
    smtp_username   TEXT,
    smtp_password   TEXT,

    last_sync_at    TIMESTAMPTZ,
    last_sync_uid   INTEGER NOT NULL DEFAULT 0,
    sync_status     TEXT NOT NULL DEFAULT 'idle',

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_accounts_tenant_id ON email_accounts (tenant_id);

CREATE TABLE IF NOT EXISTS email_messages (
    id              SERIAL PRIMARY KEY,
    account_id      INTEGER NOT NULL REFERENCES email_accounts(id),
    tenant_id       TEXT NOT NULL,
    message_id      TEXT UNIQUE,
    uid             INTEGER,
    folder          TEXT NOT NULL DEFAULT 'INBOX',

    subject         TEXT,
    from_address    TEXT,
    to_addresses    TEXT,
    cc_addresses    TEXT,
    bcc_addresses   TEXT,
    reply_to        TEXT,

    body_text       TEXT,
    body_html       TEXT,
    has_attachments BOOLEAN NOT NULL DEFAULT false,

    is_read         BOOLEAN NOT NULL DEFAULT false,
    is_starred      BOOLEAN NOT NULL DEFAULT false,
    is_draft        BOOLEAN NOT NULL DEFAULT false,

    date_sent       TIMESTAMPTZ,
    date_received   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_messages_tenant_id ON email_messages (tenant_id);
