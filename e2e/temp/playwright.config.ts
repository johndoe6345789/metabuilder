import { defineConfig, devices } from '@playwright/test';

/**
 * Root Playwright configuration for E2E tests
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Global setup to seed database before tests
  globalSetup: require.resolve('./e2e/global.setup.ts'),

  // Only look for test files in the e2e directory
  testDir: './e2e',

  // Only match files that end with .spec.ts (excludes .test.ts which are unit tests)
  testMatch: '**/*.spec.ts',
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: 'html',
  
  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:3000',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    // Generate Prisma client and start dev server
    // Note: Database schema must be manually pushed via: npm run db:push (from frontends/nextjs)
    command: 'npm --prefix frontends/nextjs run db:generate && npm --prefix frontends/nextjs run dev',
    url: 'http://localhost:3000/api/health',
    reuseExistingServer: !process.env.CI,
    timeout: 300 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      DATABASE_URL: 'file:../../prisma/prisma/dev.db',
    },
  },
});
