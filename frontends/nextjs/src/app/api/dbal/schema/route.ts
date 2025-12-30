import { NextResponse } from 'next/server'
import * as path from 'path'
import * as fs from 'fs'

import {
  loadSchemaRegistry,
  saveSchemaRegistry,
  getPendingMigrations,
  generatePrismaFragment,
  type SchemaRegistry,
} from '@/lib/schema/schema-registry'

const REGISTRY_PATH = path.join(process.cwd(), '..', '..', '..', 'prisma', 'schema-registry.json')
const PRISMA_GENERATED_PATH = path.join(process.cwd(), '..', '..', '..', 'prisma', 'generated-from-packages.prisma')

/**
 * GET /api/dbal/schema
 * Returns the current schema registry status
 */
export async function GET() {
  try {
    const registry = loadSchemaRegistry(REGISTRY_PATH)
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

/**
 * POST /api/dbal/schema
 * Schema management operations
 * Body: { action: 'scan' | 'generate' | 'approve' | 'reject', id?: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, id } = body as { action: string; id?: string }
    
    const registry = loadSchemaRegistry(REGISTRY_PATH)
    
    switch (action) {
      case 'scan':
        return handleScan(registry)
      
      case 'generate':
        return handleGenerate(registry)
      
      case 'approve':
        return handleApprove(registry, id)
      
      case 'reject':
        return handleReject(registry, id)
      
      default:
        return NextResponse.json(
          { status: 'error', error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Schema operation failed:', error)
    return NextResponse.json(
      { status: 'error', error: String(error) },
      { status: 500 }
    )
  }
}

async function handleScan(registry: SchemaRegistry) {
  const { scanAllPackages } = await import('@/lib/schema/schema-scanner')
  
  const result = await scanAllPackages(registry)
  saveSchemaRegistry(registry, REGISTRY_PATH)
  
  return NextResponse.json({
    status: 'ok',
    action: 'scan',
    packagesScanned: result.scanned,
    changesQueued: result.queued,
    errors: result.errors,
  })
}

function handleGenerate(registry: SchemaRegistry) {
  const fragment = generatePrismaFragment(registry)
  
  if (!fragment.trim()) {
    return NextResponse.json({
      status: 'ok',
      action: 'generate',
      message: 'No approved migrations to generate',
      generated: false,
    })
  }
  
  fs.writeFileSync(PRISMA_GENERATED_PATH, fragment)
  
  return NextResponse.json({
    status: 'ok',
    action: 'generate',
    message: `Generated Prisma fragment at ${PRISMA_GENERATED_PATH}`,
    generated: true,
    path: PRISMA_GENERATED_PATH,
    nextStep: 'Run: npx prisma migrate dev --name package-schemas',
  })
}

function handleApprove(registry: SchemaRegistry, id?: string) {
  if (!id) {
    return NextResponse.json(
      { status: 'error', error: 'Migration ID required' },
      { status: 400 }
    )
  }
  
  const { approveMigration } = require('@/lib/schema/schema-registry')
  
  if (id === 'all') {
    const pending = getPendingMigrations(registry)
    let approved = 0
    
    for (const migration of pending) {
      if (approveMigration(migration.id, registry)) {
        approved++
      }
    }
    
    saveSchemaRegistry(registry, REGISTRY_PATH)
    
    return NextResponse.json({
      status: 'ok',
      action: 'approve',
      approved,
      message: `Approved ${approved} migrations`,
    })
  }
  
  const success = approveMigration(id, registry)
  
  if (!success) {
    return NextResponse.json(
      { status: 'error', error: `Migration not found: ${id}` },
      { status: 404 }
    )
  }
  
  saveSchemaRegistry(registry, REGISTRY_PATH)
  
  return NextResponse.json({
    status: 'ok',
    action: 'approve',
    id,
    message: `Approved migration ${id}`,
  })
}

function handleReject(registry: SchemaRegistry, id?: string) {
  if (!id) {
    return NextResponse.json(
      { status: 'error', error: 'Migration ID required' },
      { status: 400 }
    )
  }
  
  const { rejectMigration } = require('@/lib/schema/schema-registry')
  const success = rejectMigration(id, registry)
  
  if (!success) {
    return NextResponse.json(
      { status: 'error', error: `Migration not found: ${id}` },
      { status: 404 }
    )
  }
  
  saveSchemaRegistry(registry, REGISTRY_PATH)
  
  return NextResponse.json({
    status: 'ok',
    action: 'reject',
    id,
    message: `Rejected migration ${id}`,
  })
}
