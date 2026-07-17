# Multi-stage build: node_modules from base image, source built fresh
# Context: monorepo root (..)
# Requires: docker build -f deployment/base-images/Dockerfile.node-deps \
#           -t metabuilder/base-node-deps:latest .

# --- Build stage ---
ARG BASE_REGISTRY=metabuilder
FROM ${BASE_REGISTRY}/base-node-deps:latest AS builder

COPY package.json .npmrc ./

# ── Shared packages (resolved by transpilePackages + turbopack resolveAlias) ──
# Each COPY targets only the source tree that workflowui actually imports.
#
# types + interfaces (TS type definitions)
COPY libraries/types/ ./libraries/types/
COPY libraries/interfaces/ ./libraries/interfaces/

# hooks (shared React hooks)
COPY libraries/hooks/ ./libraries/hooks/

# icons (React icon components — imported by components/m3)
COPY libraries/icons/ ./libraries/icons/

# scss (Material 3 SCSS, theme, atoms — loaded by sassOptions)
COPY libraries/scss/ ./libraries/scss/

# translations (i18n strings)
COPY libraries/translations/ ./libraries/translations/

# components + M3 (UI component library)
COPY libraries/components/ ./libraries/components/

# ── Redux packages (all — small TS source, avoids transitive dep breakage) ───
COPY libraries/redux/core/ ./libraries/redux/core/
COPY libraries/redux/slices/ ./libraries/redux/slices/
COPY libraries/redux/hooks/ ./libraries/redux/hooks/
COPY libraries/redux/adapters/ ./libraries/redux/adapters/
COPY libraries/redux/api-clients/ ./libraries/redux/api-clients/
COPY libraries/redux/core-hooks/ ./libraries/redux/core-hooks/
COPY libraries/redux/email/ ./libraries/redux/email/
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

# workflow (DAG engine — imported by components package)
COPY libraries/workflow/ ./libraries/workflow/

# ── WorkflowUI (the app itself) ─────────────────────────────────────────────
COPY frontends/workflowui/ ./frontends/workflowui/

# Re-link workspaces so every copied workspace can resolve local deps.
# The base image installed deps from manifests only; now that real workspace
# source has been COPYed in, re-run the full workspace install so npm rebuilds
# the complete node_modules/@metabuilder/* symlink tree (e.g. @metabuilder/types
# for redux/slices, redux/adapters, redux/hooks-async, api-clients, persist).
RUN npm install --ignore-scripts

# Build workspace library packages
RUN for ws in libraries/redux/core libraries/redux/slices \
    libraries/redux/hooks libraries/redux/adapters \
    libraries/redux/hooks-async libraries/redux/api-clients \
    libraries/redux/persist libraries/components libraries/workflow; do \
    npm run build -w "$ws" --if-present 2>&1 || { echo "ERROR: $ws build failed"; exit 1; }; \
done

# Build the app
RUN cd frontends/workflowui && npx next build --turbopack

# --- Runtime stage ---
# Pinned to alpine3.21 (Python 3.12) on purpose: node:24-alpine moved to
# alpine3.24 / Python 3.14, for which pydantic-core has no musl wheel and its
# pinned pyo3 won't compile -> pip install fails. 3.12 installs from a wheel.
FROM node:24-alpine3.21
WORKDIR /app

# Install Python for Flask backend
RUN apk add --no-cache python3 py3-pip

# Copy standalone Next.js output
COPY --from=builder /app/frontends/workflowui/.next/standalone ./
COPY --from=builder /app/frontends/workflowui/.next/static ./frontends/workflowui/.next/static
COPY --from=builder /app/frontends/workflowui/public ./frontends/workflowui/public

# Copy Flask backend
COPY --from=builder /app/frontends/workflowui/backend ./backend
RUN pip3 install --no-cache-dir --break-system-packages -r /app/backend/requirements.txt

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000 5000

HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/ || exit 1

WORKDIR /app/frontends/workflowui
CMD ["sh", "-c", "python3 /app/backend/server_sqlalchemy.py & node server.js"]
