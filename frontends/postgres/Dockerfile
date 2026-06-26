# Multi-stage build — source + build only, no npm install.
# Deps are pre-baked into base-postgres-deps (immutable, rebuilt on package.json changes).
# Context: monorepo root (..)

# --- Build stage ---
ARG BASE_REGISTRY=metabuilder
FROM ${BASE_REGISTRY}/base-postgres-deps:latest AS builder

COPY package.json .npmrc ./

# Copy stable libraries first — these rarely change so their layers stay cached
# across SCSS/component/app edits, keeping the library build loop fast.
COPY libraries/types/ ./libraries/types/
COPY libraries/interfaces/ ./libraries/interfaces/
COPY libraries/translations/ ./libraries/translations/
COPY libraries/hooks/ ./libraries/hooks/
COPY libraries/icons/ ./libraries/icons/
COPY libraries/workflow/ ./libraries/workflow/
COPY libraries/redux/core/ ./libraries/redux/core/
COPY libraries/redux/slices/ ./libraries/redux/slices/
COPY libraries/redux/hooks/ ./libraries/redux/hooks/
COPY libraries/redux/adapters/ ./libraries/redux/adapters/
COPY libraries/redux/api-clients/ ./libraries/redux/api-clients/
COPY libraries/redux/core-hooks/ ./libraries/redux/core-hooks/
COPY libraries/redux/email/ ./libraries/redux/email/
COPY libraries/redux/hooks-async/ ./libraries/redux/hooks-async/
COPY libraries/redux/hooks-auth/ ./libraries/redux/hooks-auth/
COPY libraries/redux/hooks-canvas/ ./libraries/redux/hooks-canvas/
COPY libraries/redux/hooks-data/ ./libraries/redux/hooks-data/
COPY libraries/redux/hooks-forms/ ./libraries/redux/hooks-forms/
COPY libraries/redux/hooks-utils/ ./libraries/redux/hooks-utils/
COPY libraries/redux/middleware/ ./libraries/redux/middleware/
COPY libraries/redux/persist/ ./libraries/redux/persist/
COPY libraries/redux/services/ ./libraries/redux/services/
COPY libraries/redux/timing-utils/ ./libraries/redux/timing-utils/
# SCSS and components change frequently — copy last so above layers stay cached
COPY libraries/scss/ ./libraries/scss/
COPY libraries/components/ ./libraries/components/
# App source last — changes most often
COPY frontends/postgres/ ./frontends/postgres/

# Re-link workspaces after copying source so npm sees the current root manifest
# and rebuilds node_modules/@metabuilder/* workspace symlinks.
RUN --mount=type=cache,target=/root/.npm \
    npm install --ignore-scripts

# Build workspace libraries
RUN --mount=type=cache,target=/root/.cache/tsup \
    for ws in libraries/redux/core libraries/redux/slices \
    libraries/redux/hooks libraries/redux/adapters \
    libraries/redux/hooks-async libraries/redux/api-clients \
    libraries/redux/persist libraries/components libraries/workflow; do \
    npm run build -w "$ws" --if-present 2>&1 || { echo "ERROR: $ws build failed"; exit 1; }; \
done

# Build the app — cache mount preserves .next/cache across rebuilds (turbopack
# uses it for incremental compilation; near-instant on SCSS-only changes).
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
