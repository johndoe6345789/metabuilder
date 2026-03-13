/**
 * Playwright global setup
 *
 * 1. Starts the smoke-stack Docker containers via Testcontainers
 *    (nginx gateway + MySQL + MongoDB + Redis + admin tools)
 * 2. Seeds the database via the /api/setup endpoint
 */
import { DockerComposeEnvironment, Wait } from 'testcontainers'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

let environment: Awaited<ReturnType<DockerComposeEnvironment['up']>> | undefined

async function waitForServer(url: string, timeoutMs = 60000): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { method: 'GET' })
      if (res.ok || res.status === 401 || res.status === 405) return // server is up
    } catch {
      // not ready yet
    }
    await new Promise(r => setTimeout(r, 1000))
  }
  throw new Error(`Server at ${url} did not become ready within ${timeoutMs}ms`)
}

async function globalSetup() {
  // ── 1. Start smoke stack via Testcontainers ──────────────────────────────
  console.log('[setup] Starting smoke stack via Testcontainers...')
  const composeDir = resolve(__dirname, '../deployment')

  environment = await new DockerComposeEnvironment(composeDir, 'docker-compose.smoke.yml')
    .withWaitStrategy('nginx', Wait.forHealthCheck())
    .withWaitStrategy('phpmyadmin', Wait.forHealthCheck())
    .withWaitStrategy('mongo-express', Wait.forHealthCheck())
    .withWaitStrategy('redisinsight', Wait.forHealthCheck())
    .withStartupTimeout(180_000)
    .up()

  console.log('[setup] Smoke stack healthy')

  // Store ref for teardown
  ;(globalThis as Record<string, unknown>).__TESTCONTAINERS_ENV__ = environment

  // ── 2. Wait for dev servers (started by Playwright webServer config) ─────
  // ── 3. Seed database ────────────────────────────────────────────────────
  // workflowui uses basePath: '/workflowui', so the setup route is at /workflowui/api/setup
  const setupUrl = process.env.PLAYWRIGHT_BASE_URL
    ? new URL('/workflowui/api/setup', process.env.PLAYWRIGHT_BASE_URL.replace(/\/workflowui\/?$/, '')).href
    : 'http://localhost:3000/workflowui/api/setup'

  await waitForServer(setupUrl)

  try {
    const response = await fetch(setupUrl, { method: 'POST' })
    if (!response.ok) {
      throw new Error(`Seed endpoint returned ${response.status} ${response.statusText}`)
    }
    console.log('[setup] Database seeded successfully')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[setup] Failed to seed database:', message)
    throw new Error(`[setup] Seeding failed — aborting test suite. ${message}`)
  }
}

export default globalSetup
