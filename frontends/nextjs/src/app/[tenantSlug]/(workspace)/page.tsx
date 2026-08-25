'use client'

import { useParams } from 'next/navigation'
import { LevelGate } from '@/components/layout/LevelGate'
import { WorkspacePageSlot } from '@/components/workspace/WorkspacePageSlot'
import { DashboardContent } from '@/app/(workspace)/dashboard/page'
import { normalizeTenantId } from '@/lib/tenant/workspace-paths'

/**
 * /{tenant} — the signed-in user's home workspace.
 *
 * Sits inside the workspace group, so it gets the app shell like every other
 * signed-in route. A tenant that publishes a component tree for "/" still
 * wins, exactly as on any other route; otherwise this is the dashboard.
 *
 * The previous version rendered only the "/" PageConfig and called
 * notFound() when it had no tree -- which every seeded tenant's does, so
 * /{tenant} was a 404.
 */
export default function TenantWorkspaceHome() {
  const params = useParams<{ tenantSlug?: string }>()
  const tenant = normalizeTenantId(params.tenantSlug)

  return (
    <WorkspacePageSlot tenant={tenant} path="/">
      <LevelGate minLevel={1} levelName="User">
        <DashboardContent />
      </LevelGate>
    </WorkspacePageSlot>
  )
}
