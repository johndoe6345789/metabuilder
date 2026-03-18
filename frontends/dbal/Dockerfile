# Multi-stage build: node_modules from base image, source built fresh
# Context: monorepo root (..)
# Requires: docker build -f deployment/base-images/Dockerfile.node-deps \
#           -t metabuilder/base-node-deps:latest .

# --- Build stage ---
ARG BASE_REGISTRY=metabuilder
FROM ${BASE_REGISTRY}/base-node-deps:latest AS builder

ARG DBAL_DAEMON_URL=http://dbal:8080
ENV DBAL_DAEMON_URL=$DBAL_DAEMON_URL

# ── Shared packages (resolved by transpilePackages) ─────────────────────────
# Only the workspace deps that dbal-ui actually imports.
#
# redux/api-clients → hooks-async → redux-slices (transitive chain)
COPY redux/api-clients/ ./redux/api-clients/
COPY redux/hooks-async/ ./redux/hooks-async/
COPY redux/slices/ ./redux/slices/
COPY redux/core-hooks/ ./redux/core-hooks/

# ── DBAL frontend (the app itself) ──────────────────────────────────────────
COPY frontends/dbal/ ./frontends/dbal/

# Build workspace library packages
RUN for ws in redux/slices redux/hooks-async redux/api-clients redux/core-hooks; do \
    npm run build -w "$ws" --if-present 2>&1 || echo "WARN: $ws build failed (non-critical)"; \
done

# Build the app
RUN cd frontends/dbal && npx next build

# --- Runtime stage ---
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/frontends/dbal/.next/standalone ./
COPY --from=builder /app/frontends/dbal/.next/static ./frontends/dbal/.next/static

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/dbal || exit 1

WORKDIR /app/frontends/dbal
CMD ["node", "server.js"]
