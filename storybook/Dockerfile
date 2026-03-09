# Multi-stage build: deps cached separately from source changes
# Context: monorepo root (..)
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json .npmrc ./

# Workspace package.json files
COPY types/package.json ./types/
COPY interfaces/package.json ./interfaces/
COPY translations/package.json ./translations/
COPY workflow/package.json ./workflow/
COPY hooks/package.json ./hooks/
COPY components/package.json ./components/
COPY components/fakemui/package.json ./components/fakemui/
COPY config/package.json ./config/
COPY scss/package.json ./scss/
COPY storybook/package.json ./storybook/
COPY frontends/nextjs/package.json ./frontends/nextjs/
COPY frontends/dbal/package.json ./frontends/dbal/
COPY redux/core/package.json ./redux/core/
COPY redux/slices/package.json ./redux/slices/
COPY redux/hooks/package.json ./redux/hooks/
COPY redux/adapters/package.json ./redux/adapters/
COPY redux/hooks-data/package.json ./redux/hooks-data/
COPY redux/hooks-auth/package.json ./redux/hooks-auth/
COPY redux/hooks-canvas/package.json ./redux/hooks-canvas/
COPY redux/hooks-async/package.json ./redux/hooks-async/
COPY redux/hooks-utils/package.json ./redux/hooks-utils/
COPY redux/hooks-forms/package.json ./redux/hooks-forms/
COPY redux/core-hooks/package.json ./redux/core-hooks/
COPY redux/api-clients/package.json ./redux/api-clients/
COPY redux/timing-utils/package.json ./redux/timing-utils/
COPY redux/middleware/package.json ./redux/middleware/
COPY redux/services/package.json ./redux/services/
COPY redux/persist/package.json ./redux/persist/

RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set maxsockets 5 \
    && npm install --ignore-scripts --legacy-peer-deps


# --- Build stage ---
FROM deps AS builder
COPY . .

# Ensure workspace-local bins are accessible (tsup may not be hoisted to root)
RUN npm install --ignore-scripts -w components -w components/fakemui -w config \
    -w types -w interfaces -w translations 2>/dev/null || true

# Build only core workspace libs needed by storybook components
RUN for ws in redux/core redux/slices redux/hooks redux/adapters \
    redux/hooks-async redux/api-clients redux/persist \
    components workflow; do \
    npm run build -w "$ws" --if-present 2>&1 || echo "WARN: $ws build failed (non-critical)"; \
done

# Fix npm bug with optional platform-specific deps on arm64
RUN npm rebuild rollup 2>/dev/null || npm install @rollup/rollup-linux-arm64-musl 2>/dev/null || true

RUN cd storybook && npx storybook build

# --- Runtime stage (nginx for correct subpath serving) ---
FROM nginx:alpine

# Place built storybook at /storybook/ subpath so asset URLs resolve correctly
COPY --from=builder /app/storybook/storybook-static /usr/share/nginx/html/storybook

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
