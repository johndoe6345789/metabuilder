import { NextResponse } from 'next/server'
import * as path from 'path'
import * as fs from 'fs'

import {
  loadSchemaRegistry,
  saveSchemaRegistry,
  getPendingMigrations,
  generatePrismaFragment,
  approveMigration,
  rejectMigration,
  type SchemaRegistry,
} from '@/lib/schema/schema-registry'
import { scanAllPackages } from '@/lib/schema/schema-scanner'
import { getSessionUser, STATUS } from '@/lib/routing'
import { getRoleLevel, ROLE_LEVELS } from '@/lib/constants'
import { z } from '@/lib/validation'

// Use consistent path resolution
const getRegistryPath = () => path.join(process.cwd(), '..', '..', '..', 'prisma', 'schema-registry.json')
const getPrismaOutputPath = () => path.join(process.cwd(), '..', '..', '..', 'prisma', 'generated-from-packages.prisma')

// Schema operation request validation
const SchemaActionSchema = z.object({
  action: z.enum(['scan', 'generate', 'approve', 'reject']),
  id: z.string().min(1).max(128).optional(),
})

/**
 * GET /api/dbal/schema
 * Returns the current schema registry status
 * 
 * Note: This endpoint is for admin/system use. Requires god level access.
 * For tenant-scoped data, use /api/v1/{tenant}/{package}/{entity}
 */
export async function GET(request: Request) {
  // Require god level for schema registry access
  const session = await getSessionUser(request)
  
  if (session.user === null) {
    return NextResponse.json(
      { status: 'error', error: 'Authentication required' },
      { status: STATUS.UNAUTHORIZED }
    )
  }
  
  const userRole = (session.user as { role?: string }).role ?? 'public'
  const userLevel = getRoleLevel(userRole)
  
  if (userLevel < ROLE_LEVELS.god) {
    return NextResponse.json(
      { status: 'error', error: 'God level access required' },
      { status: STATUS.FORBIDDEN }
    )
  }
  
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

/**
 * POST /api/dbal/schema
 * Schema management operations. Requires god level access.
 * Body: { action: 'scan' | 'generate' | 'approve' | 'reject', id?: string }
 */
export async function POST(request: Request) {
  // Require god level for schema operations
  const session = await getSessionUser(request)
  
  if (session.user === null) {
    return NextResponse.json(
      { status: 'error', error: 'Authentication required' },
      { status: STATUS.UNAUTHORIZED }
    )
  }
  
  const userRole = (session.user as { role?: string }).role ?? 'public'
  const userLevel = getRoleLevel(userRole)
  
  if (userLevel < ROLE_LEVELS.god) {
    return NextResponse.json(
      { status: 'error', error: 'God level access required' },
      { status: STATUS.FORBIDDEN }
    )
  }
  
  try {
    const rawBody: unknown = await request.json()
    
    // Validate request body against schema
    const parseResult = SchemaActionSchema.safeParse(rawBody)
    if (!parseResult.success) {
      return NextResponse.json(
        { status: 'error', error: 'Invalid request body', details: parseResult.error.issues },
        { status: 400 }
      )
    }
    
    const { action, id } = parseResult.data
    
    const registryPath = getRegistryPath()
    const registry = loadSchemaRegistry(registryPath)
    
    switch (action) {
      case 'scan':
        return handleScan(registry, registryPath)
      
      case 'generate':
        return handleGenerate(registry)
      
      case 'approve':
        return handleApprove(registry, registryPath, id)
      
      case 'reject':
        return handleReject(registry, registryPath, id)
    }
  } catch (error) {
    console.error('Schema operation failed:', error)
    return NextResponse.json(
      { status: 'error', error: 'Schema operation failed' },
      { status: 500 }
    )
  }
}

function handleScan(registry: SchemaRegistry, registryPath: string) {
  const result = scanAllPackages(registry)
  saveSchemaRegistry(registry, registryPath)
  
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
  const prismaOutputPath = getPrismaOutputPath()
  
  if (fragment.trim().length === 0) {
    return NextResponse.json({
      status: 'ok',
      action: 'generate',
      message: 'No approved migrations to generate',
      generated: false,
    })
  }
  
  fs.writeFileSync(prismaOutputPath, fragment)
  
  return NextResponse.json({
    status: 'ok',
    action: 'generate',
    message: `Generated Prisma fragment at ${prismaOutputPath}`,
    generated: true,
    path: prismaOutputPath,
    nextStep: 'Run: npx prisma migrate dev --name package-schemas',
  })
}

function handleApprove(registry: SchemaRegistry, registryPath: string, id?: string) {
  if (id === undefined) {
    return NextResponse.json(
      { status: 'error', error: 'Migration ID required' },
      { status: 400 }
    )
  }
  
  if (id === 'all') {
    const pending = getPendingMigrations(registry)
    let approved = 0
    
    for (const migration of pending) {
      if (approveMigration(migration.id, registry)) {
        approved++
      }
    }
    
    saveSchemaRegistry(registry, registryPath)
    
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
  
  saveSchemaRegistry(registry, registryPath)
  
  return NextResponse.json({
    status: 'ok',
    action: 'approve',
    id,
    message: `Approved migration ${id}`,
  })
}

function handleReject(registry: SchemaRegistry, registryPath: string, id?: string) {
  if (id === undefined || id.length === 0) {
    return NextResponse.json(
      { status: 'error', error: 'Migration ID required' },
      { status: 400 }
    )
  }
  
  const success = rejectMigration(id, registry)
  
  if (!success) {
    return NextResponse.json(
      { status: 'error', error: `Migration not found: ${id}` },
      { status: 404 }
    )
  }
  
  saveSchemaRegistry(registry, registryPath)
  
  return NextResponse.json({
    status: 'ok',
    action: 'reject',
    id,
    message: `Rejected migration ${id}`,
  })
}
