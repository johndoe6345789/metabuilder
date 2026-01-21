# syntax=docker/dockerfile:1
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Minimal system deps for TLS/certs
RUN apt-get update \
    && apt-get install -y ca-certificates libssl-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY smtp_relay /app/smtp_relay
COPY scripts /app/scripts
COPY README.md /app/README.md

# Default ports (override via env as needed)
EXPOSE 2525
EXPOSE 8080

# Simple healthcheck: dashboard should respond.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/', timeout=3).read()" || exit 1

CMD ["python", "-m", "smtp_relay.main"]
