# syntax=docker/dockerfile:1.7
# frontend — standalone production build.
# Contexts: default=services/object-store/server/frontend, shared=shared

# -- Stage 1: deps --------------------------
FROM node:20-alpine AS deps
ARG NPM_REGISTRY=https://registry.npmjs.org
ENV NPM_CONFIG_REGISTRY=$NPM_REGISTRY
COPY --from=shared . /build/shared/
WORKDIR /build/services/object-store/server/frontend
COPY package.json package-lock.json* ./
RUN npm config set fetch-retries 5 \
  && npm config set fetch-retry-mintimeout 20000 \
  && npm config set fetch-retry-maxtimeout 120000
RUN npm install --prefer-offline --no-audit --no-fund
RUN ln -s \
    /build/services/object-store/server/frontend/node_modules \
    /build/node_modules

# -- Stage 2: build -------------------------
FROM deps AS build
ARG NEXT_BASE_PATH=
ENV NEXT_BASE_PATH=${NEXT_BASE_PATH}
WORKDIR /build/services/object-store/server/frontend
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN mkdir -p public
RUN npx next build --turbopack

# -- Stage 3: runner -------------------------
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 nextjs
COPY --from=build --chown=nextjs:nodejs \
    /build/services/object-store/server/frontend/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs \
    /build/services/object-store/server/frontend/public \
    ./services/object-store/server/frontend/public
COPY --from=build --chown=nextjs:nodejs \
    /build/services/object-store/server/frontend/.next/static \
    ./services/object-store/server/frontend/.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
WORKDIR /app/services/object-store/server/frontend
CMD ["node", "server.js"]
