import { NextResponse } from 'next/server'
import {
  rejectMigration,
  saveSchemaRegistry,
  type SchemaRegistry,
} from '@/lib/schema/schema-registry'

export function handleReject(
  registry: SchemaRegistry,
  registryPath: string,
  id?: string
) {
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
