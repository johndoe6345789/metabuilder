'use client'

import { SchemaEditor } from '@/components/schema-editor'
import { useCurrentTenantScope } from './use-current-tenant-scope'

export function SchemasTab() {
  // Was hardcoded to 'system', so every founder edited -- and could
  // overwrite -- the shared tenant's schemas rather than their own.
  const { tenant } = useCurrentTenantScope()
  return <SchemaEditor tenantId={tenant} />
}
