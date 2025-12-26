# DBAL Frontend

`frontends/dbal` is now a dedicated Next.js app that ships the DBAL Daemon overview plus a standalone `/api/status` endpoint.

## Structure

- `app/layout.tsx` wires up the serif/sans fonts, global background, and theme-aware `body` styles.
- `app/page.tsx` simply renders the shared `src/DaemonPage` export (metadata flows through the page for SEO).
- `app/globals.css` provides Tailwind base/utility imports plus a small reset so the page stands on its own.
- `app/api/status/route.ts` returns `getStatusResponse()` from `src/status.ts`, which the client-side `ServerStatusPanel` polls.
- `src/ServerStatusPanel.tsx` is a client component that reports health, latency, and error feedback inside the marketing shell.

## Running locally

```bash
cd frontends/dbal
npm install
npm run dev
```

Build and lint commands are the usual Next.js scripts (`npm run build`, `npm run lint`, `npm run typecheck`).

## Integration with the monorepo

The main `frontends/nextjs` app still imports `@dbal-ui/*` via the `tsconfig` path pointing to `frontends/dbal/src`, so nothing breaks when the standalone app ships in isolation.
