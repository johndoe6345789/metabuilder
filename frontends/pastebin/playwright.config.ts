import { defineConfig, devices } from "@playwright/test"

// Three modes:
//   Default (or USE_TESTCONTAINERS=true) → Testcontainers spins up full stack, real DB calls
//   SKIP_WEBSERVER=true                  → run against manually started Docker stack at localhost/pastebin/
//   NO_CONTAINERS=true                   → start Next.js dev server on port 3004 (no Docker)
const noContainers = !!process.env.NO_CONTAINERS
const useDocker = !!process.env.SKIP_WEBSERVER
const useTestcontainers = !noContainers && !useDocker

const e2ePort = process.env.E2E_NGINX_PORT || "8888"

const baseURL = useTestcontainers
  ? `http://localhost:${e2ePort}/pastebin/`
  : useDocker
    ? "http://localhost/pastebin/"
    : "http://127.0.0.1:3004"

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 1,
  workers: 4,
  use: {
    baseURL,
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
  // Testcontainers mode (default): global setup/teardown manage the stack
  ...(useTestcontainers && {
    globalSetup: "./tests/e2e/global-setup.ts",
    globalTeardown: "./tests/e2e/global-teardown.ts",
  }),
  // Dev server mode: start Next.js locally (no Docker)
  ...(noContainers && {
    webServer: {
      command: "npm run dev -- -p 3004 -H 0.0.0.0",
      port: 3004,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  }),
})
