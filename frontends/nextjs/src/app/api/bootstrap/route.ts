/**
 * Bootstrap API endpoint
 *
 * One-time setup to seed the database via the C++ DBAL REST API.
 * Uses plain fetch — no hooks, no getDBALClient.
 *
 * POST /api/bootstrap
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { applyRateLimit } from '@/lib/middleware'
import { hasValidSetupSecret } from './bootstrap-route/require-setup-secret'
import { emptySeedResults } from './bootstrap-route/types'
import { seedDemoTenant } from './bootstrap-route/seed-demo-tenant'
import { seedDemoPages } from './bootstrap-route/seed-demo-pages'
import { seedInstalledPackages } from './bootstrap-route/seed-packages'
import { seedPageConfigs } from './bootstrap-route/seed-page-configs'

export async function POST(request: NextRequest) {
  const limitResponse = applyRateLimit(request, 'bootstrap')
  if (limitResponse != null) {
    return limitResponse
  }

  if (!hasValidSetupSecret(request.headers.get('Authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = emptySeedResults()

  await seedDemoTenant(results)
  await seedDemoPages(results)
  await seedInstalledPackages(results)
  await seedPageConfigs(results)

  console.warn(
    `[Seed] Complete: ${results.packages} packages, ${results.pages} ` +
      `pages, ${results.skipped} skipped, ${results.errors} errors`
  )

  return NextResponse.json({
    success: true,
    message: 'Database seeded successfully',
    results,
  })
}
