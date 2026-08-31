import { NextResponse } from 'next/server'
import {
  saveSchemaRegistry,
  type SchemaRegistry,
} from '@/lib/schema/schema-registry'
import { scanAllPackages } from '@/lib/schema/schema-scanner'

export function handleScan(registry: SchemaRegistry, registryPath: string) {
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
