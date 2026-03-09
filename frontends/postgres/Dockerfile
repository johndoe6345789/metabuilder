# Multi-stage build: node_modules from base image, source built fresh
# Context: monorepo root (..)
# Requires: docker build -f deployment/base-images/Dockerfile.node-deps \
#           -t metabuilder/base-node-deps:latest .

# --- Build stage ---
ARG BASE_REGISTRY=metabuilder
FROM ${BASE_REGISTRY}/base-node-deps:latest AS builder

# ── Shared packages (resolved by transpilePackages + webpack aliases) ────────
# Each COPY targets only the source tree that postgres actually imports.
#
# hooks (shared React hooks)
COPY hooks/ ./hooks/

# icons (React icon components — imported by components/fakemui)
COPY icons/ ./icons/

# scss (Material 3 SCSS, theme, atoms — loaded by sassOptions.includePaths)
COPY scss/ ./scss/

# components + FakeMUI (UI component library)
COPY components/ ./components/

# ── Redux packages (all — small TS source, avoids transitive dep breakage) ───
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

# types (transitive dependency via hooks)
COPY types/ ./types/

# workflow (DAG engine — imported by components package)
COPY workflow/ ./workflow/

# ── Postgres Dashboard (the app itself) ──────────────────────────────────────
COPY frontends/postgres/ ./frontends/postgres/

# Build workspace library packages
RUN for ws in redux/core redux/slices redux/hooks redux/adapters \
    redux/hooks-async redux/api-clients redux/persist \
    components workflow; do \
    npm run build -w "$ws" --if-present 2>&1 || echo "WARN: $ws build failed (non-critical)"; \
done

# Build the app
ENV SKIP_ENV_VALIDATION=true
ENV JWT_SECRET=build-placeholder
ENV NEXT_PUBLIC_SENTRY_DISABLED=true
ENV NODE_OPTIONS="--max-old-space-size=3072"
RUN cd frontends/postgres && npx next build --webpack

# --- Runtime stage ---
FROM node:20-alpine
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
