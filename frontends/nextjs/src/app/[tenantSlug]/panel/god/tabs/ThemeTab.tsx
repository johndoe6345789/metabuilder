'use client'

import { ThemeEditor } from '@/components/theme-editor'
import { useCurrentTenantScope } from './use-current-tenant-scope'

export function ThemeTab() {
  // The tenant whose panel this is -- not the shared 'system' one the
  // editor used to write to, which no visitor to this site ever reads.
  const { tenant } = useCurrentTenantScope()
  return <ThemeEditor tenant={tenant} />
}
