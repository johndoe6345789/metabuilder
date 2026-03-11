import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 *
 * baseURL resolution:
 *   CI / local dev server: http://localhost:3000/workflowui/ (Next.js dev, port 3000)
 *   Docker stack:          http://localhost/workflowui/     (nginx, port 80)
 *
 * Override via PLAYWRIGHT_BASE_URL env var, e.g.:
 *   PLAYWRIGHT_BASE_URL=http://localhost/workflowui/ npx playwright test
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000/workflowui/';

export default defineConfig({
  testDir: './',
  testMatch: '**/*.spec.ts',
  /* Exclude smoke/debug/screenshot tests in CI — they require the full Docker
     stack on port 80 and are not compatible with the dev-server webServer config */
  testIgnore: process.env.CI ? [
    '**/deployment-smoke.spec.ts',
    '**/settings-debug.spec.ts',
    '**/screenshot-pastebin.spec.ts',
  ] : [],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  /* Start dev servers automatically when not running against a live Docker stack */
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : [
    {
      command: 'npm run dev -w workflowui',
      url: 'http://localhost:3000/workflowui/',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        NODE_ENV: 'development',
        NEXT_PUBLIC_API_URL: 'http://localhost:8080',
        NEXTAUTH_SECRET: 'test-secret',
        NEXTAUTH_URL: 'http://localhost:3000',
      },
    },
    {
      command: 'PORT=3001 npm run dev -w codesnippet',
      url: 'http://localhost:3001/pastebin/',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        NODE_ENV: 'development',
        PORT: '3001',
        NEXT_PUBLIC_DBAL_API_URL: 'http://localhost:8080',
        NEXT_PUBLIC_FLASK_BACKEND_URL: 'http://localhost:5000',
        NEXTAUTH_SECRET: 'test-secret',
        NEXTAUTH_URL: 'http://localhost:3001',
      },
    },
  ],

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
