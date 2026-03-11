/**
 * Playwright global teardown
 * Stops the Testcontainers smoke stack started in global.setup.ts
 */

async function globalTeardown() {
  const environment = (globalThis as Record<string, unknown>).__TESTCONTAINERS_ENV__ as
    | { down: () => Promise<void> }
    | undefined

  if (environment) {
    console.log('[teardown] Stopping smoke stack...')
    await environment.down()
    console.log('[teardown] Smoke stack stopped')
  }
}

export default globalTeardown
