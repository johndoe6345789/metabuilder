import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the S3 server frontend.
 * Backend on port 9000, frontend on port 3002.
 */
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL
    ?? 'http://localhost:3002';

export default defineConfig({
  testDir: './',
  testMatch: '**/*.spec.ts',
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
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
