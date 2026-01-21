import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  // Run both general e2e and MD3 conformance suites
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  timeout: 60_000,
  globalSetup: "./tests/e2e/setup/global-setup.ts",
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://127.0.0.1:3002",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium-desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1400, height: 900 },
      },
    },
    {
      name: "chromium-mobile",
      use: {
        ...devices["Pixel 5"],
      },
    },
  ],
  webServer: {
    command: "npm run dev -- -p 3002 -H 0.0.0.0",
    port: 3002,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
