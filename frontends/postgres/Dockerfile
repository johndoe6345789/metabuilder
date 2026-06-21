# Multi-stage build — source + build only, no npm install.
# Deps are pre-baked into base-postgres-deps (immutable, rebuilt on package.json changes).
# Context: monorepo root (..)

# --- Build stage ---
ARG BASE_REGISTRY=metabuilder
FROM ${BASE_REGISTRY}/base-postgres-deps:latest AS builder

# Copy all source (workspace libs + app)
COPY hooks/ ./hooks/
COPY icons/ ./icons/
COPY scss/ ./scss/
COPY components/ ./components/
COPY redux/core/ ./redux/core/
COPY redux/slices/ ./redux/slices/
COPY redux/hooks/ ./redux/hooks/
COPY redux/adapters/ ./redux/adapters/
COPY redux/api-clients/ ./redux/api-clients/
COPY redux/core-hooks/ ./redux/core-hooks/
COPY redux/email/ ./redux/email/
COPY redux/hooks-async/ ./redux/hooks-async/
COPY redux/hooks-auth/ ./redux/hooks-auth/
COPY redux/hooks-canvas/ ./redux/hooks-canvas/
COPY redux/hooks-data/ ./redux/hooks-data/
COPY redux/hooks-forms/ ./redux/hooks-forms/
COPY redux/hooks-utils/ ./redux/hooks-utils/
COPY redux/middleware/ ./redux/middleware/
COPY redux/persist/ ./redux/persist/
COPY redux/services/ ./redux/services/
COPY redux/timing-utils/ ./redux/timing-utils/
COPY types/ ./types/
COPY interfaces/ ./interfaces/
COPY translations/ ./translations/
COPY workflow/ ./workflow/
COPY frontends/postgres/ ./frontends/postgres/

# Build workspace libraries
RUN for ws in redux/core redux/slices redux/hooks redux/adapters \
    redux/hooks-async redux/api-clients redux/persist \
    components workflow; do \
    npm run build -w "$ws" --if-present 2>&1 || { echo "ERROR: $ws build failed"; exit 1; }; \
done

# Build the app
ENV SKIP_ENV_VALIDATION=true
ENV JWT_SECRET=build-placeholder
ENV NEXT_PUBLIC_SENTRY_DISABLED=true
ENV NODE_OPTIONS="--max-old-space-size=3072"
RUN cd frontends/postgres && npx next build --webpack

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
