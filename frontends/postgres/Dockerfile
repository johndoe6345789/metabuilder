# Multi-stage build — scss + components + app source only.
# redux/workflow dist/ are pre-built in base-postgres-deps; this layer only
# pays for npm workspace re-link + Next.js compilation (fast with cache mount).
# Context: monorepo root (..)

# --- Build stage ---
ARG BASE_REGISTRY=metabuilder
FROM ${BASE_REGISTRY}/base-postgres-deps:latest AS builder

COPY package.json .npmrc ./

# Re-link workspace symlinks BEFORE source copies so this layer is cached on
# source-only changes (scss/component/app edits never touch package.json).
# --no-audit --prefer-offline make it fast when it does need to run.
RUN --mount=type=cache,target=/root/.npm \
    npm install --ignore-scripts --prefer-offline --no-audit

# Source copies come after npm install — invalidate the next build layer but
# NOT the npm step above. Workspace symlinks are path-based so they resolve
# correctly once the directories are populated by these COPYs.
COPY libraries/scss/       ./libraries/scss/
COPY libraries/components/ ./libraries/components/
COPY frontends/postgres/   ./frontends/postgres/

# Build the app — cache mount preserves .next/cache across rebuilds so
# turbopack only recompiles changed files (seconds for scss/component edits).
ENV SKIP_ENV_VALIDATION=true
ENV JWT_SECRET=build-placeholder
ENV NEXT_PUBLIC_SENTRY_DISABLED=true
ENV NODE_OPTIONS="--max-old-space-size=3072"
RUN --mount=type=cache,target=/app/frontends/postgres/.next/cache \
    cd frontends/postgres && npx next build --turbopack

# --- Runtime stage ---
FROM node:24-alpine
WORKDIR /app

COPY --from=builder /app/frontends/postgres/.next/standalone ./
COPY --from=builder /app/frontends/postgres/.next/static ./frontends/postgres/.next/static
COPY --from=builder /app/frontends/postgres/public ./frontends/postgres/public
COPY --from=builder /app/frontends/postgres/migrations ./frontends/postgres/migrations

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/postgres/admin/dashboard || exit 1

WORKDIR /app/frontends/postgres
CMD ["node", "server.js"]
