import { NextResponse } from 'next/server'
import {
  loadSchemaRegistry,
  getPendingMigrations,
} from '@/lib/schema/schema-registry'
import { requireGodLevel } from './require-god-level'
import { getRegistryPath } from './paths'

/**
 * GET /api/dbal/schema
 * Returns the current schema registry status.
 *
 * Note: This endpoint is for admin/system use. Requires god level access.
 * For tenant-scoped data, use /api/v1/{tenant}/{package}/{entity}
 */
export async function GET(request: Request) {
  const auth = await requireGodLevel(request)
  if (!auth.ok) return auth.response

  try {
    const registryPath = getRegistryPath()
    const registry = loadSchemaRegistry(registryPath)
    const pending = getPendingMigrations(registry)

    return NextResponse.json({
      status: 'ok',
      packages: Object.keys(registry.packages),
      pendingMigrations: pending.length,
      migrations: pending.map(m => ({
        id: m.id,
        packageId: m.packageId,
        status: m.status,
        queuedAt: m.queuedAt,
        entities: m.entities.map(e => e.name),
      })),
      registry,
    })
  } catch (error) {
    console.error('Failed to load schema registry:', error)
    return NextResponse.json(
      { status: 'error', error: 'Failed to load schema registry' },
      { status: 500 }
    )
  }
}
