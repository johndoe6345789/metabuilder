# Multi-stage prod build for packagerepo frontend — monorepo-aware so
# @metabuilder/dbal-sso (an npm workspace package, not published to npm)
# resolves. Context: monorepo root (../../..).
# Requires: metabuilder/base-node-deps:latest

# --- Build stage ---
ARG BASE_REGISTRY=metabuilder
FROM ${BASE_REGISTRY}/base-node-deps:latest AS builder

ARG NEXT_PUBLIC_DBAL_OIDC_BASE_URL=/api/dbal
ARG NEXT_PUBLIC_DBAL_OIDC_CLIENT_ID=packagerepo-web
ENV NEXT_PUBLIC_DBAL_OIDC_BASE_URL=${NEXT_PUBLIC_DBAL_OIDC_BASE_URL}
ENV NEXT_PUBLIC_DBAL_OIDC_CLIENT_ID=${NEXT_PUBLIC_DBAL_OIDC_CLIENT_ID}

COPY package.json .npmrc ./

COPY libraries/redux/dbal-sso/ ./libraries/redux/dbal-sso/

COPY frontends/packagerepo/frontend/ ./frontends/packagerepo/frontend/

RUN npm install --ignore-scripts

ENV NEXT_TELEMETRY_DISABLED=1
ARG BACKEND_URL=http://backend:5000
ENV BACKEND_URL=${BACKEND_URL}

RUN cd frontends/packagerepo/frontend && mkdir -p public && npx next build

# --- Runtime stage ---
FROM node:24-alpine
WORKDIR /app

COPY --from=builder /app/frontends/packagerepo/frontend/.next/standalone ./
COPY --from=builder /app/frontends/packagerepo/frontend/.next/static ./frontends/packagerepo/frontend/.next/static
COPY --from=builder /app/frontends/packagerepo/frontend/public ./frontends/packagerepo/frontend/public

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/packagerepo || exit 1

WORKDIR /app/frontends/packagerepo/frontend
CMD ["node", "server.js"]
