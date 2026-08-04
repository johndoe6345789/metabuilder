# Stage 1: Build the C++ CLI binary
ARG BASE_REGISTRY=metabuilder
FROM ${BASE_REGISTRY}/base-conan-cli:latest AS cli-builder

COPY frontends/cli/ /app/cli/
WORKDIR /app/cli
# The pkgrepo conan proxy does not serve libcurl's version listing, so
# cpr's `libcurl/[>=7.78.0 <9]` range cannot be resolved from it. Enable
# conancenter as a fallback so transitive deps (libcurl/openssl/zlib) resolve.
RUN conan remote enable conancenter
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
#
# /app is kept as the true monorepo root (not frontends/dbal itself), same
# convention as frontends/pastebin/Dockerfile -- @metabuilder/dbal-sso is a
# sibling workspace package (libraries/redux/dbal-sso) resolved via a
# node_modules symlink, and Next.js/Turbopack refuse to resolve packages
# symlinked to a target outside the recognized project root. Keeping the
# real frontends/dbal + libraries/redux/dbal-sso relative layout under one
# shared /app means the symlink target stays inside that root instead of
# escaping it.
FROM node:24-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY frontends/dbal/package.json frontends/dbal/package.json
COPY libraries/redux/dbal-sso/ libraries/redux/dbal-sso/
WORKDIR /app/frontends/dbal
RUN npm install

FROM node:24-alpine AS nextjs-builder
WORKDIR /app
COPY --from=deps /app/frontends/dbal/node_modules frontends/dbal/node_modules
COPY libraries/redux/dbal-sso/ libraries/redux/dbal-sso/
COPY frontends/dbal/ frontends/dbal/

ARG DBAL_DAEMON_URL=http://dbal:8080
ENV DBAL_DAEMON_URL=$DBAL_DAEMON_URL
ARG NEXT_PUBLIC_DBAL_OIDC_BASE_URL="/api/dbal"
ARG NEXT_PUBLIC_DBAL_OIDC_CLIENT_ID=dbal-console
ENV NEXT_PUBLIC_DBAL_OIDC_BASE_URL=$NEXT_PUBLIC_DBAL_OIDC_BASE_URL
ENV NEXT_PUBLIC_DBAL_OIDC_CLIENT_ID=$NEXT_PUBLIC_DBAL_OIDC_CLIENT_ID

WORKDIR /app/frontends/dbal
RUN mkdir -p public && npm run build

# Stage 3: Runtime - Ubuntu 24.04 (glibc 2.38 matches base-conan-cli build)
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

# Copy CLI binary and packages
COPY --from=cli-builder /app/cli/build/metabuilder-cli /usr/local/bin/metabuilder-cli
COPY packages/ /app/packages/

# Copy Next.js standalone output -- traced relative to the monorepo root
# (see nextjs-builder above), so it nests as frontends/dbal/server.js
# inside .next/standalone rather than sitting at its own root.
COPY --from=nextjs-builder /app/frontends/dbal/.next/standalone ./
COPY --from=nextjs-builder /app/frontends/dbal/.next/static ./frontends/dbal/.next/static
COPY --from=nextjs-builder /app/frontends/dbal/public ./frontends/dbal/public

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV METABUILDER_BASE_URL=http://dbal:8080
ENV METABUILDER_PACKAGES=/app/packages

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/dbal || exit 1

WORKDIR /app/frontends/dbal
CMD ["node", "server.js"]
