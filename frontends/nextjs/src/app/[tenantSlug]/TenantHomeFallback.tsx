'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { WorkspacePageSlot } from '@/components/workspace/WorkspacePageSlot'
import { tenantPanelPath } from '@/lib/tenant/workspace-paths'

/**
 * What /{tenant} shows when the server did not render the page itself.
 *
 * Two cases reach here, and the slot tells them apart: nothing is published
 * at "/" yet, or something is but this visitor is not allowed to see it.
 * The slot re-fetches and applies the same LevelGate the rest of the app
 * uses, so a restricted home page still says so rather than 404ing.
 *
 * With nothing published there is no page to show a visitor, so they are
 * sent to the panel, where signing in is possible.
 */
export function TenantHomeFallback({ tenant }: { tenant: string }) {
  const router = useRouter()

  return (
    <WorkspacePageSlot tenant={tenant} path="/">
      <NoHomePage
        onGoToPanel={() => {
          router.replace(tenantPanelPath(tenant))
        }}
      />
    </WorkspacePageSlot>
  )
}

function NoHomePage({ onGoToPanel }: { onGoToPanel: () => void }) {
  useEffect(() => {
    onGoToPanel()
  }, [onGoToPanel])
  return null
}
