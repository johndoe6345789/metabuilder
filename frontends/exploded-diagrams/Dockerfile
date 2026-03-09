# Multi-stage build (standalone - no monorepo deps)
# Context: monorepo root (..)
FROM node:22-alpine AS deps
WORKDIR /app

COPY frontends/exploded-diagrams/package.json ./frontends/exploded-diagrams/
RUN cd frontends/exploded-diagrams && for i in 1 2 3 4 5; do \
      npm install && break \
      || (echo "npm install failed (attempt $i/5), retrying in $((i*10))s..." && sleep $((i*10))); \
    done

# --- Build stage ---
FROM deps AS builder
WORKDIR /app
COPY frontends/exploded-diagrams/ ./frontends/exploded-diagrams/

RUN cd frontends/exploded-diagrams && npx next build --webpack

# --- Runtime stage ---
FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/frontends/exploded-diagrams/.next/standalone ./
COPY --from=builder /app/frontends/exploded-diagrams/.next/static ./.next/static
COPY --from=builder /app/frontends/exploded-diagrams/public ./public

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/diagrams || exit 1

WORKDIR /app
CMD ["node", "server.js"]
