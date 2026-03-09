# Phase 8: Email Service Container
# Email Client Implementation - REST API Layer for IMAP/SMTP Operations
# Production-ready Flask API with Celery background workers

FROM python:3.11-slim as builder

WORKDIR /build

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libssl-dev \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements (path relative to build context: emailclient/)
COPY deployment/docker/email-service/requirements.txt .

# Create virtual environment and install dependencies
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Runtime stage
FROM python:3.11-slim

LABEL maintainer="MetaBuilder <dev@metabuilder.local>"
LABEL description="Email Service - Phase 8 Email Client Implementation"
LABEL version="1.0.0"

WORKDIR /app

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv

# Copy application code from services/email_service
COPY services/email_service/app.py .
COPY services/email_service/src/ src/
COPY services/email_service/tasks/ tasks/

# Create directories for logs and data
RUN mkdir -p /app/logs /app/data && \
    chmod 755 /app/logs /app/data

# Set environment variables
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    FLASK_ENV=production \
    FLASK_HOST=0.0.0.0 \
    FLASK_PORT=5000 \
    GUNICORN_WORKERS=4 \
    GUNICORN_THREADS=2 \
    GUNICORN_TIMEOUT=120

# Add non-root user for security
RUN useradd -m -u 1000 -s /sbin/nologin emailservice && \
    chown -R emailservice:emailservice /app

USER emailservice

# Health check - verify Flask API is responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Expose Flask API port
EXPOSE 5000

# Run gunicorn with 4 workers for production
# Logs go to stdout/stderr so docker logs captures them
CMD ["gunicorn", \
     "--bind", "0.0.0.0:5000", \
     "--workers", "4", \
     "--threads", "2", \
     "--worker-class", "gthread", \
     "--max-requests", "10000", \
     "--max-requests-jitter", "1000", \
     "--timeout", "120", \
     "--access-logfile", "-", \
     "--error-logfile", "-", \
     "--log-level", "info", \
     "app:app"]
