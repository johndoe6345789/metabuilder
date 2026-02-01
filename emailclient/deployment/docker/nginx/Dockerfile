# Nginx Alpine-based Reverse Proxy
# Phase 8: Email Client Reverse Proxy with SSL/TLS and Rate Limiting
# Usage: docker build -t metabuilder-email-nginx:latest .
# Run: docker run -d -p 80:80 -p 443:443 \
#      -v /path/to/nginx.conf:/etc/nginx/nginx.conf:ro \
#      -v /path/to/ssl:/etc/nginx/ssl:ro \
#      metabuilder-email-nginx:latest

FROM nginx:1.27-alpine

LABEL maintainer="MetaBuilder Team"
LABEL description="Nginx reverse proxy with SSL/TLS, rate limiting, gzip compression"
LABEL version="1.0.0"

# Install curl for health checks
RUN apk add --no-cache curl

# Create necessary directories
RUN mkdir -p /etc/nginx/ssl \
    && mkdir -p /var/cache/nginx \
    && mkdir -p /var/log/nginx \
    && mkdir -p /etc/nginx/conf.d \
    && mkdir -p /etc/nginx/upstream

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create dhparam for SSL (for production, this should be pre-generated)
# For development, we'll use a smaller one
RUN openssl dhparam -out /etc/nginx/ssl/dhparam.pem 1024 || true

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Expose ports: 80 (HTTP), 443 (HTTPS)
EXPOSE 80 443

# Default command
CMD ["nginx", "-g", "daemon off;"]
