# PostgreSQL 15+ Official Image with Email Service Configuration
# Supports multi-tenant email client with IMAP/POP3/SMTP backend

FROM postgres:16-alpine

# Set UTF-8 encoding and locale
ENV POSTGRES_INITDB_ARGS="-E UTF8 --locale=C"

# Install necessary extensions and utilities
RUN apk add --no-cache \
    postgresql-contrib \
    curl

# Copy initialization scripts
COPY init-email-service.sql /docker-entrypoint-initdb.d/01-init-email-service.sql
COPY init-indexes.sql /docker-entrypoint-initdb.d/02-init-indexes.sql
COPY init-connection-pooling.sql /docker-entrypoint-initdb.d/03-init-connection-pooling.sql

# Copy healthcheck script
COPY healthcheck.sh /healthcheck.sh
RUN chmod +x /healthcheck.sh

# Expose PostgreSQL port
EXPOSE 5432

# Health check configuration
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
    CMD /healthcheck.sh

# Set default command with optimized connection pooling settings
CMD ["postgres", \
    "-c", "max_connections=200", \
    "-c", "shared_buffers=256MB", \
    "-c", "effective_cache_size=1GB", \
    "-c", "maintenance_work_mem=64MB", \
    "-c", "checkpoint_completion_target=0.9", \
    "-c", "wal_buffers=16MB", \
    "-c", "default_statistics_target=100", \
    "-c", "random_page_cost=1.1", \
    "-c", "effective_io_concurrency=200", \
    "-c", "work_mem=1310kB", \
    "-c", "min_wal_size=1GB", \
    "-c", "max_wal_size=4GB"]
