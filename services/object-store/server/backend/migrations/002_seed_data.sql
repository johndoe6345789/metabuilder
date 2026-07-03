-- 002_seed_data.sql
-- Default API key for development.

INSERT INTO api_keys (access_key, secret_key, owner,
                      permissions)
VALUES ('minioadmin', 'minioadmin', 'admin',
        'read,write,admin')
ON CONFLICT (access_key) DO NOTHING;
