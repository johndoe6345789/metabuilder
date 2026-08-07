#!/bin/sh
# Wait for PostgreSQL then run migrations and start server.

echo "[email-service] Waiting for PostgreSQL ..."
until pg_isready -h "$PGHOST" -p "${PGPORT:-5432}" -q 2>/dev/null; do
    sleep 1
done
echo "[email-service] PostgreSQL ready"

echo "[email-service] Running migrations ..."
for f in /app/migrations/*.sql; do
    echo "[email-service] Applying $(basename "$f") ..."
    PGPASSWORD="$PGPASSWORD" psql \
        -h "$PGHOST" -p "${PGPORT:-5432}" \
        -U "$PGUSER" -d "$PGDATABASE" \
        -f "$f" -q 2>&1 | grep -v "already exists"
done

echo "[email-service] Starting server on :${PORT:-5000}"
exec email-service-server
