# Multi-stage build: deps cached separately from source changes
# Context: monorepo root (..)
FROM node:24-alpine AS deps
WORKDIR /app

COPY package.json .npmrc ./

# Workspace package.json files
COPY libraries/types/package.json ./libraries/types/
COPY libraries/interfaces/package.json ./libraries/interfaces/
COPY libraries/translations/package.json ./libraries/translations/
COPY libraries/workflow/package.json ./libraries/workflow/
COPY libraries/hooks/package.json ./libraries/hooks/
COPY libraries/components/package.json ./libraries/components/
COPY libraries/components/m3/package.json ./libraries/components/m3/
COPY config/package.json ./config/
COPY libraries/scss/package.json ./libraries/scss/
COPY frontends/storybook/package.json ./frontends/storybook/
COPY frontends/nextjs/package.json ./frontends/nextjs/
COPY frontends/dbal/package.json ./frontends/dbal/
COPY libraries/redux/core/package.json ./libraries/redux/core/
COPY libraries/redux/slices/package.json ./libraries/redux/slices/
COPY libraries/redux/hooks/package.json ./libraries/redux/hooks/
COPY libraries/redux/adapters/package.json ./libraries/redux/adapters/
COPY libraries/redux/hooks-data/package.json ./libraries/redux/hooks-data/
COPY libraries/redux/hooks-auth/package.json ./libraries/redux/hooks-auth/
COPY libraries/redux/hooks-canvas/package.json ./libraries/redux/hooks-canvas/
COPY libraries/redux/hooks-async/package.json ./libraries/redux/hooks-async/
COPY libraries/redux/hooks-utils/package.json ./libraries/redux/hooks-utils/
COPY libraries/redux/hooks-forms/package.json ./libraries/redux/hooks-forms/
COPY libraries/redux/core-hooks/package.json ./libraries/redux/core-hooks/
COPY libraries/redux/api-clients/package.json ./libraries/redux/api-clients/
COPY libraries/redux/timing-utils/package.json ./libraries/redux/timing-utils/
COPY libraries/redux/middleware/package.json ./libraries/redux/middleware/
COPY libraries/redux/services/package.json ./libraries/redux/services/
COPY libraries/redux/persist/package.json ./libraries/redux/persist/

# Strip localhost Verdaccio registry — unreachable inside Docker; fall back to public npm
RUN sed -i '/@esbuild-kit:registry/d; /localhost:4873/d' .npmrc \
    && npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set maxsockets 5 \
    && npm install --ignore-scripts


# --- Build stage ---
FROM deps AS builder
COPY . .

# COPY . . restores the original .npmrc — strip localhost registry again
RUN sed -i '/@esbuild-kit:registry/d; /localhost:4873/d' .npmrc

# Re-link ALL workspaces so every dependent workspace can resolve local deps.
# A partial `-w` install only re-links the named workspaces and leaves
# @metabuilder/types (and other prebuilt local packages) unresolvable for the
# other workspaces this image builds (redux/slices, redux/adapters,
# redux/hooks-async, api-clients, persist, ...). A full workspace install
# rebuilds the complete node_modules/@metabuilder/* symlink tree and hoists
# workspace-local bins. No `2>/dev/null || true` — install failures must fail
# the build instead of being silently swallowed.
RUN npm install --ignore-scripts

# @vitejs/plugin-react imports this at config-load time; install it explicitly
# here so stale dependency-layer cache cannot leave Storybook without it.
RUN npm install @rolldown/pluginutils@^1.0.1 --ignore-scripts

# Build only core workspace libs needed by storybook components
RUN for ws in libraries/redux/core libraries/redux/slices \
    libraries/redux/hooks libraries/redux/adapters \
    libraries/redux/hooks-async libraries/redux/api-clients \
    libraries/redux/persist libraries/components libraries/workflow; do \
    npm run build -w "$ws" --if-present 2>&1 || { echo "ERROR: $ws build failed"; exit 1; }; \
done

# Fix npm bug with optional platform-specific deps on arm64
RUN npm rebuild rollup 2>/dev/null || npm install @rollup/rollup-linux-arm64-musl 2>/dev/null || true

RUN cd frontends/storybook && npx storybook build

# --- Runtime stage (nginx for correct subpath serving) ---
FROM nginx:alpine

# Place built storybook at /storybook/ subpath so asset URLs resolve correctly
COPY --from=builder /app/frontends/storybook/storybook-static /usr/share/nginx/html/storybook

# nginx config: serve /storybook/ with SPA fallback
RUN printf 'server {\n\
  listen 3000;\n\
  root /usr/share/nginx/html;\n\
  location /storybook/ {\n\
    try_files $uri $uri/ /storybook/index.html;\n\
  }\n\
  location = / { return 301 /storybook/; }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/storybook/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
