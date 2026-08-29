/**
 * Bootstrap API endpoint
 *
 * One-time setup to seed the database via the C++ DBAL REST API.
 * Uses plain fetch — no hooks, no getDBALClient.
 *
 * POST /api/bootstrap
 */

import {
  dbalPost,
  dbalUpsert,
  seedPageTree,
} from './seed/dbal-writes'
import { SEED_PACKAGES } from './seed/packages'
import { SEED_PAGE_CONFIGS } from './seed/page-configs'
import { DEMO_SITE_TENANT } from './seed/demo-tenant'
import { DEMO_SITE_PAGE_CONFIGS } from './seed/demo-pages'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { applyRateLimit } from '@/lib/middleware'

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------













// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------





// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const limitResponse = applyRateLimit(request, 'bootstrap')
  if (limitResponse != null) {
    return limitResponse
  }

  const setupSecret = process.env.SETUP_SECRET
  const authHeader = request.headers.get('Authorization')
  if (
    setupSecret === undefined ||
    setupSecret.length === 0 ||
    authHeader !== `Bearer ${setupSecret}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = { packages: 0, pages: 0, skipped: 0, errors: 0 }

  try {
    const tenantRes = await dbalUpsert(
      'Tenant',
      DEMO_SITE_TENANT.id,
      DEMO_SITE_TENANT
    )
    if (tenantRes.ok) {
      results.pages++
      console.warn('[Seed] Created demo tenant: demo-site')
    } else if (tenantRes.status === 409) {
      results.skipped++
    } else {
      results.errors++
      console.warn(
        `[Seed] Failed to seed demo tenant: HTTP ${tenantRes.status}`
      )
    }
  } catch (error) {
    results.errors++
    console.warn(
      '[Seed] Failed to seed demo tenant:',
      error instanceof Error ? error.message : error
    )
  }

  for (const page of DEMO_SITE_PAGE_CONFIGS) {
    try {
      const { tree, ...row } = page as Record<string, unknown> & {
        tree?: Record<string, unknown>
      }
      const treeId =
        tree === undefined
          ? null
          : await seedPageTree(
              String(row.id),
              String(row.title ?? row.path),
              tree
            )
      const res = await dbalUpsert('PageConfig', page.id, {
        ...row,
        pageTreeId: treeId,
      })
      if (res.ok) {
        results.pages++
        console.warn(`[Seed] Upserted demo page: ${page.path}`)
      } else if (res.status === 409) {
        results.skipped++
      } else {
        results.errors++
        console.warn(
          `[Seed] Failed to seed demo page ${page.path}: HTTP ${res.status}`
        )
      }
    } catch (error) {
      results.errors++
      console.warn(
        `[Seed] Failed to seed demo page ${page.path}:`,
        error instanceof Error ? error.message : error
      )
    }
  }

  // Seed InstalledPackage records
  for (const pkg of SEED_PACKAGES) {
    try {
      const res = await dbalPost('InstalledPackage', {
        ...pkg,
        installedAt: Math.floor(Date.now() / 1000),
      })
      if (res.ok) {
        results.packages++
        console.warn(`[Seed] Created package: ${pkg.packageId}`)
      } else if (res.status === 409) {
        results.skipped++
      } else {
        results.errors++
        console.warn(
          `[Seed] Failed to seed package ${pkg.packageId}: HTTP ${res.status}`
        )
      }
    } catch (error) {
      results.errors++
      console.warn(
        `[Seed] Failed to seed package ${pkg.packageId}:`,
        error instanceof Error ? error.message : error
      )
    }
  }

  // Seed PageConfig records
  for (const page of SEED_PAGE_CONFIGS) {
    try {
      const res = await dbalPost('PageConfig', page)
      if (res.ok) {
        results.pages++
        console.warn(`[Seed] Created page: ${page.path}`)
      } else if (res.status === 409) {
        results.skipped++
      } else {
        results.errors++
        console.warn(
          `[Seed] Failed to seed page ${page.path}: HTTP ${res.status}`
        )
      }
    } catch (error) {
      results.errors++
      console.warn(
        `[Seed] Failed to seed page ${page.path}:`,
        error instanceof Error ? error.message : error
      )
    }
  }

  console.warn(
    `[Seed] Complete: ${results.packages} packages, ${results.pages} pages, ${results.skipped} skipped, ${results.errors} errors`
  )

  return NextResponse.json({
    success: true,
    message: 'Database seeded successfully',
    results,
  })
}
