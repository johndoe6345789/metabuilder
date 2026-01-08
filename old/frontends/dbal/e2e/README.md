# DBAL End-to-End Tests

This directory contains Playwright smoke tests for the standalone DBAL landing page and its status endpoint.

## Running the suite

```bash
cd frontends/dbal
npm install
npx playwright install chromium
npm run test:e2e
```

Use `npm run test:e2e:headed` to see the browser or `npm run test:e2e:ui` to launch the Playwright Inspector.

## Configuration

- `playwright.config.ts` targets `http://127.0.0.1:3001` and starts the DBAL dev server at that port.
- `tsconfig.playwright.json` keeps the test build focused on the `e2e` directory.
- The tests exercise the `ServerStatusPanel` UI and the `/api/status` route that backs it.
