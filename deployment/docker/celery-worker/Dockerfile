# Celery Worker - Email Service Background Tasks
# Phase 8: Async Task Queue Worker Container
# Multi-stage build for optimal layer caching

# Build stage - Install dependencies
FROM python:3.11-slim as builder

WORKDIR /build

# Install build dependencies for compiling Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements files
COPY ../../../services/email_service/requirements.txt .

# Create virtual environment and install dependencies
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Runtime stage - Minimal image
FROM python:3.11-slim

LABEL maintainer="MetaBuilder Team"
LABEL description="Celery Worker for Email Service - Handles async email operations"
LABEL version="1.0.0"

WORKDIR /app

# Install only runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv

# Copy Celery tasks and application code
COPY ../../../services/email_service/tasks/ tasks/
COPY ../../../services/email_service/src/ src/
COPY ../../../services/email_service/.env.example .env

# Create logs directory with proper permissions
RUN mkdir -p /app/logs && chmod 777 /app/logs

# Set environment variables
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    CELERY_BROKER_URL=${REDIS_URL:-redis://redis:6379/0} \
    CELERY_RESULT_BACKEND=${CELERY_RESULT_BACKEND:-redis://redis:6379/1}

# Health check - verify worker is responsive
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD celery -A tasks.celery_app inspect ping || exit 1

# Non-root user for security
RUN useradd -m -u 1000 celeryworker && \
    chown -R celeryworker:celeryworker /app

USER celeryworker

# Run Celery worker
# Configuration:
# - 4 concurrent workers (configurable via CELERYD_CONCURRENCY env var)
# - Task timeout: 300 seconds (5 minutes, configurable via TASK_TIMEOUT env var)
# - Task soft time limit: 280 seconds (allows graceful shutdown)
# - Queue handling: sync, send, delete, spam, periodic
# - Logging: INFO level to stdout/logs
CMD ["celery", "-A", "tasks.celery_app", \
    "worker", \
    "--loglevel=${LOG_LEVEL:-info}", \
    "--concurrency=${CELERYD_CONCURRENCY:-4}", \
    "--time-limit=${TASK_TIMEOUT:-300}", \
    "--soft-time-limit=280", \
    "--pool=prefork", \
    "--queues=sync,send,delete,spam,periodic", \
    "--hostname=celery-worker@%h", \
    "--logfile=/app/logs/celery-worker.log", \
    "--pidfile=/tmp/celery-worker.pid"]
