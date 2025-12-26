# DBAL Frontend

This directory now hosts a standalone Next.js project that renders the DBAL Daemon marketing/status view and exposes the same `/api/status` endpoint used by the main workspace.

## Getting started

```bash
cd frontends/dbal
npm install
npm run dev
```

The project reuses the shared components in `src/` so the main `frontends/nextjs` app can still import `@dbal-ui/*`.
