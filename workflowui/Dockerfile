# Multi-stage build for WorkflowUI
# Stage 1: Backend (Python Flask)
FROM python:3.9-slim as backend-builder

WORKDIR /app/backend

COPY backend/requirements.txt .
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir -r requirements.txt

COPY backend/ .

# Stage 2: Frontend (Node.js + Next.js)
FROM node:18-alpine as frontend-builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# Build Next.js application
RUN npm run build

# Stage 3: Runtime (Combined)
FROM node:18-alpine

WORKDIR /app

# Install Python runtime for backend
RUN apk add --no-cache python3 py3-pip gcc musl-dev linux-headers

# Copy frontend from builder
COPY --from=frontend-builder /app/node_modules ./node_modules
COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/package.json ./package.json
COPY --from=frontend-builder /app/next.config.js ./next.config.js

# Copy backend from builder
COPY --from=backend-builder /app/backend ./backend

# Install Python backend dependencies
RUN pip install --no-cache-dir --break-system-packages -r backend/requirements.txt

# Create data directory for SQLite
RUN mkdir -p /app/data /app/logs

# Environment variables
ENV NODE_ENV=production
ENV PYTHONUNBUFFERED=1
ENV DATABASE_URL=file:/app/data/workflows.db
ENV FLASK_APP=backend/server_sqlalchemy.py

# Expose ports
EXPOSE 3000 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start both services
CMD ["sh", "-c", "python3 backend/server_sqlalchemy.py & npm start"]
