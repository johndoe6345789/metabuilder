import { NextResponse } from 'next/server'
import { loadSchemaRegistry } from '@/lib/schema/schema-registry'
import { requireGodLevel } from './require-god-level'
import { getRegistryPath } from './paths'
import { SchemaActionSchema } from './schema-action-schema'
import { handleScan } from './handle-scan'
import { handleGenerate } from './handle-generate'
import { handleApprove } from './handle-approve'
import { handleReject } from './handle-reject'

/**
 * POST /api/dbal/schema
 * Schema management operations. Requires god level access.
 * Body: { action: 'scan' | 'generate' | 'approve' | 'reject', id?: string }
 */
export async function POST(request: Request) {
  const auth = await requireGodLevel(request)
  if (!auth.ok) return auth.response

  try {
    const rawBody: unknown = await request.json()
    const parseResult = SchemaActionSchema.safeParse(rawBody)
    if (!parseResult.success) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'Invalid request body',
          details: parseResult.error.issues,
        },
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
