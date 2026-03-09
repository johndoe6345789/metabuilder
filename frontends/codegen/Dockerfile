# Dev server: node_modules from base image, source copied fresh
# Context: monorepo root (..)
# Requires: docker build -f deployment/base-images/Dockerfile.node-deps \
#           -t metabuilder/base-node-deps:latest .
ARG BASE_REGISTRY=metabuilder
FROM ${BASE_REGISTRY}/base-node-deps:latest AS deps

# --- Dev server stage ---
FROM deps AS dev

# ── Shared packages (resolved by Turbopack aliases in next.config.js) ───────
# Each COPY targets only the source tree that codegen actually imports.
#
# types + interfaces (TS type definitions)
COPY types/ ./types/
COPY interfaces/ ./interfaces/

# hooks (shared React hooks)
COPY hooks/ ./hooks/

# icons (Material Symbols SCSS + React icon components — used by scss/ and fakemui)
COPY icons/ ./icons/

# scss (Material 3 SCSS, theme, atoms — loaded by sassOptions.loadPaths)
COPY scss/ ./scss/

# translations (i18n strings)
COPY translations/ ./translations/

# components + FakeMUI (UI component library)
COPY components/ ./components/

# workflow (DAG workflow engine — imported by components package)
COPY workflow/ ./workflow/

# ── Redux packages (all resolve to src/ via Turbopack aliases) ──────────────
COPY redux/core/ ./redux/core/
COPY redux/slices/ ./redux/slices/
COPY redux/hooks/ ./redux/hooks/
COPY redux/adapters/ ./redux/adapters/
COPY redux/api-clients/ ./redux/api-clients/
COPY redux/core-hooks/ ./redux/core-hooks/
COPY redux/hooks-async/ ./redux/hooks-async/
COPY redux/hooks-auth/ ./redux/hooks-auth/
COPY redux/hooks-canvas/ ./redux/hooks-canvas/
COPY redux/hooks-data/ ./redux/hooks-data/
COPY redux/hooks-forms/ ./redux/hooks-forms/
COPY redux/hooks-utils/ ./redux/hooks-utils/
COPY redux/middleware/ ./redux/middleware/
COPY redux/persist/ ./redux/persist/
COPY redux/services/ ./redux/services/
COPY redux/timing-utils/ ./redux/timing-utils/

# ── CodeForge IDE (the app itself) ──────────────────────────────────────────
COPY frontends/codegen/ ./frontends/codegen/

# ── Pre-build workspace packages (some need tsc before Turbopack can use) ───
RUN for ws in redux/core redux/slices redux/hooks redux/adapters \
    redux/hooks-async redux/api-clients redux/persist \
    components workflow; do \
    npm run build -w "$ws" --if-present 2>&1 || echo "WARN: $ws build failed (non-critical)"; \
done

# Clean any stale Turbopack cache so dev server compiles from fresh source
RUN rm -rf frontends/codegen/.next

ENV NODE_ENV=development
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/codegen || exit 1

WORKDIR /app/frontends/codegen
CMD ["npx", "next", "dev", "--turbopack", "-p", "3000"]
