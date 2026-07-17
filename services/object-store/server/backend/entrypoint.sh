#!/bin/sh
# Wait for PostgreSQL then run migrations and start server.

echo "[s3server] Waiting for PostgreSQL ..."
until pg_isready -h "$PGHOST" -p "${PGPORT:-5432}" -q 2>/dev/null; do
    sleep 1
done
echo "[s3server] PostgreSQL ready"

echo "[s3server] Running migrations ..."
for f in /app/migrations/*.sql; do
    echo "[s3server] Applying $(basename "$f") ..."
    PGPASSWORD="$PGPASSWORD" psql \
        -h "$PGHOST" -p "${PGPORT:-5432}" \
        -U "$PGUSER" -d "$PGDATABASE" \
        -f "$f" -q 2>&1 | grep -v "already exists"
done

echo "[s3server] Starting server on :${S3_PORT:-9000}"
exec s3server
