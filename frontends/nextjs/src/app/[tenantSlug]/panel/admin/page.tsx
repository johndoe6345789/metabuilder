'use client'

import { useParams } from 'next/navigation'
import { LevelGate } from '@/components/layout/LevelGate'
import { WorkspacePageSlot } from '@/components/workspace/WorkspacePageSlot'
import { AdminContent } from './AdminContent'
import { normalizeTenantId } from '@/lib/tenant/workspace-paths'

export default function AdminPage() {
  // Whose community this panel administers. It used to read and delete
  // from the shared 'system' tenant whatever site it was opened on.
  const params = useParams<{ tenantSlug?: string }>()
  const tenant = normalizeTenantId(params.tenantSlug)
  return (
    <WorkspacePageSlot tenant={tenant} path="/admin/users">
      <LevelGate minLevel={3} levelName="Admin">
        <AdminContent />
      </LevelGate>
    </WorkspacePageSlot>
  )
}
