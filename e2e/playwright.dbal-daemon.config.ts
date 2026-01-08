import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './dbal-daemon',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm --prefix ../../frontends/nextjs run db:generate && npm --prefix ../../frontends/nextjs run dev',
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
