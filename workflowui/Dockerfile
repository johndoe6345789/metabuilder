# Multi-stage build for WorkflowUI
# Stage 1: Backend (Python Flask)
FROM python:3.9-slim as backend-builder

WORKDIR /app/backend

COPY workflowui/backend/requirements.txt .
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir -r requirements.txt

COPY workflowui/backend/ .

# Stage 2: Frontend (Node.js + Next.js)
FROM node:20-alpine as frontend-builder

WORKDIR /app

# Copy package files
COPY workflowui/package.json ./
# Don't copy package-lock.json - let npm generate it in container
RUN npm install

# Copy source code
COPY workflowui/ .
# Copy fakemui for imports
COPY fakemui/ ../fakemui

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

# Copy workflowui source code for dev server fallback
COPY workflowui/src ./src
COPY workflowui/tsconfig.json ./tsconfig.json

# Copy backend from builder
COPY --from=backend-builder /app/backend ./backend

# Install Python backend dependencies
RUN pip install --no-cache-dir --break-system-packages -r backend/requirements.txt

# Create data directory for SQLite
RUN mkdir -p /app/data /app/logs

# Environment variables
ENV NODE_ENV=production
ENV PYTHONUNBUFFERED=1
ENV DATABASE_URL=sqlite:////app/data/workflows.db
ENV FLASK_APP=backend/server_sqlalchemy.py

# Expose ports
EXPOSE 3000 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start both services (use dev server if production build fails)
CMD ["sh", "-c", "python3 backend/server_sqlalchemy.py & (test -d .next && npm start || npm run dev)"]
