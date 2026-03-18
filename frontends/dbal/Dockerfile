# Stage 1: Build the C++ CLI binary
ARG BASE_REGISTRY=metabuilder
FROM ${BASE_REGISTRY}/base-conan-deps:latest AS cli-builder

COPY frontends/cli/ /app/cli/
WORKDIR /app/cli
RUN conan install . \
      --output-folder=build \
      --build=missing \
      -s build_type=Release \
      -c tools.system.package_manager:mode=install \
    && cmake -S . -B build -G Ninja \
         -DCMAKE_BUILD_TYPE=Release \
         -DCMAKE_TOOLCHAIN_FILE=build/conan_toolchain.cmake \
    && cmake --build build --config Release

# Stage 2: Build the Next.js frontend
FROM node:24-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY frontends/dbal/package.json ./
RUN npm install --legacy-peer-deps

FROM node:24-alpine AS nextjs-builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY frontends/dbal/ .

ARG DBAL_DAEMON_URL=http://dbal:8080
ENV DBAL_DAEMON_URL=$DBAL_DAEMON_URL

RUN mkdir -p public && npm run build

# Stage 3: Runtime — Ubuntu 24.04 (glibc 2.38 matches conan-deps build)
FROM node:24-bookworm-slim AS node-bin
FROM ubuntu:24.04 AS runner
WORKDIR /app

# Copy Node.js from official image
COPY --from=node-bin /usr/local/bin/node /usr/local/bin/node
COPY --from=node-bin /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm

RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates wget libssl3 \
    && rm -rf /var/lib/apt/lists/*

# Copy CLI binary
COPY --from=cli-builder /app/cli/build/metabuilder-cli /usr/local/bin/metabuilder-cli

# Copy Next.js standalone output
COPY --from=nextjs-builder /app/public ./public
RUN mkdir .next
COPY --from=nextjs-builder /app/.next/standalone ./
COPY --from=nextjs-builder /app/.next/static ./.next/static

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV METABUILDER_BASE_URL=http://dbal:8080

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/dbal || exit 1

CMD ["node", "server.js"]
