import { defineConfig, devices } from '@playwright/test'

// Next.js basePath is '/app'; baseURL is the origin only so that absolute
// goto paths ('/app/...') resolve correctly without doubling the prefix.
const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3004'
const CI = process.env.CI !== undefined && process.env.CI !== ''

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['line']],
  use: {
    baseURL: BASE,
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL !== undefined
    ? undefined
    : [
        // A stand-in data layer for the server components that render a
        // published page. They fetch from the Node process, which
        // page.route cannot reach, so without this nothing about server
        // rendering, page access or metadata is testable end to end.
        {
          command: 'node e2e/dbal-stub.mjs',
          url: 'http://localhost:8099/system/core/User',
          // Reused like the dev server below, so a second run in the same
          // session does not collide with the stub the first left behind.
          reuseExistingServer: true,
          timeout: 30_000,
        },
        {
          command: 'next dev --turbopack --port 3004',
          url: 'http://localhost:3004/app',   // basePath health-check
          reuseExistingServer: true,
          timeout: 120_000,
          env: {
            // Server side reads DBAL_ENDPOINT first and talks to the
            // stub; the browser keeps 8080, where page.route still works.
            DBAL_ENDPOINT: 'http://localhost:8099',
            // Server Components call this app's own /api/v1 over the
            // network, and the default is port 3000 -- so under these
            // tests every entity view reached nothing. Nobody noticed
            // while they all answered "Authentication required" anyway.
            METABUILDER_INTERNAL_URL: 'http://127.0.0.1:3004/app',
            NEXT_PUBLIC_DBAL_API_URL: 'http://localhost:8080',
            NEXT_PUBLIC_MEDIA_API_URL: 'http://localhost:8090',
            NEXT_PUBLIC_S3_API_URL: 'http://localhost:9000',
          },
        },
      ],
})
