# Multi-stage prod build for dockerterminal UI — monorepo-aware.
# Context: monorepo root (../..). Mirrors the codegen build so the
# @metabuilder/components (M3) workspace resolves and transpiles.
# Requires: metabuilder/base-node-deps:latest

# --- Build stage ---
ARG BASE_REGISTRY=metabuilder
FROM ${BASE_REGISTRY}/base-node-deps:latest AS builder

ARG NEXT_PUBLIC_API_URL=/terminal-api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
# Browser-reachable DBAL origin for the OIDC PKCE dance, same relative-path
# convention as pastebin/codegen/nextjs's build args.
ARG NEXT_PUBLIC_DBAL_OIDC_BASE_URL=/api/dbal
ARG NEXT_PUBLIC_DBAL_OIDC_CLIENT_ID=dockerterminal-web
ENV NEXT_PUBLIC_DBAL_OIDC_BASE_URL=${NEXT_PUBLIC_DBAL_OIDC_BASE_URL}
ENV NEXT_PUBLIC_DBAL_OIDC_CLIENT_ID=${NEXT_PUBLIC_DBAL_OIDC_CLIENT_ID}

COPY package.json .npmrc ./

# Shared workspace libraries (same set as codegen so M3 + its transitive
# deps resolve). Copied before source so this layer caches well.
COPY libraries/types/        ./libraries/types/
COPY libraries/interfaces/   ./libraries/interfaces/
COPY libraries/hooks/        ./libraries/hooks/
COPY libraries/icons/        ./libraries/icons/
COPY libraries/scss/         ./libraries/scss/
COPY libraries/translations/ ./libraries/translations/
COPY libraries/components/   ./libraries/components/
COPY libraries/workflow/     ./libraries/workflow/
COPY libraries/redux/dbal-sso/     ./libraries/redux/dbal-sso/
COPY libraries/redux/core/         ./libraries/redux/core/
COPY libraries/redux/slices/       ./libraries/redux/slices/
COPY libraries/redux/hooks/        ./libraries/redux/hooks/
COPY libraries/redux/adapters/     ./libraries/redux/adapters/
COPY libraries/redux/api-clients/  ./libraries/redux/api-clients/
COPY libraries/redux/core-hooks/   ./libraries/redux/core-hooks/
COPY libraries/redux/hooks-async/  ./libraries/redux/hooks-async/
COPY libraries/redux/hooks-auth/   ./libraries/redux/hooks-auth/
COPY libraries/redux/hooks-canvas/ ./libraries/redux/hooks-canvas/
COPY libraries/redux/hooks-data/   ./libraries/redux/hooks-data/
COPY libraries/redux/hooks-forms/  ./libraries/redux/hooks-forms/
COPY libraries/redux/hooks-utils/  ./libraries/redux/hooks-utils/
COPY libraries/redux/middleware/   ./libraries/redux/middleware/
COPY libraries/redux/persist/      ./libraries/redux/persist/
COPY libraries/redux/services/     ./libraries/redux/services/
COPY libraries/redux/timing-utils/ ./libraries/redux/timing-utils/

# Docker terminal UI source
COPY frontends/dockerterminal/frontend/ ./frontends/dockerterminal/frontend/

RUN npm install --ignore-scripts

RUN for ws in libraries/redux/core libraries/redux/slices \
    libraries/redux/hooks libraries/redux/adapters \
    libraries/redux/hooks-async libraries/redux/api-clients \
    libraries/redux/persist libraries/components libraries/workflow; do \
    npm run build -w "$ws" --if-present 2>&1 || { echo "ERROR: $ws build failed"; exit 1; }; \
done

RUN cd frontends/dockerterminal/frontend && npx next build --turbopack

# --- Runtime stage ---
FROM node:24-alpine
WORKDIR /app

COPY --from=builder /app/frontends/dockerterminal/frontend/.next/standalone ./
COPY --from=builder /app/frontends/dockerterminal/frontend/.next/static ./frontends/dockerterminal/frontend/.next/static
COPY --from=builder /app/frontends/dockerterminal/frontend/public ./frontends/dockerterminal/frontend/public

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/terminal || exit 1

WORKDIR /app/frontends/dockerterminal/frontend
CMD ["node", "server.js"]
