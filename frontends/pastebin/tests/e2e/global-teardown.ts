/**
 * Playwright global teardown — stops the Testcontainers E2E stack.
 */

export default async function globalTeardown() {
  if (process.env.NO_CONTAINERS || process.env.SKIP_WEBSERVER) return

  console.log("\n[testcontainers] Tearing down E2E stack...")

  const environment = (globalThis as Record<string, unknown>).__e2eEnvironment as
    | { down: (opts?: { timeout?: number; removeVolumes?: boolean }) => Promise<void> }
    | undefined

  if (environment) {
    await environment.down({ timeout: 30_000, removeVolumes: true })
    console.log("[testcontainers] Stack stopped.")
  }
}
