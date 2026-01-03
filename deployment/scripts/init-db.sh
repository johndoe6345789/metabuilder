#!/bin/bash
set -e

# Initialize PostgreSQL database for MetaBuilder
# This script runs automatically when the container starts for the first time

echo "Initializing MetaBuilder database..."

# Wait for PostgreSQL to be ready
until pg_isready -U "$POSTGRES_USER"; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 2
done

# Create additional schemas if needed
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    
    -- Create schemas
    CREATE SCHEMA IF NOT EXISTS metabuilder;
    CREATE SCHEMA IF NOT EXISTS dbal;
    
    -- Grant permissions
    GRANT ALL PRIVILEGES ON DATABASE "$POSTGRES_DB" TO "$POSTGRES_USER";
    GRANT ALL PRIVILEGES ON SCHEMA metabuilder TO "$POSTGRES_USER";
    GRANT ALL PRIVILEGES ON SCHEMA dbal TO "$POSTGRES_USER";
EOSQL

echo "Database initialized successfully!"
