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
  await new Promise(resolve => setTimeout(resolve, 2000))

  // ── 3. Seed database ────────────────────────────────────────────────────
  const setupUrl = process.env.PLAYWRIGHT_BASE_URL
    ? new URL('/api/setup', process.env.PLAYWRIGHT_BASE_URL.replace(/\/workflowui\/?$/, '')).href
    : 'http://localhost:3000/api/setup'

  try {
    const response = await fetch(setupUrl, { method: 'POST' })
    if (!response.ok) {
      console.error('[setup] Failed to seed database:', response.status, response.statusText)
    } else {
      console.log('[setup] Database seeded successfully')
    }
  } catch (error) {
    console.warn('[setup] Setup endpoint not available (non-fatal):', (error as Error).message)
  }
}

export default globalSetup
