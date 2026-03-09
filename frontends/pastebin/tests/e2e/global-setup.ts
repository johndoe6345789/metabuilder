/**
 * Playwright global setup — starts the pastebin E2E stack via Testcontainers.
 *
 * Spins up: postgres, dbal-init, dbal, pastebin-backend, pastebin, nginx
 * nginx is exposed on port 8888 (configurable via E2E_NGINX_PORT).
 *
 * Skipped when NO_CONTAINERS=true or SKIP_WEBSERVER=true is set.
 */
import path from "node:path"
import { fileURLToPath } from "node:url"
import { DockerComposeEnvironment, Wait } from "testcontainers"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const COMPOSE_DIR = path.resolve(__dirname, "../..")
const COMPOSE_FILE = "docker-compose.e2e.yml"

export default async function globalSetup() {
  if (process.env.NO_CONTAINERS || process.env.SKIP_WEBSERVER) return

  const port = process.env.E2E_NGINX_PORT || "8888"
  console.log(`\n[testcontainers] Starting E2E stack (nginx on :${port})...`)

  const environment = await new DockerComposeEnvironment(COMPOSE_DIR, COMPOSE_FILE)
    .withBuild()
    .withEnvironment({ E2E_NGINX_PORT: port })
    .withWaitStrategy("postgres-1", Wait.forHealthCheck())
    .withWaitStrategy("dbal-1", Wait.forHealthCheck())
    .withWaitStrategy("pastebin-backend-1", Wait.forHealthCheck())
    .withWaitStrategy("pastebin-1", Wait.forHealthCheck())
    .withWaitStrategy("nginx-1", Wait.forHealthCheck())
    .withStartupTimeout(300_000) // 5 min for first build
    .up()

  const baseURL = `http://localhost:${port}/pastebin/`
  console.log(`[testcontainers] Stack ready — baseURL: ${baseURL}`)

  // Store environment reference for teardown
  ;(globalThis as Record<string, unknown>).__e2eEnvironment = environment
}
