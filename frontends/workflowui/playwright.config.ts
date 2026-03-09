import { defineConfig, devices } from '@playwright/test';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';

/**
 * Playwright E2E configuration for workflowui
 * Tests are defined in JSON format in /workflowui/playwright/*.json
 */
export default defineConfig({
  testDir: '../e2e',
  testMatch: 'tests.spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:3000',
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
  // Expect server to already be running
  // (start manually with: npm run dev)
});
