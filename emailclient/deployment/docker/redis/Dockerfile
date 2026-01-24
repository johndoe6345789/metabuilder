# Phase 8: Redis Cache & Celery Broker
# Email Client Implementation - Background Job Queue & Caching Layer

FROM redis:7-alpine

# Install additional utilities
RUN apk add --no-cache \
    curl \
    bash \
    ca-certificates

# Create data directory with proper permissions
RUN mkdir -p /data \
    && chown redis:redis /data \
    && chmod 700 /data

# Copy Redis configuration
COPY redis.conf /usr/local/etc/redis/redis.conf

# Fix permissions on configuration
RUN chmod 644 /usr/local/etc/redis/redis.conf \
    && chown redis:redis /usr/local/etc/redis/redis.conf

# Health check on port 6379
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD redis-cli --raw incr ping || exit 1

# Expose Redis port
# 6379 - Redis (standard)
EXPOSE 6379

# Create entrypoint script for initialization
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Run as redis user (unprivileged)
USER redis

# Start Redis server with configuration
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]
