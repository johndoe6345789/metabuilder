import { NextResponse } from 'next/server'
import {
  approveMigration,
  getPendingMigrations,
  saveSchemaRegistry,
  type SchemaRegistry,
} from '@/lib/schema/schema-registry'

function approveAll(registry: SchemaRegistry, registryPath: string) {
  const pending = getPendingMigrations(registry)
  let approved = 0

  for (const migration of pending) {
    if (approveMigration(migration.id, registry)) approved++
  }

  saveSchemaRegistry(registry, registryPath)

  return NextResponse.json({
    status: 'ok',
    action: 'approve',
    approved,
    message: `Approved ${approved} migrations`,
  })
}

export function handleApprove(
  registry: SchemaRegistry,
  registryPath: string,
  id?: string
) {
  if (id === undefined) {
    return NextResponse.json(
      { status: 'error', error: 'Migration ID required' },
      { status: 400 }
    )
  }

  if (id === 'all') return approveAll(registry, registryPath)

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
