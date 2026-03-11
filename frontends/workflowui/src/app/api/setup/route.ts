/**
 * POST /api/setup
 *
 * Seeds the database via the C++ DBAL REST API with system packages
 * and page configurations. Called by E2E global setup to bootstrap
 * test data before the test suite runs.
 */

import { NextResponse } from 'next/server'

const DBAL_URL =
  process.env.DBAL_DAEMON_URL ??
  process.env.DBAL_ENDPOINT ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:8080'

const ENTITY_BASE = `${DBAL_URL}/system/core`

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

async function dbalPost(entity: string, data: Record<string, unknown>): Promise<{ ok: boolean; status: number }> {
  const res = await fetch(`${ENTITY_BASE}/${entity}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return { ok: res.ok, status: res.status }
}

export async function POST() {
  const results = { packages: 0, pages: 0, skipped: 0, errors: 0 }

  for (const pkg of SEED_PACKAGES) {
    try {
      const res = await dbalPost('InstalledPackage', {
        ...pkg,
        installedAt: Math.floor(Date.now() / 1000),
      })
      if (res.ok) {
        results.packages++
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

  for (const page of SEED_PAGE_CONFIGS) {
    try {
      const res = await dbalPost('PageConfig', page)
      if (res.ok) {
        results.pages++
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

  console.warn(`[Seed] Complete: ${results.packages} packages, ${results.pages} pages, ${results.skipped} skipped, ${results.errors} errors`)

  return NextResponse.json({
    success: true,
    message: 'Database seeded successfully',
    results,
  })
}
