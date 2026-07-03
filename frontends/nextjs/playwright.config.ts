import { defineConfig, devices } from '@playwright/test'

// Next.js basePath is '/app'; baseURL is the origin only so that absolute
// goto paths ('/app/...') resolve correctly without doubling the prefix.
const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3004'

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
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
    : {
        command: 'next dev --turbopack --port 3004',
        url: 'http://localhost:3004/app',   // basePath health-check
        reuseExistingServer: true,
        timeout: 120_000,
        env: {
          NEXT_PUBLIC_DBAL_API_URL: 'http://localhost:8080',
          NEXT_PUBLIC_MEDIA_API_URL: 'http://localhost:8090',
          NEXT_PUBLIC_S3_API_URL: 'http://localhost:9000',
        },
      },
})
