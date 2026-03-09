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

const DBAL_URL =
  process.env.DBAL_ENDPOINT ??
  process.env.DBAL_API_URL ??
  process.env.NEXT_PUBLIC_DBAL_API_URL ??
  'http://localhost:8080'

const ENTITY_BASE = `${DBAL_URL}/system/core`

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const SEED_PACKAGES = [
  { packageId: 'package_manager', version: '1.0.0', enabled: true, config: '{"autoUpdate":false,"systemPackage":true,"uninstallProtection":true}' },
  { packageId: 'ui_header', version: '1.0.0', enabled: true, config: '{"systemPackage":true}' },
  { packageId: 'ui_footer', version: '1.0.0', enabled: true, config: '{"systemPackage":true}' },
  { packageId: 'ui_home', version: '1.0.0', enabled: true, config: '{"systemPackage":true,"defaultRoute":"/","publicAccess":true}' },
  { packageId: 'ui_auth', version: '1.0.0', enabled: true, config: '{"systemPackage":true}' },
  { packageId: 'ui_login', version: '1.0.0', enabled: true, config: '{"systemPackage":true}' },
  { packageId: 'dashboard', version: '1.0.0', enabled: true, config: '{"systemPackage":true,"defaultRoute":"/"}' },
  { packageId: 'user_manager', version: '1.0.0', enabled: true, config: '{"systemPackage":true,"minLevel":4}' },
  { packageId: 'role_editor', version: '1.0.0', enabled: true, config: '{"systemPackage":false,"minLevel":4}' },
  { packageId: 'admin_dialog', version: '1.0.0', enabled: true, config: '{"systemPackage":false,"minLevel":4}' },
  { packageId: 'database_manager', version: '1.0.0', enabled: true, config: '{"systemPackage":false,"minLevel":5,"dangerousOperations":true}' },
  { packageId: 'schema_editor', version: '1.0.0', enabled: true, config: '{"systemPackage":false,"minLevel":5,"dangerousOperations":true}' },
]

const SEED_PAGE_CONFIGS = [
  { path: '/', title: 'MetaBuilder', description: 'Data-driven application platform', packageId: 'ui_home', component: 'home_page', componentTree: '{}', level: 0, requiresAuth: false, isPublished: true, sortOrder: 0 },
  { path: '/dashboard', title: 'Dashboard', packageId: 'dashboard', component: 'dashboard_home', componentTree: '{}', level: 1, requiresAuth: true, isPublished: true, sortOrder: 0 },
  { path: '/profile', title: 'User Profile', packageId: 'dashboard', component: 'user_profile', componentTree: '{}', level: 1, requiresAuth: true, isPublished: true, sortOrder: 50 },
  { path: '/login', title: 'Login', packageId: 'ui_login', component: 'login_page', componentTree: '{}', level: 0, requiresAuth: false, isPublished: true, sortOrder: 0 },
  { path: '/admin', title: 'Administration', packageId: 'admin_dialog', component: 'admin_panel', componentTree: '{}', level: 4, requiresAuth: true, isPublished: true, sortOrder: 0 },
  { path: '/admin/users', title: 'User Management', packageId: 'user_manager', component: 'user_list', componentTree: '{}', level: 4, requiresAuth: true, isPublished: true, sortOrder: 10 },
  { path: '/admin/roles', title: 'Role Editor', packageId: 'role_editor', component: 'role_editor', componentTree: '{}', level: 4, requiresAuth: true, isPublished: true, sortOrder: 20 },
  { path: '/admin/database', title: 'Database Manager', packageId: 'database_manager', component: 'database_manager', componentTree: '{}', level: 5, requiresAuth: true, isPublished: true, sortOrder: 30 },
  { path: '/admin/schema', title: 'Schema Editor', packageId: 'schema_editor', component: 'schema_editor', componentTree: '{}', level: 5, requiresAuth: true, isPublished: true, sortOrder: 40 },
  { path: '/admin/packages', title: 'Package Manager', packageId: 'package_manager', component: 'package_list', componentTree: '{}', level: 4, requiresAuth: true, isPublished: true, sortOrder: 50 },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function dbalPost(entity: string, data: Record<string, unknown>): Promise<{ ok: boolean; status: number }> {
  const res = await fetch(`${ENTITY_BASE}/${entity}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return { ok: res.ok, status: res.status }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const limitResponse = applyRateLimit(request, 'bootstrap')
  if (limitResponse) {
    return limitResponse
  }

  const results = { packages: 0, pages: 0, skipped: 0, errors: 0 }

  // Seed InstalledPackage records
  for (const pkg of SEED_PACKAGES) {
    try {
      const res = await dbalPost('InstalledPackage', {
        ...pkg,
        installedAt: Math.floor(Date.now() / 1000),
      })
      if (res.ok) {
        results.packages++
        console.log(`[Seed] Created package: ${pkg.packageId}`)
      } else if (res.status === 409) {
        results.skipped++
      } else {
        results.errors++
        console.warn(`[Seed] Failed to seed package ${pkg.packageId}: HTTP ${res.status}`)
      }
    } catch (error) {
      results.errors++
      console.warn(`[Seed] Failed to seed package ${pkg.packageId}:`, error instanceof Error ? error.message : error)
    }
  }

  // Seed PageConfig records
  for (const page of SEED_PAGE_CONFIGS) {
    try {
      const res = await dbalPost('PageConfig', page)
      if (res.ok) {
        results.pages++
        console.log(`[Seed] Created page: ${page.path}`)
      } else if (res.status === 409) {
        results.skipped++
      } else {
        results.errors++
        console.warn(`[Seed] Failed to seed page ${page.path}: HTTP ${res.status}`)
      }
    } catch (error) {
      results.errors++
      console.warn(`[Seed] Failed to seed page ${page.path}:`, error instanceof Error ? error.message : error)
    }
  }

  console.log(`[Seed] Complete: ${results.packages} packages, ${results.pages} pages, ${results.skipped} skipped, ${results.errors} errors`)

  return NextResponse.json({
    success: true,
    message: 'Database seeded successfully',
    results,
  })
}
