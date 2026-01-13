# Multi-stage Dockerfile for MetaBuilder Next.js App
# Optimized for production deployment with GHCR

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat

# Copy package files for all workspaces
COPY package*.json ./
COPY package-lock.json ./
COPY frontends/nextjs/package*.json ./frontends/nextjs/
COPY dbal/development/package*.json ./dbal/development/
COPY config/package*.json ./config/

# Install dependencies
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontends/nextjs/node_modules ./frontends/nextjs/node_modules
COPY --from=deps /app/dbal/development/node_modules ./dbal/development/node_modules

# Copy source code
COPY . .

# Generate DBAL types from YAML schemas
WORKDIR /app/dbal/development
RUN npx tsx ../shared/tools/codegen/generate-types.ts

# Generate Prisma Client
WORKDIR /app/frontends/nextjs
RUN npm run db:generate

# Build Next.js app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install runtime dependencies
RUN apk add --no-cache \
    tini \
    curl \
    dumb-init

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/frontends/nextjs/public ./public
COPY --from=builder /app/frontends/nextjs/.next/standalone ./
COPY --from=builder /app/frontends/nextjs/.next/static ./.next/static

# Copy Prisma schema and generated client from workspace root
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Set proper permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Use dumb-init to handle signals
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["node", "server.js"]
