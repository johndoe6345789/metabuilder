# Multi-stage prod build for codegen — next build + standalone node server.
# Context: monorepo root (..)
# Requires: docker build -f deployment/base-images/Dockerfile.node-deps \
#           -t metabuilder/base-node-deps:latest .

# --- Build stage ---
ARG BASE_REGISTRY=metabuilder
ARG NEXT_PUBLIC_AI_ENABLED=true
FROM ${BASE_REGISTRY}/base-node-deps:latest AS builder
ARG NEXT_PUBLIC_AI_ENABLED
ENV NEXT_PUBLIC_AI_ENABLED=${NEXT_PUBLIC_AI_ENABLED}

# types + interfaces (TS type definitions)
COPY libraries/types/ ./libraries/types/
COPY libraries/interfaces/ ./libraries/interfaces/

# hooks (shared React hooks)
COPY libraries/hooks/ ./libraries/hooks/

# icons (Material Symbols SCSS + React icon components)
COPY libraries/icons/ ./libraries/icons/

# scss (Material 3 SCSS, theme, atoms)
COPY libraries/scss/ ./libraries/scss/

# translations (i18n strings)
COPY libraries/translations/ ./libraries/translations/

# components + FakeMUI
COPY libraries/components/ ./libraries/components/

# workflow (DAG workflow engine)
COPY libraries/workflow/ ./libraries/workflow/

# Redux packages
COPY libraries/redux/core/ ./libraries/redux/core/
COPY libraries/redux/slices/ ./libraries/redux/slices/
COPY libraries/redux/hooks/ ./libraries/redux/hooks/
COPY libraries/redux/adapters/ ./libraries/redux/adapters/
COPY libraries/redux/api-clients/ ./libraries/redux/api-clients/
COPY libraries/redux/core-hooks/ ./libraries/redux/core-hooks/
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

# CodeForge IDE
COPY frontends/codegen/ ./frontends/codegen/

RUN npm install --ignore-scripts --legacy-peer-deps

RUN for ws in libraries/redux/core libraries/redux/slices \
    libraries/redux/hooks libraries/redux/adapters \
    libraries/redux/hooks-async libraries/redux/api-clients \
    libraries/redux/persist libraries/components libraries/workflow; do \
    npm run build -w "$ws" --if-present 2>&1 || { echo "ERROR: $ws build failed"; exit 1; }; \
done

RUN cd frontends/codegen && npx next build --turbopack

# --- Runtime stage ---
FROM node:24-alpine
WORKDIR /app

COPY --from=builder /app/frontends/codegen/.next/standalone ./
COPY --from=builder /app/frontends/codegen/.next/static ./frontends/codegen/.next/static
COPY --from=builder /app/frontends/codegen/public ./frontends/codegen/public

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/codegen || exit 1

WORKDIR /app/frontends/codegen
CMD ["node", "server.js"]
